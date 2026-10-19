/**
 * Cross-browser Web Speech API TTS wrapper supporting any language
 */

export function detectLanguage(text: string): string {
  if (!text) return 'en-US';
  
  // Japanese Hiragana / Katakana
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    return 'ja-JP';
  }
  // Korean Hangul
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) {
    return 'ko-KR';
  }
  // Russian / Cyrillic
  if (/[\u0400-\u04FF]/.test(text)) {
    return 'ru-RU';
  }
  // Chinese Hanzi (when no kana/hangul)
  if (/[\u4E00-\u9FFF]/.test(text)) {
    return 'zh-TW';
  }
  // Spanish accents / characters
  if (/[áéíóúüñ¿¡ÁÉÍÓÚÜÑ]/.test(text)) {
    return 'es-ES';
  }
  // French accents
  if (/[àâçéèêëîïôûùüÿœæÀÂÇÉÈÊËÎÏÔÛÙÜŸŒÆ]/.test(text)) {
    return 'fr-FR';
  }
  // German umlauts / eszett
  if (/[äöüßÄÖÜ]/.test(text)) {
    return 'de-DE';
  }
  // Default to English
  return 'en-US';
}

export class TTSService {
  private static instance: TTSService;
  private voices: SpeechSynthesisVoice[] = [];
  private isSupported: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isSupported = true;
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  public static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  private loadVoices() {
    if (!this.isSupported) return;
    this.voices = window.speechSynthesis.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.isSupported) {
      this.loadVoices();
    }
    return this.voices;
  }

  public cancel(): void {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
  }

  public speak(
    text: string,
    langCode: string = 'en-US',
    rate: number = 0.95
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isSupported) {
        console.warn('Speech synthesis not supported in this browser.');
        resolve(false);
        return;
      }

      // Cancel previous playback
      window.speechSynthesis.cancel();

      // Clean text of phonetic slashes or markup
      const cleanText = text.replace(/^[/["]+|[/]"]+$/g, '').trim();
      if (!cleanText) {
        resolve(false);
        return;
      }

      const effectiveLang = (!langCode || langCode === 'auto') 
        ? detectLanguage(cleanText) 
        : langCode;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.lang = effectiveLang;

      // Match voice
      const voices = this.getVoices();
      const exactVoice = voices.find(
        (v) => v.lang.toLowerCase() === effectiveLang.toLowerCase()
      );
      const prefixVoice = voices.find((v) =>
        v.lang.toLowerCase().startsWith(effectiveLang.slice(0, 2).toLowerCase())
      );

      if (exactVoice) {
        utterance.voice = exactVoice;
      } else if (prefixVoice) {
        utterance.voice = prefixVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = (e) => {
        // Interrupted is normal when user cancels or triggers quickly
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('TTS error:', e);
        }
        resolve(false);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Failed to trigger speech synthesis:', err);
        resolve(false);
      }
    });
  }
}

export const tts = TTSService.getInstance();
