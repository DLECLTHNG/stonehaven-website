import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('js/funnel.js','utf8');
function fixture(fetchImpl) {
 const events=[],meta=[],handlers={},documentHandlers={};
 const fields=Object.fromEntries(Object.entries({name:'Test Person',email:'private@example.com',phone:'2025550123',company_website:''}).map(([name,value])=>[name,{name,value,type:'text',style:{},hasAttribute:()=>true,addEventListener(){}}]));
 const button={disabled:false,style:{}};
 const form={id:'test',elements:Object.values(fields),style:{},getAttribute:k=>({'data-sh-form':'contact','data-sh-product':'DSCR'}[k]||null),hasAttribute:()=>false,addEventListener:(k,f)=>{handlers[k]=f},querySelector:s=>s==='[type="submit"]'?button:fields[s.match(/name="([^"]+)"/)?.[1]]||null,querySelectorAll:()=>Object.values(fields),parentElement:{querySelector:()=>({classList:{add(){}}})}};
 const document={head:{appendChild(){}},documentElement:{lang:'en'},createElement:()=>({style:{},setAttribute(){}}),addEventListener:(k,f)=>{documentHandlers[k]=f},querySelectorAll:s=>s==='form[data-sh-form]'?[form]:[],getElementById:()=>null};
 const window={SH_CONFIG:{},location:{search:'?utm_source=google&utm_medium=cpc&utm_campaign=ga_dscr',pathname:'/contact',href:'https://stonehavencre.com/contact'},gtag:(...a)=>events.push(a),fbq:(...a)=>meta.push(a),addEventListener(){}};
 const storage=new Map();
 vm.runInNewContext(source,{document,window,sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},URLSearchParams,fetch:fetchImpl,setTimeout,clearTimeout,AbortController,IntersectionObserver:class{observe(){}},console});
 documentHandlers.DOMContentLoaded();
 return {events,meta,form,fields,button,submit:()=>handlers.submit({preventDefault(){}}),click:()=>documentHandlers.click({target:{closest:()=>({})}})};
}
const flush=()=>new Promise(r=>setImmediate(r));
test('one accepted inquiry produces one GA4 lead and retains private attribution only in the submission',async()=>{
 const requests=[]; let accept;
 const f=fixture((url,opts)=>{requests.push(new URLSearchParams(opts.body));return new Promise(r=>{accept=r})});
 f.submit();f.submit();assert.equal(requests.length,1,'double clicks cannot send duplicate inquiries');
 assert.equal(f.events.filter(e=>e[1]==='generate_lead').length,0);
 accept({ok:true});await flush();
 const leads=f.events.filter(e=>e[1]==='generate_lead');assert.equal(leads.length,1);
 assert.deepEqual(JSON.parse(JSON.stringify(leads[0][2])),{form_id:'contact',product:'DSCR',language:'en'});
 assert.equal(f.meta.filter(e=>e[1]==='Lead').length,1);
 assert.equal(JSON.parse(requests[0].get('extra')).utm.utm_medium,'cpc');
 assert.equal(JSON.stringify(f.events).includes('private@example.com'),false);
 f.click();assert.equal(f.events.filter(e=>e[1]==='phone_click').length,1);
});
test('failed delivery produces no conversion and permits retry',async()=>{
 let ok=false;const f=fixture(async()=>({ok}));
 // Supply the existing accessible error element, without requiring HTML parsing.
 f.form.querySelector=((original)=>s=>s==='.lead-error'?{textContent:'',style:{}}:original(s))(f.form.querySelector);
 f.submit();await flush();assert.equal(f.events.filter(e=>e[1]==='generate_lead').length,0);assert.equal(f.button.disabled,false);
 ok=true;f.submit();await flush();assert.equal(f.events.filter(e=>e[1]==='generate_lead').length,1);
});
test('honeypot submissions never produce conversions or network traffic',()=>{
 const f=fixture(()=>{throw new Error('must not submit')});f.fields.company_website.value='bot';f.submit();assert.equal(f.events.length,0);
});
