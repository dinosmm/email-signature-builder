#!/usr/bin/env python3
import base64, json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
public = root / 'public'
public.mkdir(exist_ok=True)
(public / 'assets').mkdir(exist_ok=True)
defaults = json.loads((root / 'config' / 'defaults.json').read_text())
(public / 'index.html').write_text((root / 'src' / 'index.html').read_text())
(public / 'styles.css').write_text((root / 'src' / 'styles.css').read_text())
app = (root / 'src' / 'app.js').read_text().replace('__DEFAULTS__', json.dumps(defaults, separators=(',', ':')))
(public / 'app.js').write_text(app)
logo_b64 = (root / 'src' / 'assets' / 'school-logo.png.b64').read_text()
(public / 'assets' / 'school-logo.png').write_bytes(base64.b64decode(logo_b64))
print('Built static site in public/')
