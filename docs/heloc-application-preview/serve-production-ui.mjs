// Local UI integration harness. No provider calls, real secrets, or disk storage.
import http from 'node:http';
import fs from 'node:fs/promises';
import {createApplicationHandler} from '../../netlify/functions/lib/heloc-application-delivery.mjs';
const root=new URL('../../',import.meta.url);
const records=new Map();let version=0;
const store={
  getMetadata:async()=>null,
  getWithMetadata:async key=>records.get(key)?structuredClone(records.get(key)):null,
  setJSON:async(key,data,options={})=>{
    if(options.onlyIfNew && records.has(key))return {modified:false};
    if(options.onlyIfMatch && records.get(key)?.etag!==options.onlyIfMatch)return {modified:false};
    records.set(key,{data:structuredClone(data),etag:String(++version)});return {modified:true};
  }
};
const handler=createApplicationHandler({
  env:{HELOC_APPLICATION_PDF_PASSWORD:'Local-Test-Only-Password-123456',HELOC_APPLICATION_HMAC_KEY:'Local-Test-Only-HMAC-Key-1234567890123456',HELOC_APPLICATION_RESEND_KEY:'re_localtestonly123456',HELOC_APPLICATION_FROM:'applications@stonehavencre.com'},
  getStore:async()=>store,
  createPdf:async()=>Buffer.from('%PDF-local-test-fixture-'+'.'.repeat(150)),
  send:async()=>new Response(JSON.stringify({id:'local-test-receipt-1234'}),{status:200})
});
const files={
  '/heloc-application':['heloc-application.html','text/html'],
  '/heloc-application.css':['heloc-application.css','text/css'],
  '/js/heloc-application.mjs':['js/heloc-application.mjs','text/javascript'],
  '/js/heloc-application-validation.mjs':['js/heloc-application-validation.mjs','text/javascript'],
  '/assets/stonehaven-logo-240-v1.webp':['assets/stonehaven-logo-240-v1.webp','image/webp'],
  '/assets/stonehaven-icon-48-v1.png':['assets/stonehaven-icon-48-v1.png','image/png'],
};
http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Robots-Tag','noindex,nofollow');
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/api/heloc-application'){
    let length=0;const chunks=[];for await(const chunk of req){length+=chunk.length;if(length>16384){res.writeHead(413);res.end();return;}chunks.push(chunk);}
    const response=await handler(new Request('https://stonehavencre.com/api/heloc-application',{method:req.method,headers:{...req.headers,origin:'https://stonehavencre.com'},...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})}));
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());return;
  }
  const file=files[path];if(!file){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',file[1]);res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'");
  res.end(await fs.readFile(new URL(file[0],root)));
}).listen(8154,'127.0.0.1',()=>process.stdout.write('Local HELOC integration preview running on port 8154. Email delivery mocked.\n'));
