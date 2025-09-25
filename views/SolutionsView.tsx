import React, { useState, useEffect } from 'react';
import { generateChatResponse } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { vfdBrands, vfdModelsByBrand, plcBrands, plcSoftwareByBrand, plcVersionsBySoftware } from '../constants/automationData';
import { ChatView, ChatContext } from './ChatView';

const WelcomePlaceholder: React.FC<{ onNewChat: () => void }> = ({ onNewChat }) => {
    const { t } = useTranslation();
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('chat.welcomeTitle')}</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">{t('chat.welcomeMessage')}</p>
            <button 
                onClick={onNewChat}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
                {t('chat.startWithContext')}
            </button>
        </div>
    );
};

const ContextSelectionComponent: React.FC<{ context: ChatContext; setContext: (context: ChatContext) => void; isLocked: boolean; }> = ({ context, setContext, isLocked }) => {
    const { t } = useTranslation();
    const [localPlcBrand, setLocalPlcBrand] = useState(context.plcBrand || plcBrands[1]);
    const [localPlcSoftware, setLocalPlcSoftware] = useState(context.plcSoftware || 'General');

    useEffect(() => {
        const softwareOptions = plcSoftwareByBrand[localPlcBrand] || [];
        if (!softwareOptions.includes(localPlcSoftware)) {
            setLocalPlcSoftware(softwareOptions[0] || 'General');
        }
    }, [localPlcBrand]);
    
    useEffect(() => {
        const versionOptions = plcVersionsBySoftware[localPlcSoftware] || [];
        const currentVersion = context.plcVersion || 'General';
        if (!versionOptions.includes(currentVersion)) {
            setContext({ ...context, plcVersion: versionOptions[versionOptions.length - 1] || 'General' });
        }
    }, [localPlcSoftware]);

    const handleContextChange = (updates: Partial<ChatContext>) => {
        setContext({ ...context, ...updates });
    };

    const commonSelectClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";
    const disabledSelectClasses = "disabled:bg-gray-200 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:opacity-60";
    
    return (
        <div className="space-y-3">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-bold">{t('chat.contextTitle')}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${isLocked ? 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                    {isLocked ? t('chat.contextLocked') : t('chat.contextEditable')}
                </span>
            </div>
            <select value={context.topic} onChange={e => handleContextChange({ topic: e.target.value as 'PLC' | 'VFD' })} disabled={isLocked} className={`${commonSelectClasses} ${isLocked && disabledSelectClasses}`}>
                <option value="PLC">PLC</option>
                <option value="VFD">VFD</option>
            </select>
            {context.topic === 'PLC' ? (
                <>
                    <select value={context.plcBrand} onChange={e => {
                        const newBrand = e.target.value;
                        setLocalPlcBrand(newBrand);
                        const software = (plcSoftwareByBrand[newBrand] || [])[0] || 'General';
                        handleContextChange({ plcBrand: newBrand, plcSoftware: software });
                    }} disabled={isLocked} className={`${commonSelectClasses} ${isLocked && disabledSelectClasses}`}>
                        {plcBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                     <select value={context.plcSoftware} onChange={e => {
                         const newSoftware = e.target.value;
                         setLocalPlcSoftware(newSoftware);
                         handleContextChange({ plcSoftware: newSoftware });
                     }} disabled={isLocked || context.plcBrand === 'General'} className={`${commonSelectClasses} ${(isLocked || context.plcBrand === 'General') && disabledSelectClasses}`}>
                        <option value="General">{t('formGeneralOption')}</option>
                        {(plcSoftwareByBrand[context.plcBrand || ''] || []).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                     <select value={context.plcVersion} onChange={e => handleContextChange({ plcVersion: e.target.value })} disabled={isLocked || context.plcSoftware === 'General'} className={`${commonSelectClasses} ${(isLocked || context.plcSoftware === 'General') && disabledSelectClasses}`}>
                        <option value="General">{t('formGeneralOption')}</option>
                        {(plcVersionsBySoftware[context.plcSoftware || ''] || []).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </>
            ) : (
                 <>
                    <select value={context.vfdBrand} onChange={e => handleContextChange({ vfdBrand: e.target.value, vfdModel: (vfdModelsByBrand[e.target.value] || [])[0] || 'General' })} disabled={isLocked} className={`${commonSelectClasses} ${isLocked && disabledSelectClasses}`}>
                        {vfdBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select value={context.vfdModel} onChange={e => handleContextChange({ vfdModel: e.target.value })} disabled={isLocked || context.vfdBrand === 'General'} className={`${commonSelectClasses} ${(isLocked || context.vfdBrand === 'General') && disabledSelectClasses}`}>
                        <option value="General">{t('formGeneralOption')}</option>
                        {(vfdModelsByBrand[context.vfdBrand || ''] || []).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </>
            )}
        </div>
    );
};


export const SolutionsView: React.FC = () => {
    const { language } = useLanguage();

    const initialContext: ChatContext = {
        topic: 'VFD',
        language: language,
        vfdBrand: 'Mitsubishi Electric',
        vfdModel: 'FR-D700',
        plcBrand: 'Mitsubishi Electric',
        plcSoftware: 'GX Works3',
        plcVersion: 'General',
    };

    const renderContextDisplay = (context: ChatContext) => {
         if (context.topic === 'VFD') {
            return `VFD: ${context.vfdBrand} / ${context.vfdModel || 'General'}`;
        }
        return `PLC: ${context.plcBrand} / ${context.plcSoftware || 'General'} / ${context.plcVersion || 'General'}`;
    };

    return (
        <ChatView
            storageKey="plcortex_conversations"
            WelcomePlaceholderComponent={WelcomePlaceholder}
            generateResponse={generateChatResponse}
            renderContextDisplay={renderContextDisplay}
            ContextSelectionComponent={ContextSelectionComponent}
            initialContext={initialContext}
            newChatTitleKey="chat.newChatTitle"
            historyTitleKey="chat.historyTitle"
            placeholderKey="chat.placeholder"
            headerTitleKey="chat.newChatTitle"
        />
    );
};
