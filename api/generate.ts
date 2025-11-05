// FIX: Corrected import from '@google/genai'. `GenerateContentRequest` is deprecated and was replaced with `GenerateContentParameters` which is the correct type. Since this file intelligently switches between API calls, this type is aliased to `GenerateContentRequest` to maintain consistency with the existing code structure.
import { GoogleGenAI, GenerateContentParameters as GenerateContentRequest } from "@google/genai";

// This function is executed on the server (Vercel Edge Function)
// The API_KEY is securely accessed from environment variables set in Vercel
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set in Vercel project settings.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { task, params } = await req.json();

    if (!task || !params) {
        return new Response(JSON.stringify({ error: 'Missing task or params' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    let request: GenerateContentRequest = { model, contents: '' };

    // All current tasks use the same structure: a prompt and an optional config.
    // The client-side service will be responsible for creating the final prompt string.
    if (params.prompt) {
        request.contents = params.prompt;
    } else {
        return new Response(JSON.stringify({ error: 'Missing prompt in params' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (params.config) {
        request.config = params.config;
    }
    
    const response = await ai.models.generateContent(request);
    const text = response.text;

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in /api/generate:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to call Gemini API.', details: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}