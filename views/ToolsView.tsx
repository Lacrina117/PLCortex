import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { vfdBrands, vfdModelsByBrand, plcLanguages } from '../constants/automationData';
import { analyzeFaultCode, analyzeScanTime, generateEnergyEfficiencyPlan, verifyCriticalLogic, validatePlcLogic, suggestPlcLogicFix, LogicIssue } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultDisplay } from '../components/ResultDisplay';
import { ResultSkeleton } from '../components/SkeletonLoader';

type AnalysisType = 'faultDiagnosis' | 'scanTime' | 'energy' | 'codeProver' | 'componentReference' | 'logicValidator';

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

const commonInputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";
const commonButtonClasses = "w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed";

const useApiCall = <T,>(apiFunc: (params: T) => Promise<string>) => {
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const execute = async (params: T) => {
        setIsLoading(true);
        setError(null);
        setResult('');
        try {
            const apiResult = await apiFunc(params);
            setResult(apiResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsLoading(false);
        }
    };
    
    return { result, isLoading, error, execute };
};

const FaultDiagnosisTool: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const { result, isLoading, error, execute } = useApiCall(analyzeFaultCode);

    const [vfdBrand, setVfdBrand] = useState(vfdBrands.find(b => b === 'Allen-Bradley') || vfdBrands[1]);
    const [vfdModel, setVfdModel] = useState(vfdModelsByBrand['Allen-Bradley'][0]);
    const [faultCode, setFaultCode] = useState('');
    const [context, setContext] = useState('');

    useEffect(() => {
        const models = vfdModelsByBrand[vfdBrand] || [];
        setVfdModel(models[0] || '');
    }, [vfdBrand]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        execute({ language, vfdBrand, vfdModel, faultCode, context });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.faultDiagnosis.vfdBrand')}</label>
                    <select value={vfdBrand} onChange={e => setVfdBrand(e.target.value)} className={commonInputClasses}>
                        {vfdBrands.filter(b => b !== 'General').map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.faultDiagnosis.vfdModel')}</label>
                    <select value={vfdModel} onChange={e => setVfdModel(e.target.value)} className={commonInputClasses} disabled={!vfdModelsByBrand[vfdBrand] || vfdModelsByBrand[vfdBrand].length === 0}>
                        {vfdModelsByBrand[vfdBrand]?.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.faultDiagnosis.faultCode')}</label>
                <input type="text" value={faultCode} onChange={e => setFaultCode(e.target.value)} placeholder={t('tools.faultDiagnosis.faultCodePlaceholder')} className={commonInputClasses} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.faultDiagnosis.context')}</label>
                <textarea value={context} onChange={e => setContext(e.target.value)} placeholder={t('tools.faultDiagnosis.contextPlaceholder')} className={commonInputClasses} rows={3} required />
            </div>
            <button type="submit" disabled={isLoading} className={commonButtonClasses}>{t('tools.generateButton')}</button>
            {isLoading && <ResultSkeleton />}
            {error && <ErrorAlert message={error} />}
            {result && !isLoading && <ResultDisplay resultText={result} />}
        </form>
    );
};

const ScanTimeTool: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const { result, isLoading, error, execute } = useApiCall(analyzeScanTime);
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        execute({ language, code });
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.scanTime.codeLabel')}</label>
                <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={t('tools.scanTime.codePlaceholder')} className={`${commonInputClasses} font-mono`} rows={10} required />
            </div>
            <button type="submit" disabled={isLoading} className={commonButtonClasses}>{t('tools.generateButton')}</button>
            {isLoading && <ResultSkeleton />}
            {error && <ErrorAlert message={error} />}
            {result && !isLoading && <ResultDisplay resultText={result} />}
        </form>
    );
};

