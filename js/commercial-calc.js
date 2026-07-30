/* ============================================================
   Stonehaven — deterministic commercial sizing math (dependency-free).
   Pure functions only: no DOM, no network, no LLM involvement.
   Documented on /calculation-methodology. Covered by
   tests/commercial-math.test.mjs — change formulas only with fixtures.
   Conventions:
   - Commercial DSCR = annual NOI ÷ annual debt service.
   - Loan sizing is the LESSER of the DSCR-constrained loan and the
     LTV-constrained loan — the binding constraint is reported.
   - Rates are annual percentages; amortization in years.
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

  function dscr(annualNOI, annualDebtService) {
    if (!(annualDebtService > 0)) return NaN;
    return annualNOI / annualDebtService;
  }

  /* Largest loan whose debt service keeps NOI ÷ ADS at the target. */
  function maxLoanFromDscr(annualNOI, targetDscr, annualRatePct, amortYears) {
    if (!(annualNOI > 0) || !(targetDscr > 0) || !(annualRatePct >= 0) || !(amortYears > 0)) return NaN;
    var maxMonthly = annualNOI / 12 / targetDscr;
    var i = annualRatePct / 100 / 12;
    var n = amortYears * 12;
    if (i === 0) return maxMonthly * n;
    return maxMonthly * (Math.pow(1 + i, n) - 1) / (i * Math.pow(1 + i, n));
  }

  function maxLoanFromLtv(value, ltvPct) {
    if (!(value > 0) || !(ltvPct > 0)) return NaN;
    return value * ltvPct / 100;
  }

  /* Supported loan = min(DSCR-constrained, LTV-constrained), with the
     binding constraint named — the number that shapes the whole deal. */
  function sizeLoan(annualNOI, value, targetDscr, ltvPct, annualRatePct, amortYears) {
    var byDscr = maxLoanFromDscr(annualNOI, targetDscr, annualRatePct, amortYears);
    var byLtv = maxLoanFromLtv(value, ltvPct);
    if (isNaN(byDscr) || isNaN(byLtv)) return null;
    var binding = byDscr <= byLtv ? "DSCR" : "LTV";
    var loan = Math.min(byDscr, byLtv);
    var pmt = payment(loan, annualRatePct, amortYears);
    return {
      byDscr: byDscr, byLtv: byLtv, loan: loan, binding: binding,
      payment: pmt,
      resultingDscr: dscr(annualNOI, pmt * 12)
    };
  }

  var api = {
    payment: payment,
    dscr: dscr,
    maxLoanFromDscr: maxLoanFromDscr,
    maxLoanFromLtv: maxLoanFromLtv,
    sizeLoan: sizeLoan
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SH_CRE = api;
})(typeof window !== "undefined" ? window : globalThis);
