import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { applicationConfiguration, createApplicationHandler, normalizeApplication, pruneApplicationRecords, MAX_APPLICATION_BYTES } from '../netlify/functions/lib/heloc-application-delivery.mjs';
import { config } from '../netlify/functions/heloc-application.mjs';

const REQUEST_ID = '8bfb99dc-e3f2-4e03-aa01-efca4f3eed99';
const SECOND_ID = '704d2939-6c09-435f-aeea-92993b0a4d55';
const ORIGIN = 'https://stonehavencre.com';
const DATE = new Date('2026-09-22T12:00:00.000Z');
const ENV = {
  HELOC_APPLICATION_PDF_PASSWORD: 'SYNTHETIC-TEST-PASSWORD-ONLY-123456',
  HELOC_APPLICATION_HMAC_KEY: 'SYNTHETIC-HMAC-TEST-KEY-ONLY-12345678',
  HELOC_APPLICATION_RESEND_KEY: 're_SYNTHETIC_TEST_KEY_12345678',
  HELOC_APPLICATION_FROM: 'Stonehaven Applications <applications@stonehavencre.com>',
  CONTEXT: 'production',
};
const PERSON = { full_name: 'Synthetic Intake Test', dob: '1988-02-29', ssn: '123-45-6789', address: '123 Synthetic Street', unit: '', city: 'Atlanta', state: 'GA', zip: '30301', w2_income: '120,000.00' };
const BODY = { request_id: REQUEST_ID, application_type: 'single', applicants: [PERSON], subject_property: {address:'987 Investment Road',unit:'',city:'Atlanta',state:'GA',zip:'30301'} };
const clone = value => JSON.parse(JSON.stringify(value));

function fakeStore() {
  const records = new Map();
  let revision = 0;
  const store = {
    records,
    async getMetadata(key) { const entry = records.get(key); return entry ? { metadata: {}, etag: entry.etag } : null; },
    async getWithMetadata(key) { return records.has(key) ? clone(records.get(key)) : null; },
    async setJSON(key, data, condition) {
      const previous = records.get(key);
      if (condition?.onlyIfNew && previous) return { modified: false, etag: previous.etag };
      if (condition?.onlyIfMatch && condition.onlyIfMatch !== previous?.etag) return { modified: false, etag: previous?.etag };
      const etag = `"revision-${++revision}"`;
      records.set(key, { data: clone(data), metadata: {}, etag });
      return { modified: true, etag };
    },
    async list() { return { blobs: [...records.keys()].map(key => ({ key })) }; },
    async delete(key) { records.delete(key); },
  };
  return store;
}

function fixture(overrides = {}) {
  const store = fakeStore();
  const sends = [];
  const pdfInputs = [];
  const clock = { date: DATE };
  const send = async (url, options) => { sends.push({ url, ...options }); return Response.json({ id: 'ddc042e7-7e4a-41d8-9eeb-7ec2f5c21afc' }); };
  const createPdf = async (application, password) => { pdfInputs.push({ application, password }); return Buffer.alloc(256, pdfInputs.length); };
  const handler = createApplicationHandler({ env: { ...ENV }, now: () => clock.date, getStore: async () => store, send, createPdf, ...overrides });
  return { handler, store, sends, pdfInputs, clock };
}

function request(body = BODY, headers = {}, options = {}) {
  return new Request(`${ORIGIN}/api/heloc-application`, {
    method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body), ...options,
  });
}

test('application endpoint has platform IP rate limiting and a declared route', () => {
  assert.deepEqual(config.path, ['/api/heloc-application', '/.netlify/functions/heloc-application']);
  assert.deepEqual(config.rateLimit, { windowSize: 60, windowLimit: 5, aggregateBy: ['ip', 'domain'] });
});

test('readiness exposes no configuration and fails closed for missing, weak or unavailable storage', async () => {
  const get = () => new Request(`${ORIGIN}/api/heloc-application`);
  const ready = fixture();
  assert.deepEqual(await (await ready.handler(get())).json(), { ready: true });
  assert.equal(ready.sends.length, 0);
  for (const env of [{}, { ...ENV, HELOC_APPLICATION_PDF_PASSWORD: 'weak' }, { ...ENV, HELOC_APPLICATION_HMAC_KEY: 'weak' }, { ...ENV, HELOC_APPLICATION_FROM: 'x@example.com\nBcc: attacker@example.com' }]) {
    assert.equal(applicationConfiguration(env), null);
    assert.deepEqual(await (await fixture({ env }).handler(get())).json(), { ready: false });
  }
  assert.deepEqual(await (await fixture({ getStore: async () => { throw new Error('private storage details'); } }).handler(get())).json(), { ready: false });
});

