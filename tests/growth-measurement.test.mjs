import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('js/funnel.js','utf8');
function fixture(fetchImpl, options={}) {
 const events=[],meta=[],chatgpt=[],handlers={},documentHandlers={};
 const fields=Object.fromEntries(Object.entries({name:'Test Person',email:'private@example.com',phone:'2025550123',company_website:''}).map(([name,value])=>[name,{name,value,type:'text',style:{},hasAttribute:()=>true,addEventListener(){}}]));
 const productHandlers={};
 if(options.selectName) fields[options.selectName]={name:options.selectName,value:options.product||'Commercial',type:'select-one',style:{},addEventListener:(k,f)=>{productHandlers[k]=f}};
 const button={disabled:false,style:{}};
 const attributes={'data-sh-form':options.page||'contact','data-sh-product':options.product||'DSCR'};
 const form={id:'test',elements:Object.values(fields),style:{},getAttribute:k=>attributes[k]||null,setAttribute:(k,v)=>{attributes[k]=v},hasAttribute:()=>false,addEventListener:(k,f)=>{handlers[k]=f},querySelector:s=>s==='[type="submit"]'?button:fields[s.match(/name="([^"]+)"/)?.[1]]||null,querySelectorAll:()=>Object.values(fields),parentElement:{querySelector:()=>({classList:{add(){}}})}};
 const document={head:{appendChild(){}},documentElement:{lang:options.lang||'en'},createElement:()=>({style:{},setAttribute(){}}),addEventListener:(k,f)=>{documentHandlers[k]=f},querySelectorAll:s=>s==='form[data-sh-form]'?[form]:[],getElementById:()=>null};
 const window={shChatGPTLead:id=>chatgpt.push(id),SH_CONFIG:{},location:{search:'?utm_source=google&utm_medium=cpc&utm_campaign=ga_dscr',pathname:'/contact',href:'https://stonehavencre.com/contact'},gtag:(...a)=>events.push(a),fbq:(...a)=>meta.push(a),addEventListener(){}};
 const storage=new Map();
 vm.runInNewContext(source,{document,window,sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},URLSearchParams,fetch:fetchImpl,setTimeout,clearTimeout,AbortController,IntersectionObserver:class{observe(){}},console});
 documentHandlers.DOMContentLoaded();
 return {events,meta,chatgpt,form,fields,button,select:(value,dispatch=true)=>{fields[options.selectName].value=value;if(dispatch)productHandlers.change()},submit:()=>handlers.submit({preventDefault(){}}),click:()=>documentHandlers.click({target:{closest:()=>({})}})};
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
 assert.equal(f.chatgpt.length,1);
 assert.equal(f.chatgpt[0],f.meta.find(e=>e[1]==='Lead')[3].eventID);
 assert.equal(JSON.parse(requests[0].get('extra')).utm.utm_medium,'cpc');
 assert.equal(JSON.stringify(f.events).includes('private@example.com'),false);
 f.click();assert.equal(f.events.filter(e=>e[1]==='phone_click').length,1);
});
test('failed delivery produces no conversion and permits retry',async()=>{
 let ok=false;const f=fixture(async()=>({ok}));
 // Supply the existing accessible error element, without requiring HTML parsing.
 f.form.querySelector=((original)=>s=>s==='.lead-error'?{textContent:'',style:{}}:original(s))(f.form.querySelector);
 f.submit();await flush();assert.equal(f.events.filter(e=>e[1]==='generate_lead').length,0);assert.equal(f.chatgpt.length,0);assert.equal(f.button.disabled,false);
 ok=true;f.submit();await flush();assert.equal(f.events.filter(e=>e[1]==='generate_lead').length,1);assert.equal(f.chatgpt.length,1);
});
test('honeypot submissions never produce conversions or network traffic',()=>{
 const f=fixture(()=>{throw new Error('must not submit')});f.fields.company_website.value='bot';f.submit();assert.equal(f.events.length,0);assert.equal(f.chatgpt.length,0);
});
for(const path of ['commercial.html','sba.html','es/commercial.html','es/sba.html']) {
 test(`${path}: chosen financing type reaches the saved lead and GA4`,async()=>{
  const html=readFileSync(path,'utf8');
  const product=html.match(/data-sh-product="([^"]+)"/)[1];
  const page=html.match(/data-sh-form="([^"]+)"/)[1];
  const selectName=html.match(/<select[^>]*name="(product(?:_choice)?)"/)[1];
  const lang=html.match(/<html[^>]*lang="([^"]+)"/)[1];
  const requests=[];
  const f=fixture(async(url,opts)=>{requests.push(new URLSearchParams(opts.body));return {ok:true}},{product,page,selectName,lang});
  // Cover a regular change, then a browser-restored value at submit time.
  f.select(product==='SBA'?'Commercial':'SBA');
  f.select('DSCR',false);
  f.submit();await flush();
  assert.equal(requests[0].get('product'),'DSCR');
  assert.equal(requests[0].get('page'),page);
  assert.equal(JSON.parse(requests[0].get('extra'))[selectName],'DSCR');
  assert.equal(f.events.find(e=>e[1]==='generate_lead')[2].product,'DSCR');
  assert.equal(f.events.find(e=>e[1]==='generate_lead')[2].language,lang);
 });
}
test('fixed product forms and unsupported selector values preserve their configured lane',async()=>{
 for(const options of [{product:'Residential'},{product:'Commercial',selectName:'product'}]) {
  const requests=[];
  const f=fixture(async(url,opts)=>{requests.push(new URLSearchParams(opts.body));return {ok:true}},options);
  if(options.selectName)f.select('unsupported');
  f.submit();await flush();
  assert.equal(requests[0].get('product'),options.product);
 }
});
test('the existing home-loan choice still routes as Residential',async()=>{
 const requests=[];
 const f=fixture(async(url,opts)=>{requests.push(new URLSearchParams(opts.body));return {ok:true}},{product:'Not sure',selectName:'product_choice'});
 f.select('Residential');f.submit();await flush();
 assert.equal(requests[0].get('product'),'Residential');
 assert.equal(f.events.find(e=>e[1]==='generate_lead')[2].product,'Residential');
});
