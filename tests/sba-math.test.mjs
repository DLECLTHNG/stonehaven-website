/* Fixtures for js/sba-calc.js — run: node tests/sba-math.test.mjs */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const S = require("../js/sba-calc.js");

let failures = 0;
function close(name, got, want, tol = 0.01) {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) { failures++; console.error(`FAIL ${name}: got ${got}, want ${want}`); }
}
function eq(name, got, want) {
  if (got !== want) { failures++; console.error(`FAIL ${name}: got ${got}, want ${want}`); }
}

// payment — hand-verified amortization values
close("pmt 900k @8/25y", S.payment(900000, 8.0, 25), 6946.345974357049);
close("pmt 500k @6.5/25y", S.payment(500000, 6.5, 25), 3376.0358067382085);
close("pmt 400k @5.9/25y", S.payment(400000, 5.9, 25), 2552.8098755171295);
close("pmt zero-rate", S.payment(100000, 0, 10), 833.3333333333334);
eq("pmt invalid", Number.isNaN(S.payment(0, 7, 25)), true);

// 504 injection rules: 10% standard, +5% special purpose, +5% new business, cap 20%
close("inj standard", S.injectionPct504(false, false), 0.10, 1e-9);
close("inj special", S.injectionPct504(true, false), 0.15, 1e-9);
close("inj startup", S.injectionPct504(false, true), 0.15, 1e-9);
close("inj both (cap)", S.injectionPct504(true, true), 0.20, 1e-9);

// 504 structure on a $1M project, standard: 10% inj, 50% bank, 40% CDC
{
  const s = S.structure504(1000000, 6.5, 25, 5.9, 25, false, false);
  close("504 injection", s.injection, 100000);
  close("504 bank loan", s.bankLoan, 500000);
  close("504 cdc loan", s.cdcLoan, 400000);
  close("504 bank pmt", s.bankPayment, 3376.0358067382085);
  close("504 cdc pmt", s.cdcPayment, 2552.8098755171295);
  close("504 total pmt", s.totalPayment, 3376.0358067382085 + 2552.8098755171295);
}
// 504 both flags: 20% inj -> CDC drops to 30%
{
  const s = S.structure504(1000000, 6.5, 25, 5.9, 25, true, true);
  close("504 cap injection", s.injection, 200000);
  close("504 cap cdc loan", s.cdcLoan, 300000);
}

// 7(a) on a $1M project at 10% down
{
  const s = S.structure7a(1000000, 0.10, 8.0, 25);
  close("7a injection", s.injection, 100000);
  close("7a loan", s.loan, 900000);
  close("7a pmt", s.payment, 6946.345974357049);
}
eq("7a invalid down", S.structure7a(1000000, 1, 8, 25), null);

// rent delta
close("rentDelta owning costs more", S.rentDelta(6500, 6000), 500);
close("rentDelta owning costs less", S.rentDelta(5500, 6000), -500);

if (failures) { console.error(`${failures} failure(s)`); process.exit(1); }
console.log("sba-math: all fixtures pass");
