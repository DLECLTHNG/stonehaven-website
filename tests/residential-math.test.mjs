/* Fixtures for js/residential-calc.js — run: node tests/residential-math.test.mjs */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const R = require("../js/residential-calc.js");

let failures = 0;
function close(name, got, want, tol = 0.01) {
  if (!(Math.abs(got - want) <= tol)) { failures++; console.error(`FAIL ${name}: got ${got}, want ${want}`); }
}
function eq(name, got, want) {
  if (got !== want) { failures++; console.error(`FAIL ${name}: got ${got}, want ${want}`); }
}

// payment
close("pmt 400k @6.5/30", R.payment(400000, 6.5, 30), 2528.272093971861);
close("pmt zero-rate", R.payment(400000, 0, 30), 1111.111111111111);
eq("pmt invalid", Number.isNaN(R.payment(0, 6.5, 30)), true);

// piti: 400k @6.5/30, tax 4800, ins 1800, HOA 100, MI 0.5%/yr
{
  const p = R.piti(400000, 6.5, 30, 4800, 1800, 100, 0.5);
  close("piti pi", p.pi, 2528.272093971861);
  close("piti ti", p.ti, 650.0);
  close("piti mi", p.mi, 166.66666666666666);
  close("piti total", p.total, 3344.9387606385276);
}
// piti with no MI
close("piti no-mi total", R.piti(400000, 6.5, 30, 4800, 1800, 0, 0).total, 2528.272093971861 + 550);

// maxLoanFromPI round-trips payment
close("maxLoan inverts pmt", R.maxLoanFromPI(2528.272093971861, 6.5, 30), 400000, 0.05);

// affordability: 120k income, 500/mo debts, 28/36, TIH 600, 6.5%/30, 20% down
{
  const a = R.affordability(120000, 500, 28, 36, 600, 6.5, 30, 0.20);
  close("afford front", a.frontLimit, 2800.0);
  close("afford back", a.backLimit, 3100.0);
  close("afford maxHousing", a.maxHousing, 2800.0);
  close("afford maxPI", a.maxPI, 2200.0);
  close("afford maxLoan", a.maxLoan, 348063.8029815608, 0.05);
  close("afford maxPrice", a.maxPrice, 435079.753726951, 0.05);
  eq("afford binding", a.binding, "front");
}
// back-end binds when debts are heavy
{
  const a = R.affordability(120000, 1500, 28, 36, 600, 6.5, 30, 0.20);
  eq("afford binding flips", a.binding, "back");
  close("afford back heavy", a.maxHousing, 2100.0);
}
// budget swallowed by TIH -> zero, not negative
eq("afford floor", R.affordability(30000, 400, 28, 36, 900, 6.5, 30, 0.2).maxPI, 0);

// break-even: 6000 costs, 2600 -> 2400
{
  const b = R.breakEven(6000, 2600, 2400);
  close("breakeven savings", b.monthlySavings, 200);
  close("breakeven months", b.months, 30.0);
}
eq("breakeven no savings", R.breakEven(6000, 2400, 2400), null);
eq("breakeven negative savings", R.breakEven(6000, 2300, 2400), null);

if (failures) { console.error(`${failures} failure(s)`); process.exit(1); }
console.log("residential-math: all fixtures pass");
