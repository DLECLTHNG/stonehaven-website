#!/usr/bin/env python3
"""Build commercial HUD guides from retained bilingual editorial briefs."""
import json
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def build():
    spec = spec_from_file_location('cre_renderer', ROOT / 'scripts/build-small-multifamily.py')
    renderer = module_from_spec(spec)
    spec.loader.exec_module(renderer)
    source = json.loads((ROOT / 'docs/hud-financing/services.json').read_text())
    sitemap = (ROOT / 'sitemap.xml').read_text()
    redirects = (ROOT / '_redirects').read_text()
    count = 0
    for slug, languages in source['pages'].items():
        if set(languages) != {'en', 'es'}:
            raise ValueError(f'{slug}: both languages are required')
        for lang, content in languages.items():
            prefix = '/es' if lang == 'es' else ''
            route = prefix + '/commercial/' + slug
            (ROOT / (route.lstrip('/') + '.html')).write_text(
                renderer.render(slug, lang, content, source['updated']))
            loc = 'https://stonehavencre.com' + route
            if f'<loc>{loc}</loc>' not in sitemap:
                sitemap = sitemap.replace('</urlset>', f'<url><loc>{loc}</loc><lastmod>{source["updated"]}</lastmod></url>\n</urlset>')
            redirect = f'{route}.html {route} 301!'
            if redirect not in redirects.splitlines():
                redirects = redirects.rstrip() + '\n' + redirect + '\n'
            count += 1
    (ROOT / 'sitemap.xml').write_text(sitemap)
    (ROOT / '_redirects').write_text(redirects)
    print(f'Built {count} bilingual commercial HUD pages.')


if __name__ == '__main__':
    build()
