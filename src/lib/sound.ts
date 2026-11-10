// All sounds are made on the fly with Web Audio, so there are no files to
// load and they work offline. Browsers keep audio off until the first tap,
// so the context is made, or woken, on the first sound.

let ctx: AudioContext | undefined;

function audio(): AudioContext | undefined {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return undefined; // No sound, the game still works.
  }
}

// A soft, bell-like tone: a sine with a quiet octave on top that rings out.
function tone(frequency: number, { at = 0, length = 0.6, volume = 0.35 } = {}) {
  const a = audio();
  if (!a) return;
  const start = a.currentTime + at;
  const gain = a.createGain();
  gain.connect(a.destination);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);

  for (const [mult, level, type] of [
    [1, 1, 'sine'],
    [2, 0.25, 'triangle'],
  ] as const) {
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = type;
    osc.frequency.value = frequency * mult;
    g.gain.value = level;
    osc.connect(g).connect(gain);
    osc.start(start);
    osc.stop(start + length + 0.05);
  }
}

export const playNote = (frequency: number) => tone(frequency);

// A wrong note: a short, low "boop" that slides down. Silly, not sad.
export function bonk() {
  const a = audio();
  if (!a) return;
  const start = a.currentTime;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, start);
  osc.frequency.exponentialRampToValueAtTime(110, start + 0.25);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.4, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
  osc.connect(gain).connect(a.destination);
  osc.start(start);
  osc.stop(start + 0.35);
}

// A happy run up the scale, played when a song ends.
export function fanfare() {
  [261.63, 329.63, 392.0, 523.25, 659.25].forEach((f, i) =>
    tone(f, { at: i * 0.09, length: i === 4 ? 1.2 : 0.4, volume: 0.25 })
  );
}
