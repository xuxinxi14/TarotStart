function createAltarScene(cardStage, syncRangeFill) {
  const scene = document.getElementById('altarScene');
  const starfield = document.getElementById('starfieldScene');
  const bgParticlesCanvas = document.getElementById('bgParticles');
  const platform = document.getElementById('altarPlatform');
  const outer = document.getElementById('altarOuterWheel');
  const inner = document.getElementById('altarInnerWheel');
  const canvas = document.getElementById('altarEmbers');
  const ctx = canvas.getContext('2d');
  const buttons = Array.from(document.querySelectorAll('#sceneModeGroup button'));
  const controls = document.getElementById('altarControls');
  const speed = document.getElementById('altarSpeed');
  const speedValue = document.getElementById('altarSpeedVal');
  const brightness = document.getElementById('altarBrightness');
  const brightnessValue = document.getElementById('altarBrightnessVal');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'tarot_altar_scene_v2';

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
  // Default to the card-reactive Obsidian Sanctuary (starfield); user can toggle to Altar anytime
  let mode = saved.mode === 'altar' ? 'altar' : 'starfield';
  let ready = false;
  let layoutFrame = 0;
  let outerAngle = 0;
  let innerAngle = 0;
  let pulseVelocity = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let wheelRate = 1;

  speed.value = Number.isFinite(saved.speed) ? saved.speed : speed.defaultValue;
  brightness.value = Number.isFinite(saved.brightness) ? saved.brightness : brightness.defaultValue;

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ mode, speed: Number(speed.value), brightness: Number(brightness.value) }));
    } catch {}
  }

  function applyControls() {
    wheelRate = Number(speed.value) / 100;
    scene.style.setProperty('--altar-brightness', Number(brightness.value) / 100);
    speedValue.textContent = `${speed.value}%`;
    brightnessValue.textContent = `${brightness.value}%`;
    syncRangeFill(speed);
    syncRangeFill(brightness);
  }

  function layout() {
    layoutFrame = 0;
    if (scene.hidden) return;
    const viewportWidth = scene.clientWidth;
    const viewportHeight = scene.clientHeight;
    const stage = cardStage.getBoundingClientRect();
    const center = stage.left + stage.width / 2;
    const centerY = Math.max(viewportHeight * .29, Math.min(viewportHeight * .62, stage.top + stage.height / 2));
    const platformWidth = viewportWidth + 2 * Math.abs(center - viewportWidth / 2) + 84;
    const platformHeight = platformWidth * (platform.naturalHeight || 9) / (platform.naturalWidth || 16);
    const daisRise = platformHeight * Number(platform.dataset.daisRise || 0.2);
    const desiredDaisBottom = Math.max(viewportHeight * .08, viewportHeight - stage.bottom - 38);
    const overhang = Math.max(30, daisRise - desiredDaisBottom);
    scene.style.setProperty('--altar-x', `${center}px`);
    scene.style.setProperty('--altar-y', `${centerY}px`);
    scene.style.setProperty('--altar-platform-width', `${platformWidth}px`);
    scene.style.setProperty('--altar-platform-overhang', `${overhang}px`);
    scene.style.setProperty('--altar-dais-bottom', `${Math.max(0, daisRise - overhang)}px`);

    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(canvasWidth * dpr);
    const pixelHeight = Math.round(canvasHeight * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function queueLayout() {
    if (!scene.hidden && !layoutFrame) layoutFrame = requestAnimationFrame(layout);
  }

  function applyMode() {
    const active = ready && mode === 'altar';
    scene.hidden = !active;
    starfield.hidden = active;
    // Keep fgParticles always active so ceremonial card-switch dust bursts render in BOTH scenes!
    if (bgParticlesCanvas) bgParticlesCanvas.hidden = active;
    controls.hidden = !active;
    for (const button of buttons) {
      const selected = button.dataset.sceneMode === (active ? 'altar' : 'starfield');
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
    queueLayout();
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      mode = button.dataset.sceneMode;
      applyMode();
      save();
    });
  }
  for (const input of [speed, brightness]) {
    input.addEventListener('input', applyControls);
    input.addEventListener('change', save);
  }

  const observer = new ResizeObserver(queueLayout);
  observer.observe(cardStage);
  observer.observe(document.querySelector('main'));
  observer.observe(document.getElementById('controlPanel'));
  window.addEventListener('resize', queueLayout);
  window.addEventListener('scroll', queueLayout, { passive: true });
  reducedMotion.addEventListener('change', queueLayout);
  applyControls();
  applyMode();

  Promise.all(Array.from(scene.querySelectorAll('img'), img => img.decode())).then(() => {
    ready = true;
    applyMode();
  }).catch(() => {
    const altarBtn = buttons.find(button => button.dataset.sceneMode === 'altar');
    if (altarBtn) altarBtn.disabled = true;
  });

  const embers = Array.from({ length: 22 }, () => ({
    progress: Math.random(),
    rate: .060 + Math.random() * .075,
    drift: (Math.random() - .5) * .56,
    phase: Math.random() * Math.PI * 2,
    radius: .50 + Math.random() * .95,
    warmth: Math.random() > .18 ? '238, 204, 144' : '255, 244, 214',
  }));

  function pulse(dir = 1) {
    pulseVelocity += (dir >= 0 ? 1 : -1) * 48;
  }

  function render(dt) {
    if (scene.hidden || reducedMotion.matches) return;
    pulseVelocity *= Math.exp(-dt * 3.8);
    outerAngle = (outerAngle + dt * (2.6 * wheelRate + pulseVelocity * 0.55)) % 360;
    innerAngle = (innerAngle - dt * (4.2 * wheelRate + pulseVelocity * 0.85)) % 360;
    outer.style.transform = `rotate(${outerAngle.toFixed(3)}deg)`;
    inner.style.transform = `rotate(${innerAngle.toFixed(3)}deg)`;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (const ember of embers) {
      ember.progress = (ember.progress + dt * ember.rate) % 1;
      const rise = ember.progress;
      const curl = Math.sin(ember.phase + rise * 5) * .055;
      const x = canvasWidth * (.5 + (ember.drift + curl) * (.22 + rise));
      const y = canvasHeight * (1 - rise * .96);
      const alpha = Math.sin(Math.PI * rise) * .48;
      ctx.fillStyle = `rgba(${ember.warmth}, ${alpha * .14})`;
      ctx.beginPath();
      ctx.arc(x, y, ember.radius * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${ember.warmth}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, ember.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return { get active() { return !scene.hidden; }, render, pulse };
}
