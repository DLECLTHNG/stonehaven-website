import { createHmac, timingSafeEqual } from 'node:crypto';
import { validateApplicant, validateSubjectProperty } from '../../../js/heloc-application-validation.mjs';

export const APPLICATION_STORE = 'heloc-applications-v1';
export const MAX_APPLICATION_BYTES = 16 * 1024;
const RECIPIENT = 'chris@stonehavencre.com';
const RETRY_MS = 23 * 60 * 60 * 1000;
const ATTACHMENT_RETENTION_MS = 48 * 60 * 60 * 1000;
const RECEIPT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const APPLICANT_KEYS = ['full_name', 'dob', 'ssn', 'address', 'unit', 'city', 'state', 'zip', 'w2_income'];
const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

// Exact saved September 17 signature. Applicant information is never interpolated here.
const SIGNATURE = `<!-- Chris De Leeuw, September 17, 2026. Formatted text only, no logo, no icons, no personal MLO number. -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="570" style="width:570px;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;color:#172431;background:#ffffff;">
<tr><td style="vertical-align:top;padding:0;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-variant:small-caps;font-weight:bold;line-height:29px;">Chris De Leeuw</div>
<div style="font-size:19px;line-height:26px;padding-top:3px;">Partner</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;font-size:13px;line-height:19px;">
<tr><td style="font-weight:bold;">Cell: <a href="tel:+14049097416" style="color:#172431;text-decoration:none;">(404) 909-7416</a><br>Direct: <a href="tel:+14709704979" style="color:#172431;text-decoration:none;">(470) 970-4979</a></td></tr>
<tr><td style="padding-top:8px;"><a href="mailto:Chris@stonehavencre.com" style="color:#3d434a;text-decoration:none;">Chris@stonehavencre.com</a></td></tr>
<tr><td style="padding-top:6px;"><a href="https://stonehavencre.com/" style="color:#3d434a;text-decoration:none;">stonehavencre.com</a></td></tr>
<tr><td style="padding-top:6px;font-size:12px;white-space:nowrap;color:#3d434a;">10 Roswell Street, Suite 102, Alpharetta, GA 30009</td></tr>
</table>
</td></tr>
<tr><td style="padding-top:12px;font-size:13px;line-height:19px;color:#3d434a;">Atlanta &middot; London<br>Company NMLS License #1752355 &middot; Equal Housing Opportunity</td></tr>
<tr><td style="padding-top:12px;font-size:9px;line-height:13px;color:#606060;">Stonehaven Lending is a real estate capital advisory and brokerage firm, not a direct lender; financing is arranged through third-party capital providers and is subject to lender underwriting. Program availability varies by state.</td></tr>
</table>
`;

const json = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...HEADERS, ...extra } });
const unavailable = () => json(503, { ok: false, error: 'temporarily_unavailable', message: 'Your submission has not been confirmed. Keep this page open and try again.' }, { 'Retry-After': '10' });
const plainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const exactKeys = (value, keys) => plainObject(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));

export function applicationConfiguration(env) {
  const password = env.HELOC_APPLICATION_PDF_PASSWORD || '';
  const hmacKey = env.HELOC_APPLICATION_HMAC_KEY || '';
  const apiKey = env.HELOC_APPLICATION_RESEND_KEY || '';
  const from = env.HELOC_APPLICATION_FROM || '';
  const mailbox = '(?:[A-Za-z0-9._%+-]+)@(?:[A-Za-z0-9-]+\\.)+[A-Za-z]{2,}';
  if (!/^[\x21-\x7e]{24,120}$/.test(password) || !/^[\x21-\x7e]{32,256}$/.test(hmacKey) ||
      !/^re_[A-Za-z0-9_-]{12,}$/.test(apiKey) || from.length > 180 ||
      !(new RegExp(`^(?:${mailbox}|[A-Za-z0-9 .,'()-]+ <${mailbox}>)$`)).test(from)) return null;
  return { password, hmacKey, apiKey, from };
}

