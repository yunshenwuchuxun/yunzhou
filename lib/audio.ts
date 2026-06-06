// 简单的 WebAudio 音效，移植自原型。受全局 window.__muted 控制。
let ctx: AudioContext | null = null;

export function playSound(mode: "success" | "punish") {
  if (typeof window === "undefined") return;
  if ((window as unknown as { __muted?: boolean }).__muted) return;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (mode === "success") {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    /* ignore */
  }
}
