// FIX: Implemented the automationData constants file to provide data for VFDs and PLCs.

export const vfdBrands: string[] = [
    'General',
    'Siemens',
    'Allen-Bradley',
    'ABB',
    'Yaskawa',
    'Danfoss',
    'Schneider Electric',
    'Mitsubishi Electric',
    'Eaton'
];

export const vfdModelsByBrand: { [key: string]: string[] } = {
    'Siemens': ['Sinamics G120C', 'Sinamics G120', 'Sinamics V20', 'Micromaster 440'],
    'Allen-Bradley': ['PowerFlex 523', 'PowerFlex 525', 'PowerFlex 753', 'PowerFlex 755', 'PowerFlex 4M'],
    'ABB': ['ACS355', 'ACS580', 'ACS880'],
    'Yaskawa': ['V1000', 'A1000', 'GA500'],
    'Danfoss': ['VLT Midi Drive FC 280', 'VLT FC 302'],
    'Schneider Electric': ['Altivar Machine ATV320', 'Altivar Process ATV630', 'Altivar Process ATV650'],
    'Mitsubishi Electric': ['FR-E800', 'FR-D700'],
    'Eaton': ['PowerXL DG1'],
    'General': [],
};

export const vfdApplications: { key: string; labelKey: string }[] = [
    { key: 'conveyor', labelKey: 'appConveyor' },
    { key: 'fan', labelKey: 'appFan' },
    { key: 'pump_pid', labelKey: 'appPumpPID' },
    { key: 'general', labelKey: 'appGeneral' },
];

export const plcBrands: string[] = [
    'General',
    'Siemens',
    'Allen-Bradley',
    'Schneider Electric',
    'Mitsubishi Electric',
    'Eaton',
];

export const plcSoftwareByBrand: { [key: string]: string[] } = {
    'Siemens': ['TIA Portal', 'SIMATIC Step 7'],
    'Allen-Bradley': ['Studio 5000', 'RSLogix 500', 'RSLogix 5', 'Connected Components Workbench'],
    'Schneider Electric': ['EcoStruxure Machine Expert (SoMachine)', 'EcoStruxure Control Expert (Unity Pro)'],
    'Mitsubishi Electric': ['GX Works3', 'GX Works2'],
    'Eaton': ['Power Xpert inControl', 'WebUI'],
    'General': [],
};

export const plcVersionsBySoftware: { [key: string]: string[] } = {
    'TIA Portal': ['v15', 'v16', 'v17', 'v18', 'v19'],
    'Studio 5000': ['v30', 'v31', 'v32', 'v33', 'v34', 'v35'],
    'RSLogix 500': ['v10', 'v11', 'v12'],
    'Connected Components Workbench': ['v11', 'v12', 'v13', 'v20', 'v21', 'v22'],
    'GX Works3': ['1.050C', '1.060N', '1.070W'],
    'GX Works2': ['1.501F', '1.590Q'],
    'General': [],
};

export const plcLanguages: string[] = [
    'Ladder Diagram (LD)',
    'Function Block Diagram (FBD)',
    'Structured Text (ST)',
    'Instruction List (IL)',
    'Sequential Function Chart (SFC)',
];

export const thermalComponents: { name: string, heat: number }[] = [
  // VFDs - Generic
  { name: 'VFD (1 HP, 0.75 kW)', heat: 50 },
  { name: 'VFD (3 HP, 2.2 kW)', heat: 110 },
  { name: 'VFD (5 HP, 3.7 kW)', heat: 150 },
  { name: 'VFD (10 HP, 7.5 kW)', heat: 250 },
  { name: 'VFD (20 HP, 15 kW)', heat: 480 },
  { name: 'VFD (50 HP, 37 kW)', heat: 1100 },
  // VFDs - Specific
  { name: 'PowerFlex 525 (Frame A)', heat: 50 },
  { name: 'PowerFlex 525 (Frame B)', heat: 90 },
  { name: 'PowerFlex 525 (Frame C)', heat: 145 },
  { name: 'Sinamics G120 (FSA)', heat: 75 },
  { name: 'Sinamics G120 (FSB)', heat: 125 },
  // Power Supplies
  { name: 'Power Supply (5A, 120W)', heat: 15 },
  { name: 'Power Supply (10A, 240W)', heat: 30 },
  { name: 'Power Supply (20A, 480W)', heat: 55 },
  // PLCs
  { name: 'PLC CPU (CompactLogix)', heat: 12 },
  { name: 'PLC CPU (MicroLogix)', heat: 8 },
  { name: 'PLC I/O Module (Digital, 16pt)', heat: 5 },
  { name: 'PLC I/O Module (Analog, 8ch)', heat: 7 },
  { name: 'PLC I/O Module (Relay Output, 8pt)', heat: 8 },
  // Others
  { name: 'Industrial PC', heat: 80 },
  { name: 'Network Switch (8-port, unmanaged)', heat: 10 },
  { name: 'Safety Relay', heat: 5 },
  { name: 'Contactor (NEMA Size 0/1)', heat: 10 },
  { name: 'Contactor (NEMA Size 2/3)', heat: 25 },
  { name: 'Line Reactor (10A)', heat: 20 },
  { name: 'Line Reactor (25A)', heat: 45 },
];

