# gameofnow — Standard Shooting Rules (adapted for arcade)

Sources: ISSF General Technical Rules / NRA Precision Pistol / CMP Games 2026 (firing line, scoring rings, sighter vs match shots, timed ends); Valve VDC spread cones + gamedev hitscan-vs-projectile practice; ACE3/Bohemia drag+gravity model.

## 1. Range rules (normal shooting, adapted)
1. **Single firing point.** All shots originate from one muzzle at the firing line (bottom-center). You aim, the gun does not move.
2. **Downrange targets only.** Targets spawn/move downrange (upper 2/3 of canvas). Shots that leave the impact area (off-screen) are misses.
3. **Scoring rings.** Outer ring = 10 pts, inner (bullseye, r<40%) = 25 pts + 2x credits. Gold targets = premium (40cr base vs 22cr).
4. **Ends, not infinite.** 60s round, max 6 targets alive, spawn every 700ms, target lifetime ~2.6–4.6s (like turning-target exposure).
5. **Sighter vs match.** First 3 shots each round are sighters (no penalty for miss); after that accuracy % counts.
6. **Fire discipline.** Each gun has cooldown (pistol 320ms / rifle 180ms / sniper 900ms). Firing during cooldown = "Cooling down", no bullet.
7. **Safety.** Finger off trigger during `over` state; Restart resets the line. (Game analogue of ECI/safety flag.)

## 2. Bullet configuration (single muzzle → moving objects)
- Origin: `muzzle()` = gun tip, bottom-center. Fixed. Never fires from click point.
- Direction: normalized vector muzzle → aim point + spread-cone jitter (Valve-style: iron ±14px, red-dot ±9, ACOG ±6, 8x ±2 at aim plane).
- Speed (px/s): P-9 950, AR-7 1250, LR-8 1750. Sniper fastest (flat trajectory).
- Gravity: 0 for pistol/rifle (arcade flat), 60 px/s² for LR-8 for feel — still hitscan-like at these ranges.
- Drag: none (short range). Lifetime 1.2s, radius 3px, tracer drawn.
- Collision: circle test bullet vs moving target each step; farthest-spawned target wins ties; bullet dies on first hit.
- Lead your target: bullets take ~0.3–0.5s to cross — moving targets must be led, like trap/skeet.

## 3. Embeddings (for balancing / shop similarity)
Each catalog item carries a 4-dim embedding `[power, precision, speed, rarity]` in `src/config.js` (normalized 0..1).
Use cosine similarity for "similar guns" or crate-tier checks. No dependency — pure math in `config.js`.
Example: AR-7 `[0.55,0.6,0.9,0.4]` is closer to P-9 than to LR-8 sniper.

## 4. Tuning knobs (`src/config.js`)
`ROUND_SECONDS, MAX_TARGETS, SPAWN_MS, BULLET_LIFE, GRAVITY, SIGHTER_SHOTS` — change one place.
