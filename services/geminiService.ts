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
import { vfdTerminalData } from '../constants/vfdTerminalData';

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
            if (params.contents) {
                request.contents = params.contents;
            } else {
                throw new Error('Request params must include a `contents` property.');
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

interface SensorRecommendationParams {
    language: 'en' | 'es';
    details: string;
}

export const generateChatResponse = async (messages: Message[], context: ChatContext): Promise<string> => {
    const langInstruction = context.language === 'es' ? 'Responde en español.' : 'Respond in English.';
    
    // The Gemini API expects a 'Content' array without the timestamp for chat history.
    // This maps the messages to the correct format, stripping the unnecessary property.
    const contents = messages.map(({ role, parts }) => ({
        role,
        parts,
    }));
    
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
                const softwareStr = context.plcSoftware && context.plcSoftware !== 'General' ? ` using ${context.plcSoftware}` : '';
                
                if (context.plcBrand === 'Siemens') {
                    expertKnowledge = `You are a world-leading expert on the Siemens automation ecosystem. Your knowledge is based on the "Programming Guideline for S7-1200/1500" (for TIA Portal) and the "Diagrama de funciones (FUP) para S7-300 y S7-400" manual (for classic STEP 7 V5.x). You MUST differentiate between these two platforms. For TIA Portal, you will apply modern principles: optimized blocks, symbolic addressing (e.g., "Start_Button" vs %I0.0), and IEC timers/counters. For classic STEP 7, you will use its specific conventions: absolute addressing (E, A, M), and classic S5 Timers (e.g., S_IMPULS, S_EVERZ).`;
                } else if (context.plcBrand === 'Allen-Bradley') {
                    expertKnowledge = `You have expert knowledge of the Rockwell Automation ecosystem, including Studio 5000, RSLogix 5000, and RSLogix 500. You are proficient with the tag-based structure of Logix controllers (ControlLogix, CompactLogix) and the file-based structure of older platforms (PLC-5, SLC 500). You understand Add-On Instructions (AOIs) and the use of mnemonics for text-based logic representation.`;
                }
                
                return `The user is working with a ${context.plcBrand} PLC${softwareStr}. ${expertKnowledge}`;
            }
        }
        return 'The user has not specified any particular hardware. Provide general advice, and be prepared to give more specific answers if the user provides context later in the conversation.';
    };

    const systemInstruction = `You are a world-class industrial automation expert specializing in ${context.topic}s.
    ${buildContextString()}
    Provide clear, concise, and technically accurate advice. Use markdown for code blocks, lists, and emphasis.
    When creating wiring diagrams as ASCII art, use box-drawing characters (like │, ─, ┌, └, ┐, ┘, ├, ┤, ┬, ┴, ┼) and ensure perfect alignment within markdown code blocks for clarity.
    
    *** LADDER LOGIC (LD) RULES ***
    IMPORTANT: Before providing a ladder logic solution, you MUST ask the user which PLC software they are using (e.g., 'Studio 5000' for Allen-Bradley, or 'TIA Portal for S7-1200/1500' vs 'STEP 7 v5.x for S7-300/400' for Siemens) if it has not already been specified. Your ladder logic style MUST conform to their selection based on the platform-specific guides below.

    --- START SIEMENS GUIDE ---
    When generating PLC ladder logic for Siemens TIA Portal, you MUST produce a three-part response. Your diagrams must be visually perfect and your logic must follow best practices as demonstrated in the MASTER EXAMPLE below.

    1.  **Pixel-Perfect Ladder Diagram (LAD):** Create flawlessly aligned ASCII art.
    2.  **Network Logic Description:** Explain each network's function in plain language.
    3.  **Instruction Details:** Explain any non-basic instructions (timers, counters, etc.).

    **CRITICAL ARCHITECTURE & LOGIC RULES (SIEMENS TIA PORTAL):**
    *   **Fail-Safe Stop Logic:** For a physical NC stop button, you **MUST** use a normally-open contact \`[ ]\` for fail-safe behavior. This is a critical safety rule.
    *   **Uniqueness of Output Control:** It is **STRICTLY FORBIDDEN** to use the same output coil tag \`( )\` on more than one network. This is a major error. Consolidate all logic for one output into a single network with parallel branches.
    *   **Seal-In Logic (Latch):** You **MUST** use a standard seal-in (latching) circuit with a single \`( )\` coil for start/stop logic. It is **STRICTLY FORBIDDEN** to use separate Set \`[S]\` and Reset \`[R]\` instructions for the same tag across different networks.
    *   **Code Reusability (DRY Principle):** It is **STRICTLY FORBIDDEN** to repeat identical logic patterns. For repeated tasks (e.g., motor control), you **MUST** encapsulate the logic in a reusable Function Block (FB). Your response must first define the FB's interface and internal logic, then show the simplified main logic calling the FB.
    *   **State Machines for Sequences:** For any sequential process, **YOU MUST** use a state machine pattern with an integer state register and MOVE instructions for transitions. Do not use chained seal-in networks.
    *   **Rung Completion (Syntax):** Every single network MUST terminate with a valid output-type instruction.
    *   **Jumps:** It is **STRICTLY FORBIDDEN** to generate any JMP (Jump) instructions.

    **MASTER EXAMPLE (SIEMENS TIA PORTAL):**
    \`\`\`
    (* Network 1: Fail-Safe E-Stop and Safety Permissive *)
    (* This network establishes the primary 'System_OK' bit. *)
    (* The E-Stop is a physical NC button, so a NO contact is used for fail-safe logic. *)
                    "E-Stop_Healthy"        "Safety_Gate_Closed"         "System_OK"
                       (%I0.0)                   (%I0.1)                    (%M10.0)
    |───────────────────[ ]───────────────────────[ ]───────────────────────( )──────|

    ---

    (* Network 2: Conveyor Motor 1 Control Logic (Instance of FB) *)
    (* This is a call to a reusable Function Block 'FB_Motor_Control'. *)
    |                                                                                |
    |  "Start_PB_1"                                                                  |
    |   (%I0.2)                                                                      |
    |─────[ ]──┐                                                                    |
    |          │                                                                    |
    | "Stop_PB_1"                                                         "Motor_1"  |
    |   (%I0.3)     "System_OK"              "FB_Motor_Control"             (%Q0.0)   |
    |─────[ ]──────────[ ]──────────┬──────────────────────────┐         ┌────────( )
    |                              │ i_Start           q_Motor├─────────┘
    |                              │ i_Stop                   │
    |                              │ i_Permissive_OK          │
    |                              └──────────────────────────┘
    |                                "Motor_Control_DB_1"
    |                                                                                |
    \`\`\`
    **Network Logic Description:**
    *   **Network 1:** This is the primary safety permissive rung. The output `"System_OK"` is only TRUE if the Emergency Stop circuit is healthy (not pressed) AND the safety gate is closed. This bit is used to enable all other motion.
    *   **Network 2:** This network controls the motor using an instance of a reusable Function Block (FB), \`FB_Motor_Control\`. This avoids duplicating logic. The start and stop pushbuttons are passed to the FB, which contains the internal seal-in logic. The motor only runs if `"System_OK"` from Network 1 is active.

    **Instruction Details & Reusable Blocks:**
    *   **FB_Motor_Control (Function Block Definition):** To follow the DRY (Don't Repeat Yourself) principle, you should create a reusable block for motor control.
        *   **Interface:**
            *   \`i_Start\` (Input, BOOL): Start command.
            *   \`i_Stop\` (Input, BOOL): Stop command.
            *   \`i_Permissive_OK\` (Input, BOOL): Global safety permissive.
            *   \`q_Motor\` (Output, BOOL): Motor run command.
        *   **Internal Logic (LAD inside the FB):**
            \`\`\`
                          i_Start             i_Stop         i_Permissive_OK     q_Motor
            |───┬───────────[ ]───────────┬─────[/]──────────────[ ]──────────────( )───|
            |   │                         │
            |   │         q_Motor         │
            |   └───────────[ ]───────────┘
            \`\`\`
    --- END SIEMENS GUIDE ---

    --- START ALLEN-BRADLEY GUIDE ---
    When generating PLC ladder logic for Allen-Bradley, you MUST produce a three-part response. Your diagrams must be visually perfect, your logic must follow best practices, and your mnemonic code MUST perfectly match the diagram.

    1.  **Pixel-Perfect Ladder Diagram:** Create flawlessly aligned ASCII art.
    2.  **Mnemonic Code:** Provide the corresponding Allen-Bradley mnemonic (text-based) representation.
    3.  **Instruction Details:** Explain any non-basic instructions (timers, counters, AOIs).
    
    **CRITICAL ARCHITECTURE & LOGIC RULES (ALLEN-BRADLEY):**
    *   **Fail-Safe Stop Logic:** For a physical NC stop button, you **MUST** use an XIC instruction \`[ ]\` for fail-safe behavior. This is a critical safety rule. Using an XIO \`[/]\` for a stop button is a major violation.
    *   **Uniqueness of Output Control:** It is **STRICTLY FORBIDDEN** to use the same output coil tag (OTE, OTL, OTU) on more than one rung. This is a major error. Consolidate all logic for one output into a single rung with parallel branches.
    *   **Seal-In Logic (Latch):** You **MUST** use a standard seal-in (latching) circuit with a single OTE instruction for start/stop logic. It is **STRICTLY FORBIDDEN** to use separate Latch \`[L]\` (OTL) and Unlatch \`[U]\` (OTU) instructions for the same tag on different rungs.
    *   **Code Reusability (DRY Principle):** It is **STRICTLY FORBIDDEN** to repeat identical logic patterns. For repeated tasks (e.g., motor control), you **MUST** encapsulate the logic in an Add-On Instruction (AOI). Your response must first define the AOI's parameters and internal logic, then show the simplified main logic calling the AOI.
    *   **State Machines for Sequences:** For any sequential process, **YOU MUST** use a state machine pattern with a DINT state register and MOV instructions for transitions. Do not use chained seal-in rungs.
    *   **Rung Completion (Syntax):** Every single rung MUST terminate with a valid output-type instruction.
    *   **Jumps:** It is **STRICTLY FORBIDDEN** to generate any JMP (Jump) instructions.
    *   **One-Shot (ONS) Usage:** Each \`ONS\` instruction requires its own unique BOOL tag for storage, like \`ONS(Storage_Bit)\`.

    **MASTER EXAMPLE (ALLEN-BRADLEY):**
    **1. Pixel-Perfect Ladder Diagram**
    \`\`\`
    // Rung 0: Safety Permissive
    // The E-Stop is a physical NC button, so an XIC is used for fail-safe logic.
                  E_Stop_Healthy        Safety_Gate_Closed           System_OK
    |───────────────────[ ]───────────────────────[ ]───────────────────────( )──────|
    
    ---
    
    // Rung 1: Motor Control (Call to AOI)
    // The Stop_PB is a physical NC button, so an XIC is used for fail-safe logic.
                                          System_OK
    |───┬──────────[ ]───────────┬───────────[ ]───\\[AOI_Motor_Control\\]────────────────|
    |   │         Start_PB        │                     "Motor1_Control"               |
    |   │                         │                  Start_Req    |   Motor_Cmd        |
    |   ├──────────[ ]───────────┤                  Stop_Req     |----------------( ) |
    |   │          Jog_PB         │                  Permissive_OK|                  Motor1
    |   │                         │                                                    |
    |   │                         │         Stop_PB                                    |
    |   └──────────[ ]───────────┴────────────────────────────────────────────────────|
    \`\`\`
    **2. Mnemonic Code**
    \`\`\`
    [Rung 0] XIC(E_Stop_Healthy) XIC(Safety_Gate_Closed) OTE(System_OK);
    [Rung 1] BST XIC(Start_PB) NXB XIC(Jog_PB) BND XIC(Stop_PB) XIC(System_OK) AOI_Motor_Control(Motor1_Control);
    \`\`\`
    **3. Instruction Details & Reusable Blocks**
    *   **AOI_Motor_Control (Add-On Instruction Definition):** 
        *   **Parameters:** \`Start_Req\`(Input, BOOL), \`Stop_Req\`(Input, BOOL), \`Permissive_OK\`(Input, BOOL), \`Motor_Cmd\`(Output, BOOL).
        *   **Internal Logic (inside the AOI):**
            \`\`\`
                           Start_Req            Stop_Req          Permissive_OK         Motor_Cmd
            |───┬──────────────[ ]───────────┬──────[/]──────────────[ ]──────────────( )───|
            |   │                            │
            |   │         Motor_Cmd          │
            |   └──────────────[ ]───────────┘
            \`\`\`
    --- END ALLEN-BRADLEY GUIDE ---
    
    *** STRUCTURED TEXT (ST) RULES ***
    When generating Structured Text (ST), you MUST follow these critical principles to produce robust, safe, and maintainable code. Your entire response containing ST MUST be a single, complete code block.

    1.  **Complete Declarations:** Every ST code block MUST begin with a complete \`VAR ... END_VAR\` block. You MUST declare all variables used in the logic.
    2.  **Proper Commenting:** All explanatory text within the code MUST be formatted as a proper ST comment: \`(* ... *)\` or \`//\`. **DO NOT** include unformatted text or markdown inside the code block.
    3.  **Fail-Safe Stop Logic:** A physical stop button (like an E-Stop) MUST be a Normally Closed (NC) contact. This means the PLC input is \`TRUE\` when the system is safe. In ST, this is checked with a condition like \`IF E_Stop_Healthy THEN ...\`.
    4.  **Consolidate Safety Conditions (DRY):** Create a single intermediate boolean variable (e.g., \`Safety_OK\`) at the beginning of your logic to represent the "permission to run".
    5.  **Separate Logic from Physical Outputs:** Use intermediate 'command' variables (e.g., \`Valve_A_Cmd\`). At the very end of the code, create a single \`(* --- OUTPUT MAPPING --- *)\` section to map these commands to physical outputs (\`DO_*\`), gated by safety: \`DO_Valve_A := Valve_A_Cmd AND Safety_OK;\`.
    6.  **Single Output Assignment:** A physical output variable (\`DO_*\`) MUST NEVER be assigned a value using \`:=\` in more than one place. Rule #5 enforces this.
    7.  **Correct Timer & Timeout Usage:** A timer instance (e.g., \`MyTimer(IN:=..., PT:=...);\`) must be called on **every scan**. The timer call itself **MUST NOT** be placed inside an \`IF\` or \`CASE\` statement.
    8.  **State Machines for Sequences:** For any sequential process, **YOU MUST** implement a state machine pattern using a single integer tag and a \`CASE\` statement. This is non-negotiable.
    9.  **Edge Detection:** For momentary buttons that trigger an action, you MUST use rising edge detection to prevent the action from re-triggering. Declare a \`Previous_...\` boolean variable for this purpose.
    10. **Explicit States (No Unintentional Latching):** Any \`IF\` statement that sets a variable to \`TRUE\` **MUST** have a corresponding \`ELSE\` clause that sets it to \`FALSE\`.

    **Correct ST Example with All Rules:**
    \`\`\`st
    (*
      PLC Program: Simple Mixer Control
      Description: This program controls a simple mixing sequence following best practices.
    *)
    VAR
        (* Inputs *)
        DI_Start_Button AT %I0.0 : BOOL;
        DI_Stop_Button AT %I0.1 : BOOL; // Assumed to be from a physical NC button circuit
        DI_EStop_Healthy AT %I0.2 : BOOL; // Assumed to be from a physical NC E-Stop circuit

        (* Outputs *)
        DO_Fill_Valve AT %Q0.0 : BOOL;
        DO_Mixer_Motor AT %Q0.1 : BOOL;
        
        (* Internal State & Timers *)
        Current_State : INT := 0; // 0:Idle, 10:Filling, 20:Mixing
        Safety_OK : BOOL;
        Mix_Timer : TON;

        (* Edge Detection Memory *)
        Previous_DI_Start_Button : BOOL;

        (* Intermediate Commands *)
        Fill_Valve_Cmd : BOOL;
        Mixer_Motor_Cmd : BOOL;
    END_VAR

    // --- 1. SAFETY & PERMISSIVES ---
    (* Rule 3 & 4: Consolidate all safety conditions into a single variable *)
    Safety_OK := DI_Stop_Button AND DI_EStop_Healthy;

    // --- 2. STATE MACHINE LOGIC (Rule 8) ---
    CASE Current_State OF
        0: // Idle State
            Fill_Valve_Cmd := FALSE;
            Mixer_Motor_Cmd := FALSE;
            
            (* Rule 9: Use rising edge detection for the start button *)
            IF DI_Start_Button AND NOT Previous_DI_Start_Button AND Safety_OK THEN
                Current_State := 10; // Transition to Filling
            END_IF;

        10: // Filling State
            Fill_Valve_Cmd := TRUE;
            Mixer_Motor_Cmd := FALSE;
            // This is a simple example; a real system would use a level sensor.
            IF Mix_Timer.Q THEN
                Current_State := 20; // Transition to Mixing
            END_IF;

        20: // Mixing State
            Fill_Valve_Cmd := FALSE;
            Mixer_Motor_Cmd := TRUE;
            IF Mix_Timer.Q THEN
                Current_State := 0; // Transition back to Idle
            END_IF;
    END_CASE;

    // --- 3. GLOBAL CONDITIONS & RESETS ---
    // Immediately return to idle if safety is lost at any point
    IF NOT Safety_OK THEN
        Current_State := 0;
    END_IF;

    // Rule 7: Timers are called every scan. Their IN condition handles start/reset.
    Mix_Timer(IN:=(Current_State = 10 OR Current_State = 20), PT:=T#5s, Q=>, ET=>);

    // Rule 9: Update edge detection memory at the end of logic, before outputs.
    Previous_DI_Start_Button := DI_Start_Button;

    // --- 4. OUTPUT MAPPING ---
    (* Rule 5 & 6: Map process commands to physical outputs in one place, gated by safety. *)
    DO_Fill_Valve := Fill_Valve_Cmd AND Safety_OK;
    DO_Mixer_Motor := Mixer_Motor_Cmd AND Safety_OK;
    \`\`\`
    ${langInstruction}`;

    return callApiEndpoint('generateChatResponse', { contents, config: { systemInstruction } });
};

