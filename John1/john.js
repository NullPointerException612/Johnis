const starCanvas = document.getElementById("starCanvas");
const heartCanvas = document.getElementById("heartCanvas");
const fireworksCanvas = document.getElementById("fireworksCanvas");

const starCtx = starCanvas.getContext("2d");
const heartCtx = heartCanvas.getContext("2d");
const fireworksCtx = fireworksCanvas.getContext("2d");

const openingText = document.getElementById("openingText");
const countdown = document.getElementById("countdown");
const questionPanel = document.getElementById("questionPanel");
const questionText = document.getElementById("questionText");
const questionSubtext = document.getElementById("questionSubtext");
const answerMessage = document.getElementById("answerMessage");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const starWarsMessage = document.getElementById("starWarsMessage");

let width = window.innerWidth;
let height = window.innerHeight;
let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

let stars = [];
let fireworks = [];
let sequenceRunning = false;
let answeredYes = false;
let fireworksInterval = null;
let fireworksTimeout = null;
let starWarsTimeout = null;

const BLUE = "#59c7ff";
const RED = "#ff3b55";
const GOLD = "#ffe66d";

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setupCanvas(canvas, ctx) {
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function resizeCanvases() {
  width = window.innerWidth;
  height = window.innerHeight;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  setupCanvas(starCanvas, starCtx);
  setupCanvas(heartCanvas, heartCtx);
  setupCanvas(fireworksCanvas, fireworksCtx);
  createStars();
}

window.addEventListener("resize", resizeCanvases);

// -------------------------------------
// GALAXY STARFIELD
// -------------------------------------

function createStars() {
  const count = Math.min(300, Math.floor((width * height) / 3500));

  stars = Array.from({ length: count }, () => ({
    x: random(0, width),
    y: random(0, height),
    size: random(0.4, 1.8),
    alpha: random(0.25, 1),
    twinkle: random(0.006, 0.025),
    phase: random(0, Math.PI * 2),
    speed: random(0.04, 0.3),
    color: Math.random() > 0.5 ? BLUE : "#ffffff"
  }));
}

function drawStars() {
  starCtx.clearRect(0, 0, width, height);

  for (const star of stars) {
    star.phase += star.twinkle;
    star.y += star.speed;

    if (star.y > height + 2) {
      star.y = -2;
      star.x = random(0, width);
    }

    starCtx.globalAlpha =
      star.alpha * (0.55 + Math.sin(star.phase) * 0.45);

    starCtx.beginPath();
    starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    starCtx.fillStyle = star.color;
    starCtx.shadowBlur = star.size > 1.2 ? 8 : 0;
    starCtx.shadowColor = star.color;
    starCtx.fill();
  }

  starCtx.globalAlpha = 1;
  starCtx.shadowBlur = 0;
}

// -------------------------------------
// TWO LIGHTSABERS FORMING A HEART
// -------------------------------------

function drawBlade(path, color, progress, scale) {
  heartCtx.save();
  heartCtx.scale(scale, scale);

  // Soft coloured glow around the blade
  heartCtx.beginPath();
  path(heartCtx, progress);
  heartCtx.strokeStyle = color;
  heartCtx.lineWidth = 11;
  heartCtx.lineCap = "round";
  heartCtx.lineJoin = "round";
  heartCtx.shadowColor = color;
  heartCtx.shadowBlur = 24;
  heartCtx.stroke();

  // Bright outer edge
  heartCtx.beginPath();
  path(heartCtx, progress);
  heartCtx.lineWidth = 5;
  heartCtx.shadowBlur = 12;
  heartCtx.stroke();

  // White-hot centre of the lightsaber
  heartCtx.beginPath();
  path(heartCtx, progress);
  heartCtx.strokeStyle = "#ffffff";
  heartCtx.lineWidth = 1.8;
  heartCtx.shadowBlur = 8;
  heartCtx.stroke();

  heartCtx.restore();
}

function leftBladePath(ctx, progress) {
  ctx.moveTo(0, 112);
  ctx.bezierCurveTo(-25, 83, -108, 39, -108, -12);
  ctx.bezierCurveTo(-108, -53, -78, -83, -48, -83);
  ctx.bezierCurveTo(-23, -83, -5, -67, 0, -48);

  // Draw only part of the path while the saber ignites
  const fullPath = ctx;
  // The curve is drawn fully; the glow is animated separately.
}

function rightBladePath(ctx, progress) {
  ctx.moveTo(0, -48);
  ctx.bezierCurveTo(5, -67, 23, -83, 48, -83);
  ctx.bezierCurveTo(78, -83, 108, -53, 108, -12);
  ctx.bezierCurveTo(108, 39, 25, 83, 0, 112);
}

function drawHilt(x, y, angle, color, scale) {
  heartCtx.save();
  heartCtx.translate(x, y);
  heartCtx.rotate(angle);
  heartCtx.scale(scale, scale);

  // Metallic lightsaber handle
  const metal = heartCtx.createLinearGradient(-8, 0, 8, 0);
  metal.addColorStop(0, "#202b3c");
  metal.addColorStop(0.35, "#d8e4f0");
  metal.addColorStop(0.55, "#66788c");
  metal.addColorStop(1, "#111722");

  heartCtx.fillStyle = metal;
  heartCtx.strokeStyle = "#d9e6f5";
  heartCtx.lineWidth = 1;

  heartCtx.beginPath();
  heartCtx.roundRect(-6, 0, 12, 43, 3);
  heartCtx.fill();
  heartCtx.stroke();

  // Grip details
  heartCtx.fillStyle = "#10151f";
  for (let i = 0; i < 4; i++) {
    heartCtx.fillRect(-6, 8 + i * 7, 12, 2);
  }

  // Glowing emitter
  heartCtx.fillStyle = color;
  heartCtx.shadowColor = color;
  heartCtx.shadowBlur = 13;
  heartCtx.fillRect(-4, -5, 8, 8);

  heartCtx.restore();
}

function drawHeart() {
  heartCtx.clearRect(0, 0, width, height);

  const scale = Math.min(width / 330, height / 410, 1.15);
  const centerX = width / 2;
  const centerY = height * 0.46;

  heartCtx.save();
  heartCtx.translate(centerX, centerY);

  // Keep the saber heart centred and leave space for the handles.
  const time = performance.now() / 1000;
  const pulse = 1 + Math.sin(time * 2.2) * 0.012;
  heartCtx.scale(scale * pulse, scale * pulse);

  // Animate the ignition: the two sabers grow into the heart.
  const progress = Math.min(1, Math.max(0, (time - 0.5) / 1.6));

  heartCtx.save();
  heartCtx.globalAlpha = progress;

  drawBlade(leftBladePath, BLUE, progress, 1);
  drawBlade(rightBladePath, RED, progress, 1);

  // Crossed metallic hilts beneath the point of the heart
  drawHilt(-13, 111, -0.48, BLUE, 1);
  drawHilt(13, 111, 0.48, RED, 1);

  heartCtx.restore();
  heartCtx.restore();
}

// -------------------------------------
// COUNTDOWN
// -------------------------------------

async function runCountdown() {
  for (const number of ["3", "2", "1"]) {
    countdown.textContent = number;
    countdown.classList.remove("pop");
    void countdown.offsetWidth;
    countdown.classList.add("pop");
    await wait(850);
  }

  countdown.textContent = "";
  countdown.classList.remove("pop");
}

// -------------------------------------
// INTRO SEQUENCE
// -------------------------------------

function resetQuestion() {
  clearInterval(fireworksInterval);
  clearTimeout(fireworksTimeout);
  clearTimeout(starWarsTimeout);

  fireworksInterval = null;
  fireworksTimeout = null;
  starWarsTimeout = null;
  fireworks = [];
  answeredYes = false;

  questionText.textContent = "Sex?";
  questionSubtext.textContent = "Choose wisely, young Padawan.";
  answerMessage.textContent = "";

  yesButton.textContent = "HELLYE";
  yesButton.disabled = false;
  yesButton.style.display = "inline-block";

  noButton.textContent = "Nah";
  noButton.disabled = false;
  noButton.style.display = "inline-block";
  noButton.style.position = "";
  noButton.style.left = "";
  noButton.style.top = "";
  noButton.style.transform = "";
  noButton.style.transition = "";

  starWarsMessage.classList.remove("show");
  starWarsMessage.setAttribute("aria-hidden", "true");
  questionPanel.classList.remove("show");
  fireworksCtx.clearRect(0, 0, width, height);
}

async function playSequence() {
  if (sequenceRunning || answeredYes) return;

  sequenceRunning = true;
  resetQuestion();

  openingText.style.opacity = "1";
  heartCanvas.style.opacity = "1";

  await wait(700);
  await runCountdown();
  await wait(450);

  openingText.style.opacity = "0";
  await wait(800);

  questionPanel.classList.add("show");
  sequenceRunning = false;
}

// -------------------------------------
// FIREWORKS
// -------------------------------------

const fireworkColors = [
  BLUE, RED, GOLD, "#ffffff", "#a78bfa", "#ff8ac7"
];

function createFirework(x, y) {
  const color = fireworkColors[
    Math.floor(Math.random() * fireworkColors.length)
  ];

  const count = Math.floor(random(55, 100));

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = random(1.1, 5.2);

    fireworks.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      decay: random(0.009, 0.022),
      size: random(1.2, 3),
      color,
      gravity: random(0.015, 0.05)
    });
  }
}

