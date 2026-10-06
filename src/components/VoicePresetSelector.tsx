import React from 'react';
import { Sparkles, Play, Check, Volume2 } from 'lucide-react';
import { VOICE_PRESETS, VoicePreset } from '../data/voices';

interface VoicePresetSelectorProps {
  selectedVoiceId: string;
  onSelectVoice: (preset: VoicePreset) => void;
  onQuickDemo: (preset: VoicePreset) => void;
  isGenerating?: boolean;
}

export const VoicePresetSelector: React.FC<VoicePresetSelectorProps> = ({
  selectedVoiceId,
  onSelectVoice,
  onQuickDemo,
  isGenerating,
}) => {
  // Separate into featured (Anak & Boneka) and other voices
  const featuredVoices = VOICE_PRESETS.filter(
    (v) => v.category === 'anak' || v.category === 'boneka'
  );
  const otherVoices = VOICE_PRESETS.filter(
    (v) => v.category !== 'anak' && v.category !== 'boneka'
  );

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-pink-100 text-pink-600 text-xs font-bold">
            1
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Pilih Karakter Suara
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-medium">
            Wajib Coba: Anak & Boneka
          </span>
        </div>
      </div>

      {/* Featured Characters: Anak & Boneka */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {featuredVoices.map((voice) => {
          const isSelected = selectedVoiceId === voice.id;
          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice)}
              className={`relative group rounded-2xl p-4 transition-all duration-200 cursor-pointer border text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-indigo-500 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                  : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Badge & Avatar Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                    {voice.icon}
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      voice.category === 'anak'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                        : 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/60'
                    }`}
                  >
                    {voice.badge}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {voice.name}
                  </h3>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {voice.description}
                </p>
              </div>

              {/* Quick Demo Button */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickDemo(voice);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors group/btn"
                >
                  <Play className="w-3 h-3 fill-current text-indigo-500 group-hover/btn:scale-110 transition-transform" />
                  <span>Dengarkan Contoh</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Other voices: Narator Dewasa & Kakek */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          Pilihan Suara Narator & Lainnya:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {otherVoices.map((voice) => {
            const isSelected = selectedVoiceId === voice.id;
            return (
              <button
                type="button"
                key={voice.id}
                onClick={() => onSelectVoice(voice)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-400 text-indigo-950 font-medium ring-1 ring-indigo-400'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xl shrink-0">{voice.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{voice.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{voice.badge}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
