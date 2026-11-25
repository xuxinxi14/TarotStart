/* De-Objectified Sanctuary Ambience (Candlelight Glow, Incense Smoke, Acoustic Ripples)
   + Self-Contained Curator's Ritual Instruments Tray (Singing Bowl, 3xD12 Astro Dice, Amethyst Pendulum) */
window.TAROT_ALTAR_PROPS = (() => {
  const STORAGE_KEY = 'tarot_sanctuary_ambience_v2';
  const VS15 = '\uFE0E';

  const AMBIENCE_CATALOG = [
    { id: 'candles', name: '两侧烛光', en: 'CANDLELIGHT', hint: '柔和摇曳的桌面暖光与明暗氛围' },
    { id: 'incense', name: '圣木轻烟', en: 'PALO SANTO', hint: '桌角袅袅升起的净场青烟' },
  ];

  // Crisp bespoke fine-line horology SVG glyphs so dice NEVER render OS color emojis
  const GLYPH_SVG = {
    sun: '<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
    moon: '<path d="M15.8 6.4A6.4 6.4 0 1 0 15.8 17.6A4.9 4.9 0 1 1 15.8 6.4Z"/>',
    mercury: '<circle cx="12" cy="11.2" r="4.1"/><path d="M8.5 5.2a3.8 3.8 0 0 0 7 0M12 15.3v5.2M9.2 18.2h5.6"/>',
    venus: '<circle cx="12" cy="9.2" r="4.5"/><path d="M12 13.7v6.6M9.2 17.4h5.6"/>',
    mars: '<circle cx="10.2" cy="13.8" r="4.5"/><path d="M13.5 10.5L18.4 5.6M14.2 5.6h4.2v4.2"/>',
    jupiter: '<path d="M7.2 8.2c0-2.1 1.4-3.4 3.1-3.4 1.6 0 2.7 1.1 2.7 2.8 0 2.4-2.4 4.1-5.6 5.9h9.8M14.4 6.2v13.2"/>',
    saturn: '<path d="M7.4 6.6h5.4M9.6 4.4v12.2M9.6 11.4c1.2-1.8 3-2.5 4.4-1.8 1.5.7 1.7 2.5.8 4.4-.7 1.4-1.2 2.4-.2 3.3.8.7 2 .5 2.7-.2"/>',
    uranus: '<circle cx="12" cy="16.2" r="3"/><path d="M12 5.2v8M7.6 5.8v6.2M16.4 5.8v6.2M7.6 8.9h8.8"/>',
    neptune: '<path d="M12 4.8v14.8M9 16.4h6M7.4 6.6c0 3.6 2 5.5 4.6 5.5s4.6-1.9 4.6-5.5M5.8 8.2l1.6-2 1.6 2M15 8.2l1.6-2 1.6 2"/>',
    pluto: '<circle cx="12" cy="8.2" r="2.7"/><path d="M7.4 9.5a4.6 4.6 0 0 0 9.2 0M12 14.1v5.8M9.3 17.2h5.4"/>',
    nn: '<circle cx="7.6" cy="16.4" r="2.1"/><circle cx="16.4" cy="16.4" r="2.1"/><path d="M8.9 14.7C6.8 10.6 8.4 6.2 12 6.2s5.2 4.4 3.1 8.5"/>',
    sn: '<circle cx="7.6" cy="7.6" r="2.1"/><circle cx="16.4" cy="7.6" r="2.1"/><path d="M8.9 9.3C6.8 13.4 8.4 17.8 12 17.8s5.2-4.4 3.1-8.5"/>',
    aries: '<path d="M12 19V9.5c0-2.8-1.7-4.7-3.7-4.7-1.7 0-2.9 1.2-2.9 2.7M12 9.5c0-2.8 1.7-4.7 3.7-4.7 1.7 0 2.9 1.2 2.9 2.7"/>',
    taurus: '<circle cx="12" cy="14" r="4.5"/><path d="M7.2 5.6a4.8 4.8 0 0 0 9.6 0"/>',
    gemini: '<path d="M6.4 5.8c3.4 1.3 7.8 1.3 11.2 0M6.4 18.2c3.4-1.3 7.8-1.3 11.2 0M9.6 6.8v10.4M14.4 6.8v10.4"/>',
    cancer: '<circle cx="8.2" cy="9.2" r="2.3"/><path d="M8.2 6.9c3.6-.8 7.5.7 9.6 3.5"/><circle cx="15.8" cy="14.8" r="2.3"/><path d="M15.8 17.1c-3.6.8-7.5-.7-9.6-3.5"/>',
    leo: '<circle cx="8.2" cy="14.8" r="2.4"/><path d="M9.8 12.9c-.4-3.7 1.2-7.1 3.7-7.1 2.2 0 3.2 2.2 2.2 5.4l-1.2 3.8c-.6 1.9.4 3.4 2.1 3.1 1-.2 1.6-.9 1.9-1.8"/>',
    virgo: '<path d="M6.2 7.2v9.6M6.2 9.5c1.1-2 2.8-2.3 3.4-.5v7.8M9.6 9.5c1.1-2 2.8-2.3 3.4-.5v7.8M13 9.5c1.1-2 2.8-2.3 3.4-.5 0 4.8-1.6 7.8-4.2 9.6M13 13.8c2.4-2.2 5-1.7 5.2.6.2 2.2-1.8 4.1-4.8 4.8"/>',
    libra: '<path d="M5.4 17.4h13.2M5.4 14.2h3.4a3.7 3.7 0 1 1 6.4 0h3.4"/>',
    scorpio: '<path d="M6 7.4v9.4M6 9.6c1.2-2 2.8-2.3 3.5-.5v7.7M9.5 9.6c1.2-2 2.8-2.3 3.5-.5v6.2c0 1.8 1.2 2.6 2.8 2l2.6-1M16.2 14.7l2.4 1.6-1.5 2.4"/>',
    sagittarius: '<path d="M6.4 17.6L17.6 6.4M11.6 6.4h6v6M8.2 11.4l4.4 4.4"/>',
    capricorn: '<path d="M6.2 7.4l2.4 8.6 2.7-7.8c1-2.5 3.4-2.1 3.4.5v5.6c0 2.5-1.3 4.2-3.4 4.7M14.7 13.6a2.3 2.3 0 1 1 2.3 2.8 2.3 2.3 0 0 1-2.3-2.8Z"/>',
    aquarius: '<path d="M5.4 10.2l2.2-2.2 2.2 2.2 2.2-2.2 2.2 2.2 2.2-2.2 2.2 2.2M5.4 15.6l2.2-2.2 2.2 2.2 2.2-2.2 2.2 2.2 2.2-2.2 2.2 2.2"/>',
    pisces: '<path d="M7.2 5.6c2.7 3.8 2.7 9 0 12.8M16.8 5.6c-2.7 3.8-2.7 9 0 12.8M6.2 12h11.6"/>',
  };

  function renderGlyph(key, fallback) {
    const body = GLYPH_SVG[key];
    if (!body) return `<span class="astro-die-roman">${fallback}</span>`;
    return `<svg class="astro-die-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  const ASTRO_PLANETS = [
    { key: 'sun', sym: '☉', zh: '太阳' }, { key: 'moon', sym: '☽', zh: '月亮' }, { key: 'mercury', sym: '☿', zh: '水星' },
    { key: 'venus', sym: '♀', zh: '金星' }, { key: 'mars', sym: '♂', zh: '火星' }, { key: 'jupiter', sym: '♃', zh: '木星' },
    { key: 'saturn', sym: '♄', zh: '土星' }, { key: 'uranus', sym: '♅', zh: '天王' }, { key: 'neptune', sym: '♆', zh: '海王' },
    { key: 'pluto', sym: '♇', zh: '冥王' }, { key: 'nn', sym: '☊', zh: '北交' }, { key: 'sn', sym: '☋', zh: '南交' },
  ];
  const ASTRO_SIGNS = [
    { key: 'aries', sym: '♈' + VS15, zh: '白羊' }, { key: 'taurus', sym: '♉' + VS15, zh: '金牛' }, { key: 'gemini', sym: '♊' + VS15, zh: '双子' },
    { key: 'cancer', sym: '♋' + VS15, zh: '巨蟹' }, { key: 'leo', sym: '♌' + VS15, zh: '狮子' }, { key: 'virgo', sym: '♍' + VS15, zh: '处女' },
    { key: 'libra', sym: '♎' + VS15, zh: '天秤' }, { key: 'scorpio', sym: '♏' + VS15, zh: '天蝎' }, { key: 'sagittarius', sym: '♐' + VS15, zh: '射手' },
    { key: 'capricorn', sym: '♑' + VS15, zh: '摩羯' }, { key: 'aquarius', sym: '♒' + VS15, zh: '水瓶' }, { key: 'pisces', sym: '♓' + VS15, zh: '双鱼' },
  ];
  const ASTRO_HOUSES = [
    { key: null, sym: 'I', zh: '一宫' }, { key: null, sym: 'II', zh: '二宫' }, { key: null, sym: 'III', zh: '三宫' },
    { key: null, sym: 'IV', zh: '四宫' }, { key: null, sym: 'V', zh: '五宫' }, { key: null, sym: 'VI', zh: '六宫' },
    { key: null, sym: 'VII', zh: '七宫' }, { key: null, sym: 'VIII', zh: '八宫' }, { key: null, sym: 'IX', zh: '九宫' },
    { key: null, sym: 'X', zh: '十宫' }, { key: null, sym: 'XI', zh: '十一宫' }, { key: null, sym: 'XII', zh: '十二宫' },
  ];

  function loadEnabled() {
    const defaults = { candles: true, incense: true };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...defaults, ...parsed };
      }
    } catch {}
    return defaults;
  }

  function saveEnabled(enabled) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled));
    } catch {}
  }

  function createController({ layerEl, stageEl, matEl, smokeCanvas, trayEl, onNotify }) {
    const enabled = loadEnabled();
    const state = {
      rollingDice: false,
      dice: [ASTRO_PLANETS[1], ASTRO_SIGNS[6], ASTRO_HOUSES[8]],
      pendulumAngle: 0,
      pendulumVel: 0,
      pendulumHint: '轻触令灵摆起振',
    };

    const smokeParticles = [];
    const smokeMotes = [];
    const ripples = [];
    let rafId = 0;
    let lastTime = 0;
    let smokeAccum = 0;
    let smokeTime = 0;
    let smokeVisibility = enabled.incense ? 1 : 0;
    let mounted = false;

    const notify = (msg) => {
      if (typeof onNotify === 'function') onNotify(msg);
    };

    function getAudio() {
      return window.TAROT_AUDIO || null;
    }

    function updateCandleWarmth() {
      const lit = Boolean(enabled.candles);
      const warmth = lit ? '1' : '0';
      [stageEl, matEl].forEach((el) => {
        if (!el) return;
        el.style.setProperty('--candle-warmth', warmth);
        el.classList.toggle('candles-left-lit', lit);
        el.classList.toggle('candles-right-lit', lit);
      });
    }

    function spawnCenterRipples() {
      if (!smokeCanvas) return;
      const cw = smokeCanvas.clientWidth;
      const ch = smokeCanvas.clientHeight;
      if (cw < 10 || ch < 10) return;
      const cx = cw * 0.5;
      const cy = ch * 0.5;
      [0, 0.34, 0.68].forEach((delay) => {
        ripples.push({
          x: cx,
          y: cy,
          age: -delay,
          maxAge: 2.9,
          maxR: Math.max(cw, ch) * 0.44,
        });
      });
      ensureAnimLoop();
    }

    function strikeBowl(btnEl) {
      if (btnEl) {
        btnEl.classList.remove('is-striking');
        void btnEl.offsetWidth;
        btnEl.classList.add('is-striking');
        setTimeout(() => btnEl.classList.remove('is-striking'), 1200);
      }
      const audio = getAudio();
      if (audio) audio.playSingingBowl();
      spawnCenterRipples();
      notify('颂钵清音回荡，静心凝神');
    }

    function rollAstroDice(containerEl) {
      if (state.rollingDice) return;
      state.rollingDice = true;
      if (containerEl) containerEl.classList.add('is-rolling');
      const audio = getAudio();
      if (audio) audio.playDiceRoll();

      const syms = containerEl ? containerEl.querySelectorAll('.astro-die-sym') : [];
      const readout = containerEl ? containerEl.querySelector('[data-dice-readout]') : null;

      let ticks = 0;
      const rollTimer = setInterval(() => {
        ticks++;
        const p = ASTRO_PLANETS[Math.floor(Math.random() * ASTRO_PLANETS.length)];
        const s = ASTRO_SIGNS[Math.floor(Math.random() * ASTRO_SIGNS.length)];
        const h = ASTRO_HOUSES[Math.floor(Math.random() * ASTRO_HOUSES.length)];
        if (syms[0]) syms[0].innerHTML = renderGlyph(p.key, p.sym);
        if (syms[1]) syms[1].innerHTML = renderGlyph(s.key, s.sym);
        if (syms[2]) syms[2].innerHTML = renderGlyph(h.key, h.sym);

        if (ticks >= 10) {
          clearInterval(rollTimer);
          state.dice = [p, s, h];
          state.rollingDice = false;
          if (containerEl) containerEl.classList.remove('is-rolling');
          if (readout) readout.textContent = `${p.zh} · ${s.zh} · ${h.zh}`;
          notify(`占星灵骰落定：${p.zh} · ${s.zh} · ${h.zh}`);
        }
      }, 55);
    }

    function nudgePendulum(cardEl) {
      const dir = Math.random() > 0.5 ? 1 : -1;
      state.pendulumVel = dir * (2.9 + Math.random() * 1.1);
      state.pendulumHint = dir > 0 ? '顺势微荡 · 静观其向' : '回旋微荡 · 澄心映照';
      if (cardEl) {
        cardEl.classList.add('is-glowing');
        const sub = cardEl.querySelector('[data-pendulum-readout]');
        if (sub) sub.textContent = state.pendulumHint;
        setTimeout(() => cardEl.classList.remove('is-glowing'), 2400);
      }
      const audio = getAudio();
      if (audio) audio.playCardBrush(0.11, 2100, 0.04);
      ensureAnimLoop();
    }

    /* Render Self-Contained Interactive Instruments inside the Curator's Tray */
    function renderInstrumentsTray(targetEl = trayEl) {
      if (!targetEl) return;
      const [planet, sign, house] = state.dice;
      const dieCard = (item, role, idx) => `
        <span class="tray-die" data-die-idx="${idx}">
          <span class="astro-die-sym">${renderGlyph(item.key, item.sym)}</span>
          <span class="tray-die-role">${role}</span>
        </span>
      `;
      targetEl.innerHTML = `
        <div class="instrument-grid">
          <button type="button" class="instrument-card instrument-bowl" data-instrument="bowl" title="点击敲击颂钵">
            <div class="instrument-visual">
              <div class="instrument-bowl-ring" aria-hidden="true"></div>
              <svg class="w-7 h-7 text-[#e4c688]" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.25">
                <circle cx="18" cy="18" r="13.5" opacity="0.28" stroke-dasharray="2 3"/>
                <path d="M7.5 16.5c0 6.2 4.6 10.5 10.5 10.5s10.5-4.3 10.5-10.5H7.5z"/>
                <ellipse cx="18" cy="16.5" rx="10.5" ry="2.8"/>
                <line x1="25" y1="9" x2="31" y2="15" stroke-linecap="round"/>
                <circle cx="24.2" cy="8.2" r="1.4" fill="currentColor"/>
              </svg>
            </div>
            <div class="instrument-meta">
              <div class="instrument-name">古铜颂钵</div>
              <div class="instrument-sub">轻敲泛音净场</div>
            </div>
          </button>

          <button type="button" class="instrument-card instrument-pendulum" data-instrument="pendulum" title="点击轻触紫晶灵摆">
            <div class="instrument-visual instrument-pendulum-stage">
              <div class="tray-pendulum-arm" id="trayPendulumArm">
                <span class="tray-pendulum-chain" aria-hidden="true"></span>
                <svg class="tray-pendulum-crystal" viewBox="0 0 24 40" fill="none">
                  <path d="M12 2L19 14L12 38L5 14Z" fill="url(#amethystFacet)" stroke="#d6b472" stroke-width="0.9"/>
                  <path d="M12 2V38M5 14H19M8.5 14L12 38L15.5 14" stroke="#f0d9a8" stroke-width="0.55" opacity="0.55"/>
                  <defs>
                    <linearGradient id="amethystFacet" x1="5" y1="4" x2="19" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stop-color="#c395e8"/>
                      <stop offset="48%" stop-color="#6c3c96"/>
                      <stop offset="100%" stop-color="#2b1342"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div class="instrument-meta">
              <div class="instrument-name">紫晶灵摆</div>
              <div class="instrument-sub" data-pendulum-readout>${state.pendulumHint}</div>
            </div>
          </button>
        </div>

        <button type="button" class="instrument-card instrument-dice w-full" data-instrument="dice" title="点击掷出三枚占星灵骰">
          <div class="flex items-center justify-between w-full mb-2">
            <div class="text-left">
              <div class="instrument-name">占星三骰 <span class="font-display text-[8.5px] tracking-[0.2em] text-[#c9a668]/50 ml-1">3×D12</span></div>
              <div class="instrument-sub" data-dice-readout>${planet.zh} · ${sign.zh} · ${house.zh}</div>
            </div>
            <span class="font-serif-cn text-[10px] tracking-[0.16em] text-[#c9a668]/75 border border-[#c9a668]/25 px-2 py-0.5 rounded-[2px]">掷骰</span>
          </div>
          <div class="tray-dice-row">
            ${dieCard(planet, '行星', 0)}
            ${dieCard(sign, '星座', 1)}
            ${dieCard(house, '宫位', 2)}
          </div>
        </button>
      `;

      const bowlBtn = targetEl.querySelector('[data-instrument="bowl"]');
      const pendBtn = targetEl.querySelector('[data-instrument="pendulum"]');
      const diceBtn = targetEl.querySelector('[data-instrument="dice"]');
      if (bowlBtn) bowlBtn.addEventListener('click', () => strikeBowl(bowlBtn));
      if (pendBtn) pendBtn.addEventListener('click', () => nudgePendulum(pendBtn));
      if (diceBtn) diceBtn.addEventListener('click', () => rollAstroDice(diceBtn));
    }

    function resizeCanvas() {
      if (!smokeCanvas) return;
      const cw = smokeCanvas.clientWidth;
      const ch = smokeCanvas.clientHeight;
      if (cw < 10 || ch < 10) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(cw * dpr);
      const h = Math.round(ch * dpr);
      if (smokeCanvas.width !== w || smokeCanvas.height !== h) {
        smokeCanvas.width = w;
        smokeCanvas.height = h;
      }
    }

    function needsTick() {
      const incenseActive = Boolean((enabled.incense || smokeVisibility > 0.01) && mounted);
      const pendulumActive = Math.abs(state.pendulumAngle) > 0.002 || Math.abs(state.pendulumVel) > 0.002;
      return incenseActive || smokeParticles.length > 0 || smokeMotes.length > 0 || ripples.length > 0 || pendulumActive;
    }

    function ensureAnimLoop() {
      if (rafId || !needsTick()) return;
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }

    function drawIncenseRibbons(ctx, w, h, t, vis) {
      if (vis <= 0.01) return;
      const baseX = w * 0.056;
      const baseY = h * 0.99;
      const plumeH = h * 0.78;
      const ribbons = [
        { phase: 0.0, amp: w * 0.028, drift: w * 0.088, speed: 0.76, freq: 2.15, width: 1.0, tint: '238, 226, 208' },
        { phase: 2.2, amp: w * 0.024, drift: w * 0.125, speed: 0.62, freq: 2.65, width: 0.80, tint: '214, 214, 232' },
        { phase: 4.4, amp: w * 0.019, drift: w * 0.055, speed: 0.90, freq: 3.05, width: 0.62, tint: '246, 230, 202' },
      ];

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const rb of ribbons) {
        const steps = 36;
        const pts = [];
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const sway1 = Math.sin(u * Math.PI * rb.freq - t * rb.speed + rb.phase) * rb.amp * (0.22 + u * 1.25);
          const sway2 = Math.cos(u * Math.PI * (rb.freq * 1.65) - t * (rb.speed * 1.3) + rb.phase) * (rb.amp * 0.32) * u;
          pts.push({
            x: baseX + u * rb.drift + sway1 + sway2,
            y: baseY - u * plumeH,
          });
        }

        const traceSmoothPath = () => {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length - 1; i++) {
            const mx = (pts[i].x + pts[i + 1].x) * 0.5;
            const my = (pts[i].y + pts[i + 1].y) * 0.5;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
          }
          const last = pts[pts.length - 1];
          ctx.lineTo(last.x, last.y);
        };

        const makeGrad = (peakAlpha) => {
          const g = ctx.createLinearGradient(0, baseY, 0, baseY - plumeH);
          g.addColorStop(0.00, `rgba(${rb.tint}, 0)`);
          g.addColorStop(0.10, `rgba(${rb.tint}, ${(peakAlpha * 0.85).toFixed(3)})`);
          g.addColorStop(0.38, `rgba(${rb.tint}, ${peakAlpha.toFixed(3)})`);
          g.addColorStop(0.72, `rgba(${rb.tint}, ${(peakAlpha * 0.42).toFixed(3)})`);
          g.addColorStop(1.00, `rgba(${rb.tint}, 0)`);
          return g;
        };

        const s = Math.max(0.56, Math.min(1.0, w / 1280));
        // Pass 1: Wide soft atmospheric mist veil (single smooth path + gaussian blur -> zero segments!)
        ctx.filter = `blur(${(14 * s).toFixed(1)}px)`;
        ctx.strokeStyle = makeGrad(0.24 * vis);
        ctx.lineWidth = 34 * s * rb.width;
        traceSmoothPath();
        ctx.stroke();

        // Pass 2: Silky translucent ribbon curl
        ctx.filter = `blur(${(4.5 * s).toFixed(1)}px)`;
        ctx.strokeStyle = makeGrad(0.28 * vis);
        ctx.lineWidth = 10 * s * rb.width;
        traceSmoothPath();
        ctx.stroke();

        // Pass 3: Fine luminous inner silk filament
        ctx.filter = `blur(${(1.2 * s).toFixed(1)}px)`;
        ctx.strokeStyle = makeGrad(0.32 * vis);
        ctx.lineWidth = 2.2 * s * rb.width;
        traceSmoothPath();
        ctx.stroke();
      }

      // Subtle warm incense ember glow kissing the bottom-left source
      ctx.filter = 'none';
      const glowGrad = ctx.createRadialGradient(baseX, baseY - 12, 2, baseX, baseY - 24, w * 0.09);
      glowGrad.addColorStop(0, `rgba(246, 204, 146, ${(0.20 * vis).toFixed(3)})`);
      glowGrad.addColorStop(0.45, `rgba(224, 186, 152, ${(0.08 * vis).toFixed(3)})`);
      glowGrad.addColorStop(1, 'rgba(200, 175, 160, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(baseX, baseY - 24, w * 0.09, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function tick(now) {
      rafId = 0;
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTime) / 1000));
      lastTime = now;
      smokeTime += dt;

      // Smooth fade-in / fade-out when toggling Palo Santo incense
      const targetVis = enabled.incense ? 1 : 0;
      smokeVisibility += (targetVis - smokeVisibility) * Math.min(1, dt * 3.2);
      if (Math.abs(targetVis - smokeVisibility) < 0.005) smokeVisibility = targetVis;

      // Damped harmonic pendulum swing inside the instrument tray
      const armEl = document.getElementById('trayPendulumArm');
      if (Math.abs(state.pendulumAngle) > 0.001 || Math.abs(state.pendulumVel) > 0.001) {
        const k = 15.5;
        const damping = 0.78;
        const acc = -k * state.pendulumAngle - damping * state.pendulumVel;
        state.pendulumVel += acc * dt;
        state.pendulumAngle += state.pendulumVel * dt;
        const deg = Math.max(-28, Math.min(28, state.pendulumAngle * 20));
        if (armEl) armEl.style.transform = `rotate(${deg.toFixed(2)}deg)`;
      }

      if (smokeCanvas) {
        resizeCanvas();
        const ctx = smokeCanvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = smokeCanvas.width / dpr;
        const h = smokeCanvas.height / dpr;
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        // 1. Continuous silky calligraphic Palo Santo smoke ribbons
        if (w > 100 && smokeVisibility > 0.01) {
          drawIncenseRibbons(ctx, w, h, smokeTime, smokeVisibility);
        }

        // 2. Emit drifting volumetric curl wisps & tiny warm motes along the plume
        if (enabled.incense && mounted && w > 100) {
          smokeAccum += dt;
          if (smokeAccum >= 0.14) {
            smokeAccum = 0;
            const ox = w * 0.055 + (Math.random() - 0.5) * 24;
            const oy = h * 0.94;
            smokeParticles.push({
              x: ox,
              y: oy,
              vx: 14 + Math.random() * 14,
              vy: -56 - Math.random() * 28,
              radius: 20 + Math.random() * 18,
              alpha: 0.14 + Math.random() * 0.07,
              life: 0,
              maxLife: 4.8 + Math.random() * 2.2,
              swayPhase: Math.random() * Math.PI * 2,
              swayAmp: 22 + Math.random() * 18,
            });
            if (Math.random() < 0.45) {
              smokeMotes.push({
                x: w * 0.045 + Math.random() * 44,
                y: h * (0.82 + Math.random() * 0.14),
                vx: 8 + Math.random() * 12,
                vy: -34 - Math.random() * 24,
                r: 0.8 + Math.random() * 1.1,
                alpha: 0.45 + Math.random() * 0.35,
                life: 0,
                maxLife: 2.8 + Math.random() * 2.0,
                phase: Math.random() * Math.PI * 2,
              });
            }
          }
        }

        // Render soft billowing volumetric mist curls
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = smokeParticles.length - 1; i >= 0; i--) {
          const p = smokeParticles[i];
          p.life += dt;
          if (p.life >= p.maxLife) {
            smokeParticles.splice(i, 1);
            continue;
          }
          const t = p.life / p.maxLife;
          p.x += (p.vx * (1 - t * 0.35) + Math.sin(p.life * 1.45 + p.swayPhase) * p.swayAmp) * dt;
          p.y += p.vy * (1 - t * 0.25) * dt;
          const r = p.radius + t * 68;
          const a = p.alpha * Math.pow(Math.sin(t * Math.PI), 1.15) * (1 - t * 0.35) * Math.max(0.12, smokeVisibility);
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          grad.addColorStop(0, `rgba(238, 228, 214, ${a.toFixed(3)})`);
          grad.addColorStop(0.45, `rgba(206, 200, 216, ${(a * 0.46).toFixed(3)})`);
          grad.addColorStop(1, 'rgba(176, 170, 192, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Render ascending warm champagne dust motes caught in the incense air current
        for (let i = smokeMotes.length - 1; i >= 0; i--) {
          const m = smokeMotes[i];
          m.life += dt;
          if (m.life >= m.maxLife) {
            smokeMotes.splice(i, 1);
            continue;
          }
          const t = m.life / m.maxLife;
          m.x += (m.vx + Math.sin(m.life * 2.3 + m.phase) * 14) * dt;
          m.y += m.vy * dt;
          const a = m.alpha * Math.sin(t * Math.PI) * smokeVisibility;
          if (a <= 0.01) continue;
          ctx.fillStyle = `rgba(246, 222, 174, ${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Render ultra-fine champagne-gold singing bowl acoustic rings across the velvet
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rp = ripples[i];
          rp.age += dt;
          if (rp.age >= rp.maxAge) {
            ripples.splice(i, 1);
            continue;
          }
          if (rp.age < 0) continue;
          const t = rp.age / rp.maxAge;
          const eased = 1 - Math.pow(1 - t, 3);
          const radius = 26 + eased * rp.maxR;
          const alpha = (1 - t) * (1 - t) * 0.38;
          ctx.strokeStyle = `rgba(224, 194, 134, ${alpha.toFixed(3)})`;
          ctx.lineWidth = Math.max(0.6, 1.5 * (1 - t));
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      if (needsTick()) {
        rafId = requestAnimationFrame(tick);
      }
    }

    function setPropEnabled(id, val) {
      if (!(id in enabled)) return;
      enabled[id] = Boolean(val);
      saveEnabled(enabled);
      updateCandleWarmth();
      const audio = getAudio();
      if (audio) audio.playCandle(enabled[id]);
      ensureAnimLoop();
    }

    function toggleProp(id) {
      setPropEnabled(id, !enabled[id]);
      return enabled[id];
    }

    function setActive(active) {
      mounted = Boolean(active);
      if (mounted) {
        resizeCanvas();
        ensureAnimLoop();
      } else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    // Keep table completely pure — zero pasted-on 2D objects on .altar-props-layer
    if (layerEl) layerEl.innerHTML = '';
    mounted = true;
    updateCandleWarmth();
    renderInstrumentsTray();
    ensureAnimLoop();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    return {
      catalog: AMBIENCE_CATALOG,
      getEnabled: () => ({ ...enabled }),
      setPropEnabled,
      toggleProp,
      renderInstrumentsTray,
      strikeBowl,
      setActive,
      resizeCanvas,
    };
  }

  return {
    catalog: AMBIENCE_CATALOG,
    createController,
  };
})();
