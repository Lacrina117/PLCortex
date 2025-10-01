import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { wireGauges, conductorResistivity } from '../../constants/automationData';

type Phase = 'single' | 'three';
type Material = 'copper' | 'aluminum';
type DistanceUnit = 'feet' | 'meters';
type Status = 'acceptable' | 'caution' | 'unacceptable' | 'none';

interface Result {
    dropV: number;
    dropPercent: number;
    loadV: number;
    status: Status;
    suggestion: string | null;
    formula: string;
}

const voltages = ['24', '120', '208', '230', '460', '480', '575'];

export const VoltageDropCalculator: React.FC = () => {
    const { t } = useTranslation();

    const [voltage, setVoltage] = useState('460');
    const [phase, setPhase] = useState<Phase>('three');
    const [current, setCurrent] = useState('14'); // Corresponds to 10HP @ 460V
    const [material, setMaterial] = useState<Material>('copper');
    const [wireGauge, setWireGauge] = useState('12');
    const [distance, setDistance] = useState('150');
    const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('feet');

    const [result, setResult] = useState<Result | null>(null);

    const calculateDrop = (
        calcVoltage: number,
        calcPhase: Phase,
        calcCurrent: number,
        calcMaterial: Material,
        calcWireGauge: string,
        calcDistance: number,
        calcDistanceUnit: DistanceUnit
    ): { dropV: number; formula: string } | null => {

        const K = conductorResistivity[calcMaterial];
        const gaugeData = wireGauges.find(g => g.awg === calcWireGauge);
        if (!gaugeData) return null;

        const CM = gaugeData.cm;
        const D = calcDistanceUnit === 'meters' ? calcDistance * 3.28084 : calcDistance;
        const I = calcCurrent;

        let dropV = 0;
        let formula = '';
        if (calcPhase === 'three') {
            dropV = (1.732 * K * I * D) / CM;
            formula = `(√3 * ${K} * ${I.toFixed(1)}A * ${D.toFixed(0)}ft) / ${CM}CM`;
        } else {
            dropV = (2 * K * I * D) / CM;
            formula = `(2 * ${K} * ${I.toFixed(1)}A * ${D.toFixed(0)}ft) / ${CM}CM`;
        }
        return { dropV, formula };
    };

    const findSuggestion = (
        calcVoltage: number,
        calcPhase: Phase,
        calcCurrent: number,
        calcMaterial: Material,
        currentWireGauge: string,
        calcDistance: number,
        calcDistanceUnit: DistanceUnit
    ): string | null => {
        const currentIndex = wireGauges.findIndex(g => g.awg === currentWireGauge);
        if (currentIndex === -1 || currentIndex === wireGauges.length - 1) {
            return null; // Cannot suggest a larger size
        }

        for (let i = currentIndex + 1; i < wireGauges.length; i++) {
            const nextGauge = wireGauges[i];
            const dropResult = calculateDrop(calcVoltage, calcPhase, calcCurrent, calcMaterial, nextGauge.awg, calcDistance, calcDistanceUnit);
            if (dropResult) {
                const dropPercent = (dropResult.dropV / calcVoltage) * 100;
                if (dropPercent < 3) {
                    return nextGauge.awg;
                }
            }
        }
        return null; // No suitable size found in the table
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numVoltage = parseFloat(voltage);
        const numCurrent = parseFloat(current);
        const numDistance = parseFloat(distance);

        if ([numVoltage, numCurrent, numDistance].some(isNaN) || numCurrent <= 0 || numDistance <= 0 || numVoltage <= 0) {
            alert('Please enter valid, positive numbers for all fields.');
            return;
        }

        const dropResult = calculateDrop(numVoltage, phase, numCurrent, material, wireGauge, numDistance, distanceUnit);
        if (!dropResult) {
            alert('Invalid wire gauge data.');
            return;
        }

        const { dropV, formula } = dropResult;
        const dropPercent = (dropV / numVoltage) * 100;
        const loadV = numVoltage - dropV;

        let status: Status = 'none';
        if (dropPercent > 5) status = 'unacceptable';
        else if (dropPercent > 3) status = 'caution';
        else status = 'acceptable';

        let suggestion = null;
        if (status === 'unacceptable') {
            suggestion = findSuggestion(numVoltage, phase, numCurrent, material, wireGauge, numDistance, distanceUnit);
        }

        setResult({ dropV, dropPercent, loadV, status, suggestion, formula });
    };

    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";
    
    const statusInfo = useMemo(() => ({
        acceptable: {
            textKey: 'acceptable',
            className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-400 dark:border-green-600',
        },
        caution: {
            textKey: 'caution',
            className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-400 dark:border-yellow-600',
        },
        unacceptable: {
            textKey: 'unacceptable',
            className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-400 dark:border-red-600',
        },
        none: { textKey: '', className: '' },
    }), []);


    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('calculator.voltageDrop.title')}</h2>
            <p className="mt-2 mb-8 text-gray-500 dark:text-gray-400">{t('calculator.voltageDrop.description')}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.voltageDrop.electricalSystem')}</legend>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.voltageDrop.voltage')}</label>
                                <select value={voltage} onChange={e => setVoltage(e.target.value)} className={commonInputClasses}>
                                    {voltages.map(v => <option key={v} value={v}>{v}V</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.voltageDrop.phase')}</label>
                                <select value={phase} onChange={e => setPhase(e.target.value as Phase)} className={commonInputClasses}>
                                    <option value="three">{t('calculator.voltageDrop.phaseThree')}</option>
                                    <option value="single">{t('calculator.voltageDrop.phaseSingle')}</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.voltageDrop.load')}</legend>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('calculator.voltageDrop.current')}</label>
                            <input type="number" step="any" value={current} onChange={e => setCurrent(e.target.value)} className={commonInputClasses} />
                        </div>
                    </fieldset>
                     <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.voltageDrop.conductor')}</legend>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.voltageDrop.material')}</label>
                                <select value={material} onChange={e => setMaterial(e.target.value as Material)} className={commonInputClasses}>
                                    <option value="copper">{t('calculator.voltageDrop.copper')}</option>
                                    <option value="aluminum">{t('calculator.voltageDrop.aluminum')}</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.voltageDrop.wireGauge')}</label>
                                <select value={wireGauge} onChange={e => setWireGauge(e.target.value)} className={commonInputClasses}>
                                    {wireGauges.map(g => <option key={g.awg} value={g.awg}>{g.awg} AWG</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">{t('calculator.voltageDrop.distance')}</label>
                            <div className="flex">
                                <input type="number" step="any" value={distance} onChange={e => setDistance(e.target.value)} className={`${commonInputClasses} rounded-r-none`} />
                                <select value={distanceUnit} onChange={e => setDistanceUnit(e.target.value as DistanceUnit)} className={`${commonInputClasses} rounded-l-none border-l-0`}>
                                    <option value="feet">{t('calculator.voltageDrop.feet')}</option>
                                    <option value="meters">{t('calculator.voltageDrop.meters')}</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>
                    <button type="submit" className="w-full mt-4 bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                        {t('calculator.voltageDrop.calculateButton')}
                    </button>
                </form>
                {/* Results Side */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg space-y-4">
                     <h3 className="text-lg font-bold border-b border-gray-300 dark:border-gray-600 pb-2">{t('calculator.voltageDrop.resultsTitle')}</h3>
                     {result ? (
                        <>
                            <ResultDisplay label={t('calculator.voltageDrop.voltageDropV')} value={`${result.dropV.toFixed(2)} V`} />
                            <ResultDisplay label={t('calculator.voltageDrop.voltageDropPercent')} value={`${result.dropPercent.toFixed(2)} %`} />
                            <ResultDisplay label={t('calculator.voltageDrop.voltageAtLoad')} value={`${result.loadV.toFixed(2)} V`} />
                            <div className={`mt-4 p-4 rounded-lg border text-center ${statusInfo[result.status].className}`}>
                                <p className="font-bold text-sm">{t(`calculator.voltageDrop.${statusInfo[result.status].textKey}`)}</p>
                            </div>
                            {result.suggestion && (
                                <div className="mt-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-sm text-center text-blue-800 dark:text-blue-200">
                                    <p>{t('calculator.voltageDrop.suggestion', { gauge: result.suggestion })}</p>
                                </div>
                            )}
                             <div className="pt-4 text-center">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('calculator.voltageDrop.formula')}</p>
                                <p className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-300 break-all">{result.formula}</p>
                            </div>
                        </>
                     ) : (
                        <div className="text-center text-gray-500 py-10">{t('calculator.voltageDrop.description')}</div>
                     )}
                </div>
            </div>
        </div>
    );
};

const ResultDisplay: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-baseline">
        <span className="font-semibold text-gray-700 dark:text-gray-300">{label}:</span>
        <span className="font-mono text-lg font-bold text-indigo-600 dark:text-indigo-400">{value}</span>
    </div>
);