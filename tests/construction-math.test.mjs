import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const C = createRequire(import.meta.url)('../js/construction-math.js');
const base = {mode:'owned',land:400000,payoff:0,hard:1200000,soft:200000,contingency:100000,finance:100000,excluded:0,value:3000000,ltc:75,ltv:65};
test('owned land is counted once, with cash uses distinct from cost basis', () => {
  const r=C.size(base); assert.equal(r.cost,2000000); assert.equal(r.loan,1500000); assert.equal(r.gap,100000); assert.equal(r.landEquity,400000);
  const debt=C.size({...base,payoff:200000}); assert.equal(debt.cost,2000000); assert.equal(debt.gap,300000); assert.equal(debt.landEquity,200000);
  const purchase=C.size({...base,mode:'purchase',payoff:200000}); assert.equal(purchase.need,2000000); assert.equal(purchase.gap,500000); assert.equal(purchase.landEquity,0);
});
test('value limit, excluded costs and no-cash-out cap can each constrain proceeds', () => {
  const r=C.size({...base,value:2000000,excluded:50000}); assert.equal(r.loan,1300000); assert.equal(r.gap,350000); assert.equal(r.binding,'value');
  const fullyFunded=C.size({...base,ltc:100}); assert.equal(fullyFunded.loan,1600000); assert.equal(fullyFunded.gap,0); assert.equal(fullyFunded.ltc,80); assert.equal(fullyFunded.binding,'need');
  assert.equal(C.size({...base,payoff:500000}).landEquity,-100000);
});
test('stress test never assumes extra debt for extra costs', () => {
  assert.deepEqual(C.stress(base,0.1,0),{loan:1500000,gap:220000});
  assert.deepEqual(C.stress({...base,value:2200000},0.1,0.1),{loan:1287000,gap:433000});
});
test('invalid and incomplete assumptions do not produce reassuring estimates', () => {
  for(const patch of [{land:NaN},{value:0},{hard:-1},{ltc:101},{ltv:0},{ltv:0.05},{mode:'other'},{finance:Infinity},{soft:''},{hard:Number.MAX_VALUE,soft:Number.MAX_VALUE}])assert.equal(C.size({...base,...patch}),null);
  assert.equal(C.stress(base,0,1),null); assert.equal(C.stress(base,-1,0),null);
});
