import React from 'react';
import { Volume2, Globe2, Sparkles, HelpCircle, Type, Languages, Wand2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'translate' | 'studio';
  onChangeTab: (tab: 'translate' | 'studio') => void;
  largeText: boolean;
  onToggleLargeText: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  largeText,
  onToggleLargeText,
  onOpenGuide,
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Volume2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                  Suara<span className="text-indigo-600">Global</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Globe2 className="w-2.5 h-2.5" />
                  Auto-Translate
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Terjemahan Otomatis Segala Bahasa & Suara Karakter Ekspresif
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              type="button"
              onClick={onToggleLargeText}
              className="p-2 rounded-xl bg-slate-100 text-slate-700"
              title="Ubah Ukuran Teks"
            >
              <Type className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenGuide}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              title="Panduan"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center / Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-full md:w-auto">
          <button
            type="button"
            onClick={() => onChangeTab('translate')}
            className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'translate'
                ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-slate-200/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Languages className="w-4 h-4 text-indigo-600" />
            <span>Terjemahan Otomatis</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold hidden sm:inline">
              Baru
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTab('studio')}
            className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'studio'
                ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-slate-200/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wand2 className="w-4 h-4 text-indigo-600" />
            <span>Studio Suara & Karakter</span>
          </button>
        </div>

        {/* Desktop Actions / Accessibility */}
        <div className="hidden md:flex items-center gap-2">
          {/* Large text toggle for all ages */}
          <button
            type="button"
            onClick={onToggleLargeText}
            title={largeText ? 'Ganti ke teks normal' : 'Perbesar teks untuk kemudahan membaca'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              largeText
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Teks: {largeText ? 'Besar' : 'Normal'}</span>
          </button>

          {/* Quick Guide */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Panduan & Tips Pemakaian"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

