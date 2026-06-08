import { newToken, sha256Hex } from "../../lib/tokens.js";

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, label, tool_slug, expires_at, revoked, created_at, last_used_at FROM access_links ORDER BY created_at DESC"
  ).all();
  return Response.json(results); // token_hash deliberately not returned
}

export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const token = newToken();
  const hash = await sha256Hex(token);
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO access_links (id, token_hash, label, tool_slug, expires_at, revoked, created_at) VALUES (?1,?2,?3,?4,?5,0,?6)"
  ).bind(id, hash, body.label || null, body.tool_slug || null, body.expires_at || null, Date.now()).run();
  // Return the raw token once. It is unrecoverable after this response.
  return Response.json({ id, token });
}

export async function onRequestDelete({ request, env }) {
  const { id } = await request.json();
  await env.DB.prepare("UPDATE access_links SET revoked = 1 WHERE id = ?1").bind(id).run();
  return Response.json({ ok: true });
}
