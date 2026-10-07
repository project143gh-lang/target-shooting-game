# Target Shooting Game

A browser-based target shooting game with an economy loop. Hit targets → earn credits → buy guns / skins / scopes / loot crates!

## 📸 Screenshot

![Target Shooting Game Repository](./target-shooting-game.png)

**View the live game:** Open `index.html` in any modern browser (or run `npx serve .`)

## Features

### 🎯 Range (Arena)
- 360° mouse aim or WASD movement
- HOLD left-click / touch / space to fire continuously
- Close-range kills pay 1.5x (magnet effect)
- Stats panel: shots, hits, accuracy, best score
- Restart round button

### 🏪 Shop
- Buy guns (P-9 Sidearm, AR-7 Ranger, LR-8 Ghost)
- Purchase gun skins (Factory Stock, Desert Tan, Crimson Tiger, etc.)
- Equip scopes (Iron Sights, Red Dot, ACOG 4x, Longshot 8x)
- Compatibility system: guns have compatible scope slots
- Rarity system: common • rare • epic • legendary

### 📦 Loot Crates
- **Recruit Crate** (200 credits): Commons + credit refunds
- **Tactical Crate** (600 credits): Rare skins, optics, chance at AR-7
- **Elite Crate** (1400 credits): Epic/legendary odds + Longshot 8x + LR-8
- Weighted random drops: credits, skins, scopes, guns
- Unopened crates stored in your stash

### 🗃️ Vault (Persistent Loadout)
- Gun + Skin + Scope combination
- Loadout persists across browser reloads
- Change equipment anytime
- Visual preview of current loadout
- Reset save option available

### 💰 Economy
- Start with 500 credits
- Hit targets: 10–40 credits by ring
- Daily bonus: +100 credits
- All purchases deduct credits
- Vault equipment saved to localStorage

## 🚀 Quick Start

```bash
# Option 1: Just open in browser
open index.html

# Option 2: Serve with static server
npx serve .

# Option 3: Development mode
# No build step required - open index.html directly
```

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5 + CSS3 + JavaScript (ES modules)
- **Rendering**: Canvas 2D API
- **Persistence**: localStorage (vault loadout, credits, inventory)
- **Icons**: Lucide.js
- **Dependencies**: Zero - no npm install required!

## 📁 Project Structure

```
gameofnow/
├── index.html          # Main UI shell (Range / Shop / Crates / Vault tabs)
├── styles/
│   └── main.css        # All styling (responsive, tab-based layout)
└── src/
    ├── data.js         # Catalog: guns, skins, scopes, crates (prices, rarity, compatibility)
    ├── vault.js        # Persistent store: credits, inventory, loadout (localStorage)
    ├── economy.js      # Pure buy + crate-open logic
    ├── game.js         # Canvas range, targets, scopes/zoom, scoring
    ├── main.js         # Wiring: tabs, rendering shop/crates/vault HUD
    ├── icons.js        # Lucide icon definitions
    └── selfcheck.js   # One runnable assert check (vault + crate math)
```

## 📜 License

MIT

## 🎮 Controls

| Action | Controls |
|--------|----------|
| Move | WASD / Arrow keys |
| Fire | HOLD left-click / touch / space |
| Aim | 360° mouse movement |
| Tab navigation | Range / Shop / Crates / Vault |
| Reset save | Vault → Reset save button |
| Daily bonus | Click "Earn" button in topbar |

---

**K.bhalavardan, MITS Student**
