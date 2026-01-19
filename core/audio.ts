
/**
 * Simple Synthesizer for Slot Machine Sound Effects
 * Uses Web Audio API to generate sounds without external assets.
 */

class AudioController {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private initialized: boolean = false;
  
    public init() {
      if (this.initialized) return;
      
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx!.createGain();
        this.masterGain.gain.value = 0.3; // Master volume
        this.masterGain.connect(this.ctx!.destination);
        this.initialized = true;
      }
    }
  
    private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 1) {
      if (!this.ctx || !this.masterGain) return;
  
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
  
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
  
      gain.gain.setValueAtTime(vol, this.ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);
  
      osc.connect(gain);
      gain.connect(this.masterGain);
  
      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    }
  
    public playSpinStart() {
      if (!this.initialized) this.init();
      // Rising sound
      this.playTone(200, 'sine', 0.2, 0, 0.5);
      this.playTone(400, 'triangle', 0.2, 0.1, 0.5);
    }
  
    public playReelStop() {
      if (!this.initialized) return;
      // Mechanical clack
      this.playTone(100, 'square', 0.1, 0, 0.8);
      this.playTone(50, 'sawtooth', 0.1, 0, 0.8);
    }
  
    public playWin(amount: number) {
      if (!this.initialized) return;
      
      const isBigWin = amount > 20;
      const baseVol = 0.6;
  
      // Major Arpeggio
      this.playTone(523.25, 'sine', 0.3, 0, baseVol); // C5
      this.playTone(659.25, 'sine', 0.3, 0.1, baseVol); // E5
      this.playTone(783.99, 'sine', 0.3, 0.2, baseVol); // G5
      this.playTone(1046.50, 'sine', 0.6, 0.3, baseVol); // C6
  
      if (isBigWin) {
        // Fanfare addition
        setTimeout(() => {
            this.playTone(523.25, 'square', 0.4, 0, 0.4);
            this.playTone(783.99, 'square', 0.4, 0.1, 0.4);
            this.playTone(1046.50, 'square', 0.8, 0.2, 0.4);
        }, 400);
      }
    }
  
    public playLoss() {
        if (!this.initialized) return;
        // Sad descending tones
        this.playTone(300, 'triangle', 0.3, 0, 0.4);
        this.playTone(200, 'triangle', 0.4, 0.2, 0.4);
    }

    public playClick() {
        if (!this.initialized) this.init();
        this.playTone(800, 'sine', 0.05, 0, 0.2);
    }
  }
  
  export const audioManager = new AudioController();
