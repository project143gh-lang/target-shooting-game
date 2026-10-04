# Spec: gameofnow — Target Shooting Game

## Objective
Browser target-shooting game with an economy loop: hit targets → earn credits → buy guns / gun skins / scopes / loot crates → equip loadout in the Vault that persists until changed.

User stories:
- As a player I can shoot moving targets and earn credits per hit.
- As a player I can buy guns, skins, scopes with credits (priced items).
- As a player I can open priced loot crates for random drops.
- As a player I can dress my loadout (gun + skin + scope) in the Vault; it persists across reloads until I change it again.

## Tech Stack
- Vanilla HTML + CSS + JS (no deps, no build step — open `index.html`)
- Canvas 2D for the range. `localStorage` for the Vault.
- Ponytail discipline: fewest files, stdlib only, one runnable check.

## Commands
- Play: open `gameofnow/index.html` in a browser (or `npx serve gameofnow`)
- Check: `node gameofnow/src/selfcheck.js` (vault + crate math, no framework)

## Project Structure
```
gameofnow/
  index.html        → UI shell (Range / Shop / Crates / Vault tabs)
  styles/main.css   → all styling
  src/data.js       → guns, skins, scopes, crates catalog (prices, rarity, compat)
  src/vault.js      → persistent store: credits, inventory, loadout (localStorage)
  src/economy.js    → buy + crate-open logic (pure, testable)
  src/game.js       → canvas range, targets, scopes/zoom, scoring
  src/main.js       → wiring: tabs, rendering shop/crates/vault HUD
  src/selfcheck.js  → one runnable assert check
```

## Code Style
- ES modules, `const` first, small pure functions. IDs are kebab-case strings.
- Example: `export function priceOf(item) { return item.price; }`
- Vault is the only module that touches `localStorage`.

## Testing Strategy
- `src/selfcheck.js`: asserts vault equip validation, crate weight sums to 1, purchase deducts credits. Run with node.

## Boundaries
- Always: validate credits before purchase, validate scope↔gun compatibility on equip, persist vault on every mutation.
- Ask first: adding deps, backend/multiplayer.
- Never: real-money purchases, deleting inventory without user action.

## Success Criteria
- [ ] Targets spawn/move, click hit scores + credits, scope zoom changes view.
- [ ] Shop buys deduct credits and add to vault inventory.
- [ ] Crates cost credits and drop one weighted item.
- [ ] Vault loadout (gun+skin+scope) persists after reload until changed.
- [ ] Every gun has a scope slot; incompatible scopes are rejected.

## Open Questions
- None — starter balance: 500 credits, hit = 10–40 credits by ring.
