// Work on the public main content only. Form markup and private intake stay owned by their generators.
function tableHeadings(html, route) {
  if (!route.startsWith('blog/') && !['heloc','cash-out-refinance'].includes(route)) return html;
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/g, table => {
    if (/<th[\s>]/i.test(table)) return table;
    const rows = [...table.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)].map(m => m[0]);
    if (!rows.length) return table;
    const pairs = rows.every(row => (row.match(/<td[\s>]/g) || []).length === 2);
    const comparison = !pairs && /<td[^>]*>\s*<\/td>\s*<td[^>]*><b>HELOC<\/b>/.test(rows[0]);
    if (!pairs && !comparison) return table;
    let rowIndex = 0;
    return table.replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/g,row=>{
      const header = comparison && rowIndex++ === 0;
      let column = 0;
      return row.replace(/<td\b([^>]*)>([\s\S]*?)<\/td>/g,(cell,attrs,contents)=>{
        const first = column++ === 0;
        if (header && contents.trim()) return '<th scope="col"'+attrs+'>'+contents+'</th>';
        if (!header && first) return '<th scope="row"'+attrs+'>'+contents+'</th>';
        return cell;
      });
    });
  });
}

function markInquiryLinks(main, route) {
  return main.replace(/<section\b[^>]*>[\s\S]*?<\/section>/g,section=>{
    const hero = /class="[^"]*\b(?:page-hero|funnel-hero)\b/.test(section);
    const proof = /class="[^"]*\binquiry-proof\b/.test(section);
    return section.replace(/<a\b[^>]*href="([^"]+)"[^>]*>/g,(tag,href)=>{
      if (tag.includes('data-sh-inquiry-cta') || !/(?:#(?:quick-inquiry|inquire|enquire|callback)$|^\/(?:es\/)?dscr-review$)/.test(href)) return tag;
      let placement = 'product-inquiry';
      if (route==='index') placement=hero?'home-hero':'home-proof';
      else if (route==='commercial/construction-loans') placement=hero?'builder-hero':proof?'builder-proof':href==='#inquire'?'builder-detailed':'builder-example';
      else if (route.startsWith('blog/') && href.includes('construction-loans')) placement='article-footer';
      return tag.replace('<a ','<a data-sh-inquiry-cta="'+placement+'" ');
    });
  });
}

export function financePresentation(html, route, es) {
  if (route === 'heloc') html = html.replace('<div class="heloc-sticky"><a href="#callback">', '<div class="heloc-sticky"><a data-sh-inquiry-cta="product-inquiry" href="#callback">');
  return html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/,main=>{
    main=tableHeadings(main,route);
    main=markInquiryLinks(main,route);
    if (route!=='index') return main;
    // Combine the four resource sections while retaining their descriptive links.
    const resources=[];
    main=main.replace(/<section class="wrap search-topics[^"]*"[^>]*>([\s\S]*?)<\/section>/g,(section,body)=>{
      resources.push('<div>'+body.replace(/<h2\b/g,'<h3').replace(/<\/h2>/g,'</h3>').replace(/<p>[^<]*<\/p>/g,'')+'</div>');
      return '';
    });
    if (resources.length) main=main.replace('</main>','<section class="wrap home-resources"><h2>'+(es?'Recursos por objetivo':'Resources by financing goal')+'</h2><div class="home-resource-grid">'+resources.join('')+'</div></section></main>');
    return main;
  });
}
