
import { sql } from '@vercel/postgres';
import { AccessCode } from '../services/authService';

export const config = {
  runtime: 'edge',
};

// Helper to generate random code: XXXX-XXXX
function generateRandomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0 to avoid confusion
    let result = '';
    for (let i = 0; i < 8; i++) {
        if (i === 4) result += '-';
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Ensures the database tables exist.
 */
async function initializeDatabase() {
    await sql`
        CREATE TABLE IF NOT EXISTS access_codes (
            id TEXT PRIMARY KEY,
            access_code TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            is_active BOOLEAN DEFAULT TRUE,
            description TEXT,
            group_name TEXT DEFAULT 'Individual',
            is_leader BOOLEAN DEFAULT FALSE
        );
    `;
    
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

    await sql`
        CREATE TABLE IF NOT EXISTS shift_reports (
            id SERIAL PRIMARY KEY,
            group_name TEXT NOT NULL,
            report_content TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    `;
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
    if (req.method === 'POST') {
        return handlePost(req);
    }
    if (req.method === 'PUT') {
        return handlePut(req);
    }
    if (req.method === 'DELETE') {
        return handleDelete(req);
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
            ORDER BY group_name ASC, is_leader DESC, created_at DESC;
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

async function handlePost(req: Request) {
    try {
        const { description, groupName, isLeader } = await req.json();
        
        const newCode = generateRandomCode();
        const id = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const group = groupName || 'Individual';

        await sql`
            INSERT INTO access_codes (id, access_code, description, group_name, is_leader, is_active)
            VALUES (${id}, ${newCode}, ${description || 'New User'}, ${group}, ${isLeader || false}, TRUE);
        `;

        return new Response(JSON.stringify({ success: true, accessCode: newCode }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('POST /api/admin Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to create code.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
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

async function handleDelete(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get('id');
        const action = url.searchParams.get('action');

        if (action === 'reset_all') {
            await sql`DELETE FROM access_codes;`; // Wipe codes
            await sql`DELETE FROM shift_logs;`;   // Wipe logs
            await sql`DELETE FROM shift_reports;`; // Wipe reports
            return new Response(JSON.stringify({ success: true, message: 'Database reset.' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (id) {
            await sql`DELETE FROM access_codes WHERE id = ${id}`;
            return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ error: 'ID required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('DELETE /api/admin Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
