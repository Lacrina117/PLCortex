import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { dcLoadTemplates, standardDcPowerSupplySizes, DcLoadTemplate } from '../../constants/automationData';

interface Load {
  id: number;
  description: string;
  quantity: string;
  nominal: string;
  inrush: string;
}

interface CalculationResult {
  totalNominal: number; // in Amps
  peakInrush: number; // in Amps
  requiredAmperage: number; // in Amps
  recommendedSize: number; // in Amps
}

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="group relative flex justify-center">
        <span className="h-4 w-4 flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold cursor-help">?</span>
        <span className="absolute bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            {text}
        </span>
    </div>
);

export const DcPowerSupplyCalculator: React.FC = () => {
    const { t } = useTranslation();
    const [loads, setLoads] = useState<Load[]>([]);
    const [safetyFactor, setSafetyFactor] = useState('25');
    const [growthFactor, setGrowthFactor] = useState('20');
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
    const templateMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (templateMenuRef.current && !templateMenuRef.current.contains(event.target as Node)) {
                setIsTemplateMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [templateMenuRef]);

    const handleAddLoad = (template?: DcLoadTemplate) => {
        const newLoad: Load = {
            id: Date.now(),
            description: template ? template.name : '',
            quantity: '1',
            nominal: template ? template.nominal.toString() : '',
            inrush: template ? template.inrush.toString() : '0',
        };
        setLoads(prev => [...prev, newLoad]);
        if (template) {
            setIsTemplateMenuOpen(false);
        }
    };

    const handleUpdateLoad = (id: number, field: keyof Omit<Load, 'id'>, value: string) => {
        setLoads(prev => prev.map(load => (load.id === id ? { ...load, [field]: value } : load)));
    };

    const handleDeleteLoad = (id: number) => {
        setLoads(prev => prev.filter(load => load.id !== id));
    };

    const handleCalculate = () => {
        let totalNominalmA = 0;
        let maxInrushDevice = { nominal: 0, inrush: 0 };

        for (const load of loads) {
            const qty = parseInt(load.quantity, 10) || 0;
            const nom = parseFloat(load.nominal) || 0;
            const inr = parseFloat(load.inrush) || 0;

            if (qty > 0 && nom > 0) {
                totalNominalmA += qty * nom;
                if (inr > maxInrushDevice.inrush) {
                    maxInrushDevice = { nominal: nom, inrush: inr };
                }
            }
        }
        
        if (totalNominalmA === 0) {
            alert('Please add at least one valid load.');
            return;
        }

        const peakInrushmA = (totalNominalmA - maxInrushDevice.nominal) + maxInrushDevice.inrush;
        const requiredAmperage_mA = totalNominalmA * (1 + (parseFloat(safetyFactor) || 0) / 100) * (1 + (parseFloat(growthFactor) || 0) / 100);
        const requiredAmperage_A = requiredAmperage_mA / 1000;

        const recommendedSize = standardDcPowerSupplySizes.find(size => size >= requiredAmperage_A) || standardDcPowerSupplySizes[standardDcPowerSupplySizes.length - 1];

        setResult({
            totalNominal: totalNominalmA / 1000,
            peakInrush: peakInrushmA / 1000,
            requiredAmperage: requiredAmperage_A,
            recommendedSize,
        });
    };
    
    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('calculator.dcPowerSupply.title')}</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{t('calculator.dcPowerSupply.description')}</p>
            </div>

            {/* Load List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('calculator.dcPowerSupply.loadList')}</h3>
                <div className="space-y-2">
                    {loads.map((load, index) => (
                         <div key={load.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="col-span-12 sm:col-span-4">
                                {index === 0 && <label className="text-xs font-medium text-gray-500">{t('calculator.dcPowerSupply.deviceDescription')}</label>}
                                <input type="text" value={load.description} onChange={e => handleUpdateLoad(load.id, 'description', e.target.value)} className={commonInputClasses} />
                            </div>
                             <div className="col-span-4 sm:col-span-2">
                                {index === 0 && <label className="text-xs font-medium text-gray-500">{t('calculator.dcPowerSupply.quantity')}</label>}
                                <input type="number" value={load.quantity} onChange={e => handleUpdateLoad(load.id, 'quantity', e.target.value)} className={`${commonInputClasses} text-center`} min="1" />
                            </div>
                             <div className="col-span-4 sm:col-span-2">
                                {index === 0 && <label className="text-xs font-medium text-gray-500">{t('calculator.dcPowerSupply.nominalConsumption')}</label>}
                                <input type="number" value={load.nominal} onChange={e => handleUpdateLoad(load.id, 'nominal', e.target.value)} className={commonInputClasses} />
                            </div>
                             <div className="col-span-4 sm:col-span-2">
                                {index === 0 && <label className="text-xs font-medium text-gray-500">{t('calculator.dcPowerSupply.inrushConsumption')}</label>}
                                <input type="number" value={load.inrush} onChange={e => handleUpdateLoad(load.id, 'inrush', e.target.value)} className={commonInputClasses} />
                            </div>
                             <div className="col-span-12 sm:col-span-2 flex justify-end">
                                 {index === 0 && <label className="text-xs font-medium text-gray-500 invisible">_</label>}
                                <button onClick={() => handleDeleteLoad(load.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleAddLoad()} className="px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold rounded-lg shadow-sm hover:bg-indigo-200 dark:hover:bg-indigo-900/80 transition-colors">{t('calculator.dcPowerSupply.addDevice')}</button>
                    <div className="relative" ref={templateMenuRef}>
                        <button onClick={() => setIsTemplateMenuOpen(prev => !prev)} className="px-4 py-2 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('calculator.dcPowerSupply.addFromTemplate')}</button>
                        {isTemplateMenuOpen && (
                            <div className="absolute bottom-full mb-2 w-max max-h-60 overflow-y-auto p-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-lg z-10 animate-fade-in">
                                {dcLoadTemplates.map(template => (
                                    <button 
                                        key={template.name} 
                                        onClick={() => handleAddLoad(template)} 
                                        className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Design Parameters & Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{t('calculator.dcPowerSupply.designParameters')}</h3>
                    <div className="flex items-center gap-4">
                        <label htmlFor="safetyFactor" className="w-1/2 font-medium">{t('calculator.dcPowerSupply.safetyFactor')}</label>
                        <input id="safetyFactor" type="number" value={safetyFactor} onChange={e => setSafetyFactor(e.target.value)} className={commonInputClasses} />
                        <Tooltip text={t('calculator.dcPowerSupply.safetyFactorTooltip')} />
                    </div>
                    <div className="flex items-center gap-4">
                        <label htmlFor="growthFactor" className="w-1/2 font-medium">{t('calculator.dcPowerSupply.futureGrowth')}</label>
                        <input id="growthFactor" type="number" value={growthFactor} onChange={e => setGrowthFactor(e.target.value)} className={commonInputClasses} />
                        <Tooltip text={t('calculator.dcPowerSupply.futureGrowthTooltip')} />
                    </div>
                </div>
                <button onClick={handleCalculate} className="w-full bg-green-600 text-white font-semibold py-4 rounded-lg shadow-md hover:bg-green-700 transition-colors text-lg">
                    {t('calculator.dcPowerSupply.calculateButton')}
                </button>
            </div>
            
            {/* Results */}
            {result && (
                <div className="pt-8 border-t border-gray-200 dark:border-gray-700 space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold">{t('calculator.dcPowerSupply.resultsTitle')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Summary & Recommendation */}
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <h4 className="font-semibold text-gray-600 dark:text-gray-400">{t('calculator.dcPowerSupply.consumptionSummary')}</h4>
                                <ul className="mt-2 space-y-1 text-sm">
                                    <li className="flex justify-between"><span>{t('calculator.dcPowerSupply.totalNominal')}:</span> <span className="font-mono font-semibold">{result.totalNominal.toFixed(2)} A</span></li>
                                    <li className="flex justify-between"><span>{t('calculator.dcPowerSupply.peakInrush')}:</span> <span className="font-mono font-semibold">{result.peakInrush.toFixed(2)} A</span></li>
                                    <li className="flex justify-between"><span>{t('calculator.dcPowerSupply.requiredAmperage')}:</span> <span className="font-mono font-semibold">{result.requiredAmperage.toFixed(2)} A</span></li>
                                </ul>
                            </div>
                            <div className="p-6 bg-indigo-600 text-white rounded-lg text-center shadow-lg">
                                 <h4 className="font-semibold text-indigo-200">{t('calculator.dcPowerSupply.recommendationTitle')}</h4>
                                 <p className="text-4xl font-extrabold mt-1">{t('calculator.dcPowerSupply.recommendedSupply', { amps: result.recommendedSize })}</p>
                            </div>
                        </div>
                        {/* Expert Notes */}
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                            <h4 className="font-bold text-yellow-800 dark:text-yellow-200">{t('calculator.dcPowerSupply.expertNotesTitle')}</h4>
                            <ul className="mt-2 space-y-3 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                                <li>{t('calculator.dcPowerSupply.expertNote1', { recAmps: result.recommendedSize, nominalAmps: result.totalNominal.toFixed(2), safetyFactor: safetyFactor, growthFactor: growthFactor })}</li>
                                <li>{t('calculator.dcPowerSupply.expertNote2', { peakAmps: result.peakInrush.toFixed(2) })}</li>
                                <li>{t('calculator.dcPowerSupply.expertNote3')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};