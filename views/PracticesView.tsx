
import React, { useState, useEffect } from 'react';
import { PracticeDisplay } from '../components/PracticeDisplay';
import { PracticeSkeleton } from '../components/SkeletonLoader';
import { ErrorAlert } from '../components/ErrorAlert';
import { generatePractice } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { vfdBrands, vfdModelsByBrand, plcBrands, plcSoftwareByBrand, plcLanguages } from '../constants/automationData';
import { BrandLogo } from '../components/BrandLogo';

export const PracticesView: React.FC = () => {
    const [practice, setPractice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<'VFD' | 'PLC'>('PLC');

    // Practice form state
    const [selectedDifficulty, setSelectedDifficulty] = useState('Beginner');
    const [selectedVfdBrand, setSelectedVfdBrand] = useState(vfdBrands[1]); // Default to Siemens
    const [selectedVfdModel, setSelectedVfdModel] = useState('General');
    const [selectedPlcBrand, setSelectedPlcBrand] = useState(plcBrands[1]); // Default to Siemens
    const [selectedPlcSoftware, setSelectedPlcSoftware] = useState('General');
    const [selectedPlcLanguage, setSelectedPlcLanguage] = useState(plcLanguages[2]); // ST

    const { language } = useLanguage();
    const { t } = useTranslation();

    useEffect(() => {
        setSelectedVfdModel('General');
    }, [selectedVfdBrand]);

    useEffect(() => {
        setSelectedPlcSoftware('General');
    }, [selectedPlcBrand]);

    const handleSubmit = async (event?: React.FormEvent, isRandom: boolean = false) => {
        if (event) event.preventDefault();
        setIsLoading(true);
        setError(null);
        setPractice('');

        try {
            // If random, randomize parameters locally before sending
            let topic = selectedTopic;
            let difficulty = selectedDifficulty;
            let brand = selectedTopic === 'PLC' ? selectedPlcBrand : selectedVfdBrand;
            
            if (isRandom) {
                topic = Math.random() > 0.5 ? 'PLC' : 'VFD';
                const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
                difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
                
                if (topic === 'PLC') {
                    // Random PLC Brand (skip 'General')
                    const availableBrands = plcBrands.filter(b => b !== 'General');
                    brand = availableBrands[Math.floor(Math.random() * availableBrands.length)];
                } else {
                    const availableBrands = vfdBrands.filter(b => b !== 'General');
                    brand = availableBrands[Math.floor(Math.random() * availableBrands.length)];
                }
            }

            const result = await generatePractice({
                topic: topic,
                difficulty: difficulty,
                language,
                vfdBrand: topic === 'VFD' ? (isRandom ? brand : selectedVfdBrand) : undefined,
                vfdModel: 'General',
                plcBrand: topic === 'PLC' ? (isRandom ? brand : selectedPlcBrand) : undefined,
                plcSoftware: 'General',
                plcLanguage: selectedPlcLanguage,
            });
            setPractice(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const TopicCard: React.FC<{ topic: 'PLC' | 'VFD', label: string, icon: React.ReactNode }> = ({ topic, label, icon }) => (
        <button
            type="button"
            onClick={() => setSelectedTopic(topic)}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 w-full ${selectedTopic === topic ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md transform scale-105' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'}`}
        >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${selectedTopic === topic ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                {icon}
            </div>
            <span className={`font-bold text-lg ${selectedTopic === topic ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-600 dark:text-gray-300'}`}>{label}</span>
        </button>
    );

    const commonSelectClasses = "w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm shadow-sm";

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <header className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">{t('practices.title')}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t('practices.description')}</p>
            </header>

            {!practice && !isLoading && (
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    
                    {/* Topic Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <TopicCard 
                            topic="PLC" 
                            label={t('practices.plcLabel')} 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>} 
                        />
                        <TopicCard 
                            topic="VFD" 
                            label={t('practices.vfdLabel')} 
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>} 
                        />
                    </div>

                    <div className="space-y-6">
                        {/* Difficulty */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">{t('practices.selectDifficulty')}</label>
                            <div className="flex rounded-xl bg-gray-100 dark:bg-gray-700/50 p-1">
                                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setSelectedDifficulty(level)}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${selectedDifficulty === level ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    >
                                        {t(`formDifficulty${level}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Specific Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                            {selectedTopic === 'PLC' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('formPlcBrand')}</label>
                                        <select value={selectedPlcBrand} onChange={(e) => setSelectedPlcBrand(e.target.value)} className={commonSelectClasses}>
                                            {plcBrands.filter(b => b !== 'General').map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('formPlcLanguage')}</label>
                                        <select value={selectedPlcLanguage} onChange={(e) => setSelectedPlcLanguage(e.target.value)} className={commonSelectClasses}>
                                            {plcLanguages.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('formVfdBrand')}</label>
                                    <select value={selectedVfdBrand} onChange={(e) => setSelectedVfdBrand(e.target.value)} className={commonSelectClasses}>
                                        {vfdBrands.filter(b => b !== 'General').map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => handleSubmit()}
                                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                                {t('practices.generateBtn')}
                            </button>
                            <button
                                onClick={(e) => handleSubmit(e, true)}
                                className="sm:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                                {t('practices.randomChallenge')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="text-center py-12">
                    <PracticeSkeleton />
                    <p className="mt-4 text-indigo-600 font-semibold animate-pulse">{t('practices.generating')}</p>
                </div>
            )}
            
            {error && <ErrorAlert message={error} />}
            
            {practice && !isLoading && (
                <div className="animate-fade-in-up">
                    <button 
                        onClick={() => setPractice('')}
                        className="mb-4 text-sm font-semibold text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                    >
                        &larr; {t('tools.backToTools')}
                    </button>
                    <PracticeDisplay practiceText={practice} />
                </div>
            )}
        </div>
    );
};
