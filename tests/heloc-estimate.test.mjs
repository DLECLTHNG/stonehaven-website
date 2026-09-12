import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const math = require('../js/heloc-calc.js');
function fixture(lang = 'en') {
 const nodes = Object.fromEntries(['e-value','e-balance','e-request','cb-value','cb-balance','cb-amount','e-range','e-verdict','e-note','e-request-note'].map(id => [id,{value:'',dataset:{},textContent:'',listeners:{},addEventListener(event,fn){this.listeners[event]=fn;}}]));
 nodes['e-value'].value='450000';nodes['e-balance'].value='250000';
 const attrs={};const events=[];
 const form={setAttribute(k,v){attrs[k]=v;},removeAttribute(k){delete attrs[k];}};
 vm.runInNewContext(fs.readFileSync(new URL('../js/heloc-estimate.js',import.meta.url),'utf8'),{document:{documentElement:{lang},getElementById:id=>nodes[id],querySelector:()=>form},window:{SH_HELOC:math,shTrack:(...v)=>events.push(v)}});
 function input(id,value){nodes[id].value=value;nodes[id].listeners.input({target:nodes[id]});}
 return {nodes,attrs,events,input};
}
test('estimate does not count page load as calculator use and carries real input into the form',()=>{
 const f=fixture();assert.equal(f.events.length,0);assert.equal(f.nodes['cb-value'].value,'');
 f.input('e-request','60000');assert.equal(f.nodes['cb-amount'].value,'60000');assert.equal(f.nodes['cb-value'].value,'450000');
 assert.match(f.nodes['e-request-note'].textContent,/310,000/);assert.equal(f.events.length,1);
 f.input('cb-amount','55000');f.input('e-request','80000');assert.equal(f.nodes['cb-amount'].value,'55000');assert.equal(f.events.length,1);
 assert.deepEqual(Object.keys(f.events[0][1]),['page']);
});
test('zero mortgage is accepted, while cleared and negative estimates remove stale results',()=>{
 const f=fixture('es');f.input('e-balance','0');assert.equal(f.nodes['cb-balance'].value,'0');
 f.input('e-request','60000');f.input('e-request','');assert.equal(f.nodes['cb-amount'].value,'');
 f.input('e-value','');assert.equal(f.nodes['e-range'].textContent,'-');assert.equal(f.attrs['data-sh-about-prefix'],undefined);
 f.input('e-value','450000');f.input('e-balance','-1');assert.equal(f.nodes['e-range'].textContent,'-');
});
