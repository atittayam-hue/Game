class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delaySec = 0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  playClick() {
    this.playTone(540, 0.08, 'triangle', 0.06);
  }

  playTick(urgent = false) {
    this.playTone(urgent ? 880 : 620, 0.07, 'sine', urgent ? 0.07 : 0.04);
  }

  playCorrect() {
    this.playTone(523.25, 0.14, 'triangle', 0.08, 0);
    this.playTone(659.25, 0.14, 'triangle', 0.08, 0.09);
    this.playTone(783.99, 0.24, 'triangle', 0.09, 0.18);
  }

  playWrong() {
    this.playTone(310, 0.16, 'sawtooth', 0.05, 0);
    this.playTone(235, 0.24, 'sawtooth', 0.05, 0.12);
  }

  playPodium() {
    this.playTone(523.25, 0.12, 'triangle', 0.08, 0);
    this.playTone(659.25, 0.12, 'triangle', 0.08, 0.1);
    this.playTone(783.99, 0.12, 'triangle', 0.08, 0.2);
    this.playTone(1046.5, 0.35, 'triangle', 0.1, 0.3);
  }
}

export const soundFX = new SoundEngine();
