import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { validatePlcLogic, suggestPlcLogicFix, LogicIssue, translateLadderToText } from '../services/geminiService';
import { ErrorAlert } from '../components/ErrorAlert';

// --- PLC Logic Engine ---

type Instruction = { type: 'XIC' | 'XIO' | 'OTE' | 'OTL' | 'OTU'; tag: string };
type RungElement = Instruction | { type: 'BRANCH'; branches: Instruction[][] };
type ParsedRung = RungElement[];

const INSTRUCTION_REGEX = /(\w+)\(([^)]+)\)/;

// This is a simplified parser. It does not support nested branches.
const parseRung = (rungStr: string): ParsedRung => {
    const elements: RungElement[] = [];
    const parts = rungStr.split(/(\[.*?\])/g).filter(p => p.trim());

    for (const part of parts) {
        if (part.startsWith('[')) {
            const branchStr = part.slice(1, -1);
            const branches = branchStr.split(',').map(branch => {
                const instructions: Instruction[] = [];
                const instParts = branch.trim().split(/\s+/).filter(Boolean);
                for (const instPart of instParts) {
                    const match = instPart.match(INSTRUCTION_REGEX);
                    if (match) {
                        instructions.push({ type: match[1] as any, tag: match[2] });
                    }
                }
                return instructions;
            });
            elements.push({ type: 'BRANCH', branches });
        } else {
            const instParts = part.trim().split(/\s+/).filter(Boolean);
            for (const instPart of instParts) {
                const match = instPart.match(INSTRUCTION_REGEX);
                if (match) {
                    elements.push({ type: match[1] as any, tag: match[2] });
                }
            }
        }
    }
    
    return elements;
};

const evaluateElement = (element: RungElement, state: { [key: string]: boolean }): boolean => {
    if (element.type === 'BRANCH') {
        return element.branches.some(branch => branch.every(instr => evaluateElement(instr, state)));
    }
    const tagValue = !!state[element.tag];
    switch (element.type) {
        case 'XIC': return tagValue;
        case 'XIO': return !tagValue;
        // Output types are not conditional, they don't return a boolean for the rung evaluation
        case 'OTE': 
        case 'OTL':
        case 'OTU':
            return true;
        default: return false;
    }
};

const runSimulationTick = (parsedCode: ParsedRung[], currentState: { [key: string]: boolean }) => {
    // The next state starts as a copy of the current state.
    // Instructions will modify this state.
    const nextState = { ...currentState };

    // Process rungs sequentially. This mimics top-to-bottom scan.
    for (const rung of parsedCode) {
        let rungContinuity = true;
        
        const conditionalElements = rung.filter(el => el.type !== 'OTE' && el.type !== 'OTL' && el.type !== 'OTU');
        
        // Evaluate the conditional part of the rung using the state from the *beginning* of the scan cycle.
        for (const element of conditionalElements) {
            rungContinuity = rungContinuity && evaluateElement(element, currentState);
            if (!rungContinuity) {
                break;
            }
        }
        
        const outputElement = rung.find(el => el.type === 'OTE' || el.type === 'OTL' || el.type === 'OTU');
        
        if (outputElement && 'tag' in outputElement) {
            const outputInstruction = outputElement as Instruction;
            
            // Update the nextState based on the instruction type and rung evaluation.
            switch (outputInstruction.type) {
                case 'OTE':
                    // Output Energize: The output is true if the rung is true, and false if the rung is false.
                    nextState[outputInstruction.tag] = rungContinuity;
                    break;
                case 'OTL':
                    // Output Latch: If the rung is true, turn the output ON. It will stay on until unlatched.
                    if (rungContinuity) {
                        nextState[outputInstruction.tag] = true;
                    }
                    break;
                case 'OTU':
                    // Output Unlatch: If the rung is true, turn the output OFF.
                    if (rungContinuity) {
                        nextState[outputInstruction.tag] = false;
                    }
                    break;
            }
        }
    }

    // Return the final state after the full scan.
    return nextState;
};


