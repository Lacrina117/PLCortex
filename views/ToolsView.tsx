import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { vfdBrands, vfdModelsByBrand, plcLanguages } from '../constants/automationData';
import { analyzeFaultCode, analyzeScanTime, generateEnergyEfficiencyPlan, verifyCriticalLogic, translatePlcCode, validatePlcLogic, suggestPlcLogicFix, LogicIssue } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultDisplay } from '../components/ResultDisplay';

type AnalysisType = 'faultDiagnosis' | 'scanTime' | 'energy' | 'codeProver' | 'codeTranslator' | 'componentReference' | 'diagramGenerator' | 'logicValidator';

interface Tool {
    id: AnalysisType;
    title: string;
    description: string;
    icon: React.ReactNode;
}

// --- START: New Component Data ---
interface ComponentSpec {
    id: string; brand: string; model: string; type: string;
    dimensions: { h: number; w: number; d: number; unit: 'mm' };
    clearance: { top: number; bottom: number; sides: number; unit: 'mm' };
    heat?: number; // Watts
}
const componentDatabase: ComponentSpec[] = [
    { id: 'pf525-a', brand: 'Allen-Bradley', model: 'PowerFlex 525 (Frame A)', type: 'VFD', dimensions: {h: 172, w: 72, d: 152, unit: 'mm'}, clearance: {top: 50, bottom: 50, sides: 0, unit: 'mm'}, heat: 50 },
    { id: 'pf525-b', brand: 'Allen-Bradley', model: 'PowerFlex 525 (Frame B)', type: 'VFD', dimensions: {h: 172, w: 87, d: 180, unit: 'mm'}, clearance: {top: 50, bottom: 50, sides: 0, unit: 'mm'}, heat: 90 },
    { id: '1769-L30ER', brand: 'Allen-Bradley', model: '1769-L30ER', type: 'PLC CPU', dimensions: {h: 118, w: 55, d: 105, unit: 'mm'}, clearance: {top: 50, bottom: 50, sides: 25, unit: 'mm'} },
    { id: 'SITOP-5A', brand: 'Siemens', model: 'SITOP PSU6200 5A', type: 'Power Supply', dimensions: {h: 125, w: 35, d: 125, unit: 'mm'}, clearance: {top: 50, bottom: 50, sides: 0, unit: 'mm'} },
    { id: 'G120-FSA', brand: 'Siemens', model: 'Sinamics G120 PM240-2 (FSA)', type: 'VFD', dimensions: {h: 196, w: 73, d: 165, unit: 'mm'}, clearance: {top: 100, bottom: 100, sides: 0, unit: 'mm'}, heat: 75 },
    { id: 'rittal-ks-1450', brand: 'Rittal', model: 'KS 1450.500', type: 'Enclosure', dimensions: {h: 500, w: 500, d: 210, unit: 'mm'}, clearance: {top: 0, bottom: 0, sides: 0, unit: 'mm'}},
    { id: 'rittal-fan-3237', brand: 'Rittal', model: 'SK 3237.100', type: 'Filter Fan', dimensions: {h: 116.5, w: 116.5, d: 16, unit: 'mm'}, clearance: {top: 10, bottom: 10, sides: 10, unit: 'mm'}},
];
// --- END: New Component Data ---

const ToolIcon: React.FC<{ type: AnalysisType }> = ({ type }) => {
    const icons = {
        faultDiagnosis: <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.63.557-2.552.557s-1.807-.196-2.552-.557c-.24-.116-.467-.263-.67-.442-1.172-1.025-1.172-2.687 0-3.712z" />,
        scanTime: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        energy: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
        codeProver: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
        codeTranslator: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />,
        logicValidator: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
        componentReference: <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />,
        diagramGenerator: <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M9 10h.01M15 10h.01M12 8V4M8 16h8" />,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {icons[type]}
        </svg>
    );
};

