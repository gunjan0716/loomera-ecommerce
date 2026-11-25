/* Loomera storefront — vanilla JS single-page app (demo project). */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ic = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const byId = id => PRODUCTS.find(p => p.id === id);
const catName = id => (CATS.find(c => c.id === id) || {}).name || 'All products';
const off = p => p.mrp ? Math.round((1 - p.price / p.mrp) * 100) : 0;
const FREE_SHIP = 1499;

const store = (() => { try { return JSON.parse(localStorage.getItem('loomera') || '{}'); } catch { return {}; } })();
const S = {
  cart: store.cart || [], wish: store.wish || [], coupon: store.coupon || null,
  orders: store.orders || [], filters: { cats: [], colors: [], max: 4000, sort: 'featured' },
  checkoutStep: 1, pay: 'upi', ship: 'standard',
};
const save = () => { try { localStorage.setItem('loomera', JSON.stringify({ cart: S.cart, wish: S.wish, coupon: S.coupon, orders: S.orders })); } catch {} };

/* ---------- cart math ---------- */
const subtotal = () => S.cart.reduce((a, l) => a + byId(l.id).price * l.qty, 0);
const discount = () => S.coupon ? Math.round(subtotal() * 0.10) : 0;
const shipping = () => (subtotal() - discount() >= FREE_SHIP || !S.cart.length) ? 0 : 99;
const expressFee = () => S.ship === 'express' ? 149 : 0;
const total = () => subtotal() - discount() + shipping() + expressFee();
const cartCount = () => S.cart.reduce((a, l) => a + l.qty, 0);

function addToCart(id, v = 0, qty = 1) {
  const l = S.cart.find(x => x.id === id && x.v === v);
  l ? l.qty += qty : S.cart.push({ id, v, qty });
  save(); renderHeaderCounts(true);
  const p = byId(id); toast(`<img src="${p.variants[v].imgs[0]}"><div>Added to bag<br><span style="opacity:.7;font-size:13px">${p.name} · ${p.variants[v].name}</span></div>`);
  renderDrawer();
}

/* ---------- shell ---------- */
function header(active = '') {
  return `
  <div class="announce">Free shipping on orders over <b>${inr(FREE_SHIP)}</b> &nbsp;·&nbsp; Easy 7-day returns &nbsp;·&nbsp; Use <b>WELCOME10</b> for 10% off your first order</div>
  <header class="top"><div class="wrap">
    <button class="icon-btn m-menu">${ic('menu')}</button>
    <a href="#/" class="logo"><span class="mark">${ic('leaf')}</span>Loomera</a>
    <nav class="main">
      <a href="#/shop" class="${active === 'all' ? 'on' : ''}">Shop all</a>
      ${CATS.map(c => `<a href="#/shop/${c.id}" class="${active === c.id ? 'on' : ''}">${c.name.split(' ')[0] === 'Vases' ? 'Decor' : c.name.split(' &')[0]}</a>`).join('')}
    </nav>
    <div class="hdr-right">
      <div class="search hide-m" id="search">${ic('search', 'sm')}<input id="q" placeholder="Search mugs, vases, candles…" autocomplete="off"><div class="suggest hidden" id="suggest"></div></div>
      <a class="icon-btn hide-m" href="#/admin" title="Store admin">${ic('user')}</a>
      <button class="icon-btn hide-m" id="wish-btn">${ic('heart')}<span class="count ${S.wish.length ? '' : 'hidden'}" id="wish-count">${S.wish.length}</span></button>
      <button class="icon-btn" id="cart-btn" data-t="cart-btn">${ic('shopping-bag')}<span class="count ${cartCount() ? '' : 'hidden'}" id="cart-count">${cartCount()}</span></button>
    </div>
  </div></header>`;
}
function mobileBar(active) {
  return `<nav class="m-bar">
    <a href="#/" class="${active === 'home' ? 'on' : ''}">${ic('home')}Home</a>
    <a href="#/shop" class="${active === 'shop' ? 'on' : ''}">${ic('store')}Shop</a>
    <a href="#/shop" >${ic('search')}Search</a>
    <a href="javascript:void 0" id="m-cart">${ic('shopping-bag')}Bag<span class="count ${cartCount() ? '' : 'hidden'}" id="m-cart-count">${cartCount()}</span></a>
    <a href="#/admin">${ic('user')}Account</a></nav>`;
}
function footer() {
  return `<footer class="foot"><div class="wrap">
    <div class="foot-grid">
      <div><a class="logo" href="#/"><span class="mark">${ic('leaf')}</span>Loomera</a><p style="max-width:280px;margin-top:14px">Small-batch ceramics, candles and kitchenware, designed to make everyday rituals feel slower.</p></div>
      <div><h4>Shop</h4>${CATS.map(c => `<a href="#/shop/${c.id}">${c.name}</a>`).join('')}</div>
      <div><h4>Help</h4><a>Track order</a><a>Shipping</a><a>Returns & refunds</a><a>Care guide</a><a>Contact us</a></div>
      <div><h4>Company</h4><a>Our studio</a><a>Journal</a><a>Wholesale</a><a>Careers</a></div>
      <div><h4>Get 10% off your first order</h4><p style="margin:0">Studio news, restocks and early access.</p><div class="news"><input placeholder="Email address"><button class="btn btn-dark" style="height:46px">Join</button></div></div>
    </div>
    <div class="foot-bottom"><span>© 2026 Loomera Home · Demo storefront</span><div class="pay-icons"><span>UPI</span><span>VISA</span><span>Mastercard</span><span>RuPay</span><span>COD</span></div></div>
  </div></footer>`;
}

