import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { generateLogicChatResponse } from '../services/geminiService';
import { ChatView } from './ChatView';

const WelcomePlaceholder: React.FC = () => {
    const { t } = useTranslation();
    
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6c0 1.888.864 3.58 2.182 4.682A.75.75 0 007 13.5v.358c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.358a.75.75 0 00-.818-.682A6.012 6.012 0 0016 8a6 6 0 00-6-6zM4.136 9.964A4.5 4.5 0 0110 3.5a4.5 4.5 0 015.864 6.464l-.001.001-.001.001A.75.75 0 0015.25 11h.005a.75.75 0 00.529-1.28l.001-.001A6.002 6.002 0 004 8c0 .98.225 1.89.632 2.699a.75.75 0 001.135-.636l-.001-.001-.001-.001z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('logic.welcomeTitle')}</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">{t('logic.welcomeMessage')}</p>
        </div>
    );
};

const ContextSelectionPlaceholder: React.FC = () => null; // No context selection in Logic Generator

export const LogicGeneratorView: React.FC = () => {
    
    return (
        <ChatView
            storageKey="plcortex_logic_conversations"
            WelcomePlaceholderComponent={WelcomePlaceholder}
            generateResponse={(messages, context) => generateLogicChatResponse(messages, context.language)}
            renderContextDisplay={() => "PLC Logic Design"}
            ContextSelectionComponent={ContextSelectionPlaceholder}
            initialContext={{ topic: 'PLC', language: 'en' }}
            newChatTitleKey="logic.newChatTitle"
            historyTitleKey="logic.historyTitle"
            placeholderKey="logic.placeholder"
            headerTitleKey="logic.newChatTitle"
        />
    );
};
