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
  { id: 'home-weight-loss',    query: 'injection pen syringe medication',         out: 'home-weight-loss.jpg' },
  { id: 'home-mens-health',    query: 'man jogging running sunrise outdoor',      out: 'home-mens-health.jpg' },
  { id: 'home-mental-health',  query: 'sleeping woman peaceful bed morning',      out: 'home-mental-health.jpg' },

  // ---- Service hero banners (one per page) ----
  { id: 'hero-weight-loss',         query: 'plate salmon vegetables clean minimal',     out: 'hero-weight-loss.jpg' },
  { id: 'hero-mental-health',       query: 'curtain morning window soft light bedroom', out: 'hero-mental-health.jpg' },
  { id: 'hero-primary-care',        query: 'morning coffee window warm reading',        out: 'hero-primary-care.jpg' },
  { id: 'hero-mens-health',         query: 'fit man jogging trail morning',             out: 'hero-mens-health.jpg' },
  { id: 'hero-womens-health',       query: 'woman yoga stretching morning home',        out: 'hero-womens-health.jpg' },
  { id: 'hero-longevity',           query: 'mature couple hiking trail outdoor',        out: 'hero-longevity.jpg' },
  { id: 'hero-sexual-health',       query: 'couple holding hands sunset romantic',      out: 'hero-sexual-health.jpg' },
  { id: 'hero-hair-dermatology',    query: 'serum dropper bottle skincare flatlay',     out: 'hero-hair-dermatology.jpg' },
  { id: 'hero-labs',                query: 'test tubes rack neutral minimal',           out: 'hero-labs.jpg' },
  { id: 'hero-lifestyle-medicine',  query: 'colorful vegetables variety plate top',     out: 'hero-lifestyle-medicine.jpg' },
  { id: 'hero-concierge-medicine',  query: 'kitchen window morning warm sunlight',      out: 'hero-concierge-medicine.jpg' },

  // ---- Feature-row images (alt themes per page) ----
  // Weight Loss: GLP-1 medication then metabolic optimization (food)
  { id: 'feat-weight-loss-1',  query: 'pills capsule white isolated medication', out: 'feat-weight-loss-1.jpg' },
  { id: 'feat-weight-loss-2',  query: 'meal prep vegetables protein bowl',        out: 'feat-weight-loss-2.jpg' },
  // Mental Health: anxiety calm, sleep, addiction recovery contemplation
  { id: 'feat-mental-health-1', query: 'woman meditating yoga calm home',         out: 'feat-mental-health-1.jpg' },
  { id: 'feat-mental-health-2', query: 'sleeping bedroom peaceful dawn',          out: 'feat-mental-health-2.jpg' },
  { id: 'feat-mental-health-3', query: 'forest path sunrise morning hopeful',     out: 'feat-mental-health-3.jpg' },
  // Primary & Urgent Care: telehealth visit, sick day at home, chronic meds
  { id: 'feat-primary-care-1',  query: 'laptop video call home sofa morning',     out: 'feat-primary-care-1.jpg' },
  { id: 'feat-primary-care-2',  query: 'honey lemon tea cold remedy',             out: 'feat-primary-care-2.jpg' },
  { id: 'feat-primary-care-3',  query: 'pills medication bottle close up',        out: 'feat-primary-care-3.jpg' },
  // Men's Health: TRT (lab vial), ED feature (couple/confidence)
  { id: 'feat-mens-health-1',   query: 'middle aged man smiling outdoor casual',  out: 'feat-mens-health-1.jpg' },
  { id: 'feat-mens-health-2',   query: 'couple bedroom morning sunlight tender',  out: 'feat-mens-health-2.jpg' },
  // Women's Health: menopause life, PCOS hormone wellness
  { id: 'feat-womens-health-1', query: 'woman portrait soft natural light smile', out: 'feat-womens-health-1.jpg' },
  { id: 'feat-womens-health-2', query: 'woman yoga mat home neutral stretch',     out: 'feat-womens-health-2.jpg' },
  // Longevity: biomarkers, recovery training
  { id: 'feat-longevity-1',     query: 'forest sunlight beam morning ethereal',   out: 'feat-longevity-1.jpg' },
  { id: 'feat-longevity-2',     query: 'mature athlete training outdoor',         out: 'feat-longevity-2.jpg' },
  // Sexual Health: ED (relaxed morning), low libido (couple)
  { id: 'feat-sexual-health-1', query: 'couple bed morning soft light',           out: 'feat-sexual-health-1.jpg' },
  { id: 'feat-sexual-health-2', query: 'couple walking holding hands park',       out: 'feat-sexual-health-2.jpg' },
  // Hair & Derm: hair loss medication, skin care routine
  { id: 'feat-hair-derm-1',     query: 'white tablets capsules neutral background',out: 'feat-hair-derm-1.jpg' },
  { id: 'feat-hair-derm-2',     query: 'face skincare cream serum bottle',        out: 'feat-hair-derm-2.jpg' },
  // Labs: panels, monitoring trends
  { id: 'feat-labs-1',          query: 'blood test tube purple top vial',         out: 'feat-labs-1.jpg' },
  { id: 'feat-labs-2',          query: 'fitness tracker watch wrist morning',     out: 'feat-labs-2.jpg' },
  // Lifestyle Medicine: T2D nutrition, cardiovascular movement
  { id: 'feat-lifestyle-1',     query: 'salad bowl wooden table fresh greens',    out: 'feat-lifestyle-1.jpg' },
  { id: 'feat-lifestyle-2',     query: 'running shoes pavement morning',          out: 'feat-lifestyle-2.jpg' },
  // Concierge: availability (video call), continuity (warm home)
  { id: 'feat-concierge-1',     query: 'laptop coffee desk minimal home office',  out: 'feat-concierge-1.jpg' },
  { id: 'feat-concierge-2',     query: 'reading nook armchair window neutral',    out: 'feat-concierge-2.jpg' }
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