const EnergyTool: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const { result, isLoading, error, execute } = useApiCall(generateEnergyEfficiencyPlan);
    
    const applicationTypeOptions = useMemo(() => [
        { key: 'pump', label: t('tools.energy.appTypes.pump') },
        { key: 'fan', label: t('tools.energy.appTypes.fan') },
        { key: 'conveyor', label: t('tools.energy.appTypes.conveyor') },
        { key: 'compressor', label: t('tools.energy.appTypes.compressor') },
        { key: 'extruder', label: t('tools.energy.appTypes.extruder') },
        { key: 'mixer', label: t('tools.energy.appTypes.mixer') },
    ], [t]);

    const [applicationType, setApplicationType] = useState(applicationTypeOptions[0].label);
    const [loadProfile, setLoadProfile] = useState('');

    useEffect(() => {
        setApplicationType(applicationTypeOptions[0].label);
    }, [applicationTypeOptions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        execute({ language, applicationType, loadProfile });
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.energy.appType')}</label>
                <select value={applicationType} onChange={e => setApplicationType(e.target.value)} className={commonInputClasses} required>
                    {applicationTypeOptions.map(opt => <option key={opt.key} value={opt.label}>{opt.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.energy.loadProfile')}</label>
                <textarea value={loadProfile} onChange={e => setLoadProfile(e.target.value)} placeholder={t('tools.energy.loadProfilePlaceholder')} className={commonInputClasses} rows={4} required />
            </div>
            <button type="submit" disabled={isLoading} className={commonButtonClasses}>{t('tools.generateButton')}</button>
            {isLoading && <ResultSkeleton />}
            {error && <ErrorAlert message={error} />}
            {result && !isLoading && <ResultDisplay resultText={result} />}
        </form>
    );
};

const CodeProverTool: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const { result, isLoading, error, execute } = useApiCall(verifyCriticalLogic);
    const [code, setCode] = useState('');
    const [rules, setRules] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        execute({ language, code, rules });
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.scanTime.codeLabel')}</label>
                <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={t('tools.scanTime.codePlaceholder')} className={`${commonInputClasses} font-mono`} rows={8} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.codeProver.rulesLabel')}</label>
                <textarea value={rules} onChange={e => setRules(e.target.value)} placeholder={t('tools.codeProver.rulesPlaceholder')} className={commonInputClasses} rows={4} required />
            </div>
            <button type="submit" disabled={isLoading} className={commonButtonClasses}>{t('tools.generateButton')}</button>
            {isLoading && <ResultSkeleton />}
            {error && <ErrorAlert message={error} />}
            {result && !isLoading && <ResultDisplay resultText={result} />}
        </form>
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

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.logicValidator.codeLabel')}</label>
                <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={t('tools.logicValidator.codePlaceholder')} className={`${commonInputClasses} font-mono`} rows={8} required />
            </div>
            <button type="button" onClick={handleAnalyze} disabled={isAnalyzing || isSuggesting || !code.trim()} className={commonButtonClasses}>
                {isAnalyzing ? t('tools.logicValidator.analyzing') : t('tools.logicValidator.analyzeButton')}
            </button>
            
            {(isAnalyzing || isSuggesting) && <LoadingSpinner message={isAnalyzing ? t('tools.logicValidator.analyzing') : t('tools.logicValidator.suggesting')} />}
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

export const ToolsView: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<AnalysisType>('faultDiagnosis');
    
    const tabs: { id: AnalysisType; label: string; }[] = [
        { id: 'faultDiagnosis', label: t('tools.faultDiagnosis.title') },
        { id: 'scanTime', label: t('tools.scanTime.title') },
        { id: 'energy', label: t('tools.energy.title') },
        { id: 'codeProver', label: t('tools.codeProver.title') },
        { id: 'logicValidator', label: t('tools.logicValidator.title') },
        { id: 'componentReference', label: t('tools.componentReference.title') },
    ];
  
    const baseTabClass = "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors";
    const activeTabClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-t border-x -mb-px text-indigo-600 dark:text-indigo-400";
    const inactiveTabClass = "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-transparent";

    const renderActiveTool = () => {
        switch (activeTab) {
            case 'faultDiagnosis': return <FaultDiagnosisTool />;
            case 'scanTime': return <ScanTimeTool />;
            case 'energy': return <EnergyTool />;
            case 'codeProver': return <CodeProverTool />;
            case 'logicValidator': return <LogicValidator />;
            case 'componentReference': return <ComponentReference />;
            default: return null;
        }
    };

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
                   {renderActiveTool()}
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