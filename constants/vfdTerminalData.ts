// FIX: Implemented the vfdTerminalData constants file with type definitions and data.

export interface Terminal {
    id: string;
    label: string;
    function?: string;
    description?: string;
}

export interface VfdDiagramData {
    viewBox: string;
    blocks: {
        id: string;
        label?: string;
        x: number;
        y: number;
        cols: number;
        terminalWidth: number;
        terminalHeight: number;
        gapX: number;
        gapY: number;
        bgColorClass: string;
        terminals: Terminal[];
    }[];
    jumpers?: { from: string; to: string }[];
}

const powerFlex755SafetyModuleData: VfdDiagramData = {
    viewBox: '0 0 200 450',
    blocks: [
        {
            id: 'tb1-pulse',
            label: 'TB1 - Pulse Test',
            x: 20, y: 25, cols: 2,
            terminalWidth: 75, terminalHeight: 18, gapX: 10, gapY: 6,
            bgColorClass: 'fill-yellow-100 dark:fill-yellow-900/50 stroke-yellow-400 dark:stroke-yellow-600',
            terminals: [
                { id: 'S11', label: 'S11', function: 'TEST_OUT_0', description: 'Pulse Test Output 0 for monitoring safety input wiring.' },
                { id: 'S21', label: 'S21', function: 'TEST_OUT_1', description: 'Pulse Test Output 1 for monitoring safety input wiring.' },
            ]
        },
        {
            id: 'tb2-power',
            label: 'TB2 - Power & Reset',
            x: 20, y: 85, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 10, gapY: 6,
            bgColorClass: 'fill-red-100 dark:fill-red-900/50 stroke-red-400 dark:stroke-red-600',
            terminals: [
                { id: 'A1', label: 'A1', function: '+24V', description: 'Customer-supplied +24V DC power.' },
                { id: 'A2', label: 'A2', function: '24V_COM', description: 'Customer-supplied 24V DC common.' },
                { id: 'S34', label: 'S34', function: 'RESET_IN', description: 'Input for manual or monitored reset.' },
            ]
        },
        {
            id: 'tb2-inputs',
            label: 'TB2 - Safety Inputs',
            x: 20, y: 140, cols: 2,
            terminalWidth: 75, terminalHeight: 18, gapX: 10, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: 'S12', label: 'S12', function: 'SS_IN_CH0', description: 'Safe Stop Input, Channel 0.' },
                { id: 'S22', label: 'S22', function: 'SS_IN_CH1', description: 'Safe Stop Input, Channel 1.' },
                { id: 'S52', label: 'S52', function: 'SLS_IN_CH0', description: 'Safe Limited Speed Input, Channel 0.' },
                { id: 'S62', label: 'S62', function: 'SLS_IN_CH1', description: 'Safe Limited Speed Input, Channel 1.' },
                { id: 'S32', label: 'S32', function: 'DM_IN_CH0', description: 'Door Monitoring Input, Channel 0.' },
                { id: 'S42', label: 'S42', function: 'DM_IN_CH1', description: 'Door Monitoring Input, Channel 1.' },
                { id: 'S72', label: 'S72', function: 'ESM_IN_CH0', description: 'Enabling Switch Monitoring Input, Channel 0.' },
                { id: 'S82', label: 'S82', function: 'ESM_IN_CH1', description: 'Enabling Switch Monitoring Input, Channel 1.' },
                { id: 'X32', label: 'X32', function: 'LM_IN_CH0', description: 'Lock Monitoring Input, Channel 0.' },
                { id: 'X42', label: 'X42', function: 'LM_IN_CH1', description: 'Lock Monitoring Input, Channel 1.' },
            ]
        },
        {
            id: 'tb2-outputs',
            label: 'TB2 - Safety Outputs',
            x: 20, y: 320, cols: 2,
            terminalWidth: 75, terminalHeight: 18, gapX: 10, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: '34', label: '34', function: 'SS_OUT_CH0', description: 'Safe Stop Output, Channel 0.' },
                { id: '44', label: '44', function: 'SS_OUT_CH1', description: 'Safe Stop Output, Channel 1.' },
                { id: '68', label: '68', function: 'SLS_OUT_CH0', description: 'Safe Limited Speed Output, Channel 0.' },
                { id: '78', label: '78', function: 'SLS_OUT_CH1', description: 'Safe Limited Speed Output, Channel 1.' },
                { id: '51', label: '51', function: 'DC_OUT_CH0', description: 'Door Control Output, Channel 0.' },
                { id: '52', label: '52', function: 'DC_OUT_CH1', description: 'Door Control Output, Channel 1.' },
            ]
        },
    ]
};

