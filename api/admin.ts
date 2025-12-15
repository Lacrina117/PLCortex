
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
 * Ensures the database tables exist and are populated.
 * Handles schema migration for Groups and Roles.
 */
async function initializeDatabase() {
    // 1. Create main table
    await sql`
        CREATE TABLE IF NOT EXISTS access_codes (
            id TEXT PRIMARY KEY,
            access_code TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            is_active BOOLEAN DEFAULT TRUE,
            description TEXT
        );
    `;

    // 2. Add columns for Groups and Roles if they don't exist (Manual migration)
    try {
        await sql`ALTER TABLE access_codes ADD COLUMN IF NOT EXISTS group_name TEXT DEFAULT 'General'`;
        await sql`ALTER TABLE access_codes ADD COLUMN IF NOT EXISTS is_leader BOOLEAN DEFAULT FALSE`;
    } catch (e) {
        console.log("Columns might already exist or error adding them:", e);
    }

    // 3. Create Shift Logs table
    await sql`
        CREATE TABLE IF NOT EXISTS shift_logs (
            id SERIAL PRIMARY KEY,
            group_name TEXT NOT NULL,
            user_description TEXT,
            raw_input TEXT,
            structured_data JSONB,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    `;

    // 4. Populate initial codes if empty
    const { rows: countResult } = await sql`SELECT COUNT(*) FROM access_codes;`;
    const count = parseInt(countResult[0].count, 10);

    if (count === 0) {
        console.log("Initializing 'access_codes' table with static codes...");
        const initialCodes = STATIC_ACCESS_CODES.map((codeStr, i) => ({
            id: `code_${i + 1}`,
            accessCode: codeStr,
            createdAt: new Date().toISOString(),
            isActive: i < 18,
            description: i === 19 ? 'Example Disabled' : (i === 0 ? 'Plant Manager' : `Technician ${i}`),
            groupName: i < 5 ? 'Maintenance A' : (i < 10 ? 'Maintenance B' : 'General'),
            isLeader: i === 0 || i === 5,
        }));

        for (const code of initialCodes) {
            await sql`
                INSERT INTO access_codes (id, access_code, created_at, is_active, description, group_name, is_leader)
                VALUES (${code.id}, ${code.accessCode}, ${code.createdAt}, ${code.isActive}, ${code.description}, ${code.groupName}, ${code.isLeader});
            `;
        }
        console.log("Database initialization complete.");
    }
}

export default async function handler(req: Request) {
    try {
        await initializeDatabase();
    } catch (error) {
        console.error('Database initialization failed:', error);
        return new Response(JSON.stringify({ error: 'Database connection or setup error.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'GET') {
        return handleGet(req);
    }
    if (req.method === 'PUT') {
        return handlePut(req);
    }
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
}

async function handleGet(req: Request) {
    try {
        const { rows } = await sql<AccessCode>`
            SELECT 
                id, 
                access_code as "accessCode", 
                created_at as "createdAt", 
                is_active as "isActive", 
                description,
                group_name as "groupName",
                is_leader as "isLeader"
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

async function handlePut(req: Request) {
    try {
        const { id, updates } = await req.json();

        if (!id || !updates) {
            return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const { rows: currentRows } = await sql`SELECT is_active, description, group_name, is_leader FROM access_codes WHERE id = ${id};`;
        if (currentRows.length === 0) {
            return new Response(JSON.stringify({ error: 'Code not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }
        const currentCode = currentRows[0];
        
        const newIsActive = updates.isActive !== undefined ? updates.isActive : currentCode.is_active;
        const newDescription = updates.description !== undefined ? updates.description : currentCode.description;
        const newGroupName = updates.groupName !== undefined ? updates.groupName : currentCode.group_name;
        const newIsLeader = updates.isLeader !== undefined ? updates.isLeader : currentCode.is_leader;

        const { rows: updatedRows } = await sql`
            UPDATE access_codes
            SET is_active = ${newIsActive}, 
                description = ${newDescription},
                group_name = ${newGroupName},
                is_leader = ${newIsLeader}
            WHERE id = ${id}
            RETURNING id, access_code as "accessCode", created_at as "createdAt", is_active as "isActive", description, group_name as "groupName", is_leader as "isLeader";
        `;
        
        return new Response(JSON.stringify(updatedRows[0]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('PUT /api/admin Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to update code.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