export interface MotorControlSpecs {
    fla: number;
    sf: number;
    contactor: string;
    breaker: number;
    wire: string; // AWG
}

// Data based on NEC Table 430.250 (FLA), 430.52 (Breaker), 310.16 (Wire Ampacity) and NEMA starter sizes.
// This is a simplified lookup for common motor sizes.
export const motorControlData: {
    [phase: string]: {
        [voltage: string]: {
            [hp: string]: MotorControlSpecs;
        }
    }
} = {
    threePhase: {
        '208V': {
            '0.5': { fla: 2.4, sf: 1.15, contactor: 'NEMA 00', breaker: 15, wire: '14' },
            '1': { fla: 4.2, sf: 1.15, contactor: 'NEMA 00', breaker: 15, wire: '14' },
            '2': { fla: 7.5, sf: 1.15, contactor: 'NEMA 0', breaker: 20, wire: '12' },
            '5': { fla: 16.7, sf: 1.15, contactor: 'NEMA 1', breaker: 45, wire: '10' },
            '10': { fla: 30.8, sf: 1.15, contactor: 'NEMA 1', breaker: 80, wire: '8' },
            '20': { fla: 59.4, sf: 1.15, contactor: 'NEMA 2', breaker: 150, wire: '4' },
            '50': { fla: 143, sf: 1.15, contactor: 'NEMA 4', breaker: 350, wire: '1/0' },
        },
        '230V': {
            '0.5': { fla: 2.2, sf: 1.15, contactor: 'NEMA 00', breaker: 15, wire: '14' },
            '1': { fla: 3.6, sf: 1.15, contactor: 'NEMA 00', breaker: 15, wire: '14' },
            '2': { fla: 6.8, sf: 1.15, contactor: 'NEMA 0', breaker: 20, wire: '12' },
            '5': { fla: 15.2, sf: 1.15, contactor: 'NEMA 1', breaker: 40, wire: '10' },
            '10': { fla: 28, sf: 1.15, contactor: 'NEMA 1', breaker: 70, wire: '8' },
            '20': { fla: 54, sf: 1.15, contactor: 'NEMA 2', breaker: 125, wire: '4' },
            '50': { fla: 130, sf: 1.15, contactor: 'NEMA 4', breaker: 300, wire: '1/0' },
        },
        '460V': {
            '0.5': { fla: 1.1, sf: 1.15, contactor: 'NEMA 00', breaker: 15, wire: '14' },
            '1': { fla: 1.8, sf: 1.15, contactor: 'NEMA 00', breaker: 15, wire: '14' },
            '2': { fla: 3.4, sf: 1.15, contactor: 'NEMA 00', breaker: 15, wire: '14' },
            '5': { fla: 7.6, sf: 1.15, contactor: 'NEMA 0', breaker: 20, wire: '12' },
            '10': { fla: 14, sf: 1.15, contactor: 'NEMA 1', breaker: 35, wire: '12' },
            '20': { fla: 27, sf: 1.15, contactor: 'NEMA 1', breaker: 70, wire: '8' },
            '50': { fla: 65, sf: 1.15, contactor: 'NEMA 3', breaker: 175, wire: '4' },
        },
    }
};

export interface PlcScalingPreset {
    key: string;
    translationKey: string;
    unit: string;
    min: string;
    max: string;
}

