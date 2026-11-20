// Render the public header after content generation. Focused page headers keep
// their original destinations, including the link-free secure application.
const origin = 'https://stonehavencre.com';

function localPath(value) {
  if (!value || value === '#') return '';
  const url = new URL(value, origin);
  return url.origin === origin ? url.pathname + url.search + url.hash : '';
}

function attribute(tag, name) {
  return tag.match(new RegExp('\\s' + name + '="([^"]*)"', 'i'))?.[1] || '';
}

function languageLink(html, header, es, full) {
  const lang = es ? 'en' : 'es';
  const tags = header.match(/<a\b[^>]*>/gi) || [];
  if (full) tags.push(...(html.match(/<link\b[^>]*>/gi) || []).filter(t => attribute(t, 'rel') === 'alternate'));
  const tag = tags.find(t => attribute(t, 'hreflang') === lang && localPath(attribute(t, 'href')));
  const path = tag ? localPath(attribute(tag, 'href')) : '';
  if (!path && !full) return '';
  const fallback = es ? '/' : '/es/';
  const label = path ? (es ? 'English' : 'Español') : (es ? 'English homepage' : 'Inicio en español');
  return `<a href="${path || fallback}" hreflang="${lang}" lang="${lang}">${label}</a>`;
}

function brand(es, linked) {
  const images = '<img class="sh-sign-mark" src="/assets/design/stonehaven-mark-72.webp" srcset="/assets/design/stonehaven-mark-72.webp 72w, /assets/design/stonehaven-mark.webp 144w" sizes="40px" width="144" height="176" alt="">' +
    '<img class="sh-sign-word" src="/assets/design/stonehaven-wordmark-288.webp" srcset="/assets/design/stonehaven-wordmark-288.webp 288w, /assets/design/stonehaven-wordmark.webp 615w" sizes="(max-width:480px) 144px, 175px" width="615" height="128" alt="Stonehaven Lending">';
  return linked
    ? `<a class="sh-sign" href="${es ? '/es/' : '/'}" aria-label="${es ? 'Stonehaven Lending, inicio' : 'Stonehaven Lending home'}">${images}</a>`
    : `<span class="sh-sign">${images}</span>`;
}

function pageLinks(items, file) {
  const current = '/' + file.replace(/(?:^|\/)index\.html$/, match => match.startsWith('/') ? '/' : '').replace(/\.html$/, '');
  return items.map(([path, label]) =>
    `<a href="${path}"${path === current ? ' aria-current="page"' : ''}>${label}</a>`
  ).join('');
}

function mainNavigation(es, utilities, file) {
  const prefix = es ? '/es' : '';
  const financing = [
    ['/commercial/construction-loans', 'Ground-up construction', 'Construcción desde cero'],
    ['/commercial/multifamily', 'Multifamily financing', 'Financiamiento multifamiliar'],
    ['/commercial', 'Commercial real estate', 'Bienes raíces comerciales'],
    ['/dscr', 'DSCR rental loans', 'Préstamos DSCR para alquileres'],
    ['/residential', 'Residential mortgages', 'Hipotecas residenciales'],
    ['/sba', 'SBA financing', 'Financiamiento SBA']
  ].map(([path, en, spanish]) => [prefix + path, es ? spanish : en]);
  const primary = [
    [prefix + '/blog', es ? 'Guías' : 'Insights'],
    ['/management', es ? 'La firma' : 'Our firm'],
    [prefix + '/contact', es ? 'Contacto' : 'Contact']
  ];
  const programs = pageLinks(financing, file);
  const pages = pageLinks(primary, file);
  const navLabel = es ? 'Navegación principal' : 'Main navigation';
  return `<div class="sh-header-stack">
    <div class="sh-utility">${utilities}</div>
    <nav class="sh-primary" aria-label="${navLabel}">
      <button class="sh-financing-trigger" type="button" popovertarget="sh-financing-menu">${es ? 'Financiamiento' : 'Financing'} <span class="sh-caret" aria-hidden="true"></span></button>
      <div id="sh-financing-menu" class="sh-dropdown" popover="auto">${programs}</div>
      ${pages}
    </nav>
  </div>
  <div class="sh-mobile">
    <button type="button" class="sh-mobile-trigger" popovertarget="sh-mobile-menu">${es ? 'Menú' : 'Menu'} <span class="sh-burger" aria-hidden="true"></span></button>
    <nav class="sh-mobile-panel" id="sh-mobile-menu" popover="auto" aria-label="${navLabel}">${programs}${pages}${utilities}</nav>
  </div>`;
}

export function renderHeader(html, file) {
  const es = file.replaceAll('\\', '/').startsWith('es/');
  return html.replace(/<header class="(nav(?: solid)?|fo-head|lp-head|page-header)"[^>]*>[\s\S]*?<\/header>/, (old, kind) => {
    const full = /<nav\b/.test(old);
    const secure = kind === 'page-header';
    const style = kind.startsWith('nav') ? 'fixed' : (kind === 'fo-head' ? 'sticky' : 'flow');
    const phone = old.includes('href="tel:+14709704979"') ? '<a href="tel:+14709704979">(470) 970-4979</a>' : '';
    const utilities = phone + languageLink(html, old, es, full);
    // The application identifies the flow in its header and has no outbound links.
    const trailing = secure ? old.match(/<div class="header-label">[\s\S]*?<\/div>/)?.[0] || '' : '';
    const controls = full ? mainNavigation(es, utilities, file) : (utilities ? `<div class="sh-utility sh-utility-compact">${utilities}</div>` : '');
    return `<header class="sh-site-header sh-header-${style}${full ? '' : ' sh-header-focused'}"${style === 'fixed' ? ' id="nav"' : ''}><div class="sh-header-row">${brand(es, !secure)}${controls}${trailing}</div></header>`;
  });
}
