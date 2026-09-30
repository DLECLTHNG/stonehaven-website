from pathlib import Path
from html.parser import HTMLParser
import json,sys,re
R=Path.cwd()
class Links(HTMLParser):
 def __init__(self):super().__init__();self.main=False;self.links=[]
 def handle_starttag(self,t,attrs):
  if t=='main':self.main=True
  if t=='a' and self.main:
   a=dict(attrs);self.links.append(a.get('href','').split('#')[0].split('?')[0])
 def handle_endtag(self,t):
  if t=='main':self.main=False
incoming={}; pages=0
for p in R.rglob('*.html'):
 if any(x.startswith('.') or x in ['docs','scripts','node_modules','tests','downloads'] for x in p.relative_to(R).parts):continue
 s=p.read_text()
 if re.search(r'<meta[^>]*name="robots"[^>]*content="[^"]*noindex',s):continue
 pages+=1;v=Links();v.feed(s);source='/'+p.relative_to(R).as_posix().removesuffix('index.html').removesuffix('.html')
 for u in set(v.links):
  if u.startswith('/') and u!=source:incoming.setdefault(u,set()).add(source)
paths=['/commercial/construction-loans','/commercial/fix-and-flip','/commercial/bridge-loans','/commercial/land-development-loans','/commercial/multifamily-acquisition','/commercial/5-8-unit-financing','/resources/commercial','/resources/how-lenders-size-commercial-loans','/resources/bridge-vs-permanent-financing','/resources/commercial-refinance-guide']
result={'indexable_pages':pages,'body_inlinks':{p:len(incoming.get(p,[])) for p in paths}}
Path(sys.argv[1]).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
