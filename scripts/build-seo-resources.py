#!/usr/bin/env python3
"""Maintain marked SEO resources and editorial policy; run after product generators."""
from pathlib import Path
import re, json
ROOT = Path(__file__).resolve().parent.parent
CONTENT = json.loads((ROOT / 'scripts/seo-content.json').read_text())
def block(text, key, content, before):
    start, end = f'<!-- SEO:{key}:START -->', f'<!-- SEO:{key}:END -->'
    rendered = f'{start}\n{content}\n{end}\n'
    if start in text: return re.sub(re.escape(start)+r'[\s\S]*?'+re.escape(end)+r'\n?', lambda _: rendered, text)
    assert before in text, (key, before)
    return text.replace(before, rendered + before, 1)
def stylesheet(text):
    if 'seo-resources.css' not in text: text = text.replace('</head>', '<link rel="stylesheet" href="/seo-resources.css?v=1"/>\n</head>')
    return text
for language, data in CONTENT.items():
    prefix = 'es/' if language == 'es' else ''
    shell = (ROOT / (prefix+'blog.html')).read_text()
    # Remove managed blocks from the source shell before constructing the policy.
    shell = re.sub(r'<!-- SEO:[^:]+:START -->[\s\S]*?<!-- SEO:[^:]+:END -->\n?', '', shell)
    policy_url = 'https://stonehavencre.com/'+prefix+'editorial-policy'
    shell = re.sub(r'<title>.*?</title>', '<title>'+data['policy_title']+' | Stonehaven Lending</title>', shell)
    shell = re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*', lambda m: m[1]+data['policy_desc'], shell)
    shell = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m[1]+data['policy_title'], shell)
    # Change metadata destinations only; preserve navigation back to management.
    shell = re.sub(r'(<(?:link|meta) [^>]*(?:href|content)="https://stonehavencre.com/(?:es/)?)(?:management|blog)"', r'\1editorial-policy"', shell)
    shell = re.sub(r'<script type="application/ld\+json">[\s\S]*?</script>', '', shell)
    schema = {'@context':'https://schema.org','@type':'WebPage','name':data['policy_title'],'description':data['policy_desc'],'url':policy_url,'inLanguage':language,'publisher':{'@id':'https://stonehavencre.com/#org'}}
    shell = shell.replace('</head>', '<script type="application/ld+json">'+json.dumps(schema,ensure_ascii=False)+'</script>\n</head>')
    main = '<main><section class="funnel-hero"><span class="eyebrow">Stonehaven Lending</span><h1>'+data['policy_title']+'</h1><p>'+data['policy_desc']+'</p></section><section class="tight"><div class="wrap"><article class="prose seo-policy">'+data['policy_body']+'</article></div></section></main>'
    shell = re.sub(r'<main>[\s\S]*?</main>', lambda _: main, shell)
    shell = shell.replace('href="/es/management" style="color:var(--stone-400);"', 'href="/es/editorial-policy" style="color:var(--stone-400);"').replace('href="/management" style="color:var(--stone-400);"', 'href="/editorial-policy" style="color:var(--stone-400);"')
    shell = shell.replace('href="/es/blog" style="color:var(--stone-400);"', 'href="/es/editorial-policy" style="color:var(--stone-400);"').replace('href="/blog" style="color:var(--stone-400);"', 'href="/editorial-policy" style="color:var(--stone-400);"')
    (ROOT/(prefix+'editorial-policy.html')).write_text(stylesheet(shell))
    for target in data['resource_pages']:
        path=ROOT/(prefix+target+'.html');text=path.read_text()
        insertion='<section class="lead' if '<section class="lead' in text else '</main>'
        path.write_text(stylesheet(block(text,'HELOC-RESOURCES',data['resources'],insertion)))
    for target, content in data['article_blocks'].items():
        path=ROOT/(prefix+target+'.html');text=path.read_text()
        path.write_text(stylesheet(block(text,'INVESTOR-REVIEW',content,'</article>')))
    for target in ['dscr','dscr-analyzer','dscr-program-calculator']:
        path=ROOT/(prefix+target+'.html');text=path.read_text()
        insertion='<section class="lead' if '<section class="lead' in text else '</main>'
        path.write_text(stylesheet(block(text,'DSCR-RESOURCES',data['dscr_resources'],insertion)))
    for target in (['blog'] if prefix else ['management','blog']):
        path=ROOT/(prefix+target+'.html');text=path.read_text()
        path.write_text(stylesheet(block(text,'EDITORIAL',data['policy_link'],'</main>')))
    for path in (ROOT/prefix/'blog').glob('*.html'):
        text=path.read_text()
        if 'class="editorial-note"' not in text: text=text.replace('</article>', data['article_policy_link']+'\n</article>',1)
        path.write_text(stylesheet(text))
print('Bilingual resource blocks and editorial policies generated.')
