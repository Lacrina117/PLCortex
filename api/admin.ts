import { createClient } from '@vercel/kv';
import { AccessCode } from '../services/authService';

// The user specified that they used a custom prefix 'REDIS' for their Vercel KV store.
// This means the environment variables are named REDIS_REST_API_URL and REDIS_REST_API_TOKEN.
// We must create a client manually with these variables instead of using the default import.
const kv = createClient({
  url: process.env.REDIS_REST_API_URL!,
  token: process.env.REDIS_REST_API_TOKEN!,
});

export const config = {
  runtime: 'edge',
};

// --- Mock Database and Constants for Initialization ---
const STATIC_ACCESS_CODES: string[] = [
    'A7B3-9CDE-F1G5-H2J4', 'K6L8-M9N1-P2Q3-R4S5', 'T7V9-W1X2-Y3Z4-A5B6',
    'C8D9-E1F2-G3H4-J5K6', 'L7M8-N9P1-Q2R3-S4T5', 'V6W7-X8Y9-Z1A2-B3C4',
    'D5E6-F7G8-H9J1-K2L3', 'M4N5-P6Q7-R8S9-T1V2', 'W3X4-Y5Z6-A7B8-C9D1',
    'E2F3-G4H5-J6K7-L8M9', 'N1P2-Q3R4-S5T6-V7W8', 'X9Y1-Z2A3-B4C5-D6E7',
    'F8G9-H1J2-K3L4-M5N6', 'P7Q8-R9S1-T2V3-W4X5', 'Y6Z7-A8B9-C1D2-E3F4',
    'G5H6-J7K8-L9M1-N2P3', 'Q4R5-S6T7-V8W9-X1Y2', 'Z3A4-B5C6-D7E8-F9G1',
    'H2J3-K4L5-M6N7-P8Q9', 'R1S2-T3V4-W5X6-Y7Z8'
];

const createInitialDatabase = (): AccessCode[] => {
    const codes = STATIC_ACCESS_CODES.map((codeStr, i) => ({
        id: `code_${i + 1}`,
        accessCode: codeStr,
        createdAt: new Date().toISOString(),
        isActive: true,
        description: '',
    }));
    codes[18].isActive = false;
    codes[19].isActive = false;
    codes[19].description = 'Example Disabled';
    return codes;
};

// Function to get codes, initializing if necessary.
async function getCodesFromDB(): Promise<AccessCode[]> {
    let codes: AccessCode[] | null = await kv.get('access_codes');
    if (!codes || codes.length === 0) {
        console.log("Initializing database with static codes...");
        const initialCodes = createInitialDatabase();
        await kv.set('access_codes', initialCodes);
        return initialCodes;
    }
    return codes;
}

// Handler for all /api/admin requests.
export default async function handler(req: Request) {
    // NOTE: In a real app, you'd verify a JWT here to protect the admin endpoint.
    // For this app, we trust the client-side check is sufficient for demo purposes.

    if (req.method === 'GET') {
        return handleGet(req);
    }
    if (req.method === 'PUT') {
        return handlePut(req);
    }
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
}

// Handles GET /api/admin
async function handleGet(req: Request) {
    try {
        const codes = await getCodesFromDB();
        return new Response(JSON.stringify(codes), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('GET /api/admin Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch codes.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

// Handles PUT /api/admin
async function handlePut(req: Request) {
    try {
        const { id, updates } = await req.json();

        if (!id || !updates || (updates.isActive === undefined && updates.description === undefined)) {
            return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const codes = await getCodesFromDB();
        const codeIndex = codes.findIndex(c => c.id === id);

        if (codeIndex === -1) {
            return new Response(JSON.stringify({ error: 'Code not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        // Apply updates
        const updatedCode = { ...codes[codeIndex], ...updates };
        codes[codeIndex] = updatedCode;
        
        // Save the entire updated list back to KV
        await kv.set('access_codes', codes);

        return new Response(JSON.stringify(updatedCode), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('PUT /api/admin Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update code.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
