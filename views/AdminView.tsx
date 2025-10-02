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

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => {
    return (
        <button
            type="button"
            className={`${checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
        >
            <span
                aria-hidden="true"
                className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
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
    
    const handleUpdateCode = async (id: string, updates: Partial<AccessCode>) => {
        try {
            await authService.updateCode(id, updates);
            // Optimistically update the UI before refetching
            setCodes(prevCodes => prevCodes.map(c => c.id === id ? {...c, ...updates} : c));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update code.');
            // Optionally, refetch to revert optimistic update on error
            fetchCodes();
        }
    };
    
    const handleDescriptionChange = (id: string, newDescription: string) => {
        // Update local state immediately for a responsive UI
        setCodes(prev => prev.map(c => c.id === id ? { ...c, description: newDescription } : c));
    };

    const handleDescriptionBlur = (id: string, description: string) => {
        // Save to the "backend" on blur
        handleUpdateCode(id, { description });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
                    <button onClick={onLogout} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                        {t('admin.logout')}
                    </button>
                </header>
                
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.table.description')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.table.active')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.table.created')}</th>
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
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={code.description}
                                                    onChange={(e) => handleDescriptionChange(code.id, e.target.value)}
                                                    onBlur={(e) => handleDescriptionBlur(code.id, e.target.value)}
                                                    placeholder={t('admin.descriptionPlaceholder')}
                                                    className="w-full min-w-[150px] p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </td>
                                             <td className="px-6 py-4 whitespace-nowrap">
                                                <ToggleSwitch checked={code.isActive} onChange={(isChecked) => handleUpdateCode(code.id, { isActive: isChecked })} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(code.createdAt).toLocaleString()}</td>
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