import React, { useState, useMemo, useEffect } from "react";
import {
  Search, ArrowUpDown, ArrowUp, ArrowDown, Database, Download,
  Copy, Check, X, Pill, LayoutList, Columns3, AlertTriangle
} from "lucide-react";

/*
  MBS Medical - Pharmacy Pricing Reference
  ----------------------------------------
  Data source of truth is now D1, served by the gated API at GET /api/tools/pricing.
  The middleware verifies the access link before this component ever loads, so the
  fetch below only succeeds for a valid, enabled link. Admin edits the data through
  the admin panel (PUT /api/admin/pricing); changes appear on the next tool load.

  The original PRICING_DATA seed array lives in scripts/seed-pricing.mjs and is used
  once to seed D1. It is intentionally not bundled here so the catalog cannot be pulled
  without a valid link.

  Comparison lines up rows that share the same product + strength + size across
  pharmacies. The Manage data panel can preview a pasted array locally, but the source
  of truth is D1 via the admin pricing editor.
*/

const money = (n) => "$" + Number(n).toFixed(2);
const uniq = (arr) => Array.from(new Set(arr));
const skuKey = (r) => [r.product, r.strength, r.size].join(" | ");

const SERIF = { fontFamily: 'Georgia, "Iowan Old Style", "Times New Roman", serif' };

// Each pharmacy links to its ordering portal. Clicking a catalog row (or a price
// cell in Compare) opens that pharmacy's portal in a new tab. Matched loosely on
// the pharmacy name so it works regardless of the exact stored label.
const PHARMACY_PORTALS = [
  [/sands/i, "https://portal.sandsrx.com/login"],
  [/olympia/i, "https://olympiapharmacy.drscriptportal.com/login"],
  [/rush/i, "https://host3d.lifefile.net:40443/application_main_zfw/login/login/vendor_name/rushpharmacy/access/doctor"],
  [/promise/i, "https://promise.pharmetika.com/provider_access/login"],
];
const portalFor = (pharmacy) => {
  const hit = PHARMACY_PORTALS.find(([re]) => re.test(pharmacy || ""));
  return hit ? hit[1] : null;
};

// ---- Computed columns: total active drug and a normalized unit cost, derived from
// each row's strength + size + price. The data is heterogeneous, so these return
// null (rendered as a dash) when a row cannot be parsed. ----
const _num = (s) => parseFloat(String(s).replace(/,/g, ""));
const _fmtAmt = (v) => (v >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 2 }) : String(+v.toFixed(2)));
const _fmtCost = (v) => "$" + (v >= 1 ? v.toFixed(2) : v >= 0.1 ? v.toFixed(3) : v.toFixed(4));

