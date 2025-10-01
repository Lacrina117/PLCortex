import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export const MotorFlaCalculator: React.FC = () => {
    const { t } = useTranslation();
    const [hp, setHp] = useState('10');
    const [voltage, setVoltage] = useState('480');
    const [phase, setPhase] = useState<'single' | 'three'>('three');
    const [efficiency, setEfficiency] = useState('89.5');
    const [powerFactor, setPowerFactor] = useState('0.85');
    const [result, setResult] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numHp = parseFloat(hp);
        const numVoltage = parseFloat(voltage);
        const numEfficiency = parseFloat(efficiency) / 100; // convert from %
        const numPowerFactor = parseFloat(powerFactor);

        if ([numHp, numVoltage, numEfficiency, numPowerFactor].some(isNaN) || numVoltage === 0 || numEfficiency === 0 || numPowerFactor === 0) {
            alert("Please enter valid, non-zero numbers for all fields.");
            return;
        }

        let fla: number;
        if (phase === 'three') {
            fla = (numHp * 746) / (numVoltage * 1.732 * numEfficiency * numPowerFactor);
        } else { // single phase
            fla = (numHp * 746) / (numVoltage * numEfficiency * numPowerFactor);
        }
        setResult(fla);
    };
    
    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('calculator.motorFla.title')}</h2>
            <p className="mt-2 mb-8 text-gray-500 dark:text-gray-400">{t('calculator.motorFla.description')}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.motorFla.horsepower')}</label>
                        <input type="number" step="any" value={hp} onChange={e => setHp(e.target.value)} className={commonInputClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.motorFla.voltage')}</label>
                        <input type="number" step="any" value={voltage} onChange={e => setVoltage(e.target.value)} className={commonInputClasses} />
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.motorFla.phase')}</label>
                        <select value={phase} onChange={e => setPhase(e.target.value as any)} className={commonInputClasses}>
                            <option value="three">{t('calculator.motorFla.phaseThree')}</option>
                            <option value="single">{t('calculator.motorFla.phaseSingle')}</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.motorFla.efficiency')}</label>
                        <input type="number" step="any" value={efficiency} onChange={e => setEfficiency(e.target.value)} className={commonInputClasses} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.motorFla.powerFactor')}</label>
                        <input type="number" step="any" value={powerFactor} onChange={e => setPowerFactor(e.target.value)} className={commonInputClasses} />
                    </div>
                </div>

                <button type="submit" className="w-full mt-4 bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                    {t('calculator.motorFla.calculate')}
                </button>
            </form>

            {result !== null && (
                 <div className="mt-8 p-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-center animate-fade-in">
                    <h3 className="font-bold text-indigo-800 dark:text-indigo-200">{t('calculator.motorFla.result')}</h3>
                    <p className="font-mono text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                        {result.toFixed(2)} <span className="text-2xl">{t('calculator.motorFla.amps')}</span>
                    </p>
                </div>
            )}
        </div>
    );
};