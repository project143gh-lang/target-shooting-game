// Wiring: tabs, shop / crates / vault rendering, HUD — Lucide icons via src/icons.js.
import { SCOPES, GUNS, SKINS, CRATES, findGun, findSkin, findScope } from './data.js';
import { ICONS, ic, refreshIcons, iconForGun, iconForScope, iconForCrate, iconForRarity } from './icons.js';
import { loadVault, saveVault, equipLoadout, resetVault } from './vault.js';
import { buyItem, buyCrate, openOwnedCrate, describeDrop } from './economy.js';
import { createRange } from './game.js';

const vault = loadVault();
const $ = (s) => document.querySelector(s);
const painted = () => refreshIcons();

const hud = () => {
  $('#credits').textContent = vault.credits;
  $('#stat-shots').textContent = vault.stats.shots;
  $('#stat-hits').textContent = vault.stats.hits;
  const acc = vault.stats.shots ? Math.round((vault.stats.hits / vault.stats.shots) * 100) : 0;
  $('#stat-acc').textContent = `${acc}%`;
  $('#stat-best').textContent = vault.stats.best;
  saveVault(vault);
  renderVault();
  painted();
};

function card({ title, sub, price, owned, btn, btnIcon, preview }) {
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `<div class="preview">${preview || ''}</div>
    <div class="card-body"><h3>${title}</h3><p>${sub}</p>
    <div class="row"><span class="price">${owned ? `${ic(ICONS.owned)} OWNED` : `${ic(ICONS.credits)} ${price} cr`}</span></div></div>`;
  const b = document.createElement('button');
  b.innerHTML = `${btnIcon ? ic(btnIcon) + ' ' : ''}${btn}`;
  b.disabled = !!owned && btn === 'Equip';
  b.onclick = () => {};
  el.querySelector('.card-body').appendChild(b);
  return { el, btnEl: b };
}

function renderShop() {
  const wrap = $('#shop-grid');
  wrap.innerHTML = '';
  for (const g of GUNS) {
    const owned = vault.ownedGuns.includes(g.id);
    const scopes = g.compatibleScopes.map((s) => `${ic(iconForScope(s))} ${findScope(s).name}`).join(', ');
    const { el, btnEl } = card({
      title: `${ic(iconForGun(g.id))} ${g.name}`, price: g.price, owned,
      btn: owned ? 'Equip' : `Buy — ${g.price} cr`, btnIcon: owned ? ICONS.owned : ICONS.credits,
      sub: `${g.desc}<br><small>${ic(ICONS.scope)} ${scopes} • ${ic(ICONS.score)} ${(g.baseReward)}x payout • ${ic(ICONS.fire)} ${g.fireCooldownMs}ms</small>`,
      preview: `<div class="gunprev" style="background:${g.color}"></div>`,
    });
    btnEl.onclick = () => {
      try {
        if (!owned) { buyItem(vault, 'gun', g.id); toast(`${ic(iconForGun(g.id))} Bought ${g.name}`); }
        equipLoadout(vault, { gunId: g.id });
        hud(); renderShop(); painted();
      } catch (e) { toast(`${ic(ICONS.lock)} ${e.message}`, true); }
    };
    wrap.appendChild(el);
  }
  for (const s of SKINS) {
    const owned = vault.ownedSkins.includes(s.id);
    const { el, btnEl } = card({
      title: `${ic(ICONS.skin)} ${s.name}`, price: s.price, owned,
      btn: owned ? 'Equip' : `Buy — ${s.price} cr`, btnIcon: owned ? ICONS.owned : ICONS.credits,
      sub: `<small>${ic(iconForRarity(s.rarity))} ${s.rarity} • ${s.desc}</small>`,
      preview: `<div class="skinprev" style="background:${s.css}"></div>`,
    });
    btnEl.onclick = () => {
      try {
        if (!owned) { buyItem(vault, 'skin', s.id); toast(`${ic(ICONS.owned)} Bought ${s.name}`); }
        equipLoadout(vault, { skinId: s.id });
        hud(); renderShop(); painted();
      } catch (e) { toast(`${ic(ICONS.lock)} ${e.message}`, true); }
    };
    wrap.appendChild(el);
  }
  for (const s of SCOPES) {
    const owned = vault.ownedScopes.includes(s.id);
    const { el, btnEl } = card({
      title: `${ic(iconForScope(s.id))} ${s.name}`, price: s.price, owned,
      btn: owned ? 'Equip' : `Buy — ${s.price} cr`, btnIcon: owned ? ICONS.owned : ICONS.credits,
      sub: `${s.desc}<br><small>${ic(ICONS.accuracy)} ${s.zoom}x zoom • spread ±${s.spread}px</small>`,
      preview: `<div class="scopeprev">${ic(iconForScope(s.id), 'ic ic-lg')}</div>`,
    });
    btnEl.onclick = () => {
      try {
        if (!owned) { buyItem(vault, 'scope', s.id); toast(`${ic(ICONS.owned)} Bought ${s.name}`); }
        equipLoadout(vault, { scopeId: s.id });
        hud(); renderShop(); painted();
      } catch (e) { toast(`${ic(ICONS.lock)} ${e.message}`, true); }
    };
    wrap.appendChild(el);
  }
  painted();
}

