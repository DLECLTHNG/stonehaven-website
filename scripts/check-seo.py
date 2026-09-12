#!/usr/bin/env python3
"""Validate public SEO boundaries and local crawlable links without network access."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
import json, re, sys, datetime, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent.parent
ORIGIN='https://stonehavencre.com'
SKIP={'docs','downloads','scripts','tests','node_modules','.git','.github'}
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True);self.links=[];self.ids=set();self.canon=[];self.noindex=False;self.desc=[];self.titles=[];self.h1=0;self.ld=[];self.in_title=False;self.in_ld=False;self.buf='';self.feed(text)
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.add(a['id'])
        if tag=='a' and a.get('href'):self.links.append(a['href'])
        if tag=='link' and a.get('rel')=='canonical':self.canon.append(a.get('href',''))
        if tag=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content','').lower():self.noindex=True
        if tag=='meta' and a.get('name')=='description':self.desc.append(a.get('content',''))
        if tag=='h1':self.h1+=1
        if tag=='title':self.in_title=True;self.buf=''
        if tag=='script' and a.get('type')=='application/ld+json':self.in_ld=True;self.buf=''
    def handle_data(self,data):
        if self.in_title or self.in_ld:self.buf+=data
    def handle_endtag(self,tag):
        if tag=='title' and self.in_title:self.titles.append(self.buf.strip());self.in_title=False
        if tag=='script' and self.in_ld:self.ld.append(self.buf);self.in_ld=False

def route(path):
    s=path.relative_to(ROOT).as_posix()
    return '/'+(s[:-10] if s.endswith('index.html') else s[:-5])
pages={route(p):Page(p.read_text()) for p in ROOT.rglob('*.html') if not any(x in SKIP or x.startswith('.') for x in p.relative_to(ROOT).parts)}
errors=[]
def fail(msg):errors.append(msg)
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
entries=ET.parse(ROOT/'sitemap.xml').getroot().findall('s:url',ns);seen=set()
today=datetime.datetime.now(datetime.timezone.utc).date()
for item in entries:
    url=item.findtext('s:loc',namespaces=ns);date=item.findtext('s:lastmod',namespaces=ns)
    if url in seen:fail('Duplicate sitemap URL: '+url)
    seen.add(url);path=urlsplit(url).path
    if not url.startswith(ORIGIN+'/') or path not in pages:fail('Missing sitemap destination: '+url);continue
    if pages[path].noindex:fail('Sitemap includes noindex: '+url)
    try:
        if datetime.date.fromisoformat(date)>today:fail('Future lastmod: '+url)
    except (ValueError,TypeError):fail('Invalid lastmod: '+url)
titles={};descs={}
for path,p in pages.items():
    if not p.noindex:
        if ORIGIN+path not in seen:fail('Search page missing from sitemap: '+path)
        if p.canon!=[ORIGIN+path]:fail('Canonical mismatch: '+path)
        if len(p.titles)!=1 or not p.titles[0]:fail('Missing title: '+path)
        if len(p.desc)!=1 or not p.desc[0]:fail('Missing description: '+path)
        if p.h1!=1:fail('Expected one H1: '+path)
        for values,acc,label in [(p.titles,titles,'title'),(p.desc,descs,'description')]:
            if values and values[0] in acc:fail('Duplicate '+label+': '+path+' / '+acc[values[0]])
            elif values:acc[values[0]]=path
    for raw in p.ld:
        try:
            data=json.loads(raw)
            if re.search(r'"@type"\s*:\s*"FAQPage"',raw):fail('Retired FAQ markup: '+path)
        except ValueError:fail('Invalid JSON-LD: '+path)
    for href in p.links:
        u=urlsplit(urljoin(ORIGIN+path,href))
        if u.scheme in {'javascript','vbscript','data','file'}:
            fail('Unsafe link scheme: '+path);continue
        if u.scheme not in ['http','https'] or u.netloc!='stonehavencre.com':continue
        dest=unquote(u.path);target=pages.get(dest)
        if target is None:
            # Non-HTML links, including images and explicitly linked assets.
            candidate=ROOT/dest.lstrip('/')
            if not candidate.is_file():fail('Broken link: '+path+' -> '+href)
        elif u.fragment and unquote(u.fragment) not in target.ids:fail('Broken fragment: '+path+' -> '+href)
if errors:
    print('\n'.join(sorted(set(errors))),file=sys.stderr);sys.exit(1)
print(f'SEO checks passed: {len(pages)} pages, {len(entries)} sitemap URLs, no broken local links or future dates.')
