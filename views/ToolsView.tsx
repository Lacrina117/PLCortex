
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
// FIX: Imported `networkProtocols` instead of the non-existent `networkDevices`.
import { vfdBrands, vfdModelsByBrand, networkProtocols, plcBrands, plcSoftwareByBrand } from '../constants/automationData';
import { analyzeFaultCode, analyzeScanTime, generateEnergyEfficiencyPlan, verifyCriticalLogic, validatePlcLogic, suggestPlcLogicFix, LogicIssue, analyzeAsciiFrame, getNetworkHardwarePlan, translateLadderToText, convertPlcCode } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultDisplay } from '../components/ResultDisplay';
import { CommissioningView } from './CommissioningView';

type Tool = 'fault' | 'scan' | 'energy' | 'prover' | 'validator' | 'network' | 'commissioning' | 'migration';
type NetworkTool = 'crc' | 'ascii' | 'hardware';

interface CrcResult {
    crc16: string;
    crc16swapped: string;
    lrc: string;
    checksum: string;
}

const ToolCard: React.FC<{ title: string; description: string; isActive: boolean; onClick: () => void; }> = ({ title, description, isActive, onClick }) => (
    <button
        type="button"
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

const NetworkToolCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ title, description, icon, isActive, onClick }) => (
     <button
        type="button"
        onClick={onClick}
        className={`p-4 rounded-lg border-2 text-left transition-all w-full h-full flex flex-col ${
            isActive
                ? 'border-indigo-500 bg-indigo-50 dark:bg-gray-700/50 shadow-md'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
        }`}
    >
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200">{title}</h4>
            </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex-grow">
            {description}
        </p>
    </button>
);


