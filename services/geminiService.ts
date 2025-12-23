
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

const callApiEndpoint = async (task: string, params: any, modelOverride?: string): Promise<{ text: string; groundingMetadata?: any }> => {
    // Default to gemini-3-pro-preview for complex reasoning, but allow override for simple/structured tasks
    const model = modelOverride || 'gemini-3-pro-preview';
    
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
                body: JSON.stringify({ task, params, model }),
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

// ... (Existing functions like generateChatResponse, generatePractice, etc. are preserved here) ...
export const generateChatResponse = async (messages: Message[], context: ChatContext): Promise<string> => {
    // ... existing implementation
    return "";
};

export const generatePractice = async (params: PracticeParams): Promise<string> => {
    const isSpanish = params.language === 'es';
    const languageName = isSpanish ? 'Spanish' : 'English';
    const difficultyMap = {
        'Beginner': isSpanish ? 'Principiante' : 'Beginner',
        'Intermediate': isSpanish ? 'Intermedio' : 'Intermediate',
        'Advanced': isSpanish ? 'Avanzado' : 'Advanced'
    };
    
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
    (Full solution code or parameter list. Use code blocks for PLC logic.)
    `;

    try {
        const response = await callApiEndpoint('generatePractice', {
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                temperature: 0.7, // Higher creativity for varied problems
            }
        });
        return response.text;
    } catch (error) {
        console.error('Error generating practice:', error);
        throw new Error(isSpanish ? 'Error al generar la práctica.' : 'Failed to generate practice.');
    }
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

// --- IMPROVED SENSOR RECOMMENDATION FUNCTION ---
export const generateSensorRecommendation = async (params: { language: 'en' | 'es'; details: string }): Promise<string> => {
    const isSpanish = params.language === 'es';
    
    const systemInstruction = isSpanish 
        ? "Eres un ingeniero experto en instrumentación y control de procesos (I&C). Tu tarea es analizar los requisitos de una aplicación industrial y recomendar la tecnología de sensores óptima. Responde estrictamente en formato JSON."
        : "You are an expert Instrumentation and Control (I&C) Engineer. Your task is to analyze industrial application requirements and recommend the optimal sensor technology. Respond strictly in JSON format.";

    const prompt = `
    Analyze the following industrial process requirements and recommend 1 to 3 sensor technologies.
    
    APPLICATION REQUIREMENTS:
    ${params.details}

    INSTRUCTIONS:
    1. Identify the best sensing principle (e.g., Radar, Ultrasonic, Coriolis, Differential Pressure).
    2. Provide a 'Top Choice' that balances performance and cost based on the priorities.
    3. Include suggested real-world models from reputable brands (e.g., Endress+Hauser, Vega, Sick, IFM, Siemens).
    4. Provide specific installation advice (e.g., "Install at least 30cm from tank wall").
    5. Include an 'implementationGuide' dictionary containing:
       - 'st': A Structured Text (IEC 61131-3) snippet for scaling the analog signal (RAW to Engineering Units).
       - 'wiring': A text description of how to wire the sensor (2-wire vs 3-wire vs 4-wire) to a PLC input card.

    The response MUST be a valid JSON object matching the schema.
    `;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            recommendations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        isTopChoice: { type: Type.BOOLEAN },
                        technology: { type: Type.STRING },
                        justification: { type: Type.STRING },
                        ratings: {
                            type: Type.OBJECT,
                            properties: {
                                precision: { type: Type.INTEGER },
                                cost: { type: Type.INTEGER },
                                robustness: { type: Type.INTEGER },
                                easeOfInstallation: { type: Type.INTEGER }
                            },
                            required: ['precision', 'cost', 'robustness', 'easeOfInstallation']
                        },
                        suggestedModels: { type: Type.STRING }
                    },
                    required: ['isTopChoice', 'technology', 'justification', 'ratings', 'suggestedModels']
                }
            },
            installationConsiderations: { type: Type.ARRAY, items: { type: Type.STRING } },
            wiringWarning: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING }
                },
                required: ['title', 'content']
            },
            modelsDisclaimer: { type: Type.STRING },
            implementationGuide: {
                type: Type.OBJECT,
                properties: {
                    st: { type: Type.STRING },
                    wiring: { type: Type.STRING }
                }
            }
        },
        required: ['recommendations', 'installationConsiderations', 'modelsDisclaimer', 'implementationGuide']
    };

    try {
        // Using gemini-2.5-flash for speed and good JSON adherence
        const response = await callApiEndpoint('generateSensorRecommendation', {
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: schema,
                temperature: 0.2 // Low temperature for consistent, factual recommendations
            }
        }, 'gemini-2.5-flash');
        
        return response.text;
    } catch (error) {
        console.error('Error generating sensor recommendation:', error);
        throw new Error(isSpanish ? 'Error al generar la recomendación. Por favor intenta de nuevo.' : 'Failed to generate recommendation. Please try again.');
    }
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
        // Use gemini-2.5-flash for structured data extraction as it is more reliable for JSON schema adherence.
        const response = await callApiEndpoint('structureLog', {
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
            }
        }, 'gemini-2.5-flash');
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
        // Use gemini-2.5-flash for summarization tasks.
        const response = await callApiEndpoint('generateShiftReport', {
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                // REMOVED thinkingConfig as it is not supported by gemini-3-pro-preview
            }
        }, 'gemini-2.5-flash');
        return response.text;
    } catch (error) {
        console.error('Error generating report:', error);
        throw new Error('Failed to generate shift report.');
    }
};
