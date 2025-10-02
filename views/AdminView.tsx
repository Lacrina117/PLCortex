import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import * as authService from '../services/authService';
import { AccessCode } from '../services/authService';

interface AdminViewProps {
  onLogout: () => void;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button onClick={handleCopy} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            {copied ? t('admin.table.copied') : t('admin.table.copy')}
        </button>
    );
};

const StatusIndicator: React.FC<{ used: boolean }> = ({ used }) => {
    const { t } = useTranslation();
    const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center gap-1.5";
    const usedClasses = "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
    const notUsedClasses = "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    
    return (
        <span className={`${baseClasses} ${used ? usedClasses : notUsedClasses}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${used ? 'bg-red-500' : 'bg-green-500'}`}></span>
            {used ? t('admin.status.used') : t('admin.status.notUsed')}
        </span>
    );
};

export const AdminView: React.FC<AdminViewProps> = ({ onLogout }) => {
    const { t } = useTranslation();
    const [codes, setCodes] = useState<AccessCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCodes = useCallback(async () => {
        try {
            const fetchedCodes = await authService.getCodes();
            setCodes(fetchedCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch codes.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchCodes();
    }, [fetchCodes]);

    const handleGenerateCode = async () => {
        try {
            await authService.generateCode();
            fetchCodes(); // Refresh list
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate code.');
        }
    };

    const handleDeleteCode = async (id: string) => {
        if (window.confirm(t('admin.deleteConfirm'))) {
            try {
                await authService.deleteCode(id);
                // After successful deletion, refetch the list from the "backend"
                // to ensure the UI is in sync.
                const updatedCodes = await authService.getCodes();
                setCodes(updatedCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete code.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
                    <button onClick={onLogout} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                        {t('admin.logout')}
                    </button>
                </header>

                <div className="mb-6">
                    <button
                        onClick={handleGenerateCode}
                        className="px-6 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                    >
                       {t('admin.generateButton')}
                    </button>
                </div>
                
                {error && <p className="text-red-500 mb-4">{error}</p>}
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {isLoading ? (
                        <p className="p-8 text-center">{t('spinnerLoading')}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.table.code')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.table.status')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.table.created')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {codes.map(code => (
                                        <tr key={code.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-sm">{code.accessCode}</span>
                                                    <CopyButton textToCopy={code.accessCode} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusIndicator used={code.isUsed} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(code.createdAt).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button onClick={() => handleDeleteCode(code.id)} className="text-red-600 dark:text-red-400 hover:underline font-semibold">{t('admin.table.delete')}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};