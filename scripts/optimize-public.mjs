// Optimize delivery without rewriting content, form markup or privacy boundaries.
import {readFileSync} from 'node:fs';
import {resolve, relative, sep} from 'node:path';
import {createHash} from 'node:crypto';

const protectedPages = new Set(['heloc-application.html', 'request-received.html']);
const cache = new Map();
function read(file) {
  if (!cache.has(file)) cache.set(file, readFileSync(file, 'utf8'));
  return cache.get(file);
}
function attribute(tag, name) {
  return tag.match(new RegExp('\\b' + name + '\\s*=\\s*["\']([^"\']*)["\']', 'i'))?.[1];
}
export function optimizePublic(html, file, root = process.cwd()) {
  if (!html.includes('</head>') || protectedPages.has(file.replaceAll('\\', '/')) || html.includes('id="home-styles"') || html.includes('data-site-performance')) return html;
  const page = new URL(file, 'https://site.invalid/');
  const asset = href => {
    const url = new URL(href, page);
    if (url.origin !== page.origin) return null;
    const path = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (relative(root, path).startsWith('..' + sep)) throw new Error('Asset outside public root');
    return {url, path};
  };
  let hasFonts = false;
  html = html.replace(/<link\b[^>]*>/gi, tag => {
    const href = attribute(tag, 'href'), rel = attribute(tag, 'rel');
    if (!href) return tag;
    if (/^https:\/\/fonts\.(googleapis|gstatic)\.com/.test(href)) {
      if (href.includes('fonts.googleapis.com/css') && rel === 'stylesheet') {
        // Only the two existing, licensed font families have local equivalents.
        const families = [...href.matchAll(/family=([^:&]+)/g)].map(m => m[1]);
        if (!families.length || families.some(f => !['Cormorant', 'Inter'].includes(f))) return tag;
        if (hasFonts) return '';
        hasFonts = true;
        const fonts = read(resolve(root, 'home-fonts.css')).replaceAll('font-weight: 300 500', 'font-weight: 100 900');
        // Prioritize the hero fonts. The italic face remains available through
        // @font-face, but should not compete for bandwidth on every article.
        const hero = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i)?.[0] || '';
        const names = ['inter-normal', 'cormorant-normal'];
        if (/<(?:em|i)\b/i.test(hero)) names.push('cormorant-italic');
        const preload = names.map(name => `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/fonts/${name}-latin-20261018.woff2">`).join('');
        return preload + '<style data-site-performance="fonts">' + fonts + '</style>';
      }
      // Remove only redundant preconnects and preload copies of these fonts.
      if (rel === 'preconnect' || (rel === 'preload' && attribute(tag, 'as') === 'style')) return '';
      return tag;
    }
    if (rel !== 'stylesheet' || /\b(disabled|integrity|onload)\b/i.test(tag)) return tag;
    const item = asset(href);
    if (!item || !item.url.pathname.endsWith('.css')) return tag;
    let css = read(item.path);
    // External styles have URL-relative semantics; retain them when embedded.
    css = css.replace(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/g, (all, quote, value) => {
      if (/^(?:data:|https?:|\/|#)/i.test(value)) return all;
      const url = new URL(value, item.url);
      return 'url(' + quote + url.pathname + url.search + url.hash + quote + ')';
    });
    if (/@import\b/i.test(css) || /<\/style/i.test(css)) throw new Error('Unsupported inline stylesheet: ' + href);
    const media = attribute(tag, 'media');
    return '<style data-site-performance="' + item.url.pathname + '"' + (media ? ' media="' + media + '"' : '') + '>' + css + '</style>';
  });
  // Never add vendors to a page that did not already initialize marketing.
  if (/src=["'][^"']*\/funnel\.js(?:\?|["'])/.test(html) && /src=["'][^"']*\/site-config\.js(?:\?|["'])/.test(html)) {
    html = html.replace(/<script\b[^>]*src=["'][^"']*\/site-config\.js[^"']*["'][^>]*><\/script>/, tag => '<script src="/js/home-vendors.js?v=1" defer></script>\n' + tag);
    html = html.replace(/(<script\b[^>]*src=["'])([^"']*\/(?:site-config|funnel)\.js)(?:\?[^"']*)?(["'])/g, (all, start, src, end) => {
      const version = createHash('sha256').update(read(asset(src).path)).digest('hex').slice(0,12);
      return start + src + '?v=' + version + end;
    });
  }
  return html;
}
