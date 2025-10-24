import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import { generateSensorRecommendation } from '../../services/geminiService';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorAlert } from '../ErrorAlert';
import { ResultDisplay } from '../ResultDisplay';

const initialFormData = {
    processVariable: 'level',
    mediumType: 'liquid',
    liquidType: 'Water',
    liquidProperties: { corrosive: false, abrasive: false, viscous: false, foaming: false, cip: false },
    solidType: 'powder',
    solidProperties: { suspendedDust: false, abrasive: false },
    angleRepo: '',
    tempMin: '-20',
    tempMax: '150',
    pressureMin: '-1',
    pressureMax: '10',
    location: { indoor: true, outdoor: false, vibration: false, washdown: false },
    installationRegion: 'México',
    thermocoupleStandard: 'autodetect',
    areaClassification: 'general_safe',
    signalTypes: { '4-20mA': true, '4-20mA_HART': false, '0-10V': false, PNP_NPN: false, Relay: false, 'IO-Link': false, Profinet_EtherNetIP: false },
    priorityCost: 50,
    priorityPrecision: 50,
    priorityRobustness: 50,
};

const Checkbox: React.FC<{ label: string, checked: boolean, onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md cursor-pointer">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </label>
);

const PrioritySlider: React.FC<{ label: string, value: number, onChange: (value: number) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium mb-1 flex justify-between">
            <span>{label}</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{value}%</span>
        </label>
        <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={value}
            onChange={e => onChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
    </div>
);

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="group relative flex items-center justify-center ml-2">
        <span className="h-4 w-4 flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold cursor-help">?</span>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            {text}
        </span>
    </div>
);