export const generatePractice = async (params: PracticeParams): Promise<string> => {
    const { topic, difficulty, language, vfdBrand, vfdModel, plcBrand, plcSoftware, plcLanguage } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';

    // This combined guide will be used for both LD and ST practice problems.
    const combinedStyleGuide = `
    *** LADDER LOGIC (LD) RULES ***
    IMPORTANT: Your ladder logic style MUST conform to the platform-specific guides below.

    --- START SIEMENS GUIDE ---
    If generating for Siemens TIA Portal, you MUST produce a three-part response: 1. Pixel-Perfect ASCII Ladder Diagram, 2. Network Logic Description, 3. Instruction Details.
    
    **CRITICAL ARCHITECTURE & LOGIC RULES (SIEMENS TIA PORTAL):**
    *   **Fail-Safe Stop Logic:** For a physical NC stop button, you **MUST** use a normally-open contact \`[ ]\` for fail-safe behavior.
    *   **Uniqueness of Output Control:** It is **STRICTLY FORBIDDEN** to use the same output coil tag \`( )\` on more than one network.
    *   **Seal-In Logic (Latch):** You **MUST** use a standard seal-in (latching) circuit. It is **STRICTLY FORBIDDEN** to use separate Set \`[S]\` and Reset \`[R]\` instructions for the same tag across different networks.
    *   **Code Reusability (DRY Principle):** For repeated tasks, you **MUST** encapsulate the logic in a reusable Function Block (FB).
    *   **State Machines for Sequences:** For any sequential process, **YOU MUST** use a state machine pattern with an integer state register.
    *   **Jumps:** It is **STRICTLY FORBIDDEN** to generate any JMP (Jump) instructions.

    --- END SIEMENS GUIDE ---

    --- START ALLEN-BRADLEY GUIDE ---
    If generating for Allen-Bradley, you MUST produce a three-part response: 1. Pixel-Perfect ASCII Ladder Diagram, 2. Mnemonic Code, 3. Instruction Details.
    
    **CRITICAL ARCHITECTURE & LOGIC RULES (ALLEN-BRADLEY):**
    *   **Fail-Safe Stop Logic:** For a physical NC stop button, you **MUST** use an XIC instruction \`[ ]\` for fail-safe behavior. Using an XIO \`[/]\` for a stop button is a major violation.
    *   **Uniqueness of Output Control:** It is **STRICTLY FORBIDDEN** to use the same output coil tag (OTE, OTL, OTU) on more than one rung.
    *   **Seal-In Logic (Latch):** You **MUST** use a standard seal-in circuit with a single OTE. It is **STRICTLY FORBIDDEN** to use separate Latch \`[L]\` (OTL) and Unlatch \`[U]\` (OTU) instructions for the same tag.
    *   **Code Reusability (DRY Principle):** For repeated tasks, you **MUST** encapsulate the logic in an Add-On Instruction (AOI).
    *   **State Machines for Sequences:** For any sequential process, **YOU MUST** use a state machine pattern with a DINT state register.
    *   **Jumps:** It is **STRICTLY FORBIDDEN** to generate any JMP (Jump) instructions.

    --- END ALLEN-BRADLEY GUIDE ---

    *** STRUCTURED TEXT (ST) RULES ***
    When generating Structured Text (ST), you MUST follow these critical principles to produce robust, safe, and maintainable code. Your entire response containing ST MUST be a single, complete code block.

    1.  **Complete Declarations:** Every ST code block MUST begin with a complete \`VAR ... END_VAR\` block.
    2.  **Proper Commenting:** All explanatory text MUST be formatted as a proper ST comment: \`(* ... *)\` or \`//\`.
    3.  **Fail-Safe Stop Logic:** A physical NC stop button's input is \`TRUE\` when safe. Check with \`IF E_Stop_Healthy THEN ...\`.
    4.  **Consolidate Safety Conditions (DRY):** Create a single intermediate boolean variable (e.g., \`Safety_OK\`).
    5.  **Separate Logic from Physical Outputs:** Use intermediate 'command' variables (e.g., \`Valve_Cmd\`). At the end, map commands to physical outputs (\`DO_*\`), gated by safety: \`DO_Valve := Valve_Cmd AND Safety_OK;\`.
    6.  **Single Output Assignment:** A physical output variable (\`DO_*\`) MUST NEVER be assigned a value using \`:=\` in more than one place.
    7.  **Correct Timer Usage:** A timer instance (e.g., \`MyTimer(IN:=...)\`) must be called on **every scan** and **MUST NOT** be placed inside an \`IF\` or \`CASE\` statement.
    8.  **State Machines for Sequences:** For any sequential process, **YOU MUST** implement a state machine pattern using a single integer tag and a \`CASE\` statement.
    9.  **Edge Detection:** For momentary buttons, you MUST use rising edge detection.
    10. **Explicit States (No Unintentional Latching):** Any \`IF\` statement that sets a variable to \`TRUE\` **MUST** have a corresponding \`ELSE\` clause that sets it to \`FALSE\`.
    `;


    const prompt = `Generate a practice problem for an industrial automation technician.
    Topic: ${topic}
    Difficulty: ${difficulty}
    ${topic === 'VFD' ? `Specific VFD: ${vfdBrand} ${vfdModel}` : ''}
    ${topic === 'PLC' ? `Specific PLC: ${plcBrand} with ${plcSoftware}` : ''}
    ${topic === 'PLC' && plcBrand === 'Siemens' ? `When generating a Siemens problem, strongly consider using the LOGO! logic module for beginner/intermediate tasks, as it is a common platform for learning basic automation concepts based on function blocks.` : ''}
    ${topic === 'PLC' ? `PLC Programming Language: ${plcLanguage}` : ''}
    
    The output must be in markdown and follow this structure exactly:
    ### Problem
    [A clear and detailed description of the problem scenario]
    
    ### Solution
    [A step-by-step solution to the problem, including code snippets, parameter settings, or wiring instructions as needed.]

    *** IMPORTANT STYLE GUIDE FOR ALL PLC LOGIC ***
    ${combinedStyleGuide}

    ${langInstruction}`;

    return callApiEndpoint('generatePractice', { contents: prompt });
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

    return callApiEndpoint('generateWiringGuide', { contents: prompt });
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
    return callApiEndpoint('generateCommissioningPlan', { contents: prompt });
};

