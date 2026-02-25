const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const shotsLeftEl = document.getElementById('shots-left');
const buildingHpEl = document.getElementById('building-hp');
const lastShotEl = document.getElementById('last-shot');
const messageEl = document.getElementById('message');

const angleInput = document.getElementById('angle');
const powerInput = document.getElementById('power');
const angleValue = document.getElementById('angle-value');
const powerValue = document.getElementById('power-value');
const launchBtn = document.getElementById('launch-btn');
const resetBtn = document.getElementById('reset-btn');

const GRAVITY = 0.28;
const GROUND_Y = canvas.height - 70;

const projectileKinds = [
  { name: 'Concrete Breaker', color: '#f9d66c', minDamage: 18, maxDamage: 35 },
  { name: 'Steel Spike', color: '#86e2ff', minDamage: 10, maxDamage: 45 },
  { name: 'Shock Capsule', color: '#ff9ad4', minDamage: 5, maxDamage: 55 }
];

const state = {
  shotsLeft: 3,
  buildingHp: 100,
  projectile: null,
  particles: [],
  buildingShake: 0,
  gameOver: false,
  victory: false,
  frameHandle: null
};

function resetGame() {
  state.shotsLeft = 3;
  state.buildingHp = 100;
  state.projectile = null;
  state.particles = [];
  state.buildingShake = 0;
  state.gameOver = false;
  state.victory = false;
  messageEl.textContent = 'Take your first shot!';
  lastShotEl.textContent = 'None yet';
  updateHud();
}

function updateHud() {
  shotsLeftEl.textContent = state.shotsLeft;
  buildingHpEl.textContent = Math.max(0, Math.ceil(state.buildingHp));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function spawnProjectile() {
  if (state.shotsLeft <= 0 || state.gameOver || state.projectile) {
    return;
  }

  const kind = projectileKinds[randomInt(0, projectileKinds.length - 1)];
  const angle = Number(angleInput.value) * (Math.PI / 180);
  const speed = Number(powerInput.value) / 3;

  state.projectile = {
    x: 90,
    y: GROUND_Y - 8,
    vx: Math.cos(angle) * speed,
    vy: -Math.sin(angle) * speed,
    radius: 12,
    kind
  };

  state.shotsLeft -= 1;
  updateHud();
  messageEl.textContent = `Launching ${kind.name}!`;
}

function spawnImpact(x, y, color) {
  for (let i = 0; i < 25; i += 1) {
    state.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 1.1) * 5,
      life: randomInt(24, 42),
      color
    });
  }
}

function applyBuildingHit(kind) {
  const damage = randomInt(kind.minDamage, kind.maxDamage);
  state.buildingHp -= damage;
  state.buildingShake = 12;
  lastShotEl.textContent = `${kind.name} dealt ${damage} damage`;

  if (state.buildingHp <= 0) {
    state.gameOver = true;
    state.victory = true;
    messageEl.textContent = `Building collapsed! You win with ${state.shotsLeft} shot(s) remaining.`;
  } else if (state.shotsLeft === 0 && !state.projectile) {
    state.gameOver = true;
    messageEl.textContent = `Out of projectiles. The building survives with ${Math.ceil(state.buildingHp)} HP.`;
  } else {
    messageEl.textContent = `Hit! ${damage} damage done.`;
  }

  updateHud();
}

function checkCollisions() {
  if (!state.projectile) return;

  const p = state.projectile;
  const building = {
    x: canvas.width - 220,
    y: GROUND_Y - 220,
    w: 140,
    h: 220
  };

  if (p.x + p.radius > building.x && p.x - p.radius < building.x + building.w && p.y + p.radius > building.y) {
    applyBuildingHit(p.kind);
    spawnImpact(p.x, p.y, p.kind.color);
    state.projectile = null;
  }

  if (state.projectile && (p.y > GROUND_Y || p.x > canvas.width || p.x < 0 || p.y < 0)) {
    messageEl.textContent = 'Missed! Try another projectile.';
    state.projectile = null;
    if (state.shotsLeft === 0) {
      state.gameOver = true;
      messageEl.textContent = `Out of projectiles. The building survives with ${Math.ceil(state.buildingHp)} HP.`;
    }
  }
}

function updatePhysics() {
  if (state.projectile) {
    state.projectile.vy += GRAVITY;
    state.projectile.x += state.projectile.vx;
    state.projectile.y += state.projectile.vy;
  }

  for (const particle of state.particles) {
    particle.vy += 0.18;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= 1;
  }

  state.particles = state.particles.filter((particle) => particle.life > 0);

  if (state.buildingShake > 0) {
    state.buildingShake -= 1;
  }
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = '#2a3b24';
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

  // Launcher
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(65, GROUND_Y - 18, 55, 18);
  ctx.save();
  ctx.translate(85, GROUND_Y - 12);
  ctx.rotate(-Number(angleInput.value) * (Math.PI / 180));
  ctx.fillStyle = '#5b5b66';
  ctx.fillRect(0, -5, 48, 10);
  ctx.restore();

  // Building
  const shakeX = state.buildingShake ? (Math.random() - 0.5) * 4 : 0;
  const buildingX = canvas.width - 220 + shakeX;
  const buildingY = GROUND_Y - 220;
  ctx.fillStyle = state.victory ? '#58616f' : '#8f6f59';
  ctx.fillRect(buildingX, buildingY, 140, 220);

  ctx.fillStyle = '#4a3a2f';
  for (let row = 0; row < 6; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      ctx.fillRect(buildingX + 15 + col * 40, buildingY + 15 + row * 32, 24, 20);
    }
  }

  // HP bar
  ctx.fillStyle = '#222';
  ctx.fillRect(buildingX - 5, buildingY - 30, 150, 14);
  ctx.fillStyle = '#3ddc84';
  ctx.fillRect(buildingX - 3, buildingY - 28, Math.max(0, state.buildingHp) * 1.46, 10);

  // Projectile
  if (state.projectile) {
    ctx.beginPath();
    ctx.fillStyle = state.projectile.kind.color;
    ctx.arc(state.projectile.x, state.projectile.y, state.projectile.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Particles
  for (const particle of state.particles) {
    ctx.globalAlpha = Math.max(0.1, particle.life / 42);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, 4, 4);
  }
  ctx.globalAlpha = 1;
}

function gameLoop() {
  updatePhysics();
  checkCollisions();
  drawScene();
  state.frameHandle = requestAnimationFrame(gameLoop);
}

angleInput.addEventListener('input', () => {
  angleValue.textContent = angleInput.value;
});

powerInput.addEventListener('input', () => {
  powerValue.textContent = powerInput.value;
});

launchBtn.addEventListener('click', spawnProjectile);
resetBtn.addEventListener('click', resetGame);

resetGame();
gameLoop();