// Primary active concentration expressed per mL, e.g. "200 mg/mL" or "2.5 mg / 10 mg per mL".
function concPerMl(strength) {
  if (!/(\/\s*ml|per\s*ml)/i.test(strength || "")) return null;
  const m = String(strength).match(/([\d.,]+)\s*(mcg|mg|g|iu|units?)/i);
  return m ? { val: _num(m[1]), unit: m[2].toLowerCase().replace(/s$/, "") } : null;
}
const mlOf = (size) => { const m = String(size).match(/([\d.]+)\s*ml\b/i); return m ? _num(m[1]) : null; };
// Discrete-unit count: "30 Tablets", "16 Troches", "each".
function countOf(size) {
  const s = String(size).trim();
  if (/^(each|ea)$/i.test(s)) return 1;
  let m = s.match(/^#?\s*([\d.]+)\s*(?:capsules?|tablets?|troches?|patch(?:es)?|suppositor\w*|pearls?|lozenges?|softgels?|pens?)/i);
  if (m) return _num(m[1]);
  m = s.match(/([\d.]+)\s*(?:capsules?|tablets?|troches?|patch(?:es)?|suppositor\w*|pearls?|lozenges?)/i);
  return m ? _num(m[1]) : null;
}
const gramsOf = (size) => { const m = String(size).match(/([\d.]+)\s*g\b/i); return (m && !/m(?:c)?g/i.test(m[0])) ? _num(m[1]) : null; };
// A single active amount like "1 mg" (reject ranges, percentages, and multi-ingredient).
function singleAmount(strength) {
  const s = String(strength).trim();
  if (!s || /[/%]/.test(s) || /\bto\b/i.test(s) || /[–—]/.test(s) || /\d\s*-\s*\d/.test(s)) return null;
  const ms = [...s.matchAll(/([\d.,]+)\s*(mcg|mg|g|iu|units?)\b/gi)];
  if (ms.length !== 1) return null;
  return { val: _num(ms[0][1]), unit: ms[0][2].toLowerCase().replace(/s$/, "") };
}
// Total active drug in the package: concentration x volume, or per-unit dose x count.
function totalDrug(r) {
  const conc = concPerMl(r.strength), ml = mlOf(r.size);
  if (conc && ml) return _fmtAmt(conc.val * ml) + " " + conc.unit;
  const amt = singleAmount(r.strength), cnt = countOf(r.size);
  if (amt && cnt) return _fmtAmt(amt.val * cnt) + " " + amt.unit;
  return null;
}
// Normalized unit cost -> { value, label } or null. value is numeric (for sorting),
// label is the display string. $/active-unit for injectables, $/ea for solids, $/g for creams.
function unitCost(r) {
  const price = Number(r.price);
  if (!isFinite(price)) return null;
  const conc = concPerMl(r.strength), ml = mlOf(r.size);
  let value = null, unit = null;
  if (conc && ml && conc.val * ml > 0) { value = price / (conc.val * ml); unit = conc.unit; }
  else { const cnt = countOf(r.size); if (cnt) { value = price / cnt; unit = "ea"; }
    else { const g = gramsOf(r.size); if (g) { value = price / g; unit = "g"; } } }
  return value == null ? null : { value, label: _fmtCost(value) + "/" + unit };
}

export default function PharmacyPricing() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [form, setForm] = useState("All");
  const [pharmacy, setPharmacy] = useState("All");
  const [sortKey, setSortKey] = useState("category");
  const [sortDir, setSortDir] = useState("asc");
  const [view, setView] = useState("catalog");
  const [showData, setShowData] = useState(false);
  const [draft, setDraft] = useState("");
  const [msg, setMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/tools/pricing")
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  // Quick-filter pills. The broad weight-management category is replaced in place by
  // two targeted GLP-1 shortcuts (Tirzepatide, Semaglutide) that match by product name.
  const categories = useMemo(() => {
    const out = ["All"];
    for (const c of uniq(rows.map((r) => r.category))) {
      if (c === "Weight Management & Metabolic Support") out.push("Tirzepatide", "Semaglutide");
      else out.push(c);
    }
    return out;
  }, [rows]);
  const forms = useMemo(() => ["All", ...uniq(rows.map((r) => r.form)).sort()], [rows]);
  const pharmacies = useMemo(() => uniq(rows.map((r) => r.pharmacy)), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows.filter((r) => {
      if (category === "Tirzepatide") { if (!/tirzepatide/i.test(r.product)) return false; }
      else if (category === "Semaglutide") { if (!/semaglutide/i.test(r.product)) return false; }
      else if (category !== "All" && r.category !== category) return false;
      if (form !== "All" && r.form !== form) return false;
      if (pharmacy !== "All" && r.pharmacy !== pharmacy) return false;
      if (!q) return true;
      const hay = [r.product, r.strength, r.size, r.form, r.category, r.pharmacy, r.notes]
        .join(" ").toLowerCase();
      return q.split(/\s+/).every((t) => hay.includes(t));
    });
    out = [...out].sort((a, b) => {
      // Unit Cost is computed and mixes units across forms, so sort by its numeric
      // value (most meaningful with a Form filter applied); rows without a value sort last.
      if (sortKey === "unitcost") {
        const ua = unitCost(a)?.value ?? null, ub = unitCost(b)?.value ?? null;
        if (ua == null && ub == null) return a.product.toLowerCase() < b.product.toLowerCase() ? -1 : 1;
        if (ua == null) return 1;
        if (ub == null) return -1;
        const c = ua === ub ? (a.product.toLowerCase() < b.product.toLowerCase() ? -1 : 1) : (ua < ub ? -1 : 1);
        return sortDir === "asc" ? c : -c;
      }
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === "price") { av = a.price; bv = b.price; }
      else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
      let cmp = av < bv ? -1 : av > bv ? 1 : 0;
      if (cmp === 0 && sortKey !== "product") {
        cmp = a.product.toLowerCase() < b.product.toLowerCase() ? -1 : 1;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [rows, query, category, form, pharmacy, sortKey, sortDir]);

  const prices = filtered.map((r) => r.price);
  const minP = prices.length ? Math.min(...prices) : 0;
  const maxP = prices.length ? Math.max(...prices) : 0;

  // Comparison: one row per SKU, one column per pharmacy.
  const compare = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const k = skuKey(r);
      if (!map.has(k)) map.set(k, { product: r.product, strength: r.strength, size: r.size, category: r.category, prices: {} });
      map.get(k).prices[r.pharmacy] = r.price;
    });
    return Array.from(map.values()).sort((a, b) =>
      a.product.toLowerCase() < b.product.toLowerCase() ? -1 :
      a.product.toLowerCase() > b.product.toLowerCase() ? 1 :
      String(a.strength).localeCompare(String(b.strength)));
  }, [filtered]);

  const toggleSort = (k) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };
  const SortIcon = ({ k }) =>
    sortKey !== k ? <ArrowUpDown size={12} className="opacity-40" /> :
    sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;

  const flash = (m, ok = true) => { setMsg({ m, ok }); setTimeout(() => setMsg(null), 3000); };

  const loadJson = () => {
    try {
      const parsed = JSON.parse(draft);
      if (!Array.isArray(parsed)) throw new Error("Top level must be an array");
      const need = ["product", "size", "form", "category", "pharmacy", "price"];
      parsed.forEach((r, i) => {
        need.forEach((f) => { if (!(f in r)) throw new Error(`Row ${i + 1} missing "${f}"`); });
        r.price = Number(r.price);
        r.strength = r.strength ?? "";
        r.notes = r.notes ?? "";
      });
      setRows(parsed);
      flash(`Loaded ${parsed.length} rows`);
    } catch (e) { flash("Invalid JSON: " + e.message, false); }
  };
  const copyJson = () => {
    const t = JSON.stringify(rows, null, 2);
    navigator.clipboard?.writeText(t).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
    setDraft(t);
  };
  const download = (text, name, type) => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };
  const downloadCsv = () => {
    const cols = ["product", "strength", "size", "form", "category", "pharmacy", "price", "notes"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(",")].concat(rows.map((r) => cols.map((c) => esc(r[c])).join(","))).join("\n");
    download(csv, "pharmacy-pricing.csv", "text/csv");
  };
  // Reload from the source of truth in D1 (discards any local preview from Manage data).
  const reloadFromServer = () => {
    fetch("/api/tools/pricing")
      .then((r) => r.json())
      .then((d) => { setRows(Array.isArray(d) ? d : []); flash("Reloaded from server"); })
      .catch(() => flash("Could not reload from server", false));
  };

  const formColor = (f) => ({
    Tablet: "bg-blue-50 text-blue-700",
    Capsule: "bg-indigo-50 text-indigo-700",
    Injection: "bg-rose-50 text-rose-700",
    Patch: "bg-amber-50 text-amber-700",
    "Nasal Spray": "bg-cyan-50 text-cyan-700",
    Troche: "bg-violet-50 text-violet-700",
    "Cream/Gel": "bg-emerald-50 text-emerald-700",
    Pen: "bg-fuchsia-50 text-fuchsia-700",
    Lozenge: "bg-orange-50 text-orange-700",
    Powder: "bg-lime-50 text-lime-700",
    Supplement: "bg-teal-50 text-teal-700",
  }[f] || "bg-slate-100 text-slate-600");

  const Th = ({ k, children, right }) => (
    <th className={`sticky top-0 z-10 bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 ${right ? "text-right" : "text-left"}`}>
      <button onClick={() => toggleSort(k)} className={`inline-flex items-center gap-1 hover:text-white ${right ? "flex-row-reverse" : ""}`}>
        {children} <SortIcon k={k} />
      </button>
    </th>
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold uppercase tracking-widest">
              <Pill size={14} /> MBS Medical
            </div>
            <h1 className="text-3xl font-bold mt-1" style={SERIF}>Pharmacy Pricing Reference</h1>
            <p className="text-sm text-slate-500 mt-1">
              {rows.length} line items across {pharmacies.length} {pharmacies.length === 1 ? "pharmacy" : "pharmacies"}. Search by medication, dose, form, or pharmacy. Click any row to open that pharmacy's ordering portal in a new tab.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-300 overflow-hidden">
              <button onClick={() => setView("catalog")}
                className={`px-3 py-2 text-sm font-medium inline-flex items-center gap-1.5 ${view === "catalog" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>
                <LayoutList size={15} /> Catalog
              </button>
              <button onClick={() => setView("compare")}
                className={`px-3 py-2 text-sm font-medium inline-flex items-center gap-1.5 ${view === "compare" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}>
                <Columns3 size={15} /> Compare
              </button>
            </div>
            <button onClick={() => setShowData((s) => !s)}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 inline-flex items-center gap-1.5">
              <Database size={15} /> Manage data
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-3 py-10 text-center text-slate-400">
            Loading pricing...
          </div>
        )}

        {!loading && (
          <>
        {/* Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 mb-3">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-0">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search e.g. tirzepatide, 12.5 mg, testosterone, troche..."
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X size={16} />
                </button>
              )}
            </div>
            <Select label="Form" value={form} onChange={setForm} options={forms} />
            <Select label="Pharmacy" value={pharmacy} onChange={setPharmacy} options={["All", ...pharmacies]} />
          </div>
          {/* Category pills */}
          <div className="flex gap-1.5 flex-wrap mt-3">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${category === c ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-300 hover:border-teal-400 hover:text-teal-700"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2 px-1">
          <span>Showing <b className="text-slate-900">{view === "compare" ? compare.length : filtered.length}</b> {view === "compare" ? "SKUs" : "items"}</span>
          {prices.length > 0 && <span>Price range <b className="text-slate-900">{money(minP)}</b> to <b className="text-slate-900">{money(maxP)}</b></span>}
        </div>

        {/* Catalog table */}
        {view === "catalog" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-auto" style={{ maxHeight: "62vh" }}>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <Th k="product">Product</Th>
                    <Th k="strength">Dose / Strength</Th>
                    <Th k="size">Unit Size</Th>
                    <Th k="form">Form</Th>
                    <Th k="category">Category</Th>
                    <Th k="pharmacy">Pharmacy</Th>
                    <Th k="price" right>Price</Th>
                    <th className="sticky top-0 z-10 bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 text-right">Total Drug</th>
                    <Th k="unitcost" right>Unit Cost</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const portal = portalFor(r.pharmacy);
                    const total = totalDrug(r), cost = unitCost(r);
                    return (
                    <tr key={i}
                      onClick={portal ? () => window.open(portal, "_blank", "noopener,noreferrer") : undefined}
                      title={portal ? `Open the ${r.pharmacy} ordering portal in a new tab` : undefined}
                      className={`border-t border-slate-100 hover:bg-teal-50 ${portal ? "cursor-pointer" : ""}`}>
                      <td className="px-3 py-2.5 align-top">
                        <div className="font-medium text-slate-900">{r.product}</div>
                        {r.notes && <div className="text-xs text-slate-400 mt-0.5">{r.notes}</div>}
                      </td>
                      <td className="px-3 py-2.5 align-top text-slate-700">{r.strength || <span className="text-slate-300">-</span>}</td>
                      <td className="px-3 py-2.5 align-top text-slate-600">{r.size}</td>
                      <td className="px-3 py-2.5 align-top">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${formColor(r.form)}`}>{r.form}</span>
                      </td>
                      <td className="px-3 py-2.5 align-top text-slate-500 text-xs">{r.category}</td>
                      <td className="px-3 py-2.5 align-top text-slate-600">{r.pharmacy}</td>
                      <td className="px-3 py-2.5 align-top text-right font-semibold text-slate-900 tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>{money(r.price)}</td>
                      <td className="px-3 py-2.5 align-top text-right text-slate-600 tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>{total || <span className="text-slate-300">-</span>}</td>
                      <td className="px-3 py-2.5 align-top text-right text-slate-600 tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>{cost ? cost.label : <span className="text-slate-300">-</span>}</td>
                    </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="px-3 py-10 text-center text-slate-400">No medications match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compare table */}
        {view === "compare" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {pharmacies.length === 1 && (
              <div className="flex items-start gap-2 bg-amber-50 border-b border-amber-200 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>Only one pharmacy loaded. Add more (via Manage data) and identical product + dose + size SKUs will line up here with the lowest price highlighted.</span>
              </div>
            )}
            <div className="overflow-auto" style={{ maxHeight: "62vh" }}>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-10 bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 text-left">Product</th>
                    <th className="sticky top-0 z-10 bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 text-left">Dose</th>
                    <th className="sticky top-0 z-10 bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 text-left">Size</th>
                    {pharmacies.map((p) => (
                      <th key={p} className="sticky top-0 z-10 bg-slate-900 text-slate-100 text-xs font-semibold uppercase tracking-wider px-3 py-2.5 text-right">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compare.map((row, i) => {
                    const vals = pharmacies.map((p) => row.prices[p]).filter((v) => v != null);
                    const low = vals.length ? Math.min(...vals) : null;
                    return (
                      <tr key={i} className="border-t border-slate-100 hover:bg-teal-50">
                        <td className="px-3 py-2.5 font-medium text-slate-900">{row.product}</td>
                        <td className="px-3 py-2.5 text-slate-700">{row.strength || <span className="text-slate-300">-</span>}</td>
                        <td className="px-3 py-2.5 text-slate-600">{row.size}</td>
                        {pharmacies.map((p) => {
                          const v = row.prices[p];
                          const isLow = v != null && v === low && pharmacies.length > 1;
                          const portal = v != null ? portalFor(p) : null;
                          return (
                            <td key={p}
                              onClick={portal ? () => window.open(portal, "_blank", "noopener,noreferrer") : undefined}
                              title={portal ? `Open the ${p} ordering portal in a new tab` : undefined}
                              className={`px-3 py-2.5 text-right font-semibold tabular-nums ${portal ? "cursor-pointer" : ""} ${isLow ? "bg-teal-50 text-teal-700" : v != null ? "text-slate-900" : "text-slate-300"}`} style={{ fontVariantNumeric: "tabular-nums" }}>
                              {v != null ? money(v) : "-"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {compare.length === 0 && (
                    <tr><td colSpan={3 + pharmacies.length} className="px-3 py-10 text-center text-slate-400">No SKUs match your filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Data management */}
        {showData && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mt-3">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <h3 className="font-semibold text-slate-800">Manage data</h3>
              <div className="flex gap-2">
                <button onClick={copyJson} className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-100 inline-flex items-center gap-1.5">
                  {copied ? <Check size={14} className="text-teal-600" /> : <Copy size={14} />} {copied ? "Copied" : "Copy JSON"}
                </button>
                <button onClick={() => download(JSON.stringify(rows, null, 2), "pharmacy-pricing.json", "application/json")} className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-100 inline-flex items-center gap-1.5">
                  <Download size={14} /> JSON
                </button>
                <button onClick={downloadCsv} className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-100 inline-flex items-center gap-1.5">
                  <Download size={14} /> CSV
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Paste a full JSON array to preview it in the table locally (e.g. when adding a second pharmacy). Required fields per row: product, strength, size, form, category, pharmacy, price. This preview does not save. The source of truth is the admin pricing editor, which writes to the server.
            </p>
            <textarea
              value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder='[{"product":"...","strength":"...","size":"...","form":"...","category":"...","pharmacy":"...","price":0,"notes":""}]'
              className="w-full h-40 text-xs font-mono rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-200"
              style={{ maxHeight: "40vh" }}
            />
            <div className="flex items-center gap-3 mt-2">
              <button onClick={loadJson} className="px-3 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800">Load into table</button>
              <button onClick={reloadFromServer} className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-100">Reload from server</button>
              {msg && <span className={`text-sm ${msg.ok ? "text-teal-700" : "text-rose-600"}`}>{msg.m}</span>}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          Source: Rush Pharmacy catalog. Verify pricing against the source sheet before quoting a patient. Brand items (Wegovy, Mounjaro) reflect catalog pricing and may not include insurance adjudication. This tool is an internal pricing reference, not patient-facing material or clinical guidance.
        </p>
          </>
        )}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="py-2 px-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-200" style={{ maxWidth: "180px" }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
