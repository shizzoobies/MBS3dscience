// Middleware already verified the link before this runs.
export async function onRequestGet({ env }) {
  const row = await env.DB.prepare("SELECT json FROM tool_data WHERE slug = 'pricing'").first();
  const data = row ? JSON.parse(row.json) : [];
  return Response.json(data);
}
