// Economy: purchases + loot crates. Pure logic over a vault object.
import { GUNS, SKINS, SCOPES, findCrate, findGun, findSkin, findScope } from './data.js';
import { spendCredits, addItem, stashCrate, takeCrate, saveVault } from './vault.js';
import { ic } from './icons.js';

export function catalog() {
  return {
    guns: GUNS.map((g) => ({ ...g, kind: 'gun' })),
    skins: SKINS.map((s) => ({ ...s, kind: 'skin' })),
    scopes: SCOPES.map((s) => ({ ...s, kind: 'scope' })),
  };
}

function alreadyOwned(vault, kind, id) {
  if (kind === 'gun') return vault.ownedGuns.includes(id);
  if (kind === 'skin') return vault.ownedSkins.includes(id);
  return vault.ownedScopes.includes(id);
}

export function buyItem(vault, kind, itemId, storage) {
  const pool = kind === 'gun' ? GUNS : kind === 'skin' ? SKINS : SCOPES;
  const item = pool.find((i) => i.id === itemId);
  if (!item) throw new Error('Unknown item');
  if (alreadyOwned(vault, kind, itemId)) throw new Error('Already owned');
  spendCredits(vault, item.price, storage);
  addItem(vault, kind, itemId, storage);
  return item;
}

// Weighted random pick from crate loot table. rng injectable for tests.
export function rollCrate(crate, rng = Math.random) {
  const total = crate.loot.reduce((a, e) => a + e.w, 0);
  let r = rng() * total;
  for (const entry of crate.loot) {
    r -= entry.w;
    if (r <= 0) return entry;
  }
  return crate.loot[crate.loot.length - 1];
}

export function describeDrop(entry) {
  if (entry.kind === 'credits') return `${ic('coins')} +${entry.amount} coins`;
  if (entry.kind === 'gun') return `${ic('crosshair')} ${findGun(entry.itemId)?.name || entry.itemId}`;
  if (entry.kind === 'skin') return `${ic('palette')} ${findSkin(entry.itemId)?.name || entry.itemId}`;
  return `${ic('telescope')} ${findScope(entry.itemId)?.name || entry.itemId}`;
}

// Grant a rolled reward into the vault (coins / gun / skin / scope objects).
export function applyDrop(vault, drop, storage) {
  if (drop.kind === 'credits') {
    vault.credits += drop.amount;
    vault.stats.earned += drop.amount;
    return saveVault(vault, storage);
  }
  return addItem(vault, drop.kind, drop.itemId, storage);
}

// Buy a crate → stored unopened in the crate stash section.
export function buyCrate(vault, crateId, storage) {
  const crate = findCrate(crateId);
  if (!crate) throw new Error('Unknown crate');
  spendCredits(vault, crate.price, storage);
  stashCrate(vault, crateId, storage);
  return crate;
}

// Open one stashed crate → consumes 1 from stash, grants its reward.
export function openOwnedCrate(vault, crateId, storage, rng = Math.random) {
  const crate = findCrate(crateId);
  if (!crate) throw new Error('Unknown crate');
  takeCrate(vault, crateId, storage);
  const drop = rollCrate(crate, rng);
  applyDrop(vault, drop, storage);
  return drop;
}

export function openCrate(vault, crateId, storage, rng = Math.random) {
  // Legacy instant-open (buy + open). Kept for compat; UI now uses buyCrate + openOwnedCrate.
  const crate = findCrate(crateId);
  if (!crate) throw new Error('Unknown crate');
  spendCredits(vault, crate.price, storage);
  const drop = rollCrate(crate, rng);
  applyDrop(vault, drop, storage);
  return drop;
}
