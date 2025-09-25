import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { LogicIssue, validatePlcLogic, suggestPlcLogicFix } from '../services/geminiService';
import { ErrorAlert } from '../components/ErrorAlert';

type TagState = { [key: string]: boolean };

const ToggleSwitch: React.FC<{ label: string; isToggled: boolean; onToggle: () => void, isDisabled: boolean }> = ({ label, isToggled, onToggle, isDisabled }) => (
    <label htmlFor={label} className={`flex items-center justify-between p-2 rounded-md transition-colors ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
        <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{label}</span>
        <div className="relative">
            <input id={label} type="checkbox" className="sr-only" checked={isToggled} onChange={onToggle} disabled={isDisabled} />
            <div className={`block w-12 h-6 rounded-full transition ${isToggled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isToggled ? 'transform translate-x-6' : ''}`}></div>
        </div>
    </label>
);

const LedIndicator: React.FC<{ label: string; isLit: boolean }> = ({ label, isLit }) => (
    <div className="flex items-center justify-between p-2">
        <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{label}</span>
        <div className="relative flex items-center justify-center w-6 h-6">
            <div className={`w-4 h-4 rounded-full transition-all duration-200 ${isLit ? 'bg-green-400' : 'bg-gray-400 dark:bg-gray-600'}`} />
            {isLit && <div className="absolute w-6 h-6 rounded-full bg-green-400/70 animate-ping" />}
        </div>
    </div>
);

const StatusIndicator: React.FC<{ label: string, color: string, isOn: boolean, isBlinking?: boolean }> = ({ label, color, isOn, isBlinking }) => (
    <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center w-8 h-8">
            <div className={`w-5 h-5 rounded-full transition-all duration-300 ${isOn ? color : 'bg-gray-600 dark:bg-gray-900'}`} />
            {isOn && <div className={`absolute w-8 h-8 rounded-full ${color}/50 ${isBlinking ? 'animate-ping' : ''}`} />}
        </div>
        <span className="text-xs font-semibold mt-1 uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
    </div>
);

export const SimulatorView: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [code, setCode] = useState('');
    const [issues, setIssues] = useState<LogicIssue[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    
    const [inputState, setInputState] = useState<TagState>({});
    const [outputState, setOutputState] = useState<TagState>({});
    const simulationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
    const [isAnalysisVisible, setIsAnalysisVisible] = useState(true);
    const [isEditorVisible, setIsEditorVisible] = useState(true);
    const [isSuggestionVisible, setIsSuggestionVisible] = useState(true);
    
    const lineNumbersRef = useRef<HTMLPreElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const lineNumbers = useMemo(() => code.split('\n').map((_, i) => i + 1).join('\n'), [code]);

    const handleScroll = () => {
        if (lineNumbersRef.current && textareaRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        setIsAnalyzed(false); // Force re-analysis on code change
    };

    const parseTags = (logic: string) => {
        const inputRegex = /(?:XIC|XIO)\(([^)]+)\)/g;
        const outputRegex = /(?:OTE|OTL|OTU)\(([^)]+)\)/g;
        
        const inputs = new Set<string>();
        const outputs = new Set<string>();

        let match;
        while ((match = inputRegex.exec(logic)) !== null) {
            inputs.add(match[1].trim());
        }
        while ((match = outputRegex.exec(logic)) !== null) {
            outputs.add(match[1].trim());
        }
        outputs.forEach(out => inputs.delete(out));

        return { inputTags: Array.from(inputs), outputTags: Array.from(outputs) };
    };

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        setIssues([]);
        setSuggestedCode(null);
        setIsAnalyzed(false);
        handleStop();

        try {
            const resultText = await validatePlcLogic({ language, code });
            const jsonString = resultText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            
            let parsedIssues: LogicIssue[] = [];
            if (jsonString) {
                const result = JSON.parse(jsonString);
                if (Array.isArray(result)) {
                    parsedIssues = result;
                }
            }
            
            setIssues(parsedIssues);
            
            if (parsedIssues.length === 0) {
                const { inputTags, outputTags } = parseTags(code);
                setInputState(current => {
                    const newState: TagState = {};
                    inputTags.forEach(tag => newState[tag] = current[tag] || false);
                    return newState;
                });
                setOutputState(() => {
                    const newState: TagState = {};
                    outputTags.forEach(tag => newState[tag] = false);
                    return newState;
                });
                setIsAnalyzed(true);
            } else {
                setInputState({});
                setOutputState({});
            }
        } catch (e) {
            setError(e instanceof Error ? `Failed to parse analysis result:\n${e.message}` : t('error.unexpected'));
            console.error("Failed to parse analysis result:", e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSuggestSolution = async () => {
        if (issues.length === 0) return;
        setIsSuggesting(true);
        setError(null);
        try {
            const result = await suggestPlcLogicFix({ language, code, issues });
            const cleanedCode = result.replace(/^```(?:\w+\s*)?\s*/, '').replace(/```\s*$/, '').trim();
            setSuggestedCode(cleanedCode);
            setIsSuggestionVisible(true);
        } catch (e) {
            setError(e instanceof Error ? `Failed to get suggestion:\n${e.message}` : t('error.unexpected'));
        } finally {
            setIsSuggesting(false);
        }
    };
    
    const handleImplementSolution = () => {
        if (suggestedCode) {
            handleCodeChange(suggestedCode);
            setSuggestedCode(null);
            setIssues([]);
        }
    };
    
    const runSimulationScan = useCallback(() => {
        const rungs = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
        const combinedState = { ...inputState, ...outputState };
        let nextOutputState = { ...outputState };

        const evaluateCondition = (condition: string): boolean => {
            const instructionMatch = condition.trim().match(/(XIC|XIO)\(([^)]+)\)/);
            if (!instructionMatch) {
                return false;
            }
            const [, instruction, tag] = instructionMatch;
            const tagValue = combinedState[tag.trim()] || false;
            return instruction === 'XIC' ? tagValue : !tagValue;
        };

        rungs.forEach(rung => {
            const actionMatch = rung.match(/(OTE|OTL|OTU)\(([^)]+)\)/);
            if (!actionMatch) return;

            const actionType = actionMatch[1];
            const outputTag = actionMatch[2].trim();
            const conditionStr = rung.split(actionMatch[0])[0].trim();
            
            const conditionParts = conditionStr.match(/(\[[^\]]+\]|XIC\([^)]+\)|XIO\([^)]+\))/g) || [];

            if (conditionParts.length === 0 && conditionStr.length > 0) {
                 return; 
            }

            const rungIsTrue = conditionParts.every(part => {
                if (part.startsWith('[')) {
                    const parallelConditions = part.slice(1, -1).split(',').map(c => c.trim());
                    return parallelConditions.some(evaluateCondition);
                } else {
                    return evaluateCondition(part);
                }
            });

            if (actionType === 'OTE') {
                nextOutputState[outputTag] = rungIsTrue;
            } else if (rungIsTrue) { // OTL and OTU only act when the rung is true
                if (actionType === 'OTL') {
                    nextOutputState[outputTag] = true;
                } else if (actionType === 'OTU') {
                    nextOutputState[outputTag] = false;
                }
            }
        });
        
        if (JSON.stringify(outputState) !== JSON.stringify(nextOutputState)) {
             setOutputState(nextOutputState);
        }
    }, [code, inputState, outputState]);

    useEffect(() => {
        if (isRunning && isAnalyzed) {
            simulationInterval.current = setInterval(runSimulationScan, 200);
        } else {
            if (simulationInterval.current) clearInterval(simulationInterval.current);
        }
        return () => {
            if (simulationInterval.current) clearInterval(simulationInterval.current);
        };
    }, [isRunning, isAnalyzed, runSimulationScan]);

    const handleStart = () => setIsRunning(true);
    const handleStop = () => setIsRunning(false);
    const handleReset = () => {
        handleStop();
        setOutputState(current => {
            const resetState: TagState = {};
            Object.keys(current).forEach(tag => resetState[tag] = false);
            return resetState;
        });
    };
    
    const handleInputChange = (tag: string) => {
        setInputState(prev => ({ ...prev, [tag]: !prev[tag] }));
    };

    const sortedInputKeys = useMemo(() => Object.keys(inputState).sort(), [inputState]);
    const sortedOutputKeys = useMemo(() => Object.keys(outputState).sort(), [outputState]);
    
    return (
        <main className="flex-grow flex flex-col p-4 md:p-6 lg:p-8 gap-6 lg:flex-row h-full">
            <div className="flex flex-col lg:w-2/3 h-full">
                <header className="text-center lg:text-left mb-4">
                    <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight">{t('simulator.title')}</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{t('simulator.description')}</p>
                </header>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col flex-grow overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{t('simulator.editorTitle')}</h2>
                        <button onClick={() => setIsEditorVisible(!isEditorVisible)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t(isEditorVisible ? 'simulator.collapse' : 'simulator.expand')}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isEditorVisible ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                    {isEditorVisible && (
                        <div className="relative flex-grow flex min-h-0 animate-fade-in">
                            <pre ref={lineNumbersRef} className="text-right pr-2 py-2 text-gray-400 dark:text-gray-500 font-mono text-sm bg-gray-50 dark:bg-gray-900/50 rounded-l-md select-none overflow-y-hidden">{lineNumbers}</pre>
                            <textarea ref={textareaRef} value={code} onChange={e => handleCodeChange(e.target.value)} onScroll={handleScroll} placeholder={t('simulator.codePlaceholder')} className="flex-grow p-2 font-mono text-sm bg-gray-50 dark:bg-gray-900/50 rounded-r-md border-l border-gray-200 dark:border-gray-700 focus:outline-none resize-none" spellCheck="false" />
                        </div>
                    )}
                     <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 overflow-y-auto max-h-96">
                        <div className="flex justify-between items-center mb-2"><h3 className="font-semibold">{t('simulator.analysisResults')}</h3><button onClick={() => setIsAnalysisVisible(!isAnalysisVisible)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t(isAnalysisVisible ? 'simulator.collapse' : 'simulator.expand')}><svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isAnalysisVisible ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button></div>
                        {isAnalysisVisible && (
                            <div className="animate-fade-in">
                                {error && <ErrorAlert message={error} />}
                                {isLoading ? (<div className="text-sm text-gray-500">{t('spinnerLoading')}</div>) : (
                                    <>
                                        {issues.length > 0 ? (
                                            <ul className="space-y-1 text-sm">{issues.map((issue, index) => (<li key={index} className={`flex items-start p-2 rounded-md ${issue.type === 'Error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'}`}><span className="font-mono bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-md text-xs mr-2">L{issue.line}</span><span><strong>{issue.type}:</strong> {issue.message}</span></li>))}</ul>
                                        ) : (!error && isAnalyzed && <p className="text-sm text-green-600 dark:text-green-400">{t('simulator.noIssues')}</p>)}
                                        {issues.length > 0 && !suggestedCode && (<div className="mt-4"><button onClick={handleSuggestSolution} disabled={isSuggesting} className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">{isSuggesting ? t('simulator.suggestingSolutionButton') : t('simulator.suggestSolutionButton')}</button></div>)}
                                        {isSuggesting && (<div className="text-sm text-gray-500 mt-4">{t('spinnerLoading')}</div>)}
                                        {suggestedCode && (
                                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex justify-between items-center mb-2"><h4 className="font-semibold">{t('simulator.suggestedCodeTitle')}</h4><button onClick={() => setIsSuggestionVisible(!isSuggestionVisible)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label={t(isSuggestionVisible ? 'simulator.collapse' : 'simulator.expand')}><svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isSuggestionVisible ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button></div>
                                                {isSuggestionVisible && (<div className="animate-fade-in"><pre className="p-2 max-h-60 overflow-auto text-sm font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md shadow-inner"><code>{suggestedCode}</code></pre><button onClick={handleImplementSolution} className="mt-3 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">{t('simulator.implementSolutionButton')}</button></div>)}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex flex-col lg:w-1/3 h-full">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col flex-grow">
                     <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{t('simulator.simulationTitle')}</h2>
                     <div className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-center mb-4">{t('simulator.cpuStatus')}</h3>
                        <div className="flex justify-around items-center mb-6">
                            <StatusIndicator label={t('simulator.run')} color="bg-green-500" isOn={isRunning} />
                            <StatusIndicator label={t('simulator.stop')} color="bg-red-500" isOn={!isRunning} />
                            <StatusIndicator label={t('simulator.fault')} color="bg-yellow-400" isOn={issues.length > 0} isBlinking={issues.length > 0} />
                        </div>
                        <button onClick={handleAnalyze} disabled={isLoading} className="w-full flex justify-center items-center px-4 py-2 mb-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">{isLoading ? t('formGeneratingButton') : t('simulator.analyzeButton')}</button>
                        <div className="flex justify-around items-center">
                            <button onClick={handleStart} disabled={!isAnalyzed || isRunning || isLoading} aria-label={t('simulator.startButton')} className="w-16 h-16 rounded-full bg-green-500 text-white font-bold shadow-md hover:bg-green-600 active:shadow-inner disabled:bg-green-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed transition-all">START</button>
                            <button onClick={handleStop} disabled={!isRunning || isLoading} aria-label={t('simulator.stopButton')} className="w-16 h-16 rounded-full bg-red-600 text-white font-bold shadow-md hover:bg-red-700 active:shadow-inner disabled:bg-red-400 dark:disabled:bg-red-800 disabled:cursor-not-allowed transition-all">STOP</button>
                            <button onClick={handleReset} disabled={isLoading} aria-label={t('simulator.resetButton')} className="w-16 h-16 rounded-full bg-gray-500 text-white font-bold shadow-md hover:bg-gray-600 active:shadow-inner disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all">RESET</button>
                        </div>
                     </div>
                     <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 overflow-y-auto border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <div>
                            <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">{t('simulator.inputs')}</h3>
                            <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700">{sortedInputKeys.length > 0 ? sortedInputKeys.map(tag => (<ToggleSwitch key={tag} label={tag} isToggled={inputState[tag]} onToggle={() => handleInputChange(tag)} isDisabled={!isRunning}/>)) : <p className="text-xs text-center text-gray-500 dark:text-gray-400 p-2">{t('simulator.noInputs')}</p>}</div>
                        </div>
                         <div>
                            <h3 className="font-semibold mb-1 text-gray-800 dark:text-gray-200">{t('simulator.outputs')}</h3>
                            <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700">{sortedOutputKeys.length > 0 ? sortedOutputKeys.map(tag => (<LedIndicator key={tag} label={tag} isLit={outputState[tag]} />)) : <p className="text-xs text-center text-gray-500 dark:text-gray-400 p-2">{t('simulator.noOutputs')}</p>}</div>
                        </div>
                     </div>
                </div>
            </div>
        </main>
    );
};

export default SimulatorView;