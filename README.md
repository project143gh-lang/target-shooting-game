# gameofnow 🎯

Target-shooting game with credits, priced loot crates, gun skins, scoped guns, and a persistent Vault loadout.

## Run
- Double-click `index.html`, or:
- `npx serve gameofnow` then open the URL.

No build, no dependencies.

## How it plays
1. **Range**: click moving targets. Hits earn credits (bullseye = 2x, gold rings pay more). 60s rounds.
2. **Shop**: spend credits on guns / gun skins / scopes. Every gun lists its compatible scopes.
3. **Crates**: Recruit (200) / Tactical (600) / Elite (1400) — weighted random drop, shown before you buy.
4. **Vault**: dress your player — gun + skin + scope. Saved to `localStorage` (`gameofnow_vault_v1`) until you change it again. Incompatible scope↔gun combos are rejected.

## Structure
```
index.html        UI shell + 4 tabs
styles/main.css   styling
src/data.js       guns / skins / scopes / crates + prices
src/vault.js      persistence (only localStorage module)
src/economy.js    buy + crate open
src/game.js       canvas range + scopes/zoom
src/main.js       wiring
src/selfcheck.js  runnable check: node src/selfcheck.js
SPEC.md           spec
```

## Balance
Start: 500 cr. Hit ≈ 22–40 × gun multiplier. Pistol free → AR-7 800 → LR-8 1800. Scopes: Red Dot 150, ACOG 600, 8x 1200.
