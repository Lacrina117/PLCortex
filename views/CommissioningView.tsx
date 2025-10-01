import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { vfdBrands, vfdModelsByBrand } from '../constants/automationData';
import { vfdTerminalData, VfdDiagramData, Terminal } from '../constants/vfdTerminalData';
import { generateCommissioningChatResponse, Message } from '../services/geminiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { BrandLogo } from '../components/BrandLogo';

interface CommissioningSession {
    id: string;
    vfdBrand: string;
    vfdModel: string;
    messages: Message[];
    createdAt: number;
}

const STORAGE_KEY = 'plcortex_commissioning_sessions';

const VfdTerminalDiagram: React.FC<{
    diagramData: VfdDiagramData;
    highlightedTerminals: string[];
}> = ({ diagramData, highlightedTerminals }) => {
    const [hoveredTerminal, setHoveredTerminal] = useState<Terminal | null>(null);

    const terminalPositions = useMemo(() => {
        const positions = new Map<string, { x: number; y: number }>();
        diagramData.blocks.forEach(block => {
            block.terminals.forEach((terminal, index) => {
                const row = Math.floor(index / block.cols);
                const col = index % block.cols;
                const x = block.x + col * (block.terminalWidth + block.gapX) + block.terminalWidth / 2;
                const y = block.y + row * (block.terminalHeight + block.gapY) + block.terminalHeight / 2;
                positions.set(terminal.id, { x, y });
            });
        });
        return positions;
    }, [diagramData]);

    return (
        <div className="relative w-full h-full p-2">
            <svg viewBox={diagramData.viewBox} className="w-full h-full">
                {diagramData.blocks.map(block => (
                    <g key={block.id}>
                        {block.label && <text x={block.x} y={block.y - 8} className="text-xs font-semibold fill-current text-gray-600 dark:text-gray-400">{block.label}</text>}
                        {block.terminals.map((terminal, index) => {
                            const row = Math.floor(index / block.cols);
                            const col = index % block.cols;
                            const x = block.x + col * (block.terminalWidth + block.gapX);
                            const y = block.y + row * (block.terminalHeight + block.gapY);
                            const isHighlighted = highlightedTerminals.includes(terminal.id);
                            
                            return (
                                <g key={terminal.id} onMouseEnter={() => setHoveredTerminal(terminal)} onMouseLeave={() => setHoveredTerminal(null)} className="cursor-pointer">
                                    <rect
                                        x={x} y={y}
                                        width={block.terminalWidth} height={block.terminalHeight}
                                        className={`transition-all duration-300 stroke-2 ${isHighlighted ? 'fill-yellow-300 dark:fill-yellow-500/50 stroke-yellow-500' : `${block.bgColorClass} `}`}
                                        rx="2"
                                    />
                                    <text
                                        x={x + block.terminalWidth / 2} y={y + block.terminalHeight / 2 + 0.5}
                                        dominantBaseline="middle" textAnchor="middle"
                                        className="text-[8px] font-bold fill-current text-gray-800 dark:text-gray-200 pointer-events-none"
                                    >
                                        {terminal.label}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                ))}
                {diagramData.jumpers?.map((jumper, i) => {
                    const from = terminalPositions.get(jumper.from);
                    const to = terminalPositions.get(jumper.to);
                    if (!from || !to) return null;
                    return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="stroke-current text-gray-400 dark:text-gray-500" strokeWidth="1" />;
                })}
            </svg>
            {hoveredTerminal && (
                <div className="absolute top-2 left-2 p-2 bg-gray-900/80 text-white text-xs rounded-lg shadow-lg pointer-events-none max-w-xs z-10">
                    <p className="font-bold">{hoveredTerminal.label} ({hoveredTerminal.function})</p>
                    <p>{hoveredTerminal.description}</p>
                </div>
            )}
        </div>
    );
};

const VfdSelection: React.FC<{
    onStart: (brand: string, model: string) => void;
}> = ({ onStart }) => {
    const { t } = useTranslation();

    // Correctly determine available brands and models based on vfdTerminalData
    const { availableBrands, modelsByBrand: brandModelMap } = useMemo(() => {
        const modelsWithDiagrams = Object.keys(vfdTerminalData);
        const newBrandModelMap: { [key: string]: string[] } = {};

        for (const brand in vfdModelsByBrand) {
            const modelsForBrandWithDiagram = vfdModelsByBrand[brand].filter(model => modelsWithDiagrams.includes(model));
            if (modelsForBrandWithDiagram.length > 0) {
                newBrandModelMap[brand] = modelsForBrandWithDiagram;
            }
        }
        
        const availableBrandsList = Object.keys(newBrandModelMap);
        
        return { availableBrands: availableBrandsList, modelsByBrand: newBrandModelMap };
    }, []);

    const [selectedBrand, setSelectedBrand] = useState(availableBrands[0] || '');
    const [selectedModel, setSelectedModel] = useState((brandModelMap[availableBrands[0]]?.[0]) || '');

    useEffect(() => {
        // When brand changes, update the model to the first available for the new brand
        if (brandModelMap[selectedBrand]) {
            setSelectedModel(brandModelMap[selectedBrand][0]);
        }
    }, [selectedBrand, brandModelMap]);

    const handleStart = () => {
        if (selectedBrand && selectedModel) {
            onStart(selectedBrand, selectedModel);
        }
    };
    
    const commonSelectClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('commissioning.selectTitle')}</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">{t('commissioning.selectDescription')}</p>
            <div className="mt-8 space-y-4 w-full max-w-sm">
                <div>
                    <label className="block text-sm font-medium text-left text-gray-700 dark:text-gray-300 mb-1">{t('commissioning.brandLabel')}</label>
                    <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className={commonSelectClasses}>
                        {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-left text-gray-700 dark:text-gray-300 mb-1">{t('commissioning.modelLabel')}</label>
                    <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className={commonSelectClasses} disabled={!selectedBrand}>
                        {(brandModelMap[selectedBrand] || []).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>
            <button
                onClick={handleStart}
                disabled={!selectedBrand || !selectedModel}
                className="mt-8 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
                {t('commissioning.startButton')}
            </button>
        </div>
    );
};

export const CommissioningView: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [sessions, setSessions] = useState<CommissioningSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentInput, setCurrentInput] = useState('');
    const [highlightedTerminals, setHighlightedTerminals] = useState<string[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setSessions(JSON.parse(stored));
        } catch (e) { console.error(`Failed to load sessions:`, e); }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        } catch (e) { console.error(`Failed to save sessions:`, e); }
    }, [sessions]);

    const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId), [sessions, activeSessionId]);

    const handleStartSession = (brand: string, model: string) => {
        const newSession: CommissioningSession = {
            id: `session-${Date.now()}`,
            vfdBrand: brand,
            vfdModel: model,
            messages: [],
            createdAt: Date.now(),
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setIsHistoryOpen(false);

        // Send initial message automatically
        handleSendMessage(newSession.id, t('commissioning.initialPrompt'));
    };

    const parseResponse = useCallback((responseText: string) => {
        const jsonMatch = responseText.match(/(\{.*\})\s*$/s);
        if (jsonMatch) {
            try {
                const jsonPart = JSON.parse(jsonMatch[1]);
                const textPart = responseText.substring(0, jsonMatch.index).trim();
                const terminals = jsonPart.diagram_terminals || [];
                return { textPart, terminals };
            } catch (e) { /* Fallback if JSON is malformed */ }
        }
        return { textPart: responseText, terminals: [] };
    }, []);

    const handleSendMessage = async (sessionId: string | null, customPrompt?: string) => {
        const prompt = customPrompt || currentInput;
        if (!prompt.trim() || !sessionId) return;

        const currentSession = sessions.find(s => s.id === sessionId);
        if (!currentSession) return;
        
        const userMessage: Message = { role: 'user', parts: [{ text: prompt }], timestamp: Date.now() };
        const updatedMessages = [...currentSession.messages, userMessage];
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: updatedMessages } : s));

        if (!customPrompt) setCurrentInput('');
        setIsLoading(true);
        setHighlightedTerminals([]);

        try {
            const responseText = await generateCommissioningChatResponse(updatedMessages, language, currentSession.vfdBrand, currentSession.vfdModel);
            const { textPart, terminals } = parseResponse(responseText);
            setHighlightedTerminals(terminals);

            const modelMessage: Message = { role: 'model', parts: [{ text: textPart }], timestamp: Date.now() };
            setSessions(prev => {
                const finalMessages = [...updatedMessages, modelMessage];
                return prev.map(s => s.id === sessionId ? { ...s, messages: finalMessages } : s);
            });
        } catch (err) {
            const errorText = `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
            const errorMessage: Message = { role: 'model', parts: [{ text: errorText }], timestamp: Date.now() };
            setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...updatedMessages, errorMessage] } : s));
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeSession?.messages, isLoading]);

    const handleDeleteSession = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) {
            setActiveSessionId(null);
            setHighlightedTerminals([]);
        }
    };

    const diagramData = vfdTerminalData[activeSession?.vfdModel || ''];

    return (
        <div className="flex flex-grow font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className={`absolute md:relative z-20 w-72 bg-gray-100 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform transform ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold">{t('commissioning.historyTitle')}</h2>
                    <button onClick={() => { setActiveSessionId(null); setHighlightedTerminals([]); }} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        {t('commissioning.newChat')}
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {sessions.sort((a, b) => b.createdAt - a.createdAt).map(session => (
                        <div key={session.id} onClick={() => { setActiveSessionId(session.id); setIsHistoryOpen(false); setHighlightedTerminals([]); }} className={`p-3 m-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-2 ${activeSessionId === session.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <BrandLogo brand={session.vfdBrand} topic="VFD" className="h-9 w-9" />
                                <p className="font-semibold text-sm truncate">{session.vfdModel}</p>
                            </div>
                            <button onClick={(e) => handleDeleteSession(e, session.id)} className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
                 <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center flex-shrink-0">
                    <button onClick={() => setIsHistoryOpen(true)} className="md:hidden mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                    <h2 className="text-lg font-bold truncate">{activeSession ? `${activeSession.vfdBrand} ${activeSession.vfdModel}` : t('commissioning.selectTitle')}</h2>
                </header>

                {!activeSession ? (
                    <VfdSelection onStart={handleStartSession} />
                ) : (
                    <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                        {/* Chat Panel */}
                        <div className="flex-1 flex flex-col lg:w-1/2 border-r border-gray-200 dark:border-gray-700">
                             <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                                {activeSession.messages.map((msg, index) => (
                                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'model' && <BrandLogo brand={activeSession.vfdBrand} topic="VFD" className="h-8 w-8" />}
                                        <div className={`max-w-xl p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                            <MarkdownRenderer markdownText={msg.parts[0].text} />
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-start gap-3 justify-start">
                                        <BrandLogo brand={activeSession.vfdBrand} topic="VFD" className="h-8 w-8" />
                                        <div className="max-w-xl p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center">
                                            <div className="flex items-center space-x-2 mr-3">
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 italic">{t('chat.thinking')}</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                                <div className="relative">
                                    <textarea value={currentInput} onChange={e => setCurrentInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(activeSessionId); } }} placeholder={t('commissioning.placeholder')} disabled={isLoading} className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 disabled:opacity-50" rows={2} />
                                    <button onClick={() => handleSendMessage(activeSessionId)} disabled={isLoading || !currentInput.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
                                </div>
                            </div>
                        </div>
                        {/* Diagram Panel */}
                        <div className="flex-shrink-0 h-80 lg:flex-1 lg:h-auto lg:w-1/2 bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center p-2">
                           {diagramData ? <VfdTerminalDiagram diagramData={diagramData} highlightedTerminals={highlightedTerminals} /> : <div className="text-center"><h3 className="font-semibold">{t('commissioning.diagramNotAvailable')}</h3><p className="text-sm text-gray-500">{t('commissioning.diagramNotAvailableDesc')}</p></div>}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};