const altivar320Data: VfdDiagramData = {
    viewBox: '0 0 200 240',
    blocks: [
        {
            id: 'relays-logic-out',
            label: 'Outputs',
            x: 20, y: 25, cols: 5,
            terminalWidth: 30, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: 'R1A', label: 'R1A', function: 'Relay 1 NO', description: 'Relay 1 Normally Open contact.' },
                { id: 'R1B', label: 'R1B', function: 'Relay 1 NC', description: 'Relay 1 Normally Closed contact.' },
                { id: 'R1C', label: 'R1C', function: 'Relay 1 Common', description: 'Relay 1 Common contact.' },
                { id: 'R2A', label: 'R2A', function: 'Relay 2 NO', description: 'Relay 2 Normally Open contact.' },
                { id: 'R2C', label: 'R2C', function: 'Relay 2 Common', description: 'Relay 2 Common contact.' },
                { id: 'DQ+', label: 'DQ+', function: 'Logic Out +', description: 'Positive for Logic Output.' },
                { id: 'DQ-', label: 'DQ-', function: 'Logic Out -', description: 'Negative for Logic Output.' },
            ]
        },
        {
            id: 'analog-io',
            label: 'Analog I/O',
            x: 20, y: 85, cols: 4,
            terminalWidth: 40, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                 { id: '10V', label: '10V', function: '+10V Supply', description: 'Internal +10Vdc supply for potentiometers.' },
                 { id: 'AI1', label: 'AI1', function: 'Analog In 1 (V)', description: '0 to +10V Analog Voltage Input.' },
                 { id: 'AI2', label: 'AI2', function: 'Analog In 2 (V)', description: 'Bipolar -10V to +10V Analog Voltage Input.' },
                 { id: 'AI3', label: 'AI3', function: 'Analog In 3 (I)', description: '0 to 20mA Analog Current Input.' },
                 { id: 'COM', label: 'COM', function: 'Analog Common', description: 'Common for all Analog I/O.' },
                 { id: 'AQ1', label: 'AQ1', function: 'Analog Out 1', description: 'Configurable 0-10V / 0-20mA Analog Output.' },
            ]
        },
        {
            id: 'digital-safety',
            label: 'Digital Inputs & Safety',
            x: 20, y: 155, cols: 5,
            terminalWidth: 30, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: '+24', label: '+24', function: 'Internal +24V', description: 'Internal +24Vdc supply output.' },
                { id: 'DI1', label: 'DI1', function: 'Digital In 1', description: 'Programmable Digital Input.' },
                { id: 'DI2', label: 'DI2', function: 'Digital In 2', description: 'Programmable Digital Input.' },
                { id: 'DI3', label: 'DI3', function: 'Digital In 3', description: 'Programmable Digital Input.' },
                { id: 'DI4', label: 'DI4', function: 'Digital In 4', description: 'Programmable Digital Input.' },
                { id: 'DI5', label: 'DI5', function: 'Digital In 5', description: 'Programmable Digital Input / Pulse Input.' },
                { id: 'DI6', label: 'DI6', function: 'Digital In 6', description: 'Programmable Digital Input / PTC Probe.' },
                { id: 'STO', label: 'STO', function: 'Safe Torque Off', description: 'Safe Torque Off input terminal.' },
                { id: 'P24', label: 'P24', function: 'External +24V', description: 'External +24Vdc supply input.' },
            ]
        }
    ],
    jumpers: []
};

