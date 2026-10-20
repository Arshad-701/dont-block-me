// Web Audio API synthesized cute sound effects — no audio files needed.
// All sounds are triggered by user interaction so AudioContext is allowed.

let ctx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
}
export function isSoundEnabled() {
  return enabled;
}

// play a single tone
function tone(
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.14
) {
  const c = getCtx();
  if (!c || !enabled) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + startOffset);
  osc.connect(g);
  g.connect(c.destination);
  const t = c.currentTime + startOffset;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

// frequency sweep (for whoosh / pop)
function sweep(
  from: number,
  to: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.12
) {
  const c = getCtx();
  if (!c || !enabled) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  const t = c.currentTime + startOffset;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t + duration);
  osc.connect(g);
  g.connect(c.destination);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

// soft tap / pop on button press
export function playTap() {
  sweep(420, 680, 0, 0.08, "sine", 0.1);
}

// pleasant two-note ding when selecting an option
export function playSelect() {
  tone(880, 0, 0.07, "triangle", 0.13);
  tone(1320, 0.06, 0.12, "triangle", 0.11);
}

// light pop (confetti piece)
export function playPop() {
  sweep(900, 1500, 0, 0.06, "triangle", 0.08);
}

// page / step transition whoosh
export function playWhoosh() {
  sweep(300, 900, 0, 0.18, "sine", 0.09);
}

// short back tick
export function playBack() {
  tone(520, 0, 0.06, "sine", 0.09);
}

// ascending success chime (C-E-G-C)
export function playSuccess() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => tone(f, i * 0.1, 0.18, "triangle", 0.14));
  // sparkle
  sweep(1800, 2400, 0.4, 0.15, "sine", 0.06);
}

// descending fail / buzzer
export function playFail() {
  tone(311, 0, 0.18, "sawtooth", 0.1);
  tone(233, 0.16, 0.22, "sawtooth", 0.1);
  tone(174, 0.34, 0.3, "sawtooth", 0.09);
}

// tiny error buzz
export function playError() {
  tone(220, 0, 0.12, "square", 0.07);
}

// gentle reveal chime
export function playReveal() {
  tone(659, 0, 0.1, "triangle", 0.1);
  tone(880, 0.08, 0.14, "triangle", 0.09);
}
