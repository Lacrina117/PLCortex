
export const translations = {
    en: {
        header: {
            solutions: 'Solutions',
            practices: 'Practices',
            tools: 'Tools',
            commissioning: 'Commissioning',
            reference: 'Reference',
            calculator: 'Calculators',
            shiftLog: 'Shift Log',
            signedInAs: 'Signed in as',
            logout: 'Logout',
        },
        header_descriptions: {
            solutions: 'Get instant answers and troubleshooting help.',
            practices: 'Generate practice problems to hone your skills.',
            tools: 'Use specialized tools for analysis and verification.',
            commissioning: 'Follow interactive guides for VFD commissioning.',
            reference: 'Quickly look up fault codes and data types.',
            calculator: 'Perform common industrial calculations.',
            shiftLog: 'Track shift events and generate professional reports.',
        },
        dashboard: {
            title: 'Welcome to PLCortex',
            subtitle: 'Your expert co-pilot for industrial automation. Select a tool to begin.',
            recentActivity: 'Recent Activity',
            toolsSection: 'Engineering Suite'
        },
        login: {
            title: 'Access Control',
            subtitle: 'Enter your access code to continue',
            placeholder: 'Enter Code (XXXX-XXXX)',
            button: 'Verify Access',
            loading: 'Verifying...',
            error: 'Invalid or expired access code.',
            masterUser: 'Master Engineering User'
        },
        landing: {
            heroTitle: 'Intelligent Industrial Automation',
            heroDescription: 'The ultimate toolkit for PLC programming, VFD commissioning, and electrical engineering.',
            heroCta: 'Access Platform',
            plcTitle: 'PLC Engineering',
            plcDescription: 'Structured text, ladder logic optimization, and protocol migration help.',
            plcTags: 'Siemens, Rockwell, Schneider, Code Migration',
            vfdTitle: 'Motion Control',
            vfdDescription: 'Step-by-step commissioning guides and visual terminal diagnosis.',
            vfdTags: 'PowerFlex, Sinamics, Altivar, ACS880',
            creator: 'Developed by specialized automation engineers.'
        },
        chat: {
            newChat: 'New Session',
            historyTitle: 'Recent Sessions',
            welcomeTitle: 'Engineering Assistant',
            welcomeMessage: 'I am ready to help with your {brand} {topic} tasks. Select a quick action or type your query.',
            placeholder: 'Type your technical question here...',
            thinking: 'Analyzing system context...',
            finishConversation: 'Finish Session',
            contextTitle: 'System Context',
            contextLocked: 'Locked',
            contextEditable: 'Editable',
            newChatTitle: 'New Technical Consultation',
            startNewChat: 'Start New Chat',
            copyText: 'Copy Text',
            copied: 'Copied!',
            suggestions: {
                plc_st: 'Generate Structured Text for a PID loop',
                plc_ladder: 'Create Ladder Logic for a Motor Starter',
                plc_comms: 'How to setup Modbus TCP communication?',
                vfd_param: 'List parameters for 2-Wire Control',
                vfd_fault: 'Troubleshoot Overcurrent Fault',
                vfd_wiring: 'Show control terminal wiring'
            }
        },
        practices: {
            title: 'Skill Development',
            description: 'Select your focus area to generate a realistic industrial scenario.',
            selectTopic: 'Select Topic',
            selectDifficulty: 'Difficulty Level',
            generateBtn: 'Generate Scenario',
            randomChallenge: 'Random Challenge',
            generating: 'Designing Scenario...',
            plcLabel: 'Logic & Programming',
            vfdLabel: 'Drives & Motion',
            hintButton: 'Need a Hint?',
            hideHint: 'Hide Hint',
            revealSolution: 'Reveal Expert Solution',
            hideSolution: 'Hide Solution'
        },
        practice: {
            title: 'Practice Case',
            showSolution: 'View Recommended Solution',
            hideSolution: 'Hide Solution',
            solutionTitle: 'Expert Resolution'
        },
        wiring: {
            title: 'Wiring Assistant',
            description: 'Generate connection diagrams and wiring guides for motors and control systems.',
            vfdDetails: 'VFD Specifications',
            controlDetails: 'Control Logic',
            controlMethod: 'Control Method',
            controlMethod2Wire: '2-Wire Control',
            controlMethod3Wire: '3-Wire Control',
            configSoftware: 'Configuration Software',
            motorDetails: 'Motor Specifications',
            motorHP: 'Horsepower (HP)',
            motorVoltage: 'Voltage (V)',
            motorFLA: 'FLA (Amps)',
            application: 'Application Context',
            applicationPlaceholder: 'e.g. A conveyor belt that needs to start smoothly...',
            generateButton: 'Generate Wiring Guide',
            generatingButton: 'Generating Guide...'
        },
        commissioning: {
            title: 'Interactive Commissioning',
            historyTitle: 'Session History',
            newChat: 'New Guide',
            selectTitle: 'VFD Commissioning Guide',
            selectDescription: 'Choose a device to start an interactive commissioning session with visual terminal support.',
            brandLabel: 'VFD Brand',
            modelLabel: 'VFD Model',
            applicationLabel: 'Application Type',
            startButton: 'Start Commissioning',
            placeholder: 'Ask about parameters, wiring, or tuning...',
            initialPrompt: 'I need to commission this VFD for a {application}. Please provide a step-by-step guide focusing on this hardware.',
            terminalQuery: 'Explain the function and typical wiring for terminal {label} ({func}).',
            diagramNotAvailable: 'Diagram Not Available',
            diagramNotAvailableDesc: 'We are currently adding the visual map for this specific model.',
            appConveyor: 'Conveyor Belt',
            appFan: 'Fan / Centrifugal',
            appPumpPID: 'Pump (PID Control)',
            appGeneral: 'General Purpose',
        },
        tools: {
            title: 'Analysis Tools',
            description: 'Advanced diagnostic and validation modules for industrial systems.',
            backToTools: 'Back to Tools',
            generateButton: 'Run Analysis',
            faultDiagnosis: {
                title: 'VFD Fault Diagnosis',
                description: 'Expert analysis of VFD fault codes with visual context support.',
                vfdBrand: 'VFD Brand',
                vfdModel: 'VFD Model',
                faultCode: 'Fault Code',
                faultCodePlaceholder: 'e.g. F0001 or 0x01',
                context: 'Environmental Context',
                contextPlaceholder: 'Describe what happened (e.g. machine was accelerating...)'
            },
            logicValidator: {
                title: 'Logic Validator',
                description: 'Analyze PLC code for potential conflicts, performance issues, or safety risks.',
                codeLabel: 'PLC Code',
                codePlaceholder: 'Paste code here...',
                analyzeButton: 'Validate Logic',
                analyzing: 'Scanning Logic...',
                analysisResults: 'Detected Logic Issues',
                suggestButton: 'Propose Code Correction',
                suggesting: 'Generating optimized code...',
                noIssues: '✅ No significant logic issues detected.'
            },
            migration: {
                title: 'Code Migration',
                description: 'Translate logic between different industrial platforms.',
                sourceGroup: 'Source Platform',
                targetGroup: 'Target Platform',
                convertButton: 'Migrate Code',
                converting: 'Translating Logic...',
                codePlaceholder: 'Paste code to migrate...'
            },
            scanTime: {
                title: 'Performance Analysis',
                description: 'Estimate execution impact and scan time overhead.',
                codeLabel: 'Logic Segment',
                codePlaceholder: 'Paste code to analyze...'
            },
            energy: {
                title: 'Energy Efficiency',
                description: 'Generate VFD optimization plans to reduce power consumption.',
                appType: 'Application Type',
                appTypes: { pump: 'Pump', fan: 'Fan', conveyor: 'Conveyor', compressor: 'Compressor' },
                loadProfile: 'Load Profile',
                loadProfilePlaceholder: 'Describe operating hours and speeds...'
            },
            codeProver: {
                title: 'Safety Verifier',
                description: 'Verify if logic adheres to specific safety rules and interlocks.',
                rulesLabel: 'Safety Rules',
                rulesPlaceholder: 'e.g. Valve A and Pump B must never run together.'
            },
            network: {
                title: 'Network & Comms',
                description: 'Protocol tools, frame analysis, and hardware planning.',
                calculateButton: 'Calculate Checksum',
                protocolsLabel: 'Interconnect Protocols',
                checksum: {
                    title: 'Checksum/CRC',
                    description: 'Verify integrity of Modbus or Serial frames.',
                    frameLabel: 'Hex Frame',
                    framePlaceholder: 'e.g. 01 03 00 0A',
                    resultsTitle: 'Integrity Results',
                    crc16: 'CRC-16 (Modbus)',
                    lrc: 'LRC (ASCII)',
                    checksum: 'Checksum Simple',
                    order_lf: 'Low Byte First',
                    order_hf: 'High Byte First'
                },
                ascii: {
                    title: 'Serial Decoder',
                    description: 'Decode complex ASCII frames from field devices.',
                    frameLabel: 'ASCII Stream',
                    framePlaceholder: 'e.g. <STX>+0015.50g<CR><LF>'
                },
                hardware: {
                    title: 'Network Planner',
                    description: 'Determine required hardware to bridge different protocols.'
                }
            }
        },
        calculator: {
            title: 'Engineering Calculators',
            description: 'Precise mathematical tools for industrial design and commissioning.',
            ohmsLaw: { tabTitle: 'Ohms Law', title: 'Ohm\'s Law & Power', description: 'Enter any two values to calculate the others.', voltage: 'Voltage (V)', current: 'Current (A)', resistance: 'Resistance (Ω)', power: 'Power (W)', reset: 'Reset' },
            thermal: { tabTitle: 'Thermal Load', title: 'Panel Thermal Analysis', description: 'Calculate required cooling based on internal heat dissipation.', components: 'Internal Components', addComponent: 'Add to Panel', addedComponents: 'Panel Content', panelDimensions: 'Enclosure Dimensions (in)', height: 'Height', width: 'Width', depth: 'Depth', temperatures: 'Target Temperatures (°F)', internal: 'Max Internal', external: 'Max Ambient', calculateButton: 'Calculate BTU/hr', resultsTitle: 'Thermal Results', totalHeat: 'Total Heat Load', watts: 'Watts', panelArea: 'Surface Area', sqft: 'Sq. Ft.', tempDifference: 'Temp. Delta', coolingCapacity: 'Enclosure Dissipation', btu: 'BTU/hr', coolingRequired: 'Required Cooling Capacity', noCooling: 'No active cooling needed.' },
            motorControl: { tabTitle: 'Motor Sizing', title: 'NEC Motor Control Sizing', description: 'Dimension breakers, contactors, and wires according to NEC standards.', motorDetails: 'Standard Motor Search', horsepower: 'HP', voltage: 'Voltage', phase: 'Phase', phaseThree: '3-Phase', phaseSingle: '1nd-Phase', nameplateData: 'Actual Nameplate Data', nominalCurrent: 'Nominal Amps (In)', serviceFactor: 'Service Factor (SF)', serviceFactorCurrent: 'Max Operating Current', analyzeNameplate: 'Scan Plate', analyzing: 'Analyzing...', resultsTitle: 'NEC Sizing Results', fla: 'Standard FLA', overload: 'Overload Setting', overloadRange: 'Recommended Max', contactor: 'Contactor', breaker: 'Circuit Breaker', wire: 'Wire Gauge', disclaimer: 'Calculations based on NEC tables.', removeImage: 'Remove', calculateButton: 'Calculate Sizing' },
            plcScaling: { tabTitle: 'PLC Scaling', title: 'Analog Signal Scaling', description: 'Calculate the linear equation for PLC analog inputs/outputs.', inputRange: 'Raw Signal (PLC)', outputRange: 'Engineering Units', min: 'Min', max: 'Max', options: 'Options', clamping: 'Enable Limit Clamping', resultsTitle: 'Scaling Results', formula: 'Linear Equation', codeSample: 'PLC Implementation Code', codeLang: { st: 'Structured Text', ld: 'Ladder (Math)', fbd: 'Function Block' }, rawSignal: 'Raw Test Value', engUnits: 'Result Value', interactiveTester: 'Interactive Simulator', alarmCalculator: 'Alarm Level Thresholds', alarmHH: 'HH Alarm', alarmH: 'H Alarm', alarmL: 'L Alarm', alarmLL: 'LL Alarm', alarmDesc: 'Set alarms in Engineering Units to get corresponding RAW values.', units: { custom: 'Custom Range', raw_4_20ma: 'Standard 4-20mA', raw_0_10v: 'Standard 0-10V', raw_rockwell_4_20ma: 'Rockwell 4-20mA', raw_siemens_4_20ma: 'Siemens 4-20mA', raw_unsigned_12: 'Unsigned 12-bit', raw_unsigned_14: 'Unsigned 14-bit', raw_unsigned_16: 'Unsigned 16-bit', raw_signed_15: 'Signed 15-bit', raw_rockwell_10v: 'Rockwell +/- 10V', raw_siemens_10v: 'Siemens +/- 10V', eng_percent: 'Percentage (%)', eng_freq_60hz: 'Frequency (60Hz)', eng_speed_1800rpm: 'Speed (1800 RPM)', eng_torque_300: 'Torque (300%)', eng_psi_150: 'Pressure (150 PSI)', eng_celsius_100: 'Temp (100°C)', eng_fahrenheit_212: 'Temp (212°F)', eng_gpm_500: 'Flow (500 GPM)', eng_liters_1000: 'Flow (1000 L/m)' }, codeComments: { declarations: 'Declarations', rawValue: 'Raw value from AI module', scaledValue: 'Calculated engineering value', scalingConstants: 'Scaling Constants', tempVar: 'Temporary conversion variable', logic: 'Scaling Logic', convertToReal: '1. Convert raw INT to REAL', applyFormula: '2. Apply Linear Formula', clamp: '3. Clamping (Optional)' } },
            voltageDrop: { tabTitle: 'Voltage Drop', title: 'Voltage Drop Analysis', description: 'Calculate drop for power runs to remote motors or panels.', electricalSystem: 'System Specs', voltage: 'Nominal Voltage', phase: 'Phase', phaseThree: '3-Phase', phaseSingle: '1-Phase', load: 'Load Specs', current: 'Amperage (A)', conductor: 'Conductor Specs', material: 'Material', copper: 'Copper', aluminum: 'Aluminum', wireGauge: 'Wire Size', distance: 'One-way Distance', feet: 'Feet', meters: 'Meters', calculateButton: 'Calculate Drop', resultsTitle: 'Drop Analysis Results', voltageDropV: 'Voltage Drop', voltageDropPercent: 'Percentage Drop', voltageAtLoad: 'Voltage at Load', acceptable: '✅ Acceptable (<3%)', caution: '⚠️ Caution (3-5%)', unacceptable: '❌ Unacceptable (>5%)', suggestion: 'Suggested wire size for <3% drop: {gauge} AWG', formula: 'Formula Used' },
            dcPowerSupply: { tabTitle: '24VDC Sizing', title: 'DC Power Supply Sizing', description: 'Calculate the required 24VDC supply size for a control panel.', loadList: 'Panel Load Profile', addDevice: 'Add Custom Device', addFromTemplate: 'Add from Library', deviceDescription: 'Device Name', quantity: 'Qty', nominalConsumption: 'Nominal (mA)', inrushConsumption: 'Inrush (mA)', designParameters: 'Design Safety Factors', safetyFactor: 'Load Safety Factor', safetyFactorTooltip: 'Standard 25% buffer.', futureGrowth: 'Future Growth %', futureGrowthTooltip: 'Reserve capacity.', calculateButton: 'Analyze Power Requirements', resultsTitle: 'Sizing Analysis Results', consumptionSummary: 'Demand Summary', totalNominal: 'Total Steady State', peakInrush: 'Calculated Peak Start', requiredAmperage: 'Minimum Design Current', recommendationTitle: 'Recommended Hardware', recommendedSupply: '{amps}A Power Supply', expertNotesTitle: 'Technical Considerations', expertNote1: 'A {recAmps}A supply provides enough headroom.', expertNote2: 'The peak inrush is {peakAmps}A.', expertNote3: 'Consider splitting critical loads.' },
            encoderMotion: { tabTitle: 'Motion/Encoder', title: 'Motion & Encoder Scaling', description: 'Calculate scaling factors and frequency viability.', encoderParams: 'Encoder Specifications', ppr: 'PPR', pprTooltip: 'Pulses per revolution.', plcMode: 'PLC Input Mode', plcMode1x: 'X1 (Single)', plcMode4x: 'X4 (Quadrature)', plcMode1xTooltip: 'Counts rising edges.', plcMode4xTooltip: 'Counts all edges.', transmissionParams: 'Transmission Mechanics', mechanism: 'Mechanism Type', mechanismDirect: 'Direct Drive', mechanismGearbox: 'Gearbox', mechanismLeadscrew: 'Lead Screw', mechanismPulley: 'Pulley', mechanismRack: 'Rack & Pinion', gearboxIn: 'Input Revs', gearboxOut: 'Output Revs', leadscrewPitch: 'Screw Pitch', mm_rev: 'mm / rev', in_rev: 'in / rev', diameter: 'Diameter', mm: 'mm', in: 'in', viabilityAnalysis: 'Dynamic Viability', maxSpeed: 'Target Max Speed', mm_s: 'mm / s', m_s: 'm / s', rpm: 'RPM', resultsTitle: 'Motion Constants', systemResolution: 'System Resolution', resolutionUnit: 'mm / count', resolutionUnitAngle: 'deg / count', scaleFactor: 'PLC Scale Factor', scaleFactorUnit: 'counts / mm', scaleFactorUnitAngle: 'counts / deg', interactiveTester: 'Scale Tester', moveToTravel: 'Target Travel:', needsPulses: 'needs pulses', pulseCountIs: 'PLC Count:', travelledDist: 'travelled', pulses: 'pulses', hardwareDiagnosis: 'High-Speed IO Diagnosis', requiredFrequency: 'Input Frequency', hz: 'Hz', khz: 'kHz', mhz: 'MHz', analysisOk: '✅ Viable.', analysisCaution: '⚠️ High Frequency.', analysisCritical: '❌ Too high.' },
            sensorSelection: { tabTitle: 'Sensor Wizard', title: 'Sensor Recommendation', description: 'Use intelligent systems to select the perfect sensor technology.', wizardTitle: 'Sensor Selection Wizard', wizardDescription: 'Provide process parameters for a professional recommendation.', processVariable: 'Process Variable', vars: { level: 'Level', flow: 'Flow', pressure: 'Pressure', temperature: 'Temperature', analytical: 'Analytical' }, mediumType: 'Medium Type', types: { liquid: 'Líquido', solid: 'Sólido / Polvo' }, mediumCharacteristics: 'Características', liquidType: 'Descripción Líquido', liquidProperties: 'Propiedades', props: { corrosive: 'Corrosivo', abrasive: 'Abrasive', viscous: 'High Viscosity', foaming: 'Heavy Foaming', cip: 'CIP/Hygienic' }, solidType: 'Tipo Sólido', solidTypes: { powder: 'Polvo', granular: 'Granulado', rock: 'Large Rocks', sticky: 'Sticky/Paste' }, angleRepo: 'Angle of Repose', solidProps: { suspendedDust: 'Heavy Dust', abrasive: 'Abrasive' }, operatingConditions: 'Process Limits', tempRange: 'Temp Range (°C)', pressureRange: 'Pressure Range (bar)', from: 'Min', to: 'Max', environmentalConditions: 'Environmental', location: 'Installation Location', locs: { indoor: 'Indoor', outdoor: 'Outdoor', vibration: 'High Vibration', washdown: 'Frequent Washdown' }, installationRegion: 'Region', installationRegionTooltip: 'Helps suggest local brands.', thermocoupleStandard: 'Color Code', thermocoupleStandardTooltip: 'Defines wire colors.', thermocoupleStandards: { autodetect: 'Global (IEC/ANSI)', ansi: 'ANSI', iec: 'IEC', din: 'DIN', jis: 'JIS' }, areaClassification: 'Area Classification', areas: { general_safe: 'General Purpose', class1div1: 'Hazardous (Div 1)', class1div2: 'Hazardous (Div 2)' }, outputRequirements: 'Integration', signals: { '4-20mA': '4-20mA Analog', '4-20mA_HART': 'HART Protocol', '0-10V': '0-10V Analog', PNP_NPN: 'Digital (PNP/NPN)', Relay: 'Relay Output', 'IO-Link': 'IO-Link', Profinet_EtherNetIP: 'Fieldbus' }, projectPriorities: 'Project Priorities', priorities: { lowCost: 'Low Cost', highPrecision: 'High Precision', maxRobustness: 'Robustness' }, generating: 'Selecting technologies...', generateButton: 'Generate Recommendation Report' }
        },
        reference: {
            title: 'Engineering Reference',
            description: 'Quick lookup for industrial standards, fault codes, and data types.',
            thermocoupleTitle: 'Thermocouple Colors',
            thermocoupleDesc: 'Universal color standards for identification.',
            vfdTitle: 'VFD Fault Codes',
            vfdDesc: 'Common fault libraries for major drives.',
            plcTitle: 'PLC Data Types',
            plcDesc: 'Standard data architectures.',
            brands: { siemens: 'Siemens', allenBradley: 'Rockwell / AB', abb: 'ABB', schneider: 'Schneider', danfoss: 'Danfoss', yaskawa: 'Yaskawa', mitsubishi: 'Mitsubishi', eaton: 'Eaton' },
            faults: {
                code: 'Code', name: 'Fault Name', description: 'Meaning/Action',
                siemens: [
                    { code: 'F0001', name: 'Overcurrent', description: 'Motor current exceeds limit. Check motor/cable short circuit or load.' },
                    { code: 'F0002', name: 'Overvoltage', description: 'DC link voltage too high. Check supply voltage or braking.' },
                    { code: 'F0003', name: 'Undervoltage', description: 'Power supply failed or dropped below limit.' },
                    { code: 'F0700', name: 'CB Parameter Error', description: 'Parameter setting error during startup.' }
                ],
                allenBradley: [
                    { code: 'F004', name: 'UnderVoltage', description: 'DC bus voltage fell below minimum value.' },
                    { code: 'F005', name: 'OverVoltage', description: 'DC bus voltage exceeded maximum value.' },
                    { code: 'F012', name: 'HW OverCurrent', description: 'Instantaneous overcurrent detected.' },
                    { code: 'F013', name: 'Ground Fault', description: 'Current path to earth ground greater than 25% of drive rating.' }
                ],
                abb: [
                    { code: '0001', name: 'Overcurrent', description: 'Output current has exceeded trip level.' },
                    { code: '0002', name: 'DC Overvolt', description: 'Excessive DC link voltage. Check deceleration time.' },
                    { code: '0016', name: 'Earth Fault', description: 'Earth fault detected in motor or motor cable.' },
                    { code: '7121', name: 'Motor Stall', description: 'Motor is operating in the stall region.' }
                ],
                schneider: [
                    { code: 'InF1', name: 'Internal Fault', description: 'Power stage fault. Check drive health.' },
                    { code: 'OCF', name: 'Overcurrent', description: 'Overcurrent. Check inertia, load, or mechanical lock.' },
                    { code: 'SCF', name: 'Short Circuit', description: 'Short circuit or grounding at drive output.' },
                    { code: 'OHF', name: 'Drive Overheat', description: 'Drive temperature too high. Check ventilation.' }
                ],
                danfoss: [
                    { code: 'W8', name: 'DC Under Volt', description: 'DC link voltage is low.' },
                    { code: 'A13', name: 'Over Current', description: 'Inverter peak current limit exceeded.' },
                    { code: 'A14', name: 'Earth Fault', description: 'Discharge from output phases to ground.' },
                    { code: 'A16', name: 'Short Circuit', description: 'Short-circuit in motor or motor cable.' }
                ],
                yaskawa: [
                    { code: 'oC', name: 'Overcurrent', description: 'Drive output current exceeded instantaneous level.' },
                    { code: 'oV', name: 'Overvoltage', description: 'DC bus voltage exceeded trip level.' },
                    { code: 'Uv1', name: 'DC Bus Undervolt', description: 'DC bus voltage below level. Check fuses/power.' },
                    { code: 'oL1', name: 'Motor Overload', description: 'Motor overload protection tripped (electronic thermal).' }
                ],
                mitsubishi: [
                    { code: 'E.OC1', name: 'Overcurrent Accel', description: 'Overcurrent during acceleration.' },
                    { code: 'E.OC2', name: 'Overcurrent Const', description: 'Overcurrent during constant speed.' },
                    { code: 'E.OC3', name: 'Overcurrent Decel', description: 'Overcurrent during deceleration.' },
                    { code: 'E.UVT', name: 'Undervoltage', description: 'Inverter supply voltage dropped.' }
                ],
                eaton: [
                    { code: 'F1', name: 'Overcurrent', description: 'Hardware detected excessive current.' },
                    { code: 'F2', name: 'Overvoltage', description: 'DC link overvoltage.' },
                    { code: 'F3', name: 'Undervoltage', description: 'DC link undervoltage.' },
                    { code: 'F5', name: 'Overtemp', description: 'Heatsink temperature too high.' }
                ]
            },
            thermocoupleTable: { type: 'Type', positive: 'Positive (+)', negative: 'Negative (-)', jacket: 'Jacket' },
            colorCodes: {
                ansi: {
                    name: 'ANSI (United States)',
                    note: 'Red is ALWAYS negative in ANSI.',
                    codes: [
                        { type: 'J', positive: 'White', negative: 'Red', jacket: 'Black' },
                        { type: 'K', positive: 'Yellow', negative: 'Red', jacket: 'Yellow' },
                        { type: 'T', positive: 'Blue', negative: 'Red', jacket: 'Blue' },
                        { type: 'E', positive: 'Purple', negative: 'Red', jacket: 'Purple' },
                        { type: 'N', positive: 'Orange', negative: 'Red', jacket: 'Orange' },
                        { type: 'R/S', positive: 'Black', negative: 'Red', jacket: 'Green' },
                        { type: 'B', positive: 'Gray', negative: 'Red', jacket: 'Gray' }
                    ]
                },
                iec: {
                    name: 'IEC 60584-3 (Europe/Global)',
                    note: 'Common standard for new installations.',
                    codes: [
                        { type: 'J', positive: 'Black', negative: 'White', jacket: 'Black' },
                        { type: 'K', positive: 'Green', negative: 'White', jacket: 'Green' },
                        { type: 'T', positive: 'Brown', negative: 'White', jacket: 'Brown' },
                        { type: 'E', positive: 'Violet', negative: 'White', jacket: 'Violet' },
                        { type: 'N', positive: 'Pink', negative: 'White', jacket: 'Pink' },
                        { type: 'R/S', positive: 'Orange', negative: 'White', jacket: 'Orange' },
                        { type: 'B', positive: 'Gray', negative: 'White', jacket: 'Gray' }
                    ]
                },
                din: {
                    name: 'DIN 43710 (German - Obsolete)',
                    note: 'Legacy systems only.',
                    codes: [
                        { type: 'J', positive: 'Red', negative: 'Blue', jacket: 'Blue' },
                        { type: 'K', positive: 'Red', negative: 'Green', jacket: 'Green' },
                        { type: 'T', positive: 'Red', negative: 'Brown', jacket: 'Brown' },
                        { type: 'E', positive: 'Red', negative: 'Black', jacket: 'Black' }
                    ]
                },
                jis: {
                    name: 'JIS C 1610 (Japan - Pre-1995)',
                    note: 'Replaced by IEC colors in 1995, but common in older machines.',
                    codes: [
                        { type: 'J', positive: 'Red', negative: 'White', jacket: 'Yellow' },
                        { type: 'K', positive: 'Red', negative: 'White', jacket: 'Blue' },
                        { type: 'T', positive: 'Red', negative: 'White', jacket: 'Brown' },
                        { type: 'E', positive: 'Red', negative: 'White', jacket: 'Violet' }
                    ]
                }
            },
            plcDataTypes: {
                allenBradley: {
                    name: 'Rockwell / Allen-Bradley (Logix)',
                    types: [
                        { type: 'BOOL', desc: '1-bit boolean (0 or 1)' },
                        { type: 'SINT', desc: '8-bit signed integer (-128 to 127)' },
                        { type: 'INT', desc: '16-bit signed integer (-32,768 to 32,767)' },
                        { type: 'DINT', desc: '32-bit signed integer (-2.14B to 2.14B)' },
                        { type: 'LINT', desc: '64-bit signed integer (huge range)' },
                        { type: 'REAL', desc: '32-bit floating point (IEEE 754)' },
                        { type: 'LREAL', desc: '64-bit floating point (Double Precision)' },
                        { type: 'TIMER', desc: 'Structure (PRE, ACC, EN, TT, DN)' },
                        { type: 'COUNTER', desc: 'Structure (PRE, ACC, CU, CD, DN, OV, UN)' },
                        { type: 'STRING', desc: 'ASCII String structure (LEN, DATA[])' }
                    ]
                },
                siemens: {
                    name: 'Siemens (TIA Portal / S7)',
                    types: [
                        { type: 'Bool', desc: '1-bit binary value' },
                        { type: 'Byte', desc: '8-bit unsigned (0 to 255) or hex' },
                        { type: 'Int', desc: '16-bit signed integer' },
                        { type: 'DInt', desc: '32-bit signed integer' },
                        { type: 'Word', desc: '16-bit unsigned / bitmask' },
                        { type: 'DWord', desc: '32-bit unsigned / bitmask' },
                        { type: 'Real', desc: '32-bit floating point' },
                        { type: 'LReal', desc: '64-bit floating point' },
                        { type: 'Time', desc: '32-bit time value (ms resolution)' },
                        { type: 'S5Time', desc: '16-bit legacy BCD time' },
                        { type: 'Char', desc: '8-bit ASCII character' }
                    ]
                }
            }
        },
        shiftLog: {
            title: 'Bitácora Inteligente',
            description: 'Registra eventos informalmente. El sistema estructura datos y genera reportes.',
            inputPlaceholder: 'Ejemplo: "La bomba 2 vibraba. Apreté los pernos."',
            submitButton: 'Registrar Evento',
            processing: 'Estructurando...',
            recentLogs: 'Eventos del Turno (Grupo Actual)',
            generateReport: 'Generar Reporte',
            generatingReport: 'Redactando...',
            reportTitle: 'Reporte de Entrega',
            noLogs: 'Sin eventos en las últimas 12 horas.',
            fields: { equipment: 'Equipo', failure: 'Falla', action: 'Acción', criticality: 'Criticidad', status: 'Estado' }
        },
        formTopic: 'Tema',
        formDifficulty: 'Dificultad',
        formDifficultyBeginner: 'Principiante',
        formDifficultyIntermediate: 'Intermedio',
        formDifficultyAdvanced: 'Avanzado',
        formVfdBrand: 'Marca del VFD',
        formVfdModel: 'Modelo del VFD',
        formPlcBrand: 'Marca del PLC',
        formPlcSoftware: 'Software de Configuración',
        formPlcLanguage: 'Lenguaje de Programación',
        formGeneralOption: 'General',
        formGeneratingButton: 'Generando...',
        formGenerateButton: 'Generar',
        errorAlertTitle: 'Ocurrió un Error',
        spinnerLoading: 'Cargando...',
        spinnerWait: 'Por favor espera.',
        result: { title: 'Resultado del Análisis' },
        export: { pdf: 'Exportar PDF' },
        pdf: {
            sensorReport: {
                title: 'Reporte de Recomendación de Sensor',
                justification: 'Justificación',
                recommendedTechnologies: 'Tecnologías Recomendadas',
                topChoice: 'Opción Principal',
                easeOfInstallation: 'Facilidad de Instalación',
                suggestedModels: 'Modelos Sugeridos',
                installationConsiderations: 'Consideraciones de Instalación',
                implementationGuide: 'Guía de Implementación',
            }
        }
    },
    es: {
        header: {
            solutions: 'Soluciones',
            practices: 'Prácticas',
            tools: 'Herramientas',
            commissioning: 'Puesta en Marcha',
            reference: 'Referencia',
            calculator: 'Calculadoras',
            shiftLog: 'Bitácora',
            signedInAs: 'Sesión de',
            logout: 'Cerrar Sesión',
        },
        header_descriptions: {
            solutions: 'Obtén respuestas instantáneas y ayuda para solución de problemas.',
            practices: 'Genera problemas de práctica para mejorar tus habilidades.',
            tools: 'Herramientas especializadas para análisis y validación.',
            commissioning: 'Guías interactivas paso a paso para VFDs.',
            reference: 'Consulta rápida de códigos de falla y tipos de datos.',
            calculator: 'Realiza cálculos industriales comunes.',
            shiftLog: 'Registra eventos de turno y genera reportes profesionales.',
        },
        dashboard: {
            title: 'Bienvenido a PLCortex',
            subtitle: 'Tu copiloto experto en automatización industrial. Selecciona una herramienta.',
            recentActivity: 'Actividad Reciente',
            toolsSection: 'Suite de Ingeniería'
        },
        login: {
            title: 'Control de Acceso',
            subtitle: 'Ingresa tu código de acceso para continuar',
            placeholder: 'Ingresar Código (XXXX-XXXX)',
            button: 'Verificar Acceso',
            loading: 'Verificando...',
            error: 'Código inválido o expirado.',
            masterUser: 'Usuario Maestro de Ingeniería'
        },
        landing: {
            heroTitle: 'Automatización Industrial Inteligente',
            heroDescription: 'El kit de herramientas definitivo para programación de PLC, puesta en marcha de VFD e ingeniería eléctrica.',
            heroCta: 'Acceder a la Plataforma',
            plcTitle: 'Ingeniería de PLC',
            plcDescription: 'Texto estructurado, optimización de escalera y migración de protocolos.',
            plcTags: 'Siemens, Rockwell, Schneider, Migración de Código',
            vfdTitle: 'Control de Movimiento',
            vfdDescription: 'Guías de puesta en marcha paso a paso y diagnóstico visual de terminales.',
            vfdTags: 'PowerFlex, Sinamics, Altivar, ACS880',
            creator: 'Desarrollado por ingenieros de automatización especializados.'
        },
        chat: {
            newChat: 'Nueva Sesión',
            historyTitle: 'Sesiones Recientes',
            welcomeTitle: 'Asistente de Ingeniería',
            welcomeMessage: 'Estoy listo para ayudar con tus tareas de {brand} {topic}. Selecciona una acción rápida o escribe tu consulta.',
            placeholder: 'Escribe tu pregunta técnica aquí...',
            thinking: 'Analizando contexto del sistema...',
            finishConversation: 'Finalizar Sesión',
            contextTitle: 'Contexto del Sistema',
            contextLocked: 'Bloqueado',
            contextEditable: 'Editable',
            newChatTitle: 'Nueva Consulta Técnica',
            startNewChat: 'Iniciar Nueva Consulta',
            copyText: 'Copiar Texto',
            copied: '¡Copiado!',
            suggestions: {
                plc_st: 'Generar Texto Estructurado para un PID',
                plc_ladder: 'Crear Lógica de Escalera para un Arrancador',
                plc_comms: '¿Cómo configurar comunicación Modbus TCP?',
                vfd_param: 'Listar parámetros para Control a 2 Hilos',
                vfd_fault: 'Diagnosticar Falla de Sobrecorriente',
                vfd_wiring: 'Mostrar cableado de terminales de control'
            }
        },
        practices: {
            title: 'Desarrollo de Habilidades',
            description: 'Selecciona tu área de enfoque para generar un escenario industrial realista.',
            selectTopic: 'Seleccionar Tema',
            selectDifficulty: 'Nivel de Dificultad',
            generateBtn: 'Generar Escenario',
            randomChallenge: 'Desafío Aleatorio',
            generating: 'Diseñando Escenario...',
            plcLabel: 'Lógica y Programación',
            vfdLabel: 'Variadores y Movimiento',
            hintButton: '¿Necesitas una Pista?',
            hideHint: 'Ocultar Pista',
            revealSolution: 'Ver Solución Experta',
            hideSolution: 'Ocultar Solución'
        },
        practice: {
            title: 'Caso Práctico',
            showSolution: 'Ver Solución Recomendada',
            hideSolution: 'Ocultar Solución',
            solutionTitle: 'Resolución Experta'
        },
        wiring: {
            title: 'Asistente de Cableado',
            description: 'Genera diagramas de conexión y guías de cableado para motores y sistemas de control.',
            vfdDetails: 'Especificaciones del VFD',
            controlDetails: 'Lógica de Control',
            controlMethod: 'Método de Control',
            controlMethod2Wire: 'Control a 2 Hilos',
            controlMethod3Wire: 'Control a 3 Hilos',
            configSoftware: 'Software de Configuración',
            motorDetails: 'Especificaciones del Motor',
            motorHP: 'Caballos de Fuerza (HP)',
            motorVoltage: 'Voltaje (V)',
            motorFLA: 'FLA (Amperios)',
            application: 'Contexto de Aplicación',
            applicationPlaceholder: 'ej. Una banda transportadora que necesita arranque suave...',
            generateButton: 'Generar Guía de Cableado',
            generatingButton: 'Generando Guía...'
        },
        commissioning: {
            title: 'Puesta en Marcha Interactiva',
            historyTitle: 'Historial de Sesiones',
            newChat: 'Nueva Guía',
            selectTitle: 'Guía de Comisionamiento VFD',
            selectDescription: 'Elige un dispositivo para iniciar una sesión interactiva con soporte visual de terminales.',
            brandLabel: 'Marca del VFD',
            modelLabel: 'Modelo del VFD',
            applicationLabel: 'Tipo de Aplicación',
            startButton: 'Iniciar Puesta en Marcha',
            placeholder: 'Pregunta sobre parámetros, cableado o ajuste...',
            initialPrompt: 'Necesito poner en marcha este VFD para una {application}. Por favor, dame una guía paso a paso enfocada en este hardware.',
            terminalQuery: 'Explica la función y el cableado típico para la terminal {label} ({func}).',
            diagramNotAvailable: 'Diagrama No Disponible',
            diagramNotAvailableDesc: 'Estamos agregando el mapa visual para este modelo específico.',
            appConveyor: 'Banda Transportadora',
            appFan: 'Ventilador / Centrífugo',
            appPumpPID: 'Bomba (Control PID)',
            appGeneral: 'Propósito General',
        },
        tools: {
            title: 'Herramientas de Análisis',
            description: 'Módulos avanzados de diagnóstico y validación para sistemas industriales.',
            backToTools: 'Volver a Herramientas',
            generateButton: 'Ejecutar Análisis',
            faultDiagnosis: {
                title: 'Diagnóstico de Fallas VFD',
                description: 'Análisis experto de códigos de falla con contexto visual.',
                vfdBrand: 'Marca del VFD',
                vfdModel: 'Modelo del VFD',
                faultCode: 'Código de Falla',
                faultCodePlaceholder: 'ej. F0001 o 0x01',
                context: 'Contexto Ambiental',
                contextPlaceholder: 'Describe qué pasó (ej. la máquina aceleraba...)'
            },
            logicValidator: {
                title: 'Validador de Lógica',
                description: 'Analiza código PLC en busca de conflictos, problemas de rendimiento o riesgos de seguridad.',
                codeLabel: 'Código PLC',
                codePlaceholder: 'Pega tu código aquí...',
                analyzeButton: 'Validar Lógica',
                analyzing: 'Escaneando Lógica...',
                analysisResults: 'Problemas Detectados',
                suggestButton: 'Proponer Corrección',
                suggesting: 'Generando código optimizado...',
                noIssues: '✅ No se detectaron problemas lógicos significativos.'
            },
            migration: {
                title: 'Migración de Código',
                description: 'Traduce lógica entre diferentes plataformas industriales.',
                sourceGroup: 'Plataforma Origen',
                targetGroup: 'Plataforma Destino',
                convertButton: 'Migrar Código',
                converting: 'Traduciendo Lógica...',
                codePlaceholder: 'Pega el código a migrar...'
            },
            scanTime: {
                title: 'Análisis de Rendimiento',
                description: 'Estima el impacto en la ejecución y el tiempo de ciclo (Scan Time).',
                codeLabel: 'Segmento de Lógica',
                codePlaceholder: 'Pega el código a analizar...'
            },
            energy: {
                title: 'Eficiencia Energética',
                description: 'Genera planes de optimización para VFDs para reducir consumo.',
                appType: 'Tipo de Aplicación',
                appTypes: { pump: 'Bomba', fan: 'Ventilador', conveyor: 'Transportador', compressor: 'Compresor' },
                loadProfile: 'Perfil de Carga',
                loadProfilePlaceholder: 'Describe horarios de operación y velocidades...'
            },
            codeProver: {
                title: 'Verificador de Seguridad',
                description: 'Verifica si la lógica cumple estrictamente con reglas de seguridad e interlocks.',
                rulesLabel: 'Reglas de Seguridad',
                rulesPlaceholder: 'ej. La Válvula A y la Bomba B nunca deben operar juntas.'
            },
            network: {
                title: 'Redes y Comunicaciones',
                description: 'Herramientas de protocolo, análisis de tramas y planeación de hardware.',
                calculateButton: 'Calcular Checksum',
                protocolsLabel: 'Protocolos de Interconexión',
                checksum: {
                    title: 'Checksum/CRC',
                    description: 'Verifica la integridad de tramas Modbus o Seriales.',
                    frameLabel: 'Trama Hexadecimal',
                    framePlaceholder: 'ej. 01 03 00 0A',
                    resultsTitle: 'Resultados de Integridad',
                    crc16: 'CRC-16 (Modbus)',
                    lrc: 'LRC (ASCII)',
                    checksum: 'Checksum Simple',
                    order_lf: 'Byte Bajo Primero',
                    order_hf: 'Byte Alto Primero'
                },
                ascii: {
                    title: 'Decodificador Serial',
                    description: 'Decodifica tramas ASCII complejas de dispositivos de campo.',
                    frameLabel: 'Flujo ASCII',
                    framePlaceholder: 'ej. <STX>+0015.50g<CR><LF>'
                },
                hardware: {
                    title: 'Planeador de Red',
                    description: 'Determina el hardware necesario para puentear diferentes protocolos.'
                }
            }
        },
        calculator: {
            title: 'Calculadoras de Ingeniería',
            description: 'Herramientas matemáticas precisas para diseño y puesta en marcha.',
            ohmsLaw: { tabTitle: 'Ley de Ohm', title: 'Ley de Ohm y Potencia', description: 'Ingresa dos valores para calcular los demás.', voltage: 'Voltaje (V)', current: 'Corriente (A)', resistance: 'Resistencia (Ω)', power: 'Potencia (W)', reset: 'Reiniciar' },
            thermal: { tabTitle: 'Carga Térmica', title: 'Análisis Térmico de Tablero', description: 'Calcula el enfriamiento requerido basado en la disipación interna.', components: 'Componentes Internos', addComponent: 'Agregar al Tablero', addedComponents: 'Contenido del Tablero', panelDimensions: 'Dimensiones del Gabinete (pulg)', height: 'Alto', width: 'Ancho', depth: 'Profundidad', temperatures: 'Temperaturas Objetivo (°F)', internal: 'Máx Interna', external: 'Máx Ambiente', calculateButton: 'Calcular BTU/hr', resultsTitle: 'Resultados Térmicos', totalHeat: 'Carga Térmica Total', watts: 'Watts', panelArea: 'Área Superficial', sqft: 'Pies Cuadrados', tempDifference: 'Delta Temp.', coolingCapacity: 'Disipación del Gabinete', btu: 'BTU/hr', coolingRequired: 'Capacidad de Enfriamiento Requerida', noCooling: 'No se requiere enfriamiento activo.' },
            motorControl: { tabTitle: 'Dimensionamiento Motor', title: 'Dimensionamiento NEC Motores', description: 'Dimensiona interruptores, contactores y cables según estándares NEC.', motorDetails: 'Búsqueda de Motor Estándar', horsepower: 'HP', voltage: 'Voltaje', phase: 'Fase', phaseThree: 'Trifásico', phaseSingle: 'Monofásico', nameplateData: 'Datos Reales de Placa', nominalCurrent: 'Corriente Nominal (In)', serviceFactor: 'Factor de Servicio (FS)', serviceFactorCurrent: 'Corriente Máx Operación', analyzeNameplate: 'Escanear Placa', analyzing: 'Analizando...', resultsTitle: 'Resultados Dimensionamiento NEC', fla: 'FLA Estándar', overload: 'Ajuste de Sobrecarga', overloadRange: 'Máx Recomendado', contactor: 'Contactor', breaker: 'Interruptor', wire: 'Calibre Cable', disclaimer: 'Cálculos basados en tablas NEC.', removeImage: 'Quitar', calculateButton: 'Calcular Dimensionamiento' },
            plcScaling: { tabTitle: 'Escalamiento PLC', title: 'Escalamiento de Señal Analógica', description: 'Calcula la ecuación lineal para entradas/salidas analógicas de PLC.', inputRange: 'Señal Cruda (PLC)', outputRange: 'Unidades de Ingeniería', min: 'Mín', max: 'Máx', options: 'Opciones', clamping: 'Habilitar Limite (Clamping)', resultsTitle: 'Resultados de Escalamiento', formula: 'Ecuación Lineal', codeSample: 'Código de Implementación PLC', codeLang: { st: 'Texto Estructurado', ld: 'Escalera (Math)', fbd: 'Bloques de Función' }, rawSignal: 'Valor de Prueba Crudo', engUnits: 'Valor Resultante', interactiveTester: 'Simulador Interactivo', alarmCalculator: 'Umbrales de Alarma', alarmHH: 'Alarma HH', alarmH: 'Alarma H', alarmL: 'Alarma L', alarmLL: 'Alarma LL', alarmDesc: 'Define alarmas en Unidades de Ingeniería para obtener valores CRUDOS.', units: { custom: 'Rango Personalizado', raw_4_20ma: 'Estándar 4-20mA', raw_0_10v: 'Estándar 0-10V', raw_rockwell_4_20ma: 'Rockwell 4-20mA', raw_siemens_4_20ma: 'Siemens 4-20mA', raw_unsigned_12: 'Unsigned 12-bit', raw_unsigned_14: 'Unsigned 14-bit', raw_unsigned_16: 'Unsigned 16-bit', raw_signed_15: 'Signed 15-bit', raw_rockwell_10v: 'Rockwell +/- 10V', raw_siemens_10v: 'Siemens +/- 10V', eng_percent: 'Porcentaje (%)', eng_freq_60hz: 'Frecuencia (60Hz)', eng_speed_1800rpm: 'Velocidad (1800 RPM)', eng_torque_300: 'Torque (300%)', eng_psi_150: 'Presión (150 PSI)', eng_celsius_100: 'Temp (100°C)', eng_fahrenheit_212: 'Temp (212°F)', eng_gpm_500: 'Flujo (500 GPM)', eng_liters_1000: 'Flujo (1000 L/m)' }, codeComments: { declarations: 'Declaraciones', rawValue: 'Valor crudo del módulo AI', scaledValue: 'Valor de ingeniería calculado', scalingConstants: 'Constantes de Escalamiento', tempVar: 'Variable temporal de conversión', logic: 'Lógica de Escalamiento', convertToReal: '1. Convertir INT crudo a REAL', applyFormula: '2. Aplicar Fórmula Lineal', clamp: '3. Clamping (Opcional)' } },
            voltageDrop: { tabTitle: 'Caída de Voltaje', title: 'Análisis de Caída de Voltaje', description: 'Calcula la caída para tendidos de energía a motores o tableros remotos.', electricalSystem: 'Especificaciones del Sistema', voltage: 'Voltaje Nominal', phase: 'Fase', phaseThree: 'Trifásico', phaseSingle: 'Monofásico', load: 'Carga', current: 'Amperaje (A)', conductor: 'Conductor', material: 'Material', copper: 'Cobre', aluminum: 'Aluminio', wireGauge: 'Calibre', distance: 'Distancia (Un sentido)', feet: 'Pies', meters: 'Metros', calculateButton: 'Calcular Caída', resultsTitle: 'Resultados de Análisis', voltageDropV: 'Caída de Voltaje', voltageDropPercent: 'Porcentaje de Caída', voltageAtLoad: 'Voltaje en la Carga', acceptable: '✅ Aceptable (<3%)', caution: '⚠️ Precaución (3-5%)', unacceptable: '❌ Inaceptable (>5%)', suggestion: 'Calibre sugerido para caída <3%: {gauge} AWG', formula: 'Fórmula Usada' },
            dcPowerSupply: { tabTitle: 'Dimensionamiento 24VDC', title: 'Fuente de Poder DC', description: 'Calcula el tamaño requerido de la fuente de 24VDC para un tablero de control.', loadList: 'Perfil de Carga del Tablero', addDevice: 'Agregar Dispositivo', addFromTemplate: 'Agregar de Librería', deviceDescription: 'Nombre Dispositivo', quantity: 'Cant.', nominalConsumption: 'Nominal (mA)', inrushConsumption: 'Pico Arranque (mA)', designParameters: 'Factores de Seguridad', safetyFactor: 'Factor de Seguridad', safetyFactorTooltip: 'Colchón estándar del 25%.', futureGrowth: '% Crecimiento Futuro', futureGrowthTooltip: 'Capacidad de reserva.', calculateButton: 'Analizar Requerimientos', resultsTitle: 'Resultados de Dimensionamiento', consumptionSummary: 'Resumen de Demanda', totalNominal: 'Total Estado Estable', peakInrush: 'Pico de Arranque Calculado', requiredAmperage: 'Corriente Mínima de Diseño', recommendationTitle: 'Hardware Recomendado', recommendedSupply: 'Fuente de Poder de {amps}A', expertNotesTitle: 'Consideraciones Técnicas', expertNote1: 'Una fuente de {recAmps}A provee suficiente holgura.', expertNote2: 'El pico de arranque es {peakAmps}A.', expertNote3: 'Considera dividir cargas críticas.' },
            encoderMotion: { tabTitle: 'Movimiento/Encoder', title: 'Escalamiento de Movimiento y Encoder', description: 'Calcula factores de escala y viabilidad de frecuencia.', encoderParams: 'Especificaciones del Encoder', ppr: 'PPR', pprTooltip: 'Pulsos por revolución.', plcMode: 'Modo de Entrada PLC', plcMode1x: 'X1 (Simple)', plcMode4x: 'X4 (Cuadratura)', plcMode1xTooltip: 'Cuenta flancos de subida.', plcMode4xTooltip: 'Cuenta todos los flancos.', transmissionParams: 'Mecánica de Transmisión', mechanism: 'Tipo de Mecanismo', mechanismDirect: 'Acople Directo', mechanismGearbox: 'Caja de Engranajes', mechanismLeadscrew: 'Tornillo Sin Fin', mechanismPulley: 'Polea', mechanismRack: 'Piñón y Cremallera', gearboxIn: 'Revoluciones Entrada', gearboxOut: 'Revoluciones Salida', leadscrewPitch: 'Paso del Tornillo', mm_rev: 'mm / rev', in_rev: 'in / rev', diameter: 'Diámetro', mm: 'mm', in: 'in', viabilityAnalysis: 'Viabilidad Dinámica', maxSpeed: 'Velocidad Máx Objetivo', mm_s: 'mm / s', m_s: 'm / s', rpm: 'RPM', resultsTitle: 'Constantes de Movimiento', systemResolution: 'Resolución del Sistema', resolutionUnit: 'mm / cuenta', resolutionUnitAngle: 'grad / cuenta', scaleFactor: 'Factor de Escala PLC', scaleFactorUnit: 'cuentas / mm', scaleFactorUnitAngle: 'cuentas / grad', interactiveTester: 'Probador de Escala', moveToTravel: 'Mover a:', needsPulses: 'necesita pulsos', pulseCountIs: 'Cuenta PLC:', travelledDist: 'viajado', pulses: 'pulsos', hardwareDiagnosis: 'Diagnóstico IO Alta Velocidad', requiredFrequency: 'Frecuencia de Entrada', hz: 'Hz', khz: 'kHz', mhz: 'MHz', analysisOk: '✅ Viable.', analysisCaution: '⚠️ Frecuencia Alta.', analysisCritical: '❌ Demasiado alta.' },
            sensorSelection: { tabTitle: 'Asistente Sensores', title: 'Recomendación de Sensores', description: 'Usa sistemas inteligentes para seleccionar la tecnología de sensor perfecta.', wizardTitle: 'Asistente de Selección', wizardDescription: 'Provee parámetros de proceso para una recomendación profesional.', processVariable: 'Variable de Proceso', vars: { level: 'Nivel', flow: 'Flujo', pressure: 'Presión', temperature: 'Temperatura', analytical: 'Analítica' }, mediumType: 'Tipo de Medio', types: { liquid: 'Líquido', solid: 'Sólido / Polvo' }, mediumCharacteristics: 'Características', liquidType: 'Descripción Líquido', liquidProperties: 'Propiedades', props: { corrosive: 'Corrosivo', abrasive: 'Abrasivo', viscous: 'Alta Viscosidad', foaming: 'Mucha Espuma', cip: 'CIP/Higiénico' }, solidType: 'Tipo Sólido', solidTypes: { powder: 'Polvo', granular: 'Granulado', rock: 'Rocas Grandes', sticky: 'Pegajoso/Pasta' }, angleRepo: 'Ángulo de Reposo', solidProps: { suspendedDust: 'Mucho Polvo', abrasive: 'Abrasivo' }, operatingConditions: 'Límites de Proceso', tempRange: 'Rango Temp (°C)', pressureRange: 'Rango Presión (bar)', from: 'Mín', to: 'Máx', environmentalConditions: 'Ambientales', location: 'Ubicación Instalación', locs: { indoor: 'Interior', outdoor: 'Exterior', vibration: 'Alta Vibración', washdown: 'Lavado Frecuente' }, installationRegion: 'Región', installationRegionTooltip: 'Ayuda a sugerir marcas locales.', thermocoupleStandard: 'Código de Color', thermocoupleStandardTooltip: 'Define colores de cables.', thermocoupleStandards: { autodetect: 'Global (IEC/ANSI)', ansi: 'ANSI', iec: 'IEC', din: 'DIN', jis: 'JIS' }, areaClassification: 'Clasificación de Área', areas: { general_safe: 'Propósito General', class1div1: 'Peligrosa (Div 1)', class1div2: 'Peligrosa (Div 2)' }, outputRequirements: 'Integración', signals: { '4-20mA': 'Analógica 4-20mA', '4-20mA_HART': 'Protocolo HART', '0-10V': 'Analógica 0-10V', PNP_NPN: 'Digital (PNP/NPN)', Relay: 'Salida Relevador', 'IO-Link': 'IO-Link', Profinet_EtherNetIP: 'Bus de Campo' }, projectPriorities: 'Prioridades del Proyecto', priorities: { lowCost: 'Bajo Costo', highPrecision: 'Alta Precisión', maxRobustness: 'Robustez' }, generating: 'Seleccionando tecnologías...', generateButton: 'Generar Reporte de Recomendación' }
        },
        reference: {
            title: 'Referencia de Ingeniería',
            description: 'Consulta rápida de estándares industriales, códigos de falla y tipos de datos.',
            thermocoupleTitle: 'Colores de Termopares',
            thermocoupleDesc: 'Estándares universales de color para identificación.',
            vfdTitle: 'Códigos de Falla VFD',
            vfdDesc: 'Librerías comunes de fallas para variadores principales.',
            plcTitle: 'Tipos de Datos PLC',
            plcDesc: 'Arquitecturas de datos estándar.',
            brands: { siemens: 'Siemens', allenBradley: 'Rockwell / AB', abb: 'ABB', schneider: 'Schneider', danfoss: 'Danfoss', yaskawa: 'Yaskawa', mitsubishi: 'Mitsubishi', eaton: 'Eaton' },
            faults: {
                code: 'Código', name: 'Nombre Falla', description: 'Significado/Acción',
                siemens: [
                    { code: 'F0001', name: 'Sobrecorriente', description: 'Corriente motor excede límite. Revisar corto en motor/cable o carga.' },
                    { code: 'F0002', name: 'Sobrevoltaje', description: 'Voltaje enlace DC muy alto. Revisar voltaje suministro o frenado.' },
                    { code: 'F0003', name: 'Subvoltaje', description: 'Falla de alimentación o caída por debajo del límite.' },
                    { code: 'F0700', name: 'Error Parámetro CB', description: 'Error de ajuste de parámetro durante arranque.' }
                ],
                allenBradley: [
                    { code: 'F004', name: 'SubVoltaje', description: 'Voltaje bus DC cayó bajo el mínimo.' },
                    { code: 'F005', name: 'SobreVoltaje', description: 'Voltaje bus DC excedió el máximo.' },
                    { code: 'F012', name: 'HW SobreCorriente', description: 'Sobrecorriente instantánea detectada.' },
                    { code: 'F013', name: 'Falla a Tierra', description: 'Corriente a tierra mayor al 25% del rango del drive.' }
                ],
                abb: [
                    { code: '0001', name: 'Sobrecorriente', description: 'Corriente de salida ha excedido nivel de disparo.' },
                    { code: '0002', name: 'Sobrevoltaje DC', description: 'Voltaje enlace DC excesivo. Revisar tiempo desaceleración.' },
                    { code: '0016', name: 'Falla Tierra', description: 'Falla a tierra detectada en motor o cable.' },
                    { code: '7121', name: 'Motor Estancado', description: 'El motor está operando en región de estancamiento.' }
                ],
                schneider: [
                    { code: 'InF1', name: 'Falla Interna', description: 'Falla etapa de potencia. Revisar salud del drive.' },
                    { code: 'OCF', name: 'Sobrecorriente', description: 'Sobrecorriente. Revisar inercia, carga o bloqueo mecánico.' },
                    { code: 'SCF', name: 'Corto Circuito', description: 'Corto circuito o tierra en salida del drive.' },
                    { code: 'OHF', name: 'Sobrecalentamiento', description: 'Temperatura del drive muy alta. Revisar ventilación.' }
                ],
                danfoss: [
                    { code: 'W8', name: 'DC Sub Volt', description: 'Voltaje enlace DC es bajo.' },
                    { code: 'A13', name: 'Sobre Corriente', description: 'Límite pico de corriente del inversor excedido.' },
                    { code: 'A14', name: 'Falla Tierra', description: 'Descarga de fases de salida a tierra.' },
                    { code: 'A16', name: 'Corto Circuito', description: 'Corto-circuito en motor o cable de motor.' }
                ],
                yaskawa: [
                    { code: 'oC', name: 'Sobrecorriente', description: 'Corriente salida excedió nivel instantáneo.' },
                    { code: 'oV', name: 'Sobrevoltaje', description: 'Voltaje bus DC excedió nivel de disparo.' },
                    { code: 'Uv1', name: 'Subvoltaje DC', description: 'Voltaje bus DC bajo nivel. Revisar fusibles/potencia.' },
                    { code: 'oL1', name: 'Sobrecarga Motor', description: 'Protección sobrecarga motor disparada (térmico electrónico).' }
                ],
                mitsubishi: [
                    { code: 'E.OC1', name: 'Sobrecorriente Acel', description: 'Sobrecorriente durante aceleración.' },
                    { code: 'E.OC2', name: 'Sobrecorriente Const', description: 'Sobrecorriente durante velocidad constante.' },
                    { code: 'E.OC3', name: 'Sobrecorriente Desacel', description: 'Sobrecorriente durante desaceleración.' },
                    { code: 'E.UVT', name: 'Subvoltaje', description: 'Voltaje suministro inversor cayó.' }
                ],
                eaton: [
                    { code: 'F1', name: 'Sobrecorriente', description: 'Hardware detectó corriente excesiva.' },
                    { code: 'F2', name: 'Sobrevoltaje', description: 'Sobrevoltaje enlace DC.' },
                    { code: 'F3', name: 'Subvoltaje', description: 'Subvoltaje enlace DC.' },
                    { code: 'F5', name: 'Sobretemp', description: 'Temperatura disipador muy alta.' }
                ]
            },
            thermocoupleTable: { type: 'Tipo', positive: 'Positivo (+)', negative: 'Negativo (-)', jacket: 'Forro' },
            colorCodes: {
                ansi: {
                    name: 'ANSI (Estados Unidos)',
                    note: 'Rojo es SIEMPRE negativo en ANSI.',
                    codes: [
                        { type: 'J', positive: 'Blanco', negative: 'Rojo', jacket: 'Negro' },
                        { type: 'K', positive: 'Amarillo', negative: 'Rojo', jacket: 'Amarillo' },
                        { type: 'T', positive: 'Azul', negative: 'Rojo', jacket: 'Azul' },
                        { type: 'E', positive: 'Morado', negative: 'Rojo', jacket: 'Morado' },
                        { type: 'N', positive: 'Naranja', negative: 'Rojo', jacket: 'Naranja' },
                        { type: 'R/S', positive: 'Negro', negative: 'Rojo', jacket: 'Verde' },
                        { type: 'B', positive: 'Gris', negative: 'Rojo', jacket: 'Gris' }
                    ]
                },
                iec: {
                    name: 'IEC 60584-3 (Europa/Global)',
                    note: 'Estándar común para nuevas instalaciones.',
                    codes: [
                        { type: 'J', positive: 'Negro', negative: 'Blanco', jacket: 'Negro' },
                        { type: 'K', positive: 'Verde', negative: 'Blanco', jacket: 'Verde' },
                        { type: 'T', positive: 'Marrón', negative: 'Blanco', jacket: 'Marrón' },
                        { type: 'E', positive: 'Violeta', negative: 'Blanco', jacket: 'Violeta' },
                        { type: 'N', positive: 'Rosa', negative: 'Blanco', jacket: 'Rosa' },
                        { type: 'R/S', positive: 'Naranja', negative: 'Blanco', jacket: 'Naranja' },
                        { type: 'B', positive: 'Gris', negative: 'Blanco', jacket: 'Gris' }
                    ]
                },
                din: {
                    name: 'DIN 43710 (Alemán - Obsoleto)',
                    note: 'Solo sistemas heredados.',
                    codes: [
                        { type: 'J', positive: 'Rojo', negative: 'Azul', jacket: 'Azul' },
                        { type: 'K', positive: 'Rojo', negative: 'Verde', jacket: 'Verde' },
                        { type: 'T', positive: 'Rojo', negative: 'Marrón', jacket: 'Marrón' },
                        { type: 'E', positive: 'Rojo', negative: 'Negro', jacket: 'Negro' }
                    ]
                },
                jis: {
                    name: 'JIS C 1610 (Japón - Pre-1995)',
                    note: 'Reemplazado por colores IEC en 1995, común en máquinas viejas.',
                    codes: [
                        { type: 'J', positive: 'Rojo', negative: 'Blanco', jacket: 'Amarillo' },
                        { type: 'K', positive: 'Rojo', negative: 'Blanco', jacket: 'Azul' },
                        { type: 'T', positive: 'Rojo', negative: 'Blanco', jacket: 'Marrón' },
                        { type: 'E', positive: 'Rojo', negative: 'Blanco', jacket: 'Violeta' }
                    ]
                }
            },
            plcDataTypes: {
                allenBradley: {
                    name: 'Rockwell / Allen-Bradley (Logix)',
                    types: [
                        { type: 'BOOL', desc: 'Booleano 1-bit (0 o 1)' },
                        { type: 'SINT', desc: 'Entero con signo 8-bit (-128 a 127)' },
                        { type: 'INT', desc: 'Entero con signo 16-bit (-32,768 a 32,767)' },
                        { type: 'DINT', desc: 'Entero con signo 32-bit (-2.14B a 2.14B)' },
                        { type: 'LINT', desc: 'Entero con signo 64-bit (rango enorme)' },
                        { type: 'REAL', desc: 'Punto flotante 32-bit (IEEE 754)' },
                        { type: 'LREAL', desc: 'Punto flotante 64-bit (Doble Precisión)' },
                        { type: 'TIMER', desc: 'Estructura (PRE, ACC, EN, TT, DN)' },
                        { type: 'COUNTER', desc: 'Estructura (PRE, ACC, CU, CD, DN, OV, UN)' },
                        { type: 'STRING', desc: 'Estructura Cadena ASCII (LEN, DATA[])' }
                    ]
                },
                siemens: {
                    name: 'Siemens (TIA Portal / S7)',
                    types: [
                        { type: 'Bool', desc: 'Valor binario 1-bit' },
                        { type: 'Byte', desc: '8-bit sin signo (0 a 255) o hex' },
                        { type: 'Int', desc: 'Entero con signo 16-bit' },
                        { type: 'DInt', desc: 'Entero con signo 32-bit' },
                        { type: 'Word', desc: '16-bit sin signo / máscara de bits' },
                        { type: 'DWord', desc: '32-bit sin signo / máscara de bits' },
                        { type: 'Real', desc: 'Punto flotante 32-bit' },
                        { type: 'LReal', desc: 'Punto flotante 64-bit' },
                        { type: 'Time', desc: 'Valor de tiempo 32-bit (resolución ms)' },
                        { type: 'S5Time', desc: 'Tiempo BCD legado 16-bit' },
                        { type: 'Char', desc: 'Carácter ASCII 8-bit' }
                    ]
                }
            }
        },
        shiftLog: {
            title: 'Bitácora Inteligente',
            description: 'Registra eventos informalmente. El sistema estructura datos y genera reportes.',
            inputPlaceholder: 'Ejemplo: "La bomba 2 vibraba. Apreté los pernos."',
            submitButton: 'Registrar Evento',
            processing: 'Estructurando...',
            recentLogs: 'Eventos del Turno (Grupo Actual)',
            generateReport: 'Generar Reporte',
            generatingReport: 'Redactando...',
            reportTitle: 'Reporte de Entrega',
            noLogs: 'Sin eventos en las últimas 12 horas.',
            fields: { equipment: 'Equipo', failure: 'Falla', action: 'Acción', criticality: 'Criticidad', status: 'Estado' }
        },
        formTopic: 'Tema',
        formDifficulty: 'Dificultad',
        formDifficultyBeginner: 'Principiante',
        formDifficultyIntermediate: 'Intermedio',
        formDifficultyAdvanced: 'Avanzado',
        formVfdBrand: 'Marca del VFD',
        formVfdModel: 'Modelo del VFD',
        formPlcBrand: 'Marca del PLC',
        formPlcSoftware: 'Software de Configuración',
        formPlcLanguage: 'Lenguaje de Programación',
        formGeneralOption: 'General',
        formGeneratingButton: 'Generando...',
        formGenerateButton: 'Generar',
        errorAlertTitle: 'Ocurrió un Error',
        spinnerLoading: 'Cargando...',
        spinnerWait: 'Por favor espera.',
        result: { title: 'Resultado del Análisis' },
        export: { pdf: 'Exportar PDF' },
        pdf: {
            sensorReport: {
                title: 'Reporte de Recomendación de Sensor',
                justification: 'Justificación',
                recommendedTechnologies: 'Tecnologías Recomendadas',
                topChoice: 'Opción Principal',
                easeOfInstallation: 'Facilidad de Instalación',
                suggestedModels: 'Modelos Sugeridos',
                installationConsiderations: 'Consideraciones de Instalación',
                implementationGuide: 'Guía de Implementación',
            }
        }
    }
};
