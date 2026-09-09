// Claims + uniqueness lint for the 16 persona pages (32 intent combos).
// Run: node scripts/lint-heloc-personas.mjs   (exits 1 on any finding)
import { readFileSync, readdirSync } from "node:fs";

const BANNED = [
  /—/, /guarantee/i, /no credit check/i, /instant approval/i, /pre-?approved/i,
  /VA[- ]HELOC/i, /VA[- ]backed/i, /government[- ]backed HELOC/i,
  /lowest rate/i, /\d+\.\d+\s?%/, /\bAPR\b/, /tax[- ]deduct/i,
  /increases? (your |the )?home.?s? value/i, /drowning in debt/i,
  /payments? (stay|remain)s? (the same|unchanged)/i, /no documentation/i, /no[- ]doc\b/i,
  /automatic(ally)? qualif/i, /exclusive (offer|terms)/i, /discount/i,
];
let fail = 0;
const seen = { renovation: new Map(), consolidation: new Map() };
const files = readdirSync("heloc").filter(f => f.endsWith(".html"));
if (files.length !== 16) { console.error("expected 16 pages, found " + files.length); fail++; }
for (const f of files) {
  const t = readFileSync("heloc/" + f, "utf8");
  for (const rx of BANNED) if (rx.test(t)) { console.error(`${f}: banned pattern ${rx}`); fail++; }
  const m = /id="sh-persona-content">(.*?)<\/script>/s.exec(t);
  if (!m) { console.error(`${f}: missing content JSON`); fail++; continue; }
  const cfg = JSON.parse(m[1].replace(/<\\\//g, "</"));
  for (const intent of ["renovation", "consolidation"]) {
    const c = cfg.intents[intent];
    if (!c) { console.error(`${f}: missing ${intent}`); fail++; continue; }
    for (const k of ["h1", "sub", "sit_h", "sit_p1", "sit_p2", "dist_h", "dist_p1", "dist_p2", "bens", "intake", "purpose"])
      if (!c[k]) { console.error(`${f}/${intent}: empty ${k}`); fail++; }
    if (!(c.faqs && c.faqs.length >= 4 && c.faqs.length <= 6)) { console.error(`${f}/${intent}: ${c.faqs?.length} FAQs (need 4-6)`); fail++; }
    // uniqueness across personas: no copy-paste pages
    for (const k of ["h1", "sit_p1", "dist_p1"]) {
      const key = c[k];
      if (seen[intent].has(key)) { console.error(`${f}/${intent}: ${k} duplicates ${seen[intent].get(key)}`); fail++; }
      seen[intent].set(key, f + "/" + k);
    }
  }
  // the two intents must differ meaningfully within a page
  const r = cfg.intents.renovation, c2 = cfg.intents.consolidation;
  if (r && c2 && (r.h1 === c2.h1 || r.sit_p1 === c2.sit_p1)) { console.error(`${f}: intents insufficiently different`); fail++; }
  // structural requirements
  for (const probe of ['data-intent-btn="renovation"', 'data-intent-btn="consolidation"', 'id="pi-state"', 'id="pi-purpose"', 'id="pi-faqs"', 'data-sh-form="heloc-persona"', 'name="robots" content="noindex', 'data-pi-visual="renovation"', 'data-pi-visual="consolidation"'])
    if (!t.includes(probe)) { console.error(`${f}: missing ${probe}`); fail++; }
}
if (fail) { console.error(fail + " finding(s)"); process.exit(1); }
console.log("lint-heloc-personas: 16 pages x 2 intents clean (claims, uniqueness, structure)");