export const SensorSelectionCalculator: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();

    const [formData, setFormData] = useState(initialFormData);
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFormChange = (field: keyof typeof initialFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCheckboxGroupChange = (group: keyof typeof initialFormData, key: string, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            [group]: {
                // @ts-ignore
                ...prev[group],
                [key]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);
        setError(null);
        setResult('');

        const getCheckedItems = (obj: Record<string, boolean>, translationKey: string) => 
            Object.entries(obj)
            .filter(([, val]) => val)
            .map(([key]) => t(`calculator.sensorSelection.${translationKey}.${key}`))
            .join(', ') || 'None';

        let details = `
- Variable de Proceso: ${t(`calculator.sensorSelection.vars.${formData.processVariable}`)}
- Tipo de Medio: ${t(`calculator.sensorSelection.types.${formData.mediumType}`)}
${formData.mediumType === 'liquid' ? `
- Tipo de Líquido: ${formData.liquidType}
- Propiedades del Líquido: ${getCheckedItems(formData.liquidProperties, 'props')}
` : `
- Tipo de Sólido: ${t(`calculator.sensorSelection.solidTypes.${formData.solidType}`)}
- Propiedades del Sólido: ${getCheckedItems(formData.solidProperties, 'solidProps')}
- Ángulo de Reposo: ${formData.angleRepo || 'No especificado'}
`}
- Temperatura de Operación: ${formData.tempMin} a ${formData.tempMax} °C
- Presión de Operación: ${formData.pressureMin} a ${formData.pressureMax} bar
- Ubicación: ${getCheckedItems(formData.location, 'locs')}
- País/Región de Instalación: ${formData.installationRegion || 'No especificado'}
- Clasificación de Área: ${t(`calculator.sensorSelection.areas.${formData.areaClassification}`)}
`;
        if (formData.processVariable === 'temperature' && formData.thermocoupleStandard !== 'autodetect') {
            details += `- Estándar de Termopar Específico: ${t(`calculator.sensorSelection.thermocoupleStandards.${formData.thermocoupleStandard}`)}\n`;
        }

        details += `
- Tipos de Señal Requeridos: ${getCheckedItems(formData.signalTypes, 'signals')}
- Prioridades del Proyecto: Costo (${formData.priorityCost}%), Precisión (${formData.priorityPrecision}%), Robustez (${formData.priorityRobustness}%)
    `.trim();

        try {
            const recommendation = await generateSensorRecommendation({
                language,
                details,
            });
            setResult(recommendation);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";
    
    return (
         <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('calculator.sensorSelection.wizardTitle')}</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{t('calculator.sensorSelection.wizardDescription')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Process & Medium */}
                <fieldset>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('calculator.sensorSelection.processVariable')}</label>
                            <select value={formData.processVariable} onChange={e => handleFormChange('processVariable', e.target.value)} className={commonInputClasses}>
                                {Object.keys(t('calculator.sensorSelection.vars')).map(key => (
                                    <option key={key} value={key}>{t(`calculator.sensorSelection.vars.${key}`)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('calculator.sensorSelection.mediumType')}</label>
                            <select value={formData.mediumType} onChange={e => handleFormChange('mediumType', e.target.value)} className={commonInputClasses}>
                                <option value="liquid">{t('calculator.sensorSelection.types.liquid')}</option>
                                <option value="solid">{t('calculator.sensorSelection.types.solid')}</option>
                            </select>
                        </div>
                    </div>
                </fieldset>
                
                {/* Step 2: Medium Characteristics (Conditional) */}
                <fieldset>
                    <legend className="text-lg font-semibold mb-2">{t('calculator.sensorSelection.mediumCharacteristics')}</legend>
                    {formData.mediumType === 'liquid' ? (
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.sensorSelection.liquidType')}</label>
                                <input type="text" value={formData.liquidType} onChange={e => handleFormChange('liquidType', e.target.value)} className={commonInputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.sensorSelection.liquidProperties')}</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                    {Object.keys(formData.liquidProperties).map(key => (
                                        <Checkbox key={key} label={t(`calculator.sensorSelection.props.${key}`)} checked={formData.liquidProperties[key as keyof typeof formData.liquidProperties]} onChange={val => handleCheckboxGroupChange('liquidProperties', key, val)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('calculator.sensorSelection.solidType')}</label>
                                    <select value={formData.solidType} onChange={e => handleFormChange('solidType', e.target.value)} className={commonInputClasses}>
                                        {Object.keys(t('calculator.sensorSelection.solidTypes')).map(key => (
                                            <option key={key} value={key}>{t(`calculator.sensorSelection.solidTypes.${key}`)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('calculator.sensorSelection.angleRepo')}</label>
                                    <input type="text" value={formData.angleRepo} onChange={e => handleFormChange('angleRepo', e.target.value)} className={commonInputClasses} />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.sensorSelection.solidProperties')}</label>
                                <div className="grid grid-cols-2 gap-2">
                                     {Object.keys(formData.solidProperties).map(key => (
                                        <Checkbox key={key} label={t(`calculator.sensorSelection.solidProps.${key}`)} checked={formData.solidProperties[key as keyof typeof formData.solidProperties]} onChange={val => handleCheckboxGroupChange('solidProperties', key, val)} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </fieldset>

                 {/* Step 3: Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.sensorSelection.operatingConditions')}</legend>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.sensorSelection.tempRange')}</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" placeholder={t('calculator.sensorSelection.from')} value={formData.tempMin} onChange={e => handleFormChange('tempMin', e.target.value)} className={commonInputClasses} />
                                    <span>{t('calculator.sensorSelection.to')}</span>
                                    <input type="number" placeholder={t('calculator.sensorSelection.to')} value={formData.tempMax} onChange={e => handleFormChange('tempMax', e.target.value)} className={commonInputClasses} />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.sensorSelection.pressureRange')}</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" placeholder={t('calculator.sensorSelection.from')} value={formData.pressureMin} onChange={e => handleFormChange('pressureMin', e.target.value)} className={commonInputClasses} />
                                    <span>{t('calculator.sensorSelection.to')}</span>
                                    <input type="number" placeholder={t('calculator.sensorSelection.to')} value={formData.pressureMax} onChange={e => handleFormChange('pressureMax', e.target.value)} className={commonInputClasses} />
                                </div>
                            </div>
                        </div>
                    </fieldset>
                     <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.sensorSelection.environmentalConditions')}</legend>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.sensorSelection.location')}</label>
                                 <div className="grid grid-cols-2 gap-2">
                                     {Object.keys(formData.location).map(key => (
                                        <Checkbox key={key} label={t(`calculator.sensorSelection.locs.${key}`)} checked={formData.location[key as keyof typeof formData.location]} onChange={val => handleCheckboxGroupChange('location', key, val)} />
                                    ))}
                                 </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1 flex items-center">
                                    {t('calculator.sensorSelection.installationRegion')}
                                    <Tooltip text={t('calculator.sensorSelection.installationRegionTooltip')} />
                                </label>
                                <input type="text" value={formData.installationRegion} onChange={e => handleFormChange('installationRegion', e.target.value)} className={commonInputClasses} />
                            </div>
                            {formData.processVariable === 'temperature' && (
                                <div className="animate-fade-in">
                                    <label className="block text-sm font-medium mb-1 flex items-center">
                                        {t('calculator.sensorSelection.thermocoupleStandard')}
                                        <Tooltip text={t('calculator.sensorSelection.thermocoupleStandardTooltip')} />
                                    </label>
                                    <select value={formData.thermocoupleStandard} onChange={e => handleFormChange('thermocoupleStandard', e.target.value)} className={commonInputClasses}>
                                        {Object.keys(t('calculator.sensorSelection.thermocoupleStandards')).map(key => (
                                            <option key={key} value={key}>{t(`calculator.sensorSelection.thermocoupleStandards.${key}`)}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                             <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.sensorSelection.areaClassification')}</label>
                                <select value={formData.areaClassification} onChange={e => handleFormChange('areaClassification', e.target.value)} className={commonInputClasses}>
                                    {Object.keys(t('calculator.sensorSelection.areas')).map(key => (
                                        <option key={key} value={key}>{t(`calculator.sensorSelection.areas.${key}`)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </fieldset>
                </div>

                {/* Step 4: Outputs & Priorities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <fieldset>
                         <legend className="text-lg font-semibold mb-2">{t('calculator.sensorSelection.outputRequirements')}</legend>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                             {Object.keys(formData.signalTypes).map(key => (
                                <Checkbox key={key} label={t(`calculator.sensorSelection.signals.${key}`)} checked={formData.signalTypes[key as keyof typeof formData.signalTypes]} onChange={val => handleCheckboxGroupChange('signalTypes', key, val)} />
                            ))}
                         </div>
                    </fieldset>
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.sensorSelection.projectPriorities')}</legend>
                        <div className="space-y-3">
                           <PrioritySlider label={t('calculator.sensorSelection.priorities.lowCost')} value={formData.priorityCost} onChange={val => handleFormChange('priorityCost', val)} />
                           <PrioritySlider label={t('calculator.sensorSelection.priorities.highPrecision')} value={formData.priorityPrecision} onChange={val => handleFormChange('priorityPrecision', val)} />
                           <PrioritySlider label={t('calculator.sensorSelection.priorities.maxRobustness')} value={formData.priorityRobustness} onChange={val => handleFormChange('priorityRobustness', val)} />
                        </div>
                    </fieldset>
                </div>

                <button type="submit" disabled={isLoading} className="w-full mt-6 bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center">
                    {isLoading ? t('calculator.sensorSelection.generating') : t('calculator.sensorSelection.generateButton')}
                </button>
            </form>

            {isLoading && <LoadingSpinner message={t('calculator.sensorSelection.generating')} />}
            {error && <ErrorAlert message={error} />}
            {result && <ResultDisplay resultText={result} />}
        </div>
    );
};