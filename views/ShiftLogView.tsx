
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { structureLogEntry, generateShiftReport, LogEntry } from '../services/geminiService';
import { getUserDescription, getUserGroup, isUserLeader } from '../services/authService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultDisplay } from '../components/ResultDisplay';
import { generateAuditGradePdf } from '../utils/reportPdfGenerator';
import { useLanguage } from '../contexts/LanguageContext';

// Extend window interface for SpeechRecognition
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
    
    // `currentReport` is for the immediate result of generation or a selected historical report
    const [currentReport, setCurrentReport] = useState<string | null>(null);
    const [currentReportDate, setCurrentReportDate] = useState<string | null>(null); // Track date for PDF
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
        const interval = setInterval(() => {
            if (activeTab === 'logs') fetchLogs();
            if (activeTab === 'reports') fetchReports();
        }, 30000); 
        return () => clearInterval(interval);
    }, [userGroup, activeTab]);

    // --- Vital Signs Logic ---
    const dashboardMetrics = useMemo(() => {
        if (logs.length === 0) return null;

        // 1. Health Index
        const criticalCount = logs.filter(l => l.structured_data.criticality === 3).length;
        // Simple penalty formula: Start at 100, lose 15 points per critical event
        const healthScore = Math.max(0, 100 - (criticalCount * 15));

        // 2. Top Problematic Equipment
        const equipmentCounts: Record<string, number> = {};
        logs.forEach(l => {
            const eq = l.structured_data.equipment;
            equipmentCounts[eq] = (equipmentCounts[eq] || 0) + 1;
        });
        const topEquipment = Object.entries(equipmentCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        // 3. Efficiency (Resolved vs Pending)
        const resolved = logs.filter(l => l.structured_data.status === 'RESUELTO').length;
        const pending = logs.filter(l => l.structured_data.status === 'PENDIENTE').length;
        const total = resolved + pending;
        const resolvedPercent = total === 0 ? 100 : Math.round((resolved / total) * 100);

        return { healthScore, topEquipment, resolved, pending, resolvedPercent };
    }, [logs]);

    // --- Voice Dictation Logic ---
    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            // Stop logic is handled by 'end' event usually, but we can force it if we hold the instance
            // Ideally, we just let the browser handle the single sentence or manual toggle
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice dictation is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = language === 'es' ? 'es-MX' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(prev => {
                const spacer = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                return prev + spacer + transcript;
            });
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
        };

        recognition.start();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Structure data with Gemini
            const structuredData = await structureLogEntry(inputValue);

            // 2. Save to DB
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
            await fetchLogs();
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
            // 1. Get structured data from logs
            const logData = logs.map(l => l.structured_data);
            
            if (logData.length === 0) {
                setError(t('shiftLog.noLogs'));
                setIsGeneratingReport(false);
                return;
            }

            // 2. Generate Report
            const reportText = await generateShiftReport(logData, language); 
            
            // 3. Save Report to DB
            const saveRes = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupName: userGroup,
                    reportContent: reportText
                })
            });

            if (!saveRes.ok) console.error('Failed to save report to DB');

            setCurrentReport(reportText);
            setCurrentReportDate(new Date().toISOString());
            await fetchReports(); 
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
        if (crit === 3) return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
        if (crit === 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200">{t('shiftLog.title')}</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{t('shiftLog.description')}</p>
                <div className="inline-block mt-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    {userGroup}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => { setActiveTab('logs'); setCurrentReport(null); }}
                    className={`px-6 py-3 font-semibold text-sm transition-colors focus:outline-none border-b-2 ${activeTab === 'logs' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Live Events
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-6 py-3 font-semibold text-sm transition-colors focus:outline-none border-b-2 ${activeTab === 'reports' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Report History
                </button>
            </div>

            {activeTab === 'logs' && (
                <div className="animate-fade-in">
                    
                    {/* VITAL SIGNS DASHBOARD */}
                    {dashboardMetrics && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Card 1: Health Score */}
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Shift Health Index</span>
                                <div className="mt-2 flex items-baseline">
                                    <span className={`text-5xl font-extrabold ${
                                        dashboardMetrics.healthScore === 100 ? 'text-green-500' : 
                                        dashboardMetrics.healthScore >= 80 ? 'text-yellow-500' : 'text-red-500'
                                    }`}>
                                        {dashboardMetrics.healthScore}%
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400 mt-1">Based on critical faults</span>
                            </div>

                            {/* Card 2: Top Equipment */}
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-3">Top Problematic Assets</span>
                                <ul className="space-y-2">
                                    {dashboardMetrics.topEquipment.map(([name, count], idx) => (
                                        <li key={name} className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{idx + 1}</span>
                                                {name}
                                            </span>
                                            <span className="font-bold text-gray-600 dark:text-gray-400">{count} events</span>
                                        </li>
                                    ))}
                                    {dashboardMetrics.topEquipment.length === 0 && <li className="text-sm text-gray-400 italic">No equipment data yet.</li>}
                                </ul>
                            </div>

                            {/* Card 3: Efficiency Chart */}
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col items-center">
                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Resolution Efficiency</span>
                                <div className="flex items-center gap-6">
                                    {/* CSS Conic Gradient Pie Chart */}
                                    <div 
                                        className="w-20 h-20 rounded-full relative shadow-inner"
                                        style={{ background: `conic-gradient(#10B981 0% ${dashboardMetrics.resolvedPercent}%, #F59E0B ${dashboardMetrics.resolvedPercent}% 100%)` }}
                                    >
                                        <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold">{dashboardMetrics.resolvedPercent}%</span>
                                        </div>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-gray-600 dark:text-gray-300">Resolved ({dashboardMetrics.resolved})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <span className="text-gray-600 dark:text-gray-300">Pending ({dashboardMetrics.pending})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Input Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                                <form onSubmit={handleSubmit}>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">New Event</label>
                                    <div className="relative mb-4">
                                        <textarea 
                                            value={inputValue}
                                            onChange={e => setInputValue(e.target.value)}
                                            placeholder={t('shiftLog.inputPlaceholder')}
                                            rows={6}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-sm pb-10"
                                        />
                                        {/* Mic Button */}
                                        <button
                                            type="button"
                                            onClick={toggleRecording}
                                            className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-300 shadow-sm ${
                                                isRecording 
                                                ? 'bg-red-500 text-white animate-pulse' 
                                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                                            }`}
                                            title="Voice Dictation"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                        </button>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || !inputValue.trim()}
                                        className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                                    >
                                        {isSubmitting ? t('shiftLog.processing') : t('shiftLog.submitButton')}
                                    </button>
                                </form>
                            </div>

                            {/* Generate Report Button (Leaders Only) */}
                            {isLeader && (
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                                    <h3 className="font-bold text-lg mb-2">{t('shiftLog.reportTitle')}</h3>
                                    <p className="text-sm opacity-90 mb-4">Generate and broadcast the shift handover report based on current events.</p>
                                    <button 
                                        onClick={handleGenerateReport}
                                        disabled={isGeneratingReport || logs.length === 0}
                                        className="w-full py-2 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                                    >
                                        {isGeneratingReport ? t('shiftLog.generatingReport') : t('shiftLog.generateReport')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Feed Column */}
                        <div className="lg:col-span-2 space-y-4">
                            <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">{t('shiftLog.recentLogs')}</h3>
                            
                            {logs.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                    {t('shiftLog.noLogs')}
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                    {logs.map(log => (
                                        <div key={log.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border-l-4 border-indigo-500 animate-fade-in-up">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    <span className="mx-2 text-gray-300">|</span>
                                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{log.user_description}</span>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${getCriticalityColor(log.structured_data.criticality)}`}>
                                                    Crit: {log.structured_data.criticality}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-2">
                                                <div>
                                                    <span className="text-xs text-gray-400 uppercase">{t('shiftLog.fields.equipment')}</span>
                                                    <p className="font-bold text-gray-800 dark:text-gray-200">{log.structured_data.equipment}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-400 uppercase">{t('shiftLog.fields.status')}</span>
                                                    <p className={`font-bold ${log.structured_data.status === 'PENDIENTE' ? 'text-orange-500' : 'text-green-600'}`}>
                                                        {log.structured_data.status}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-2">
                                                <span className="text-xs text-gray-400 uppercase">{t('shiftLog.fields.failure')}</span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{log.structured_data.failure}</p>
                                            </div>
                                            
                                            <div>
                                                <span className="text-xs text-gray-400 uppercase">{t('shiftLog.fields.action')}</span>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{log.structured_data.action}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    {/* Report List */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="font-bold">Generated Reports</h3>
                        </div>
                        <div className="overflow-y-auto max-h-[600px]">
                            {reports.length === 0 && <p className="p-4 text-sm text-gray-500 text-center">No reports found.</p>}
                            {reports.map(rep => (
                                <button 
                                    key={rep.id}
                                    onClick={() => { setCurrentReport(rep.report_content); setCurrentReportDate(rep.created_at); }}
                                    className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${currentReport === rep.report_content ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-l-indigo-500' : ''}`}
                                >
                                    <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                        {new Date(rep.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(rep.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="lg:col-span-2">
                        {currentReport ? (
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <button 
                                        onClick={handleDownloadPdf}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                        </svg>
                                        Download Official PDF
                                    </button>
                                </div>
                                <ResultDisplay result={currentReport} />
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10">
                                Select a report to view details.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <ErrorAlert message={error} />}
        </div>
    );
};
