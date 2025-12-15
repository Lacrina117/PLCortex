
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

type OhmsValue = 'voltage' | 'current' | 'resistance' | 'power';
type Values = Record<OhmsValue, string>;

const OhmsLawWheel: React.FC<{
    inputs: OhmsValue[];
    results: OhmsValue[];
    formulaUsed: string;
}> = React.memo(({ inputs, results, formulaUsed }) => {
    
    const getQuadrantClass = (quadrant: OhmsValue) => {
        if (results.includes(quadrant)) return 'fill-green-500/30';
        if (inputs.includes(quadrant)) return 'fill-blue-500/30';
        return 'fill-gray-200 dark:fill-gray-700';
    };

    const getFormulaClass = (formula: string) => {
        return formulaUsed.includes(formula) ? 'font-bold fill-indigo-500 dark:fill-indigo-400' : 'fill-gray-600 dark:fill-gray-400';
    };

    return (
        <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full max-w-sm">
            <path d="M100 10 A 90 90 0 0 1 190 100 L 100 100 Z" className={`transition-colors duration-300 ${getQuadrantClass('power')}`} />
            <path d="M190 100 A 90 90 0 0 1 100 190 L 100 100 Z" className={`transition-colors duration-300 ${getQuadrantClass('resistance')}`} />
            <path d="M100 190 A 90 90 0 0 1 10 100 L 100 100 Z" className={`transition-colors duration-300 ${getQuadrantClass('current')}`} />
            <path d="M10 100 A 90 90 0 0 1 100 10 L 100 100 Z" className={`transition-colors duration-300 ${getQuadrantClass('voltage')}`} />
            
            <circle cx="100" cy="100" r="65" className="fill-white dark:fill-gray-800" />
            
            <text x="145" y="55" textAnchor="middle" className="font-bold text-[18px] fill-gray-800 dark:fill-gray-200">P</text>
            <text x="145" y="145" textAnchor="middle" className="font-bold text-[18px] fill-gray-800 dark:fill-gray-200">R</text>
            <text x="55" y="145" textAnchor="middle" className="font-bold text-[18px] fill-gray-800 dark:fill-gray-200">I</text>
            <text x="55" y="55" textAnchor="middle" className="font-bold text-[18px] fill-gray-800 dark:fill-gray-200">V</text>

            {/* Formulas */}
            <g className="text-[7px] font-mono" textAnchor="middle">
                {/* Power */}
                <text x="100" y="32" className={getFormulaClass('P=V*I')}>P = V × I</text>
                <text x="100" y="40" className={getFormulaClass('P=V^2/R')}>P = V²/R</text>
                <text x="100" y="48" className={getFormulaClass('P=I^2*R')}>P = I²×R</text>
                {/* Resistance */}
                <text x="150" y="100" className={getFormulaClass('R=V/I')}>R = V/I</text>
                <text x="142" y="108" className={getFormulaClass('R=P/I^2')}>R = P/I²</text>
                <text x="142" y="116" className={getFormulaClass('R=V^2/P')}>R = V²/P</text>
                {/* Current */}
                <text x="100" y="152" className={getFormulaClass('I=V/R')}>I = V/R</text>
                <text x="100" y="160" className={getFormulaClass('I=P/V')}>I = P/V</text>
                <text x="100" y="168" className={getFormulaClass('I=sqrt(P/R)')}>I = √(P/R)</text>
                {/* Voltage */}
                <text x="50" y="100" className={getFormulaClass('V=I*R')}>V = I×R</text>
                <text x="58" y="108" className={getFormulaClass('V=P/I')}>V = P/I</text>
                <text x="58" y="116" className={getFormulaClass('V=sqrt(P*R)')}>V = √(P×R)</text>
            </g>
        </svg>
        </div>
    );
});


