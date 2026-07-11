/**
 * Web Audio API synthesizer for a beautiful, relaxing Tibetan Bell / Singing Bowl sound.
 * Requires zero external audio files and is 100% reliable across browsers.
 */
export function playTibetanBell() {
    if (typeof window === 'undefined') return;
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;
        
        // Harmonic frequencies of a tibetan bell (slightly detuned for acoustic depth)
        const frequencies = [150, 225, 337, 506, 759]; 
        
        frequencies.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            
            // Gain decreases for higher harmonics
            const initialGain = 0.25 / (idx + 1);
            gain.gain.setValueAtTime(initialGain, now);
            // Smooth exponential decay lasting 3.5 seconds
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + 3.5);
        });
    } catch (e) {
        console.error("Failed to play synthesized tibetan bell sound:", e);
    }
}
