/* Educational cost/value sizing. Assumptions are supplied by the visitor,
   not program limits. No cash-out or automatic increase for an overrun. */
(function (root) {
  'use strict';
  function size(p) {
    var keys = ['land', 'payoff', 'hard', 'soft', 'contingency', 'finance', 'excluded', 'value', 'ltc', 'ltv'];
    if (!p || !['owned', 'purchase'].includes(p.mode) || keys.some(function (k) {
      return typeof p[k] !== 'number' || !Number.isFinite(p[k]) || p[k] < 0;
    }) || p.value < 1 || p.ltc < 0.1 || p.ltc > 100 || p.ltv < 0.1 || p.ltv > 100) return null;
    var remaining = p.hard + p.soft + p.contingency + p.finance;
    var cost = p.land + remaining;
    if (cost <= 0 || !Number.isFinite(cost)) return null;
    var debt = p.mode === 'owned' ? p.payoff : 0;
    var need = (p.mode === 'owned' ? debt : p.land) + remaining;
    if (!Number.isFinite(need + p.excluded)) return null;
    var byCost = cost * p.ltc / 100, byValue = p.value * p.ltv / 100;
    var loan = Math.min(byCost, byValue, need);
    var gap = Math.max(0, need - loan) + p.excluded;
    return {cost: cost, remaining: remaining, need: need, byCost: byCost, byValue: byValue,
      loan: loan, gap: gap, landEquity: p.mode === 'owned' ? p.land - debt : 0,
      ltc: loan / cost * 100, ltv: loan / p.value * 100,
      binding: need <= byCost && need <= byValue ? 'need' : byCost <= byValue ? 'cost' : 'value'};
  }
  function stress(p, hardIncrease, valueDrop) {
    var base = size(p);
    if (!base || !Number.isFinite(hardIncrease) || hardIncrease < 0 || !Number.isFinite(valueDrop) || valueDrop < 0 || valueDrop >= 1) return null;
    var extra = p.hard * hardIncrease;
    var loan = Math.min(base.loan, p.value * (1 - valueDrop) * p.ltv / 100);
    return {loan: loan, gap: Math.max(0, base.need + extra - loan) + p.excluded};
  }
  var api = {size: size, stress: stress};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SH_CONSTRUCTION = api;
})(typeof window !== 'undefined' ? window : globalThis);