const LogicValidator: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [code, setCode] = useState('');
    const [issues, setIssues] = useState<LogicIssue[] | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError(null);
        setIssues(null);
        setSuggestedCode(null);
        try {
            const resultText = await validatePlcLogic({ language, code });
            const jsonString = resultText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
            const parsedIssues = jsonString ? JSON.parse(jsonString) : [];
            setIssues(parsedIssues);
        } catch (e) {
            setError(e instanceof Error ? e.message : t('error.unexpected'));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSuggest = async () => {
        if (!issues || issues.length === 0) return;
        setIsSuggesting(true);
        setError(null);
        try {
            const result = await suggestPlcLogicFix({ language, code, issues });
            const cleanedCode = result.replace(/^```(?:\w+\s*)?\s*/, '').replace(/```\s*$/, '').trim();
            setSuggestedCode(cleanedCode);
        } catch (e) {
            setError(e instanceof Error ? e.message : t('error.unexpected'));
        } finally {
            setIsSuggesting(false);
        }
    };

    const commonInputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.logicValidator.codeLabel')}</label>
                <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={t('tools.logicValidator.codePlaceholder')} className={`${commonInputClasses} font-mono`} rows={8} required />
            </div>
            <button onClick={handleAnalyze} disabled={isAnalyzing || isSuggesting || !code.trim()} className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                {isAnalyzing ? t('tools.logicValidator.analyzing') : t('tools.logicValidator.analyzeButton')}
            </button>
            
            {(isAnalyzing || isSuggesting) && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}

            {issues && (
                <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-lg">{t('tools.logicValidator.analysisResults')}</h3>
                    {issues.length > 0 ? (
                        <div className="space-y-2">
                             {issues.map((issue, index) => (<div key={index} className={`flex items-start p-2 rounded-md ${issue.type === 'Error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'}`}><span className="font-mono bg-white/50 dark:bg-black/20 px-1.5 py-0.5 rounded-md text-xs mr-2">L{issue.line}</span><span><strong>{issue.type}:</strong> {issue.message}</span></div>))}
                            <button onClick={handleSuggest} disabled={isSuggesting} className="w-full mt-2 flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">{isSuggesting ? t('tools.logicValidator.suggesting') : t('tools.logicValidator.suggestButton')}</button>
                        </div>
                    ) : (
                        <p className="text-sm text-green-600 dark:text-green-400">{t('tools.logicValidator.noIssues')}</p>
                    )}
                </div>
            )}
            {suggestedCode && (
                <div className="mt-6 space-y-2">
                    <h3 className="font-semibold text-lg">{t('tools.logicValidator.suggestedSolution')}</h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <pre className="p-2 max-h-60 overflow-auto text-sm font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md shadow-inner"><code>{suggestedCode}</code></pre>
                        <button onClick={() => { setCode(suggestedCode); setIssues(null); setSuggestedCode(null); }} className="mt-3 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">{t('tools.logicValidator.implementButton')}</button>
                    </div>
                </div>
            )}
        </div>
    )
}

const ComponentReference: React.FC = () => {
    const {t} = useTranslation();
    const [componentSearch, setComponentSearch] = useState('');
    const commonInputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";

    const filteredComponents = useMemo(() => {
        if (!componentSearch) return componentDatabase;
        return componentDatabase.filter(c => 
            c.brand.toLowerCase().includes(componentSearch.toLowerCase()) || 
            c.model.toLowerCase().includes(componentSearch.toLowerCase())
        );
    }, [componentSearch]);

    return (
        <div className="space-y-4">
            <input type="text" value={componentSearch} onChange={e => setComponentSearch(e.target.value)} placeholder={t('tools.componentReference.searchPlaceholder')} className={commonInputClasses} />
            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                {filteredComponents.length > 0 ? filteredComponents.map(c => <ComponentCard key={c.id} component={c} />) : <p className="text-center text-gray-500">{t('tools.componentReference.noResults')}</p>}
            </div>
        </div>
    );
};

