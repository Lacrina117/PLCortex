
// FIX: Declare process.env to resolve TypeScript errors in a Vite environment
declare const process: {
  env: {
    API_KEY?: string;
  };
};

import { GoogleGenAI, GenerateContentParameters as GenerateContentRequest, Type, Schema } from '@google/genai';
import { vfdTerminalData } from '../constants/vfdTerminalData';

const useDirectClientCall = !!process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (useDirectClientCall) {
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    } catch(e) {
        console.error("Failed to initialize GoogleGenAI for local development.", e);
        ai = null;
    }
}

// Helper to call standard non-streaming endpoints
const callApiEndpoint = async (task: string, params: any, modelOverride?: string): Promise<{ text: string; groundingMetadata?: any }> => {
    const model = modelOverride || 'gemini-2.5-flash';
    
    if (useDirectClientCall && ai) {
        try {
            if (!params.contents) throw new Error('Request params must include contents.');
            let request: GenerateContentRequest = { model, contents: params.contents };
            if (params.config) request.config = params.config;
            const response = await ai.models.generateContent(request);
            return { text: response.text || "", groundingMetadata: response.candidates?.[0]?.groundingMetadata };
        } catch (error) {
            console.error(`[Local Dev] Gemini API call failed for task '${task}':`, error);
            throw new Error(`Failed to get a response directly from Gemini.`);
        }
    } else {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task, params, model }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown API error" }));
                throw new Error(errorData.details || errorData.error || `API Error: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`[Serverless] API call failed for task '${task}':`, error);
            throw error;
        }
    }
};

export interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: number;
}

export interface ChatContext {
    topic: 'VFD' | 'PLC';
    language: 'en' | 'es';
    vfdBrand?: string;
    vfdModel?: string;
    plcBrand?: string;
    plcSoftware?: string;
    plcVersion?: string;
    plcLanguage?: string;
}

export interface PracticeParams {
    topic: 'VFD' | 'PLC';
    difficulty: string;
    language: 'en' | 'es';
    vfdBrand?: string;
    vfdModel?: string;
    plcBrand?: string;
    plcSoftware?: string;
    plcLanguage?: string;
}

export interface WiringGuideParams {
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

export interface LogicIssue {
    line: number;
    type: 'Error' | 'Warning';
    message: string;
}

export interface LogEntry {
    equipment: string;
    failure: string;
    action: string;
    criticality: 1 | 2 | 3;
    status: 'RESUELTO' | 'PENDIENTE';
}

// --- STREAMING CHAT IMPLEMENTATION ---
export async function* generateChatResponse(messages: Message[], context: ChatContext): AsyncGenerator<string, void, unknown> {
    const systemInstruction = `You are PLCortex, an expert Industrial Automation Engineer. 
    Language: ${context.language === 'es' ? 'Spanish' : 'English'}.
    Context: Topic=${context.topic}, PLC=${context.plcBrand}/${context.plcSoftware}, VFD=${context.vfdBrand}/${context.vfdModel}.
    
    *** CRITICAL CODE GENERATION RULES (IEC 61131-3) ***
    1. ASSIGNMENT: Use ':=' for assignment.
    2. EQUALITY: Use '=' for comparison.
    3. TERMINATION: End statements with ';'.
    
    Provide concise, technical answers. Use Markdown for code blocks.`;

    const contents = messages.map(msg => ({
        role: msg.role,
        parts: msg.parts
    }));

    const config = {
        systemInstruction,
        temperature: 0.7, 
    };

    if (useDirectClientCall && ai) {
        // Local Streaming
        try {
            const stream = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents,
                config
            });
            for await (const chunk of stream) {
                if (chunk.text) yield chunk.text;
            }
        } catch (e) {
            console.error("Local stream error", e);
            throw new Error("Failed to generate stream locally.");
        }
    } else {
        // Server Streaming (Vercel Edge)
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents, config, model: 'gemini-3-flash-preview' }),
            });

            if (!response.ok) throw new Error(`Stream Error: ${response.status}`);
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                yield decoder.decode(value, { stream: true });
            }
        } catch (error) {
            console.error('Chat streaming error:', error);
            throw error;
        }
    }
}

// --- EXISTING FUNCTIONS FOR TOOLS (Non-Streaming) ---

export const generatePractice = async (params: PracticeParams): Promise<string> => {
    const isSpanish = params.language === 'es';
    const languageName = isSpanish ? 'Spanish' : 'English';
    const context = params.topic === 'PLC'
        ? `PLC Brand: ${params.plcBrand}, Software: ${params.plcSoftware}, Language: ${params.plcLanguage}`
        : `VFD Brand: ${params.vfdBrand}, Model: ${params.vfdModel}`;

    const prompt = `
    Create a unique, realistic industrial automation practice problem.
    Topic: ${params.topic}
    Difficulty: ${params.difficulty}
    Context: ${context}
    Language: ${languageName}

    Structure the response exactly as follows using Markdown:
    ### Scenario
    (Describe a realistic factory situation)
    ### Requirements
    (Bulleted list of technical requirements)
    ### Hint
    (A helpful clue without giving away the answer)
    ### Solution
    (Full, SYNTAX-CHECKED solution code. Ensure it uses standard IEC 61131-3 syntax precisely.)
    `;

    try {
        const response = await callApiEndpoint('generatePractice', {
            contents: [{ parts: [{ text: prompt }] }],
            config: { temperature: 0.7 }
        }, 'gemini-3-flash-preview');
        return response.text;
    } catch (error) {
        throw new Error(isSpanish ? 'Error al generar la práctica.' : 'Failed to generate practice.');
    }
};

export const generateWiringGuide = async (params: WiringGuideParams): Promise<string> => {
    const isSpanish = params.language === 'es';
    const prompt = `
    Generate a detailed wiring guide and connection diagram description.
    Device: ${params.vfdBrand} ${params.vfdModel}
    Motor: ${params.motorHp}HP, ${params.motorVoltage}V, ${params.motorFla}A
    Control: ${params.controlMethod} via ${params.plcSoftware}
    Application: ${params.application}
    Language: ${isSpanish ? 'Spanish' : 'English'}

    Include:
    1. Power wiring (L1/L2/L3 to U/V/W).
    2. Control wiring pinouts (specific to this VFD model).
    3. Parameter settings required for this control method.
    `;

    try {
        const response = await callApiEndpoint('generateWiring', {
            contents: [{ parts: [{ text: prompt }] }]
        });
        return response.text;
    } catch (error) {
        throw new Error('Failed to generate wiring guide.');
    }
};

export const generateCommissioningChatResponse = async (messages: Message[], language: 'en' | 'es', brand: string, model: string, application: string): Promise<string> => {
    const systemInstruction = `You are an expert Commissioning Engineer for Variable Frequency Drives (VFDs).
    Device: ${brand} ${model}
    Application: ${application}
    Language: ${language === 'es' ? 'Spanish' : 'English'}
    
    Your goal is to guide the user step-by-step through commissioning.
    Format:
    [Your text response here...]
    { "diagram_terminals": ["ID1", "ID2"] }
    `;

    const contents = messages.map(msg => ({
        role: msg.role,
        parts: msg.parts
    }));

    try {
        const response = await callApiEndpoint('commissioningChat', {
            contents,
            config: { systemInstruction }
        }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) {
        throw new Error('Failed to generate response.');
    }
};

export const analyzeFaultCode = async (params: { language: 'en' | 'es'; vfdBrand: string; vfdModel: string; faultCode: string; context: string; imageBase64?: string; mimeType?: string }): Promise<string> => {
    const isSpanish = params.language === 'es';
    let prompt = `
    Analyze the following VFD Fault.
    Brand: ${params.vfdBrand}
    Model: ${params.vfdModel}
    Fault Code: ${params.faultCode}
    User Context: ${params.context}
    Language: ${isSpanish ? 'Spanish' : 'English'}

    Provide:
    1. The official name and meaning of the fault.
    2. 3-4 distinct potential root causes (electrical, mechanical, or parameter).
    3. Step-by-step troubleshooting actions.
    `;

    const parts: any[] = [{ text: prompt }];
    if (params.imageBase64) {
        parts.push({
            inlineData: {
                mimeType: params.mimeType || 'image/jpeg',
                data: params.imageBase64
            }
        });
    }

    try {
        const response = await callApiEndpoint('analyzeFaultCode', { contents: [{ parts }] }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) {
        throw new Error('Failed to analyze fault.');
    }
};

export const analyzeScanTime = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    const prompt = `Analyze scan time impact. Lang: ${params.language}. Code: ${params.code}`;
    try {
        const response = await callApiEndpoint('analyzeScanTime', { contents: [{ parts: [{ text: prompt }] }] }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) { throw new Error('Failed to analyze scan time.'); }
};

export const generateEnergyEfficiencyPlan = async (params: { language: 'en' | 'es'; applicationType: string; loadProfile: string }): Promise<string> => {
    const prompt = `Create VFD Energy Plan. App: ${params.applicationType}. Load: ${params.loadProfile}. Lang: ${params.language}`;
    try {
        const response = await callApiEndpoint('generateEnergy', { contents: [{ parts: [{ text: prompt }] }] }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) { throw new Error('Failed to generate energy plan.'); }
};

export const verifyCriticalLogic = async (params: { language: 'en' | 'es'; code: string; rules: string }): Promise<string> => {
    const prompt = `Verify logic safety. Rules: ${params.rules}. Code: ${params.code}. Lang: ${params.language}`;
    try {
        const response = await callApiEndpoint('verifyLogic', { contents: [{ parts: [{ text: prompt }] }] }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) { throw new Error('Failed to verify logic.'); }
};

export const validatePlcLogic = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    const prompt = `
    Strict PLC Logic Audit (IEC 61131-3).
    Return JSON array: [{ "line": number, "type": "Error" | "Warning", "message": "concise description" }]
    Code: ${params.code}
    `;
    try {
        const response = await callApiEndpoint('validateLogic', {
            contents: [{ parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json' }
        }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) {
        throw new Error("Failed to validate logic.");
    }
};

export const suggestPlcLogicFix = async (params: { language: 'en' | 'es'; code: string; issues: LogicIssue[] }): Promise<string> => {
    const prompt = `Fix PLC code issues. Issues: ${JSON.stringify(params.issues)}. Code: ${params.code}. Lang: ${params.language}`;
    try {
        const response = await callApiEndpoint('fixLogic', { contents: [{ parts: [{ text: prompt }] }] }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) { throw new Error("Failed to suggest fix."); }
};

export const analyzeAsciiFrame = async (params: { language: 'en' | 'es'; frame: string }): Promise<string> => {
    const prompt = `Decode ASCII Frame: ${params.frame}. Lang: ${params.language}`;
    try {
        const response = await callApiEndpoint('analyzeAscii', { contents: [{ parts: [{ text: prompt }] }] }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) { throw new Error('Failed to analyze ASCII.'); }
};

export const getNetworkHardwarePlan = async (params: { language: 'en' | 'es'; protocols: string[] }): Promise<string> => {
    const prompt = `Design network bridge for: ${params.protocols.join(', ')}. Lang: ${params.language}`;
    try {
        const response = await callApiEndpoint('networkPlan', { contents: [{ parts: [{ text: prompt }] }] }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) { throw new Error('Failed to plan network.'); }
};

export const translateLadderToText = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    const prompt = `Convert Ladder to ST. Input: ${params.code}`;
    try {
        const response = await callApiEndpoint('ladderToText', { contents: [{ parts: [{ text: prompt }] }] }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) { return params.code; }
};

export const analyzeMotorNameplate = async (params: { imageDataBase64: string; mimeType: string }): Promise<{ nominalCurrent?: string; serviceFactor?: string }> => {
    const prompt = `Extract 'Nominal Current (FLA)' and 'Service Factor (SF)' from motor nameplate image. Return JSON.`;
    try {
        const response = await callApiEndpoint('analyzePlate', {
            contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: params.mimeType, data: params.imageDataBase64 } }] }],
            config: { responseMimeType: 'application/json' }
        }, 'gemini-2.5-flash');
        return JSON.parse(response.text);
    } catch (error) { throw new Error('Failed to analyze nameplate.'); }
};

export const generateSensorRecommendation = async (params: { language: 'en' | 'es'; details: string }): Promise<string> => {
    const systemInstruction = params.language === 'es' ? "Experto en instrumentación. JSON estricto." : "Instrumentation expert. Strict JSON.";
    const prompt = `Recommend sensors. Details: ${params.details}. Return strictly valid JSON schema.`;
    const schema: Schema = { type: Type.OBJECT, properties: { recommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { isTopChoice: { type: Type.BOOLEAN }, technology: { type: Type.STRING }, justification: { type: Type.STRING }, ratings: { type: Type.OBJECT, properties: { precision: { type: Type.INTEGER }, cost: { type: Type.INTEGER }, robustness: { type: Type.INTEGER }, easeOfInstallation: { type: Type.INTEGER } } }, suggestedModels: { type: Type.STRING } } } }, installationConsiderations: { type: Type.ARRAY, items: { type: Type.STRING } }, wiringWarning: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING } } }, modelsDisclaimer: { type: Type.STRING }, implementationGuide: { type: Type.OBJECT, properties: { st: { type: Type.STRING }, wiring: { type: Type.STRING } } } } };
    try {
        const response = await callApiEndpoint('generateSensorRecommendation', {
            contents: [{ parts: [{ text: prompt }] }],
            config: { systemInstruction, responseMimeType: 'application/json', responseSchema: schema, temperature: 0.2 }
        }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) { throw new Error('Failed to generate recommendation.'); }
};

export const convertPlcCode = async (params: { language: 'en' | 'es'; sourceBrand: string; sourcePlatform: string; targetBrand: string; targetPlatform: string; code: string; }): Promise<string> => {
    const prompt = `Migrate PLC code from ${params.sourceBrand} to ${params.targetBrand}. Code: ${params.code}. Lang: ${params.language}`;
    try {
        const response = await callApiEndpoint('migrateCode', { contents: [{ parts: [{ text: prompt }] }] }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) { throw new Error('Failed to migrate code.'); }
};

export const structureLogEntry = async (rawText: string): Promise<LogEntry> => {
    const prompt = `Convert maintenance log to JSON. Input: "${rawText}"`;
    const schema: Schema = { type: Type.OBJECT, properties: { equipment: { type: Type.STRING }, failure: { type: Type.STRING }, action: { type: Type.STRING }, criticality: { type: Type.INTEGER }, status: { type: Type.STRING, enum: ['RESUELTO', 'PENDIENTE'] } }, required: ['equipment', 'failure', 'action', 'criticality', 'status'] };
    try {
        const response = await callApiEndpoint('structureLog', { contents: [{ parts: [{ text: prompt }] }], config: { responseMimeType: 'application/json', responseSchema: schema } }, 'gemini-2.5-flash');
        return JSON.parse(response.text);
    } catch (error) { throw new Error('Failed to structure log entry.'); }
};

export const generateShiftReport = async (logs: any[], language: 'en' | 'es'): Promise<string> => {
    const prompt = `Write Shift Handover Report (Markdown). Logs: ${JSON.stringify(logs)}. Lang: ${language}`;
    try {
        const response = await callApiEndpoint('generateShiftReport', { contents: [{ parts: [{ text: prompt }] }] }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) { throw new Error('Failed to generate shift report.'); }
};
