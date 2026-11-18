// Apply the shared visual design to the finished public document. Page generators
// continue to own financing copy, inquiry forms, campaign attribution and scripts.
import {renderHeader} from './design-header.mjs';

const photographs = new Map([
  ['commercial/construction-loans', 'timber-frame'],
  ['commercial/hud-221d4-construction-loans', 'timber-frame'],
  ['commercial', 'courtyard'],
  ['commercial/multifamily', 'courtyard'],
  ['commercial/multifamily-acquisition', 'courtyard'],
  ['commercial/hud-financing', 'courtyard'],
  ['residential', 'residence'],
  ['residential/jumbo-loans', 'residence'],
]);

export function renderDesign(html, file) {
  if (!html.includes('</head>') || html.includes('data-stonehaven-design')) return html;
  const route = file.replaceAll('\\', '/').replace(/^es\//, '').replace(/\.html$/, '');
  const secure = route === 'heloc-application';
  const layout = secure ? 'private' : route === 'index' ? 'home' :
    route.startsWith('blog/') ? 'article' : 'interior';
  html = renderHeader(html, file).replace(/<body\b/, '<body data-stonehaven-design="' + layout + '"');
  // Keep the application within its script-integrity, same-origin CSS and
  // no-font/no-analytics policy. All other pages use one cached, local typeface.
  html = html.replace(/<link\b[^>]*>/gi, tag =>
    /rel="preload"/.test(tag) && /as="font"/.test(tag) && /\/assets\/fonts\/(inter|cormorant)-/.test(tag) ? '' : tag);
  const font = secure ? '' : '<link rel="preload" as="font" type="font/woff2" href="/assets/design/dm-sans.woff2" crossorigin>\n';
  const theme = secure ? 'application' : 'theme';
  const styles = `<link rel="stylesheet" href="/assets/design/${theme}.css">\n<link rel="stylesheet" href="/assets/design/header.css">\n`;
  html = html.replace('</head>', font + styles + '</head>');
  const photo = photographs.get(route);
  if (photo) {
    html = html.replace(/(<section class="page-hero(?: cre-hero)?")([^>]*>)([\s\S]*?)<\/section>/, (_, start, end, contents) =>
      start + ' data-design-split' + end + '<div class="design-split-copy">' + contents +
      '</div><img class="design-split-photo" src="/assets/design/' + photo + '.webp" width="1040" height="693" alt="" fetchpriority="high"></section>');
  }
  return html;
}
