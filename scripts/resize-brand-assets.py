#!/usr/bin/env python3
"""Create delivery sizes of the approved artwork. Requires Pillow, not part of CI."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
assets = ROOT / 'assets'
original = Image.open(assets / 'stonehaven-handpainted-logo.png').convert('RGB')
for size in (120, 240, 360, 512):
    original.resize((size, size), Image.Resampling.LANCZOS).save(
        assets / f'stonehaven-logo-{size}-v1.webp', quality=90, method=6)
for size, name in [(48, 'stonehaven-icon-48-v1.png'), (180, 'stonehaven-apple-180-v1.png')]:
    original.resize((size, size), Image.Resampling.LANCZOS).save(assets / name, optimize=True)
# Preserve the full approved artwork and aspect ratio inside a sharing canvas.
canvas = Image.new('RGB', (1200, 630), 'white')
canvas.paste(original.resize((630, 630), Image.Resampling.LANCZOS), (285, 0))
canvas.save(assets / 'stonehaven-social-v1.jpg', quality=92, optimize=True)
for path in sorted(assets.glob('stonehaven-*-v1.*')):
    print(f'{path.name}: {path.stat().st_size:,} bytes')
