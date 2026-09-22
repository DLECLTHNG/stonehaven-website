import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
test('public build includes site assets and excludes dependencies, server sources and internal documents',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'stonehaven-public-build-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const write=(file)=>{fs.mkdirSync(path.dirname(path.join(dir,file)),{recursive:true});fs.writeFileSync(path.join(dir,file),'fixture');};
 for(const file of ['index.html','heloc-application.html','_headers','_redirects','sitemap.xml','robots.txt','assets/logo.webp','es/blog/example.html','js/client.mjs','heloc-application.css','package.json','package-lock.json','README.md','.env','docs/private.html','netlify/functions/private.mjs','node_modules/private.js','downloads/withdrawn.pdf','tests/example.html'])write(file);
 const result=spawnSync(process.execPath,[fileURLToPath(new URL('../scripts/build-public.mjs',import.meta.url))],{cwd:dir,encoding:'utf8'});assert.equal(result.status,0,result.stderr);
 for(const file of ['index.html','heloc-application.html','_headers','_redirects','sitemap.xml','robots.txt','assets/logo.webp','es/blog/example.html','js/client.mjs','heloc-application.css'])assert.ok(fs.existsSync(path.join(dir,'.site',file)),file);
 for(const file of ['package.json','package-lock.json','README.md','.env','docs','netlify','node_modules','downloads','tests'])assert.equal(fs.existsSync(path.join(dir,'.site',file)),false,file);
 assert.ok(fs.existsSync(path.join(dir,'netlify/functions/private.mjs')),'function source must remain available for bundling');
});
