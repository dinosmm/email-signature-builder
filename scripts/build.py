#!/usr/bin/env python3
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
public = root / 'public'
public.mkdir(exist_ok=True)
(public / 'assets').mkdir(exist_ok=True)
defaults = json.loads((root / 'config' / 'defaults.json').read_text())
logo_b64 = ''.join((root / 'src' / 'assets' / 'school-logo.png.b64').read_text().split())
if defaults.get('schoolLogoPath') == 'assets/school-logo.png':
    defaults['schoolLogoPath'] = 'data:image/png;base64,' + logo_b64
(public / 'index.html').write_text((root / 'src' / 'index.html').read_text())
(public / 'styles.css').write_text((root / 'src' / 'styles.css').read_text())
(public / 'app.js').write_text((root / 'src' / 'app.js').read_text())
default_lines = [
    'window.SIGNATURE_DEFAULTS = ' + json.dumps(defaults, indent=2) + ';\n'
]
(public / 'defaults.js').write_text(''.join(default_lines))
print('Built static site in public/')
