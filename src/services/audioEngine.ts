import { AmbientSoundType } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentTrack: AmbientSoundType | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private trackNodes: {
    source?: AudioNode;
    gains?: GainNode[];
    oscillators?: OscillatorNode[];
    intervalId?: number;
    filters?: BiquadFilterNode[];
  } = {};
  private volume: number = 0.65;

  private initContext() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrack(): AmbientSoundType | null {
    return this.currentTrack;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public stopAmbient() {
    this.cleanupNodes();
    this.isPlaying = false;
    this.currentTrack = null;
  }

  private cleanupNodes() {
    if (this.trackNodes.oscillators) {
      this.trackNodes.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (_) {}
      });
    }
    if (this.trackNodes.intervalId) {
      clearInterval(this.trackNodes.intervalId);
    }
    if (this.trackNodes.source) {
      try {
        (this.trackNodes.source as AudioBufferSourceNode).stop?.();
        this.trackNodes.source.disconnect();
      } catch (_) {}
    }
    this.trackNodes = {};
  }

  public playAmbient(type: AmbientSoundType) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.currentTrack === type && this.isPlaying) {
      // Toggle off
      this.stopAmbient();
      return;
    }

    this.cleanupNodes();
    this.currentTrack = type;
    this.isPlaying = true;

    switch (type) {
      case 'brown':
        this.playBrownNoise();
        break;
      case 'white':
        this.playWhiteNoise();
        break;
      case 'gamma40':
        this.play40HzGamma();
        break;
      case 'rain':
        this.playRain();
        break;
      case 'ocean':
        this.playOcean();
        break;
      case 'wind':
        this.playWind();
        break;
    }
  }

  private playBrownNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 5 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    source.connect(filter);
    filter.connect(this.masterGain);
    source.start();
    this.trackNodes.source = source;
  }

  private playWhiteNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 3 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.masterGain);
    source.start();
    this.trackNodes.source = source;
  }

  private play40HzGamma() {
    if (!this.ctx || !this.masterGain) return;
    // Binaural beat: Left ear 200Hz, Right ear 240Hz -> 40Hz difference for Gamma synchrony!
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(240, this.ctx.currentTime);

    const gainL = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.18, this.ctx.currentTime);
    const gainR = this.ctx.createGain();
    gainR.gain.setValueAtTime(0.18, this.ctx.currentTime);

    oscLeft.connect(gainL);
    oscRight.connect(gainR);

    // Isochronic pulse generator at 40Hz:
    const pulseOsc = this.ctx.createOscillator();
    pulseOsc.type = 'sine';
    pulseOsc.frequency.setValueAtTime(160, this.ctx.currentTime);

    const pulseGain = this.ctx.createGain();
    pulseGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(40, this.ctx.currentTime); // 40 Hz modulation
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    lfo.connect(lfoGain.gain);

    pulseOsc.connect(lfoGain);
    lfoGain.connect(this.masterGain);

    gainL.connect(merger, 0, 0);
    gainR.connect(merger, 0, 1);
    merger.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();
    pulseOsc.start();
    lfo.start();

    this.trackNodes.oscillators = [oscLeft, oscRight, pulseOsc, lfo];
  }

  private playRain() {
    if (!this.ctx || !this.masterGain) return;
    // Bandpassed pink/white noise for rainfall continuous body
    const bufferSize = 4 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 850;
    filter.Q.value = 0.8;

    source.connect(filter);
    filter.connect(this.masterGain);
    source.start();
    this.trackNodes.source = source;
  }

  private playOcean() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 4 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.04 * white) / 1.04;
      data[i] = last * 1.8;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    // Slow swell LFO (every 8-10 seconds)
    const swellLfo = this.ctx.createOscillator();
    swellLfo.type = 'sine';
    swellLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    swellLfo.connect(filter.frequency);

    source.connect(filter);
    filter.connect(this.masterGain);

    source.start();
    swellLfo.start();

    this.trackNodes.source = source;
    this.trackNodes.oscillators = [swellLfo];
  }

  private playWind() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 4 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.16;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.value = 2.5;

    // Slow wind gust modulator
    const gustLfo = this.ctx.createOscillator();
    gustLfo.type = 'sine';
    gustLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);

    const gustScale = this.ctx.createGain();
    gustScale.gain.setValueAtTime(200, this.ctx.currentTime);
    gustLfo.connect(gustScale);
    gustScale.connect(filter.frequency);

    source.connect(filter);
    filter.connect(this.masterGain);

    source.start();
    gustLfo.start();

    this.trackNodes.source = source;
    this.trackNodes.oscillators = [gustLfo];
  }

  // Synthesizes a resonant ceremonial focus bell
  public playBell(type: 'start' | 'complete' | 'reset' = 'start') {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.connect(this.ctx.destination);
      master.gain.setValueAtTime(0.28, now);

      if (type === 'start') {
        // High clear singing bowl chime (528Hz Solfeggio clarity frequency)
        const freqs = [528, 1056, 1584];
        freqs.forEach((f, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          const amp = idx === 0 ? 0.35 : 0.15 / (idx + 1);
          gain.gain.setValueAtTime(amp, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
          osc.connect(gain);
          gain.connect(master);
          osc.start(now);
          osc.stop(now + 3.0);
        });
      } else if (type === 'complete') {
        // Double uplifting chime
        const notes = [528, 660, 792, 1056];
        notes.forEach((f, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const t = now + idx * 0.16;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
          osc.connect(gain);
          gain.connect(master);
          osc.start(t);
          osc.stop(t + 2.6);
        });
      } else {
        // Gentle soft hum for mindful reset
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 2.0);
      }
    } catch (_) {}
  }

  // Synthesizes a short, noticeable but non-aggressive early finish warning tone
  public playEarlyFinishWarning() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.connect(this.ctx.destination);
      master.gain.setValueAtTime(0.22, now);

      // Warm, non-aggressive descending harmonic tone (480Hz -> 360Hz with soft rounded envelope)
      const notes = [
        { f: 480, offset: 0, duration: 0.28, peak: 0.24 },
        { f: 380, offset: 0.14, duration: 0.38, peak: 0.20 },
      ];

      notes.forEach(({ f, offset, duration, peak }) => {
        const startT = now + offset;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, startT);
        // Soft envelope: subtle rise then smooth natural decay
        gain.gain.setValueAtTime(0.001, startT);
        gain.gain.linearRampToValueAtTime(peak, startT + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startT + duration);
        osc.connect(gain);
        gain.connect(master);
        osc.start(startT);
        osc.stop(startT + duration + 0.05);
      });
    } catch (_) {}
  }
}

export const audioEngine = new AudioEngine();
