class AudioEngine {
  ctx: AudioContext | null = null;

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playStart() {
    if (!this.ctx) return;
    // Dark ominous sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(40, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 2);
    
    // Filter to make it dark and muffled
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 2);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 2);
  }

  playComplete() {
    if (!this.ctx) return;
    // Deep cosmic bell/gong impact
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    
    // FM modulation for bell-like metallic timbre
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    mod.type = 'sine';
    mod.frequency.setValueAtTime(220, this.ctx.currentTime); 
    modGain.gain.setValueAtTime(400, this.ctx.currentTime);
    modGain.gain.exponentialRampToValueAtTime(10, this.ctx.currentTime + 4);
    
    mod.connect(modGain);
    modGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 4);

    // Add a bit of distortion for that "dark" edge
    const distortion = this.ctx.createWaveShaper();
    function makeDistortionCurve(amount: number) {
      const k = typeof amount === 'number' ? amount : 50;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      return curve;
    }
    distortion.curve = makeDistortionCurve(10);
    distortion.oversample = '4x';

    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.ctx.destination);
    
    mod.start();
    osc.start();
    mod.stop(this.ctx.currentTime + 4);
    osc.stop(this.ctx.currentTime + 4);
  }

  async playBase64(base64: string, sampleRate: number = 24000) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    try {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      try {
        // Try standard decoding first (for MP3/WAV/etc)
        const audioBuffer = await this.ctx.decodeAudioData(bytes.buffer.slice(0));
        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.ctx.destination);
        source.start();
      } catch (decodeErr) {
        // If standard decoding fails, assume it's raw 16-bit PCM (Gemini TTS default)
        const pcmLen = Math.floor(bytes.length / 2);
        const pcmData = new Int16Array(bytes.buffer, 0, pcmLen);
        const audioBuffer = this.ctx.createBuffer(1, pcmLen, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < pcmLen; i++) {
          channelData[i] = pcmData[i] / 32768.0;
        }
        
        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.ctx.destination);
        source.start();
      }
    } catch (err) {
      console.error('Error playing base64 audio:', err);
    }
  }

  playAmbientDrone() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(40, ctx.currentTime);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(41, ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.Q.setValueAtTime(10, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 10);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 10);
    osc2.stop(ctx.currentTime + 10);
  }

  playError() {
    if (!this.ctx) return;
    // Dissonant, alarming dark tone
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.5);
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(107, this.ctx.currentTime); // Dissonant interval
    osc2.frequency.linearRampToValueAtTime(57, this.ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.5);
    osc2.stop(this.ctx.currentTime + 0.5);
  }
}

export const audio = new AudioEngine();

export function pcmToWav(base64Pcm: string, sampleRate: number = 24000): string {
  if (typeof window === 'undefined') return '';
  
  const binaryString = window.atob(base64Pcm);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  // file length
  view.setUint32(4, 36 + len, true);
  // RIFF type
  view.setUint32(8, 0x57415645, false); // "WAVE"
  // format chunk identifier
  view.setUint32(12, 0x666d7420, false); // "fmt "
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true); // PCM
  // channel count
  view.setUint16(22, 1, true); // Mono
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  view.setUint32(36, 0x64617461, false); // "data"
  // data chunk length
  view.setUint32(40, len, true);

  const wavData = new Uint8Array(44 + len);
  wavData.set(new Uint8Array(wavHeader), 0);
  wavData.set(bytes, 44);

  const blob = new Blob([wavData], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}
