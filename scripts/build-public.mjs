// Publish only public assets. Server code, dependencies, docs and secrets never
// enter the static deployment directory. Keep source intact for function bundling.
import {mkdirSync,readdirSync,copyFileSync,rmSync} from 'node:fs';
import {join,extname} from 'node:path';
const output='.site';
const directories=new Set(['assets','blog','commercial','dscr','es','heloc','js','residential','resources']);
const extensions=new Set(['.html','.css','.js','.mjs','.xml','.txt','.ico','.png','.webp','.jpg','.jpeg','.svg','.woff','.woff2','.ttf','.otf','.gif','.avif']);
rmSync(output,{recursive:true,force:true});mkdirSync(output);
let count=0;
function copy(source,target){
  mkdirSync(target,{recursive:true});
  for(const entry of readdirSync(source,{withFileTypes:true})){
    if(entry.name.startsWith('.'))continue;
    const from=join(source,entry.name),to=join(target,entry.name);
    if(entry.isDirectory())copy(from,to);
    else if(entry.isFile() && extensions.has(extname(entry.name))){copyFileSync(from,to);count++;}
  }
}
for(const entry of readdirSync('.',{withFileTypes:true})){
  if(entry.isDirectory() && directories.has(entry.name))copy(entry.name,join(output,entry.name));
  else if(entry.isFile() && (['_headers','_redirects'].includes(entry.name) || extensions.has(extname(entry.name)))){copyFileSync(entry.name,join(output,entry.name));count++;}
}
console.log(`Prepared ${count} public files in ${output}; internal sources and dependencies excluded.`);
