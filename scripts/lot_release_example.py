"""Progressively enhance the worked lot sale on its two existing article pages."""
from html import escape

SLUG = '/blog/subdivision-loan-lot-release-prices'
CSS = '<link rel="stylesheet" href="/lot-release.css?v=1"/>'
JS = '<script src="/js/lot-release.js?v=1" defer></script>'


def add_editor(html, path):
    if path not in (SLUG, '/es' + SLUG):
        return html
    es = path.startswith('/es/')
    fields = [
        ('sale', 180000, 'Gross lot sale price', 'Precio bruto de venta del lote'),
        ('costs', 9000, 'Selling and closing costs', 'Gastos de venta y cierre'),
        ('release', 125000, 'Required release payment', 'Pago exigido para liberar el lote'),
        ('start', 60000, 'Cash needed before the next draw', 'Efectivo necesario antes del próximo desembolso'),
    ]
    inputs = ''
    for key, value, en_label, es_label in fields:
        label = escape(es_label if es else en_label)
        inputs += f'<label for="lr-{key}">{label}<input type="number" inputmode="decimal" min="0" step="0.01" required id="lr-{key}" value="{value}"/></label>'
    title = 'Calcule el efectivo disponible para su próxima obra' if es else 'See what one lot sale leaves for your next build'
    hint = 'Cambie los importes en dólares. Use el pago de liberación que exige su contrato.' if es else 'Change any amount in dollars. Use the release payment in your loan agreement.'
    reset = 'Restablecer el ejemplo' if es else 'Reset example'
    editor = f'''<section class="release-example" id="lot-release-example" aria-labelledby="lr-title" hidden>
<h3 id="lr-title">{title}</h3><p>{hint}</p><div class="release-inputs">{inputs}</div>
<div class="release-totals" role="status" aria-live="polite" aria-atomic="true"><p id="lr-error" hidden></p>
<dl id="lr-results"><div><dt id="lr-net-label"></dt><dd id="lr-net"></dd></div><div><dt id="lr-gap-label"></dt><dd id="lr-gap"></dd></div></dl></div>
<button type="button" id="lr-reset">{reset}</button></section>'''
    html = html.replace(CSS, '').replace(JS, '').replace('</head>', CSS + JS + '</head>')
    marker = '<table id="lot-release-table">'
    if html.count(marker) != 1:
        raise ValueError('Missing the worked lot sale table: ' + path)
    return html.replace(marker, editor + marker)