function drawFireworks() {
  fireworksCtx.clearRect(0, 0, width, height);

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const p = fireworks[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.alpha -= p.decay;

    if (p.alpha <= 0) {
      fireworks.splice(i, 1);
      continue;
    }

    fireworksCtx.globalAlpha = p.alpha;
    fireworksCtx.fillStyle = p.color;
    fireworksCtx.shadowBlur = 12;
    fireworksCtx.shadowColor = p.color;

    fireworksCtx.beginPath();
    fireworksCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fireworksCtx.fill();
  }

  fireworksCtx.globalAlpha = 1;
  fireworksCtx.shadowBlur = 0;
}

function launchFireworks() {
  clearInterval(fireworksInterval);
  clearTimeout(fireworksTimeout);

  fireworks = [];

  createFirework(width * 0.5, height * 0.28);
  createFirework(width * 0.25, height * 0.38);
  createFirework(width * 0.75, height * 0.38);

  fireworksInterval = setInterval(() => {
    createFirework(
      random(width * 0.12, width * 0.88),
      random(height * 0.12, height * 0.55)
    );
  }, 320);

  fireworksTimeout = setTimeout(() => {
    clearInterval(fireworksInterval);
    fireworksInterval = null;
  }, 5000);
}

// -------------------------------------
// YES BUTTON
// -------------------------------------

