import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync('js/chatgpt-pixel.js','utf8');
function fixture(attributes={},gpc=false){
 const scripts=[];
 const document={body:{getAttribute:k=>attributes[k]||null},head:{appendChild:s=>scripts.push(s)},createElement:()=>({})};
 const window={};
 const context={window,document,navigator:{globalPrivacyControl:gpc},Promise,Set,setTimeout:fn=>{const t=setTimeout(fn,1000);t.unref();return t;}};
 vm.runInNewContext(code,context);
 return {window,scripts,context};
}
test('pixel boots once and queues only the supported page and lead events',async()=>{
 const f=fixture();
 assert.equal(f.scripts.length,1);
 assert.equal(f.scripts[0].src,'https://bzrcdn.openai.com/sdk/oaiq.min.js');
 let q=f.window.oaiq.q.map(a=>Array.from(a));
 assert.equal(q[0][0],'init');assert.equal(q[0][1].pixelId,'Borm2tgLusLoFUMCjgiriD');assert.equal(q[0][1].debug,false);
 assert.equal(q[1][1],'page_viewed');
 const pending=f.window.shChatGPTLead('test-accepted-1');
 f.window.shChatGPTLead('test-accepted-1');
 q=f.window.oaiq.q.map(a=>Array.from(a));
 assert.equal(q.filter(a=>a[1]==='lead_created').length,1);
 assert.deepEqual(JSON.parse(JSON.stringify(q[2])),['measure','lead_created',{type:'customer_action'},{event_id:'test-accepted-1'}]);
 f.scripts[0].onload();await pending;
 vm.runInNewContext(code,f.context);assert.equal(f.scripts.length,1);
});
test('sensitive housing, confirmation pages and GPC never load the ad SDK',()=>{
 for(const [attrs,gpc] of [[{'data-fo-sensitive':'1'},false],[{'data-fo-kind':'confirm'},false],[{},true]]){
  const f=fixture(attrs,gpc);assert.equal(f.scripts.length,0);assert.equal(f.window.shChatGPTLead,undefined);
 }
});
test('an accepted event queued while local integration loads is drained once',async()=>{
 const f=fixture();let resolved=false;
 // Recreate the loader-to-integration handoff in a fresh context.
 const next={...f.context,window:{shChatGPTPending:[{id:'accepted-before-load',resolve:()=>{resolved=true}}]}};
 vm.runInNewContext(code,next);f.scripts[1].onload();await Promise.resolve();await Promise.resolve();
 assert.equal(next.window.oaiq.q.filter(a=>a[1]==='lead_created').length,1);
 assert.equal(resolved,true);
});
test('family conversions require accepted non-dry-run delivery on an ad-eligible page',()=>{
 const s=readFileSync('js/family-lp.js','utf8');
 assert.match(s,/res.status === 200 && j.ok && j.inquiry_id/);
 assert.match(s,/AD_TAGS_ALLOWED && !j.dry_run && window.shChatGPTLead/);
 assert.equal((s.match(/window.shChatGPTLead\(eid\)/g)||[]).length,1);
});
