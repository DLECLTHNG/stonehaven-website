import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import guard from '../netlify/edge-functions/validate-lead.js';
import { contactErrors, leadErrors, helocCreditEligible } from '../netlify/shared/lead-validation.mjs';

const good = { 'form-name': 'lead', name: 'Test Person', email: 'test+lead@example.com', page: 'contact', product: 'Commercial' };
const heloc = { ...good, page: 'heloc-callback', extra: { home_value: '400000', mortgage_balance: '0', requested_amount: '50000', credit_band: '659-640' } };
const post = (data, path = '/contact') => new Request('https://stonehavencre.com' + path, { method: 'POST', body: new URLSearchParams(data) });

test('contact validation requires actual name and valid email strings', () => {
  assert.deepEqual(contactErrors(good), {});
  assert.deepEqual(contactErrors({ ...good, name: ' 李 ', email: ' test+lead@example.com ' }), {});
  for (const value of [undefined, null, '', ' \t\n ', [], {}]) {
    assert.ok(contactErrors({ ...good, name: value }).name);
    assert.ok(contactErrors({ ...good, email: value }).email);
  }
  for (const email of ['abc', 'a@b', 'a @example.com', 'a@@example.com', 'a@example.com\nspam']) assert.ok(contactErrors({ ...good, email }).email);
});

test('contacts reject invisible names, control characters and malformed mailboxes', async () => {
  for (const name of ['\u200b\u200c\u200d', '\u00ad', '---', '1234', 'Test\u0007Person', 'Test\u202ePerson']) {
    assert.ok(contactErrors({ ...good, name }).name, JSON.stringify(name));
    assert.equal((await guard(post({ ...good, name }))).status, 422);
  }
  for (const email of ['\u200b@example.com', 'test\u0000@example.com', 'test@example.com\r\n', '<test>@example.com', 'test..person@example.com', '.test@example.com', 'test@example..com', 'test@-example.com', 'test@example.com.']) {
    assert.ok(contactErrors({ ...good, email }).email, JSON.stringify(email));
    assert.equal((await guard(post({ ...good, email }))).status, 422);
  }
  for (const name of ['李', 'José O’Neill', 'محمد', 'Jean-Luc']) assert.deepEqual(contactErrors({ ...good, name }), {});
  for (const email of ['first.last+project@example.co.uk', 'o\'neill@example.com', 'test@xn--bcher-kva.de']) assert.deepEqual(contactErrors({ ...good, email }), {});
});

test('HELOC enforces the $50,000 boundary and still accepts a paid-off mortgage', () => {
  assert.deepEqual(leadErrors(heloc), {});
  for (const requested_amount of ['', '0', '5000', '25000', '30000', '49999.99', '-50000', '5e4', '50,00', ['50000'], {}, true]) {
    assert.ok(leadErrors({ ...heloc, extra: { ...heloc.extra, requested_amount } }).requested_amount, requested_amount);
  }
  for (const requested_amount of ['50000', '$50,000', '50000.01', '60000', 50000]) assert.deepEqual(leadErrors({ ...heloc, extra: { ...heloc.extra, requested_amount } }), {});
  assert.ok(leadErrors({ ...heloc, requested_amount: '25000' }).requested_amount, 'conflicting top-level value cannot bypass minimum');
  assert.deepEqual(leadErrors({ ...good, requested_amount: '25000' }), {}, 'other loan programs are unaffected');
});

test('HELOC rules cover saved estimates, native forms, fallback routes and cash-out comparisons', () => {
  for (const page of ['heloc-wizard-save', 'heloc-instant', 'heloc-callback', '/es/heloc/paid-off-home', 'es/heloc/paid-off-home']) assert.ok(leadErrors({ ...good, page }).requested_amount, page);
  assert.ok(leadErrors(good, '/es/heloc').requested_amount);
  assert.ok(leadErrors({ ...good, extra: { goal: 'Compare cash-out vs HELOC' } }).requested_amount);
  assert.ok(leadErrors({ ...good, extra: '{invalid' }).extra);
  assert.deepEqual(leadErrors({ ...good, page: 'heloc-wizard', ...heloc.extra }), {});
});

test('HELOC credit eligibility includes 640 but excludes unknown, malformed and partly ineligible ranges', () => {
  for (const value of [640, 850, '640', '850', '659-640', '640-659', '640–659', '850-780', '640+', ' 640 ']) {
    assert.equal(helocCreditEligible(value), true, String(value));
    assert.deepEqual(leadErrors({ ...heloc, extra: { ...heloc.extra, credit_band: value } }), {});
  }
  for (const value of [undefined, null, '', 'not-sure', 'Not sure', '639', '600+', '639-620', '640-639', '619–659', '851', '850-999', '-640', '640.0', '6.4e2', ['640'], {}, true]) {
    assert.equal(helocCreditEligible(value), false, String(value));
    assert.ok(leadErrors({ ...heloc, extra: { ...heloc.extra, credit_band: value } }).credit_band, String(value));
  }
  const { credit_band, ...amounts } = heloc.extra;
  assert.ok(leadErrors({ ...heloc, extra: amounts }).credit_band, 'credit cannot be omitted');
  assert.deepEqual(leadErrors({ ...good, credit_band: '619-600', requested_amount: '30000' }), {}, 'other products retain their own eligibility');
});

