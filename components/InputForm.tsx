import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface InputFormProps {
    handleSubmit: (event: React.FormEvent) => void;
    isLoading: boolean;
    formType: 'practice' | 'wiring' | 'fault' | 'scan' | 'energy' | 'prover' | 'logic';

    // Shared props
    selectedTopic?: 'VFD' | 'PLC';
    setSelectedTopic?: (topic: 'VFD' | 'PLC') => void;

    // Practice props
    selectedDifficulty?: string;
    setSelectedDifficulty?: (difficulty: string) => void;
    selectedPlcLanguage?: string;
    setSelectedPlcLanguage?: (lang: string) => void;
    plcLanguages?: string[];

    // VFD props
    vfdBrands?: string[];
    selectedVfdBrand?: string;
    setSelectedVfdBrand?: (brand: string) => void;
    vfdModelsByBrand?: { [key: string]: string[] };
    selectedVfdModel?: string;
    setSelectedVfdModel?: (model: string) => void;

    // PLC props
    plcBrands?: string[];
    selectedPlcBrand?: string;
    setSelectedPlcBrand?: (brand: string) => void;
    plcSoftwareByBrand?: string[];
    selectedPlcSoftware?: string;
    setSelectedPlcSoftware?: (software: string) => void;
    
    // Dummy props to satisfy interface from PracticesView
    query?: string;
    setQuery?: (q: string) => void;
    selectedPlcVersion?: string;
    setSelectedPlcVersion?: (v: string) => void;
    plcVersionsBySoftware?: string[];
}

export const InputForm: React.FC<InputFormProps> = (props) => {
    const { t } = useTranslation();
    const commonSelectClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";
    
    return (
        <form onSubmit={props.handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('practices.title')}</h2>
            <p className="mt-2 mb-6 text-gray-500 dark:text-gray-400">{t('practices.description')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formTopic')}</label>
                    <select value={props.selectedTopic} onChange={(e) => props.setSelectedTopic?.(e.target.value as 'VFD' | 'PLC')} className={commonSelectClasses}>
                        <option value="PLC">PLC</option>
                        <option value="VFD">VFD</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formDifficulty')}</label>
                    <select value={props.selectedDifficulty} onChange={(e) => props.setSelectedDifficulty?.(e.target.value)} className={commonSelectClasses}>
                        <option value="Beginner">{t('formDifficultyBeginner')}</option>
                        <option value="Intermediate">{t('formDifficultyIntermediate')}</option>
                        <option value="Advanced">{t('formDifficultyAdvanced')}</option>
                    </select>
                </div>
            </div>

            {props.selectedTopic === 'VFD' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formVfdBrand')}</label>
                        <select value={props.selectedVfdBrand} onChange={(e) => props.setSelectedVfdBrand?.(e.target.value)} className={commonSelectClasses}>
                            {props.vfdBrands?.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formVfdModel')}</label>
                        <select value={props.selectedVfdModel} onChange={(e) => props.setSelectedVfdModel?.(e.target.value)} className={commonSelectClasses} disabled={props.selectedVfdBrand === 'General'}>
                             <option value="General">{t('formGeneralOption')}</option>
                            {(props.vfdModelsByBrand?.[props.selectedVfdBrand || ''] || []).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            )}
            {props.selectedTopic === 'PLC' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formPlcBrand')}</label>
                        <select value={props.selectedPlcBrand} onChange={(e) => props.setSelectedPlcBrand?.(e.target.value)} className={commonSelectClasses}>
                            {props.plcBrands?.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formPlcSoftware')}</label>
                        <select value={props.selectedPlcSoftware} onChange={(e) => props.setSelectedPlcSoftware?.(e.target.value)} className={commonSelectClasses} disabled={props.selectedPlcBrand === 'General'}>
                            <option value="General">{t('formGeneralOption')}</option>
                            {props.plcSoftwareByBrand?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formPlcLanguage')}</label>
                        <select value={props.selectedPlcLanguage} onChange={(e) => props.setSelectedPlcLanguage?.(e.target.value)} className={commonSelectClasses}>
                            {props.plcLanguages?.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={props.isLoading}
                className="w-full mt-4 bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {props.isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('formGeneratingButton')}
                    </>
                ) : (
                    t('formGenerateButton')
                )}
            </button>
        </form>
    );
};
