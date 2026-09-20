"""Idempotent delivery markup for approved, versioned logo derivatives."""
import re

def normalize_brand_assets(text):
    def image(match):
        tag = match[0]
        if not re.search(r'(?:stonehaven-handpainted-logo\.png|stonehaven-logo-\d+-v1\.webp)', tag):
            return tag
        footer = 'loading="lazy"' in tag
        family = not footer and bool(re.search(r'width="(?:40|44|100)"', tag))
        size = 180 if footer else (100 if family else 120)
        sizes = '180px' if footer else ('100px' if family else '(max-width: 1000px) 100px, 120px')
        for attr in ['src', 'srcset', 'sizes', 'width', 'height', 'decoding']:
            tag = re.sub(r'\s'+attr+r'="[^"]*"', '', tag)
        srcset = ', '.join(f'/assets/stonehaven-logo-{n}-v1.webp {n}w' for n in (120, 240, 360, 512))
        attrs = f' src="/assets/stonehaven-logo-240-v1.webp" srcset="{srcset}" sizes="{sizes}" width="{size}" height="{size}" decoding="async"'
        return tag.replace('<img', '<img'+attrs, 1)
    text = re.sub(r'<img\b[^>]*>', image, text)
    def icon(match):
        tag = match[0]
        if 'stonehaven-handpainted-logo.png' not in tag:
            return tag
        apple = 'apple-touch-icon' in tag
        asset = 'stonehaven-apple-180-v1.png' if apple else 'stonehaven-icon-48-v1.png'
        tag = re.sub(r'href="[^"]*"', f'href="/assets/{asset}"', tag)
        if ' sizes=' not in tag:
            tag = tag.replace('<link ', f'<link sizes="{180 if apple else 48}x{180 if apple else 48}" ', 1)
        return tag
    return re.sub(r'<link\b[^>]*>', icon, text)
