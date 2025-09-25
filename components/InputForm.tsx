// FIX: Implemented the reusable InputForm component.
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface InputFormProps {
    query: string;
    setQuery: (query: string) => void;
    handleSubmit: (event: React.FormEvent) => void;
    isLoading: boolean;
    selectedTopic: 'VFD' | 'PLC';
    setSelectedTopic: (topic: 'VFD' | 'PLC') => void;
    formType: 'solution' | 'practice';

    // Practice props
    selectedDifficulty?: string;
    setSelectedDifficulty?: (difficulty: string) => void;

    // VFD props
    selectedVfdBrand?: string;
    setSelectedVfdBrand?: (brand: string) => void;
    vfdBrands?: string[];
    selectedVfdModel?: string;
    setSelectedVfdModel?: (model: string) => void;
    vfdModelsByBrand?: { [key: string]: string[] };

    // PLC props
    selectedPlcBrand?: string;
    setSelectedPlcBrand?: (brand: string) => void;
    plcBrands?: string[];
    selectedPlcSoftware?: string;
    setSelectedPlcSoftware?: (software: string) => void;
    plcSoftwareByBrand?: string[];
    selectedPlcVersion?: string;
    setSelectedPlcVersion?: (version: string) => void;
    plcVersionsBySoftware?: string[];
    selectedPlcLanguage?: string;
    setSelectedPlcLanguage?: (language: string) => void;
    plcLanguages?: string[];
}

export const InputForm: React.FC<InputFormProps> = (props) => {
    const { t } = useTranslation();

    const commonSelectClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";
    const disabledSelectClasses = "disabled:bg-gray-200 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:opacity-50";

    const renderPracticeFields = () => (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formDifficulty')}</label>
                    <select id="difficulty" value={props.selectedDifficulty} onChange={(e) => props.setSelectedDifficulty?.(e.target.value)} disabled={props.isLoading} className={commonSelectClasses}>
                        <option value="Beginner">{t('formDifficultyBeginner')}</option>
                        <option value="Intermediate">{t('formDifficultyIntermediate')}</option>
                        <option value="Advanced">{t('formDifficultyAdvanced')}</option>
                    </select>
                </div>
            </div>
            {props.selectedTopic === 'PLC' ? renderPlcFields() : renderVfdFields()}
        </>
    );

    const renderVfdFields = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="vfd-brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formVfdBrand')}</label>
                <select id="vfd-brand" value={props.selectedVfdBrand} onChange={(e) => props.setSelectedVfdBrand?.(e.target.value)} disabled={props.isLoading} className={commonSelectClasses}>
                    {props.vfdBrands?.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="vfd-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formVfdModel')}</label>
                <select id="vfd-model" value={props.selectedVfdModel} onChange={(e) => props.setSelectedVfdModel?.(e.target.value)} disabled={props.isLoading || props.selectedVfdBrand === 'General'} className={`${commonSelectClasses} ${props.selectedVfdBrand === 'General' && disabledSelectClasses}`}>
                    <option value="General">{t('formGeneralOption')}</option>
                    {(props.vfdModelsByBrand?.[props.selectedVfdBrand || ''] || []).map(model => <option key={model} value={model}>{model}</option>)}
                </select>
            </div>
        </div>
    );
    
    const renderPlcFields = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="plc-brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formPlcBrand')}</label>
                <select id="plc-brand" value={props.selectedPlcBrand} onChange={(e) => props.setSelectedPlcBrand?.(e.target.value)} disabled={props.isLoading} className={commonSelectClasses}>
                    {props.plcBrands?.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="plc-software" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formPlcSoftware')}</label>
                <select id="plc-software" value={props.selectedPlcSoftware} onChange={(e) => props.setSelectedPlcSoftware?.(e.target.value)} disabled={props.isLoading || props.selectedPlcBrand === 'General'} className={`${commonSelectClasses} ${props.selectedPlcBrand === 'General' && disabledSelectClasses}`}>
                    <option value="General">{t('formGeneralOption')}</option>
                    {props.plcSoftwareByBrand?.map(software => <option key={software} value={software}>{software}</option>)}
                </select>
            </div>
             {props.formType === 'practice' && (
                <div className="sm:col-span-2">
                    <label htmlFor="plc-language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formPlcLanguage')}</label>
                    <select id="plc-language" value={props.selectedPlcLanguage} onChange={(e) => props.setSelectedPlcLanguage?.(e.target.value)} disabled={props.isLoading} className={commonSelectClasses}>
                        {props.plcLanguages?.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                </div>
            )}
        </div>
    );

    return (
        <form onSubmit={props.handleSubmit} className="space-y-6">
            <header className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('practices.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('practices.description')}</p>
            </header>
            <div className="space-y-4">
                <div>
                    <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('formTopic')}</label>
                    <div className="flex rounded-lg shadow-sm">
                        <button type="button" onClick={() => props.setSelectedTopic('PLC')} disabled={props.isLoading} className={`w-full py-3 px-4 text-sm font-medium focus:z-10 focus:ring-2 focus:ring-indigo-500 rounded-l-lg ${props.selectedTopic === 'PLC' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'} border border-gray-300 dark:border-gray-600 transition`}>PLC</button>
                        <button type="button" onClick={() => props.setSelectedTopic('VFD')} disabled={props.isLoading} className={`w-full py-3 px-4 text-sm font-medium focus:z-10 focus:ring-2 focus:ring-indigo-500 rounded-r-lg -ml-px ${props.selectedTopic === 'VFD' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'} border border-gray-300 dark:border-gray-600 transition`}>VFD</button>
                    </div>
                </div>

                {renderPracticeFields()}

            </div>
            
            <button type="submit" disabled={props.isLoading} className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                {props.isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('formGeneratingButton')}
                    </>
                ) : t('formGenerateButton')}
            </button>
        </form>
    );
};
