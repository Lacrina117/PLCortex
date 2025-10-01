import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { motorControlData, MotorControlSpecs } from '../../constants/automationData';

interface Result {
    fla: number;
    overloadMax: number;
    contactor: string;
    breaker: number;
    wire: string;
}

const motorHPs = ['0.5', '1', '2', '5', '10', '20', '50'];
const motorVoltages = ['208V', '230V', '460V'];

export const MotorControlCalculator: React.FC = () => {
    const { t } = useTranslation();
    const [hp, setHp] = useState<string>(motorHPs[4]); // Default to 10HP
    const [voltage, setVoltage] = useState<string>(motorVoltages[2]); // Default to 460V
    const [phase, setPhase] = useState<'singlePhase' | 'threePhase'>('threePhase');

    // New state for nameplate data
    const [nominalCurrent, setNominalCurrent] = useState('');
    const [serviceFactor, setServiceFactor] = useState('1.15');

    const [result, setResult] = useState<Result | null>(null);

    // Update suggested values when HP or voltage changes
    useEffect(() => {
        if (phase === 'threePhase') {
            const data = motorControlData.threePhase[voltage]?.[hp];
            if (data) {
                setNominalCurrent(data.fla.toString());
                setServiceFactor(data.sf.toString());
                setResult(null); // Clear previous results on change
            }
        }
    }, [hp, voltage, phase]);

    const serviceFactorCurrent = useMemo(() => {
        const iN = parseFloat(nominalCurrent);
        const sf = parseFloat(serviceFactor);
        if (!isNaN(iN) && !isNaN(sf)) {
            return (iN * sf).toFixed(2);
        }
        return '...';
    }, [nominalCurrent, serviceFactor]);

    const findClosestMotor = (targetFla: number, voltage: string): MotorControlSpecs | null => {
        if (phase !== 'threePhase') return null;
        const voltageData = motorControlData.threePhase[voltage];
        if (!voltageData) return null;

        let closestMatch: MotorControlSpecs | null = null;
        let smallestDiff = Infinity;

        for (const hp in voltageData) {
            const motorSpec = voltageData[hp];
            const diff = Math.abs(motorSpec.fla - targetFla);
            if (diff < smallestDiff) {
                smallestDiff = diff;
                closestMatch = motorSpec;
            }
        }
        return closestMatch;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (phase === 'singlePhase') {
            alert("Single-phase calculations are not yet implemented in this version.");
            setResult(null);
            return;
        }

        const iN = parseFloat(nominalCurrent);
        const sf = parseFloat(serviceFactor);

        if (isNaN(iN) || iN <= 0 || isNaN(sf) || sf <= 0) {
            alert("Please enter valid, positive numbers for Nominal Current and Service Factor.");
            return;
        }

        const closestMotor = findClosestMotor(iN, voltage);

        if (closestMotor) {
             // Per NEC 430.32(A)(1)
            const overloadMaxSetting = iN * (sf >= 1.15 ? 1.25 : 1.15);
            
            setResult({
                fla: iN,
                overloadMax: overloadMaxSetting,
                contactor: closestMotor.contactor,
                breaker: closestMotor.breaker,
                wire: closestMotor.wire,
            });
        } else {
            alert("Could not find a suitable standard motor profile for the given current. Please check your inputs.");
            setResult(null);
        }
    };

    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('calculator.motorControl.title')}</h2>
            <p className="mt-2 mb-8 text-gray-500 dark:text-gray-400">{t('calculator.motorControl.description')}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset>
                    <legend className="text-lg font-semibold mb-2">{t('calculator.motorControl.motorDetails')}</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('calculator.motorControl.horsepower')}</label>
                            <select value={hp} onChange={e => setHp(e.target.value)} className={commonInputClasses}>
                                {motorHPs.map(h => <option key={h} value={h}>{h} HP</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('calculator.motorControl.voltage')}</label>
                            <select value={voltage} onChange={e => setVoltage(e.target.value)} className={commonInputClasses}>
                                {motorVoltages.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('calculator.motorControl.phase')}</label>
                            <select value={phase} onChange={e => setPhase(e.target.value as any)} className={commonInputClasses}>
                                <option value="threePhase">{t('calculator.motorControl.phaseThree')}</option>
                                <option value="singlePhase" disabled>{t('calculator.motorControl.phaseSingle')}</option>
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-lg font-semibold mb-2">{t('calculator.motorControl.nameplateData')}</legend>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         <div>
                            <label className="block text-sm font-medium mb-1">{t('calculator.motorControl.nominalCurrent')}</label>
                            <input type="number" step="any" value={nominalCurrent} onChange={e => setNominalCurrent(e.target.value)} className={commonInputClasses} placeholder="FLA from plate"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('calculator.motorControl.serviceFactor')}</label>
                            <input type="number" step="any" value={serviceFactor} onChange={e => setServiceFactor(e.target.value)} className={commonInputClasses} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">{t('calculator.motorControl.serviceFactorCurrent')}</label>
                             <input type="text" value={serviceFactorCurrent} readOnly className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed`} />
                        </div>
                    </div>
                </fieldset>

                <button type="submit" className="w-full mt-4 bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                    {t('calculator.motorControl.calculateButton')}
                </button>
            </form>

            {result && (
                 <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-xl font-bold mb-4">{t('calculator.motorControl.resultsTitle')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                        <ResultCard label={t('calculator.motorControl.fla')} value={`${result.fla.toFixed(1)} A`} />
                        <ResultCard label={t('calculator.motorControl.overload')} value={`${result.overloadMax.toFixed(1)} A`} sublabel={t('calculator.motorControl.overloadRange')} />
                        <ResultCard label={t('calculator.motorControl.contactor')} value={result.contactor} />
                        <ResultCard label={t('calculator.motorControl.breaker')} value={`${result.breaker} A`} />
                        <ResultCard label={t('calculator.motorControl.wire')} value={`${result.wire} AWG`} />
                    </div>
                     <div className="mt-8 text-xs text-center text-gray-400 dark:text-gray-500 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p>{t('calculator.motorControl.disclaimer')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const ResultCard: React.FC<{ label: string; value: string; sublabel?: string }> = ({ label, value, sublabel }) => (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">{value}</p>
        {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
    </div>
);