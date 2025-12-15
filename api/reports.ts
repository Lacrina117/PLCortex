
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
        const { groupName, reportContent } = await req.json();

        if (!groupName || !reportContent) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Insert into shift_reports table
        await sql`
            INSERT INTO shift_reports (group_name, report_content, created_at)
            VALUES (${groupName}, ${reportContent}, NOW());
        `;

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('POST /api/reports Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save report.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

async function handleGet(req: Request) {
    try {
        const url = new URL(req.url);
        const groupName = url.searchParams.get('groupName');

        if (!groupName) {
            return new Response(JSON.stringify({ error: 'Group name required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Retrieve reports for the group
        const { rows } = await sql`
            SELECT * FROM shift_reports 
            WHERE group_name = ${groupName} 
            ORDER BY created_at DESC
            LIMIT 50;
        `;

        return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('GET /api/reports Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch reports.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