const altivar630_650_Data: VfdDiagramData = {
    viewBox: '0 0 200 280',
    blocks: [
        {
            id: 'digital-inputs',
            label: 'Digital I/O & Supply',
            x: 20, y: 25, cols: 2,
            terminalWidth: 35, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: 'P24', label: 'P24', function: 'External +24V Supply', description: 'External +24Vdc supply input.' },
                { id: '0V', label: '0V', function: 'External Common', description: 'Common for P24 external supply.' },
                { id: 'DI1', label: 'DI1', function: 'Digital Input 1', description: 'Programmable Digital Input.' },
                { id: 'DI2', label: 'DI2', function: 'Digital Input 2', description: 'Programmable Digital Input.' },
                { id: 'DI3', label: 'DI3', function: 'Digital Input 3', description: 'Programmable Digital Input.' },
                { id: 'DI4', label: 'DI4', function: 'Digital Input 4', description: 'Programmable Digital Input.' },
                { id: 'DI5', label: 'DI5', function: 'Digital Input 5', description: 'Pulse Input configurable.' },
                { id: 'DI6', label: 'DI6', function: 'Digital Input 6', description: 'Pulse Input configurable.' },
                { id: '24V', label: '+24V', function: 'Internal Supply', description: 'Internal +24Vdc supply output (200mA max).' },
            ]
        },
        {
            id: 'analog-inputs',
            label: 'Analog Inputs',
            x: 20, y: 170, cols: 2,
            terminalWidth: 35, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                 { id: '10V', label: '+10V', function: 'Analog Supply', description: 'Internal +10.5Vdc supply (10mA max).' },
                 { id: 'AI1', label: 'AI1', function: 'Analog Input 1', description: 'Voltage/Current Analog Input.' },
                 { id: 'AI2', label: 'AI2', function: 'Analog Input 2', description: 'Voltage/Current/Sensor Input.' },
                 { id: 'AI3', label: 'AI3', function: 'Analog Input 3', description: 'Voltage/Current/Sensor Input.' },
                 { id: 'COM_AI', label: 'COM', function: 'Analog Common', description: 'Common for analog I/O.' },
            ]
        },
        {
            id: 'relays',
            label: 'Relay Outputs',
            x: 115, y: 25, cols: 2,
            terminalWidth: 35, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: 'R1A', label: 'R1A', function: 'Relay 1 NO', description: 'Relay 1 Normally Open contact.' },
                { id: 'R1B', label: 'R1B', function: 'Relay 1 NC', description: 'Relay 1 Normally Closed contact.' },
                { id: 'R1C', label: 'R1C', function: 'Relay 1 Common', description: 'Relay 1 Common.' },
                { id: 'R2A', label: 'R2A', function: 'Relay 2 NO', description: 'Relay 2 Normally Open contact.' },
                { id: 'R2C', label: 'R2C', function: 'Relay 2 Common', description: 'Relay 2 Common.' },
                { id: 'R3A', label: 'R3A', function: 'Relay 3 NO', description: 'Relay 3 Normally Open contact.' },
                { id: 'R3C', label: 'R3C', function: 'Relay 3 Common', description: 'Relay 3 Common.' },
            ]
        },
        {
            id: 'safety-analog-out',
            label: 'Safety & Analog Out',
            x: 115, y: 170, cols: 2,
            terminalWidth: 35, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-yellow-100 dark:fill-yellow-900/50 stroke-yellow-400 dark:stroke-yellow-600',
            terminals: [
                { id: 'STOA', label: 'STOA', function: 'STO A', description: 'Safe Torque Off Input A.' },
                { id: 'STOB', label: 'STOB', function: 'STO B', description: 'Safe Torque Off Input B.' },
                { id: 'COM_AQ', label: 'COM', function: 'Analog Common', description: 'Common for analog I/O.' },
                { id: 'AQ1', label: 'AQ1', function: 'Analog Out 1', description: 'Voltage/Current Analog Output.' },
                { id: 'AQ2', label: 'AQ2', function: 'Analog Out 2', description: 'Voltage/Current Analog Output.' },
            ]
        }
    ],
    jumpers: []
};

