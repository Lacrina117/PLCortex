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

const powerFlex753Data: VfdDiagramData = {
    viewBox: '0 0 200 230',
    blocks: [
        {
            id: 'tb1-io-block',
            label: 'TB1 - Main I/O (PF753)',
            x: 20, y: 20, cols: 2,
            terminalWidth: 75, terminalHeight: 16, gapX: 10, gapY: 5,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: 'Ao0-', label: 'Ao0-', function: 'Analog Out 0 (-)', description: 'Analog Output 0, Negative/Common.' },
                { id: 'Ao0+', label: 'Ao0+', function: 'Analog Out 0 (+)', description: 'Analog Output 0, Positive.' },
                { id: '10VC', label: '10VC', function: '10V Common', description: 'Common for +10V reference.' },
                { id: '+10V', label: '+10V', function: '+10V Supply', description: 'Internal +10Vdc supply for potentiometers.' },
                { id: 'Ai0-', label: 'Ai0-', function: 'Analog In 0 (-)', description: 'Analog Input 0 (V or I).' },
                { id: 'Ai0+', label: 'Ai0+', function: 'Analog In 0 (+)', description: 'Analog Input 0, Positive.' },
                { id: 'Ptc-', label: 'Ptc-', function: 'Motor PTC (-)', description: 'Input for motor thermistor (PTC).' },
                { id: 'Ptc+', label: 'Ptc+', function: 'Motor PTC (+)', description: 'Input for motor thermistor (PTC).' },
                { id: 'TO', label: 'TO', function: 'Transistor Out 0', description: 'Open-collector transistor output.' },
                { id: '24VC', label: '24VC', function: '24V Common', description: 'Common for +24V supply.' },
                { id: '+24V', label: '+24V', function: '+24V Supply', description: 'Internal +24Vdc supply for digital inputs.' },
                { id: 'DiC', label: 'Di C', function: 'DI Common', description: 'Common for Digital Inputs 1 and 2.' },
                { id: 'Di1', label: 'DI 1', function: 'Digital In 1', description: 'Programmable Digital Input. Default: Stop.' },
                { id: 'Di2', label: 'DI 2', function: 'Digital In 2', description: 'Programmable Digital Input. Default: Start/Run.' },
            ]
        }
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

const abbACS355Data: VfdDiagramData = {
    viewBox: '0 0 200 250',
    blocks: [
        {
            id: 'analog-io',
            label: 'Analog I/O',
            x: 20, y: 25, cols: 4,
            terminalWidth: 40, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                { id: '1', label: 'SCR', function: 'Shield', description: 'Signal cable shield connection.' },
                { id: '2', label: 'AI1', function: 'Analog In 1', description: 'Voltage/Current input (0-10V / 0-20mA).' },
                { id: '3', label: 'AGND', function: 'Analog Gnd', description: 'Common for Analog Inputs.' },
                { id: '4', label: '+10V', function: '+10V Ref', description: 'Reference voltage output for potentiometer.' },
                { id: '5', label: 'AI2', function: 'Analog In 2', description: 'Voltage input (0-10V).' },
                { id: '6', label: 'AGND', function: 'Analog Gnd', description: 'Common for Analog Inputs.' },
                { id: '7', label: 'AO1', function: 'Analog Out 1', description: 'Analog output (0-20mA).' },
                { id: '8', label: 'AGND_AO', function: 'AO Gnd', description: 'Common for Analog Output.' },
            ]
        },
        {
            id: 'digital-io',
            label: 'Digital I/O & Supply',
            x: 20, y: 100, cols: 4,
            terminalWidth: 40, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: '9', label: '+24V', function: '+24V Out', description: 'Auxiliary voltage output (+24VDC).' },
                { id: '10', label: 'DGND', function: 'Digital Gnd', description: 'Common for +24V Out.' },
                { id: '11', label: 'DCOM', function: 'DI Common', description: 'Common for Digital Inputs 1-5.' },
                { id: '12', label: 'DI1', function: 'Start/Stop', description: 'Digital Input 1 (Default: Stop=0 / Start=1).' },
                { id: '13', label: 'DI2', function: 'Fwd/Rev', description: 'Digital Input 2 (Default: Fwd=0 / Rev=1).' },
                { id: '14', label: 'DI3', function: 'Ramp Sel', description: 'Digital Input 3 (Default: Accel/Decel 1 or 2).' },
                { id: '15', label: 'DI4', function: 'Const Speed', description: 'Digital Input 4 for constant speed selection.' },
                { id: '16', label: 'DI5', function: 'Const Speed', description: 'Digital Input 5 for constant speed selection.' },
                { id: '17', label: 'DO1', function: 'Digital Out 1', description: 'Transistor Output (Default: Not Faulted).' },
            ]
        },
        {
            id: 'relay-outputs',
            label: 'Relay Output',
            x: 20, y: 185, cols: 3,
            terminalWidth: 55, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: '18', label: 'NO', function: 'Relay NO', description: 'Relay Output Normally Open.' },
                { id: '19', label: 'COM', function: 'Relay Com', description: 'Relay Output Common.' },
                { id: '20', label: 'NC', function: 'Relay NC', description: 'Relay Output Normally Closed.' },
            ]
        }
    ]
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

