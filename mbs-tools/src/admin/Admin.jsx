import React, { useState, useMemo, useEffect } from "react";
import {
  Pill, Power, Plus, Copy, Check, Trash2, AlertTriangle, Download, Link as LinkIcon, RefreshCw, Upload, Search
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
  const [copiedId, setCopiedId] = useState(null); // which existing row was just copied

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

  // Rebuild a row's shareable URL from its stored token so it can be re-copied
  // and resent without revoking and reissuing.
  const linkUrl = (l) => {
    const origin = (typeof window !== "undefined" && window.location && window.location.origin)
      ? window.location.origin
      : SHARE_ORIGIN;
    const path = l.tool_slug ? (TOOL_PATHS[l.tool_slug] || "/") : "/";
    return origin + path + "?k=" + encodeURIComponent(l.token);
  };
  const copyRowLink = (l) => {
    if (!l.token) return;
    navigator.clipboard?.writeText(linkUrl(l)).then(() => {
      setCopiedId(l.id);
      setTimeout(() => setCopiedId(null), 1500);
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
      subtitle="Issue a shareable link for a tool. Copy it now, or copy it again later from the table to resend."
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
            Copy this now, or copy it again anytime from the table below. Revoke it there whenever you want.
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
                      <div className="inline-flex items-center gap-2 justify-end">
                        {l.token && !l.revoked && (
                          <button
                            onClick={() => copyRowLink(l)}
                            title="Copy this link to resend it"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                          >
                            {copiedId === l.id ? <Check size={14} className="text-teal-600" /> : <Copy size={14} />} {copiedId === l.id ? "Copied" : "Copy link"}
                          </button>
                        )}
                        {!l.revoked && (
                          <button
                            onClick={() => revoke(l.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={14} /> Revoke
                          </button>
                        )}
                      </div>
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

// Minimal CSV parser. Handles quoted fields with embedded commas, quotes
// (doubled), and newlines. Returns an array of string-cell arrays.
function parseCsv(text) {
  const out = [];
  let field = "";
  let record = [];
  let inQuotes = false;
  const s = String(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      record.push(field); field = "";
    } else if (c === "\n") {
      record.push(field); out.push(record); record = []; field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || record.length > 0) { record.push(field); out.push(record); }
  return out;
}

// Turn an uploaded CSV (same columns as the export) into validated pricing
// rows. Maps columns by header name, so column order does not matter and
// extra columns are ignored. Throws a friendly message on any problem.
function csvToRows(text) {
  const raw = parseCsv(text).filter((r) => r.some((c) => String(c).trim() !== ""));
  if (raw.length < 2) throw new Error("needs a header row and at least one data row");
  const header = raw[0].map((h) => h.trim().toLowerCase());
  const required = ["product", "size", "form", "category", "pharmacy", "price"];
  for (const f of required) {
    if (!header.includes(f)) throw new Error('missing the "' + f + '" column');
  }
  const col = (name) => header.indexOf(name);
  return raw.slice(1).map((cells, n) => {
    const get = (name) => { const i = col(name); return i >= 0 ? String(cells[i] ?? "").trim() : ""; };
    const priceRaw = get("price").replace(/[$,]/g, "");
    const price = Number(priceRaw);
    if (priceRaw === "" || Number.isNaN(price)) {
      throw new Error("row " + (n + 1) + ': price "' + get("price") + '" is not a number');
    }
    return {
      product: get("product"),
      strength: get("strength"),
      size: get("size"),
      form: get("form"),
      category: get("category"),
      pharmacy: get("pharmacy"),
      price,
      notes: get("notes"),
    };
  });
}

function PricingSection() {
  const [rows, setRows] = useState([]);
  const [pending, setPending] = useState(null); // rows parsed from an uploaded CSV, awaiting confirm
  const [q, setQ] = useState("");
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
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => flash("Could not load pricing.", false))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      [r.product, r.category, r.form, r.strength, r.notes]
        .some((v) => String(v ?? "").toLowerCase().includes(term))
    );
  }, [rows, q]);

  // Download what is live right now as a CSV (edit it in a spreadsheet).
  const downloadCsv = () => {
    const cols = ["product", "strength", "size", "form", "category", "pharmacy", "price", "notes"];
    const esc = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const csv = [cols.join(",")]
      .concat(rows.map((r) => cols.map((c) => esc(r[c])).join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pharmacy-pricing.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Read a chosen CSV file and stage it for confirmation.
  const onPickCsv = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = csvToRows(String(reader.result));
        if (parsed.length === 0) throw new Error("no data rows found");
        setPending(parsed);
        setMsg(null);
      } catch (err) {
        flash("CSV problem: " + err.message, false);
      }
    };
    reader.onerror = () => flash("Could not read that file.", false);
    reader.readAsText(file);
  };

  const confirmUpload = () => {
    if (!pending) return;
    setSaving(true);
    fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pending),
    })
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(text || "save failed");
        return JSON.parse(text);
      })
      .then((d) => {
        const n = d && typeof d.count === "number" ? d.count : pending.length;
        setRows(pending);
        setPending(null);
        flash("Pricing updated. " + n + " rows are now live.");
      })
      .catch((e) => flash("Update failed: " + (e.message || "error"), false))
      .finally(() => setSaving(false));
  };

  return (
    <Card
      title="Pricing data"
      subtitle="This is what patients see. To change it: download the CSV, edit it in a spreadsheet, and upload it back."
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
            <Download size={14} /> Download CSV
          </button>
          <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 cursor-pointer">
            <Upload size={14} /> Update from CSV
            <input type="file" accept=".csv,text/csv" onChange={onPickCsv} className="hidden" />
          </label>
        </div>
      }
    >
      {loading && <p className="text-sm text-slate-400">Loading pricing...</p>}

      {pending && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 mb-4">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-semibold mb-1">
            <AlertTriangle size={15} /> Review before updating
          </div>
          <p className="text-sm text-amber-800 mb-3">
            Your CSV has <b>{pending.length}</b> rows. This replaces the current <b>{rows.length}</b> rows everywhere the tool is used, and it cannot be undone. Keep your old CSV if you are unsure.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={confirmUpload}
              disabled={saving}
              className={`px-3 py-2 text-sm font-medium rounded-lg bg-teal-600 text-white hover:bg-teal-700 ${saving ? "opacity-60" : ""}`}
            >
              {saving ? "Updating..." : "Yes, replace with " + pending.length + " rows"}
            </button>
            <button
              onClick={() => setPending(null)}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!loading && (
        <>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search product, category, form..."
                className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
                style={{ width: "20rem", maxWidth: "100%" }}
              />
            </div>
            <span className="text-sm text-slate-500">
              <b className="text-slate-900">{rows.length}</b> rows{q ? " · " + filtered.length + " shown" : ""}
            </span>
          </div>

          <div className="overflow-auto rounded-lg border border-slate-200" style={{ maxHeight: "55vh" }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {["Product", "Strength", "Size", "Form", "Category", "Pharmacy", "Price", "Notes"].map((h) => (
                    <th
                      key={h}
                      className={`sticky top-0 bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 ${h === "Price" ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-900 font-medium">{r.product}</td>
                    <td className="px-3 py-2 text-slate-600">{r.strength || <span className="text-slate-300">-</span>}</td>
                    <td className="px-3 py-2 text-slate-600">{r.size}</td>
                    <td className="px-3 py-2 text-slate-600">{r.form}</td>
                    <td className="px-3 py-2 text-slate-600">{r.category}</td>
                    <td className="px-3 py-2 text-slate-600">{r.pharmacy}</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900 whitespace-nowrap">{money(r.price)}</td>
                    <td className="px-3 py-2 text-slate-500">{r.notes || <span className="text-slate-300">-</span>}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-6 text-center text-slate-400">No rows match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {msg && <p className={`text-sm mt-3 ${msg.ok ? "text-teal-700" : "text-rose-600"}`}>{msg.m}</p>}
        </>
      )}
    </Card>
  );
}