test('origin guard rejects foreign, opaque, missing and cross-site contexts before delivery', async () => {
  const f = fixture();
  for (const headers of [{ Origin: 'https://attacker.invalid' }, { Origin: 'null' }, { Origin: '' }, { Origin: ORIGIN, 'Sec-Fetch-Site': 'cross-site' }]) {
    assert.equal((await f.handler(request(BODY, headers))).status, 403);
  }
  assert.equal(f.sends.length, 0);
  assert.equal(f.pdfInputs.length, 0);
  assert.equal((await f.handler(request(BODY, { Origin: 'https://www.stonehavencre.com' }))).status, 200);
});

test('preview origin is exact and comes only from deployment configuration', async () => {
  const preview = 'https://deploy-preview-99--test.netlify.app';
  const f = fixture({ env: { ...ENV, CONTEXT: 'deploy-preview', DEPLOY_PRIME_URL: preview } });
  assert.equal((await f.handler(request(BODY, { Origin: 'https://deploy-preview-98--test.netlify.app' }))).status, 403);
  assert.equal((await f.handler(request(BODY, { Origin: preview }))).status, 200);
  const prod = fixture({ env: { ...ENV, DEPLOY_PRIME_URL: preview } });
  assert.equal((await prod.handler(request(BODY, { Origin: preview }))).status, 403);
});

test('preview origin and label work with the runtime context Netlify actually provides', async () => {
  // At runtime Netlify exposes only URL, SITE_NAME and SITE_ID; CONTEXT and DEPLOY_PRIME_URL are build-time only.
  const { CONTEXT, ...runtimeEnv } = ENV;
  const preview = 'https://deploy-preview-40--test-site.netlify.app';
  const previewContext = { deploy: { context: 'deploy-preview' }, site: { name: 'test-site' } };
  const at = (host, origin) => new Request(`${host}/api/heloc-application`, {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(BODY),
  });
  const accepted = fixture({ env: runtimeEnv });
  assert.equal((await accepted.handler(at(preview, preview), previewContext)).status, 200);
  assert.match(JSON.parse(accepted.sends[0].body).subject, /^\[Preview test\] HELOC application received: /);
  for (const [host, origin, context] of [
    [preview, 'https://deploy-preview-39--test-site.netlify.app', previewContext],
    ['https://deploy-preview-40--other-site.netlify.app', 'https://deploy-preview-40--other-site.netlify.app', previewContext],
    [preview, preview, { deploy: { context: 'production' }, site: { name: 'test-site' } }],
    [preview, preview, { deploy: { context: 'deploy-preview' }, site: {} }],
    [preview, preview, undefined],
  ]) {
    const rejected = fixture({ env: runtimeEnv });
    assert.equal((await rejected.handler(at(host, origin), context)).status, 403);
    assert.equal(rejected.sends.length, 0);
    assert.equal(rejected.pdfInputs.length, 0);
  }
  const production = fixture({ env: runtimeEnv });
  assert.equal((await production.handler(request(), { deploy: { context: 'production' }, site: { name: 'test-site' } })).status, 200);
  assert.doesNotMatch(JSON.parse(production.sends[0].body).subject, /Preview test/);
});

test('streamed bodies are bounded even without a content-length header', async () => {
  const f = fixture();
  const response = await f.handler(request(BODY, {}, { body: ' '.repeat(MAX_APPLICATION_BYTES + 1) }));
  assert.equal(response.status, 400);
  assert.equal(f.sends.length, 0);
  assert.equal(f.pdfInputs.length, 0);
  assert.equal((await f.handler(request(BODY, { 'Content-Length': String(MAX_APPLICATION_BYTES + 1) }))).status, 400);
});

