import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

type CalculatorTab = 'scaler' | 'motor' | 'thermal';

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            isActive
                ? 'bg-white dark:bg-gray-800 border-b-0 border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400'
                : 'bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        style={{ marginBottom: '-1px' }}
    >
        {label}
    </button>
);

const ScalerCalculator: React.FC = () => {
    const { t } = useTranslation();
    const [rawMin, setRawMin] = useState('0');
    const [rawMax, setRawMax] = useState('16383');
    const [engMin, setEngMin] = useState('0');
    const [engMax, setEngMax] = useState('100');
    const [engUnit, setEngUnit] = useState('PSI');
    const [rawValue, setRawValue] = useState('8192');
    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700";


    const engValue = React.useMemo(() => {
        const iRawMin = parseFloat(rawMin);
        const iRawMax = parseFloat(rawMax);
        const iEngMin = parseFloat(engMin);
        const iEngMax = parseFloat(engMax);
        const iRawValue = parseFloat(rawValue);

        if (isNaN(iRawMin) || isNaN(iRawMax) || isNaN(iEngMin) || isNaN(iEngMax) || isNaN(iRawValue) || (iRawMax - iRawMin === 0)) {
            return '...';
        }

        const scaled = (((iRawValue - iRawMin) * (iEngMax - iEngMin)) / (iRawMax - iRawMin)) + iEngMin;
        return scaled.toFixed(2);
    }, [rawMin, rawMax, engMin, engMax, rawValue]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-4">
                     <div>
                        <h4 className="font-semibold mb-2">{t('calculator.rawRange')}</h4>
                        <div className="flex gap-2">
                             <input type="number" value={rawMin} onChange={e => setRawMin(e.target.value)} placeholder={t('calculator.min')} className={commonInputClasses} />
                            <input type="number" value={rawMax} onChange={e => setRawMax(e.target.value)} placeholder={t('calculator.max')} className={commonInputClasses} />
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">{t('calculator.engRange')}</h4>
                        <div className="flex gap-2">
                             <input type="number" value={engMin} onChange={e => setEngMin(e.target.value)} placeholder={t('calculator.min')} className={commonInputClasses} />
                             <input type="number" value={engMax} onChange={e => setEngMax(e.target.value)} placeholder={t('calculator.max')} className={commonInputClasses} />
                             <input type="text" value={engUnit} onChange={e => setEngUnit(e.target.value)} placeholder={t('calculator.unit')} className={`${commonInputClasses} w-1/2`} />
                        </div>
                    </div>
                </div>

                 {/* Live Conversion */}
                <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="font-semibold mb-2">{t('calculator.liveConversion')}</h4>
                     <div className="space-y-2">
                        <div>
                            <label className="text-sm">{t('calculator.rawValue')}</label>
                            <input type="number" value={rawValue} onChange={e => setRawValue(e.target.value)} className={commonInputClasses} />
                        </div>
                        <div>
                            <label className="text-sm">{t('calculator.engValue')}</label>
                            <div className="w-full p-2 bg-white dark:bg-gray-800 rounded-md text-lg font-bold text-indigo-600 dark:text-indigo-400">{engValue} {engUnit}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const Calculator: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<CalculatorTab>('scaler');

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <TabButton label={t('calculator.scalerTitle')} isActive={activeTab === 'scaler'} onClick={() => setActiveTab('scaler')} />
                <TabButton label={t('calculator.motorTitle')} isActive={activeTab === 'motor'} onClick={() => setActiveTab('motor')} />
                <TabButton label={t('calculator.thermalTitle')} isActive={activeTab === 'thermal'} onClick={() => setActiveTab('thermal')} />
            </div>
            
            <div>
                {activeTab === 'scaler' && <ScalerCalculator />}
                {activeTab === 'motor' && <div className="text-center p-8 text-gray-500">{t('calculator.motorTitle')} - Coming Soon</div>}
                {activeTab === 'thermal' && <div className="text-center p-8 text-gray-500">{t('calculator.thermalTitle')} - Coming Soon</div>}
            </div>
        </div>
    );
};
