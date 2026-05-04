/**
 * Pixabay image fetcher.
 *
 * Reads `IMAGE_SLOTS` (a list of slots with search queries), calls the
 * Pixabay API for each, picks the best non-medical-staff result,
 * downloads it, and runs it through sharp to produce a 1600px-wide
 * progressive JPEG at quality 78.
 *
 * Usage:
 *   node scripts/fetch-pixabay-images.mjs [slotId1 slotId2 ...]
 *   (no args = fetch every slot)
 *
 * Hard rule: skip any image whose tags include doctor, nurse,
 * medical staff, hospital, clinic, white coat, scrubs, stethoscope.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const PIXABAY_KEY = process.env.PIXABAY_KEY || '34970399-75bd7c875b39d75dc6c564b96';
const OUT_DIR = 'public/images';
const TARGET_WIDTH = 1600;

// ---- Words that disqualify a Pixabay result outright (medical staff) ----
const BLOCKED_TAGS = [
  'doctor', 'doctors', 'nurse', 'nurses', 'physician', 'physicians',
  'medical staff', 'hospital staff', 'hospital', 'clinic', 'clinical',
  'white coat', 'lab coat', 'scrubs', 'stethoscope',
  'surgeon', 'surgical', 'dentist', 'pharmacist',
  'patient examination', 'doctor patient', 'medical worker'
];

// ---- Slots to fetch. Each entry: id, query, outName ----
export const IMAGE_SLOTS = [
  // ---- Home page features ----
  { id: 'home-weight-loss',    query: 'glp1 injection pen medication',     out: 'home-weight-loss.jpg' },
  { id: 'home-mens-health',    query: 'man morning sunshine confident',     out: 'home-mens-health.jpg' },
  { id: 'home-mental-health',  query: 'peaceful bedroom morning sunlight',   out: 'home-mental-health.jpg' },

  // ---- Service hero banners (one per page) ----
  { id: 'hero-weight-loss',         query: 'glp1 pen prescription medication',          out: 'hero-weight-loss.jpg' },
  { id: 'hero-mental-health',       query: 'window sunrise peaceful calm',              out: 'hero-mental-health.jpg' },
  { id: 'hero-primary-care',        query: 'laptop video call home cozy',               out: 'hero-primary-care.jpg' },
  { id: 'hero-mens-health',         query: 'man jogging sunrise outdoors',              out: 'hero-mens-health.jpg' },
  { id: 'hero-womens-health',       query: 'woman bright kitchen morning natural',      out: 'hero-womens-health.jpg' },
  { id: 'hero-longevity',           query: 'hiking trail mature couple outdoor',        out: 'hero-longevity.jpg' },
  { id: 'hero-sexual-health',       query: 'couple holding hands sunset',               out: 'hero-sexual-health.jpg' },
  { id: 'hero-hair-dermatology',    query: 'skincare bottle minimal clean',             out: 'hero-hair-dermatology.jpg' },
  { id: 'hero-labs',                query: 'blood test tubes vials laboratory',         out: 'hero-labs.jpg' },
  { id: 'hero-lifestyle-medicine',  query: 'colorful vegetables kitchen healthy',       out: 'hero-lifestyle-medicine.jpg' },
  { id: 'hero-concierge-medicine',  query: 'modern home phone call elegant',            out: 'hero-concierge-medicine.jpg' },

  // ---- Feature-row images (2 per service page, alt themes) ----
  { id: 'feat-weight-loss-1',  query: 'person walking nature morning',         out: 'feat-weight-loss-1.jpg' },
  { id: 'feat-weight-loss-2',  query: 'meal prep vegetables protein bowl',     out: 'feat-weight-loss-2.jpg' },
  { id: 'feat-mental-health-1', query: 'meditation calm peaceful breathing',   out: 'feat-mental-health-1.jpg' },
  { id: 'feat-mental-health-2', query: 'sleeping bedroom peaceful dawn',       out: 'feat-mental-health-2.jpg' },
  { id: 'feat-mental-health-3', query: 'forest path walking sunrise solitude', out: 'feat-mental-health-3.jpg' },
  { id: 'feat-primary-care-1',  query: 'tablet relaxed home telehealth',       out: 'feat-primary-care-1.jpg' },
  { id: 'feat-primary-care-2',  query: 'tea couch sick home rest',             out: 'feat-primary-care-2.jpg' },
  { id: 'feat-primary-care-3',  query: 'pill bottle medication routine',       out: 'feat-primary-care-3.jpg' },
  { id: 'feat-mens-health-1',   query: 'man portrait window light confident',  out: 'feat-mens-health-1.jpg' },
  { id: 'feat-mens-health-2',   query: 'man lifting weights home',             out: 'feat-mens-health-2.jpg' },
  { id: 'feat-womens-health-1', query: 'woman 40s outdoors confident',         out: 'feat-womens-health-1.jpg' },
  { id: 'feat-womens-health-2', query: 'woman cooking healthy meal',           out: 'feat-womens-health-2.jpg' },
  { id: 'feat-longevity-1',     query: 'dna molecule research abstract',       out: 'feat-longevity-1.jpg' },
  { id: 'feat-longevity-2',     query: 'mature athlete training outdoor',      out: 'feat-longevity-2.jpg' },
  { id: 'feat-sexual-health-1', query: 'man bedroom morning relaxed',          out: 'feat-sexual-health-1.jpg' },
  { id: 'feat-sexual-health-2', query: 'couple candid lifestyle outdoors',     out: 'feat-sexual-health-2.jpg' },
  { id: 'feat-hair-derm-1',     query: 'shampoo bottle clean minimal',         out: 'feat-hair-derm-1.jpg' },
  { id: 'feat-hair-derm-2',     query: 'face skincare minimal aesthetic',      out: 'feat-hair-derm-2.jpg' },
  { id: 'feat-labs-1',          query: 'pipette test tube science',            out: 'feat-labs-1.jpg' },
  { id: 'feat-labs-2',          query: 'data graph chart analysis',            out: 'feat-labs-2.jpg' },
  { id: 'feat-lifestyle-1',     query: 'rainbow vegetables plate healthy',     out: 'feat-lifestyle-1.jpg' },
  { id: 'feat-lifestyle-2',     query: 'running shoes pavement morning',       out: 'feat-lifestyle-2.jpg' },
  { id: 'feat-concierge-1',     query: 'home office video call laptop',        out: 'feat-concierge-1.jpg' },
  { id: 'feat-concierge-2',     query: 'morning coffee home elegant',          out: 'feat-concierge-2.jpg' }
];

function isBlocked(hit) {
  const tags = (hit.tags || '').toLowerCase();
  return BLOCKED_TAGS.some(b => tags.includes(b));
}

async function fetchSlot(slot) {
  const url =
    `https://pixabay.com/api/` +
    `?key=${PIXABAY_KEY}` +
    `&q=${encodeURIComponent(slot.query)}` +
    `&image_type=photo` +
    `&orientation=horizontal` +
    `&safesearch=true` +
    `&per_page=15` +
    `&min_width=1280`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay ${res.status} for ${slot.id}`);
  const data = await res.json();
  if (!data.hits?.length) throw new Error(`No results for ${slot.query}`);

  const safe = data.hits.find(h => !isBlocked(h));
  if (!safe) throw new Error(`All ${data.hits.length} results blocked for ${slot.query}`);

  // Download largest available
  const imgUrl = safe.largeImageURL || safe.fullHDURL || safe.webformatURL;
  const imgRes = await fetch(imgUrl);
  if (!imgRes.ok) throw new Error(`Image fetch ${imgRes.status} for ${slot.id}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());

  const outPath = join(OUT_DIR, slot.out);
  await sharp(buf)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 78, progressive: true, mozjpeg: true })
    .toFile(outPath);

  // Record provenance
  return {
    slot: slot.id,
    query: slot.query,
    out: slot.out,
    pageURL: safe.pageURL,
    user: safe.user,
    tags: safe.tags
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const requested = process.argv.slice(2);
  const list = requested.length
    ? IMAGE_SLOTS.filter(s => requested.includes(s.id))
    : IMAGE_SLOTS;

  const log = [];
  for (const slot of list) {
    process.stdout.write(`${slot.id.padEnd(28)} ← `);
    try {
      const info = await fetchSlot(slot);
      log.push(info);
      process.stdout.write(`OK  (${info.out})  via ${info.user}\n`);
    } catch (err) {
      process.stdout.write(`FAIL  ${err.message}\n`);
      log.push({ slot: slot.id, error: err.message });
    }
    // Be polite to Pixabay
    await new Promise(r => setTimeout(r, 250));
  }

  // Write a manifest for credit/reference
  await writeFile(
    'scripts/pixabay-manifest.json',
    JSON.stringify(log, null, 2),
    'utf8'
  );
  console.log(`\nDone. Manifest written to scripts/pixabay-manifest.json`);
}

main().catch(err => { console.error(err); process.exit(1); });
