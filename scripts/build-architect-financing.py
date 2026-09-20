#!/usr/bin/env python3
"""Build bilingual architect pages using the shared CRE renderer and lead contract."""
from html import escape
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent


def e(value):
    return escape(str(value), quote=True)


def field(name, label, kind='text', required=False, options=None, full=False):
    ident = 'architect-' + name
    attrs = ' required' if required else ''
    auto = {'name': 'name', 'email': 'email', 'phone': 'tel', 'firm': 'organization'}.get(name)
    if auto:
        attrs += f' autocomplete="{auto}"'
    if kind == 'number':
        attrs += ' min="1" step="1" inputmode="numeric"'
    if options is not None:
        control = f'<select id="{ident}" name="{name}"{attrs}>' + ''.join(
            f'<option value="{e(value)}">{e(text)}</option>' for value, text in options) + '</select>'
    elif kind == 'textarea':
        control = f'<textarea id="{ident}" name="{name}" rows="3" maxlength="300"{attrs}></textarea>'
    else:
        control = f'<input id="{ident}" name="{name}" type="{kind}"{attrs}/>'
    return f'<div class="lf-field{" full" if full else ""}"><label for="{ident}">{e(label)}</label>{control}</div>'


def inquiry(slug, lang, content):
    es = lang == 'es'
    prefix = '/es' if es else ''
    def label(en, spanish):
        return spanish if es else en
    def choices(items):
        return [('', label('Choose an option', 'Seleccione una opción'))] + [(value, label(value, spanish)) for value, spanish in items]
    fields = field('name', label('Your name', 'Su nombre'), required=True)
    fields += field('firm', label('Your firm (optional)', 'Su firma (opcional)'))
    fields += field('email', label('Your email', 'Su correo electrónico'), 'email', True)
    fields += field('phone', label('Your mobile number', 'Su número de celular'), 'tel', True)
    fields += field('partner_role', label('Your role', 'Su función'), required=True, full=True, options=choices([
        ('Architect', 'Arquitecto/a'), ('Design-build professional', 'Profesional de diseño y construcción'),
        ('Developer / property owner', 'Desarrollador/a o propietario/a'), ('Other project adviser', 'Otro asesor del proyecto')]))
    contact_fields = fields
    fields = ''
    fields += field('project_type', label('Project type (optional)', 'Tipo de proyecto (opcional)'), options=choices([
        ('Ground-up / spec construction', 'Obra nueva o construcción para venta'), ('Teardown and rebuild', 'Demolición y reconstrucción'),
        ('Multifamily development', 'Desarrollo multifamiliar'), ('Mixed-use development', 'Desarrollo de uso mixto'),
        ('Commercial renovation / adaptive reuse', 'Renovación comercial o cambio de uso'),
        ('Other business-purpose project', 'Otro proyecto con fines comerciales'), ('No active project yet', 'Aún sin proyecto activo')]))
    fields += field('state', label('Property state (optional)', 'Estado del inmueble (opcional)'))
    fields += field('project_stage', label('Project stage (optional)', 'Etapa del proyecto (opcional)'), options=choices([
        ('Concept / feasibility', 'Concepto o viabilidad'), ('Design / entitlement', 'Diseño o autorizaciones'),
        ('Permitting / bidding', 'Permisos o licitación'), ('Ready to start construction', 'Listo para iniciar obra'),
        ('Under construction', 'En construcción'), ('Completed / lease-up', 'Terminado o en arrendamiento')]))
    fields += field('total_project_cost', label('Total project cost ($), optional', 'Costo total del proyecto ($), opcional'), 'number')
    fields += field('requested_amount', label('Requested financing ($), optional', 'Financiamiento solicitado ($), opcional'), 'number')
    fields += field('project_value', label('Estimated completed value ($), optional', 'Valor terminado estimado ($), opcional'), 'number')
    fields += field('property_owned', label('Does the client own the property? (optional)', '¿El cliente ya es dueño del inmueble? (opcional)'), options=choices([
        ('Yes', 'Sí'), ('Under contract', 'Bajo contrato'), ('No', 'No'), ('Not yet confirmed', 'Aún sin confirmar')]))
    fields += field('timeline', label('Target financing close (optional)', 'Cierre de financiamiento previsto (opcional)'), options=choices([
        ('As soon as possible', 'Lo antes posible'), ('Within 30 days', 'Dentro de 30 días'), ('30-60 days', '30-60 días'),
        ('60-90 days', '60-90 días'), ('More than 90 days / exploring', 'Más de 90 días o explorando')]))
    fields += field('discovery_source', label('How did you find us? (optional)', '¿Cómo nos encontró? (opcional)'), options=choices([
        ('Google', 'Google'), ('ChatGPT', 'ChatGPT'), ('Bing / Copilot', 'Bing / Copilot'), ('Perplexity', 'Perplexity'),
        ('Other AI assistant', 'Otro asistente de IA'), ('Referral', 'Recomendación'), ('Other', 'Otro')]))
    fields = contact_fields + '<details class="lf-field full architect-project-details"><summary>' + label('Add an active project (optional)', 'Añadir un proyecto activo (opcional)') + '</summary><div class="architect-project-fields">' + fields + '</div></details>'
    fields += field('about', label('Project or partnership question (optional)', 'Pregunta sobre el proyecto o la colaboración (opcional)'), 'textarea', full=True)
    note = label('By submitting, you ask Stonehaven Lending to contact you by text or email about this inquiry. Consent is not a condition of service. Message and data rates may apply; reply STOP to opt out.',
                 'Al enviar, solicita que Stonehaven Lending le contacte por texto o correo sobre esta consulta. El consentimiento no es condición del servicio. Pueden aplicar tarifas de mensajes y datos; responda STOP para cancelar.')
    privacy = label('Use your own contact details. Start with a general project summary and obtain client permission before sharing their information. Keep client names, financial records and private documents out of this form.',
                    'Use sus propios datos de contacto. Empiece con un resumen general y obtenga permiso del cliente antes de compartir su información. No incluya nombres de clientes, registros financieros ni documentos privados en este formulario.')
    residential = label('For a client who will live in the home, use our residential inquiry.', 'Si el cliente vivirá en la vivienda, use nuestra consulta residencial.')
    context = 'Architect financing partner inquiry: ' + slug
    return f'''<section class="lead cre-inquiry" id="inquire"><div class="wrap"><div class="lead-card">
<span class="eyebrow">{label('For architects and project advisers', 'Para arquitectos y asesores de proyectos')}</span>
<h2>{e(content['cta_title'])}</h2><p class="sub">{e(content['cta_intro'])}</p>
<p class="cre-form-fine">{e(label('No active project yet? Share your contact details and the types of projects your firm designs. Project figures can be left blank.', '¿Aún no tiene un proyecto activo? Comparta sus datos y el tipo de proyectos que diseña su firma. Puede dejar los importes en blanco.'))}</p>
<form class="lead-form" data-sh-form="commercial-{slug}" data-sh-product="Commercial" data-sh-event="deal_review_request" data-sh-lang="{lang}" data-sh-about-prefix="{e(context)}" data-sh-thanks="{prefix}/thanks-quote" method="POST" action="{prefix}/thanks-quote" data-netlify="true" netlify-honeypot="company_website">
<input type="hidden" name="form-name" value="lead"/><input type="hidden" name="loan_program" value="Architect financing partnership"/>
<input type="text" name="company_website" class="hp-field" tabindex="-1" autocomplete="off" aria-hidden="true"/>
{fields}<div class="lead-actions"><span class="note">{e(note)} <a href="{prefix}/privacy">{label('Privacy policy', 'Privacidad')}</a></span><button class="lead-submit" type="submit">{label('Start a financing conversation', 'Iniciar una conversación')}</button></div>
</form><p class="cre-form-fine">{e(privacy)}</p><p class="cre-form-fine"><a href="{prefix}/residential">{e(residential)}</a></p>
</div></div></section>'''


