// FIX: Declare process.env to resolve TypeScript errors in a Vite environment
// where process.env is defined via text replacement, removing the incorrect reference to 'vite/client'.
declare const process: {
  env: {
    API_KEY?: string;
  };
};

// Import necessary types and classes from the GenAI SDK for direct API calls in local development.
// FIX: Corrected import from '@google/genai'. `GenerateContentRequest` is deprecated and was replaced with `GenerateContentParameters` which is the correct type. Since this file intelligently switches between API calls, this type is aliased to `GenerateContentRequest` to maintain consistency with the existing code structure.
import { GoogleGenAI, GenerateContentParameters as GenerateContentRequest, Type } from '@google/genai';

// --- START of updated API call logic ---

// This service intelligently switches between calling the Gemini API directly
// for local development and using a secure serverless function for production.

// A direct-from-browser API call should only be attempted if a local API key
// has been provided via environment variables.
const useDirectClientCall = !!process.env.API_KEY;

let ai: GoogleGenAI | null = null;
// Initialize the GenAI client only if we are in local development and have a key.
if (useDirectClientCall) {
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    } catch(e) {
        console.error("Failed to initialize GoogleGenAI for local development. Ensure the API_KEY is valid. Falling back to serverless function.", e);
        // If initialization fails (e.g., invalid key format), fall back to the serverless function.
        ai = null;
    }
}

/**
 * A helper to call the Gemini API.
 * In local development, it calls the API directly from the browser for live feedback.
 * In production (Vercel), it calls our own secure serverless function to protect the API key.
 * @param task The name of the operation to perform.
 * @param params The parameters for that operation.
 * @returns The text content from the response.
 */
