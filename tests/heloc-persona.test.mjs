// Unit fixtures for js/heloc-persona.js (intent parsing / URL handling).
import { createRequire } from "node:module";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const P = require("../js/heloc-persona.js");

assert.equal(P.parseIntent("?intent=renovation"), "renovation");
assert.equal(P.parseIntent("?intent=consolidation"), "consolidation");
assert.equal(P.parseIntent("?utm_source=fb&intent=consolidation&x=1"), "consolidation");
assert.equal(P.parseIntent("?intent=CONSOLIDATION"), "consolidation");   // case-insensitive
assert.equal(P.parseIntent("?intent=bogus"), "renovation");              // unknown -> default
assert.equal(P.parseIntent(""), "renovation");                            // missing -> default
assert.equal(P.parseIntent(null), "renovation");
assert.equal(P.withIntent("?utm_source=fb&intent=renovation", "consolidation"), "?utm_source=fb&intent=consolidation");
assert.equal(P.withIntent("", "renovation"), "?intent=renovation");
assert.equal(P.withIntent("?a=1", "consolidation"), "?a=1&intent=consolidation");
assert.ok(P.isLicensed("GA") && P.isLicensed("SC") && !P.isLicensed("TX") && !P.isLicensed("OTHER"));
console.log("heloc-persona: all fixtures pass");
