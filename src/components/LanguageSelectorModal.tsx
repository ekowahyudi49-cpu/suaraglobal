import React, { useState, useMemo } from 'react';
import { Search, X, Check, Globe } from 'lucide-react';
import { WORLD_LANGUAGES, Language } from '../data/languages';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguageCode: string;
  onSelectLanguage: (lang: Language) => void;
  title?: string;
  allowAutoDetect?: boolean;
  onSelectAuto?: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedLanguageCode,
  onSelectLanguage,
  title = 'Pilih Bahasa di Seluruh Dunia',
  allowAutoDetect = false,
  onSelectAuto,
}) => {
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState<string>('Semua');

  const regions = [
    'Semua',
    'Populer',
    'Nusantara & Asia Tenggara',
    'Asia Timur & Selatan',
    'Timur Tengah',
    'Eropa',
    'Amerika',
    'Afrika & Lainnya',
  ];

  const filteredLanguages = useMemo(() => {
    let list = WORLD_LANGUAGES;

    if (activeRegion === 'Populer') {
      list = list.filter((l) => l.popular);
    } else if (activeRegion !== 'Semua') {
      list = list.filter((l) => l.region === activeRegion);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.nativeName.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q)
      );
    }

    return list;
  }, [search, activeRegion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500">
                Pilih dari {WORLD_LANGUAGES.length}+ bahasa dunia untuk terjemahan atau suara
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama bahasa, negara, atau aksara... (cth: Jawa, Arab, Japanese)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none text-xs">
            {regions.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setActiveRegion(region)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                  activeRegion === region
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/80'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[50vh] space-y-2">
          {allowAutoDetect && onSelectAuto && (
            <button
              type="button"
              onClick={() => {
                onSelectAuto();
                onClose();
              }}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all ${
                selectedLanguageCode === 'auto'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold ring-1 ring-indigo-500'
                  : 'bg-linear-to-r from-indigo-50/70 to-sky-50/70 border-indigo-200/80 hover:border-indigo-400 text-indigo-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌐</span>
                <div>
                  <p className="text-xs font-bold">Deteksi Bahasa Otomatis</p>
                  <p className="text-[11px] text-slate-500">Mendeteksi dari seluruh bahasa di dunia secara cerdas</p>
                </div>
              </div>
              {selectedLanguageCode === 'auto' && (
                <Check className="w-4 h-4 text-indigo-600 shrink-0" />
              )}
            </button>
          )}

          {filteredLanguages.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium">Bahasa "{search}" tidak ditemukan.</p>
              <p className="text-xs mt-1">Coba gunakan kata kunci lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredLanguages.map((lang) => {
                const isSelected = selectedLanguageCode === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onSelectLanguage(lang);
                      onClose();
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 text-indigo-950 font-semibold ring-1 ring-indigo-500'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0 leading-none">{lang.flag}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">
                          {lang.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                          {lang.nativeName}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {filteredLanguages.length} bahasa</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