function card(p) {
  const v = p.variants[0];
  const badges = [];
  if (p.badge === 'New') badges.push('<span class="badge b-new">New</span>');
  if (off(p)) badges.push(`<span class="badge b-sale">-${off(p)}%</span>`);
  if (p.badge === 'Low stock') badges.push(`<span class="badge b-low">Only ${p.stock} left</span>`);
  return `<div class="card" data-id="${p.id}">
    <a href="#/p/${p.id}" class="media"><div class="badges">${badges.join('')}</div>
      <img src="${v.imgs[0]}" alt="${p.name}"><img class="alt" src="${v.imgs[1]}" alt=""></a>
    <button class="wish ${S.wish.includes(p.id) ? 'on' : ''}" data-wish="${p.id}">${ic('heart', 'sm')}</button>
    <div class="quick"><button class="btn" data-quick="${p.id}">${ic('plus', 'sm')} Quick add</button></div>
    <div class="meta"><div class="cat-l">${catName(p.cat)}</div><h3><a href="#/p/${p.id}">${p.name}</a></h3>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="price">${inr(p.price)} ${p.mrp ? `<s>${inr(p.mrp)}</s>` : ''}</div>
        <span class="rating">${ic('star', 'xs')} ${p.rating}</span></div>
      ${p.variants.length > 1 ? `<div class="swatches">${p.variants.map(x => `<span class="sw" style="background:${x.hex}"></span>`).join('')}</div>` : ''}
    </div></div>`;
}

/* ---------- pages ---------- */
function pageHome() {
  const best = ['hana-mug', 'terra-vase', 'fig-candle', 'trail-bottle', 'moss-lamp', 'oat-bowl', 'petal-bud', 'ash-plates'].map(byId);
  return header() + `
  <section class="hero"><div class="wrap hero-grid">
    <div class="hero-copy fade-in">
      <span class="eyebrow">${ic('sparkles', 'sm')} The Winter Edit · 2026</span>
      <h1>Slow mornings,<br><em>made by hand.</em></h1>
      <p>Small-batch stoneware, soy candles and kitchen pieces from independent Indian studios. Built for daily rituals.</p>
      <div class="hero-ctas"><a href="#/shop" class="btn btn-dark" data-t="shop-now">Shop the collection ${ic('arrow-right', 'sm')}</a><a href="#/shop/scents" class="btn btn-line">Candles & scents</a></div>
      <div class="hero-stats"><div><b>13</b><span>Studio-made pieces</span></div><div><b>2–4 days</b><span>Metro delivery</span></div><div><b>7-day</b><span>Easy returns</span></div></div>
    </div>
    <div class="hero-art fade-in">
      <a href="#/p/terra-vase" class="tile t1"><img src="img/vase-terracotta.jpg"><div class="tag"><b>Terra Bottle Vase</b>${inr(1899)} · New</div></a>
      <a href="#/p/hana-mug" class="tile"><img src="img/mug-sage.jpg"></a>
      <a href="#/p/amber-candle" class="tile"><img src="img/candle-amber.jpg"></a>
    </div>
  </div></section>
  <div class="wrap"><div class="trust">
    <div><span class="ic">${ic('truck')}</span><div><b>Free shipping</b><span>On orders above ${inr(FREE_SHIP)}</span></div></div>
    <div><span class="ic">${ic('rotate-ccw')}</span><div><b>7-day returns</b><span>No questions asked</span></div></div>
    <div><span class="ic">${ic('shield-check')}</span><div><b>Secure payments</b><span>UPI, cards & COD</span></div></div>
    <div><span class="ic">${ic('gift')}</span><div><b>Gift wrapping</b><span>Add a note at checkout</span></div></div>
  </div></div>
  <section class="sec"><div class="wrap">
    <div class="sec-h"><div><span class="eyebrow">Browse</span><h2>Shop by category</h2></div><a href="#/shop" class="link-arrow">View all ${ic('arrow-right', 'sm')}</a></div>
    <div class="cats">${CATS.map(c => `<a class="cat" href="#/shop/${c.id}"><img src="${c.img}"><div>${c.name}<span>${PRODUCTS.filter(p => p.cat === c.id).length} items</span></div></a>`).join('')}</div>
  </div></section>
  <section class="sec"><div class="wrap">
    <div class="sec-h"><div><span class="eyebrow">Most loved</span><h2>Bestsellers this week</h2></div><a href="#/shop" class="link-arrow">Shop all ${ic('arrow-right', 'sm')}</a></div>
    <div class="grid">${best.map(card).join('')}</div>
    <div class="promo"><div class="c"><span class="eyebrow" style="color:#f0b796">Limited time</span><h3>10% off your first order</h3><p style="margin:0;color:#c9d6cd;max-width:420px">Apply the code at checkout. Valid on everything in store, including new arrivals.</p><div class="code">${ic('tag', 'sm')} WELCOME10</div><br><a href="#/shop" class="btn btn-light">Start shopping</a></div>
      <div class="imgs"><img src="img/diffuser-smoke.jpg"><img src="img/bottle-forest.jpg"></div></div>
  </div></section>` + footer() + mobileBar('home');
}

