"""Maintain visible financing explanations on existing bilingual service pages."""
from pathlib import Path
from html import escape
import json
import re

CONTENT = json.loads(Path(__file__).with_name('search-answer-content.json').read_text())
START = '<!-- FINANCING-ANSWER:START -->'
END = '<!-- FINANCING-ANSWER:END -->'


def transform(text, path):
    es = path.startswith('/es/')
    local = path[3:] if es else path
    if local not in CONTENT:
        return text.replace('<link rel="stylesheet" href="/financing-answers.css?v=1"/>', '')
    text = re.sub(re.escape(START) + '.*?' + re.escape(END), '', text, flags=re.S)
    c = CONTENT[local]['es' if es else 'en']
    cells = ''.join('<tr>' + ''.join(
        ('<th scope="row">' + escape(cell) + '</th>') if i == 0 else
        ('<td>' + escape(cell) + '</td>') for i, cell in enumerate(row)) + '</tr>' for row in c['rows'])
    wide = len(c['columns']) > 2
    hint = '<p class="financing-table-hint">' + ('Deslice la tabla para ver todas las columnas.' if es else 'Scroll sideways to compare all columns.') + '</p>' if wide else ''
    table = hint + '<div class="financing-table' + (' financing-table-wide' if wide else '') + '" role="region" aria-labelledby="financing-answer-title" tabindex="0"><table><caption>' + escape(c['heading']) + '</caption><thead><tr>'
    table += ''.join('<th scope="col">' + escape(col) + '</th>' for col in c['columns'])
    table += '</tr></thead><tbody>' + cells + '</tbody></table></div>'
    block = START + '<section class="tight financing-answer" aria-labelledby="financing-answer-title"><div class="wrap"><div class="financing-answer-inner"><h2 id="financing-answer-title">' + escape(c['heading']) + '</h2><p>' + escape(c['intro']) + '</p>' + table + c['after'] + '<p class="financing-source">' + c['source'] + '</p></div></div></section>' + END
    # Place answers near the existing summary, before later promotional blocks.
    anchor = text.find('id="answer"')
    if anchor < 0:
        anchor = text.index('<main>')
    end = text.index('</section>', anchor) + len('</section>')
    text = text[:end] + block + text[end:]
    if 'href="/financing-answers.css?v=1"' not in text:
        text = text.replace('</head>', '<link rel="stylesheet" href="/financing-answers.css?v=1"/></head>')
    return text
