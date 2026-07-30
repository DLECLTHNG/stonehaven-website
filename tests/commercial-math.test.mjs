/* Fixtures for js/commercial-calc.js — run: node tests/commercial-math.test.mjs */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const C = require("../js/commercial-calc.js");

let failures = 0;
function close(name, got, want, tol = 0.01) {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) { failures++; console.error(`FAIL ${name}: got ${got}, want ${want}`); }
}
function eq(name, got, want) {
  if (got !== want) { failures++; console.error(`FAIL ${name}: got ${got}, want ${want}`); }
}

// payment
close("pmt 2.1M @7/30y", C.payment(2100000, 7.0, 30), 13971.35239876283);
eq("pmt invalid", Number.isNaN(C.payment(-1, 7, 30)), true);

// dscr
close("dscr 240k NOI vs 2.1M loan svc", C.dscr(240000, C.payment(2100000, 7.0, 30) * 12), 1.4315006471221075, 1e-9);
eq("dscr zero ads", Number.isNaN(C.dscr(240000, 0)), true);

// max loan from DSCR: NOI 240k, target 1.25x, 7%/30y
close("maxLoanFromDscr", C.maxLoanFromDscr(240000, 1.25, 7.0, 30), 2404921.0871651405, 0.05);
close("maxLoanFromDscr zero rate", C.maxLoanFromDscr(240000, 1.25, 0, 30), 5760000.0, 0.05);

// max loan from LTV
close("maxLoanFromLtv", C.maxLoanFromLtv(3000000, 70), 2100000);

// sizing: value 3M, NOI 240k, 1.25x, 70% LTV, 7%/30y -> LTV binds (2.1M < 2.405M)
{
  const s = C.sizeLoan(240000, 3000000, 1.25, 70, 7.0, 30);
  close("size byDscr", s.byDscr, 2404921.0871651405, 0.05);
  close("size byLtv", s.byLtv, 2100000);
  close("size loan", s.loan, 2100000);
  eq("size binding", s.binding, "LTV");
  close("size payment", s.payment, 13971.35239876283);
  close("size resultingDscr", s.resultingDscr, 1.4315006471221075, 1e-9);
}
// flip the constraint: value 4M at 70% -> 2.8M LTV, DSCR still 2.405M -> DSCR binds
{
  const s = C.sizeLoan(240000, 4000000, 1.25, 70, 7.0, 30);
  eq("size binding flips", s.binding, "DSCR");
  close("size loan dscr-bound", s.loan, 2404921.0871651405, 0.05);
}

if (failures) { console.error(`${failures} failure(s)`); process.exit(1); }
console.log("commercial-math: all fixtures pass");