test('HELOC aliases and mixed-product paths cannot bypass the same minimums', () => {
  const { credit_band, ...amounts } = heloc.extra;
  for (const key of ['credit_band', 'credit_band_pick', 'credit_score', 'credit', 'fico']) {
    assert.ok(leadErrors({ ...heloc, [key]: '639' }).credit_band, key + ' conflicts with extra');
    assert.ok(leadErrors({ ...heloc, extra: { ...heloc.extra, [key]: '639' } }).credit_band, key + ' conflicts inside extra');
    assert.deepEqual(leadErrors({ ...good, product: 'HELOC', ...amounts, [key]: '640' }), {}, key + ' accepts boundary');
    assert.deepEqual(leadErrors({ ...good, product: 'HELOC', extra: { ...amounts, [key]: '640' } }), {}, key + ' accepts nested boundary');
  }
  for (const marker of [{ product: 'HELOC' }, { product_choice: 'HELOC' }, { goal: 'Compare cash-out vs HELOC' }, { loan_type: 'HELOC' }, { lp_variant: 'heloc-wizard' }]) {
    for (const data of [{ ...good, ...marker }, { ...good, extra: marker }]) {
      assert.ok(leadErrors(data).requested_amount, JSON.stringify(marker));
      assert.ok(leadErrors(data).credit_band, JSON.stringify(marker));
    }
  }
});

test('edge guard rejects invalid capture before Netlify email and CRM processing', async () => {
  for (const data of [{ ...good, name: '' }, { ...good, email: '' }, { ...good, email: 'not-an-email' },
    ...[{ requested_amount: '49999' }, { credit_band: '639' }, { credit_band: 'not-sure' }, { credit_band: '' }].map(change => ({ ...heloc, extra: JSON.stringify({ ...heloc.extra, ...change }) }))]) {
    const response = await guard(post(data));
    assert.equal(response.status, 422);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal((await response.json()).ok, false);
  }
});

test('edge guard preserves accepted URL-encoded and multipart bodies and unrelated requests', async () => {
  const data = { ...heloc, extra: JSON.stringify(heloc.extra) };
  const request = post(data);
  assert.equal(await guard(request), undefined);
  assert.equal(request.bodyUsed, false);
  assert.deepEqual(Object.fromEntries(await request.formData()), data);
  const multipart = new FormData();
  for (const [key, value] of Object.entries(good)) multipart.append(key, value);
  assert.equal(await guard(new Request('https://stonehavencre.com/contact', { method: 'POST', body: multipart })), undefined);
  multipart.set('email', '');
  assert.equal((await guard(new Request('https://stonehavencre.com/contact', { method: 'POST', body: multipart }))).status, 422);
  assert.equal(await guard(new Request('https://stonehavencre.com/contact')), undefined);
  assert.equal(await guard(post({ 'form-name': 'unrelated' })), undefined);
});

test('edge guard rejects duplicate fields, malformed context and oversized requests', async () => {
  const data = new URLSearchParams(good); data.append('email', '');
  assert.equal((await guard(post(data))).status, 400);
  assert.equal((await guard(post({ ...good, extra: '{invalid' }))).status, 422);
  assert.equal((await guard(post({ ...good, about: 'x'.repeat(65536) }))).status, 413);
});

test('capture rejects foreign browser submissions while preserving native and server delivery', async () => {
  for (const headers of [{origin:'https://foreign.example'}, {origin:'null'}, {'sec-fetch-site':'cross-site'}]) {
    const response = await guard(new Request('https://stonehavencre.com/contact', {method:'POST',headers,body:new URLSearchParams(good)}));
    assert.equal(response.status,403);
    assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  }
  for (const origin of ['https://stonehavencre.com','https://www.stonehavencre.com']) {
    assert.equal(await guard(new Request('https://stonehavencre.com/contact', {method:'POST',headers:{origin},body:new URLSearchParams(good)})),undefined);
  }
  const preview='https://deploy-preview-123--stonehaven.netlify.app';
  assert.equal(await guard(new Request(preview+'/contact', {method:'POST',headers:{origin:preview},body:new URLSearchParams(good)})),undefined);
  assert.equal(await guard(post(good)),undefined,'Family server posts do not carry browser Origin headers');
});

test('every static inquiry form visibly collects required name and email', () => {
  let count = 0;
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (['.git', '.site', 'docs', 'downloads', 'node_modules', '.netlify'].includes(entry.name)) continue;
      const path = dir + '/' + entry.name;
      if (entry.isDirectory()) { walk(path); continue; }
      if (!entry.name.endsWith('.html')) continue;
      const html = readFileSync(path, 'utf8');
      for (const form of html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)) {
        if (!/data-sh-form=|id="inquiry-form"/.test(form[0])) continue;
        count++;
        for (const key of ['name', 'email']) {
          const input = form[0].match(new RegExp('<input\\b[^>]*name="' + key + '"[^>]*>'))?.[0];
          assert.ok(input, path + ' needs ' + key);
          assert.match(input, /\brequired\b/, path + ' requires ' + key);
          assert.doesNotMatch(input, /type="hidden"|\bdisabled\b/, path + ' must collect ' + key);
        }
      }
    }
  }
  walk('.');
  assert.ok(count >= 120, 'all current inquiry forms are covered');
});