export const ToolsView: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [activeTool, setActiveTool] = useState<Tool>('fault');
    const [activeNetworkTool, setActiveNetworkTool] = useState<NetworkTool>('crc');
    const [result, setResult] = useState<string | { text: string; groundingMetadata?: any } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCommissioning, setShowCommissioning] = useState(false);

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
    const [processedCode, setProcessedCode] = useState('');
    const [hexFrame, setHexFrame] = useState('01 03 00 0A 00 01');
    const [asciiFrame, setAsciiFrame] = useState('<STX>+0015.50g<CR><LF>');
    // FIX: Renamed state from `selectedDevices` to `selectedProtocols` for clarity.
    const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
    const [crcResult, setCrcResult] = useState<CrcResult | null>(null);
    // NEW: Image state for fault diagnosis
    const [faultImage, setFaultImage] = useState<string | null>(null);
    const [faultImageMime, setFaultImageMime] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // NEW: Migration Tool States
    const [sourceBrand, setSourceBrand] = useState('Allen-Bradley');
    const [sourcePlatform, setSourcePlatform] = useState('Studio 5000');
    const [targetBrand, setTargetBrand] = useState('Siemens');
    const [targetPlatform, setTargetPlatform] = useState('TIA Portal');

    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";
    const commonTextareaClasses = `${commonInputClasses} font-mono text-xs`;

    const resetForm = () => {
        setResult(null);
        setError(null);
        setLogicIssues([]);
        setCrcResult(null);
        setFaultImage(null);
        setFaultImageMime(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleToolChange = (tool: Tool) => {
        if (tool === 'commissioning') {
            setShowCommissioning(true);
            return;
        }
        setActiveTool(tool);
        resetForm();
    };
    
    const handleNetworkToolChange = (tool: NetworkTool) => {
        setActiveNetworkTool(tool);
        resetForm();
    };
    
    // FIX: Renamed handler from `handleDeviceSelection` to `handleProtocolSelection`.
    const handleProtocolSelection = (protocol: string) => {
        setSelectedProtocols(prev => 
            prev.includes(protocol) ? prev.filter(p => p !== protocol) : [...prev, protocol]
        );
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setFaultImage(result); // This is the data URL for preview
            setFaultImageMime(file.type);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setFaultImage(null);
        setFaultImageMime(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // --- Checksum Calculation Logic ---
    const parseHexString = (str: string): number[] => {
        return str.trim().split(/[\s,]+/).map(hex => parseInt(hex, 16)).filter(num => !isNaN(num));
    };

    const calculateCrc16Modbus = (data: number[]): number => {
        let crc = 0xFFFF;
        for (const byte of data) {
            crc ^= byte;
            for (let i = 0; i < 8; i++) {
                if ((crc & 0x0001) !== 0) {
                    crc = (crc >> 1) ^ 0xA001;
                } else {
                    crc = crc >> 1;
                }
            }
        }
        return crc;
    };

    const calculateLrc = (data: number[]): number => {
        const sum = data.reduce((acc, byte) => acc + byte, 0);
        return (-(sum) & 0xFF);
    };

    const calculateChecksum = (data: number[]): number => {
        return data.reduce((acc, byte) => acc + byte, 0) & 0xFF;
    };
    // --- End Checksum Logic ---

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (activeTool !== 'network' || activeNetworkTool !== 'crc') {
            setIsLoading(true);
        }
        setResult(null); // Clear previous results, keep form data
        setError(null);
        setLogicIssues([]);
        
        try {
            switch (activeTool) {
                case 'fault':
                    const imageBase64 = faultImage ? faultImage.split(',')[1] : undefined;
                    const faultRes = await analyzeFaultCode({ 
                        language, 
                        vfdBrand, 
                        vfdModel, 
                        faultCode, 
                        context,
                        imageBase64,
                        mimeType: faultImageMime || undefined
                    });
                    setResult(faultRes);
                    break;
                case 'scan':
                    const scanRes = await analyzeScanTime({ language, code });
                    setResult(scanRes);
                    break;
                case 'energy':
                    const energyRes = await generateEnergyEfficiencyPlan({ language, applicationType: appType, loadProfile });
                    setResult(energyRes);
                    break;
                case 'prover':
                    const proverRes = await verifyCriticalLogic({ language, code, rules });
                    setResult(proverRes);
                    break;
                case 'validator':
                    {
                        const isAscii = code.includes('|--') || (code.includes('|') && code.split('\n').length > 1);
                        let logicToValidate = code;
    
                        if (isAscii) {
                            const translated = await translateLadderToText({ language, code });
                            logicToValidate = translated.trim();
                        }
                        
                        setProcessedCode(logicToValidate);
                        
                        const validationRes = await validatePlcLogic({ language, code: logicToValidate });
                        try {
                            let jsonString = validationRes;
                            const match = validationRes.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
                            if (match) {
                                jsonString = match[1] || match[2];
                            }
                            const issues = JSON.parse(jsonString);
                            setLogicIssues(issues);
                        } catch {
                            console.error("Raw response from API:", validationRes);
                            throw new Error("Failed to parse validation results. The API may have returned an unexpected format.");
                        }
                        break;
                    }
                case 'migration':
                    const migrationRes = await convertPlcCode({
                        language,
                        sourceBrand,
                        sourcePlatform,
                        targetBrand,
                        targetPlatform,
                        code
                    });
                    setResult(migrationRes);
                    break;
                case 'network':
                    switch(activeNetworkTool) {
                        case 'crc':
                            const bytes = parseHexString(hexFrame);
                            if(bytes.length === 0) {
                                setError("Invalid or empty hex frame.");
                                return;
                            }
                            const crc = calculateCrc16Modbus(bytes);
                            const lrc = calculateLrc(bytes);
                            const checksum = calculateChecksum(bytes);
                            setCrcResult({
                                crc16: `${(crc & 0xFF).toString(16).toUpperCase().padStart(2, '0')} ${(crc >> 8).toString(16).toUpperCase().padStart(2, '0')}`,
                                crc16swapped: `${(crc >> 8).toString(16).toUpperCase().padStart(2, '0')} ${(crc & 0xFF).toString(16).toUpperCase().padStart(2, '0')}`,
                                lrc: lrc.toString(16).toUpperCase().padStart(2, '0'),
                                checksum: checksum.toString(16).toUpperCase().padStart(2, '0'),
                            });
                            return; // No loading state needed
                        case 'ascii':
                            setIsLoading(true);
                            const asciiRes = await analyzeAsciiFrame({ language, frame: asciiFrame });
                            setResult(asciiRes);
                            break;
                        case 'hardware':
                             // FIX: Check selectedProtocols instead of selectedDevices.
                             if (selectedProtocols.length < 2) {
                                setError("Please select at least two protocols to connect.");
                                return;
                            }
                            setIsLoading(true);
                            // FIX: Passed `protocols` property instead of `devices` to match the function signature.
                            const hardwareRes = await getNetworkHardwarePlan({ language, protocols: selectedProtocols });
                            setResult(hardwareRes);
                            break;
                    }
                    break;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            if (activeTool !== 'network' || activeNetworkTool !== 'crc') {
                setIsLoading(false);
            }
        }
    };
    
    const handleSuggestFix = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fixedCode = await suggestPlcLogicFix({ language, code: processedCode, issues: logicIssues });
            setResult(fixedCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsLoading(false);
        }
    };

    const tools: { key: Tool; title: string; description: string }[] = [
        { key: 'fault', title: t('tools.faultDiagnosis.title'), description: t('tools.faultDiagnosis.description') },
        { key: 'commissioning', title: t('header.commissioning'), description: t('header_descriptions.commissioning') },
        { key: 'migration', title: t('tools.migration.title'), description: t('tools.migration.description') },
        { key: 'scan', title: t('tools.scanTime.title'), description: t('tools.scanTime.description') },
        { key: 'energy', title: t('tools.energy.title'), description: t('tools.energy.description') },
        { key: 'prover', title: t('tools.codeProver.title'), description: t('tools.codeProver.description') },
        { key: 'validator', title: t('tools.logicValidator.title'), description: t('tools.logicValidator.description') },
        { key: 'network', title: t('tools.network.title'), description: t('tools.network.description') },
    ];

    const renderForm = () => {
        switch (activeTool) {
            case 'fault': return (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('tools.faultDiagnosis.vfdBrand')}</label>
                            <select value={vfdBrand} onChange={e => { setVfdBrand(e.target.value); setVfdModel('General'); }} className={commonInputClasses}>
                                {vfdBrands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('tools.faultDiagnosis.vfdModel')}</label>
                            <select value={vfdModel} onChange={e => setVfdModel(e.target.value)} className={commonInputClasses} disabled={!vfdBrand || vfdBrand === 'General'}>
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
                        <textarea value={context} onChange={e => setContext(e.target.value)} placeholder={t('tools.faultDiagnosis.contextPlaceholder')} rows={4} className={commonTextareaClasses} />
                    </div>
                    
                    {/* NEW: Image Upload for Visual Diagnosis */}
                    <div className="mt-2">
                        <label className="block text-sm font-medium mb-1">Visual Context (Optional)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Upload Photo of Fault/Screen
                            </button>
                        </div>
                        {faultImage && (
                            <div className="mt-2 relative inline-block">
                                <img src={faultImage} alt="Fault Context" className="h-32 w-auto rounded border border-gray-300 dark:border-gray-600 object-cover" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    title="Remove image"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Upload a photo of the VFD screen showing the fault code, or the motor nameplate for better context.</p>
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
                            {Object.entries(t('tools.energy.appTypes')).map(([key, value]) => (
                                <option key={key} value={key}>{value as string}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.energy.loadProfile')}</label>
                        <textarea value={loadProfile} onChange={e => setLoadProfile(e.target.value)} placeholder={t('tools.energy.loadProfilePlaceholder')} rows={4} className={commonTextareaClasses} />
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
                        <textarea value={rules} onChange={e => setRules(e.target.value)} placeholder={t('tools.codeProver.rulesPlaceholder')} rows={4} className={commonTextareaClasses} />
                    </div>
                </div>
            );
            case 'validator': return (
                <div>
                    <label className="block text-sm font-medium mb-1">{t('tools.logicValidator.codeLabel')}</label>
                    <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={t('tools.logicValidator.codePlaceholder')} rows={10} className={commonTextareaClasses} />
                </div>
            );
            case 'migration': return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <fieldset className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                            <legend className="text-sm font-semibold px-2">{t('tools.migration.sourceGroup')}</legend>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1">{t('formPlcBrand')}</label>
                                    <select value={sourceBrand} onChange={e => setSourceBrand(e.target.value)} className={commonInputClasses}>
                                        {plcBrands.filter(b => b !== 'General').map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">{t('formPlcSoftware')}</label>
                                    <select value={sourcePlatform} onChange={e => setSourcePlatform(e.target.value)} className={commonInputClasses}>
                                        {(plcSoftwareByBrand[sourceBrand] || []).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </fieldset>
                        <fieldset className="border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                            <legend className="text-sm font-semibold px-2">{t('tools.migration.targetGroup')}</legend>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1">{t('formPlcBrand')}</label>
                                    <select value={targetBrand} onChange={e => setTargetBrand(e.target.value)} className={commonInputClasses}>
                                        {plcBrands.filter(b => b !== 'General').map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1">{t('formPlcSoftware')}</label>
                                    <select value={targetPlatform} onChange={e => setTargetPlatform(e.target.value)} className={commonInputClasses}>
                                        {(plcSoftwareByBrand[targetBrand] || []).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('tools.migration.codePlaceholder')}</label>
                        <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={t('tools.migration.codePlaceholder')} rows={8} className={commonTextareaClasses} />
                    </div>
                </div>
            );
            case 'network': return (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <NetworkToolCard
                            title={t('tools.network.checksum.title')}
                            description={t('tools.network.checksum.description')}
                            isActive={activeNetworkTool === 'crc'}
                            onClick={() => handleNetworkToolChange('crc')}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                        />
                        <NetworkToolCard
                            title={t('tools.network.ascii.title')}
                            description={t('tools.network.ascii.description')}
                            isActive={activeNetworkTool === 'ascii'}
                            onClick={() => handleNetworkToolChange('ascii')}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
                        />
                         <NetworkToolCard
                            title={t('tools.network.hardware.title')}
                            description={t('tools.network.hardware.description')}
                            isActive={activeNetworkTool === 'hardware'}
                            onClick={() => handleNetworkToolChange('hardware')}
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3m0 0l3-3m-3 3v6m0-13a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                    </div>

                    <div key={activeNetworkTool} className="animate-fade-in">
                        {activeNetworkTool === 'crc' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('tools.network.checksum.frameLabel')}</label>
                                <input type="text" value={hexFrame} onChange={e => setHexFrame(e.target.value)} placeholder={t('tools.network.checksum.framePlaceholder')} className={commonTextareaClasses} />
                            </div>
                        )}

                        {activeNetworkTool === 'ascii' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('tools.network.ascii.frameLabel')}</label>
                                <textarea value={asciiFrame} onChange={e => setAsciiFrame(e.target.value)} placeholder={t('tools.network.ascii.framePlaceholder')} rows={4} className={commonTextareaClasses} />
                            </div>
                        )}
                        
                        {activeNetworkTool === 'hardware' && (
                            <div>
                                {/* FIX: Used correct translation key `protocolsLabel`. */}
                                <label className="block text-sm font-medium mb-1">{t('tools.network.hardware.protocolsLabel')}</label>
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border dark:border-gray-600 rounded-lg">
                                    {/* FIX: Mapped over `networkProtocols` instead of `networkDevices`. */}
                                    {networkProtocols.map(protocol => (
                                        <label key={protocol} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                            {/* FIX: Used `selectedProtocols` and `handleProtocolSelection`. */}
                                            <input type="checkbox" checked={selectedProtocols.includes(protocol)} onChange={() => handleProtocolSelection(protocol)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{protocol}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
            default: return null;
        }
    };
    
    const getSubmitButtonText = () => {
        if (isLoading) {
            if (activeTool === 'validator') return t('tools.logicValidator.analyzing');
            if (activeTool === 'migration') return t('tools.migration.converting');
            return t('formGeneratingButton');
        }
        if (activeTool === 'validator') return t('tools.logicValidator.analyzeButton');
        if (activeTool === 'migration') return t('tools.migration.convertButton');
        if (activeTool === 'network' && activeNetworkTool === 'crc') return t('tools.network.calculateButton');
        return t('tools.generateButton');
    };

    if (showCommissioning) {
        return <CommissioningView onBack={() => setShowCommissioning(false)} />;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('tools.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('tools.description')}</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {tools.map(tool => <ToolCard key={tool.key} {...tool} isActive={activeTool === tool.key} onClick={() => handleToolChange(tool.key)} />)}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    {renderForm()}
                    <button type="submit" disabled={isLoading} className="w-full mt-6 bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center">
                        {getSubmitButtonText()}
                    </button>
                </form>
            </div>
            
            {isLoading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            
            {crcResult && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('tools.network.checksum.resultsTitle')}</h2>
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <h3 className="font-semibold">{t('tools.network.checksum.crc16')}</h3>
                            <p className="font-mono text-indigo-600 dark:text-indigo-400">{crcResult.crc16} <span className="text-xs text-gray-500">({t('tools.network.checksum.order_lf')})</span></p>
                            <p className="font-mono text-indigo-600 dark:text-indigo-400">{crcResult.crc16swapped} <span className="text-xs text-gray-500">({t('tools.network.checksum.order_hf')})</span></p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <h3 className="font-semibold">{t('tools.network.checksum.lrc')}</h3>
                            <p className="font-mono text-indigo-600 dark:text-indigo-400">{crcResult.lrc}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <h3 className="font-semibold">{t('tools.network.checksum.checksum')}</h3>
                            <p className="font-mono text-indigo-600 dark:text-indigo-400">{crcResult.checksum}</p>
                        </div>
                    </div>
                </div>
            )}

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
            
            {activeTool === 'validator' && !isLoading && logicIssues.length === 0 && !result && !error && (
                <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-green-400 dark:border-green-600">
                    <p>{t('tools.logicValidator.noIssues')}</p>
                </div>
            )}

            {result && <ResultDisplay result={result} />}
        </div>
    );
};
