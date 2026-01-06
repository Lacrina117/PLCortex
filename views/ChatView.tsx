
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { BrandLogo } from '../components/BrandLogo';
import { Message } from '../services/geminiService';

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
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-indigo-500/30" title="PLCortex Assistant">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
    </div>
);

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy} 
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title={t('chat.copyText')}
        >
            {copied ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{t('chat.copied')}</span>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    <span className="hidden group-hover:inline">{t('chat.copyText')}</span>
                </>
            )}
        </button>
    );
};

const SuggestedPrompts: React.FC<{ context: ChatContext, onSelect: (prompt: string) => void }> = ({ context, onSelect }) => {
    const { t } = useTranslation();
    const suggestions = useMemo(() => {
        const list = [];
        if (context.topic === 'PLC') {
            list.push({ key: 'plc_st', icon: '📝' });
            list.push({ key: 'plc_ladder', icon: '🪜' });
            list.push({ key: 'plc_comms', icon: '🌐' });
        } else {
            list.push({ key: 'vfd_param', icon: '⚙️' });
            list.push({ key: 'vfd_fault', icon: '⚠️' });
            list.push({ key: 'vfd_wiring', icon: '🔌' });
        }
        return list;
    }, [context.topic]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-8 w-full max-w-2xl px-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {suggestions.map((s, i) => (
                <button
                    key={s.key}
                    onClick={() => onSelect(t(`chat.suggestions.${s.key}`))}
                    className="flex flex-col items-start p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl shadow-sm hover:shadow-md transition-all text-left group"
                >
                    <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{s.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{t(`chat.suggestions.${s.key}`)}</span>
                </button>
            ))}
        </div>
    );
};

interface ChatViewProps<T extends ChatContext> {
    storageKey: string;
    WelcomePlaceholderComponent: React.FC<{ onNewChat?: (prompt?: string) => void, context: T }>;
    generateResponse: (messages: Message[], context: T) => AsyncGenerator<string, void, unknown>;
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
            textarea.style.height = 'auto'; 
            textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
        }
    }, [currentInput]);

    const activeConversation = useMemo(() => conversations.find(c => c.id === activeConvId), [conversations, activeConvId]);

    const isContextLocked = useMemo(() => !!(activeConversation && activeConversation.messages.length > 0), [activeConversation]);
    
    useEffect(() => {
        if (activeConversation) {
            setContext(activeConversation.context);
            setIsContextEditorOpen(false);
        }
    }, [activeConversation]);
    
    const handleContextChange = (newContext: T) => {
        setContext(newContext);
        if (activeConvId) {
            setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, context: newContext } : c));
        }
    };

    const handleNewChat = (prompt?: string) => {
        const newId = `conv-${Date.now()}`;
        const newConv: Conversation<T> = {
            id: newId,
            title: t(newChatTitleKey),
            messages: [],
            context: { ...initialContext, ...context, language },
            createdAt: Date.now(),
        };
        setConversations(prev => [newConv, ...prev.sort((a,b) => b.createdAt - a.createdAt)]);
        setActiveConvId(newId);
        setIsHistoryOpen(false);
        
        if (prompt) handleSendMessage(prompt, newId);
    };

    const handleDeleteChat = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const remainingConvs = conversations.filter(c => c.id !== id);
        setConversations(remainingConvs);
        if (activeConvId === id) {
            setActiveConvId(remainingConvs.length > 0 ? remainingConvs.sort((a,b) => b.createdAt - a.createdAt)[0].id : null);
        }
    };
    
    const handleSendMessage = async (customPrompt?: string, targetConvId?: string) => {
        const prompt = customPrompt || currentInput;
        if (!prompt.trim()) return;

        let conversationId = targetConvId || activeConvId;
        let conversationForThisMessage = conversations.find(c => c.id === conversationId);
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
            conversationId = newId;
        }

        const userMessage: Message = { role: 'user', parts: [{ text: prompt }], timestamp: Date.now() };
        const isFirstMessage = conversationForThisMessage.messages.length === 0;
        const newTitle = isFirstMessage ? prompt.substring(0, 40) + (prompt.length > 40 ? '...' : '') : conversationForThisMessage.title;

        // Initialize user message
        if (isNewConversation) {
            setConversations(prev => [{ ...conversationForThisMessage!, messages: [userMessage], title: newTitle }, ...prev]);
            setActiveConvId(conversationId);
        } else {
            setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, messages: [...c.messages, userMessage], title: newTitle } : c));
        }

        if (!customPrompt) setCurrentInput('');
        setIsLoading(true);

        try {
            // Placeholder for AI response
            const placeholderAiMessage: Message = { role: 'model', parts: [{ text: '' }], timestamp: Date.now() };
            
            // Add placeholder
            setConversations(prev => prev.map(c => {
                if (c.id === conversationId) {
                    return { ...c, messages: [...c.messages, placeholderAiMessage] };
                }
                return c;
            }));

            // Consume stream
            const stream = generateResponse([...conversationForThisMessage.messages, userMessage], conversationForThisMessage.context);
            let fullText = '';

            for await (const chunk of stream) {
                fullText += chunk;
                setConversations(prev => prev.map(c => {
                    if (c.id === conversationId) {
                        const newMessages = [...c.messages];
                        newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], parts: [{ text: fullText }] };
                        return { ...c, messages: newMessages };
                    }
                    return c;
                }));
            }

        } catch (err) {
            const errorMessage = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
            setConversations(prev => prev.map(c => {
                if (c.id === conversationId) {
                    // Replace empty placeholder or append error
                    const msgs = [...c.messages];
                    if (msgs[msgs.length-1].role === 'model' && msgs[msgs.length-1].parts[0].text === '') {
                        msgs[msgs.length-1].parts[0].text = errorMessage;
                    } else {
                        msgs.push({ role: 'model', parts: [{ text: errorMessage }], timestamp: Date.now() });
                    }
                    return { ...c, messages: msgs };
                }
                return c;
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <div className="flex flex-grow font-sans overflow-hidden">
        {/* Sidebar */}
        <aside className={`absolute md:relative z-20 w-72 bg-gray-100 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform transform ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t(historyTitleKey)}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleNewChat()} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1 shadow-sm transition-all hover:scale-105">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        {t('chat.newChat')}
                    </button>
                    <button onClick={() => setIsHistoryOpen(false)} className="md:hidden p-1.5 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
                {conversations.sort((a, b) => b.createdAt - a.createdAt).map(conv => (
                    <div key={conv.id} onClick={() => { setActiveConvId(conv.id); setIsHistoryOpen(false); }} className={`group relative p-3 mb-2 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between gap-2 border ${activeConvId === conv.id ? 'bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-900 shadow-md' : 'border-transparent hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'}`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                           <BrandLogo brand={conv.context.plcBrand || conv.context.vfdBrand} topic={conv.context.topic} className="h-8 w-8" />
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${activeConvId === conv.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{conv.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{renderContextDisplay(conv.context)}</p>
                            </div>
                        </div>
                         <button onClick={(e) => handleDeleteChat(e, conv.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 flex-shrink-0 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                    </div>
                ))}
            </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 min-w-0">
            <header className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 grid grid-cols-[auto_1fr_auto] items-center gap-4 flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                    {activeConversation && (
                         <button onClick={() => setActiveConvId(null)} className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
                            {t('chat.finishConversation')}
                        </button>
                    )}
                </div>
                
                <div className="min-w-0 text-center">
                    <h2 className="text-base font-bold truncate text-gray-800 dark:text-white">{activeConversation ? activeConversation.title : t(headerTitleKey)}</h2>
                </div>

                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => setIsContextEditorOpen(prev => !prev)}
                        className={`text-xs px-3 py-1.5 rounded-full border flex items-center justify-center sm:justify-start gap-2 transition-all min-w-0 ${isContextEditorOpen ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <BrandLogo brand={context.plcBrand || context.vfdBrand} topic={context.topic} className="h-4 w-4" />
                        <span className="hidden sm:inline truncate font-medium max-w-[150px]">{renderContextDisplay(context)}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`ml-auto h-3 w-3 transition-transform ${isContextEditorOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </header>
            
            {isContextEditorOpen && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 animate-fade-in origin-top">
                    <ContextSelectionComponent context={context} setContext={handleContextChange} isLocked={isContextLocked} />
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-white dark:bg-gray-800 scroll-smooth">
                {!activeConversation || activeConversation.messages.length === 0 ? (
                   <div className="flex flex-col items-center justify-center min-h-full">
                       <WelcomePlaceholderComponent onNewChat={handleNewChat} context={context} />
                       <SuggestedPrompts context={context} onSelect={(prompt) => handleNewChat(prompt)} />
                   </div>
                ) : (
                    <>
                        {activeConversation.messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                {msg.role === 'model' && <AiAvatar />}
                                
                                <div className={`relative group min-w-0 max-w-[90%] md:max-w-3xl p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700/80 rounded-bl-none border border-gray-200 dark:border-gray-600'}`}>
                                    <div className={`prose prose-sm md:prose-base max-w-none break-words ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'}`}>
                                        <MarkdownRenderer markdownText={msg.parts[0].text} />
                                    </div>
                                    {msg.role === 'model' && (
                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <CopyButton text={msg.parts[0].text} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && activeConversation.messages[activeConversation.messages.length - 1]?.role === 'user' && (
                             <div className="flex items-start gap-4 justify-start animate-fade-in">
                                <AiAvatar />
                                <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-700/80 rounded-bl-none border border-gray-200 dark:border-gray-600 flex items-center gap-3">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('chat.thinking')}</span>
                                </div>
                            </div>
                        )}
                         <div ref={chatEndRef} />
                    </>
                )}
            </div>

            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                <div className="max-w-4xl mx-auto flex items-end gap-2 bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all shadow-sm">
                    <textarea
                        ref={textareaRef}
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder={t(placeholderKey)}
                        disabled={isLoading}
                        className="flex-grow p-3 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none max-h-48 custom-scrollbar text-sm sm:text-base"
                        rows={1}
                        style={{ minHeight: '48px' }}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !currentInput.trim()}
                        className="flex-shrink-0 p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all shadow-md mb-0.5 mr-0.5 group"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
};