const abbACS880Data: VfdDiagramData = {
    viewBox: '0 0 200 240',
    blocks: [
        {
            id: 'analog-io',
            label: 'Analog I/O (X2)',
            x: 20, y: 20, cols: 5,
            terminalWidth: 30, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                { id: 'X2-1', label: '1', function: 'AI1+', description: 'Analog Input 1 (+).' },
                { id: 'X2-2', label: '2', function: 'AI1-', description: 'Analog Input 1 (-).' },
                { id: 'X2-3', label: '3', function: 'AGND', description: 'Analog Ground.' },
                { id: 'X2-4', label: '4', function: 'AO1+', description: 'Analog Output 1 (+).' },
                { id: 'X2-5', label: '5', function: 'AO1-', description: 'Analog Output 1 (-).' },
                { id: 'X2-6', label: '6', function: 'AO2+', description: 'Analog Output 2 (+).' },
                { id: 'X2-7', label: '7', function: 'AO2-', description: 'Analog Output 2 (-).' },
                { id: 'X2-8', label: '8', function: '+10V', description: '10V Reference Output.' },
                { id: 'X2-9', label: '9', function: 'AGND', description: 'Analog Ground.' },
            ]
        },
        {
            id: 'digital-io',
            label: 'Digital I/O (X2)',
            x: 20, y: 75, cols: 5,
            terminalWidth: 30, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: 'X2-10', label: '10', function: '+24V', description: '24V DC Output.' },
                { id: 'X2-11', label: '11', function: 'GND', description: 'Ground for 24V DC.' },
                { id: 'X2-12', label: '12', function: 'DCOM', description: 'Digital Input Common.' },
                { id: 'X2-13', label: '13', function: 'DI1', description: 'Digital Input 1.' },
                { id: 'X2-14', label: '14', function: 'DI2', description: 'Digital Input 2.' },
                { id: 'X2-15', label: '15', function: 'DI3', description: 'Digital Input 3.' },
                { id: 'X2-16', label: '16', function: 'DI4', description: 'Digital Input 4.' },
                { id: 'X2-17', label: '17', function: 'DI5', description: 'Digital Input 5.' },
                { id: 'X2-18', label: '18', function: 'DI6/PTC', description: 'Digital Input 6 or PTC Sensor Input.' },
            ]
        },
        {
            id: 'outputs',
            label: 'Outputs (X3, X4, X5)',
            x: 20, y: 130, cols: 5,
            terminalWidth: 30, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: 'X3-19', label: '19', function: 'DO1+', description: 'Digital Output 1 (+).' },
                { id: 'X3-20', label: '20', function: 'DO1-', description: 'Digital Output 1 (-).' },
                { id: 'X3-21', label: '21', function: 'RO1C', description: 'Relay Output 1 Common.' },
                { id: 'X3-22', label: '22', function: 'RO1NO', description: 'Relay Output 1 Normally Open.' },
                { id: 'X3-23', label: '23', function: 'RO1NC', description: 'Relay Output 1 Normally Closed.' },
                { id: 'X4-24', label: '24', function: 'RO2C', description: 'Relay Output 2 Common.' },
                { id: 'X4-25', label: '25', function: 'RO2NO', description: 'Relay Output 2 Normally Open.' },
                { id: 'X4-26', label: '26', function: 'RO2NC', description: 'Relay Output 2 Normally Closed.' },
            ]
        },
        {
            id: 'safety',
            label: 'Safety STO (X1)',
            x: 20, y: 185, cols: 4,
            terminalWidth: 40, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-yellow-100 dark:fill-yellow-900/50 stroke-yellow-400 dark:stroke-yellow-600',
            terminals: [
                { id: 'X1-1', label: '1', function: 'STO_A', description: 'Safe Torque Off Input A.' },
                { id: 'X1-2', label: '2', function: 'STO_B', description: 'Safe Torque Off Input B.' },
                { id: 'X1-3', label: '3', function: 'GND_S', description: 'STO Ground.' },
                { id: 'X1-4', label: '4', function: 'OUT_S', description: 'STO Status Output.' },
            ]
        }
    ]
};