export const OhmsLawCalculator: React.FC = () => {
    const { t } = useTranslation();
    const [values, setValues] = useState<Values>({ voltage: '', current: '', resistance: '', power: '' });
    const [userInputFields, setUserInputFields] = useState<OhmsValue[]>([]);
    const [formulaUsed, setFormulaUsed] = useState('');
    
    const resultFields = useMemo(() => {
        if (userInputFields.length < 2) return [];
        return (Object.keys(values) as OhmsValue[]).filter(key => !userInputFields.includes(key));
    }, [userInputFields, values]);

    const calculate = useCallback(() => {
        if (userInputFields.length !== 2) return;

        let newValues: Partial<Values> = {};
        let formula = '';
        const v = parseFloat(values.voltage);
        const i = parseFloat(values.current);
        const r = parseFloat(values.resistance);
        const p = parseFloat(values.power);

        if (userInputFields.includes('voltage') && userInputFields.includes('current')) {
            newValues.resistance = (v / i).toPrecision(4);
            newValues.power = (v * i).toPrecision(4);
            formula = 'R=V/I,P=V*I';
        } else if (userInputFields.includes('voltage') && userInputFields.includes('resistance')) {
            newValues.current = (v / r).toPrecision(4);
            newValues.power = ((v * v) / r).toPrecision(4);
            formula = 'I=V/R,P=V^2/R';
        } else if (userInputFields.includes('voltage') && userInputFields.includes('power')) {
            newValues.current = (p / v).toPrecision(4);
            newValues.resistance = ((v * v) / p).toPrecision(4);
            formula = 'I=P/V,R=V^2/P';
        } else if (userInputFields.includes('current') && userInputFields.includes('resistance')) {
            newValues.voltage = (i * r).toPrecision(4);
            newValues.power = ((i * i) * r).toPrecision(4);
            formula = 'V=I*R,P=I^2*R';
        } else if (userInputFields.includes('current') && userInputFields.includes('power')) {
            newValues.voltage = (p / i).toPrecision(4);
            newValues.resistance = (p / (i * i)).toPrecision(4);
            formula = 'V=P/I,R=P/I^2';
        } else if (userInputFields.includes('resistance') && userInputFields.includes('power')) {
            newValues.voltage = Math.sqrt(p * r).toPrecision(4);
            newValues.current = Math.sqrt(p / r).toPrecision(4);
            formula = 'V=sqrt(P*R),I=sqrt(P/R)';
        }

        // Only update state if values have actually changed to prevent infinite loops/flickering
        let needsUpdate = false;
        (Object.keys(newValues) as OhmsValue[]).forEach(key => {
            if (values[key] !== newValues[key]) {
                needsUpdate = true;
            }
        });

        if (needsUpdate) {
            setValues(prev => ({ ...prev, ...newValues }));
        }
        
        if (formulaUsed !== formula) {
            setFormulaUsed(formula);
        }
    }, [userInputFields, values, formulaUsed]);

    const handleChange = (field: OhmsValue, value: string) => {
        const newValues = { ...values, [field]: value };
        const currentlyUserInput = userInputFields.filter(f => newValues[f] !== '');

        let newUserInputs: OhmsValue[];

        if (value === '') { // Field was cleared
            newUserInputs = userInputFields.filter(f => f !== field);
        } else { // Field was added/changed
            if (currentlyUserInput.length >= 2 && !currentlyUserInput.includes(field)) {
                 // A third field is being added, so remove the oldest input
                const fieldToRemove = currentlyUserInput[0];
                newValues[fieldToRemove] = '';
                newUserInputs = [...currentlyUserInput.slice(1), field];
            } else {
                // Add the new field, ensuring no duplicates
                newUserInputs = [...userInputFields.filter(f => f !== field), field];
            }
        }
        
        setUserInputFields(newUserInputs);

        // Clear all non-input fields immediately for better UX
        (Object.keys(newValues) as OhmsValue[]).forEach(key => {
            if (!newUserInputs.includes(key)) {
                newValues[key] = '';
            }
        });

        setValues(newValues);
    };

    useEffect(() => {
        // We only calculate if we have exactly 2 valid inputs.
        // We do NOT check filledFields.length, because after calculation it will be 4, 
        // which caused the infinite loop/blinking in the previous version.
        const inputsReady = userInputFields.length === 2 && 
                            userInputFields.every(field => values[field] !== '' && !isNaN(parseFloat(values[field])));

        if (inputsReady) {
            calculate();
        } else {
            if (formulaUsed !== '') setFormulaUsed('');
            
            // If inputs are not ready (e.g. user cleared one), ensure calculated fields are cleared.
            // This is a safety check, usually handled by handleChange.
             const clearedValues = { ...values };
             let changed = false;
             (Object.keys(clearedValues) as OhmsValue[]).forEach(key => {
                if(!userInputFields.includes(key)) {
                    if (clearedValues[key] !== '') {
                        clearedValues[key] = '';
                        changed = true;
                    }
                }
             });
             if(changed) setValues(clearedValues);
        }
    }, [userInputFields, calculate, values, formulaUsed]);

    const handleReset = () => {
        setValues({ voltage: '', current: '', resistance: '', power: '' });
        setUserInputFields([]);
        setFormulaUsed('');
    };
    
    const getInputClass = (field: OhmsValue) => {
        const base = "w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-lg font-mono ";
        if (resultFields.includes(field)) {
            return base + "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300";
        }
        if (userInputFields.includes(field)) {
            return base + "bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600";
        }
        return base + "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600";
    };

    return (
         <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('calculator.ohmsLaw.title')}</h2>
            <p className="mt-2 mb-8 text-gray-500 dark:text-gray-400">{t('calculator.ohmsLaw.description')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('calculator.ohmsLaw.voltage')}</label>
                        <input type="number" value={values.voltage} onChange={e => handleChange('voltage', e.target.value)} className={getInputClass('voltage')} placeholder="V" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('calculator.ohmsLaw.current')}</label>
                        <input type="number" value={values.current} onChange={e => handleChange('current', e.target.value)} className={getInputClass('current')} placeholder="A" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('calculator.ohmsLaw.resistance')}</label>
                        <input type="number" value={values.resistance} onChange={e => handleChange('resistance', e.target.value)} className={getInputClass('resistance')} placeholder="Ω" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('calculator.ohmsLaw.power')}</label>
                        <input type="number" value={values.power} onChange={e => handleChange('power', e.target.value)} className={getInputClass('power')} placeholder="W" />
                    </div>
                    <div className="pt-2">
                        <button onClick={handleReset} className="w-full px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                            {t('calculator.ohmsLaw.reset')}
                        </button>
                    </div>
                </div>

                <div>
                    <OhmsLawWheel inputs={userInputFields} results={resultFields} formulaUsed={formulaUsed} />
                </div>
            </div>
        </div>
    );
};
