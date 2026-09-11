import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
process.env.FAMILY_DRY_RUN = "1";
const fn = require("../netlify/functions/family-inquiry.js");
const post = (body, headers = {}) => fn.handler({ httpMethod: "POST", headers: { origin: "https://stonehavencre.com", "x-nf-client-connection-ip": headers.ip || "1.1.1." + Math.floor(Math.random() * 250), ...headers }, body: JSON.stringify(body) });
const good = () => ({ page: "family-parents", name: "Test Person", phone: "(470) 555-0123", state: "GA", email: "", timing: "exploring", notice_version: "fo-notice-2026-09-11", attribution: { utm_source: "meta", fbclid: "x" }, path: "/buy-a-home-for-parents" });

test("rejects non-POST", async () => { const r = await fn.handler({ httpMethod: "GET", headers: {} }); assert.equal(r.statusCode, 405); });
test("rejects foreign origin", async () => { const r = await post(good(), { origin: "https://evil.example" }); assert.equal(r.statusCode, 403); });
test("validates required fields with field-level errors", async () => {
  const r = await post({ page: "family-parents", name: "A", phone: "123", state: "NY", email: "nope" });
  assert.equal(r.statusCode, 400);
  const j = JSON.parse(r.body); assert.deepEqual(Object.keys(j.errors).sort(), ["email", "name", "phone", "state"]);
});
test("rejects unknown page id and timing", async () => {
  const r = await post({ ...good(), page: "heloc", timing: "soon" }); const j = JSON.parse(r.body);
  assert.equal(r.statusCode, 400); assert.ok(j.errors.page); assert.ok(j.errors.timing);
});
test("accepts a valid inquiry (dry run) with an id and timestamp, no PII echoed", async () => {
  const r = await post(good()); assert.equal(r.statusCode, 200);
  const j = JSON.parse(r.body); assert.equal(j.ok, true); assert.match(j.inquiry_id, /^FO-[A-Z0-9]+-[A-F0-9]{6}$/); assert.ok(j.received_at); assert.equal(j.dry_run, true);
  assert.ok(!r.body.includes("Test Person") && !r.body.includes("5550123"));
});
test("honeypot returns success without storing", async () => {
  const r = await post({ ...good(), company_website: "http://spam" }); const j = JSON.parse(r.body);
  assert.equal(r.statusCode, 200); assert.equal(j.ok, true); assert.equal(j.dry_run, undefined);
});
test("same phone + page within two minutes returns the same inquiry id", async () => {
  const b = { ...good(), phone: "4705550199", page: "family-adult-child" };
  const a = JSON.parse((await post(b, { ip: "9.9.9.1" })).body); const c = JSON.parse((await post(b, { ip: "9.9.9.2" })).body);
  assert.equal(a.inquiry_id, c.inquiry_id); assert.equal(c.duplicate, true);
});
test("rate limits the sixth submission from one connection", async () => {
  let last;
  for (let i = 0; i < 6; i++) last = await post({ ...good(), phone: "470555" + (1000 + i) }, { ip: "7.7.7.7", "user-agent": "t" });
  assert.equal(last.statusCode, 429);
});
test("adult-child page never relays to Meta even when enabled", async () => {
  process.env.FAMILY_CAPI_PARENTS_PAGE = "1"; process.env.META_CAPI_TOKEN = "x";
  const orig = globalThis.fetch; let called = false; globalThis.fetch = async () => { called = true; return { ok: true }; };
  process.env.FAMILY_DRY_RUN = "";
  process.env.URL = "https://example.test";
  try {
    await post({ ...good(), page: "family-adult-child", phone: "4705550777", event_id: "e1" });
    assert.equal(called, true); // one call: storage only
    let calls = 0; globalThis.fetch = async (u) => { calls++; assert.ok(!String(u).includes("facebook")); return { ok: true }; };
    await post({ ...good(), page: "family-adult-child", phone: "4705550778", event_id: "e2" });
    assert.equal(calls, 1);
  } finally { globalThis.fetch = orig; process.env.FAMILY_DRY_RUN = "1"; delete process.env.FAMILY_CAPI_PARENTS_PAGE; delete process.env.META_CAPI_TOKEN; }
});
test("storage failure returns 502, never a fake success", async () => {
  const orig = globalThis.fetch; globalThis.fetch = async () => ({ ok: false, status: 500 }); process.env.FAMILY_DRY_RUN = ""; process.env.URL = "https://example.test";
  try { const r = await post({ ...good(), phone: "4705550888" }); assert.equal(r.statusCode, 502); assert.equal(JSON.parse(r.body).ok, false); }
  finally { globalThis.fetch = orig; process.env.FAMILY_DRY_RUN = "1"; }
});
test("accepts optional price and credit band, rejects out-of-range values", async () => {
  const ok = await post({ ...good(), phone: "4705551201", price: "$450,000", credit: "759-740" });
  assert.equal(ok.statusCode, 200);
  const lowPrice = await post({ ...good(), phone: "4705551202", price: "12" });
  assert.equal(lowPrice.statusCode, 400);
  assert.ok(JSON.parse(lowPrice.body).errors.price);
  const badBand = await post({ ...good(), phone: "4705551203", credit: "900-880" });
  assert.equal(badBand.statusCode, 400);
  assert.ok(JSON.parse(badBand.body).errors.credit);
  const placeholder = await post({ ...good(), phone: "4705551204", credit: "not-sure" });
  assert.equal(placeholder.statusCode, 200);
});
test("the parent-income question is accepted only on the parents page", async () => {
  const parents = await post({ ...good(), page: "family-parents", phone: "4705551301",
    extra_name: "occupant_income", extra_value: "no" });
  assert.equal(parents.statusCode, 200);
  // Same answer offered for the adult-child page must be dropped, never stored.
  const orig = globalThis.fetch; let body = null;
  globalThis.fetch = async (_u, o) => { body = o && o.body; return { ok: true }; };
  process.env.FAMILY_DRY_RUN = ""; process.env.URL = "https://example.test";
  try {
    const sensitive = await post({ ...good(), page: "family-adult-child", phone: "4705551302",
      extra_name: "occupant_income", extra_value: "no" });
    assert.equal(sensitive.statusCode, 200);
    assert.ok(!/occupant_income/.test(String(body)));
    assert.ok(!/income/i.test(String(body)));
  } finally { globalThis.fetch = orig; process.env.FAMILY_DRY_RUN = "1"; }
});