export const generateCommissioningChatResponse = async (messages: Message[], language: 'en' | 'es', vfdBrand?: string, vfdModel?: string, application?: string): Promise<string> => {
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    
    // The Gemini API expects a 'Content' array without the timestamp for chat history.
    const contents = messages.map(({ role, parts }) => ({
        role,
        parts,
    }));
    
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
    } else if (vfdBrand === 'Siemens' && vfdModel === 'Micromaster 440') {
        expertKnowledge = `For the Siemens Micromaster 440, you MUST guide the user through the Quick Commissioning parameters. Start by instructing them to set parameter P0010 to 1. After they confirm, ask for motor nameplate data for the following parameters, one by one: P0304 (Motor Voltage), P0305 (Motor Current), P0307 (Motor Power in kW), P0310 (Motor Frequency), and P0311 (Motor Speed). After collecting motor data, guide them through setting basic operational parameters like P1082 (Max Frequency), P1120 (Accel Time), and P1121 (Decel Time). Example: "First, let's start Quick Commissioning. Using the BOP or AOP, navigate to parameter P0010 and set it to 1. Let me know when you have done this."`;
    } else if (vfdBrand === 'Siemens' && vfdModel?.includes('Sinamics G120')) {
        expertKnowledge = `For the Siemens Sinamics G120/G120C, you MUST guide the user through the basic commissioning using the BOP or I-OP. Start by instructing them to set parameter P0010 to 1 (Quick commissioning). Then, guide them through the essential motor data parameters one-by-one: P0304 (Motor Voltage), P0305 (Motor Current), P0307 (Motor Power), P0310 (Motor Frequency), and P0311 (Motor Speed). After motor data, instruct them to set P1300 (Control Mode - typically 20 for Vector Speed Control) and then run the motor data identification (P1900=1). Example: "First, let's start the basic commissioning. Navigate to parameter P0010 and set it to 1. This enables the quick commissioning menu. Let me know when this is done."`;
    }

    let terminalInfo = '';
    if (vfdModel && vfdTerminalData[vfdModel]) {
        const diagramData = vfdTerminalData[vfdModel];
        const terminals = diagramData.blocks.flatMap(block => block.terminals);
        
        terminalInfo = `
        You have the following terminal data for the ${vfdModel}. You MUST use this information when answering questions about wiring.

        *** TERMINAL DATA FOR ${vfdModel} ***
        ${terminals.map(t => `- Terminal ID: "${t.id}", Label: "${t.label}", Function: "${t.function || 'N/A'}", Description: "${t.description || 'N/A'}"`).join('\n')}
        `;
    }

    const systemInstruction = `You are a VFD commissioning expert, acting as an interactive, safety-conscious guide.
    The user is commissioning a ${vfdBrand} ${vfdModel} for a specific application: "${application}".
    Your role is to guide them step-by-step. Keep responses concise. Ask questions to confirm steps are complete.

    *** EXPERT KNOWLEDGE ***
    ${expertKnowledge}
    
    ${terminalInfo}

    *** SAFETY FIRST - MOST IMPORTANT RULE ***
    Your VERY FIRST response in this conversation MUST be a detailed safety checklist. DO NOT provide any other information until the safety check is presented.
    The safety checklist must include:
    - Verifying main power is disconnected and Locked-Out/Tagged-Out (LOTO).
    - Using a multimeter to confirm 0 volts on input terminals (L1, L2, L3).
    - Wearing appropriate Personal Protective Equipment (PPE).
    - Ensuring the motor shaft is free to rotate and disconnected from the load for initial tests.
    After presenting the checklist, ask the user to confirm they have completed these steps before proceeding.

    *** WIRING AND DIAGRAMS ***
    When discussing wiring, reference specific terminal numbers for the ${vfdModel}. You MUST use the terminal data provided above. Be precise with both the Label (e.g., "DI1") and the terminal ID/number (e.g., "13").
    **Crucially, if your response involves specific terminals on a wiring diagram, you must append a JSON object to the end of your text response.**
    The JSON object must have a key "diagram_terminals" which is an array of strings, where each string is the ID of a terminal to highlight (e.g., ["STF", "STR", "SD"]).
    The terminal IDs must match the ones provided in the application's diagram data. Do not invent terminal IDs.
    Example response format:
    "Great, next connect the start signal to terminal DI1 (pin 13) and common to terminal DCOM (pin 12).
    {"diagram_terminals": ["13", "12"]}"

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
        contents, 
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
    } else if (vfdBrand === 'Siemens' && vfdModel === 'Micromaster 440') {
        expertKnowledge = "Your analysis for this Siemens Micromaster 440 fault must be highly specific, based on its official manual. List the exact causes and corrective actions for this fault code (e.g., F0001, F0002, F0003, F0004). Reference relevant parameters like P1120 (Accel time), P1121 (Decel time), or motor data parameters (P03xx) that may need to be checked.";
    } else if (vfdBrand === 'Siemens' && vfdModel?.includes('Sinamics G120')) {
        expertKnowledge = `Your analysis for this Siemens Sinamics G120 fault must be highly specific, based on its official list manual. List the exact causes and corrective actions for this fault code (e.g., F07801, F30002). Reference relevant parameters like P1120/P1121 (Ramp times) or motor data parameters (P03xx) that may need to be checked.`;
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
    return callApiEndpoint('analyzeFaultCode', { contents: prompt });
};

// FIX: Add missing analyzeAsciiFrame function to be exported.
export const analyzeAsciiFrame = async (params: { language: 'en' | 'es'; frame: string }): Promise<string> => {
    const { language, frame } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Act as a serial protocol analyzer. The user has provided an ASCII frame. Your task is to analyze it and provide a detailed breakdown.

    - Identify and explain any non-printable control characters represented by tags (e.g., <STX>, <CR>, <LF>).
    - Describe the purpose of the data payload.
    - Provide the full hexadecimal representation of the entire frame.

    Frame to Analyze:
    \`\`\`
    ${frame}
    \`\`\`

    Present the output as a markdown report.

    ${langInstruction}`;
    return callApiEndpoint('analyzeAsciiFrame', { contents: prompt });
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
    return callApiEndpoint('analyzeScanTime', { contents: prompt });
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
    return callApiEndpoint('generateEnergyEfficiencyPlan', { contents: prompt });
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
    return callApiEndpoint('verifyCriticalLogic', { contents: prompt });
};