const ControlDiagramGenerator: React.FC = () => {
    const { t } = useTranslation();
    const [circuit, setCircuit] = useState('sealIn');
    const svgRef = useRef<SVGSVGElement>(null);
    const commonSelectClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";

    const diagrams: {[key: string]: React.ReactNode} = {
        dol: <g stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M20 20V280 M180 20V280" strokeWidth="2"/><circle cx="100" cy="180" r="10"/><path d="M100 190v15"/><path d="M90 205h20 M85 210h30 M80 215h40"/><text x="115" y="185">M</text><path d="M20 60H80 M120 60H180"/><path d="M80 50v20h40V50z"/><path d="m75 75 10-10 M85 75 75 65"/><text x="125" y="65">OL</text></g>,
        sealIn: <g stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M20 20V280 M180 20V280" strokeWidth="2"/><path d="M20 50H45 M75 50H105 M135 50H180"/><path d="M45 45v10 M75 45v10 M105 45v10 M135 45v10"/><path d="m100 60 10 10 M110 60 100 70"/><text x="30" y="45">STOP</text><text x="80" y="45">START</text><text x="110" y="45">OL</text><circle cx="157.5" cy="50" r="10"/><text x="138" y="70">M</text><path d="M40 90H140"/><path d="M40 95V85 M140 95V85"/><text x="85" y="85">M</text><path d="M60 50v40 M140 90v-40"/></g>,
        reversing: <g stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M20 20V280 M180 20V280" strokeWidth="2" /><path d="M20 50H45 M75 50H95 M125 50H145 M175 50H180" /><path d="M45 45v10 M75 45v10 M95 45v10 M125 45v10 M145 45v10 M175 45v10" /><path d="m90 60 10 10 M100 60 90 70" /><path d="m140 60 10 10 M150 60 140 70" /><text x="30" y="45">STOP</text><text x="77" y="45">FWD</text><text x="127" y="45">REV</text><text x="98" y="70">R</text><text x="148" y="70">F</text><circle cx="160" cy="50" r="10" /><text x="165" y="55">F</text><path d="M40 90H140" /><path d="M40 95V85 M140 95V85" /><text x="85" y="85">F</text><path d="M60 50v40 M140 90v-40" /><path d="M20 130H115 M145 130H180" /><path d="M115 125v10 M145 125v10" /><text x="118" y="125">F</text><circle cx="162.5" cy="130" r="10" /><text x="168" y="135">R</text><path d="M40 170H140" /><path d="M40 175V165 M140 175V165" /><text x="85" y="165">R</text><path d="M60 130v40 M140 170v-40" /><path d="M20 230H80 M120 230H180"/><path d="M80 220v20h40V220z"/><path d="m75 245 10-10 M85 245 75 235"/><text x="125" y="235">OL</text></g>
    };

    const downloadSvg = () => {
        if (!svgRef.current) return;
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${circuit}_diagram.svg`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.diagramGenerator.selectCircuit')}</label>
                <select value={circuit} onChange={e => setCircuit(e.target.value)} className={commonSelectClasses}>
                    <option value="sealIn">{t('tools.diagramGenerator.circuitTypes.sealIn')}</option>
                    <option value="dol">{t('tools.diagramGenerator.circuitTypes.dol')}</option>
                    <option value="reversing">{t('tools.diagramGenerator.circuitTypes.reversing')}</option>
                </select>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <svg ref={svgRef} viewBox="0 0 200 300" className="w-full h-auto max-h-96 text-gray-800 dark:text-gray-200">{diagrams[circuit]}</svg>
            </div>
            <button onClick={downloadSvg} className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">{t('tools.diagramGenerator.downloadSVG')}</button>
        </div>
    );
};

export const ToolsView: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'logicValidator' | 'componentReference' | 'diagramGenerator'>('logicValidator');
    
    const tabs = [
        { id: 'logicValidator', label: t('tools.logicValidator.title') },
        { id: 'componentReference', label: t('tools.componentReference.title') },
        { id: 'diagramGenerator', label: t('tools.diagramGenerator.title') },
    ];
  
    const baseTabClass = "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors";
    const activeTabClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-t border-x -mb-px text-indigo-600 dark:text-indigo-400";
    const inactiveTabClass = "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-transparent";

    return (
        <div className="max-w-4xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('tools.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('tools.description')}</p>
            </header>
             <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                className={`whitespace-nowrap ${baseTabClass} ${activeTab === tab.id ? activeTabClass : inactiveTabClass}`}>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="pt-6">
                    {activeTab === 'logicValidator' && <LogicValidator />}
                    {activeTab === 'componentReference' && <ComponentReference />}
                    {activeTab === 'diagramGenerator' && <ControlDiagramGenerator />}
                </div>
            </div>
        </div>
    );
};

const ComponentCard: React.FC<{component: ComponentSpec}> = ({ component }) => {
    const {t} = useTranslation();
    const { h, w, d, unit } = component.dimensions;
    const { top, bottom, sides } = component.clearance;
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-bold">{component.brand} - {component.model}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                    <p><strong>{t('tools.componentReference.dimensions')}:</strong> {h} x {w} x {d} {unit}</p>
                    {component.heat && <p><strong>{t('tools.componentReference.heat')}:</strong> {component.heat} W</p>}
                </div>
                <div className="space-y-1">
                    <p><strong>{t('tools.componentReference.clearance')}:</strong></p>
                    <div className="flex justify-center items-center h-24 bg-gray-100 dark:bg-gray-700/50 rounded-md p-2">
                        <div className="relative border-2 border-dashed border-gray-400 dark:border-gray-500" style={{ paddingTop: `${top/2}px`, paddingBottom: `${bottom/2}px`, paddingLeft: `${sides/2}px`, paddingRight: `${sides/2}px` }}>
                            <div className="w-12 h-16 bg-indigo-200 dark:bg-indigo-800/50 flex items-center justify-center text-xs font-mono text-center text-indigo-800 dark:text-indigo-200">{component.type}</div>
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-gray-500">{top}{unit}</span>
                            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500">{bottom}{unit}</span>
                            <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-xs text-gray-500 -rotate-90">{sides}{unit}</span>
                            <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-xs text-gray-500 rotate-90">{sides}{unit}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};