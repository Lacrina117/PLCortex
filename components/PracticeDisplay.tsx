
import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ExportButton } from './ExportButton';

interface PracticeDisplayProps {
    practiceText: string;
}

export const PracticeDisplay: React.FC<PracticeDisplayProps> = ({ practiceText }) => {
    const { t } = useTranslation();
    const [showHint, setShowHint] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    const sections = useMemo(() => {
        const scenarioMatch = practiceText.match(/###\s*Scenario([\s\S]*?)(?=###|$)/i);
        const reqMatch = practiceText.match(/###\s*Requirements([\s\S]*?)(?=###|$)/i);
        const hintMatch = practiceText.match(/###\s*Hint([\s\S]*?)(?=###|$)/i);
        const solutionMatch = practiceText.match(/###\s*Solution([\s\S]*?)(?=###|$)/i);

        // Fallback for older format if simple split was used
        if (!scenarioMatch && !solutionMatch) {
             const parts = practiceText.split(/###\s+Solution/i);
             return {
                 scenario: parts[0]?.replace(/###\s+Problem/i, '').trim() || '',
                 requirements: '',
                 hint: '',
                 solution: parts[1]?.trim() || ''
             };
        }

        return {
            scenario: scenarioMatch ? scenarioMatch[1].trim() : '',
            requirements: reqMatch ? reqMatch[1].trim() : '',
            hint: hintMatch ? hintMatch[1].trim() : '',
            solution: solutionMatch ? solutionMatch[1].trim() : ''
        };
    }, [practiceText]);

    return (
        <div ref={exportRef} className="relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <ExportButton targetRef={exportRef} filename="PLCortex_Practice_Problem" />
            
            <div className="border-b-2 border-indigo-100 dark:border-gray-700 pb-4 mb-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('practice.title')}</h2>
            </div>

            <div className="space-y-8">
                {/* Scenario Section */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Scenario</h3>
                    <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert">
                        <MarkdownRenderer markdownText={sections.scenario} />
                    </div>
                </section>

                {/* Requirements Section */}
                {sections.requirements && (
                    <section className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                        <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-3">Requirements</h3>
                        <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert">
                            <MarkdownRenderer markdownText={sections.requirements} />
                        </div>
                    </section>
                )}

                {/* Hint Section */}
                {sections.hint && (
                    <section className="flex flex-col items-start">
                        {!showHint ? (
                            <button 
                                onClick={() => setShowHint(true)}
                                className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                {t('practices.hintButton')}
                            </button>
                        ) : (
                            <div className="w-full bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 animate-fade-in-up">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest">Hint</h3>
                                    <button onClick={() => setShowHint(false)} className="text-xs text-gray-400 hover:text-gray-600">&times;</button>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">{sections.hint}</p>
                            </div>
                        )}
                    </section>
                )}

                {/* Solution Section */}
                {sections.solution && (
                    <section className="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                        {!showSolution ? (
                            <button
                                onClick={() => setShowSolution(true)}
                                className="px-8 py-3 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform"
                            >
                                {t('practices.revealSolution')}
                            </button>
                        ) : (
                            <div className="text-left animate-fade-in-up">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('practice.solutionTitle')}</h3>
                                    <button 
                                        onClick={() => setShowSolution(false)}
                                        className="text-sm text-gray-500 hover:text-indigo-600"
                                    >
                                        {t('practices.hideSolution')}
                                    </button>
                                </div>
                                <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <MarkdownRenderer markdownText={sections.solution} />
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
};
