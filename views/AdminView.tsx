
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import * as authService from '../services/authService';
import { AccessCode } from '../services/authService';

interface AdminViewProps {
  onLogout: () => void;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button onClick={handleCopy} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-bold tracking-wide uppercase ml-2">
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
};

const GroupCard: React.FC<{ 
    groupName: string; 
    codes: AccessCode[]; 
    onUpdateCode: (id: string, updates: Partial<AccessCode>) => void;
    onDeleteCode: (id: string) => void;
    onGenerateCode: (groupName: string, desc: string, isLeader: boolean) => void;
}> = ({ groupName, codes, onUpdateCode, onDeleteCode, onGenerateCode }) => {
    const [newDesc, setNewDesc] = useState('');
    const [newIsLeader, setNewIsLeader] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCreate = async () => {
        if (!newDesc.trim()) return;
        setIsGenerating(true);
        await onGenerateCode(groupName, newDesc, newIsLeader);
        setNewDesc('');
        setNewIsLeader(false);
        setIsGenerating(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                    {groupName === 'Individual' ? (
                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    ) : (
                        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    )}
                    {groupName === 'Individual' ? 'Individual Subs' : groupName}
                </h3>
                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
                    {codes.length} Users
                </span>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto max-h-96 space-y-3">
                {codes.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No active codes.</p>}
                {codes.map(code => (
                    <div key={code.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-700/50 gap-2">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm tracking-wider">{code.accessCode}</span>
                                <CopyButton textToCopy={code.accessCode} />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <input 
                                    value={code.description} 
                                    onChange={(e) => onUpdateCode(code.id, { description: e.target.value })}
                                    onBlur={(e) => onUpdateCode(code.id, { description: e.target.value })}
                                    className="bg-transparent text-sm text-gray-700 dark:text-gray-300 border-none p-0 focus:ring-0 w-full"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {groupName !== 'Individual' && (
                                <button 
                                    onClick={() => onUpdateCode(code.id, { isLeader: !code.isLeader })}
                                    className={`text-xs px-2 py-1 rounded border transition-colors ${code.isLeader ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-500'}`}
                                >
                                    {code.isLeader ? 'Leader' : 'Member'}
                                </button>
                            )}
                            <button 
                                onClick={() => onDeleteCode(code.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                title="Delete"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                <div className="flex flex-col gap-2">
                    <input 
                        type="text" 
                        placeholder="User Name / Desc" 
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full text-sm p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                    <div className="flex gap-2">
                        {groupName !== 'Individual' && (
                            <label className="flex items-center gap-2 text-xs bg-white dark:bg-gray-800 px-2 rounded border border-gray-300 dark:border-gray-600 cursor-pointer select-none">
                                <input type="checkbox" checked={newIsLeader} onChange={e => setNewIsLeader(e.target.checked)} className="text-indigo-600 rounded" />
                                Make Leader
                            </label>
                        )}
                        <button 
                            onClick={handleCreate}
                            disabled={isGenerating || !newDesc}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                        >
                            {isGenerating ? '...' : `Generate ${groupName === 'Individual' ? 'Sub' : 'Code'}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AdminView: React.FC<AdminViewProps> = ({ onLogout }) => {
    const { t } = useTranslation();
    const [codes, setCodes] = useState<AccessCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // UI State for creating a new group
    const [newGroupName, setNewGroupName] = useState('');
    const [showGroupInput, setShowGroupInput] = useState(false);

    const fetchCodes = useCallback(async () => {
        try {
            const fetchedCodes = await authService.getCodes();
            setCodes(fetchedCodes);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch codes.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchCodes(); }, [fetchCodes]);

    const handleUpdateCode = async (id: string, updates: Partial<AccessCode>) => {
        try {
            await authService.updateCode(id, updates);
            setCodes(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
        } catch (e) { console.error(e); }
    };

    const handleDeleteCode = async (id: string) => {
        if (!confirm('Are you sure you want to delete this code?')) return;
        try {
            await authService.deleteCode(id);
            setCodes(prev => prev.filter(c => c.id !== id));
        } catch (e) { console.error(e); }
    };

    const handleGenerateCode = async (groupName: string, desc: string, isLeader: boolean) => {
        try {
            await authService.createCode(groupName, desc, isLeader);
            await fetchCodes();
        } catch (e) { console.error(e); }
    };

    const handleResetAll = async () => {
        if (!confirm('DANGER: This will delete ALL access codes and shift logs. Are you sure?')) return;
        try {
            await authService.resetDatabase();
            setCodes([]);
        } catch (e) { setError('Failed to reset DB'); }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        // Conceptually creating a group by adding the first leader
        await handleGenerateCode(newGroupName, `${newGroupName} Admin`, true);
        setNewGroupName('');
        setShowGroupInput(false);
    };

    // Grouping Logic
    const groupedCodes = useMemo(() => {
        const groups: { [key: string]: AccessCode[] } = {};
        // Ensure Individual group exists
        groups['Individual'] = [];
        
        codes.forEach(code => {
            const gName = code.groupName || 'Individual';
            if (!groups[gName]) groups[gName] = [];
            groups[gName].push(code);
        });
        return groups;
    }, [codes]);

    const groupNames = Object.keys(groupedCodes).filter(g => g !== 'Individual').sort();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage subscriptions, enterprises, and access.</p>
                    </div>
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <button onClick={handleResetAll} className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors">
                            Reset Database
                        </button>
                        <button onClick={onLogout} className="px-4 py-2 text-sm font-bold text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                            Logout
                        </button>
                    </div>
                </header>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">{error}</div>}

                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : (
                    <>
                        {/* Action Bar */}
                        <div className="flex flex-wrap gap-4 items-center">
                            {!showGroupInput ? (
                                <button 
                                    onClick={() => setShowGroupInput(true)}
                                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    Create Enterprise Group
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-indigo-200 animate-fade-in">
                                    <input 
                                        type="text" 
                                        placeholder="Company Name" 
                                        value={newGroupName}
                                        onChange={e => setNewGroupName(e.target.value)}
                                        className="bg-transparent border-none focus:ring-0 text-sm font-semibold px-2"
                                        autoFocus
                                    />
                                    <button onClick={handleCreateGroup} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700">Create</button>
                                    <button onClick={() => setShowGroupInput(false)} className="text-gray-400 hover:text-gray-600 px-2">&times;</button>
                                </div>
                            )}
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            {/* Individual Column */}
                            <div className="lg:col-span-1">
                                <GroupCard 
                                    groupName="Individual" 
                                    codes={groupedCodes['Individual']}
                                    onUpdateCode={handleUpdateCode}
                                    onDeleteCode={handleDeleteCode}
                                    onGenerateCode={handleGenerateCode}
                                />
                            </div>

                            {/* Enterprise Grid */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {groupNames.length === 0 && (
                                    <div className="col-span-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center text-gray-400">
                                        No Enterprise Groups created yet.
                                    </div>
                                )}
                                {groupNames.map(gName => (
                                    <GroupCard 
                                        key={gName}
                                        groupName={gName} 
                                        codes={groupedCodes[gName]}
                                        onUpdateCode={handleUpdateCode}
                                        onDeleteCode={handleDeleteCode}
                                        onGenerateCode={handleGenerateCode}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
