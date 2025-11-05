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

interface SensorRecommendationParams {
    language: 'en' | 'es';
    details: string;
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
            // FIX: Replaced potentially problematic '1-**' placeholders with '1-xx' to prevent any possibility of the parser misinterpreting it as an arithmetic operation.
            expertKnowledge = "You have expert-level knowledge of the Danfoss VLT AutomationDrive FC 302. When discussing this model, refer to its matrix-style parameter groups (e.g., 1-xx Load/Motor, 3-xx Reference/Ramps, 5-xx Digital I/O, 14-xx Special Functions). Be familiar with its graphical LCP (Local Control Panel) menu structure, including the Main Menu and Quick Menu. Terminal 37 is the Safe Torque Off (STO) input.";
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

    const buildLadderLogicStyleGuide = () => {
        // SIEMENS TIA PORTAL / STEP 7 STYLE
        if (context.plcBrand === 'Siemens') {
            // TIA Portal Style Guide
            if (context.plcSoftware === 'TIA Portal') {
                return `
                When generating PLC ladder logic diagrams for Siemens TIA Portal, you MUST adhere to the following strict four-part format for maximum clarity, with each part clearly labeled using markdown bold headers.

                1.  **Ladder Logic Visual Guide:** At the very beginning of your ladder logic response, you MUST provide this small legend to help users understand the symbols.
                    *   \`[ ]\` - Normally Open Contact
                    *   \`[/]\` - Normally Closed Contact
                    *   \`( )\` - Output Coil
                    *   \`|---\` - Wire/Rail
                    *   A branch is used for OR logic.

                2.  **Annotated Ladder Diagram (LAD) for TIA Portal:** You must create flawlessly aligned ASCII art that perfectly mimics a real PLC editor. Adherence to the following character and alignment rules is **non-negotiable and must be followed with pixel-perfect precision.**
                    *   **Network Comment (NEW):** Each network MUST be preceded by a single-line comment on its own line, explaining its purpose. The comment should be in the format: \`// Network X: Description of logic.\`
                    *   **Characters:** Use \`|\` for power rails and **ONLY** \`─\` (U+2500) for all horizontal wire segments. **Never use hyphens (-), plus signs (+), or underscores (_).**
                    *   **Rung Structure:** A complete network MUST have a left power rail \`|\`, a logic section, and a right power rail \`|\`.
                    *   **Instruction Spacing:** A standard 3-character instruction (e.g., \`[ ]\`, \`( )\`) MUST be padded by **exactly three \`─\` characters on each side**: \`───[ ]───\`. Wider instructions (e.g., \`[TON]\`) must also be padded with three \`─\` characters on each side: \`───[TON]───\`. This 3-character padding is a strict rule.
                    *   **Instructions:**
                        *   Normally Open Contact: \`[ ]\`
                        *   Normally Closed Contact: \`[/]\`
                        *   Output Coil: \`( )\`
                        *   Function Blocks (Timers, Counters): \`[TON]\`, \`[CTU]\`.
                    *   **Precise Tag Alignment:** Tag names (symbolic in quotes, absolute in parentheses) MUST be perfectly centered on separate lines above their instruction. Parameter lines must be centered below the instruction.
                    *   **Perfect Branching:** Use branches for OR logic. Branch alignment must be perfect.
                        *   **Start/End:** A parallel branch MUST start from the main line with \`┬\` and rejoin the main line with \`┘\`.
                        *   **Vertical Lines:** The vertical segments of a branch MUST use the \`│\` character. All \`│\` characters in a single vertical segment must be in the same column, creating a perfectly straight vertical line.
                        *   **Branching Off a Branch:** To add another parallel path from an existing vertical branch line, use \`├\`. The last parallel path in a group MUST join the vertical line with \`└\`.
                        *   **Alignment is Critical:** The character directly above a \`│\` must be \`┬\` or \`├\`. The character directly below the last \`│\` must be \`└\` or \`┘\`. There must be no character gaps or misalignments. The horizontal segments (\`─\`) must extend from the main rung to the vertical branch characters (\`┬\`, \`├\`, \`└\`, \`┘\`).

                3.  **Network Logic Description:** Below the diagram, describe the network's function in plain language. **Do not provide Allen-Bradley mnemonics.**

                4.  **Instruction Details:** For any non-basic instructions (timers, counters), provide a bulleted list explaining their parameters (Instance DB, IN, PT, Q, etc.).

                **CRITICAL ARCHITECTURE & LOGIC RULES:**
                *   **Rung Completion (Syntax):** Every single rung/network MUST terminate with a valid output-type instruction (e.g., \`( )\`, \`[MOV]\`, \`[TON]\`). A rung that ends with only conditions is a syntax error and is strictly forbidden.
                *   **State Machines for Sequences:** For any sequential process (e.g., Fill -> Mix -> Drain), **YOU MUST** implement a state machine pattern. **DO NOT** use multiple chained seal-in/latching rungs. Use a single integer tag (e.g., a DINT named "Sequence_Step") as the state register. Use equality comparison instructions to enable the logic for each step, and use MOVE instructions to transition to the next step. This is non-negotiable for creating robust, scalable logic.
                *   **Duplicate Outputs:** **NEVER** use the same output coil instruction (e.g., \`( )\` with tag \`"Motor"\`) on more than one network. This causes unpredictable "rung-fighting" and is a critical programming error.
                *   **Latching Logic (Seal-In vs. Set/Reset):** Using separate Set \`[S]\` and Reset \`[R]\` instructions for the same tag is **STRICTLY FORBIDDEN**. This creates a scan-order dependency and can lead to unpredictable behavior. **ALWAYS** use a standard "seal-in" circuit with a single output coil \`( )\` for latching logic. The reset/stop condition must be in series before the coil to ensure it has priority.
                *   **Fail-Safe Stop Logic:** A physical stop button MUST be a Normally Closed (NC) contact for fail-safe wiring. For a **permissive run condition**, this NC contact is represented in ladder logic by a Normally Open instruction \`[ ]\`. This is the correct and safe way to ensure that a broken wire will stop the machine. To **trigger** an action (like a reset) when the NC button is **pressed**, you must use a Normally Closed instruction \`[/]\`.
                *   **Code Reusability (DRY Principle - FB/FC):** You MUST avoid repeating identical or very similar logic patterns. If a pattern is used for multiple devices (e.g., Motor1_Control, Motor2_Control), you MUST encapsulate it in a reusable block. For Siemens TIA Portal, this means creating a Function Block (FB) or a Function (FC). Provide a clear example of the FB/FC definition and then show how it is called for each device. This is a non-negotiable rule to reduce redundancy and improve maintainability.
                *   **Timer Logic Efficiency:** Do not use a timer's \`EN\` output as a condition in the logic that feeds into the same timer's \`IN\` pin. The \`EN\` output is implicitly true when the \`IN\` condition is met, making this redundant and poor practice.
                *   **Redundant Timer Resets:** Do not use an explicit Reset instruction \`[RST]\` on a \`TON\` timer if the reset condition is simply the inverse of the timer's enable condition. The \`TON\` instruction resets automatically when its input logic becomes false. Rely on this inherent behavior.
                *   **Safety Interlocks:** For systems with mechanically opposing actuators (e.g., a motor's Forward and Reverse outputs, a valve's Open and Close commands), you **MUST** implement cross-interlocking logic. The condition for activating one output must include a normally-closed contact (\`[/]\`) of the opposing output to prevent them from being active simultaneously. This is a fundamental safety and equipment protection practice.
                *   **Data Integrity (Math & Arrays):** All operations must be fault-proof.
                    *   **Division by Zero:** Any math instruction performing division must be conditionally executed only after ensuring the divisor is not zero using a comparison instruction.
                    *   **Array Bounds:** When using indexed addressing (e.g., \`MyTag[Index]\`), the \`Index\` tag's value MUST be validated with comparison instructions before the indexed instruction is executed to prevent a major controller fault.

                Here is a new, precise example of a Siemens motor control circuit that you **MUST** follow:

                **1. Ladder Logic Visual Guide**
                *   \`[ ]\` - Normally Open Contact
                *   \`[/]\` - Normally Closed Contact
                *   \`( )\` - Output Coil

                **2. Annotated Ladder Diagram (LAD) for TIA Portal**
                \`\`\`
                // Network 1: Motor starter with seal-in and jog.
                                "Start_PB"            "Stop_PB"               "Motor"
                                 (%I0.0)               (%I0.1)                 (%Q0.0)
                |───┬───────────[ ]───────────┬──────────[ ]───────────────────( )───|
                |   │                         │                                       |
                |   │        "Jog_PB"         │                                       |
                |   │         (%I0.2)         │                                       |
                |   ├───────────[ ]───────────┤                                       |
                |   │                         │                                       |
                |   │         "Motor"         │                                       |
                |   │         (%Q0.0)         │                                       |
                |   └───────────[ ]───────────┘                                       |
                \`\`\`

                **3. Network Logic Description:**
                This network implements a standard motor starter with a seal-in and a jog function. The "Motor" output is activated if the "Start_PB" is pressed, OR if the "Jog_PB" is pressed. The "Motor" contact provides seal-in logic so the motor remains on after "Start_PB" is released. The "Stop_PB" will break the logic and stop the motor.

                **4. Instruction Details:**
                *   **Important Note on Stop Logic:** The \`"Stop_Button"\` uses a Normally Open \`[ ]\` instruction. This is the fail-safe industry standard, assuming the physical stop button is a Normally Closed (NC) contact.
                `;
            }
            // Classic STEP 7 (S7-300/400) Style Guide
            else {
                return `
                When generating PLC logic diagrams for Siemens STEP 7 V5.x (classic), you MUST adhere to the following strict format. Your ASCII diagrams must be 100% precise and use absolute addressing.

                1.  **Function Block Diagram (FUP) for STEP 7:** Create ASCII art that perfectly resembles the classic STEP 7 FUP/FBD editor.
                    *   **Instructions:** Represent logic gates and blocks as boxes with their function inside, e.g., \`& \` for AND, \`>=1\` for OR, \`S_IMPULS\` for a timer.
                    *   **Connections:** Use \`─\` for horizontal lines and \`|\` for vertical lines to connect inputs and outputs.
                    *   **Tagging:** Use absolute addresses (e.g., \`E 0.0\`, \`A 4.0\`, \`M 1.1\`, \`T 5\`). Place input tags to the left of the block and output tags to the right.
                    *   **Assignments:** Use the assignment block \`=\` to assign a logic result to an output.

                2.  **Logic Description:** Below the diagram, provide a human-readable description of the network's function.

                3.  **Instruction Details:** For any complex blocks (like timers or counters), provide a clear explanation of its parameters.
                    *   **S5 Timer (e.g., S_IMPULS - Pulse Timer):**
                        *   **Nº:** The timer number (e.g., \`T 5\`).
                        *   **S:** The start input condition.
                        *   **TW:** The preset time value, formatted as S5T#... (e.g., \`S5T#2s\` for 2 seconds).
                        *   **R:** The reset input condition.
                        *   **BI / BCD:** The current time value outputs.
                        *   **Q:** The Boolean output bit of the timer.
                `;
            }
        }
        
        // DEFAULT/ALLEN-BRADLEY STYLE
        return `
        When generating PLC ladder logic diagrams, you MUST adhere to the following strict four-part format for Allen-Bradley (Studio 5000 / RSLogix) for maximum clarity, with each part clearly labeled using markdown bold headers.

        1.  **Ladder Logic Visual Guide:** At the very beginning of your ladder logic response, you MUST provide this small legend to help users understand the symbols.
            *   \`[ ]\` - Normally Open Contact (XIC)
            *   \`[/]\` - Normally Closed Contact (XIO)
            *   \`( )\` - Output Coil (OTE)
            *   \`|---\` - Wire/Rail
            *   A branch is used for OR logic.

        2.  **Annotated Ladder Diagram:** You must create flawlessly aligned ASCII art that perfectly mimics a real PLC editor. Adherence to the following character and alignment rules is **non-negotiable and must be followed with pixel-perfect precision.**
            *   **Rung Comment (NEW):** Each rung MUST be preceded by a single-line comment on its own line, explaining its purpose. The comment should be in the format: \`// Rung X: Description of logic.\`
            *   **Rung Number (NEW):** Every rung MUST begin with a 4-digit number (e.g., \`0000\`, \`0001\`) followed by a space. This number should correspond to the comment.
            *   **Characters:** Use \`|\` for power rails and **ONLY** \`─\` (U+2500) for all horizontal wire segments. **Never use hyphens (-), plus signs (+), or underscores (_).**
            *   **Rung Structure:** A complete rung is a complete horizontal line of logic. It MUST start with a left power rail \`|\`, contain instructions connected by \`─\` characters, and end with a right power rail \`|\`.
            *   **Instruction Spacing:** A standard 3-character instruction (e.g., \`[ ]\`, \`( )\`) MUST be padded by **exactly three \`─\` characters on each side**: \`───[ ]───\`. Wider instructions (e.g., \`[TON]\`) must also be padded with three \`─\` characters on each side: \`───[TON]───\`. This 3-character padding is a strict rule.
            *   **Instructions:**
                *   Normally Open Contact (XIC): \`[ ]\`
                *   Normally Closed Contact (XIO): \`[/]\`
                *   Output Coil (OTE): \`( )\`
                *   Other instructions (Timers, Counters): \`[TON]\`, \`[CTU]\`, \`[MOV]\`.
            *   **Precise Tag Alignment:** Tag names MUST be perfectly centered on separate lines above their respective instruction. Parameter lines (e.g., for a timer) must be centered below the instruction.
            *   **Perfect Branching:** Use branches for OR logic. Branch alignment must be perfect.
                *   **Start/End:** A parallel branch MUST start from the main line with \`┬\` and rejoin the main line with \`┘\`.
                *   **Vertical Lines:** The vertical segments of a branch MUST use the \`│\` character. All \`│\` characters in a single vertical segment must be in the same column, creating a perfectly straight vertical line.
                *   **Branching Off a Branch:** To add another parallel path from an existing vertical branch line, use \`├\`. The last parallel path in a group MUST join the vertical line with \`└\`.
                *   **Alignment is Critical:** The character directly above a \`│\` must be \`┬\` or \`├\`. The character directly below the last \`│\` must be \`└\` or \`┘\`. There must be no character gaps or misalignments. The horizontal segments (\`─\`) must extend from the main rung to the vertical branch characters (\`┬\`, \`├\`, \`└\`, \`┘\`).

        3.  **Mnemonic Code:** Below the diagram, provide the corresponding Allen-Bradley mnemonic (text-based) representation for each rung. (e.g., for RSLogix 500 style: \`BST XIC(Start) NXB XIC(Motor) BND XIC(Stop) OTE(Motor)\`).

        4.  **Instruction Details:** If the logic uses any instructions other than basic XIC, XIO, or OTE, provide a clear, bulleted list explaining how to configure each one (e.g., for a TON, explain the Timer tag, .PRE, .ACC, and .DN bits).

        **CRITICAL ARCHITECTURE & LOGIC RULES:**
        *   **Rung Completion (Syntax):** Every single rung MUST terminate with a valid output-type instruction (e.g., \`( )\`, \`[MOV]\`, \`[TON]\`). A rung that ends with only conditions is a syntax error and is strictly forbidden.
        *   **State Machines for Sequences:** For any sequential process (e.g., Fill -> Mix -> Drain), **YOU MUST** implement a state machine pattern. **DO NOT** use multiple chained seal-in/latching rungs. Use a single integer tag (e.g., a DINT named "Sequence.Step") as the state register. Use \`EQU\` instructions to enable the logic for the active state, and \`MOV\` instructions to transition to the next state. This is non-negotiable for creating robust, scalable logic.
        *   **Duplicate Outputs:** **NEVER** use the same output coil instruction (e.g., \`( )\` with tag "Motor") on more than one rung. This causes unpredictable 'rung-fighting' and is a critical programming error. Use intermediate bits (flags) if necessary to combine logic for a single output.
        *   **Latching Logic (Seal-In vs. Latch/Unlatch):** Using separate Latch \`[L]\` and Unlatch \`[U]\` instructions for the same tag is **STRICTLY FORBIDDEN**. This creates a scan-order dependency and can lead to unpredictable behavior if both conditions are met in the same scan. **ALWAYS** use a standard "seal-in" circuit with a single output coil (OTE, \`( )\`) for latching logic. The unlatch/stop condition must be in series before the coil to ensure it has priority.
        *   **Fail-Safe Stop Logic:** A physical stop button MUST be a Normally Closed (NC) contact for fail-safe wiring. In the ladder logic, this NC contact is represented by a Normally Open instruction (XIC, \`[ ]\`). This ensures that if the wire breaks (signal goes to 0), the logic sees it as a "stop" condition. To **trigger** an action when the NC stop button is **pressed** (input goes from 1 to 0), you MUST use a Normally Closed instruction (XIO, \`[/]\`).
        *   **Code Reusability (DRY Principle - JSR/AOI):** You MUST avoid repeating identical or very similar logic patterns. If a pattern is used for multiple devices (e.g., Motor1_Control, Motor2_Control), you MUST encapsulate it in a reusable block. For Allen-Bradley, this means creating an Add-On Instruction (AOI) or using a subroutine (JSR). Provide a clear example of the AOI/subroutine definition and then show how it is called for each device. This is a non-negotiable rule to reduce redundancy and improve maintainability.
        *   **Timer Logic Efficiency:** Do not use a timer's own Enable bit (\`.EN\`) as a condition on the same rung that enables the timer. The \`.EN\` bit is implicitly true when the rung conditions are met, so adding an \`XIC(Timer.EN)\` instruction is redundant and poor practice.
        *   **Redundant Timer Resets:** Do not use an explicit Reset instruction (\`RST\`) on a \`TON\` timer if the reset condition is simply the inverse of the timer's enable condition. The \`TON\` resets automatically. Rely on this inherent behavior.
        *   **Safety Interlocks:** For systems with mechanically opposing actuators (e.g., a motor's Forward and Reverse outputs, a valve's Open and Close commands), you **MUST** implement cross-interlocking logic. The rung for one output must contain a Normally Closed contact (XIO, \`[/]\`) of the opposing output's tag. This is a fundamental safety practice to prevent mechanical damage and hazardous conditions.
        *   **Data Integrity (Math & Arrays):** All operations must be fault-proof.
            *   **Division by Zero:** Any math instruction performing division (\`DIV\`, \`CPT\`) must be conditionally executed only after checking that the divisor is not zero.
            *   **Array Bounds:** When using indexed addressing (e.g., \`MyTag[Index]\`), the \`Index\` tag's value MUST be validated with \`LIMIT\` (LIM) or comparison instructions (\`GRT\`/\`LES\`) before the indexed instruction is executed to prevent a major controller fault.

        Here is the new, precise example of an Allen-Bradley motor control circuit that you **MUST** follow:

        **1. Ladder Logic Visual Guide**
        *   \`[ ]\` - Normally Open Contact (XIC)
        *   \`[/]\` - Normally Closed Contact (XIO)
        *   \`( )\` - Output Coil (OTE)

        **2. Annotated Ladder Diagram**
        \`\`\`
        // Rung 0: Standard motor starter with seal-in and jog.
                      Start_PB              Stop_PB                 Motor
        0000 |───┬───────────[ ]───────────┬──────────[ ]───────────────────( )───|
             |   │                         │                                       |
             |   │         Jog_PB          │                                       |
             |   ├───────────[ ]───────────┤                                       |
             |   │                         │                                       |
             |   │           Motor         │                                       |
             |   └───────────[ ]───────────┘                                       |
        \`\`\`

        **3. Mnemonic Code:**
        \`\`\`
        BST XIC(Start_PB) NXB XIC(Jog_PB) NXB XIC(Motor) BND XIC(Stop_PB) OTE(Motor)
        \`\`\`

        **4. Instruction Details:**
        *   **Important Note on Stop Logic:** The \`Stop_PB\` uses an \`XIC\` (Normally Open) instruction, represented as \`[ ]\`. This is the fail-safe industry standard. It assumes the physical stop button is a Normally Closed (NC) contact.
        `;
    };

