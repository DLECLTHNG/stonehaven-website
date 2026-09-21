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
  const pages = ['heloc.html','es/heloc.html','heloc-wizard.html','es/heloc-wizard.html','heloc-instant.html','es/heloc-instant.html','cash-out-refinance.html','es/cash-out-refinance.html', ...readdirSync('heloc').filter(p => p.endsWith('.html')).map(p => 'heloc/' + p), ...readdirSync('es/heloc').filter(p => p.endsWith('.html')).map(p => 'es/heloc/' + p)];
  assert.equal(pages.length, 41);
  for (const page of pages) {
    const html = readFileSync(page, 'utf8');
    assert.match(html, /heloc-fields\.js/, page);
    const form = html.match(/<form\b[^>]*data-sh-form[^>]*>[\s\S]*?<\/form>/)?.[0];
    assert.ok(form, page);
    for (const key of H.keys) {
      if (/heloc-(wizard|instant)/.test(page)) assert.match(form, new RegExp('data-key="' + key + '" data-type="money"[^>]*>[\\s\\S]*?<input[^>]*required'), page + ' ' + key);
      else assert.match(form, new RegExp('<input[^>]*name="' + key + '"[^>]*required'), page + ' ' + key);
    }
    if (/heloc-(wizard|instant)/.test(page)) assert.match(form, /(?:Minimum|Mínimo) \$30,000/, page);
    else assert.match(form.match(/<input[^>]*name="requested_amount"[^>]*>/)[0], /min="30000"/, page);
  }
});
test('quote destinations strip query and fragment data and reject unsafe schemes', () => {
  const url = H.quoteDestination('https://quote.example/start?email=private@example.com&home_value=500000#phone=123', 'https://stonehavencre.com', 'heloc-instant');
  assert.equal(url, 'https://quote.example/start?src=stonehaven-heloc-instant');
  for (const raw of ['', 'javascript:alert(1)', 'http://quote.example', 'https://user:pass@quote.example']) assert.equal(H.quoteDestination(raw, 'https://stonehavencre.com', 'heloc'), null);
});


test('browser HELOC validation rejects amounts below minimum and accepts the boundary', t => {
 const previous=global.document; global.document={documentElement:{lang:'en'}};
 t.after(()=>{global.document=previous;});
 for(const value of ['29999.99','30000','30000.01']) {
  const fields=Object.fromEntries(Object.entries({home_value:'400000',mortgage_balance:'0',requested_amount:value}).map(([key,value])=>[key,{value,type:'hidden'}]));
  const error={remove(){},textContent:''};
  const form={getAttribute:()=> 'en',querySelector:selector=>selector==='.heloc-amount-error'?error:fields[selector.match(/name="([^"]+)"/)?.[1]]};
  assert.equal(H.validate(form),Number(value)>=30000);
  if(Number(value)<30000) assert.match(error.textContent,/\$30,000/);
 }
});
