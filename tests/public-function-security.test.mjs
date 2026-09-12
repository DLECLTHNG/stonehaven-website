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
  for(let i=0;i<8;i++) assert.equal((await capi.handler(event({event_name:'lead',event_id:'test-'+i},'192.0.2.62','agent-'+i))).statusCode,200);
  assert.equal((await capi.handler(event({event_name:'lead',event_id:'test-9'},'192.0.2.62','different-agent'))).statusCode,429);
});
