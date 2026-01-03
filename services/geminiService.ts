
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
            if (!params.contents) {
                throw new Error('Request params must include contents.');
            }

            let request: GenerateContentRequest = { 
                model,
                contents: params.contents
            };
            
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

export const generateChatResponse = async (messages: Message[], context: ChatContext): Promise<string> => {
    // STRICT SECURITY & LOGIC VALIDATION INSTRUCTION
    // Augmented with specific syntax rules to prevent common LLM hallucinations in ST
    let systemInstruction = `You are PLCortex, an expert Industrial Automation Engineer. 
    Language: ${context.language === 'es' ? 'Spanish' : 'English'}.
    Context: Topic=${context.topic}, PLC=${context.plcBrand}/${context.plcSoftware}, VFD=${context.vfdBrand}/${context.vfdModel}.
    
    *** CRITICAL CODE GENERATION RULES (IEC 61131-3) ***
    When generating Structured Text (ST), you MUST strictly adhere to these rules. The user demands 100% compilation success.
    
    1. ASSIGNMENT OPERATOR: Use ':=' for assignment. NEVER use '=' for assignment.
       - Correct: MyVar := 10;
       - WRONG: MyVar = 10;
    
    2. EQUALITY CHECK: Use '=' for comparison. NEVER use '==' for comparison.
       - Correct: IF MyVar = 10 THEN
       - WRONG: IF MyVar == 10 THEN
    
    3. TERMINATION: Every statement must end with a semicolon ';'.
    
    4. BLOCKS: Ensure every 'IF' has an 'END_IF', every 'CASE' has an 'END_CASE', every 'FOR' has an 'END_FOR'.
    
    5. DECLARATION: You must mentally declare every variable used. If it's a temp variable, declare it in a comment block above.
    
    6. SAFETY: No infinite loops (WHILE TRUE). No division by zero.
    
    *** EXECUTION PROCESS ***
    Before outputting code, you must "Compile" it in your thought process. 
    If you detect a syntax error (like using = instead of :=), FIX IT immediately before outputting.
    
    Provide concise, technical answers. Use Markdown for code blocks.`;

    const contents = messages.map(msg => ({
        role: msg.role,
        parts: msg.parts
    }));

    try {
        const response = await callApiEndpoint('chat', {
            contents,
            config: {
                systemInstruction,
                // ENABLE HIGH THINKING BUDGET FOR PERFECT LOGIC
                thinkingConfig: { thinkingBudget: 16000 }, 
                temperature: 0.7, 
            }
        }, 'gemini-3-pro-preview'); // Explicitly use Pro model which supports thinking
        return response.text;
    } catch (error) {
        console.error('Chat generation error:', error);
        throw new Error('Failed to generate response.');
    }
};

