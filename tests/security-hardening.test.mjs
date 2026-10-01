import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import protect, {config} from '../netlify/edge-functions/protect-lead-api.js';
import {config as formConfig} from '../netlify/edge-functions/validate-lead.js';
const origin='https://stonehavencre.com';
const request=(path='lead-capi',headers={},body='{}')=>new Request(origin+'/.netlify/functions/'+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body});
test('lead API edge refuses browser forgery, unsupported media and oversized streams before the handler',async()=>{
 let calls=0;const context={next:async()=>{calls++;return new Response('{}');}};
 for(const name of ['lead-capi','family-inquiry']) {
  for(const [headers,status] of [[{Origin:'https://attacker.invalid'},403],[{Origin:'null'},403],[{Origin:''},403],[{'Sec-Fetch-Site':'cross-site'},403],[{'Content-Type':'text/plain'},415],[{'Content-Encoding':'gzip'},415],[{'Content-Length':'999999'},413]]) {
   const r=await protect(request(name,headers),context);assert.equal(r.status,status);assert.equal(r.headers.get('x-content-type-options'),'nosniff');
  }
  const r=await protect(request(name,{},'x'.repeat(32769)),context);assert.equal(r.status,413);
 }
 assert.equal((await protect(new Request(origin+'/.netlify/functions/lead-capi'),context)).status,405);
 assert.equal(calls,0);
});
test('edge keeps valid JSON bodies intact and secures success and error responses',async()=>{
 for(const name of ['lead-capi','family-inquiry']) for(const status of [200,422,502]) {
  const req=request(name,{},'{"name":"Synthetic Test"}');
  const response=await protect(req,{next:async()=>{assert.equal(req.bodyUsed,false);assert.deepEqual(await req.json(),{name:'Synthetic Test'});return new Response('{"ok":false}',{status});}});
  assert.equal(response.status,status);assert.match(response.headers.get('cache-control'),/no-store/);assert.equal(response.headers.get('referrer-policy'),'no-referrer');
 }
 assert.equal(await protect(new Request(origin+'/api/heloc-application'),{}),undefined);
 for(const c of [config,formConfig])assert.deepEqual(c.rateLimit.aggregateBy,['ip','domain']);
});
function storage(){const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
function draft(){
 const source=readFileSync('js/dscr-review.js','utf8');
 const fields={'r-value':{value:''},'r-email':{value:''}};
 const context={sessionStorage:storage(),localStorage:storage(),SAFE_SAVE:['r-value'],$:id=>fields[id],Date};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf('  var DRAFT_KEY'),source.indexOf('  /* internal-only lead classification')),context);
 return {...context,fields};
}
test('DSCR drafts never persist in local storage and expire after 30 minutes',()=>{
 const f=draft();f.fields['r-value'].value='350000';f.fields['r-email'].value='private@example.com';f.saveProgress();
 const saved=f.sessionStorage.getItem('sh_dscr_review_session');assert.equal(saved.includes('private@example.com'),false);assert.equal(f.localStorage.getItem('sh_dscr_review'),null);
 f.fields['r-value'].value='';f.restoreProgress();assert.equal(f.fields['r-value'].value,'350000');
 f.sessionStorage.setItem('sh_dscr_review_session',JSON.stringify({savedAt:Date.now()-31*60*1000,fields:{'r-value':'old'}}));f.fields['r-value'].value='';f.restoreProgress();assert.equal(f.fields['r-value'].value,'');assert.equal(f.sessionStorage.getItem('sh_dscr_review_session'),null);
});
test('DSCR restore deletes legacy persistent drafts and cannot restore contact fields',()=>{
 const f=draft();f.localStorage.setItem('sh_dscr_review','{"r-value":"old"}');
 f.sessionStorage.setItem('sh_dscr_review_session',JSON.stringify({savedAt:Date.now(),fields:{'r-value':'400000','r-email':'injected@example.com'}}));f.restoreProgress();
 assert.equal(f.localStorage.getItem('sh_dscr_review'),null);assert.equal(f.fields['r-value'].value,'400000');assert.equal(f.fields['r-email'].value,'');
});
