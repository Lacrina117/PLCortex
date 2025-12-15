
import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { accessCode } = await req.json();

    if (!accessCode || typeof accessCode !== 'string') {
      return new Response(JSON.stringify({ error: 'Access code is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Fetch the specific code with new columns
    // We select safely, assuming columns might not exist if migration hasn't run yet in admin
    // In production, migrations should be handled more robustly.
    const { rows } = await sql`
        SELECT is_active, description, group_name, is_leader 
        FROM access_codes 
        WHERE access_code = ${accessCode};
    `;

    if (rows.length > 0 && rows[0].is_active) {
      return new Response(JSON.stringify({ 
          message: 'Code validated successfully', 
          description: rows[0].description,
          groupName: rows[0].group_name || 'General',
          isLeader: rows[0].is_leader || false
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid or inactive code' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error('Error in /api/auth:', error);
    if (error instanceof Error && error.message.includes('relation "access_codes" does not exist')) {
        return new Response(JSON.stringify({ error: 'Server not ready. Please try again in a moment.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