const callApiEndpoint = async (task: string, params: any): Promise<string> => {
    // Use the direct API call if in local dev and the SDK initialized successfully.
    if (useDirectClientCall && ai) {
        try {
            const model = 'gemini-2.5-flash';
            let request: GenerateContentRequest = { model };

            // Build the request object based on the parameters passed from the calling function.
            if (params.prompt) {
                request.contents = params.prompt;
            } else {
                throw new Error('Request params must include a prompt.');
            }

            if (params.config) {
                request.config = params.config;
            }
            
            const response = await ai.models.generateContent(request);
            return response.text;
        } catch (error) {
            console.error(`[Local Dev] Gemini API call failed for task '${task}':`, error);
            const originalErrorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get a response directly from Gemini. Details: ${originalErrorMessage}`);
        }
    } 
    // Otherwise, use the serverless function. This is the correct path for production and for local dev without a key.
    else {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task, params }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown API error" }));
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.details || errorData.error}`);
            }

            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error(`[Serverless] API call failed for task '${task}':`, error);
            const originalErrorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get a response from the server. Details: ${originalErrorMessage}`);
        }
    }
};

// --- END of updated API call logic ---


export interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: number;
}

interface ChatContext {
    topic: 'VFD' | 'PLC';
    language: 'en' | 'es';
    vfdBrand?: string;
    vfdModel?: string;
    plcBrand?: string;
    plcSoftware?: string;
    plcVersion?: string;
}

interface PracticeParams {
    topic: 'VFD' | 'PLC';
    difficulty: string;
    language: 'en' | 'es';
    vfdBrand?: string;
    vfdModel?: string;
    plcBrand?: string;
    plcSoftware?: string;
    plcLanguage?: string;
}

interface WiringGuideParams {
    language: 'en' | 'es';
    vfdBrand: string;
    vfdModel: string;
    plcSoftware: string;
    controlMethod: string;
    motorHp: string;
    motorVoltage: string;
    motorFla: string;
    application: string;
}

interface CommissioningPlanParams {
    language: 'en' | 'es';
    vfdBrand: string;
    vfdModel: string;
    motorHp: string;
    motorVoltage: string;
    motorFla: string;
    motorRpm: string;
    motorFreq: string;
    controlType: string;
    application: string;
}

export const generateChatResponse = async (messages: Message[], context: ChatContext): Promise<string> => {
    const langInstruction = context.language === 'es' ? 'Responde en español.' : 'Respond in English.';
    let prompt = "";
    messages.forEach((m: { role: string; parts: { text: string }[] }) => {
        prompt += `${m.role}: ${m.parts[0].text}\n\n`;
    });
    
    const buildContextString = () => {
        let expertKnowledge = '';
        if (context.vfdBrand === 'ABB' && context.vfdModel === 'ACS580') {
            expertKnowledge = "You have expert-level knowledge of the ABB ACS580 drive, based on its standard control program firmware manual. When discussing this model, refer to its specific parameter groups (e.g., Group 99: Start/stop/direction) and fault codes.";
        } else if (context.vfdBrand === 'ABB' && context.vfdModel === 'ACS355') {
            expertKnowledge = "You have expert-level knowledge of the ABB ACS355 machinery drive. When discussing this model, refer to its specific parameter groups (e.g., Group 10: Start/Stop/Direction, Group 11: Reference Select, Group 20: Limits, Group 30: Fault Functions, Group 99: Motor Data) and its macro-based setup.";
        } else if (context.vfdBrand === 'Schneider Electric' && context.vfdModel === 'Altivar Machine ATV320') {
            expertKnowledge = "You have expert-level knowledge of the Schneider Electric Altivar 320 (ATV320) machinery drive. When discussing this model, refer to its specific parameter menus, such as [drC-] (Drive menu), [CtL-] (Command menu), [FUn-] (Functions menu), and [FLt-] (Fault management menu). Be precise with parameter mnemonics (e.g., [bFr] - Standard motor frequency, [ACC] - Acceleration, [dEC] - Deceleration).";
        } else if (context.vfdBrand === 'Schneider Electric' && (context.vfdModel === 'Altivar Process ATV630' || context.vfdModel === 'Altivar Process ATV650')) {
            expertKnowledge = "You have expert-level knowledge of the Schneider Electric Altivar Process 600 series (ATV630/650). When discussing these models, refer to their main menu structure on the graphic display, such as [Main menu] -> [5 Complete settings] -> [5.4 Command and Reference]. Be familiar with their emphasis on process applications (pumps, fans) and PID control. Refer to specific terminals like STOA/STOB for safety.";
        } else if (context.vfdBrand === 'Danfoss' && context.vfdModel === 'VLT Midi Drive FC 280') {
            expertKnowledge = "You have expert-level knowledge of the Danfoss VLT Midi Drive FC 280. When discussing this model, refer to its specific parameter groups (e.g., Group 0: Operation/Display, Group 1: Load/Motor, Group 3: Reference/Ramps, Group 5: Digital I/O, Group 6: Analog I/O, Group 14: Special Functions/Alarms). Be familiar with its LCP (Local Control Panel) menu structure and the use of the Quick Menu for basic setup.";
        } else if (context.vfdBrand === 'Danfoss' && context.vfdModel === 'VLT FC 302') {
            expertKnowledge = "You have expert-level knowledge of the Danfoss VLT AutomationDrive FC 302. When discussing this model, refer to its matrix-style parameter groups (e.g., 1-** Load/Motor, 3-** Reference/Ramps, 5-** Digital I/O, 14-** Special Functions). Be familiar with its graphical LCP (Local Control Panel) menu structure, including the Main Menu and Quick Menu. Terminal 37 is the Safe Torque Off (STO) input.";
        } else if (context.vfdBrand === 'Mitsubishi Electric' && context.vfdModel === 'FR-E800') {
            expertKnowledge = "You have expert-level knowledge of the Mitsubishi Electric FR-E800 inverter. When discussing this model, refer to its specific parameter numbers (e.g., Pr.1 for Maximum frequency, Pr.7 for Acceleration time, Pr.8 for Deceleration time, Pr.9 for Motor capacity, Pr.79 for Operation mode selection). Be familiar with its standard terminal functions like STF (Forward start) and STR (Reverse start).";
        } else if (context.vfdBrand === 'Mitsubishi Electric' && context.vfdModel === 'FR-D700') {
            expertKnowledge = "You have expert-level knowledge of the Mitsubishi Electric FR-D700 inverter. When discussing this model, refer to its specific parameter numbers (e.g., Pr.1 for Maximum frequency, Pr.7 for Acceleration time, Pr.8 for Deceleration time, Pr.9 for Electronic thermal O/L relay). Be familiar with its standard terminal functions like STF (Forward start), STR (Reverse start), and the use of SD (sink common) and PC (source common) terminals.";
        } else if (context.vfdBrand === 'Eaton' && context.vfdModel === 'PowerXL DG1') {
            expertKnowledge = "You have expert-level knowledge of the Eaton PowerXL DG1 drive. When discussing this model, refer to its specific parameter groups (P1 for Basic, P2 for Advanced Motor, P3 for I/O, P6 for Protection) and fault codes (E-xx format). Be familiar with its standard terminal functions like DIN1 (Run Fwd) and DIN2 (Run Rev).";
        }
        
        if (context.topic === 'VFD') {
            if (context.vfdBrand && context.vfdBrand !== 'General') {
                const modelStr = context.vfdModel && context.vfdModel !== 'General' ? ` ${context.vfdModel}` : '';
                return `The user is working with a ${context.vfdBrand}${modelStr} VFD. ${expertKnowledge}`;
            }
        } else { // PLC
            if (context.plcBrand && context.plcBrand !== 'General') {
                const softwareStr = context.plcSoftware && context.plcSoftware !== 'General' ? ` with ${context.plcSoftware}` : '';
                return `The user is working with a ${context.plcBrand} PLC${softwareStr}.`;
            }
        }
        return 'The user has not specified any particular hardware. Provide general advice, and be prepared to give more specific answers if the user provides context later in the conversation.';
    };

    const systemInstruction = `You are a world-class industrial automation expert specializing in ${context.topic}s.
    ${buildContextString()}
    Provide clear, concise, and technically accurate advice. Use markdown for code blocks, lists, and emphasis.
    When creating wiring diagrams as ASCII art, use box-drawing characters (like │, ─, ┌, └, ┐, ┘, ├, ┤, ┬, ┴, ┼) and ensure perfect alignment within markdown code blocks for clarity.
    When generating PLC ladder logic diagrams, create ASCII art that closely resembles the Allen-Bradley RSLogix 5000 / Studio 5000 style. Use vertical bars | for power rails on both sides. Use -[ ]- for Normally Open contacts (XIC), -[/]- for Normally Closed contacts (XIO), and -( )- for coils (OTE). Place tag names directly above the instructions. Use vertical lines and '+' characters to create branches. Ensure all elements are perfectly aligned within a markdown code block for a clean, professional appearance.
Example of a motor seal-in circuit:
\`\`\`
      Start        Stop         Motor
|-----[ ]----------[/]----------( )----|
|      |                            |
|      +------[ ]------------------+
|             Motor                 |
\`\`\`
    ${langInstruction}`;

    return callApiEndpoint('generateChatResponse', { prompt, config: { systemInstruction } });
};

