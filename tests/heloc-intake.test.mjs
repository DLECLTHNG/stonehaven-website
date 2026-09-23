import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { helocCreditEligible, HELOC_MINIMUM, HELOC_MINIMUM_CREDIT } from '../netlify/shared/lead-validation.mjs';
const require = createRequire(import.meta.url);
const H = require('../js/heloc-fields.js');
test('money accepts estimates and a paid-off mortgage without changing malformed values', () => {
  assert.equal(H.amount('$425,000', false), 425000);
  assert.equal(H.amount('75000.50', false), 75000.5);
  assert.equal(H.amount('0', true), 0);
  for (const value of ['', ' ', '-100', '1e5', '12,34', 'NaN', 'Infinity', '100.999']) assert.equal(H.amount(value, true), null, value);
  assert.equal(H.amount('0', false), null);
});
test('every HELOC page and comparison flow collects amounts and offers only eligible credit ranges', () => {
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
    if (/heloc-(wizard|instant)/.test(page)) assert.match(form, /(?:Minimum|Mínimo) \$50,000/, page);
    else assert.match(form.match(/<input[^>]*name="requested_amount"[^>]*>/)[0], /min="50000"/, page);
    if (/cash-out-refinance/.test(page)) {
      const credit = form.match(/<input\b[^>]*name="credit_score"[^>]*>/)?.[0];
      assert.ok(credit, page + ' needs an estimated credit field');
      for (const attribute of [/\brequired\b/, /min="640"/, /max="850"/, /step="1"/]) assert.match(credit, attribute, page);
      continue;
    }
    const credit = form.match(/<select\b[^>]*name="credit_band(?:_pick)?"[^>]*>[\s\S]*?<\/select>/)?.[0];
    assert.ok(credit, page + ' needs an estimated credit field');
    assert.match(credit.match(/<select[^>]*>/)[0], /\brequired\b/, page + ' requires credit');
    for (const option of credit.matchAll(/<option\b[^>]*value="([^"]*)"[^>]*>/g)) {
      if (!option[1]) assert.match(option[0], /\bdisabled\b/, page + ' placeholder cannot be submitted');
      else assert.equal(H.creditEligible(option[1]), true, page + ' has an ineligible option: ' + option[1]);
    }
  }
});
test('quote destinations strip query and fragment data and reject unsafe schemes', () => {
  const url = H.quoteDestination('https://quote.example/start?email=private@example.com&home_value=500000#phone=123', 'https://stonehavencre.com', 'heloc-instant');
  assert.equal(url, 'https://quote.example/start?src=stonehaven-heloc-instant');
  for (const raw of ['', 'javascript:alert(1)', 'http://quote.example', 'https://user:pass@quote.example']) assert.equal(H.quoteDestination(raw, 'https://stonehavencre.com', 'heloc'), null);
});


function mockForm(values) {
 const fields=Object.fromEntries(Object.entries(values).map(([key,value])=>[key,{value,type:'hidden'}]));
 const error={remove(){},textContent:''};
 return {error,form:{getAttribute:()=> 'en',querySelector:selector=>selector==='.heloc-amount-error'?error:fields[selector.match(/name="([^"]+)"/)?.[1]]}};
}

test('browser HELOC validation rejects amounts below minimum and accepts the boundary', t => {
 const previous=global.document; global.document={documentElement:{lang:'en'}};
 t.after(()=>{global.document=previous;});
 for(const value of ['30000','49999.99','50000','50000.01']) {
  const {form,error}=mockForm({home_value:'400000',mortgage_balance:'0',requested_amount:value,credit_band:'659-640'});
  assert.equal(H.validate(form),Number(value)>=50000);
  if(Number(value)<50000) assert.match(error.textContent,/\$50,000/);
 }
});

test('browser HELOC credit validation requires an eligible estimate and rejects conflicting answers', t => {
 const previous=global.document; global.document={documentElement:{lang:'en'}};
 t.after(()=>{global.document=previous;});
 const amounts={home_value:'400000',mortgage_balance:'0',requested_amount:'50000'};
 for(const credit of [{},{credit_band:''},{credit_band:'not-sure'},{credit_band:'639'},{credit_band:'640',credit_band_pick:'639-620'}]) {
  const {form,error}=mockForm({...amounts,...credit});
  assert.equal(H.validate(form),false);
  assert.match(error.textContent,/640/);
 }
 for(const value of ['640','659-640','850-780']) assert.equal(H.validate(mockForm({...amounts,credit_band:value}).form),true);
});

test('browser and server eligibility agree at their numeric boundaries and on malformed input', () => {
 assert.equal(H.minimumRequested,HELOC_MINIMUM);
 assert.equal(H.minimumCreditScore,HELOC_MINIMUM_CREDIT);
 for(const value of [640,850,'640','850','659-640','640-659','640–659','640\u2014659','640+',' 640 ',undefined,null,'','not-sure','639','600+','639-620','640-639','851','850-999','-640','640.0','6.4e2',['640'],{},true]) {
  assert.equal(H.creditEligible(value),helocCreditEligible(value),String(value));
 }
});
