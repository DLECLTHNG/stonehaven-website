// Deterministic fixtures for js/dscr-calc.js. Run: node tests/dscr-math.test.mjs
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const C = require("../js/dscr-calc.js");

const near = (a, b, eps = 0.51) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

// — payment fixtures (verified against independent amortization math) —
near(C.principalAndInterest(300000, 7.25, 30, false), 2046.53, 0.51);   // base case
near(C.principalAndInterest(300000, 6.75, 30, false), 1945.79, 0.6);
near(C.principalAndInterest(300000, 7.25, 30, true), 1812.50, 0.01);    // interest-only = L*i/12
assert.equal(C.principalAndInterest(240000, 0, 20, false), 1000);        // zero-rate straight-line
assert.ok(Number.isNaN(C.principalAndInterest(0, 7, 30, false)));        // invalid loan

// — PITIA / DSCR —
const tia = C.monthlyTIA(5400, 1800, 0);
assert.equal(tia, 600);
const pit = C.pitia(C.principalAndInterest(300000, 7.25, 30, false), tia);
near(pit, 2646.53, 0.51);
near(C.dscr(3000, pit), 1.1336, 0.001);
assert.ok(Number.isNaN(C.dscr(3000, 0)));                                // division-by-zero guarded

// — high tax/insurance sensitivity —
const pitHigh = C.pitia(C.principalAndInterest(300000, 7.25, 30, false), C.monthlyTIA(5400, 1800, 150));
near(C.dscr(3000, pitHigh), 3000 / (pit + 150), 0.001);

// — rent-needed and max sizing at target DSCR —
near(C.rentNeeded(2646.53, 1.2), 3175.84, 0.51);
near(C.maxHousingExpense(3000, 1.2), 2500, 0.01);
// max P&I must subtract taxes/insurance/dues from max housing expense FIRST
near(C.maxPrincipalAndInterest(3000, 1.2, 600), 1900, 0.01);
assert.equal(C.maxPrincipalAndInterest(500, 1.2, 600), 0);               // clamped, never negative
// loan sized from max P&I round-trips through the payment formula
const maxLoan = C.maxLoanFromPI(1900, 7.25, 30, false);
near(C.principalAndInterest(maxLoan, 7.25, 30, false), 1900, 0.01);
near(C.maxLoanFromPI(1812.5, 7.25, 30, true), 300000, 1);                // IO round-trip
assert.equal(C.maxLoanFromPI(0, 7.25, 30, false), 0);                    // blank/zero safe

// — nonnumeric / negative safety —
assert.ok(Number.isNaN(C.dscr(NaN, 2000)) || !isFinite(C.dscr(NaN, 2000)) || Number.isNaN(C.dscr(NaN, 2000)));
assert.equal(C.monthlyTIA(-100, -100, -5), 0);                           // negatives clamped

console.log("dscr-math: all fixtures pass");