export const generatePractice = async (params: PracticeParams): Promise<string> => {
    const { topic, difficulty, language, vfdBrand, vfdModel, plcBrand, plcSoftware, plcLanguage } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Generate a practice problem for an industrial automation technician.
    Topic: ${topic}
    Difficulty: ${difficulty}
    ${topic === 'VFD' ? `Specific VFD: ${vfdBrand} ${vfdModel}` : ''}
    ${topic === 'PLC' ? `Specific PLC: ${plcBrand} with ${plcSoftware}` : ''}
    ${topic === 'PLC' ? `PLC Programming Language: ${plcLanguage}` : ''}
    
    The output must be in markdown and follow this structure exactly:
    ### Problem
    [A clear and detailed description of the problem scenario]
    
    ### Solution
    [A step-by-step solution to the problem, including code snippets, parameter settings, or wiring instructions as needed.]

    IMPORTANT STYLE GUIDE FOR LADDER LOGIC:
    If the solution includes a PLC ladder logic diagram, you MUST create ASCII art that closely resembles the Allen-Bradley RSLogix 5000 / Studio 5000 style.
    - Use vertical bars | for power rails on both sides of the rung.
    - Use -[ ]- for Normally Open contacts (XIC).
    - Use -[/]- for Normally Closed contacts (XIO).
    - Use -( )- for coils (OTE).
    - Place tag names directly above the instructions.
    - Use vertical lines and '+' characters to create branches.
    - Ensure all elements are perfectly aligned within a markdown code block for a clean, professional appearance.
    - Example of a motor seal-in circuit:
    \`\`\`
          Start        Stop         Motor
    |-----[ ]----------[/]----------( )----|
    |      |                            |
    |      +------[ ]------------------+
    |             Motor                 |
    \`\`\`

    ${langInstruction}`;

    return callApiEndpoint('generatePractice', { prompt });
};

export const generateWiringGuide = async (params: WiringGuideParams): Promise<string> => {
    const { language, vfdBrand, vfdModel, plcSoftware, controlMethod, motorHp, motorVoltage, motorFla, application } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Generate a detailed VFD wiring guide and a basic parameter list.
    VFD: ${vfdBrand} ${vfdModel}
    Associated PLC Software (for context): ${plcSoftware}
    Control Method: ${controlMethod}
    Motor: ${motorHp} HP, ${motorVoltage}V, ${motorFla} FLA
    Application: ${application}
    
    Base your recommendations on NEC Article 430 for motor circuit protection and follow best practices for grounding and shielding as outlined in industrial standards like the Allen-Bradley Wiring and Grounding Guidelines.

    The output must be in markdown and include:
    1.  **Safety Warning:** A clear warning about electrical hazards.
    2.  **Power Wiring:** Instructions for connecting L1, L2, L3 and U, V, W. Specify wire gauge recommendations based on NEC standards.
    3.  **Control Wiring:** A detailed table showing terminal connections for the ${controlMethod}. Include terminal numbers/names for the ${vfdModel}.
    4.  **Basic Parameter List:** A table with the most critical parameters to set for this application (e.g., Motor HP, Voltage, FLA, Accel/Decel times, control mode). Provide parameter numbers and recommended values.
    
    ${langInstruction}`;

    return callApiEndpoint('generateWiringGuide', { prompt });
};

export const generateCommissioningPlan = async (params: CommissioningPlanParams): Promise<string> => {
    const { language, vfdBrand, vfdModel, motorHp, motorVoltage, motorFla, motorRpm, motorFreq, controlType, application } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Create a commissioning plan for a ${vfdBrand} ${vfdModel} VFD.
    Motor Details: ${motorHp} HP, ${motorVoltage}V, ${motorFla} FLA, ${motorRpm} RPM, ${motorFreq} Hz.
    Control Type: ${controlType}
    Application: ${application}

    The plan should be a step-by-step guide in markdown format, including:
    - Pre-power checks
    - Initial power-up sequence
    - Basic parameter entry (from the details provided)
    - No-load motor test (jog/direction check)
    - Auto-tune procedure (if applicable for the model)
    - Load testing and final checks.

    ${langInstruction}`;
    return callApiEndpoint('generateCommissioningPlan', { prompt });
};

