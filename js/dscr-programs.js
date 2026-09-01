/* ============================================================
   Stonehaven — DSCR program qualifying engine (deterministic).
   Faithful port of the internal "DSCR - All Programs" worksheet
   (2026-07-28 revision): qualifying-rent rules, qualifying payment
   by amortization type, PITIA and DSCR for four programs.
   Pure functions, no DOM, no network. Fixtures:
   tests/dscr-programs-math.test.mjs (includes the worksheet's own
   worked example for parity). Methodology: /calculation-methodology.
   Programs:
     ltr14    — 1–4 unit long-term rental (DSCR / low-ratio)
     str14    — 1–4 unit short-term rental (market-rent based)
     condotel — condotel (80% haircut, min DSCR 1.00)
     units58  — 5–8 unit (90% vacancy haircut, 35% refi vacancy cap)
   ============================================================ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.SH_DSCRP = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var r2 = function (n) { return Math.round(n * 100) / 100; };
  var num = function (v) { var n = +v; return isFinite(n) && n > 0 ? n : 0; };

  /* Qualifying monthly payment by amortization type.
     Worksheet: every 10-yr interest-only option qualifies at the
     IO payment (balance × rate ÷ 12); 5/6 ARM and 30-yr fixed
     qualify at the 30-year amortizing payment. */
  var AMORTS = {
    "arm56":        { io: false, label: "5/6 ARM" },
    "arm56-io30":   { io: true,  label: "5/6 ARM, 10-yr IO (30-yr)" },
    "arm56-io40":   { io: true,  label: "5/6 ARM, 10-yr IO (40-yr)" },
    "fixed30":      { io: false, label: "30-yr fixed" },
    "fixed30-io":   { io: true,  label: "30-yr fixed, 10-yr IO" },
    "fixed40-io":   { io: true,  label: "40-yr fixed, 10-yr IO" }
  };

  function payment(amort, ratePct, loanAmount) {
    var a = AMORTS[amort];
    var L = num(loanAmount), rate = +ratePct;
    if (!a || !L || !isFinite(rate) || rate <= 0) return NaN;
    var i = rate / 100 / 12;
    if (a.io) return r2(L * i);
    var n = 360; /* both amortizing options qualify on 360 payments */
    return r2(L * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));
  }

  /* Qualifying rent for ONE unit under a program.
     unit = { market, current, receipt (bool), vacant (bool), strHistory }
     - ltr14 purchase:  no current → market; else min(market, current)
     - ltr14 refinance: current > market with receipt → min(115% market, current);
                        current>0 → min(market, current); else market.
                        Vacant not permitted (flag, rent = 0).
     - str14 purchase:  market rent. refinance: min(market, 12-mo verified history).
     - condotel purchase: 80% market. refinance: min(80% market, 80% verified history).
     - units58 purchase: vacant → 90% market; else min(market, current) (market if none).
       units58 refinance: vacant → 90% market;
         w/ receipt → min(market, current) (market if none);
         w/o receipt → min(90% market, current) (90% market if none). */
  function qualRent(program, txn, unit) {
    var m = num(unit.market), c = num(unit.current), h = num(unit.strHistory);
    var purchase = txn === "purchase";
    if (!m) return { rent: 0, note: "missing-market" };
    if (program === "ltr14") {
      if (unit.vacant && !purchase) return { rent: 0, note: "vacant-not-permitted" };
      if (purchase) return { rent: c ? Math.min(m, c) : m };
      if (c > m && unit.receipt) return { rent: r2(Math.min(m * 1.15, c)), note: "receipt-115" };
      return { rent: c ? Math.min(m, c) : m };
    }
    if (program === "str14") {
      if (purchase) return { rent: m };
      return h ? { rent: Math.min(m, h) } : { rent: m, note: "missing-str-history" };
    }
    if (program === "condotel") {
      if (purchase) return { rent: r2(m * 0.8) };
      return h ? { rent: r2(Math.min(m * 0.8, h * 0.8)) } : { rent: r2(m * 0.8), note: "missing-str-history" };
    }
    if (program === "units58") {
      if (unit.vacant) return { rent: r2(m * 0.9), note: "vacant-90" };
      if (purchase) return { rent: c ? Math.min(m, c) : m };
      if (unit.receipt) return { rent: c ? Math.min(m, c) : m };
      return { rent: c ? r2(Math.min(m * 0.9, c)) : r2(m * 0.9), note: "no-receipt-90" };
    }
    return { rent: 0, note: "unknown-program" };
  }

  /* Full scenario → totals, DSCR, LTV and program flags. */
  function compute(s) {
    var flags = [];
    var value = num(s.value), loan = num(s.loan);
    var ltv = value ? r2(loan / value * 10000) / 100 : 0;
    var pay = payment(s.amort, s.rate, loan);
    var units = (s.units || []).map(function (u) { return qualRent(s.program, s.txn, u); });
    var rent = r2(units.reduce(function (t, u) { return t + u.rent; }, 0));
    var exp = r2(num(s.hazard) + num(s.taxes) + num(s.common) + num(s.ground));
    var pitia = isFinite(pay) ? r2(pay + exp) : NaN;
    var dscr = (isFinite(pitia) && pitia > 0) ? Math.round(rent / pitia * 10000) / 10000 : NaN;

    var vacantCount = (s.units || []).filter(function (u) { return u.vacant; }).length;
    var unitCount = (s.units || []).length;
    if (s.program === "ltr14" && s.txn !== "purchase" && vacantCount > 0) flags.push("vacant-not-permitted");
    if (s.program === "units58" && s.txn !== "purchase" && unitCount && vacantCount / unitCount > 0.35) flags.push("vacancy-over-35");
    if (s.program === "str14" && loan > 1500000) flags.push("str-max-1500000");
    if ((s.program === "str14" || s.program === "ltr14" || s.program === "condotel") && loan > 0 && loan < 150000) flags.push("min-loan-150000");
    if (s.program === "condotel" && isFinite(dscr) && dscr < 1) flags.push("condotel-min-dscr-1");
    if ((s.program === "str14" || s.firstTimeInvestor) && isFinite(dscr) && dscr < 1) flags.push("needs-dscr-1");
    if (isFinite(dscr) && dscr > 0 && dscr < 0.75) flags.push("dscr-below-075");
    return { ltv: ltv, payment: pay, rent: rent, expenses: exp, pitia: pitia, dscr: dscr, units: units, flags: flags };
  }

  return { AMORTS: AMORTS, payment: payment, qualRent: qualRent, compute: compute };
});
