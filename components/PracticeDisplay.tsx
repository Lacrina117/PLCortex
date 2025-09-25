// FIX: Implemented the component for displaying practice problems.
import React, { useState, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { MarkdownRenderer } from './MarkdownRenderer';

interface PracticeDisplayProps {
  practiceText: string;
}

export const PracticeDisplay: React.FC<PracticeDisplayProps> = ({ practiceText }) => {
    const [isSolutionVisible, setIsSolutionVisible] = useState(false);
    const { t } = useTranslation();

    const { problem, solution } = useMemo(() => {
        const solutionHeader = '### Solution';
        const parts = practiceText.split(solutionHeader);
        if (parts.length > 1) {
            return {
                problem: parts[0].replace('### Problem', '').trim(),
                solution: parts.slice(1).join(solutionHeader).trim()
            };
        }
        return { problem: practiceText.trim(), solution: '' };
    }, [practiceText]);

    return (
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-indigo-500 dark:border-indigo-400 pb-2 mb-4">
                {t('practice.title')}
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert">
                <MarkdownRenderer markdownText={problem} />
            </div>

            {solution && (
                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsSolutionVisible(!isSolutionVisible)}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                    >
                        {isSolutionVisible ? t('practice.hideSolution') : t('practice.showSolution')}
                    </button>
                </div>
            )}
            
            {isSolutionVisible && solution && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{t('practice.solutionTitle')}</h3>
                    <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
                        <MarkdownRenderer markdownText={solution} />
                    </div>
                </div>
            )}
        </div>
    );
};