// Vault: persistent player storage. ONLY module that touches localStorage.
// Persists credits, owned items, and loadout until the user changes it again.
import { START_CREDITS, findGun, findScope } from './data.js';

export const VAULT_KEY = 'gameofnow_vault_v1';

export function defaultVault() {
  return {
    credits: START_CREDITS,
    ownedGuns: ['p9'],
    ownedSkins: ['skin-stock'],
    ownedScopes: ['iron'],
    ownedCrates: {}, // crateId -> unopened count (crate stash section)
    loadout: { gunId: 'p9', skinId: 'skin-stock', scopeId: 'iron' },
    stats: { shots: 0, hits: 0, best: 0, earned: 0 },
  };
}

export function loadVault(storage = localStorage) {
  try {
    const raw = storage.getItem(VAULT_KEY);
    if (!raw) return defaultVault();
    const v = { ...defaultVault(), ...JSON.parse(raw) };
    v.loadout = { ...defaultVault().loadout, ...(v.loadout || {}) };
    v.stats = { ...defaultVault().stats, ...(v.stats || {}) };
    v.ownedCrates = { ...(v.ownedCrates || {}) }; // migrate old saves
    return v;
  } catch {
    return defaultVault();
  }
}

export function saveVault(vault, storage = localStorage) {
  storage.setItem(VAULT_KEY, JSON.stringify(vault));
  return vault;
}

// Mutations always persist. Pass storage for testability.
export function addCredits(vault, n, storage = localStorage) {
  vault.credits += n;
  vault.stats.earned += Math.max(0, n);
  return saveVault(vault, storage);
}

export function spendCredits(vault, n, storage = localStorage) {
  if (vault.credits < n) throw new Error('Not enough credits');
  vault.credits -= n;
  return saveVault(vault, storage);
}

export function addItem(vault, kind, itemId, storage = localStorage) {
  const bucket = kind === 'gun' ? 'ownedGuns' : kind === 'skin' ? 'ownedSkins' : 'ownedScopes';
  if (!vault[bucket].includes(itemId)) vault[bucket].push(itemId);
  return saveVault(vault, storage);
}

// Crate stash: purchased crates wait here unopened until the user opens them.
export function crateCount(vault, crateId) {
  return vault.ownedCrates?.[crateId] || 0;
}

export function stashCrate(vault, crateId, storage = localStorage) {
  vault.ownedCrates = vault.ownedCrates || {};
  vault.ownedCrates[crateId] = crateCount(vault, crateId) + 1;
  return saveVault(vault, storage);
}

export function takeCrate(vault, crateId, storage = localStorage) {
  if (crateCount(vault, crateId) < 1) throw new Error('No such crate in stash');
  vault.ownedCrates[crateId]--;
  if (vault.ownedCrates[crateId] <= 0) delete vault.ownedCrates[crateId];
  return saveVault(vault, storage);
}

// Dress the player: validates ownership + scope↔gun compatibility, then persists.
export function equipLoadout(vault, { gunId, skinId, scopeId }, storage = localStorage) {
  const next = { ...vault.loadout };
  if (gunId) {
    if (!vault.ownedGuns.includes(gunId)) throw new Error('Gun not owned');
    next.gunId = gunId;
  }
  if (skinId) {
    if (!vault.ownedSkins.includes(skinId)) throw new Error('Skin not owned');
    next.skinId = skinId;
  }
  if (scopeId) {
    if (!vault.ownedScopes.includes(scopeId)) throw new Error('Scope not owned');
    const gun = findGun(next.gunId);
    if (!gun.compatibleScopes.includes(scopeId)) {
      throw new Error(`${findScope(scopeId)?.name || scopeId} does not fit ${gun.name}`);
    }
    next.scopeId = scopeId;
  }
  // Re-validate current scope still fits if gun changed
  const gun = findGun(next.gunId);
  if (!gun.compatibleScopes.includes(next.scopeId)) {
    next.scopeId = 'iron'; // ponytail: safe fallback, no extra UI
  }
  vault.loadout = next;
  return saveVault(vault, storage);
}

export function resetVault(storage = localStorage) {
  const v = defaultVault();
  return saveVault(v, storage);
}
