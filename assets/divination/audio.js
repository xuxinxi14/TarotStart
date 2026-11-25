/* Procedural Web Audio API Ritual Sound Synthesizer (zero external audio files, 100% file:// compatible) */
window.TAROT_AUDIO = (() => {
  let ctx = null;
  let muted = false;
  const STORAGE_KEY = 'tarot_ritual_sound_muted_v1';
  try {
    muted = localStorage.getItem(STORAGE_KEY) === '1';
  } catch {}

  function ensureContext() {
    if (muted) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function makeNoiseBuffer(ac, seconds) {
    const len = Math.max(1, Math.floor(ac.sampleRate * seconds));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    return buf;
  }

  // Soft velvet card brush / slide sound
  function playCardBrush(duration = 0.14, pitch = 1400, gainPeak = 0.08) {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;
    const src = ac.createBufferSource();
    src.buffer = makeNoiseBuffer(ac, duration + 0.04);

    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(pitch, now);
    filter.frequency.exponentialRampToValueAtTime(pitch * 0.62, now + duration);
    filter.Q.value = 1.6;

    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(gainPeak, now + duration * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(g);
    g.connect(ac.destination);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  // Riffle shuffle cascade (series of crisp cardstock snaps)
  function playRiffleShuffle() {
    const ac = ensureContext();
    if (!ac) return;
    for (let i = 0; i < 11; i++) {
      setTimeout(() => {
        playCardBrush(0.055, 1650 + i * 70 + Math.random() * 180, 0.055);
      }, i * 42);
    }
  }

  // Wash shuffle gentle velvet swirling
  function playWashShuffle() {
    const ac = ensureContext();
    if (!ac) return;
    [0, 210, 440, 680, 920].forEach((delay, idx) => {
      setTimeout(() => {
        playCardBrush(0.24, 900 + (idx % 2) * 260, 0.05);
      }, delay);
    });
  }

  // Crisp 3-pile cut thud
  function playDeckCut() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.11);
    g.gain.setValueAtTime(0.11, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.13);
    playCardBrush(0.09, 1250, 0.06);
  }

  // Fan spread sweeping whisper
  function playFanSpread() {
    const ac = ensureContext();
    if (!ac) return;
    for (let i = 0; i < 7; i++) {
      setTimeout(() => {
        playCardBrush(0.08, 1200 + i * 150, 0.045);
      }, i * 38);
    }
  }

  // Card flip & mystical chime shimmer
  function playCardReveal() {
    const ac = ensureContext();
    if (!ac) return;
    playCardBrush(0.12, 1850, 0.07);
    const now = ac.currentTime;
    const freqs = [528, 792, 1056];
    freqs.forEach((f, idx) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.022 / (idx + 1), now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.85 - idx * 0.15);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.9);
    });
  }

  // Tibetan Singing Bowl harmonic resonance
  function playSingingBowl() {
    const ac = ensureContext();
    if (!ac) return;
    const now = ac.currentTime;
    const partials = [
      { f: 216, gain: 0.11, dur: 4.4 },
      { f: 217.6, gain: 0.07, dur: 4.2 }, // gentle acoustic beating
      { f: 618, gain: 0.045, dur: 3.1 },
      { f: 1188, gain: 0.018, dur: 2.0 },
    ];
    partials.forEach((p) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.f, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(p.gain, now + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(now);
      osc.stop(now + p.dur + 0.05);
    });
  }

  // Astrological wooden/obsidian dice clatter
  function playDiceRoll() {
    const ac = ensureContext();
    if (!ac) return;
    const offsets = [0, 75, 145, 225, 315, 420];
    offsets.forEach((delay, idx) => {
      setTimeout(() => {
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = 'triangle';
        const base = 360 + Math.random() * 280 - idx * 18;
        osc.frequency.setValueAtTime(base, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.045);
        g.gain.setValueAtTime(0.08 * (1 - idx * 0.1), now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.connect(g);
        g.connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      }, delay);
    });
  }

  // Soft candle ignite / blow breath
  function playCandle(lit) {
    playCardBrush(lit ? 0.16 : 0.22, lit ? 2400 : 650, lit ? 0.045 : 0.065);
  }

  function isMuted() {
    return muted;
  }

  function setMuted(val) {
    muted = Boolean(val);
    try { localStorage.setItem(STORAGE_KEY, muted ? '1' : '0'); } catch {}
    return muted;
  }

  function toggleMute() {
    return setMuted(!muted);
  }

  return {
    playCardBrush,
    playRiffleShuffle,
    playWashShuffle,
    playDeckCut,
    playFanSpread,
    playCardReveal,
    playSingingBowl,
    playDiceRoll,
    playCandle,
    isMuted,
    setMuted,
    toggleMute,
  };
})();