const PREVIEW_CONTEXTS = ['deploy-preview', 'branch-deploy'];

// Netlify exposes only URL, SITE_NAME and SITE_ID to functions at runtime; CONTEXT and
// DEPLOY_PRIME_URL exist at build time only. The deploy context and site name therefore
// come from the function context, with env retained for local tests and tooling.
function isPreview(context, env) {
  return PREVIEW_CONTEXTS.includes(context?.deploy?.context ?? env.CONTEXT);
}

function allowedOrigin(origin, env, { preview = false, requestUrl = '', siteName = '' } = {}) {
  if (['https://stonehavencre.com', 'https://www.stonehavencre.com'].includes(origin)) return true;
  if (!preview) return false;
  try {
    const deploy = new URL(env.DEPLOY_PRIME_URL);
    if (deploy.protocol === 'https:' && !deploy.username && !deploy.password && deploy.origin === origin &&
        deploy.pathname === '/' && !deploy.search && !deploy.hash) return true;
  } catch {}
  // Without DEPLOY_PRIME_URL, a preview accepts only its own page origin, on this site's
  // Netlify subdomain. A cross-site page cannot present the preview's own origin.
  if (typeof siteName !== 'string' || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(siteName)) return false;
  try {
    const own = new URL(requestUrl);
    return own.protocol === 'https:' && !own.username && !own.password && own.origin === origin &&
      own.hostname.endsWith(`--${siteName}.netlify.app`);
  } catch { return false; }
}

export function normalizeApplication(body, today) {
  if (!exactKeys(body, ['request_id', 'application_type', 'applicants', 'subject_property']) ||
      typeof body.request_id !== 'string' || !UUID.test(body.request_id) ||
      !['single', 'joint'].includes(body.application_type) || !Array.isArray(body.applicants) ||
      body.applicants.length !== (body.application_type === 'joint' ? 2 : 1)) return null;
  const propertyKeys = ['address', 'unit', 'city', 'state', 'zip'];
  if (!exactKeys(body.subject_property, propertyKeys) || propertyKeys.some(key => typeof body.subject_property[key] !== 'string' || body.subject_property[key].length > 200)) return null;
  const subject_property = Object.fromEntries(propertyKeys.map(key => [key, body.subject_property[key].trim()]));
  if (Object.keys(validateSubjectProperty(subject_property)).length) return null;
  const applicants = [];
  for (const supplied of body.applicants) {
    if (!exactKeys(supplied, APPLICANT_KEYS) || APPLICANT_KEYS.some(key => typeof supplied[key] !== 'string' || supplied[key].length > 200)) return null;
    const applicant = Object.fromEntries(APPLICANT_KEYS.map(key => [key, supplied[key].trim()]));
    if (Object.keys(validateApplicant(applicant, today)).length) return null;
    applicant.ssn = applicant.ssn.replaceAll('-', '');
    applicant.w2_income = applicant.w2_income.replaceAll(',', '');
    applicants.push(applicant);
  }
  return { request_id: body.request_id.toLowerCase(), application_type: body.application_type, applicants, subject_property };
}

async function boundedJson(request) {
  const stated = request.headers.get('content-length');
  if (stated && (!/^\d+$/.test(stated) || Number(stated) > MAX_APPLICATION_BYTES)) throw new Error('body');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_APPLICATION_BYTES) {
        await reader.cancel();
        throw new Error('body');
      }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks, length).toString('utf8'));
  } finally { reader.releaseLock(); }
}

function fingerprint(application, key) {
  return createHmac('sha256', key).update(JSON.stringify({ application_type: application.application_type, applicants: application.applicants, subject_property: application.subject_property })).digest('hex');
}

function fingerprintMatches(left, right) {
  return typeof left === 'string' && /^[a-f0-9]{64}$/.test(left) && timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}

