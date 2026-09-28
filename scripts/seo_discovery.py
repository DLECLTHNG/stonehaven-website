"""Build factual discovery files from maintained navigation and public pillar text."""
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urljoin
import re

ORIGIN = 'https://stonehavencre.com'
PILLARS = ['/', '/commercial', '/commercial/construction-loans', '/commercial/fix-and-flip',
           '/commercial/land-development-loans',
           '/commercial/bridge-loans', '/commercial/multifamily', '/commercial/mixed-use',
           '/commercial/commercial-property', '/commercial/multifamily-acquisition',
           '/commercial/5-8-unit-financing', '/commercial/georgia',
           '/commercial/architect-financing-partners', '/dscr', '/sba', '/residential', '/residential/jumbo-loans',
           '/bank-statement-loans', '/interest-only-loans', '/editorial-policy']

class MainText(HTMLParser):
    """Preserve article content, headings and links, omitting navigation and form UI."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.main = False
        self.skip = []
        self.out = []
        self.hrefs = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main': self.main = True
        if not self.main: return
        if self.skip:
            if tag == self.skip[-1]: self.skip.append(tag)
            return
        # Void controls cannot open an exclusion scope: there is no closing tag
        # to restore the following public article text.
        if tag in ['input', 'img', 'source', 'br', 'hr', 'wbr', 'area', 'base', 'col', 'embed', 'link', 'meta', 'param', 'track'] and (attrs.get('aria-hidden') == 'true' or 'hidden' in attrs or tag == 'input'):
            return
        if tag in ['script', 'style', 'nav', 'form', 'noscript', 'button', 'select', 'textarea', 'label'] or attrs.get('aria-hidden') == 'true' or 'hidden' in attrs:
            self.skip.append(tag)
            return
        if re.fullmatch('h[1-6]', tag): self.out.append('\n\n' + '#' * (int(tag[1]) + 1) + ' ')
        elif tag in ['p', 'section', 'article', 'div', 'table', 'summary']: self.out.append('\n\n')
        elif tag == 'li': self.out.append('\n- ')
        elif tag == 'br': self.out.append('\n')
        elif tag == 'tr': self.out.append('\n')
        elif tag in ['th', 'td']: self.out.append(' | ')
        elif tag == 'a':
            href = attrs.get('href', '')
            self.hrefs.append(urljoin(self.url, href) if href else '')

    def handle_endtag(self, tag):
        if tag == 'main': self.main = False
        if not self.main: return
        if self.skip:
            if tag == self.skip[-1]: self.skip.pop()
            return
        if tag == 'a' and self.hrefs:
            href = self.hrefs.pop()
            if href: self.out.append(' (' + href + ') ')
        if tag in ['p', 'section', 'article', 'div', 'table'] or re.fullmatch('h[1-6]', tag): self.out.append('\n\n')
        elif tag in ['span', 'small', 'strong', 'summary']: self.out.append(' ')

    def handle_data(self, data):
        if self.main and not self.skip: self.out.append(re.sub(r'\s+', ' ', data))

    def extract(self, html, url):
        self.url = url
        self.feed(html)
        text = re.sub(r'[ \t]+\n', '\n', ''.join(self.out))
        return re.sub(r'\n[ \t]*\n(?:[ \t]*\n)+', '\n\n', text).strip()

def page_file(root, route):
    return root / ('index.html' if route == '/' else route.lstrip('/') + '.html')

def title(path):
    html = path.read_text()
    heading = re.search(r'<h1\b[^>]*>(.*?)</h1>', html, re.S)
    return re.sub(r'\s+', ' ', unescape(re.sub('<[^>]+>', ' ', heading[1]))).strip()

def build_discovery_files(root):
    text = (root / 'docs/seo-implementation/llms-source.txt').read_text()
    text += '\n## DSCR guide series\n\n'
    text += '- [DSCR state guides](https://stonehavencre.com/dscr#state-guides): fifty state guides linked from the DSCR pillar, covering rental underwriting and state-specific considerations. Nationwide program availability varies by state.\n'
    text += '\n### DSCR situations\n\n'
    for path in sorted((root / 'dscr').glob('*.html')):
        if path.stem == 'first-time-investors' or 'noindex' in path.read_text():
            continue
        text += f'- [{title(path)}]({ORIGIN}/dscr/{path.stem})\n'
    (root / 'llms.txt').write_text(text)
    full = '# Stonehaven Lending: public pillar content\n\nLast updated: 2026-09-28.\n\n'
    full += 'Selected public English pillar excerpts for the three promoted business lines. Navigation, input controls, footers and references to other programs are omitted. Excerpts retain their source links. Canonical web pages remain authoritative. This file does not establish indexing, rankings or program eligibility.\n\n'
    for route in PILLARS:
        path = page_file(root, route)
        url = ORIGIN + route
        full += f'---\n\n# {title(path)}\n\nSource: {url}\n\n'
        excerpt = MainText().extract(path.read_text(), url)
        # Omit promotion of retained programs outside the three core lines.
        excluded = re.compile(r'HELOC|\bFHA\b|\bVA\b|Family Opportunity|first-time|first time|non-recourse', re.I)
        excerpt = '\n\n'.join(part for part in excerpt.split('\n\n') if not excluded.search(part))
        full += excerpt + '\n\n'
    (root / 'llms-full.txt').write_text(full)
