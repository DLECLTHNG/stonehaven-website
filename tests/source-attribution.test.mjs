import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, readdirSync } from 'node:fs';
const code = readFileSync('js/funnel.js', 'utf8');
const KEY = 'sh_source_context_v1';
const flush = () => new Promise(resolve => setImmediate(resolve));
function page(options = {}) {
  const storage = options.storage || new Map(), requests = [], events = [], meta = [], ads = [];
  const attrs = { 'data-sh-form': 'cre-review', 'data-sh-product': 'Commercial', ...(options.formAttrs || {}) };
  const input = { name: 'Synthetic Example', email: 'private@example.com', phone: '2025550123', company_website: '', ...(options.fields || {}) };
  const fields = Object.fromEntries(Object.entries(input).map(([name, value]) => [name, { name, value, id: name, type: 'text', style: {}, hasAttribute: () => true, addEventListener() {}, setAttribute() {}, removeAttribute() {}, focus() {} }]));
  for (const name of options.missingFields || []) delete fields[name];
  let validationBox;
  const button = { style: {} }, handlers = {}, docHandlers = {}, error = { style: {} };
  const form = {
    elements: Object.values(fields), style: {}, id: 'cre-form', appendChild: box => { validationBox = box; },
    getAttribute: key => attrs[key] || null, hasAttribute: key => key in attrs,
    addEventListener: (key, value) => { handlers[key] = value; },
    querySelector: selector => selector === '[type="submit"]' ? button : selector === '.lead-error' ? error : selector === '.lead-validation-error' ? validationBox : fields[selector.match(/^\[name="([^"]+)"\]$/)?.[1]] || null,
    querySelectorAll: () => Object.values(fields), parentElement: { querySelector: () => ({ classList: { add() {} } }) }
  };
  const document = { referrer: options.referrer || '', body: { getAttribute: key => options.bodyAttrs?.[key] || null }, head: { appendChild() {} }, documentElement: { lang: 'en' },
    createElement: () => ({ style: {}, setAttribute() {} }), addEventListener: (key, value) => { docHandlers[key] = value; },
    querySelectorAll: selector => selector === 'form[data-sh-form]' ? [form] : [], getElementById: () => null };
  const locationURL = new URL(options.url || 'https://stonehavencre.com/commercial');
  const location = {
    get href() { return locationURL.href; },
    set href(value) { locationURL.href = new URL(value, locationURL).href; },
    get pathname() { return locationURL.pathname; },
    get hostname() { return locationURL.hostname; },
    get search() { return locationURL.search; }
  };
  const navigator = { globalPrivacyControl: !!options.gpc };
  const window = { location, SH_CONFIG: { intakeEndpoint: options.intake || '' }, addEventListener() {}, crypto: { randomUUID: () => 'a71b8654-a00a-4346-b0a0-7706af89d130' },
    gtag: (...args) => events.push(args), fbq: (...args) => meta.push(args), shChatGPTLead: id => ads.push(id) };
  const sessionStorage = Object.fromEntries(['getItem', 'setItem', 'removeItem'].map(method => [method, (key, value) => {
    if (options.brokenStorage) throw new Error('storage disabled');
    if (method === 'getItem') return storage.get(key) || null;
    if (method === 'setItem') storage.set(key, value);
    if (method === 'removeItem') storage.delete(key);
  }]));
  const fetch = async (url, opts) => { requests.push({ url, opts }); return { ok: options.accept ? options.accept(url) : true }; };
  vm.runInNewContext(code, { document, window, navigator, sessionStorage, URL, URLSearchParams, fetch, setTimeout, clearTimeout, AbortController, Uint8Array, IntersectionObserver: class { observe() {} } });
  docHandlers.DOMContentLoaded();
  return { storage, requests, events, meta, ads, fields, navigator, button, submit: () => handlers.submit({ preventDefault() {} }),
    data(index = 0) { const r = requests[index]; return r.opts.headers['Content-Type'] === 'application/json' ? JSON.parse(r.opts.body) : Object.fromEntries(new URLSearchParams(r.opts.body)); },
    extra(index = 0) { const value = this.data(index).extra; return typeof value === 'string' ? JSON.parse(value) : value; } };
}

test('visually blank contacts and malformed emails cannot submit or fire conversions', async () => {
  for (const fields of [{name:'\u200b\u200c'}, {name:'---'}, {name:'Test\u0007Person'},
    {email:'test\u0000@example.com'}, {email:'test..person@example.com'}, {email:'test@example..com'}]) {
    const form = page({ fields });
    form.submit(); await flush();
    assert.equal(form.requests.length, 0, JSON.stringify(fields));
    assert.equal(form.events.length, 0);
    assert.equal(form.ads.length, 0);
  }
  const form = page({fields:{name:'李', email:'first.last+project@example.co.uk'}});
  form.submit(); await flush();
  assert.equal(form.requests.length, 1);
  assert.equal(form.events.filter(event => event[1] === 'generate_lead').length, 1);
});

test('search landing and most recent allowlisted CRE article survive internal navigation separately from submission', async () => {
  const storage = new Map();
  const landing = '/blog/atlanta-teardown-rebuild-construction-financing';
  page({ storage, url: `https://stonehavencre.com${landing}?email=private@example.com#project`, referrer: 'https://www.google.com/search?q=private+project' });
  const next = '/resources/commercial-refinance-guide';
  page({ storage, url: `https://stonehavencre.com${next}`, referrer: `https://stonehavencre.com${landing}` });
  const form = page({ storage, referrer: `https://stonehavencre.com${next}` });
  form.submit(); await flush();
  assert.deepEqual(form.extra().attribution, { version: 1, first_landing_path: landing, first_referrer_origin: 'https://www.google.com', first_channel: 'organic_search', last_cre_content_path: next, submission_path: '/commercial' });
  assert.equal(form.data().about.includes('private+project'), false);
  assert.equal(form.data().about.includes('email='), false);
  assert.equal(form.storage.get(KEY).includes('submission_path'), false);
});

test('known AI referrals, paid campaigns and direct visits are classified conservatively', async () => {
  for (const [referrer, search, channel] of [
    ['https://chatgpt.com/c/private-chat?prompt=private', '', 'ai_referral'],
    ['https://www.perplexity.ai/search/private', '', 'ai_referral'],
    ['https://gemini.google.com/app/private', '', 'ai_referral'],
    ['https://chatgpt.com/', '?utm_source=openai&utm_medium=cpc', 'paid_campaign'],
    ['https://www.bing.com/search?q=private', '', 'organic_search'],
    ['https://google.com.evil.com/', '', 'referral'],
    ['https://chatgpt.com.evil.com/', '', 'referral'],
    ['https://industryassociation.org/directory', '', 'referral'],
    ['', '?utm_source=chatgpt', 'direct_or_unknown'],
    ['', '?gclid=opaque-click', 'direct_or_unknown'],
    ['https://www.stonehavencre.com/blog', '', 'direct_or_unknown'],
    ['', '', 'direct_or_unknown']
  ]) {
    const p = page({ referrer, url: `https://stonehavencre.com/commercial${search}` });
    p.submit(); await flush();
    assert.equal(p.extra().attribution.first_channel, channel, referrer || search || 'no referrer');
    assert.equal(JSON.stringify(p.extra().attribution).includes('private'), false);
  }
});

test('campaign allowlist inherits across pages while first-touch source remains unchanged', async () => {
  const storage = new Map();
  page({ storage, url: 'https://stonehavencre.com/commercial?utm_source=google&utm_medium=cpc&utm_campaign=builders&email=not-stored@example.com' });
  const p = page({ storage, url: 'https://stonehavencre.com/contact', referrer: 'https://stonehavencre.com/commercial' });
  p.submit(); await flush();
  assert.deepEqual(p.extra().utm, { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'builders' });
  assert.equal(p.extra().attribution.first_landing_path, '/commercial');
  assert.equal(p.extra().attribution.first_channel, 'paid_campaign');
  assert.equal(p.extra().attribution.submission_path, '/contact');
  assert.equal(JSON.stringify([...storage]).includes('not-stored'), false);
  const later = page({ storage, url: 'https://stonehavencre.com/contact?utm_source=partner&utm_medium=referral' });
  later.submit(); await flush();
  assert.equal(later.extra().utm.utm_source, 'partner');
  assert.equal(later.extra().attribution.first_channel, 'paid_campaign');
});

test('storage errors preserve current-page campaign context and never prevent accepted delivery', async () => {
  const p = page({ brokenStorage: true, url: 'https://stonehavencre.com/commercial?utm_source=google&utm_medium=cpc', referrer: 'https://www.google.com/' });
  p.submit(); await flush();
  assert.equal(p.extra().utm.utm_source, 'google');
  assert.equal(p.extra().attribution.first_channel, 'paid_campaign');
  assert.equal(p.events.filter(event => event[1] === 'generate_lead').length, 1);
});

test('GPC removes stored source context and campaigns, including if enabled before submission', async () => {
  for (const late of [false, true]) {
    const storage = new Map();
    page({ storage, referrer: 'https://chatgpt.com/' });
    const p = page({ storage, gpc: !late, url: 'https://stonehavencre.com/contact?utm_source=google&utm_medium=cpc' });
    if (late) p.navigator.globalPrivacyControl = true;
    p.submit(); await flush();
    assert.equal(p.extra().attribution, undefined);
    assert.equal(p.extra().utm, undefined);
    assert.equal(p.data().about.includes('[source]'), false);
    assert.equal(p.data().about.includes('[attribution]'), false);
    assert.equal(storage.has(KEY), false);
    assert.equal(storage.has('sh_utms'), false);
  }
});

test('sensitive housing, Family, receipt and private paths never store or attach source context', async () => {
  for (const options of [
    { bodyAttrs: { 'data-fo-sensitive': '1' } }, { bodyAttrs: { 'data-fo-kind': 'confirm' } },
    { url: 'https://stonehavencre.com/family-housing-options' },
    { url: 'https://stonehavencre.com/blog/buy-house-for-parents-keep-own-home' },
    { url: 'https://stonehavencre.com/request-received' },
    { url: 'https://stonehavencre.com/private/borrower' },
    { url: 'https://stonehavencre.com/account/profile' },
    { url: 'https://stonehavencre.com/.netlify/functions/private' }
  ]) {
    const p = page({ referrer: 'https://www.google.com/', ...options });
    p.submit(); await flush();
    assert.equal(p.extra().attribution, undefined, JSON.stringify(options));
    assert.equal(p.data().about.includes('[url]'), false);
    assert.equal(p.storage.has(KEY), false);
  }
});

test('commercial multifamily and single-family property routes retain inquiry attribution', async () => {
  for (const path of ['/commercial/multifamily', '/es/commercial/multifamily', '/blog/single-family-construction-financing']) {
    const form = page({url:'https://stonehavencre.com'+path,referrer:'https://www.google.com/search?q=project'});
    form.submit(); await flush();
    assert.equal(form.extra().attribution.first_landing_path,path);
    assert.equal(form.extra().attribution.first_channel,'organic_search');
    assert.equal(form.extra().attribution.submission_path,path);
  }
});

test('untrusted URL data, stored fields and campaign markup are bounded or discarded', async () => {
  for (const referrer of ['javascript:alert(1)', 'https://private@example.com/secret', 'http://127.0.0.1/private', 'https://portal.internal/private']) {
    const p = page({ referrer }); p.submit(); await flush();
    assert.equal(p.extra().attribution.first_referrer_origin, '');
    assert.equal(p.extra().attribution.first_channel, 'direct_or_unknown');
  }
  const storage = new Map([[KEY, JSON.stringify({ version: 1, first_landing_path: '/account/private', first_referrer_origin: 'https://chatgpt.com/private', first_channel: 'ai_referral', last_cre_content_path: '/blog/fabricated-private' })],
    ['sh_utms', JSON.stringify({ utm_source: 'x'.repeat(300) + '<script>', email: 'not-stored@example.com', utm_medium: { secret: true } })]]);
  const p = page({ storage, referrer: 'https://www.bing.com/search?q=not-stored' });p.submit();await flush();
  assert.equal(p.extra().utm.utm_source.length, 200);
  assert.equal(p.extra().utm.email, undefined);
  assert.equal(p.extra().utm.utm_medium, undefined);
  assert.equal(p.extra().attribution.first_landing_path, '/commercial');
  assert.equal(p.extra().attribution.first_referrer_origin, 'https://www.bing.com');
  assert.equal(p.extra().attribution.last_cre_content_path, '');
});

test('Spanish CRE article context is allowlisted; unrelated articles never replace it', async () => {
  const storage = new Map(), first = '/es/blog/100-ltc-construction-loans-builder-cash-needed';
  page({ storage, url: `https://stonehavencre.com${first}` });
  page({ storage, url: 'https://stonehavencre.com/blog/heloc-basics' });
  const p = page({ storage, url: 'https://stonehavencre.com/es/commercial' });p.submit();await flush();
  assert.equal(p.extra().attribution.last_cre_content_path, first);
  assert.equal(p.extra().attribution.submission_path, '/es/commercial');
});

test('one opaque ID is present before dispatch and reused through fallback, manual retry and accepted conversion', async () => {
  let accepted = false;
  const p = page({ accept: () => accepted });
  p.submit(); await flush();
  assert.equal(p.requests.length, 2);
  assert.equal(p.ads.length, 0);
  const id = p.extra().submission_id;
  assert.match(id, /^sh-[a-f0-9-]+$/);
  assert.equal(p.extra(1).submission_id, id);
  accepted = true;
  p.submit(); await flush();
  assert.equal(p.extra(2).submission_id, id);
  assert.equal(p.ads[0], id);
  assert.equal(p.meta.find(event => event[1] === 'Lead')[3].eventID, id);
  assert.equal(JSON.stringify(p.events).includes(id), false);
});

test('private attribution and financial/contact data never become analytics or ad conversion parameters', async () => {
  const p = page({ referrer: 'https://chatgpt.com/c/private-chat', fields: { project_value: '3456789', total_project_cost: '2345678', requested_amount: '1987654', discovery_source: 'ChatGPT or AI assistant', notes: 'Private property scenario' }, formAttrs: { 'data-sh-capi': '' } });
  p.submit(); await flush();
  assert.equal(p.extra().project_value, '3456789');
  assert.equal(p.extra().total_project_cost, '2345678');
  assert.equal(p.extra().requested_amount, '1987654');
  assert.equal(p.extra().discovery_source, 'ChatGPT or AI assistant');
  assert.equal(p.extra().attribution.first_channel, 'ai_referral');
  const analytics = JSON.stringify([p.events, p.meta, p.ads]);
  for (const secret of ['private@example.com', '2025550123', '3456789', '2345678', '1987654', 'ChatGPT or AI assistant', 'Private property scenario', 'first_landing_path', 'chatgpt.com', 'ai_referral']) assert.equal(analytics.includes(secret), false, secret);
  const relay = p.requests.find(request => request.url === '/.netlify/functions/lead-capi');
  const relayBody = JSON.parse(relay.opts.body);
  assert.equal(relayBody.payload.extra.attribution, undefined);
  assert.equal(relayBody.payload.extra.submission_id, undefined);
  assert.equal(relayBody.payload.about.includes('[source]'), false);
  assert.equal(relayBody.event_id, p.extra().submission_id);
});

test('short attribution summary survives long notes and full record reaches direct intake too', async () => {
  const p = page({ intake: '/intake', referrer: 'https://claude.ai/chat/secret', fields: { ...Object.fromEntries(Array.from({ length: 12 }, (_, n) => [`notes_${n}`, 'x'.repeat(300)])), total_project_cost: '2400000', requested_amount: '1800000', project_value: '3600000' } });
  p.submit(); await flush();
  assert.equal(p.requests.length, 1);
  assert.equal(p.requests[0].url, '/intake');
  assert.equal(p.data().about.length, 2000);
  assert.match(p.data().about, /^Total project cost \(\$\): 2400000.*Requested financing \(\$\): 1800000.*Estimated completed value \(\$\): 3600000.*\[submission\] sh-.*\[source\] ai_referral; first=\/commercial; ref=https:\/\/claude.ai; submit=\/commercial/);
  assert.equal(p.extra().attribution.first_channel, 'ai_referral');
});

test('honeypots have no submission identity, network traffic or conversion', () => {
  const p = page({ fields: { company_website: 'spam' } });
  p.submit();
  assert.equal(p.requests.length, 0);
  assert.equal(p.events.length, 0);
  assert.equal(p.ads.length, 0);
});

test('the existing CAPI boundary forwards financial context only to its private CRM webhook', async t => {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const { handler } = require('../netlify/functions/lead-capi.js');
  const oldFetch = global.fetch, oldToken = process.env.META_CAPI_TOKEN, oldWebhook = process.env.CRM_WEBHOOK_URL;
  t.after(() => { global.fetch = oldFetch; for (const [key, value] of [['META_CAPI_TOKEN', oldToken], ['CRM_WEBHOOK_URL', oldWebhook]]) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
  process.env.META_CAPI_TOKEN = 'test-only'; process.env.CRM_WEBHOOK_URL = 'https://crm.example.com/lead';
  const requests = [];
  global.fetch = async (url, opts) => { requests.push({ url, body: JSON.parse(opts.body) }); return { ok: true }; };
  const payload = { name: 'Synthetic Example', email: 'private@example.com', phone: '2025550123', product: 'Commercial', page: 'cre-review',
    about: 'Private scenario with a $3456789 completed value', extra: { total_project_cost: '2345678', requested_amount: '1987654', project_value: '3456789', discovery_source: 'ChatGPT or AI assistant' } };
  const response = await handler({ httpMethod: 'POST', headers: { origin: 'https://stonehavencre.com', 'x-nf-client-connection-ip': '192.0.2.91' }, body: JSON.stringify({ event_name: 'lead', event_id: 'sh-opaque-inquiry', source_url: 'https://stonehavencre.com/commercial', payload }) });
  assert.equal(response.statusCode, 200);
  const metaRequest = requests.find(request => request.url.startsWith('https://graph.facebook.com/'));
  const metaBody = JSON.stringify(metaRequest.body);
  for (const secret of ['Synthetic Example', 'private@example.com', '2025550123', '2345678', '1987654', '3456789', 'ChatGPT or AI assistant', 'Private scenario']) assert.equal(metaBody.includes(secret), false, secret);
  assert.equal(metaRequest.body.data[0].event_id, 'sh-opaque-inquiry');
  const crmRequest = requests.find(request => request.url === process.env.CRM_WEBHOOK_URL);
  assert.deepEqual(crmRequest.body.extra, payload.extra);
});

test('every actual English and Spanish root form route retains a CRE landing through submission', async () => {
  // Inventory real shared form routes so a future public root form cannot
  // silently fall outside the runtime's bounded route allowlist. A few English
  // tools have no Spanish counterpart; do not invent those test destinations.
  const destinations = ['', 'es/'].flatMap(prefix => readdirSync(prefix || '.').filter(file => file.endsWith('.html') && /data-sh-form=/.test(readFileSync(prefix + file, 'utf8'))).map(file => ({
    language: prefix ? '/es' : '', destination: '/' + prefix + (file === 'index.html' ? '' : file.replace(/\.html$/, ''))
  })));
  assert.ok(destinations.some(item => item.destination === '/terms-sheet'));
  for (const { language, destination } of destinations) {
    const storage = new Map(), landing = language + '/blog/atlanta-teardown-rebuild-construction-financing';
    page({ storage, url: `https://stonehavencre.com${landing}?utm_source=google&utm_medium=cpc`, referrer: 'https://www.google.com/search?q=builder+capital' });
    const form = page({ storage, url: `https://stonehavencre.com${destination}`, referrer: `https://stonehavencre.com${landing}` });
    form.submit(); await flush();
    const attribution = form.extra().attribution;
    assert.ok(attribution, `missing context on ${destination}`);
    assert.equal(attribution.first_landing_path, landing, destination);
    assert.equal(attribution.first_channel, 'paid_campaign', destination);
    assert.equal(attribution.last_cre_content_path, landing, destination);
    assert.equal(attribution.submission_path, destination === '/es/' ? '/es' : destination, destination);
    assert.equal(form.extra().utm.utm_source, 'google', destination);
    // The route also needs to qualify when it is itself the initial landing.
    const direct = page({ url: `https://stonehavencre.com${destination}`, referrer: 'https://chatgpt.com/' });
    direct.submit(); await flush();
    assert.equal(direct.extra().attribution.first_landing_path, attribution.submission_path, destination);
    assert.equal(direct.extra().attribution.first_channel, 'ai_referral', destination);
  }
});

test('a legal policy detour preserves existing CRE context without tracking the policy or its campaign parameters', async () => {
  for (const legal of ['/privacy', '/es/privacy', '/privacy.html', '/es/privacy.html', '/privacy/', '/terms', '/es/terms']) {
    const storage = new Map();
    const landing = '/blog/45-million-builder-fix-and-flip-capital';
    page({ storage, url: `https://stonehavencre.com${landing}?utm_source=google&utm_medium=cpc`, referrer: 'https://www.google.com/' });
    const before = [...storage];
    const policy = page({ storage, url: `https://stonehavencre.com${legal}?utm_source=do-not-retain&utm_medium=paid`, referrer: `https://stonehavencre.com${landing}` });
    policy.submit(); await flush();
    assert.deepEqual([...storage], before, legal);
    assert.equal(policy.extra().attribution, undefined, legal);
    assert.equal(policy.extra().utm, undefined, legal);
    const form = page({ storage, url: 'https://stonehavencre.com/terms-sheet', referrer: `https://stonehavencre.com${legal}` });
    form.submit(); await flush();
    assert.equal(form.extra().attribution.first_landing_path, landing, legal);
    assert.equal(form.extra().attribution.submission_path, '/terms-sheet', legal);
    assert.equal(form.extra().utm.utm_source, 'google', legal);
  }
  const blank = page({ url: 'https://stonehavencre.com/privacy?utm_source=ignored&utm_medium=cpc' });
  assert.equal(blank.storage.size, 0);
});

test('GPC and sensitive Family exclusions still clear stored context during a policy visit', async () => {
  for (const options of [{ gpc: true }, { bodyAttrs: { 'data-fo-sensitive': '1' } }]) {
    const storage = new Map();
    page({ storage, url: 'https://stonehavencre.com/commercial?utm_source=google&utm_medium=cpc' });
    const policy = page({ storage, url: 'https://stonehavencre.com/privacy', ...options });
    policy.submit(); await flush();
    assert.equal(storage.has(KEY), false);
    assert.equal(storage.has('sh_utms'), false);
    assert.equal(policy.extra().attribution, undefined);
  }
});

test('removed route aliases and private or encoded paths never become attribution landing paths', async () => {
  for (const path of ['/commercial-calculator', '/sba-calculator', '/dscr-calculator', '/interest-only-mortgage', '/methodology', '/admin/terms-sheet', '/private/terms-sheet', '/api/terms-sheet', '/commercial/%70rivate', '/commercial/person%40example.com']) {
    const p = page({ url: `https://stonehavencre.com${path}`, referrer: 'https://chatgpt.com/' });
    p.submit(); await flush();
    assert.equal(p.extra().attribution, undefined, path);
    assert.equal(p.data().about.includes('[url]'), false, path);
  }
});

test('architect inquiries retain adviser identity, optional project context and Commercial routing without sending details to analytics', async () => {
  for (const slug of ['architect-financing-partners', 'construction-financing-for-architects', 'development-financing-for-architects']) {
    for (const prefix of ['', 'es/']) {
      const route = '/' + prefix + 'commercial/' + slug;
      const html = readFileSync(prefix + 'commercial/' + slug + '.html', 'utf8');
      const formTag = html.match(/<form\b[^>]*data-sh-form=[^>]*>/)[0];
      const formAttrs = Object.fromEntries([...formTag.matchAll(/(data-sh-[\w-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
      for (const activeProject of [false, true]) {
        const fields = { firm: 'Synthetic Architecture Studio', partner_role: 'Architect', about: 'General partnership inquiry' };
        if (activeProject) Object.assign(fields, { total_project_cost: '3500000', requested_amount: '2400000', project_value: '4900000', project_type: 'Mixed-use development', property_owned: 'Under contract', project_stage: 'Design / entitlement', timeline: '60-90 days' });
        for (const key of Object.keys(fields)) assert.ok(html.includes('name="' + key + '"'), `missing ${key} on ${route}`);
        const p = page({ url: 'https://stonehavencre.com' + route, referrer: 'https://www.google.com/', formAttrs, fields });
        p.submit(); await flush();
        const saved = p.data();
        assert.equal(saved['form-name'], 'lead');
        assert.equal(saved.product, 'Commercial');
        assert.equal(saved.page, 'commercial-' + slug);
        assert.equal(saved.lang, prefix ? 'es' : 'en');
        assert.ok(saved.about.includes('Architect financing partner inquiry: ' + slug));
        assert.ok(saved.about.includes('Architect'));
        assert.equal(p.extra().firm, fields.firm);
        assert.equal(p.extra().partner_role, 'Architect');
        assert.equal(p.extra().attribution.submission_path, route);
        if (activeProject) {
          assert.equal(p.extra().project_stage, 'Design / entitlement');
          assert.equal(p.extra().requested_amount, '2400000');
          assert.ok(saved.about.includes('Estimated completed value ($): 4900000'));
        }
        assert.equal(p.events.filter(event => event[1] === 'generate_lead').length, 1);
        assert.doesNotMatch(JSON.stringify([p.events, p.meta]), /Synthetic Architecture Studio|private@example.com|2400000|4900000/);
      }
    }
  }
});


test('blank or missing contact fields never submit or count as conversions', async () => {
  for (const options of [
    {fields:{name:'   '}}, {fields:{email:''}}, {fields:{email:'a @example.com'}},
    {missingFields:['name']}, {missingFields:['email']}
  ]) {
    const p = page(options); p.submit(); await flush();
    assert.equal(p.requests.length, 0);
    assert.equal(p.ads.length, 0);
    assert.equal(p.events.some(event => event[1] === 'generate_lead'), false);
  }
  const p = page({fields:{name:'',email:''}}); p.submit(); await flush();
  p.fields.name.value='Test Person'; p.fields.email.value='test@example.com';
  p.submit(); await flush();
  assert.equal(p.requests.length, 1);
  assert.equal(p.data().name, 'Test Person');
  assert.equal(p.ads.length, 1);
});

test('land development inquiries retain project details and Commercial classification without exposing them to analytics', async () => {
  for (const prefix of ['', 'es/']) {
    const route = '/' + prefix + 'commercial/land-development-loans';
    const html = readFileSync(prefix + 'commercial/land-development-loans.html', 'utf8');
    const formTag = html.match(/<form\b[^>]*data-sh-form=[^>]*>/)[0];
    const formAttrs = Object.fromEntries([...formTag.matchAll(/(data-sh-[\w-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
    const fields = { total_project_cost: '4800000', requested_amount: '3360000', project_value: '7000000',
      project_type: 'Land acquisition and development', property_owned: 'Under contract', timeline: '60-90 days',
      lot_count: '40', project_stage: 'Entitled, permits pending', builder_contracts: 'Builder discussions underway', exit_strategy: 'Sell finished lots' };
    for (const key of Object.keys(fields)) assert.ok(html.includes('name="' + key + '"'), `missing ${key} on ${route}`);
    const p = page({ url: 'https://stonehavencre.com' + route, referrer: 'https://www.google.com/', formAttrs, fields });
    p.submit(); await flush();
    assert.equal(p.data()['form-name'], 'lead');
    assert.equal(p.data().product, 'Commercial');
    assert.equal(p.data().page, 'commercial-land-development-loans');
    assert.equal(p.data().lang, prefix ? 'es' : 'en');
    for (const [key, value] of Object.entries(fields)) assert.equal(p.extra()[key], value);
    assert.equal(p.extra().attribution.submission_path, route);
    assert.equal(p.events.filter(event => event[1] === 'generate_lead').length, 1);
    assert.doesNotMatch(JSON.stringify([p.events, p.meta]), /4800000|3360000|7000000|Builder discussions underway|private@example.com/);
  }
});
