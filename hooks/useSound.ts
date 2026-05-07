import { Platform } from "react-native";

type AudioContextType = typeof AudioContext;

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (Platform.OS !== "web") return null;
  try {
    if (!_ctx) {
      const AC = (window.AudioContext ?? (window as any).webkitAudioContext) as AudioContextType | undefined;
      if (!AC) return null;
      _ctx = new AC();
    }
    if (_ctx.state === "suspended") {
      _ctx.resume().catch(() => {});
    }
    return _ctx;
  } catch {
    return null;
  }
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gainVal = 0.18,
  startOffset = 0,
  endFrequency?: number,
) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startOffset);
  if (endFrequency !== undefined) {
    osc.frequency.linearRampToValueAtTime(endFrequency, ctx.currentTime + startOffset + duration);
  }
  gain.gain.setValueAtTime(gainVal, ctx.currentTime + startOffset);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
  osc.start(ctx.currentTime + startOffset);
  osc.stop(ctx.currentTime + startOffset + duration);
}

export function playRevealSound() {
  playTone(220, 0.1, "sawtooth", 0.14, 0, 330);
  playTone(330, 0.15, "sawtooth", 0.16, 0.08, 480);
  playTone(480, 0.2, "sawtooth", 0.15, 0.22);
}

export function playTickSound() {
  playTone(800, 0.05, "square", 0.06);
}

export function playAlarmSound() {
  for (let i = 0; i < 4; i++) {
    const offset = i * 0.35;
    playTone(880, 0.15, "square", 0.22, offset);
    playTone(660, 0.12, "square", 0.18, offset + 0.18);
  }
}

export function playSuccessSound() {
  playTone(440, 0.1, "sine", 0.14, 0);
  playTone(550, 0.1, "sine", 0.14, 0.1);
  playTone(660, 0.25, "sine", 0.18, 0.2);
}
