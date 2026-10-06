import React from 'react';
import { Sliders, Sparkles, FastForward, Heart, Mic2 } from 'lucide-react';
import { MOOD_OPTIONS, ACCENT_OPTIONS, TEMPO_OPTIONS, MoodOption, AccentOption } from '../data/presets';

interface AudioSettingsProps {
  tempo: number;
  onChangeTempo: (val: number) => void;
  selectedMoodId: string;
  onSelectMood: (mood: MoodOption) => void;
  selectedAccentId: string;
  onSelectAccent: (accent: AccentOption) => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  tempo,
  onChangeTempo,
  selectedMoodId,
  onSelectMood,
  selectedAccentId,
  onSelectAccent,
}) => {
  const currentMood = MOOD_OPTIONS.find((m) => m.id === selectedMoodId) || MOOD_OPTIONS[0];
  const currentAccent = ACCENT_OPTIONS.find((a) => a.id === selectedAccentId) || ACCENT_OPTIONS[0];

  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-bold">
            3
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Ekspresi Suara: Tempo, Suasana & Aksen
          </h2>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Sesuaikan agar suara terdengar hidup dan natural
        </span>
      </div>

      {/* 1. Settingan Tempo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <FastForward className="w-4 h-4 text-indigo-600" />
            <span>Tempo & Kecepatan Bicara</span>
          </label>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
            {tempo.toFixed(2)}x
          </span>
        </div>

        {/* Slider */}
        <div className="px-1">
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={tempo}
            onChange={(e) => onChangeTempo(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
            <span>0.5x (Lambat)</span>
            <span>1.0x (Normal)</span>
            <span>1.5x (Cepat)</span>
            <span>2.0x (Kilat)</span>
          </div>
        </div>

        {/* Quick Tempo Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
          {TEMPO_OPTIONS.map((t) => {
            const isActive = Math.abs(tempo - t.value) < 0.05;
            return (
              <button
                type="button"
                key={t.value}
                onClick={() => onChangeTempo(t.value)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                }`}
              >
                <span>{t.label}</span>
                <span className="block text-[10px] opacity-75 font-normal truncate">
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Settingan Suasana / Mood */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-pink-500" />
            <span>Pilihan Suasana & Emosi</span>
          </label>
          <span className="text-xs text-slate-500 font-medium">
            {currentMood.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = selectedMoodId === mood.id;
            return (
              <button
                type="button"
                key={mood.id}
                onClick={() => onSelectMood(mood)}
                className={`p-2.5 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  isSelected
                    ? 'bg-pink-50/80 border-pink-400 text-pink-950 ring-1 ring-pink-400 shadow-xs'
                    : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/80 text-slate-700'
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{mood.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight">{mood.name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-1">
                    {mood.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Settingan Aksen */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Mic2 className="w-4 h-4 text-amber-500" />
            <span>Pilihan Aksen & Dialek</span>
          </label>
          <span className="text-xs text-slate-500 font-medium">
            {currentAccent.flag} {currentAccent.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ACCENT_OPTIONS.map((accent) => {
            const isSelected = selectedAccentId === accent.id;
            return (
              <button
                type="button"
                key={accent.id}
                onClick={() => onSelectAccent(accent)}
                className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-amber-50/80 border-amber-400 text-amber-950 ring-1 ring-amber-400 font-semibold'
                    : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/80 text-slate-700'
                }`}
              >
                <span className="text-lg shrink-0">{accent.flag}</span>
                <div className="min-w-0">
                  <p className="text-xs truncate">{accent.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
