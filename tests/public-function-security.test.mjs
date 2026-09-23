import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { allowedOrigin } = require('../netlify/functions/lib/request-security.js');
const capi = require('../netlify/functions/lead-capi.js');
const family = require('../netlify/functions/family-inquiry.js');
const event = (body, ip='192.0.2.61', ua='test') => ({httpMethod:'POST',headers:{origin:'https://stonehavencre.com','x-nf-client-connection-ip':ip,'user-agent':ua},body:JSON.stringify(body)});
test('origins require exact HTTPS site or explicitly configured deploy', () => {
  delete process.env.NETLIFY_DEV;
  assert.equal(allowedOrigin('https://stonehavencre.com'), true);
  for (const o of [undefined,'null','https://foreign.netlify.app','http://stonehavencre.com','https://stonehavencre.com:444','https://stonehavencre.com/','http://localhost:8126']) assert.equal(allowedOrigin(o), false, String(o));
  process.env.DEPLOY_PRIME_URL='https://specific-preview.netlify.app';
  assert.equal(allowedOrigin(process.env.DEPLOY_PRIME_URL), true);
  delete process.env.DEPLOY_PRIME_URL;
});
test('public functions reject foreign and absent origins without external calls', async () => {
  for (const fn of [capi, family]) for (const origin of [undefined, 'https://foreign.netlify.app']) {
    const e=event({});e.headers.origin=origin;
    assert.equal((await fn.handler(e)).statusCode,403);
  }
});
test('byte limits reject oversized Unicode and encoded payloads before parsing', async () => {
  assert.equal((await capi.handler(event({text:'🙂'.repeat(5000)}))).statusCode,413);
  assert.equal((await family.handler(event({text:'🙂'.repeat(9000)}))).statusCode,413);
  assert.equal((await capi.handler({...event({}),isBase64Encoded:true})).statusCode,413);
});
test('prototype property names cannot become Meta conversion events', async () => {
  for (const name of ['constructor','toString','__proto__']) assert.equal((await capi.handler(event({event_name:name,event_id:'test'}))).statusCode,400);
});
test('changing user agent does not reset an IP rate limit', async () => {
  delete process.env.META_CAPI_TOKEN;delete process.env.CRM_WEBHOOK_URL;
  for(let i=0;i<8;i++) assert.equal((await capi.handler(event({event_name:'lead',event_id:'test-'+i,payload:{name:'Test Person',email:'test@example.com'}},'192.0.2.62','agent-'+i))).statusCode,200);
  assert.equal((await capi.handler(event({event_name:'lead',event_id:'test-9'},'192.0.2.62','different-agent'))).statusCode,429);
});


test('CAPI and optional CRM webhook reject missing contacts and below-minimum HELOCs before delivery', async t => {
  const previous = global.fetch; t.after(() => { global.fetch = previous; });
  global.fetch = async () => { assert.fail('Invalid lead must not be delivered'); };
  for (const payload of [{}, {name:'',email:'test@example.com'}, {name:'Test Person',email:''},
    {name:'Test Person',email:'test@example.com',page:'heloc-wizard-save',extra:{home_value:'400000',mortgage_balance:'0',requested_amount:'49999',credit_band:'659-640'}}]) {
    const response = await capi.handler(event({event_name:'lead',event_id:'invalid-contact',payload},'192.0.2.92'));
    assert.equal(response.statusCode, 422);
  }
});