export const generateSensorRecommendation = async (params: SensorRecommendationParams): Promise<string> => {
    const { language, details } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';

    const structure_es = `
Tu respuesta DEBE estar en markdown y seguir esta estructura exacta:

### Recomendación Principal
**Tecnología Recomendada:** [Nombre de la tecnología principal, ej. "Radar de Onda Guiada"]
**Justificación:** [Un párrafo explicando por qué es la mejor opción basada en los datos del formulario. Haz referencia a detalles específicos.]

### Tabla Comparativa de Alternativas
[Crea una tabla markdown que califique la opción principal y 1-2 alternativas en estos criterios clave: | Tecnología | Precisión | Costo | Robustez | Facilidad de Instalación |. Usa una escala de 1-5 estrellas (ej. ***** para excelente, * para pobre).]

### Modelos y Marcas Sugeridas
**Modelos Sugeridos:** [Sugiere series o modelos específicos de fabricantes líderes. Ej: "Endress+Hauser Micropilot FMRxx, VEGAFLEX 8x, Krohne Optiflex."]
**Disclaimer:** [Incluye este texto exacto: "Estas son sugerencias basadas en aplicaciones típicas. Siempre verifique la ficha técnica del fabricante."]

### Consideraciones Críticas de Instalación
[Proporciona 2-3 puntos con consejos de experto para la tecnología recomendada.]

### ⚠️ Advertencia Crítica de Estándares y Cableado
[SI Y SOLO SI la variable es Temperatura y la recomendación es un termopar, llena esta sección. Explica el código de colores correcto (ANSI o IEC) basado en la región y advierte sobre la polaridad.]

### Guía Rápida de Implementación
[Proporciona un fragmento de código de ejemplo en Texto Estructurado (ST) para Rockwell/Studio 5000 para escalar una señal analógica, como se muestra a continuación.]

\`\`\`st
// Parámetros de Escalado para una señal 4-20mA
// Asume que el rango del sensor corresponde a 0-100% del rango de medición.
RawMin := 4000;    // Valor crudo a 4mA (formato Rockwell)
RawMax := 20000;   // Valor crudo a 20mA (formato Rockwell)
EngMin := 0.0;     // Unidades de ingeniería al 0%
EngMax := 100.0;   // Unidades de ingeniería al 100%

// Ejecutar instrucción de escalado (SCP)
SCP(MyAnalogInput, RawMin, RawMax, EngMin, EngMax, MyScaledValue);
\`\`\`
    `;

    const structure_en = `
Your response MUST be in markdown and follow this exact structure:

### Top Choice Recommendation
**Recommended Technology:** [Name of the top choice technology, e.g., "Guided Wave Radar"]
**Justification:** [A paragraph explaining why this is the best option based on the wizard data. Reference specific details.]

### Comparative Table of Alternatives
[Create a markdown table that rates the top choice and 1-2 alternatives on these key criteria: | Technology | Precision | Cost | Robustness | Ease of Installation |. Use a 1-5 star rating (e.g., ***** for excellent, * for poor).]

### Suggested Models and Brands
**Suggested Models:** [Suggest specific series or models from leading manufacturers. E.g., "Endress+Hauser Micropilot FMRxx, VEGAFLEX 8x, Krohne Optiflex."]
**Disclaimer:** [Include this exact text: "These are suggestions based on typical applications. Always verify the manufacturer's data sheet."]

### Critical Installation Considerations
[Provide 2-3 bullet points with expert tips for the recommended technology.]

### ⚠️ Critical Standards & Wiring Warning
[IF AND ONLY IF the variable is Temperature and the recommendation is a thermocouple, fill this section. Explain the correct color code (ANSI or IEC) based on the region and warn about polarity.]

### Quick Implementation Guide
[Provide a sample PLC code snippet in Structured Text (ST) for Rockwell/Studio 5000 for scaling an analog signal, as shown below.]

\`\`\`st
// Scaling Parameters for a 4-20mA signal
// Assumes sensor range corresponds to 0-100% of the measurement range.
RawMin := 4000;    // Raw value at 4mA (Rockwell format)
RawMax := 20000;   // Raw value at 20mA (Rockwell format)
EngMin := 0.0;     // Engineering units at 0%
EngMax := 100.0;   // Engineering units at 100%

// Execute Scale instruction (SCP)
SCP(MyAnalogInput, RawMin, RawMax, EngMin, EngMax, MyScaledValue);
\`\`\`
    `;

    const structure = language === 'es' ? structure_es : structure_en;
    
    const systemInstruction = `You are a world-class instrumentation and process engineer, synthesizing the expertise from three key texts: Antonio Creus's "Instrumentación Industrial, 8th Edition," Carl Branan's "The Process Engineer's Pocket Handbook," and the VEGA catalog "Tecnología de medición de nivel y presión para el tratamiento de aguas residuales." Your recommendations must be grounded in the detailed technical comparisons from Creus, the practical process considerations from Branan, and the specific application examples from the VEGA catalog.

Your main task is to analyze user-provided application details and give an expert-level sensor recommendation.

When generating the response, you MUST adhere to these principles:
1.  **Synthesize Knowledge:** Your justification must be robust. Ground your choice in the instrumentation principles from Creus. Support it with process-level insights from Branan. If the application is related to wastewater, water, or similar public works, you MUST also incorporate the specific application knowledge and model series (e.g., VEGAPULS C 21, VEGABAR 82) from the VEGA catalog as prime examples.
2.  **Comparative Analysis (Creus):** The alternatives you present must be legitimate contenders. The star ratings in your comparative table must reflect the nuanced trade-offs between technologies as detailed in "Instrumentación Industrial".
3.  **Installation & Practicality (Creus & Branan & VEGA):** Your installation considerations must be practical. Mention instrumentation-specific points from Creus (e.g., need for straight pipe runs), process piping rules of thumb from Branan (e.g., pressure drop considerations), and if relevant (like a pumping station or clarifier), mention any specific installation benefits highlighted in the VEGA document (e.g., non-contact measurement to avoid fouling).
4.  **Technology & Process Depth (Combined):** Demonstrate a deep understanding of sensor principles from Creus, connect them to the user's project priorities (Cost, Precision, Robustness), and contextualize them with real-world examples from Branan's handbook and the VEGA catalog.

*** STANDARDS & DIRECTIVES (CRITICAL) ***
1.  **Standard Override:** If the user provides an "Estándar de Termopar Específico", you MUST use that standard for the wiring warning, ignoring the "País/Región de Instalación" field for color code selection. If this field is not present or is "Autodetect", proceed with the geographic context logic below.
2.  **Geographic Context:** You must use the "País/Región de Instalación" field to determine the predominant instrumentation standard for thermocouples. This is your primary directive for color codes.
    *   **North America Region (e.g., Mexico, USA, Canada):** Assume **ANSI MC96.1**.
    *   **Japan Region (e.g., Japón, Japan):** Assume **JIS C 1602**.
    *   **Germany Region (e.g., Alemania, Germany):** Assume the current standard is **IEC 60584**, but be aware of the legacy **DIN 43710** standard.
    *   **Other Regions (Europe, Asia, South America, etc.):** Default to **IEC 60584**.
3.  **Thermocouple Wiring Warning (IF Variable is Temperature):** If your recommendation includes a thermocouple, you MUST include the "⚠️ Advertencia Crítica de Estándares y Cableado" section and provide the correct color code based on the geographic context.
    *   **ANSI MC96.1:** State that the rule is **RED is NEGATIVE (-)**. For a Type K, explicitly mention "Yellow is Positive (+), Red is Negative (-)".
    *   **IEC 60584:** For a Type K, explicitly state: "**GREEN is POSITIVE (+)** and **WHITE is NEGATIVE (-)**. CAUTION! This is the opposite of the ANSI standard."
    *   **JIS C 1602:** For a Type K, explicitly state: "**RED is POSITIVE (+)** and **WHITE is NEGATIVE (-)**. CAUTION! This is different from both ANSI and IEC standards."
    *   **Germany Context:** State the current **IEC 60584** standard first. Then, add a warning: "Be aware that older installations in Germany may use the legacy **DIN 43710** standard. For a Type K under DIN, the color code is Red (+) and Green (-). Always verify the standard used in your specific facility to avoid miswiring."
4.  **Classified Area Validation:** The "Modelos y Marcas Sugeridas" MUST match the requested "Clasificación de Área". This is a separate concept from thermocouple standards. Do not confuse them.
    *   If "Clase/División" is requested, you must suggest models with **FM, UL, or CSA** approval (e.g., "Cl I, Div 1").
    *   If "ATEX/IECEx" is requested, you must suggest models with **ATEX/IECEx** approval (e.g., "Ex ia IIC T4 Ga").
    *   If you detect a conflict (e.g., user is in "Mexico" but requests "ATEX"), you must mention it in your justification: "ATEX models are suggested as requested, though the predominant standard in Mexico is Class/Division. Please verify your plant's specific standards."
`;
    
    const prompt = `--- APPLICATION DETAILS ---
${details}
--- END OF DETAILS ---

Now, generate the response following the exact markdown structure provided below.
${structure}
    
${langInstruction}`;
    
    return callApiEndpoint('generateSensorRecommendation', { contents: prompt, config: { systemInstruction } });
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
    The logic format is simple: Instructions like XIC(tag), XIO(tag), OTE(tag), OTL(tag) / OTU(tag) or S(tag) / R(tag) for Siemens. Branches are denoted by [ ].

    Code to analyze:
    \`\`\`
    ${code}
    \`\`\`

    Specifically look for:
    - **Errors:** 
        - **Duplicate Outputs:** Definite problems like duplicate outputs (OTE) which cause "rung-fighting".
        - **Incomplete Rung:** A line of logic that contains conditional instructions (like XIC, XIO) but does not end with an output instruction (like OTE, MOV, TON, etc.) is a syntax error.
    - **Architectural Warnings:**
        - **State Machine Recommendation:** If you detect multiple, chained seal-in rungs that seem to represent a sequence (e.g., tags named Fill_Request, Mix_Request, Drain_Request), issue a warning. The message should state: "The use of multiple chained seal-in rungs for a sequence is fragile. Consider refactoring to a state machine using a single integer tag for better scalability and clarity."
        - **Redundancy:** If you see several rungs with identical logic patterns but different tags (e.g., Motor1_Start, Motor2_Start), issue a warning with the message: "The logic patterns in these rungs are very similar. Consider using an Add-On Instruction (AOI), a subroutine, or an array-based approach to reduce redundancy and improve maintainability."
    - **Critical Logic Warnings:**
        - **Fail-Safe Violation:** Standard safety practice dictates that physical stop devices (E-Stops) are wired Normally Closed (NC). The correct way to represent this in logic is with a Normally Open instruction (XIC). If you find a Normally Closed instruction (XIO) used on a tag that implies a stop or safety function (e.g., 'E_Stop', 'Stop_Button'), this is a critical violation of the fail-safe principle. Issue a "Warning" with a message explaining this specific risk: "The tag 'E_Stop' likely represents a physical NC button. Using an XIO instruction for it violates the fail-safe principle, as a broken wire would go undetected. It should be an XIC."
        - **Set/Reset Race Condition:** Identify the use of separate latch/set (OTL, S) and unlatch/reset (OTU, R) instructions for the same tag across different rungs. This is a critical warning because it creates a race condition dependent on scan order. The message should strongly recommend consolidating the logic into a single, standard seal-in rung using a regular OTE.

    Your response MUST be a valid JSON array of objects. Each object represents an issue and must have these keys:
    - "line": The 1-based line number where the issue was found.
    - "type": A string, either "Error" (for definite problems like duplicate outputs) or "Warning" (for style issues or potential problems).
    - "message": A clear, concise description of the issue.

    If there are no issues, return an empty JSON array: [].
    Do not add any explanation or text outside of the JSON array.
    
    Example of a response with issues:
    [
        {"line": 2, "type": "Error", "message": "OTE for 'Motor' is used on multiple rungs. This can cause unpredictable behavior ('rung-fighting')."},
        {"line": 12, "type": "Error", "message": "The rung in this line is incomplete and is missing an output instruction (e.g., OTE, MOV, RES)."},
        {"line": 5, "type": "Warning", "message": "The logic patterns for Motor1_Control and Motor2_Control are similar. Consider using a subroutine or an Add-On Instruction (AOI) to simplify this repeated pattern."},
        {"line": 1, "type": "Warning", "message": "The tag 'E_Stop' likely represents a physical NC button. Using an XIO instruction for it violates the fail-safe principle, as a broken wire would go undetected. It should be an XIC."},
        {"line": 10, "type": "Warning", "message": "The use of separate Latch (OTL) and Unlatch (OTU) instructions for 'Valve_Open' can lead to a race condition. It is recommended to consolidate this into a single seal-in rung."},
        {"line": 15, "type": "Warning", "message": "The use of multiple chained seal-in rungs for a sequence is fragile. Consider refactoring to a state machine using a single integer tag for better scalability and clarity."}
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

    return callApiEndpoint('validatePlcLogic', { contents: prompt, config });
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
    - **IMPORTANT:** If an issue suggests refactoring to a state machine, you MUST perform this refactoring. Replace the chained seal-in rungs with a proper state machine using a single integer tag (e.g., 'Sequence_Step') and explicit state transitions.

    ${langInstruction}`;
    return callApiEndpoint('suggestPlcLogicFix', { contents: prompt });
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

    return callApiEndpoint('translateLadderToText', { contents: prompt });
};

