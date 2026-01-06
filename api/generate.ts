
import { GoogleGenAI, GenerateContentParameters as GenerateContentRequest } from "@google/genai";

// Cambiamos a Node.js runtime por defecto para soportar mayor duración de ejecución
// Edge functions tienen limites estrictos en el plan gratuito.
export const maxDuration = 60; // Permitir hasta 60 segundos
export const dynamic = 'force-dynamic';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set on server.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const { task, params, model } = await req.json();

    if (!task || !params) {
        return new Response(JSON.stringify({ error: 'Missing task or params' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Default to gemini-2.5-flash for speed and reliability in Serverless environment
    const selectedModel = model || 'gemini-2.5-flash';

    let request: GenerateContentRequest = { model: selectedModel, contents: '' };

    if (params.contents) {
        request.contents = params.contents;
    } else {
        return new Response(JSON.stringify({ error: 'Missing contents in params' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (params.config) {
        request.config = params.config;
    }
    
    const response = await ai.models.generateContent(request);
    const text = response.text;

    return new Response(JSON.stringify({ text, groundingMetadata: response.candidates?.[0]?.groundingMetadata }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in /api/generate:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to call Gemini API.', details: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
