/* =========================================================
   STUDENTVERSE — WEB AUDIO API SOUND ENGINE
   Procedural sound generator & ambient focus audio
========================================================= */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.ambientNode = null;
        this.ambientGain = null;
        this.currentAmbientType = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Play subtle UI click
    playClick() {
        if (this.muted) return;
        try {
            this.init();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.04);
        } catch (e) {}
    }

    // Play pleasant crystal chime for Pomodoro / Goal completion
    playChime() {
        if (this.muted) return;
        try {
            this.init();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + (i * 0.08));

                gain.gain.setValueAtTime(0, this.ctx.currentTime + (i * 0.08));
                gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + (i * 0.08) + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (i * 0.08) + 1.2);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(this.ctx.currentTime + (i * 0.08));
                osc.stop(this.ctx.currentTime + (i * 0.08) + 1.3);
            });
        } catch (e) {}
    }

    // Ambient Noise Generators
    playAmbient(type = 'rain') {
        this.init();
        this.stopAmbient();

        this.currentAmbientType = type;
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        if (type === 'rain') {
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
        } else if (type === 'space') {
            // Low deep space rumble drone
            for (let i = 0; i < bufferSize; i++) {
                output[i] = (Math.random() * 2 - 1) * 0.15;
            }
        } else {
            // White focus noise
            for (let i = 0; i < bufferSize; i++) {
                output[i] = (Math.random() * 2 - 1) * 0.2;
            }
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        if (type === 'rain') {
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(900, this.ctx.currentTime);
        } else if (type === 'space') {
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(220, this.ctx.currentTime);
        } else {
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        }

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        this.ambientGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.5);

        whiteNoise.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);

        whiteNoise.start();
        this.ambientNode = whiteNoise;
    }

    stopAmbient() {
        if (this.ambientNode && this.ambientGain) {
            try {
                this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
                setTimeout(() => {
                    if (this.ambientNode) {
                        this.ambientNode.stop();
                        this.ambientNode.disconnect();
                        this.ambientNode = null;
                    }
                }, 500);
            } catch (e) {
                this.ambientNode = null;
            }
        }
        this.currentAmbientType = null;
    }
}

window.SoundFX = new SoundEngine();