export const getNetworkHardwarePlan = async (params: { language: 'en' | 'es'; protocols: string[] }): Promise<string> => {
    const { language, protocols } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `You are a senior industrial network architect. Your expertise covers Profinet, EtherNet/IP, Modbus TCP, and serial protocols. The user wants to interconnect devices that use the following protocols.
    
    Protocols to connect:
    ${protocols.join(', ')}

    Provide a markdown report with the following detailed sections:

    1.  **Compatibility Analysis:** Determine if the protocols can communicate directly. Clearly state any mismatches and explain *why* they are incompatible (e.g., "Although both use Ethernet cables, Profinet and EtherNet/IP are fundamentally different Layer 7 application protocols.").
    2.  **Hardware Solution & Topology:**
        *   Recommend a specific type of gateway if needed (e.g., "Profinet to EtherNet/IP gateway") and give an example model series (e.g., "Anybus Communicator", "Prosoft Technology Gateway").
        *   Recommend necessary networking hardware like industrial managed Ethernet switches (e.g., "Stratix 5700", "Scalance XB205") and explain why they are recommended (e.g., support for QoS, IGMP Snooping, LLDP).
        *   Provide a simple ASCII-art block diagram showing the network topology, including PLCs, switches, gateways, and end devices.
    3.  **Key Considerations:** Provide a bulleted list of critical points for the integrator, such as:
        *   **Latency:** Mention that gateways introduce small delays and may not be suitable for high-speed motion control.
        *   **Configuration:** Explain that gateways require manual data mapping between protocols.
        *   **Cabling:** Specify appropriate cabling (e.g., "Use shielded Cat5e or Cat6 Ethernet cables for industrial environments.").

    ${langInstruction}`;
    return callApiEndpoint('getNetworkHardwarePlan', { contents: prompt });
};
