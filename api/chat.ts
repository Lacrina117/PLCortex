
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set on server.");
    }
    
    const { contents, config } = await req.json();
    const ai = new GoogleGenAI({ apiKey });
    
    // Explicitly using 'gemini-3-flash-preview' for the Solutions Chat
    const selectedModel = 'gemini-3-flash-preview';

    const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: contents,
        config: config
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of responseStream) {
                    const text = chunk.text;
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
            } catch (err) {
                console.error("Stream error", err);
                controller.error(err);
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'X-Content-Type-Options': 'nosniff',
        },
    });

  } catch (error) {
    console.error("Error in /api/chat:", error);
    return new Response(JSON.stringify({ error: 'Failed to generate chat response.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