// This is a simplified parser. It only handles the text format.
const parseCodeForIO = (codeToParse: string) => {
    const allTags = new Set<string>();
    const outputTags = new Set<string>();
    const rungs = codeToParse.split('\n');

    rungs.forEach(rungStr => {
        const matches = [...rungStr.matchAll(/(\w+)\(([^)]+)\)/g)];
        matches.forEach(match => {
            const instructionType = match[1];
            const tag = match[2];
            if (tag && /^[a-zA-Z0-9_]+$/.test(tag)) { // Basic tag validation
                allTags.add(tag);
                if (instructionType === 'OTE' || instructionType === 'OTL' || instructionType === 'OTU') {
                    outputTags.add(tag);
                }
            }
        });
    });

    const inputTags = [...allTags].filter(tag => !outputTags.has(tag)).sort();
    const sortedOutputTags = [...outputTags].sort();
    
    return { inputTags, outputTags: sortedOutputTags, allTags: [...inputTags, ...sortedOutputTags] };
};

// --- UI Components ---

/**
 * Determines if a tag likely represents a Normally Closed physical device.
 * @param tag The tag name string.
 * @returns True if the tag name implies an NC device.
 */
const isTagNc = (tag: string): boolean => {
    return /stop|fault|overload/i.test(tag);
};

