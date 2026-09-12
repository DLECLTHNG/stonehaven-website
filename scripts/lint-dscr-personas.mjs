// Claims + uniqueness + structure lint for /dscr/<slug> pages.
import { readFileSync, readdirSync } from "node:fs";
const BANNED=[/—/,/guaranteed (approval|savings|proceeds|cash|closing)/i,/we guarantee/i,/no credit check/i,/no documentation|no-doc\b/i,/instant approval/i,/pre-?approved/i,
 /\d+\.\d+\s?%/, /\bAPR\b/, /nationwide/i, /all 50 states/i, /VA[- ]backed DSCR/i, /no income verification/i,
 /fund(ed|ing)? in \d/i, /close in \d/i, /keep your first mortgage/i, /unlimited propert/i, /lowest/i, /nationwide/i,
 /approval (is )?(guaranteed|automatic)/i, /automatically qualif/i ];
let fail=0; const seen=new Map();
const files=readdirSync("dscr").filter(f=>f.endsWith(".html"));
if(files.length!==17){console.error("expected 17 pages, got "+files.length);fail++;}
for(const f of files){
  const full=readFileSync("dscr/"+f,"utf8");
  const t=/<main>[\s\S]*?<\/main>/.exec(full)?.[0]||full;
  for(const rx of BANNED) if(rx.test(t)){console.error(`${f}: banned ${rx}`);fail++;}
  for(const probe of ['rel="canonical" href="https://stonehavencre.com/dscr/','"@type": "BreadcrumbList"','href="/dscr-review"','href="/dscr-analyzer"','Preliminary review is not approval','An Illustrative','property="og:title"'])
    if(!full.includes(probe)){console.error(`${f}: missing ${probe}`);fail++;}
  const h1=/<h1>(.*?)<\/h1>/s.exec(t)?.[1];
  const title=/<title>(.*?)<\/title>/s.exec(full)?.[1];
  const desc=/name="description" content="(.*?)"/.exec(full)?.[1];
  if(!h1||h1.endsWith(".")){console.error(`${f}: h1 issue`);fail++;}
  if(title.length>62){console.error(`${f}: title ${title.length}`);fail++;}
  if(desc.length>162){console.error(`${f}: desc ${desc.length}`);fail++;}
  const faqs=(t.match(/faq-q/g)||[]).length; // objections + faqs
  if(faqs<6||faqs>9){console.error(`${f}: ${faqs} details blocks`);fail++;}
  for(const k of [h1,title,desc]){ if(seen.has(k)){console.error(`${f}: duplicate of ${seen.get(k)}`);fail++;} seen.set(k,f); }
  // heading periods
  if(/\.(<\/em>)?\s*<\/h[1-4]>/.test(t)){console.error(`${f}: heading period`);fail++;}
}
if(fail){console.error(fail+" finding(s)");process.exit(1);}
console.log("lint-dscr-personas: 17 pages clean (claims, uniqueness, structure)");