const sinamicsG120CData: VfdDiagramData = {
    viewBox: '0 0 200 240',
    blocks: [
        {
            id: 'analog-io',
            label: 'Analog I/O',
            x: 20, y: 20, cols: 4,
            terminalWidth: 35, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                { id: '1', label: 'AI+', function: 'Analog In (+)', description: '0-10V Analog Input Positive.' },
                { id: '2', label: 'AI-', function: 'Analog In (-)', description: '0-10V Analog Input Negative / Common.' },
                { id: '3', label: '+10V', function: '+10V Out', description: 'Reference voltage output for potentiometer.' },
                { id: '4', label: '0V', function: '0V Ref', description: 'Common for 10V reference.' },
            ]
        },
        {
            id: 'digital-io',
            label: 'Digital I/O',
            x: 20, y: 75, cols: 4,
            terminalWidth: 35, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: '5', label: 'DI0', function: 'Digital In 0', description: 'Default: ON/OFF1.' },
                { id: '6', label: 'DI1', function: 'Digital In 1', description: 'Default: Reversal.' },
                { id: '7', label: 'DI2', function: 'Digital In 2', description: 'Default: Acknowledge fault.' },
                { id: '8', label: 'DI3', function: 'Digital In 3', description: 'Default: Not assigned.' },
                { id: '9', label: '0V', function: 'DI Common', description: 'Common for DI when using internal 24V supply (pin 10).' },
                { id: '10', label: '+24V', function: '+24V Out', description: 'Internal +24VDC supply for digital I/O.' },
                { id: '11', label: 'DI COM', function: 'DI Common', description: 'Common for DI when using an external 24V supply.' },
            ]
        },
        {
            id: 'digital-out',
            label: 'Digital Output',
            x: 20, y: 150, cols: 2,
            terminalWidth: 78, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: '12', label: 'DO0-NO', function: 'Relay Out NO', description: 'Relay Digital Output, Normally Open.' },
                { id: '13', label: 'DO0-COM', function: 'Relay Out COM', description: 'Relay Digital Output, Common.' },
            ]
        },
        {
            id: 'safety-sto',
            label: 'Safety (STO)',
            x: 20, y: 200, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-yellow-100 dark:fill-yellow-900/50 stroke-yellow-400 dark:stroke-yellow-600',
            terminals: [
                 { id: '29', label: 'STO A', function: 'Safety In A', description: 'Safe Torque Off Input Channel A.' },
                 { id: '30', label: 'STO B', function: 'Safety In B', description: 'Safe Torque Off Input Channel B.' },
                 { id: '31', label: 'STO COM', function: 'Safety Common', description: 'Common for Safe Torque Off inputs.' },
            ]
         }
    ],
};

const sinamicsV20Data: VfdDiagramData = {
    viewBox: '0 0 200 200',
    blocks: [
        {
            id: 'analog-io',
            label: 'Analog I/O',
            x: 20, y: 20, cols: 4,
            terminalWidth: 35, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                { id: '1', label: 'AI 1+', function: 'Analog In 1 (+)', description: '0-10V / 4-20mA Analog Input 1 Positive.' },
                { id: '2', label: 'AI 1-', function: 'Analog In 1 (-)', description: 'Analog Input 1 Negative / Common.' },
                { id: '3', label: '+10V', function: '+10V Out', description: 'Reference voltage output for potentiometer.' },
                { id: '4', label: 'GND', function: '0V Ref', description: 'Common for 10V reference.' },
                { id: '11', label: 'AI 2+', function: 'Analog In 2 (+)', description: '0-10V / 4-20mA Analog Input 2 Positive.' },
                { id: '12', label: 'AI 2-', function: 'Analog In 2 (-)', description: 'Analog Input 2 Negative / Common.' },
                { id: '13', label: 'AO+', function: 'Analog Out (+)', description: '0-20mA Analog Output Positive.' },
                { id: '14', label: 'AO-', function: 'Analog Out (-)', description: 'Analog Output Negative / Common.' },
            ]
        },
        {
            id: 'digital-io',
            label: 'Digital I/O',
            x: 20, y: 95, cols: 5,
            terminalWidth: 28, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: '5', label: 'DI 1', function: 'Digital In 1', description: 'Default: ON/OFF1.' },
                { id: '6', label: 'DI 2', function: 'Digital In 2', description: 'Default: Reversal.' },
                { id: '7', label: 'DI 3', function: 'Digital In 3', description: 'Default: Acknowledge fault.' },
                { id: '8', label: 'DI 4', function: 'Digital In 4', description: 'Default: Fixed frequency selection.' },
                { id: '9', label: '+24V', function: '+24V Out', description: 'Internal +24VDC supply for digital I/O.' },
                { id: '10', label: 'GND', function: 'DI Common', description: 'Common for DI when using internal 24V supply.' },
                { id: '18', label: 'DO1-C', function: 'Relay Out COM', description: 'Relay Digital Output 1, Common.' },
                { id: '19', label: 'DO1-NO', function: 'Relay Out NO', description: 'Relay Digital Output 1, Normally Open.' },
                { id: '28', label: 'DO 2', function: 'Transistor Out', description: 'Transistor Digital Output 2.' },
                { id: '29', label: 'GND_DO', function: 'DO2 Common', description: 'Common for Transistor Digital Output 2.' },
            ]
        }
    ],
};

