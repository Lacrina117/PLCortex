import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { MarkdownRenderer } from './MarkdownRenderer';

type Platform = 'custom' | 'abCompactLogix' | 'abMicroLogix' | 'siemensS7_1200' | 'genericVoltage' | 'genericCurrent';

const platformPresets: { [key in Platform]: { rawMin: number; rawMax: number } } = {
  custom: { rawMin: 0, rawMax: 100 },
  abCompactLogix: { rawMin: 6240, rawMax: 31200 },
  abMicroLogix: { rawMin: 3277, rawMax: 16383 },
  siemensS7_1200: { rawMin: 5530, rawMax: 27648 },
  genericVoltage: { rawMin: 0, rawMax: 10 },
  genericCurrent: { rawMin: 4, rawMax: 20 },
};

const predefinedUnits = [
    '°C', '°F', 'K',
    'PSI', 'bar', 'kPa', 'inH2O',
    'GPM', 'L/min', 'm³/h',
    '%', 'Hz', 'RPM',
    'in', 'mm', 'ft', 'm',
    'Nm', 'ft-lb'
];

const SignalScaler: React.FC = () => {
    const { t } = useTranslation();
    const [platform, setPlatform] = useState<Platform>('abCompactLogix');
    const [rawMin, setRawMin] = useState(platformPresets.abCompactLogix.rawMin.toString());
    const [rawMax, setRawMax] = useState(platformPresets.abCompactLogix.rawMax.toString());
    const [engMin, setEngMin] = useState('0');
    const [engMax, setEngMax] = useState('150');
    const [engUnit, setEngUnit] = useState('°C');
    const [currentRaw, setCurrentRaw] = useState('');
    const [currentEng, setCurrentEng] = useState('');
    const [showCode, setShowCode] = useState(false);

    useEffect(() => {
        if (platform !== 'custom') {
            const preset = platformPresets[platform];
            setRawMin(preset.rawMin.toString());
            setRawMax(preset.rawMax.toString());
        }
    }, [platform]);

    const calculate = useCallback((value: string, from: 'raw' | 'eng') => {
        const rMin = parseFloat(rawMin);
        const rMax = parseFloat(rawMax);
        const eMin = parseFloat(engMin);
        const eMax = parseFloat(engMax);
        const val = parseFloat(value);

        if ([rMin, rMax, eMin, eMax, val].some(isNaN) || rMax === rMin) {
            return '';
        }

        let result: number;
        if (from === 'raw') {
            result = ((val - rMin) * (eMax - eMin) / (rMax - rMin)) + eMin;
        } else {
            result = ((val - eMin) * (rMax - rMin) / (eMax - eMin)) + rMin;
        }

        return isFinite(result) ? result.toFixed(4).replace(/\.0000$/, '') : '';
    }, [rawMin, rawMax, engMin, engMax]);

    const generatedCode = useMemo(() => {
        const rMin = parseFloat(rawMin);
        const rMax = parseFloat(rawMax);
        const eMin = parseFloat(engMin);
        const eMax = parseFloat(engMax);
        if ([rMin, rMax, eMin, eMax].some(isNaN)) return { st: '', ld: '' };
        
        const rawSpan = rMax - rMin;
        const engSpan = eMax - eMin;

        const st = t('calculator.stCodeTemplate', {
            engUnit: engUnit || 'Engineering',
            rawMin: rMin,
            engMax: eMax,
            engMin: eMin,
            rawMax: rMax,
        });

        const ld = t('calculator.ldCodeTemplate', {
            rawMin: rMin,
            engSpan,
            rawSpan,
            engMin: eMin,
            rawMax: rMax,
            engMax: eMax,
        });

        return { st, ld };
    }, [rawMin, rawMax, engMin, engMax, engUnit, t]);

    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    const disabledInputClasses = "disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:cursor-not-allowed";

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-1">{t('calculator.platform')}</label>
                <select value={platform} onChange={e => setPlatform(e.target.value as Platform)} className={commonInputClasses}>
                    {Object.keys(platformPresets).map(key => (
                        <option key={key} value={key}>{t(`calculator.presets.${key}`)}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <fieldset className="space-y-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <legend className="px-2 font-semibold">{t('calculator.rawRange')}</legend>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-medium mb-1">{t('calculator.min')}</label>
                            <input type="number" value={rawMin} onChange={e => setRawMin(e.target.value)} disabled={platform !== 'custom'} className={`${commonInputClasses} ${platform !== 'custom' ? disabledInputClasses : ''}`} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">{t('calculator.max')}</label>
                            <input type="number" value={rawMax} onChange={e => setRawMax(e.target.value)} disabled={platform !== 'custom'} className={`${commonInputClasses} ${platform !== 'custom' ? disabledInputClasses : ''}`} />
                        </div>
                    </div>
                </fieldset>

                <fieldset className="space-y-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <legend className="px-2 font-semibold">{t('calculator.engRange')}</legend>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-medium mb-1">{t('calculator.min')}</label>
                            <input type="number" value={engMin} onChange={e => setEngMin(e.target.value)} className={commonInputClasses} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1">{t('calculator.max')}</label>
                            <input type="number" value={engMax} onChange={e => setEngMax(e.target.value)} className={commonInputClasses} />
                        </div>
                    </div>
                     <div className="pt-1">
                        <label className="block text-xs font-medium mb-1">{t('calculator.unit')}</label>
                        <select value={engUnit} onChange={e => setEngUnit(e.target.value)} className={commonInputClasses}>
                            {predefinedUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </select>
                    </div>
                </fieldset>
            </div>
            
            <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <legend className="px-2 font-semibold">{t('calculator.liveConversion')}</legend>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.rawValue')}</label>
                        <input type="number" value={currentRaw} onChange={e => {setCurrentRaw(e.target.value); setCurrentEng(calculate(e.target.value, 'raw'))}} className={commonInputClasses} />
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 mt-4 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h4m0 0l4 4m-4-4v10m0 0l-4-4m4 4h4" /></svg>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.engValue')}</label>
                        <input type="number" value={currentEng} onChange={e => {setCurrentEng(e.target.value); setCurrentRaw(calculate(e.target.value, 'eng'))}} className={commonInputClasses} />
                    </div>
                </div>
            </fieldset>

            <div>
                <button onClick={() => setShowCode(!showCode)} className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    {t('calculator.generateCode')}
                </button>
            </div>
            {showCode && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold">{t('calculator.codeOutput')}</h3>
                    <div>
                        <h4 className="font-medium text-sm mb-1">{t('calculator.stDescription')}</h4>
                        <div className="prose prose-sm max-w-none dark:prose-invert"><MarkdownRenderer markdownText={`\`\`\`iecst\n${generatedCode.st}\n\`\`\``} /></div>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm mb-1">{t('calculator.ldDescription')}</h4>
                        <div className="prose prose-sm max-w-none dark:prose-invert"><MarkdownRenderer markdownText={generatedCode.ld} /></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const UnitConverter: React.FC = () => {
    const { t } = useTranslation();
    const [type, setType] = useState('pressure');
    const [values, setValues] = useState<Record<string, string>>({});

    const handleConversion = (fromUnit: string, fromValue: string) => {
        const val = parseFloat(fromValue);
        if (isNaN(val)) {
            setValues({});
            return;
        }

        let newValues: Record<string, number> = {};
        switch (type) {
            case 'pressure':
                const bar = fromUnit === 'psi' ? val / 14.5038 : fromUnit === 'kpa' ? val / 100 : val;
                newValues = { psi: bar * 14.5038, bar, kpa: bar * 100 };
                break;
            case 'temperature':
                const celsius = fromUnit === 'f' ? (val - 32) * 5/9 : fromUnit === 'k' ? val - 273.15 : val;
                newValues = { c: celsius, f: celsius * 9/5 + 32, k: celsius + 273.15 };
                break;
            case 'flow':
                const lpm = fromUnit === 'gpm' ? val * 3.78541 : fromUnit === 'm3h' ? val * 16.6667 : val;
                newValues = { lpm, gpm: lpm / 3.78541, m3h: lpm / 16.6667 };
                break;
            case 'distance':
                const mm = fromUnit === 'in' ? val * 25.4 : fromUnit === 'ft' ? val * 304.8 : val;
                newValues = { mm, in: mm / 25.4, ft: mm / 304.8 };
                break;
            case 'torque':
                 const nm = fromUnit === 'ftlb' ? val * 1.35582 : val;
                 newValues = { nm, ftlb: nm / 1.35582 };
                 break;
        }
        
        const formattedValues: Record<string, string> = {};
        for (const key in newValues) {
            formattedValues[key] = newValues[key].toFixed(4).replace(/\.0000$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
        }
        setValues(formattedValues);
    };

    const converters: Record<string, {unit: string, label: string}[]> = {
        pressure: [{unit: 'psi', label: 'PSI'}, {unit: 'bar', label: 'bar'}, {unit: 'kpa', label: 'kPa'}],
        temperature: [{unit: 'c', label: '°C'}, {unit: 'f', label: '°F'}, {unit: 'k', label: 'K'}],
        flow: [{unit: 'lpm', label: 'L/min'}, {unit: 'gpm', label: 'GPM'}, {unit: 'm3h', label: 'm³/h'}],
        distance: [{unit: 'mm', label: 'mm'}, {unit: 'in', label: 'in'}, {unit: 'ft', label: 'ft'}],
        torque: [{unit: 'nm', label: 'Nm'}, {unit: 'ftlb', label: 'ft-lb'}],
    };

    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    
    return (
        <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium mb-1">{t('calculator.measurementType')}</label>
                <select value={type} onChange={e => {setType(e.target.value); setValues({});}} className={commonInputClasses}>
                    <option value="pressure">{t('calculator.pressure')}</option>
                    <option value="temperature">{t('calculator.temperature')}</option>
                    <option value="flow">{t('calculator.flow')}</option>
                    <option value="distance">{t('calculator.distance')}</option>
                    <option value="torque">{t('calculator.torque')}</option>
                </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {converters[type].map(({unit, label}) => (
                    <div key={unit}>
                        <label className="block text-sm font-medium mb-1">{label}</label>
                        <input type="number" value={values[unit] || ''} onChange={e => handleConversion(unit, e.target.value)} className={commonInputClasses} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const SensorHelper: React.FC = () => {
    const { t } = useTranslation();
    const [resistance, setResistance] = useState('');
    
    const temperature = useMemo(() => {
        const R = parseFloat(resistance);
        if (isNaN(R) || R < 0) return '';
        
        const R0 = 100.0;
        const A = 3.9083e-3;
        const B = -5.775e-7;

        // Simplified Callendar-Van Dusen for T >= 0 C
        if (R < R0) return t('calculator.pt100Description'); // Not valid for this simplified formula
        const temp = (-R0 * A + Math.sqrt(Math.pow(R0 * A, 2) - 4 * R0 * B * (R0 - R))) / (2 * R0 * B);
        return isFinite(temp) ? temp.toFixed(2) : '';
    }, [resistance, t]);
    
    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    
    return(
        <div className="space-y-4">
            <h3 className="font-semibold">{t('calculator.pt100Title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1">{t('calculator.resistance')}</label>
                    <input type="number" value={resistance} onChange={e => setResistance(e.target.value)} className={commonInputClasses} placeholder="e.g., 107.79"/>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">{t('calculator.temperatureResult')}</label>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md h-[42px] flex items-center font-mono">{temperature}</div>
                </div>
            </div>
             <p className="text-xs text-gray-500 dark:text-gray-400">{t('calculator.pt100Description')}</p>
        </div>
    );
};

const MotorProtectionCalculator: React.FC = () => {
    const { t } = useTranslation();
    const [power, setPower] = useState('5');
    const [voltage, setVoltage] = useState('460');

    const flaTable: { [volt: string]: { [hp: string]: number } } = {
        '230': { '0.5': 2.2, '1': 3.6, '2': 6.8, '3': 9.6, '5': 15.2, '10': 28, '20': 54, '50': 130 },
        '460': { '0.5': 1.1, '1': 1.8, '2': 3.4, '3': 4.8, '5': 7.6, '10': 14, '20': 27, '50': 65 },
        '575': { '0.5': 0.9, '1': 1.4, '2': 2.7, '3': 3.9, '5': 6.1, '10': 11, '20': 22, '50': 52 },
    };
    const ampacityTable: { awg: string, amp: number }[] = [ {awg: '14', amp: 20}, {awg: '12', amp: 25}, {awg: '10', amp: 35}, {awg: '8', amp: 50}, {awg: '6', amp: 65}, {awg: '4', amp: 85}, {awg: '2', amp: 115}, {awg: '1/0', amp: 150}, {awg: '2/0', amp: 175} ];
    const breakerSizes = [15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250];

    const results = useMemo(() => {
        const p = parseFloat(power);
        if (isNaN(p) || !flaTable[voltage] || !flaTable[voltage][power]) return null;

        const fla = flaTable[voltage][power];
        const minConductorAmps = fla * 1.25;
        const conductor = ampacityTable.find(row => row.amp >= minConductorAmps)?.awg || 'N/A';
        const overloadMin = fla * 1.15;
        const overloadMax = fla * 1.25;
        const breakerMax = fla * 2.5;
        const breaker = breakerSizes.find(size => size >= breakerMax) || breakerSizes[breakerSizes.length - 1];
        const fuseMax = fla * 1.75;
        const fuse = breakerSizes.find(size => size >= fuseMax) || breakerSizes[breakerSizes.length-1];

        return { fla, conductor, overloadMin, overloadMax, breaker, fuse };
    }, [power, voltage]);

    const ResultCard: React.FC<{title:string; value:string; description:string;}> = ({title, value, description}) => (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
        </div>
    )

    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    
    return (
        <div className="space-y-6">
            <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <legend className="px-2 font-semibold">{t('calculator.motor.motorDetails')}</legend>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.motor.power')} (HP)</label>
                        <select value={power} onChange={e => setPower(e.target.value)} className={commonInputClasses}>
                            {Object.keys(flaTable['460']).map(hp => <option key={hp} value={hp}>{hp} HP</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('calculator.motor.voltage')}</label>
                        <select value={voltage} onChange={e => setVoltage(e.target.value)} className={commonInputClasses}>
                            {Object.keys(flaTable).map(volt => <option key={volt} value={volt}>{volt}V ({t('calculator.motor.threePhase')})</option>)}
                        </select>
                    </div>
                </div>
            </fieldset>

            {results && (
                <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <legend className="px-2 font-semibold">{t('calculator.motor.results')}</legend>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <ResultCard title={t('calculator.motor.fla')} value={`${results.fla} A`} description="NEC 430.250" />
                        <ResultCard title={t('calculator.motor.conductor')} value={`${results.conductor} AWG`} description={t('calculator.motor.conductorDesc')} />
                        <ResultCard title={t('calculator.motor.breaker')} value={`${results.breaker} A`} description={t('calculator.motor.breakerDesc')} />
                        <ResultCard title={t('calculator.motor.overload')} value={`${results.overloadMin.toFixed(1)}-${results.overloadMax.toFixed(1)} A`} description={t('calculator.motor.overloadDesc')} />
                    </div>
                    <p className="text-xs text-center mt-4 text-gray-400 dark:text-gray-500">{t('calculator.motor.basedOnNEC')}</p>
                </fieldset>
            )}
        </div>
    );
};

const CabinetThermalCalculator: React.FC = () => {
    const {t} = useTranslation();
    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    
    const [internalHeat, setInternalHeat] = useState('250');
    const [dims, setDims] = useState({h: '600', w: '600', d: '200'}); // mm
    const [temps, setTemps] = useState({ti: '35', te: '30'}); // Celsius
    const [mounting, setMounting] = useState('freestanding');
    const [material, setMaterial] = useState('paintedSteel');

    const heatTransferCoefficients: {[key:string]: number} = {
        paintedSteel: 5.5,
        stainlessSteel: 3.7,
        aluminum: 12.0,
        plastic: 3.5,
    };

    const results = useMemo(() => {
        const h = parseFloat(dims.h) / 1000;
        const w = parseFloat(dims.w) / 1000;
        const d = parseFloat(dims.d) / 1000;
        const ti = parseFloat(temps.ti);
        const te = parseFloat(temps.te);
        const Pi = parseFloat(internalHeat);

        if([h,w,d,ti,te,Pi].some(isNaN) || te >= ti) return null;

        let area = 0; // Effective surface area in m^2
        switch(mounting) {
            case 'freestanding': area = 1.8 * h * w + 1.8 * h * d + 1.4 * w * d; break;
            case 'wall': area = 1.4 * h * w + 1.8 * h * d + 1.8 * w * d; break;
            case 'ground': area = 1.8 * h * w + 1.8 * h * d + 1.4 * w * d; break;
            case 'groundAndWall': area = 1.8 * h * w + 1.4 * h * d + 1.4 * w * d; break;
        }

        const k = heatTransferCoefficients[material];
        const deltaT = ti - te;

        const heatLoss = k * area * deltaT; // Watts
        const coolingRequired = Pi - heatLoss; // Watts

        let recommendation = '';
        if (coolingRequired <= 0) {
            recommendation = t('calculator.thermal.noCooling');
        } else {
            const cfm = (3.16 * coolingRequired) / deltaT; // Using Celsius delta T is fine for this formula's ratio
            const btu = coolingRequired * 3.41;
            
            recommendation = `${t('calculator.thermal.fanReq', { cfm: Math.ceil(cfm) })} ${t('calculator.or')} ${t('calculator.thermal.acReq', { btu: Math.ceil(btu / 100) * 100 })}`;
        }

        return { heatGainLoss: heatLoss, coolingRequired, recommendation };
    }, [dims, temps, internalHeat, mounting, material, t]);

    return (
        <div className="space-y-6">
            <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <legend className="px-2 font-semibold">{t('calculator.thermal.totalHeat')}</legend>
                 <div className="flex items-center gap-2">
                    <input type="number" value={internalHeat} onChange={e => setInternalHeat(e.target.value)} className={commonInputClasses} />
                     <span className="font-medium">Watts</span>
                </div>
            </fieldset>

            <div className="grid md:grid-cols-2 gap-6">
                 <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <legend className="px-2 font-semibold">{t('calculator.thermal.cabinetDetails')}</legend>
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <div><label className="block text-xs font-medium mb-1">{t('calculator.thermal.height')} (mm)</label><input type="number" value={dims.h} onChange={e => setDims(p=>({...p, h: e.target.value}))} className={commonInputClasses}/></div>
                            <div><label className="block text-xs font-medium mb-1">{t('calculator.thermal.width')} (mm)</label><input type="number" value={dims.w} onChange={e => setDims(p=>({...p, w: e.target.value}))} className={commonInputClasses}/></div>
                            <div><label className="block text-xs font-medium mb-1">{t('calculator.thermal.depth')} (mm)</label><input type="number" value={dims.d} onChange={e => setDims(p=>({...p, d: e.target.value}))} className={commonInputClasses}/></div>
                        </div>
                        <div><label className="block text-xs font-medium mb-1">{t('calculator.thermal.mountingType')}</label><select value={mounting} onChange={e => setMounting(e.target.value)} className={commonInputClasses}><option value="freestanding">{t('calculator.thermal.mount.freestanding')}</option><option value="wall">{t('calculator.thermal.mount.wall')}</option><option value="ground">{t('calculator.thermal.mount.ground')}</option><option value="groundAndWall">{t('calculator.thermal.mount.groundAndWall')}</option></select></div>
                        {/* FIX: Updated translation keys to use `materials` sub-object to resolve duplicate key error. */}
                        <div><label className="block text-xs font-medium mb-1">{t('calculator.thermal.material')}</label><select value={material} onChange={e => setMaterial(e.target.value)} className={commonInputClasses}><option value="paintedSteel">{t('calculator.thermal.materials.paintedSteel')}</option><option value="stainlessSteel">{t('calculator.thermal.materials.stainlessSteel')}</option><option value="aluminum">{t('calculator.thermal.materials.aluminum')}</option><option value="plastic">{t('calculator.thermal.materials.plastic')}</option></select></div>
                    </div>
                </fieldset>
                 <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <legend className="px-2 font-semibold">{t('calculator.thermal.tempDetails')}</legend>
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="block text-xs font-medium mb-1">{t('calculator.thermal.internalTemp')} (°C)</label><input type="number" value={temps.ti} onChange={e => setTemps(p=>({...p, ti: e.target.value}))} className={commonInputClasses}/></div>
                        <div><label className="block text-xs font-medium mb-1">{t('calculator.thermal.externalTemp')} (°C)</label><input type="number" value={temps.te} onChange={e => setTemps(p=>({...p, te: e.target.value}))} className={commonInputClasses}/></div>
                    </div>
                </fieldset>
            </div>
            
            {results && (
                 <fieldset className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <legend className="px-2 font-semibold">{t('calculator.thermal.results')}</legend>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-center space-y-2">
                        <p className="text-lg font-semibold">{results.recommendation}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                           {t('calculator.thermal.heatGain')}: {results.heatGainLoss.toFixed(0)}W | {t('calculator.thermal.coolingReq')}: {results.coolingRequired.toFixed(0)}W
                        </p>
                    </div>
                 </fieldset>
            )}
        </div>
    );
};

export const Calculator: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'scaler' | 'converter' | 'sensor' | 'motor' | 'thermal'>('motor');

  const tabs = [
    { id: 'motor', label: t('calculator.motorTitle') },
    { id: 'thermal', label: t('calculator.thermalTitle') },
    { id: 'scaler', label: t('calculator.scalerTitle') },
    { id: 'converter', label: t('calculator.converterTitle') },
    { id: 'sensor', label: t('calculator.sensorTitle') },
  ];
  
  const baseTabClass = "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors";
  const activeTabClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-t border-x -mb-px text-indigo-600 dark:text-indigo-400";
  const inactiveTabClass = "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-transparent";


  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        className={`whitespace-nowrap ${baseTabClass} ${activeTab === tab.id ? activeTabClass : inactiveTabClass}`}>
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
        <div className="pt-6">
            {activeTab === 'scaler' && <SignalScaler />}
            {activeTab === 'converter' && <UnitConverter />}
            {activeTab === 'sensor' && <SensorHelper />}
            {activeTab === 'motor' && <MotorProtectionCalculator />}
            {activeTab === 'thermal' && <CabinetThermalCalculator />}
        </div>
    </div>
  );
};