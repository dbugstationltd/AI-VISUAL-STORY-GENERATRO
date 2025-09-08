/**
 * A service to handle Text-to-Speech functionality using the browser's SpeechSynthesis API.
 */

const CHARS_PER_SECOND_AT_1X_RATE = 12;

class TTSService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voiceReadyPromise: Promise<SpeechSynthesisVoice[]>;
  private resolveVoiceReady!: (voices: SpeechSynthesisVoice[]) => void;
  private rate: number = 1;
  private wasCancelled: boolean = false;

  constructor() {
    this.synth = window.speechSynthesis;
    this.voiceReadyPromise = new Promise(resolve => {
        this.resolveVoiceReady = resolve;
    });

    // Handle voices loading
    const loadVoices = () => {
        const loadedVoices = this.synth.getVoices();
        if (loadedVoices.length > 0) {
            this.handleVoicesChanged(loadedVoices);
        }
    };
    
    // Voices might be loaded already.
    loadVoices();
    // Or they might load asynchronously.
    this.synth.onvoiceschanged = loadVoices;
  }
  
  private handleVoicesChanged(voices: SpeechSynthesisVoice[]) {
      if (this.voices.length === 0 && voices.length > 0) {
          this.voices = voices;
          // Set a default voice (prefer a local, English one)
          this.selectedVoice = 
            this.voices.find(v => v.lang.startsWith('en') && v.localService) || 
            this.voices.find(v => v.lang.startsWith('en')) || 
            this.voices[0];
          this.resolveVoiceReady(this.voices);
      }
  }

  async getVoices(): Promise<SpeechSynthesisVoice[]> {
    return this.voiceReadyPromise;
  }
  
  async setVoice(voiceURI: string): Promise<void> {
      await this.voiceReadyPromise;
      const newVoice = this.voices.find(v => v.voiceURI === voiceURI);
      if (newVoice) {
          this.selectedVoice = newVoice;
      } else {
          console.error(`Voice not found for URI: ${voiceURI}`);
      }
  }

  getSelectedVoice(): SpeechSynthesisVoice | null {
      return this.selectedVoice;
  }

  setRate(rate: number) {
    // Clamp the rate to a reasonable range supported by most browsers
    this.rate = Math.max(0.1, Math.min(rate, 10));
  }
  
  /**
   * Estimates the duration required to speak a line of text.
   * @param text The text to be spoken.
   * @returns An estimated duration in milliseconds.
   */
  getEstimatedDuration(text: string): number {
    if (!text) return 2000;
    // Add a base duration for pauses and transitions
    const baseDuration = 1500;
    const estimatedSpeechTime = (text.length / (this.rate * CHARS_PER_SECOND_AT_1X_RATE)) * 1000;
    // Ensure the duration is at least a couple of seconds for a better feel
    return Math.max(2000, baseDuration + estimatedSpeechTime);
  }

  speak(text: string, onEnd: () => void) {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    if (text.trim() !== '') {
      this.wasCancelled = false; // Reset flag before speaking
      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.rate = this.rate;
      this.utterance.pitch = 1.1;
      if (this.selectedVoice) {
          this.utterance.voice = this.selectedVoice;
      }
      
      this.utterance.onend = () => {
        // Only trigger the callback if speech completed naturally, not via cancel()
        if (!this.wasCancelled) {
          onEnd();
        }
      };

      this.synth.speak(this.utterance);
    }
  }

  /**
   * Speaks a short preview text with a specific voice, canceling any current speech.
   * @param text The sample text to speak.
   * @param voiceURI The URI of the voice to use for the preview.
   */
  async speakPreview(text: string, voiceURI: string) {
    await this.voiceReadyPromise;
    const voiceToPreview = this.voices.find(v => v.voiceURI === voiceURI);
    if (!voiceToPreview) {
      console.error(`Preview voice not found for URI: ${voiceURI}`);
      return;
    }

    this.cancel(); // Stop any currently playing audio (story or other previews)
    
    const previewUtterance = new SpeechSynthesisUtterance(text);
    previewUtterance.voice = voiceToPreview;
    previewUtterance.rate = this.rate;
    previewUtterance.pitch = 1.1;
    
    this.synth.speak(previewUtterance);
  }

  pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  cancel() {
    if (this.synth) {
      this.wasCancelled = true; // Set flag before cancelling
      this.synth.cancel();
    }
  }
}

// Export a singleton instance of the service
export const ttsService = new TTSService();