    const buildStructuredTextStyleGuide = () => {
        // SIEMENS TIA PORTAL STYLE
        if (context.plcBrand === 'Siemens') {
            return `
    When generating Structured Text (ST), you MUST follow these critical principles to produce robust, safe, and maintainable code. Your entire response containing ST MUST be a single, complete code block.

    1.  **Line Numbering (MANDATORY):** Every single line within the ST code block, including comments, declarations, logic, and blank lines, MUST be prefixed with a sequential line number (e.g., \`01\`, \`02\`, ..., \`99\`, \`100\`, \`101\`), followed by a colon and a single space. For numbers less than 10, you MUST pad them with a leading zero.

    2.  **Complete Declarations:** Every ST code block MUST begin with a complete \`VAR ... END_VAR\` block. You MUST declare all variables used in the logic, including inputs (\`DI_*\`), outputs (\`DO_*\`), and all internal memory/state variables (\`Current_State\`, \`Safety_OK\`, \`Fill_Valve_Cmd\`, etc.).

    3.  **Proper Commenting:** All explanatory text within the code MUST be formatted as a proper ST comment. Use \`(* ... *)\` for multi-line comments or section headers, and \`//\` for single-line comments. **DO NOT** include unformatted text, markdown headers like \`###\`, or language identifiers like \`st\` inside the code block.

    4.  **Fail-Safe Stop Logic:** A physical stop button (like an E-Stop) MUST be a Normally Closed (NC) contact. This means the PLC input is \`TRUE\` or \`1\` when the system is safe to run. In ST, this is checked with a condition like \`IF E_Stop_Healthy THEN ...\`. Be explicit about this assumption in your explanation.

    5.  **Consolidate Safety Conditions (DRY Principle):** Create a single intermediate boolean variable (e.g., \`Safety_OK\`) at the beginning of your logic block to represent the "permission to run". All subsequent logic that can affect motion or process MUST then be gated by this single variable. This improves readability and prevents errors.

    6.  **Separate Logic from Physical Outputs:** Use intermediate 'command' variables for your state machine and logic (e.g., \`Valve_A_Cmd\`, \`Mixer_On_Cmd\`). Then, at the very end of the code block, create a dedicated \`(* --- OUTPUT MAPPING --- *)\` section. In this section, and ONLY in this section, assign the state of the command variables to the physical output variables (\`DO_*\`). This assignment MUST also be gated by the main safety permissive (\`Safety_OK\`). Example: \`DO_Valve_A := Valve_A_Cmd AND Safety_OK;\`.

    7.  **Single Output Assignment (No Rung Fighting):** A physical output variable (\`DO_*\`) MUST NEVER be assigned a value using \`:=\` in more than one place. Rule #6 (Output Mapping) helps enforce this perfectly.

    8.  **Single, Unconditional Function Block Calls:** All timer and function block instances (e.g., \`TON\`, \`TOF\`, \`R_TRIG\`) MUST be called **exactly once per scan**. These calls MUST be grouped together in a dedicated section, typically **after** the main \`CASE\` statement for the state machine. The state machine itself should only **read** the outputs (e.g., \`.Q\`, \`.DN\`) of these blocks as conditions; it should **NEVER** call the instances themselves. This ensures predictable, scan-independent behavior.
        
        **CRITICAL VIOLATION:** Placing timer calls like \`My_Timer(...)\` inside a \`CASE\` statement or \`IF\` block is **STRICTLY FORBIDDEN**. This creates multiple, conditional calls which is a major logic error.

        **Correct Pattern:**
        \`\`\`st
        (* ... other logic ... *)
        
        CASE Current_State OF
            10: (* State where timer should run *)
                IF My_Timer.Q THEN // CORRECT: Reading the timer's output bit as a condition.
                    Current_State := 20;
                END_IF;
            (* ... other states ... *)
        END_CASE;

        (* Unconditional Timer Calls Section *)
        // CORRECT: Calling the timer instance once, outside of any conditional logic.
        // The 'IN' parameter is controlled by the state.
        My_Timer(IN:=(Current_State = 10), PT:=T#5s); 
        \`\`\`

        **Incorrect Pattern (FORBIDDEN):**
        \`\`\`st
        CASE Current_State OF
            10: 
                // INCORRECT: Calling the timer instance inside a conditional block.
                My_Timer(IN:=TRUE, PT:=T#5s); 
                IF My_Timer.Q THEN
                    Current_State := 20;
                END_IF;
            (* ... other states ... *)
        END_CASE;
        \`\`\`
    9.  **Correct Timer Implementation (On-Delay vs. Off-Delay):** You MUST use the correct timer instruction and logic pattern for the desired behavior.
        *   **On-Delay (TON):** To delay an action from starting, use a \`TON\`. The action should be triggered by the timer's done bit (\`.Q\` or \`.DN\`).
            **Correct:** \`My_TON(IN:=Start_Condition, PT:=T#5s); Output_Cmd := My_TON.Q;\`
        *   **Off-Delay (TOF):** To delay an action from stopping, the **preferred** method is to use a \`TOF\`. The action is directly driven by the timer's output bit (\`.Q\`), which remains \`TRUE\` for the preset time after the input condition goes \`FALSE\`.
            **Correct:** \`My_TOF(IN:=Run_Condition, PT:=T#2s); Motor_Run_Cmd := My_TOF.Q;\`
        *   **Simulating Off-Delay with TON (CRITICAL):** If you must create an off-delay using only a \`TON\`, you **CANNOT** simply use the timer's output. You **MUST** implement a "seal-in" or "latch" circuit where the timer is used to break the latch. This is a critical pattern to understand.
            **Correct TON-based Off-Delay:**
            \`\`\`st
            (* This timer starts ONLY when the run condition is gone, but the output is still latched on *)
            Off_Delay_Timer(IN:= NOT Run_Condition AND Motor_Run_Cmd, PT:=T#2s);

            (* Motor is latched on by the run condition, and unlatched by the timer's done bit *)
            Motor_Run_Cmd := (Run_Condition OR Motor_Run_Cmd) AND NOT Off_Delay_Timer.Q;
            \`\`\`
            **INCORRECT:** \`On_Delay_Timer(IN:=Run_Condition, PT:=T#2s); Motor_Run_Cmd := On_Delay_Timer.Q;\` (*This is an ON-delay, not an OFF-delay.*)
    10.  **Loop and Data Safety (CRITICAL):**
        *   **Loop Termination:** Any \`WHILE\` or \`REPEAT\` loop whose exit condition depends on a process variable or external input MUST include an "escape counter". This is a secondary counter that forces an exit after a maximum number of iterations to prevent a catastrophic watchdog timer fault.
        *   **Data Integrity:** All code must be written to prevent data-related faults.
            *   **Division by Zero:** Every division operation MUST be guarded by a conditional check (e.g., \`IF divisor <> 0.0 THEN ...\`).
            *   **Array Bounds:** Any variable used as an array index MUST be validated to be within the array's defined bounds before being used to access an element (e.g., \`IF index >= 0 AND index < ARRAY_SIZE THEN ...\`). This is mandatory to prevent a major controller fault.
            
    11. **Code Reusability (DRY Principle - FB/FC/AOI):** You MUST avoid repeating identical or very similar logic patterns. If a pattern is used for multiple devices (e.g., motor control for Motor1 and Motor2), you MUST encapsulate this logic in a reusable block (e.g., a Function Block in TIA Portal, or an Add-On Instruction in Studio 5000). First, show the definition of the reusable block. Then, show how the instances of this block are declared and called for each device. This is a non-negotiable rule to reduce redundancy and improve maintainability.

    12. **Refactor Repeated State Logic (DRY Principle):** If a sequence contains multiple states with very similar logic patterns (e.g., a "Fill_Material_A" state and a "Fill_Material_B" state), you MUST refactor this into a single, more generic state (e.g., "FILLING"). Use an additional state variable (e.g., \`Sub_State : INT;\`) to control the specific behavior within that generic state. This demonstrates advanced, maintainable, and robust coding practices.

    **Correct ST Example with All Rules:**
    \`\`\`st
    01: (*
    02:   PLC Program: Simple Mixer Control
    03:   Description: This program controls a simple mixing sequence following best practices.
    04: *)
    05: VAR
    06:     (* Inputs *)
    07:     DI_Start_Button AT %I0.0 : BOOL;
    08:     DI_Stop_Button AT %I0.1 : BOOL; // Assumed to be from a physical NC button circuit
    09:     DI_EStop_Healthy AT %I0.2 : BOOL; // Assumed to be from a physical NC E-Stop circuit
    10: 
    11:     (* Outputs *)
    12:     DO_Fill_Valve AT %Q0.0 : BOOL;
    13:     DO_Mixer_Motor AT %Q0.1 : BOOL;
    14:     DO_Light_Running AT %Q0.2 : BOOL;
    15:     DO_Light_Fault AT %Q0.3 : BOOL;
    16: 
    17:     (* Internal State & Timers *)
    18:     Current_State : INT := 0; // 0:Idle, 10:Filling, 20:Mixing
    19:     Safety_OK : BOOL;
    20:     Fill_Timer : TON;
    21:     Mix_Timer : TON;
    22: 
    23:     (* Intermediate Commands & Status *)
    24:     Fill_Valve_Cmd : BOOL;
    25:     Mixer_Motor_Cmd : BOOL;
    26:     System_Running : BOOL;
    27:     System_Faulted : BOOL;
    28: END_VAR
    29: 
    30: // --- 1. SAFETY & PERMISSIVES ---
    31: (* Rule 4 & 5: Consolidate all safety conditions into a single variable *)
    32: Safety_OK := DI_Stop_Button AND DI_EStop_Healthy;
    33: 
    34: 
    35: // --- 2. STATE MACHINE LOGIC ---
    36: (* This CASE statement controls the main sequence logic *)
    37: CASE Current_State OF
    38:     0: // Idle State
    39:         Fill_Valve_Cmd := FALSE;
    40:         Mixer_Motor_Cmd := FALSE;
    41:         IF DI_Start_Button AND Safety_OK THEN
    42:             Current_State := 10; // Transition to Filling
    43:         END_IF;
    44: 
    45:     10: // Filling State
    46:         Fill_Valve_Cmd := TRUE;
    47:         Mixer_Motor_Cmd := FALSE;
    48:         IF Fill_Timer.Q THEN
    49:             Current_State := 20; // Transition to Mixing
    50:         END_IF;
    51: 
    52:     20: // Mixing State
    53:         Fill_Valve_Cmd := FALSE;
    54:         Mixer_Motor_Cmd := TRUE;
    55:         IF Mix_Timer.Q THEN
    56:             Current_State := 0; // Transition back to Idle
    57:         END_IF;
    58: END_CASE;
    59: 
    60: // --- 3. GLOBAL CONDITIONS & RESETS ---
    61: // Immediately return to idle if safety is lost at any point
    62: IF NOT Safety_OK THEN
    63:     Current_State := 0;
    64: END_IF;
    65: 
    66: // --- 4. TIMER CALLS (RULE 8) ---
    67: (* Timers are called once per scan. Their IN condition handles start/reset. *)
    68: Fill_Timer(IN:=(Current_State = 10 AND Safety_OK), PT:=T#5s);
    69: Mix_Timer(IN:=(Current_State = 20 AND Safety_OK), PT:=T#10s);
    70: 
    71: 
    72: // --- 5. STATUS INDICATOR LOGIC ---
    73: System_Running := (Current_State > 0) AND Safety_OK;
    74: System_Faulted := NOT Safety_OK;
    75: 
    76: 
    77: // --- 6. OUTPUT MAPPING ---
    78: (* Rule 6 & 7: Map all command variables to physical outputs in one place, gated by safety. *)
    79: DO_Fill_Valve := Fill_Valve_Cmd AND Safety_OK;
    80: DO_Mixer_Motor := Mixer_Motor_Cmd AND Safety_OK;
    81: DO_Light_Running := System_Running;
    82: DO_Light_Fault := System_Faulted;
    \`\`\`
    `;
        }

        // DEFAULT/ALLEN-BRADLEY STYLE
        return `
    When generating Structured Text (ST) for Allen-Bradley Studio 5000, you MUST follow these critical principles to produce robust, safe, and maintainable code. Your entire response containing ST MUST be a single, complete code block.

    1.  **Line Numbering (MANDATORY):** Every single line within the ST code block, including comments, declarations, logic, and blank lines, MUST be prefixed with a sequential line number (e.g., \`01\`, \`02\`, ..., \`99\`, \`100\`, \`101\`), followed by a colon and a single space. For numbers less than 10, you MUST pad them with a leading zero.

    2.  **Complete Declarations & Tag-Based Addressing:** Every ST code block MUST begin with a complete \`VAR ... END_VAR\` block. You MUST declare all variables used in the logic. Allen-Bradley uses tag-based addressing; there is no physical addressing like \`%I0.0\` in the code logic itself.

    3.  **Proper Commenting:** All explanatory text within the code MUST be formatted as a proper ST comment. Use \`(* ... *)\` for multi-line comments or section headers, and \`//\` for single-line comments. **DO NOT** include unformatted text, markdown headers like \`###\`, or language identifiers like \`st\` inside the code block.

    4.  **Fail-Safe Stop Logic:** A physical stop button (like an E-Stop) MUST be a Normally Closed (NC) contact. This means the PLC input is \`TRUE\` or \`1\` when the system is safe to run. In ST, this is checked with a condition like \`IF E_Stop_Healthy THEN ...\`. Be explicit about this assumption in your explanation.

    5.  **Consolidate Safety Conditions (DRY Principle):** Create a single intermediate boolean variable (e.g., \`Safety_OK\`) at the beginning of your logic block to represent the "permission to run". All subsequent logic that can affect motion or process MUST then be gated by this single variable. This improves readability and prevents errors.

    6.  **Separate Logic from Physical Outputs:** Use intermediate 'command' variables for your state machine and logic (e.g., \`Valve_A_Cmd\`, \`Mixer_On_Cmd\`). Then, at the very end of the code block, create a dedicated \`(* --- OUTPUT MAPPING --- *)\` section. In this section, and ONLY in this section, assign the state of the command variables to the physical output variables (e.g., \`DO_Fill_Valve\`). This assignment MUST also be gated by the main safety permissive (\`Safety_OK\`). Example: \`DO_Fill_Valve := Valve_A_Cmd AND Safety_OK;\`.

    7.  **Single Output Assignment (No Rung Fighting):** A physical output variable (\`DO_*\`) MUST NEVER be assigned a value using \`:=\` in more than one place. Rule #6 (Output Mapping) helps enforce this perfectly.

    8.  **Single, Unconditional Function Block Calls:** All timer and function block instances (e.g., \`TON\`, \`TOF\`, \`R_TRIG\`) MUST be called **exactly once per scan**. These calls MUST be grouped together in a dedicated section, typically **after** the main \`CASE\` statement for the state machine. The state machine itself should only **read** the outputs (e.g., \`.DN\`, \`.TT\`) of these blocks as conditions; it should **NEVER** call the instances themselves. This ensures predictable, scan-independent behavior.
        
        **CRITICAL VIOLATION:** Placing timer calls like \`My_Timer(...)\` inside a \`CASE\` statement or \`IF\` block is **STRICTLY FORBIDDEN**.

        **Correct Pattern:**
        \`\`\`st
        CASE Current_State OF
            10: (* State where timer should run *)
                IF My_Timer.DN THEN // CORRECT: Reading the timer's Done bit as a condition.
                    Current_State := 20;
                END_IF;
        END_CASE;
    
        (* Unconditional Timer Calls Section *)
        // CORRECT: Calling the timer instance once, outside of any conditional logic.
        // The 'IN' parameter is controlled by the state.
        My_Timer(IN:=(Current_State = 10), PRE:=5000); // PRE is the preset in milliseconds
        \`\`\`

    9.  **Correct Timer Implementation (On-Delay vs. Off-Delay):**
        *   **On-Delay (TON):** To delay an action from starting, use a \`TON\`. The action should be triggered by the timer's done bit (\`.DN\`).
            **Correct:** \`My_TON(IN:=Start_Condition, PRE:=5000); Output_Cmd := My_TON.DN;\`
        *   **Off-Delay (TOF):** To delay an action from stopping, use a \`TOF\`.
            **Correct:** \`My_TOF(IN:=Run_Condition, PRE:=2000); Motor_Run_Cmd := My_TOF.DN;\`
        *   **Simulating Off-Delay with TON (CRITICAL):**
            **Correct TON-based Off-Delay:**
            \`\`\`st
            Off_Delay_Timer(IN:= NOT Run_Condition AND Motor_Run_Cmd, PRE:=2000);
            Motor_Run_Cmd := (Run_Condition OR Motor_Run_Cmd) AND NOT Off_Delay_Timer.DN;
            \`\`\`

    10.  **Loop and Data Safety (CRITICAL):**
        *   **Loop Termination:** Any \`FOR\` or \`WHILE\` loop must have a guaranteed exit to prevent watchdog faults.
        *   **Data Integrity:** All division operations MUST be guarded by a non-zero check. Any variable used as an array index MUST be validated to be within bounds.

    11. **Code Reusability (DRY Principle - AOI):** You MUST avoid repeating logic. For Allen-Bradley, this means creating an Add-On Instruction (AOI). Show the definition of the AOI, then show how instances are declared and called.

    12. **Refactor Repeated State Logic (DRY Principle):** Refactor similar states (e.g., "Fill_A", "Fill_B") into a generic state ("FILLING") with a sub-state variable.

    **Correct Allen-Bradley ST Example with All Rules:**
    \`\`\`st
    01: (*
    02:   PLC Program: Simple Mixer Control (Studio 5000)
    03:   Description: This program controls a simple mixing sequence following best practices.
    04: *)
    05: VAR
    06:     (* Inputs - Assumed to be mapped to physical I/O elsewhere *)
    07:     DI_Start_Button : BOOL;
    08:     DI_Stop_Button : BOOL; // Assumed to be from a physical NC button circuit
    09:     DI_EStop_Healthy : BOOL; // Assumed to be from a physical NC E-Stop circuit
    10: 
    11:     (* Outputs - Assumed to be mapped to physical I/O elsewhere *)
    12:     DO_Fill_Valve : BOOL;
    13:     DO_Mixer_Motor : BOOL;
    14:     DO_Light_Running : BOOL;
    15:     DO_Light_Fault : BOOL;
    16: 
    17:     (* Internal State & Timers *)
    18:     Current_State : DINT := 0; // 0:Idle, 10:Filling, 20:Mixing
    19:     Safety_OK : BOOL;
    20:     Fill_Timer : TON;
    21:     Mix_Timer : TON;
    22: 
    23:     (* Intermediate Commands & Status *)
    24:     Fill_Valve_Cmd : BOOL;
    25:     Mixer_Motor_Cmd : BOOL;
    26:     System_Running : BOOL;
    27:     System_Faulted : BOOL;
    28: END_VAR
    29: 
    30: // --- 1. SAFETY & PERMISSIVES ---
    31: (* Rule 4 & 5: Consolidate all safety conditions into a single variable *)
    32: Safety_OK := DI_Stop_Button AND DI_EStop_Healthy;
    33: 
    34: 
    35: // --- 2. STATE MACHINE LOGIC ---
    36: (* This CASE statement controls the main sequence logic *)
    37: CASE Current_State OF
    38:     0: // Idle State
    39:         Fill_Valve_Cmd := FALSE;
    40:         Mixer_Motor_Cmd := FALSE;
    41:         IF DI_Start_Button AND Safety_OK THEN
    42:             Current_State := 10; // Transition to Filling
    43:         END_IF;
    44: 
    45:     10: // Filling State
    46:         Fill_Valve_Cmd := TRUE;
    47:         Mixer_Motor_Cmd := FALSE;
    48:         IF Fill_Timer.DN THEN // Use .DN for Done bit
    49:             Current_State := 20; // Transition to Mixing
    50:         END_IF;
    51: 
    52:     20: // Mixing State
    53:         Fill_Valve_Cmd := FALSE;
    54:         Mixer_Motor_Cmd := TRUE;
    55:         IF Mix_Timer.DN THEN // Use .DN for Done bit
    56:             Current_State := 0; // Transition back to Idle
    57:         END_IF;
    58: END_CASE;
    59: 
    60: // --- 3. GLOBAL CONDITIONS & RESETS ---
    61: // Immediately return to idle if safety is lost at any point
    62: IF NOT Safety_OK THEN
    63:     Current_State := 0;
    64: END_IF;
    65: 
    66: // --- 4. TIMER CALLS (RULE 8) ---
    67: (* Timers are called once per scan. Their IN condition handles start/reset. *)
    68: Fill_Timer(IN:=(Current_State = 10 AND Safety_OK), PRE:=5000); // PRE in ms
    69: Mix_Timer(IN:=(Current_State = 20 AND Safety_OK), PRE:=10000); // PRE in ms
    70: 
    71: 
    72: // --- 5. STATUS INDICATOR LOGIC ---
    73: System_Running := (Current_State > 0) AND Safety_OK;
    74: System_Faulted := NOT Safety_OK;
    75: 
    76: 
    77: // --- 6. OUTPUT MAPPING ---
    78: (* Rule 6 & 7: Map all command variables to physical outputs in one place, gated by safety. *)
    79: DO_Fill_Valve := Fill_Valve_Cmd AND Safety_OK;
    80: DO_Mixer_Motor := Mixer_Motor_Cmd AND Safety_OK;
    81: DO_Light_Running := System_Running;
    82: DO_Light_Fault := System_Faulted;
    \`\`\`
        `;
    };

