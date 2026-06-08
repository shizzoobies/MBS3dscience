import React from "react";
import { Link } from "react-router-dom";

const SERIF = { fontFamily: 'Georgia, "Iowan Old Style", "Times New Roman", serif' };

// Client-side fallback for unknown routes. The real access blocks (403 / 503) are
// served by functions/_middleware.js at the edge before the SPA loads. This page only
// catches client navigation to a route that does not exist.
export default function Denied() {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-lg px-6 text-center" style={{ paddingTop: "18vh" }}>
        <h1 className="text-2xl font-bold mb-2" style={SERIF}>
          Page not found
        </h1>
        <p className="text-slate-500">
          That page does not exist. Head back to the{" "}
          <Link to="/" className="text-teal-700 underline">
            tools home
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