export const generateCommissioningChatResponse = async (messages: Message[], language: 'en' | 'es', vfdBrand?: string, vfdModel?: string, application?: string): Promise<string> => {
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    let prompt = "";
    messages.forEach((m: { role: string; parts: { text: string }[] }) => {
        prompt += `${m.role}: ${m.parts[0].text}\n\n`;
    });
    
    let expertKnowledge = '';
    if (vfdBrand === 'ABB' && vfdModel === 'ACS580') {
        expertKnowledge = `For the ABB ACS580, you MUST guide the user through the primary settings (Group 99), motor data (Group 99), and then application-specific macros (Group 97). Refer to parameter numbers directly (e.g., "set parameter 99.04 Motor nominal current to the value from the motor's nameplate").`;
    } else if (vfdBrand === 'ABB' && vfdModel === 'ACS355') {
        expertKnowledge = `For the ABB ACS355, which is a machinery drive, you MUST first ask the user which 'Macro' they want to use (e.g., ABB Standard, 3-wire, Potentiometer). After they choose, guide them through the essential parameters for that macro, followed by the motor data in Group 99. For example: "For the ABB Standard macro, DI1 is Start/Stop and AI1 is the speed reference. Now let's set motor data in Group 99. What is the motor's nominal voltage (parameter 99.05)?"`;
    } else if (vfdBrand === 'Schneider Electric' && vfdModel === 'Altivar Machine ATV320') {
        expertKnowledge = `For the Schneider Electric ATV320, you MUST first guide the user to the [drC-] menu to enter basic motor data. Start with the motor's standard frequency [bFr], then proceed to the nominal motor power [nPr], voltage [UnS], current [nCr], frequency [FrS], and speed [nSP]. After motor data is entered, ask about their control method (e.g., 2-wire, 3-wire) to configure the [CtL-] menu, specifically the [CHCF] (Control mode) and [Cd1] (Cmd channel 1) parameters. Example: "First, let's enter the motor nameplate data. Navigate to the [drC-] menu. What is the standard motor frequency (parameter [bFr])? It should be 50 or 60Hz."`;
    } else if (vfdBrand === 'Schneider Electric' && (vfdModel === 'Altivar Process ATV630' || vfdModel === 'Altivar Process ATV650')) {
        expertKnowledge = `For the Schneider Electric ATV630/650, you MUST guide the user through the 'Simply start' menu on the graphic display terminal. Start by asking for basic settings like motor standard, power, voltage, current, and speed. After the basic settings, ask about their application (e.g., pump, fan) to configure macros and PID settings. Example: "Welcome to the Simply Start menu. Let's enter the motor nameplate data. First, what is the motor's nominal power [nPr] in kW or HP?"`;
    } else if (vfdBrand === 'Danfoss' && vfdModel === 'VLT Midi Drive FC 280') {
        expertKnowledge = `For the Danfoss VLT FC 280, you MUST guide the user through the "Quick Menu" for initial setup. Start by asking for Motor Power (parameter 1-20), Motor Voltage (1-22), Motor Frequency (1-23), Motor Current (1-24), and Motor Speed (1-25). After the basic motor data is set, confirm their control method (e.g., 2-wire start/stop on DI 18) and reference source (e.g., Analog Input 53). Example: "First, let's set the basic motor parameters. Navigate to parameter 1-20 [Motor Power]. What is the motor power in kW from the nameplate?"`;
    } else if (vfdBrand === 'Danfoss' && vfdModel === 'VLT FC 302') {
        expertKnowledge = `For the Danfoss VLT FC 302, you MUST guide the user through the "Quick Menu" via the graphical LCP. Start by asking for Motor Power [kW] (parameter 1-20), Motor Voltage (1-22), Motor Frequency (1-23), Motor Current (1-24), and Motor Speed (1-25). Emphasize that these are in Group 1: Load/Motor. After motor data, confirm their control method (e.g., Start on DI 18, parameter 5-10) and reference source (e.g., Analog Input 53, parameter 3-15). Example: "First, using the LCP, navigate to the Quick Menu and find parameter 1-20 Motor Power. What is the motor power in kW?"`;
    } else if (vfdBrand === 'Mitsubishi Electric' && vfdModel === 'FR-E800') {
        expertKnowledge = `For the Mitsubishi Electric FR-E800, you MUST guide the user through the basic parameters for their application. Start with Pr.9 (Motor capacity), Pr.1 (Maximum frequency), Pr.7 (Acceleration time), and Pr.8 (Deceleration time). After these are set, confirm their operation mode (Pr.79), for example, External/PU combination mode. Then ask about motor specific data like Pr.82 (Motor rated voltage). Example: "First, let's set the basic motor parameters. What is the motor capacity in kW? You will enter this value in Pr.9."`;
    } else if (vfdBrand === 'Mitsubishi Electric' && vfdModel === 'FR-D700') {
        expertKnowledge = `For the Mitsubishi Electric FR-D700, you MUST guide the user through the basic parameters. Start with Pr.1 (Maximum frequency), Pr.7 (Acceleration time), Pr.8 (Deceleration time), and then motor protection with Pr.9 (Electronic thermal O/L relay). After these are set, confirm their operation mode (Pr.79), for example, External operation mode. Example: "First, let's set the basic operational parameters. What is the maximum frequency you need? You will enter this value in Pr.1."`;
    } else if (vfdBrand === 'Eaton' && vfdModel === 'PowerXL DG1') {
        expertKnowledge = `For the Eaton PowerXL DG1, you MUST guide the user through the Quick Start menu (Group P1). Start by asking for motor nameplate data for parameters like P1.06 (Motor Voltage), P1.07 (Motor FLA), P1.08 (Motor Frequency), and P1.09 (Motor RPM). After motor data, confirm their control method (e.g., 2-wire via DIN1) and reference source (e.g., Analog Input 1). Example: "Let's begin with the Quick Start menu. First, what is the motor's nominal voltage? You will enter this in parameter P1.06."`;
    }

    const systemInstruction = `You are a VFD commissioning expert, acting as an interactive, safety-conscious guide.
    The user is commissioning a ${vfdBrand} ${vfdModel} for a specific application: "${application}".
    Your role is to guide them step-by-step. Keep responses concise. Ask questions to confirm steps are complete.

    *** EXPERT KNOWLEDGE ***
    ${expertKnowledge}

    *** SAFETY FIRST - MOST IMPORTANT RULE ***
    Your VERY FIRST response in this conversation MUST be a detailed safety checklist. DO NOT provide any other information until the safety check is presented.
    The safety checklist must include:
    - Verifying main power is disconnected and Locked-Out/Tagged-Out (LOTO).
    - Using a multimeter to confirm 0 volts on input terminals (L1, L2, L3).
    - Wearing appropriate Personal Protective Equipment (PPE).
    - Ensuring the motor shaft is free to rotate and disconnected from the load for initial tests.
    After presenting the checklist, ask the user to confirm they have completed these steps before proceeding.

    *** WIRING AND DIAGRAMS ***
    When discussing wiring, reference specific terminal numbers for the ${vfdModel}.
    **Crucially, if your response involves specific terminals on a wiring diagram, you must append a JSON object to the end of your text response.**
    The JSON object must have a key "diagram_terminals" which is an array of strings, where each string is the ID of a terminal to highlight (e.g., ["STF", "STR", "SD"]).
    The terminal IDs must match the ones provided in the application's diagram data. Do not invent terminal IDs.
    Example response format:
    "Great, next connect the start signal to terminal DI1 and common to terminal DCOM.
    {"diagram_terminals": ["DI1", "DCOM"]}"

    *** PARAMETER CONFIGURATION WIZARD ***
    After wiring and initial power-up checks are confirmed, you MUST transition into a 'Parameter Wizard' mode.
    In this mode, you will ask the user for ONE piece of motor nameplate data at a time.
    1. Start by asking for the motor's nominal voltage. For example: "Great, the wiring is complete. Now let's configure the basic motor parameters. What is the motor's nominal voltage?"
    2. When the user provides a value (e.g., "480V"), you MUST respond by telling them the specific parameter number/name for the ${vfdModel} and the value they should enter. For example: "OK, set parameter [P101] Motor Voltage to 480V."
    3. Immediately after providing the parameter, ask the NEXT question in the sequence. For example: "Now, what is the motor's Full Load Amps (FLA)?"
    4. Continue this question-and-answer process for the following essential parameters in this order: Voltage, Current (FLA), Frequency, RPM (Base Speed), and Horsepower/Kilowatts.
    5. Once the basic motor data is collected, provide a summary and then instruct the user on how to perform a motor rotation check at low speed.

    *** HANDLING USER QUESTIONS ***
    If the user asks a question, like about a specific terminal, answer it directly and accurately. Then, gently guide them back to the current step of the commissioning process.

    ${langInstruction}`;

    return callApiEndpoint('generateCommissioningChatResponse', { 
        prompt, 
        config: { systemInstruction, temperature: 0.2 } 
    });
};