export const generatePractice = async (params: PracticeParams): Promise<string> => {
    const isSpanish = params.language === 'es';
    const languageName = isSpanish ? 'Spanish' : 'English';
    
    const context = params.topic === 'PLC'
        ? `PLC Brand: ${params.plcBrand}, Software: ${params.plcSoftware}, Language: ${params.plcLanguage}`
        : `VFD Brand: ${params.vfdBrand}, Model: ${params.vfdModel}`;

    // Chain-of-Verification Prompt for Practice Problems with Explicit Linting Rules
    const prompt = `
    Create a unique, realistic industrial automation practice problem.
    Topic: ${params.topic}
    Difficulty: ${params.difficulty}
    Context: ${context}
    Language: ${languageName}

    *** STRICT CODE GENERATION REQUIREMENTS ***
    If generating Structured Text (ST):
    1. Use ':=' for assignment. (e.g., Tag := 1;)
    2. Use '=' for equality comparison. (e.g., IF Tag = 1 THEN)
    3. Use ';' at the end of every line.
    4. Ensure all variables are defined in the solution or implied as standard tags.
    5. No '==' operators allowed in ST.

    *** THOUGHT PROCESS ***
    1. PLAN: Design the scenario.
    2. DRAFT CODE: Write the solution code.
    3. COMPILER SIMULATION: Review the code line-by-line looking for:
       - Missing semicolons
       - Incorrect assignment operators (= vs :=)
       - Unclosed IF/CASE statements
    4. FINALIZE: Output only the corrected, error-free code.

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
            config: {
                // ENABLE HIGH THINKING BUDGET FOR PERFECT LOGIC
                thinkingConfig: { thinkingBudget: 16000 },
                temperature: 0.7, 
            }
        }, 'gemini-3-pro-preview'); // Explicitly use Pro model
        return response.text;
    } catch (error) {
        console.error('Error generating practice:', error);
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
    
    IMPORTANT:
    If the user asks about a specific terminal or function, you MUST verify if it exists in the provided JSON terminal data.
    If you mention specific terminals to check/wire, append a JSON object at the very end of your response listing them for highlighting.
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
        });
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
        const response = await callApiEndpoint('analyzeFaultCode', {
            contents: [{ parts }],
        });
        return response.text;
    } catch (error) {
        throw new Error('Failed to analyze fault.');
    }
};

export const analyzeScanTime = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    const prompt = `
    Analyze the following PLC code for scan time impact.
    Language: ${params.language === 'es' ? 'Spanish' : 'English'}
    
    Code:
    ${params.code}

    Identify heavy loops, floating point math, string operations, or blocking calls that increase cycle time. Estimate efficiency.
    `;
    try {
        const response = await callApiEndpoint('analyzeScanTime', { contents: [{ parts: [{ text: prompt }] }] });
        return response.text;
    } catch (error) { throw new Error('Failed to analyze scan time.'); }
};

export const generateEnergyEfficiencyPlan = async (params: { language: 'en' | 'es'; applicationType: string; loadProfile: string }): Promise<string> => {
    const prompt = `
    Create a VFD Energy Efficiency Plan.
    Application: ${params.applicationType}
    Load Profile: ${params.loadProfile}
    Language: ${params.language === 'es' ? 'Spanish' : 'English'}
    
    Recommend parameters (Flux Optimization, Sleep Mode, PID), sizing check, and ROI estimation logic.
    `;
    try {
        const response = await callApiEndpoint('generateEnergy', { contents: [{ parts: [{ text: prompt }] }] });
        return response.text;
    } catch (error) { throw new Error('Failed to generate energy plan.'); }
};

export const verifyCriticalLogic = async (params: { language: 'en' | 'es'; code: string; rules: string }): Promise<string> => {
    const prompt = `
    Verify if the PLC logic strictly follows these Safety Rules.
    Rules: ${params.rules}
    Code:
    ${params.code}
    
    Language: ${params.language === 'es' ? 'Spanish' : 'English'}
    Start response with ✅ (Compliant) or ❌ (Violated). Explain why.
    `;
    try {
        const response = await callApiEndpoint('verifyLogic', { contents: [{ parts: [{ text: prompt }] }] });
        return response.text;
    } catch (error) { throw new Error('Failed to verify logic.'); }
};

// --- STRICT LOGIC VALIDATOR WITH AUSTERE THINKING ---
export const validatePlcLogic = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    const prompt = `
    You are an AUSTERE and PEDANTIC Senior PLC Code Auditor (IEC 61131-3 Expert).
    Perform a STRICT SAFETY AUDIT on the provided PLC code. Do NOT overlook minor errors.
    
    CHECK FOR:
    1. Syntax errors specific to the likely platform (SCL, ST). BE PRECISE (e.g., := vs =).
    2. Infinite loops (WHILE loops without exit conditions).
    3. Race conditions / Double Coil usage (Multiple assignments to same variable).
    4. Uninitialized variables used in logic.
    5. Division by zero risks.
    6. Array index out of bounds risks.
    
    Use your Thinking process to simulate the code execution line-by-line before answering.
    
    Return ONLY a JSON array of objects.
    Schema: [{ "line": number, "type": "Error" | "Warning", "message": "concise description" }]

    If the code is 100% perfect and safe, return an empty array [].

    Code to Analyze:
    ${params.code}
    `;

    try {
        const response = await callApiEndpoint('validateLogic', {
            contents: [{ parts: [{ text: prompt }] }],
            config: { 
                responseMimeType: 'application/json',
                // Enable MAX thinking for rigorous validation
                thinkingConfig: { thinkingBudget: 16000 }
            }
        }, 'gemini-3-pro-preview');
        return response.text;
    } catch (error) {
        console.error("Logic validation failed:", error);
        throw new Error("Failed to validate logic.");
    }
};

// --- STRICT LOGIC FIX SUGGESTION WITH THINKING ---
export const suggestPlcLogicFix = async (params: { language: 'en' | 'es'; code: string; issues: LogicIssue[] }): Promise<string> => {
    const prompt = `
    The following PLC code has issues identified by an austere auditor. 
    You must refactor it to be PRODUCTION READY, SAFE, and SYNTACTICALLY PERFECT.
    
    Issues Identified:
    ${JSON.stringify(params.issues)}

    Original Code:
    ${params.code}

    INSTRUCTIONS:
    1. Fix all identified syntax and logic errors.
    2. Add comments explaining the safety fix.
    3. Ensure the code is compliant with IEC 61131-3 (Use := for assignment, ; at end of lines).
    
    Provide ONLY the corrected code block (Markdown) followed by a brief explanation in ${params.language === 'es' ? 'Spanish' : 'English'}.
    `;

    try {
        const response = await callApiEndpoint('fixLogic', {
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                // Enable thinking for better fix generation
                thinkingConfig: { thinkingBudget: 16000 }
            }
        }, 'gemini-3-pro-preview');
        return response.text;
    } catch (error) {
        throw new Error("Failed to suggest fix.");
    }
};

export const analyzeAsciiFrame = async (params: { language: 'en' | 'es'; frame: string }): Promise<string> => {
    const prompt = `
    Decode this ASCII/Serial frame used in industrial automation (e.g. barcode reader, scale, printer).
    Frame: ${params.frame}
    Language: ${params.language === 'es' ? 'Spanish' : 'English'}
    Break down: STX/ETX, Payload, Checksum (if present).
    `;
    try {
        const response = await callApiEndpoint('analyzeAscii', { contents: [{ parts: [{ text: prompt }] }] });
        return response.text;
    } catch (error) { throw new Error('Failed to analyze ASCII.'); }
};

export const getNetworkHardwarePlan = async (params: { language: 'en' | 'es'; protocols: string[] }): Promise<string> => {
    const prompt = `
    Design a network bridge/gateway solution to connect these protocols: ${params.protocols.join(', ')}.
    Language: ${params.language === 'es' ? 'Spanish' : 'English'}
    Suggest specific hardware (ProSoft, Anybus, Moxa, Red Lion) and topology.
    `;
    try {
        const response = await callApiEndpoint('networkPlan', { contents: [{ parts: [{ text: prompt }] }] });
        return response.text;
    } catch (error) { throw new Error('Failed to plan network.'); }
};

// --- IMPLEMENTED LADDER TO TEXT ---
export const translateLadderToText = async (params: { language: 'en' | 'es'; code: string }): Promise<string> => {
    const prompt = `
    Convert the following ASCII Ladder Logic or text-based Ladder representation into IEC 61131-3 Structured Text (ST).
    Ensure variable names are preserved.
    
    Input Ladder:
    ${params.code}
    
    Return ONLY the Structured Text code.
    `;
    try {
        const response = await callApiEndpoint('ladderToText', {
            contents: [{ parts: [{ text: prompt }] }]
        });
        return response.text;
    } catch (error) {
        return params.code; // Fallback to original if fails
    }
};

export const analyzeMotorNameplate = async (params: { imageDataBase64: string; mimeType: string }): Promise<{ nominalCurrent?: string; serviceFactor?: string }> => {
    const prompt = `
    Analyze this image of an electric motor nameplate.
    Extract:
    1. Nominal Current (FLA, Amps).
    2. Service Factor (SF).
    
    Return JSON: { "nominalCurrent": "number", "serviceFactor": "number" }.
    If not found, return null values.
    `;
    
    try {
        const response = await callApiEndpoint('analyzePlate', {
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: params.mimeType, data: params.imageDataBase64 } }
                ]
            }],
            config: { responseMimeType: 'application/json' }
        }, 'gemini-2.5-flash'); // Use flash for vision speed
        return JSON.parse(response.text);
    } catch (error) {
        console.error('Nameplate analysis failed:', error);
        throw new Error('Failed to analyze nameplate.');
    }
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
    const prompt = `
    Migrate the following PLC code.
    From: ${params.sourceBrand} (${params.sourcePlatform})
    To: ${params.targetBrand} (${params.targetPlatform})
    Language: ${params.language === 'es' ? 'Spanish' : 'English'}
    
    Original Code:
    ${params.code}
    
    Provide the migrated code in a code block, followed by a list of key changes and potential compatibility issues.
    `;
    
    try {
        const response = await callApiEndpoint('migrateCode', {
            contents: [{ parts: [{ text: prompt }] }]
        });
        return response.text;
    } catch (error) {
        throw new Error('Failed to migrate code.');
    }
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
