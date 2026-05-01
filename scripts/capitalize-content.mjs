/**
 * Capitalize first letter of authored-lowercase content where it makes sense:
 *   - FAQ q: "..."
 *   - heading: "..."  (used in values, features, steps)
 *   - subServices.heading
 *   - subServices.intro first letter
 *
 * Leaves intentionally-lowercase signature content alone (hero titles,
 * eyebrow chipLabel strings, testimonial quotes, button text).
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const SRC_PAGES = 'src/pages';
const SRC_COMPS = 'src/components';

function cap(s) {
  if (!s) return s;
  // Only capitalize if first char is a-z. Preserve smart quotes/HTML/etc.
  const m = s.match(/^([^a-zA-Z]*)([a-z])(.*)$/s);
  let out = s;
  if (m) out = m[1] + m[2].toUpperCase() + m[3];
  // Capitalize standalone pronoun "i" → "I" (preserve in words like "in", "is")
  out = out.replace(/\bi\b/g, 'I');
  out = out.replace(/\bi'(m|d|ll|ve|s)\b/g, "I'$1");
  return out;
}

// Match prop string values for a given key, capture content, replace first-letter cap.
function capPropString(text, key) {
  const re = new RegExp(`(\\b${key}:\\s*['"\`])([^'"\`]+)(['"\`])`, 'g');
  return text.replace(re, (_full, open, body, close) => open + cap(body) + close);
}

async function processFile(path) {
  let txt = await readFile(path, 'utf8');
  const before = txt;
  txt = capPropString(txt, 'q');
  txt = capPropString(txt, 'heading');
  // Don't touch chipLabel (eyebrow stays lowercase by design).
  // Don't touch quote (testimonials).
  // Don't touch attr.
  // Don't touch tagline (services overview kept lowercase).
  // Don't touch body (long-form copy already authored properly).
  if (txt !== before) {
    await writeFile(path, txt, 'utf8');
    console.log(`✓ ${path}`);
  }
}

async function main() {
  const pagesFiles = (await readdir(SRC_PAGES)).filter(f => f.endsWith('.astro')).map(f => join(SRC_PAGES, f));
  const compsFiles = (await readdir(SRC_COMPS)).filter(f => f.endsWith('.astro')).map(f => join(SRC_COMPS, f));
  for (const f of [...pagesFiles, ...compsFiles]) {
    await processFile(f);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
