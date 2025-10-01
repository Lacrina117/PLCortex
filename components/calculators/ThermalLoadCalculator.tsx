import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { thermalComponents } from '../../constants/automationData';

interface AddedComponent {
    id: number;
    name: string;
    heat: number;
    quantity: number;
}

interface CalculationResult {
    totalHeatWatts: number;
    panelAreaSqFt: number;
    deltaF: number;
    heatDissipatedBtu: number;
    coolingRequiredBtu: number;
}

export const ThermalLoadCalculator: React.FC = () => {
    const { t } = useTranslation();

    const [addedComponents, setAddedComponents] = useState<AddedComponent[]>([]);
    const [componentToAdd, setComponentToAdd] = useState(thermalComponents[0].name);
    
    // Panel dimensions in inches
    const [panelHeight, setPanelHeight] = useState('36');
    const [panelWidth, setPanelWidth] = useState('24');
    const [panelDepth, setPanelDepth] = useState('12');
    
    // Temperatures in Fahrenheit
    const [internalTemp, setInternalTemp] = useState('104'); // 40°C
    const [externalTemp, setExternalTemp] = useState('95'); // 35°C

    const [result, setResult] = useState<CalculationResult | null>(null);

    const totalHeat = useMemo(() => {
        return addedComponents.reduce((sum, comp) => sum + comp.heat * comp.quantity, 0);
    }, [addedComponents]);

    const handleAddComponent = () => {
        const componentData = thermalComponents.find(c => c.name === componentToAdd);
        if (!componentData) return;

        setAddedComponents(prev => {
            const existing = prev.find(c => c.name === componentData.name);
            if (existing) {
                return prev.map(c => c.name === componentData.name ? { ...c, quantity: c.quantity + 1 } : c);
            } else {
                return [...prev, { id: Date.now(), ...componentData, quantity: 1 }];
            }
        });
    };
    
    const handleRemoveComponent = (id: number) => {
        setAddedComponents(prev => prev.filter(c => c.id !== id));
    };

    const handleQuantityChange = (id: number, quantity: number) => {
        if (quantity < 1) {
            handleRemoveComponent(id);
        } else {
            setAddedComponents(prev => prev.map(c => c.id === id ? { ...c, quantity } : c));
        }
    };
    
    const calculate = () => {
        const H = parseFloat(panelHeight);
        const W = parseFloat(panelWidth);
        const D = parseFloat(panelDepth);
        const Ti = parseFloat(internalTemp);
        const Te = parseFloat(externalTemp);

        if ([H, W, D, Ti, Te].some(isNaN) || H <= 0 || W <= 0 || D <= 0) {
            alert('Please enter valid, positive numbers for all dimensions and temperatures.');
            return;
        }

        // Calculate effective surface area in square feet (Hoffman-Pentair formula)
        // Top surface area is included, bottom is not.
        const areaSqIn = (2 * H * W) + (2 * H * D) + (2 * W * D); // Simplified for standalone
        const panelAreaSqFt = areaSqIn / 144;
        
        const deltaF = Ti - Te;
        if (deltaF <= 0) {
             alert('Internal temperature must be higher than external temperature.');
            return;
        }

        // Calculate heat dissipated by the enclosure in BTU/hr
        // Using a common k-factor of 1.25 for unpainted steel
        const heatDissipatedBtu = 1.25 * panelAreaSqFt * deltaF;
        
        // Total internal heat in BTU/hr
        const totalHeatBtu = totalHeat * 3.41;

        const coolingRequiredBtu = totalHeatBtu - heatDissipatedBtu;

        setResult({
            totalHeatWatts: totalHeat,
            panelAreaSqFt,
            deltaF,
            heatDissipatedBtu,
            coolingRequiredBtu,
        });
    };
    
    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('calculator.thermal.title')}</h2>
            <p className="mt-2 mb-8 text-gray-500 dark:text-gray-400">{t('calculator.thermal.description')}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Side */}
                <div className="space-y-6">
                    {/* Component Selection */}
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.thermal.components')}</legend>
                        <div className="flex gap-2">
                            <select value={componentToAdd} onChange={e => setComponentToAdd(e.target.value)} className={commonInputClasses}>
                                {thermalComponents.map(c => <option key={c.name} value={c.name}>{c.name} ({c.heat}W)</option>)}
                            </select>
                            <button onClick={handleAddComponent} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors whitespace-nowrap">{t('calculator.thermal.addComponent')}</button>
                        </div>
                    </fieldset>
                    
                     {/* Added Components */}
                    {addedComponents.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-md font-semibold">{t('calculator.thermal.addedComponents')}</h3>
                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                            {addedComponents.map(c => (
                                <div key={c.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                    <span className="flex-grow text-sm">{c.name} ({c.heat}W)</span>
                                    <input type="number" value={c.quantity} onChange={e => handleQuantityChange(c.id, parseInt(e.target.value, 10))} className={`${commonInputClasses} w-16 text-center`} min="0" />
                                    <button onClick={() => handleRemoveComponent(c.id)} className="text-gray-400 hover:text-red-500 p-1">&times;</button>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}

                    {/* Dimensions */}
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.thermal.panelDimensions')}</legend>
                        <div className="grid grid-cols-3 gap-2">
                            <div><label className="text-xs text-gray-500">{t('calculator.thermal.height')}</label><input type="text" value={panelHeight} onChange={e => setPanelHeight(e.target.value)} className={commonInputClasses} /></div>
                            <div><label className="text-xs text-gray-500">{t('calculator.thermal.width')}</label><input type="text" value={panelWidth} onChange={e => setPanelWidth(e.target.value)} className={commonInputClasses} /></div>
                            <div><label className="text-xs text-gray-500">{t('calculator.thermal.depth')}</label><input type="text" value={panelDepth} onChange={e => setPanelDepth(e.target.value)} className={commonInputClasses} /></div>
                        </div>
                    </fieldset>

                     {/* Temperatures */}
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.thermal.temperatures')}</legend>
                        <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-xs text-gray-500">{t('calculator.thermal.internal')}</label><input type="text" value={internalTemp} onChange={e => setInternalTemp(e.target.value)} className={commonInputClasses} /></div>
                            <div><label className="text-xs text-gray-500">{t('calculator.thermal.external')}</label><input type="text" value={externalTemp} onChange={e => setExternalTemp(e.target.value)} className={commonInputClasses} /></div>
                        </div>
                    </fieldset>

                    <button onClick={calculate} className="w-full mt-4 bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors">{t('calculator.thermal.calculateButton')}</button>
                </div>
                
                {/* Result Side */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">{t('calculator.thermal.resultsTitle')}</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('calculator.thermal.totalHeat')}:</span>
                            <span className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100">{result?.totalHeatWatts.toFixed(0) ?? '...'} {t('calculator.thermal.watts')}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('calculator.thermal.panelArea')}:</span>
                            <span className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100">{result?.panelAreaSqFt.toFixed(2) ?? '...'} {t('calculator.thermal.sqft')}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('calculator.thermal.tempDifference')}:</span>
                            <span className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100">{result?.deltaF.toFixed(1) ?? '...'} °F</span>
                        </div>
                         <div className="border-t border-gray-300 dark:border-gray-600 my-4"></div>
                        <div className="flex justify-between items-baseline">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">{t('calculator.thermal.coolingCapacity')}:</span>
                            <span className="font-mono text-lg font-bold text-green-600 dark:text-green-400">{result?.heatDissipatedBtu.toFixed(0) ?? '...'} {t('calculator.thermal.btu')}</span>
                        </div>
                        <div className="mt-6 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                             <h4 className="font-bold text-indigo-800 dark:text-indigo-200">{t('calculator.thermal.coolingRequired')}</h4>
                            {result ? (
                                result.coolingRequiredBtu > 0 ? (
                                    <p className="font-mono text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">{result.coolingRequiredBtu.toFixed(0)} {t('calculator.thermal.btu')}</p>
                                ) : (
                                    <p className="font-mono text-2xl font-extrabold text-green-600 dark:text-green-400 mt-1">{t('calculator.thermal.noCooling')}</p>
                                )
                            ) : (
                                <p className="font-mono text-2xl font-extrabold text-gray-500 dark:text-gray-400 mt-1">...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};