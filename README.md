# Target Shooting Game

A browser-based target shooting game with an economy loop. Hit targets, earn credits, buy guns, skins, scopes, and loot crates!

## Features

- **Target Shooting**: Click on moving targets to score points
- **Economy System**: Earn credits per hit, spend on upgrades
- **Shop**: Buy guns, skins, and scopes with credits
- **Loot Crates**: Open crates for random rewards
- **Vault**: Persistent loadout that saves across sessions

## How to Play

1. Open `index.html` in your browser
2. Click on targets to shoot them
3. Earn credits for each hit
4. Visit the Shop to buy new equipment
5. Open Loot Crates for random rewards
6. Equip your loadout in the Vault

## Tech Stack

- Vanilla HTML + CSS + JavaScript
- Canvas 2D for rendering
- localStorage for persistence
- No dependencies, no build step

## Quick Start

```bash
# Just open in browser
open index.html

# Or serve with any static server
npx serve .
```

## Project Structure

```
gameofnow/
├── index.html          # Main UI
├── styles/
│   └── main.css        # All styles
└── src/
    ├── config.js       # Game configuration
    ├── data.js         # Items catalog
    ├── economy.js      # Buy/sell logic
    ├── game.js         # Game engine
    ├── icons.js        # Icon assets
    ├── main.js         # Entry point
    ├── selfcheck.js   # Validation checks
    └── vault.js        # Persistent storage
```

## License

MIT
