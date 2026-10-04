// Icon set — Lucide names + tiny renderer. Single source for every indicator.
// Usage: ic(ICONS.credits) → '<i data-lucide="coins" class="ic"></i>'
// After any innerHTML render, call refreshIcons() (lucide.createIcons).
export const ICONS = {
  brand: 'crosshair',
  credits: 'coins',
  score: 'star',
  timer: 'timer',
  shots: 'zap',
  hits: 'sparkles',
  accuracy: 'target',
  best: 'trophy',
  tabRange: 'gamepad-2',
  tabShop: 'shopping-cart',
  tabCrates: 'package',
  tabVault: 'key-round',
  gun: 'crosshair',
  skin: 'palette',
  scope: 'telescope',
  crate: 'package',
  stash: 'backpack',
  vault: 'key-round',
  player: 'user',
  move: 'move',
  fire: 'flame',
  restart: 'rotate-ccw',
  bonus: 'gift',
  closeRange: 'magnet',
  bullseye: 'target',
  miss: 'wind',
  cooldown: 'snowflake',
  owned: 'badge-check',
  lock: 'lock',
};

export const GUN_ICONS = { p9: 'zap', ar7: 'flame', lr8: 'telescope' };
export const SCOPE_ICONS = { iron: 'circle', 'red-dot': 'disc', acog: 'telescope', 'sniper-8x': 'crosshair' };
export const CRATE_ICONS = { 'crate-recruit': 'package', 'crate-tactical': 'boxes', 'crate-elite': 'crown' };
export const RARITY_ICONS = { common: 'circle', rare: 'medal', epic: 'gem', legendary: 'crown' };

export const iconForGun = (id) => GUN_ICONS[id] || ICONS.gun;
export const iconForScope = (id) => SCOPE_ICONS[id] || ICONS.scope;
export const iconForCrate = (id) => CRATE_ICONS[id] || ICONS.crate;
export const iconForRarity = (r) => RARITY_ICONS[r] || 'circle';

// Render a lucide icon. Falls back to nothing if lucide CDN is offline.
export function ic(name, cls = 'ic') {
  return `<i data-lucide="${name}" class="${cls}"></i>`;
}

export function refreshIcons(root = document) {
  try {
    window.lucide?.createIcons?.();
  } catch { /* offline — text labels still read fine */ }
  void root;
}
