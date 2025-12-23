
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { structureLogEntry, generateShiftReport, LogEntry } from '../services/geminiService';
import { getUserDescription, getUserGroup, isUserLeader } from '../services/authService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultDisplay } from '../components/ResultDisplay';
import { generateAuditGradePdf } from '../utils/reportPdfGenerator';
import { useLanguage } from '../contexts/LanguageContext';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface ShiftLogItem {
    id: number;
    user_description: string;
    raw_input: string;
    structured_data: LogEntry;
    created_at: string;
}

interface SavedReport {
    id: number;
    group_name: string;
    report_content: string;
    created_at: string;
}

export const ShiftLogView: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();
    const [inputValue, setInputValue] = useState('');
    const [logs, setLogs] = useState<ShiftLogItem[]>([]);
    const [reports, setReports] = useState<SavedReport[]>([]);
    const [activeTab, setActiveTab] = useState<'logs' | 'reports'>('logs');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    
    const [currentReport, setCurrentReport] = useState<string | null>(null);
    const [currentReportDate, setCurrentReportDate] = useState<string | null>(null);
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

    const fetchReports = async () => {
        try {
            const res = await fetch(`/api/reports?groupName=${encodeURIComponent(userGroup)}`);
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (e) {
            console.error("Failed to fetch reports", e);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchReports();
    }, [userGroup]);

    const toggleRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice dictation is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language === 'es' ? 'es-MX' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(prev => prev + (prev.length ? ' ' : '') + transcript);
        };
        recognition.start();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const structuredData = await structureLogEntry(inputValue);
            const saveRes = await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupName: userGroup,
                    userDescription: userDesc,
                    rawInput: inputValue,
                    structuredData
                })
            });

            if (!saveRes.ok) throw new Error('Failed to save log');

            setInputValue('');
            fetchLogs();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        setError(null);
        setCurrentReport(null);

        try {
            const logData = logs.map(l => l.structured_data);
            if (logData.length === 0) {
                setError(t('shiftLog.noLogs'));
                setIsGeneratingReport(false);
                return;
            }

            const reportText = await generateShiftReport(logData, language); 
            await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupName: userGroup,
                    reportContent: reportText
                })
            });

            setCurrentReport(reportText);
            setCurrentReportDate(new Date().toISOString());
            fetchReports();
            setActiveTab('reports');
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsGeneratingReport(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!currentReport) return;
        generateAuditGradePdf(currentReport, {
            groupName: userGroup,
            date: currentReportDate ? new Date(currentReportDate).toLocaleString() : new Date().toLocaleString(),
            generatedBy: userDesc || 'Unknown'
        });
    };

    const getCriticalityColor = (crit: number) => {
        if (crit === 3) return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
        if (crit === 2) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('shiftLog.title')}</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{t('shiftLog.description')}</p>
                <div className="inline-block mt-4 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full border border-indigo-200 dark:border-indigo-800 uppercase">
                    {userGroup}
                </div>
            </div>

            <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-6 py-3 font-semibold text-sm transition-colors focus:outline-none -mb-px ${activeTab === 'logs' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t('shiftLog.recentLogs')}
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-6 py-3 font-semibold text-sm transition-colors focus:outline-none -mb-px ${activeTab === 'reports' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t('shiftLog.reportTitle')}
                </button>
            </div>

            {activeTab === 'logs' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSubmit}>
                            <div className="relative">
                                <textarea 
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder={t('shiftLog.inputPlaceholder')}
                                    rows={4}
                                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={toggleRecording}
                                    className={`absolute right-3 bottom-3 p-2 rounded-full ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
                                    title="Voice dictation"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSubmitting || !inputValue.trim()}
                                className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                                {isSubmitting ? t('shiftLog.processing') : t('shiftLog.submitButton')}
                            </button>
                        </form>
                    </div>

                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-xl font-bold">{t('shiftLog.recentLogs')}</h2>
                        {isLeader && (
                            <button 
                                onClick={handleGenerateReport}
                                disabled={isGeneratingReport || logs.length === 0}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {isGeneratingReport ? t('shiftLog.generatingReport') : t('shiftLog.generateReport')}
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {logs.length === 0 ? (
                            <p className="text-center text-gray-500 py-10 italic">{t('shiftLog.noLogs')}</p>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{log.user_description}</span>
                                            <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{log.structured_data.equipment}</h3>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getCriticalityColor(log.structured_data.criticality)}`}>
                                            {t('shiftLog.fields.criticality')} {log.structured_data.criticality}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-semibold">{t('shiftLog.fields.failure')}:</span> {log.structured_data.failure}</p>
                                        <p><span className="font-semibold">{t('shiftLog.fields.action')}:</span> {log.structured_data.action}</p>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-[10px] text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${log.structured_data.status === 'RESUELTO' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                                                {log.structured_data.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 space-y-2">
                            {reports.length === 0 && <p className="text-sm text-gray-500 italic">No reports found.</p>}
                            {reports.map(rep => (
                                <button 
                                    key={rep.id}
                                    onClick={() => { setCurrentReport(rep.report_content); setCurrentReportDate(rep.created_at); }}
                                    className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${currentReport === rep.report_content ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/30' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                                >
                                    <p className="font-bold">{new Date(rep.created_at).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-400">{new Date(rep.created_at).toLocaleTimeString()}</p>
                                </button>
                            ))}
                        </div>
                        <div className="md:col-span-2">
                            {currentReport ? (
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={handleDownloadPdf}
                                            className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            PDF
                                        </button>
                                    </div>
                                    <ResultDisplay result={currentReport} />
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400">
                                    Select a report to view
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {error && <ErrorAlert message={error} />}
        </div>
    );
};
