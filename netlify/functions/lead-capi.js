/* ============================================================
   Stonehaven — server-side lead relay (Meta Conversions API + CRM
   webhook). Called fire-and-forget by js/funnel.js for forms carrying
   the data-sh-capi attribute (currently the /heloc callback form).

   Environment variables (set in Netlify → Site settings → Env vars):
     META_CAPI_TOKEN  Meta Conversions API access token
                      (Events Manager → the pixel → Settings →
                       Conversions API → Generate access token).
                      Absent → the Meta call is skipped gracefully.
     CRM_WEBHOOK_URL  Optional. Any URL to POST the raw lead JSON to
                      (CRM intake, Zapier→SMS for speed-to-lead, etc.).
                      Absent → skipped.

   The browser sends the same event_id it passed to fbq(), so Meta
   deduplicates the browser and server copies of the event.
   No secrets live in this file; it is safe in a public repo.
   ============================================================ */
const crypto = require("crypto");

const PIXEL_ID = "4039555362846500";
const sha256 = (v) =>
  crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex");

const normPhone = (p) => {
  const digits = String(p || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 10 ? "1" + digits : digits; // default US country code
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "" };
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return { statusCode: 400, body: "" }; }

  const { event_name, event_id, source_url, payload = {} } = body;
  if (!event_name || !event_id) return { statusCode: 400, body: "" };

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
      fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [{
            event_name: ({ heloc_callback: "Lead", lead: "Lead", submit_application: "SubmitApplication" })[event_name] || event_name,
            event_time: Math.floor(Date.now() / 1000),
            event_id,
            action_source: "website",
            event_source_url: source_url || "https://stonehavencre.com/heloc",
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
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