const InputToggle: React.FC<{ label: string; value: boolean; isNc: boolean; onChange: (value: boolean) => void; disabled: boolean }> = ({ label, value, isNc, onChange, disabled }) => {
    // The visual state represents the physical action (pressed or not).
    // For a NO button, pressed (true) is ON.
    // For an NC button, pressed (false) is ON.
    const isVisuallyOn = isNc ? !value : value;

    return (
        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
            <span className="font-mono text-sm">{label}</span>
            <button
                onClick={() => onChange(!value)}
                disabled={disabled}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:cursor-not-allowed ${
                    isVisuallyOn ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${ isVisuallyOn ? 'translate-x-6' : 'translate-x-1' }`} />
            </button>
        </div>
    );
};

const OutputIndicator: React.FC<{ label: string; value: boolean }> = ({ label, value }) => (
    <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
        <span className="font-mono text-sm">{label}</span>
        <div className={`w-5 h-5 rounded-full transition-colors duration-200 ${value ? 'bg-yellow-400 shadow-[0_0_8px_2px_rgba(250,204,21,0.7)]' : 'bg-gray-300 dark:bg-gray-600'}`} />
    </div>
);

const CpuStatusDisplay: React.FC<{ status: 'run' | 'stop' | 'fault' }> = ({ status }) => {
    const { t } = useTranslation();
    const statusMap = {
        run: { text: t('simulator.run'), color: 'bg-green-500' },
        stop: { text: t('simulator.stop'), color: 'bg-yellow-500' },
        fault: { text: t('simulator.fault'), color: 'bg-red-500 animate-pulse' },
    };
    const { text, color } = statusMap[status];

    return (
        <div className="flex items-center gap-3">
            <h4 className="font-semibold">{t('simulator.cpuStatus')}</h4>
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span>{text}</span>
            </div>
        </div>
    );
};


export const SimulatorView: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    
    const [code, setCode] = useState('');
    const [inputs, setInputs] = useState<string[]>([]);
    const [outputs, setOutputs] = useState<string[]>([]);
    const [ioState, setIoState] = useState<{ [key: string]: boolean }>({});
    const [cpuStatus, setCpuStatus] = useState<'stop' | 'run' | 'fault'>('stop');
    const [analysisIssues, setAnalysisIssues] = useState<LogicIssue[]>([]);
    const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisPerformed, setAnalysisPerformed] = useState(false);

    const parsedCodeRef = useRef<ParsedRung[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    
    const handleAnalyzeAndRun = useCallback(async () => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysisIssues([]);
        setSuggestedCode(null);
        setAnalysisPerformed(true);
        setCpuStatus('stop');
        parsedCodeRef.current = [];

        // Helper to detect if code is likely ASCII art
        const isAsciiArt = (text: string) => /\||---\[|---\(|-\(-/.test(text);

        try {
            let codeToSimulate = code;
            if (isAsciiArt(code)) {
                // Translate ASCII to text format for the simulation engine
                const translatedCode = await translateLadderToText({ language, code });
                if (!translatedCode || translatedCode.includes('UNKNOWN_TAG')) {
                    throw new Error('Could not reliably translate ladder diagram for simulation. Please check tag names and diagram structure.');
                }
                codeToSimulate = translatedCode;
            }

            // Always validate the original code with Gemini
            const validationResult = await validatePlcLogic({ language, code });
            let issues: LogicIssue[] = [];
            try {
                issues = JSON.parse(validationResult);
            } catch {
                throw new Error("Failed to parse validation results from the API.");
            }
            
            setAnalysisIssues(issues);

            if (issues.length === 0) {
                // Use the (potentially translated) code to set up the simulation
                const { inputTags, outputTags, allTags } = parseCodeForIO(codeToSimulate);

                if (allTags.length === 0 && code.trim().length > 0) {
                     setAnalysisIssues([{ line: 1, type: 'Warning', message: 'Could not detect any valid tags or instructions for simulation.' }]);
                     setCpuStatus('fault');
                     setInputs([]);
                     setOutputs([]);
                     setIoState({});
                     setIsAnalyzing(false);
                     return;
                }

                setInputs(inputTags);
                setOutputs(outputTags);

                // Initialize the I/O state. ioState represents the *electrical signal*.
                // NC contacts (stop, fault) are electrically TRUE at rest.
                // NO contacts (start) are electrically FALSE at rest.
                const newIoState: { [key: string]: boolean } = {};
                allTags.forEach(tag => { 
                    newIoState[tag] = isTagNc(tag);
                });
                setIoState(newIoState);

                // Set the parsed code for the simulation tick function
                try {
                    parsedCodeRef.current = codeToSimulate.split('\n').map(line => line.trim()).filter(Boolean).map(parseRung);
                    setCpuStatus('run');
                } catch (e) {
                    console.error("Parsing error:", e);
                    setCpuStatus('fault');
                    throw new Error('Failed to parse the logic for simulation.');
                }
            } else {
                setCpuStatus('fault');
                setInputs([]);
                setOutputs([]);
                setIoState({});
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
            setCpuStatus('fault');
            setInputs([]);
            setOutputs([]);
            setIoState({});
        } finally {
            setIsAnalyzing(false);
        }
    }, [code, language, t]);

    const handleStop = () => {
        setCpuStatus('stop');
        // Reset all I/O to their resting electrical state
        setIoState(prev => {
            const newState: { [key: string]: boolean } = {};
            Object.keys(prev).forEach(key => { 
                newState[key] = isTagNc(key); 
            });
            return newState;
        });
    };

    const handleInputChange = (tag: string, value: boolean) => {
        const isMomentary = /start|stop|reset|pb/i.test(tag);
    
        const runTick = (state: { [key: string]: boolean }) => {
            if (cpuStatus === 'run' && parsedCodeRef.current.length > 0) {
                return runSimulationTick(parsedCodeRef.current, state);
            }
            return state;
        };
    
        if (isMomentary) {
            // State when button is being pressed
            const pressState = { ...ioState, [tag]: value };
            const simulatedPressState = runTick(pressState);
            setIoState(simulatedPressState);
            
            // After a delay, revert button to its resting state and run another tick
            setTimeout(() => {
                setIoState(currentState => {
                    const releaseState = { ...currentState, [tag]: !value };
                    return runTick(releaseState);
                });
            }, 250);
        } else { // Maintained switch
            const newState = { ...ioState, [tag]: value };
            setIoState(runTick(newState));
        }
    };
    
    const updateLineNumbers = useCallback(() => {
        const lineCount = code.split('\n').length;
        if (lineNumbersRef.current) {
            lineNumbersRef.current.innerHTML = Array.from({ length: Math.max(1, lineCount) }, (_, i) => `<div>${i + 1}</div>`).join('');
        }
    }, [code]);
    
    useEffect(() => {
        updateLineNumbers();
    }, [updateLineNumbers]);
    
    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCode(e.target.value);
        setAnalysisPerformed(false);
        setCpuStatus('stop');
        setInputs([]);
        setOutputs([]);
        setIoState({});
    };

    const handleScroll = () => {
        if (textareaRef.current && lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };
    
    const handleSuggestFix = async () => {
        setIsSuggesting(true);
        setError(null);
        try {
            const fixedCode = await suggestPlcLogicFix({ language, code, issues: analysisIssues });
            const cleanedCode = fixedCode.replace(/```.*\n/g, '').replace(/```/g, '').trim();
            setSuggestedCode(cleanedCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsSuggesting(false);
        }
    };
    
    const handleImplementFix = () => {
        if (suggestedCode) {
            setCode(suggestedCode);
            setSuggestedCode(null);
            setAnalysisIssues([]);
        }
    };
    
    const isRunning = cpuStatus === 'run';

    return (
        <div className="space-y-8">
            <header className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('simulator.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{t('simulator.description')}</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Panel: Editor & Analysis */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold mb-4">{t('simulator.editorTitle')}</h3>
                        <div className="flex h-64">
                            <div ref={lineNumbersRef} className="p-3 bg-gray-100 dark:bg-gray-900 text-right text-sm text-gray-500 rounded-l-lg select-none font-mono overflow-y-hidden">
                                {/* Line numbers go here */}
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={code}
                                onChange={handleCodeChange}
                                onScroll={handleScroll}
                                placeholder={t('simulator.codePlaceholder')}
                                className="w-full h-full p-3 font-mono text-sm bg-gray-50 dark:bg-gray-900 border-t border-r border-b border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    {analysisPerformed && !isAnalyzing && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-4">{t('simulator.analysisResults')}</h3>
                            
                            {error && <ErrorAlert message={error} />}

                            {!error && analysisIssues.length === 0 && !suggestedCode && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-green-700 dark:text-green-300 text-sm">
                                    <p>{t('simulator.noIssues')}</p>
                                </div>
                            )}
                            
                            {!error && analysisIssues.length > 0 && (
                                <div className="space-y-2">
                                    {analysisIssues.map((issue, i) => (
                                        <div key={i} className="flex items-start p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm">
                                            <span className="mr-3 font-mono text-xs text-yellow-600 dark:text-yellow-400">L{issue.line}</span>
                                            <span className={`mr-3 px-2 py-0.5 text-xs rounded-full ${issue.type === 'Error' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>{issue.type}</span>
                                            <span className="text-gray-700 dark:text-gray-300">{issue.message}</span>
                                        </div>
                                    ))}
                                    <button onClick={handleSuggestFix} disabled={isSuggesting} className="mt-4 text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 active:scale-95 transition-transform">
                                        {isSuggesting ? t('simulator.suggestingSolutionButton') : t('simulator.suggestSolutionButton')}
                                    </button>
                                </div>
                            )}

                            {!error && suggestedCode && (
                                <div className="mt-4">
                                    <h4 className="font-semibold">{t('simulator.suggestedCodeTitle')}</h4>
                                    <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-mono">{suggestedCode}</pre>
                                    <button onClick={handleImplementFix} className="mt-2 text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-transform">
                                        {t('simulator.implementSolutionButton')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Panel: Simulation */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4">{t('simulator.simulationTitle')}</h3>
                    <div className="space-y-6">
                        {/* Controls */}
                        <div>
                            <h4 className="font-semibold mb-2">{t('simulator.controls')}</h4>
                             <button
                                onClick={isRunning ? handleStop : handleAnalyzeAndRun}
                                disabled={isAnalyzing || code.trim() === ''}
                                className={`w-full px-4 py-3 text-white font-semibold rounded-lg text-sm transition-all duration-200 disabled:opacity-50 active:scale-95 ${
                                    isRunning 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {isAnalyzing 
                                    ? t('simulator.analyzingLogic') 
                                    : isRunning 
                                    ? t('simulator.stopSimulationButton') 
                                    : t('simulator.analyzeAndRunButton')}
                            </button>
                            <div className="mt-4"><CpuStatusDisplay status={cpuStatus} /></div>
                        </div>
                        {/* I/O */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">{t('simulator.inputs')}</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {inputs.length > 0 ? inputs.map(tag => (
                                        <InputToggle key={tag} label={tag} value={!!ioState[tag]} isNc={isTagNc(tag)} onChange={(val) => handleInputChange(tag, val)} disabled={!isRunning} />
                                    )) : <p className="text-sm text-gray-500">{t('simulator.noInputs')}</p>}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">{t('simulator.outputs')}</h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {outputs.length > 0 ? outputs.map(tag => (
                                        <OutputIndicator key={tag} label={tag} value={!!ioState[tag]} />
                                    )) : <p className="text-sm text-gray-500">{t('simulator.noOutputs')}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};