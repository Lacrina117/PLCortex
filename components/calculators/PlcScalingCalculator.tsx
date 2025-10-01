import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { plcScalingPresets } from '../../constants/automationData';

type CodeLang = 'st' | 'ld' | 'fbd';

const linearScale = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
    if (inMax - inMin === 0) return outMin;
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export const PlcScalingCalculator: React.FC = () => {
    const { t } = useTranslation();
    
    const [rawMin, setRawMin] = useState('4000');
    const [rawMax, setRawMax] = useState('20000');
    const [euMin, setEuMin] = useState('0');
    const [euMax, setEuMax] = useState('60');
    const [selectedRawPreset, setSelectedRawPreset] = useState('raw_rockwell_4_20ma');
    const [selectedEuPreset, setSelectedEuPreset] = useState('eng_freq_60hz');
    const [clampOutput, setClampOutput] = useState(true);
    const [selectedCodeLang, setSelectedCodeLang] = useState<CodeLang>('st');

    const [testerRawValue, setTesterRawValue] = useState('');
    const [testerEuValue, setTesterEuValue] = useState('');
    
    const [alarms, setAlarms] = useState({ hh: '', h: '', l: '', ll: '' });

    useEffect(() => {
        const preset = plcScalingPresets.raw.find(p => p.key === selectedRawPreset);
        if (preset && preset.key !== 'custom') {
            setRawMin(preset.min);
            setRawMax(preset.max);
        }
    }, [selectedRawPreset]);
    
    useEffect(() => {
        const preset = plcScalingPresets.engineering.find(p => p.key === selectedEuPreset);
        if (preset && preset.key !== 'custom') {
            setEuMin(preset.min);
            setEuMax(preset.max);
        }
    }, [selectedEuPreset]);

    useEffect(() => {
        setTesterRawValue(rawMin);
        setTesterEuValue(euMin);
    }, [rawMin, euMin]);

    const { numRawMin, numRawMax, numEuMin, numEuMax, isValid } = useMemo(() => {
        const rm = parseFloat(rawMin);
        const rM = parseFloat(rawMax);
        const em = parseFloat(euMin);
        const eM = parseFloat(euMax);
        const valid = ![rm, rM, em, eM].some(isNaN) && rM !== rm;
        return { numRawMin: rm, numRawMax: rM, numEuMin: em, numEuMax: eM, isValid: valid };
    }, [rawMin, rawMax, euMin, euMax]);

    const handleTesterConversion = (direction: 'rawToEu' | 'euToRaw', value: string) => {
        if (!isValid) return;
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        if (direction === 'rawToEu') {
            setTesterRawValue(value);
            const result = linearScale(numValue, numRawMin, numRawMax, numEuMin, numEuMax);
            setTesterEuValue(result.toString());
        } else {
            setTesterEuValue(value);
            const result = linearScale(numValue, numEuMin, numEuMax, numRawMin, numRawMax);
            setTesterRawValue(result.toString());
        }
    };

    const alarmRawValues = useMemo(() => {
        if (!isValid) return { hh: '...', h: '...', l: '...', ll: '...' };
        return {
            hh: alarms.hh ? linearScale(parseFloat(alarms.hh), numEuMin, numEuMax, numRawMin, numRawMax).toFixed(0) : '',
            h: alarms.h ? linearScale(parseFloat(alarms.h), numEuMin, numEuMax, numRawMin, numRawMax).toFixed(0) : '',
            l: alarms.l ? linearScale(parseFloat(alarms.l), numEuMin, numEuMax, numRawMin, numRawMax).toFixed(0) : '',
            ll: alarms.ll ? linearScale(parseFloat(alarms.ll), numEuMin, numEuMax, numRawMin, numRawMax).toFixed(0) : '',
        };
    }, [alarms, isValid, numEuMin, numEuMax, numRawMin, numRawMax]);

    const codeSamples = useMemo(() => {
        if (!isValid) return { st: '// Invalid Ranges', ld: 'Invalid Ranges', fbd: 'Invalid Ranges' };
        
        const clampingLogicST = `(* ${t('calculator.plcScaling.codeComments.clamp')} *)
IF ScaledValue > EUMax THEN
    ScaledValue := EUMax;
ELSIF ScaledValue < EUMin THEN
    ScaledValue := EUMin;
END_IF;`;

        const st = `(* ${t('calculator.plcScaling.codeComments.declarations')} *)
VAR
    RawValue    : INT;  (* ${t('calculator.plcScaling.codeComments.rawValue')} *)
    ScaledValue : REAL; (* ${t('calculator.plcScaling.codeComments.scaledValue')} *)
    
    (* ${t('calculator.plcScaling.codeComments.scalingConstants')} *)
    RawMin : REAL := ${numRawMin}.0;
    RawMax : REAL := ${numRawMax}.0;
    EUMin  : REAL := ${numEuMin}.0;
    EUMax  : REAL := ${numEuMax}.0;
    
    (* ${t('calculator.plcScaling.codeComments.tempVar')} *)
    RawAsReal : REAL;
END_VAR

(* ${t('calculator.plcScaling.codeComments.logic')} *)
(* ${t('calculator.plcScaling.codeComments.convertToReal')} *)
RawAsReal := INT_TO_REAL(RawValue);

(* ${t('calculator.plcScaling.codeComments.applyFormula')} *)
ScaledValue := ((RawAsReal - RawMin) / (RawMax - RawMin)) * (EUMax - EUMin) + EUMin;
${clampOutput ? `\n${clampingLogicST}` : ''}`;

        const ld = `Use REAL tags for all math instructions.
1. (SUB) Subtract RawMin (${numRawMin}) from RawValue. -> TempReal1
2. (MUL) Multiply TempReal1 by EU span (${(numEuMax - numEuMin).toFixed(2)}). -> TempReal2
3. (DIV) Divide TempReal2 by Raw span (${(numRawMax - numRawMin).toFixed(2)}). -> TempReal3
4. (ADD) Add EUMin (${numEuMin}) to TempReal3. -> ScaledValue
${clampOutput ? `5. (LIMIT) Clamp ScaledValue between EUMin (${numEuMin}) and EUMax (${numEuMax}).` : ''}`;

        const fbd = `Chain the following function blocks (using REAL data types):
1. SUB(IN1:=RawValue, IN2:=RawMin) -> out
2. MUL(IN1:=SUB.out, IN2:=EU_Span) -> out
3. DIV(IN1:=MUL.out, IN2:=Raw_Span) -> out
4. ADD(IN1:=DIV.out, IN2:=EUMin) -> ScaledValue
${clampOutput ? `5. LIMIT(IN:=ADD.out, MN:=EUMin, MX:=EUMax) -> FinalValue` : ''}`;
        
        return { st, ld, fbd };
    }, [isValid, numRawMin, numRawMax, numEuMin, numEuMax, clampOutput, t]);

    const rawUnit = plcScalingPresets.raw.find(p => p.key === selectedRawPreset)?.unit || 'counts';
    const euUnit = plcScalingPresets.engineering.find(p => p.key === selectedEuPreset)?.unit || 'EU';
    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";

    const testerDot = useMemo(() => {
        if (!isValid) return null;
        const raw = parseFloat(testerRawValue);
        const eu = parseFloat(testerEuValue);
        if (isNaN(raw) || isNaN(eu)) return null;

        const x = linearScale(raw, numRawMin, numRawMax, 10, 90);
        const y = 100 - linearScale(eu, numEuMin, numEuMax, 10, 90);
        
        return { cx: x, cy: y };
    }, [testerRawValue, testerEuValue, isValid, numRawMin, numRawMax, numEuMin, numEuMax]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('calculator.plcScaling.title')}</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{t('calculator.plcScaling.description')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <fieldset><legend className="text-lg font-semibold mb-2">{t('calculator.plcScaling.inputRange')}</legend>
                        <select value={selectedRawPreset} onChange={e => setSelectedRawPreset(e.target.value)} className={`${commonInputClasses} mb-2`}>
                            {plcScalingPresets.raw.map(p => <option key={p.key} value={p.key}>{t(`calculator.plcScaling.units.${p.translationKey}`)}</option>)}
                        </select>
                        <div className="flex gap-4">
                            <input type="number" step="any" value={rawMin} onChange={e => {setRawMin(e.target.value); setSelectedRawPreset('custom');}} className={commonInputClasses} aria-label={t('calculator.plcScaling.min')}/>
                            <input type="number" step="any" value={rawMax} onChange={e => {setRawMax(e.target.value); setSelectedRawPreset('custom');}} className={commonInputClasses} aria-label={t('calculator.plcScaling.max')}/>
                        </div>
                    </fieldset>
                     <fieldset><legend className="text-lg font-semibold mb-2">{t('calculator.plcScaling.outputRange')}</legend>
                        <select value={selectedEuPreset} onChange={e => setSelectedEuPreset(e.target.value)} className={`${commonInputClasses} mb-2`}>
                            {plcScalingPresets.engineering.map(p => <option key={p.key} value={p.key}>{t(`calculator.plcScaling.units.${p.translationKey}`)} ({p.unit})</option>)}
                        </select>
                        <div className="flex gap-4">
                            <input type="number" step="any" value={euMin} onChange={e => {setEuMin(e.target.value); setSelectedEuPreset('custom');}} className={commonInputClasses} aria-label={t('calculator.plcScaling.min')}/>
                            <input type="number" step="any" value={euMax} onChange={e => {setEuMax(e.target.value); setSelectedEuPreset('custom');}} className={commonInputClasses} aria-label={t('calculator.plcScaling.max')}/>
                        </div>
                    </fieldset>
                     <fieldset><legend className="text-lg font-semibold">{t('calculator.plcScaling.options')}</legend>
                        <div className="flex items-center gap-2 mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                           <input id="clamping-checkbox" type="checkbox" checked={clampOutput} onChange={e => setClampOutput(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                           <label htmlFor="clamping-checkbox" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('calculator.plcScaling.clamping')}</label>
                        </div>
                    </fieldset>
                </div>
                {/* Results */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold">{t('calculator.plcScaling.resultsTitle')}</h3>
                    <div>
                        <h4 className="font-semibold text-sm mb-1">{t('calculator.plcScaling.formula')}</h4>
                        <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md text-center font-mono text-sm space-y-2">
                           <p>EU = (((Raw - Raw<sub>Min</sub>) / (Raw<sub>Max</sub> - Raw<sub>Min</sub>)) * (EU<sub>Max</sub> - EU<sub>Min</sub>)) + EU<sub>Min</sub></p>
                           <p className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-800 dark:text-indigo-200">{euUnit} = (((Raw - {rawMin}) * ({euMax} - {euMin})) / ({rawMax} - {rawMin})) + {euMin}</p>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-sm mb-1">{t('calculator.plcScaling.codeSample')}</h4>
                        <div className="border-b border-gray-200 dark:border-gray-700">
                             <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                                {(['st', 'ld', 'fbd'] as CodeLang[]).map(lang => (
                                    <button key={lang} onClick={() => setSelectedCodeLang(lang)} className={`${selectedCodeLang === lang ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>{t(`calculator.plcScaling.codeLang.${lang}`)}</button>
                                ))}
                             </nav>
                        </div>
                        <pre className="mt-2 p-3 bg-gray-900 dark:bg-gray-950 rounded-md text-xs text-gray-200 whitespace-pre-wrap max-h-60 overflow-y-auto"><code>{codeSamples[selectedCodeLang]}</code></pre>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4">{t('calculator.plcScaling.interactiveTester')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                           <input type="number" step="any" value={testerRawValue} onChange={e => handleTesterConversion('rawToEu', e.target.value)} className={commonInputClasses} aria-label="Raw Test Input"/><span>{rawUnit}</span>
                           <span>&harr;</span>
                           <input type="number" step="any" value={testerEuValue} onChange={e => handleTesterConversion('euToRaw', e.target.value)} className={commonInputClasses} aria-label="EU Test Input"/><span>{euUnit}</span>
                       </div>
                    </div>
                    <div className="w-full aspect-square bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-xs">
                           <path d="M 10 10 L 10 90 L 90 90" fill="none" className="stroke-gray-300 dark:stroke-gray-600" strokeWidth="0.5"/>
                           <text x="50" y="98" textAnchor="middle" className="fill-current">{rawUnit}</text>
                           <text x="5" y="50" textAnchor="middle" transform="rotate(-90 5 50)" className="fill-current">{euUnit}</text>
                           <text x="10" y="94" textAnchor="middle" className="fill-current text-[8px]">{rawMin}</text>
                           <text x="90" y="94" textAnchor="end" className="fill-current text-[8px]">{rawMax}</text>
                           <text x="8" y="90" textAnchor="end" className="fill-current text-[8px]">{euMin}</text>
                           <text x="8" y="12" textAnchor="end" className="fill-current text-[8px]">{euMax}</text>
                           {isValid && <line x1="10" y1="90" x2="90" y2="10" className="stroke-indigo-500" strokeWidth="1" />}
                           {testerDot && <circle cx={testerDot.cx} cy={testerDot.cy} r="2" className="fill-red-500" />}
                        </svg>
                    </div>
                </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold">{t('calculator.plcScaling.alarmCalculator')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('calculator.plcScaling.alarmDesc')}</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(['hh', 'h', 'l', 'll'] as const).map(key => (
                        <div key={key}>
                            <label className="block text-sm font-medium mb-1">{t(`calculator.plcScaling.alarm${key.toUpperCase()}`)}</label>
                            <div className="flex items-center gap-2">
                               <input type="number" step="any" value={alarms[key]} onChange={e => setAlarms(p => ({...p, [key]: e.target.value}))} className={commonInputClasses} placeholder={euUnit} />
                               <span>&rarr;</span>
                               <input type="text" value={alarmRawValues[key]} readOnly className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700/50`} placeholder={rawUnit}/>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};