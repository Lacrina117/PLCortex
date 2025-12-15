
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

const callApiEndpoint = async (task: string, params: any): Promise<{ text: string; groundingMetadata?: any }> => {
    // FORCE: Use gemini-3-pro-preview specifically for all tasks to ensure maximum robustness
    const model = 'gemini-3-pro-preview';
    
    if (useDirectClientCall && ai) {
        try {
            let request: GenerateContentRequest = { model };
            if (params.contents) request.contents = params.contents;
            else throw new Error('Request params must include contents.');
            
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
                body: JSON.stringify({ task, params }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Unknown API error" }));
                throw new Error(`API Error: ${response.status} - ${errorData.details || errorData.error}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`[Serverless] API call failed for task '${task}':`, error);
            throw new Error(`Failed to get a response from the server.`);
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

// ... (existing interfaces for PracticeParams, WiringGuideParams, etc. remain unchanged) ...
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

export interface CommissioningPlanParams {
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

// --- Helper Functions for Style Guides (Existing functions omitted for brevity but presumed present) ---
const getLadderStyleGuide = (plcBrand?: string, plcSoftware?: string) => {
    // ... implementation
    return '';
};
const getStructuredTextStyleGuide = (plcBrand?: string) => {
    // ... implementation
    return '';
};

// --- Main Exported Functions ---

// ... (Existing functions: generateChatResponse, generatePractice, generateWiringGuide, etc. omitted for brevity) ...
export const generateChatResponse = async (messages: Message[], context: ChatContext): Promise<string> => {
    // ... existing implementation
    return "";
};

export const generatePractice = async (params: PracticeParams): Promise<string> => {
    // ... existing implementation
    return "";
};

export const generateWiringGuide = async (params: WiringGuideParams): Promise<string> => {
    // ... existing implementation
    return "";
};

export const generateCommissioningChatResponse = async (messages: Message[], language: 'en' | 'es', brand: string, model: string, application: string): Promise<string> => {
    // ... existing implementation
    return "";
};

export const analyzeFaultCode = async (params: { language: 'en' | 'es'; vfdBrand: string; vfdModel: string; faultCode: string; context: string; imageBase64?: string; mimeType?: string }): Promise<string> => {
    // ... existing implementation
    return "";
};

export const analyzeScanTime = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    // ... existing implementation
    return "";
};

export const generateEnergyEfficiencyPlan = async (params: { language: 'en' | 'es'; applicationType: string; loadProfile: string }): Promise<string> => {
    // ... existing implementation
    return "";
};

export const verifyCriticalLogic = async (params: { language: 'en' | 'es'; code: string; rules: string }): Promise<string> => {
    // ... existing implementation
    return "";
};

export const validatePlcLogic = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    // ... existing implementation
    return "";
};

export const suggestPlcLogicFix = async (params: { language: 'en' | 'es'; code: string; issues: LogicIssue[] }): Promise<string> => {
    // ... existing implementation
    return "";
};

export const analyzeAsciiFrame = async (params: { language: 'en' | 'es'; frame: string }): Promise<string> => {
    // ... existing implementation
    return "";
};

export const getNetworkHardwarePlan = async (params: { language: 'en' | 'es'; protocols: string[] }): Promise<string> => {
    // ... existing implementation
    return "";
};

export const translateLadderToText = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    // ... existing implementation
    return "";
};

export const analyzeMotorNameplate = async (params: { imageDataBase64: string; mimeType: string }): Promise<{ nominalCurrent?: string; serviceFactor?: string }> => {
    // ... existing implementation
    return {};
};

export const generateSensorRecommendation = async (params: { language: 'en' | 'es'; details: string }): Promise<string> => {
    // ... existing implementation
    return "";
};

export const convertPlcCode = async (params: { 
    language: 'en' | 'es';
    sourceBrand: string;
    sourcePlatform: string;
    targetBrand: string;
    targetPlatform: string;
    code: string;
}): Promise<string> => {
    // ... existing implementation
    return "";
};

// --- NEW SHIFT LOG FUNCTIONS ---

export const structureLogEntry = async (rawText: string): Promise<LogEntry> => {
    const prompt = `
    Act as an industrial maintenance data analyst. Your job is to receive an informal text report from a technician and convert it EXCLUSIVELY into a structured JSON object.
    
    Extract the following fields:
    - equipment: The name of the asset mentioned (standardize it, capitalize).
    - failure: Brief description of the problem.
    - action: What the technician did.
    - criticality: 1 (Low), 2 (Medium), or 3 (Critical/Line Stop).
    - status: 'RESUELTO' or 'PENDIENTE'.

    If information is missing, infer it from context or use 'Not specified'.
    
    Input: "${rawText}"
    `;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            equipment: { type: Type.STRING },
            failure: { type: Type.STRING },
            action: { type: Type.STRING },
            criticality: { type: Type.INTEGER },
            status: { type: Type.STRING, enum: ['RESUELTO', 'PENDIENTE'] },
        },
        required: ['equipment', 'failure', 'action', 'criticality', 'status']
    };

    try {
        const response = await callApiEndpoint('structureLog', {
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
                thinkingConfig: { thinkingBudget: 1024 } // Low thinking budget for simple extraction
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error('Error structuring log:', error);
        throw new Error('Failed to structure log entry.');
    }
};

export const generateShiftReport = async (logs: any[], language: 'en' | 'es'): Promise<string> => {
    const prompt = `
    You are an expert Plant Supervisor. Your task is to write a professional 'Shift Handover Report' based on a list of recorded events.
    Language: ${language === 'es' ? 'Spanish' : 'English'}.

    Input Data (JSON):
    ${JSON.stringify(logs, null, 2)}

    Output Format (Markdown):
    1. 🚨 **Critical Incidents Summary**: (Only mention criticality 3 events or line stops).
    2. 📋 **Activities Performed**: (Summary grouped by equipment/area).
    3. ⚠️ **Pending for Next Shift**: (Events with status 'PENDIENTE').
    4. 📈 **Shift Conclusion**: (Brief comment on whether it was a stable or problematic shift).

    Use technical, formal, and direct language. Omit irrelevant details.
    `;

    try {
        const response = await callApiEndpoint('generateShiftReport', {
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                thinkingConfig: { thinkingBudget: 2048 }
            }
        });
        return response.text;
    } catch (error) {
        console.error('Error generating report:', error);
        throw new Error('Failed to generate shift report.');
    }
};
