/* Fixtures for js/heloc-calc.js — run: node tests/heloc-math.test.mjs */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const H = require("../js/heloc-calc.js");

let failures = 0;
function close(name, got, want, tol = 0.01) {
  if (!(Math.abs(got - want) <= tol)) { failures++; console.error(`FAIL ${name}: got ${got}, want ${want}`); }
}
function eq(name, got, want) {
  if (got !== want) { failures++; console.error(`FAIL ${name}: got ${got}, want ${want}`); }
}

// available equity: 500k home, 280k balance, 85% CLTV
{
  const a = H.availableEquity(500000, 280000, 85);
  close("maxTotal", a.maxTotal, 425000);
  close("available", a.available, 145000);
  close("currentEquity", a.currentEquity, 220000);
}
// underwater vs cap -> floored at zero
eq("available floor", H.availableEquity(300000, 260000, 80).available, 0);
eq("invalid", H.availableEquity(0, 100, 80), null);

// draw-period interest-only: 100k @ 8%
close("interest-only", H.interestOnlyPayment(100000, 8.0), 666.6666666666666);
eq("io invalid", Number.isNaN(H.interestOnlyPayment(0, 8)), true);

// repayment period: 100k @ 8% over 20y
close("repay", H.repaymentPayment(100000, 8.0, 20), 836.4400689934664);
close("repay zero-rate", H.repaymentPayment(100000, 0, 20), 416.6666666666667);

if (failures) { console.error(`${failures} failure(s)`); process.exit(1); }
console.log("heloc-math: all fixtures pass");
