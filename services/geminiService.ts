// Import necessary types and classes from the GenAI SDK for direct API calls in local development.
import { GoogleGenAI, GenerateContentRequest } from '@google/genai';

// --- START of updated API call logic ---

// This service intelligently switches between calling the Gemini API directly
// for local development and using a secure serverless function for production.

// Determine if we are in a local development environment with a provided API key.
// `process.env.API_KEY` is injected by Vite during the local development process.
const isLocalDevWithApiKey = !!process.env.API_KEY;

let ai: GoogleGenAI | null = null;
// Initialize the GenAI client only if we are in local development and have a key.
if (isLocalDevWithApiKey) {
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
    if (isLocalDevWithApiKey && ai) {
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

            // The validatePlcLogic task has a special schema config that needs to be included.
            if (task === 'validatePlcLogic' && params.schema) {
                request.config = {
                    ...request.config,
                    responseMimeType: 'application/json',
                    responseSchema: params.schema,
                };
            }
            
            const response = await ai.models.generateContent(request);
            return response.text;
        } catch (error) {
            console.error(`[Local Dev] Gemini API call failed for task '${task}':`, error);
            const originalErrorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to get a response directly from Gemini. Details: ${originalErrorMessage}`);
        }
    } 
    // Otherwise, use the serverless function (for production on Vercel or local dev without a key).
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

export interface LogicIssue {
    line: number;
    type: 'Error' | 'Warning' | 'Info';
    message: string;
}

export const generateChatResponse = async (messages: Message[], context: ChatContext): Promise<string> => {
    const langInstruction = context.language === 'es' ? 'Responde en español.' : 'Respond in English.';
    let prompt = "";
    messages.forEach((m: { role: string; parts: { text: string }[] }) => {
        prompt += `${m.role}: ${m.parts[0].text}\n\n`;
    });

    const systemInstruction = `You are a world-class industrial automation expert specializing in ${context.topic}.
    The user is working with ${context.topic === 'VFD' ? `${context.vfdBrand || 'a general'} model ${context.vfdModel || 'VFD'}` : `${context.plcBrand || 'a general'} PLC with ${context.plcSoftware || 'general software'}`}.
    Provide clear, concise, and technically accurate advice. Use markdown for code blocks, lists, and emphasis.
    ${langInstruction}`;

    return callApiEndpoint('generateChatResponse', { prompt, config: { systemInstruction } });
};

export const generateLogicChatResponse = async (messages: Message[], language: 'en' | 'es'): Promise<string> => {
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    let prompt = "";
    messages.forEach((m: { role: string; parts: { text: string }[] }) => {
        prompt += `${m.role}: ${m.parts[0].text}\n\n`;
    });

    const systemInstruction = `You are a senior control systems engineer. Your task is to help the user design a control philosophy and generate PLC code.
    First, discuss the control philosophy, covering sequences, states, interlocks, and fault handling.
    Once the philosophy is agreed upon, generate the PLC code in a structured and well-commented format.
    Prioritize safety, robustness, and clarity. Use markdown for all responses.
    ${langInstruction}`;

    return callApiEndpoint('generateLogicChatResponse', { prompt, config: { systemInstruction } });
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

    The output must be in markdown and include:
    1.  **Safety Warning:** A clear warning about electrical hazards.
    2.  **Power Wiring:** Instructions for connecting L1, L2, L3 and U, V, W. Specify wire gauge recommendations.
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

export const translatePlcCode = async (params: { language: 'en' | 'es'; code: string; targetLanguage: string }): Promise<string> => {
    const { language, code, targetLanguage } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Translate the following PLC code to ${targetLanguage}.
    The source language is not specified, you must infer it from the syntax.
    
    Source Code:
    \`\`\`
    ${code}
    \`\`\`
    
    Provide only the translated code inside a single markdown code block for ${targetLanguage}. Do not add any extra explanation or text outside the code block.
    
    ${langInstruction}`;
    return callApiEndpoint('translatePlcCode', { prompt });
};

export const validatePlcLogic = async (params: { language: 'en' | 'es', code: string }): Promise<string> => {
    const { language, code } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const prompt = `Analyze the provided PLC logic, which uses a simplified text-based format (XIC, XIO, OTE, etc.).
    Your task is to identify errors, potential race conditions, and violations of standard ladder logic practices.
    
    Code to analyze:
    \`\`\`
    ${code}
    \`\`\`
    
    If you find issues, provide them in the requested JSON format. If there are no issues, provide an empty array.
    ${langInstruction}`;
    
    // The schema is now defined here, without enums, to be sent to the API.
    const schema = {
        type: 'ARRAY',
        items: {
            type: 'OBJECT',
            properties: {
                line: { type: 'INTEGER' },
                type: { type: 'STRING' },
                message: { type: 'STRING' },
            },
            required: ["line", "type", "message"],
        },
    };

    return callApiEndpoint('validatePlcLogic', { prompt, schema });
};

export const suggestPlcLogicFix = async (params: { language: 'en' | 'es', code: string, issues: LogicIssue[] }): Promise<string> => {
    const { language, code, issues } = params;
    const langInstruction = language === 'es' ? 'Responde en español.' : 'Respond in English.';
    const issuesString = issues.map((i: any) => `- Line ${i.line} (${i.type}): ${i.message}`).join('\n');
    const prompt = `Given the following PLC code and a list of identified issues, rewrite the code to fix the issues and follow best practices.

    Original Code:
    \`\`\`
    ${code}
    \`\`\`
    
    Identified Issues:
    ${issuesString}
    
    Provide only the corrected code inside a single markdown code block. Do not add any extra explanation or text.
    
    ${langInstruction}`;
    return callApiEndpoint('suggestPlcLogicFix', { prompt });
};
