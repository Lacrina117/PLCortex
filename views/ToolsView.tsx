
import React, { useState, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { vfdBrands, vfdModelsByBrand, networkProtocols, plcBrands } from '../constants/automationData';
import { analyzeFaultCode, analyzeScanTime, generateEnergyEfficiencyPlan, verifyCriticalLogic, validatePlcLogic, suggestPlcLogicFix, LogicIssue, analyzeAsciiFrame, getNetworkHardwarePlan, translateLadderToText, convertPlcCode } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultDisplay } from '../components/ResultDisplay';
import { CommissioningView } from './CommissioningView';

type Tool = 'fault' | 'network' | 'validator' | 'migration' | 'scan' | 'energy' | 'prover' | 'commissioning';
type NetworkTool = 'crc' | 'ascii' | 'hardware';

interface CrcResult {
    crc16: string;
    crc16swapped: string;
    lrc: string;
    checksum: string;
}

const CodeEditor: React.FC<{ value: string, onChange: (val: string) => void, placeholder: string, height?: string }> = ({ value, onChange, placeholder, height = "h-64" }) => (
    <div className={`relative w-full ${height} bg-gray-900 rounded-lg border border-gray-700 overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-500`}>
        <div className="absolute top-0 left-0 w-8 h-full bg-gray-800 border-r border-gray-700 text-gray-500 text-xs font-mono flex flex-col items-center pt-2 select-none">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="leading-6">{i + 1}</div>)}
        </div>
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full bg-transparent text-gray-100 font-mono text-sm p-2 pl-10 resize-none focus:outline-none leading-6"
            spellCheck={false}
        />
    </div>
);

