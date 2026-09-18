import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
function fixture(page,globalName,module) {
 const html=readFileSync(`${page}.html`,'utf8');
 const source=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes(`window.${globalName}`));
 const events=[],ready=[],nodes={};
 function node(value='') {return {value,style:{},handlers:{},addEventListener(type,fn){this.handlers[type]=fn}};}
 for(const tag of html.matchAll(/<input[^>]*id="([cs]-[^"]+)"[^>]*>/g)) {
  nodes[tag[1]]=node(tag[0].match(/value="([^"]*)"/)?.[1]);
 }
 for(const tag of html.matchAll(/<select[^>]*id="([cs]-[^"]+)"[^>]*>([\s\S]*?)<\/select>/g)) {
  nodes[tag[1]]=node(tag[2].match(/<option[^>]*value="([^"]*)"/)[1]);
 }
 const document={getElementById:id=>nodes[id]||(nodes[id]=node()),querySelector:()=>({setAttribute(){}}),addEventListener:(type,fn)=>{if(type==='DOMContentLoaded')ready.push(fn)}};
 const window={[globalName]:require(module),shTrack:(name,params)=>events.push({name,params})};
 vm.runInNewContext(source,{document,window});
 ready.forEach(fn=>fn({type:'DOMContentLoaded'}));
 return {nodes,events};
}

test('commercial calculator renders defaults but records use only after valid input',()=>{
 const {nodes,events}=fixture('commercial-loan-calculator','SH_CRE','../js/commercial-calc.js');
 assert.equal(nodes['r-loan'].textContent,'$2,100,000');
 assert.equal(events.length,0,'prefilled examples are not visitor engagement');
 nodes['c-noi'].value='0';nodes['c-noi'].handlers.input({type:'input'});
 assert.equal(events.length,0,'an invalid estimate is not a completed use');
 nodes['c-noi'].value='260000';nodes['c-noi'].handlers.input({type:'input'});
 nodes['c-value'].value='3500000';nodes['c-value'].handlers.input({type:'input'});
 assert.equal(events.length,1,'subsequent edits do not inflate usage');
 assert.deepEqual(JSON.parse(JSON.stringify(events)),[{name:'calc_used',params:{page:'commercial-loan-calculator'}}]);
});

test('SBA calculator excludes default rendering and invalid input, counting a program change once',()=>{
 const {nodes,events}=fixture('sba-loan-calculator','SH_SBA','../js/sba-calc.js');
 assert.equal(nodes['s-inj'].textContent,'$100,000 (10%)');
 assert.equal(events.length,0,'prefilled examples are not visitor engagement');
 nodes['s-cost'].value='0';nodes['s-cost'].handlers.input({type:'input'});
 assert.equal(events.length,0,'an invalid estimate is not a completed use');
 nodes['s-cost'].value='1000000';nodes['s-program'].value='7a';
 nodes['s-program'].handlers.change({type:'change'});
 nodes['s-cost'].value='1200000';nodes['s-cost'].handlers.input({type:'input'});
 assert.equal(events.length,1,'input and change events do not duplicate the interaction');
 assert.deepEqual(JSON.parse(JSON.stringify(events)),[{name:'calc_used',params:{page:'sba-loan-calculator'}}]);
});
