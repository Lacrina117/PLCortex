import React, { useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { BrandLogo } from '../components/BrandLogo';
import { Message } from '../services/geminiService';

// Generic interfaces to be used by parent components
export interface ChatContext {
    topic: 'VFD' | 'PLC';
    language: 'en' | 'es';
    vfdBrand?: string;
    vfdModel?: string;
    plcBrand?: string;
    plcSoftware?: string;
    plcVersion?: string;
}

export interface Conversation<T extends ChatContext> {
    id: string;
    title: string;
    messages: Message[];
    context: T;
    createdAt: number;
}

const AiAvatar: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white" title="PLCortex Assistant">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
    </div>
);

interface ChatViewProps<T extends ChatContext> {
    storageKey: string;
    WelcomePlaceholderComponent: React.FC<{ onNewChat?: () => void }>;
    generateResponse: (messages: Message[], context: T) => Promise<string>;
    renderContextDisplay: (context: T) => string;
    ContextSelectionComponent: React.FC<{ context: T; setContext: (context: T) => void; isLocked: boolean }>;
    initialContext: T;
    newChatTitleKey: string;
    historyTitleKey: string;
    placeholderKey: string;
    headerTitleKey: string;
}

export const ChatView = <T extends ChatContext>({ 
    storageKey, 
    WelcomePlaceholderComponent, 
    generateResponse,
    renderContextDisplay,
    ContextSelectionComponent,
    initialContext,
    newChatTitleKey,
    historyTitleKey,
    placeholderKey,
    headerTitleKey,
}: ChatViewProps<T>) => {
    const [conversations, setConversations] = useState<Conversation<T>[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [currentInput, setCurrentInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const [context, setContext] = useState<T>(initialContext);
    const [isContextEditorOpen, setIsContextEditorOpen] = useState(false);
    
    const { language } = useLanguage();
    const { t } = useTranslation();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        try {
            const storedConvs = localStorage.getItem(storageKey);
            if (storedConvs) {
                const parsedConvs = JSON.parse(storedConvs) as Conversation<T>[];
                setConversations(parsedConvs);
            }
        } catch (e) { console.error(`Failed to load conversations from ${storageKey}:`, e); }
    }, [storageKey]);

    useEffect(() => {
        if (conversations.length > 0 || localStorage.getItem(storageKey)) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(conversations));
            } catch (e) { console.error(`Failed to save conversations to ${storageKey}:`, e); }
        }
    }, [conversations, storageKey]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConvId, conversations, isLoading]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to get the new scrollHeight
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [currentInput]);

    const activeConversation = useMemo(() => {
        return conversations.find(c => c.id === activeConvId);
    }, [conversations, activeConvId]);

    const isContextLocked = useMemo(() => {
        return activeConversation ? activeConversation.messages.length > 0 : false;
    }, [activeConversation]);
    
    useEffect(() => {
        if (activeConversation) {
            setContext(activeConversation.context);
            // Keep context editor closed by default, user can open it if needed.
            setIsContextEditorOpen(false);
        }
    }, [activeConversation]);
    
    const handleContextChange = (newContext: T) => {
        setContext(newContext);
        if (activeConvId) {
            setConversations(prev => prev.map(c => 
                c.id === activeConvId ? { ...c, context: newContext } : c
            ));
        }
    };

    const handleNewChat = () => {
        const newId = `conv-${Date.now()}`;
        const newConv: Conversation<T> = {
            id: newId,
            title: t(newChatTitleKey),
            messages: [],
            context: { ...initialContext, ...context, language }, // Carry over configured context
            createdAt: Date.now(),
        };
        setConversations(prev => [newConv, ...prev.sort((a,b) => b.createdAt - a.createdAt)]);
        setActiveConvId(newId);
        setIsHistoryOpen(false);
    };

    const handleDeleteChat = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const remainingConvs = conversations.filter(c => c.id !== id);
        setConversations(remainingConvs);
        if (activeConvId === id) {
            setActiveConvId(remainingConvs.length > 0 ? remainingConvs.sort((a,b) => b.createdAt - a.createdAt)[0].id : null);
        }
    };
    
    const handleSendMessage = async (customPrompt?: string) => {
        const prompt = customPrompt || currentInput;
        if (!prompt.trim()) return;

        let conversationForThisMessage = activeConversation;
        let isNewConversation = false;

        if (!conversationForThisMessage) {
            isNewConversation = true;
            const newId = `conv-${Date.now()}`;
            const newConv: Conversation<T> = {
                id: newId,
                title: t(newChatTitleKey),
                messages: [],
                context: { ...context, language },
                createdAt: Date.now(),
            };
            conversationForThisMessage = newConv;
        }

        const userMessage: Message = { role: 'user', parts: [{ text: prompt }], timestamp: Date.now() };
        const updatedMessages = [...conversationForThisMessage.messages, userMessage];
        const isFirstMessage = conversationForThisMessage.messages.length === 0;
        const newTitle = isFirstMessage
            ? prompt.substring(0, 40) + (prompt.length > 40 ? '...' : '')
            : conversationForThisMessage.title;

        if (isNewConversation) {
            setConversations(prev => [{ ...conversationForThisMessage!, messages: updatedMessages, title: newTitle }, ...prev]);
            setActiveConvId(conversationForThisMessage!.id);
        } else {
            setConversations(prev => prev.map(c =>
                c.id === conversationForThisMessage!.id
                    ? { ...c, messages: updatedMessages, title: newTitle }
                    : c
            ));
        }

        if (!customPrompt) setCurrentInput('');
        setIsLoading(true);

        try {
            const responseText = await generateResponse(updatedMessages, conversationForThisMessage.context);
            const modelMessage: Message = { role: 'model', parts: [{ text: responseText }], timestamp: Date.now() };
            setConversations(prev => {
                const finalMessages = [...updatedMessages, modelMessage];
                return prev.map(c =>
                    c.id === conversationForThisMessage!.id
                        ? { ...c, messages: finalMessages }
                        : c
                );
            });
        } catch (err) {
            const errorMessage: Message = { role: 'model', parts: [{ text: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` }], timestamp: Date.now() };
            setConversations(prev => {
                const finalMessages = [...updatedMessages, errorMessage];
                return prev.map(c =>
                    c.id === conversationForThisMessage!.id
                        ? { ...c, messages: finalMessages }
                        : c
                );
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <div className="flex flex-grow font-sans overflow-hidden">
        {/* Sidebar */}
        <aside className={`absolute md:relative z-20 w-72 bg-gray-100 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform transform ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold">{t(historyTitleKey)}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={handleNewChat} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        {t('chat.newChat')}
                    </button>
                    <button onClick={() => setIsHistoryOpen(false)} className="md:hidden p-1.5 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {conversations.sort((a, b) => b.createdAt - a.createdAt).map(conv => (
                    <div key={conv.id} onClick={() => { setActiveConvId(conv.id); setIsHistoryOpen(false); }} className={`p-3 m-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-2 ${activeConvId === conv.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                           <BrandLogo brand={conv.context.plcBrand || conv.context.vfdBrand} topic={conv.context.topic} className="h-9 w-9" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{conv.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{renderContextDisplay(conv.context)}</p>
                            </div>
                        </div>
                         <button onClick={(e) => handleDeleteChat(e, conv.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                    </div>
                ))}
            </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 min-w-0">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 grid grid-cols-[auto_1fr_auto] items-center gap-4 flex-shrink-0">
                {/* Left Group (Column 1) */}
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                    {activeConversation && (
                         <button onClick={() => setActiveConvId(null)} className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            {t('chat.finishConversation')}
                        </button>
                    )}
                </div>
                
                {/* Center Group (Column 2) */}
                <div className="min-w-0 text-center">
                    <h2 className="text-lg font-bold truncate">{activeConversation ? activeConversation.title : t(headerTitleKey)}</h2>
                </div>

                {/* Right Group (Column 3) */}
                <div className="flex items-center justify-end gap-2">
                    {activeConversation && (
                        <button
                            onClick={() => setIsContextEditorOpen(prev => !prev)}
                            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center sm:justify-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-0"
                        >
                            <BrandLogo brand={activeConversation.context.plcBrand || activeConversation.context.vfdBrand} topic={activeConversation.context.topic} className="h-5 w-5" />
                            <span className="hidden sm:inline truncate font-medium">{renderContextDisplay(activeConversation.context)}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`ml-auto h-4 w-4 text-gray-500 transition-transform ${isContextEditorOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </header>
            
            {activeConversation && isContextEditorOpen && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <ContextSelectionComponent context={context} setContext={handleContextChange} isLocked={isContextLocked} />
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {!activeConversation || activeConversation.messages.length === 0 ? (
                   <WelcomePlaceholderComponent onNewChat={handleNewChat} />
                ) : (
                    <>
                        {activeConversation.messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && <AiAvatar />}
                                
                                <div className={`min-w-0 max-w-[90%] md:max-w-3xl p-3 rounded-2xl overflow-x-auto ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 rounded-bl-none'}`}>
                                    <div className={`prose prose-sm max-w-none break-words ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'}`}>
                                        <MarkdownRenderer markdownText={msg.parts[0].text} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex gap-3 justify-start"><AiAvatar /><div className="max-w-xl p-3 rounded-2xl bg-gray-100 dark:bg-gray-700"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div><div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div><div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div></div></div></div>
                        )}
                         <div ref={chatEndRef} />
                    </>
                )}
            </div>

            <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="flex items-start gap-2">
                    <textarea
                        ref={textareaRef}
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder={t(placeholderKey)}
                        disabled={isLoading}
                        className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out bg-gray-50 dark:bg-gray-700 disabled:opacity-50 resize-none max-h-48"
                        rows={1}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !currentInput.trim()}
                        className="flex-shrink-0 self-end p-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors h-[46px] w-[46px] flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
};