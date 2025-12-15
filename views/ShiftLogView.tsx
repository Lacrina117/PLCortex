
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { structureLogEntry, generateShiftReport, LogEntry } from '../services/geminiService';
import { getUserDescription, getUserGroup, isUserLeader } from '../services/authService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultDisplay } from '../components/ResultDisplay';

interface ShiftLogItem {
    id: number;
    user_description: string;
    raw_input: string;
    structured_data: LogEntry;
    created_at: string;
}

export const ShiftLogView: React.FC = () => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');
    const [logs, setLogs] = useState<ShiftLogItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const userGroup = getUserGroup();
    const userDesc = getUserDescription();
    const isLeader = isUserLeader();

    const fetchLogs = async () => {
        try {
            const res = await fetch(`/api/logs?groupName=${encodeURIComponent(userGroup)}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (e) {
            console.error("Failed to fetch logs", e);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [userGroup]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Structure data with Gemini
            const structuredData = await structureLogEntry(inputValue);

            // 2. Save to DB
            const res = await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupName: userGroup,
                    userDescription: userDesc,
                    rawInput: inputValue,
                    structuredData
                })
            });

            if (!res.ok) throw new Error('Failed to save log');

            setInputValue('');
            fetchLogs(); // Refresh list immediately
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        setReport(null);
        setError(null);
        try {
            const rawLogsForAI = logs.map(l => ({
                technician: l.user_description,
                timestamp: l.created_at,
                data: l.structured_data
            }));
            
            // Assuming current language from context/URL logic, or default to 'es'
            // For now hardcoding 'es' as the prompt requested specifically Spanish logic mostly
            const markdownReport = await generateShiftReport(rawLogsForAI, 'es');
            setReport(markdownReport);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('shiftLog.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('shiftLog.description')}</p>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium">
                    <span className="mr-2">🏢</span> {t('admin.table.group')}: {userGroup}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSubmit}>
                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                {t('shiftLog.inputPlaceholder')}
                            </label>
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-sm"
                                rows={5}
                                placeholder="..."
                                disabled={isSubmitting}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !inputValue.trim()}
                                className="w-full mt-4 bg-indigo-600 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                            >
                                {isSubmitting ? t('shiftLog.processing') : t('shiftLog.submitButton')}
                            </button>
                        </form>
                    </div>
                    
                    {isLeader && (
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                            <h3 className="font-bold text-lg mb-2">Manager Action</h3>
                            <p className="text-sm opacity-90 mb-4">Generate a summarized handover report based on the last 12 hours of activity.</p>
                            <button
                                onClick={handleGenerateReport}
                                disabled={isGeneratingReport}
                                className="w-full bg-white text-indigo-600 font-bold py-2 rounded-lg shadow hover:bg-gray-100 transition-colors disabled:opacity-70"
                            >
                                {isGeneratingReport ? t('shiftLog.generatingReport') : t('shiftLog.generateReport')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Feed Section */}
                <div className="lg:col-span-2 space-y-6">
                    {report && (
                        <div className="animate-fade-in">
                            <ResultDisplay result={report} />
                        </div>
                    )}
                    
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{t('shiftLog.recentLogs')}</h2>
                        
                        {logs.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-8">{t('shiftLog.noLogs')}</p>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {logs.map((log) => (
                                    <div key={log.id} className="border-l-4 border-indigo-500 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-r-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                                {log.user_description}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm italic">"{log.raw_input}"</p>
                                        
                                        {/* Structured Data Badges */}
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded">
                                                🔧 {log.structured_data.equipment}
                                            </span>
                                            <span className={`px-2 py-1 rounded font-bold ${
                                                log.structured_data.criticality === 3 ? 'bg-red-100 text-red-800' : 
                                                log.structured_data.criticality === 2 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                ⚠️ Lvl {log.structured_data.criticality}
                                            </span>
                                            <span className={`px-2 py-1 rounded ${
                                                log.structured_data.status === 'RESUELTO' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                            }`}>
                                                {log.structured_data.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {error && <ErrorAlert message={error} />}
        </div>
    );
};
