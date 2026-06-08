export async function onRequestGet({ env }) {
  const row = await env.DB.prepare("SELECT json FROM tool_data WHERE slug = 'pricing'").first();
  return Response.json(row ? JSON.parse(row.json) : []);
}

export async function onRequestPut({ request, env }) {
  const data = await request.json();
  if (!Array.isArray(data)) return new Response("array required", { status: 400 });
  const required = ["product", "size", "form", "category", "pharmacy", "price"];
  for (let i = 0; i < data.length; i++) {
    for (const f of required) {
      if (!(f in data[i])) return new Response("row " + (i + 1) + " missing " + f, { status: 400 });
    }
    data[i].price = Number(data[i].price);
    data[i].strength = data[i].strength ?? "";
    data[i].notes = data[i].notes ?? "";
  }
  await env.DB.prepare(
    "INSERT INTO tool_data (slug, json, updated_at) VALUES ('pricing', ?1, ?2) " +
    "ON CONFLICT(slug) DO UPDATE SET json = ?1, updated_at = ?2"
  ).bind(JSON.stringify(data), Date.now()).run();
  return Response.json({ ok: true, count: data.length });
}