test('HELOC CAPI validation survives event aliases and payload sanitization', async t => {
  const previous = global.fetch, token = process.env.META_CAPI_TOKEN, webhook = process.env.CRM_WEBHOOK_URL;
  t.after(() => { global.fetch = previous; for (const [key, value] of [['META_CAPI_TOKEN', token], ['CRM_WEBHOOK_URL', webhook]]) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
  delete process.env.META_CAPI_TOKEN;
  process.env.CRM_WEBHOOK_URL = 'https://crm.example.com/lead';
  let calls = 0;
  global.fetch = async () => { calls++; return new Response('{}'); };
  const payload = { name: 'Test Person', email: 'test@example.com', page: 'heloc-callback', extra: { home_value: '400000', mortgage_balance: '0', requested_amount: '50000', credit_band: '659-640' } };
  const rejected = [
    { payload: { ...payload, credit_score: '639' } },
    { payload: { ...payload, requested_amount: '49999' } },
    { payload: { name: payload.name, email: payload.email, product_choice: 'HELOC' } },
    { payload: { ...payload, extra: { ...payload.extra, credit_band: 'not-sure' } } },
    { payload: { ...payload, extra: { ...payload.extra, credit_band: undefined } } },
    { event_name: 'heloc_callback', payload: { name: payload.name, email: payload.email } },
  ];
  for (const body of rejected) {
    assert.equal((await capi.handler(event({ event_name: 'lead', event_id: 'threshold-test', ...body }, '192.0.2.111'))).statusCode, 422);
  }
  assert.equal(calls, 0, 'no advertising or CRM delivery for rejected requests');
  assert.equal((await capi.handler(event({ event_name: 'heloc_callback', event_id: 'threshold-boundary', payload }, '192.0.2.112'))).statusCode, 200);
  assert.equal(calls, 1, 'an eligible HELOC is delivered');
});

test('the generic advertising relay cannot accept Family or disability page context', async t => {
  const oldFetch = global.fetch;
  t.after(() => { global.fetch = oldFetch; });
  global.fetch = async () => { assert.fail('Family context must not be sent by the generic advertising relay'); };
  const payload = {name:'Test Person',email:'test@example.com',page:'contact'};
  for (const body of [
    {source_url:'https://stonehavencre.com/buy-a-home-for-parents'},
    {source_url:'https://stonehavencre.com/family-home-financing'},
    {source_url:'https://stonehavencre.com/request-received'},
    {payload:{...payload,page:'family-adult-child'}},
    {payload:{...payload,extra:{lp_variant:'family-parents'}}}
  ]) {
    const response = await capi.handler(event({event_name:'lead',event_id:'privacy-check',payload,...body}, '192.0.2.101'));
    assert.equal(response.statusCode, 204);
  }
});

test('commercial multifamily remains eligible for the generic relay without exposing raw contact details to Meta', async t => {
  const oldFetch=global.fetch, token=process.env.META_CAPI_TOKEN, webhook=process.env.CRM_WEBHOOK_URL;
  t.after(() => {global.fetch=oldFetch;for(const [key,value] of [['META_CAPI_TOKEN',token],['CRM_WEBHOOK_URL',webhook]]) {if(value===undefined)delete process.env[key];else process.env[key]=value;}});
  process.env.META_CAPI_TOKEN='test-only'; delete process.env.CRM_WEBHOOK_URL;
  let sent;
  global.fetch=async (_url,options) => {sent=JSON.parse(options.body);return {ok:true};};
  const response=await capi.handler(event({event_name:'lead',event_id:'multifamily-check',source_url:'https://stonehavencre.com/commercial/multifamily',payload:{name:'Test Person',email:'test@example.com',product:'Commercial',page:'commercial-multifamily'}},'192.0.2.108'));
  assert.equal(response.statusCode,200);
  assert.equal(sent.data[0].event_source_url,'https://stonehavencre.com/commercial/multifamily');
  assert.equal(JSON.stringify(sent).includes('test@example.com'),false);
});

function familySetup(t) {
  const keys = ['FAMILY_DRY_RUN','NETLIFY_DEV','FAMILY_CRM_INTAKE_URL','URL','FAMILY_CAPI_PARENTS_PAGE','META_CAPI_TOKEN'];
  const saved = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const oldFetch = global.fetch;
  t.after(() => { global.fetch = oldFetch; for (const key of keys) { if(saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key]; } });
  for (const key of keys) delete process.env[key];
  process.env.URL = 'https://stonehavencre.com';
  return {page:'family-parents',name:'Test Person',email:'test@example.com',phone:'4705551401',state:'GA',event_id:'family-private-check'};
}

test('Family storage blocks redirects and keeps the Meta credential out of URLs', async t => {
  const payload = familySetup(t), calls = [];
  process.env.FAMILY_CAPI_PARENTS_PAGE = '1';
  process.env.META_CAPI_TOKEN = 'test-only-token';
  global.fetch = async (url, options) => { calls.push({url,options}); return {ok:true}; };
  assert.equal((await family.handler(event(payload,'192.0.2.102'))).statusCode, 200);
  assert.equal(calls.length, 2);
  for (const {url,options} of calls) {
    assert.equal(options.redirect,'error');
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(url.includes('test-only-token'),false);
  }
  assert.equal(JSON.parse(calls[1].options.body).access_token,'test-only-token');
  process.env.FAMILY_CRM_INTAKE_URL = 'https://crm.example.com/api/intake/website';
  calls.length = 0;
  assert.equal((await family.handler(event({...payload,phone:'4705551402'},'192.0.2.103'))).statusCode, 200);
  assert.equal(calls[0].options.redirect,'error');
  assert.equal(calls[0].url,process.env.FAMILY_CRM_INTAKE_URL);
});

test('Family rejects insecure destinations and production dry-run before false success', async t => {
  const payload = familySetup(t);
  payload.phone = '4705551403';
  global.fetch = async () => { assert.fail('Unsafe configuration must not send personal data'); };
  for (const destination of ['http://crm.example.com/lead', 'https://name:password@crm.example.com/lead']) {
    process.env.FAMILY_CRM_INTAKE_URL = destination;
    assert.equal((await family.handler(event(payload,'192.0.2.104'))).statusCode,502);
  }
  delete process.env.FAMILY_CRM_INTAKE_URL;
  process.env.URL = 'http://stonehavencre.com';
  assert.equal((await family.handler(event(payload,'192.0.2.104'))).statusCode,502);
  process.env.FAMILY_DRY_RUN = '1';
  assert.equal((await family.handler(event(payload,'192.0.2.104'))).statusCode,502);
});

test('Family server and CAPI reject invisible contacts before any external delivery', async t => {
  const payload = familySetup(t);
  global.fetch = async () => { assert.fail('Invalid contact must not leave the server'); };
  for (const change of [{name:'\u200b\u200c'},{email:'test\u0000@example.com'},{email:'test@example..com'}]) {
    assert.equal((await family.handler(event({...payload,...change},'192.0.2.105'))).statusCode,400);
    assert.equal((await capi.handler(event({event_name:'lead',event_id:'invalid-invisible',payload:{...payload,page:'contact',...change}},'192.0.2.106'))).statusCode,422);
  }
});

test('optional CRM webhook never sends lead data to an insecure URL', async t => {
  const oldFetch = global.fetch, token = process.env.META_CAPI_TOKEN, webhook = process.env.CRM_WEBHOOK_URL;
  t.after(() => { global.fetch=oldFetch; for(const [key,value] of [['META_CAPI_TOKEN',token],['CRM_WEBHOOK_URL',webhook]]) {if(value === undefined) delete process.env[key]; else process.env[key]=value;} });
  delete process.env.META_CAPI_TOKEN;
  process.env.CRM_WEBHOOK_URL='http://crm.example.com/lead';
  global.fetch=async () => { assert.fail('Must not send a lead over HTTP'); };
  assert.equal((await capi.handler(event({event_name:'lead',event_id:'url-check',payload:{name:'Test Person',email:'test@example.com'}},'192.0.2.107'))).statusCode,503);
});
