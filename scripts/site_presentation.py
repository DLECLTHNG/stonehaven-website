"""Maintain visible reading navigation without changing financing disclosures."""
from html import escape, unescape
import re
import unicodedata


def normalize_presentation(text, path):
    es = path.startswith('/es/')
    text = re.sub(r'(<a\b[^>]*href="/(?:es/)?blog"[^>]*>)(?:Closings|Cierres)(</a>)',
                  lambda m: m[1] + ('Guías y artículos' if es else 'Guides and articles') + m[2], text)
    if '/blog/' not in path and path not in ['/blog', '/es/blog']:
        return text
    text = text.replace('A 15-minute call is enough to tell you what structure fits - honestly, and before you go looking elsewhere.',
                        'Share your financing question for follow-up by text. An initial review is not approval.')
    text = text.replace('Una llamada de 15 minutos basta para decirle qué estructura encaja, con honestidad y antes de que busque en otro lado.',
                        'Comparta su pregunta de financiamiento para recibir seguimiento por mensaje de texto. La revisión inicial no constituye aprobación.')

    # Older educational posts inherited the closed-deal call-booking invitation.
    # Keep each disclosure verbatim and send readers to the relevant review form.
    def cta(match):
        block = match[0]
        if not re.search(r'<h2>(?:Have a Similar Deal\?|¿Tiene [^<]*similar\?|Share your financing scenario|Review your rental property financing|Revise su propiedad de alquiler|Comparta su escenario de financiamiento)</h2>', block, re.I):
            return block
        heading = re.search(r'<h1\b[^>]*>(.*?)</h1>', text, re.S)
        dscr = bool(heading and re.search(r'\bDSCR\b', heading[1], re.I))
        prefix = '/es' if es else ''
        destination = prefix + ('/dscr-review' if dscr else '/contact')
        title = ('Revise su propiedad de alquiler' if dscr else 'Comparta su escenario de financiamiento') if es else ('Review your rental property financing' if dscr else 'Share your financing scenario')
        intro = ('Comparta la propiedad, el financiamiento solicitado y su plan. Le daremos seguimiento por mensaje de texto.' if es else 'Share the property, requested financing and your plan. We follow up by text.')
        button = 'Solicitar una revisión' if es else 'Request a review by text'
        disclosure = re.search(r'<span class="eyebrow">(.*?)</span>', block, re.S)
        if disclosure:
            return '<section class="lead"><div class="wrap"><div class="lead-card"><h2>' + title + '</h2><p class="sub">' + intro + '</p><p><a class="btn-primary" href="' + destination + '">' + button + '</a></p><p class="fine">' + disclosure[1] + '</p></div></div></section>'
        block = re.sub(r'<h2>.*?</h2>', '<h2>' + title + '</h2>', block, count=1, flags=re.S)
        block = re.sub(r'<p class="sub">.*?</p>', '<p class="sub">' + intro + '</p>', block, count=1, flags=re.S)
        block = re.sub(r'(<a class="btn-primary" href=")[^"]+(">)[^<]+</a>', lambda m: m[1] + destination + m[2] + button + '</a>', block, count=1)
        return block
    text = re.sub(r'<section class="lead">.*?</section>', cta, text, flags=re.S)

    def article(match):
        body = re.sub(r'<!-- ARTICLE-TOC:START -->.*?<!-- ARTICLE-TOC:END -->\n?', '', match[0], flags=re.S)
        headings = list(re.finditer(r'<h2\b([^>]*)>(.*?)</h2>', body, re.S))
        if len(headings) < 4:
            return body
        used = set(re.findall(r'\bid="([^"]+)"', body))
        entries = []
        def anchor(h):
            label = ' '.join(unescape(re.sub(r'<[^>]*>', '', h[2])).split())
            existing = re.search(r'\bid="([^"]+)"', h[1])
            if existing:
                ident = existing[1]
                out = h[0]
            else:
                slug = unicodedata.normalize('NFKD', label).encode('ascii', 'ignore').decode().lower()
                base = 'article-' + re.sub(r'[^a-z0-9]+', '-', slug).strip('-')[:80]
                ident, count = base, 2
                while ident in used:
                    ident = base + '-' + str(count); count += 1
                used.add(ident)
                out = '<h2' + h[1] + ' id="' + ident + '">' + h[2] + '</h2>'
            entries.append((ident, label))
            return out
        body = re.sub(r'<h2\b([^>]*)>(.*?)</h2>', anchor, body, flags=re.S)
        label = 'En esta guía' if es else 'In this guide'
        toc = '<!-- ARTICLE-TOC:START --><nav class="article-toc" aria-label="' + label + '"><details><summary>' + label + '</summary><ol>'
        toc += ''.join('<li><a href="#' + escape(ident, quote=True) + '">' + escape(label) + '</a></li>' for ident, label in entries)
        toc += '</ol></details></nav><!-- ARTICLE-TOC:END -->\n'
        return re.sub(r'(<article\b[^>]*>)\s*', lambda m: m[1] + '\n' + toc, body, count=1)
    return re.sub(r'<article\b[^>]*class="blog-article"[^>]*>.*?</article>', article, text, flags=re.S)
