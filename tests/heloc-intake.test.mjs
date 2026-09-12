import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const H = require('../js/heloc-fields.js');
test('money accepts estimates and a paid-off mortgage without changing malformed values', () => {
  assert.equal(H.amount('$425,000', false), 425000);
  assert.equal(H.amount('75000.50', false), 75000.5);
  assert.equal(H.amount('0', true), 0);
  for (const value of ['', ' ', '-100', '1e5', '12,34', 'NaN', 'Infinity', '100.999']) assert.equal(H.amount(value, true), null, value);
  assert.equal(H.amount('0', false), null);
});
test('every HELOC page and comparison flow collects all three amounts', () => {
  const pages = ['heloc.html','es/heloc.html','heloc-wizard.html','es/heloc-wizard.html','heloc-instant.html','es/heloc-instant.html','cash-out-refinance.html','es/cash-out-refinance.html', ...readdirSync('heloc').filter(p => p.endsWith('.html')).map(p => 'heloc/' + p)];
  assert.equal(pages.length, 32);
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    assert.match(html, /heloc-fields\.js/, page);
    const form = html.match(/<form\b[^>]*data-sh-form[^>]*>[\s\S]*?<\/form>/)?.[0];
    assert.ok(form, page);
    for (const key of H.keys) {
      if (/heloc-(wizard|instant)/.test(page)) assert.match(form, new RegExp('data-key="' + key + '" data-type="money"[^>]*>[\\s\\S]*?<input[^>]*required'), page + ' ' + key);
      else assert.match(form, new RegExp('<input[^>]*name="' + key + '"[^>]*required'), page + ' ' + key);
    }
  }
});
test('quote destinations strip query and fragment data and reject unsafe schemes', () => {
  const url = H.quoteDestination('https://quote.example/start?email=private@example.com&home_value=500000#phone=123', 'https://stonehavencre.com', 'heloc-instant');
  assert.equal(url, 'https://quote.example/start?src=stonehaven-heloc-instant');
  for (const raw of ['', 'javascript:alert(1)', 'http://quote.example', 'https://user:pass@quote.example']) assert.equal(H.quoteDestination(raw, 'https://stonehavencre.com', 'heloc'), null);
});
