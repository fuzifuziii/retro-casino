let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
            audioCtx = new AudioCtxClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

const SOUND_PRESETS = {
    click(ctx, osc, gain, now) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        osc.start(now);
        osc.stop(now + 0.05);
    },
    win(ctx, osc, gain, now) {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(400, now + 0.08);
        osc.frequency.setValueAtTime(500, now + 0.16);
        osc.frequency.setValueAtTime(600, now + 0.24);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
    },
    lose(ctx, osc, gain, now) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    },
    gameover(ctx, osc, gain, now) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(140, now + 0.15);
        osc.frequency.setValueAtTime(100, now + 0.3);
        osc.frequency.linearRampToValueAtTime(30, now + 0.6);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
    },
    jack(ctx, osc, gain, now) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.2, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.9);

        // Second, "ringing" voice on top of the main jackpot tone.
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'square';
        const notes = [600, 800, 1000, 1200, 1000, 1400];
        notes.forEach((freq, i) => {
            osc2.frequency.setValueAtTime(freq, now + i * 0.08);
        });
        gain2.gain.setValueAtTime(0.05, now);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc2.start(now);
        osc2.stop(now + 0.7);
    },
};

/** Plays one of the named retro sounds: click, win, lose, gameover, jack. */
export function playSound(type) {
    try {
        const ctx = getAudioContext();
        const preset = ctx && SOUND_PRESETS[type];
        if (!preset) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        preset(ctx, osc, gain, now);
    } catch (e) {
        // Web Audio might be unavailable/blocked — silently ignore.
    }
}
