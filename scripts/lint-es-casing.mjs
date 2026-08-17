#!/usr/bin/env node
/* ============================================================
   lint-es-casing — catches English-style Title Case in Spanish copy.

   Spanish headings, titles and labels use SENTENCE CASE: capitalise
   the first word and proper nouns only. This lint scans every HTML
   file under es/ and flags <title>, <h1>-<h3>, og:title, JSON-LD
   headline/name, and .eyebrow labels where two or more consecutive
   words are capitalised without being on the allow-list.

   Heuristic by design - it catches the obvious cases. Add genuine
   proper nouns / acronyms / product names to ALLOW below rather than
   weakening the rule.

   Run:  node scripts/lint-es-casing.mjs        (exit 1 on findings)
   ============================================================ */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ALLOW = new Set([
  // brand / people / places
  "stonehaven","lending","dawn","m.","muñoz","chris","de","leeuw","georgia","alabama","tennessee","florida",
  "carolina","norte","atlanta","alpharetta","londres","london","roswell","street","suite","estados","unidos","ee.","uu.",
  // acronyms & programs
  "dscr","sba","fha","va","heloc","nmls","llc","mlo","piti","pitia","ltv","cltv","noi","hoa","irrrl","coe","cdc",
  "cre","utm","ga","al","tn","fl","nc","et","fannie","mae","freddie","mac","hud","apr","tila","reg","z",
  // formal document / product names kept capitalised on purpose
  "política","privacidad","consumer","access","equal","housing","opportunity","igualdad","oportunidades","vivienda",
]);
// Spanish function words that are lowercase mid-sentence anyway
const SMALL = new Set(["de","del","la","las","el","los","y","o","u","a","en","con","por","para","sobre","sin","al",
  "que","su","sus","un","una","se","lo","ni","e","le","les","me","no","es","ya"]);

const isUpperWord = (w) => /^[A-ZÁÉÍÓÚÑ]/.test(w);
const clean = (w) => w.replace(/^[¿¡("'«]+|[.,:;!?)"'»·]+$/g, "");

function titleCased(text) {
  // Split into sentences/segments first: a capital is legitimate right after
  // ". ! ? - – — | :" so each segment is judged on its own.
  const segments = text.replace(/<[^>]+>/g, " ").split(/(?:[.!?:|]|\s[-–—]\s)\s*/);
  for (const seg of segments) {
    const words = seg.split(/\s+/).map(clean).filter(w => /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(w));
    if (words.length < 2) continue;
    // any capitalised, non-allowed content word AFTER the segment's first word = Title Case
    for (let i = 1; i < words.length; i++) {
      const w = words[i], lw = w.toLowerCase();
      if (SMALL.has(lw) || ALLOW.has(lw) || w === w.toUpperCase() || /^\d/.test(w)) continue;
      if (isUpperWord(w)) return true;
    }
  }
  return false;
}

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith(".html")) yield p;
  }
}

const PATTERNS = [
  [/<title>(.*?)<\/title>/g, "title"],
  [/<h[1-3][^>]*>(.*?)<\/h[1-3]>/g, "heading"],
  [/<meta property="og:title" content="([^"]*)"/g, "og:title"],
  [/<meta name="twitter:title" content="([^"]*)"/g, "twitter:title"],
  [/"headline": "([^"]*)"/g, "json-ld headline"],
  [/<span class="eyebrow">([^<]*)<\/span>/g, "eyebrow"],
];

let findings = 0;
for (const file of walk("es")) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const [re, kind] of PATTERNS) {
      re.lastIndex = 0; let m;
      while ((m = re.exec(line))) {
        if (titleCased(m[1])) { findings++; console.log(`${file}:${i + 1}  [${kind}]  ${m[1].replace(/<[^>]+>/g, "").trim()}`); }
      }
    }
  });
}
if (findings) { console.error(`\n${findings} Title Case finding(s) in Spanish copy. Use sentence case (see docs/STYLE-es.md).`); process.exit(1); }
console.log("lint-es-casing: OK - no Title Case found in Spanish headings, titles, metas or eyebrows.");
