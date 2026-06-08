import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Pill, ArrowRight } from "lucide-react";

const SERIF = { fontFamily: 'Georgia, "Iowan Old Style", "Times New Roman", serif' };

// The tools this platform exposes. Add an entry per tool as the platform grows.
// Access is enforced at the edge per tool, so listing a tool here does not grant access.
const TOOLS = [
  {
    slug: "pricing",
    path: "/pricing",
    name: "Pharmacy Pricing Reference",
    description: "Search and compare compounding pharmacy pricing across categories.",
  },
];

export default function Landing() {
  const location = useLocation();
  // Preserve a token from the link (?k=...) so a first click into a tool still carries
  // the key. After the first tool load the edge promotes it to a cookie.
  const params = new URLSearchParams(location.search);
  const k = params.get("k");
  const withKey = (path) => (k ? path + "?k=" + encodeURIComponent(k) : path);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold uppercase tracking-widest">
          <Pill size={14} /> MBS Medical
        </div>
        <h1 className="text-4xl font-bold mt-2" style={SERIF}>
          MBS Tools
        </h1>
        <p className="text-base text-slate-500 mt-3 leading-relaxed">
          Internal reference tools. Open a tool below. Access is managed per link, so you
          will only be able to open tools your link grants.
        </p>

        <div className="mt-10 space-y-3">
          {TOOLS.map((t) => (
            <Link
              key={t.slug}
              to={withKey(t.path)}
              className="block bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-teal-400 transition group"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900" style={SERIF}>
                    {t.name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{t.description}</p>
                </div>
                <ArrowRight
                  size={20}
                  className="text-slate-400 group-hover:text-teal-600 shrink-0"
                />
              </div>
            </Link>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-12 leading-relaxed">
          If a tool shows an access message, the link may be expired, revoked, or scoped to
          a different tool. Contact MBS Medical for a fresh link.
        </p>
      </div>
    </div>
  );
}
