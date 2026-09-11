// Claims + safety lint for the Family Opportunity pages. Run: node scripts/lint-family-lps.mjs
import fs from "node:fs";
import { fileURLToPath } from "node:url";
const ROOT = fileURLToPath(new URL("../", import.meta.url));
const pages = ["family-home-financing.html", "buy-a-home-for-parents.html", "family-housing-options.html", "request-received.html"];
const fails = [];
const banned = [
  [/[—–]/, "em/en dash"],
  [/\bloophole\b/i, "loophole"], [/secret government program/i, "secret government program"], [/guaranteed savings/i, "guaranteed savings"],
  [/\bguaranteed approval\b/i, "guaranteed approval"], [/\b\d+(\.\d+)?\s?%/, "percentage figure"], [/\bAPR\b/, "APR"],
  [/\$\s?\d/, "dollar amount"], [/\b(credit score|FICO)\b.*\b\d{3}\b/i, "credit score number"], [/\bDTI\b/, "DTI"],
  [/assisted living/i, "assisted living comparison"], [/\bfacebook\.net|fbevents|fbq\(/, "Meta Pixel snippet in HTML"],
  [/googletagmanager|gtag\(/, "GA tag in HTML"], [/STONEHAVEN_OWNER_FACT_REQUIRED|555-0100/, "placeholder"],
];
for (const f of pages) {
  const html = fs.readFileSync(ROOT + f, "utf8");
  const main = html.split("<main")[1]?.split("</main>")[0] || "";
  // Claim checks run on prose. Field labels and select options are excluded:
  // a credit-range dropdown and a currency-marked price label are inputs, not
  // claims. The consent notice is a paragraph, so it still gets checked.
  const text = html
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "")
    .replace(/<select[\s\S]*?<\/select>/g, " ")
    .replace(/<label[\s\S]*?<\/label>/g, " ")
    .replace(/<[^>]+>/g, " ");
  for (const [re, label] of banned) if (re.test(text)) fails.push(`${f}: ${label}`);
  for (const m of html.matchAll(/<h[23][^>]*>([^<]*)<\/h[23]>/g)) if (/\.\s*$/.test(m[1])) fails.push(`${f}: heading ends with a period: ${m[1]}`);
  if (f !== "request-received.html") {
    if (!/data-fo-sensitive="[01]"/.test(html)) fails.push(`${f}: missing sensitivity flag`);
    if (!/id="inquiry-form"/.test(html)) fails.push(`${f}: no inquiry form`);
    if (!/name="company_website"/.test(html)) fails.push(`${f}: no honeypot`);
    if (!/href="\/privacy"/.test(main)) fails.push(`${f}: consent notice lacks privacy link`);
    if (!/This is an inquiry, not a mortgage application/.test(text)) fails.push(`${f}: consent notice missing`);
    const formHtml = html.split('id="inquiry-form"')[1].split("</form>")[0];
    const formText = formHtml.replace(/<[^>]+>/g, " ");
    // Never acceptable on any page: identity documents and dates of birth have
    // no place in an inquiry, and a full address is not needed to return a call.
    for (const bad of ["diagnosis", "date of birth", "SSN", "social security", "property address"]) {
      if (new RegExp(bad, "i").test(formText)) fails.push(`${f}: form asks for ${bad}`);
    }
    // The adult-child page asks nothing about the occupant. Purchase price and
    // the borrower's own credit range are fine there; anything touching the
    // disabled person's capacity, benefits or health is not, and the page's own
    // copy promises as much.
    if (/data-fo-sensitive="1"/.test(html)) {
      for (const bad of ["income", "able to work", "unable to work", "benefits", "SSI", "disability", "medical", "diagnos"]) {
        if (new RegExp(bad, "i").test(formText)) fails.push(`${f}: sensitive page form asks about ${bad}`);
      }
    }
    const ctas = (main.match(/href="#inquiry"/g) || []).length;
    if (ctas < 2) fails.push(`${f}: CTAs not wired to #inquiry`);
  } else {
    if (!/noindex/.test(html)) fails.push(`${f}: confirmation page must be noindex`);
  }
  if (!/tel:\+14709704979/.test(html)) fails.push(`${f}: phone link missing`);
  if (!/Equal Housing Opportunity/.test(html) || !/nmlsconsumeraccess/.test(html)) fails.push(`${f}: footer disclosures incomplete`);
  if (/fannie mae/i.test(html.match(/<h[1-3][^>]*>[^<]*<\/h[1-3]>/g)?.join(" ") || "")) fails.push(`${f}: Fannie Mae named in a heading`);
  if (/funnel\.js|site-config\.js/.test(html)) fails.push(`${f}: must not load funnel.js (auto-loads the Meta Pixel)`);
}
const lp = fs.readFileSync(ROOT + "js/family-lp.js", "utf8");
if (!/AD_TAGS_ALLOWED = KIND === "lp" && !SENSITIVE/.test(lp)) fails.push("family-lp.js: ad-tag hard rule missing");
if (/console\.(log|info|debug)/.test(lp)) fails.push("family-lp.js: console output present");
const fn = fs.readFileSync(ROOT + "netlify/functions/family-inquiry.js", "utf8");
if (/console\.(log|info|debug)/.test(fn)) fails.push("family-inquiry.js: console output present");
if (!/rec\.page !== "family-parents"\) return/.test(fn)) fails.push("family-inquiry.js: CAPI must be restricted to the parents page");
if (fails.length) { console.error("FAMILY LINT FAILED\n" + fails.join("\n")); process.exit(1); }
console.log("family lint ok: " + pages.length + " pages");
