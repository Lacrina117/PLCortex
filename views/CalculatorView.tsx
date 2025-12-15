
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ThermalLoadCalculator } from '../components/calculators/ThermalLoadCalculator';
import { MotorControlCalculator } from '../components/calculators/MotorControlCalculator';
import { PlcScalingCalculator } from '../components/calculators/PlcScalingCalculator';
import { VoltageDropCalculator } from '../components/calculators/VoltageDropCalculator';
import { DcPowerSupplyCalculator } from '../components/calculators/DcPowerSupplyCalculator';
import { EncoderMotionCalculator } from '../components/calculators/EncoderMotionCalculator';
import { SensorSelectionCalculator } from '../components/calculators/SensorSelectionCalculator';
import { OhmsLawCalculator } from '../components/calculators/OhmsLawCalculator';

type CalculatorType = 'ohmsLaw' | 'thermal' | 'motor' | 'scaling' | 'voltageDrop' | 'dcPower' | 'encoderMotion' | 'sensorSelection';

export const CalculatorView: React.FC = () => {
    const { t } = useTranslation();
    const [activeCalc, setActiveCalc] = useState<CalculatorType>('sensorSelection');

    const calculators = [
        { key: 'ohmsLaw', title: t('calculator.ohmsLaw.tabTitle'), Component: OhmsLawCalculator },
        { key: 'thermal', title: t('calculator.thermal.tabTitle'), Component: ThermalLoadCalculator },
        { key: 'motor', title: t('calculator.motorControl.tabTitle'), Component: MotorControlCalculator },
        { key: 'scaling', title: t('calculator.plcScaling.tabTitle'), Component: PlcScalingCalculator },
        { key: 'voltageDrop', title: t('calculator.voltageDrop.tabTitle'), Component: VoltageDropCalculator },
        { key: 'dcPower', title: t('calculator.dcPowerSupply.tabTitle'), Component: DcPowerSupplyCalculator },
        { key: 'encoderMotion', title: t('calculator.encoderMotion.tabTitle'), Component: EncoderMotionCalculator },
        { key: 'sensorSelection', title: t('calculator.sensorSelection.tabTitle'), Component: SensorSelectionCalculator },
    ];
    
    const ActiveComponent = calculators.find(c => c.key === activeCalc)!.Component;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="text-center">
                <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight sm:text-4xl">{t('calculator.title')}</h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">{t('calculator.description')}</p>
            </header>

            <div className="flex flex-wrap justify-center border-b border-gray-200 dark:border-gray-700">
                {calculators.map(calc => (
                    <button
                        key={calc.key}
                        onClick={() => setActiveCalc(calc.key as CalculatorType)}
                        className={`px-4 py-3 font-semibold text-sm transition-colors focus:outline-none -mb-px ${
                            activeCalc === calc.key
                                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        aria-current={activeCalc === calc.key ? 'page' : undefined}
                    >
                        {calc.title}
                    </button>
                ))}
            </div>
            
            <div key={activeCalc} className="animate-fade-in-up">
                <ActiveComponent />
            </div>
        </div>
    );
};
