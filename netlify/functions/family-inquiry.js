/* ============================================================
   Family Opportunity inquiry endpoint (server side).
   POST JSON from js/family-lp.js. Validates, rate-limits, dedupes,
   persists, then returns { ok, inquiry_id, received_at }. Success is
   returned ONLY after the store accepted the record.

   Storage (first configured wins):
     FAMILY_CRM_INTAKE_URL  Stonehaven CRM website intake (JSON per
                            WEBSITE_FORM_CONTRACT). Page ids family-parents /
                            family-adult-child must be on the CRM allowlist.
     (default)              Netlify Forms "lead" form of this site: the same
                            private inbox every other site form uses.
   Optional:
     FAMILY_DRY_RUN=1       Local preview only: skip storage, mark dry_run.
     FAMILY_CAPI_PARENTS_PAGE=1 + META_CAPI_TOKEN
                            Server-side Meta Lead for the PARENTS page only,
                            deduplicated with the browser event by event_id.
                            Never runs for the adult-child page.

   Privacy: no personal data is logged. Rate limit and dedupe keep hashed
   values in memory only (best effort, per function instance).
   ============================================================ */
const crypto = require("crypto");
const SHARED = require("./family-shared.json");

const RATE_WINDOW_MS = 10 * 60 * 1000, RATE_MAX = 5, DEDUPE_MS = 2 * 60 * 1000;
const rate = new Map();   // ipHash -> [timestamps]
const recent = new Map(); // phoneHash -> { id, at }

const h = (v) => crypto.createHash("sha256").update(String(v)).digest("hex");
const now = () => Date.now();
const json = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) });

function newId() {
  return "FO-" + now().toString(36).toUpperCase() + "-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}
function normPhone(v) {
  let d = String(v || "").replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") d = d.slice(1);
  return d.length === 10 && d[0] !== "0" && d[0] !== "1" ? d : "";
}
function fmtPhone(d) { return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6); }

function validate(b) {
  const errors = {};
  const name = String(b.name || "").trim();
  if (name.length < 2) errors.name = "Please enter your full name.";
  else if (name.length > 120) errors.name = "Please shorten your name.";
  const phone = normPhone(b.phone);
  if (!phone) errors.phone = "Please enter a valid phone number, including area code.";
  const state = String(b.state || "").toUpperCase();
  if (!SHARED.states.includes(state)) errors.state = "Please choose the property state.";
  const email = String(b.email || "").trim();
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))) errors.email = "Please enter a valid email address, or leave it blank.";
  const timing = String(b.timing || "");
  const timingLabel = timing ? (SHARED.timing[timing] || "") : "";
  if (timing && !timingLabel) errors.timing = "Please choose one of the listed options.";
  const page = String(b.page || "");
  if (!SHARED.pages[page]) errors.page = "Unknown page.";

  // Optional qualifying answers. Blank is always acceptable; a present value
  // must match the allowlist, so a crafted request cannot smuggle free text in.
  const priceDigits = String(b.price || "").replace(/\D/g, "").slice(0, 12);
  let price = 0;
  if (priceDigits) {
    price = parseInt(priceDigits, 10);
    if (!price || price < 1000 || price > (SHARED.priceMax || 100000000)) {
      errors.price = "Please enter a rough purchase price, or leave it blank.";
      price = 0;
    }
  }
  const creditRaw = String(b.credit || "");
  const ph = SHARED.credit ? SHARED.credit.placeholder : "";
  const bands = SHARED.credit ? SHARED.credit.bands : [];
  const credit = creditRaw && creditRaw !== ph && bands.includes(creditRaw) ? creditRaw : "";
  if (creditRaw && creditRaw !== ph && !credit) errors.credit = "Please choose one of the listed ranges.";

  // The extra select is defined per page. A value offered for a page that does
  // not ask the question is dropped rather than stored: this is what keeps the
  // adult-child page from ever carrying an income or capacity answer.
  const spec = SHARED.extraSelect && SHARED.extraSelect[page];
  let extra = null;
  if (spec && String(b.extra_name || "") === spec.name) {
    const val = String(b.extra_value || "");
    if (val && spec.values.includes(val)) extra = { name: spec.name, label: spec.label, value: val };
  }
  return { errors, name, phone, state, email, timing: timingLabel, page, price, credit, extra };
}

function allowedOrigin(origin) {
  if (!origin) return true; // in-app browsers and some clients omit Origin
  try {
    const u = new URL(origin);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
    if (u.hostname.endsWith(".netlify.app")) return true;
    const site = new URL(SHARED.siteUrl).hostname;
    return u.hostname === site || u.hostname === "www." + site;
  } catch { return false; }
}

function limited(ipHash) {
  const t = now();
  const arr = (rate.get(ipHash) || []).filter((x) => t - x < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) { rate.set(ipHash, arr); return true; }
  arr.push(t); rate.set(ipHash, arr);
  if (rate.size > 5000) rate.clear();
  return false;
}

function attributionLine(a) {
  if (!a || typeof a !== "object") return "";
  const keys = SHARED.attributionAllowlist;
  const parts = keys.filter((k) => typeof a[k] === "string" && a[k]).map((k) => k + "=" + String(a[k]).slice(0, 120).replace(/[\r\n]/g, " "));
  return parts.length ? "[attribution] " + parts.join(" ") : "";
}

