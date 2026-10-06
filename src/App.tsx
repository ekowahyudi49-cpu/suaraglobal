import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { AutoTranslatePage } from './components/AutoTranslatePage';
import { VoicePresetSelector } from './components/VoicePresetSelector';
import { TextAndTranslationSection } from './components/TextAndTranslationSection';
import { AudioSettings } from './components/AudioSettings';
import { AudioPlayerCard, GeneratedVoiceItem } from './components/AudioPlayerCard';
import { HistoryList } from './components/HistoryList';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { GuideModal } from './components/GuideModal';
import { VOICE_PRESETS, VoicePreset } from './data/voices';
import { WORLD_LANGUAGES, Language } from './data/languages';
import { MOOD_OPTIONS, ACCENT_OPTIONS, MoodOption, AccentOption } from './data/presets';
import { speakWithWebSpeech, stopWebSpeech } from './utils/speechFallback';
import { AlertCircle, CheckCircle2, Sparkles, ArrowRight, Languages } from 'lucide-react';

export default function App() {
  // Navigation: 'translate' (Halaman Terjemahan Otomatis) vs 'studio' (Studio Suara & Karakter)
  const [activeTab, setActiveTab] = useState<'translate' | 'studio'>('translate');

  // Voice Presets
  const [selectedVoice, setSelectedVoice] = useState<VoicePreset>(VOICE_PRESETS[0]); // Anak Laki-Laki default
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(WORLD_LANGUAGES[0]); // Bahasa Indonesia
  const [tempo, setTempo] = useState<number>(1.0);
  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOOD_OPTIONS[0]); // Ceria
  const [selectedAccent, setSelectedAccent] = useState<AccentOption>(ACCENT_OPTIONS[1]); // Indonesia

  // Auto Translate Page Languages
  const [transSourceLang, setTransSourceLang] = useState<Language | null>(null); // null means Deteksi Otomatis
  const [transTargetLang, setTransTargetLang] = useState<Language>(
    WORLD_LANGUAGES.find((l) => l.code === 'en-US') || WORLD_LANGUAGES[1]
  );

  // Input & Translation State for Studio
  const [inputText, setInputText] = useState<string>(
    'Halo teman-teman! Selamat datang di SuaraGlobal. Ayo kita belajar dan mendengarkan suara ceria dari seluruh bahasa di dunia!'
  );
  const [translationResult, setTranslationResult] = useState<{
    translatedText: string;
    detectedSourceLanguage?: string;
    targetLanguage?: string;
    romanization?: string;
    notes?: string;
  } | null>(null);

  // Audio Playback & Generation State
  const [currentVoiceItem, setCurrentVoiceItem] = useState<GeneratedVoiceItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [history, setHistory] = useState<GeneratedVoiceItem[]>([]);

  // Modals & UI Preferences
  const [largeText, setLargeText] = useState<boolean>(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);
  const [langModalTarget, setLangModalTarget] = useState<'studio' | 'transSource' | 'transTarget'>('studio');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load history & preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedLarge = localStorage.getItem('suaraglobal_large_text');
      if (savedLarge === 'true') setLargeText(true);

      const savedHistory = localStorage.getItem('suaraglobal_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 15));
        }
      }
    } catch (err) {
      console.warn('Failed reading localStorage:', err);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (newItem: GeneratedVoiceItem) => {
    setHistory((prev) => {
      const updated = [newItem, ...prev.filter((i) => i.id !== newItem.id)].slice(0, 15);
      try {
        localStorage.setItem('suaraglobal_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage limit reached for history:', err);
      }
      return updated;
    });
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Toggle Large Text
  const handleToggleLargeText = () => {
    const next = !largeText;
    setLargeText(next);
    localStorage.setItem('suaraglobal_large_text', String(next));
  };

  // Select a Voice Preset
  const handleSelectVoice = (preset: VoicePreset) => {
    setSelectedVoice(preset);
    setTempo(preset.defaultTempo);
  };

  // Quick Demo Trigger
  const handleQuickDemo = async (preset: VoicePreset) => {
    setSelectedVoice(preset);
    setTempo(preset.defaultTempo);

    const sample =
      selectedLanguage.code === 'en-US' || selectedLanguage.code === 'en-GB'
        ? preset.sampleText.en
        : preset.sampleText.id;

    setInputText(sample);

    await generateSpeechInternal(
      sample,
      preset,
      selectedLanguage,
      preset.defaultTempo,
      selectedMood,
      selectedAccent
    );
  };

  // Translation Functionality (Studio Section)
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setTranslationResult(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: selectedLanguage.name,
          sourceLanguage: '',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menerjemahkan teks');
      }

      setTranslationResult({
        translatedText: data.translatedText,
        detectedSourceLanguage: data.detectedSourceLanguage,
        targetLanguage: data.targetLanguage,
        romanization: data.romanization,
        notes: data.notes,
      });

      showToast(`Berhasil diterjemahkan ke ${selectedLanguage.name}!`, 'success');
    } catch (err: any) {
      console.error('Translation error:', err);
      showToast(err.message || 'Gagal menerjemahkan teks.', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleUseTranslationForSpeech = () => {
    if (translationResult?.translatedText) {
      setInputText(translationResult.translatedText);
      showToast('Teks terjemahan kini digunakan sebagai naskah suara!', 'info');
    }
  };

  // Internal Speech Generation
  const generateSpeechInternal = async (
    textToSpeak: string,
    voice: VoicePreset,
    lang: Language,
    currentTempo: number,
    mood: MoodOption,
    accent: AccentOption
  ) => {
    if (!textToSpeak.trim()) {
      showToast('Silakan masukkan teks terlebih dahulu.', 'error');
      return;
    }

    setIsGenerating(true);
    stopWebSpeech();

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          languageName: lang.name,
          voiceName: voice.geminiVoice,
          stylePrompt: voice.stylePrompt,
          moodPrompt: mood.instructionPrompt,
          accentPrompt: accent.instructionPrompt,
          tempo: currentTempo,
          personaId: voice.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.wavBase64) {
        throw new Error(data.error || 'Gagal menghasilkan suara audio dari server.');
      }

      const newItem: GeneratedVoiceItem = {
        id: `${voice.id}_${Date.now()}`,
        text: textToSpeak,
        wavBase64: data.wavBase64,
        mp3Base64: data.mp3Base64 || undefined,
        voicePreset: voice,
        mood: mood,
        accent: accent,
        language: lang,
        tempo: currentTempo,
        timestamp: Date.now(),
      };

      setCurrentVoiceItem(newItem);
      saveToHistory(newItem);

      // Automatically play
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.playbackRate = currentTempo;
          audioRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch((e) => {
              console.warn('Audio play request notice:', e);
              setIsPlaying(false);
            });
        }
      }, 100);

      showToast(`Suara "${voice.name}" berhasil dibuat!`, 'success');
    } catch (serverErr: any) {
      console.warn('Server TTS error, attempting client speech fallback:', serverErr);

      try {
        speakWithWebSpeech(textToSpeak, {
          lang: lang.code,
          pitch: voice.pitch,
          rate: currentTempo,
          onStart: () => setIsPlaying(true),
          onEnd: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
        showToast(
          'Memutar melalui sintesis suara lokal browser (koneksi server terbatas).',
          'info'
        );
      } catch (clientErr: any) {
        showToast(serverErr.message || 'Gagal menghasilkan suara.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSpeech = async () => {
    await generateSpeechInternal(
      inputText,
      selectedVoice,
      selectedLanguage,
      tempo,
      selectedMood,
      selectedAccent
    );
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('Playback notice:', e);
          setIsPlaying(false);
        });
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleSelectHistoryItem = (item: GeneratedVoiceItem) => {
    setCurrentVoiceItem(item);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((e) => {
            console.warn(e);
            setIsPlaying(false);
          });
      }
    }, 50);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('suaraglobal_history');
    showToast('Riwayat suara telah dibersihkan.', 'info');
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      localStorage.setItem('suaraglobal_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Open Studio with Text from AutoTranslatePage
  const handleOpenStudioWithText = (
    text: string,
    lang: Language,
    presetVoice?: VoicePreset
  ) => {
    setInputText(text);
    setSelectedLanguage(lang);
    if (presetVoice) {
      setSelectedVoice(presetVoice);
      setTempo(presetVoice.defaultTempo);
    }
    setActiveTab('studio');
    showToast(`Naskah dimuat ke Studio Suara (${lang.name})!`, 'info');
  };

  return (
    <div className={`min-h-screen flex flex-col ${largeText ? 'text-base sm:text-lg' : 'text-sm'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-white text-xs sm:text-sm font-semibold ${
              toastMessage.type === 'error'
                ? 'bg-rose-600'
                : toastMessage.type === 'info'
                ? 'bg-sky-600'
                : 'bg-emerald-600'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header with Tab Navigation */}
      <Header
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        largeText={largeText}
        onToggleLargeText={handleToggleLargeText}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* VIEW 1: DEDICATED AUTO TRANSLATE PAGE */}
        {activeTab === 'translate' && (
          <AutoTranslatePage
            onOpenStudioWithText={handleOpenStudioWithText}
            selectedSourceLang={transSourceLang}
            selectedTargetLang={transTargetLang}
            onSelectSourceLang={setTransSourceLang}
            onSelectTargetLang={setTransTargetLang}
            onOpenLanguageModal={(isSource) => {
              setLangModalTarget(isSource ? 'transSource' : 'transTarget');
              setIsLangModalOpen(true);
            }}
            showToast={showToast}
          />
        )}

        {/* VIEW 2: VOICE STUDIO & CHARACTER SHOWCASE */}
        {activeTab === 'studio' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
            {/* Studio Hero Banner */}
            <div className="rounded-3xl bg-linear-to-r from-indigo-700 via-indigo-600 to-sky-600 p-6 sm:p-8 text-white shadow-lg shadow-indigo-600/15 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Studio Suara Karakter & Kustomisasi Ekspresi
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-sans">
                  Generate Suara Karakter Anak, Boneka & Narator Dunia
                </h2>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                  Pilih karakter favorit Anda, sesuaikan tempo (kecepatan), suasana emosi, aksen, dengarkan secara langsung, dan unduh berkas dalam format <strong>WAV & MP3</strong>.
                </p>
              </div>
            </div>

            {/* Quick Link to Auto Translate */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center justify-between gap-3 text-xs sm:text-sm text-indigo-900">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Ingin menerjemahkan teks dari bahasa apa saja secara otomatis?</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('translate')}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
              >
                <span>Buka Terjemahan Otomatis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* STEP 1: Voice Character Preset Showcase (Anak & Boneka Featured) */}
            <section>
              <VoicePresetSelector
                selectedVoiceId={selectedVoice.id}
                onSelectVoice={handleSelectVoice}
                onQuickDemo={handleQuickDemo}
                isGenerating={isGenerating}
              />
            </section>

            {/* STEP 2: Text Input & Translation Section */}
            <section>
              <TextAndTranslationSection
                inputText={inputText}
                onChangeInputText={setInputText}
                selectedLanguage={selectedLanguage}
                onOpenLanguageModal={() => {
                  setLangModalTarget('studio');
                  setIsLangModalOpen(true);
                }}
                onTranslate={handleTranslate}
                isTranslating={isTranslating}
                translationResult={translationResult}
                onUseTranslationForSpeech={handleUseTranslationForSpeech}
                onGenerateSpeech={handleGenerateSpeech}
                isGeneratingSpeech={isGenerating}
              />
            </section>

            {/* STEP 3: Audio Expression Settings (Tempo, Mood, Accent) */}
            <section>
              <AudioSettings
                tempo={tempo}
                onChangeTempo={setTempo}
                selectedMoodId={selectedMood.id}
                onSelectMood={setSelectedMood}
                selectedAccentId={selectedAccent.id}
                onSelectAccent={setSelectedAccent}
              />
            </section>

            {/* STEP 4: Audio Player & Download Options (WAV & MP3) */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 text-xs font-bold">
                  4
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Hasil Suara & Pilihan Unduh
                </h2>
              </div>
              <AudioPlayerCard
                currentVoiceItem={currentVoiceItem}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onAudioEnded={handleAudioEnded}
                audioRef={audioRef}
              />
            </section>

            {/* STEP 5: Saved History */}
            <section>
              <HistoryList
                history={history}
                currentPlayingId={currentVoiceItem?.id || null}
                isPlaying={isPlaying}
                onSelectVoiceItem={handleSelectHistoryItem}
                onClearHistory={handleClearHistory}
                onRemoveItem={handleRemoveHistoryItem}
              />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {new Date().getFullYear()} SuaraGlobal. Terjemahan Otomatis & Suara Bahasa Seluruh Dunia.
          </p>
          <div className="flex items-center gap-3 text-slate-600 font-medium">
            <span>Deteksi Otomatis</span>
            <span>•</span>
            <span>Anak & Boneka</span>
            <span>•</span>
            <span>Unduh WAV & MP3</span>
          </div>
        </div>
      </footer>

      {/* World Languages Modal */}
      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        selectedLanguageCode={
          langModalTarget === 'transSource'
            ? transSourceLang?.code || 'auto'
            : langModalTarget === 'transTarget'
            ? transTargetLang.code
            : selectedLanguage.code
        }
        allowAutoDetect={langModalTarget === 'transSource'}
        onSelectAuto={() => {
          setTransSourceLang(null);
          showToast('Bahasa asal diatur ke Deteksi Otomatis', 'info');
        }}
        onSelectLanguage={(lang) => {
          if (langModalTarget === 'transSource') {
            setTransSourceLang(lang);
            showToast(`Bahasa asal diatur ke: ${lang.name}`, 'info');
          } else if (langModalTarget === 'transTarget') {
            setTransTargetLang(lang);
            showToast(`Bahasa sasaran diatur ke: ${lang.name}`, 'info');
          } else {
            setSelectedLanguage(lang);
            showToast(`Bahasa studio diatur ke: ${lang.name}`, 'info');
          }
        }}
        title={
          langModalTarget === 'transSource'
            ? 'Pilih Bahasa Asal'
            : langModalTarget === 'transTarget'
            ? 'Pilih Bahasa Sasaran Terjemahan'
            : 'Pilih Bahasa Suara Studio'
        }
      />

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