test('rejects unsupported methods, encodings, malformed JSON and strict schema violations', async () => {
  const f = fixture();
  assert.equal((await f.handler(new Request(`${ORIGIN}/api/heloc-application`, { method: 'DELETE' }))).status, 405);
  assert.equal((await f.handler(request(BODY, { 'Content-Type': 'application/x-www-form-urlencoded' }))).status, 415);
  assert.equal((await f.handler(request(BODY, { 'Content-Encoding': 'gzip' }))).status, 415);
  assert.equal((await f.handler(request(BODY, {}, { body: '{invalid json' }))).status, 400);
  const badBodies = [
    [], null, { ...BODY, request_id: '../../secret' }, { ...BODY, recipient: 'attacker@example.com' },
    { ...BODY, application_type: 'joint' }, { ...BODY, applicants: [PERSON, PERSON] },
    { ...BODY, applicants: [{ ...PERSON, unknown: 'field' }] },
    { ...BODY, applicants: [{ ...PERSON, ssn: 123456789 }] },
    { ...BODY, applicants: [{ ...PERSON, full_name: '\u200b' }] },
    { ...BODY, applicants: [{ ...PERSON, dob: '1987-02-29' }] },
    { ...BODY, applicants: [{ ...PERSON, dob: '2999-01-01' }] },
    { ...BODY, applicants: [{ ...PERSON, ssn: '000-01-1234' }] },
    { ...BODY, applicants: [{ ...PERSON, w2_income: '-100' }] },
    { ...BODY, applicants: [{ ...PERSON, state: 'XX' }] },
    { ...BODY, applicants: [{ ...PERSON, address: 'x'.repeat(300) }] },
  ];
  for (const body of badBodies) assert.equal((await f.handler(request(body))).status, 422);
  assert.equal(f.sends.length, 0);
});

test('valid joint applications require every detail and normalize sensitive fields in memory', () => {
  const application = normalizeApplication({ ...BODY, application_type: 'joint', applicants: [PERSON, { ...PERSON, full_name: 'Second Synthetic Applicant', ssn: '219-09-9999' }] }, '2026-09-22');
  assert.equal(application.applicants.length, 2);
  assert.equal(application.applicants[0].ssn, '123456789');
  assert.equal(application.applicants[0].w2_income, '120000.00');
  assert.equal(normalizeApplication({ ...BODY, application_type: 'joint', applicants: [PERSON, { full_name: 'Partial' }] }), null);
});

test('only protected attachment carries applicant details, fixed recipient and static signature are preserved', async () => {
  const f = fixture();
  const response = await f.handler(request());
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result, { ok: true, reference: REQUEST_ID, received_at: DATE.toISOString(), accepted_at: DATE.toISOString() });
  assert.equal(f.sends[0].url, 'https://api.resend.com/emails');
  assert.equal(f.sends[0].redirect, 'error');
  assert.ok(f.sends[0].signal instanceof AbortSignal);
  assert.equal(f.sends[0].headers['Idempotency-Key'], `heloc-application/${REQUEST_ID}`);
  const envelope = JSON.parse(f.sends[0].body);
  assert.deepEqual(envelope.to, ['chris@stonehavencre.com']);
  assert.equal(envelope.reply_to, undefined);
  assert.equal(envelope.attachments[0].filename, `heloc-application-${REQUEST_ID}.pdf`);
  assert.equal(envelope.attachments[0].content_type, 'application/pdf');
  assert.ok(envelope.html.includes('Chris De Leeuw'));
  assert.ok(envelope.html.includes('Company NMLS License #1752355'));
  assert.ok(envelope.html.includes('tel:+14049097416'));
  assert.ok(envelope.html.includes('financing is arranged through third-party capital providers'));
  const stored = [...f.store.records.values()][0].data;
  const serialized = JSON.stringify({ stored, envelope, result });
  for (const privateValue of [PERSON.full_name, PERSON.dob, PERSON.address, PERSON.ssn, '123456789', ENV.HELOC_APPLICATION_PDF_PASSWORD, ENV.HELOC_APPLICATION_HMAC_KEY]) assert.equal(serialized.includes(privateValue), false);
  assert.equal(stored.fingerprint, createHmac('sha256', ENV.HELOC_APPLICATION_HMAC_KEY).update(JSON.stringify({ application_type: 'single', applicants: normalizeApplication(BODY).applicants, subject_property: BODY.subject_property })).digest('hex'));
  assert.equal(f.pdfInputs[0].application.reference, REQUEST_ID);
  assert.equal(f.pdfInputs[0].password, ENV.HELOC_APPLICATION_PDF_PASSWORD);
  for (const header of ['cache-control', 'x-content-type-options', 'x-robots-tag']) assert.ok(response.headers.has(header));
});

