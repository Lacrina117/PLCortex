
import React, { useState, useEffect } from 'react';
import { generateChatResponse } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { vfdBrands, vfdModelsByBrand, plcBrands, plcSoftwareByBrand, plcVersionsBySoftware } from '../constants/automationData';
import { ChatView, ChatContext } from './ChatView';
import { BrandLogo } from '../components/BrandLogo';

const WelcomePlaceholder: React.FC<{ onNewChat?: () => void, context: ChatContext }> = ({ onNewChat, context }) => {
    const { t } = useTranslation();
    const brandName = context.plcBrand !== 'General' ? context.plcBrand : (context.vfdBrand !== 'General' ? context.vfdBrand : 'General');
    const topicName = context.topic;

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-fade-in">
             <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                <BrandLogo brand={brandName} topic={topicName} className="h-12 w-12" />
             </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">{t('chat.welcomeTitle')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
                {t('chat.welcomeMessage', { brand: brandName === 'General' ? '' : brandName, topic: topicName })}
            </p>
        </div>
    );
};

const ContextSelectionComponent: React.FC<{ context: ChatContext; setContext: (context: ChatContext) => void; isLocked: boolean; }> = ({ context, setContext, isLocked }) => {
    const { t } = useTranslation();

    const handleContextChange = (updates: Partial<ChatContext>) => {
        setContext({ ...context, ...updates });
    };

    const handlePlcBrandChange = (newBrand: string) => {
        const softwareOptions = plcSoftwareByBrand[newBrand] || [];
        const newSoftware = softwareOptions[0] || 'General';
        const versionOptions = plcVersionsBySoftware[newSoftware] || [];
        const newVersion = versionOptions[versionOptions.length - 1] || 'General';
        handleContextChange({
            plcBrand: newBrand,
            plcSoftware: newSoftware,
            plcVersion: newVersion
        });
    };

    const handlePlcSoftwareChange = (newSoftware: string) => {
        const versionOptions = plcVersionsBySoftware[newSoftware] || [];
        const newVersion = versionOptions[versionOptions.length - 1] || 'General';
        handleContextChange({
            plcSoftware: newSoftware,
            plcVersion: newVersion
        });
    };
    
    const handleVfdBrandChange = (newBrand: string) => {
        const modelOptions = vfdModelsByBrand[newBrand] || [];
        const newModel = modelOptions[0] || 'General';
        handleContextChange({
            vfdBrand: newBrand,
            vfdModel: newModel
        });
    };

    const commonSelectClasses = "w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm shadow-sm";
    const disabledSelectClasses = "disabled:bg-gray-100 dark:disabled:bg-gray-900/50 disabled:cursor-not-allowed disabled:opacity-70 disabled:border-transparent";
    
    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('chat.contextTitle')}</h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${isLocked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                    {isLocked ? t('chat.contextLocked') : t('chat.contextEditable')}
                </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Topic</label>
                    <select value={context.topic} onChange={e => handleContextChange({ topic: e.target.value as 'PLC' | 'VFD' })} disabled={isLocked} className={`${commonSelectClasses} ${isLocked && disabledSelectClasses}`}>
                        <option value="PLC">PLC</option>
                        <option value="VFD">VFD</option>
                    </select>
                </div>

                {context.topic === 'PLC' ? (
                    <>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('formPlcBrand')}</label>
                            <select value={context.plcBrand} onChange={e => handlePlcBrandChange(e.target.value)} disabled={isLocked} className={`${commonSelectClasses} ${isLocked && disabledSelectClasses}`}>
                                {plcBrands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('formPlcSoftware')}</label>
                            <select value={context.plcSoftware} onChange={e => handlePlcSoftwareChange(e.target.value)} disabled={isLocked || context.plcBrand === 'General'} className={`${commonSelectClasses} ${(isLocked || context.plcBrand === 'General') && disabledSelectClasses}`}>
                                <option value="General">{t('formGeneralOption')}</option>
                                {(plcSoftwareByBrand[context.plcBrand || ''] || []).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Version</label>
                            <select value={context.plcVersion} onChange={e => handleContextChange({ plcVersion: e.target.value })} disabled={isLocked || context.plcSoftware === 'General'} className={`${commonSelectClasses} ${(isLocked || context.plcSoftware === 'General') && disabledSelectClasses}`}>
                                <option value="General">{t('formGeneralOption')}</option>
                                {(plcVersionsBySoftware[context.plcSoftware || ''] || []).map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </>
                ) : (
                     <>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('formVfdBrand')}</label>
                            <select value={context.vfdBrand} onChange={e => handleVfdBrandChange(e.target.value)} disabled={isLocked} className={`${commonSelectClasses} ${isLocked && disabledSelectClasses}`}>
                                {vfdBrands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">{t('formVfdModel')}</label>
                            <select value={context.vfdModel} onChange={e => handleContextChange({ vfdModel: e.target.value })} disabled={isLocked || context.vfdBrand === 'General'} className={`${commonSelectClasses} ${(isLocked || context.vfdBrand === 'General') && disabledSelectClasses}`}>
                                <option value="General">{t('formGeneralOption')}</option>
                                {(vfdModelsByBrand[context.vfdBrand || ''] || []).map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


export const SolutionsView: React.FC = () => {
    const { language } = useLanguage();

    const initialContext: ChatContext = {
        topic: 'PLC',
        language: language,
        vfdBrand: 'General',
        vfdModel: 'General',
        plcBrand: 'General',
        plcSoftware: 'General',
        plcVersion: 'General',
    };

    const renderContextDisplay = (context: ChatContext) => {
         if (context.topic === 'VFD') {
            if (context.vfdBrand === 'General') return 'VFD: General';
            return `VFD: ${context.vfdBrand} / ${context.vfdModel || 'General'}`;
        }
        if (context.plcBrand === 'General') return 'PLC: General';
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