const micromaster440Data: VfdDiagramData = {
    viewBox: '0 0 200 450',
    blocks: [
        {
            id: 'control-block',
            label: 'Control Terminals',
            x: 20, y: 20, cols: 2,
            terminalWidth: 75, terminalHeight: 15, gapX: 10, gapY: 4,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: '1', label: '1 (RL1 NC)', function: 'Relay 1 NC', description: 'Relay 1 Normally Closed contact.' },
                { id: '2', label: '2 (RL1 NO)', function: 'Relay 1 NO', description: 'Relay 1 Normally Open contact.' },
                { id: '3', label: '3 (RL1 COM)', function: 'Relay 1 COM', description: 'Relay 1 Common.' },
                { id: '4', label: '4 (RL2 NO)', function: 'Relay 2 NO', description: 'Relay 2 Normally Open contact.' },
                { id: '5', label: '5 (RL2 COM)', function: 'Relay 2 COM', description: 'Relay 2 Common.' },
                { id: '6', label: '6 (RL3 NO)', function: 'Relay 3 NO', description: 'Relay 3 Normally Open contact.' },
                { id: '7', label: '7 (RL3 COM)', function: 'Relay 3 COM', description: 'Relay 3 Common.' },
                { id: '8', label: '8 (+24V)', function: '+24V Out', description: 'Internal +24VDC supply output.' },
                { id: '9', label: '9 (0V)', function: 'Digital Common', description: 'Common for Digital Inputs.' },
                { id: '10', label: '10 (DIN1)', function: 'Digital In 1', description: 'Default: ON/OFF1.' },
                { id: '11', label: '11 (DIN2)', function: 'Digital In 2', description: 'Default: Reversal.' },
                { id: '12', label: '12 (DIN3)', function: 'Digital In 3', description: 'Default: Fault Acknowledge.' },
                { id: '13', label: '13 (DIN4)', function: 'Digital In 4', description: 'Programmable Digital Input.' },
                { id: '14', label: '14 (DIN5)', function: 'Digital In 5', description: 'Programmable Digital Input.' },
                { id: '15', label: '15 (DIN6)', function: 'Digital In 6', description: 'Programmable Digital Input.' },
                { id: '16', label: '16 (AIN1+)', function: 'Analog In 1+', description: 'Analog Input 1 Positive (0-10V or 0-20mA).' },
                { id: '17', label: '17 (AIN1-)', function: 'Analog In 1-', description: 'Analog Input 1 Negative/Common.' },
                { id: '18', label: '18 (AIN2+)', function: 'Analog In 2+', description: 'Analog Input 2 Positive.' },
                { id: '19', label: '19 (AIN2-)', function: 'Analog In 2-', description: 'Analog Input 2 Negative/Common.' },
                { id: '20', label: '20 (+10V)', function: '+10V Out', description: 'Reference voltage for potentiometer.' },
                { id: '21', label: '21 (0V)', function: 'Analog Common', description: 'Common for Analog Inputs.' },
                { id: '22', label: '22 (AOUT1+)', function: 'Analog Out 1+', description: 'Analog Output 1 Positive.' },
                { id: '23', label: '23 (AOUT1-)', function: 'Analog Out 1-', description: 'Analog Output 1 Negative/Common.' },
                { id: '24', label: '24 (AOUT2+)', function: 'Analog Out 2+', description: 'Analog Output 2 Positive.' },
                { id: '25', label: '25 (AOUT2-)', function: 'Analog Out 2-', description: 'Analog Output 2 Negative/Common.' },
                { id: '28', label: '28 (B+)', function: 'RS485 B+', description: 'RS485 Communication Positive.' },
                { id: '29', label: '29 (A-)', function: 'RS485 A-', description: 'RS485 Communication Negative.' },
            ]
        }
    ]
};

const powerFlex4MData: VfdDiagramData = {
    viewBox: '0 0 200 240',
    blocks: [
        {
            id: 'control-block',
            label: 'Control Terminals',
            x: 20, y: 25, cols: 2,
            terminalWidth: 75, terminalHeight: 15, gapX: 10, gapY: 5,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: '01', label: '01', function: 'Stop', description: 'Stop command. Removes power from the motor.' },
                { id: '02', label: '02', function: 'Start/Run Fwd', description: 'Start or Run Forward command.' },
                { id: '03', label: '03', function: 'Direction/Run Rev', description: 'Direction or Run Reverse command.' },
                { id: '04', label: '04', function: 'Digital Common', description: 'Common for digital inputs 1-7.' },
                { id: '05', label: '05', function: 'Preset Freq 1', description: 'Selects preset frequency 1.' },
                { id: '06', label: '06', function: 'Preset Freq 2', description: 'Selects preset frequency 2.' },
                { id: '07', label: '07', function: 'Preset Freq 3', description: 'Selects preset frequency 3.' },
            ]
        },
        {
            id: 'analog-block',
            label: 'Analog I/O',
            x: 20, y: 120, cols: 2,
            terminalWidth: 75, terminalHeight: 15, gapX: 10, gapY: 5,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                { id: '08', label: '08', function: 'Analog In (0-10V)', description: '0-10V analog input for speed reference.' },
                { id: '09', label: '09', function: 'Analog Common', description: 'Common for analog inputs.' },
                { id: '10', label: '10', function: '+10V DC', description: '10V DC supply for potentiometer.' },
                { id: '11', label: '11', function: 'Analog In (4-20mA)', description: '4-20mA analog input for speed reference.' },
            ]
        },
        {
            id: 'relay-block',
            label: 'Relay Output',
            x: 20, y: 180, cols: 2,
            terminalWidth: 75, terminalHeight: 15, gapX: 10, gapY: 5,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: 'C1', label: 'C1', function: 'Relay Common', description: 'Form C Relay Common.' },
                { id: 'C2', label: 'C2', function: 'Relay N.O.', description: 'Form C Relay Normally Open contact.' },
            ]
        }
    ]
};

