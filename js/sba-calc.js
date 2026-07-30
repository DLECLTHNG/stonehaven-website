/* ============================================================
   Stonehaven — deterministic SBA structure math (dependency-free).
   Pure functions only: no DOM, no network, no LLM involvement.
   Documented on /calculation-methodology. Covered by
   tests/sba-math.test.mjs — change formulas only with fixtures.
   Conventions:
   - Rates are annual percentages; amortization in years.
   - 504 borrower injection follows SBA program structure: 10% standard,
     +5% for special-purpose property, +5% for a new business (≤2 yrs) —
     capped at 20%. Bank portion is modeled at 50% of project cost; the
     CDC/debenture portion is the remainder after injection.
   - All outputs are illustrative structure math, not eligibility.
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

  /* SBA 504 borrower-injection percentage from program structure rules. */
  function injectionPct504(specialPurpose, newBusiness) {
    var pct = 0.10 + (specialPurpose ? 0.05 : 0) + (newBusiness ? 0.05 : 0);
    return Math.min(pct, 0.20);
  }

  /* 504: bank ~50% / CDC remainder / borrower injection. */
  function structure504(projectCost, bankRatePct, bankYears, cdcRatePct, cdcYears, specialPurpose, newBusiness) {
    if (!(projectCost > 0)) return null;
    var inj = injectionPct504(specialPurpose, newBusiness);
    var injection = projectCost * inj;
    var bankLoan = projectCost * 0.5;
    var cdcLoan = projectCost - bankLoan - injection;
    var bankPmt = payment(bankLoan, bankRatePct, bankYears);
    var cdcPmt = payment(cdcLoan, cdcRatePct, cdcYears);
    return {
      injectionPct: inj, injection: injection,
      bankLoan: bankLoan, cdcLoan: cdcLoan,
      bankPayment: bankPmt, cdcPayment: cdcPmt,
      totalPayment: bankPmt + cdcPmt
    };
  }

  /* 7(a): single loan for the project cost minus the down payment. */
  function structure7a(projectCost, downPct, ratePct, amortYears) {
    if (!(projectCost > 0) || !(downPct >= 0) || downPct >= 1) return null;
    var injection = projectCost * downPct;
    var loan = projectCost - injection;
    var pmt = payment(loan, ratePct, amortYears);
    return { injection: injection, loan: loan, payment: pmt, totalPayment: pmt };
  }

  /* Monthly ownership cost vs current rent (negative = owning costs less). */
  function rentDelta(totalMonthly, currentRent) {
    if (!(totalMonthly >= 0) || !(currentRent >= 0)) return NaN;
    return totalMonthly - currentRent;
  }

  var api = {
    payment: payment,
    injectionPct504: injectionPct504,
    structure504: structure504,
    structure7a: structure7a,
    rentDelta: rentDelta
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SH_SBA = api;
})(typeof window !== "undefined" ? window : globalThis);