yesButton.addEventListener("click", event => {
  event.stopPropagation();
  if (answeredYes) return;

  answeredYes = true;
  questionText.textContent = "FUCKYEAH";
  questionSubtext.textContent = "The Force is strong with this one.";

  yesButton.disabled = true;
  noButton.style.display = "none";

  launchFireworks();

  starWarsTimeout = setTimeout(() => {
    starWarsMessage.classList.add("show");
    starWarsMessage.setAttribute("aria-hidden", "false");
  }, 5300);
});

// -------------------------------------
// NO BUTTON ESCAPES
// -------------------------------------

function moveNah(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (answeredYes) return;

  const buttonWidth = noButton.offsetWidth || 110;
  const buttonHeight = noButton.offsetHeight || 48;
  const margin = 20;

  const maxX = Math.max(margin, width - buttonWidth - margin);
  const maxY = Math.max(margin, height - buttonHeight - margin);

  noButton.style.position = "fixed";
  noButton.style.left = `${random(margin, maxX)}px`;
  noButton.style.top = `${random(margin, maxY)}px`;
  noButton.style.transform = `rotate(${random(-15, 15)}deg)`;
  noButton.style.transition =
    "left 0.18s ease, top 0.18s ease, transform 0.18s ease";
}

noButton.addEventListener("pointerenter", moveNah);
noButton.addEventListener("pointerdown", moveNah);
noButton.addEventListener("touchstart", moveNah, { passive: false });

// -------------------------------------
// CLICK OUTSIDE TO REPLAY
// -------------------------------------

questionPanel.addEventListener("click", event => {
  event.stopPropagation();
});

document.addEventListener("click", event => {
  if (
    !sequenceRunning &&
    !answeredYes &&
    !questionPanel.contains(event.target) &&
    !starWarsMessage.contains(event.target)
  ) {
    playSequence();
  }
});

// -------------------------------------
// ANIMATION LOOP
// -------------------------------------

function animate() {
  drawStars();
  drawHeart();
  drawFireworks();
  requestAnimationFrame(animate);
}

// -------------------------------------
// START
// -------------------------------------

resizeCanvases();
animate();
playSequence();
