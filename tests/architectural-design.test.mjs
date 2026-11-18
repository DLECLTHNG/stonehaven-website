import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {renderDesign} from '../scripts/render-design.mjs';
import {optimizePublic} from '../scripts/optimize-public.mjs';

function pages(directory) {
  return readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return pages(path);
    return path.endsWith('.html') ? [path] : [];
  });
}
const files = readdirSync('.').filter(name => name.endsWith('.html'))
  .concat(['blog','commercial','dscr','es','heloc','residential','resources'].flatMap(pages));

test('design rendering keeps every form, script, canonical, translation and privacy directive intact', () => {
  const contracts = html => html.match(/<form\b[\s\S]*?<\/form>|<script\b[\s\S]*?<\/script>|<meta\b[^>]*>|<link\b[^>]*rel="(?:canonical|alternate)"[^>]*>/gi) || [];
  for (const file of files) {
    const original = optimizePublic(readFileSync(file,'utf8'),file);
    const built = renderDesign(original,file);
    assert.deepEqual(contracts(built), contracts(original),file);
    assert.match(built, /<header class="sh-site-header/,file);
    assert.equal(renderDesign(built,file),built,file);
  }
});

test('private HELOC application uses system fonts under its existing security policy', () => {
  const page = renderDesign(readFileSync('heloc-application.html','utf8'),'heloc-application.html');
  assert.match(page, /href="\/assets\/design\/application\.css"/);
  assert.doesNotMatch(page, /\/assets\/design\/(?:theme\.css|dm-sans\.woff2)|as="font"/);
  for (const file of ['application','header']) {
    assert.doesNotMatch(readFileSync('assets/design/'+file+'.css','utf8'),/@font-face|url\(/);
  }
});