const yaskawaGA500Data: VfdDiagramData = {
    viewBox: '0 0 200 300',
    blocks: [
        {
            id: 'digital-inputs',
            label: 'Digital I/O & Supply',
            x: 20, y: 20, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: 'S1', label: 'S1', function: 'Run Fwd', description: 'Digital Input 1, default Run Forward.' },
                { id: 'S2', label: 'S2', function: 'Run Rev', description: 'Digital Input 2, default Run Reverse.' },
                { id: 'S3', label: 'S3', function: 'Fault Reset', description: 'Digital Input 3, default Fault Reset.' },
                { id: 'S4', label: 'S4', function: 'DI 4', description: 'Programmable Digital Input 4.' },
                { id: 'S5', label: 'S5', function: 'DI 5', description: 'Programmable Digital Input 5.' },
                { id: 'S6', label: 'S6', function: 'DI 6', description: 'Programmable Digital Input 6 (Pulse In).' },
                { id: 'SP', label: 'SP', function: '+24V Out', description: 'Internal +24V Supply Source.' },
                { id: 'SN', label: 'SN', function: '24V Common', description: 'Common for Digital Inputs.' },
            ]
        },
        {
            id: 'analog-io',
            label: 'Analog I/O',
            x: 20, y: 110, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                { id: 'A1', label: 'A1', function: 'Analog In 1 (V)', description: 'Voltage Input for Speed Reference.' },
                { id: 'A2', label: 'A2', function: 'Analog In 2 (V/I)', description: 'Voltage or Current Input.' },
                { id: 'AC', label: 'AC', function: 'Analog Common', description: 'Common for Analog Inputs and Outputs.' },
                { id: '+V', label: '+V', function: '+10V Supply', description: 'Supply for potentiometer (+10V).' },
                { id: '-V', label: '-V', function: '-10V Supply', description: 'Supply for potentiometer (-10V).' },
                { id: 'AM', label: 'AM', function: 'Analog Out', description: 'Analog Monitor Output (Voltage/Current).' },
                { id: 'FM', label: 'FM', function: 'Pulse Out', description: 'Pulse Train Monitor Output.' },
            ]
        },
        {
            id: 'relays',
            label: 'Relay Outputs',
            x: 20, y: 190, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: 'R1A', label: 'R1A', function: 'Relay 1 NO', description: 'Multi-function Relay 1, Normally Open.' },
                { id: 'R1B', label: 'R1B', function: 'Relay 1 NC', description: 'Multi-function Relay 1, Normally Closed.' },
                { id: 'R1C', label: 'R1C', function: 'Relay 1 COM', description: 'Multi-function Relay 1, Common.' },
                { id: 'R2A', label: 'R2A', function: 'Relay 2 NO', description: 'Multi-function Relay 2, Normally Open.' },
                { id: 'R2C', label: 'R2C', function: 'Relay 2 COM', description: 'Multi-function Relay 2, Common.' },
            ]
        },
        {
            id: 'safety-sto',
            label: 'Safety (STO)',
            x: 20, y: 250, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-yellow-100 dark:fill-yellow-900/50 stroke-yellow-400 dark:stroke-yellow-600',
            terminals: [
                 { id: 'H1', label: 'H1', function: 'STO 1', description: 'Safe Torque Off Input 1.' },
                 { id: 'H2', label: 'H2', function: 'STO 2', description: 'Safe Torque Off Input 2.' },
                 { id: 'HC', label: 'HC', function: 'STO Common', description: 'Safe Torque Off Common.' },
            ]
        }
    ]
};