    const systemInstruction = `You are a world-class industrial automation expert specializing in ${context.topic}s.
    ${buildContextString()}
    Provide clear, concise, and technically accurate advice. Use markdown for code blocks, lists, and emphasis.
    When creating wiring diagrams as ASCII art, use box-drawing characters (like │, ─, ┌, └, ┐, ┘, ├, ┤, ┬, ┴, ┼) and ensure perfect alignment within markdown code blocks for clarity.
    
    *** LADDER LOGIC RULES ***
    IMPORTANT: Before providing a ladder logic solution, you MUST ask the user which PLC software they are using (e.g., 'Studio 5000' for Allen-Bradley, or 'TIA Portal for S7-1200/1500' vs 'STEP 7 v5.x for S7-300/400' for Siemens) if it has not already been specified in the context. Your ladder logic style MUST conform to their selection based on the platform-specific guides below.
    ${buildLadderLogicStyleGuide()}
    
    *** STRUCTURED TEXT (ST) RULES ***
    ${buildStructuredTextStyleGuide()}
    ${langInstruction}`;

    return callApiEndpoint('generateChatResponse', { prompt, config: { systemInstruction } });
};

export const generatePractice = async (params: PracticeParams): Promise<string> => {
    const { topic, difficulty, language, vfdBrand, vfdModel, plcBrand, plcSoftware, plcLanguage } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';

    let ladderStyleGuide = '';
    // SIEMENS STYLE GUIDE FOR PRACTICE PROBLEMS
    if (plcBrand === 'Siemens') {
        ladderStyleGuide = `
        If the solution includes PLC ladder logic for Siemens, you MUST present it in the following strict four-part format.
    
        1.  **Ladder Logic Visual Guide:** Provide a small legend explaining the ASCII symbols (\`[ ]\`, \`[/]\`, \`( )\`).
        
        2.  **Annotated Ladder Diagram (LAD) for TIA Portal/STEP 7:** Create flawlessly aligned ASCII art that resembles a Siemens editor. Each network MUST be preceded by a comment (\`// Network X: ...\`). Use \`[ ]\` for NO, \`[/]\` for NC, and \`( )\` for Coil. Place tags (symbolic and absolute) on separate lines above instructions. Use correct branching characters (\`┬\`, \`│\`, \`├\`, \`└\`, \`┘\`) for parallel logic. The alignment must be pixel-perfect.
    
        3.  **Network Logic Description:** Provide a human-readable description of the network's function. **Do not use Allen-Bradley mnemonics.**
    
        4.  **Instruction Details:** Explain any complex instructions (like timers or counters) using Siemens' parameter names (Instance DB, IN, PT, Q, etc.).
        
        **CRITICAL ARCHITECTURE & LOGIC RULES:**
        *   **Rung Completion (Syntax):** Every single network MUST terminate with a valid output-type instruction. A network with only conditions is a syntax error and is strictly forbidden.
        *   **State Machines for Sequences:** For any sequential process, **YOU MUST** use a state machine pattern with an integer state register and MOVE instructions for transitions. Do not use chained seal-in rungs.
        *   **NEVER** use the same output coil tag on more than one network. This causes "rung-fighting" and is a major error.
        *   **NO Set/Reset:** Using separate Set \`[S]\` and Reset \`[R]\` instructions for the same tag is **STRICTLY FORBIDDEN**. Use a standard seal-in circuit with a single output coil \`( )\` for latching logic.
        *   For a physical NC stop button, you **MUST** use a NO instruction \`[ ]\` in the logic for fail-safe behavior. This is a critical safety rule.
        *   **Code Reusability (DRY Principle - FB/FC):** You MUST avoid repeating identical or very similar logic patterns. If a pattern is used for multiple devices (e.g., motor control), you MUST encapsulate it in a reusable block. For Siemens TIA Portal, this means creating a Function Block (FB) or a Function (FC). Your solution must show the definition of the FB/FC and then show how it is called for each device.
        *   **Timer Logic Efficiency:** Do not use a timer's \`EN\` output as a condition in the logic that feeds into the same timer's \`IN\` pin. This is redundant.
        *   **Redundant Timer Resets:** Do not use an explicit Reset instruction on a \`TON\` timer if the reset condition is simply the inverse of the timer's enable condition. The \`TON\` resets automatically.
        *   **Safety Interlocks:** For any problem involving opposing outputs (e.g., Forward/Reverse), you **MUST** include cross-interlocking logic using NC contacts (\`[/]\`) as a fundamental safety pattern.
        *   **Data Integrity:** Any solution involving math or arrays must be fault-proof. All division must be protected by a non-zero check. All array access must be protected by an index bounds check.

        Example of a complete Siemens motor seal-in circuit response inside the ### Solution section:

        **1. Ladder Logic Visual Guide**
        *   \`[ ]\` - Normally Open Contact
        *   \`( )\` - Output Coil
        
        **2. Annotated Ladder Diagram (LAD) for TIA Portal**
        \`\`\`
        // Network 1: Motor Seal-In Circuit
                        "Start_Button"        "Stop_Button"           "Motor_Output"
                           (%I0.0)               (%I0.1)                 (%Q0.0)
        |───┬───────────[ ]───────────┬───────────[ ]───────────────────( )───────────|
        |   │                         │                                             |
        |   │      "Motor_Output"     │                                             |
        |   │         (%Q0.0)         │                                             |
        |   └───────────[ ]───────────┘                                             |
        \`\`\`

        **3. Network Logic Description:**
        This network starts the "Motor_Output" when "Start_Button" is pressed. The output remains latched on through its own contact until the physically Normally Closed "Stop_Button" input is opened. This is a fail-safe design.
        `;
    } 
    // DEFAULT/ALLEN-BRADLEY STYLE GUIDE FOR PRACTICE PROBLEMS
    else {
        ladderStyleGuide = `
        If the solution includes PLC ladder logic, you MUST present it in the following strict four-part format for Allen-Bradley.
    
        1.  **Ladder Logic Visual Guide:** Provide a small legend explaining the ASCII symbols (\`[ ]\`, \`[/]\`, \`( )\`).
    
        2.  **Annotated Ladder Diagram:** Create flawlessly aligned ASCII art that resembles a Rockwell editor. Each rung MUST begin with a 4-digit number (e.g., \`0000\`) and be preceded by a comment (\`// Rung X: ...\`). Use \`[ ]\` (XIC), \`[/]\` (XIO), and \`( )\` (OTE). Place tags centered above instructions. Use correct branching characters (\`┬\`, \`│\`, \`├\`, \`└\`, \`┘\`) for parallel logic. The alignment must be pixel-perfect.
    
        3.  **Mnemonic Code:** Provide the corresponding Allen-Bradley mnemonic representation (e.g., \`BST XIC(Tag1) NXB ...\`).
    
        4.  **Instruction Details:** Explain any complex instructions (like TON or CTU) using Rockwell's tag structure (\`.PRE\`, \`.ACC\`, \`.DN\`).
        
        **CRITICAL ARCHITECTURE & LOGIC RULES:**
        *   **Rung Completion (Syntax):** Every single rung MUST terminate with a valid output-type instruction. A rung with only conditions is a syntax error and is strictly forbidden.
        *   **State Machines for Sequences:** For any sequential process, **YOU MUST** use a state machine pattern with a DINT state register and MOV instructions for transitions. Do not use chained seal-in rungs.
        *   **NEVER** use the same output coil tag (OTE) on more than one rung. This causes "rung-fighting" and is a major error.
        *   **NO Latch/Unlatch:** Using separate Latch \`[L]\` and Unlatch \`[U]\` instructions for the same tag is **STRICTLY FORBIDDEN**. Use a standard seal-in circuit with a single output coil (OTE, \`( )\`) for latching logic.
        *   For a physical NC stop button, you **MUST** use an XIC instruction \`[ ]\` in the logic for fail-safe behavior. To trigger an action when the NC button is pressed, you must use an XIO \`[/]\`.
        *   **Code Reusability (DRY Principle - JSR/AOI):** You MUST avoid repeating identical or very similar logic patterns. If a pattern is used for multiple devices (e.g., motor control), you MUST encapsulate it in a reusable block. For Allen-Bradley, this means creating an Add-On Instruction (AOI) or using a subroutine (JSR). Your solution must show the definition of the AOI/subroutine and then show how it is called for each device.
        *   **Timer Logic Efficiency:** Do not use a timer's own Enable bit (\`.EN\`) as a condition on the same rung that enables the timer. This is redundant.
        *   **Redundant Timer Resets:** Do not use an explicit Reset instruction (\`RST\`) on a \`TON\` timer if the reset condition is simply the inverse of the timer's enable condition. The \`TON\` resets automatically.
        *   **Safety Interlocks:** For any problem involving opposing outputs (e.g., Forward/Reverse), you **MUST** include cross-interlocking logic using NC contacts (XIO) as a fundamental safety pattern.
        *   **Data Integrity:** Any solution involving math or arrays must be fault-proof. All division must be protected by a non-zero check. All array access must be protected by an index bounds check.

        Example of a complete Allen-Bradley motor seal-in circuit response inside the ### Solution section:
        
        **1. Ladder Logic Visual Guide**
        *   \`[ ]\` - Normally Open Contact (XIC)
        *   \`( )\` - Output Coil (OTE)

        **2. Annotated Ladder Diagram**
        \`\`\`
        // Rung 0: Motor Seal-In Circuit
                       Start_Button          Stop_Button             Motor
        0000 |───┬───────────[ ]───────────┬───────────[ ]───────────────────( )───────────|
             |   │                         │                                             |
             |   │           Motor         │                                             |
             |   └───────────[ ]───────────┘                                             |
        \`\`\`
        
        **3. Mnemonic Code:**
        \`\`\`
        BST XIC(Start_Button) NXB XIC(Motor) BND XIC(Stop_Button) OTE(Motor)
        \`\`\`
        `;
    }

    const stStyleGuide = (() => {
        if (plcBrand === 'Siemens') {
            return `
    *** IMPORTANT STYLE GUIDE FOR STRUCTURED TEXT (ST) ***
    When generating Structured Text (ST), you MUST follow these critical principles to produce robust, safe, and maintainable code. Your entire response containing ST MUST be a single, complete code block.

    1.  **Line Numbering (MANDATORY):** Every single line within the ST code block, including comments, declarations, logic, and blank lines, MUST be prefixed with a sequential line number (e.g., \`01\`, \`02\`, ..., \`99\`, \`100\`, \`101\`), followed by a colon and a single space. For numbers less than 10, you MUST pad them with a leading zero.

    2.  **Complete Declarations:** Every ST code block MUST begin with a complete \`VAR ... END_VAR\` block. You MUST declare all variables used in the logic, including inputs (\`DI_*\`), outputs (\`DO_*\`), and all internal memory/state variables (\`Current_State\`, \`Safety_OK\`, \`Fill_Valve_Cmd\`, etc.).

    3.  **Proper Commenting:** All explanatory text within the code MUST be formatted as a proper ST comment. Use \`(* ... *)\` for multi-line comments or section headers, and \`//\` for single-line comments. **DO NOT** include unformatted text, markdown headers like \`###\`, or language identifiers like \`st\` inside the code block.

    4.  **Fail-Safe Stop Logic:** A physical stop button (like an E-Stop) MUST be a Normally Closed (NC) contact. This means the PLC input is \`TRUE\` or \`1\` when the system is safe to run. In ST, this is checked with a condition like \`IF E_Stop_Healthy THEN ...\`. Be explicit about this assumption in your explanation.

    5.  **Consolidate Safety Conditions (DRY Principle):** Create a single intermediate boolean variable (e.g., \`Safety_OK\`) at the beginning of your logic block to represent the "permission to run". All subsequent logic that can affect motion or process MUST then be gated by this single variable. This improves readability and prevents errors.

    6.  **Separate Logic from Physical Outputs:** Use intermediate 'command' variables for your state machine and logic (e.g., \`Valve_A_Cmd\`, \`Mixer_On_Cmd\`). Then, at the very end of the code block, create a dedicated \`(* --- OUTPUT MAPPING --- *)\` section. In this section, and ONLY in this section, assign the state of the command variables to the physical output variables (\`DO_*\`). This assignment MUST also be gated by the main safety permissive (\`Safety_OK\`). Example: \`DO_Valve_A := Valve_A_Cmd AND Safety_OK;\`.

    7.  **Single Output Assignment (No Rung Fighting):** A physical output variable (\`DO_*\`) MUST NEVER be assigned a value using \`:=\` in more than one place. Rule #6 (Output Mapping) helps enforce this perfectly.

    8.  **Single, Unconditional Function Block Calls:** All timer and function block instances (e.g., \`TON\`, \`TOF\`, \`R_TRIG\`) MUST be called **exactly once per scan**. These calls MUST be grouped together in a dedicated section, typically **after** the main \`CASE\` statement for the state machine. The state machine itself should only **read** the outputs (e.g., \`.Q\`, \`.DN\`) of these blocks as conditions; it should **NEVER** call the instances themselves. This ensures predictable, scan-independent behavior.
        
        **CRITICAL VIOLATION:** Placing timer calls like \`My_Timer(...)\` inside a \`CASE\` statement or \`IF\` block is **STRICTLY FORBIDDEN**. This creates multiple, conditional calls which is a major logic error.

        **Correct Pattern:**
        \`\`\`st
        (* ... other logic ... *)
        
        CASE Current_State OF
            10: (* State where timer should run *)
                IF My_Timer.Q THEN // CORRECT: Reading the timer's output bit as a condition.
                    Current_State := 20;
                END_IF;
            (* ... other states ... *)
        END_CASE;

        (* Unconditional Timer Calls Section *)
        // CORRECT: Calling the timer instance once, outside of any conditional logic.
        // The 'IN' parameter is controlled by the state.
        My_Timer(IN:=(Current_State = 10), PT:=T#5s); 
        \`\`\`

        **Incorrect Pattern (FORBIDDEN):**
        \`\`\`st
        CASE Current_State OF
            10: 
                // INCORRECT: Calling the timer instance inside a conditional block.
                My_Timer(IN:=TRUE, PT:=T#5s); 
                IF My_Timer.Q THEN
                    Current_State := 20;
                END_IF;
            (* ... other states ... *)
        END_CASE;
        \`\`\`
    9.  **Correct Timer Implementation (On-Delay vs. Off-Delay):** You MUST use the correct timer instruction and logic pattern for the desired behavior.
        *   **On-Delay (TON):** To delay an action from starting, use a \`TON\`. The action should be triggered by the timer's done bit (\`.Q\` or \`.DN\`).
            **Correct:** \`My_TON(IN:=Start_Condition, PT:=T#5s); Output_Cmd := My_TON.Q;\`
        *   **Off-Delay (TOF):** To delay an action from stopping, the **preferred** method is to use a \`TOF\`. The action is directly driven by the timer's output bit (\`.Q\`), which remains \`TRUE\` for the preset time after the input condition goes \`FALSE\`.
            **Correct:** \`My_TOF(IN:=Run_Condition, PT:=T#2s); Motor_Run_Cmd := My_TOF.Q;\`
        *   **Simulating Off-Delay with TON (CRITICAL):** If you must create an off-delay using only a \`TON\`, you **CANNOT** simply use the timer's output. You **MUST** implement a "seal-in" or "latch" circuit where the timer is used to break the latch. This is a critical pattern to understand.
            **Correct TON-based Off-Delay:**
            \`\`\`st
            (* This timer starts ONLY when the run condition is gone, but the output is still latched on *)
            Off_Delay_Timer(IN:= NOT Run_Condition AND Motor_Run_Cmd, PT:=T#2s);

            (* Motor is latched on by the run condition, and unlatched by the timer's done bit *)
            Motor_Run_Cmd := (Run_Condition OR Motor_Run_Cmd) AND NOT Off_Delay_Timer.Q;
            \`\`\`
            **INCORRECT:** \`On_Delay_Timer(IN:=Run_Condition, PT:=T#2s); Motor_Run_Cmd := On_Delay_Timer.Q;\` (*This is an ON-delay, not an OFF-delay.*)
    10.  **Loop and Data Safety (CRITICAL):**
        *   **Loop Termination:** Any \`WHILE\` loop must have a guaranteed exit condition. If necessary, include an "escape counter" to prevent watchdog faults.
        *   **Data Integrity:** All division operations MUST be protected by a non-zero check. Any variable used as an array index MUST be validated to be within the array's bounds before access.
        
    11. **Code Reusability (DRY Principle - FB/FC/AOI):** You MUST avoid repeating identical or very similar logic patterns. If a pattern is used for multiple devices (e.g., motor control for Motor1 and Motor2), you MUST encapsulate this logic in a reusable block (e.g., a Function Block in TIA Portal, or an Add-On Instruction in Studio 5000). First, show the definition of the reusable block. Then, show how the instances of this block are declared and called for each device. This is a non-negotiable rule to reduce redundancy and improve maintainability.

    12. **Refactor Repeated State Logic (DRY Principle):** If a sequence contains multiple states with very similar logic patterns (e.g., a "Fill_Material_A" state and a "Fill_Material_B" state), you MUST refactor this into a single, more generic state (e.g., "FILLING"). Use an additional state variable (e.g., \`Sub_State : INT;\`) to control the specific behavior within that generic state. This demonstrates advanced, maintainable, and robust coding practices.

    **Correct ST Example with All Rules:**
    \`\`\`st
    01: (*
    02:   PLC Program: Simple Mixer Control
    03:   Description: This program controls a simple mixing sequence following best practices.
    04: *)
    05: VAR
    06:     (* Inputs *)
    07:     DI_Start_Button AT %I0.0 : BOOL;
    08:     DI_Stop_Button AT %I0.1 : BOOL; // Assumed to be from a physical NC button circuit
    09:     DI_EStop_Healthy AT %I0.2 : BOOL; // Assumed to be from a physical NC E-Stop circuit
    10: 
    11:     (* Outputs *)
    12:     DO_Fill_Valve AT %Q0.0 : BOOL;
    13:     DO_Mixer_Motor AT %Q0.1 : BOOL;
    14:     DO_Light_Running AT %Q0.2 : BOOL;
    15:     DO_Light_Fault AT %Q0.3 : BOOL;
    16: 
    17:     (* Internal State & Timers *)
    18:     Current_State : INT := 0; // 0:Idle, 10:Filling, 20:Mixing
    19:     Safety_OK : BOOL;
    20:     Fill_Timer : TON;
    21:     Mix_Timer : TON;
    22: 
    23:     (* Intermediate Commands & Status *)
    24:     Fill_Valve_Cmd : BOOL;
    25:     Mixer_Motor_Cmd : BOOL;
    26:     System_Running : BOOL;
    27:     System_Faulted : BOOL;
    28: END_VAR
    29: 
    30: // --- 1. SAFETY & PERMISSIVES ---
    31: (* Rule 4 & 5: Consolidate all safety conditions into a single variable *)
    32: Safety_OK := DI_Stop_Button AND DI_EStop_Healthy;
    33: 
    34: 
    35: // --- 2. STATE MACHINE LOGIC ---
    36: (* This CASE statement controls the main sequence logic *)
    37: CASE Current_State OF
    38:     0: // Idle State
    39:         Fill_Valve_Cmd := FALSE;
    40:         Mixer_Motor_Cmd := FALSE;
    41:         IF DI_Start_Button AND Safety_OK THEN
    42:             Current_State := 10; // Transition to Filling
    43:         END_IF;
    44: 
    45:     10: // Filling State
    46:         Fill_Valve_Cmd := TRUE;
    47:         Mixer_Motor_Cmd := FALSE;
    48:         IF Fill_Timer.Q THEN
    49:             Current_State := 20; // Transition to Mixing
    50:         END_IF;
    51: 
    52:     20: // Mixing State
    53:         Fill_Valve_Cmd := FALSE;
    54:         Mixer_Motor_Cmd := TRUE;
    55:         IF Mix_Timer.Q THEN
    56:             Current_State := 0; // Transition back to Idle
    57:         END_IF;
    58: END_CASE;
    59: 
    60: // --- 3. GLOBAL CONDITIONS & RESETS ---
    61: // Immediately return to idle if safety is lost at any point
    62: IF NOT Safety_OK THEN
    63:     Current_State := 0;
    64: END_IF;
    65: 
    66: // --- 4. TIMER CALLS (RULE 8) ---
    67: (* Timers are called once per scan. Their IN condition handles start/reset. *)
    68: Fill_Timer(IN:=(Current_State = 10 AND Safety_OK), PT:=T#5s);
    69: Mix_Timer(IN:=(Current_State = 20 AND Safety_OK), PT:=T#10s);
    70: 
    71: 
    72: // --- 5. STATUS INDICATOR LOGIC ---
    73: System_Running := (Current_State > 0) AND Safety_OK;
    74: System_Faulted := NOT Safety_OK;
    75: 
    76: 
    77: // --- 6. OUTPUT MAPPING ---
    78: (* Rule 6 & 7: Map all command variables to physical outputs in one place, gated by safety. *)
    79: DO_Fill_Valve := Fill_Valve_Cmd AND Safety_OK;
    80: DO_Mixer_Motor := Mixer_Motor_Cmd AND Safety_OK;
    81: DO_Light_Running := System_Running;
    82: DO_Light_Fault := System_Faulted;
    \`\`\`
    `;
        }

        // Default to Allen-Bradley Style
        return `
    *** IMPORTANT STYLE GUIDE FOR STRUCTURED TEXT (ST) FOR ALLEN-BRADLEY (STUDIO 5000) ***
    When generating Structured Text (ST) for Allen-Bradley Studio 5000, you MUST follow these critical principles to produce robust, safe, and maintainable code. Your entire response containing ST MUST be a single, complete code block.

    1.  **Line Numbering (MANDATORY):** Every single line within the ST code block, including comments, declarations, logic, and blank lines, MUST be prefixed with a sequential line number (e.g., \`01\`, \`02\`, ..., \`99\`, \`100\`, \`101\`), followed by a colon and a single space. For numbers less than 10, you MUST pad them with a leading zero.

    2.  **Complete Declarations & Tag-Based Addressing:** Every ST code block MUST begin with a complete \`VAR ... END_VAR\` block. You MUST declare all variables used in the logic. Allen-Bradley uses tag-based addressing; there is no physical addressing like \`%I0.0\` in the code logic itself.

    3.  **Proper Commenting:** All explanatory text within the code MUST be formatted as a proper ST comment. Use \`(* ... *)\` for multi-line comments or section headers, and \`//\` for single-line comments. **DO NOT** include unformatted text, markdown headers like \`###\`, or language identifiers like \`st\` inside the code block.

    4.  **Fail-Safe Stop Logic:** A physical stop button (like an E-Stop) MUST be a Normally Closed (NC) contact. This means the PLC input is \`TRUE\` or \`1\` when the system is safe to run. In ST, this is checked with a condition like \`IF E_Stop_Healthy THEN ...\`. Be explicit about this assumption in your explanation.

    5.  **Consolidate Safety Conditions (DRY Principle):** Create a single intermediate boolean variable (e.g., \`Safety_OK\`) at the beginning of your logic block to represent the "permission to run". All subsequent logic that can affect motion or process MUST then be gated by this single variable. This improves readability and prevents errors.

    6.  **Separate Logic from Physical Outputs:** Use intermediate 'command' variables for your state machine and logic (e.g., \`Valve_A_Cmd\`, \`Mixer_On_Cmd\`). Then, at the very end of the code block, create a dedicated \`(* --- OUTPUT MAPPING --- *)\` section. In this section, and ONLY in this section, assign the state of the command variables to the physical output variables (e.g., \`DO_Fill_Valve\`). This assignment MUST also be gated by the main safety permissive (\`Safety_OK\`). Example: \`DO_Fill_Valve := Valve_A_Cmd AND Safety_OK;\`.

    7.  **Single Output Assignment (No Rung Fighting):** A physical output variable (\`DO_*\`) MUST NEVER be assigned a value using \`:=\` in more than one place. Rule #6 (Output Mapping) helps enforce this perfectly.

    8.  **Single, Unconditional Function Block Calls:** All timer and function block instances (e.g., \`TON\`, \`TOF\`, \`R_TRIG\`) MUST be called **exactly once per scan**. These calls MUST be grouped together in a dedicated section, typically **after** the main \`CASE\` statement for the state machine. The state machine itself should only **read** the outputs (e.g., \`.DN\`, \`.TT\`) of these blocks as conditions; it should **NEVER** call the instances themselves. This ensures predictable, scan-independent behavior.
        
        **CRITICAL VIOLATION:** Placing timer calls like \`My_Timer(...)\` inside a \`CASE\` statement or \`IF\` block is **STRICTLY FORBIDDEN**.

        **Correct Pattern:**
        \`\`\`st
        CASE Current_State OF
            10: (* State where timer should run *)
                IF My_Timer.DN THEN // CORRECT: Reading the timer's Done bit as a condition.
                    Current_State := 20;
                END_IF;
        END_CASE;
    
        (* Unconditional Timer Calls Section *)
        // CORRECT: Calling the timer instance once, outside of any conditional logic.
        // The 'IN' parameter is controlled by the state.
        My_Timer(IN:=(Current_State = 10), PRE:=5000); // PRE is the preset in milliseconds
        \`\`\`

    9.  **Correct Timer Implementation (On-Delay vs. Off-Delay):**
        *   **On-Delay (TON):** To delay an action from starting, use a \`TON\`. The action should be triggered by the timer's done bit (\`.DN\`).
            **Correct:** \`My_TON(IN:=Start_Condition, PRE:=5000); Output_Cmd := My_TON.DN;\`
        *   **Off-Delay (TOF):** To delay an action from stopping, use a \`TOF\`.
            **Correct:** \`My_TOF(IN:=Run_Condition, PRE:=2000); Motor_Run_Cmd := My_TOF.DN;\`
        *   **Simulating Off-Delay with TON (CRITICAL):**
            **Correct TON-based Off-Delay:**
            \`\`\`st
            Off_Delay_Timer(IN:= NOT Run_Condition AND Motor_Run_Cmd, PRE:=2000);
            Motor_Run_Cmd := (Run_Condition OR Motor_Run_Cmd) AND NOT Off_Delay_Timer.DN;
            \`\`\`

    10.  **Loop and Data Safety (CRITICAL):**
        *   **Loop Termination:** Any \`FOR\` or \`WHILE\` loop must have a guaranteed exit to prevent watchdog faults.
        *   **Data Integrity:** All division operations MUST be guarded by a non-zero check. Any variable used as an array index MUST be validated to be within bounds.

    11. **Code Reusability (DRY Principle - AOI):** You MUST avoid repeating logic. For Allen-Bradley, this means creating an Add-On Instruction (AOI). Show the definition of the AOI, then show how instances are declared and called.

    12. **Refactor Repeated State Logic (DRY Principle):** Refactor similar states (e.g., "Fill_A", "Fill_B") into a generic state ("FILLING") with a sub-state variable.

    **Correct Allen-Bradley ST Example with All Rules:**
    \`\`\`st
    01: (*
    02:   PLC Program: Simple Mixer Control (Studio 5000)
    03:   Description: This program controls a simple mixing sequence following best practices.
    04: *)
    05: VAR
    06:     (* Inputs - Assumed to be mapped to physical I/O elsewhere *)
    07:     DI_Start_Button : BOOL;
    08:     DI_Stop_Button : BOOL; // Assumed to be from a physical NC button circuit
    09:     DI_EStop_Healthy : BOOL; // Assumed to be from a physical NC E-Stop circuit
    10: 
    11:     (* Outputs - Assumed to be mapped to physical I/O elsewhere *)
    12:     DO_Fill_Valve : BOOL;
    13:     DO_Mixer_Motor : BOOL;
    14:     DO_Light_Running : BOOL;
    15:     DO_Light_Fault : BOOL;
    16: 
    17:     (* Internal State & Timers *)
    18:     Current_State : DINT := 0; // 0:Idle, 10:Filling, 20:Mixing
    19:     Safety_OK : BOOL;
    20:     Fill_Timer : TON;
    21:     Mix_Timer : TON;
    22: 
    23:     (* Intermediate Commands & Status *)
    24:     Fill_Valve_Cmd : BOOL;
    25:     Mixer_Motor_Cmd : BOOL;
    26:     System_Running : BOOL;
    27:     System_Faulted : BOOL;
    28: END_VAR
    29: 
    30: // --- 1. SAFETY & PERMISSIVES ---
    31: (* Rule 4 & 5: Consolidate all safety conditions into a single variable *)
    32: Safety_OK := DI_Stop_Button AND DI_EStop_Healthy;
    33: 
    34: 
    35: // --- 2. STATE MACHINE LOGIC ---
    36: (* This CASE statement controls the main sequence logic *)
    37: CASE Current_State OF
    38:     0: // Idle State
    39:         Fill_Valve_Cmd := FALSE;
    40:         Mixer_Motor_Cmd := FALSE;
    41:         IF DI_Start_Button AND Safety_OK THEN
    42:             Current_State := 10; // Transition to Filling
    43:         END_IF;
    44: 
    45:     10: // Filling State
    46:         Fill_Valve_Cmd := TRUE;
    47:         Mixer_Motor_Cmd := FALSE;
    48:         IF Fill_Timer.DN THEN // Use .DN for Done bit
    49:             Current_State := 20; // Transition to Mixing
    50:         END_IF;
    51: 
    52:     20: // Mixing State
    53:         Fill_Valve_Cmd := FALSE;
    54:         Mixer_Motor_Cmd := TRUE;
    55:         IF Mix_Timer.DN THEN // Use .DN for Done bit
    56:             Current_State := 0; // Transition back to Idle
    57:         END_IF;
    58: END_CASE;
    59: 
    60: // --- 3. GLOBAL CONDITIONS & RESETS ---
    61: // Immediately return to idle if safety is lost at any point
    62: IF NOT Safety_OK THEN
    63:     Current_State := 0;
    64: END_IF;
    65: 
    66: // --- 4. TIMER CALLS (RULE 8) ---
    67: (* Timers are called once per scan. Their IN condition handles start/reset. *)
    68: Fill_Timer(IN:=(Current_State = 10 AND Safety_OK), PRE:=5000); // PRE in ms
    69: Mix_Timer(IN:=(Current_State = 20 AND Safety_OK), PRE:=10000); // PRE in ms
    70: 
    71: 
    72: // --- 5. STATUS INDICATOR LOGIC ---
    73: System_Running := (Current_State > 0) AND Safety_OK;
    74: System_Faulted := NOT Safety_OK;
    75: 
    76: 
    77: // --- 6. OUTPUT MAPPING ---
    78: (* Rule 6 & 7: Map all command variables to physical outputs in one place, gated by safety. *)
    79: DO_Fill_Valve := Fill_Valve_Cmd AND Safety_OK;
    80: DO_Mixer_Motor := Mixer_Motor_Cmd AND Safety_OK;
    81: DO_Light_Running := System_Running;
    82: DO_Light_Fault := System_Faulted;
    \`\`\`
    `;
    })();


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

    *** IMPORTANT STYLE GUIDE FOR LADDER LOGIC ***
    ${ladderStyleGuide}

    ${stStyleGuide}

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
    * Verifying main power is disconnected and Locked-Out/Tagged-Out (LOTO).
    * Using a multimeter to confirm 0 volts on input terminals (L1, L2, L3).
    * Wearing appropriate Personal Protective Equipment (PPE).
    * Ensuring the motor shaft is free to rotate and disconnected from the load for initial tests.
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
        // FIX: Replaced potentially problematic '*-**' placeholders with 'x-xx' to prevent any possibility of the parser misinterpreting it as an arithmetic operation.
        expertKnowledge = "Your analysis for this Danfoss VLT FC 302 fault/warning must be highly specific, based on its programming guide. Differentiate between a Warning (W) and an Alarm (A). List the exact causes and corrective actions from the manual. Reference relevant parameters from groups 14-xx (Special Functions) or 1-xx (Load/Motor) that may need to be checked.";
    } else if (vfdBrand === 'Mitsubishi Electric' && vfdModel === 'FR-E800') {
        expertKnowledge = "Your analysis for this Mitsubishi FR-E800 fault must be highly specific, based on its instruction manual. List the exact causes and corrective actions from the manual for this specific error code (e.g., E.OC1, E.OV1).";
    } else if (vfdBrand === 'Mitsubishi Electric' && vfdModel === 'FR-D700') {
        expertKnowledge = "Your analysis for this Mitsubishi FR-D700 fault must be highly specific, based on its instruction manual (IB-0600438). List the exact causes and corrective actions from the manual for this specific error code (e.g., E.OC1, E.UVT, E.THM).";
    } else if (vfdBrand === 'Eaton' && vfdModel === 'PowerXL DG1') {
        expertKnowledge = "Your analysis for this Eaton PowerXL DG1 fault must be highly specific, based on its instruction manual (MN040010). List the exact causes and corrective actions from the manual for this specific error code (e.g., E-01, E-02). Reference relevant parameters from Group P6 (Protection) that might be related.";
    } else if (vfdBrand === 'Siemens' && vfdModel === 'Micromaster 440') {
        expertKnowledge = `Your analysis for this Siemens Micromaster 440 fault must be highly specific, based on its official manual. List the exact causes and corrective actions for this fault code (e.g., F0001, F0002, F0003, F0004). Reference relevant parameters like P1120 (Accel time), P1121 (Decel time), or motor data parameters (P03xx) that may need to be checked.`;
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
    return callApiEndpoint('analyzeFaultCode', { prompt });
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
    return callApiEndpoint('analyzeAsciiFrame', { prompt });
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
    * If the code appears to be sound and does not violate the rules, your response must start with the single character ✅ followed by a detailed explanation of why the logic is robust.
    * If the code could possibly violate a rule, your response must start with the single character ❌ followed by a "counterexample" or scenario that demonstrates how the violation can occur.
    * If you detect a violation of the fail-safe principle (e.g., an XIO on an E-Stop tag), you MUST treat it as a critical vulnerability and provide a counterexample explaining the danger (e.g., what happens if a wire breaks).
    Your explanation must be rigorous and logical.

    **IMPORTANT:** You MUST append the following disclaimer to the end of your entire response, exactly as written:
    ${disclaimer}
    
    ${langInstruction}`;
    return callApiEndpoint('verifyCriticalLogic', { prompt });
};

export const generateSensorRecommendation = async (params: SensorRecommendationParams): Promise<string> => {
    const { language, details } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';

    const systemInstruction = `You are a world-class instrumentation and process engineer, synthesizing the expertise from three key texts: Antonio Creus's "Instrumentación Industrial, 8th Edition," Carl Branan's "The Process Engineer's Pocket Handbook," and the VEGA catalog "Tecnología de medición de nivel y presión para el tratamiento de aguas residuales." Your recommendations must be grounded in the detailed technical comparisons from Creus, the practical process considerations from Branan, and the specific application examples from the VEGA catalog.

Your main task is to analyze user-provided application details and generate an expert-level sensor recommendation.

Your response MUST be a valid JSON object that strictly adheres to the provided schema. The \`justification\` should be detailed and reference the user's specific inputs. Provide 2 to 3 recommendations, with the first one being the top choice.

*** STANDARDS & DIRECTIVES (CRITICAL) ***
1.  **Standard Override:** If the user provides an "Estándar de Termopar Específico", you MUST use that standard for the wiring warning, ignoring the "País/Región de Instalación" field for color code selection.
2.  **Geographic Context:** Use the "País/Región de Instalación" field to determine the predominant instrumentation standard for thermocouples.
    *   **North America (Mexico, USA, Canada):** Assume ANSI MC96.1 (RED is NEGATIVE).
    *   **Japan:** Assume JIS C 1602.
    *   **Germany:** State the current IEC 60584 standard, but add a warning about the legacy DIN 43710 standard.
    *   **Other Regions:** Default to IEC 60584.
3.  **Thermocouple Wiring Warning:** If your top recommendation is a thermocouple, you MUST populate the "wiringWarning" object with the correct color code details based on the geographic context.
4.  **Classified Area Validation:** The "suggestedModels" MUST match the requested "Clasificación de Área".
    *   If "Class/Division" is requested, suggest models with FM, UL, or CSA approval.
    *   If "ATEX/IECEx" is requested, suggest models with ATEX/IECEx approval.
    *   Mention any conflicts (e.g., user in "Mexico" requesting "ATEX").
`;
    
    const prompt = `--- APPLICATION DETAILS ---
${details}
--- END OF DETAILS ---

Now, generate the JSON response following the schema.
${langInstruction}`;

    const config = {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                recommendations: {
                    type: Type.ARRAY,
                    description: "List of 2-3 sensor recommendations, with the top choice first.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            isTopChoice: { type: Type.BOOLEAN, description: "True if this is the top recommended choice." },
                            technology: { type: Type.STRING, description: "Name of the sensor technology." },
                            justification: { type: Type.STRING, description: "Detailed explanation for why this sensor is a good fit, especially for the top choice." },
                            ratings: {
                                type: Type.OBJECT,
                                properties: {
                                    precision: { type: Type.INTEGER, description: "Rating from 1 to 5 (5 is best)." },
                                    cost: { type: Type.INTEGER, description: "Rating from 1 to 5 (5 is lowest cost)." },
                                    robustness: { type: Type.INTEGER, description: "Rating from 1 to 5 (5 is best)." },
                                    easeOfInstallation: { type: Type.INTEGER, description: "Rating from 1 to 5 (5 is easiest)." }
                                },
                                required: ['precision', 'cost', 'robustness', 'easeOfInstallation']
                            },
                            suggestedModels: { type: Type.STRING, description: "Example models and brands that fit the application and area classification." },
                        },
                        required: ['isTopChoice', 'technology', 'justification', 'ratings', 'suggestedModels']
                    }
                },
                installationConsiderations: {
                    type: Type.ARRAY,
                    description: "A bulleted list of 2-3 critical installation tips for the top choice technology.",
                    items: { type: Type.STRING }
                },
                wiringWarning: {
                    type: Type.OBJECT,
                    description: "An optional warning about wiring standards, only to be included if the top recommendation is a thermocouple.",
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING }
                    },
                    nullable: true
                },
                modelsDisclaimer: {
                    type: Type.STRING,
                    description: "The standard disclaimer for model suggestions."
                },
                implementationGuide: {
                    type: Type.STRING,
                    description: "The sample PLC code snippet in Structured Text (ST) for scaling a 4-20mA signal in Rockwell format."
                }
            },
            required: ['recommendations', 'installationConsiderations', 'modelsDisclaimer', 'implementationGuide']
        }
    };
    
    return callApiEndpoint('generateSensorRecommendation', { prompt, config: { systemInstruction, ...config } });
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
    - **IMPORTANT:** If an issue suggests refactoring to a state machine, you MUST perform this refactoring. Replace the chained seal-in rungs with a proper state machine using a single integer tag (e.g., 'Sequence_Step') and explicit state transitions.

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
    return callApiEndpoint('getNetworkHardwarePlan', { prompt });
};