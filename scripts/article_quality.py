"""Render explicitly revised, existing bilingual articles from retained briefs.

Publication dates, routes, inquiry sections and tracking remain unchanged. Only
briefs with contentRevision opt in; this never creates or republishes a post.
"""
import json
import re
from datetime import date
from html import escape, unescape
from pathlib import Path
from search_metadata import set_meta


def load_revisions(root):
    revisions = {}
    for file in sorted((Path(root) / 'docs/blog-briefs').glob('*.json')):
        brief = json.loads(file.read_text())
        if not brief.get('contentRevision'):
            continue
        updated = brief['contentRevision']['updated']
        if not brief['date'] <= updated <= date.today().isoformat():
            raise ValueError(f'Invalid revision date: {file}')
        for lang in ('en', 'es'):
            route = ('/es' if lang == 'es' else '') + '/blog/' + brief['slug']
            if not (Path(root) / (route.lstrip('/') + '.html')).exists():
                raise ValueError(f'Revision cannot create a new article: {route}')
            revisions[route] = (brief, lang)
    return revisions


def transform(text, path, revisions):
    if path not in revisions:
        return text
    brief, lang = revisions[path]
    content = brief[lang]
    updated = brief['contentRevision']['updated']
    label = 'Actualizado' if lang == 'es' else 'Updated'
    overview = 'Resumen de la guía' if lang == 'es' else 'Guide overview'
    # Retain the article element and all surrounding forms, disclosures and CTAs.
    rows = ''.join('<tr><th scope="row">' + escape(k) + '</th><td>' + escape(v) + '</td></tr>' for k, v in content['terms'])
    body = '<table><caption>' + overview + '</caption><tbody>' + rows + '</tbody></table>\n'
    for item in content['body']:
        if isinstance(item, dict):
            level = item.get('level', 2)
            if level not in (2, 3):
                raise ValueError('Article headings must be H2 or H3')
            body += f'<h{level} style="margin-top:28px;font-size:{22 if level == 2 else 18}px;">' + escape(item['h']) + f'</h{level}>\n'
        elif item.startswith('<table') and len(re.findall(r'<th\b', item.split('</thead>')[0])) >= 3:
            caption = re.search(r'<caption>(.*?)</caption>', item)
            accessible_name = unescape(re.sub(r'<[^>]+>', '', caption[1])) if caption else ('Comparación de financiamiento' if lang == 'es' else 'Financing comparison')
            hint = 'Si es necesario, deslice la tabla para ver todas las columnas.' if lang == 'es' else 'If needed, scroll the table horizontally to see every column.'
            table = item.replace('<table>', '<table style="min-width:480px!important;table-layout:auto!important;">', 1)
            body += '<p class="fine">' + hint + '</p><div class="article-table-scroll" role="region" tabindex="0" aria-label="' + escape(accessible_name, quote=True) + '" style="overflow-x:auto;max-width:100%;margin:18px 0;">' + table + '</div>\n'
        elif re.match(r'<(?:table|div|ul|ol|aside)\b', item):
            body += item + '\n'
        else:
            body += '<p style="margin-top:16px;">' + item + '</p>\n'
    text, count = re.subn(r'(<article\b[^>]*class="blog-article"[^>]*>).*?(</article>)', lambda m: m[1] + '\n' + body + m[2], text, flags=re.S)
    if count != 1:
        raise ValueError(f'Expected one article: {path}')

    def hero(match):
        block = re.sub(r'<h1>.*?</h1>', '<h1>' + escape(content['title']) + '</h1>', match[0], count=1, flags=re.S)
        block = re.sub(r'(<h1>.*?</h1>)<p>.*?</p>', lambda m: m[1] + '<p>' + escape(content['desc']) + '</p>', block, count=1, flags=re.S)
        byline = '<a href="/management">Stonehaven Lending</a> · ' + brief['date'] + ' · ' + label + ' <time datetime="' + updated + '">' + updated + '</time>'
        return re.sub(r'(<p style="font-size:13px;[^>]*>).*?(</p>)', lambda m: m[1] + byline + m[2], block, count=1, flags=re.S)
    text = re.sub(r'<section class="funnel-hero">.*?</section>', hero, text, count=1, flags=re.S)
    text = set_meta(text, 'description', content['desc'], 'name')
    text = set_meta(text, 'og:description', content['desc'])
    text = set_meta(text, 'twitter:description', content['desc'], 'name')

    def structured(match):
        data = json.loads(match[1])
        if data.get('@type') == 'BlogPosting':
            data.update(headline=content['title'], description=content['desc'], dateModified=updated)
            data['citation'] = brief['contentRevision']['citations']
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'
    return re.sub(r'<script type="application/ld\+json">(.*?)</script>', structured, text, flags=re.S)


def update_sitemap(text, revisions):
    def update(match):
        block = match[0]
        loc = re.search(r'<loc>https://stonehavencre.com([^<]+)</loc>', block)
        if not loc or loc[1] not in revisions:
            return block
        value = '<lastmod>' + revisions[loc[1]][0]['contentRevision']['updated'] + '</lastmod>'
        return re.sub(r'<lastmod>.*?</lastmod>', value, block) if '<lastmod>' in block else block.replace('</loc>', '</loc>' + value, 1)
    return re.sub(r'<url>.*?</url>', update, text, flags=re.S)
