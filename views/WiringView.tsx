import React, { useState, useEffect } from 'react';
import { ResultDisplay } from '../components/ResultDisplay';
import { ResultSkeleton } from '../components/SkeletonLoader';
import { ErrorAlert } from '../components/ErrorAlert';
import { generateWiringGuide } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { vfdBrands, vfdModelsByBrand, plcSoftwareByBrand } from '../constants/automationData';

export const WiringView: React.FC = () => {
    // State for all form fields
    const [vfdBrand, setVfdBrand] = useState(vfdBrands[2]); // Default Allen-Bradley
    const [vfdModel, setVfdModel] = useState(vfdModelsByBrand['Allen-Bradley'][0]); // Default PowerFlex 525
    const [plcSoftware, setPlcSoftware] = useState(plcSoftwareByBrand['Allen-Bradley'][3]); // Default CCW
    const [controlMethod, setControlMethod] = useState('3-Wire (Start/Stop Buttons)');
    const [motorHp, setMotorHp] = useState('');
    const [motorVoltage, setMotorVoltage] = useState('');
    const [motorFla, setMotorFla] = useState('');
    const [application, setApplication] = useState('');

    // State for API calls
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { language } = useLanguage();
    const { t } = useTranslation();

    // Cascading dropdown logic
    useEffect(() => {
        const models = vfdModelsByBrand[vfdBrand] || [];
        setVfdModel(models.length > 0 ? models[0] : 'General');
        const software = plcSoftwareByBrand[vfdBrand] || [];
        setPlcSoftware(software.length > 0 ? software[0] : 'General');
    }, [vfdBrand]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        setError(null);
        setResult('');

        try {
            const apiResult = await generateWiringGuide({
                language,
                vfdBrand,
                vfdModel,
                plcSoftware,
                controlMethod,
                motorHp,
                motorVoltage,
                motorFla,
                application
            });
            setResult(apiResult);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('error.unexpected'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const isFormValid = motorHp.trim() && motorVoltage.trim() && motorFla.trim() && application.trim();

    const commonSelectClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";
    const commonInputClasses = "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200";
    const disabledSelectClasses = "disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="max-w-4xl mx-auto">
             <header className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('wiring.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('wiring.description')}</p>
            </header>
            
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                        <legend className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 md:col-span-2">{t('wiring.vfdDetails')}</legend>
                        <div>
                            <label htmlFor="vfd-brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formVfdBrand')}</label>
                            <select id="vfd-brand" value={vfdBrand} onChange={(e) => setVfdBrand(e.target.value)} disabled={isLoading} className={commonSelectClasses}>
                                {vfdBrands.filter(b => b !== 'General').map(brand => <option key={brand} value={brand}>{brand}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="vfd-model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('formVfdModel')}</label>
                            <select id="vfd-model" value={vfdModel} onChange={(e) => setVfdModel(e.target.value)} disabled={isLoading} className={`${commonSelectClasses} ${disabledSelectClasses}`}>
                                {(vfdModelsByBrand[vfdBrand] || []).map(model => <option key={model} value={model}>{model}</option>)}
                            </select>
                        </div>
                    </fieldset>

                     <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                        <legend className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 md:col-span-2">{t('wiring.controlDetails')}</legend>
                         <div>
                            <label htmlFor="control-method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('wiring.controlMethod')}</label>
                            <select id="control-method" value={controlMethod} onChange={(e) => setControlMethod(e.target.value)} disabled={isLoading} className={commonSelectClasses}>
                                <option value="2-Wire (Maintained Switch)">{t('wiring.controlMethod2Wire')}</option>
                                <option value="3-Wire (Start/Stop Buttons)">{t('wiring.controlMethod3Wire')}</option>
                            </select>
                        </div>
                        <div>
                             <label htmlFor="plc-software" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('wiring.configSoftware')}</label>
                            <select id="plc-software" value={plcSoftware} onChange={(e) => setPlcSoftware(e.target.value)} disabled={isLoading || (plcSoftwareByBrand[vfdBrand] || []).length === 0} className={`${commonSelectClasses} ${disabledSelectClasses}`}>
                                {(plcSoftwareByBrand[vfdBrand] || []).map(software => <option key={software} value={software}>{software}</option>)}
                             </select>
                        </div>
                    </fieldset>

                    <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                         <legend className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 md:col-span-3">{t('wiring.motorDetails')}</legend>
                        <div>
                            <label htmlFor="motor-hp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('wiring.motorHP')}</label>
                            <input type="number" id="motor-hp" value={motorHp} onChange={e => setMotorHp(e.target.value)} disabled={isLoading} className={commonInputClasses} placeholder="e.g., 10" required />
                        </div>
                         <div>
                            <label htmlFor="motor-voltage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('wiring.motorVoltage')}</label>
                            <input type="number" id="motor-voltage" value={motorVoltage} onChange={e => setMotorVoltage(e.target.value)} disabled={isLoading} className={commonInputClasses} placeholder="e.g., 480" required />
                        </div>
                         <div>
                            <label htmlFor="motor-fla" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('wiring.motorFLA')}</label>
                            <input type="number" step="0.1" id="motor-fla" value={motorFla} onChange={e => setMotorFla(e.target.value)} disabled={isLoading} className={commonInputClasses} placeholder="e.g., 13.5" required />
                        </div>
                    </fieldset>
                    
                    <div>
                        <label htmlFor="application" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('wiring.application')}</label>
                        <textarea id="application" rows={3} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder={t('wiring.applicationPlaceholder')}
                            value={application}
                            onChange={(e) => setApplication(e.target.value)}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button type="submit" disabled={isLoading || !isFormValid} className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                         {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('wiring.generatingButton')}
                            </>
                         ) : t('wiring.generateButton')}
                    </button>
                </form>
            </div>
            
            {isLoading && <ResultSkeleton />}
            {error && <ErrorAlert message={error} />}
            {result && !isLoading && <ResultDisplay resultText={result} />}
        </div>
    );
};