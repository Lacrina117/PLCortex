// FIX: Implemented the ResultDisplay component to show AI-generated content.
import React, { useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ExportButton } from './ExportButton';

interface ResultDisplayProps {
  resultText: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ resultText }) => {
    const { t } = useTranslation();
    const exportRef = useRef<HTMLDivElement>(null);

    const isVerified = resultText.trim().startsWith('✅');
    const isCounterexample = resultText.trim().startsWith('❌');

    const wrapperClass = `relative mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border animate-fade-in ${
        isVerified 
        ? 'border-green-500 dark:border-green-600' 
        : isCounterexample 
        ? 'border-red-500 dark:border-red-600' 
        : 'border-gray-200 dark:border-gray-700'
    }`;
    
    const headerClass = `text-2xl font-bold border-b-2 pb-2 mb-4 ${
        isVerified
        ? 'text-green-700 dark:text-green-400 border-green-500/50 dark:border-green-600/50'
        : isCounterexample
        ? 'text-red-700 dark:text-red-400 border-red-500/50 dark:border-red-600/50'
        : 'text-gray-800 dark:text-gray-200 border-indigo-500 dark:border-indigo-400'
    }`;

    return (
        <div ref={exportRef} className={wrapperClass}>
            <ExportButton targetRef={exportRef} filename="PLCortex_Analysis_Result" />
            <h2 className={headerClass}>
                {isVerified ? 'Verification Complete' : isCounterexample ? 'Verification Failed' : t('result.title')}
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert">
                <MarkdownRenderer markdownText={resultText} />
            </div>
        </div>
    );
};