function filtered(cat) {
  const f = S.filters;
  let list = PRODUCTS.filter(p => (!cat || p.cat === cat) && (!f.cats.length || f.cats.includes(p.cat)) && p.price <= f.max
    && (!f.colors.length || p.variants.some(v => f.colors.includes(v.hex))));
  if (f.sort === 'low') list.sort((a, b) => a.price - b.price);
  if (f.sort === 'high') list.sort((a, b) => b.price - a.price);
  if (f.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  return list;
}
function pageShop(cat) {
  const colors = [...new Map(PRODUCTS.flatMap(p => p.variants).map(v => [v.hex, v])).values()].slice(0, 12);
  const f = S.filters;
  return header(cat || 'all') + `<div class="wrap">
    <div class="crumbs"><a href="#/">Home</a>${ic('chevron-right')}<span>${cat ? catName(cat) : 'Shop all'}</span></div>
    <div class="plp-head"><div><h1>${cat ? catName(cat) : 'Shop all'}</h1><div class="muted" style="margin-top:6px">Handmade in small batches. Every piece is slightly different.</div></div></div>
    <div class="plp">
      <aside class="filters">
        <div class="f-group" style="padding-top:0"><h5>Category</h5>
          ${CATS.map(c => `<div class="f-opt ${f.cats.includes(c.id) ? 'on' : ''}" data-fcat="${c.id}"><span class="box">${ic('check')}</span>${c.name}<span class="n">${PRODUCTS.filter(p => p.cat === c.id).length}</span></div>`).join('')}</div>
        <div class="f-group"><h5>Price <span class="muted" style="font-weight:500">Up to ${inr(f.max)}</span></h5>
          <div class="range"><input type="range" min="600" max="4000" step="100" value="${f.max}" id="price-r"></div>
          <div class="range-vals"><span>₹600</span><span>₹4,000</span></div></div>
        <div class="f-group"><h5>Colour</h5><div class="f-colors">${colors.map(v => `<button title="${v.name}" data-fcol="${v.hex}" class="${f.colors.includes(v.hex) ? 'on' : ''}" style="background:${v.hex}"></button>`).join('')}</div></div>
        <div class="f-group"><h5>Availability</h5><div class="f-opt on"><span class="box">${ic('check')}</span>In stock</div><div class="f-opt"><span class="box">${ic('check')}</span>Ships in 24 h</div></div>
      </aside>
      <div><div class="toolbar"><span class="res" id="res"></span><div class="active-f" id="active-f"></div>
        <select class="sel" id="sort"><option value="featured">Sort: Featured</option><option value="low">Price: Low to high</option><option value="high">Price: High to low</option><option value="rating">Top rated</option></select></div>
        <div class="grid" id="plp-grid" style="grid-template-columns:repeat(3,1fr)"></div></div>
    </div></div>` + footer() + mobileBar('shop');
}
function refreshGrid(cat) {
  const list = filtered(cat);
  $('#plp-grid').innerHTML = list.map(card).join('') || `<div class="empty" style="grid-column:1/-1">No products match these filters.</div>`;
  $('#res').textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
  const f = S.filters;
  $('#active-f').innerHTML = [...f.cats.map(c => `<span class="chip on" data-rmcat="${c}">${catName(c)} ${ic('x')}</span>`),
    ...f.colors.map(h => `<span class="chip on" data-rmcol="${h}"><span class="sw" style="background:${h};width:14px;height:14px"></span> ${ic('x')}</span>`),
    f.max < 4000 ? `<span class="chip on" data-rmmax>Under ${inr(f.max)} ${ic('x')}</span>` : ''].join('');
  $('#sort').value = f.sort;
}

function pageProduct(id) {
  const p = byId(id); if (!p) return pageHome();
  const related = PRODUCTS.filter(x => x.id !== id && (x.cat === p.cat || x.cat === 'decor')).slice(0, 4);
  return header(p.cat) + `<div class="wrap">
    <div class="crumbs"><a href="#/">Home</a>${ic('chevron-right')}<a href="#/shop/${p.cat}">${catName(p.cat)}</a>${ic('chevron-right')}<span>${p.name}</span></div>
    <div class="pdp" style="margin-top:14px">
      <div class="gallery"><div class="thumbs" id="thumbs"></div><div class="main-img"><img id="main-img"></div></div>
      <div class="pdp-info">
        <div class="cat-l">${catName(p.cat)}</div>
        <h1>${p.name}</h1>
        <span class="rating" style="font-size:14px">${ic('star', 'sm')}${ic('star', 'sm')}${ic('star', 'sm')}${ic('star', 'sm')}${ic('star', 'sm')}&nbsp; ${p.rating} <span class="muted" style="font-weight:500">· ${p.count} ratings</span></span>
        <div class="price">${inr(p.price)} ${p.mrp ? `<s>${inr(p.mrp)}</s><span class="off">${off(p)}% off</span>` : ''}</div>
        <div class="tax">Inclusive of all taxes</div>
        <p class="lead">${p.desc}</p>
        <div class="opt-label">Colour: <span id="vname"></span></div>
        <div class="var-sw" id="var-sw">${p.variants.map((v, i) => `<button data-v="${i}" title="${v.name}" style="background:${v.hex}"></button>`).join('')}</div>
        ${p.stock < 10 ? `<div style="margin-top:18px;color:var(--warn);font-weight:600;font-size:14px;display:flex;gap:8px;align-items:center">${ic('flame', 'sm')} Only ${p.stock} left in stock</div>` : ''}
        <div class="buy-row"><div class="qty"><button id="q-minus">${ic('minus', 'sm')}</button><span id="qty">1</span><button id="q-plus">${ic('plus', 'sm')}</button></div>
          <button class="btn btn-dark" id="add" data-t="add">${ic('shopping-bag', 'sm')} Add to bag · <span id="add-p">${inr(p.price)}</span></button>
          <button class="icon-btn" style="width:52px;height:52px;border:1.5px solid var(--line);background:#fff" data-wish="${p.id}">${ic('heart')}</button></div>
        <div class="pin"><b style="font-size:14px;display:flex;gap:8px;align-items:center">${ic('map-pin', 'sm')} Check delivery</b>
          <div class="pin-row"><input id="pin" placeholder="Enter pincode" maxlength="6"><button class="btn btn-line" style="height:44px" id="pin-btn">Check</button></div><div id="pin-res"></div></div>
        <div class="perks"><div>${ic('truck', 'sm')} Free above ${inr(FREE_SHIP)}</div><div>${ic('rotate-ccw', 'sm')} 7-day returns</div><div>${ic('banknote', 'sm')} COD available</div></div>
        <div class="acc">
          <details open><summary>Details & dimensions ${ic('chevron-down', 'sm')}</summary><p>Handmade, so colour and speckling vary slightly from piece to piece. Food-safe, lead-free glaze. Ships in recycled, plastic-free packaging.</p></details>
          <details><summary>Care ${ic('chevron-down', 'sm')}</summary><p>Dishwasher safe on a gentle cycle. Avoid sudden temperature changes.</p></details>
          <details><summary>Shipping & returns ${ic('chevron-down', 'sm')}</summary><p>Dispatched within 24 hours. Free returns within 7 days of delivery.</p></details>
        </div>
      </div>
    </div>
    <section class="sec"><div class="sec-h"><div><span class="eyebrow">Complete the look</span><h2>You may also like</h2></div></div><div class="grid">${related.map(card).join('')}</div></section>
  </div>` + footer() + mobileBar('shop');
}
function bindProduct(id) {
  const p = byId(id); let v = 0, q = 1, img = 0;
  const draw = () => {
    const vv = p.variants[v];
    $('#thumbs').innerHTML = vv.imgs.map((s, i) => `<img src="${s}" data-img="${i}" class="${i === img ? 'on' : ''}">`).join('');
    const m = $('#main-img'); m.style.opacity = .3; setTimeout(() => { m.src = vv.imgs[img]; m.style.opacity = 1; }, 120);
    $('#vname').textContent = vv.name;
    $$('#var-sw button').forEach(b => b.classList.toggle('on', +b.dataset.v === v));
    $('#qty').textContent = q; $('#add-p').textContent = inr(p.price * q);
  };
  draw();
  $('#var-sw').onclick = e => { const b = e.target.closest('[data-v]'); if (b) { v = +b.dataset.v; img = 0; draw(); } };
  $('#thumbs').onclick = e => { const t = e.target.closest('[data-img]'); if (t) { img = +t.dataset.img; draw(); } };
  $('#q-plus').onclick = () => { q = Math.min(q + 1, 9); draw(); };
  $('#q-minus').onclick = () => { q = Math.max(q - 1, 1); draw(); };
  $('#add').onclick = () => { addToCart(p.id, v, q); setTimeout(openDrawer, 650); };
  $('#pin-btn').onclick = () => {
    const pin = $('#pin').value.trim();
    const d = new Date(); d.setDate(d.getDate() + 3);
    $('#pin-res').innerHTML = /^\d{6}$/.test(pin)
      ? `<div class="pin-ok">${ic('circle-check', 'sm')}<div>Delivery by ${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}<span>Free delivery to ${pin} · Cash on delivery available</span></div></div>`
      : `<div class="pin-ok" style="color:var(--bad)">Please enter a valid 6-digit pincode</div>`;
  };
}

/* ---------- drawer ---------- */
function renderDrawer() {
  const sub = subtotal(), need = Math.max(0, FREE_SHIP - (sub - discount()));
  $('#drawer').innerHTML = `
    <div class="dr-h"><h3>Your bag <span class="muted" style="font-family:Jakarta;font-size:15px">(${cartCount()})</span></h3><button class="icon-btn" id="dr-close">${ic('x')}</button></div>
    ${S.cart.length ? `<div class="ship-bar">${need ? `You're <b>${inr(need)}</b> away from free shipping` : `<b style="color:var(--ok)">You've unlocked free shipping!</b>`}<div class="bar"><i style="width:${Math.min(100, (sub - discount()) / FREE_SHIP * 100)}%"></i></div></div>` : ''}
    <div class="dr-items">${S.cart.length ? S.cart.map((l, i) => { const p = byId(l.id), v = p.variants[l.v]; return `
      <div class="line"><img src="${v.imgs[0]}"><div><h4>${p.name}</h4><div class="v">${v.name}</div>
        <div class="qty"><button data-dec="${i}">${ic('minus', 'xs')}</button><span>${l.qty}</span><button data-inc="${i}">${ic('plus', 'xs')}</button></div>
        <button class="rm" data-rm="${i}">${ic('trash-2', 'xs')} Remove</button></div><div class="lp">${inr(p.price * l.qty)}</div></div>`; }).join('')
      : `<div class="empty">${ic('shopping-bag', 'lg')}<p>Your bag is empty.</p><a href="#/shop" class="btn btn-dark" id="dr-shop">Start shopping</a></div>`}</div>
    ${S.cart.length ? `<div class="dr-f">
      ${S.coupon ? `<div class="coupon-ok">${ic('tag', 'sm')} WELCOME10 applied · you save ${inr(discount())}</div>`
        : `<div class="coupon"><input id="coupon" placeholder="Discount code"><button class="btn btn-line" id="apply">Apply</button></div>`}
      <div class="sum-row"><span>Subtotal</span><span>${inr(sub)}</span></div>
      ${S.coupon ? `<div class="sum-row"><span>Discount</span><span class="g">− ${inr(discount())}</span></div>` : ''}
      <div class="sum-row"><span>Shipping</span><span>${shipping() ? inr(shipping()) : '<span class="g">Free</span>'}</span></div>
      <div class="sum-row t"><span>Total</span><span>${inr(subtotal() - discount() + shipping())}</span></div>
      <a href="#/checkout" class="btn btn-brand btn-block" style="margin-top:16px;height:54px" id="to-checkout" data-t="checkout">${ic('lock', 'sm')} Checkout securely</a>
    </div>` : ''}`;
}
function openDrawer() { renderDrawer(); $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); }
function closeDrawer() { $('#drawer').classList.remove('on'); $('#scrim').classList.remove('on'); }
$('#scrim').onclick = closeDrawer;
$('#drawer').addEventListener('click', e => {
  const t = e.target.closest('button,a'); if (!t) return;
  if (t.id === 'dr-close') closeDrawer();
  if (t.dataset.inc) { S.cart[+t.dataset.inc].qty++; }
  if (t.dataset.dec) { const l = S.cart[+t.dataset.dec]; l.qty > 1 ? l.qty-- : S.cart.splice(+t.dataset.dec, 1); }
  if (t.dataset.rm) S.cart.splice(+t.dataset.rm, 1);
  if (t.id === 'apply') { if ($('#coupon').value.trim().toUpperCase() === 'WELCOME10') S.coupon = 'WELCOME10'; else { $('#coupon').style.borderColor = 'var(--bad)'; return; } }
  if (t.id === 'to-checkout' || t.id === 'dr-shop') { closeDrawer(); return; }
  if (t.dataset.inc || t.dataset.dec || t.dataset.rm || t.id === 'apply') { save(); renderDrawer(); renderHeaderCounts(); }
});