test('accepted retries reuse their receipt without generating another PDF or sending email', async () => {
  const f = fixture();
  assert.equal((await f.handler(request())).status, 200);
  f.clock.date = new Date(DATE.getTime() + 2 * 60_000);
  assert.equal((await f.handler(request())).status, 200);
  assert.equal(f.pdfInputs.length, 1);
  assert.equal(f.sends.length, 1);
});

test('ambiguous delivery retries reuse exact bytes even after sender or encryption configuration changes', async () => {
  const sends = [];
  const env = { ...ENV };
  const f = fixture({ env, send: async (_url, options) => { sends.push(options); if (sends.length === 1) throw new Error('timeout'); return Response.json({ id: 'provider-accepted-id' }); } });
  assert.equal((await f.handler(request())).status, 503);
  env.HELOC_APPLICATION_FROM = 'Stonehaven <changed@stonehavencre.com>';
  env.HELOC_APPLICATION_PDF_PASSWORD = 'NEW-SYNTHETIC-TEST-PASSWORD-ONLY-123456';
  assert.equal((await f.handler(request())).status, 200);
  assert.equal(sends[0].body, sends[1].body);
  assert.equal(sends[0].headers['Idempotency-Key'], sends[1].headers['Idempotency-Key']);
  assert.equal(f.pdfInputs.length, 1);
});

test('an accepted email with a failed receipt write is retried with the same provider key and attachment', async () => {
  const f = fixture();
  const originalSet = f.store.setJSON;
  let failed = false;
  f.store.setJSON = async (key, value, condition) => {
    if (value.status === 'accepted' && !failed) { failed = true; throw new Error('storage unavailable after acceptance'); }
    return originalSet(key, value, condition);
  };
  assert.equal((await f.handler(request())).status, 503);
  assert.equal(f.store.records.get(`application/${REQUEST_ID}`).data.status, 'pending');
  assert.equal((await f.handler(request())).status, 200);
  assert.equal(f.sends.length, 2);
  assert.equal(f.sends[0].body, f.sends[1].body);
  assert.equal(f.sends[0].headers['Idempotency-Key'], f.sends[1].headers['Idempotency-Key']);
  assert.equal(f.pdfInputs.length, 1);
});

test('unsupported PDF characters fail explicitly without persisting, logging or reflecting the value', async () => {
  const f = fixture({ createPdf: async () => { throw Object.assign(new Error(PERSON.full_name), { code: 'PDF_UNSUPPORTED_CHARACTER', field: 'full_name', applicantIndex: 0 }); } });
  const response = await f.handler(request());
  assert.equal(response.status, 422);
  const body = await response.json();
  assert.equal(body.error, 'unsupported_characters');
  assert.equal(JSON.stringify(body).includes(PERSON.full_name), false);
  assert.equal(f.sends.length, 0);
  assert.equal(f.store.records.size, 0);
});

test('same request reference cannot be repurposed with different applicant details', async () => {
  const f = fixture();
  await f.handler(request());
  const response = await f.handler(request({ ...BODY, applicants: [{ ...PERSON, full_name: 'Changed Synthetic Name' }] }));
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, 'request_changed');
  assert.equal(f.sends.length, 1);
});

test('concurrent submissions choose one persisted PDF and one immutable provider request', async () => {
  const f = fixture();
  const responses = await Promise.all([f.handler(request()), f.handler(request())]);
  assert.deepEqual(responses.map(response => response.status), [200, 200]);
  assert.ok(f.pdfInputs.length <= 2);
  assert.equal(f.store.records.size, 1);
  assert.ok(f.sends.length >= 1);
  assert.equal(new Set(f.sends.map(send => send.body)).size, 1);
  assert.equal(new Set(f.sends.map(send => send.headers['Idempotency-Key'])).size, 1);
});

test('uncertain requests freeze at 23h instead of risking a resend after provider deduplication expires', async () => {
  let sends = 0;
  const f = fixture({ send: async () => { sends++; return Response.json({ error: 'temporary' }, { status: 500 }); } });
  assert.equal((await f.handler(request())).status, 503);
  f.clock.date = new Date(DATE.getTime() + 23 * 60 * 60 * 1000);
  const frozen = await f.handler(request());
  assert.equal(frozen.status, 409);
  assert.equal((await frozen.json()).error, 'review_required');
  assert.equal(sends, 1);
});

