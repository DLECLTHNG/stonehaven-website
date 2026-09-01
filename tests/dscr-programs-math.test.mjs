// Deterministic fixtures for js/dscr-programs.js.
// Run: node tests/dscr-programs-math.test.mjs
// Parity source: internal "DSCR - All Programs" worksheet (2026-07-28),
// including its own worked 5-8 unit refinance example.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const P = require("../js/dscr-programs.js");

const near = (a, b, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

// — payments (worksheet formulas: PMT(r/12,360,LA) and LA*r/12) —
near(P.payment("fixed30", 7, 650000), 4324.47);        // = worksheet L3/L7
near(P.payment("arm56", 7, 650000), 4324.47);
near(P.payment("fixed30-io", 7, 650000), 3791.67);     // = worksheet L4/L8
near(P.payment("arm56-io30", 7, 650000), 3791.67);
near(P.payment("arm56-io40", 7, 650000), 3791.67);
near(P.payment("fixed40-io", 7, 650000), 3791.67);
assert.ok(Number.isNaN(P.payment("fixed30", 0, 650000)));
assert.ok(Number.isNaN(P.payment("bogus", 7, 650000)));

// — 1-4 unit long-term rules —
assert.equal(P.qualRent("ltr14", "purchase", { market: 2000, current: 0 }).rent, 2000);
assert.equal(P.qualRent("ltr14", "purchase", { market: 2000, current: 1800 }).rent, 1800);
assert.equal(P.qualRent("ltr14", "purchase", { market: 2000, current: 2200 }).rent, 2000);
// refi: current above market honored to 115% cap only WITH receipt
assert.equal(P.qualRent("ltr14", "refinance", { market: 2000, current: 2400, receipt: true }).rent, 2300);
assert.equal(P.qualRent("ltr14", "refinance", { market: 2000, current: 2200, receipt: true }).rent, 2200);
assert.equal(P.qualRent("ltr14", "refinance", { market: 2000, current: 2400, receipt: false }).rent, 2000);
assert.equal(P.qualRent("ltr14", "refinance", { market: 2000, current: 0 }).rent, 2000);
assert.equal(P.qualRent("ltr14", "refinance", { market: 2000, vacant: true }).rent, 0); // not permitted

// — short-term rental (Open Road) —
assert.equal(P.qualRent("str14", "purchase", { market: 3000, current: 4000 }).rent, 3000);
assert.equal(P.qualRent("str14", "refinance", { market: 3000, strHistory: 2500 }).rent, 2500);
assert.equal(P.qualRent("str14", "refinance", { market: 3000, strHistory: 3600 }).rent, 3000);

// — condotel: 80% haircut both sides —
assert.equal(P.qualRent("condotel", "purchase", { market: 3000 }).rent, 2400);
assert.equal(P.qualRent("condotel", "refinance", { market: 3000, strHistory: 2600 }).rent, 2080);
assert.equal(P.qualRent("condotel", "refinance", { market: 3000, strHistory: 3500 }).rent, 2400);

// — 5-8 unit rules —
assert.equal(P.qualRent("units58", "purchase", { market: 2000, vacant: true }).rent, 1800);
assert.equal(P.qualRent("units58", "purchase", { market: 2000, current: 1900 }).rent, 1900);
assert.equal(P.qualRent("units58", "refinance", { market: 2000, current: 2100, receipt: true }).rent, 2000);
assert.equal(P.qualRent("units58", "refinance", { market: 2000, current: 1900, receipt: false }).rent, 1800);
assert.equal(P.qualRent("units58", "refinance", { market: 2000, current: 1700, receipt: false }).rent, 1700);

// — worksheet parity: the workbook's own 5-8 unit refinance example —
// 6 units, no receipts, value 1,300,000, loan 650,000, 7% 30-yr fixed,
// hazard 1,230 + taxes 1,871 monthly. Worksheet: rent 11,952,
// payment 4,324.47, DSCR 1.6096, LTV 50%.
const ws = P.compute({
  program: "units58", txn: "refinance", value: 1300000, loan: 650000,
  rate: 7, amort: "fixed30", hazard: 1230, taxes: 1871, common: 0, ground: 0,
  units: [1845, 2045, 1800, 1900, 2145, 3545].map(m => ({ market: m, current: m, receipt: false, vacant: false }))
});
near(ws.rent, 11952);
near(ws.payment, 4324.47);
near(ws.pitia, 7425.47);
near(ws.dscr, 1.6096, 0.0001);
near(ws.ltv, 50);
assert.deepEqual(ws.flags, []);

// — program flags —
assert.ok(P.compute({ program: "str14", txn: "purchase", value: 3000000, loan: 1600000, rate: 8, amort: "fixed30", units: [{ market: 9000 }] }).flags.includes("str-max-1500000"));
assert.ok(P.compute({ program: "ltr14", txn: "purchase", value: 200000, loan: 100000, rate: 8, amort: "fixed30", units: [{ market: 1500 }] }).flags.includes("min-loan-150000"));
const cd = P.compute({ program: "condotel", txn: "purchase", value: 400000, loan: 300000, rate: 8, amort: "fixed30", hazard: 300, taxes: 400, common: 600, ground: 0, units: [{ market: 3000 }] });
assert.ok(cd.dscr < 1 && cd.flags.includes("condotel-min-dscr-1"));
const low = P.compute({ program: "ltr14", txn: "purchase", value: 400000, loan: 320000, rate: 9, amort: "fixed30", hazard: 250, taxes: 450, common: 0, ground: 0, units: [{ market: 1800 }] });
assert.ok(low.flags.includes("dscr-below-075"));
const vac = P.compute({ program: "units58", txn: "refinance", value: 1000000, loan: 500000, rate: 7, amort: "fixed30", hazard: 500, taxes: 800, common: 0, ground: 0,
  units: [{ market: 1500, vacant: true }, { market: 1500, vacant: true }, { market: 1500, vacant: true }, { market: 1500 }, { market: 1500 }] });
assert.ok(vac.flags.includes("vacancy-over-35"));
assert.ok(P.compute({ program: "ltr14", txn: "purchase", value: 400000, loan: 300000, rate: 7.5, amort: "fixed30", firstTimeInvestor: true, hazard: 900, taxes: 900, common: 0, ground: 0, units: [{ market: 2400 }] }).flags.includes("needs-dscr-1"));

console.log("dscr-programs-math: all fixtures pass");
