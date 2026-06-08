// One-off seed of the initial Rush Pharmacy pricing catalog into D1.
//
// This is the single source of truth for the seed data, extracted verbatim from the
// original PharmacyPricing component. The live tool no longer bundles this array; it
// reads from D1 via GET /api/tools/pricing, and admin edits it via PUT /api/admin/pricing.
//
// Usage (run while authenticated through Cloudflare Access in the same browser session
// is not possible from node, so seed against a base URL where /api/admin/pricing is
// reachable, or paste the JSON this prints into the admin pricing editor):
//
//   node scripts/seed-pricing.mjs                 # prints validated JSON and row count
//   node scripts/seed-pricing.mjs --print         # same, JSON only on stdout
//   BASE_URL=https://tools.mbsdoc.com ACCESS_COOKIE="CF_Authorization=..." \
//     node scripts/seed-pricing.mjs --put         # PUT the array to the admin API
//
// The owner runs all Cloudflare steps. The simplest seed path is: run with no args,
// copy the JSON, paste into the admin pricing editor, and save.

const PRICING_DATA = [
  // ---- Hormone Support ----
  { product: "Anastrozole", strength: "1 mg", size: "30 Tablets", form: "Tablet", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 43, notes: "" },
  { product: "Armour Thyroid", strength: "30 mg", size: "30 Tablets", form: "Tablet", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 57, notes: "" },
  { product: "Armour Thyroid", strength: "60 mg", size: "30 Tablets", form: "Tablet", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 57, notes: "" },
  { product: "Estradiol Patch", strength: "0.025 mg", size: "4 Patches (1 box)", form: "Patch", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 80, notes: "" },
  { product: "Estradiol Patch", strength: "0.05 mg", size: "4 Patches (1 box)", form: "Patch", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 80, notes: "" },
  { product: "Estradiol Patch", strength: "0.075 mg", size: "4 Patches (1 box)", form: "Patch", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 80, notes: "" },
  { product: "Estradiol Patch", strength: "0.1 mg", size: "4 Patches (1 box)", form: "Patch", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 80, notes: "" },
  { product: "Estradiol Tablet", strength: "1 mg", size: "30 Tablets", form: "Tablet", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 43, notes: "" },
  { product: "Estradiol Tablet", strength: "2 mg", size: "30 Tablets", form: "Tablet", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 43, notes: "" },
  { product: "Liothyronine (T3)", strength: "5 mcg", size: "30 Tablets", form: "Tablet", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 43, notes: "" },
  { product: "Liothyronine (T3)", strength: "25 mcg", size: "30 Tablets", form: "Tablet", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 43, notes: "" },
  { product: "Novarel (hCG)", strength: "5,000 IU", size: "1 Box", form: "Injection", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 275, notes: "" },
  { product: "NP Thyroid", strength: "15 mg (1/4 grain)", size: "30 Tablets", form: "Tablet", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 57, notes: "" },
  { product: "NP Thyroid", strength: "30 mg (1/2 grain)", size: "30 Tablets", form: "Tablet", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 57, notes: "" },
  { product: "NP Thyroid", strength: "60 mg (1 grain)", size: "30 Tablets", form: "Tablet", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 57, notes: "" },
  { product: "Pregnyl (hCG)", strength: "10,000 IU", size: "1 Box (10 mL vial)", form: "Injection", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 250, notes: "" },
  { product: "Progesterone Capsule", strength: "100 mg", size: "30 Capsules", form: "Capsule", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 43, notes: "" },
  { product: "Progesterone Capsule", strength: "200 mg", size: "30 Capsules", form: "Capsule", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 43, notes: "" },
  { product: "Testosterone Cypionate", strength: "200 mg/mL", size: "10 mL", form: "Injection", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 53, notes: "in cottonseed oil" },
  { product: "Testosterone Cypionate", strength: "200 mg/mL", size: "1 mL", form: "Injection", category: "Hormone Support", pharmacy: "Rush Pharmacy", price: 45, notes: "in cottonseed oil" },

  // ---- Peptide Wellness ----
  { product: "BPC-157 + NAD + GHK-Cu Patch", strength: "2000 mcg / 250 mg / 10 mg", size: "1 Patch", form: "Patch", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 50, notes: "" },
  { product: "KPV + NAD + GHK-Cu Patch", strength: "10 mg / 500 mg / 10 mg", size: "1 Patch", form: "Patch", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 50, notes: "" },
  { product: "NAD + GHK-Cu Patch", strength: "1300 mg / 10 mg", size: "1 Patch", form: "Patch", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 50, notes: "" },
  { product: "NAD Injection", strength: "200 mg/mL", size: "5 mL", form: "Injection", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 65, notes: "Compounded" },
  { product: "NAD Nasal Spray", strength: "100 mg/mL", size: "5 mL", form: "Nasal Spray", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 65, notes: "Compounded" },
  { product: "Glutathione + GHK-Cu Patch", strength: "500 mg / 10 mg", size: "1 Patch", form: "Patch", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 50, notes: "" },
  { product: "Glutathione Capsule", strength: "200 mg", size: "30 Capsules", form: "Capsule", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 65, notes: "Compounded" },
  { product: "Glutathione Injection", strength: "200 mg/mL", size: "4 mL", form: "Injection", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 65, notes: "Compounded" },
  { product: "Glutathione Nasal Spray", strength: "100 mg/mL", size: "10 mL", form: "Nasal Spray", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 65, notes: "" },
  { product: "Sermorelin Troche", strength: "1000 mcg", size: "20 Troches", form: "Troche", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 65, notes: "Compounded" },
  { product: "Sermorelin Capsule", strength: "500 mcg", size: "20 Capsules", form: "Capsule", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 65, notes: "Compounded" },
  { product: "Sermorelin Injection", strength: "1 mg/mL", size: "10 mL", form: "Injection", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 70, notes: "Compounded" },
  { product: "PT-141 (Bremelanotide) + Pyridoxine", strength: "10 mg / 10 mg per mL", size: "4 mL", form: "Injection", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 100, notes: "Compounded" },
  { product: "Gonadorelin Injection", strength: "1 mg/mL", size: "5 mL", form: "Injection", category: "Peptide Wellness", pharmacy: "Rush Pharmacy", price: 150, notes: "Compounded" },

  // ---- Weight Management & Metabolic Support ----
  { product: "B12 (Cyanocobalamin) Injection", strength: "", size: "10 mL", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 25, notes: "" },
  { product: "Lipoburn (MIC/B12) Injection", strength: "MIC + B12", size: "10 mL", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 45, notes: "Methionine / Inositol / Choline Chloride / Cyanocobalamin; Compounded" },
  { product: "Liraglutide Injection", strength: "3 mg/mL", size: "3 mL", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 140, notes: "Compounded" },
  { product: "Liraglutide", strength: "10 mg/3 mL", size: "2 pens", form: "Pen", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 450, notes: "" },
  { product: "Stella #1 Capsule", strength: "Bupropion / Caffeine / Naltrexone / Metformin / Methylcobalamin", size: "30-day supply", form: "Capsule", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 45, notes: "Compounded" },
  { product: "Stella #2 Capsule", strength: "Bupropion / Naltrexone / Metformin / Methylcobalamin", size: "30-day supply", form: "Capsule", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 45, notes: "Compounded" },
  { product: "Stella #3 Capsule", strength: "Bupropion / Phentermine / Naltrexone / Metformin / Methylcobalamin", size: "30-day supply", form: "Capsule", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 45, notes: "Compounded" },
  { product: "Semaglutide / Pyridoxine Oral", strength: "2.5 mg / 10 mg", size: "15 Capsules (QOD, 30-day)", form: "Capsule", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 150, notes: "Compounded" },
  { product: "Semaglutide / Pyridoxine Oral", strength: "5 mg / 10 mg", size: "15 Capsules (QOD, 30-day)", form: "Capsule", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 200, notes: "Compounded" },
  { product: "Semaglutide / Pyridoxine Oral", strength: "10 mg / 10 mg", size: "15 Capsules (QOD, 30-day)", form: "Capsule", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 270, notes: "Compounded" },
  { product: "Tirzepatide / Pyridoxine Oral", strength: "5 mg / 10 mg", size: "15 Capsules (QOD, 30-day)", form: "Capsule", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 215, notes: "Compounded" },
  { product: "Tirzepatide / Pyridoxine Oral", strength: "10 mg / 10 mg", size: "15 Capsules (QOD, 30-day)", form: "Capsule", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 300, notes: "Compounded" },
  { product: "Tirzepatide / Pyridoxine Oral", strength: "5 mg / 10 mg", size: "30 Capsules (QD, 30-day)", form: "Capsule", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 330, notes: "Compounded" },
  { product: "Semaglutide / Pyridoxine Injection", strength: "1.25 mg / 10 mg per mL", size: "1 mL (1.25 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 75, notes: "Compounded" },
  { product: "Semaglutide / Pyridoxine Injection", strength: "2.5 mg / 10 mg per mL", size: "1 mL (2.5 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 100, notes: "Compounded" },
  { product: "Semaglutide / Pyridoxine Injection", strength: "2.5 mg / 10 mg per mL", size: "2 mL (5 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 125, notes: "Compounded" },
  { product: "Semaglutide / Pyridoxine Injection", strength: "2.5 mg / 10 mg per mL", size: "3 mL (7.5 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 135, notes: "Compounded" },
  { product: "Semaglutide / Pyridoxine Injection", strength: "2.5 mg per mL", size: "4 mL (10 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 140, notes: "Compounded" },
  { product: "Semaglutide / Pyridoxine Injection", strength: "7.5 mg / 10 mg per mL", size: "4 mL (30 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 270, notes: "Compounded" },
  { product: "Tirzepatide / Pyridoxine Injection", strength: "8 mg / 10 mg per mL", size: "1 mL (8 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 80, notes: "Compounded" },
  { product: "Tirzepatide / Pyridoxine Injection", strength: "12.5 mg / 10 mg per mL", size: "1 mL (12.5 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 125, notes: "Compounded" },
  { product: "Tirzepatide / Pyridoxine Injection", strength: "12.5 mg / 10 mg per mL", size: "2 mL (25 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 175, notes: "Compounded" },
  { product: "Tirzepatide / Pyridoxine Injection", strength: "12.5 mg / 10 mg per mL", size: "3 mL (37.5 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 225, notes: "Compounded" },
  { product: "Tirzepatide / Pyridoxine Injection", strength: "12.5 mg / 10 mg per mL", size: "4 mL (50 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 275, notes: "Compounded" },
  { product: "Tirzepatide / Pyridoxine Injection", strength: "20 mg / 10 mg per mL", size: "3 mL (60 mg total)", form: "Injection", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 325, notes: "Compounded" },
  { product: "Wegovy Pen", strength: "0.25 - 2.4 mg", size: "4 Pens", form: "Pen", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 2100, notes: "Brand" },
  { product: "Mounjaro Pen", strength: "2.5 - 15 mg", size: "4 Pens", form: "Pen", category: "Weight Management & Metabolic Support", pharmacy: "Rush Pharmacy", price: 2100, notes: "Brand" },

  // ---- Men's Health ----
  { product: "Sildenafil", strength: "25 mg", size: "30 Tablets", form: "Tablet", category: "Men's Health", pharmacy: "Rush Pharmacy", price: 42, notes: "" },
  { product: "Tadalafil", strength: "10 mg", size: "30 Tablets", form: "Tablet", category: "Men's Health", pharmacy: "Rush Pharmacy", price: 42, notes: "" },
  { product: "Tadalafil / Sildenafil Troche", strength: "5 mg / 25 mg", size: "16 Troches", form: "Troche", category: "Men's Health", pharmacy: "Rush Pharmacy", price: 57, notes: "Compounded" },
  { product: "Tri-Mix (Papaverine / Phentolamine / Alprostadil)", strength: "30 mg / 1 mg / 10 mcg", size: "3 mL", form: "Injection", category: "Men's Health", pharmacy: "Rush Pharmacy", price: 125, notes: "Compounded" },

  // ---- Topical Products ----
  { product: "BLT Cream (Benzocaine / Lidocaine / Tetracaine)", strength: "", size: "100 g", form: "Cream/Gel", category: "Topical Products", pharmacy: "Rush Pharmacy", price: 74, notes: "Compounded" },
  { product: "Erase-Exc Cream", strength: "Benzocaine / Prilocaine / Lidocaine / Tetracaine / Phenylephrine", size: "100 g", form: "Cream/Gel", category: "Topical Products", pharmacy: "Rush Pharmacy", price: 79, notes: "Pain / bruise reducing; Compounded" },
  { product: "Renova Skin Cream", strength: "Niacinamide / Vit E", size: "30 g", form: "Cream/Gel", category: "Topical Products", pharmacy: "Rush Pharmacy", price: 69.5, notes: "Compounded" },
  { product: "Theravix Plus Skin Cream", strength: "GHK-Cu", size: "30 g", form: "Cream/Gel", category: "Topical Products", pharmacy: "Rush Pharmacy", price: 74.5, notes: "" },
  { product: "GHK-Cu Copper-Peptide Face Cream", strength: "1.5%", size: "30 g", form: "Cream/Gel", category: "Topical Products", pharmacy: "Rush Pharmacy", price: 79.5, notes: "Compounded" },
  { product: "GHK-Cu Copper-Peptide Face Cream", strength: "2.5%", size: "20 g", form: "Cream/Gel", category: "Topical Products", pharmacy: "Rush Pharmacy", price: 80, notes: "Compounded" },
  { product: "Hair Regrowth Topical Gel", strength: "Biotin 0.1% / Caffeine 1% / Melatonin 0.003% / Niacinamide 3%", size: "30 g", form: "Cream/Gel", category: "Topical Products", pharmacy: "Rush Pharmacy", price: 69, notes: "Compounded" },
  { product: "FadeRX Scar / Stretch Mark Cream", strength: "", size: "90 g", form: "Cream/Gel", category: "Topical Products", pharmacy: "Rush Pharmacy", price: 80, notes: "" },
  { product: "Scream Cream (Arginine / Sildenafil / Theophylline)", strength: "6% / 0.5% / 2%", size: "15 g", form: "Cream/Gel", category: "Topical Products", pharmacy: "Rush Pharmacy", price: 55, notes: "Compounded" },
  { product: "Tretinoin Cream", strength: "0.05%", size: "20 g", form: "Cream/Gel", category: "Topical Products", pharmacy: "Rush Pharmacy", price: 37.5, notes: "" },

  // ---- Wellness Support ----
  { product: "Minoxidil", strength: "2.5 mg", size: "30 Tablets", form: "Tablet", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 15, notes: "" },
  { product: "Metformin", strength: "500 mg", size: "30 Tablets", form: "Tablet", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 30, notes: "" },
  { product: "Metformin", strength: "1000 mg", size: "30 Tablets", form: "Tablet", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 30, notes: "" },
  { product: "Ondansetron ODT", strength: "4 mg", size: "30 Tablets", form: "Tablet", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 30, notes: "Dissolving tablets" },
  { product: "Electrolyte Troche (Na / K / Ca / Mg)", strength: "", size: "30 Troches", form: "Troche", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 45, notes: "Compounded" },
  { product: "Electrolyte Troche (Na / K / Ca / Mg)", strength: "", size: "60 Troches", form: "Troche", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 80, notes: "Compounded" },
  { product: "Ketamine Nasal Spray", strength: "150 mg/mL", size: "5 mL", form: "Nasal Spray", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 79.5, notes: "Compounded" },
  { product: "Ivermectin", strength: "12 mg", size: "30 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 22.5, notes: "Compounded" },
  { product: "Mebendazole", strength: "100 mg", size: "30 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 37.5, notes: "Compounded" },
  { product: "Ivermectin / Mebendazole", strength: "12 mg / 100 mg", size: "30 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 80, notes: "Compounded" },
  { product: "Ivermectin / Mebendazole", strength: "25 mg / 250 mg", size: "30 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 79, notes: "Compounded" },
  { product: "Methylene Blue", strength: "1 mg", size: "30 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 46, notes: "Compounded" },
  { product: "Methylene Blue", strength: "5 mg", size: "30 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 54, notes: "Compounded" },
  { product: "Naltrexone (LDN)", strength: "1 mg", size: "30 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 43, notes: "Compounded" },
  { product: "Naltrexone (LDN)", strength: "2 mg", size: "30 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 43, notes: "Compounded" },
  { product: "Naltrexone (LDN)", strength: "3 mg", size: "30 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 43, notes: "Compounded" },
  { product: "Naltrexone (LDN)", strength: "3.5 mg", size: "30 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 43, notes: "Compounded" },
  { product: "Naltrexone (LDN)", strength: "4.5 mg", size: "30 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 43, notes: "Compounded" },
  { product: "Vitamin D", strength: "50,000 IU", size: "12 Capsules", form: "Capsule", category: "Wellness Support", pharmacy: "Rush Pharmacy", price: 30, notes: "" },

  // ---- Nutritional & Wellness Products ----
  { product: "Fruits and Greens Energy", strength: "", size: "1 Container (30 servings)", form: "Powder", category: "Nutritional & Wellness", pharmacy: "Rush Pharmacy", price: 75, notes: "" },
  { product: "Perfect Protein Shake", strength: "", size: "1 Container (15 servings)", form: "Powder", category: "Nutritional & Wellness", pharmacy: "Rush Pharmacy", price: 60, notes: "" },
  { product: "Balanced Meal Complete Shake", strength: "", size: "1 Container (15 servings)", form: "Powder", category: "Nutritional & Wellness", pharmacy: "Rush Pharmacy", price: 60, notes: "" },
  { product: "Probiotic Daily Support", strength: "", size: "60 Capsules", form: "Supplement", category: "Nutritional & Wellness", pharmacy: "Rush Pharmacy", price: 50, notes: "" },
  { product: "Prenatal", strength: "", size: "60 Capsules", form: "Supplement", category: "Nutritional & Wellness", pharmacy: "Rush Pharmacy", price: 50, notes: "" },
  { product: "Hair, Skin, and Nails", strength: "", size: "60 Capsules", form: "Supplement", category: "Nutritional & Wellness", pharmacy: "Rush Pharmacy", price: 40, notes: "" },
  { product: "Active Life Nutrient Capsules", strength: "", size: "60 Capsules", form: "Supplement", category: "Nutritional & Wellness", pharmacy: "Rush Pharmacy", price: 60, notes: "" },
  { product: "Memory Plus Nootropic", strength: "", size: "60 Capsules", form: "Supplement", category: "Nutritional & Wellness", pharmacy: "Rush Pharmacy", price: 75, notes: "" },
  { product: "Zinc, Elderberry, Vit D Lozenge", strength: "", size: "60 Lozenges", form: "Lozenge", category: "Nutritional & Wellness", pharmacy: "Rush Pharmacy", price: 45, notes: "" },
];

// Normalize every row the same way the admin API does: required fields present,
// price coerced to a number, strength and notes defaulted to "".
const REQUIRED = ["product", "size", "form", "category", "pharmacy", "price"];

function normalize(data) {
  return data.map((r, i) => {
    for (const f of REQUIRED) {
      if (!(f in r)) throw new Error("row " + (i + 1) + " missing " + f);
    }
    return {
      product: r.product,
      strength: r.strength ?? "",
      size: r.size,
      form: r.form,
      category: r.category,
      pharmacy: r.pharmacy,
      price: Number(r.price),
      notes: r.notes ?? "",
    };
  });
}

async function main() {
  const args = process.argv.slice(2);
  const seed = normalize(PRICING_DATA);
  const json = JSON.stringify(seed, null, 2);

  if (args.includes("--put")) {
    const base = process.env.BASE_URL || "https://tools.mbsdoc.com";
    const url = base.replace(/\/$/, "") + "/api/admin/pricing";
    const headers = { "Content-Type": "application/json" };
    if (process.env.ACCESS_COOKIE) headers["Cookie"] = process.env.ACCESS_COOKIE;
    const res = await fetch(url, { method: "PUT", headers, body: JSON.stringify(seed) });
    const text = await res.text();
    if (!res.ok) {
      console.error("PUT failed: " + res.status + " " + text);
      process.exit(1);
    }
    console.error("Seeded " + seed.length + " rows to " + url);
    console.log(text);
    return;
  }

  if (args.includes("--print")) {
    console.log(json);
    return;
  }

  // Default: print the validated JSON plus a human summary on stderr.
  console.error("Validated " + seed.length + " pricing rows. Required fields present on every row.");
  console.error("Copy the JSON below into the admin pricing editor and save, or re-run with --put.");
  console.log(json);
}

main().catch((e) => {
  console.error(String(e && e.message ? e.message : e));
  process.exit(1);
});
