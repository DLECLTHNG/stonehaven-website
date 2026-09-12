#!/usr/bin/env python3
"""Record explicit significant content changes. Never run automatically on a build.
Usage: python3 scripts/update-sitemap.py YYYY-MM-DD 'reason' /path /es/path
"""
from pathlib import Path
import sys,datetime,re,json
root=Path(__file__).resolve().parent.parent
date,reason,*paths=sys.argv[1:]
assert datetime.date.fromisoformat(date)<=datetime.datetime.now(datetime.timezone.utc).date(),'Future dates are not permitted'
assert reason.strip() and paths,'Supply a reason and changed URL paths'
s=(root/'sitemap.xml').read_text();logpath=root/'docs/seo-implementation/content-changes.json'
log=json.loads(logpath.read_text()) if logpath.exists() else []
for path in paths:
    assert path.startswith('/') and '?' not in path and '#' not in path
    file=root/('index.html' if path=='/' else path.lstrip('/')+'index.html' if path.endswith('/') else path.lstrip('/')+'.html')
    assert file.is_file(),file
    assert not re.search(r'<meta name="robots" content="[^"]*noindex',file.read_text()),file
    url='https://stonehavencre.com'+path
    pattern=r'(<url>\s*<loc>'+re.escape(url)+r'</loc>[\s\S]*?<lastmod>)[^<]*(</lastmod>)'
    s,n=re.subn(pattern,lambda m:m[1]+date+m[2],s)
    if not n:s=s.replace('</urlset>',f'<url><loc>{url}</loc><lastmod>{date}</lastmod></url>\n</urlset>')
log.append({'date':date,'reason':reason,'paths':paths})
(root/'sitemap.xml').write_text(s);logpath.parent.mkdir(parents=True,exist_ok=True);logpath.write_text(json.dumps(log,indent=2)+'\n')
