import React, { useState } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Volume2,
  ChevronDown,
} from 'lucide-react';
import { Language } from '../data/languages';

interface TextAndTranslationSectionProps {
  inputText: string;
  onChangeInputText: (text: string) => void;
  selectedLanguage: Language;
  onOpenLanguageModal: () => void;
  onTranslate: () => Promise<void>;
  isTranslating: boolean;
  translationResult: {
    translatedText: string;
    detectedSourceLanguage?: string;
    targetLanguage?: string;
    romanization?: string;
    notes?: string;
  } | null;
  onUseTranslationForSpeech: () => void;
  onGenerateSpeech: () => void;
  isGeneratingSpeech: boolean;
}

export const TextAndTranslationSection: React.FC<TextAndTranslationSectionProps> = ({
  inputText,
  onChangeInputText,
  selectedLanguage,
  onOpenLanguageModal,
  onTranslate,
  isTranslating,
  translationResult,
  onUseTranslationForSpeech,
  onGenerateSpeech,
  isGeneratingSpeech,
}) => {
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    {
      title: 'Petualangan Anak',
      text: 'Halo teman-teman! Hari ini matahari bersinar cerah sekali. Ayo kita berpetualang ke hutan ajaib mencari buah pelangi!',
    },
    {
      title: 'Boneka Beruang',
      text: 'Horeee! Aku boneka beruang lucumu! Jangan lupa ya, peluk aku sebelum tidur agar mimpimu indah penuh bintang!',
    },
    {
      title: 'Salam Multibahasa',
      text: 'Selamat pagi dunia! Semoga hari ini membawa banyak kegembiraan, senyuman, dan kebaikan untuk kita semua.',
    },
  ];

  const handleCopyTranslation = () => {
    if (!translationResult?.translatedText) return;
    navigator.clipboard.writeText(translationResult.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      {/* Step Header & Language Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-bold">
            2
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Teks & Pilihan Bahasa
          </h2>
        </div>

        {/* Selected Language Selector Button */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Bahasa Suara / Target:
          </span>
          <button
            type="button"
            onClick={onOpenLanguageModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-900 border border-indigo-200/80 text-xs sm:text-sm font-bold transition-all shadow-2xs hover:shadow-xs"
          >
            <span className="text-lg leading-none">{selectedLanguage.flag}</span>
            <span>{selectedLanguage.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-indigo-600" />
          </button>
        </div>
      </div>

      {/* Text Area Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <label className="font-semibold text-slate-700">
            Ketik atau tempel teks Anda:
          </label>
          <div className="flex items-center gap-3">
            <span>{inputText.length} karakter</span>
            {inputText && (
              <button
                type="button"
                onClick={() => onChangeInputText('')}
                className="text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Hapus
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => onChangeInputText(e.target.value)}
            placeholder="Tuliskan kata atau kalimat apa pun di sini dalam bahasa apa pun... (Contoh: cerita dongeng, percakapan, salam, atau materi pelajaran)"
            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm sm:text-base leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Contoh:
          </span>
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeInputText(sp.text)}
              className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-medium transition-colors"
            >
              {sp.title}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons: Terjemahkan & Buat Suara */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Instant Translation Trigger */}
        <button
          type="button"
          onClick={onTranslate}
          disabled={!inputText.trim() || isTranslating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200/90 text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-200/60"
        >
          <Languages className="w-4 h-4 text-indigo-600" />
          <span>{isTranslating ? 'Menerjemahkan...' : `Terjemahkan ke ${selectedLanguage.name}`}</span>
        </button>

        {/* Primary Generate Voice Button */}
        <button
          type="button"
          onClick={onGenerateSpeech}
          disabled={!inputText.trim() || isGeneratingSpeech}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm sm:text-base font-bold text-white bg-linear-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-700 hover:to-sky-600 shadow-md shadow-indigo-500/25 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Volume2 className="w-5 h-5" />
          <span>{isGeneratingSpeech ? 'Memproses Suara AI...' : 'Generate Suara Sekarang'}</span>
        </button>
      </div>

      {/* Translation Result Panel (if generated) */}
      {translationResult && (
        <div className="mt-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Terjemahan Akurat ({selectedLanguage.name}):
              </span>
              {translationResult.detectedSourceLanguage && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-indigo-700 border border-indigo-200">
                  Asal: {translationResult.detectedSourceLanguage}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyTranslation}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-800 text-xs font-medium border border-indigo-200/80 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          <p className="text-sm sm:text-base font-medium text-indigo-950 leading-relaxed bg-white/70 p-3 rounded-xl border border-indigo-100/80">
            {translationResult.translatedText}
          </p>

          {/* Romanization / Reading guide for foreign characters */}
          {translationResult.romanization && (
            <div className="text-xs text-indigo-800/90 bg-indigo-100/50 p-2.5 rounded-xl border border-indigo-200/50 font-sans">
              <span className="font-bold text-indigo-900 block mb-0.5">
                Cara Baca / Transliterasi Latin:
              </span>
              <p className="italic">{translationResult.romanization}</p>
            </div>
          )}

          {translationResult.notes && (
            <p className="text-[11px] text-slate-500 italic">
              💡 {translationResult.notes}
            </p>
          )}

          <div className="pt-1 flex items-center justify-end">
            <button
              type="button"
              onClick={onUseTranslationForSpeech}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" />
              Gunakan hasil terjemahan ini sebagai teks suara
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