function renderCrates() {
  const wrap = $('#crate-grid');
  wrap.innerHTML = '';
  for (const c of CRATES) {
    const { el, btnEl } = card({
      title: `${ic(iconForCrate(c.id))} ${c.name}`, price: c.price,
      btn: `Buy — ${c.price} cr`, btnIcon: ICONS.crate,
      sub: `${c.desc}<br><small>Contains: ${c.loot.map((l) => describeDrop(l)).join(' • ')}</small>`,
      preview: `<div class="crateprev">${ic(iconForCrate(c.id), 'ic ic-xl')}</div>`,
    });
    btnEl.onclick = () => {
      try {
        buyCrate(vault, c.id);
        toast(`${ic(ICONS.crate)} ${c.name} stashed — open it below`);
        hud(); renderCrates(); painted();
      } catch (e) { toast(`${ic(ICONS.lock)} ${e.message}`, true); }
    };
    wrap.appendChild(el);
  }
  // --- stash section: purchased crates wait here with their rewards inside ---
  const stash = $('#stash-grid');
  stash.innerHTML = '';
  const ids = Object.keys(vault.ownedCrates || {});
  const total = ids.reduce((a, id) => a + (vault.ownedCrates[id] || 0), 0);
  $('#stash-count').textContent = total;
  if (!ids.length) {
    stash.innerHTML = `<p class="hint">${ic(ICONS.stash)} Stash empty — buy a crate above. It will wait here until you open it.</p>`;
    painted();
    return;
  }
  for (const id of ids) {
    const c = CRATES.find((x) => x.id === id);
    if (!c) continue;
    const n = vault.ownedCrates[id];
    const { el, btnEl } = card({
      title: `${ic(iconForCrate(id))} ${c.name} ×${n}`, price: 0, owned: false,
      btn: 'Open 1', btnIcon: ICONS.bonus,
      sub: `Rewards inside: ${c.loot.map((l) => describeDrop(l)).join(' • ')}`,
      preview: `<div class="crateprev">${ic(iconForCrate(id), 'ic ic-xl')}<span class="pill">×${n}</span></div>`,
    });
    btnEl.onclick = () => {
      try {
        const drop = openOwnedCrate(vault, id);
        toast(`${ic(ICONS.bonus)} ${c.name} → ${describeDrop(drop)}`);
        hud(); renderCrates(); renderShop(); painted();
      } catch (e) { toast(`${ic(ICONS.lock)} ${e.message}`, true); }
    };
    stash.appendChild(el);
  }
  painted();
}

function renderVault() {
  const l = vault.loadout;
  const gun = findGun(l.gunId), skin = findSkin(l.skinId), scope = findScope(l.scopeId);
  $('#v-gun').textContent = gun?.name || '-';
  $('#v-skin').textContent = skin?.name || '-';
  $('#v-scope').textContent = scope?.name || '-';
  $('#vault-preview-gun').style.background = gun?.color || '#333';
  $('#vault-preview-skin').style.background = skin?.css || '#333';
  $('#vault-preview-scope').innerHTML = ic(iconForScope(scope?.id), 'ic ic-lg');

  const fill = (sel, items, key, names) => {
    const s = $(sel);
    s.innerHTML = '';
    for (const id of items) {
      const o = document.createElement('option');
      o.value = id; o.textContent = names(id);
      s.appendChild(o);
    }
    s.value = vault.loadout[key];
    s.onchange = () => {
      try { equipLoadout(vault, { [key]: s.value }); toast(`${ic(ICONS.vault)} Updated — saved`); hud(); renderShop(); painted(); }
      catch (e) { toast(`${ic(ICONS.lock)} ${e.message}`, true); s.value = vault.loadout[key]; }
    };
  };
  fill('#sel-gun', vault.ownedGuns, 'gunId', (id) => findGun(id).name);
  fill('#sel-skin', vault.ownedSkins, 'skinId', (id) => findSkin(id).name);
  fill('#sel-scope', vault.ownedScopes, 'scopeId', (id) => findScope(id).name);

  const stashN = Object.values(vault.ownedCrates || {}).reduce((a, n) => a + n, 0);
  $('#inv').innerHTML =
    `<span class="pill">${ic(ICONS.gun)} ${vault.ownedGuns.length} guns</span>
     <span class="pill">${ic(ICONS.skin)} ${vault.ownedSkins.length} skins</span>
     <span class="pill">${ic(ICONS.scope)} ${vault.ownedScopes.length} scopes</span>
     <span class="pill">${ic(ICONS.crate)} ${stashN} crates</span>`;
  painted();
}

let toastT;
function toast(html, err = false) {
  const t = $('#toast');
  t.innerHTML = html; // lucide icons render inside toasts
  t.classList.toggle('err', err);
  t.classList.add('show');
  painted();
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2400);
}

function tabs() {
  for (const b of document.querySelectorAll('.tab')) {
    b.onclick = () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
      document.querySelectorAll('.panel').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById(`panel-${b.dataset.tab}`).classList.add('active');
    };
  }
}

tabs();
renderShop();
renderCrates();
hud();
painted();

const range = createRange($('#range'), vault, hud);
$('#restart').onclick = () => { range.restart(); hud(); };
$('#reset-save').onclick = () => { resetVault(); location.reload(); };
$('#earn').onclick = () => { vault.credits += 100; saveVault(vault); hud(); toast(`${ic(ICONS.bonus)} +100 credits`); };
