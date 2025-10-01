import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

// Simplified NEC 310.16 Ampacity Table
const ampacityTable = {
    copper: {
        '60': { '14': 20, '12': 25, '10': 35, '8': 50, '6': 65, '4': 85, '3': 100, '2': 115, '1': 130, '1/0': 150, '2/0': 175, '3/0': 200, '4/0': 230 },
        '75': { '14': 25, '12': 30, '10': 40, '8': 55, '6': 75, '4': 95, '3': 110, '2': 130, '1': 150, '1/0': 170, '2/0': 195, '3/0': 225, '4/0': 260 },
        '90': { '14': 30, '12': 35, '10': 50, '8': 65, '6': 90, '4': 115, '3': 130, '2': 150, '1': 170, '1/0': 195, '2/0': 225, '3/0': 255, '4/0': 295 },
    },
    aluminum: {
        '60': { '12': 20, '10': 30, '8': 40, '6': 50, '4': 65, '3': 75, '2': 90, '1': 100, '1/0': 120, '2/0': 135, '3/0': 155, '4/0': 180 },
        '75': { '12': 25, '10': 35, '8': 50, '6': 60, '4': 75, '3': 85, '2': 100, '1': 115, '1/0': 135, '2/0': 150, '3/0': 175, '4/0': 205 },
        '90': { '12': 30, '10': 40, '8': 55, '6': 70, '4': 85, '3': 95, '2': 115, '1': 130, '1/0': 150, '2/0': 170, '3/0': 195, '4/0': 230 },
    }
};

type Material = 'copper' | 'aluminum';
type Temp = '60' | '75' | '90';

export const WireSizingCalculator: React.FC = () => {
    const { t } = useTranslation();
    const [amps, setAmps] = useState('28');
    const [material, setMaterial] = useState<Material>('copper');
    const [tempRating, setTempRating] = useState<Temp>('75');
    const [result, setResult] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmps = parseFloat(amps);
        if (isNaN(numAmps) || numAmps <= 0) {
            alert("Please enter a valid, positive amperage.");
            return;
        }

        const table = ampacityTable[material][tempRating];
        let foundSize = null;
        for (const size in table) {
            if (table[size as keyof typeof table] >= numAmps) {
                foundSize = size;
                break;
            }
        }
        setResult(foundSize);
    };

    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";
    
    return (
         <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('calculator.wireSizing.title')}</h2>
            <p className="mt-2 mb-8 text-gray-500 dark:text-gray-400">{t('calculator.wireSizing.description')}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.wireSizing.amperage')}</label>
                        <input type="number" step="any" value={amps} onChange={e => setAmps(e.target.value)} className={commonInputClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.wireSizing.material')}</label>
                        <select value={material} onChange={e => setMaterial(e.target.value as Material)} className={commonInputClasses}>
                            <option value="copper">{t('calculator.wireSizing.copper')}</option>
                            <option value="aluminum">{t('calculator.wireSizing.aluminum')}</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.wireSizing.tempRating')}</label>
                         <select value={tempRating} onChange={e => setTempRating(e.target.value as Temp)} className={commonInputClasses}>
                            <option value="60">60°C</option>
                            <option value="75">75°C</option>
                            <option value="90">90°C</option>
                        </select>
                    </div>
                 </div>
                 <button type="submit" className="w-full mt-4 bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                    {t('calculator.wireSizing.calculate')}
                </button>
            </form>

            {result !== null && (
                <div className="mt-8 p-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-center animate-fade-in">
                    <h3 className="font-bold text-indigo-800 dark:text-indigo-200">{t('calculator.wireSizing.result')}</h3>
                    <p className="font-mono text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                        {result ? `${result} ${t('calculator.wireSizing.awg')}` : 'Over Max Table Size'}
                    </p>
                </div>
            )}
            
            <div className="mt-8 text-xs text-center text-gray-400 dark:text-gray-500 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p>{t('calculator.wireSizing.disclaimer')}</p>
            </div>
        </div>
    );
};