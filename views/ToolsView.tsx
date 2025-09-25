import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { vfdBrands, vfdModelsByBrand, plcLanguages } from '../constants/automationData';
import { analyzeFaultCode, analyzeScanTime, generateEnergyEfficiencyPlan, verifyCriticalLogic, translatePlcCode } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultDisplay } from '../components/ResultDisplay';

type AnalysisType = 'faultDiagnosis' | 'scanTime' | 'energy' | 'codeProver' | 'codeTranslator';

interface Tool {
    id: AnalysisType;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const ToolIcon: React.FC<{ type: AnalysisType }> = ({ type }) => {
    const icons = {
        faultDiagnosis: <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.63.557-2.552.557s-1.807-.196-2.552-.557c-.24-.116-.467-.263-.67-.442-1.172-1.025-1.172-2.687 0-3.712z" />,
        scanTime: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
        energy: <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />,
        codeProver: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
        codeTranslator: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />,
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {icons[type]}
        </svg>
    );
};

export const ToolsView: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();

    const [selectedTool, setSelectedTool] = useState<AnalysisType | null>(null);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    // Form state
    const [vfdBrand, setVfdBrand] = useState(vfdBrands[2]);
    const [vfdModel, setVfdModel] = useState(vfdModelsByBrand['Allen-Bradley'][0]);
    const [faultCode, setFaultCode] = useState('');
    const [faultContext, setFaultContext] = useState('');
    const [plcCode, setPlcCode] = useState('');
    const [applicationType, setApplicationType] = useState('Centrifugal Pump');
    const [loadProfile, setLoadProfile] = useState('');
    const [immutableRules, setImmutableRules] = useState('');
    const [targetLanguage, setTargetLanguage] = useState(plcLanguages[3]); // Default to ST

    useEffect(() => {
        if (selectedTool === 'faultDiagnosis') {
            const models = vfdModelsByBrand[vfdBrand] || [];
            setVfdModel(models[0] || '');
        }
    }, [vfdBrand, selectedTool]);

    const tools: Tool[] = [
        { id: 'faultDiagnosis', title: t('tools.faultDiagnosis.title'), description: t('tools.faultDiagnosis.description'), icon: <ToolIcon type="faultDiagnosis" /> },
        { id: 'scanTime', title: t('tools.scanTime.title'), description: t('tools.scanTime.description'), icon: <ToolIcon type="scanTime" /> },
        { id: 'energy', title: t('tools.energy.title'), description: t('tools.energy.description'), icon: <ToolIcon type="energy" /> },
        { id: 'codeProver', title: t('tools.codeProver.title'), description: t('tools.codeProver.description'), icon: <ToolIcon type="codeProver" /> },
        { id: 'codeTranslator', title: t('tools.codeTranslator.title'), description: t('tools.codeTranslator.description'), icon: <ToolIcon type="codeTranslator" /> },
    ];

    const resetForm = () => {
        setVfdBrand(vfdBrands[2]);
        setVfdModel(vfdModelsByBrand['Allen-Bradley'][0]);
        setFaultCode('');
        setFaultContext('');
        setPlcCode('');
        setApplicationType('Centrifugal Pump');
        setLoadProfile('');
        setImmutableRules('');
        setTargetLanguage(plcLanguages[3]);
    };
    
