import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

function run(args) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
run(['--test', ...readdirSync('tests').filter(f => f.endsWith('.test.mjs')).sort().map(f => join('tests', f))]);
for (const name of ['family-lps', 'dscr-personas', 'heloc-personas', 'es-casing']) run([`scripts/lint-${name}.mjs`]);
const banned = /STONEHAVEN_OWNER_FACT_REQUIRED|555-0100|Call ,|call  to|Llame al ,|Llame al  |is a commercial real estate lender|prestamos de forma directa|guaranteed approval|lowest rate|everyone qualifies/i;
function scan(dir) {
  let failures = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['docs', 'tests', 'scripts', 'downloads', 'node_modules'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) failures += scan(path);
    else if (entry.name.endsWith('.html') && banned.test(readFileSync(path, 'utf8'))) {
      console.error(`Release content gate failed: ${path}`);
      failures++;
    }
  }
  return failures;
}
if (scan('.')) process.exit(1);
console.log('All site checks passed.');
