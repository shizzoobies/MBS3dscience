import { sha256Hex } from "./lib/tokens.js";

// Map URL paths to a tool slug. Add a line per new tool.
const TOOL_ROUTES = {
  "/pricing": "pricing",
  "/api/tools/pricing": "pricing",
};

function toolSlugForPath(pathname) {
  for (const [route, slug] of Object.entries(TOOL_ROUTES)) {
    if (pathname === route || pathname.startsWith(route + "/")) return slug;
  }
  return null;
}

function parseCookie(str) {
  return Object.fromEntries(
    (str || "")
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const i = p.indexOf("=");
        return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))];
      })
  );
}

export async function onRequest(context) {
  const { request, env, next, waitUntil } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Admin surface is gated at the edge by Cloudflare Access. Pass through here.
  if (path === "/admin" || path.startsWith("/admin/") || path.startsWith("/api/admin/")) {
    return next();
  }

  // Anything that is not a registered tool route is public (landing page, assets).
  const slug = toolSlugForPath(path);
  if (!slug) return next();

  const cookies = parseCookie(request.headers.get("Cookie"));
  const token = url.searchParams.get("k") || cookies["tk"] || "";
  if (!token) return deny("This link is missing its access key.");

  const hash = await sha256Hex(token);
  const link = await env.DB.prepare(
    "SELECT id, tool_slug, revoked, expires_at FROM access_links WHERE token_hash = ?1"
  ).bind(hash).first();

  if (!link || link.revoked) return deny("This access link is not valid.");
  if (link.expires_at && Date.now() > link.expires_at) return deny("This access link has expired.");
  if (link.tool_slug && link.tool_slug !== slug) return deny("This link does not grant access to this tool.");

  const tool = await env.DB.prepare("SELECT enabled FROM tools WHERE slug = ?1").bind(slug).first();
  if (!tool || !tool.enabled) return unavailable();

  waitUntil(
    env.DB.prepare("UPDATE access_links SET last_used_at = ?1 WHERE id = ?2")
      .bind(Date.now(), link.id).run()
  );

  const res = await next();

  // Promote the token to a cookie so the URL can be shared without the key later.
  if (url.searchParams.has("k")) {
    const headers = new Headers(res.headers);
    headers.append(
      "Set-Cookie",
      "tk=" + encodeURIComponent(token) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000"
    );
    return new Response(res.body, { status: res.status, headers });
  }
  return res;
}

function page(status, title, body) {
  const html =
    "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>" +
    "<title>" + title + "</title>" +
    "<div style='font-family:Georgia,serif;max-width:32rem;margin:18vh auto;padding:0 1.5rem;color:#0f172a;text-align:center'>" +
    "<h1 style='font-size:1.5rem;margin:0 0 .5rem'>" + title + "</h1>" +
    "<p style='color:#64748b'>" + body + "</p></div>";
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
const deny = (msg) => page(403, "Access unavailable", msg);
const unavailable = () => page(503, "Temporarily unavailable", "This tool is turned off right now. Check back later.");
