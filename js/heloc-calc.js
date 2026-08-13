/* ============================================================
   Stonehaven — deterministic HELOC math (dependency-free).
   Pure functions only: no DOM, no network, no LLM involvement.
   Documented on /calculation-methodology. Covered by
   tests/heloc-math.test.mjs — change formulas only with fixtures.
   Conventions:
   - Available line = home value × max CLTV% − current mortgage
     balance, floored at zero. CLTV cap is a user-adjustable
     estimate (lenders vary), never a promise.
   - Draw-period payment modeled as interest-only; repayment-period
     payment as full amortization of the drawn balance. Rates are
     annual percentages, always user estimates.
   ============================================================ */
(function (root) {
  "use strict";

  function availableEquity(homeValue, mortgageBalance, maxCltvPct) {
    if (!(homeValue > 0) || !(mortgageBalance >= 0) || !(maxCltvPct > 0)) return null;
    var maxTotal = homeValue * maxCltvPct / 100;
    return {
      maxTotal: maxTotal,
      available: Math.max(maxTotal - mortgageBalance, 0),
      currentEquity: Math.max(homeValue - mortgageBalance, 0)
    };
  }

  function interestOnlyPayment(balance, annualRatePct) {
    if (!(balance > 0) || !(annualRatePct >= 0)) return NaN;
    return balance * annualRatePct / 100 / 12;
  }

  function repaymentPayment(balance, annualRatePct, repayYears) {
    if (!(balance > 0) || !(annualRatePct >= 0) || !(repayYears > 0)) return NaN;
    var i = annualRatePct / 100 / 12;
    var n = repayYears * 12;
    if (i === 0) return balance / n;
    return balance * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
  }

  var api = {
    availableEquity: availableEquity,
    interestOnlyPayment: interestOnlyPayment,
    repaymentPayment: repaymentPayment
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SH_HELOC = api;
})(typeof window !== "undefined" ? window : globalThis);