const yaskawaA1000Data: VfdDiagramData = {
    viewBox: '0 0 200 360',
    blocks: [
        {
            id: 'digital-inputs',
            label: 'Digital Inputs & Supply',
            x: 20, y: 20, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: 'S1', label: 'S1', function: 'Run Fwd', description: 'Digital Input 1, default Run Forward.' },
                { id: 'S2', label: 'S2', function: 'Run Rev', description: 'Digital Input 2, default Run Reverse.' },
                { id: 'S3', label: 'S3', function: 'External Fault', description: 'Digital Input 3, default External Fault.' },
                { id: 'S4', label: 'S4', function: 'Fault Reset', description: 'Digital Input 4, default Fault Reset.' },
                { id: 'S5', label: 'S5', function: 'DI 5', description: 'Programmable Digital Input 5.' },
                { id: 'S6', label: 'S6', function: 'DI 6', description: 'Programmable Digital Input 6.' },
                { id: 'S7', label: 'S7', function: 'DI 7', description: 'Programmable Digital Input 7.' },
                { id: 'S8', label: 'S8', function: 'DI 8', description: 'Programmable Digital Input 8 (Pulse In).' },
                { id: 'SC', label: 'SC', function: 'DI Common (Sink)', description: 'Common for Sink Digital Inputs.' },
                { id: 'SN', label: 'SN', function: 'DI Common (Source)', description: 'Common for Source Digital Inputs.' },
                { id: 'SP', label: 'SP', function: '+24V Out', description: 'Internal +24V Supply Source.' },
            ]
        },
        {
            id: 'analog-io',
            label: 'Analog I/O',
            x: 20, y: 155, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                { id: 'A1', label: 'A1', function: 'Analog In 1 (V)', description: 'Voltage Input for Speed Reference.' },
                { id: 'A2', label: 'A2', function: 'Analog In 2 (V/I)', description: 'Voltage or Current Input.' },
                { id: 'A3', label: 'A3', function: 'Analog In 3 (V)', description: 'Voltage Input for Trim, etc.' },
                { id: '+V', label: '+V', function: '+10V Supply', description: 'Supply for potentiometer (+10V).' },
                { id: '-V', label: '-V', function: '-10V Supply', description: 'Supply for potentiometer (-10V).' },
                { id: 'AC', label: 'AC', function: 'Analog Common', description: 'Common for Analog Inputs and Outputs.' },
                { id: 'AM', label: 'AM', function: 'Analog Out', description: 'Analog Monitor Output (Voltage/Current).' },
                { id: 'P1', label: 'P1', function: 'Pulse Out +', description: 'Pulse Train Monitor Output Positive.' },
                { id: 'M1', label: 'M1', function: 'Pulse Out -', description: 'Pulse Train Monitor Output Negative.' },
            ]
        },
        {
            id: 'relays',
            label: 'Relay & Digital Outputs',
            x: 20, y: 245, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: 'MA', label: 'MA', function: 'Relay NO', description: 'Multi-function Relay, Normally Open.' },
                { id: 'MB', label: 'MB', function: 'Relay NC', description: 'Multi-function Relay, Normally Closed.' },
                { id: 'MC', label: 'MC', function: 'Relay COM', description: 'Multi-function Relay, Common.' },
                { id: 'P2', label: 'P2', function: 'Digital Out +', description: 'Digital Output Positive.' },
                { id: 'M2', label: 'M2', function: 'Digital Out -', description: 'Digital Output Negative.' },
            ]
        },
        {
            id: 'safety-sto',
            label: 'Safety (STO)',
            x: 20, y: 305, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-yellow-100 dark:fill-yellow-900/50 stroke-yellow-400 dark:stroke-yellow-600',
            terminals: [
                 { id: 'H1', label: 'H1', function: 'STO 1', description: 'Safe Torque Off Input 1.' },
                 { id: 'H2', label: 'H2', function: 'STO 2', description: 'Safe Torque Off Input 2.' },
                 { id: 'HC', label: 'HC', function: 'STO Common', description: 'Safe Torque Off Common.' },
            ]
        }
    ]
};

