import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { vfdBrands, vfdModelsByBrand } from '../constants/automationData';
import { analyzeFaultCode, analyzeScanTime, generateEnergyEfficiencyPlan, verifyCriticalLogic, validatePlcLogic, suggestPlcLogicFix, LogicIssue } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultDisplay } from '../components/ResultDisplay';

type Tool = 'fault' | 'scan' | 'energy' | 'prover' | 'validator';

const ToolCard: React.FC<{ title: string; description: string; isActive: boolean; onClick: () => void; }> = ({ title, description, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`text-left w-full h-full p-6 rounded-xl border-2 transition-all duration-300 ${
            isActive
                ? 'bg-indigo-50 dark:bg-gray-700/50 border-indigo-500 shadow-lg'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
        }`}
    >
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </button>
);

export const ToolsView: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [activeTool, setActiveTool] = useState<Tool>('fault');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [vfdBrand, setVfdBrand] = useState(vfdBrands[1]);
    const [vfdModel, setVfdModel] = useState('General');
    const [faultCode, setFaultCode] = useState('');
    const [context, setContext] = useState('');
    const [code, setCode] = useState('');
    const [rules, setRules] = useState('');
    const [appType, setAppType] = useState('pump');
    const [loadProfile, setLoadProfile] = useState('');
    const [logicIssues, setLogicIssues] = useState<LogicIssue[]>([]);
    
    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";
    const commonTextareaClasses = `${commonInputClasses} font-mono text-xs`;

    const resetForm = () => {
        setResult('');
        setError(null);
        setLogicIssues([]);
    };

    const handleToolChange = (tool: Tool) => {
        setActiveTool(tool);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        resetForm();
        
        try {
            let res = '';
            switch (activeTool) {
                case 'fault':
                    res = await analyzeFaultCode({ language, vfdBrand, vfdModel, faultCode, context });
                    break;
                case 'scan':
                    res = await analyzeScanTime({ language, code });
                    break;
                case 'energy':
                    res = await generateEnergyEfficiencyPlan({ language, applicationType: appType, loadProfile });
                    break;
                case 'prover':
                    res = await verifyCriticalLogic({ language, code, rules });
                    break;
                case 'validator':
                    res = await validatePlcLogic({ language, code });
                    try {
                        let jsonString = res;
                        // Clean the response from the AI, which might include markdown or extra text.
                        const match = res.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
                        if (match) {
                            // Use the first captured group that is not undefined.
                            // match[1] is for ```json ... ```, match[2] is for [...]
                            jsonString = match[1] || match[2];
                        }
                        const issues = JSON.parse(jsonString);
                        setLogicIssues(issues);
                        // No text result for validator, just issues
                        res = '';
                    } catch {
                        console.error("Raw response from API:", res);
                        throw new Error("Failed to parse validation results. The API may have returned an unexpected format.");
                    }
                    break;
            }
            setResult(res);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSuggestFix = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fixedCode = await suggestPlcLogicFix({ language, code, issues: logicIssues });
            setResult(fixedCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsLoading(false);
        }
    };

    const tools: { key: Tool; title: string; description: string }[] = [
        { key: 'fault', title: t('tools.faultDiagnosis.title'), description: t('tools.faultDiagnosis.description') },
        { key: 'scan', title: t('tools.scanTime.title'), description: t('tools.scanTime.description') },
        { key: 'energy', title: t('tools.energy.title'), description: t('tools.energy.description') },
        { key: 'prover', title: t('tools.codeProver.title'), description: t('tools.codeProver.description') },
        { key: 'validator', title: t('tools.logicValidator.title'), description: t('tools.logicValidator.description') },
    ];

    const renderForm = () => {
        switch (activeTool) {
            case 'fault': return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('tools.faultDiagnosis.vfdBrand')}</label>
                            <select value={vfdBrand} onChange={e => setVfdBrand(e.target.value)} className={commonInputClasses}>
                                {vfdBrands.filter(b => b !== 'General').map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('tools.faultDiagnosis.vfdModel')}</label>
                            <select value={vfdModel} onChange={e => setVfdModel(e.target.value)} className={commonInputClasses}>
                                <option value="General">{t('formGeneralOption')}</option>
                                {(vfdModelsByBrand[vfdBrand] || []).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.faultDiagnosis.faultCode')}</label>
                        <input type="text" value={faultCode} onChange={e => setFaultCode(e.target.value)} placeholder={t('tools.faultDiagnosis.faultCodePlaceholder')} className={commonInputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.faultDiagnosis.context')}</label>
                        <textarea value={context} onChange={e => setContext(e.target.value)} placeholder={t('tools.faultDiagnosis.contextPlaceholder')} rows={3} className={commonInputClasses} />
                    </div>
                </div>
            );
            case 'scan': return (
                <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.scanTime.codeLabel')}</label>
                    <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={t('tools.scanTime.codePlaceholder')} rows={10} className={commonTextareaClasses} />
                </div>
            );
            case 'energy': return (
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.energy.appType')}</label>
                        <select value={appType} onChange={e => setAppType(e.target.value)} className={commonInputClasses}>
                            {Object.entries(t('tools.energy.appTypes')).map(([key, label]: [string, any]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.energy.loadProfile')}</label>
                        <textarea value={loadProfile} onChange={e => setLoadProfile(e.target.value)} placeholder={t('tools.energy.loadProfilePlaceholder')} rows={4} className={commonInputClasses} />
                    </div>
                </div>
            );
            case 'prover': return (
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.scanTime.codeLabel')}</label>
                        <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={t('tools.scanTime.codePlaceholder')} rows={8} className={commonTextareaClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.codeProver.rulesLabel')}</label>
                        <textarea value={rules} onChange={e => setRules(e.target.value)} placeholder={t('tools.codeProver.rulesPlaceholder')} rows={4} className={commonInputClasses} />
                    </div>
                </div>
            );
            case 'validator': return (
                <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.logicValidator.codeLabel')}</label>
                    <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={t('tools.logicValidator.codePlaceholder')} rows={10} className={commonTextareaClasses} />
                </div>
            );
            default: return null;
        }
    };
    
    return (
        <div className="max-w-6xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('tools.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('tools.description')}</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                {tools.map(tool => <ToolCard key={tool.key} {...tool} isActive={activeTool === tool.key} onClick={() => handleToolChange(tool.key)} />)}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    {renderForm()}
                    <button type="submit" disabled={isLoading} className="w-full mt-6 bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center">
                        {isLoading ? (activeTool === 'validator' ? t('tools.logicValidator.analyzing') : t('formGeneratingButton')) : (activeTool === 'validator' ? t('tools.logicValidator.analyzeButton') : t('tools.generateButton'))}
                    </button>
                </form>
            </div>
            
            {isLoading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}

            {activeTool === 'validator' && !isLoading && logicIssues.length > 0 && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-yellow-400 dark:border-yellow-600">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('tools.logicValidator.analysisResults')}</h2>
                    <ul className="space-y-2">
                        {logicIssues.map((issue, i) => (
                            <li key={i} className="flex items-start p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                                <span className="mr-3 font-mono text-xs text-yellow-600 dark:text-yellow-400">L{issue.line}</span>
                                <span className={`mr-3 px-2 py-0.5 text-xs rounded-full ${issue.type === 'Error' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>{issue.type}</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{issue.message}</span>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleSuggestFix} disabled={isLoading} className="mt-6 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400">
                        {isLoading ? t('tools.logicValidator.suggesting') : t('tools.logicValidator.suggestButton')}
                    </button>
                </div>
            )}
            
            {activeTool === 'validator' && !isLoading && logicIssues.length === 0 && result === '' && !error && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-green-400 dark:border-green-600">
                    <p>{t('tools.logicValidator.noIssues')}</p>
                </div>
            )}

            {result && <ResultDisplay resultText={result} />}
        </div>
    );
};