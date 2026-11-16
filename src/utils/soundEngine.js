// Real Web Audio API Nostalgic Music Box & Acoustic Melody Engine
// Guarantees 100% working, warm nostalgic sound in every browser without broken external MP3 links.

class NostalgicSoundEngine {
  constructor() {
    this.ctx = null;
    this.intervalId = null;
    this.isPlaying = false;
    this.currentTrackId = null;
    this.volume = 0.65;
    this.stepIndex = 0;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Different nostalgic melodies (frequencies in Hz)
  getMelody(trackKey = 'default') {
    const melodies = {
      school: [
        // Warm nostalgic graduation progression (C major / A minor)
        [523.25, 329.63, 261.63], // C5 + E4 + C4
        [587.33],                 // D5
        [659.25, 392.00],         // E5 + G4
        [523.25],                 // C5
        [440.00, 329.63, 220.00], // A4 + E4 + A3
        [493.88],                 // B4
        [523.25, 349.23],         // C5 + F4
        [392.00],                 // G4
        [349.23, 261.63, 174.61], // F4 + C4 + F3
        [440.00],                 // A4
        [392.00, 293.66],         // G4 + D4
        [329.63],                 // E4
        [293.66, 246.94, 196.00], // D4 + B3 + G3
        [392.00],                 // G4
        [523.25, 329.63, 261.63], // C5 + E4 + C4
        [523.25],
      ],
      musicbox: [
        // La Vie En Rose inspired music box chimes
        [659.25, 329.63], // E5
        [622.25],         // D#5
        [587.33, 293.66], // D5
        [523.25],         // C5
        [493.88, 246.94], // B4
        [440.00],         // A4
        [392.00, 196.00], // G4
        [440.00],         // A4
        [493.88, 246.94], // B4
        [523.25],         // C5
        [587.33, 293.66], // D5
        [659.25],         // E5
        [587.33, 392.00], // D5
        [523.25, 329.63], // C5
      ],
      dalat: [
        // Gentle waltz in F major
        [698.46, 349.23], // F5
        [587.33],         // D5
        [523.25, 440.00], // C5
        [440.00],         // A4
        [466.16, 233.08], // Bb4
        [523.25],         // C5
        [587.33, 349.23], // D5
        [440.00],         // A4
        [392.00, 196.00], // G4
        [440.00],         // A4
        [523.25, 329.63], // C5
        [698.46, 349.23], // F5
      ],
    };

    if (trackKey.includes('La Vie') || trackKey.includes('nhạc') || trackKey.includes('Huế')) {
      return melodies.musicbox;
    }
    if (trackKey.includes('ngoại') || trackKey.includes('Đà Lạt')) {
      return melodies.dalat;
    }
    return melodies.school;
  }

  playNote(freqs) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Warm bell/music-box timbre using sine + triangle
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const noteVol = (idx === 0 ? 0.18 : 0.08) * this.volume;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.002, noteVol), now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.45);
    });
  }

  start(trackId, title = '', onTick) {
    this.stop();
    this.initContext();
    this.isPlaying = true;
    this.currentTrackId = trackId;
    this.stepIndex = 0;

    const melody = this.getMelody(title);

    // Play first note immediately
    this.playNote(melody[0]);
    this.stepIndex = 1;

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;
      const chord = melody[this.stepIndex % melody.length];
      this.playNote(chord);
      this.stepIndex += 1;
      if (onTick) onTick();
    }, 520);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  stop() {
    this.isPlaying = false;
    this.currentTrackId = null;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const soundEngine = new NostalgicSoundEngine();