const yaskawaV1000Data: VfdDiagramData = {
    viewBox: '0 0 200 280',
    blocks: [
        {
            id: 'digital-io',
            label: 'Digital I/O',
            x: 20, y: 20, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: 'S1', label: 'S1', function: 'Run Fwd/Rev', description: 'Digital Input 1.' },
                { id: 'S2', label: 'S2', function: 'External Fault', description: 'Digital Input 2.' },
                { id: 'S3', label: 'S3', function: 'Fault Reset', description: 'Digital Input 3.' },
                { id: 'S4', label: 'S4', function: 'Multi-Step Speed 1', description: 'Digital Input 4.' },
                { id: 'S5', label: 'S5', function: 'Multi-Step Speed 2', description: 'Digital Input 5.' },
                { id: 'S6', label: 'S6', function: 'Multi-Step Speed 3', description: 'Digital Input 6.' },
                { id: 'SC', label: 'SC', function: 'DI Common (Sink)', description: 'Common for Sink Logic.' },
                { id: 'SP', label: 'SP', function: 'DI Common (Source)', description: 'Common for Source Logic.' },
            ]
        },
        {
            id: 'analog-io',
            label: 'Analog I/O',
            x: 20, y: 110, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                { id: 'A1', label: 'A1', function: 'Freq Ref 1 (V)', description: '0-10V Analog Input.' },
                { id: 'A2', label: 'A2', function: 'Freq Ref 2 (I)', description: '4-20mA Analog Input.' },
                { id: 'AC', label: 'AC', function: 'Analog Common', description: 'Common for Analog I/O.' },
                { id: '+V', label: '+V', function: '+10V Supply', description: '+10.8V Supply for Potentiometer.' },
                { id: '-V', label: '-V', function: '-10V Supply', description: '-10.8V Supply for Potentiometer.' },
                { id: 'AM', label: 'AM', function: 'Analog Out', description: 'Analog Monitor Output.' },
            ]
        },
        {
            id: 'outputs-safety',
            label: 'Outputs & Safety',
            x: 20, y: 180, cols: 3,
            terminalWidth: 48, terminalHeight: 18, gapX: 8, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: 'P1', label: 'P1', function: 'Pulse Output', description: 'Pulse Train Output.' },
                { id: 'PC', label: 'PC', function: 'Pulse Common', description: 'Common for Pulse Train Output.' },
                { id: 'MA', label: 'MA', function: 'Relay NO', description: 'Multi-Function Relay Normally Open.' },
                { id: 'MB', label: 'MB', function: 'Relay NC', description: 'Multi-Function Relay Normally Closed.' },
                { id: 'MC', label: 'MC', function: 'Relay COM', description: 'Multi-Function Relay Common.' },
                { id: 'H1', label: 'H1', function: 'STO 1', description: 'Safe Torque Off Input 1.' },
                { id: 'H2', label: 'H2', function: 'STO 2', description: 'Safe Torque Off Input 2.' },
                { id: 'HC', label: 'HC', function: 'STO Common', description: 'Safe Torque Off Common.' },
            ]
        }
    ]
};

const danfossFC280Data: VfdDiagramData = {
    viewBox: '0 0 200 320',
    blocks: [
        {
            id: 'digital-io',
            label: 'Digital I/O & Supply',
            x: 20, y: 20, cols: 4,
            terminalWidth: 40, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: '12', label: '12', function: '+24V Out', description: 'Internal 24V DC supply output.' },
                { id: '13', label: '13', function: '+24V Out', description: 'Internal 24V DC supply output.' },
                { id: '20', label: '20', function: '24V Common', description: 'Common for internal 24V supply.' },
                { id: '37', label: '37', function: 'STO', description: 'Safe Torque Off input. Must have +24V to run.' },
                { id: '18', label: '18', function: 'DI Start', description: 'Digital Input, Default: Start.' },
                { id: '19', label: '19', function: 'DI Reverse', description: 'Digital Input, Default: Reversing.' },
                { id: '27', label: '27', function: 'DI Jog', description: 'Digital Input, Default: Jog.' },
                { id: '29', label: '29', function: 'DI Reset', description: 'Digital Input, Default: Reset.' },
                { id: '32', label: '32', function: 'DI Prog', description: 'Programmable Digital Input.' },
                { id: '33', label: '33', function: 'DI Prog', description: 'Programmable Digital Input.' },
            ]
        },
        {
            id: 'analog-io',
            label: 'Analog I/O',
            x: 20, y: 120, cols: 4,
            terminalWidth: 40, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                { id: '50', label: '50', function: '+10V Out', description: '10V DC supply for potentiometer.' },
                { id: '53', label: '53', function: 'AI Voltage', description: 'Analog Input, Voltage reference.' },
                { id: '54', label: '54', function: 'AI V/I', description: 'Analog Input, Voltage or Current reference.' },
                { id: '55', label: '55', function: 'Analog Common', description: 'Common for Analog Inputs & Output.' },
                { id: '42', label: '42', function: 'AO Current', description: 'Analog Output, 0/4-20mA.' },
            ]
        },
        {
            id: 'relays',
            label: 'Relay Outputs',
            x: 20, y: 190, cols: 3,
            terminalWidth: 55, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: '01', label: '01', function: 'Relay 1 NO', description: 'Relay 1, Normally Open.' },
                { id: '02', label: '02', function: 'Relay 1 COM', description: 'Relay 1, Common.' },
                { id: '03', label: '03', function: 'Relay 1 NC', description: 'Relay 1, Normally Closed.' },
                { id: '04', label: '04', function: 'Relay 2 NO', description: 'Relay 2, Normally Open.' },
                { id: '05', label: '05', function: 'Relay 2 COM', description: 'Relay 2, Common.' },
            ]
        },
         {
            id: 'fieldbus',
            label: 'RS-485 Fieldbus',
            x: 20, y: 250, cols: 4,
            terminalWidth: 40, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-purple-100 dark:fill-purple-900/50 stroke-purple-400 dark:stroke-purple-600',
            terminals: [
                { id: '61', label: '61', function: 'Common', description: 'Common for RS-485.' },
                { id: '68', label: '68', function: 'Term B (+)', description: 'RS-485 Signal B (+).' },
                { id: '69', label: '69', function: 'Term A (-)', description: 'RS-485 Signal A (-).' },
            ]
        }
    ]
};

