/* ============================================================
   Stonehaven - server-side lead relay (Meta Conversions API + CRM
   webhook). Called fire-and-forget by js/funnel.js for forms carrying
   the data-sh-capi attribute.

   Environment variables (set in Netlify -> Site settings -> Env vars):
     META_CAPI_TOKEN  Meta Conversions API access token
                      (Events Manager -> the pixel -> Settings ->
                       Conversions API -> Generate access token).
                      Absent -> the Meta call is skipped gracefully.
     CRM_WEBHOOK_URL  Optional. Any URL to POST the lead JSON to
                      (CRM intake, Zapier->SMS for speed-to-lead, etc.).
                      Absent -> skipped.

   The browser sends the same event_id it passed to fbq(), so Meta
   deduplicates the browser and server copies of the event.
   No secrets live in this file; it is safe in a public repo.

   This endpoint is public, so it is treated as hostile input: same-site
   origin required, per-IP rate limit, known event names only, and an
   allowlisted payload. Without those a stranger could forge leads into
   the CRM and poison Meta conversion data with fake Lead events.
   ============================================================ */
const crypto = require("crypto");

const SITE_HOST = "stonehavencre.com";
const PIXEL_ID = "4039555362846500";
const RATE_WINDOW_MS = 10 * 60 * 1000, RATE_MAX = 8;
const MAX_BODY_BYTES = 16 * 1024;
const rate = new Map(); // ipHash -> [timestamps]

// Only these names may be relayed, and each maps to a Meta standard event.
// An unknown name is rejected rather than forwarded, so the endpoint cannot be
// used to write arbitrary event names into the ad account.
const EVENTS = {
  heloc_callback: "Lead",
  lead: "Lead",
  submit_application: "SubmitApplication",
};

// Lead fields the CRM is willing to receive. Anything else in payload is
// dropped instead of being spread into the webhook body. `extra` carries the
// wizard answers and UTMs as a flat string map and is sanitised separately.
const PAYLOAD_FIELDS = ["name", "email", "phone", "product", "about", "page", "lang"];
const EXTRA_MAX_KEYS = 60, EXTRA_MAX_LEN = 300;

const sha256 = (v) => crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex");
const hash = (v) => crypto.createHash("sha256").update(String(v)).digest("hex");

const normPhone = (p) => {
  const digits = String(p || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? "1" + digits : digits; // default US country code
};

function allowedOrigin(origin) {
  if (!origin) return true; // in-app browsers and some clients omit Origin
  try {
    const u = new URL(origin);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
    if (u.hostname.endsWith(".netlify.app")) return true;
    return u.hostname === SITE_HOST || u.hostname === "www." + SITE_HOST;
  } catch { return false; }
}

function limited(ipHash) {
  const t = Date.now();
  const arr = (rate.get(ipHash) || []).filter((x) => t - x < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) { rate.set(ipHash, arr); return true; }
  arr.push(t); rate.set(ipHash, arr);
  if (rate.size > 5000) rate.clear();
  return false;
}

// event_source_url is reported to Meta, so only this site's own URLs are
// accepted. A foreign URL here would attribute events to somebody else's page.
function safeSourceUrl(raw) {
  const fallback = "https://" + SITE_HOST + "/";
  try {
    const u = new URL(String(raw || ""));
    if (u.protocol !== "https:") return fallback;
    if (u.hostname !== SITE_HOST && u.hostname !== "www." + SITE_HOST) return fallback;
    return u.origin + u.pathname;
  } catch { return fallback; }
}

// Flatten one level of string values, used for `extra` and its nested `utm`.
function cleanMap(src, budget) {
  const out = {};
  if (!src || typeof src !== "object" || Array.isArray(src)) return out;
  for (const k of Object.keys(src)) {
    if (budget.n >= EXTRA_MAX_KEYS) break;
    if (!/^[A-Za-z0-9_.-]{1,60}$/.test(k)) continue;
    const v = src[k];
    if (typeof v === "string" && v) { out[k] = v.slice(0, EXTRA_MAX_LEN); budget.n++; }
    else if (typeof v === "number" && Number.isFinite(v)) { out[k] = v; budget.n++; }
    else if (v && typeof v === "object" && !Array.isArray(v) && budget.depth > 0) {
      const nested = cleanMap(v, { n: budget.n, depth: budget.depth - 1 });
      if (Object.keys(nested).length) { out[k] = nested; budget.n += Object.keys(nested).length; }
    }
  }
  return out;
}

function cleanPayload(p) {
  const out = {};
  if (!p || typeof p !== "object") return out;
  for (const k of PAYLOAD_FIELDS) {
    const v = p[k];
    if (typeof v === "string" && v) out[k] = v.slice(0, 2000);
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
  }
  const extra = cleanMap(p.extra, { n: 0, depth: 1 });
  if (Object.keys(extra).length) out.extra = extra;
  return out;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "" };
  if (!allowedOrigin(event.headers.origin)) return { statusCode: 403, body: "" };
  if (String(event.body || "").length > MAX_BODY_BYTES) return { statusCode: 413, body: "" };

  const ip = event.headers["x-nf-client-connection-ip"] || event.headers["client-ip"] || "";
  if (limited(hash(ip + "|" + (event.headers["user-agent"] || "")))) return { statusCode: 429, body: "" };

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return { statusCode: 400, body: "" }; }
  if (!body || typeof body !== "object") return { statusCode: 400, body: "" };

  const event_name = String(body.event_name || "");
  const event_id = String(body.event_id || "").slice(0, 100);
  if (!EVENTS[event_name] || !event_id) return { statusCode: 400, body: "" };

  const payload = cleanPayload(body.payload);
  const source_url = safeSourceUrl(body.source_url);
  const tasks = [];

  // ---- Meta Conversions API (dedups with the browser pixel via event_id)
  const token = process.env.META_CAPI_TOKEN;
  if (token) {
    const user_data = {
      client_ip_address: event.headers["x-nf-client-connection-ip"] || event.headers["client-ip"] || undefined,
      client_user_agent: event.headers["user-agent"] || undefined,
    };
    if (payload.email) user_data.em = [sha256(payload.email)];
    const ph = normPhone(payload.phone);
    if (ph) user_data.ph = [sha256(ph)];
    if (payload.state) user_data.st = [sha256(payload.state)];

    tasks.push(
      // Token goes in the body, not the query string: query strings turn up in
      // proxy and platform logs, and this one is a live credential.
      fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: token,
          data: [{
            event_name: EVENTS[event_name],
            event_time: Math.floor(Date.now() / 1000),
            event_id,
            action_source: "website",
            event_source_url: source_url,
            user_data,
          }],
        }),
      }).catch(() => {})
    );
  }

  // ---- CRM / speed-to-lead webhook (raw lead, so the broker can dial fast)
  const webhook = process.env.CRM_WEBHOOK_URL;
  if (webhook) {
    tasks.push(
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_name, event_id, received_at: new Date().toISOString(), ...payload }),
      }).catch(() => {})
    );
  }

  await Promise.allSettled(tasks);
  return { statusCode: 200, headers: { "Cache-Control": "no-store" }, body: JSON.stringify({ ok: true }) };
};
