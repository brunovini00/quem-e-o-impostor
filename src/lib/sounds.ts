// Sound effects using Web Audio API
// No external audio files needed

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

type SoundType = 'reveal' | 'impostor' | 'timer' | 'vote' | 'victory' | 'defeat' | 'click' | 'warning';

const SOUND_CONFIGS: Record<SoundType, { frequency: number; duration: number; type: OscillatorType; envelope?: 'short' | 'long' }> = {
  reveal: { frequency: 523.25, duration: 0.15, type: 'sine', envelope: 'short' },
  impostor: { frequency: 220, duration: 0.5, type: 'sawtooth', envelope: 'long' },
  timer: { frequency: 880, duration: 0.1, type: 'square', envelope: 'short' },
  vote: { frequency: 440, duration: 0.2, type: 'sine', envelope: 'short' },
  victory: { frequency: 659.25, duration: 0.4, type: 'sine', envelope: 'long' },
  defeat: { frequency: 196, duration: 0.6, type: 'sawtooth', envelope: 'long' },
  click: { frequency: 1000, duration: 0.05, type: 'sine', envelope: 'short' },
  warning: { frequency: 440, duration: 0.3, type: 'square', envelope: 'short' },
};

export function playSound(type: SoundType, enabled: boolean = true): void {
  if (!enabled) return;
  
  try {
    const ctx = getAudioContext();
    const config = SOUND_CONFIGS[type];
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);
    
    // Envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    
    if (config.envelope === 'long') {
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);
    } else {
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + config.duration);
    }
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
    
    // Special sounds with multiple notes
    if (type === 'victory') {
      playVictoryMelody(ctx);
    }
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

function playVictoryMelody(ctx: AudioContext): void {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }, i * 100);
  });
}

export function playImpostorReveal(enabled: boolean = true): void {
  if (!enabled) return;
  
  try {
    const ctx = getAudioContext();
    
    // Dramatic low rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.8);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}
