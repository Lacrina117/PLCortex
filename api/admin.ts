import { sql } from '@vercel/postgres';
import { AccessCode } from '../services/authService';

export const config = {
  runtime: 'edge',
};

// Static codes for initial population
const STATIC_ACCESS_CODES: string[] = [
    'A7B3-9CDE-F1G5-H2J4', 'K6L8-M9N1-P2Q3-R4S5', 'T7V9-W1X2-Y3Z4-A5B6',
    'C8D9-E1F2-G3H4-J5K6', 'L7M8-N9P1-Q2R3-S4T5', 'V6W7-X8Y9-Z1A2-B3C4',
    'D5E6-F7G8-H9J1-K2L3', 'M4N5-P6Q7-R8S9-T1V2', 'W3X4-Y5Z6-A7B8-C9D1',
    'E2F3-G4H5-J6K7-L8M9', 'N1P2-Q3R4-S5T6-V7W8', 'X9Y1-Z2A3-B4C5-D6E7',
    'F8G9-H1J2-K3L4-M5N6', 'P7Q8-R9S1-T2V3-W4X5', 'Y6Z7-A8B9-C1D2-E3F4',
    'G5H6-J7K8-L9M1-N2P3', 'Q4R5-S6T7-V8W9-X1Y2', 'Z3A4-B5C6-D7E8-F9G1',
    'H2J3-K4L5-M6N7-P8Q9', 'R1S2-T3V4-W5X6-Y7Z8'
];

/**
 * Ensures the database table exists and is populated with initial data if empty.
 * This function is idempotent and safe to call on every request.
 */
async function initializeDatabase() {
    // Create the table if it doesn't exist
    await sql`
        CREATE TABLE IF NOT EXISTS access_codes (
            id TEXT PRIMARY KEY,
            access_code TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            is_active BOOLEAN DEFAULT TRUE,
            description TEXT
        );
    `;

    // Check if the table is empty
    const { rows: countResult } = await sql`SELECT COUNT(*) FROM access_codes;`;
    const count = parseInt(countResult[0].count, 10);

    // If empty, populate with static codes
    if (count === 0) {
        console.log("Initializing 'access_codes' table with static codes...");
        const initialCodes = STATIC_ACCESS_CODES.map((codeStr, i) => ({
            id: `code_${i + 1}`,
            accessCode: codeStr,
            createdAt: new Date().toISOString(),
            isActive: i < 18, // Disable the last two codes by default
            description: i === 19 ? 'Example Disabled' : '',
        }));

        // Insert each code
        for (const code of initialCodes) {
            await sql`
                INSERT INTO access_codes (id, access_code, created_at, is_active, description)
                VALUES (${code.id}, ${code.accessCode}, ${code.createdAt}, ${code.isActive}, ${code.description});
            `;
        }
        console.log("Database initialization complete.");
    }
}

// Main handler for all /api/admin requests.
export default async function handler(req: Request) {
    try {
        await initializeDatabase();
    } catch (error) {
        console.error('Database initialization failed:', error);
        return new Response(JSON.stringify({ error: 'Database connection or setup error.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // In a real app, you'd verify a JWT here to protect the admin endpoint.
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
        // Fetch and return all codes, aliasing column names to match the frontend's camelCase expectation.
        const { rows } = await sql<AccessCode>`
            SELECT 
                id, 
                access_code as "accessCode", 
                created_at as "createdAt", 
                is_active as "isActive", 
                description 
            FROM access_codes 
            ORDER BY created_at DESC;
        `;
        return new Response(JSON.stringify(rows), {
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

        // Fetch the current state of the code to handle partial updates
        const { rows: currentRows } = await sql`SELECT is_active, description FROM access_codes WHERE id = ${id};`;
        if (currentRows.length === 0) {
            return new Response(JSON.stringify({ error: 'Code not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        const currentCode = currentRows[0];
        
        // Merge updates with current state
        const newIsActive = updates.isActive !== undefined ? updates.isActive : currentCode.is_active;
        const newDescription = updates.description !== undefined ? updates.description : currentCode.description;

        // Perform the update and return the updated row
        const { rows: updatedRows } = await sql`
            UPDATE access_codes
            SET is_active = ${newIsActive}, description = ${newDescription}
            WHERE id = ${id}
            RETURNING id, access_code as "accessCode", created_at as "createdAt", is_active as "isActive", description;
        `;
        
        if (updatedRows.length === 0) {
            throw new Error('Update failed, RETURNING clause returned no rows.');
        }

        return new Response(JSON.stringify(updatedRows[0]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('PUT /api/admin Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update code.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}