import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const linearScale = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
    if (inMax - inMin === 0) return outMin; // Avoid division by zero
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

interface UnitPreset {
    key: string;
    translationKey: string;
    unit: string;
    min: string;
    max: string;
}

const unitPresets: { raw: UnitPreset[]; engineering: UnitPreset[] } = {
  raw: [
    { key: 'custom', translationKey: 'custom', unit: 'counts', min: '', max: '' },
    { key: 'rockwell', translationKey: 'raw_rockwell', unit: 'counts', min: '4000', max: '20000' },
    { key: 'siemens', translationKey: 'raw_siemens', unit: 'counts', min: '0', max: '27648' },
    { key: 'unsigned_16', translationKey: 'raw_unsigned_16', unit: 'counts', min: '0', max: '65535' },
    { key: 'signed_15', translationKey: 'raw_signed_15', unit: 'counts', min: '-32768', max: '32767' },
  ],
  engineering: [
    { key: 'custom', translationKey: 'custom', unit: 'EU', min: '', max: '' },
    { key: 'percent', translationKey: 'eng_percent', unit: '%', min: '0', max: '100' },
    { key: 'freq', translationKey: 'eng_freq', unit: 'Hz', min: '0', max: '60' },
    { key: 'psi', translationKey: 'eng_psi', unit: 'PSI', min: '0', max: '150' },
    { key: 'celsius', translationKey: 'eng_celsius', unit: '°C', min: '0', max: '100' },
    { key: 'gpm', translationKey: 'eng_gpm', unit: 'GPM', min: '0', max: '500' },
  ]
};