    const handleToolSelect = (toolId: AnalysisType) => {
        setSelectedTool(toolId);
        setResult('');
        setError(null);
        resetForm();
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const isFormValid = () => {
        if (!selectedTool) return false;
        switch (selectedTool) {
            case 'faultDiagnosis': return faultCode.trim() !== '' && faultContext.trim() !== '';
            case 'scanTime': return plcCode.trim() !== '';
            case 'energy': return loadProfile.trim() !== '';
            case 'codeProver': return plcCode.trim() !== '' && immutableRules.trim() !== '';
            case 'codeTranslator': return plcCode.trim() !== '';
            default: return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) return;
        
        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            let apiResult = '';
            switch (selectedTool) {
                case 'faultDiagnosis':
                    apiResult = await analyzeFaultCode({ language, vfdBrand, vfdModel, faultCode, context: faultContext });
                    break;
                case 'scanTime':
                    apiResult = await analyzeScanTime({ language, code: plcCode });
                    break;
                case 'energy':
                    apiResult = await generateEnergyEfficiencyPlan({ language, applicationType, loadProfile });
                    break;
                case 'codeProver':
                    apiResult = await verifyCriticalLogic({ language, code: plcCode, rules: immutableRules });
                    break;
                case 'codeTranslator':
                    apiResult = await translatePlcCode({ language, code: plcCode, targetLanguage });
                    break;
            }
            setResult(apiResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsLoading(false);
        }
    };

    const commonInputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";
    const commonSelectClasses = commonInputClasses;

    const renderForm = () => {
        if (!selectedTool) return null;
        const currentTool = tools.find(t => t.id === selectedTool)!;
        
        return (
            <div ref={formRef} className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4">
                        {currentTool.icon}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{currentTool.title}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{currentTool.description}</p>
                        </div>
                    </div>
                    {selectedTool === 'faultDiagnosis' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.faultDiagnosis.vfdBrand')}</label>
                                <select value={vfdBrand} onChange={e => setVfdBrand(e.target.value)} className={commonSelectClasses}>
                                    {vfdBrands.filter(b => b !== 'General').map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.faultDiagnosis.vfdModel')}</label>
                                <select value={vfdModel} onChange={e => setVfdModel(e.target.value)} className={commonSelectClasses}>
                                    {(vfdModelsByBrand[vfdBrand] || []).map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.faultDiagnosis.faultCode')}</label>
                                <input type="text" value={faultCode} onChange={e => setFaultCode(e.target.value)} placeholder={t('tools.faultDiagnosis.faultCodePlaceholder')} className={commonInputClasses} required />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.faultDiagnosis.context')}</label>
                                <textarea value={faultContext} onChange={e => setFaultContext(e.target.value)} placeholder={t('tools.faultDiagnosis.contextPlaceholder')} className={commonInputClasses} rows={3} required />
                            </div>
                        </div>
                    )}
                    {(selectedTool === 'scanTime' || selectedTool === 'codeProver' || selectedTool === 'codeTranslator') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.scanTime.codeLabel')}</label>
                            <textarea value={plcCode} onChange={e => setPlcCode(e.target.value)} placeholder={t('tools.scanTime.codePlaceholder')} className={`${commonInputClasses} font-mono`} rows={8} required />
                        </div>
                    )}
                     {selectedTool === 'codeProver' && (
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.codeProver.rulesLabel')}</label>
                            <textarea value={immutableRules} onChange={e => setImmutableRules(e.target.value)} placeholder={t('tools.codeProver.rulesPlaceholder')} className={commonInputClasses} rows={3} required />
                        </div>
                    )}
                    {selectedTool === 'codeTranslator' && (
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.codeTranslator.targetLanguage')}</label>
                            <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)} className={commonSelectClasses}>
                                {plcLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                            </select>
                        </div>
                    )}
                    {selectedTool === 'energy' && (
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.energy.appType')}</label>
                                <select value={applicationType} onChange={e => setApplicationType(e.target.value)} className={commonSelectClasses}>
                                     <option>Centrifugal Pump</option>
                                     <option>Fan</option>
                                     <option>Compressor</option>
                                     <option>Conveyor Belt</option>
                                     <option>Crane / Hoist</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tools.energy.loadProfile')}</label>
                                <textarea value={loadProfile} onChange={e => setLoadProfile(e.target.value)} placeholder={t('tools.energy.loadProfilePlaceholder')} className={commonInputClasses} rows={3} required />
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading || !isFormValid()} className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('formGeneratingButton')}
                            </>
                        ) : t('tools.generateButton')}
                    </button>
                </form>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('tools.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('tools.description')}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map(tool => (
                    <button 
                        key={tool.id} 
                        onClick={() => handleToolSelect(tool.id)}
                        className={`text-left bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl ${selectedTool === tool.id ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'}`}
                    >
                        <div className="flex items-center gap-4">
                            {tool.icon}
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{tool.title}</h3>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                    </button>
                ))}
            </div>

            {renderForm()}
            
            {isLoading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {result && !isLoading && <ResultDisplay resultText={result} />}

        </div>
    );
};