export const analyzeFaultCode = async (params: { language: 'en' | 'es'; vfdBrand: string; vfdModel: string; faultCode: string; context: string }): Promise<string> => {
    const { language, vfdBrand, vfdModel, faultCode, context } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    
    let expertKnowledge = '';
    if (vfdBrand === 'ABB' && vfdModel === 'ACS580') {
        expertKnowledge = "Your analysis of this ABB ACS580 fault must be particularly detailed, referencing information from its official firmware manual. Include possible causes, specific remedies, and relevant parameters to check from the manual.";
    } else if (vfdBrand === 'ABB' && vfdModel === 'ACS355') {
        expertKnowledge = "Your analysis for this ABB ACS355 fault must be precise. Consult the official manual's troubleshooting section for this fault code. List potential causes, corrective actions, and any relevant parameters from groups like 22 (Accel/Decel) or 30 (Fault Functions) that should be verified.";
    } else if (vfdBrand === 'Schneider Electric' && vfdModel === 'Altivar Machine ATV320') {
        expertKnowledge = "Your analysis for this Schneider Electric ATV320 fault must be highly specific, based on its programming manual. Refer to the [FLt-] (Fault management) menu for any associated diagnostic parameters. List the exact causes and corrective actions described in the manual for this specific fault code.";
    } else if (vfdBrand === 'Schneider Electric' && (vfdModel === 'Altivar Process ATV630' || vfdModel === 'Altivar Process ATV650')) {
        expertKnowledge = "Your analysis for this Schneider Electric ATV600 series fault must be precise, based on its programming manual. Refer to the [7 Diagnostics] menu for fault history and diagnostic data. List the exact causes and corrective actions from the manual.";
    } else if (vfdBrand === 'Danfoss' && vfdModel === 'VLT Midi Drive FC 280') {
        expertKnowledge = "Your analysis for this Danfoss VLT FC 280 fault/warning must be precise, based on its official programming guide. List the exact causes and corrective actions described in the manual for this specific alarm code. Differentiate between a Warning (W) and an Alarm (A).";
    } else if (vfdBrand === 'Danfoss' && vfdModel === 'VLT FC 302') {
        expertKnowledge = "Your analysis for this Danfoss VLT FC 302 fault/warning must be highly specific, based on its programming guide. Differentiate between a Warning (W) and an Alarm (A). List the exact causes and corrective actions from the manual. Reference relevant parameters from groups 14-** (Special Functions) or 1-** (Load/Motor) that may need to be checked.";
    } else if (vfdBrand === 'Mitsubishi Electric' && vfdModel === 'FR-E800') {
        expertKnowledge = "Your analysis for this Mitsubishi FR-E800 fault must be highly specific, based on its instruction manual. List the exact causes and corrective actions from the manual for this specific error code (e.g., E.OC1, E.OV1).";
    } else if (vfdBrand === 'Mitsubishi Electric' && vfdModel === 'FR-D700') {
        expertKnowledge = "Your analysis for this Mitsubishi FR-D700 fault must be highly specific, based on its instruction manual (IB-0600438). List the exact causes and corrective actions from the manual for this specific error code (e.g., E.OC1, E.UVT, E.THM).";
    } else if (vfdBrand === 'Eaton' && vfdModel === 'PowerXL DG1') {
        expertKnowledge = "Your analysis for this Eaton PowerXL DG1 fault must be highly specific, based on its instruction manual (MN040010). List the exact causes and corrective actions from the manual for this specific error code (e.g., E-01, E-02). Reference relevant parameters from Group P6 (Protection) that might be related.";
    }

    const prompt = `Act as a senior VFD troubleshooter. Analyze the following fault.
    VFD: ${vfdBrand} ${vfdModel}
    Fault Code: ${faultCode}
    Context: ${context}
    ${expertKnowledge}

    Provide an analysis in markdown that includes:
    1.  **Fault Name & Description:** The official name of the fault code for this model.
    2.  **Likely Causes:** A list of potential causes, ordered from most to least likely. Assign a probability percentage to each cause (e.g., "Loose power wiring (60%)"). The percentages should add up to 100%.
    3.  **Troubleshooting Steps:** A clear, numbered list of steps the technician should take to diagnose and resolve the issue.

    ${langInstruction}`;
    return callApiEndpoint('analyzeFaultCode', { prompt });
};