export const PlcScalingCalculator: React.FC = () => {
    const { t } = useTranslation();
    
    // State for ranges
    const [rawMin, setRawMin] = useState('4000');
    const [rawMax, setRawMax] = useState('20000');
    const [euMin, setEuMin] = useState('0');
    const [euMax, setEuMax] = useState('60');

    // State for presets
    const [selectedRawPreset, setSelectedRawPreset] = useState('rockwell');
    const [selectedEuPreset, setSelectedEuPreset] = useState('freq');

    // State for interactive tester
    const [rawInputValue, setRawInputValue] = useState(rawMin);
    const [euOutputValue, setEuOutputValue] = useState(euMin);
    const [euInputValue, setEuInputValue] = useState(euMin);
    const [rawOutputValue, setRawOutputValue] = useState(rawMin);

    useEffect(() => {
        const preset = unitPresets.raw.find(p => p.key === selectedRawPreset);
        if (preset && preset.key !== 'custom') {
            setRawMin(preset.min);
            setRawMax(preset.max);
        }
    }, [selectedRawPreset]);
    
    useEffect(() => {
        const preset = unitPresets.engineering.find(p => p.key === selectedEuPreset);
        if (preset && preset.key !== 'custom') {
            setEuMin(preset.min);
            setEuMax(preset.max);
        }
    }, [selectedEuPreset]);

    const { numRawMin, numRawMax, numEuMin, numEuMax, isValid } = useMemo(() => {
        const rm = parseFloat(rawMin);
        const rM = parseFloat(rawMax);
        const em = parseFloat(euMin);
        const eM = parseFloat(euMax);
        return {
            numRawMin: rm,
            numRawMax: rM,
            numEuMin: em,
            numEuMax: eM,
            isValid: ![rm, rM, em, eM].some(isNaN) && rM > rm
        };
    }, [rawMin, rawMax, euMin, euMax]);
    
    const codeSample = useMemo(() => {
        if (!isValid) return "// Invalid input ranges";
        return `// Structured Text (ST) Scaling Logic
// Assumes inputs are REAL numbers

Output_EU := (((Input_Raw - ${numRawMin}) * (${numEuMax} - ${numEuMin})) / (${numRawMax} - ${numRawMin})) + ${numEuMin};`;
    }, [isValid, numRawMin, numRawMax, numEuMin, numEuMax]);

    const handleRawToEu = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        const result = linearScale(parseFloat(rawInputValue), numRawMin, numRawMax, numEuMin, numEuMax);
        setEuOutputValue(result.toFixed(4));
    };

    const handleEuToRaw = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
         const result = linearScale(parseFloat(euInputValue), numEuMin, numEuMax, numRawMin, numRawMax);
        setRawOutputValue(result.toFixed(4));
    };

    const rawUnit = unitPresets.raw.find(p => p.key === selectedRawPreset)?.unit || 'counts';
    const euUnit = unitPresets.engineering.find(p => p.key === selectedEuPreset)?.unit || 'EU';

    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('calculator.plcScaling.title')}</h2>
            <p className="mt-2 mb-8 text-gray-500 dark:text-gray-400">{t('calculator.plcScaling.description')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input Ranges */}
                <div className="space-y-4">
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.plcScaling.inputRange')}</legend>
                        <div className="mb-2">
                             <label className="text-sm font-medium">{t('calculator.plcScaling.unitType')}</label>
                             <select value={selectedRawPreset} onChange={e => setSelectedRawPreset(e.target.value)} className={commonInputClasses}>
                                {unitPresets.raw.map(p => <option key={p.key} value={p.key}>{t(`calculator.plcScaling.units.${p.translationKey}`)}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1"><label className="text-xs">{t('calculator.plcScaling.min')}</label><input type="number" step="any" value={rawMin} onChange={e => setRawMin(e.target.value)} className={commonInputClasses}/></div>
                            <div className="flex-1"><label className="text-xs">{t('calculator.plcScaling.max')}</label><input type="number" step="any" value={rawMax} onChange={e => setRawMax(e.target.value)} className={commonInputClasses}/></div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.plcScaling.outputRange')}</legend>
                        <div className="mb-2">
                             <label className="text-sm font-medium">{t('calculator.plcScaling.unitType')}</label>
                             <select value={selectedEuPreset} onChange={e => setSelectedEuPreset(e.target.value)} className={commonInputClasses}>
                                 {unitPresets.engineering.map(p => <option key={p.key} value={p.key}>{t(`calculator.plcScaling.units.${p.translationKey}`)} ({p.unit})</option>)}
                            </select>
                        </div>
                         <div className="flex gap-4">
                            <div className="flex-1"><label className="text-xs">{t('calculator.plcScaling.min')}</label><input type="number" step="any" value={euMin} onChange={e => setEuMin(e.target.value)} className={commonInputClasses}/></div>
                            <div className="flex-1"><label className="text-xs">{t('calculator.plcScaling.max')}</label><input type="number" step="any" value={euMax} onChange={e => setEuMax(e.target.value)} className={commonInputClasses}/></div>
                        </div>
                    </fieldset>
                </div>
                
                {/* Results */}
                <div className="space-y-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold">{t('calculator.plcScaling.resultsTitle')}</h3>
                    
                    <div>
                        <h4 className="font-semibold text-sm mb-1">{t('calculator.plcScaling.formula')}</h4>
                        <p className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-md text-center font-mono text-sm text-indigo-800 dark:text-indigo-200">
                            Output = (((Input - {rawMin}) * ({euMax} - {euMin})) / ({rawMax} - {rawMin})) + {euMin}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm mb-1">{t('calculator.plcScaling.codeSample')}</h4>
                        <pre className="p-3 bg-gray-900 dark:bg-gray-950 rounded-md text-xs text-gray-200 whitespace-pre-wrap"><code>{codeSample}</code></pre>
                    </div>
                </div>
            </div>

            {/* Interactive Tester */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4">{t('calculator.plcScaling.interactiveTester')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <form onSubmit={handleRawToEu} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2">
                        <label className="font-semibold text-sm">{t('calculator.plcScaling.rawToEu')}</label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input type="number" step="any" value={rawInputValue} onChange={e => setRawInputValue(e.target.value)} className={`${commonInputClasses} pr-12`} />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{rawUnit}</span>
                            </div>
                            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">&rarr;</button>
                             <div className="relative flex-1">
                                <input type="text" value={euOutputValue} readOnly className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700 pr-12`} />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{euUnit}</span>
                            </div>
                        </div>
                    </form>
                    <form onSubmit={handleEuToRaw} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2">
                        <label className="font-semibold text-sm">{t('calculator.plcScaling.euToRaw')}</label>
                         <div className="flex items-center gap-2">
                             <div className="relative flex-1">
                                <input type="number" step="any" value={euInputValue} onChange={e => setEuInputValue(e.target.value)} className={`${commonInputClasses} pr-12`} />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{euUnit}</span>
                            </div>
                            <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">&rarr;</button>
                            <div className="relative flex-1">
                                <input type="text" value={rawOutputValue} readOnly className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700 pr-12`} />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{rawUnit}</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    );
};