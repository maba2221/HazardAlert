// Emergency Alert Audio Synthesizer and Voice Alert Manager
class EmergencyAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private activeOscillators: OscillatorNode[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAll();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Plays official EAS (Emergency Alert System) dual-frequency tone: 853 Hz + 960 Hz
  public playEasSiren(durationMs: number = 2500) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      this.stopAll();

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(853, this.ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(960, this.ctx.currentTime);

      // Pulse modulation
      gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.35, this.ctx.currentTime + 0.05);

      const endTime = this.ctx.currentTime + durationMs / 1000;
      gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(endTime);
      osc2.stop(endTime);

      this.activeOscillators.push(osc1, osc2);
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }

  // Rising frequency warning siren (e.g. Tsunami / Eruption)
  public playSweepSiren(cycles: number = 3) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      this.stopAll();
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      let time = now;
      const cycleDuration = 0.8;

      for (let i = 0; i < cycles; i++) {
        osc.frequency.setValueAtTime(440, time);
        osc.frequency.linearRampToValueAtTime(980, time + cycleDuration * 0.6);
        osc.frequency.linearRampToValueAtTime(440, time + cycleDuration);
        time += cycleDuration;
      }

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(time);
      this.activeOscillators.push(osc);
    } catch (e) {
      console.warn('Sweep siren error:', e);
    }
  }

  // Play audio/wav base64 received from Gemini TTS endpoint
  public playTtsBase64(base64Data: string, onEnd?: () => void) {
    if (this.isMuted) return;
    try {
      this.stopAll();
      const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
      audio.volume = 0.9;
      audio.onended = () => {
        if (onEnd) onEnd();
      };
      audio.play().catch((err) => {
        console.warn('TTS playback prevented by browser policy:', err);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Native Web Speech API fallback when Gemini TTS isn't configured
  public speakFallbackText(text: string, onEnd?: () => void) {
    if (this.isMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        if (onEnd) {
          utterance.onend = onEnd;
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis fallback failed:', err);
      }
    }
  }

  public stopAll() {
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const emergencyAudio = new EmergencyAudioEngine();