/* ---------- checkout ---------- */
function pageCheckout() {
  if (!S.cart.length) { location.hash = '#/shop'; return ''; }
  return `<header class="top"><div class="wrap"><a href="#/" class="logo"><span class="mark">${ic('leaf')}</span>Loomera</a>
    <div class="hdr-right" style="gap:8px;color:var(--ink3);font-size:14px;font-weight:600">${ic('lock', 'sm')} Secure checkout</div></div></header>
  <div class="wrap"><div class="steps" id="steps"></div><div class="co">
    <div>
      <div class="panel"><h3>${ic('map-pin')} Shipping address</h3><div class="form">
        <div class="fld"><label>Full name</label><input id="f-name" placeholder="Your name"></div>
        <div class="fld"><label>Mobile number</label><input id="f-phone" placeholder="10-digit mobile"></div>
        <div class="fld full"><label>Address</label><input id="f-addr" placeholder="Flat, building, street"></div>
        <div class="fld"><label>City</label><input id="f-city" placeholder="City"></div>
        <div class="fld"><label>Pincode</label><input id="f-pin" placeholder="6 digits"></div>
      </div></div>
      <div class="panel"><h3>${ic('truck')} Delivery</h3><div class="opts" id="ship-opts">
        <div class="opt ${S.ship === 'standard' ? 'on' : ''}" data-ship="standard"><span class="radio"></span><div><b>Standard delivery</b><span>3–5 business days</span></div><span class="r">${shipping() ? inr(shipping()) : 'Free'}</span></div>
        <div class="opt ${S.ship === 'express' ? 'on' : ''}" data-ship="express"><span class="radio"></span><div><b>Express delivery</b><span>Next day in metro cities</span></div><span class="r">+ ₹149</span></div>
      </div></div>
      <div class="panel"><h3>${ic('credit-card')} Payment <span class="testmode">${ic('shield-check', 'xs')} Test mode · no real charge</span></h3><div class="opts" id="pay-opts">
        <div class="opt" data-pay="upi"><span class="radio"></span>${ic('smartphone')}<div><b>UPI</b><span>Google Pay, PhonePe, Paytm or any UPI app</span></div></div>
        <div class="opt" data-pay="card"><span class="radio"></span>${ic('credit-card')}<div><b>Credit / Debit card</b><span>Visa, Mastercard, RuPay</span></div></div>
        <div class="opt" data-pay="cod"><span class="radio"></span>${ic('banknote')}<div><b>Cash on delivery</b><span>Pay when your order arrives</span></div></div>
      </div><div id="pay-extra"></div></div>
    </div>
    <div class="summary"><div class="panel"><h3>Order summary</h3><div id="co-lines"></div><div id="co-sum" style="margin-top:12px"></div>
      <button class="btn btn-brand btn-block" id="place" data-t="place" style="height:56px;margin-top:18px">${ic('lock', 'sm')} Place order · <span id="place-amt"></span></button>
      <div class="secure">${ic('shield-check', 'xs')} 256-bit SSL encrypted · Demo payment gateway</div></div></div>
  </div></div>`;
}
function bindCheckout() {
  const paint = () => {
    $('#co-lines').innerHTML = S.cart.map(l => { const p = byId(l.id), v = p.variants[l.v]; return `<div class="sum-line"><div class="im"><img src="${v.imgs[0]}"><span class="q">${l.qty}</span></div><div><b>${p.name}</b><span>${v.name}</span></div><span class="p">${inr(p.price * l.qty)}</span></div>`; }).join('');
    $('#co-sum').innerHTML = `<div class="sum-row"><span>Subtotal</span><span>${inr(subtotal())}</span></div>
      ${S.coupon ? `<div class="sum-row"><span>Discount (WELCOME10)</span><span class="g">− ${inr(discount())}</span></div>` : ''}
      <div class="sum-row"><span>Shipping</span><span>${shipping() ? inr(shipping()) : '<span class="g">Free</span>'}</span></div>
      ${expressFee() ? `<div class="sum-row"><span>Express</span><span>${inr(expressFee())}</span></div>` : ''}
      <div class="sum-row t"><span>Total</span><span>${inr(total())}</span></div>`;
    $('#place-amt').textContent = inr(total());
    $$('#ship-opts .opt').forEach(o => o.classList.toggle('on', o.dataset.ship === S.ship));
    $$('#pay-opts .opt').forEach(o => o.classList.toggle('on', o.dataset.pay === S.pay));
    $('#pay-extra').innerHTML = S.pay === 'upi' ? `<div class="fld" style="margin-top:14px"><label>UPI ID</label><input id="f-upi" placeholder="yourname@okbank"></div>`
      : S.pay === 'card' ? `<div class="card-fields"><div class="fld"><label>Card number</label><input placeholder="4111 1111 1111 1111"></div><div class="fld"><label>Expiry</label><input placeholder="MM / YY"></div><div class="fld"><label>CVV</label><input placeholder="•••"></div></div>` : '';
    const filled = ['f-name', 'f-phone', 'f-addr', 'f-city', 'f-pin'].filter(id => $('#' + id).value.trim()).length;
    const step = filled < 5 ? 1 : 2;
    $('#steps').innerHTML = ['Bag', 'Address', 'Payment', 'Done'].map((s, i) => `${i ? '<span class="step-sep"></span>' : ''}<span class="step ${i < step ? 'done' : i === step ? 'on' : ''}"><span class="n">${i < step ? ic('check', 'xs') : i + 1}</span>${s}</span>`).join('');
  };
  paint();
  $$('.form input').forEach(i => i.addEventListener('input', () => { const s = $('#steps').innerHTML; paint(); }));
  $('#ship-opts').onclick = e => { const o = e.target.closest('[data-ship]'); if (o) { S.ship = o.dataset.ship; paint(); } };
  $('#pay-opts').onclick = e => { const o = e.target.closest('[data-pay]'); if (o) { S.pay = o.dataset.pay; paint(); } };
  $('#place').onclick = () => {
    const name = $('#f-name').value.trim() || 'Guest', city = $('#f-city').value.trim() || 'Jaipur';
    const ov = document.createElement('div'); ov.className = 'processing';
    ov.innerHTML = `<div><div class="spinner"></div><b style="font-size:18px">Confirming your payment…</b><div class="muted" style="margin-top:6px">Please don't close this window</div></div>`;
    document.body.appendChild(ov);
    setTimeout(() => {
      const id = 'LM-' + (24818 + S.orders.length);
      S.orders.unshift({ id, name, city, items: cartCount(), total: total(), status: 'New', mins: 0, lines: S.cart.slice(), pay: S.pay, ship: S.ship, at: Date.now() });
      S.cart = []; S.coupon = null; save(); ov.remove(); location.hash = '#/order/' + id;
    }, 1900);
  };
}