export const analyzeScanTime = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    const { language, code } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Analyze the following PLC code for scan time optimization.
    The code is from a general-purpose PLC, so focus on language-agnostic best practices.
    
    Code:
    \`\`\`
    ${code}
    \`\`\`

    Provide a markdown report with:
    1.  **Overall Assessment:** A brief summary of the code's structure and potential for optimization.
    2.  **Specific Recommendations:** A bulleted list of actionable suggestions to reduce scan time. For each suggestion, explain *why* it helps and provide a "before and after" code snippet if applicable. Examples: reducing complex math, avoiding unconditional jumps, optimizing loops.

    ${langInstruction}`;
    return callApiEndpoint('analyzeScanTime', { prompt });
};

export const generateEnergyEfficiencyPlan = async (params: { language: 'en' | 'es'; applicationType: string; loadProfile: string }): Promise<string> => {
    const { language, applicationType, loadProfile } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Create an energy efficiency plan using a VFD for the following application.
    Application Type: ${applicationType}
    Load Profile: ${loadProfile}

    Provide a markdown report with:
    1.  **Control Strategy:** Recommend the best V/Hz control mode (e.g., V/Hz linear, V/Hz squared for quadratic loads) and explain why.
    2.  **Parameter Recommendations:** Suggest specific VFD parameters to adjust for energy savings. Examples: Sleep mode, flux optimization, PID control for pressure/flow regulation. Explain what each parameter does.
    3.  **Expected Savings:** Give a qualitative estimate of the potential energy savings (e.g., "significant savings during periods of low demand").

    ${langInstruction}`;
    return callApiEndpoint('generateEnergyEfficiencyPlan', { prompt });
};

export const verifyCriticalLogic = async (params: { language: 'en' | 'es'; code: string; rules: string }): Promise<string> => {
    const { language, code, rules } = params;
    
    const disclaimer_en = `\n\n---\n**Disclaimer:** This tool is a design aid and does not replace the safety validation required by local and international standards. The final responsibility for the safety system rests with the qualified engineer.`;
    const disclaimer_es = `\n\n---\n**Descargo de Responsabilidad:** Esta herramienta es una ayuda para el diseño y no reemplaza la validación de seguridad requerida por las normativas locales e internacionales. La responsabilidad final del sistema de seguridad recae en el ingeniero calificado.`;
    const disclaimer = language === 'es' ? disclaimer_es : disclaimer_en;

    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    
    const prompt = `Act as an expert safety logic auditor. Your role is to analyze PLC code against a set of safety rules to identify potential vulnerabilities or deviations from best practices.

    *** CRUCIAL CONTEXT: FAIL-SAFE WIRING & LOGIC ***
    You MUST consider the standard industrial practice for safety circuits (fail-safe design).
    1.  **Physical Device:** Safety inputs like Emergency Stop buttons, gate switches, or safety mats are physically wired "Normally Closed" (NC).
    2.  **Electrical State:** In the normal, safe-to-run state (e.g., E-Stop NOT pressed), the NC contact is closed, allowing 24VDC to flow to the PLC input. The PLC sees this as a logical '1'.
    3.  **Action State:** When the safety device is activated (e.g., E-Stop IS pressed), the contact opens, the circuit is broken, and the PLC input sees 0VDC. The PLC sees this as a logical '0'.
    4.  **Fail-Safe:** A broken wire in the circuit has the same effect as activating the safety device (PLC input goes to '0'), causing a safe shutdown. This is the core reason for using NC contacts.
    5.  **PLC Instruction:** To correctly represent this in ladder logic, a programmer must use a "Normally Open" instruction (XIC, --| |--). This instruction is TRUE when the PLC input bit is '1' (i.e., when the physical NC E-Stop is NOT pressed). The logic reads as "If the E-Stop circuit is healthy and not activated...".
    6.  **INCORRECT LOGIC:** Using a "Normally Closed" instruction (XIO, --|/|--) for a physical NC safety device is a critical mistake. It inverts the logic and defeats the fail-safe principle. A broken wire would be seen as a "safe" condition by the logic.

    You will be given a piece of PLC code and a set of immutable safety rules.
    Your task is to analyze if the code appears to violate any of the rules under plausible conditions, PAYING SPECIAL ATTENTION to the fail-safe principles described above.

    Code:
    \`\`\`
    ${code}
    \`\`\`
    
    Immutable Rules:
    ${rules}

    Analyze the logic against the rules.
    - If the code appears to be sound and does not violate the rules, your response must start with the single character ✅ followed by a detailed explanation of why the logic is robust.
    - If the code could possibly violate a rule, your response must start with the single character ❌ followed by a "counterexample" or scenario that demonstrates how the violation can occur.
    - If you detect a violation of the fail-safe principle (e.g., an XIO on an E-Stop tag), you MUST treat it as a critical vulnerability and provide a counterexample explaining the danger (e.g., what happens if a wire breaks).
    Your explanation must be rigorous and logical.

    **IMPORTANT:** You MUST append the following disclaimer to the end of your entire response, exactly as written:
    ${disclaimer}
    
    ${langInstruction}`;
    return callApiEndpoint('verifyCriticalLogic', { prompt });
};

