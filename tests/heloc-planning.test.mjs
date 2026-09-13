import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const M=createRequire(import.meta.url)('../js/heloc-planning-math.js');
const base={amount:50000,rate:9,drawMonths:120,repayMonths:120,horizon:240,fees:1000,financeFees:false,changeMonth:600,laterRate:9};
const near=(a,b)=>assert.ok(Math.abs(a-b)<0.01,`${a} != ${b}`);
test('amortization, zero rates and full payoff reconcile',()=>{
 near(M.payment(100000,6,360),599.55);near(M.payment(1200,0,12),100);
 const x=M.simulate(base);near(x.firstPayment,375);near(x.firstRepayment,M.payment(50000,9,120));near(x.balance,0);near(x.paid,50000+x.interest);near(x.totalCommitmentAtHorizon,50000+x.cost);
 near(M.payment(1200,1e-12,12),100);
});
test('rate shocks, financed fees and remaining debt appear at a shared horizon',()=>{
 const a=M.simulate({...base,horizon:12}),b=M.simulate({...base,horizon:12,changeMonth:7,laterRate:12});
 near(a.balance,50000);near(b.interest,5250);assert.equal(a.firstRepayment,null);
 const c=M.simulate({...base,horizon:12,financeFees:true});near(c.balance,51000);near(c.upfront,0);near(c.totalCommitmentAtHorizon,50000+c.cost);
 assert.ok(b.cost>a.cost);assert.ok(M.simulate({...base,amount:1e8,fees:1e7,financeFees:true}).paid>0);
});
test('invalid assumptions fail and project funding gaps are explicit',()=>{
 for(const changes of [{amount:NaN},{rate:Infinity},{drawMonths:-1},{horizon:1.5},{repayMonths:0}]) assert.throws(()=>M.simulate({...base,...changes}));
 assert.deepEqual(M.plan([10000,20000,5000,5000],15000,30000),{total:40000,now:10000,later:30000,gap:10000,unusedInitial:5000,initialShortfall:0,initialExceedsLimit:false});
 assert.equal(M.plan([10,0,0,0],20,15).initialExceedsLimit,true);
});
test('growth collection preserves bilingual content, private tools and residential intake',()=>{
 const articles=JSON.parse(readFileSync('docs/heloc-growth/articles.json','utf8'));assert.equal(articles.length,24);
 for(const lang of ['', 'es/']) {
  const tools=readFileSync(lang+'heloc-planning-tools.html','utf8');
  for(const id of ['offers','payments','project'])assert.ok(tools.includes(`id="${id}"`));
  assert.doesNotMatch(tools,/facebook\.com|googletagmanager|site-config\.js|funnel\.js/);
  for(const a of articles)assert.ok(readFileSync(lang+'blog/'+a.slug+'.html','utf8').includes('/'+lang+'heloc-planning-tools#'));
  for(const slug of ['compare-offers','paid-off-home','repayment-review']){
   const page=readFileSync(lang+'heloc/'+slug+'.html','utf8');assert.match(page,/name="robots" content="noindex,follow"/);assert.match(page,/data-sh-product="Residential"/);assert.ok(page.includes(`name="growth_topic" value="${slug}"`));
  }
 }
});