function pageOrder(id) {
  const o = S.orders.find(x => x.id === id); if (!o) return pageHome();
  const d = new Date(); const eta = new Date(); eta.setDate(d.getDate() + (o.ship === 'express' ? 1 : 3));
  const fmt = x => x.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const t = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  return header() + `<div class="wrap"><div class="success">
    <div class="tick">${ic('check')}</div>
    <h1>Thank you, ${o.name.split(' ')[0]}!</h1>
    <p class="muted" style="font-size:16px;margin:0">Your order <b style="color:var(--ink)">${o.id}</b> is confirmed. We've sent the details to your phone.</p>
    <div class="track">
      <div class="panel"><h3>${ic('package')} Track your order</h3><div class="timeline">
        <div class="tl done"><span class="dot">${ic('check', 'sm')}</span><div><b>Order placed</b><span>Today, ${t} · Payment ${o.pay === 'cod' ? 'on delivery' : 'received'}</span></div></div>
        <div class="tl now"><span class="dot">${ic('package-check', 'sm')}</span><div><b>Packing at our Jaipur studio</b><span>Hand-wrapped in recycled paper</span></div></div>
        <div class="tl"><span class="dot">${ic('truck', 'sm')}</span><div><b>Shipped</b><span>Tracking link via SMS & WhatsApp</span></div></div>
        <div class="tl"><span class="dot">${ic('home', 'sm')}</span><div><b>Delivered</b><span>Expected by ${fmt(eta)}</span></div></div>
      </div></div>
      <div class="panel"><h3>Order details</h3>
        <div class="kv"><span>Order ID</span><b>${o.id}</b></div><div class="kv"><span>Items</span><b>${o.items}</b></div>
        <div class="kv"><span>Delivery</span><b>${o.ship === 'express' ? 'Express' : 'Standard'} · ${o.city}</b></div>
        <div class="kv"><span>Payment</span><b>${{ upi: 'UPI', card: 'Card', cod: 'Cash on delivery' }[o.pay]}</b></div>
        <div class="kv" style="border:0"><span>Total paid</span><b style="font-size:18px">${inr(o.total)}</b></div>
        <a href="#/shop" class="btn btn-dark btn-block" style="margin-top:14px">Continue shopping</a>
      </div>
    </div></div></div>` + footer();
}
function confetti() {
  const c = document.createElement('div'); c.className = 'confetti';
  const cols = ['#2f4a3e', '#c2663f', '#d39b2a', '#a9b8a0', '#e3b8a8', '#5d7fa3'];
  for (let i = 0; i < 90; i++) { const p = document.createElement('i'); p.style.left = Math.random() * 100 + 'vw'; p.style.background = cols[i % 6]; p.style.animationDelay = Math.random() * .6 + 's'; p.style.transform = `rotate(${Math.random() * 360}deg)`; c.appendChild(p); }
  document.body.appendChild(c); setTimeout(() => c.remove(), 3400);
}