def build():
    spec = spec_from_file_location('cre_renderer', ROOT / 'scripts/build-small-multifamily.py')
    renderer = module_from_spec(spec)
    spec.loader.exec_module(renderer)
    source = json.loads((ROOT / 'docs/cre-financing/architect-services.json').read_text())
    count = 0
    for slug, languages in source['pages'].items():
        if set(languages) != {'en', 'es'}:
            raise ValueError(f'{slug}: English and Spanish versions required')
        for lang, content in languages.items():
            page = dict(content, cta_href='#inquire', inquiry_html=inquiry(slug, lang, content))
            html = renderer.render(slug, lang, page, source['updated'])
            html = html.replace('</head>', '<style>.small-multifamily-content ol{padding-left:22px;line-height:1.8;margin:0 0 18px}.architect-project-details{border-block:1px solid var(--line);padding:18px 0}.architect-project-details summary{cursor:pointer;line-height:1.6;color:var(--slate-900)}.architect-project-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-top:24px}@media(max-width:700px){.architect-project-fields{grid-template-columns:1fr}}</style>\n</head>')
            target = ROOT / ('es/' if lang == 'es' else '') / 'commercial' / (slug + '.html')
            target.write_text(html)
            count += 1
    print(f'Built {count} architect financing pages.')


if __name__ == '__main__':
    build()
