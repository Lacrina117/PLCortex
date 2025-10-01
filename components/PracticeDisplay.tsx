import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ExportButton } from './ExportButton';

interface PracticeDisplayProps {
    practiceText: string;
}

export const PracticeDisplay: React.FC<PracticeDisplayProps> = ({ practiceText }) => {
    const { t } = useTranslation();
    const [showSolution, setShowSolution] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    const { problem, solution } = useMemo(() => {
        const parts = practiceText.split(/###\s+Solution/i);
        const problemPart = parts[0]?.replace(/###\s+Problem/i, '').trim() || '';
        const solutionPart = parts[1]?.trim() || '';
        return { problem: problemPart, solution: solutionPart };
    }, [practiceText]);

    return (
        <div ref={exportRef} className="relative mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
            <ExportButton targetRef={exportRef} filename="PLCortex_Practice_Problem" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-indigo-500 pb-2 mb-4">{t('practice.title')}</h2>
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert">
                <MarkdownRenderer markdownText={problem} />
            </div>

            {solution && (
                <div className="mt-8 text-center">
                    <button
                        onClick={() => setShowSolution(!showSolution)}
                        className="px-6 py-2 bg-indigo-100 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg shadow-sm hover:bg-indigo-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {showSolution ? t('practice.hideSolution') : t('practice.showSolution')}
                    </button>
                </div>
            )}
            
            {showSolution && solution && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 animate-fade-in-up">
                     <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('practice.solutionTitle')}</h3>
                     <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert">
                        <MarkdownRenderer markdownText={solution} />
                    </div>
                </div>
            )}
        </div>
    );
};
