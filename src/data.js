// Catalog: guns (each has a scope slot), scopes, skins, crates.
// Prices are in credits. Keep IDs stable — vault references them.
export const SCOPES = [
  { id: 'iron', name: 'Iron Sights', zoom: 1.0, spread: 14, price: 0, desc: 'Stock, no zoom.' },
  { id: 'red-dot', name: 'Red Dot', zoom: 1.25, spread: 9, price: 150, desc: 'Tighter spread, slight zoom.' },
  { id: 'acog', name: 'ACOG 4x', zoom: 1.6, spread: 6, price: 600, desc: 'Mid-range zoom.' },
  { id: 'sniper-8x', name: 'Longshot 8x', zoom: 2.2, spread: 2, price: 1200, desc: 'Sniper zoom, pinpoint.' },
];

export const GUNS = [
  { id: 'p9', name: 'P-9 Sidearm', price: 0, fireCooldownMs: 320, baseReward: 1.0, color: '#8a8f98', compatibleScopes: ['iron', 'red-dot'], desc: 'Starter pistol.' },
  { id: 'ar7', name: 'AR-7 Ranger', price: 800, fireCooldownMs: 180, baseReward: 1.25, color: '#4c7c4c', compatibleScopes: ['iron', 'red-dot', 'acog'], desc: 'Fast rifle. Takes up to ACOG.' },
  { id: 'lr8', name: 'LR-8 Ghost', price: 1800, fireCooldownMs: 900, baseReward: 2.0, color: '#3d3d5c', compatibleScopes: ['iron', 'acog', 'sniper-8x'], desc: 'Bolt sniper. ACOG/8x ready, big payouts.' },
];

export const SKINS = [
  { id: 'skin-stock', name: 'Factory Stock', price: 0, rarity: 'common', gunId: null, css: 'linear-gradient(135deg,#888,#555)', desc: 'Default finish.' },
  { id: 'skin-desert', name: 'Desert Tan', price: 200, rarity: 'common', gunId: null, css: 'linear-gradient(135deg,#d9b382,#a67c3d)', desc: 'Universal tan.' },
  { id: 'skin-crimson', name: 'Crimson Tiger', price: 450, rarity: 'rare', gunId: null, css: 'repeating-linear-gradient(45deg,#b3202c 0 8px,#2b2b2b 8px 14px)', desc: 'Red tiger stripe.' },
  { id: 'skin-arctic', name: 'Arctic Wolf', price: 650, rarity: 'rare', gunId: null, css: 'linear-gradient(135deg,#eaf4ff,#9db8d2)', desc: 'Winter camo.' },
  { id: 'skin-neon', name: 'Neon Reaper', price: 1200, rarity: 'epic', gunId: null, css: 'linear-gradient(135deg,#19f0ff,#b026ff)', desc: 'Glows on the range.' },
  { id: 'skin-gold', name: 'Gold Royale', price: 2500, rarity: 'legendary', gunId: null, css: 'linear-gradient(135deg,#ffe27a,#b8860b)', desc: 'For vault flexing.' },
];

// Crate loot tables: weighted entries. kind: 'credits' | 'skin' | 'scope' | 'gun'
export const CRATES = [
  {
    id: 'crate-recruit', name: 'Recruit Crate', price: 200,
    desc: 'Cheap thrills. Commons + credit refunds.',
    loot: [
      { w: 30, kind: 'credits', amount: 100 },
      { w: 25, kind: 'skin', itemId: 'skin-desert' },
      { w: 20, kind: 'credits', amount: 250 },
      { w: 15, kind: 'scope', itemId: 'red-dot' },
      { w: 10, kind: 'skin', itemId: 'skin-crimson' },
    ],
  },
  {
    id: 'crate-tactical', name: 'Tactical Crate', price: 600,
    desc: 'Rare+ skins, optics, a shot at AR-7.',
    loot: [
      { w: 25, kind: 'skin', itemId: 'skin-crimson' },
      { w: 20, kind: 'skin', itemId: 'skin-arctic' },
      { w: 20, kind: 'scope', itemId: 'acog' },
      { w: 15, kind: 'credits', amount: 500 },
      { w: 12, kind: 'gun', itemId: 'ar7' },
      { w: 8, kind: 'skin', itemId: 'skin-neon' },
    ],
  },
  {
    id: 'crate-elite', name: 'Elite Crate', price: 1400,
    desc: 'Epic/legendary odds + Longshot 8x + LR-8.',
    loot: [
      { w: 25, kind: 'skin', itemId: 'skin-neon' },
      { w: 20, kind: 'scope', itemId: 'sniper-8x' },
      { w: 20, kind: 'credits', amount: 900 },
      { w: 15, kind: 'gun', itemId: 'lr8' },
      { w: 12, kind: 'skin', itemId: 'skin-arctic' },
      { w: 8, kind: 'skin', itemId: 'skin-gold' },
    ],
  },
];

export const START_CREDITS = 500;

export const findGun = (id) => GUNS.find((g) => g.id === id);
export const findSkin = (id) => SKINS.find((s) => s.id === id);
export const findScope = (id) => SCOPES.find((s) => s.id === id);
export const findCrate = (id) => CRATES.find((c) => c.id === id);