function emailEnvelope(application, pdf, from, preview = false) {
  const reference = application.request_id;
  const kind = application.application_type === 'joint' ? 'Joint application' : 'Individual application';
  const text = `A HELOC client application is attached as a password-protected PDF.\n\nReference: ${reference}\nApplication: ${kind}\n\nOpen the PDF with the separately supplied application password. Do not forward the password with this message.`;
  return {
    from, to: [RECIPIENT], subject: `${preview ? '[Preview test] ' : ''}HELOC application received: ${reference}`,
    html: `<html lang="en"><body><p>A HELOC client application is attached as a password-protected PDF.</p><p>Reference: ${reference}<br>Application: ${kind}</p><p>Open the PDF with the separately supplied application password. Do not forward the password with this message.</p>${SIGNATURE}</body></html>`,
    text: `${text}\n\nChris De Leeuw\nPartner\nCell: (404) 909-7416\nDirect: (470) 970-4979\nChris@stonehavencre.com\nhttps://stonehavencre.com/\n10 Roswell Street, Suite 102, Alpharetta, GA 30009\nAtlanta · London\nCompany NMLS License #1752355 · Equal Housing Opportunity\nStonehaven Lending is a real estate capital advisory and brokerage firm, not a direct lender; financing is arranged through third-party capital providers and is subject to lender underwriting. Program availability varies by state.`,
    attachments: [{ filename: `heloc-application-${reference}.pdf`, content: Buffer.from(pdf).toString('base64'), content_type: 'application/pdf' }],
  };
}

async function defaultStore() {
  const { getStore } = await import('@netlify/blobs');
  return getStore({ name: APPLICATION_STORE, consistency: 'strong' });
}
async function defaultPdf(application, password) {
  const { createHelocApplicationPdf } = await import('./heloc-application-pdf.mjs');
  return createHelocApplicationPdf(application, password);
}

