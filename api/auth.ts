import { kv } from '@vercel/kv';
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

    // Fetch all codes from the database
    const codes: AccessCode[] | null = await kv.get('access_codes');
    
    // If no codes are in the database, it's a server-side issue or first run
    if (!codes) {
        console.error("Database is not initialized with access codes.");
        return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Find the code and check if it's active
    const foundCode = codes.find(c => c.accessCode === accessCode);

    if (foundCode && foundCode.isActive) {
      return new Response(JSON.stringify({ message: 'Code validated successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid or inactive code' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error('Error in /api/auth:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}