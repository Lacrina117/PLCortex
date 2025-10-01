// This is a placeholder file to prevent deployment errors.
// Vercel may attempt to build any .ts file in the /api directory.
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  return new Response(JSON.stringify({ message: 'Not Implemented' }), { status: 501, headers: { 'Content-Type': 'application/json' } });
}
