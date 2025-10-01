import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

type PlcMode = '1x' | '4x';
type Mechanism = 'direct' | 'gearbox' | 'leadscrew' | 'pulley' | 'rack';
type LinearUnit = 'mm' | 'in';
type PitchUnit = 'mm_rev' | 'in_rev';
type SpeedUnit = 'm_s' | 'mm_s' | 'rpm';
type DiagnosisStatus = 'ok' | 'caution' | 'critical';

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="group relative flex items-center justify-center ml-2">
        <span className="h-4 w-4 flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold cursor-help">?</span>
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            {text}
        </span>
    </div>
);

export const EncoderMotionCalculator: React.FC = () => {
    const { t } = useTranslation();

    // Input States
    const [ppr, setPpr] = useState('1024');
    const [plcMode, setPlcMode] = useState<PlcMode>('4x');
    const [mechanism, setMechanism] = useState<Mechanism>('leadscrew');
    
    // Mechanism-specific states
    const [gearboxIn, setGearboxIn] = useState('10');
    const [gearboxOut, setGearboxOut] = useState('1');
    const [leadscrewPitch, setLeadscrewPitch] = useState('5');
    const [pitchUnit, setPitchUnit] = useState<PitchUnit>('mm_rev');
    const [diameter, setDiameter] = useState('50');
    const [linearUnit, setLinearUnit] = useState<LinearUnit>('mm');

    // Viability Analysis States
    const [desiredSpeed, setDesiredSpeed] = useState('250');
    const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('mm_s');

    // Interactive Tester States
    const [interactiveDist, setInteractiveDist] = useState('');
    const [interactivePulses, setInteractivePulses] = useState('');

    const results = useMemo(() => {
        const numPpr = parseFloat(ppr);
        const numGearIn = parseFloat(gearboxIn);
        const numGearOut = parseFloat(gearboxOut);
        const numPitch = parseFloat(leadscrewPitch);
        const numDiameter = parseFloat(diameter);
        const numSpeed = parseFloat(desiredSpeed);

        if (isNaN(numPpr) || numPpr <= 0) return null;

        const countsPerMotorRev = numPpr * (plcMode === '4x' ? 4 : 1);
        let gearRatio = 1;
        if (mechanism === 'gearbox' && !isNaN(numGearIn) && !isNaN(numGearOut) && numGearOut > 0) {
            gearRatio = numGearIn / numGearOut;
        }

        const countsPerFinalRev = countsPerMotorRev * gearRatio;
        
        let isAngular = false;
        let distancePerFinalRev = 0; // in mm
        let displayUnit = 'mm';

        switch (mechanism) {
            case 'leadscrew':
                if (isNaN(numPitch) || numPitch <= 0) return null;
                distancePerFinalRev = pitchUnit === 'in_rev' ? numPitch * 25.4 : numPitch;
                displayUnit = pitchUnit === 'in_rev' ? 'in' : 'mm';
                break;
            case 'pulley':
            case 'rack':
                if (isNaN(numDiameter) || numDiameter <= 0) return null;
                const effectiveDiameter = linearUnit === 'in' ? numDiameter * 25.4 : numDiameter;
                distancePerFinalRev = Math.PI * effectiveDiameter;
                displayUnit = linearUnit;
                break;
            case 'direct':
            case 'gearbox':
                isAngular = true;
                distancePerFinalRev = 360;
                displayUnit = 'deg';
                break;
            default:
                return null;
        }

        const systemResolution = distancePerFinalRev / countsPerFinalRev; // (mm or deg) / pulse
        const scaleFactor = 1 / systemResolution; // pulses / (mm or deg)
        
        // Frequency Analysis
        if (isNaN(numSpeed) || numSpeed <= 0) {
            return { systemResolution, scaleFactor, isAngular, displayUnit, requiredFrequency: null, diagnosis: null };
        }

        let requiredFrequency = 0;
        if (speedUnit === 'rpm') {
            const revsPerSecond = numSpeed / 60;
            requiredFrequency = revsPerSecond * countsPerFinalRev;
        } else {
            let speedInMmPerSecond = numSpeed;
            if (speedUnit === 'm_s') speedInMmPerSecond = numSpeed * 1000;
            
            if (isAngular) { // Can't calculate frequency from linear speed for angular motion
                 return { systemResolution, scaleFactor, isAngular, displayUnit, requiredFrequency: null, diagnosis: null };
            }
            requiredFrequency = speedInMmPerSecond * scaleFactor;
        }
        
        let diagnosis: DiagnosisStatus;
        if (requiredFrequency > 10000) diagnosis = 'critical';
        else if (requiredFrequency > 1000) diagnosis = 'caution';
        else diagnosis = 'ok';

        return { systemResolution, scaleFactor, isAngular, displayUnit, requiredFrequency, diagnosis };

    }, [ppr, plcMode, mechanism, gearboxIn, gearboxOut, leadscrewPitch, pitchUnit, diameter, linearUnit, desiredSpeed, speedUnit]);

    const handleInteractiveChange = (type: 'dist' | 'pulse', value: string) => {
        if (!results || value === '') {
            setInteractiveDist('');
            setInteractivePulses('');
            return;
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;
        
        if (type === 'dist') {
            setInteractiveDist(value);
            setInteractivePulses((numValue * results.scaleFactor).toFixed(0));
        } else {
            setInteractivePulses(value);
            setInteractiveDist((numValue * results.systemResolution).toPrecision(5));
        }
    };

    const diagnosisMap: Record<DiagnosisStatus, { textKey: string; className: string }> = {
        ok: { textKey: 'analysisOk', className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-400' },
        caution: { textKey: 'analysisCaution', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-400' },
        critical: { textKey: 'analysisCritical', className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-400' },
    };

    const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm";
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{t('calculator.encoderMotion.title')}</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{t('calculator.encoderMotion.description')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.encoderMotion.encoderParams')}</legend>
                        <div className="space-y-4">
                             <div className="flex items-center">
                                <label className="w-1/2 font-medium">{t('calculator.encoderMotion.ppr')}</label>
                                <input type="number" value={ppr} onChange={e => setPpr(e.target.value)} className={commonInputClasses}/>
                                <Tooltip text={t('calculator.encoderMotion.pprTooltip')} />
                            </div>
                            <div className="flex items-center">
                                <label className="w-1/2 font-medium">{t('calculator.encoderMotion.plcMode')}</label>
                                <div className="w-full flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                                    <button onClick={() => setPlcMode('1x')} className={`flex-1 p-2 text-sm transition-colors ${plcMode === '1x' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{t('calculator.encoderMotion.plcMode1x')}</button>
                                    <button onClick={() => setPlcMode('4x')} className={`flex-1 p-2 text-sm transition-colors ${plcMode === '4x' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>{t('calculator.encoderMotion.plcMode4x')}</button>
                                </div>
                                <Tooltip text={plcMode === '1x' ? t('calculator.encoderMotion.plcMode1xTooltip') : t('calculator.encoderMotion.plcMode4xTooltip')} />
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.encoderMotion.transmissionParams')}</legend>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('calculator.encoderMotion.mechanism')}</label>
                                <select value={mechanism} onChange={e => setMechanism(e.target.value as Mechanism)} className={commonInputClasses}>
                                    <option value="direct">{t('calculator.encoderMotion.mechanismDirect')}</option>
                                    <option value="gearbox">{t('calculator.encoderMotion.mechanismGearbox')}</option>
                                    <option value="leadscrew">{t('calculator.encoderMotion.mechanismLeadscrew')}</option>
                                    <option value="pulley">{t('calculator.encoderMotion.mechanismPulley')}</option>
                                    <option value="rack">{t('calculator.encoderMotion.mechanismRack')}</option>
                                </select>
                            </div>
                            {mechanism === 'gearbox' && (
                                <div className="flex items-center gap-2">
                                    <input type="number" value={gearboxIn} onChange={e => setGearboxIn(e.target.value)} className={commonInputClasses} aria-label={t('calculator.encoderMotion.gearboxIn')} />
                                    <span className="font-bold">:</span>
                                    <input type="number" value={gearboxOut} onChange={e => setGearboxOut(e.target.value)} className={commonInputClasses} aria-label={t('calculator.encoderMotion.gearboxOut')} />
                                </div>
                            )}
                            {mechanism === 'leadscrew' && (
                                <div className="flex gap-2">
                                    <input type="number" value={leadscrewPitch} onChange={e => setLeadscrewPitch(e.target.value)} className={`${commonInputClasses} w-2/3`} aria-label={t('calculator.encoderMotion.leadscrewPitch')} />
                                    <select value={pitchUnit} onChange={e => setPitchUnit(e.target.value as PitchUnit)} className={`${commonInputClasses} w-1/3`}>
                                        <option value="mm_rev">{t('calculator.encoderMotion.mm_rev')}</option>
                                        <option value="in_rev">{t('calculator.encoderMotion.in_rev')}</option>
                                    </select>
                                </div>
                            )}
                            {(mechanism === 'pulley' || mechanism === 'rack') && (
                                <div className="flex gap-2">
                                    <input type="number" value={diameter} onChange={e => setDiameter(e.target.value)} className={`${commonInputClasses} w-2/3`} aria-label={t('calculator.encoderMotion.diameter')} />
                                    <select value={linearUnit} onChange={e => setLinearUnit(e.target.value as LinearUnit)} className={`${commonInputClasses} w-1/3`}>
                                        <option value="mm">{t('calculator.encoderMotion.mm')}</option>
                                        <option value="in">{t('calculator.encoderMotion.in')}</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className="text-lg font-semibold mb-2">{t('calculator.encoderMotion.viabilityAnalysis')}</legend>
                        <label className="block text-sm font-medium mb-1">{t('calculator.encoderMotion.maxSpeed')}</label>
                         <div className="flex gap-2">
                            <input type="number" value={desiredSpeed} onChange={e => setDesiredSpeed(e.target.value)} className={`${commonInputClasses} w-2/3`} />
                            <select value={speedUnit} onChange={e => setSpeedUnit(e.target.value as SpeedUnit)} className={`${commonInputClasses} w-1/3`}>
                                <option value="mm_s">{t('calculator.encoderMotion.mm_s')}</option>
                                <option value="m_s">{t('calculator.encoderMotion.m_s')}</option>
                                <option value="rpm">{t('calculator.encoderMotion.rpm')}</option>
                            </select>
                        </div>
                    </fieldset>
                </div>
                {/* Results */}
                <div className="space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <h3 className="text-lg font-bold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">{t('calculator.encoderMotion.resultsTitle')}</h3>
                        {results ? (
                        <div className="space-y-4">
                            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{t('calculator.encoderMotion.systemResolution')}</h4>
                                <p className="font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400">{results.systemResolution.toExponential(4)}</p>
                                <p className="text-xs text-indigo-500">{results.isAngular ? t('calculator.encoderMotion.resolutionUnitAngle') : t('calculator.encoderMotion.resolutionUnit')}</p>
                            </div>
                             <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{t('calculator.encoderMotion.scaleFactor')}</h4>
                                <p className="font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400">{results.scaleFactor.toFixed(2)}</p>
                                <p className="text-xs text-indigo-500">{results.isAngular ? t('calculator.encoderMotion.scaleFactorUnitAngle') : t('calculator.encoderMotion.scaleFactorUnit')}</p>
                            </div>
                        </div>
                        ) : <p className="text-sm text-center text-gray-500">Enter valid inputs.</p>}
                    </div>
                     <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                         <h3 className="text-lg font-bold mb-4">{t('calculator.encoderMotion.interactiveTester')}</h3>
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span>{t('calculator.encoderMotion.moveToTravel')}</span>
                                <input type="number" value={interactiveDist} onChange={e => handleInteractiveChange('dist', e.target.value)} className={`${commonInputClasses} w-24`} />
                                <span>{results?.displayUnit || ''} {t('calculator.encoderMotion.needsPulses')}:</span>
                                <input type="text" readOnly value={interactivePulses} className={`${commonInputClasses} flex-grow bg-gray-100 dark:bg-gray-700/50`} />
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span>{t('calculator.encoderMotion.pulseCountIs')}</span>
                                <input type="number" value={interactivePulses} onChange={e => handleInteractiveChange('pulse', e.target.value)} className={`${commonInputClasses} w-24`} />
                                <span>{t('calculator.encoderMotion.pulses')} {t('calculator.encoderMotion.travelledDist')}:</span>
                                <input type="text" readOnly value={interactiveDist} className={`${commonInputClasses} flex-grow bg-gray-100 dark:bg-gray-700/50`} />
                            </div>
                         </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <h3 className="text-lg font-bold mb-4">{t('calculator.encoderMotion.hardwareDiagnosis')}</h3>
                        {results?.requiredFrequency !== null && results.diagnosis ? (
                        <>
                        <div className="text-center p-4 rounded-lg mb-4 bg-white dark:bg-gray-800">
                             <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('calculator.encoderMotion.requiredFrequency')}</h4>
                             <p className="font-mono text-2xl font-bold">
                                {results.requiredFrequency > 1000000 ? `${(results.requiredFrequency/1000000).toFixed(2)} ${t('calculator.encoderMotion.mhz')}` : results.requiredFrequency > 1000 ? `${(results.requiredFrequency/1000).toFixed(2)} ${t('calculator.encoderMotion.khz')}` : `${results.requiredFrequency.toFixed(0)} ${t('calculator.encoderMotion.hz')}`}
                            </p>
                        </div>
                        <div className={`p-3 border rounded-md text-sm text-center ${diagnosisMap[results.diagnosis].className}`}>
                            <p className="font-semibold">{t(`calculator.encoderMotion.${diagnosisMap[results.diagnosis].textKey}`)}</p>
                        </div>
                        </>
                        ) : <p className="text-sm text-center text-gray-500">Enter a valid speed to analyze frequency.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};