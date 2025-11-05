import { sql } from '@vercel/postgres';
import { AccessCode } from '../services/authService';

export const config = {
  runtime: 'edge',
};

// This endpoint is for regular user login validation.
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { accessCode } = await req.json();

    if (!accessCode || typeof accessCode !== 'string') {
      return new Response(JSON.stringify({ error: 'Access code is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Fetch the specific code from the database
    const { rows } = await sql`
        SELECT is_active, description FROM access_codes WHERE access_code = ${accessCode};
    `;

    // Check if a row was found and if it's active
    if (rows.length > 0 && rows[0].is_active) {
      return new Response(JSON.stringify({ message: 'Code validated successfully', description: rows[0].description }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid or inactive code' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error('Error in /api/auth:', error);
    // This will catch issues like the table not existing yet.
    if (error instanceof Error && error.message.includes('relation "access_codes" does not exist')) {
        return new Response(JSON.stringify({ error: 'Server not ready. Please try again in a moment.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}