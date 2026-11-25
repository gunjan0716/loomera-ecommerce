// Demo catalogue for the Loomera storefront (all products and data are fictional).
window.CATS = [
  { id: 'drinkware', name: 'Drinkware', img: 'img/mug-sage.jpg' },
  { id: 'decor', name: 'Vases & Decor', img: 'img/vase-terracotta.jpg' },
  { id: 'scents', name: 'Candles & Scents', img: 'img/candle-amber.jpg' },
  { id: 'kitchen', name: 'Kitchen & Dining', img: 'img/bowl-oat.jpg' },
  { id: 'lighting', name: 'Lighting', img: 'img/lamp-moss.jpg' },
];

window.PRODUCTS = [
  { id: 'hana-mug', name: 'Hana Speckled Mug', cat: 'drinkware', price: 649, mrp: 799, rating: 4.8, count: 214, stock: 46, badge: 'Bestseller',
    desc: 'Hand-thrown stoneware with a satin speckled glaze. Holds 350 ml, keeps heat longer and feels great in both hands.',
    variants: [
      { name: 'Sand', hex: '#d8c4a6', imgs: ['img/mug-sand.jpg', 'img/mug-sand-2.jpg'] },
      { name: 'Sage', hex: '#a9b8a0', imgs: ['img/mug-sage.jpg', 'img/mug-sand-2.jpg'] },
      { name: 'Charcoal', hex: '#4a4744', imgs: ['img/mug-charcoal.jpg', 'img/mug-sand-2.jpg'] } ] },
  { id: 'trail-bottle', name: 'Trail Insulated Bottle 750 ml', cat: 'drinkware', price: 1499, mrp: 1799, rating: 4.7, count: 389, stock: 8, badge: 'Low stock',
    desc: 'Double-wall vacuum steel keeps drinks cold for 24 h and hot for 12 h. Leak-proof cap with a carry loop.',
    variants: [
      { name: 'Forest', hex: '#2f4a3e', imgs: ['img/bottle-forest.jpg', 'img/bottle-clay.jpg'] },
      { name: 'Clay', hex: '#c88f6c', imgs: ['img/bottle-clay.jpg', 'img/bottle-ink.jpg'] },
      { name: 'Ink', hex: '#24324a', imgs: ['img/bottle-ink.jpg', 'img/bottle-forest.jpg'] } ] },
  { id: 'terra-vase', name: 'Terra Bottle Vase', cat: 'decor', price: 1899, rating: 4.9, count: 96, stock: 22, badge: 'New',
    desc: 'A generous bottle silhouette in raw-finish stoneware. Watertight inside, perfect for fresh or dried stems.',
    variants: [
      { name: 'Terracotta', hex: '#c27a56', imgs: ['img/vase-terracotta.jpg', 'img/vase-cream.jpg'] },
      { name: 'Cream', hex: '#e6dccb', imgs: ['img/vase-cream.jpg', 'img/vase-terracotta.jpg'] } ] },
  { id: 'fig-candle', name: 'Fig & Cedar Soy Candle', cat: 'scents', price: 1299, rating: 4.8, count: 172, stock: 31,
    desc: 'Hand-poured soy wax with notes of green fig, cedarwood and a hint of amber. Around 50 hours of clean burn.',
    variants: [{ name: 'Fig & Cedar', hex: '#c9a98a', imgs: ['img/candle-fig.jpg', 'img/candle-amber.jpg'] }] },
  { id: 'amber-candle', name: 'Amber Woods Soy Candle', cat: 'scents', price: 1299, mrp: 1499, rating: 4.7, count: 143, stock: 27,
    desc: 'Warm amber, vanilla bean and smoked oak in a tinted glass vessel you can reuse after the last burn.',
    variants: [{ name: 'Amber Woods', hex: '#b56a2c', imgs: ['img/candle-amber.jpg', 'img/candle-fig.jpg'] }] },
  { id: 'petal-bud', name: 'Petal Bud Vase', cat: 'decor', price: 899, rating: 4.6, count: 88, stock: 40, badge: 'New',
    desc: 'A small glossy bud vase for a single stem. Comes with a dried bunny-tail sprig.',
    variants: [
      { name: 'Coast Blue', hex: '#5d7fa3', imgs: ['img/budvase-blue.jpg', 'img/budvase-blush.jpg'] },
      { name: 'Blush', hex: '#e3b8a8', imgs: ['img/budvase-blush.jpg', 'img/budvase-blue.jpg'] } ] },
  { id: 'slow-dripper', name: 'Slow Pour Ceramic Dripper', cat: 'kitchen', price: 1149, rating: 4.8, count: 65, stock: 18,
    desc: 'Glazed porcelain pour-over cone that fits most mugs and carafes. Takes standard #2 paper filters.',
    variants: [{ name: 'Porcelain', hex: '#f4f1ec', imgs: ['img/dripper-white.jpg', 'img/carafe-clear.jpg'] }] },
  { id: 'mesa-planter', name: 'Mesa Planter with Saucer', cat: 'decor', price: 1049, mrp: 1249, rating: 4.7, count: 119, stock: 6, badge: 'Low stock',
    desc: 'Tapered stoneware planter with a matching saucer and drainage hole. Fits a 12 cm nursery pot.',
    variants: [{ name: 'Speckle', hex: '#ddd2c1', imgs: ['img/planter-speckle.jpg', 'img/bowl-oat.jpg'] }] },
  { id: 'oat-bowl', name: 'Oat Serving Bowl', cat: 'kitchen', price: 1349, rating: 4.9, count: 77, stock: 25,
    desc: 'Wide, shallow serving bowl for salads, fruit or pasta night. Dishwasher and microwave safe.',
    variants: [{ name: 'Oat', hex: '#d3bc9c', imgs: ['img/bowl-oat.jpg', 'img/plates-ash.jpg'] }] },
  { id: 'moss-lamp', name: 'Moss Ceramic Table Lamp', cat: 'lighting', price: 3999, mrp: 4599, rating: 4.8, count: 58, stock: 12, badge: 'Bestseller',
    desc: 'Glazed ceramic base with a brass stem and a linen-look shade. Warm 2700 K LED bulb included.',
    variants: [{ name: 'Moss', hex: '#7c8a5c', imgs: ['img/lamp-moss.jpg', 'img/vase-cream.jpg'] }] },
  { id: 'smoke-diffuser', name: 'Smoke Reed Diffuser', cat: 'scents', price: 1599, rating: 4.6, count: 101, stock: 34,
    desc: 'Smoked-glass bottle with 7 rattan reeds and a vetiver and bergamot blend that lasts about 10 weeks.',
    variants: [{ name: 'Vetiver', hex: '#8c8077', imgs: ['img/diffuser-smoke.jpg', 'img/candle-fig.jpg'] }] },
  { id: 'ash-plates', name: 'Ash Dinner Plate Set of 4', cat: 'kitchen', price: 2499, mrp: 2999, rating: 4.7, count: 64, stock: 15,
    desc: 'Rimmed 26 cm dinner plates in a soft ash glaze with natural speckles. Stack neatly and are chip-resistant.',
    variants: [{ name: 'Ash', hex: '#b9b5ad', imgs: ['img/plates-ash.jpg', 'img/bowl-oat.jpg'] }] },
  { id: 'night-carafe', name: 'Clear Night Carafe', cat: 'kitchen', price: 1199, rating: 4.5, count: 49, stock: 29,
    desc: 'Borosilicate glass carafe with a tumbler that doubles as a lid. 1 litre, for your bedside or desk.',
    variants: [{ name: 'Clear', hex: '#e3e9ea', imgs: ['img/carafe-clear.jpg', 'img/dripper-white.jpg'] }] },
];

// Seed orders for the admin dashboard (fictional customers).
window.SEED_ORDERS = [
  { id: 'LM-24817', name: 'Ananya Rao', city: 'Bengaluru', items: 3, total: 3897, status: 'Packed', mins: 12 },
  { id: 'LM-24816', name: 'Kabir Mehta', city: 'Mumbai', items: 1, total: 3999, status: 'Shipped', mins: 38 },
  { id: 'LM-24815', name: 'Sara Thomas', city: 'Kochi', items: 2, total: 2798, status: 'Shipped', mins: 64 },
  { id: 'LM-24814', name: 'Rohan Gupta', city: 'Delhi', items: 4, total: 5146, status: 'Delivered', mins: 130 },
  { id: 'LM-24813', name: 'Meera Iyer', city: 'Chennai', items: 1, total: 1299, status: 'Delivered', mins: 175 },
];