async function persist(rec, event) {
  if (process.env.FAMILY_DRY_RUN === "1") return { stored: false, dry_run: true };
  const about = [
    "[Family Opportunity inquiry " + rec.id + "]",
    "Page: " + SHARED.pages[rec.page],
    "Property state: " + rec.state,
    rec.price ? "Purchase price, approx: " + rec.price.toLocaleString("en-US") : "",
    rec.credit ? "Credit score range: " + rec.credit : "",
    rec.extra ? rec.extra.label + " " + rec.extra.value : "",
    rec.timing ? "Purchase timing: " + rec.timing : "",
    "Requested-contact notice: " + rec.notice_version,
    "Received: " + rec.received_at,
    rec.attribution,
    "[url] " + rec.path
  ].filter(Boolean).join(" · ").slice(0, 2000);

  const crm = process.env.FAMILY_CRM_INTAKE_URL;
  if (crm) {
    const r = await fetch(crm, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: rec.name, email: rec.email, phone: fmtPhone(rec.phone), product: "Residential", about,
        page: rec.page, lang: "en", token: "",
        extra: { state: rec.state, timeline: rec.timing, inquiry_id: rec.id, notice_version: rec.notice_version,
          purchase_price: rec.price || undefined, credit_band: rec.credit || undefined,
          [rec.extra ? rec.extra.name : "_unused"]: rec.extra ? rec.extra.value : undefined,
          utm: rec.attributionObj } })
    });
    if (!r.ok) throw new Error("crm " + r.status);
    return { stored: true, dry_run: false };
  }
  const base = process.env.URL || ("https://" + (event.headers.host || new URL(SHARED.siteUrl).host));
  const nf = new URLSearchParams();
  nf.append("form-name", "lead");
  nf.append("name", rec.name); nf.append("email", rec.email); nf.append("phone", fmtPhone(rec.phone));
  nf.append("product", "Residential"); nf.append("about", about); nf.append("page", rec.page); nf.append("lang", "en");
  const r = await fetch(base + "/contact", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: nf.toString() });
  if (!r.ok) throw new Error("forms " + r.status);
  return { stored: true, dry_run: false };
}

async function capi(rec, event) {
  if (process.env.FAMILY_CAPI_PARENTS_PAGE !== "1" || rec.page !== "family-parents") return;
  const token = process.env.META_CAPI_TOKEN, pixel = SHARED.metaPixelId;
  if (!token || !pixel || !rec.event_id) return;
  const user_data = { ph: [h("1" + rec.phone)], client_user_agent: event.headers["user-agent"] || undefined,
    client_ip_address: event.headers["x-nf-client-connection-ip"] || undefined };
  if (rec.email) user_data.em = [h(rec.email.toLowerCase())];
  await fetch("https://graph.facebook.com/v21.0/" + pixel + "/events?access_token=" + encodeURIComponent(token), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [{ event_name: "Lead", event_time: Math.floor(now() / 1000), event_id: rec.event_id,
      action_source: "website", event_source_url: SHARED.siteUrl + "/buy-a-home-for-parents", user_data }] })
  }).catch(() => {});
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "method" });
  if (!allowedOrigin(event.headers.origin)) return json(403, { ok: false, error: "origin" });
  let b;
  try { b = JSON.parse(event.body || "{}"); } catch { return json(400, { ok: false, error: "json" }); }
  if (!b || typeof b !== "object") return json(400, { ok: false, error: "json" });

  // Honeypot: pretend success, store nothing.
  if (b.company_website) return json(200, { ok: true, inquiry_id: newId(), received_at: new Date().toISOString() });

  const ip = event.headers["x-nf-client-connection-ip"] || event.headers["client-ip"] || "";
  if (limited(h(ip + "|" + (event.headers["user-agent"] || "")))) return json(429, { ok: false, error: "rate_limited" });

  const v = validate(b);
  if (Object.keys(v.errors).length) return json(400, { ok: false, errors: v.errors });

  const key = h(v.phone + "|" + v.page);
  const prev = recent.get(key);
  if (prev && now() - prev.at < DEDUPE_MS) return json(200, { ok: true, inquiry_id: prev.id, received_at: new Date(prev.at).toISOString(), duplicate: true });

  const attributionObj = {};
  if (b.attribution && typeof b.attribution === "object") SHARED.attributionAllowlist.forEach((k) => { if (typeof b.attribution[k] === "string" && b.attribution[k]) attributionObj[k] = b.attribution[k].slice(0, 120); });
  const rec = {
    id: newId(), received_at: new Date().toISOString(), page: v.page, name: v.name, phone: v.phone, email: v.email,
    state: v.state, timing: v.timing, price: v.price, credit: v.credit, extra: v.extra, notice_version: String(b.notice_version || SHARED.noticeVersion).slice(0, 60),
    attribution: attributionLine(b.attribution), attributionObj,
    path: String(b.path || "/").split("?")[0].slice(0, 80), event_id: String(b.event_id || "").slice(0, 60)
  };
  try {
    const st = await persist(rec, event);
    recent.set(key, { id: rec.id, at: now() });
    if (recent.size > 5000) recent.clear();
    if (st.stored) await capi(rec, event);
    return json(200, { ok: true, inquiry_id: rec.id, received_at: rec.received_at, dry_run: !!st.dry_run });
  } catch (e) {
    return json(502, { ok: false, error: "store" });
  }
};
