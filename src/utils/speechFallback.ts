/**
 * Client-side Web Speech API helper as a resilient fallback
 * if external network or API keys encounter limits.
 */

export function speakWithWebSpeech(
  text: string,
  options: {
    lang?: string;
    pitch?: number;
    rate?: number;
    voiceNameHint?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    throw new Error('Web Speech API tidak didukung di browser ini.');
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = Math.max(0.5, Math.min(2.0, options.rate || 1.0));
  utterance.pitch = Math.max(0.5, Math.min(2.0, options.pitch || 1.0));

  if (options.lang) {
    utterance.lang = options.lang;
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Try to find matching language voice
    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith((options.lang || 'id').toLowerCase())) ||
      voices.find((v) => v.default) ||
      voices[0];
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopWebSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
