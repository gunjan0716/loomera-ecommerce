"""Record a scripted walkthrough of the Loomera demo store as JPEG frames via CDP screencast."""
import base64, json, math, os, shutil, sys
from playwright.sync_api import sync_playwright

BASE = 'http://localhost:8765/app/'
OUT = '/home/claude/loomera/rec/frames'
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
W, H, DSF = 1600, 1000, 1.2

OVERLAY = r"""
if (window.top === window) {
  const mk = () => {
    if (document.getElementById('rec-cursor')) return;
    const c = document.createElement('div'); c.id = 'rec-cursor';
    c.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.5 14.8 L11.6 21.6 L14.6 20.3 L11.6 13.6 L17.8 13.4 Z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const cap = document.createElement('div'); cap.id = 'rec-cap'; cap.innerHTML = '<span class="n"></span><span class="t"></span>';
    document.body.append(c, cap);
    if (window.__cxy) { c.style.left = __cxy[0] + 'px'; c.style.top = __cxy[1] + 'px'; }
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', mk) : mk();
  window.__cur = (x, y) => { window.__cxy = [x, y]; const c = document.getElementById('rec-cursor'); if (c) { c.style.left = x + 'px'; c.style.top = y + 'px'; } };
  window.__rip = (x, y) => { const r = document.createElement('div'); r.className = 'ripple'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 700); };
  window.__cap = (n, t) => { const c = document.getElementById('rec-cap'); if (!c) return; if (!t) { c.classList.remove('on'); return; } c.querySelector('.n').textContent = n; c.querySelector('.t').textContent = t; c.classList.add('on'); };
  window.__title = (html) => { let t = document.getElementById('rec-title'); if (!html) { t && t.remove(); return; } if (!t) { t = document.createElement('div'); t.id = 'rec-title'; t.className = 'title-card'; document.body.appendChild(t); } t.innerHTML = html; };
}
"""

frames = []
cur = [W * 0.5, H * 0.6]