// FIX: Added missing exports for PLC logic validation, fixing, and translation.
export interface LogicIssue {
  line: number;
  type: 'Error' | 'Warning';
  message: string;
}

export const validatePlcLogic = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    const { language, code } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Act as a PLC logic validator. Analyze the provided text-based ladder logic for common errors, style violations, and potential race conditions.
    The logic format is simple: Instructions like XIC(tag), XIO(tag), OTE(tag). Branches are denoted by [ ].

    Code to analyze:
    \`\`\`
    ${code}
    \`\`\`

    Specifically look for:
    - **Errors:** Definite problems like duplicate outputs (OTE), unreachable code (dead code), or invalid instruction sequences.
    - **Warnings:** Inefficient patterns, overly complex rungs, and opportunities for simplification. For example, if you see several rungs with identical logic patterns but different tags (e.g., Motor1_Start, Motor2_Start), suggest using an array, a subroutine (Add-On Instruction), or a loop to reduce redundancy.
    - **Fail-Safe Violations (Critical Warning):** Standard safety practice dictates that physical stop devices (Emergency Stops, physical Stop buttons) are wired Normally Closed (NC). This means they provide a '1' signal to the PLC when not pressed. The correct way to represent this in logic is with a Normally Open instruction (XIC). If you find a Normally Closed instruction (XIO) used on a tag that implies a stop or safety function (e.g., 'E_Stop', 'Stop_Button', 'Safety_Gate'), this is a critical violation of the fail-safe principle. A broken wire would not be detected and would create an unsafe condition. Issue a "Warning" with a message explaining this specific risk. Example message: "The tag 'E_Stop' likely represents a physical NC button. Using an XIO instruction for it violates the fail-safe principle, as a broken wire would go undetected. It should be an XIC."

    Your response MUST be a valid JSON array of objects. Each object represents an issue and must have these keys:
    - "line": The 1-based line number where the issue was found.
    - "type": A string, either "Error" (for definite problems like duplicate outputs) or "Warning" (for style issues or potential problems).
    - "message": A clear, concise description of the issue.

    If there are no issues, return an empty JSON array: [].
    Do not add any explanation or text outside of the JSON array.
    
    Example of a response with issues:
    [
        {"line": 2, "type": "Error", "message": "OTE for 'Motor' is used on multiple rungs. This can cause unpredictable behavior."},
        {"line": 5, "type": "Warning", "message": "The logic for Motor1_Control, Motor2_Control, and Motor3_Control is identical. Consider using a subroutine or an Add-On Instruction (AOI) to simplify this repeated pattern."},
        {"line": 1, "type": "Warning", "message": "The tag 'E_Stop' likely represents a physical NC button. Using an XIO instruction for it violates the fail-safe principle, as a broken wire would go undetected. It should be an XIC."}
    ]

    ${langInstruction}`;

    const config = {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    line: {
                        type: Type.INTEGER,
                        description: 'The 1-based line number where the issue was found.',
                    },
                    type: {
                        type: Type.STRING,
                        description: 'Either "Error" or "Warning".',
                    },
                    message: {
                        type: Type.STRING,
                        description: 'A clear description of the issue.',
                    },
                },
                required: ['line', 'type', 'message']
            }
        }
    };

    return callApiEndpoint('validatePlcLogic', { prompt, config });
};

