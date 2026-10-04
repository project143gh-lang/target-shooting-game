// ponytail: one runnable check — vault + crates + single-muzzle ballistics. Run: node src/selfcheck.js
import assert from 'node:assert/strict';
import { CRATES } from './data.js';
import { RULES, EMBEDDINGS, cosine, similarGuns, bulletVelocity } from './config.js';
import { defaultVault, equipLoadout, spendCredits, addItem, crateCount } from './vault.js';
import { rollCrate, buyCrate, openOwnedCrate } from './economy.js';

const mem = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
};

// 1. crate weights sum > 0 and roll always returns an entry
for (const c of CRATES) {
  const total = c.loot.reduce((a, e) => a + e.w, 0);
  assert.ok(total > 0, `${c.id} weights`);
  for (let i = 0; i < 20; i++) {
    const d = rollCrate(c, () => i / 20);
    assert.ok(d && d.kind, `${c.id} roll`);
  }
}

// 2. vault: cannot equip unowned scope; incompatible scope rejected
{
  const s = mem();
  const v = defaultVault();
  assert.throws(() => equipLoadout(v, { scopeId: 'sniper-8x' }, s), /not owned/i);
  addItem(v, 'scope', 'sniper-8x', s);
  assert.throws(() => equipLoadout(v, { scopeId: 'sniper-8x' }, s), /does not fit/i); // p9 can't fit 8x
  addItem(v, 'gun', 'lr8', s);
  equipLoadout(v, { gunId: 'lr8' }, s);
  equipLoadout(v, { scopeId: 'sniper-8x' }, s); // now fits
  assert.equal(v.loadout.scopeId, 'sniper-8x');
}

// 3. spending more than owned throws, vault persists loadout
{
  const s = mem();
  const v = defaultVault();
  assert.throws(() => spendCredits(v, 999999, s), /credits/i);
  equipLoadout(v, { skinId: 'skin-stock' }, s);
  const raw = JSON.parse(s.getItem('gameofnow_vault_v1'));
  assert.equal(raw.loadout.skinId, 'skin-stock');
}

// 4. single-muzzle ballistics: speed preserved, direction muzzle->aim, zero spread deterministic
{
  const v = bulletVelocity(0, 0, 0, -100, 1000, 0, () => 0.5);
  assert.ok(Math.abs(Math.hypot(v.vx, v.vy) - 1000) < 1e-6, 'speed preserved');
  assert.ok(v.vy < 0 && Math.abs(v.vx) < 1e-6, 'fires toward aim');
  const v2 = bulletVelocity(400, 400, 100, 100, 1250, 0, () => 0.5);
  assert.ok(Math.abs(Math.hypot(v2.vx, v2.vy) - 1250) < 1e-6, 'ar7 speed');
  assert.ok(v2.vx < 0 && v2.vy < 0, 'up-left toward target');
  assert.ok(RULES.SPEED.lr8 > RULES.SPEED.ar7 && RULES.SPEED.ar7 > RULES.SPEED.p9, 'sniper fastest');
}

// 5. embeddings: cosine self = 1, similar guns ranked
{
  assert.equal(cosine([1, 0], [1, 0]), 1);
  const sims = similarGuns('ar7');
  assert.equal(sims.length, 2);
  assert.ok(sims[0].sim >= sims[1].sim, 'ranked');
  assert.ok(EMBEDDINGS.targets.gold[3] > EMBEDDINGS.targets.red[3], 'gold rarer');
}

// 6. crate stash: buy stores unopened, open consumes 1 and grants reward
{
  const s = mem();
  const v = defaultVault();
  v.credits = 5000;
  assert.equal(crateCount(v, 'crate-recruit'), 0);
  buyCrate(v, 'crate-recruit', s);
  buyCrate(v, 'crate-recruit', s);
  assert.equal(crateCount(v, 'crate-recruit'), 2);
  const before = v.credits;
  assert.ok(before < 5000, 'credits deducted on buy, not open');
  const drop = openOwnedCrate(v, 'crate-recruit', s, () => 0.01);
  assert.ok(drop && drop.kind, 'drop granted');
  assert.equal(crateCount(v, 'crate-recruit'), 1);
  assert.throws(() => openOwnedCrate({ ...v, ownedCrates: {} }, 'crate-recruit', s), /stash/i);
}

console.log('selfcheck OK: vault + crate stash + bullets + embeddings pass');
