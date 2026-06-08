import React, { useState, useMemo, useEffect } from "react";
import {
  Pill, Power, Plus, Copy, Check, Trash2, AlertTriangle, Download, Link as LinkIcon, RefreshCw
} from "lucide-react";

/*
  MBS Tools - Admin panel
  -----------------------
  Served at /admin, gated by Cloudflare Access at the edge (never build a custom login).
  Three sections: per-tool kill switch, access link issue / revoke, and the pricing
  editor. All server state lives in D1 behind /api/admin/*. UI state is React only;
  no localStorage or sessionStorage.

  Confirmed defaults for new links: no expiry, scope defaults to the pricing tool.
*/

const SERIF = { fontFamily: 'Georgia, "Iowan Old Style", "Times New Roman", serif' };

// Public origin used to assemble shareable links. tools.mbsdoc.com is the confirmed
// subdomain; window.location.origin is used at runtime so this also works on preview
// deployments without a code change.
const SHARE_ORIGIN = "https://tools.mbsdoc.com";

// Map a tool slug to the public route a link should point at.
const TOOL_PATHS = {
  pricing: "/pricing",
};

const REQUIRED_FIELDS = ["product", "size", "form", "category", "pharmacy", "price"];

const money = (n) => "$" + Number(n).toFixed(2);