export const suggestPlcLogicFix = async (params: { language: 'en' | 'es'; code: string; issues: LogicIssue[] }): Promise<string> => {
    const { language, code, issues } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Act as an expert PLC programmer. You are given a piece of ladder logic (in text format) and a list of issues found in it.
    Your task is to rewrite the code to fix all the identified issues.

    Original Code:
    \`\`\`
    ${code}
    \`\`\`

    Identified Issues:
    ${JSON.stringify(issues, null, 2)}

    Please provide the corrected code.
    - Only output the corrected code block.
    - Do not include any explanations, apologies, or introductory sentences.
    - If you cannot fix an issue, leave it as is but add a comment in the code explaining the problem if possible.
    - Ensure the corrected code is in the same text-based format.

    ${langInstruction}`;
    return callApiEndpoint('suggestPlcLogicFix', { prompt });
};

export const translateLadderToText = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    const { language, code } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Act as a PLC code converter. You will be given PLC ladder logic as ASCII art.
    Your task is to convert it into a simple, line-by-line text format.

    Rules for conversion:
    - Each rung in the ASCII art becomes one line of text.
    - Normally Open contacts (-[ ]-) become XIC(tag_name).
    - Normally Closed contacts (-[/]-) become XIO(tag_name).
    - Output coils (-( )- or -(OTE)-) become OTE(tag_name).
    - Tag names are written directly above the ASCII instruction.
    - Parallel branches are represented by [ ]. For example, a branch containing two instructions would be [XIC(TagA) XIC(TagB)].
    - A seal-in branch with a single contact would be [XIC(Motor)].

    Example ASCII Art:
    \`\`\`
          Start        Stop         Motor
    |-----[ ]----------[/]----------( )----|
    |      |                            |
    |      +------[ ]------------------+
    |             Motor                 |
    \`\`\`

    Correct Text Output for the example:
    XIC(Start) XIO(Stop) [XIC(Motor)] OTE(Motor)

    IMPORTANT:
    - Only output the converted text code.
    - Do not include any other text, explanations, or markdown formatting.
    - If a tag name is unclear or missing, use "UNKNOWN_TAG".
    - Each rung from the source should be a new line in the output.

    ASCII Art to Convert:
    \`\`\`
    ${code}
    \`\`\`

    ${langInstruction}`;

    return callApiEndpoint('translateLadderToText', { prompt });
};