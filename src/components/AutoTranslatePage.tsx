import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRightLeft,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Mic,
  MicOff,
  Globe2,
  ChevronDown,
  Download,
  Share2,
  BookOpen,
  ArrowRight,
  Sliders,
  FileAudio,
} from 'lucide-react';
import { WORLD_LANGUAGES, Language } from '../data/languages';
import { VOICE_PRESETS, VoicePreset } from '../data/voices';
import { speakWithWebSpeech, stopWebSpeech } from '../utils/speechFallback';
import { createWavBlobFromBase64, createMp3BlobFromVoice, downloadBlob } from '../utils/audioEncoder';

interface AutoTranslatePageProps {
  onOpenStudioWithText: (text: string, lang: Language, voicePreset?: VoicePreset) => void;
  onOpenLanguageModal: (isSource: boolean) => void;
  selectedSourceLang: Language | null; // null means "Deteksi Otomatis"
  selectedTargetLang: Language;
  onSelectSourceLang: (lang: Language | null) => void;
  onSelectTargetLang: (lang: Language) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLangName: string;
  targetLangName: string;
  targetLangFlag: string;
  romanization?: string;
  timestamp: number;
}

export const AutoTranslatePage: React.FC<AutoTranslatePageProps> = ({
  onOpenStudioWithText,
  onOpenLanguageModal,
  selectedSourceLang,
  selectedTargetLang,
  onSelectSourceLang,
  onSelectTargetLang,
  showToast,
}) => {
  const [sourceText, setSourceText] = useState(
    'Halo! Senang bisa menyapa teman-teman dari seluruh belahan dunia. Mari belajar bersama dengan riang gembira!'
  );
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLangName, setDetectedLangName] = useState('');
  const [detectedLangCode, setDetectedLangCode] = useState('');
  const [targetRomanization, setTargetRomanization] = useState('');
  const [sourceRomanization, setSourceRomanization] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [formality, setFormality] = useState<string>('Netral');
  const [notes, setNotes] = useState<string>('');

  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Audio preview state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingTarget, setPlayingTarget] = useState<'source' | 'target' | null>(null);
  const [selectedVoiceForTranslation, setSelectedVoiceForTranslation] = useState<VoicePreset>(VOICE_PRESETS[0]); // Anak Laki-Laki
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);

  // History state
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);

  const recognitionRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef<number>(0);

  // Popular languages for quick tabs
  const popularSourceLangs = [
    null, // Auto
    WORLD_LANGUAGES.find((l) => l.code === 'id')!,
    WORLD_LANGUAGES.find((l) => l.code === 'en-US')!,
    WORLD_LANGUAGES.find((l) => l.code === 'ar')!,
    WORLD_LANGUAGES.find((l) => l.code === 'ja')!,
    WORLD_LANGUAGES.find((l) => l.code === 'zh-CN')!,
    WORLD_LANGUAGES.find((l) => l.code === 'jv')!,
  ].filter(Boolean) as (Language | null)[];

  const popularTargetLangs = [
    WORLD_LANGUAGES.find((l) => l.code === 'en-US')!,
    WORLD_LANGUAGES.find((l) => l.code === 'id')!,
    WORLD_LANGUAGES.find((l) => l.code === 'ja')!,
    WORLD_LANGUAGES.find((l) => l.code === 'ar')!,
    WORLD_LANGUAGES.find((l) => l.code === 'ko')!,
    WORLD_LANGUAGES.find((l) => l.code === 'zh-CN')!,
    WORLD_LANGUAGES.find((l) => l.code === 'es')!,
    WORLD_LANGUAGES.find((l) => l.code === 'jv')!,
    WORLD_LANGUAGES.find((l) => l.code === 'su')!,
  ].filter(Boolean);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('suaraglobal_trans_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, 10));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Save history
  const addHistoryItem = (item: TranslationHistoryItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((i) => i.sourceText !== item.sourceText || i.targetLangName !== item.targetLangName);
      const updated = [item, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('suaraglobal_trans_history', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Perform Translation
  const executeTranslation = async (
    textToTranslate: string,
    targetLang: Language,
    sourceLang: Language | null,
    isRetry = false
  ) => {
    if (!textToTranslate.trim()) {
      setTranslatedText('');
      setTargetRomanization('');
      setSourceRomanization('');
      setAlternatives([]);
      setNotes('');
      return;
    }

    const currentReqId = ++requestIdRef.current;
    setIsTranslating(true);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          targetLanguage: targetLang.name,
          sourceLanguage: sourceLang ? sourceLang.name : 'auto',
        }),
      });

      const data = await res.json();

      // If a newer request was dispatched while this was in-flight, ignore
      if (currentReqId !== requestIdRef.current) return;

      if (!res.ok || !data.success) {
        // If 503 high demand occurred and not retried yet, auto retry once after 1.5s
        if ((res.status === 503 || data.isTemporary) && !isRetry) {
          showToast('Permintaan AI tinggi sementara, mencoba kembali otomatis...', 'info');
          setTimeout(() => {
            if (currentReqId === requestIdRef.current) {
              executeTranslation(textToTranslate, targetLang, sourceLang, true);
            }
          }, 1500);
          return;
        }
        throw new Error(data.error || 'Gagal menerjemahkan teks.');
      }

      setTranslatedText(data.translatedText);
      setDetectedLangName(data.detectedSourceLanguage || '');
      setDetectedLangCode(data.detectedSourceLanguageCode || '');
      setTargetRomanization(data.romanization || '');
      setSourceRomanization(data.sourceRomanization || '');
      setAlternatives(data.alternatives || []);
      setFormality(data.formality || 'Netral');
      setNotes(data.notes || '');

      // Add to history
      addHistoryItem({
        id: `th_${Date.now()}`,
        sourceText: textToTranslate,
        translatedText: data.translatedText,
        sourceLangName: sourceLang ? sourceLang.name : (data.detectedSourceLanguage || 'Otomatis'),
        targetLangName: targetLang.name,
        targetLangFlag: targetLang.flag,
        romanization: data.romanization,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      if (currentReqId === requestIdRef.current) {
        console.warn('Translation notice:', err);
        showToast(err.message || 'Gagal menerjemahkan teks.', 'error');
      }
    } finally {
      if (currentReqId === requestIdRef.current) {
        setIsTranslating(false);
      }
    }
  };

  // Debounced auto-translate on text or language change
  useEffect(() => {
    if (!autoTranslateEnabled) return;
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (!sourceText.trim()) {
      setTranslatedText('');
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      executeTranslation(sourceText, selectedTargetLang, selectedSourceLang);
    }, 750);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [sourceText, selectedTargetLang, selectedSourceLang, autoTranslateEnabled]);

  // Initial translate
  useEffect(() => {
    if (sourceText.trim() && !translatedText) {
      executeTranslation(sourceText, selectedTargetLang, selectedSourceLang);
    }
  }, []);

  // Swap Source and Target Languages
  const handleSwapLanguages = () => {
    // If source is auto, we make the detected language or target language the new source
    let newSource: Language | null = null;
    if (selectedSourceLang) {
      newSource = selectedTargetLang;
      onSelectTargetLang(selectedSourceLang);
      onSelectSourceLang(newSource);
    } else {
      // Find language matching detected
      const matched = WORLD_LANGUAGES.find(
        (l) => l.name.toLowerCase() === detectedLangName.toLowerCase() || l.code === detectedLangCode
      );
      if (matched) {
        onSelectSourceLang(selectedTargetLang);
        onSelectTargetLang(matched);
      } else {
        onSelectSourceLang(selectedTargetLang);
        onSelectTargetLang(WORLD_LANGUAGES[0]); // default Indonesia
      }
    }

    // Also swap the texts if translatedText exists
    if (translatedText) {
      const prevSource = sourceText;
      setSourceText(translatedText);
      setTranslatedText(prevSource);
    }
    showToast('Bahasa asal dan sasaran ditukar!', 'info');
  };

  // Copy to clipboard
  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    showToast('Teks berhasil disalin!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Microphone / Speech Recognition for Dictation
  const handleToggleMic = () => {
    if (isListeningMic) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListeningMic(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Browser Anda belum mendukung input suara dikte.', 'error');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedSourceLang ? selectedSourceLang.code : 'id-ID';

      recognition.onstart = () => {
        setIsListeningMic(true);
        showToast('Mendengarkan... Silakan berbicara.', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setSourceText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error(e);
      showToast('Gagal memulai mikrofon: ' + e.message, 'error');
      setIsListeningMic(false);
    }
  };

  // Dual Voice Audio Playback: Play Source or Play Translation
  const handlePlayVoice = async (type: 'source' | 'target') => {
    const textToPlay = type === 'source' ? sourceText : translatedText;
    const lang = type === 'source' ? (selectedSourceLang || WORLD_LANGUAGES[0]) : selectedTargetLang;

    if (!textToPlay.trim()) {
      showToast('Tidak ada teks untuk diputar.', 'error');
      return;
    }

    if (isPlayingAudio && playingTarget === type) {
      stopWebSpeech();
      setIsPlayingAudio(false);
      setPlayingTarget(null);
      return;
    }

    stopWebSpeech();
    setIsGeneratingTts(true);
    setPlayingTarget(type);

    try {
      // Call Gemini TTS server API
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToPlay,
          languageName: lang.name,
          voiceName: selectedVoiceForTranslation.geminiVoice,
          stylePrompt: selectedVoiceForTranslation.stylePrompt,
          moodPrompt: 'Spoken naturally, clearly, and expressively.',
          accentPrompt: 'Clear native standard accent.',
          tempo: selectedVoiceForTranslation.defaultTempo || 1.0,
          personaId: selectedVoiceForTranslation.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.wavBase64) {
        throw new Error(data.error || 'Server TTS fallback required');
      }

      const audio = new Audio(`data:audio/wav;base64,${data.wavBase64}`);
      setIsPlayingAudio(true);
      audio.onended = () => {
        setIsPlayingAudio(false);
        setPlayingTarget(null);
      };
      await audio.play();
    } catch (e) {
      // Fallback to browser speech synthesis
      speakWithWebSpeech(textToPlay, {
        lang: lang.code,
        pitch: selectedVoiceForTranslation.pitch,
        rate: 1.0,
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => {
          setIsPlayingAudio(false);
          setPlayingTarget(null);
        },
        onError: () => {
          setIsPlayingAudio(false);
          setPlayingTarget(null);
        },
      });
    } finally {
      setIsGeneratingTts(false);
    }
  };

  // Download directly as WAV or MP3
  const handleQuickDownload = async (format: 'wav' | 'mp3') => {
    if (!translatedText.trim()) return;
    showToast(`Menyiapkan unduhan ${format.toUpperCase()}...`, 'info');

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: translatedText,
          languageName: selectedTargetLang.name,
          voiceName: selectedVoiceForTranslation.geminiVoice,
          stylePrompt: selectedVoiceForTranslation.stylePrompt,
          tempo: selectedVoiceForTranslation.defaultTempo || 1.0,
          personaId: selectedVoiceForTranslation.id,
        }),
      });
      const data = await res.json();
      if (!data.success || !data.wavBase64) {
        throw new Error(data.error || 'Gagal membuat file audio');
      }

      if (format === 'wav') {
        const blob = createWavBlobFromBase64(data.wavBase64);
        downloadBlob(blob, `terjemahan_${selectedTargetLang.code}_${Date.now()}.wav`);
      } else {
        const blob = createMp3BlobFromVoice(data.wavBase64, data.mp3Base64);
        downloadBlob(blob, `terjemahan_${selectedTargetLang.code}_${Date.now()}.mp3`);
      }
      showToast(`Berhasil mengunduh berkas .${format}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengunduh audio.', 'error');
    }
  };

  // Quick Daily Phrase Presets
  const dailyPhraseCategories = [
    {
      category: 'Salam & Sopan Santun',
      phrases: [
        'Selamat pagi! Semoga harimu menyenangkan.',
        'Terima kasih banyak atas bantuanmu!',
        'Sama-sama, dengan senang hati.',
        'Permisi, bolehkah saya bertanya sebentar?',
      ],
    },
    {
      category: 'Wisata & Jalan-Jalan',
      phrases: [
        'Di mana stasiun kereta terdekat?',
        'Berapa harga tiket untuk menuju ke sana?',
        'Tolong antarkan saya ke alamat ini.',
        'Apakah makanan ini halal dan lezat?',
      ],
    },
    {
      category: 'Anak & Cerita Seru',
      phrases: [
        'Horeee! Ayo kita bermain layang-layang di taman!',
        'Pada suatu hari, hiduplah seekor beruang kecil yang sangat cerdas.',
        'Lihat pelangi indah itu dengan tujuh warna cantiknya!',
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Hero */}
      <div className="rounded-3xl bg-linear-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 sm:p-7 text-white shadow-lg shadow-teal-600/15 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide">
              <Globe2 className="w-3.5 h-3.5 text-amber-300" />
              Halaman Terjemahan Otomatis Segala Bahasa
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Terjemahan Instan & Akurat dari Bahasa Apa Saja di Dunia
            </h2>
            <p className="text-xs sm:text-sm text-teal-50 leading-relaxed">
              Mendeteksi bahasa otomatis, menerjemahkan secara instan, dilengkapi panduan lafal Latin (fonetik), dikte suara, serta pembacaan suara karakter anak dan boneka.
            </p>
          </div>

          {/* Auto Translate Toggle Switch */}
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shrink-0 self-start md:self-auto">
            <div className="text-left">
              <p className="text-xs font-bold text-white">Terjemah Otomatis</p>
              <p className="text-[10px] text-teal-100">
                {autoTranslateEnabled ? 'Aktif saat mengetik' : 'Manual dengan tombol'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoTranslateEnabled(!autoTranslateEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                autoTranslateEnabled ? 'bg-emerald-400' : 'bg-white/30'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                  autoTranslateEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Language Selection Bar (Source ⇄ Target) */}
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Source Language Selector */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Bahasa Asal:</span>
              {detectedLangName && !selectedSourceLang && (
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Terdeteksi: {detectedLangName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => onSelectSourceLang(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedSourceLang === null
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/60'
                }`}
              >
                <Sparkles className="w-3 h-3 inline mr-1 text-amber-300" />
                Deteksi Otomatis
              </button>

              {popularSourceLangs.filter(Boolean).map((lang) => {
                const isSelected = selectedSourceLang?.code === lang!.code;
                return (
                  <button
                    key={lang!.code}
                    type="button"
                    onClick={() => onSelectSourceLang(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                    }`}
                  >
                    <span>{lang!.flag}</span> <span className="hidden sm:inline">{lang!.name}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => onOpenLanguageModal(true)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200/60 transition-colors flex items-center gap-1"
              >
                <span>Lainnya...</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Swap Languages Button */}
          <div className="flex items-center justify-center shrink-0 py-1 md:py-0">
            <button
              type="button"
              onClick={handleSwapLanguages}
              title="Tukar Bahasa Asal & Sasaran"
              className="p-3 rounded-2xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 border border-slate-200 transition-all hover:scale-105 active:scale-95 shadow-2xs"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Target Language Selector */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Bahasa Sasaran:</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {selectedTargetLang.flag} {selectedTargetLang.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {popularTargetLangs.slice(0, 5).map((lang) => {
                const isSelected = selectedTargetLang.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onSelectTargetLang(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                    }`}
                  >
                    <span>{lang.flag}</span> <span className="hidden sm:inline">{lang.name}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => onOpenLanguageModal(false)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-emerald-700 hover:bg-emerald-50 border border-emerald-200/60 transition-colors flex items-center gap-1"
              >
                <span>Pilih Semua (100+)...</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Bilingual Cards (Input & Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT CARD: Source Input */}
        <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {selectedSourceLang ? `${selectedSourceLang.flag} ${selectedSourceLang.name}` : 'Deteksi Otomatis'}
                </span>
                {detectedLangName && !selectedSourceLang && (
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full font-semibold">
                    {detectedLangName}
                  </span>
                )}
              </div>

              {/* Clear button */}
              {sourceText && (
                <button
                  type="button"
                  onClick={() => setSourceText('')}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  Hapus
                </button>
              )}
            </div>

            {/* Input Textarea */}
            <textarea
              rows={6}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Ketik, tempel kalimat, atau klik ikon mikrofon untuk berbicara dalam bahasa apa saja..."
              className="w-full text-slate-900 text-sm sm:text-base leading-relaxed p-2 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none placeholder:text-slate-400"
            />

            {/* Source Romanization Guide (if non-Latin source) */}
            {sourceRomanization && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-slate-700 block mb-0.5">Lafal Latin Teks Asal:</span>
                <p className="italic font-mono">{sourceRomanization}</p>
              </div>
            )}
          </div>

          {/* Bottom Bar: Mic, Listen, Char Counter, Manual Translate Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Mic Dictation */}
              <button
                type="button"
                onClick={handleToggleMic}
                title={isListeningMic ? 'Hentikan dikte suara' : 'Mulai bicara dengan mikrofon'}
                className={`p-2.5 rounded-2xl transition-all ${
                  isListeningMic
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Listen Source Audio */}
              <button
                type="button"
                onClick={() => handlePlayVoice('source')}
                disabled={!sourceText.trim() || isGeneratingTts}
                title="Dengarkan lafal teks asli"
                className={`p-2.5 rounded-2xl transition-all ${
                  isPlayingAudio && playingTarget === 'source'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Copy Source */}
              <button
                type="button"
                onClick={() => handleCopyText(sourceText)}
                title="Salin teks asal"
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                {sourceText.length} karakter
              </span>

              {!autoTranslateEnabled && (
                <button
                  type="button"
                  onClick={() => executeTranslation(sourceText, selectedTargetLang, selectedSourceLang)}
                  disabled={!sourceText.trim() || isTranslating}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  {isTranslating ? 'Menerjemahkan...' : 'Terjemahkan'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Live Translated Result */}
        <div className="bg-linear-to-b from-indigo-50/70 via-white to-white rounded-3xl p-5 border border-indigo-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Header: Target Language & Badges */}
            <div className="flex items-center justify-between border-b border-indigo-100/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedTargetLang.flag} {selectedTargetLang.name}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100/70 text-indigo-800">
                  Gaya: {formality}
                </span>
              </div>

              {isTranslating && (
                <span className="text-xs text-indigo-600 animate-pulse font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Memproses...
                </span>
              )}
            </div>

            {/* Translated Output */}
            <div className="min-h-[140px]">
              {translatedText ? (
                <p className="text-slate-900 text-base sm:text-lg font-medium leading-relaxed select-text">
                  {translatedText}
                </p>
              ) : (
                <p className="text-slate-400 text-sm italic">
                  {isTranslating
                    ? 'Sedang menerjemahkan secara akurat...'
                    : 'Hasil terjemahan akan otomatis muncul di sini...'}
                </p>
              )}
            </div>

            {/* Target Romanization / Latin Reading Guide */}
            {targetRomanization && (
              <div className="p-3 rounded-2xl bg-indigo-100/60 border border-indigo-200/70 text-xs text-indigo-900 space-y-0.5">
                <span className="font-bold flex items-center gap-1 text-[11px] text-indigo-800 uppercase tracking-wider">
                  <BookOpen className="w-3 h-3 text-indigo-600" />
                  Panduan Cara Baca Fonetik Latin:
                </span>
                <p className="font-medium italic leading-relaxed text-indigo-950">
                  {targetRomanization}
                </p>
              </div>
            )}

            {/* Alternative Phrases if available */}
            {alternatives.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Alternatif Lainnya:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {alternatives.map((alt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTranslatedText(alt)}
                      className="text-xs px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 border border-slate-200/80 transition-colors font-medium"
                    >
                      {alt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {notes && (
              <p className="text-[11px] text-slate-500 italic">
                💡 {notes}
              </p>
            )}
          </div>

          {/* Bottom Bar: Character Voice Selection & Audio Controls */}
          <div className="pt-3 border-t border-indigo-100 space-y-3">
            {/* Character Voice Picker for Translation Reading */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                Pilih Suara Pembaca:
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {VOICE_PRESETS.slice(0, 4).map((v) => {
                  const isChosen = selectedVoiceForTranslation.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVoiceForTranslation(v)}
                      className={`px-2 py-1 rounded-xl text-xs flex items-center gap-1 transition-all border ${
                        isChosen
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/70'
                      }`}
                      title={v.description}
                    >
                      <span>{v.icon}</span>
                      <span className="hidden sm:inline">{v.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: Play Translation, Download WAV/MP3, Open in Studio */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {/* Play Translated Voice */}
                <button
                  type="button"
                  onClick={() => handlePlayVoice('target')}
                  disabled={!translatedText.trim() || isGeneratingTts}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs ${
                    isPlayingAudio && playingTarget === 'target'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isPlayingAudio && playingTarget === 'target' ? 'Berhenti' : 'Putar Suara'}</span>
                </button>

                {/* Copy Translated Text */}
                <button
                  type="button"
                  onClick={() => handleCopyText(translatedText)}
                  title="Salin hasil terjemahan"
                  className="p-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                {/* Quick Download WAV */}
                <button
                  type="button"
                  onClick={() => handleQuickDownload('wav')}
                  disabled={!translatedText.trim()}
                  className="p-2 rounded-2xl bg-white hover:bg-sky-50 text-sky-700 border border-sky-200/60 transition-colors"
                  title="Unduh audio dalam format .WAV"
                >
                  <FileAudio className="w-4 h-4" />
                </button>

                {/* Quick Download MP3 */}
                <button
                  type="button"
                  onClick={() => handleQuickDownload('mp3')}
                  disabled={!translatedText.trim()}
                  className="p-2 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200/60 transition-colors"
                  title="Unduh audio dalam format .MP3"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Transfer to Voice Studio Button */}
              <button
                type="button"
                onClick={() =>
                  onOpenStudioWithText(
                    translatedText || sourceText,
                    selectedTargetLang,
                    selectedVoiceForTranslation
                  )
                }
                disabled={!translatedText.trim() && !sourceText.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all hover:scale-102"
              >
                <span>Buka di Studio Karakter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Common Phrases Showcase */}
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Contoh Percakapan Cepat (Klik untuk Terjemahkan & Dengarkan)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dailyPhraseCategories.map((cat, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
              <p className="text-xs font-bold text-indigo-900">{cat.category}</p>
              <div className="space-y-1.5">
                {cat.phrases.map((phrase, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setSourceText(phrase);
                      executeTranslation(phrase, selectedTargetLang, selectedSourceLang);
                    }}
                    className="w-full text-left text-xs p-2 rounded-xl bg-white hover:bg-indigo-50 hover:text-indigo-900 text-slate-700 border border-slate-200/60 transition-all"
                  >
                    "{phrase}"
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Translation History Section */}
      {history.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="font-bold text-slate-900 text-sm">
              Riwayat Terjemahan Terakhir ({history.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                setHistory([]);
                localStorage.removeItem('suaraglobal_trans_history');
                showToast('Riwayat terjemahan dibersihkan', 'info');
              }}
              className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
            >
              Hapus Riwayat
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {history.map((h) => (
              <div
                key={h.id}
                onClick={() => {
                  setSourceText(h.sourceText);
                  setTranslatedText(h.translatedText);
                  if (h.romanization) setTargetRomanization(h.romanization);
                }}
                className="py-2.5 px-3 rounded-2xl hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-slate-500">
                      {h.sourceLangName} → {h.targetLangFlag} {h.targetLangName}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium truncate">"{h.sourceText}"</p>
                  <p className="text-emerald-700 font-semibold truncate">→ "{h.translatedText}"</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyText(h.translatedText);
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0"
                  title="Salin"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
