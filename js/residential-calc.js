/* ============================================================
   Stonehaven — deterministic residential mortgage math
   (dependency-free). Pure functions only: no DOM, no network,
   no LLM involvement. Documented on /calculation-methodology.
   Covered by tests/residential-math.test.mjs — change formulas
   only with fixtures.
   Conventions:
   - Rates are annual percentages; amortization in years.
   - PITI = principal & interest + taxes/12 + insurance/12 + HOA
     + mortgage insurance (user-entered annual % of loan ÷ 12 —
     never a pre-filled MI rate).
   - Affordability uses user-adjustable front/back DTI ratios;
     defaults labeled as common conventions, not program rules.
   ============================================================ */
(function (root) {
  "use strict";

  function payment(loan, annualRatePct, amortYears) {
    if (!(loan > 0) || !(annualRatePct >= 0) || !(amortYears > 0)) return NaN;
    var i = annualRatePct / 100 / 12;
    var n = amortYears * 12;
    if (i === 0) return loan / n;
    return loan * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
  }

  /* Full monthly housing payment, itemized. */
  function piti(loan, annualRatePct, amortYears, annualTax, annualIns, monthlyHOA, miAnnualPct) {
    var pi = payment(loan, annualRatePct, amortYears);
    if (isNaN(pi)) return null;
    var ti = (Math.max(annualTax, 0) + Math.max(annualIns, 0)) / 12 + Math.max(monthlyHOA, 0);
    var mi = loan * Math.max(miAnnualPct, 0) / 100 / 12;
    return { pi: pi, ti: ti, mi: mi, total: pi + ti + mi };
  }

  /* Largest loan whose P&I equals maxMonthlyPI at the given terms. */
  function maxLoanFromPI(maxMonthlyPI, annualRatePct, amortYears) {
    if (!(maxMonthlyPI > 0) || !(annualRatePct >= 0) || !(amortYears > 0)) return NaN;
    var i = annualRatePct / 100 / 12;
    var n = amortYears * 12;
    if (i === 0) return maxMonthlyPI * n;
    return maxMonthlyPI * (Math.pow(1 + i, n) - 1) / (i * Math.pow(1 + i, n));
  }

  /* Affordability: housing budget from DTI ratios, minus the user's
     estimate of monthly taxes+insurance+HOA, inverted to a loan, then
     grossed up by the down payment to an illustrative price. */
  function affordability(grossAnnualIncome, monthlyDebts, frontPct, backPct, estMonthlyTIH, annualRatePct, amortYears, downPct) {
    if (!(grossAnnualIncome > 0) || !(downPct >= 0) || downPct >= 1) return null;
    var mi = grossAnnualIncome / 12;
    var front = mi * frontPct / 100;
    var back = mi * backPct / 100 - Math.max(monthlyDebts, 0);
    var maxHousing = Math.min(front, back);
    var maxPI = Math.max(maxHousing - Math.max(estMonthlyTIH, 0), 0);
    var maxLoan = maxPI > 0 ? maxLoanFromPI(maxPI, annualRatePct, amortYears) : 0;
    return {
      frontLimit: front, backLimit: back, maxHousing: maxHousing,
      maxPI: maxPI, maxLoan: maxLoan,
      maxPrice: maxLoan > 0 ? maxLoan / (1 - downPct) : 0,
      binding: front <= back ? "front" : "back"
    };
  }

  /* Refinance break-even: months of savings that repay the costs. */
  function breakEven(closingCosts, currentMonthly, newMonthly) {
    var savings = currentMonthly - newMonthly;
    if (!(closingCosts >= 0) || !(savings > 0)) return null;
    return { monthlySavings: savings, months: closingCosts / savings };
  }

  var api = {
    payment: payment,
    piti: piti,
    maxLoanFromPI: maxLoanFromPI,
    affordability: affordability,
    breakEven: breakEven
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SH_RES = api;
})(typeof window !== "undefined" ? window : globalThis);