/* ---------- admin ---------- */
function pageAdmin() {
  const orders = [...S.orders, ...SEED_ORDERS];
  const extra = S.orders.reduce((a, o) => a + o.total, 0);
  const rev = 184620 + extra, cnt = 132 + S.orders.length;
  const cols = ['#2f4a3e', '#c2663f', '#5d7fa3', '#b7791f', '#7c8a5c', '#8c5a7a'];
  const ago = o => o.mins === 0 ? 'Just now' : o.mins < 60 ? o.mins + ' min ago' : Math.round(o.mins / 60) + ' h ago';
  const pill = s => `<span class="pill ${{ New: 'p-new', Packed: 'p-pack', Shipped: 'p-ship', Delivered: 'p-del' }[s]}">${s}</span>`;
  const low = PRODUCTS.filter(p => p.stock < 20).sort((a, b) => a.stock - b.stock).slice(0, 4);
  return `<div class="admin">
    <aside class="side"><a class="logo" href="#/"><span class="mark">${ic('leaf')}</span>Loomera</a>
      <a class="on">${ic('layout-dashboard')} Dashboard</a><a>${ic('shopping-cart')} Orders <span class="cnt">${S.orders.length + 3}</span></a><a>${ic('box')} Products</a><a>${ic('users')} Customers</a><a>${ic('bar-chart-3')} Analytics</a><a>${ic('tag')} Discounts</a>
      <div class="sep">Store</div><a href="#/">${ic('store')} View storefront</a><a>${ic('settings')} Settings</a>
      <div class="store-l"><b style="color:#fff;display:block">Loomera Home</b>Plan: Growth · Jaipur, IN</div></aside>
    <main class="adm-main">
      <div class="adm-top"><div><h1>Good morning, Gunjan</h1><div class="sub">Here's what's happening in your store today</div></div>
        <div class="r"><span class="live"><i></i> Live</span><div class="seg"><button>Today</button><button class="on">7 days</button><button>30 days</button></div><button class="icon-btn" style="background:#fff">${ic('bell')}</button><span class="avatar">GK</span></div></div>
      <div class="kpis">
        <div class="kpi ${S.orders.length ? 'flash' : ''}"><div class="h">Revenue<span class="ic" style="background:var(--brand-soft);color:var(--brand)">${ic('indian-rupee', 'sm')}</span></div><div class="v" id="k-rev">${inr(rev)}</div><div class="delta">▲ 18.4% <span>vs last week</span></div></div>
        <div class="kpi ${S.orders.length ? 'flash' : ''}"><div class="h">Orders<span class="ic" style="background:var(--accent-soft);color:var(--accent)">${ic('shopping-cart', 'sm')}</span></div><div class="v">${cnt}</div><div class="delta">▲ 12.1% <span>vs last week</span></div></div>
        <div class="kpi"><div class="h">Avg. order value<span class="ic" style="background:var(--info-soft);color:var(--info)">${ic('trending-up', 'sm')}</span></div><div class="v">${inr(rev / cnt)}</div><div class="delta">▲ 5.6% <span>vs last week</span></div></div>
        <div class="kpi"><div class="h">Conversion rate<span class="ic" style="background:var(--warn-soft);color:var(--warn)">${ic('eye', 'sm')}</span></div><div class="v">3.42%</div><div class="delta">▲ 0.4 pts <span>vs last week</span></div></div>
      </div>
      <div class="row2">
        <div class="card-a"><div class="hh"><h3>Revenue</h3><span class="muted" style="font-size:13px">Last 7 days · ₹ thousands</span></div><div id="chart"></div></div>
        <div class="card-a"><div class="hh"><h3>Top products</h3><span class="muted" style="font-size:13px">Units sold</span></div>
          ${[['hana-mug', 86], ['trail-bottle', 64], ['fig-candle', 51], ['terra-vase', 38], ['moss-lamp', 22]].map(([id, n]) => { const p = byId(id); return `<div class="top-p"><img src="${p.variants[0].imgs[0]}"><div><div class="n">${p.name}</div><div class="muted" style="font-size:12px">${catName(p.cat)}</div></div><span class="s">${n}</span></div>`; }).join('')}</div>
      </div>
      <div class="row2">
        <div class="card-a"><div class="hh"><h3>Recent orders</h3><a class="link-arrow" style="font-size:13px">View all ${ic('arrow-right', 'xs')}</a></div>
          <table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th></tr></thead><tbody>
          ${orders.slice(0, 6).map((o, i) => `<tr class="${o.mins === 0 ? 'new-row' : ''}"><td><b>${o.id}</b></td><td><div class="cust"><i style="background:${cols[i % 6]}">${o.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</i><div>${o.name}<div class="muted" style="font-size:12px">${o.city}</div></div></div></td><td>${o.items}</td><td><b>${inr(o.total)}</b></td><td>${pill(o.status)}</td><td class="muted">${ago(o)}</td></tr>`).join('')}
          </tbody></table></div>
        <div class="card-a"><div class="hh"><h3>Low stock</h3><span class="pill p-pack">${low.length} items</span></div>
          ${low.map(p => `<div class="inv"><img src="${p.variants[0].imgs[0]}"><div><b>${p.name}</b><span>SKU ${p.id.toUpperCase().slice(0, 8)}</span></div><div class="stock" style="color:${p.stock < 10 ? 'var(--bad)' : 'var(--warn)'}">${p.stock} left<div class="mini-bar"><i style="width:${p.stock / 50 * 100}%;background:${p.stock < 10 ? 'var(--bad)' : 'var(--warn)'}"></i></div></div></div>`).join('')}
          <button class="btn btn-dark btn-block" style="height:42px;margin-top:14px;font-size:14px">${ic('package', 'sm')} Create restock order</button></div>
      </div>
    </main></div>`;
}
function drawChart() {
  const el = $('#chart'); if (!el) return;
  const extra = S.orders.reduce((a, o) => a + o.total, 0) / 1000;
  const data = [21.4, 24.8, 22.1, 29.6, 27.3, 33.9, 29.9 + extra], prev = [18.2, 20.1, 21.5, 22.8, 23.9, 26.1, 23.4];
  const days = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Today'];
  const W = 720, H = 260, P = { l: 36, r: 12, t: 14, b: 30 }, max = 40;
  const x = i => P.l + i * (W - P.l - P.r) / 6, y = v => P.t + (1 - v / max) * (H - P.t - P.b);
  const path = d => d.map((v, i) => (i ? 'L' : 'M') + x(i) + ' ' + y(v)).join(' ');
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%">
    <defs><linearGradient id="gA" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2f4a3e" stop-opacity=".22"/><stop offset="1" stop-color="#2f4a3e" stop-opacity="0"/></linearGradient></defs>
    ${[0, 10, 20, 30, 40].map(v => `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" stroke="#eee8df"/><text x="${P.l - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#8c857c">${v}</text>`).join('')}
    ${days.map((d, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="11.5" fill="#8c857c" font-weight="${i === 6 ? 700 : 400}">${d}</text>`).join('')}
    <path d="${path(prev)}" fill="none" stroke="#cfc7bb" stroke-width="2" stroke-dasharray="5 5"/>
    <path d="${path(data)} L ${x(6)} ${y(0)} L ${x(0)} ${y(0)} Z" fill="url(#gA)"/>
    <path id="rev-line" d="${path(data)}" fill="none" stroke="#2f4a3e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    ${data.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="${i === 6 ? 6 : 3.5}" fill="#fff" stroke="#2f4a3e" stroke-width="${i === 6 ? 3 : 2}"/>`).join('')}
    <g transform="translate(${x(6) - 116},${y(data[6]) - 52})"><rect width="104" height="38" rx="9" fill="#1f1c18"/><text x="12" y="16" font-size="10.5" fill="#bdb6ac">Today</text><text x="12" y="30" font-size="13" font-weight="700" fill="#fff">${inr(data[6] * 1000)}</text></g>
  </svg>`;
  const ln = $('#rev-line'); const L = ln.getTotalLength(); ln.style.strokeDasharray = L; ln.style.strokeDashoffset = L; ln.getBoundingClientRect(); ln.style.transition = 'stroke-dashoffset 1.4s ease'; ln.style.strokeDashoffset = 0;
}

/* ---------- global bindings ---------- */
function renderHeaderCounts(bump) {
  const n = cartCount();
  ['#cart-count', '#m-cart-count'].forEach(s => { const c = $(s); if (c) { c.textContent = n; c.classList.toggle('hidden', !n); } });
  const w = $('#wish-count'); if (w) { w.textContent = S.wish.length; w.classList.toggle('hidden', !S.wish.length); }
  if (bump) { const b = $('#cart-btn'); b && (b.classList.remove('bump'), void b.offsetWidth, b.classList.add('bump')); }
}
let toastT;
function toast(html) { const t = $('#toast'); t.innerHTML = html; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }

function bindCommon(cat) {
  $('#cart-btn') && ($('#cart-btn').onclick = openDrawer);
  $('#m-cart') && ($('#m-cart').onclick = openDrawer);
  const q = $('#q'), sg = $('#suggest');
  if (q) {
    q.oninput = () => {
      const v = q.value.trim().toLowerCase();
      if (!v) { sg.classList.add('hidden'); return; }
      const hits = PRODUCTS.filter(p => (p.name + ' ' + catName(p.cat)).toLowerCase().includes(v)).slice(0, 5);
      sg.innerHTML = `<div class="s-h">Products</div>` + (hits.map(p => `<a href="#/p/${p.id}"><img src="${p.variants[0].imgs[0]}"><div><b style="font-size:14px">${p.name}</b><div class="muted" style="font-size:12.5px">${catName(p.cat)}</div></div><span class="p">${inr(p.price)}</span></a>`).join('') || `<div style="padding:10px" class="muted">No results for "${v}"</div>`);
      sg.classList.remove('hidden');
    };
    q.onblur = () => setTimeout(() => sg.classList.add('hidden'), 200);
  }
  $('#app').onclick = e => {
    const w = e.target.closest('[data-wish]');
    if (w) { e.preventDefault(); const id = w.dataset.wish; S.wish.includes(id) ? S.wish.splice(S.wish.indexOf(id), 1) : S.wish.push(id); w.classList.toggle('on'); save(); renderHeaderCounts(); if (S.wish.includes(id)) toast(`${ic('heart')} Saved to your wishlist`); return; }
    const qa = e.target.closest('[data-quick]'); if (qa) { e.preventDefault(); addToCart(qa.dataset.quick, 0, 1); return; }
    const fc = e.target.closest('[data-fcat]'); if (fc) { const f = S.filters.cats, id = fc.dataset.fcat; f.includes(id) ? f.splice(f.indexOf(id), 1) : f.push(id); fc.classList.toggle('on'); refreshGrid(cat); return; }
    const fl = e.target.closest('[data-fcol]'); if (fl) { const f = S.filters.colors, h = fl.dataset.fcol; f.includes(h) ? f.splice(f.indexOf(h), 1) : f.push(h); fl.classList.toggle('on'); refreshGrid(cat); return; }
    const rc = e.target.closest('[data-rmcat]'); if (rc) { S.filters.cats = S.filters.cats.filter(c => c !== rc.dataset.rmcat); route(); return; }
    const rl = e.target.closest('[data-rmcol]'); if (rl) { S.filters.colors = S.filters.colors.filter(c => c !== rl.dataset.rmcol); route(); return; }
    if (e.target.closest('[data-rmmax]')) { S.filters.max = 4000; route(); }
  };
  const pr = $('#price-r'); if (pr) pr.oninput = () => { S.filters.max = +pr.value; pr.closest('.f-group').querySelector('h5 span').textContent = 'Up to ' + inr(pr.value); refreshGrid(cat); };
  const so = $('#sort'); if (so) so.onchange = () => { S.filters.sort = so.value; refreshGrid(cat); };
}

function route() {
  const h = location.hash.replace(/^#/, '') || '/';
  const [, a, b] = h.split('/');
  closeDrawer();
  let html, after;
  if (a === 'shop') { html = pageShop(b); after = () => refreshGrid(b); }
  else if (a === 'p') { html = pageProduct(b); after = () => bindProduct(b); }
  else if (a === 'checkout') { html = pageCheckout(); after = bindCheckout; }
  else if (a === 'order') { html = pageOrder(b); after = confetti; }
  else if (a === 'admin') { html = pageAdmin(); after = drawChart; }
  else { html = pageHome(); }
  if (!html) return;
  $('#app').innerHTML = html;
  window.scrollTo(0, 0);
  bindCommon(a === 'shop' ? b : null);
  after && after();
}
window.addEventListener('hashchange', route);
window.LOOMERA = { S, openDrawer, closeDrawer, reset() { S.cart = []; S.wish = []; S.coupon = null; S.orders = []; S.filters = { cats: [], colors: [], max: 4000, sort: 'featured' }; S.ship = 'standard'; S.pay = 'upi'; save(); } };
renderDrawer();
route();
})();
