// Web Audio synthesizer for phone calls, ringtones, and message chimes

let audioCtx: AudioContext | null = null;
let ringtoneInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundEffects = {
  // Start incoming call ringtone (rhythmic melodic phone ring)
  startIncomingRingtone: () => {
    try {
      if (ringtoneInterval) return;
      const playTonePair = () => {
        try {
          const ctx = getAudioContext();
          const now = ctx.currentTime;
          
          // First pulse (440Hz + 480Hz classic telephone frequency pair)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(440, now);
          osc2.frequency.setValueAtTime(480, now);

          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.12, now + 0.05);
          gainNode.gain.setValueAtTime(0.12, now + 0.8);
          gainNode.gain.linearRampToValueAtTime(0, now + 0.9);

          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.9);
          osc2.stop(now + 0.9);

          // Second burst after 0.2s pause
          const now2 = now + 1.1;
          const osc3 = ctx.createOscillator();
          const osc4 = ctx.createOscillator();
          const gain2 = ctx.createGain();

          osc3.type = 'sine';
          osc4.type = 'sine';
          osc3.frequency.setValueAtTime(440, now2);
          osc4.frequency.setValueAtTime(480, now2);

          gain2.gain.setValueAtTime(0, now2);
          gain2.gain.linearRampToValueAtTime(0.12, now2 + 0.05);
          gain2.gain.setValueAtTime(0.12, now2 + 0.8);
          gain2.gain.linearRampToValueAtTime(0, now2 + 0.9);

          osc3.connect(gain2);
          osc4.connect(gain2);
          gain2.connect(ctx.destination);

          osc3.start(now2);
          osc4.start(now2);
          osc3.stop(now2 + 0.9);
          osc4.stop(now2 + 0.9);
        } catch {
          // Audio context might be restricted before user gesture
        }
      };

      playTonePair();
      ringtoneInterval = window.setInterval(playTonePair, 3500);
    } catch {
      // Ignore
    }
  },

  // Stop ringtone
  stopRingtone: () => {
    if (ringtoneInterval) {
      clearInterval(ringtoneInterval);
      ringtoneInterval = null;
    }
  },

  // Message sent pop
  playMessageSent: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.12);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Ignore
    }
  },

  // Call connected tone
  playCallConnected: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  },

  // Call ended tone
  playCallEnd: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  },

  // Disconnect alert tone (warning chirp)
  playDisconnectAlert: () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(260, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  },
};