const abbACS580Data: VfdDiagramData = {
    viewBox: '0 0 200 360',
    blocks: [
        {
            id: 'analog-io',
            label: 'Analog I/O',
            x: 20, y: 25, cols: 3,
            terminalWidth: 50, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                { id: '1', label: 'SCR', function: 'Shield', description: 'Signal cable shield connection.' },
                { id: '2', label: 'AI1', function: 'Analog In 1', description: 'Speed/Frequency reference input (0-10V).' },
                { id: '3', label: 'AGND', function: 'Analog Gnd', description: 'Common for Analog Inputs.' },
                { id: '4', label: '+10V', function: '+10V Ref', description: 'Reference voltage output for potentiometer.' },
                { id: '5', label: 'AI2', function: 'Analog In 2', description: 'Secondary reference or input.' },
                { id: '6', label: 'AGND', function: 'Analog Gnd', description: 'Common for Analog Inputs.' },
                { id: '7', label: 'AO1', function: 'Analog Out 1', description: 'Output Frequency (0-20mA).' },
                { id: '8', label: 'AO2', function: 'Analog Out 2', description: 'Motor Current (0-20mA).' },
                { id: '9', label: 'AGND', function: 'Analog Gnd', description: 'Common for Analog Outputs.' },
            ]
        },
        {
            id: 'digital-inputs',
            label: 'Digital Inputs',
            x: 20, y: 110, cols: 3,
            terminalWidth: 50, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: '10', label: '+24V', function: '+24V Out', description: 'Auxiliary voltage output (+24VDC).' },
                { id: '11', label: 'DGND', function: 'Digital Gnd', description: 'Common for +24V Out.' },
                { id: '12', label: 'DCOM', function: 'DI Common', description: 'Common for all Digital Inputs.' },
                { id: '13', label: 'DI1', function: 'Start/Stop', description: 'Digital Input 1 (Stop=0 / Start=1).' },
                { id: '14', label: 'DI2', function: 'Fwd/Rev', description: 'Digital Input 2 (Forward=0 / Reverse=1).' },
                { id: '15', label: 'DI3', function: 'Const Speed 1', description: 'Digital Input 3 for constant speed selection.' },
                { id: '16', label: 'DI4', function: 'Const Speed 2', description: 'Digital Input 4 for constant speed selection.' },
                { id: '17', label: 'DI5', function: 'Ramp Sel', description: 'Digital Input 5 for ramp selection.' },
                { id: '18', label: 'DI6', function: 'DI6', description: 'Programmable Digital Input 6.' },
            ]
        },
        {
            id: 'relay-outputs',
            label: 'Relay Outputs',
            x: 20, y: 200, cols: 3,
            terminalWidth: 50, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: '19', label: 'RO1C', function: 'Relay 1 Com', description: 'Relay Output 1 Common.' },
                { id: '20', label: 'RO1A', function: 'Relay 1 NO', description: 'Relay Output 1 Normally Open (Ready).' },
                { id: '21', label: 'RO1B', function: 'Relay 1 NC', description: 'Relay Output 1 Normally Closed.' },
                { id: '22', label: 'RO2C', function: 'Relay 2 Com', description: 'Relay Output 2 Common.' },
                { id: '23', label: 'RO2A', function: 'Relay 2 NO', description: 'Relay Output 2 Normally Open (Running).' },
                { id: '24', label: 'RO2B', function: 'Relay 2 NC', description: 'Relay Output 2 Normally Closed.' },
                { id: '25', label: 'RO3C', function: 'Relay 3 Com', description: 'Relay Output 3 Common.' },
                { id: '26', label: 'RO3A', function: 'Relay 3 NO', description: 'Relay Output 3 Normally Open (Faulted -1).' },
                { id: '27', label: 'RO3B', function: 'Relay 3 NC', description: 'Relay Output 3 Normally Closed.' },
            ]
        },
        {
            id: 'safety-comms',
            label: 'Safety & Communications',
            x: 20, y: 285, cols: 3,
            terminalWidth: 50, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-yellow-100 dark:fill-yellow-900/50 stroke-yellow-400 dark:stroke-yellow-600',
            terminals: [
                { id: '29', label: 'B+', function: 'Modbus B+', description: 'Modbus RTU (EIA-485) Positive.' },
                { id: '30', label: 'A-', function: 'Modbus A-', description: 'Modbus RTU (EIA-485) Negative.' },
                { id: '31', label: 'DGND', function: 'Modbus Gnd', description: 'Common ground for Modbus.' },
                { id: '37', label: 'IN1', function: 'STO In 1', description: 'Safe Torque Off Input 1.' },
                { id: '38', label: 'IN2', function: 'STO In 2', description: 'Safe Torque Off Input 2.' },
                { id: '36', label: 'SGND', function: 'STO Gnd', description: 'Common ground for STO.' },
            ]
        }
    ],
    jumpers: []
};

