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
        if (context.topic === 'VFD') {
            if (context.vfdBrand && context.vfdBrand !== 'General') {
                const modelStr = context.vfdModel && context.vfdModel !== 'General' ? ` ${context.vfdModel}` : '';
                return `The user is working with a ${context.vfdBrand}${modelStr} VFD.`;
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

export const generateCommissioningChatResponse = async (messages: Message[], language: 'en' | 'es', vfdBrand?: string, vfdModel?: string): Promise<string> => {
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    let prompt = "";
    messages.forEach((m: { role: string; parts: { text: string }[] }) => {
        prompt += `${m.role}: ${m.parts[0].text}\n\n`;
    });

    const systemInstruction = `You are a VFD commissioning expert, acting as an interactive guide.
    The user is commissioning a ${vfdBrand} ${vfdModel}.
    Your role is to guide them step-by-step. Keep responses concise. Ask questions to confirm steps are complete.
    When discussing wiring, reference specific terminal numbers for the ${vfdModel}.
    **Crucially, if your response involves specific terminals on a wiring diagram, you must append a JSON object to the end of your text response.**
    The JSON object must have a key "diagram_terminals" which is an array of strings, where each string is the ID of a terminal to highlight (e.g., ["STF", "STR", "SD"]).
    The terminal IDs must match the ones provided in the application's diagram data. Do not invent terminal IDs.
    Example response format:
    "Great, next connect the start signal to terminal DI1 and common to terminal DCOM.
    {"diagram_terminals": ["DI1", "DCOM"]}"

    ${langInstruction}`;

    return callApiEndpoint('generateCommissioningChatResponse', { 
        prompt, 
        config: { systemInstruction, temperature: 0.2 } 
    });
};

export const analyzeFaultCode = async (params: { language: 'en' | 'es'; vfdBrand: string; vfdModel: string; faultCode: string; context: string }): Promise<string> => {
    const { language, vfdBrand, vfdModel, faultCode, context } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Act as a senior VFD troubleshooter. Analyze the following fault.
    VFD: ${vfdBrand} ${vfdModel}
    Fault Code: ${faultCode}
    Context: ${context}

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
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Act as a formal verification system for PLC logic.
    You will be given a piece of PLC code and a set of immutable safety rules.
    Your task is to determine if the code can EVER violate any of the rules.

    Code:
    \`\`\`
    ${code}
    \`\`\`
    
    Immutable Rules:
    ${rules}

    Analyze the logic against the rules.
    - If the code is proven to be safe and can NEVER violate the rules, your response must start with the single character ✅ followed by a detailed explanation of why the logic is sound.
    - If the code COULD POSSIBLY violate a rule, your response must start with the single character ❌ followed by a "counterexample" or scenario that demonstrates how the violation can occur.
    Your explanation must be rigorous and logical.
    
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

    Your response MUST be a valid JSON array of objects. Each object represents an issue and must have these keys:
    - "line": The 1-based line number where the issue was found.
    - "type": A string, either "Error" (for definite problems like duplicate outputs) or "Warning" (for style issues or potential problems).
    - "message": A clear, concise description of the issue.

    If there are no issues, return an empty JSON array: [].
    Do not add any explanation or text outside of the JSON array.
    
    Example of a response with issues:
    [
        {"line": 2, "type": "Error", "message": "OTE for 'Motor' is used on multiple rungs. This can cause unpredictable behavior."},
        {"line": 3, "type": "Warning", "message": "This rung appears to be dead code and will never execute."}
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