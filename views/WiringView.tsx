import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../contexts/LanguageContext';
import { generateWiringGuide } from '../services/geminiService';
import { vfdBrands, vfdModelsByBrand, plcSoftwareByBrand } from '../constants/automationData';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultDisplay } from '../components/ResultDisplay';

export const WiringView: React.FC = () => {
    const { t } = useTranslation();
    const { language } = useLanguage();

    const [vfdBrand, setVfdBrand] = useState(vfdBrands[1]); // Default to Siemens
    const [vfdModel, setVfdModel] = useState(vfdModelsByBrand[vfdBrands[1]][0]);
    const [plcSoftware, setPlcSoftware] = useState('TIA Portal');
    const [controlMethod, setControlMethod] = useState('2-Wire');
    const [motorHp, setMotorHp] = useState('5');
    const [motorVoltage, setMotorVoltage] = useState('480');
    const [motorFla, setMotorFla] = useState('6.1');
    const [application, setApplication] = useState("A conveyor belt that needs to start smoothly.");

    const [guide, setGuide] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Reset model when brand changes
        setVfdModel(vfdModelsByBrand[vfdBrand]?.[0] || 'General');
    }, [vfdBrand]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setGuide('');
        try {
            const result = await generateWiringGuide({
                language,
                vfdBrand,
                vfdModel,
                plcSoftware,
                controlMethod,
                motorHp,
                motorVoltage,
                motorFla,
                application,
            });
            setGuide(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsLoading(false);
        }
    };

    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('wiring.title')}</h2>
                    <p className="mt-2 mb-8 text-gray-500 dark:text-gray-400">{t('wiring.description')}</p>
                    
                    <div className="space-y-6">
                        {/* VFD Details */}
                        <fieldset className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <legend className="text-lg font-semibold mb-4">{t('wiring.vfdDetails')}</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('formVfdBrand')}</label>
                                    <select value={vfdBrand} onChange={e => setVfdBrand(e.target.value)} className={commonInputClasses}>
                                        {vfdBrands.filter(b => b !== 'General').map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('formVfdModel')}</label>
                                    <select value={vfdModel} onChange={e => setVfdModel(e.target.value)} className={commonInputClasses} disabled={vfdBrand === 'General'}>
                                        {(vfdModelsByBrand[vfdBrand] || []).map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* Control Details */}
                        <fieldset className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <legend className="text-lg font-semibold mb-4">{t('wiring.controlDetails')}</legend>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('wiring.controlMethod')}</label>
                                    <select value={controlMethod} onChange={e => setControlMethod(e.target.value)} className={commonInputClasses}>
                                        <option value="2-Wire">{t('wiring.controlMethod2Wire')}</option>
                                        <option value="3-Wire">{t('wiring.controlMethod3Wire')}</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium mb-1">{t('wiring.configSoftware')}</label>
                                     <select value={plcSoftware} onChange={e => setPlcSoftware(e.target.value)} className={commonInputClasses}>
                                        {Object.values(plcSoftwareByBrand).flat().filter((v, i, a) => a.indexOf(v) === i).sort().map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </fieldset>
                        
                        {/* Motor Details */}
                        <fieldset className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <legend className="text-lg font-semibold mb-4">{t('wiring.motorDetails')}</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('wiring.motorHP')}</label>
                                    <input type="text" value={motorHp} onChange={e => setMotorHp(e.target.value)} className={commonInputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('wiring.motorVoltage')}</label>
                                    <input type="text" value={motorVoltage} onChange={e => setMotorVoltage(e.target.value)} className={commonInputClasses} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t('wiring.motorFLA')}</label>
                                    <input type="text" value={motorFla} onChange={e => setMotorFla(e.target.value)} className={commonInputClasses} />
                                </div>
                            </div>
                        </fieldset>
                        
                        {/* Application */}
                         <fieldset className="border-t border-gray-200 dark:border-gray-700 pt-6">
                             <legend className="text-lg font-semibold mb-4">{t('wiring.application')}</legend>
                            <textarea value={application} onChange={e => setApplication(e.target.value)} placeholder={t('wiring.applicationPlaceholder')} rows={3} className={commonInputClasses} />
                        </fieldset>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full mt-8 bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center">
                        {isLoading ? t('wiring.generatingButton') : t('wiring.generateButton')}
                    </button>
                </form>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <ErrorAlert message={error} />}
            {guide && <ResultDisplay resultText={guide} />}
        </div>
    );
};
