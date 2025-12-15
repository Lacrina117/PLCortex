
import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'POST') {
      return handlePost(req);
  } else if (req.method === 'GET') {
      return handleGet(req);
  }
  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
}

async function handlePost(req: Request) {
    try {
        const { groupName, userDescription, rawInput, structuredData } = await req.json();

        if (!groupName || !rawInput || !structuredData) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Insert into shift_logs table
        await sql`
            INSERT INTO shift_logs (group_name, user_description, raw_input, structured_data, created_at)
            VALUES (${groupName}, ${userDescription}, ${rawInput}, ${structuredData}, NOW());
        `;

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('POST /api/logs Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save log.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

async function handleGet(req: Request) {
    try {
        const url = new URL(req.url);
        const groupName = url.searchParams.get('groupName');

        if (!groupName) {
            return new Response(JSON.stringify({ error: 'Group name required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Retrieve logs for the last 12 hours for the group
        const { rows } = await sql`
            SELECT * FROM shift_logs 
            WHERE group_name = ${groupName} 
            AND created_at > NOW() - INTERVAL '12 HOURS'
            ORDER BY created_at DESC;
        `;

        return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('GET /api/logs Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch logs.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