with sync_playwright() as p:
    b = p.chromium.launch(args=['--force-color-profile=srgb', '--font-render-hinting=none'])
    ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=DSF)
    ctx.add_init_script(OVERLAY)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    cdp = ctx.new_cdp_session(pg)

    def on_frame(ev):
        n = len(frames)
        fn = f'{OUT}/{n:06d}.jpg'
        open(fn, 'wb').write(base64.b64decode(ev['data']))
        frames.append((ev['metadata']['timestamp'], fn))
        try: cdp.send('Page.screencastFrameAck', {'sessionId': ev['sessionId']})
        except Exception: pass
    cdp.on('Page.screencastFrame', on_frame)

    wait = pg.wait_for_timeout
    def setcur(): pg.evaluate('([x,y]) => window.__cur && window.__cur(x,y)', cur)
    def move(x, y, ms=650):
        sx, sy = cur; steps = max(8, int(ms / 16))
        for i in range(1, steps + 1):
            t = i / steps; e = t * t * (3 - 2 * t)
            cur[0] = sx + (x - sx) * e; cur[1] = sy + (y - sy) * e
            pg.mouse.move(cur[0], cur[1]); setcur(); wait(14)
    def center(sel, frame=None):
        loc = (frame or pg).locator(sel).first
        loc.scroll_into_view_if_needed(); wait(120)
        bb = loc.bounding_box(); return bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
    def click(sel, ms=650, pause=350, frame=None, real=True):
        x, y = center(sel, frame); move(x, y, ms); wait(140)
        pg.evaluate('([x,y]) => __rip(x,y)', [x, y])
        if frame: frame.locator(sel).first.click()
        else: pg.mouse.click(x, y)
        wait(pause)
    def hover(sel, ms=650, pause=900):
        x, y = center(sel); move(x, y, ms); wait(pause)
    def typ(text, delay=75): pg.keyboard.type(text, delay=delay)
    def cap(n, t=''): pg.evaluate('([n,t]) => __cap(n,t)', [n, t])
    def scroll(dy, ms=1200):
        steps = int(ms / 16)
        for i in range(steps):
            pg.mouse.wheel(0, dy / steps); wait(16)

    pg.goto(BASE + 'index.html#/'); pg.evaluate('LOOMERA.reset()'); pg.goto(BASE + 'index.html#/'); wait(800)
    pg.mouse.move(*cur); setcur()
    cdp.send('Page.startScreencast', {'format': 'jpeg', 'quality': 90, 'maxWidth': int(W * DSF), 'maxHeight': int(H * DSF), 'everyNthFrame': 1})

    # ---------- intro ----------
    pg.evaluate("""__title(`<div class="fade-in"><div class="logo"><span class="mark">${'<svg class="i" viewBox="0 0 24 24">'+ICONS.leaf+'</svg>'}</span>Loomera</div>
      <h2>A full e-commerce platform · demo project</h2>
      <div class="stack"><span>Responsive storefront</span><span>Live search & filters</span><span>Variants & wishlist</span><span>Cart & coupons</span><span>Checkout & payments</span><span>Order tracking</span><span>Admin dashboard</span></div>
      <div class="by">Gunjan Khandelwal · Product walkthrough</div></div>`)""")
    wait(4200)
    pg.evaluate("__title('')"); wait(300)

    # ---------- 1. home ----------
    cap('01', 'Storefront home: hero, categories, bestsellers')
    move(560, 420, 900); wait(700)
    hover('.hero-art .t1', 900, 900)
    scroll(820, 1500); wait(700)
    hover('.cats .cat:nth-child(3)', 700, 700)
    scroll(560, 1100); wait(500)
    hover('.grid .card:nth-child(2) .media', 700, 1300)   # alt image swap + quick add
    click('.grid .card:nth-child(4) [data-wish]', 500, 1100)
    scroll(-2400, 1100); wait(300)

    # ---------- 2. search ----------
    cap('02', 'Live search with instant suggestions')
    click('#q', 800, 300)
    typ('vase', 160); wait(1400)
    hover('#suggest a:nth-child(2)', 600, 500)
    pg.keyboard.press('Escape')
    click('nav.main a:nth-child(1)', 700, 900)

    # ---------- 3. shop & filters ----------
    cap('03', 'Catalogue with category, colour, price filters & sorting')
    click('[data-fcat="scents"]', 700, 900)
    click('[data-fcat="decor"]', 500, 1000)
    click('#sort', 800, 300)
    pg.select_option('#sort', 'low'); pg.evaluate("document.getElementById('sort').dispatchEvent(new Event('change'))"); wait(1200)
    x, y = center('#price-r'); move(x + 125, y, 700); pg.mouse.down(); move(x - 10, y, 900); pg.mouse.up(); wait(1100)
    move(x + 125, y, 600); pg.mouse.down(); move(x + 131, y, 300); pg.mouse.up(); wait(300)
    click('[data-rmcat="scents"]', 700, 400); click('[data-rmcat="decor"]', 500, 900)
    pg.select_option('#sort', 'featured'); pg.evaluate("document.getElementById('sort').dispatchEvent(new Event('change'))"); wait(300)

    # ---------- 4. product page ----------
    cap('04', 'Product page: colour variants, gallery, delivery check')
    click('.card[data-id="hana-mug"] .media', 800, 1200)
    click('#var-sw button:nth-child(2)', 800, 1100)
    click('#var-sw button:nth-child(3)', 500, 1100)
    click('#thumbs img:nth-child(2)', 700, 900)
    click('#var-sw button:nth-child(2)', 700, 800)
    click('#q-plus', 700, 500)
    click('#pin', 700, 200); typ('302001', 110); wait(300)
    click('#pin-btn', 500, 1500)

    # ---------- 5. cart ----------
    cap('05', 'Slide-out bag: quantities, coupon, free-shipping meter')
    click('#add', 700, 1600)
    click('#coupon', 700, 200); typ('WELCOME10', 100); wait(200)
    click('#apply', 500, 1500)
    hover('.ship-bar', 600, 1100)
    click('[data-inc="0"]', 700, 1500)

    # ---------- 6. checkout ----------
    cap('06', 'Checkout: address, delivery speed, UPI / card / COD')
    click('#to-checkout', 700, 1200)
    for sel, val in [('#f-name', 'Priya Sharma'), ('#f-phone', '9876543210'), ('#f-addr', '14, Lotus Residency, MI Road'), ('#f-city', 'Jaipur'), ('#f-pin', '302001')]:
        click(sel, 550, 150); typ(val, 45); wait(150)
    wait(500)
    click('[data-ship="express"]', 700, 900)
    click('[data-pay="card"]', 700, 900)
    click('[data-pay="upi"]', 600, 500)
    click('#f-upi', 600, 150); typ('priya@okaxis', 60); wait(600)
    cap('07', 'Order placed: confirmation & live tracking')
    click('#place', 800, 4200)
    hover('.timeline', 900, 1500)

    # ---------- 7. admin ----------
    pg.evaluate('window.scrollTo({top:0,behavior:"smooth"})'); wait(600)
    click('a.icon-btn[href="#/admin"]', 900, 300)
    cap('08', 'Admin dashboard: the new order appears in real time'); wait(2000)
    hover('.kpis .kpi:nth-child(1)', 700, 1000)
    hover('tr.new-row', 900, 1800)
    hover('.card-a .inv:nth-child(2)', 800, 1400)
    cap('', '')

    # ---------- 8. mobile ----------
    pg.goto(BASE + 'showcase.html'); wait(300)
    fr = pg.frame_locator('#ph')
    frame = pg.frames[1] if len(pg.frames) > 1 else None
    for _ in range(40):
        frame = next((f for f in pg.frames if f.url.endswith('index.html#/')), None)
        if frame: break
        wait(100)
    frame.evaluate('LOOMERA.reset()'); frame.evaluate('location.reload()'); wait(1200)
    frame = next(f for f in pg.frames if 'index.html' in f.url)
    pg.mouse.move(*cur); setcur(); wait(1200)
    def fclick(sel, ms=650, pause=500):
        loc = frame.locator(sel).first; loc.scroll_into_view_if_needed(); wait(150)
        bb = loc.bounding_box(); x, y = bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2
        move(x, y, ms); wait(120); pg.evaluate('([x,y]) => __rip(x,y)', [x, y]); pg.mouse.click(x, y); wait(pause)
    def fscroll(dy, ms=1200):
        bb = pg.locator('#ph').bounding_box(); move(bb['x'] + 200, bb['y'] + 500, 500)
        steps = int(ms / 16)
        for i in range(steps): pg.mouse.wheel(0, dy / steps); wait(16)
    fscroll(700, 1600); wait(600)
    fscroll(1100, 1600); wait(700)
    fclick('.card[data-id="trail-bottle"] .media', 700, 1300)
    fclick('#var-sw button:nth-child(2)', 600, 900)
    fclick('#var-sw button:nth-child(3)', 500, 900)
    fclick('#add', 700, 1900)
    fscroll(0, 100); wait(800)

    # ---------- outro ----------
    pg.goto(BASE + 'index.html#/'); wait(200)
    pg.evaluate("""__title(`<div class="fade-in"><div class="logo"><span class="mark">${'<svg class="i" viewBox="0 0 24 24">'+ICONS.leaf+'</svg>'}</span>Loomera</div>
      <h2>Storefront · Cart · Checkout · Tracking · Admin</h2>
      <div class="stack"><span>HTML · CSS · JavaScript</span><span>Single-page app with hash routing</span><span>Responsive, mobile-first</span><span>3D-rendered product photography</span></div>
      <div class="by">Demo project by Gunjan Khandelwal · Open to freelance e-commerce work</div></div>`)""")
    wait(4500)
    cdp.send('Page.stopScreencast'); wait(300)
    print('errors:', errs)
    b.close()

json.dump(frames, open('/home/claude/loomera/rec/frames.json', 'w'))
print(len(frames), 'frames', round(frames[-1][0] - frames[0][0], 1), 's')