export const vfdTerminalData: { [key: string]: VfdDiagramData } = {
    'PowerFlex 755': powerFlex755SafetyModuleData,
    'Altivar Machine ATV320': altivar320Data,
    'Altivar Process ATV630': altivar630_650_Data,
    'Altivar Process ATV650': altivar630_650_Data,
    'ACS580': abbACS580Data,
    'FR-E800': {
        viewBox: '0 0 200 225',
        blocks: [
            {
                id: 'digital-inputs',
                label: 'Digital Inputs (Spring Clamp)',
                x: 20, y: 20, cols: 2,
                terminalWidth: 75, terminalHeight: 15, gapX: 10, gapY: 5,
                bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
                terminals: [
                    { id: 'STF', label: 'STF', function: 'Forward rotation start', description: 'Forward start command.' },
                    { id: 'STR', label: 'STR', function: 'Reverse rotation start', description: 'Reverse start command.' },
                    { id: 'RH', label: 'RH', function: 'Multi-speed (High)', description: 'High-speed setting command.' },
                    { id: 'RM', label: 'RM', function: 'Multi-speed (Middle)', description: 'Middle-speed setting command.' },
                    { id: 'RL', label: 'RL', function: 'Multi-speed (Low)', description: 'Low-speed setting command.' },
                    { id: 'MRS', label: 'MRS', function: 'Output stop', description: 'Forces inverter output shutoff.' },
                    { id: 'RES', label: 'RES', function: 'Reset', description: 'Resets inverter protective functions.' },
                    { id: 'SD', label: 'SD', function: 'Digital Common', description: 'Common for digital inputs.' },
                ]
            },
            {
                id: 'analog-io',
                label: 'Analog I/O',
                x: 20, y: 110, cols: 2,
                terminalWidth: 75, terminalHeight: 15, gapX: 10, gapY: 5,
                bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
                terminals: [
                    { id: '10', label: '10', function: '+5V Power Supply', description: 'Power source for potentiometer.' },
                    { id: '4', label: '4', function: 'Current Input', description: '4-20mA analog input signal.' },
                    { id: '2', label: '2', function: 'Voltage Input', description: '0-5V/10V analog input signal.' },
                    { id: '5', label: '5', function: 'Analog Common', description: 'Common for analog inputs.' },
                ]
            },
            {
                id: 'outputs',
                label: 'Outputs',
                x: 20, y: 160, cols: 2,
                terminalWidth: 75, terminalHeight: 15, gapX: 10, gapY: 5,
                bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
                terminals: [
                    { id: 'A', label: 'A', function: 'Fault Relay', description: 'Contact closes on fault.' },
                    { id: 'B', label: 'B', function: 'Fault Relay', description: 'Contact opens on fault.' },
                    { id: 'C', label: 'C', function: 'Fault Relay Common', description: 'Common for fault relay.' },
                    { id: 'RUN', label: 'RUN', function: 'Inverter Running', description: 'Open collector output, ON when running.' },
                    { id: 'FU', label: 'FU', function: 'Frequency Reached', description: 'Open collector output, ON when frequency is reached.' },
                    { id: 'SE', label: 'SE', function: 'Output Common', description: 'Common for open collector outputs.' },
                ]
            }
        ],
    },
    'FR-D700': {
        viewBox: '0 0 200 300',
        blocks: [
            {
                id: 'digital-inputs',
                label: 'Digital Inputs',
                x: 20, y: 20, cols: 2,
                terminalWidth: 75, terminalHeight: 18, gapX: 10, gapY: 6,
                bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
                terminals: [
                    { id: 'STF', label: 'STF', function: 'Forward Start', description: 'Forward rotation start command.' },
                    { id: 'STR', label: 'STR', function: 'Reverse Start', description: 'Reverse rotation start command.' },
                    { id: 'RH', label: 'RH', function: 'Multi-Speed High', description: 'High-speed setting.' },
                    { id: 'RM', label: 'RM', function: 'Multi-Speed Middle', description: 'Middle-speed setting.' },
                    { id: 'RL', label: 'RL', function: 'Multi-Speed Low', description: 'Low-speed setting.' },
                    { id: 'SD', label: 'SD', function: 'Digital Common', description: 'Common for sink logic digital inputs.' },
                    { id: 'PC', label: 'PC', function: '24V Common', description: 'Common for external 24V supply (source logic).' },
                ]
            },
            {
                id: 'analog-io',
                label: 'Analog I/O',
                x: 20, y: 130, cols: 2,
                terminalWidth: 75, terminalHeight: 18, gapX: 10, gapY: 6,
                bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
                terminals: [
                    { id: '10', label: '10', function: '+5V Power', description: 'Power source for potentiometer (5VDC).' },
                    { id: '2', label: '2', function: 'Voltage Input', description: '0-5V/10V analog voltage input.' },
                    { id: '4', label: '4', function: 'Current Input', description: '4-20mA analog current input.' },
                    { id: '5', label: '5', function: 'Analog Common', description: 'Common for analog inputs.' },
                ]
            },
            {
                id: 'outputs',
                label: 'Outputs',
                x: 20, y: 200, cols: 3,
                terminalWidth: 48, terminalHeight: 18, gapX: 10, gapY: 6,
                bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
                terminals: [
                    { id: 'A', label: 'A', function: 'Fault Relay (NC)', description: 'Contact opens on fault.' },
                    { id: 'B', label: 'B', function: 'Fault Relay (NO)', description: 'Contact closes on fault.' },
                    { id: 'C', label: 'C', function: 'Fault Relay (COM)', description: 'Common for fault relay.' },
                    { id: 'RUN', label: 'RUN', function: 'Inverter Running', description: 'Open collector output, ON when running.' },
                    { id: 'SE', label: 'SE', function: 'Output Common', description: 'Common for open collector outputs.' },
                    { id: 'FM', label: 'FM', function: 'Pulse Output', description: 'Pulse train output for monitoring.' },
                ]
            },
            {
                id: 'safety',
                label: 'Safety Stop',
                x: 20, y: 255, cols: 2,
                terminalWidth: 75, terminalHeight: 18, gapX: 10, gapY: 6,
                bgColorClass: 'fill-yellow-100 dark:fill-yellow-900/50 stroke-yellow-400 dark:stroke-yellow-600',
                terminals: [
                    { id: 'S1', label: 'S1', function: 'Safety Input 1', description: 'Input for safety stop channel 1.' },
                    { id: 'S2', label: 'S2', function: 'Safety Input 2', description: 'Input for safety stop channel 2.' },
                    { id: 'SC', label: 'SC', function: 'Safety Common', description: 'Common for safety inputs S1, S2, SO.' },
                    { id: 'SO', label: 'SO', function: 'Safety Monitor', description: 'Output for safety stop condition.' },
                ]
            }
        ],
        jumpers: [{ from: 'S1', to: 'SC' }, { from: 'S2', to: 'SC' }]
    },
    'PowerFlex 523': {
        viewBox: '0 0 200 240',
        blocks: [
            {
                id: 'control-block',
                label: 'Control Terminals',
                x: 20, y: 25, cols: 2,
                terminalWidth: 75, terminalHeight: 15, gapX: 10, gapY: 5,
                bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
                terminals: [
                    { id: 'R1', label: 'R1', function: 'Relay N.O.', description: 'Relay Normally Open Contact' },
                    { id: 'R2', label: 'R2', function: 'Relay Common', description: 'Relay Common Contact' },
                    { id: 'R3', label: 'R3', function: 'Relay N.C.', description: 'Relay Normally Closed Contact' },
                    { id: '11', label: '11', function: '+24V Source', description: 'Internally supplied +24V DC for digital inputs.' },
                    { id: '01', label: '01', function: 'Stop / DI1', description: 'Stop input. Jumpered to 11 from factory.' },
                    { id: '02', label: '02', function: 'Start / DI2', description: 'Start/Run FWD input.' },
                    { id: '03', label: '03', function: 'Direction / DI3', description: 'Direction/Run REV input.' },
                    { id: '04', label: '04', function: 'Digital Common', description: 'Common for Digital Inputs.' },
                    { id: '05', label: '05', function: 'Digital In 4', description: 'Programmable Digital Input 4 (Pulse input).' },
                    { id: '06', label: '06', function: 'Digital In 5', description: 'Programmable Digital Input 5.' },
                    { id: '12', label: '12', function: '+10V Source', description: 'Internally supplied +10V DC for potentiometer.' },
                    { id: '13', label: '13', function: 'Analog In (V)', description: '0-10V Analog Input for speed reference.' },
                    { id: '14', label: '14', function: 'Analog Common', description: 'Common for Analog Inputs.' },
                    { id: '15', label: '15', function: 'Analog In (I)', description: '4-20mA Analog Input for speed reference.' },
                ]
            }
        ],
        jumpers: [{ from: '01', to: '11' }]
    },
    'PowerFlex 525': {
        viewBox: '0 0 200 240',
        blocks: [
            {
                id: 'relay1',
                label: 'Relay 1',
                x: 20, y: 20, cols: 2,
                terminalWidth: 30, terminalHeight: 18, gapX: 5, gapY: 6,
                bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
                terminals: [
                    { id: 'R1', label: 'R1', function: 'Relay 1 N.O.', description: 'Relay 1 Normally Open Contact' },
                    { id: 'R2', label: 'R2', function: 'Relay 1 Common', description: 'Relay 1 Common Contact' },
                ]
            },
            {
                id: 'relay2',
                label: 'Relay 2',
                x: 115, y: 20, cols: 2,
                terminalWidth: 30, terminalHeight: 18, gapX: 5, gapY: 6,
                bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
                terminals: [
                    { id: 'R5', label: 'R5', function: 'Relay 2 Common', description: 'Relay 2 Common Contact' },
                    { id: 'R6', label: 'R6', function: 'Relay 2 N.C.', description: 'Relay 2 Normally Closed Contact' },
                ]
            },
            {
                id: 'main-control',
                label: 'Main Control Terminals',
                x: 15, y: 70, cols: 4,
                terminalWidth: 28, terminalHeight: 18, gapX: 8, gapY: 6,
                bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
                terminals: [
                    { id: '01', label: '01', function: 'Stop / DI1', description: 'Always a stop input. Jumpered to 11 from factory for keypad control.' },
                    { id: '02', label: '02', function: 'Start / DI2', description: 'Start/Run FWD input.' },
                    { id: '03', label: '03', function: 'Direction / DI3', description: 'Direction/Run REV input.' },
                    { id: '04', label: '04', function: 'Digital Common', description: 'Common for Digital Inputs.' },
                    { id: '05', label: '05', function: 'Digital In 4', description: 'Programmable Digital Input 4.' },
                    { id: '06', label: '06', function: 'Digital In 5', description: 'Programmable Digital Input 5.' },
                    { id: '07', label: '07', function: 'Digital In 6', description: 'Programmable Digital Input 6.' },
                    { id: '08', label: '08', function: 'Digital In 7', description: 'Programmable Digital Input 7 (Pulse Input).' },
                    { id: '11', label: '11', function: '+24V Source', description: 'Internally supplied +24V DC. Used to source digital inputs.' },
                    { id: '12', label: '12', function: '+10V Source', description: 'Internally supplied +10V DC for potentiometer reference.' },
                    { id: '13', label: '13', function: 'Analog In (V)', description: '±10V Analog Input for speed reference.' },
                    { id: '14', label: '14', function: 'Analog Common', description: 'Common for Analog Inputs.' },
                    { id: '15', label: '15', function: 'Analog In (I)', description: '4-20mA Analog Input for speed reference.' },
                    { id: '16', label: '16', function: 'Analog Out', description: 'Programmable Analog Output (V or I).' },
                    { id: '17', label: '17', function: 'Opto Out 1', description: 'Programmable Optocoupler Output 1.' },
                    { id: '18', label: '18', function: 'Opto Out 2', description: 'Programmable Optocoupler Output 2.' },
                    { id: '19', label: '19', function: 'Opto Common', description: 'Common for Optocoupler Outputs.' },
                ]
            },
             {
                id: 'safety-sto',
                label: 'Safety (STO)',
                x: 15, y: 195, cols: 3,
                terminalWidth: 35, terminalHeight: 18, gapX: 8, gapY: 6,
                bgColorClass: 'fill-yellow-100 dark:fill-yellow-900/50 stroke-yellow-400 dark:stroke-yellow-600',
                terminals: [
                     { id: 'S1', label: 'S1', function: 'Safety 1', description: 'Safe Torque Off Input 1.' },
                     { id: 'S2', label: 'S2', function: 'Safety 2', description: 'Safe Torque Off Input 2.' },
                     { id: 'S+', label: 'S+', function: 'Safety +24V', description: 'Safety Circuit +24V DC Source.' },
                ]
             }
        ],
        jumpers: [{ from: '01', to: '11' }]
    },
    'Sinamics G120': {
        viewBox: '0 0 120 420',
        blocks: [
            {
                id: 'control-terminals',
                label: 'CU230P-2 Control Terminals',
                x: 20, y: 20, cols: 2,
                terminalWidth: 35, terminalHeight: 12, gapX: 10, gapY: 4,
                bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
                terminals: [
                    { id: '31', label: '31', function: '+24V IN', description: 'Optional 24VDC external power input.' },
                    { id: '32', label: '32', function: 'GND IN', description: 'Ground for optional 24VDC external power.' },
                    { id: '35', label: '35', function: '+10V out', description: '10V power supply for analog inputs.' },
                    { id: '36', label: '36', function: 'GND', description: 'Reference for 10V supply.' },
                    { id: '50', label: '50', function: 'AI2+/Ni1000', description: 'Analog Input 2 or Sensor Input.' },
                    { id: '51', label: '51', function: 'GND/Ni1000', description: 'Common for Analog Input 2 or Sensor.' },
                    { id: '52', label: '52', function: 'AI3+/Ni1000', description: 'Analog Input 3 or Sensor Input.' },
                    { id: '53', label: '53', function: 'GND', description: 'Common for Analog Input 3 or Sensor.' },
                    { id: '1', label: '1', function: '+10V out', description: '10V power supply for analog inputs.' },
                    { id: '2', label: '2', function: 'GND', description: 'Common ground for 10V supply.' },
                    { id: '3', label: '3', function: 'AI 0+', description: 'Analog Input 0 Positive (Voltage/Current).' },
                    { id: '4', label: '4', function: 'AI 0-', description: 'Analog Input 0 Negative.' },
                    { id: '12', label: '12', function: 'AO 0+', description: 'Analog Output 0 Positive.' },
                    { id: '13', label: '13', function: 'GND', description: 'Common for Analog Output 0.' },
                    { id: '26', label: '26', function: 'AO 1+', description: 'Analog Output 1 Positive.' },
                    { id: '27', label: '27', function: 'GND', description: 'Common for Analog Output 1.' },
                    { id: '5', label: '5', function: 'DI 0', description: 'Digital Input 0.' },
                    { id: '6', label: '6', function: 'DI 1', description: 'Digital Input 1.' },
                    { id: '7', label: '7', function: 'DI 2', description: 'Digital Input 2.' },
                    { id: '8', label: '8', function: 'DI 3', description: 'Digital Input 3.' },
                    { id: '16', label: '16', function: 'DI 4', description: 'Digital Input 4.' },
                    { id: '17', label: '17', function: 'DI 5', description: 'Digital Input 5.' },
                    { id: '28', label: '28', function: 'GND', description: 'Ground reference for DI COM.' },
                    { id: '69', label: '69', function: 'DI COM', description: 'Common for Digital Inputs.' },
                    { id: '18', label: '18', function: 'DO 0 NC', description: 'Digital Output 0 (Relay), Normally Closed.' },
                    { id: '19', label: '19', function: 'DO 0 NO', description: 'Digital Output 0 (Relay), Normally Open.' },
                    { id: '20', label: '20', function: 'DO 0 COM', description: 'Digital Output 0 (Relay), Common.' },
                    { id: '21', label: '21', function: 'DO 1 NO', description: 'Digital Output 1 (Transistor), Normally Open.' },
                    { id: '22', label: '22', function: 'DO 1 COM', description: 'Digital Output 1 (Transistor), Common.' },
                    { id: '23', label: '23', function: 'DO 2 NC', description: 'Digital Output 2 (Relay), Normally Closed.' },
                    { id: '24', label: '24', function: 'DO 2 NO', description: 'Digital Output 2 (Relay), Normally Open.' },
                    { id: '25', label: '25', function: 'DO 2 COM', description: 'Digital Output 2 (Relay), Common.' },
                    { id: '14', label: '14', function: 'T1 MOTOR', description: 'Motor Temperature Sensor Input 1.' },
                    { id: '15', label: '15', function: 'T2 MOTOR', description: 'Motor Temperature Sensor Input 2.' },
                    { id: '9', label: '9', function: '+24V out', description: '24V power supply for digital inputs.' },
                ]
            }
        ]
    },
    'PowerXL DG1': {
        viewBox: '0 0 200 320',
        blocks: [
            {
                id: 'analog-io',
                label: 'Analog I/O & Outputs',
                x: 20, y: 25, cols: 2,
                terminalWidth: 75, terminalHeight: 18, gapX: 10, gapY: 6,
                bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
                terminals: [
                    { id: '1', label: '+10V Ref', function: '10V Supply', description: '10Vdc Supply Source.' },
                    { id: '17', label: 'AO1+', function: 'Analog Out 1', description: 'Shows Output frequency.' },
                    { id: '2', label: 'AI1+', function: 'Analog In 1', description: 'Voltage Speed Reference (0-10V).' },
                    { id: '18', label: 'AO2+', function: 'Analog Out 2', description: 'Shows Motor current.' },
                    { id: '4', label: 'AI2+', function: 'Analog In 2', description: 'Current Speed Reference (4-20mA).' },
                    { id: '14', label: 'DO1', function: 'Digital Out 1', description: 'Shows the drive is ready to run.' },
                    { id: '3', label: 'AI1- / AI2- / GND', function: 'Analog Common', description: 'Common ground for AI1, AI2.' },
                ]
            },
            {
                id: 'digital-io',
                label: 'Digital I/O & Power',
                x: 20, y: 140, cols: 4,
                terminalWidth: 35, terminalHeight: 18, gapX: 5, gapY: 6,
                bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
                terminals: [
                    { id: '20', label: 'DIN1', function: 'Run Fwd', description: 'Input for forward direction (start enable).' },
                    { id: '21', label: 'DIN2', function: 'Run Rev', description: 'Input for reverse direction (start enable).' },
                    { id: '22', label: 'DIN3', function: 'Ext. Fault', description: 'Input causes drive to fault.' },
                    { id: '23', label: 'DIN4', function: 'Fault Reset', description: 'Input resets active faults.' },
                    { id: '7', label: 'DIN5', function: 'Preset Spd 1', description: 'Sets frequency to Preset Speed 1.' },
                    { id: '8', label: 'DIN6', function: 'Preset Spd 2', description: 'Sets frequency to Preset Speed 2.' },
                    { id: '9', label: 'DIN7', function: 'Not Used', description: 'Input forces VFD output to shut off.' },
                    { id: '10', label: 'DIN8', function: 'Force Remote', description: 'Input takes VFD from Local to Remote.' },
                    { id: '24', label: 'CMA', function: 'DI 1-4 Com', description: 'Common for Digital Inputs 1-4.' },
                    { id: '11', label: 'CMB', function: 'DI 5-8 Com', description: 'Common for Digital Inputs 5-8.' },
                    { id: '19', label: '24Vi', function: '+24V Input', description: 'External control voltage input.' },
                    { id: '13', label: '24Vo', function: '+24V Output', description: 'Control voltage output (100 mA max).' },
                ]
            },
            {
                id: 'relays-comms',
                label: 'Relays & Communications',
                x: 20, y: 245, cols: 5,
                terminalWidth: 28, terminalHeight: 18, gapX: 5, gapY: 6,
                bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
                terminals: [
                    { id: '30', label: 'R1NO', function: 'Relay 1 N.O.', description: 'Relay 1 Normally Open.' },
                    { id: '29', label: 'R1CM', function: 'Relay 1 COM', description: 'Relay 1 Common.' },
                    { id: '28', label: 'R1NC', function: 'Relay 1 N.C.', description: 'Relay 1 Normally Closed.' },
                    { id: '34', label: 'R2NO', function: 'Relay 2 N.O.', description: 'Relay 2 Normally Open.' },
                    { id: '33', label: 'R2CM', function: 'Relay 2 COM', description: 'Relay 2 Common.' },
                    { id: '32', label: 'R2NC', function: 'Relay 2 N.C.', description: 'Relay 2 Normally Closed.' },
                    { id: '27', label: 'R3NO', function: 'Relay 3 N.O.', description: 'Relay 3 Normally Open.' },
                    { id: '31', label: 'R3CM', function: 'Relay 3 COM', description: 'Relay 3 Common.' },
                    { id: '25', label: 'A/+', function: 'RS485 A/+', description: 'Fieldbus Communication.' },
                    { id: '26', label: 'B/-', function: 'RS485 B/-', description: 'Fieldbus Communication.' },
                ]
            }
        ]
    }
};