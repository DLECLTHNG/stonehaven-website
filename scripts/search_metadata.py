"""Idempotent metadata maintenance shared by the final search-navigation build.

This module does not publish pages or change visible article headings. Curated
search titles are retained in publisher briefs where those original briefs exist.
"""
from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ORIGIN = 'https://stonehavencre.com'
ORG_ID = ORIGIN + '/#org'
ORG_EMAIL = 'office@stonehavencre.com'
ORG_LOGO = ORIGIN + '/assets/stonehaven-logo-512-v1.webp'
SOCIAL_IMAGE = ORIGIN + '/assets/stonehaven-social-v1.jpg'
NMLS = {'@type': 'PropertyValue', 'propertyID': 'NMLS', 'value': '1752355'}


class HeadMetadata(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.meta = {}
        self.canonical = None
        self.alternates = {}
        self.in_head = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'head':
            self.in_head = True
        if not self.in_head:
            return
        if tag == 'meta':
            key = attrs.get('property') or attrs.get('name')
            if key:
                self.meta[key.lower()] = attrs.get('content', '')
        if tag == 'link':
            rel = attrs.get('rel', '').lower().split()
            if 'canonical' in rel:
                self.canonical = attrs.get('href')
            if 'alternate' in rel and attrs.get('hreflang'):
                self.alternates[attrs['hreflang']] = attrs.get('href')

    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False

    @property
    def indexable(self):
        return 'noindex' not in self.meta.get('robots', '').lower()


def load_title_overrides(root):
    """Keep legacy title decisions explicit; publisher metaTitle wins for briefs."""
    root = Path(root)
    titles = json.loads((root / 'scripts/search-title-overrides.json').read_text())
    briefs = sorted((root / 'docs/blog-briefs').glob('*.json'))
    briefs += sorted((root / 'docs/state-blog-rollout/briefs').glob('*.json'))
    for file in briefs:
        brief = json.loads(file.read_text())
        slug = brief.get('slug')
        if not slug:
            continue
        for language in ('en', 'es'):
            meta_title = brief.get(language, {}).get('metaTitle')
            if meta_title:
                path = ('/es' if language == 'es' else '') + '/blog/' + slug
                titles[path] = meta_title
    return titles


def normalize_entities(text, path):
    def walk(data):
        if isinstance(data, list):
            for node in data:
                walk(node)
        elif isinstance(data, dict):
            kinds = data.get('@type', [])
            kinds = [kinds] if isinstance(kinds, str) else kinds
            if any(kind in kinds for kind in ['Organization', 'FinancialService']) and data.get('name') == 'Stonehaven Lending':
                data['@id'] = ORG_ID
                data['email'] = ORG_EMAIL
                if data.get('image') == ORIGIN + '/assets/stonehaven-handpainted-logo.png':
                    data['image'] = ORG_LOGO
                identifiers = data.get('identifier')
                if not identifiers:
                    data['identifier'] = dict(NMLS)
                else:
                    identifiers = identifiers if isinstance(identifiers, list) else [identifiers]
                    # Preserve unrelated IDs if another verified identifier is added later.
                    others = [item for item in identifiers if not (isinstance(item, dict) and item.get('propertyID') == 'NMLS')]
                    data['identifier'] = others + [dict(NMLS)] if others else dict(NMLS)
                if isinstance(data.get('logo'), dict):
                    data['logo']['url'] = ORG_LOGO
                    # Existing dimensions must describe the derivative, not the original.
                    for key in ('width', 'height'):
                        if key in data['logo']:
                            data['logo'][key] = 512
                else:
                    data['logo'] = ORG_LOGO
            if 'Person' in kinds and data.get('name') in ['Chris De Leeuw', 'Christiaan De Leeuw', 'Dawn M. Muñoz']:
                chris = data['name'] != 'Dawn M. Muñoz'
                data['@id'] = ORIGIN + '/management#' + ('chris-de-leeuw' if chris else 'dawn-munoz')
                data['url'] = data['@id']
                if chris:
                    data['name'] = 'Chris De Leeuw'
            if any(kind in kinds for kind in ['Article', 'BlogPosting']) and data.get('headline'):
                url = data.get('url')
                if not url and ('dateModified' in data or 'mainEntityOfPage' in data):
                    url = ORIGIN + path
                if isinstance(url, str) and url.startswith(ORIGIN + '/'):
                    data.setdefault('@id', url + '#article')
                    data.setdefault('mainEntityOfPage', {'@type': 'WebPage', '@id': url})
            for value in list(data.values()):
                walk(value)

    def replace(match):
        data = json.loads(match[1])
        walk(data)
        return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script>'
    return re.sub(r'<script type="application/ld\+json">(.*?)</script>', replace, text, flags=re.S)


def set_meta(text, key, value, attribute='property'):
    """Replace the specific tag, leaving unrelated metadata and page text intact."""
    tag = '<meta ' + attribute + '="' + key + '" content="' + escape(value, quote=True) + '"/>'
    pattern = r'<meta\b(?=[^>]*\b(?:name|property)\s*=\s*([\'\"])' + re.escape(key) + r'\1)[^>]*>'
    if re.search(pattern, text, flags=re.I):
        return re.sub(pattern, lambda _: tag, text, flags=re.I)
    return text.replace('</head>', tag + '\n</head>', 1)


def normalize_page_metadata(text, path, title_overrides):
    text = normalize_entities(text, path)
    metadata = HeadMetadata(text)
    if metadata.indexable and path in title_overrides:
        text = re.sub(r'<title>.*?</title>', '<title>' + escape(title_overrides[path]) + '</title>', text, count=1, flags=re.S)
    title_match = re.search(r'<title>(.*?)</title>', text, re.S)
    title = unescape(title_match[1]) if title_match else ''
    # Populate sharing metadata only for actual canonical, indexable pages.
    # Existing sharing images on campaign pages can still use the smaller asset.
    if metadata.indexable and metadata.canonical == ORIGIN + path:
        values = {
            'og:type': 'article' if '/blog/' in path else metadata.meta.get('og:type', 'website'),
            'og:site_name': 'Stonehaven Lending',
            'og:title': metadata.meta.get('og:title') or title,
            'og:description': metadata.meta.get('og:description') or metadata.meta.get('description', ''),
            'og:url': metadata.canonical,
            'og:image': SOCIAL_IMAGE,
            'og:image:width': '1200',
            'og:image:height': '630',
            'og:image:type': 'image/jpeg',
            'og:image:alt': 'Stonehaven Lending, Residential and Commercial',
        }
        # Short search titles do not replace the descriptive H1 or article headline.
        # Keep existing social titles unless the page previously lacked one.
        for key, value in values.items():
            if value:
                text = set_meta(text, key, value)
    elif 'og:image' in metadata.meta:
        for key, value in {'og:image': SOCIAL_IMAGE, 'og:image:width': '1200', 'og:image:height': '630', 'og:image:type': 'image/jpeg'}.items():
            text = set_meta(text, key, value)
    if 'twitter:image' in metadata.meta:
        text = set_meta(text, 'twitter:image', SOCIAL_IMAGE, attribute='name')
    return text


def normalize_sitemap(text, page_texts):
    """Add reciprocal alternates only when both canonical pages really exist.

    Preserve URL order, lastmod and other sitemap facts; do not manufacture a
    translation or index a noindex page based only on a matching filename.
    """
    tree = ET.fromstring(text)
    sitemap_ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    urls = {node.findtext(sitemap_ns + 'loc') for node in tree.findall(sitemap_ns + 'url')}
    pages = {path: HeadMetadata(page) for path, page in page_texts.items()}
    pairs = {}
    for path, metadata in pages.items():
        if path.startswith('/es/') or not metadata.indexable or metadata.canonical != ORIGIN + path:
            continue
        es_path = '/es' + path
        spanish = pages.get(es_path)
        if not spanish or not spanish.indexable or spanish.canonical != ORIGIN + es_path:
            continue
        english_url, spanish_url = ORIGIN + path, ORIGIN + es_path
        if english_url not in urls or spanish_url not in urls:
            continue
        if metadata.alternates.get('es') != spanish_url or spanish.alternates.get('en') != english_url:
            continue
        alternates = {'en': english_url, 'es': spanish_url, 'x-default': english_url}
        pairs[english_url] = pairs[spanish_url] = alternates

    def replace(match):
        block = re.sub(r'\s*<xhtml:link\b[^>]*/>', '', match[0])
        loc = re.search(r'<loc>(.*?)</loc>', block)
        if not loc or unescape(loc[1]) not in pairs:
            return block
        alternates = pairs[unescape(loc[1])]
        links = ''.join('<xhtml:link rel="alternate" hreflang="' + lang + '" href="' + escape(url, quote=True) + '"/>' for lang, url in alternates.items())
        # Insert after the date when present to keep the existing one-line format.
        anchor = '</lastmod>' if '</lastmod>' in block else '</loc>'
        return block.replace(anchor, anchor + links, 1)

    result = re.sub(r'<url>.*?</url>', replace, text, flags=re.S)
    if pairs and 'xmlns:xhtml=' not in result:
        result = result.replace('<urlset ', '<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" ', 1)
    ET.fromstring(result)  # Fail closed rather than writing malformed XML.
    return result
