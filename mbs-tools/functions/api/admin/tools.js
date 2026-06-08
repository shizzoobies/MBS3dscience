export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT slug, name, enabled, created_at FROM tools ORDER BY name"
  ).all();
  return Response.json(results);
}

export async function onRequestPatch({ request, env }) {
  const { slug, enabled } = await request.json();
  await env.DB.prepare("UPDATE tools SET enabled = ?1 WHERE slug = ?2")
    .bind(enabled ? 1 : 0, slug).run();
  return Response.json({ ok: true });
}