function fmtDate(ms) {
  if (!ms) return "-";
  try {
    return new Date(ms).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function linkStatus(link) {
  if (link.revoked) return { label: "Revoked", cls: "bg-rose-50 text-rose-700" };
  if (link.expires_at && Date.now() > link.expires_at) return { label: "Expired", cls: "bg-amber-50 text-amber-700" };
  return { label: "Active", cls: "bg-teal-50 text-teal-700" };
}

export default function Admin() {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold uppercase tracking-widest">
          <Pill size={14} /> MBS Medical
        </div>
        <h1 className="text-3xl font-bold mt-1 mb-1" style={SERIF}>Tools Admin</h1>
        <p className="text-sm text-slate-500 mb-8">
          Turn tools on or off, issue and revoke access links, and edit pricing data.
        </p>

        <ToolsSection />
        <LinksSection />
        <PricingSection />
      </div>
    </div>
  );
}

function Card({ title, subtitle, right, children }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900" style={SERIF}>{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

/* ----------------------------- Tools section ----------------------------- */

function ToolsSection() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/tools")
      .then((r) => r.json())
      .then((d) => setTools(Array.isArray(d) ? d : []))
      .catch(() => setErr("Could not load tools."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = (slug, enabled) => {
    setBusy(slug);
    setTools((prev) => prev.map((t) => (t.slug === slug ? { ...t, enabled: enabled ? 1 : 0 } : t)));
    fetch("/api/admin/tools", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, enabled }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
      })
      .catch(() => {
        setErr("Could not update " + slug + ".");
        load();
      })
      .finally(() => setBusy(null));
  };

  return (
    <Card title="Tools" subtitle="Per-tool kill switch. Disabling a tool returns 503 to users even on a valid link.">
      {loading && <p className="text-sm text-slate-400">Loading tools...</p>}
      {err && (
        <div className="flex items-center gap-2 text-sm text-rose-600 mb-3">
          <AlertTriangle size={14} /> {err}
        </div>
      )}
      {!loading && tools.length === 0 && <p className="text-sm text-slate-400">No tools registered.</p>}
      <div className="divide-y divide-slate-100">
        {tools.map((t) => {
          const on = !!t.enabled;
          return (
            <div key={t.slug} className="flex items-center justify-between gap-4 py-3">
              <div>
                <div className="font-medium text-slate-900">{t.name}</div>
                <div className="text-xs text-slate-400">{t.slug}</div>
              </div>
              <button
                onClick={() => toggle(t.slug, !on)}
                disabled={busy === t.slug}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                  on
                    ? "bg-teal-600 text-white border-teal-600 hover:bg-teal-700"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                } ${busy === t.slug ? "opacity-60" : ""}`}
              >
                <Power size={15} /> {on ? "Enabled" : "Disabled"}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ----------------------------- Links section ----------------------------- */

function LinksSection() {
  const [links, setLinks] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // New-link form. Confirmed defaults: scope = pricing tool, no expiry.
  const [label, setLabel] = useState("");
  const [scope, setScope] = useState("pricing");
  const [expiry, setExpiry] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null); // { url } shown once
  const [copied, setCopied] = useState(false);

  const loadLinks = () => {
    setLoading(true);
    fetch("/api/admin/links")
      .then((r) => r.json())
      .then((d) => setLinks(Array.isArray(d) ? d : []))
      .catch(() => setErr("Could not load links."))
      .finally(() => setLoading(false));
  };

  const loadTools = () => {
    fetch("/api/admin/tools")
      .then((r) => r.json())
      .then((d) => setTools(Array.isArray(d) ? d : []))
      .catch(() => {});
  };

  useEffect(() => {
    loadLinks();
    loadTools();
  }, []);

  const toolName = (slug) => {
    if (!slug) return "All tools";
    const t = tools.find((x) => x.slug === slug);
    return t ? t.name : slug;
  };

  const create = (e) => {
    e.preventDefault();
    setErr(null);
    setCreated(null);
    setCopied(false);

    // scope "all" maps to NULL (all tools); otherwise the specific slug.
    const tool_slug = scope === "all" ? null : scope;
    // Optional expiry. A date input gives YYYY-MM-DD; store end-of-day epoch ms.
    let expires_at = null;
    if (expiry) {
      const ms = new Date(expiry + "T23:59:59").getTime();
      if (!Number.isNaN(ms)) expires_at = ms;
    }

    setCreating(true);
    fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label.trim() || null, tool_slug, expires_at }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        const origin = (typeof window !== "undefined" && window.location && window.location.origin)
          ? window.location.origin
          : SHARE_ORIGIN;
        // Scoped links point at that tool's path; all-tools links point at the landing page.
        const path = tool_slug ? (TOOL_PATHS[tool_slug] || "/") : "/";
        const url = origin + path + "?k=" + encodeURIComponent(d.token);
        setCreated({ url });
        setLabel("");
        setExpiry("");
        setScope("pricing");
        loadLinks();
      })
      .catch(() => setErr("Could not create link."))
      .finally(() => setCreating(false));
  };

  const copyUrl = () => {
    if (!created) return;
    navigator.clipboard?.writeText(created.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const revoke = (id) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, revoked: 1 } : l)));
    fetch("/api/admin/links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
      })
      .catch(() => {
        setErr("Could not revoke link.");
        loadLinks();
      });
  };

  const scopeOptions = useMemo(() => {
    const opts = tools.map((t) => ({ value: t.slug, label: t.name }));
    // Ensure pricing is selectable even if tools have not loaded yet.
    if (!opts.some((o) => o.value === "pricing")) {
      opts.unshift({ value: "pricing", label: "Pharmacy Pricing Reference" });
    }
    opts.push({ value: "all", label: "All tools" });
    return opts;
  }, [tools]);

  return (
    <Card
      title="Access links"
      subtitle="Issue a shareable link for a tool. The full link is shown once at creation and never again."
    >
      {/* New link form */}
      <form onSubmit={create} className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block text-sm">
            <span className="text-slate-500">Label</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Dr. Patel, front desk"
              className="mt-1 w-full py-2 px-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-500">Scope</span>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="mt-1 w-full py-2 px-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              {scopeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-slate-500">Expiry (optional)</span>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="mt-1 w-full py-2 px-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </label>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button
            type="submit"
            disabled={creating}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 ${creating ? "opacity-60" : ""}`}
          >
            <Plus size={15} /> {creating ? "Creating..." : "New link"}
          </button>
          <span className="text-xs text-slate-400">No expiry by default. Scope defaults to the pricing tool.</span>
        </div>
      </form>

      {/* One-time link reveal */}
      {created && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 mb-5">
          <div className="flex items-center gap-2 text-teal-800 text-sm font-semibold mb-1">
            <LinkIcon size={15} /> Shareable link created
          </div>
          <p className="text-xs text-teal-800 mb-3 flex items-start gap-1.5">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            Copy this now. For security it will not be shown again. Revoke it any time from the table below.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              readOnly
              value={created.url}
              className="flex-1 min-w-0 py-2 px-2.5 text-xs font-mono rounded-lg border border-teal-300 bg-white text-slate-800"
              onFocus={(e) => e.target.select()}
            />
            <button
              onClick={copyUrl}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-teal-300 bg-white hover:bg-teal-100"
            >
              {copied ? <Check size={15} className="text-teal-600" /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {err && (
        <div className="flex items-center gap-2 text-sm text-rose-600 mb-3">
          <AlertTriangle size={14} /> {err}
        </div>
      )}

      {/* Links table */}
      {loading && <p className="text-sm text-slate-400">Loading links...</p>}
      {!loading && links.length === 0 && <p className="text-sm text-slate-400">No links yet. Create one above.</p>}
      {!loading && links.length > 0 && (
        <div className="overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 text-left">Label</th>
                <th className="bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 text-left">Scope</th>
                <th className="bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 text-left">Created</th>
                <th className="bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 text-left">Last used</th>
                <th className="bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 text-left">Status</th>
                <th className="bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => {
                const st = linkStatus(l);
                return (
                  <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2.5 text-slate-900">{l.label || <span className="text-slate-300">No label</span>}</td>
                    <td className="px-3 py-2.5 text-slate-600">{toolName(l.tool_slug)}</td>
                    <td className="px-3 py-2.5 text-slate-500">{fmtDate(l.created_at)}</td>
                    <td className="px-3 py-2.5 text-slate-500">{fmtDate(l.last_used_at)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {!l.revoked && (
                        <button
                          onClick={() => revoke(l.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={14} /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/* ---------------------------- Pricing section ---------------------------- */

function PricingSection() {
  const [draft, setDraft] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const flash = (m, ok = true) => {
    setMsg({ m, ok });
    if (ok) setTimeout(() => setMsg(null), 4000);
  };

  const load = () => {
    setLoading(true);
    fetch("/api/admin/pricing")
      .then((r) => r.json())
      .then((d) => {
        const arr = Array.isArray(d) ? d : [];
        setDraft(JSON.stringify(arr, null, 2));
        setCount(arr.length);
      })
      .catch(() => flash("Could not load pricing.", false))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Validate the draft the same way the server does. Returns the parsed array or throws.
  const validate = () => {
    const parsed = JSON.parse(draft);
    if (!Array.isArray(parsed)) throw new Error("Top level must be an array");
    parsed.forEach((r, i) => {
      REQUIRED_FIELDS.forEach((f) => {
        if (!(f in r)) throw new Error(`Row ${i + 1} missing "${f}"`);
      });
      r.price = Number(r.price);
      r.strength = r.strength ?? "";
      r.notes = r.notes ?? "";
    });
    return parsed;
  };

  const save = () => {
    let parsed;
    try {
      parsed = validate();
    } catch (e) {
      flash("Invalid JSON: " + e.message, false);
      return;
    }
    setSaving(true);
    fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed),
    })
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(text || "save failed");
        return JSON.parse(text);
      })
      .then((d) => {
        const n = d && typeof d.count === "number" ? d.count : parsed.length;
        setCount(n);
        setDraft(JSON.stringify(parsed, null, 2));
        flash("Saved " + n + " rows.");
      })
      .catch((e) => flash("Save failed: " + (e.message || "error"), false))
      .finally(() => setSaving(false));
  };

  const validateOnly = () => {
    try {
      const parsed = validate();
      setCount(parsed.length);
      flash("Valid. " + parsed.length + " rows.");
    } catch (e) {
      flash("Invalid JSON: " + e.message, false);
    }
  };

  const download = (text, name, type) => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV export reused from the pricing tool. Exports the current valid draft if parseable.
  const downloadCsv = () => {
    let rows;
    try {
      rows = validate();
    } catch (e) {
      flash("Fix JSON before export: " + e.message, false);
      return;
    }
    const cols = ["product", "strength", "size", "form", "category", "pharmacy", "price", "notes"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(",")]
      .concat(rows.map((r) => cols.map((c) => esc(r[c])).join(",")))
      .join("\n");
    download(csv, "pharmacy-pricing.csv", "text/csv");
  };

  return (
    <Card
      title="Pricing editor"
      subtitle="Source of truth for the pricing tool. Edits appear on the next tool load."
      right={
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-100"
          >
            <RefreshCw size={14} /> Reload
          </button>
          <button
            onClick={downloadCsv}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-100"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      }
    >
      {loading && <p className="text-sm text-slate-400">Loading pricing...</p>}
      {!loading && (
        <>
          <p className="text-xs text-slate-500 mb-2">
            Edit the JSON array. Required fields per row: product, size, form, category, pharmacy, price. Strength and notes default to empty. Validate before saving.
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
            className="w-full text-xs font-mono rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-200"
            style={{ height: "50vh", minHeight: "16rem" }}
          />
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <button
              onClick={save}
              disabled={saving}
              className={`px-3 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 ${saving ? "opacity-60" : ""}`}
            >
              {saving ? "Saving..." : "Save to server"}
            </button>
            <button
              onClick={validateOnly}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-100"
            >
              Validate
            </button>
            <span className="text-sm text-slate-500">
              <b className="text-slate-900">{count}</b> rows
            </span>
            {msg && <span className={`text-sm ${msg.ok ? "text-teal-700" : "text-rose-600"}`}>{msg.m}</span>}
          </div>
        </>
      )}
    </Card>
  );
}