test('storage and provider errors never reflect sensitive exception details or claim success', async () => {
  const privateError = `${PERSON.full_name} ${PERSON.ssn} ${ENV.HELOC_APPLICATION_PDF_PASSWORD}`;
  for (const overrides of [
    { getStore: async () => { throw new Error(privateError); } },
    { createPdf: async () => { throw new Error(privateError); } },
    { send: async () => Response.json({ message: privateError }, { status: 400 }) },
    { send: async () => Response.json({ unexpected: privateError }) },
  ]) {
    const response = await fixture(overrides).handler(request());
    assert.equal(response.status, 503);
    const text = await response.text();
    assert.equal(text.includes(privateError), false);
    assert.equal(JSON.parse(text).ok, false);
  }
});

test('cleanup drops encrypted attachments after 48h and keeps an opaque deduplication receipt for 30d', async () => {
  const f = fixture();
  await f.handler(request());
  assert.deepEqual(await pruneApplicationRecords(f.store, new Date(DATE.getTime() + 48 * 60 * 60 * 1000)), { redacted: 1, deleted: 0 });
  const record = f.store.records.get(`application/${REQUEST_ID}`).data;
  assert.equal(record.envelope, undefined);
  assert.equal(record.status, 'accepted');
  assert.equal((await f.handler(request())).status, 200);
  assert.equal(f.sends.length, 1);
  assert.deepEqual(await pruneApplicationRecords(f.store, new Date(DATE.getTime() + 30 * 24 * 60 * 60 * 1000)), { redacted: 0, deleted: 1 });
  assert.equal(f.store.records.size, 0);
});

test('cleanup expires ambiguous submissions without sending or regenerating sensitive data', async () => {
  const f = fixture({ send: async () => Response.json({}, { status: 503 }) });
  await f.handler(request({ ...BODY, request_id: SECOND_ID }));
  await pruneApplicationRecords(f.store, new Date(DATE.getTime() + 48 * 60 * 60 * 1000));
  const record = f.store.records.get(`application/${SECOND_ID}`).data;
  assert.equal(record.status, 'expired');
  assert.equal(record.envelope, undefined);
  assert.equal((await f.handler(request({ ...BODY, request_id: SECOND_ID }))).status, 409);
});

test('every QA refusal occurs before PDF creation, storage writes or email',async()=>{
  const missing={...BODY};delete missing.request_id;
  const cases=[
    [403,()=>request(BODY,{Origin:'https://example.com'})],
    [403,()=>request(BODY,{'Sec-Fetch-Site':'cross-site'})],
    [415,()=>request(BODY,{'Content-Type':'text/plain'})],
    [415,()=>request(BODY,{'Content-Encoding':'identity'})],
    [400,()=>request(BODY,{}, {body:'{'})],
    [400,()=>request(BODY,{}, {body:'x'.repeat(MAX_APPLICATION_BYTES+1)})],
    [422,()=>request({...BODY,applicants:[{...PERSON,ssn:'000-45-6789'}]})],
    [422,()=>request({...BODY,extra:true})],
    [422,()=>request(missing)],
    [422,()=>request({...BODY,application_type:'joint'})],
    [422,()=>request({...BODY,request_id:'invalid'})],
    [405,()=>new Request(`${ORIGIN}/api/heloc-application`,{method:'PUT'})],
  ];
  for(const [status,makeRequest] of cases){
    const f=fixture();let writes=0;
    f.store.setJSON=async()=>{writes++;throw new Error('No storage write permitted for refusal');};
    const response=await f.handler(makeRequest());
    assert.equal(response.status,status);
    assert.equal(f.pdfInputs.length,0);
    assert.equal(writes,0);
    assert.equal(f.sends.length,0);
  }
});

test('subject property is required, validated separately, and included in protected delivery', async () => {
  for (const subject_property of [undefined, null, {}, {...BODY.subject_property,address:''}, {...BODY.subject_property,state:'XX'}, {...BODY.subject_property,zip:'bad'}, {...BODY.subject_property,extra:'reject'}]) {
    const f=fixture();
    assert.equal((await f.handler(request({...BODY,subject_property}))).status,422);
    assert.equal(f.pdfInputs.length,0);
    assert.equal(f.sends.length,0);
  }
  const f=fixture();
  assert.equal((await f.handler(request())).status,200);
  assert.deepEqual(f.pdfInputs[0].application.subject_property,BODY.subject_property);
  assert.notEqual(f.pdfInputs[0].application.subject_property.address,PERSON.address);
  assert.equal((await f.handler(request({...BODY,subject_property:{...BODY.subject_property,address:'456 Different Investment Road'}}))).status,409);
  assert.equal(f.sends.length,1);
});
