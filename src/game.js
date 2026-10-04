// 360 arena: player spawns at a spot, moves with WASD, aims 360° with mouse,
// HOLDS mouse/space to fire continuously. Bullets spawn at the player muzzle.
import { findGun, findScope, findSkin } from './data.js';
import { RULES, bulletVelocity } from './config.js';
import { addCredits } from './vault.js';

export function createRange(canvas, vault, hud) {
  const ctx = canvas.getContext('2d');
  const state = {
    running: true, score: 0, targets: [], bullets: [],
    lastSpawn: 0, lastShot: 0, muzzle: 0,
    time: RULES.ROUND_SECONDS, over: false, message: 'WASD to move • aim 360° • HOLD click to fire',
    firing: false,
    player: { x: 0, y: 0, angle: -Math.PI / 2 }, // world coords, arena center spawn
    keys: {},
  };
  let raf = 0;

  const W = () => canvas.width, H = () => canvas.height;
  const loadout = () => vault.loadout;
  const gun = () => findGun(loadout().gunId) || findGun('p9');
  const scope = () => findScope(loadout().scopeId) || findScope('iron');

  // world->screen: player stays centered (360 camera follows player)
  const cam = () => ({ x: W() / 2 - state.player.x, y: H() / 2 - state.player.y });
  const toWorld = (sx, sy) => ({ x: sx - cam().x, y: sy - cam().y });
  const muzzlePos = () => ({
    x: state.player.x + Math.cos(state.player.angle) * 26,
    y: state.player.y + Math.sin(state.player.angle) * 26,
  });

  function spawnTarget() {
    // spawn on a ring around the player so they must turn/move to reach
    const a = Math.random() * Math.PI * 2;
    const dist = 260 + Math.random() * 320;
    const r = 16 + Math.random() * 22;
    state.targets.push({
      x: state.player.x + Math.cos(a) * dist,
      y: state.player.y + Math.sin(a) * dist,
      r, vx: (Math.random() - 0.5) * 170, vy: (Math.random() - 0.5) * 130,
      born: performance.now(), ttl: 3200 + Math.random() * 2200,
      ring: Math.random() < 0.18 ? 'gold' : 'red',
    });
  }

  const distToPlayer = (t) => Math.hypot(t.x - state.player.x, t.y - state.player.y);
  function rewardFor(t) {
    const close = distToPlayer(t) < RULES.CLOSE_RANGE_PX ? RULES.CLOSE_BONUS : 1;
    return Math.round((t.ring === 'gold' ? 40 : 22) * gun().baseReward * close);
  }

  function tryFire() {
    const now = performance.now();
    if (state.over || !state.running || !state.firing) return;
    if (now - state.lastShot < gun().fireCooldownMs) return; // hold = auto retry, no spam msg
    state.lastShot = now;
    state.muzzle = now;
    vault.stats.shots++;
    const m = muzzlePos();
    // aim along player facing angle (360°) + spread jitter
    const aimX = m.x + Math.cos(state.player.angle) * 500;
    const aimY = m.y + Math.sin(state.player.angle) * 500;
    const speed = RULES.SPEED[gun().id] || 1000;
    const v = bulletVelocity(m.x, m.y, aimX, aimY, speed, scope().spread);
    state.bullets.push({ x: m.x, y: m.y, vx: v.vx, vy: v.vy, age: 0 });
    hud();
  }

  function hitTarget(b) {
    for (let i = state.targets.length - 1; i >= 0; i--) {
      const t = state.targets[i];
      const d = Math.hypot(t.x - b.x, t.y - b.y);
      if (d <= t.r + RULES.BULLET_RADIUS + 2) {
        const bull = d < t.r * 0.4;
        const close = distToPlayer(t) < RULES.CLOSE_RANGE_PX;
        const reward = rewardFor(t) * (bull ? 2 : 1);
        state.targets.splice(i, 1);
        state.score += bull ? 25 : 10;
        addCredits(vault, reward);
        vault.stats.hits++;
        vault.stats.best = Math.max(vault.stats.best, state.score);
        state.message = bull ? `BULLSEYE +${reward}cr` : `HIT +${reward}cr${close ? ' (close-range)' : ''}`;
        hud();
        return true;
      }
    }
    return false;
  }

  // --- input: 360 aim + hold-to-fire + WASD move ---
  let mouse = { x: 0, y: 0, in: false };
  const toScreen = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  };
  const aimAt = (sx, sy) => {
    const w = toWorld(sx, sy);
    state.player.angle = Math.atan2(w.y - state.player.y, w.x - state.player.x);
  };
  canvas.addEventListener('mousemove', (e) => { const p = toScreen(e); mouse = { ...p, in: true }; aimAt(p.x, p.y); });
  canvas.addEventListener('mousedown', (e) => { const p = toScreen(e); aimAt(p.x, p.y); state.firing = true; tryFire(); });
  window.addEventListener('mouseup', () => (state.firing = false));
  canvas.addEventListener('mouseleave', () => { mouse.in = false; state.firing = false; });
  canvas.addEventListener('touchstart', (e) => { const t = e.touches[0]; const p = toScreen(t); aimAt(p.x, p.y); state.firing = true; tryFire(); }, { passive: true });
  canvas.addEventListener('touchmove', (e) => { const t = e.touches[0]; aimAt(toScreen(t).x, toScreen(t).y); }, { passive: true });
  canvas.addEventListener('touchend', () => (state.firing = false));
  window.addEventListener('keydown', (e) => {
    state.keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') { state.firing = true; e.preventDefault(); }
  });
  window.addEventListener('keyup', (e) => {
    state.keys[e.key.toLowerCase()] = false;
    if (e.key === ' ') state.firing = false;
  });

  function movePlayer(dt) {
    const k = state.keys;
    let dx = (k['d'] || k['arrowright'] ? 1 : 0) - (k['a'] || k['arrowleft'] ? 1 : 0);
    let dy = (k['s'] || k['arrowdown'] ? 1 : 0) - (k['w'] || k['arrowup'] ? 1 : 0);
    if (!dx && !dy) return;
    const l = Math.hypot(dx, dy) || 1;
    const p = state.player;
    p.x += (dx / l) * RULES.PLAYER_SPEED * dt;
    p.y += (dy / l) * RULES.PLAYER_SPEED * dt;
    const d = Math.hypot(p.x, p.y);
    if (d > RULES.ARENA_R) { p.x *= RULES.ARENA_R / d; p.y *= RULES.ARENA_R / d; }
  }

  function draw() {
    const c = cam();
    ctx.fillStyle = '#0b1020';
    ctx.fillRect(0, 0, W(), H());
    ctx.save();
    ctx.translate(c.x, c.y);
    // arena floor + rings (360 world, not a board)
    ctx.beginPath(); ctx.arc(0, 0, RULES.ARENA_R, 0, 7);
    ctx.fillStyle = '#101736'; ctx.fill();
    ctx.strokeStyle = '#2a3560'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1;
    for (const rr of [150, 300, 450, 600]) { ctx.beginPath(); ctx.arc(0, 0, rr, 0, 7); ctx.stroke(); }
    for (let a = 0; a < 12; a++) {
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos((a / 12) * Math.PI * 2) * RULES.ARENA_R, Math.sin((a / 12) * Math.PI * 2) * RULES.ARENA_R);
      ctx.stroke();
    }
    // spawn spot marker
    ctx.strokeStyle = 'rgba(25,240,255,.4)'; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    // close-range ring around player ("reach" zone)
    ctx.strokeStyle = 'rgba(255,210,77,.35)';
    ctx.beginPath(); ctx.arc(state.player.x, state.player.y, RULES.CLOSE_RANGE_PX, 0, 7); ctx.stroke();
    // targets
    for (const g of state.targets) {
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, 7);
      ctx.fillStyle = g.ring === 'gold' ? '#e8b400' : '#c22'; ctx.fill();
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r * 0.62, 0, 7);
      ctx.fillStyle = '#eee'; ctx.fill();
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r * 0.32, 0, 7);
      ctx.fillStyle = g.ring === 'gold' ? '#7a5200' : '#c22'; ctx.fill();
    }
    // bullets
    for (const b of state.bullets) {
      ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(b.x - b.vx * 0.02, b.y - b.vy * 0.02); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(b.x, b.y, RULES.BULLET_RADIUS, 0, 7); ctx.fill();
    }
    drawPlayer();
    ctx.restore();
  }

  function drawPlayer() {
    const p = state.player, g = gun(), skin = findSkin(loadout().skinId);
    const flash = performance.now() - state.muzzle < 90;
    // body
    ctx.beginPath(); ctx.arc(p.x, p.y, RULES.PLAYER_R, 0, 7);
    ctx.fillStyle = '#1c2547'; ctx.fill();
    ctx.strokeStyle = '#19f0ff'; ctx.lineWidth = 2; ctx.stroke();
    // facing gun (rotates full 360°)
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.angle);
    ctx.fillStyle = g.color;
    ctx.fillRect(8, -5, 26, 10);
    ctx.fillStyle = skin?.id === 'skin-gold' ? '#ffe27a' : '#0c0c0c';
    ctx.fillRect(26, -3, 8, 6);
    if (flash) { ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(40, 0, 9, 0, 7); ctx.fill(); }
    ctx.restore();
    ctx.fillStyle = '#9aa'; ctx.font = '11px system-ui';
    ctx.fillText(`you • ${g.name}`, p.x - 40, p.y - 24);
  }

  function drawCrosshair() {
    if (!mouse.in || state.over) return;
    const s = scope();
    const { x, y } = mouse;
    const gap = 10 / s.zoom + 6, len = 12;
    ctx.strokeStyle = '#19f0ff'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - gap - len, y); ctx.lineTo(x - gap, y);
    ctx.moveTo(x + gap, y); ctx.lineTo(x + gap + len, y);
    ctx.moveTo(x, y - gap - len); ctx.lineTo(x, y - gap);
    ctx.moveTo(x, y + gap); ctx.lineTo(x, y + gap + len);
    ctx.stroke();
    if (s.zoom > 1.1) {
      ctx.strokeStyle = 'rgba(25,240,255,.35)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 46, 0, 7); ctx.stroke();
      ctx.fillStyle = 'rgba(25,240,255,.8)'; ctx.font = '11px system-ui';
      ctx.fillText(`${s.name} ${s.zoom}x`, x + 52, y + 4);
    }
  }

  function frame(now) {
    if (!state.running) return;
    const dt = 0.016;
    if (!state.over) {
      state.time -= dt;
      if (state.time <= 0) { state.time = 0; state.over = true; state.firing = false; state.message = 'Time! Hit Restart.'; }
    }
    movePlayer(dt);
    if (state.firing) { const r = canvas.getBoundingClientRect(); void r; tryFire(); } // hold = continuous
    if (!state.over && now - state.lastSpawn > RULES.SPAWN_MS && state.targets.length < RULES.MAX_TARGETS) {
      state.lastSpawn = now; spawnTarget();
    }
    const t = performance.now();
    for (let i = state.targets.length - 1; i >= 0; i--) {
      const g = state.targets[i];
      g.x += g.vx * dt; g.y += g.vy * dt;
      if (Math.hypot(g.x, g.y) > RULES.ARENA_R) { // bounce off arena edge
        const nx = g.x / (Math.hypot(g.x, g.y) || 1), ny = g.y / (Math.hypot(g.x, g.y) || 1);
        const dot = g.vx * nx + g.vy * ny;
        g.vx -= 2 * dot * nx; g.vy -= 2 * dot * ny;
      }
      if (t - g.born > g.ttl) state.targets.splice(i, 1);
    }
    const grav = RULES.GRAVITY[gun().id] || 0;
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.age += dt; b.vy += grav * dt;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (hitTarget(b)) { state.bullets.splice(i, 1); continue; }
      if (b.age > RULES.BULLET_LIFE_S || Math.hypot(b.x, b.y) > RULES.ARENA_R + 60) {
        state.bullets.splice(i, 1);
        if (!state.message) state.message = 'Miss';
      }
    }
    draw();
    ctx.fillStyle = '#fff'; ctx.font = '14px system-ui';
    ctx.fillText(`Score ${state.score}  |  ${Math.ceil(state.time)}s  |  ${state.message}`, 12, 22);
    ctx.fillText(`WASD move | HOLD click/space to fire | close range = 1.5x`, 12, H() - 12);
    drawCrosshair();
    if (state.over) {
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W(), H());
      ctx.fillStyle = '#fff'; ctx.font = '28px system-ui';
      ctx.fillText(`Round over — Score ${state.score}`, W() / 2 - 170, H() / 2);
    }
    raf = requestAnimationFrame(frame);
  }

  function sizeCanvas() {
    const r = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.max(640, Math.min(980, r.width - 2));
    canvas.height = 480;
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  raf = requestAnimationFrame(frame);

  return {
    state, muzzlePos,
    restart() {
      state.score = 0; state.targets = []; state.bullets = [];
      state.player.x = 0; state.player.y = 0; state.player.angle = -Math.PI / 2;
      state.time = RULES.ROUND_SECONDS; state.over = false; state.firing = false; state.message = '';
    },
    destroy() { state.running = false; cancelAnimationFrame(raf); },
  };
}