export function createApplicationHandler({ env = process.env, now = () => new Date(), getStore = defaultStore, createPdf = defaultPdf, send = globalThis.fetch } = {}) {
  return async function applicationHandler(request, context) {
    try {
      const preview = isPreview(context, env);
      const method = request.method.toUpperCase();
      if (!['GET', 'POST'].includes(method)) return json(405, { ok: false, error: 'method_not_allowed' }, { Allow: 'GET, POST' });
      const settings = applicationConfiguration(env);
      if (method === 'GET') {
        if (!settings) return json(200, { ready: false });
        try {
          const store = await getStore();
          await store.getMetadata('readiness', { consistency: 'strong' });
          return json(200, { ready: true });
        } catch { return json(200, { ready: false }); }
      }
      if (!allowedOrigin(request.headers.get('origin'), env, { preview, requestUrl: request.url, siteName: context?.site?.name ?? env.SITE_NAME ?? '' }) || request.headers.get('sec-fetch-site') === 'cross-site') return json(403, { ok: false, error: 'origin_not_allowed' });
      if (request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') return json(415, { ok: false, error: 'unsupported_media_type' });
      if (request.headers.has('content-encoding')) return json(415, { ok: false, error: 'unsupported_content_encoding' });
      if (!settings) return unavailable();
      let body;
      try { body = await boundedJson(request); }
      catch { return json(400, { ok: false, error: 'invalid_request', message: 'Check the application details and try again.' }); }
      const clock = now();
      const application = normalizeApplication(body, clock.toISOString().slice(0, 10));
      if (!application) return json(422, { ok: false, error: 'invalid_application', message: 'Check the application details and try again.' });
      const store = await getStore();
      const key = `application/${application.request_id}`;
      const digest = fingerprint(application, settings.hmacKey);
      let stored = await store.getWithMetadata(key, { type: 'json', consistency: 'strong' });
      if (!stored) {
        const createdAt = clock.toISOString();
        let pdf;
        try { pdf = await createPdf({ ...application, reference: application.request_id, received_at: createdAt }, settings.password); }
        catch (error) {
          if (error?.code === 'PDF_UNSUPPORTED_CHARACTER') return json(422, { ok: false, error: 'unsupported_characters', message: 'We could not prepare one or more fields in the protected document. Contact Stonehaven for secure assistance. Do not email your application details.' });
          throw error;
        }
        if (!(pdf instanceof Uint8Array) || pdf.byteLength < 100 || pdf.byteLength > 1024 * 1024) return unavailable();
        const record = { version: 1, fingerprint: digest, created_at: createdAt, retry_until: new Date(clock.getTime() + RETRY_MS).toISOString(), status: 'pending', envelope: emailEnvelope(application, pdf, settings.from, preview) };
        // Atomic creation chooses one randomized encrypted PDF for all concurrent retries.
        const creation = await store.setJSON(key, record, { onlyIfNew: true });
        if (typeof creation?.modified !== 'boolean') return unavailable();
        stored = await store.getWithMetadata(key, { type: 'json', consistency: 'strong' });
        if (!stored) return unavailable();
      }
      const record = stored.data;
      if (!record || record.version !== 1 || !fingerprintMatches(record.fingerprint, digest)) return json(409, { ok: false, error: 'request_changed', message: 'This reference is already associated with different details. Return to the details step before submitting a new application.' });
      if (record.status === 'accepted') return json(200, { ok: true, reference: application.request_id, received_at: record.created_at, accepted_at: record.accepted_at });
      if (record.status !== 'pending' || !record.envelope || !Number.isFinite(Date.parse(record.retry_until)) || now().getTime() >= Date.parse(record.retry_until)) return json(409, { ok: false, error: 'review_required', message: 'Please contact Stonehaven with this reference before submitting again. Do not email your application details.' });
      // The whole envelope is immutable, including randomized PDF bytes and signature.
      // Provider deduplication lasts 24h; our 23h deadline prevents uncertain late resends.
      let response;
      try {
        response = await send('https://api.resend.com/emails', {
          method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10_000),
          headers: { 'Authorization': `Bearer ${settings.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `heloc-application/${application.request_id}` },
          body: JSON.stringify(record.envelope),
        });
      } catch { return unavailable(); }
      let receipt;
      try { receipt = await response.json(); } catch { return unavailable(); }
      if (!response.ok || typeof receipt?.id !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(receipt.id)) return unavailable();
      const acceptedAt = now().toISOString();
      const accepted = { ...record, status: 'accepted', accepted_at: acceptedAt, provider_id: receipt.id };
      const saved = await store.setJSON(key, accepted, { onlyIfMatch: stored.etag });
      if (!saved.modified) {
        const latest = await store.getWithMetadata(key, { type: 'json', consistency: 'strong' });
        if (latest?.data?.status !== 'accepted' || !fingerprintMatches(latest.data.fingerprint, digest)) return unavailable();
        return json(200, { ok: true, reference: application.request_id, received_at: record.created_at, accepted_at: latest.data.accepted_at });
      }
      return json(200, { ok: true, reference: application.request_id, received_at: record.created_at, accepted_at: acceptedAt });
    } catch {
      // Provider/storage/PDF errors may contain submitted values. Never log or reflect them.
      return unavailable();
    }
  };
}

// Invoke from a production scheduled function. No applicant details are read out or logged.
// Attachments expire after 48h; opaque receipts remain 30d to suppress old client retries.
export async function pruneApplicationRecords(store, clock = new Date()) {
  const listing = await store.list({ prefix: 'application/' });
  let redacted = 0;
  let deleted = 0;
  for (const { key } of listing.blobs) {
    const stored = await store.getWithMetadata(key, { type: 'json', consistency: 'strong' });
    if (!stored?.data || !Number.isFinite(Date.parse(stored.data.created_at))) continue;
    const age = clock.getTime() - Date.parse(stored.data.created_at);
    if (age >= RECEIPT_RETENTION_MS) { await store.delete(key); deleted++; }
    else if (age >= ATTACHMENT_RETENTION_MS && stored.data.envelope) {
      const { envelope, ...receipt } = stored.data;
      if (receipt.status !== 'accepted') receipt.status = 'expired';
      const result = await store.setJSON(key, receipt, { onlyIfMatch: stored.etag });
      if (result.modified) redacted++;
    }
  }
  return { redacted, deleted };
}
