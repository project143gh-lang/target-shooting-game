// Central tuning: round rules, ballistics, 360 arena, and item embeddings.
// Bullets fire from the PLAYER muzzle (spawn spot, then wherever you move).
export const RULES = {
  ROUND_SECONDS: 60,
  MAX_TARGETS: 6,
  SPAWN_MS: 700,
  SIGHTER_SHOTS: 3, // first N shots/round don't hurt accuracy display
  BULLET_LIFE_S: 1.2,
  BULLET_RADIUS: 3,
  GRAVITY: { p9: 0, ar7: 0, lr8: 60 }, // px/s^2, sniper-only drop for feel
  SPEED: { p9: 950, ar7: 1250, lr8: 1750 }, // px/s muzzle velocity
  ARENA_R: 700, // 360 arena radius (world units)
  PLAYER_SPEED: 240, // px/s WASD movement
  PLAYER_R: 16,
  CLOSE_RANGE_PX: 190, // "reach the target" bonus radius
  CLOSE_BONUS: 1.5,
};

// Item embeddings [power, precision, speed, rarity], 0..1 — cosine similarity.
export const EMBEDDINGS = {
  guns: {
    p9: [0.3, 0.4, 0.5, 0.1],
    ar7: [0.55, 0.6, 0.9, 0.4],
    lr8: [0.95, 0.95, 0.25, 0.9],
  },
  scopes: {
    iron: [0.1, 0.2, 0.5, 0.0],
    'red-dot': [0.2, 0.5, 0.6, 0.2],
    acog: [0.4, 0.75, 0.5, 0.55],
    'sniper-8x': [0.6, 0.95, 0.3, 0.85],
  },
  skins: {
    'skin-stock': [0.1, 0.1, 0.1, 0.0],
    'skin-desert': [0.2, 0.2, 0.2, 0.2],
    'skin-crimson': [0.4, 0.4, 0.4, 0.5],
    'skin-arctic': [0.4, 0.45, 0.4, 0.55],
    'skin-neon': [0.6, 0.6, 0.6, 0.8],
    'skin-gold': [0.8, 0.8, 0.8, 1.0],
  },
  targets: {
    red: [0.4, 0.5, 0.5, 0.2],
    gold: [0.8, 0.8, 0.6, 0.9],
  },
};

export function cosine(a, b) {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const na = Math.hypot(...a) || 1, nb = Math.hypot(...b) || 1;
  return dot / (na * nb);
}

export function similarGuns(gunId, table = EMBEDDINGS.guns) {
  const base = table[gunId];
  return Object.keys(table)
    .filter((k) => k !== gunId)
    .map((k) => ({ id: k, sim: cosine(base, table[k]) }))
    .sort((x, y) => y.sim - x.sim);
}

// Pure, testable: velocity from single muzzle to aim point + spread jitter.
export function bulletVelocity(mx, my, tx, ty, speed, spreadPx = 0, rng = Math.random) {
  let dx = tx - mx, dy = ty - my;
  const len = Math.hypot(dx, dy) || 1;
  dx /= len; dy /= len;
  // Valve-style cone: perpendicular jitter scaled by spread
  const j = (rng() - 0.5) * spreadPx;
  const nx = -dy, ny = dx; // perpendicular
  // convert px jitter at aim plane to small angle offset
  const k = j / len;
  let vx = (dx + nx * k), vy = (dy + ny * k);
  const vl = Math.hypot(vx, vy) || 1;
  return { vx: (vx / vl) * speed, vy: (vy / vl) * speed };
}
