import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync('js/heloc-topic-context.js','utf8');
function run({query='',article='',hrefs=['/heloc-planning-tools#payments','/heloc#callback','/es/heloc/paid-off-home','https://outside.example/heloc','/privacy']}={}){
 const links=hrefs.map(href=>({href,getAttribute(){return this.href;},setAttribute(k,v){this.href=v;}}));
 const form={input:null,querySelector(){return this.input;},appendChild(input){this.input=input;}};
 vm.runInNewContext(code,{URL,URLSearchParams,window:{location:{origin:'https://stonehavencre.com',href:'https://stonehavencre.com/heloc-planning-tools'+query,search:query}},document:{documentElement:{getAttribute(k){return k==='data-heloc-topics'?'compare-heloc-offers,heloc-paid-off-home':article;}},querySelectorAll(s){return s==='a[href]'?links:[form];},createElement(){return {};}}});
 return {links:links.map(x=>x.href),input:form.input};
}
test('public article topic survives tool and language navigation into intake without financial data',()=>{
 const x=run({query:'?article_topic=heloc-paid-off-home&home_value=999999&email=private%40example.com'});
 assert.equal(x.input.name,'article_topic');assert.equal(x.input.value,'heloc-paid-off-home');
 assert.equal(x.links[0],'/heloc-planning-tools?article_topic=heloc-paid-off-home#payments');
 assert.equal(x.links[2],'/es/heloc/paid-off-home?article_topic=heloc-paid-off-home');
 assert.equal(x.links[3],'https://outside.example/heloc');assert.equal(x.links[4],'/privacy');assert.doesNotMatch(x.links.join(' '),/999999|private/);
});
test('unknown and malicious topic values are ignored; current article takes precedence',()=>{
 for(const query of ['', '?article_topic=unknown','?article_topic=%3Cscript%3E'])assert.equal(run({query}).input,null);
 assert.equal(run({query:'?article_topic=heloc-paid-off-home',article:'compare-heloc-offers'}).input.value,'compare-heloc-offers');
 assert.doesNotMatch(code,/fetch\(|localStorage|sessionStorage|sendBeacon|document\.cookie/);
});
