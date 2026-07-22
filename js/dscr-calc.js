/* ============================================================
   Stonehaven — deterministic DSCR math (shared, dependency-free).
   Pure functions only: no DOM, no network, no LLM involvement.
   Documented on /calculation-methodology. Covered by
   tests/dscr-math.test.mjs — change formulas only with fixtures.
   Conventions:
   - Residential (1-4 unit) DSCR = eligible monthly rent ÷ monthly PITIA.
   - PITIA = principal & interest + taxes/12 + insurance/12 + monthly dues.
   - Rates are annual percentages; amortization in years; IO = interest-only.
   ============================================================ */
(function (root) {
  "use strict";

  function principalAndInterest(loan, annualRatePct, amortYears, interestOnly) {
    if (!(loan > 0) || !(annualRatePct >= 0) || !(amortYears > 0)) return NaN;
    var i = annualRatePct / 100 / 12;
    if (interestOnly) return loan * i;
    if (i === 0) return loan / (amortYears * 12);
    var n = amortYears * 12;
    return loan * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
  }

  function monthlyTIA(annualTaxes, annualInsurance, monthlyDues) {
    return (Math.max(annualTaxes, 0) + Math.max(annualInsurance, 0)) / 12 + Math.max(monthlyDues, 0);
  }

  function pitia(pi, tia) { return pi + tia; }

  function dscr(monthlyRent, pitiaMo) {
    if (!(pitiaMo > 0)) return NaN;
    return monthlyRent / pitiaMo;
  }

  /* Rent needed so that rent ÷ PITIA meets the target ratio. */
  function rentNeeded(pitiaMo, targetDscr) {
    if (!(pitiaMo > 0) || !(targetDscr > 0)) return NaN;
    return pitiaMo * targetDscr;
  }

  /* Maximum total monthly housing expense the rent supports at the target. */
  function maxHousingExpense(monthlyRent, targetDscr) {
    if (!(monthlyRent > 0) || !(targetDscr > 0)) return NaN;
    return monthlyRent / targetDscr;
  }

  /* Max P&I = max housing expense minus taxes, insurance, dues. Never negative. */
  function maxPrincipalAndInterest(monthlyRent, targetDscr, tia) {
    var max = maxHousingExpense(monthlyRent, targetDscr);
    if (isNaN(max)) return NaN;
    return Math.max(max - Math.max(tia, 0), 0);
  }

  /* Illustrative max loan from max P&I at the stated rate/amortization. */
  function maxLoanFromPI(maxPI, annualRatePct, amortYears, interestOnly) {
    if (!(maxPI > 0) || !(annualRatePct >= 0) || !(amortYears > 0)) return 0;
    var i = annualRatePct / 100 / 12;
    if (interestOnly) return i > 0 ? maxPI / i : 0;
    if (i === 0) return maxPI * amortYears * 12;
    var n = amortYears * 12;
    return maxPI * (Math.pow(1 + i, n) - 1) / (i * Math.pow(1 + i, n));
  }

  var api = {
    principalAndInterest: principalAndInterest,
    monthlyTIA: monthlyTIA,
    pitia: pitia,
    dscr: dscr,
    rentNeeded: rentNeeded,
    maxHousingExpense: maxHousingExpense,
    maxPrincipalAndInterest: maxPrincipalAndInterest,
    maxLoanFromPI: maxLoanFromPI
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SH_CALC = api;
})(typeof window !== "undefined" ? window : globalThis);
