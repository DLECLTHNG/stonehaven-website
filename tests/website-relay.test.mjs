import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { handler } = require('../netlify/functions/submission-created.js');
const event = { body: JSON.stringify({payload:{id:'submission-123',form_name:'lead',data:{name:'Test Inquiry',email:'test@example.com',phone:'2025550123',product:'DSCR',page:'contact',lang:'en',about:'Synthetic test'}}}) };
function setup(t) {
 const old = {...process.env}; const fetch = global.fetch;
 process.env.WEBSITE_CRM_RELAY_ENABLED='1';
 process.env.WEBSITE_CRM_INTAKE_URL='https://crm.example.com/api/intake/website';
 process.env.WEBSITE_RELAY_SECRET='test-only-key-'.repeat(4);
 t.after(()=>{global.fetch=fetch;for(const k of ['WEBSITE_CRM_RELAY_ENABLED','WEBSITE_CRM_INTAKE_URL','WEBSITE_RELAY_SECRET']) {if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}});
}
test('saved lead is sent with a server credential and stable submission id',async t=>{
 setup(t);let captured;
 global.fetch=async (url,options)=>{captured={url,options};return new Response(JSON.stringify({status:'created',lead:{id:'lead-1'}}),{status:201});};
 assert.equal((await handler(event)).statusCode,200);
 assert.equal(captured.options.headers['X-Stonehaven-Relay-Key'],process.env.WEBSITE_RELAY_SECRET);
 assert.equal(JSON.parse(captured.options.body).submission_id,'submission-123');
 assert.equal(captured.options.redirect,'error');
});
test('disabled relay, unrelated forms and honeypots never call CRM',async t=>{
 setup(t);global.fetch=async()=>{throw new Error('Unexpected request');};
 process.env.WEBSITE_CRM_RELAY_ENABLED='0';assert.equal((await handler(event)).statusCode,204);
 process.env.WEBSITE_CRM_RELAY_ENABLED='1';
 for(const payload of [{id:'x',form_name:'other',data:{}},{id:'x',form_name:'lead',data:{company_website:'spam'}}]) assert.equal((await handler({body:JSON.stringify({payload})})).statusCode,204);
});
test('transient failure retries with the same id; duplicates are accepted',async t=>{
 setup(t);let calls=0;let ids=[];
 global.fetch=async(_,o)=>{ids.push(JSON.parse(o.body).submission_id);return ++calls===1?new Response('{}',{status:503}):new Response(JSON.stringify({status:'duplicate',lead:{id:'lead-1'}}));};
 assert.equal((await handler(event)).statusCode,200);assert.equal(calls,2);assert.deepEqual(ids,['submission-123','submission-123']);
});
test('CRM rejection and misleading 200 responses are observable failures',async t=>{
 setup(t);let calls=0;
 global.fetch=async()=>{calls++;return new Response('{}',{status:400});};
 await assert.rejects(handler(event),/HTTP 400/);assert.equal(calls,1);
 global.fetch=async()=>new Response(JSON.stringify({status:'error'}));
 await assert.rejects(handler(event),/CRM relay failed/);
});
test('invalid destination and missing key fail before sending contact information',async t=>{
 setup(t);global.fetch=async()=>{assert.fail('Must not send');};
 process.env.WEBSITE_CRM_INTAKE_URL='http://crm.example.com/api/intake/website';await assert.rejects(handler(event),/configuration/);
 process.env.WEBSITE_CRM_INTAKE_URL='https://crm.example.com/api/intake/website';process.env.WEBSITE_RELAY_SECRET='';await assert.rejects(handler(event),/configuration/);
});

test('Residential and Family inquiries stay in Forms and email by owner choice',async t=>{
 setup(t);global.fetch=async()=>{assert.fail('Residential must not be relayed');};
 for(const data of [{product:'Residential',page:'contact'},{product:'Not sure',page:'family-parents'},{product:'DSCR',page:'heloc-persona'},{product:'Not sure',page:'mortgage-calculator'}]) {
  assert.equal((await handler({body:JSON.stringify({payload:{id:'saved-123',form_name:'lead',data}})})).statusCode,204);
 }
});