const danfossFC302Data: VfdDiagramData = {
    viewBox: '0 0 200 320',
    blocks: [
        {
            id: 'digital-io',
            label: 'Digital I/O & Supply',
            x: 20, y: 20, cols: 4,
            terminalWidth: 40, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-gray-200 dark:fill-gray-700 stroke-gray-400 dark:stroke-gray-600',
            terminals: [
                { id: '12', label: '12', function: '+24V Out', description: 'Internal 24V DC supply output.' },
                { id: '13', label: '13', function: '+24V Out', description: 'Internal 24V DC supply output.' },
                { id: '20', label: '20', function: '24V Common', description: 'Common for internal 24V supply.' },
                { id: '37', label: '37', function: 'STO', description: 'Safe Torque Off input (Safe Stop). Must have +24V to run.' },
                { id: '18', label: '18', function: 'DI Start', description: 'Digital Input, Default: Start (PNP/NPN).' },
                { id: '19', label: '19', function: 'DI Reverse', description: 'Digital Input, Default: Reversing (PNP/NPN).' },
                { id: '27', label: '27', function: 'DI Coast', description: 'Digital Input, Default: Coast inverse (PNP/NPN).' },
                { id: '29', label: '29', function: 'DI Reset/Jog', description: 'Digital Input, Default: Reset and Jog (PNP/NPN).' },
                { id: '32', label: '32', function: 'DI Prog', description: 'Programmable Digital Input (PNP/NPN).' },
                { id: '33', label: '33', function: 'DI Prog', description: 'Programmable Digital Input (PNP/NPN).' },
            ]
        },
        {
            id: 'analog-io',
            label: 'Analog I/O',
            x: 20, y: 120, cols: 4,
            terminalWidth: 40, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-blue-100 dark:fill-blue-900/30 stroke-blue-300 dark:stroke-blue-700',
            terminals: [
                { id: '50', label: '50', function: '+10V Out', description: '10V DC supply for potentiometer.' },
                { id: '53', label: '53', function: 'AI Voltage', description: 'Analog Input, Voltage reference.' },
                { id: '54', label: '54', function: 'AI Current', description: 'Analog Input, Current reference.' },
                { id: '55', label: '55', function: 'Analog Common', description: 'Common for Analog Inputs & Output.' },
                { id: '42', label: '42', function: 'AO Current', description: 'Analog Output, 0/4-20mA.' },
            ]
        },
        {
            id: 'relays',
            label: 'Relay Outputs',
            x: 20, y: 190, cols: 3,
            terminalWidth: 55, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-green-200 dark:fill-green-900/50 stroke-green-400 dark:stroke-green-600',
            terminals: [
                { id: '01', label: '01', function: 'Relay 1 NO', description: 'Relay 1, Normally Open.' },
                { id: '02', label: '02', function: 'Relay 1 COM', description: 'Relay 1, Common.' },
                { id: '03', label: '03', function: 'Relay 1 NC', description: 'Relay 1, Normally Closed.' },
                { id: '04', label: '04', function: 'Relay 2 NO', description: 'Relay 2, Normally Open.' },
                { id: '05', label: '05', function: 'Relay 2 COM', description: 'Relay 2, Common.' },
                { id: '06', label: '06', function: 'Relay 2 NC', description: 'Relay 2, Normally Closed.' },
            ]
        },
         {
            id: 'fieldbus',
            label: 'RS-485 Fieldbus',
            x: 20, y: 250, cols: 4,
            terminalWidth: 40, terminalHeight: 18, gapX: 5, gapY: 6,
            bgColorClass: 'fill-purple-100 dark:fill-purple-900/50 stroke-purple-400 dark:stroke-purple-600',
            terminals: [
                { id: '61', label: '61', function: 'Common', description: 'Common for RS-485.' },
                { id: '68', label: '68', function: 'Term P (+)', description: 'RS-485 Signal P (+).' },
                { id: '69', label: '69', function: 'Term N (-)', description: 'RS-485 Signal N (-).' },
            ]
        }
    ]
};


export const vfdTerminalData: { [key: string]: VfdDiagramData } = {
    'Sinamics G120C': sinamicsG120CData,
    'Sinamics V20': sinamicsV20Data,
    'Micromaster 440': micromaster440Data,
    'PowerFlex 753': powerFlex753Data,
    'PowerFlex 755': powerFlex753Data, // The main I/O block is similar per the quick start guide.
    'PowerFlex 4M': powerFlex4MData,
    'Altivar Machine ATV320': altivar320Data,
    'Altivar Process ATV630': altivar630_650_Data,
    'Altivar Process ATV650': altivar630_650_Data,
    'ACS355': abbACS355Data,
    'ACS580': abbACS580Data,
    'ACS880': abbACS880Data,
    'GA500': yaskawaGA500Data,
    'A1000': yaskawaA1000Data,
    'V1000': yaskawaV1000Data,
    'VLT Midi Drive FC 280': danfossFC280Data,
    'VLT FC 302': danfossFC302Data,
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