const ToolSidebarItem: React.FC<{ 
    id: Tool; 
    label: string; 
    icon: React.ReactNode; 
    isActive: boolean; 
    onClick: () => void 
}> = ({ id, label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            isActive 
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
    >
        <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-500'}`}>
            {icon}
        </div>
        <span className="font-semibold text-sm tracking-wide">{label}</span>
        {isActive && (
            <svg className="ml-auto w-4 h-4 text-white opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        )}
    </button>
);

export const ToolsView: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    
    // State
    const [activeTool, setActiveTool] = useState<Tool>('fault');
    const [activeNetworkTab, setActiveNetworkTab] = useState<NetworkTool>('crc');
    const [result, setResult] = useState<string | { text: string; groundingMetadata?: any } | null>(null);
    const [fixResult, setFixResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCommissioning, setShowCommissioning] = useState(false);

    // Form Data
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
    const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
    const [crcResult, setCrcResult] = useState<CrcResult | null>(null);
    const [faultImage, setFaultImage] = useState<string | null>(null);
    const [faultImageMime, setFaultImageMime] = useState<string | null>(null);
    
    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Migration State
    const [sourceBrand, setSourceBrand] = useState('Allen-Bradley');
    const [sourcePlatform, setSourcePlatform] = useState('Studio 5000');
    const [targetBrand, setTargetBrand] = useState('Siemens');
    const [targetPlatform, setTargetPlatform] = useState('TIA Portal');

    const commonInputClasses = "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm";

    const resetForm = () => {
        setResult(null);
        setFixResult(null);
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

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setFaultImage(reader.result as string);
            setFaultImageMime(file.type);
        };
        reader.readAsDataURL(file);
    };

    // Helper logic (CRC, Hex, etc.)
    const parseHexString = (str: string) => str.trim().split(/[\s,]+/).map(hex => parseInt(hex, 16)).filter(num => !isNaN(num));
    const calculateCrc16Modbus = (data: number[]) => {
        let crc = 0xFFFF;
        for (const byte of data) {
            crc ^= byte;
            for (let i = 0; i < 8; i++) {
                if ((crc & 0x0001) !== 0) crc = (crc >> 1) ^ 0xA001;
                else crc = crc >> 1;
            }
        }
        return crc;
    };
    const calculateLrc = (data: number[]) => (-(data.reduce((acc, byte) => acc + byte, 0)) & 0xFF);
    const calculateChecksum = (data: number[]) => data.reduce((acc, byte) => acc + byte, 0) & 0xFF;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTool !== 'network' || activeNetworkTab !== 'crc') setIsLoading(true);
        setResult(null); setFixResult(null); setError(null); setLogicIssues([]);
        
        try {
            switch (activeTool) {
                case 'fault':
                    setResult(await analyzeFaultCode({ language, vfdBrand, vfdModel, faultCode, context, imageBase64: faultImage?.split(',')[1], mimeType: faultImageMime || undefined }));
                    break;
                case 'scan':
                    setResult(await analyzeScanTime({ language, code }));
                    break;
                case 'energy':
                    setResult(await generateEnergyEfficiencyPlan({ language, applicationType: appType, loadProfile }));
                    break;
                case 'prover':
                    setResult(await verifyCriticalLogic({ language, code, rules }));
                    break;
                case 'validator':
                    const isAscii = code.includes('|--') || (code.includes('|') && code.split('\n').length > 1);
                    let logic = code;
                    if (isAscii) logic = (await translateLadderToText({ language, code })).trim();
                    setProcessedCode(logic);
                    const valRes = await validatePlcLogic({ language, code: logic });
                    try {
                        const match = valRes.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
                        setLogicIssues(JSON.parse(match ? (match[1] || match[2]) : valRes));
                    } catch { throw new Error("Failed to parse validation results."); }
                    break;
                case 'migration':
                    setResult(await convertPlcCode({ language, sourceBrand, sourcePlatform, targetBrand, targetPlatform, code }));
                    break;
                case 'network':
                    if (activeNetworkTab === 'crc') {
                        const bytes = parseHexString(hexFrame);
                        if(bytes.length === 0) { setError("Invalid hex frame."); return; }
                        const crc = calculateCrc16Modbus(bytes);
                        setCrcResult({
                            crc16: `${(crc & 0xFF).toString(16).toUpperCase().padStart(2, '0')} ${(crc >> 8).toString(16).toUpperCase().padStart(2, '0')}`,
                            crc16swapped: `${(crc >> 8).toString(16).toUpperCase().padStart(2, '0')} ${(crc & 0xFF).toString(16).toUpperCase().padStart(2, '0')}`,
                            lrc: calculateLrc(bytes).toString(16).toUpperCase().padStart(2, '0'),
                            checksum: calculateChecksum(bytes).toString(16).toUpperCase().padStart(2, '0'),
                        });
                    } else if (activeNetworkTab === 'ascii') {
                        setResult(await analyzeAsciiFrame({ language, frame: asciiFrame }));
                    } else {
                        if (selectedProtocols.length < 2) { setError("Select at least 2 protocols."); return; }
                        setResult(await getNetworkHardwarePlan({ language, protocols: selectedProtocols }));
                    }
                    break;
            }
        } catch (err) { setError(err instanceof Error ? err.message : t('error.unexpected')); } finally { setIsLoading(false); }
    };

    if (showCommissioning) return <CommissioningView onBack={() => setShowCommissioning(false)} />;

    return (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
            {/* Navigation Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-2">
                <div className="lg:sticky lg:top-24 space-y-2">
                    <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Diagnostic</h3>
                    <ToolSidebarItem id="fault" label={t('tools.faultDiagnosis.title')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} isActive={activeTool === 'fault'} onClick={() => handleToolChange('fault')} />
                    <ToolSidebarItem id="network" label={t('tools.network.title')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} isActive={activeTool === 'network'} onClick={() => handleToolChange('network')} />
                    
                    <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-2">Code Engineering</h3>
                    <ToolSidebarItem id="validator" label={t('tools.logicValidator.title')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} isActive={activeTool === 'validator'} onClick={() => handleToolChange('validator')} />
                    <ToolSidebarItem id="migration" label={t('tools.migration.title')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>} isActive={activeTool === 'migration'} onClick={() => handleToolChange('migration')} />
                    <ToolSidebarItem id="prover" label={t('tools.codeProver.title')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} isActive={activeTool === 'prover'} onClick={() => handleToolChange('prover')} />
                    
                    <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-2">Optimization</h3>
                    <ToolSidebarItem id="scan" label={t('tools.scanTime.title')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} isActive={activeTool === 'scan'} onClick={() => handleToolChange('scan')} />
                    <ToolSidebarItem id="energy" label={t('tools.energy.title')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} isActive={activeTool === 'energy'} onClick={() => handleToolChange('energy')} />
                    
                    <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mt-6 mb-2">Hardware</h3>
                    <ToolSidebarItem id="commissioning" label={t('header.commissioning')} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} isActive={false} onClick={() => handleToolChange('commissioning')} />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-fade-in">
                {/* Tool Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        {activeTool === 'network' ? t('tools.network.title') : 
                         activeTool === 'validator' ? t('tools.logicValidator.title') :
                         activeTool === 'migration' ? t('tools.migration.title') :
                         activeTool === 'prover' ? t('tools.codeProver.title') :
                         activeTool === 'scan' ? t('tools.scanTime.title') :
                         activeTool === 'energy' ? t('tools.energy.title') :
                         t('tools.faultDiagnosis.title')}
                    </h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                         {activeTool === 'network' ? t('tools.network.description') : 
                         activeTool === 'validator' ? t('tools.logicValidator.description') :
                         activeTool === 'migration' ? t('tools.migration.description') :
                         activeTool === 'prover' ? t('tools.codeProver.description') :
                         activeTool === 'scan' ? t('tools.scanTime.description') :
                         activeTool === 'energy' ? t('tools.energy.description') :
                         t('tools.faultDiagnosis.description')}
                    </p>
                </div>

                <div className="p-6 lg:p-8 space-y-6">
                    {activeTool === 'fault' && (
                        <div className="grid grid-cols-1 gap-6 animate-fade-in-up">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tools.faultDiagnosis.vfdBrand')}</label>
                                    <select value={vfdBrand} onChange={e => { setVfdBrand(e.target.value); setVfdModel('General'); }} className={commonInputClasses}>
                                        {vfdBrands.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tools.faultDiagnosis.vfdModel')}</label>
                                    <select value={vfdModel} onChange={e => setVfdModel(e.target.value)} className={commonInputClasses} disabled={!vfdBrand || vfdBrand === 'General'}>
                                        <option value="General">{t('formGeneralOption')}</option>
                                        {(vfdModelsByBrand[vfdBrand] || []).map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                                <label className="block text-xs font-bold text-red-500 uppercase tracking-widest mb-2">{t('tools.faultDiagnosis.faultCode')}</label>
                                <input type="text" value={faultCode} onChange={e => setFaultCode(e.target.value)} placeholder="F0001, E.OC1, etc." className="w-full text-2xl font-mono font-bold bg-transparent border-none focus:ring-0 text-red-600 dark:text-red-400 placeholder-red-300" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tools.faultDiagnosis.context')}</label>
                                    <textarea value={context} onChange={e => setContext(e.target.value)} placeholder={t('tools.faultDiagnosis.contextPlaceholder')} rows={4} className={commonInputClasses} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Visual Evidence</label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group overflow-hidden"
                                    >
                                        {faultImage ? (
                                            <>
                                                <img src={faultImage} alt="Context" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="bg-black/50 text-white px-2 py-1 rounded text-xs">Change Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="text-xs text-gray-500">Upload Photo</span>
                                            </>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                    </div>
                                    {faultImage && (
                                        <button onClick={() => { setFaultImage(null); setFaultImageMime(null); }} className="mt-2 text-xs text-red-500 hover:underline w-full text-center">Remove Image</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTool === 'network' && (
                        <div className="space-y-6">
                            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                                {(['crc', 'ascii', 'hardware'] as NetworkTool[]).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => { setActiveNetworkTab(tab); resetForm(); }}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeNetworkTab === tab ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                                    >
                                        {t(`tools.network.${tab}.title`)}
                                    </button>
                                ))}
                            </div>

                            <div className="animate-fade-in-up">
                                {activeNetworkTab === 'crc' && (
                                    <div className="space-y-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">{t('tools.network.checksum.frameLabel')}</label>
                                        <input type="text" value={hexFrame} onChange={e => setHexFrame(e.target.value)} placeholder={t('tools.network.checksum.framePlaceholder')} className={`${commonInputClasses} font-mono`} />
                                        {crcResult && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                                <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center">
                                                    <div className="text-xs text-gray-500 uppercase mb-1">CRC-16 (Modbus)</div>
                                                    <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{crcResult.crc16}</div>
                                                </div>
                                                <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center">
                                                    <div className="text-xs text-gray-500 uppercase mb-1">CRC-16 (Swapped)</div>
                                                    <div className="font-mono font-bold text-gray-800 dark:text-gray-200">{crcResult.crc16swapped}</div>
                                                </div>
                                                <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center">
                                                    <div className="text-xs text-gray-500 uppercase mb-1">LRC</div>
                                                    <div className="font-mono font-bold text-gray-800 dark:text-gray-200">{crcResult.lrc}</div>
                                                </div>
                                                <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center">
                                                    <div className="text-xs text-gray-500 uppercase mb-1">Checksum (8-bit)</div>
                                                    <div className="font-mono font-bold text-gray-800 dark:text-gray-200">{crcResult.checksum}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeNetworkTab === 'ascii' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tools.network.ascii.frameLabel')}</label>
                                        <CodeEditor value={asciiFrame} onChange={setAsciiFrame} placeholder={t('tools.network.ascii.framePlaceholder')} height="h-40" />
                                    </div>
                                )}
                                {activeNetworkTab === 'hardware' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tools.network.protocolsLabel')}</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {networkProtocols.map(p => (
                                                <label key={p} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedProtocols.includes(p) ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}>
                                                    <input type="checkbox" checked={selectedProtocols.includes(p)} onChange={() => setSelectedProtocols(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} className="text-indigo-600 rounded focus:ring-indigo-500" />
                                                    <span className="text-sm font-medium">{p}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {(activeTool === 'validator' || activeTool === 'scan' || activeTool === 'prover') && (
                        <div className="space-y-6 animate-fade-in-up">
                            {activeTool === 'prover' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tools.codeProver.rulesLabel')}</label>
                                    <input type="text" value={rules} onChange={e => setRules(e.target.value)} placeholder={t('tools.codeProver.rulesPlaceholder')} className={commonInputClasses} />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tools.logicValidator.codeLabel')}</label>
                                <CodeEditor value={code} onChange={setCode} placeholder={t('tools.logicValidator.codePlaceholder')} height="h-96" />
                            </div>
                        </div>
                    )}

                    {activeTool === 'energy' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tools.energy.appType')}</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(t('tools.energy.appTypes')).map(([key, value]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setAppType(key)}
                                            className={`p-3 rounded-xl border text-center transition-all ${appType === key ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {value as string}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tools.energy.loadProfile')}</label>
                                <textarea value={loadProfile} onChange={e => setLoadProfile(e.target.value)} placeholder={t('tools.energy.loadProfilePlaceholder')} rows={4} className={commonInputClasses} />
                            </div>
                        </div>
                    )}

                    {activeTool === 'migration' && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tools.migration.sourceGroup')}</label>
                                    <select value={sourceBrand} onChange={e => setSourceBrand(e.target.value)} className={commonInputClasses}>
                                        {plcBrands.filter(b => b !== 'General').map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('tools.migration.targetGroup')}</label>
                                    <select value={targetBrand} onChange={e => setTargetBrand(e.target.value)} className={commonInputClasses}>
                                        {plcBrands.filter(b => b !== 'General').map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                            <CodeEditor value={code} onChange={setCode} placeholder={t('tools.migration.codePlaceholder')} height="h-80" />
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-4">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <><svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
                            ) : (
                                activeTool === 'network' && activeNetworkTab === 'crc' ? t('tools.network.calculateButton') :
                                activeTool === 'migration' ? t('tools.migration.convertButton') :
                                activeTool === 'validator' ? t('tools.logicValidator.analyzeButton') :
                                t('tools.generateButton')
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                {error && <div className="px-6 pb-6"><ErrorAlert message={error} /></div>}
                {(result || (logicIssues.length > 0 && activeTool === 'validator') || fixResult) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 px-6 py-8">
                        {activeTool === 'validator' && logicIssues.length > 0 ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-lg text-red-600 dark:text-red-400 mb-4">{t('tools.logicValidator.analysisResults')}</h3>
                                    <div className="space-y-3">
                                        {logicIssues.map((issue, i) => (
                                            <div key={i} className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-red-500 shadow-sm">
                                                <span className="font-mono text-xs font-bold text-gray-500 pt-1">Ln {issue.line}</span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{issue.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={async () => { setIsLoading(true); try { setFixResult(await suggestPlcLogicFix({ language, code: processedCode, issues: logicIssues })); } catch (e) { setError("Failed to suggest fix."); } finally { setIsLoading(false); } }} 
                                        className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg font-semibold text-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/70 transition-colors flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                                        {t('tools.logicValidator.suggestButton')}
                                    </button>
                                </div>
                                
                                {fixResult && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 animate-fade-in-up">
                                        <h3 className="font-bold text-lg text-green-600 dark:text-green-400 mb-4">Corrected Logic</h3>
                                        <ResultDisplay result={fixResult} />
                                    </div>
                                )}
                            </div>
                        ) : result ? (
                            <ResultDisplay result={result} />
                        ) : null}
                    </div>
                )}
            </main>
        </div>
    );
};
