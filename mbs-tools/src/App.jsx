import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Denied from "./pages/Denied.jsx";
import PharmacyPricing from "./tools/PharmacyPricing.jsx";
import Admin from "./admin/Admin.jsx";

// Client router. The token gate lives at the edge in functions/_middleware.js, so a
// user only reaches /pricing here after the middleware has already let them through.
// /admin is gated by Cloudflare Access at the edge.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<PharmacyPricing />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Denied />} />
    </Routes>
  );
}
