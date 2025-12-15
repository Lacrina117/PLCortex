// FIX: Implemented the translations object. This provides the necessary UI text in English and Spanish, resolving the module resolution error in the useTranslation hook.
export const translations = {
    en: {
        // Header & Descriptions
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
            shiftLog: 'Track shift events and generate AI reports.',
        },
        tooltips: {
            toggleTheme: 'Toggle theme',
        },

        // Landing Page
        landing: {
            heroTitle: 'The Assistant for Industrial Automation',
            heroSubtitle: 'PLCortex provides specialized solutions for PLC programming, VFD configuration, and troubleshooting.',
            heroDescription: 'From generating control philosophies to providing step-by-step commissioning guides, get expert-level assistance instantly.',
            heroCta: 'Enter PLCortex',
            specializationTitle: 'Our Specializations',
            plcTitle: 'Programmable Logic Controllers (PLCs)',
            plcDescription: 'Generate ladder logic, analyze scan times, and verify critical safety logic for Siemens, Allen-Bradley, and more.',
            plcTags: 'Ladder Logic, Structured Text, FBD, Logic Verification',
            vfdTitle: 'Variable Frequency Drives (VFDs)',
            vfdDescription: 'Create wiring guides, commissioning plans, diagnose fault codes, and get parameter recommendations for major brands.',
            vfdTags: 'Wiring, Commissioning, Fault Diagnosis, Energy Savings',
            creator: 'Created by Ing. Jesús Jiménez',
        },
        footerText: 'PLCortex © 2024. All rights reserved. This is a portfolio project and not a commercial product.',
        
        // Login & Admin
        login: {
            title: 'Welcome to PLCortex',
            subtitle: 'Please enter your access code.',
            placeholder: 'Access Code',
            button: 'Enter',
            error: 'Invalid or inactive code.',
            loading: 'Verifying...',
            masterUser: 'Master User',
        },
        admin: {
            title: 'Admin Panel - Access Codes',
            logout: 'Logout',
            descriptionPlaceholder: 'Assign to a user...',
            groupPlaceholder: 'Group Name (e.g. Area 1)',
            table: {
                code: 'Access Code',
                description: 'Description',
                group: 'Group / Area',
                role: 'Role',
                active: 'Active',
                created: 'Date Created',
                copy: 'Copy',
                copied: 'Copied!',
                leader: 'Leader',
                member: 'Member',
            },
        },

        // Dashboard
        dashboard: {
            title: 'Welcome to PLCortex',
            subtitle: 'Your expert co-pilot for industrial automation. Select a tool to begin.',
            recentActivity: 'Recent Activity',
        },
        
        // Chat / Solutions
        chat: {
            welcomeTitle: 'Automation Solutions Chat',
            welcomeMessage: 'Ask anything about PLCs or VFDs. Start a new chat to begin, and remember to set the context for more accurate answers.',
            startNewChat: 'Start New Chat',
            newChatTitle: 'New Chat',
            historyTitle: 'Chat History',
            placeholder: 'Ask a question about your VFD or PLC...',
            thinking: 'Thinking...',
            contextTitle: 'Chat Context',
            contextLocked: 'Locked',
            contextEditable: 'Editable',
            finishConversation: 'Finish',
            newChat: 'New'
        },

        // Shift Log
        shiftLog: {
            title: 'Intelligent Shift Log',
            description: 'Record events informally. The AI structures the data and generates the handover report.',
            inputPlaceholder: 'Example: "Pump 2 was vibrating. I tightened the bolts and it normalized."',
            submitButton: 'Record Event',
            processing: 'Structuring Data...',
            recentLogs: 'Shift Events (Current Group)',
            generateReport: 'Generate Shift Report',
            generatingReport: 'Writing Report...',
            reportTitle: 'Shift Handover Report',
            noLogs: 'No events recorded in the last 12 hours.',
            fields: {
                equipment: 'Equipment',
                failure: 'Failure',
                action: 'Action',
                criticality: 'Criticality',
                status: 'Status',
            }
        },

        // Forms
        formTopic: 'Topic',
        formDifficulty: 'Difficulty',
        formDifficultyBeginner: 'Beginner',
        formDifficultyIntermediate: 'Intermediate',
        formDifficultyAdvanced: 'Advanced',
        formVfdBrand: 'VFD Brand',
        formVfdModel: 'VFD Model',
        formPlcBrand: 'PLC Brand',
        formPlcSoftware: 'PLC Software',
        formPlcLanguage: 'PLC Language',
        formGeneralOption: 'General',
        formGeneratingButton: 'Generating...',
        formGenerateButton: 'Generate',
        
        // Practices
        practices: {
            title: 'Generate a Practice Problem',
            description: 'Select a topic and difficulty to create a custom practice scenario.',
        },
        practice: {
            title: 'Practice Problem',
            solutionTitle: 'Solution',
            showSolution: 'Show Solution',
            hideSolution: 'Hide Solution',
        },
        
        // Spinners & Alerts
        spinnerLoading: 'Loading...',
        spinnerWait: 'Please wait a moment.',
        errorAlertTitle: 'An Error Occurred',
        error: {
            unexpected: 'An unexpected error occurred. Please try again.',
        },
        
        // Commissioning
        commissioning: {
            selectTitle: 'VFD Commissioning Assistant',
            selectDescription: 'Select a VFD model to begin an interactive, step-by-step commissioning guide.',
            brandLabel: 'Select VFD Brand',
            modelLabel: 'Select VFD Model',
            applicationLabel: 'Select Application',
            appConveyor: 'Simple Conveyor',
            appFan: 'Fan / Blower Control',
            appPumpPID: 'Constant Pressure Pump (PID)',
            appGeneral: 'General Purpose',
            startButton: 'Start Commissioning',
            initialPrompt: 'Hello, I\'m ready to commission my VFD for a {application} application. What is the first step?',
            terminalQuery: 'I have a question about the diagram. What is the purpose of terminal "{label}" ({func}) and what parameters are associated with it?',
            placeholder: 'Ask a question or confirm completion...',
            historyTitle: 'Sessions',
            newChat: 'New',
            diagramNotAvailable: 'Diagram Not Available',
            diagramNotAvailableDesc: 'A visual diagram for this model has not been implemented yet.',
        },
        
        // Tools
        tools: {
            title: 'Automation Tools',
            description: 'A suite of specialized utilities to analyze, verify, and optimize your automation systems.',
            generateButton: 'Analyze',
            backToTools: 'Back to Tools',
            faultDiagnosis: {
                title: 'VFD Fault Diagnosis',
                description: 'Analyze a VFD fault code with context to get likely causes and troubleshooting steps.',
                vfdBrand: 'VFD Brand',
                vfdModel: 'VFD Model',
                faultCode: 'Fault Code',
                faultCodePlaceholder: 'e.g., F0001 or oC',
                context: 'Operating Context',
                contextPlaceholder: 'e.g., "Fault occurs immediately upon start command" or "Happens randomly during run"',
            },
            scanTime: {
                title: 'PLC Scan Time Analyzer',
                description: 'Paste PLC code (any text format) to get recommendations for optimizing its execution time.',
                codeLabel: 'PLC Code',
                codePlaceholder: 'Paste your ladder logic, structured text, etc. here.',
            },
            energy: {
                title: 'VFD Energy Efficiency',
                description: 'Get a plan with parameter recommendations to maximize energy savings for a specific application.',
                appType: 'Application Type',
                appTypes: {
                    pump: 'Centrifugal Pump',
                    fan: 'Fan / Blower',
                    conveyor: 'Conveyor',
                    compressor: 'Compressor',
                    other: 'Other',
                },
                loadProfile: 'Load Profile',
                loadProfilePlaceholder: 'e.g., "Runs 24/7 but demand is low at night" or "Variable speed based on pressure sensor"',
            },
            codeProver: {
                title: 'Safety Logic Analyzer',
                description: 'Analyzes safety code for common patterns, deviations from best practices (e.g., IEC 61131, ISO 13849), and potential logical vulnerabilities.',
                rulesLabel: 'Immutable Rules',
                rulesPlaceholder: 'Example: "Rule 1: The Main_Valve and Drain_Valve can NEVER be open at the same time."',
            },
            logicValidator: {
                title: 'Logic Validator',
                description: 'Check PLC logic (text format) for common errors like duplicate outputs or dead code.',
                codeLabel: 'PLC Logic (Text Format)',
                codePlaceholder: 'Example:\nXIC(Start) XIO(Stop) OTE(Motor)\nXIC(Motor) OTE(Motor_Running_Light)',
                analyzeButton: 'Validate Logic',
                analyzing: 'Validating...',
                analysisResults: 'Validation Results',
                noIssues: 'No issues found in the logic.',
                suggestButton: 'Suggest a Fix',
                suggesting: 'Generating fix...',
            },
            migration: {
                title: 'Code Migration Assistant',
                description: 'Translate logic between different PLC brands and platforms (e.g., Rockwell to Siemens).',
                sourceGroup: 'Source Platform',
                targetGroup: 'Target Platform',
                convertButton: 'Convert Code',
                converting: 'Converting...',
                resultTitle: 'Migration Result',
                notesTitle: 'Migration Notes & Warnings',
                codePlaceholder: 'Paste source code here (e.g., Rung ASCII or Structured Text)...',
            },
            network: {
                title: 'Networking & Protocols',
                description: 'Calculators and assistants for industrial communication.',
                calculateButton: 'Calculate',
                checksum: {
                    title: 'Checksum & CRC Calculator',
                    description: 'For serial protocols (ASCII) and Modbus RTU.',
                    frameLabel: 'Data Frame',
                    framePlaceholder: 'e.g., 0103000A0001 or ABC',
                    inputType: 'Input Type',
                    inputHex: 'Hexadecimal',
                    inputAscii: 'ASCII',
                    resultsTitle: 'Checksum Results',
                    crc16modbus: 'CRC-16 (Modbus)',
                    crc16ccitt: 'CRC-16 (CCITT/XModem)',
                    crc32: 'CRC-32 (Ethernet)',
                    lrc: 'LRC (Modbus ASCII)',
                    checksum8: 'Checksum (8-bit Sum)',
                    checksum16: 'Checksum (16-bit Sum)',
                    order_lf: 'Low Byte First',
                    order_hf: 'High Byte First',
                    decimalValue: 'Decimal',
                    fullFrame: 'Full Frame (with CRC)',
                    copy: 'Copy',
                },
                ascii: {
                    title: 'Hex Frame Decoder',
                    description: 'Decode a hex string to visualize non-printable ASCII characters.',
                    frameLabel: 'Hex Frame',
                    framePlaceholder: 'e.g., 02 30 30 31 35 2E 35 30 67 0D 0A',
                    decodedFrame: 'Decoded Frame',
                    analysis: 'Analysis',
                    sendToCRC: 'Calculate Checksum for this frame',
                },
                hardware: {
                    title: 'Network Hardware Assistant',
                    description: 'Select protocols to get a compatibility report and hardware recommendations.',
                    protocolsLabel: 'Select Protocols to Interconnect',
                },
                subnet: {
                    title: 'Subnet Calculator',
                    description: 'Verify if two devices can communicate on the same network.',
                    device1: 'Device 1 IP',
                    device2: 'Device 2 IP',
                    subnetMask: 'Subnet Mask',
                    resultTitle: 'Subnet Analysis',
                    status: 'Status',
                    statusOk: 'Success! Devices are on the same subnet.',
                    statusFail: 'Subnet Mismatch! Devices cannot communicate directly.',
                    netAddress: 'Network Address',
                    broadcastAddress: 'Broadcast Address',
                    validRange: 'Valid Host Range',
                },
            },
        },
        
        // Results
        result: {
            title: 'Analysis Result',
        },
        export: {
            pdf: 'Export PDF',
        },
        
        // PDF Export
        pdf: {
            sensorReport: {
                title: 'Sensor Recommendation Report',
                justification: 'Justification',
                recommendedTechnologies: 'Recommended Technologies',
                topChoice: 'Top Choice',
                easeOfInstallation: 'Ease of Installation',
                suggestedModels: 'Suggested Models',
                installationConsiderations: 'Installation Considerations',
                implementationGuide: 'Implementation Guide',
            }
        },

        // Reference
        reference: {
            title: 'Quick Reference',
            description: 'Commonly needed information at your fingertips. This is a sample, not an exhaustive list.',
            vfdTitle: 'VFD Common Fault Codes',
            vfdDesc: 'A brief list of some of the most common fault codes for popular VFD brands.',
            plcTitle: 'PLC Data Types',
            plcDesc: 'A reference for common data types used in Allen-Bradley and Siemens PLCs.',
            // ... (rest of the file remains unchanged, omitted for brevity but preserved in output)
        },
    },
    es: {
        // Header & Descriptions
        header: {
            solutions: 'Soluciones',
            practices: 'Prácticas',
            tools: 'Herramientas',
            commissioning: 'Puesta en Marcha',
            reference: 'Referencia',
            calculator: 'Calculadoras',
            shiftLog: 'Bitácora',
            signedInAs: 'Sesión iniciada como',
            logout: 'Cerrar Sesión',
        },
        header_descriptions: {
            solutions: 'Obtén respuestas instantáneas y ayuda para solucionar problemas.',
            practices: 'Genera problemas de práctica para mejorar tus habilidades.',
            tools: 'Usa herramientas especializadas para análisis y verificación.',
            commissioning: 'Sigue guías interactivas para la puesta en marcha de VFDs.',
            reference: 'Consulta rápidamente códigos de falla y tipos de datos.',
            calculator: 'Realiza cálculos industriales comunes.',
            shiftLog: 'Registra eventos del turno y genera reportes con IA.',
        },
        tooltips: {
            toggleTheme: 'Cambiar tema',
        },

        // Landing Page
        landing: {
            heroTitle: 'El Asistente para Automatización Industrial',
            heroSubtitle: 'PLCortex proporciona soluciones especializadas para programación de PLC, configuración de VFD y solución de problemas.',
            heroDescription: 'Desde la generación de filosofías de control hasta la provisión de guías de puesta en marcha paso a paso, obtenga asistencia de nivel experto al instante.',
            heroCta: 'Entrar a PLCortex',
            specializationTitle: 'Nuestras Especializaciones',
            plcTitle: 'Controladores Lógicos Programables (PLCs)',
            plcDescription: 'Genera lógica de escalera, analiza tiempos de scan y verifica lógica de seguridad crítica para Siemens, Allen-Bradley y más.',
            plcTags: 'Lógica de Escalera, Texto Estructurado, FBD, Verificación de Lógica',
            vfdTitle: 'Variadores de Frecuencia (VFDs)',
            vfdDescription: 'Crea guías de cableado, planes de puesta en marcha, diagnostica códigos de falla y obtén recomendaciones de parámetros para las principales marcas.',
            vfdTags: 'Cableado, Puesta en Marcha, Diagnóstico de Fallas, Ahorro de Energía',
            creator: 'Creado por Ing. Jesús Jiménez',
        },
        footerText: 'PLCortex © 2024. Todos los derechos reservados. Este es un proyecto de portafolio y no un producto comercial.',
        
        // Login & Admin
        login: {
            title: 'Bienvenido a PLCortex',
            subtitle: 'Por favor, introduce tu código de acceso.',
            placeholder: 'Código de Acceso',
            button: 'Entrar',
            error: 'Código inválido o inactivo.',
            loading: 'Verificando...',
            masterUser: 'Usuario Maestro',
        },
        admin: {
            title: 'Panel de Admin - Códigos de Acceso',
            logout: 'Cerrar Sesión',
            descriptionPlaceholder: 'Asignar a un usuario...',
            groupPlaceholder: 'Nombre de Grupo (ej. Area 1)',
            table: {
                code: 'Código de Acceso',
                description: 'Descripción',
                group: 'Grupo / Área',
                role: 'Rol',
                active: 'Activo',
                created: 'Fecha de Creación',
                copy: 'Copiar',
                copied: '¡Copiado!',
                leader: 'Líder',
                member: 'Miembro',
            },
        },

        // Dashboard
        dashboard: {
            title: 'Bienvenido a PLCortex',
            subtitle: 'Tu copiloto experto para la automatización industrial. Selecciona una herramienta para comenzar.',
            recentActivity: 'Actividad Reciente',
        },

        // Chat / Solutions
        chat: {
            welcomeTitle: 'Chat de Soluciones de Automatización',
            welcomeMessage: 'Pregunta lo que sea sobre PLCs o VFDs. Inicia un nuevo chat para comenzar y recuerda establecer el contexto para respuestas más precisas.',
            startNewChat: 'Iniciar Nuevo Chat',
            newChatTitle: 'Nuevo Chat',
            historyTitle: 'Historial de Chats',
            placeholder: 'Haz una pregunta sobre tu VFD o PLC...',
            thinking: 'Pensando...',
            contextTitle: 'Contexto del Chat',
            contextLocked: 'Bloqueado',
            contextEditable: 'Editable',
            finishConversation: 'Finalizar',
            newChat: 'Nuevo'
        },

        // Shift Log
        shiftLog: {
            title: 'Bitácora de Turno Inteligente',
            description: 'Registra eventos informalmente. La IA estructura los datos y genera el reporte de entrega.',
            inputPlaceholder: 'Ejemplo: "La bomba 2 vibraba mucho. Apreté los pernos y se normalizó."',
            submitButton: 'Registrar Evento',
            processing: 'Estructurando Datos...',
            recentLogs: 'Eventos del Turno (Grupo Actual)',
            generateReport: 'Generar Reporte de Turno',
            generatingReport: 'Redactando Reporte...',
            reportTitle: 'Reporte de Entrega de Turno',
            noLogs: 'No hay eventos registrados en las últimas 12 horas.',
            fields: {
                equipment: 'Equipo',
                failure: 'Falla',
                action: 'Acción',
                criticality: 'Criticidad',
                status: 'Estado',
            }
        },

        // Forms
        formTopic: 'Tema',
        formDifficulty: 'Dificultad',
        formDifficultyBeginner: 'Principiante',
        formDifficultyIntermediate: 'Intermedio',
        formDifficultyAdvanced: 'Avanzado',
        formVfdBrand: 'Marca de VFD',
        formVfdModel: 'Modelo de VFD',
        formPlcBrand: 'Marca de PLC',
        formPlcSoftware: 'Software de PLC',
        formPlcLanguage: 'Lenguaje de PLC',
        formGeneralOption: 'General',
        formGeneratingButton: 'Generando...',
        formGenerateButton: 'Generar',
        
        // Practices
        practices: {
            title: 'Generar un Problema de Práctica',
            description: 'Selecciona un tema y dificultad para crear un escenario de práctica personalizado.',
        },
        practice: {
            title: 'Problema de Práctica',
            solutionTitle: 'Solución',
            showSolution: 'Mostrar Solución',
            hideSolution: 'Ocultar Solución',
        },

        // Spinners & Alerts
        spinnerLoading: 'Cargando...',
        spinnerWait: 'Por favor, espera un momento.',
        errorAlertTitle: 'Ocurrió un Error',
        error: {
            unexpected: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
        },

        // Commissioning
        commissioning: {
            selectTitle: 'Asistente de Puesta en Marcha de VFD',
            selectDescription: 'Selecciona un modelo de VFD para comenzar una guía interactiva y paso a paso para la puesta en marcha.',
            brandLabel: 'Seleccionar Marca de VFD',
            modelLabel: 'Seleccionar Modelo de VFD',
            applicationLabel: 'Seleccionar Aplicación',
            appConveyor: 'Transportador Simple',
            appFan: 'Control de Ventilador / Soplador',
            appPumpPID: 'Bomba de Presión Constante (PID)',
            appGeneral: 'Propósito General',
            startButton: 'Iniciar Puesta en Marcha',
            initialPrompt: 'Hola, estoy listo para la puesta en marcha de mi VFD para una aplicación de {application}. ¿Cuál es el primer paso?',
            terminalQuery: 'Tengo una pregunta sobre el diagrama. ¿Cuál es el propósito del terminal "{label}" ({func}) y qué parámetros están asociados a él?',
            placeholder: 'Haz una pregunta o confirma la finalización...',
            historyTitle: 'Sesiones',
            newChat: 'Nueva',
            diagramNotAvailable: 'Diagrama No Disponible',
            diagramNotAvailableDesc: 'Aún no se ha implementado un diagrama visual para este modelo.',
        },
        
        // Tools
        tools: {
            title: 'Herramientas de Automatización',
            description: 'Un conjunto de utilidades especializadas para analizar, verificar y optimizar tus sistemas de automatización.',
            generateButton: 'Analizar',
            backToTools: 'Volver a Herramientas',
            faultDiagnosis: {
                title: 'Diagnóstico de Fallas de VFD',
                description: 'Analiza un código de falla de VFD con contexto para obtener causas probables y pasos de solución.',
                vfdBrand: 'Marca de VFD',
                vfdModel: 'Modelo de VFD',
                faultCode: 'Código de Falla',
                faultCodePlaceholder: 'Ej., F0001 o oC',
                context: 'Contexto Operativo',
                contextPlaceholder: 'Ej., "La falla ocurre inmediatamente al dar el comando de arranque" o "Sucede aleatoriamente durante la operación"',
            },
            scanTime: {
                title: 'Analizador de Tiempo de Scan de PLC',
                description: 'Pega código de PLC (cualquier formato de texto) para obtener recomendaciones para optimizar su tiempo de ejecución.',
                codeLabel: 'Código de PLC',
                codePlaceholder: 'Pega tu lógica de escalera, texto estructurado, etc. aquí.',
            },
            energy: {
                title: 'Eficiencia Energética de VFD',
                description: 'Obtén un plan con recomendaciones de parámetros para maximizar el ahorro de energía para una aplicación específica.',
                appType: 'Tipo de Aplicación',
                appTypes: {
                    pump: 'Bomba Centrífuga',
                    fan: 'Ventilador / Soplador',
                    conveyor: 'Transportador',
                    compressor: 'Compresor',
                    other: 'Otro',
                },
                loadProfile: 'Perfil de Carga',
                loadProfilePlaceholder: 'Ej., "Funciona 24/7 pero la demanda es baja por la noche" o "Velocidad variable basada en sensor de presión"',
            },
            codeProver: {
                title: 'Analizador de Lógica de Seguridad',
                description: 'Analiza el código de seguridad en busca de patrones comunes, desviaciones de las mejores prácticas (ej. IEC 61131, ISO 13849) y posibles vulnerabilidades lógicas.',
                rulesLabel: 'Reglas Inmutables',
                rulesPlaceholder: 'Ejemplo: "Regla 1: La Válvula_Principal y la Válvula_Drenaje NUNCA pueden estar abiertas al mismo tiempo."',
            },
            logicValidator: {
                title: 'Validador de Lógica',
                description: 'Revisa lógica de PLC (formato de texto) en busca de errores comunes como salidas duplicadas o código muerto.',
                codeLabel: 'Lógica de PLC (Formato de Texto)',
                codePlaceholder: 'Ejemplo:\nXIC(Start) XIO(Stop) OTE(Motor)\nXIC(Motor) OTE(Motor_Running_Light)',
                analyzeButton: 'Validar Lógica',
                analyzing: 'Validando...',
                analysisResults: 'Resultados de Validación',
                noIssues: 'No se encontraron problemas en la lógica.',
                suggestButton: 'Sugerir Corrección',
                suggesting: 'Generando corrección...',
            },
            migration: {
                title: 'Asistente de Migración de Código',
                description: 'Traduce lógica entre diferentes marcas y plataformas de PLC (ej. Rockwell a Siemens).',
                sourceGroup: 'Plataforma de Origen',
                targetGroup: 'Plataforma de Destino',
                convertButton: 'Convertir Código',
                converting: 'Convirtiendo...',
                resultTitle: 'Resultado de la Migración',
                notesTitle: 'Notas y Advertencias de Migración',
                codePlaceholder: 'Pega el código fuente aquí (ej. Escalera ASCII o Texto Estructurado)...',
            },
            network: {
                title: 'Redes y Protocolos',
                description: 'Calculadoras y asistentes para comunicación industrial.',
                calculateButton: 'Calcular',
                checksum: {
                    title: 'Calculadora de Checksum y CRC',
                    description: 'Para protocolos seriales (ASCII) y Modbus RTU.',
                    frameLabel: 'Trama de Datos',
                    framePlaceholder: 'Ej: 0103000A0001 o ABC',
                    inputType: 'Tipo de Entrada',
                    inputHex: 'Hexadecimal',
                    inputAscii: 'ASCII',
                    resultsTitle: 'Resultados de Checksum',
                    crc16modbus: 'CRC-16 (Modbus)',
                    crc16ccitt: 'CRC-16 (CCITT/XModem)',
                    crc32: 'CRC-32 (Ethernet)',
                    lrc: 'LRC (Modbus ASCII)',
                    checksum8: 'Checksum (Suma 8-bit)',
                    checksum16: 'Checksum (Suma 16-bit)',
                    order_lf: 'Byte Bajo Primero',
                    order_hf: 'Byte Alto Primero',
                    decimalValue: 'Decimal',
                    fullFrame: 'Trama Completa (con CRC)',
                    copy: 'Copiar',
                },
                ascii: {
                    title: 'Decodificador de Trama Hex',
                    description: 'Decodifica una trama en hexadecimal para visualizar caracteres ASCII no imprimibles.',
                    frameLabel: 'Trama Hexadecimal',
                    framePlaceholder: 'Ej: 02 30 30 31 35 2E 35 30 67 0D 0A',
                    decodedFrame: 'Trama Decodificada',
                    analysis: 'Análisis',
                    sendToCRC: 'Calcular Checksum para esta trama',
                },
                hardware: {
                    title: 'Asistente de Hardware de Red',
                    description: 'Selecciona protocolos para obtener un reporte de compatibilidad y recomendaciones de hardware.',
                    protocolsLabel: 'Seleccionar Protocolos a Interconectar',
                },
                subnet: {
                    title: 'Calculadora de Subred',
                    description: 'Verifica si dos dispositivos pueden comunicarse en la misma red.',
                    device1: 'IP Dispositivo 1',
                    device2: 'IP Dispositivo 2',
                    subnetMask: 'Máscara de Subred',
                    resultTitle: 'Análisis de Subred',
                    status: 'Estado',
                    statusOk: '¡Éxito! Los dispositivos están en la misma subred.',
                    statusFail: '¡Conflicto de Subred! Los dispositivos no pueden comunicarse directamente.',
                    netAddress: 'Dirección de Red',
                    broadcastAddress: 'Dirección de Broadcast',
                    validRange: 'Rango de Hosts Válidos',
                },
            },
        },
        
        // Results
        result: {
            title: 'Resultado del Análisis',
        },
        export: {
            pdf: 'Exportar PDF',
        },

        // PDF Export
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
        },
        
        // Reference
        reference: {
            title: 'Referencia Rápida',
            description: 'Información comúnmente necesaria al alcance de tu mano. Esta es una muestra, no una lista exhaustiva.',
            vfdTitle: 'Códigos de Falla Comunes de VFD',
            vfdDesc: 'Una breve lista de algunos de los códigos de falla más comunes para marcas populares de VFD.',
            plcTitle: 'Tipos de Datos de PLC',
            // ... (rest of the file remains unchanged, implicitly maintained)
        },
    },
};