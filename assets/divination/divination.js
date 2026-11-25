/* Authentic Tarot Divination Ritual Engine (zero interpretation copy — pure ritual simulation) */
window.createDivinationPlatform = function createDivinationPlatform(bridge) {
  const SPREADS = window.TAROT_SPREADS;
  const AUDIO = window.TAROT_AUDIO;
  const PROPS_API = window.TAROT_ALTAR_PROPS;

  const dom = {
    view: document.getElementById('divinationView'),
    stage: document.getElementById('readingTableStage'),
    mat: document.getElementById('divinationMat'),
    board: document.getElementById('divSpreadBoard'),
    deckStage: document.getElementById('ritualDeckStage'),
    deckStack: document.getElementById('ritualDeckStack'),
    shuffleSwarm: document.getElementById('shuffleSwarm'),
    cutPilesZone: document.getElementById('cutPilesZone'),
    statusTitle: document.getElementById('ritualStatusTitle'),
    statusSub: document.getElementById('ritualStatusSub'),
    ritualSpreadEn: document.getElementById('ritualSpreadEn'),
    ritualSpreadName: document.getElementById('ritualSpreadName'),
    ritualQuestionEcho: document.getElementById('ritualQuestionEcho'),
    fanDock: document.getElementById('fanDrawDock'),
    fanViewport: document.getElementById('fanViewport'),
    fanRail: document.getElementById('fanRail'),
    fanGuide: document.getElementById('fanGuidanceText'),
    fanPrevBtn: document.getElementById('fanPrevBtn'),
    fanNextBtn: document.getElementById('fanNextBtn'),
    actionDock: document.getElementById('divActionDock'),
    questionInput: document.getElementById('divQuestionInput'),
    questionEcho: document.getElementById('matQuestionEcho'),
    matSpreadName: document.getElementById('matSpreadName'),
    matSpreadEn: document.getElementById('matSpreadEn'),
    spreadTriggerLabel: document.getElementById('spreadTriggerLabel'),
    deckMetaBadge: document.getElementById('divDeckMetaBadge'),
    stepPills: document.querySelectorAll('.ritual-step-pill'),
    propsLayer: document.getElementById('altarPropsLayer'),
    smokeCanvas: document.getElementById('propSmokeCanvas'),
    spreadModal: document.getElementById('spreadModal'),
    spreadGrid: document.getElementById('spreadModalGrid'),
    closeSpreadModalBtn: document.getElementById('closeSpreadModalBtn'),
    confirmSpreadBtn: document.getElementById('confirmSpreadBtn'),
    openSpreadBtn: document.getElementById('openSpreadModalBtn'),
    propsPopover: document.getElementById('propsPopover'),
    propsToggleList: document.getElementById('propsToggleList'),
    instrumentsTray: document.getElementById('instrumentsTrayBody'),
    propsTriggerBtn: document.getElementById('propsPopoverBtn'),
    tableStyleBtns: document.querySelectorAll('[data-table-style]'),
    scopeBtns: document.querySelectorAll('[data-div-scope]'),
    revToggleBtn: document.getElementById('divReversedToggleBtn'),
  };

  const TABLE_STYLE_KEY = 'tarot_table_style_v1';
  let tableStyle = 'wood_table';
  try {
    const savedStyle = localStorage.getItem(TABLE_STYLE_KEY);
    if (savedStyle === 'velvet_cloth' || savedStyle === 'wood_table') tableStyle = savedStyle;
  } catch {}

  const state = {
    spreadId: 'time_stream',
    pendingSpreadId: 'time_stream',
    deckScope: 'all', // 'all' | 'major' | 'minor'
    allowReversed: true,
    stage: 'ritual_deck', // 'ritual_deck' | 'fan_draw' | 'reveal'
    busy: false,
    cutting: false,
    shuffleCount: 0,
    cutCount: 0,
    deckOrder: [], // [{ num, isReversed }]
    cutPiles: [],
    cutPickOrder: [],
    drawnFanIndices: new Set(),
    placements: [], // [{ slotIndex, num, isReversed, revealed }]
    revealTimers: [],
    boardZoom: 1,
    boardPanX: 0,
    boardPanY: 0,
    showAllCaptions: false,
  };

  let draggingBoard = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOriginPanX = 0;
  let dragOriginPanY = 0;
  let suppressNextCardClick = false;

  let propsController = null;
  let resizeObserver = null;

  function getSpread() {
    return SPREADS.getById(state.spreadId);
  }

  function getFilteredPool() {
    const deck = bridge.getDeck();
    const nums = Object.keys(deck).map(Number).filter(n => !Number.isNaN(n)).sort((a, b) => a - b);
    if (state.deckScope === 'major') return nums.filter(n => n < 22);
    if (state.deckScope === 'minor') return nums.filter(n => n >= 22);
    return nums;
  }

  function fisherYates(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function buildFreshDeckOrder() {
    const pool = getFilteredPool();
    const items = pool.map(num => ({
      num,
      isReversed: state.allowReversed ? Math.random() < 0.36 : false,
    }));
    state.deckOrder = fisherYates(items);
  }

  function shuffleDeckData(randomizeOrientation = true) {
    state.deckOrder = fisherYates(state.deckOrder).map(item => ({
      num: item.num,
      isReversed: state.allowReversed
        ? (randomizeOrientation ? Math.random() < 0.36 : item.isReversed)
        : false,
    }));
  }

  function clearRevealTimers() {
    state.revealTimers.forEach(id => clearTimeout(id));
    state.revealTimers = [];
  }

  function notify(msg) {
    if (bridge && typeof bridge.showToast === 'function') bridge.showToast(msg);
  }

  /* --------------------------------------------------------------------------
     Dynamic Overlap-Free Geometry Solver & Velvet Canvas Pan/Zoom Engine
     -------------------------------------------------------------------------- */
  function clampBoardPan() {
    if (!dom.mat || state.boardZoom <= 1.01) {
      state.boardPanX = 0;
      state.boardPanY = 0;
      return;
    }
    const maxX = dom.mat.clientWidth * (state.boardZoom - 1) * 0.56;
    const maxY = dom.mat.clientHeight * (state.boardZoom - 1) * 0.56;
    state.boardPanX = Math.max(-maxX, Math.min(maxX, state.boardPanX));
    state.boardPanY = Math.max(-maxY, Math.min(maxY, state.boardPanY));
  }

  function applyBoardTransform(animate = false) {
    if (!dom.board) return;
    clampBoardPan();
    dom.board.classList.toggle('is-pan-animating', animate);
    dom.board.classList.toggle('is-zoomed-in', state.boardZoom > 1.02);
    dom.board.style.setProperty('--board-zoom', state.boardZoom.toFixed(3));
    dom.board.style.setProperty('--board-pan-x', `${state.boardPanX.toFixed(1)}px`);
    dom.board.style.setProperty('--board-pan-y', `${state.boardPanY.toFixed(1)}px`);
    const zoomLabel = dom.actionDock ? dom.actionDock.querySelector('#dockZoomResetBtn') : null;
    if (zoomLabel) {
      zoomLabel.textContent = `${Math.round(state.boardZoom * 100)}%`;
      zoomLabel.classList.toggle('is-active-zoom', state.boardZoom > 1.02);
    }
  }

  function setBoardZoom(nextZoom, pivotClientX = null, pivotClientY = null, animate = false) {
    const clamped = Math.max(1, Math.min(2.4, nextZoom));
    if (clamped <= 1.01) {
      state.boardZoom = 1;
      state.boardPanX = 0;
      state.boardPanY = 0;
      applyBoardTransform(animate);
      return;
    }
    if (pivotClientX !== null && pivotClientY !== null && dom.mat) {
      const rect = dom.mat.getBoundingClientRect();
      const cx = pivotClientX - (rect.left + rect.width * 0.5);
      const cy = pivotClientY - (rect.top + rect.height * 0.5);
      const ratio = clamped / state.boardZoom;
      state.boardPanX = cx - (cx - state.boardPanX) * ratio;
      state.boardPanY = cy - (cy - state.boardPanY) * ratio;
    }
    state.boardZoom = clamped;
    applyBoardTransform(animate);
  }

  function resetBoardViewport(animate = true) {
    state.boardZoom = 1;
    state.boardPanX = 0;
    state.boardPanY = 0;
    applyBoardTransform(animate);
  }

  function computeSlotSize(spread) {
    if (!dom.board) return { w: 108, h: 160 };
    const bw = dom.board.clientWidth || 960;
    const bh = dom.board.clientHeight || 480;
    const slots = spread.slots;
    const isCompact = spread.count >= 5;

    let minDy = 1;
    let minDx = 1;
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i];
        const b = slots[j];
        if (a.isCrossing || b.isCrossing) continue;
        const dx = Math.abs(a.x - b.x) / 100;
        const dy = Math.abs(a.y - b.y) / 100;
        if (dx < 0.12 && dy > 0.01) minDy = Math.min(minDy, dy);
        if (dy < 0.12 && dx > 0.01) minDx = Math.min(minDx, dx);
      }
    }

    const compactClean = isCompact && !state.showAllCaptions;
    const rowGutter = compactClean ? 12 : 34;
    const colGutter = isCompact ? 14 : 24;
    const edgePad = compactClean ? 8 : 22;
    const desiredH = Math.min(316, Math.max(96, bh * (isCompact ? 0.42 : 0.48) * (spread.cardScale || 1)));
    const maxHByRows = minDy < 1 ? Math.max(84, minDy * bh - rowGutter) : bh * 0.74;
    const maxWByCols = minDx < 1 ? Math.max(60, minDx * bw - colGutter) : bw * 0.34;

    // Respect top/bottom margins cleanly
    let minEdgeY = 0.5;
    slots.forEach(s => {
      minEdgeY = Math.min(minEdgeY, s.y / 100, (100 - s.y) / 100);
    });
    const maxHByEdge = Math.max(84, (minEdgeY * bh - edgePad) * 1.94);

    // Extra horizontal clearance if spread includes a 90deg crossing card (e.g. Celtic Cross)
    const hasCrossing = slots.some(s => s.isCrossing);
    const maxHByCrossing = hasCrossing && minDx < 1 ? Math.max(96, (minDx * bw - 14) * 1.18) : 9999;

    const h = Math.floor(Math.min(desiredH, maxHByRows, maxHByEdge, maxWByCols * 1.48, maxHByCrossing));
    const w = Math.floor(h / 1.48);
    return { w: Math.max(60, w), h: Math.max(88, h) };
  }

  function applyBoardSizing() {
    if (!dom.board) return;
    const spread = getSpread();
    const { w, h } = computeSlotSize(spread);
    dom.board.style.setProperty('--slot-w', `${w}px`);
    dom.board.style.setProperty('--slot-h', `${h}px`);
    applyBoardTransform(false);
  }

  /* --------------------------------------------------------------------------
     Header, Dynamic Camera Zoom & Meta UI Updates
     -------------------------------------------------------------------------- */
  const ROMAN_SLOTS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  function updateHeaderMeta() {
    const spread = getSpread();
    const isComplex = spread.count >= 5;
    const isZoomedVelvet = isComplex && state.stage !== 'ritual_deck';

    if (dom.spreadTriggerLabel) dom.spreadTriggerLabel.textContent = spread.name;
    if (dom.ritualSpreadEn) dom.ritualSpreadEn.textContent = spread.en;
    if (dom.ritualSpreadName) dom.ritualSpreadName.textContent = spread.name;
    if (dom.ritualQuestionEcho) {
      const q = dom.questionInput ? dom.questionInput.value.trim() : '';
      dom.ritualQuestionEcho.textContent = q ? `「 ${q} 」` : '';
      dom.ritualQuestionEcho.classList.toggle('hidden', !q);
    }

    [dom.mat, dom.stage].forEach((el) => {
      if (!el) return;
      el.classList.remove('stage-ritual_deck', 'stage-fan_draw', 'stage-reveal');
      el.classList.add(`stage-${state.stage}`);
      el.classList.toggle('is-zoomed-velvet', isZoomedVelvet);
    });

    if (dom.board) {
      dom.board.classList.toggle('is-compact-spread', isComplex);
      dom.board.classList.toggle('show-all-captions', state.showAllCaptions);
    }
  }

  function updateDeckStatusText() {
    if (!dom.statusTitle) return;
    if (state.cutting) {
      dom.statusTitle.textContent = `请择第 ${ROMAN_SLOTS[state.cutPickOrder.length] || (state.cutPickOrder.length + 1)} 叠`;
      return;
    }
    const parts = [];
    if (state.shuffleCount > 0) parts.push(`已洗 ${state.shuffleCount} 次`);
    if (state.cutCount > 0) parts.push('已切牌');
    dom.statusTitle.textContent = parts.length ? parts.join(' · ') : '轻触牌背启洗';
  }

  /* --------------------------------------------------------------------------
     Render Spread Board & Placed Cards (Grounded Velvet + Live 3D Hover FX)
     -------------------------------------------------------------------------- */
  function buildFrontArtHtml(card, isReversed) {
    const maskStyle = card.silhouette
      ? `-webkit-mask-image:url('${card.silhouette}');mask-image:url('${card.silhouette}');`
      : '';
    const subjScale = (card.suit && !card.court) ? 0.96 : 0.82;
    const topAnchored = card.num === 12 ? 'is-top-anchored' : '';
    return `
      <div class="table-card-art-orient ${isReversed ? 'is-reversed' : ''}">
        <div class="table-card-mask-box" style="${maskStyle}">
          ${card.bg ? `<img class="table-card-layer table-card-layer-bg" src="${card.bg}" alt="" draggable="false">` : ''}
          ${card.subject ? `<img class="table-card-layer table-card-layer-subj ${topAnchored}" style="--subj-scale:${subjScale}" src="${card.subject}" alt="" draggable="false">` : ''}
          ${card.frame ? `<img class="table-card-layer table-card-layer-frame" src="${card.frame}" alt="" draggable="false">` : ''}
          <div class="table-card-sheen" aria-hidden="true"></div>
        </div>
      </div>
    `;
  }

  function renderSpreadBoard(newlyDealtSlotIndex = -1) {
    if (!dom.board) return;
    const spread = getSpread();
    const deck = bridge.getDeck();
    const nextSlotIdx = state.stage === 'fan_draw' ? state.placements.length : -1;

    dom.board.innerHTML = spread.slots.map((slot, idx) => {
      const placed = state.placements.find(p => p.slotIndex === idx);
      const isActiveTarget = idx === nextSlotIdx;
      const card = placed ? deck[placed.num] : null;
      const revealed = Boolean(placed && placed.revealed);
      const roman = ROMAN_SLOTS[slot.order - 1] || String(slot.order);

      let cardHtml = '';
      if (placed && card) {
        const dealingClass = idx === newlyDealtSlotIndex ? 'is-dealing' : '';
        cardHtml = `
          <div class="table-card-scene ${revealed ? 'is-revealed' : ''} ${dealingClass}" data-slot-idx="${idx}">
            <div class="table-card-tilt">
              <div class="table-card-body">
                <div class="table-card-face table-card-back">
                  <img class="table-card-back-img" src="assets/card-back.webp" alt="Tarot Back" draggable="false">
                </div>
                <div class="table-card-face table-card-front">
                  ${buildFrontArtHtml(card, placed.isReversed)}
                </div>
              </div>
            </div>
          </div>
        `;
      }

      const cardDisplayName = card ? (card.cn || card.title || `#${placed.num}`) : '';
      const captionHtml = placed && card && revealed
        ? `
          <div class="slot-caption">
            <span class="slot-cap-pos">${slot.label}</span>
            <span class="slot-cap-card">· ${cardDisplayName}</span>
            <span class="slot-orient-pill ${placed.isReversed ? 'reversed' : 'upright'}">${placed.isReversed ? '逆' : '正'}</span>
          </div>
        `
        : (placed
          ? `
            <div class="slot-caption is-facedown-cap">
              <span class="slot-cap-pos">${slot.label}</span>
            </div>
          `
          : '');

      const cornerSealHtml = placed && spread.count >= 5
        ? `<span class="slot-corner-seal" aria-hidden="true">${roman}</span>`
        : '';

      return `
        <div class="spread-slot ${placed ? 'has-card' : ''} ${slot.isCrossing ? 'is-crossing' : ''} ${isActiveTarget ? 'is-active-target' : ''}"
          style="left:${slot.x}%; top:${slot.y}%; --slot-rot:${slot.rot || 0}deg;">
          <div class="slot-placeholder">
            <span class="slot-corner tl" aria-hidden="true"></span>
            <span class="slot-corner tr" aria-hidden="true"></span>
            <span class="slot-corner bl" aria-hidden="true"></span>
            <span class="slot-corner br" aria-hidden="true"></span>
            <span class="slot-order-badge">${roman}</span>
            <span class="slot-order-rule" aria-hidden="true"></span>
            <span class="slot-placeholder-label">${slot.label}</span>
          </div>
          ${cardHtml}
          ${cornerSealHtml}
          ${captionHtml}
        </div>
      `;
    }).join('');

    applyBoardSizing();

    // Wire click & live 3D showcase-style pointer tilt/holographic sheen + complex spread hover spotlight
    dom.board.querySelectorAll('.table-card-scene').forEach((sceneEl) => {
      const slotEl = sceneEl.closest('.spread-slot');

      sceneEl.addEventListener('pointerenter', () => {
        if (!sceneEl.classList.contains('is-revealed')) return;
        if (slotEl) slotEl.classList.add('is-spotlight');
        if (dom.board && spread.count >= 5) dom.board.classList.add('has-hover-focus');
      });

      sceneEl.addEventListener('pointermove', (e) => {
        if (!sceneEl.classList.contains('is-revealed') || draggingBoard) return;
        const rect = sceneEl.getBoundingClientRect();
        if (rect.width < 10 || rect.height < 10) return;
        const nx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
        const ny = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));
        sceneEl.classList.add('is-hovering');
        sceneEl.style.setProperty('--tilt-rx', `${(-ny * 14).toFixed(2)}deg`);
        sceneEl.style.setProperty('--tilt-ry', `${(nx * 16).toFixed(2)}deg`);
        sceneEl.style.setProperty('--mx', nx.toFixed(3));
        sceneEl.style.setProperty('--my', ny.toFixed(3));
        sceneEl.style.setProperty('--hx', `${(50 + nx * 42).toFixed(1)}%`);
        sceneEl.style.setProperty('--hy', `${(50 + ny * 42).toFixed(1)}%`);
        sceneEl.style.setProperty('--sheen-pos', `${(50 + nx * 46 + ny * 28).toFixed(1)}%`);
      });

      sceneEl.addEventListener('pointerleave', () => {
        sceneEl.classList.remove('is-hovering');
        if (slotEl) slotEl.classList.remove('is-spotlight');
        if (dom.board) dom.board.classList.remove('has-hover-focus');
        sceneEl.style.setProperty('--tilt-rx', '0deg');
        sceneEl.style.setProperty('--tilt-ry', '0deg');
        sceneEl.style.setProperty('--mx', '0');
        sceneEl.style.setProperty('--my', '0');
        sceneEl.style.setProperty('--hx', '50%');
        sceneEl.style.setProperty('--hy', '50%');
        sceneEl.style.setProperty('--sheen-pos', '50%');
      });

      sceneEl.addEventListener('click', () => {
        if (suppressNextCardClick) {
          suppressNextCardClick = false;
          return;
        }
        const slotIdx = Number(sceneEl.getAttribute('data-slot-idx'));
        const placed = state.placements.find(p => p.slotIndex === slotIdx);
        const slot = spread.slots[slotIdx];
        if (!placed) return;
        if (!placed.revealed) {
          if (state.stage === 'reveal') {
            revealSingleCard(slotIdx);
          } else {
            notify('请先抽完本阵余牌');
          }
        } else {
          bridge.inspectCardIn3D({
            num: placed.num,
            slotOrder: slot ? slot.order : slotIdx + 1,
            slotLabel: slot ? slot.label : '',
            isReversed: placed.isReversed,
          });
        }
      });
    });
  }

  function revealSingleCard(slotIdx) {
    const placed = state.placements.find(p => p.slotIndex === slotIdx);
    if (!placed || placed.revealed) return;
    placed.revealed = true;

    const sceneEl = dom.board.querySelector(`.table-card-scene[data-slot-idx="${slotIdx}"]`);
    if (sceneEl) {
      sceneEl.classList.add('is-revealed');
      const slotEl = sceneEl.closest('.spread-slot');
      const capEl = slotEl ? slotEl.querySelector('.slot-caption') : null;
      const spread = getSpread();
      const slot = spread.slots[slotIdx];
      const card = bridge.getDeck()[placed.num];
      if (capEl && slot && card) {
        const cardDisplayName = card.cn || card.title || `#${placed.num}`;
        capEl.classList.remove('is-facedown-cap');
        capEl.innerHTML = `
          <span class="slot-cap-pos">${slot.label}</span>
          <span class="slot-cap-card">· ${cardDisplayName}</span>
          <span class="slot-orient-pill ${placed.isReversed ? 'reversed' : 'upright'}">${placed.isReversed ? '逆' : '正'}</span>
        `;
      }
    }

    if (AUDIO) AUDIO.playCardReveal();
    if (bridge.spawnSparks) bridge.spawnSparks();
    if (bridge.pulseSanctuary) bridge.pulseSanctuary(1);
    renderActionDock();
  }

  function revealRemainingSequentially(intervalMs = 420) {
    clearRevealTimers();
    const unrevealed = state.placements
      .filter(p => !p.revealed)
      .sort((a, b) => a.slotIndex - b.slotIndex);
    if (unrevealed.length === 0) return;

    unrevealed.forEach((p, idx) => {
      const tid = setTimeout(() => {
        revealSingleCard(p.slotIndex);
      }, idx * intervalMs);
      state.revealTimers.push(tid);
    });
  }

  /* --------------------------------------------------------------------------
     Stage 2 Animations: Wash Shuffle / Riffle Shuffle / 3-Pile Cut
     -------------------------------------------------------------------------- */
  function createSwarmCards(count) {
    if (!dom.shuffleSwarm) return [];
    dom.shuffleSwarm.innerHTML = '';
    const cards = [];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'swarm-card';
      el.style.zIndex = String(i + 1);
      el.style.transform = `translate3d(0px, ${-i * 0.45}px, 0) rotate(0deg)`;
      dom.shuffleSwarm.appendChild(el);
      cards.push(el);
    }
    return cards;
  }

  function doWashShuffle() {
    if (state.busy || state.stage !== 'ritual_deck') return;
    if (state.cutting) exitCutMode(false);
    state.busy = true;
    renderActionDock();
    if (dom.deckStack) dom.deckStack.classList.add('hidden-stack');
    if (AUDIO) AUDIO.playWashShuffle();

    const cards = createSwarmCards(22);
    // Phase 1: Spread smoothly across velvet cloth
    requestAnimationFrame(() => {
      cards.forEach((el, i) => {
        const angle = (i / cards.length) * Math.PI * 2;
        const rx = 110 + (i % 3) * 44;
        const ry = 42 + (i % 4) * 16;
        const x = Math.cos(angle) * rx;
        const y = Math.sin(angle) * ry;
        const rot = (Math.random() - 0.5) * 160;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
      });
    });

    // Phase 2: Clockwise vortex swirl
    setTimeout(() => {
      cards.forEach((el, i) => {
        const angle = (i / cards.length) * Math.PI * 2 + 2.35;
        const rx = 95 + ((i + 1) % 3) * 40;
        const ry = 36 + ((i + 2) % 3) * 18;
        const x = Math.cos(angle) * rx;
        const y = Math.sin(angle) * ry;
        const rot = 180 + (Math.random() - 0.5) * 140;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
      });
    }, 430);

    // Phase 3: Gather cleanly back into centered deck stack
    setTimeout(() => {
      shuffleDeckData(true);
      state.shuffleCount++;
      cards.forEach((el, i) => {
        el.style.transform = `translate3d(0px, ${-i * 0.4}px, 0) rotate(0deg)`;
      });
    }, 880);

    setTimeout(() => {
      if (dom.shuffleSwarm) dom.shuffleSwarm.innerHTML = '';
      if (dom.deckStack) dom.deckStack.classList.remove('hidden-stack');
      state.busy = false;
      updateDeckStatusText();
      renderActionDock();
    }, 1360);
  }

  function doRiffleShuffle() {
    if (state.busy || state.stage !== 'ritual_deck') return;
    if (state.cutting) exitCutMode(false);
    state.busy = true;
    renderActionDock();
    if (dom.deckStack) dom.deckStack.classList.add('hidden-stack');
    if (AUDIO) AUDIO.playRiffleShuffle();

    const cards = createSwarmCards(18);
    // Split into left & right halves
    requestAnimationFrame(() => {
      cards.forEach((el, i) => {
        const isLeft = i < 9;
        const idx = isLeft ? i : i - 9;
        const x = isLeft ? -118 : 118;
        const y = -idx * 1.4;
        const rot = isLeft ? -7 : 7;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg)`;
      });
    });

    // Interleave alternatingly from bottom to top
    setTimeout(() => {
      for (let i = 0; i < 9; i++) {
        const leftCard = cards[i];
        const rightCard = cards[9 + i];
        setTimeout(() => {
          leftCard.style.zIndex = String(i * 2 + 1);
          leftCard.style.transform = `translate3d(-10px, ${-i * 1.1}px, 0) rotate(-1.5deg)`;
        }, i * 38);
        setTimeout(() => {
          rightCard.style.zIndex = String(i * 2 + 2);
          rightCard.style.transform = `translate3d(10px, ${-(i + 0.5) * 1.1}px, 0) rotate(1.5deg)`;
        }, i * 38 + 20);
      }
    }, 340);

    // Square up neatly
    setTimeout(() => {
      shuffleDeckData(false);
      state.shuffleCount++;
      cards.forEach((el, i) => {
        el.style.transform = `translate3d(0px, ${-i * 0.45}px, 0) rotate(0deg)`;
      });
    }, 820);

    setTimeout(() => {
      if (dom.shuffleSwarm) dom.shuffleSwarm.innerHTML = '';
      if (dom.deckStack) dom.deckStack.classList.remove('hidden-stack');
      state.busy = false;
      updateDeckStatusText();
      renderActionDock();
    }, 1180);
  }

  function startCutMode() {
    if (state.busy || state.stage !== 'ritual_deck') return;
    if (state.cutting) {
      exitCutMode(false);
      return;
    }
    const len = state.deckOrder.length;
    const cut1 = Math.max(3, Math.floor(len * (0.26 + Math.random() * 0.14)));
    const cut2 = Math.max(cut1 + 3, Math.floor(len * (0.62 + Math.random() * 0.14)));

    state.cutPiles = [
      { id: 0, label: '左叠', cards: state.deckOrder.slice(0, cut1) },
      { id: 1, label: '中叠', cards: state.deckOrder.slice(cut1, cut2) },
      { id: 2, label: '右叠', cards: state.deckOrder.slice(cut2) },
    ];
    state.cutPickOrder = [];
    state.cutting = true;

    if (AUDIO) AUDIO.playDeckCut();
    if (dom.deckStack) dom.deckStack.classList.add('hidden-stack');
    if (dom.cutPilesZone) {
      dom.cutPilesZone.classList.remove('hidden');
      renderCutPiles();
    }
    updateDeckStatusText();
    renderActionDock();
  }

  function renderCutPiles() {
    if (!dom.cutPilesZone) return;
    dom.cutPilesZone.innerHTML = state.cutPiles.map((pile, idx) => {
      const pickedIdx = state.cutPickOrder.indexOf(idx);
      const isPicked = pickedIdx !== -1;
      return `
        <button type="button"
          class="cut-pile-btn ${isPicked ? 'is-picked' : ''}"
          data-cut-idx="${idx}"
          style="animation-delay:${idx * 70}ms">
          <div class="deck-slice" style="transform:translate(4px, 5px)"></div>
          <div class="deck-slice" style="transform:translate(2px, 2.5px)"></div>
          <div class="deck-slice deck-slice-top">
            <img src="assets/card-back.webp" alt="${pile.label}" draggable="false">
          </div>
          ${isPicked ? `<span class="cut-pile-badge">${ROMAN_SLOTS[pickedIdx] || (pickedIdx + 1)}</span>` : ''}
          <span class="cut-pile-label">${pile.label}</span>
        </button>
      `;
    }).join('');

    dom.cutPilesZone.querySelectorAll('.cut-pile-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-cut-idx'));
        pickCutPile(idx);
      });
    });
  }

  function pickCutPile(idx) {
    if (!state.cutting || state.cutPickOrder.includes(idx)) return;
    state.cutPickOrder.push(idx);
    if (AUDIO) AUDIO.playDeckCut();
    renderCutPiles();
    updateDeckStatusText();

    if (state.cutPickOrder.length === 3) {
      state.busy = true;
      setTimeout(() => {
        const merged = [];
        state.cutPickOrder.forEach(pIdx => {
          merged.push(...state.cutPiles[pIdx].cards);
        });
        state.deckOrder = merged;
        state.cutCount++;
        state.busy = false;
        exitCutMode(true);
        notify('三叠切牌归拢完成');
      }, 420);
    }
  }

  function autoFinishCut() {
    if (!state.cutting) return;
    const remaining = fisherYates([0, 1, 2].filter(i => !state.cutPickOrder.includes(i)));
    remaining.forEach((idx, step) => {
      setTimeout(() => pickCutPile(idx), step * 150);
    });
  }

  function exitCutMode(completed) {
    state.cutting = false;
    state.cutPickOrder = [];
    if (dom.cutPilesZone) {
      dom.cutPilesZone.classList.add('hidden');
      dom.cutPilesZone.innerHTML = '';
    }
    if (dom.deckStack) dom.deckStack.classList.remove('hidden-stack');
    updateDeckStatusText();
    renderActionDock();
    if (completed && bridge.pulseSanctuary) bridge.pulseSanctuary(1);
  }

  /* --------------------------------------------------------------------------
     Stage 3: Curved Arc Fan Spread & Guided Sequential Drawing
     -------------------------------------------------------------------------- */
  function enterFanDrawStage() {
    if (state.busy) return;
    if (state.cutting) exitCutMode(false);
    if (state.shuffleCount === 0) {
      shuffleDeckData(true);
    }

    state.stage = 'fan_draw';
    state.drawnFanIndices = new Set();
    state.placements = [];

    if (dom.deckStage) dom.deckStage.classList.add('hidden');
    if (dom.fanDock) dom.fanDock.classList.remove('hidden');

    if (AUDIO) AUDIO.playFanSpread();
    updateHeaderMeta();
    renderSpreadBoard();
    renderFanCards();
    renderActionDock();
    requestAnimationFrame(() => {
      applyBoardSizing();
      if (dom.fanViewport) {
        dom.fanViewport.scrollLeft = Math.max(0, (dom.fanViewport.scrollWidth - dom.fanViewport.clientWidth) / 2);
      }
    });
  }

  function updateFanGuidance() {
    if (!dom.fanGuide) return;
    const spread = getSpread();
    const drawn = state.placements.length;
    if (drawn >= spread.slots.length) {
      dom.fanGuide.textContent = '牌位已成 · 静候启封';
      return;
    }
    const nextSlot = spread.slots[drawn];
    const roman = ROMAN_SLOTS[nextSlot.order - 1] || String(nextSlot.order);
    dom.fanGuide.textContent = `${roman} / ${ROMAN_SLOTS[spread.count - 1] || spread.count}  ·  择牌「${nextSlot.label}」`;
  }

  function renderFanCards() {
    if (!dom.fanRail) return;
    const count = state.deckOrder.length;
    const cardW = 70;
    const step = count <= 24 ? 30 : (count <= 56 ? 19.5 : 15.5);
    const totalW = cardW + Math.max(0, count - 1) * step;
    dom.fanRail.style.width = `${totalW}px`;

    const mid = (count - 1) / 2 || 1;
    dom.fanRail.innerHTML = state.deckOrder.map((_, idx) => {
      const norm = count > 1 ? (idx - mid) / mid : 0; // -1 .. +1
      const rot = norm * 11.5;
      const archLift = (1 - norm * norm) * 16;
      const left = idx * step;
      const drawn = state.drawnFanIndices.has(idx);
      return `
        <button type="button"
          class="fan-card-btn ${drawn ? 'is-drawn' : ''}"
          data-fan-idx="${idx}"
          style="left:${left}px; z-index:${idx + 1}; transform:translateY(${(-archLift).toFixed(1)}px) rotate(${rot.toFixed(2)}deg);"
          aria-label="抽取第 ${idx + 1} 号牌">
        </button>
      `;
    }).join('');

    dom.fanRail.querySelectorAll('.fan-card-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const fanIdx = Number(btn.getAttribute('data-fan-idx'));
        drawFromFan(fanIdx);
      });
    });

    updateFanGuidance();
  }

  function drawFromFan(fanIdx) {
    if (state.stage !== 'fan_draw' || state.drawnFanIndices.has(fanIdx)) return;
    const spread = getSpread();
    const slotIndex = state.placements.length;
    if (slotIndex >= spread.slots.length) return;

    const picked = state.deckOrder[fanIdx];
    if (!picked) return;

    state.drawnFanIndices.add(fanIdx);
    const fanBtn = dom.fanRail ? dom.fanRail.querySelector(`.fan-card-btn[data-fan-idx="${fanIdx}"]`) : null;
    if (fanBtn) fanBtn.classList.add('is-drawn');

    state.placements.push({
      slotIndex,
      num: picked.num,
      isReversed: picked.isReversed,
      revealed: false,
    });

    if (AUDIO) AUDIO.playCardBrush(0.15, 1580, 0.075);
    if (bridge.spawnSparks) bridge.spawnSparks();

    renderSpreadBoard(slotIndex);
    updateFanGuidance();
    renderActionDock();

    if (state.placements.length >= spread.slots.length) {
      state.busy = true;
      setTimeout(() => {
        state.busy = false;
        enterRevealStage();
      }, 520);
    }
  }

  function autoDrawRemaining() {
    if (state.stage !== 'fan_draw' || state.busy) return;
    const spread = getSpread();
    const need = spread.slots.length - state.placements.length;
    if (need <= 0) return;

    const avail = [];
    for (let i = 0; i < state.deckOrder.length; i++) {
      if (!state.drawnFanIndices.has(i)) avail.push(i);
    }
    const stepMs = need >= 6 ? 135 : 200;
    const chosen = fisherYates(avail).slice(0, need);
    chosen.forEach((fanIdx, step) => {
      setTimeout(() => {
        if (state.stage === 'fan_draw') drawFromFan(fanIdx);
      }, step * stepMs);
    });
  }

  /* --------------------------------------------------------------------------
     Stage 4: Spread Reveal & 3D Inspection Bridge
     -------------------------------------------------------------------------- */
  function enterRevealStage() {
    state.stage = 'reveal';
    if (dom.fanDock) dom.fanDock.classList.add('hidden');
    updateHeaderMeta();
    renderSpreadBoard();
    renderActionDock();
    requestAnimationFrame(() => applyBoardSizing());
    setTimeout(() => applyBoardSizing(), 560);
  }

  /* --------------------------------------------------------------------------
     Reset / Gather Cards Back to Ritual Deck
     -------------------------------------------------------------------------- */
  function resetToDeckStage(newSpreadId = null) {
    clearRevealTimers();
    state.busy = false;
    state.cutting = false;
    if (newSpreadId) {
      state.spreadId = newSpreadId;
      state.pendingSpreadId = newSpreadId;
      state.showAllCaptions = false;
    }
    state.stage = 'ritual_deck';
    state.shuffleCount = 0;
    state.cutCount = 0;
    state.placements = [];
    state.drawnFanIndices = new Set();
    resetBoardViewport(false);
    buildFreshDeckOrder();

    if (dom.cutPilesZone) {
      dom.cutPilesZone.classList.add('hidden');
      dom.cutPilesZone.innerHTML = '';
    }
    if (dom.shuffleSwarm) dom.shuffleSwarm.innerHTML = '';
    if (dom.deckStack) dom.deckStack.classList.remove('hidden-stack');
    if (dom.deckStage) dom.deckStage.classList.remove('hidden');
    if (dom.fanDock) dom.fanDock.classList.add('hidden');

    updateHeaderMeta();
    updateDeckStatusText();
    renderSpreadBoard();
    renderActionDock();
  }

  /* --------------------------------------------------------------------------
     Bottom Ceremonial Action Dock (Minimal Vintage Engraved Controls)
     -------------------------------------------------------------------------- */
  function renderActionDock() {
    if (!dom.actionDock) return;
    const spread = getSpread();

    if (state.stage === 'ritual_deck') {
      const disabled = state.busy ? 'disabled' : '';
      const cutControls = state.cutting
        ? `
          <button type="button" class="div-pill-btn" id="dockAutoCutBtn">随缘归拢</button>
          <button type="button" class="div-pill-btn" id="dockCancelCutBtn">取消</button>
        `
        : `
          <button type="button" class="div-pill-btn" id="dockWashBtn" ${disabled}>揉洗</button>
          <button type="button" class="div-pill-btn" id="dockRiffleBtn" ${disabled}>交错</button>
          <button type="button" class="div-pill-btn" id="dockCutBtn" ${disabled}>切牌</button>
        `;

      dom.actionDock.innerHTML = `
        <div class="div-dock-group">${cutControls}</div>
        <span class="dock-sep" aria-hidden="true"></span>
        <div class="div-dock-group">
          <button type="button" class="div-pill-btn is-gold" id="dockFanBtn" ${disabled}>
            <span class="btn-diamond" aria-hidden="true"></span>
            <span>展牌择阵</span>
          </button>
        </div>
      `;

      const washBtn = dom.actionDock.querySelector('#dockWashBtn');
      const riffleBtn = dom.actionDock.querySelector('#dockRiffleBtn');
      const cutBtn = dom.actionDock.querySelector('#dockCutBtn');
      const fanBtn = dom.actionDock.querySelector('#dockFanBtn');
      const autoCutBtn = dom.actionDock.querySelector('#dockAutoCutBtn');
      const cancelCutBtn = dom.actionDock.querySelector('#dockCancelCutBtn');

      if (washBtn) washBtn.addEventListener('click', doWashShuffle);
      if (riffleBtn) riffleBtn.addEventListener('click', doRiffleShuffle);
      if (cutBtn) cutBtn.addEventListener('click', startCutMode);
      if (fanBtn) fanBtn.addEventListener('click', enterFanDrawStage);
      if (autoCutBtn) autoCutBtn.addEventListener('click', autoFinishCut);
      if (cancelCutBtn) cancelCutBtn.addEventListener('click', () => exitCutMode(false));
      return;
    }

    if (state.stage === 'fan_draw') {
      dom.actionDock.innerHTML = `
        <div class="div-dock-group">
          <button type="button" class="div-pill-btn" id="dockResetBtn">重洗归位</button>
          <span class="dock-sep" aria-hidden="true"></span>
          <button type="button" class="div-pill-btn is-gold" id="dockAutoDrawBtn">
            <span class="btn-diamond" aria-hidden="true"></span>
            <span>代抽余牌</span>
          </button>
        </div>
      `;
      dom.actionDock.querySelector('#dockResetBtn').addEventListener('click', () => resetToDeckStage());
      dom.actionDock.querySelector('#dockAutoDrawBtn').addEventListener('click', autoDrawRemaining);
      return;
    }

    // Reveal stage
    const revealedCount = state.placements.filter(p => p.revealed).length;
    const allRevealed = revealedCount >= spread.count;
    const isComplex = spread.count >= 5;
    const zoomPct = Math.round(state.boardZoom * 100);
    dom.actionDock.innerHTML = `
      <div class="div-dock-group">
        <button type="button" class="div-pill-btn" id="dockResetBtn">重洗</button>
        <button type="button" class="div-pill-btn" id="dockSwitchSpreadBtn">换阵</button>
      </div>
      ${isComplex ? `
        <span class="dock-sep" aria-hidden="true"></span>
        <div class="div-dock-group">
          <button type="button" class="div-pill-btn ${state.showAllCaptions ? 'is-toggled' : ''}" id="dockCaptionsBtn" title="切换常驻显示全部牌位铭牌">铭牌</button>
          <div class="dock-zoom-group" role="group" aria-label="牌桌缩放">
            <button type="button" class="dock-zoom-btn" id="dockZoomOutBtn" aria-label="缩小">−</button>
            <button type="button" class="dock-zoom-readout ${state.boardZoom > 1.02 ? 'is-active-zoom' : ''}" id="dockZoomResetBtn" title="双击牌桌或点击复原全景">${zoomPct}%</button>
            <button type="button" class="dock-zoom-btn" id="dockZoomInBtn" aria-label="放大">+</button>
          </div>
        </div>
      ` : ''}
      ${allRevealed ? '' : `
        <span class="dock-sep" aria-hidden="true"></span>
        <div class="div-dock-group">
          <button type="button" class="div-pill-btn" id="dockRevealAllBtn">悉数翻开</button>
          <button type="button" class="div-pill-btn is-gold" id="dockRevealSeqBtn">
            <span class="btn-diamond" aria-hidden="true"></span>
            <span>依序揭牌</span>
          </button>
        </div>
      `}
    `;
    dom.actionDock.querySelector('#dockResetBtn').addEventListener('click', () => resetToDeckStage());
    dom.actionDock.querySelector('#dockSwitchSpreadBtn').addEventListener('click', openSpreadModal);
    const capBtn = dom.actionDock.querySelector('#dockCaptionsBtn');
    const zOutBtn = dom.actionDock.querySelector('#dockZoomOutBtn');
    const zResetBtn = dom.actionDock.querySelector('#dockZoomResetBtn');
    const zInBtn = dom.actionDock.querySelector('#dockZoomInBtn');
    if (capBtn) {
      capBtn.addEventListener('click', () => {
        state.showAllCaptions = !state.showAllCaptions;
        if (dom.board) dom.board.classList.toggle('show-all-captions', state.showAllCaptions);
        capBtn.classList.toggle('is-toggled', state.showAllCaptions);
        applyBoardSizing();
      });
    }
    if (zOutBtn) zOutBtn.addEventListener('click', () => setBoardZoom(state.boardZoom - 0.28, null, null, true));
    if (zInBtn) zInBtn.addEventListener('click', () => setBoardZoom(state.boardZoom + 0.28, null, null, true));
    if (zResetBtn) zResetBtn.addEventListener('click', () => resetBoardViewport(true));
    const seqBtn = dom.actionDock.querySelector('#dockRevealSeqBtn');
    const allBtn = dom.actionDock.querySelector('#dockRevealAllBtn');
    if (seqBtn) seqBtn.addEventListener('click', () => revealRemainingSequentially(420));
    if (allBtn) allBtn.addEventListener('click', () => revealRemainingSequentially(95));
  }

  /* --------------------------------------------------------------------------
     Spread Selector Modal & Altar Props Toggle Popover
     -------------------------------------------------------------------------- */
  function renderSpreadModalGrid() {
    if (!dom.spreadGrid) return;
    dom.spreadGrid.innerHTML = SPREADS.list.map((sp) => {
      const selected = sp.id === state.pendingSpreadId;
      const romanCount = ROMAN_SLOTS[sp.count - 1] || String(sp.count);
      return `
        <button type="button" class="spread-option-card ${selected ? 'is-selected' : ''}" data-spread-id="${sp.id}">
          <div class="spread-diagram-box">${SPREADS.makeMiniDiagramSvg(sp)}</div>
          <div class="spread-opt-head">
            <span class="spread-opt-name">${sp.name}</span>
            <span class="spread-opt-count">${romanCount} · ${sp.count} 牌</span>
          </div>
          <div class="spread-opt-en">${sp.en}</div>
          <div class="spread-opt-cat">${sp.category}</div>
          <div class="spread-opt-brief">${sp.brief}</div>
        </button>
      `;
    }).join('');

    dom.spreadGrid.querySelectorAll('.spread-option-card').forEach((cardBtn) => {
      cardBtn.addEventListener('click', () => {
        state.pendingSpreadId = cardBtn.getAttribute('data-spread-id');
        renderSpreadModalGrid();
      });
    });

    dom.scopeBtns.forEach((btn) => {
      const active = btn.getAttribute('data-div-scope') === state.deckScope;
      btn.classList.toggle('is-gold', active);
    });
    if (dom.revToggleBtn) {
      dom.revToggleBtn.classList.toggle('is-gold', state.allowReversed);
      dom.revToggleBtn.textContent = state.allowReversed ? '含逆位' : '仅正位';
    }
  }

  function openSpreadModal() {
    state.pendingSpreadId = state.spreadId;
    renderSpreadModalGrid();
    if (dom.spreadModal) dom.spreadModal.classList.remove('hidden');
  }

  function closeSpreadModal() {
    if (dom.spreadModal) dom.spreadModal.classList.add('hidden');
  }

  function renderPropsPopover() {
    if (!dom.propsToggleList || !propsController) return;
    const enabled = propsController.getEnabled();
    dom.propsToggleList.innerHTML = propsController.catalog.map((item) => {
      const isOn = Boolean(enabled[item.id]);
      return `
        <button type="button" class="prop-toggle-row ${isOn ? 'is-on' : ''}" data-toggle-prop="${item.id}">
          <div class="text-left min-w-0">
            <div class="prop-toggle-title">${item.name} <span class="prop-toggle-en">${item.en}</span></div>
            <div class="prop-toggle-hint">${item.hint}</div>
          </div>
          <span class="prop-switch" aria-hidden="true"></span>
        </button>
      `;
    }).join('');

    dom.propsToggleList.querySelectorAll('[data-toggle-prop]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-toggle-prop');
        const next = propsController.toggleProp(id);
        btn.classList.toggle('is-on', next);
      });
    });
  }

  /* --------------------------------------------------------------------------
     Wire Events & Initialize
     -------------------------------------------------------------------------- */
  function bindEvents() {
    if (dom.deckStack) {
      dom.deckStack.addEventListener('click', doWashShuffle);
    }

    if (dom.questionInput) {
      dom.questionInput.addEventListener('input', updateHeaderMeta);
    }

    if (dom.openSpreadBtn) {
      dom.openSpreadBtn.addEventListener('click', openSpreadModal);
    }
    if (dom.closeSpreadModalBtn) {
      dom.closeSpreadModalBtn.addEventListener('click', closeSpreadModal);
    }
    if (dom.spreadModal) {
      dom.spreadModal.addEventListener('click', (e) => {
        if (e.target === dom.spreadModal) closeSpreadModal();
      });
    }
    if (dom.confirmSpreadBtn) {
      dom.confirmSpreadBtn.addEventListener('click', () => {
        closeSpreadModal();
        resetToDeckStage(state.pendingSpreadId);
        notify(`已切换至【${getSpread().name}】，请重新洗切牌组`);
      });
    }

    dom.scopeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.deckScope = btn.getAttribute('data-div-scope') || 'all';
        renderSpreadModalGrid();
      });
    });

    if (dom.revToggleBtn) {
      dom.revToggleBtn.addEventListener('click', () => {
        state.allowReversed = !state.allowReversed;
        renderSpreadModalGrid();
      });
    }

    if (dom.propsTriggerBtn && dom.propsPopover) {
      dom.propsTriggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderPropsPopover();
        if (propsController && propsController.renderInstrumentsTray) {
          propsController.renderInstrumentsTray(dom.instrumentsTray);
        }
        dom.propsPopover.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!dom.propsPopover.classList.contains('hidden')
          && !dom.propsPopover.contains(e.target)
          && !dom.propsTriggerBtn.contains(e.target)) {
          dom.propsPopover.classList.add('hidden');
        }
      });
    }

    // Velvet Canvas Wheel Zoom & Drag Pan (active during reveal stage)
    if (dom.mat) {
      dom.mat.addEventListener('wheel', (e) => {
        if (state.stage !== 'reveal') return;
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.14 : 1 / 1.14;
        setBoardZoom(state.boardZoom * factor, e.clientX, e.clientY, false);
      }, { passive: false });

      dom.mat.addEventListener('pointerdown', (e) => {
        if (state.stage !== 'reveal' || state.boardZoom <= 1.02 || e.button !== 0) return;
        draggingBoard = true;
        suppressNextCardClick = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragOriginPanX = state.boardPanX;
        dragOriginPanY = state.boardPanY;
        if (dom.board) dom.board.classList.add('is-dragging');
      });

      window.addEventListener('pointermove', (e) => {
        if (!draggingBoard) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) suppressNextCardClick = true;
        state.boardPanX = dragOriginPanX + dx;
        state.boardPanY = dragOriginPanY + dy;
        applyBoardTransform(false);
      });

      const endDrag = () => {
        if (!draggingBoard) return;
        draggingBoard = false;
        if (dom.board) dom.board.classList.remove('is-dragging');
        if (suppressNextCardClick) {
          setTimeout(() => { suppressNextCardClick = false; }, 60);
        }
      };
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);

      dom.mat.addEventListener('dblclick', (e) => {
        if (state.stage !== 'reveal' || e.target.closest('.table-card-scene')) return;
        resetBoardViewport(true);
      });
    }

    if (dom.fanPrevBtn && dom.fanViewport) {
      dom.fanPrevBtn.addEventListener('click', () => {
        dom.fanViewport.scrollBy({ left: -260, behavior: 'smooth' });
      });
    }
    if (dom.fanNextBtn && dom.fanViewport) {
      dom.fanNextBtn.addEventListener('click', () => {
        dom.fanViewport.scrollBy({ left: 260, behavior: 'smooth' });
      });
    }
    if (dom.fanViewport) {
      dom.fanViewport.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          dom.fanViewport.scrollLeft += e.deltaY * 1.1;
        }
      }, { passive: false });
    }

    if (window.ResizeObserver && dom.board) {
      resizeObserver = new ResizeObserver(() => applyBoardSizing());
      resizeObserver.observe(dom.board);
    } else {
      window.addEventListener('resize', applyBoardSizing, { passive: true });
    }
  }

  function applyTableStyle(style) {
    tableStyle = style === 'velvet_cloth' ? 'velvet_cloth' : 'wood_table';
    try { localStorage.setItem(TABLE_STYLE_KEY, tableStyle); } catch {}
    if (dom.stage) {
      dom.stage.classList.toggle('table-style-wood', tableStyle === 'wood_table');
      dom.stage.classList.toggle('table-style-cloth', tableStyle === 'velvet_cloth');
    }
    dom.tableStyleBtns.forEach((btn) => {
      const active = btn.getAttribute('data-table-style') === tableStyle;
      btn.classList.toggle('is-gold', active);
    });
    requestAnimationFrame(() => applyBoardSizing());
  }

  function init() {
    if (PROPS_API && dom.propsLayer) {
      propsController = PROPS_API.createController({
        layerEl: dom.propsLayer,
        stageEl: dom.stage,
        matEl: dom.mat,
        smokeCanvas: dom.smokeCanvas,
        trayEl: dom.instrumentsTray,
        onNotify: notify,
      });
      renderPropsPopover();
    }
    dom.tableStyleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        applyTableStyle(btn.getAttribute('data-table-style'));
        notify(tableStyle === 'wood_table' ? '已切换至古典胡桃木桌视角' : '已切换至典藏平铺绒布视角');
      });
    });
    applyTableStyle(tableStyle);
    bindEvents();
    resetToDeckStage(state.spreadId);
  }

  init();

  return {
    refreshDeck() {
      // Re-render any currently placed spread cards with updated 3-layer artwork (e.g. after custom upload!)
      if (state.placements.length > 0) {
        renderSpreadBoard();
      }
      // Also ensure deckOrder reflects latest deck pool if still in ritual_deck
      if (state.stage === 'ritual_deck' && state.deckOrder.length !== getFilteredPool().length) {
        buildFreshDeckOrder();
        updateDeckStatusText();
      }
    },
    setActive(active) {
      if (propsController) propsController.setActive(active);
      if (active) requestAnimationFrame(() => applyBoardSizing());
    },
    openSpreadModal,
    resetToDeckStage,
  };
};
