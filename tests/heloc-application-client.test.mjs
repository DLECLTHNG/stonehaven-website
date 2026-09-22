import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {realDate,validSsn,validateApplicant,maskSsn} from '../js/heloc-application-validation.mjs';
const synthetic={full_name:'Example Applicant',dob:'1990-02-28',ssn:'123-45-6789',address:'123 Example Street',unit:'',city:'Example City',state:'GA',zip:'30301',w2_income:'85,000'};
test('application validates applicant details and zero W-2 income without making eligibility decisions',()=>{
  assert.deepEqual(validateApplicant(synthetic,'2026-09-22'),{});
  assert.deepEqual(validateApplicant({...synthetic,w2_income:'0'},'2026-09-22'),{});
  for(const key of ['full_name','dob','ssn','address','city','state','zip','w2_income'])assert.ok(validateApplicant({...synthetic,[key]:''},'2026-09-22')[key]);
  assert.ok(validateApplicant({...synthetic,w2_income:'-1'},'2026-09-22').w2_income);
  assert.ok(validateApplicant({...synthetic,w2_income:'1,23'},'2026-09-22').w2_income);
});
test('application rejects nonexistent and future birth dates and malformed SSNs',()=>{
  for(const date of ['2025-02-29','2026-02-31','2026-09-23','2000-13-01','1899-01-01'])assert.equal(realDate(date,'2026-09-22'),false);
  assert.equal(realDate('2000-02-29','2026-09-22'),true);
  for(const ssn of ['000-12-3456','666-12-3456','900-12-3456','123-00-4567','123-45-0000','1234','123 45 6789'])assert.equal(validSsn(ssn),false);
  assert.equal(validSsn(synthetic.ssn),true);assert.equal(maskSsn(synthetic.ssn),'•••-••-6789');
});
test('application excludes general lead and advertising transports and cannot submit natively',()=>{
  const html=fs.readFileSync(new URL('../heloc-application.html',import.meta.url),'utf8');
  const js=fs.readFileSync(new URL('../js/heloc-application.mjs',import.meta.url),'utf8');
  assert.match(html,/connect-src 'self'; form-action 'none'/);
  assert.match(html,/name="robots" content="noindex,nofollow,noarchive"/);
  assert.match(html,/<fieldset id="application-fields" disabled>/);
  assert.doesNotMatch(html,/data-netlify|data-sh-form|form-name|site-config|funnel\.js|googletagmanager|facebook|openai/i);
  assert.doesNotMatch(js,/XMLHttpRequest|sendBeacon|sessionStorage|localStorage|console\./);
  assert.match(js,/event\.preventDefault\(\)/);
  const build=fs.readFileSync(new URL('../netlify.toml',import.meta.url),'utf8');assert.match(build,/publish = "\.site"/);
});