export const plcScalingPresets: { raw: PlcScalingPreset[]; engineering: PlcScalingPreset[] } = {
  raw: [
    { key: 'custom', translationKey: 'custom', unit: 'counts', min: '', max: '' },
    { key: 'raw_4_20ma', translationKey: 'raw_4_20ma', unit: 'mA', min: '4', max: '20' },
    { key: 'raw_0_10v', translationKey: 'raw_0_10v', unit: 'V', min: '0', max: '10' },
    { key: 'raw_rockwell_4_20ma', translationKey: 'raw_rockwell_4_20ma', unit: 'counts', min: '4000', max: '20000' },
    { key: 'raw_siemens_4_20ma', translationKey: 'raw_siemens_4_20ma', unit: 'counts', min: '0', max: '27648' },
    { key: 'raw_unsigned_12', translationKey: 'raw_unsigned_12', unit: 'counts', min: '0', max: '4095' },
    { key: 'raw_unsigned_14', translationKey: 'raw_unsigned_14', unit: 'counts', min: '0', max: '16383' },
    { key: 'raw_unsigned_16', translationKey: 'raw_unsigned_16', unit: 'counts', min: '0', max: '65535' },
    { key: 'raw_signed_15', translationKey: 'raw_signed_15', unit: 'counts', min: '-32768', max: '32767' },
    { key: 'raw_rockwell_10v', translationKey: 'raw_rockwell_10v', unit: 'counts', min: '-10000', max: '10000' },
    { key: 'raw_siemens_10v', translationKey: 'raw_siemens_10v', unit: 'counts', min: '-27648', max: '27648' },
  ],
  engineering: [
    { key: 'custom', translationKey: 'custom', unit: 'EU', min: '', max: '' },
    { key: 'eng_percent', translationKey: 'eng_percent', unit: '%', min: '0', max: '100' },
    { key: 'eng_freq_60hz', translationKey: 'eng_freq_60hz', unit: 'Hz', min: '0', max: '60' },
    { key: 'eng_speed_1800rpm', translationKey: 'eng_speed_1800rpm', unit: 'RPM', min: '0', max: '1800' },
    { key: 'eng_torque_300', translationKey: 'eng_torque_300', unit: '%', min: '0', max: '300' },
    { key: 'eng_psi_150', translationKey: 'eng_psi_150', unit: 'PSI', min: '0', max: '150' },
    { key: 'eng_celsius_100', translationKey: 'eng_celsius_100', unit: '°C', min: '0', max: '100' },
    { key: 'eng_fahrenheit_212', translationKey: 'eng_fahrenheit_212', unit: '°F', min: '32', max: '212' },
    { key: 'eng_gpm_500', translationKey: 'eng_gpm_500', unit: 'GPM', min: '0', max: '500' },
    { key: 'eng_liters_1000', translationKey: 'eng_liters_1000', unit: 'L', min: '0', max: '1000' },
  ]
};

export interface WireGauge {
  awg: string;
  cm: number;
}

export const wireGauges: WireGauge[] = [
  { awg: '18', cm: 1620 },
  { awg: '16', cm: 2580 },
  { awg: '14', cm: 4110 },
  { awg: '12', cm: 6530 },
  { awg: '10', cm: 10380 },
  { awg: '8', cm: 16510 },
  { awg: '6', cm: 26240 },
  { awg: '4', cm: 41740 },
  { awg: '2', cm: 66360 },
  { awg: '1', cm: 83690 },
  { awg: '1/0', cm: 105600 },
  { awg: '2/0', cm: 133100 },
  { awg: '3/0', cm: 167800 },
  { awg: '4/0', cm: 211600 },
];

export const conductorResistivity = {
    copper: 12.9, // ohms-cmil/ft @ 75°C
    aluminum: 21.2 // ohms-cmil/ft @ 75°C
};

export interface DcLoadTemplate {
  name: string;
  nominal: number;
  inrush: number;
}

export const dcLoadTemplates: DcLoadTemplate[] = [
  // PLCs
  { name: 'PLC CPU (CompactLogix)', nominal: 400, inrush: 0 },
  { name: 'PLC CPU (S7-1200)', nominal: 350, inrush: 0 },
  { name: 'PLC CPU (S7-1500)', nominal: 700, inrush: 0 },
  { name: 'PLC CPU (Micro820)', nominal: 150, inrush: 0 },
  // I/O
  { name: 'Digital I/O Module (16 pt)', nominal: 120, inrush: 0 },
  { name: 'Analog I/O Module (8 ch)', nominal: 180, inrush: 0 },
  { name: 'IO-Link Master Block', nominal: 200, inrush: 0 },
  // HMIs
  { name: 'HMI Basic (7")', nominal: 500, inrush: 1500 },
  { name: 'HMI Comfort Panel (12")', nominal: 1200, inrush: 3000 },
  // Field Devices & Components
  { name: 'Interface Relay (24VDC)', nominal: 25, inrush: 50 },
  { name: 'Safety Relay', nominal: 50, inrush: 100 },
  { name: 'Managed Network Switch', nominal: 250, inrush: 0 },
  { name: 'Proximity Sensor', nominal: 15, inrush: 0 },
  { name: 'Photoelectric Sensor', nominal: 20, inrush: 0 },
  { name: 'Solenoid Valve', nominal: 100, inrush: 250 },
  { name: 'Valve Manifold (4-station)', nominal: 400, inrush: 1000 },
];

export const standardDcPowerSupplySizes: number[] = [1, 2.5, 5, 10, 20, 40];

export const networkProtocols: string[] = [
    'EtherNet/IP',
    'Profinet',
    'Modbus TCP',
    'Modbus RTU (Serial)',
    'OPC-UA Server',
    'OPC-UA Client',
    'BACnet/IP',
    'CANopen',
    'DeviceNet',
    'ASCII Serial',
];