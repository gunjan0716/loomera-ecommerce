import base64, json, os, sys
from playwright.sync_api import sync_playwright

OUT = '/home/claude/loomera/app/img'
os.makedirs(OUT, exist_ok=True)

# (file, kind, cfg, background, camera)
JOBS = [
    ('mug-sand', 'mug', {'base': '#d8c4a6', 'dots': '#6b5a4a'}, '#efe9e1', {'rotY': -0.5}),
    ('mug-sage', 'mug', {'base': '#a9b8a0', 'dots': '#4c5a47'}, '#e7ebe3', {'rotY': -0.5}),
    ('mug-charcoal', 'mug', {'base': '#4a4744', 'dots': '#b9b2a8', 'amount': 1400}, '#e9e6e2', {'rotY': -0.5}),
    ('mug-sand-2', 'mug', {'base': '#d8c4a6', 'dots': '#6b5a4a'}, '#efe9e1', {'rotY': 1.2, 'el': 0.45}),
    ('vase-terracotta', 'vase', {'base': '#c27a56', 'dots': '#6e3a24', 'amount': 900}, '#f1e6dd', {}),
    ('vase-cream', 'vase', {'base': '#e6dccb', 'dots': '#7b6a58'}, '#e8e2d8', {}),
    ('budvase-blue', 'budvase', {'base': '#5d7fa3'}, '#e6eaef', {'zoom': 1.35}),
    ('budvase-blush', 'budvase', {'base': '#e3b8a8'}, '#f3e8e3', {'zoom': 1.35}),
    ('candle-fig', 'candle', {'glass': '#c9a98a', 'wax': '#f3ece2', 'label': 'Fig & Cedar'}, '#ece4da', {'az': 0.05, 'zoom': 2.0, 'el': 0.3}),
    ('candle-amber', 'candle', {'glass': '#b56a2c', 'wax': '#f4ede3', 'label': 'Amber Woods'}, '#efe5da', {'az': 0.05, 'zoom': 2.0, 'el': 0.3}),
    ('bottle-forest', 'bottle', {'base': '#2f4a3e', 'cap': '#e9e3d6'}, '#e3e8e2', {'zoom': 1.45}),
    ('bottle-clay', 'bottle', {'base': '#c88f6c', 'cap': '#f2ece2'}, '#f1e7df', {'zoom': 1.45}),
    ('bottle-ink', 'bottle', {'base': '#24324a', 'cap': '#d9dde4'}, '#e4e7ec', {'zoom': 1.45}),
    ('dripper-white', 'dripper', {'base': '#f4f1ec'}, '#e4ddd3', {'el': 0.35}),
    ('planter-speckle', 'planter', {'base': '#ddd2c1', 'dots': '#5a4c40'}, '#e5e9e1', {'el': 0.3}),
    ('bowl-oat', 'bowl', {'base': '#d3bc9c', 'dots': '#6e5a45'}, '#efe8de', {'el': 0.42, 'zoom': 1.45}),
    ('lamp-moss', 'lamp', {'base': '#7c8a5c'}, '#ece6da', {}),
    ('diffuser-smoke', 'diffuser', {'glass': '#8c8077', 'liquid': '#c58f4a'}, '#ebe5dd', {'zoom': 1.4}),
    ('plates-ash', 'plates', {'base': '#b9b5ad', 'dots': '#55504a'}, '#ecebe7', {'el': 0.5, 'zoom': 1.6}),
    ('carafe-clear', 'carafe', {}, '#e3e9ea', {}),
]

only = sys.argv[1:]
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 900, 'height': 900})
    pg.on('console', lambda m: print('console:', m.text) if m.type == 'error' else None)
    pg.on('pageerror', lambda e: print('pageerror:', e))
    pg.goto('http://localhost:8765/render/render.html')
    pg.wait_for_function('window.ready === true', timeout=60000)
    for name, kind, cfg, bg, cam in JOBS:
        if only and name not in only:
            continue
        url = pg.evaluate('([k,c,b,o]) => window.renderProduct(k,c,b,o)', [kind, cfg, bg, cam])
        open(f'{OUT}/{name}.jpg', 'wb').write(base64.b64decode(url.split(',')[1]))
        print('ok', name)
    b.close()
