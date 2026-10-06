export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: 'Nusantara & Asia Tenggara' | 'Asia Timur & Selatan' | 'Timur Tengah' | 'Eropa' | 'Amerika' | 'Afrika & Lainnya';
  popular?: boolean;
}

export const WORLD_LANGUAGES: Language[] = [
  // Nusantara & Asia Tenggara
  { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Nusantara & Asia Tenggara', popular: true },
  { code: 'jv', name: 'Bahasa Jawa', nativeName: 'Basa Jawa', flag: '🇮🇩', region: 'Nusantara & Asia Tenggara', popular: true },
  { code: 'su', name: 'Bahasa Sunda', nativeName: 'Basa Sunda', flag: '🇮🇩', region: 'Nusantara & Asia Tenggara', popular: true },
  { code: 'ban', name: 'Bahasa Bali', nativeName: 'Basa Bali', flag: '🇮🇩', region: 'Nusantara & Asia Tenggara' },
  { code: 'ms', name: 'Bahasa Melayu', nativeName: 'Bahasa Melayu', flag: '🇲🇾', region: 'Nusantara & Asia Tenggara', popular: true },
  { code: 'th', name: 'Thailand', nativeName: 'ภาษาไทย', flag: '🇹🇭', region: 'Nusantara & Asia Tenggara' },
  { code: 'vi', name: 'Vietnam', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Nusantara & Asia Tenggara' },
  { code: 'fil', name: 'Filipina (Tagalog)', nativeName: 'Tagalog', flag: '🇵🇭', region: 'Nusantara & Asia Tenggara' },
  { code: 'my', name: 'Myanmar (Burma)', nativeName: 'ဗမာစာ', flag: '🇲🇲', region: 'Nusantara & Asia Tenggara' },
  { code: 'km', name: 'Kamboja (Khmer)', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭', region: 'Nusantara & Asia Tenggara' },
  { code: 'lo', name: 'Laos', nativeName: 'ພາສາລາວ', flag: '🇱🇦', region: 'Nusantara & Asia Tenggara' },

  // Asia Timur & Selatan
  { code: 'en-US', name: 'Inggris (Amerika)', nativeName: 'English (US)', flag: '🇺🇸', region: 'Amerika', popular: true },
  { code: 'en-GB', name: 'Inggris (British)', nativeName: 'English (UK)', flag: '🇬🇧', region: 'Eropa', popular: true },
  { code: 'zh-CN', name: 'Mandarin (Tiongkok)', nativeName: '中文 (简体)', flag: '🇨🇳', region: 'Asia Timur & Selatan', popular: true },
  { code: 'zh-TW', name: 'Mandarin (Tradisional)', nativeName: '中文 (繁體)', flag: '🇹🇼', region: 'Asia Timur & Selatan' },
  { code: 'ja', name: 'Jepang', nativeName: '日本語', flag: '🇯🇵', region: 'Asia Timur & Selatan', popular: true },
  { code: 'ko', name: 'Korea', nativeName: '한국어', flag: '🇰🇷', region: 'Asia Timur & Selatan', popular: true },
  { code: 'hi', name: 'Hindi (India)', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'Asia Timur & Selatan', popular: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', region: 'Asia Timur & Selatan' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'Asia Timur & Selatan' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'Asia Timur & Selatan' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', region: 'Asia Timur & Selatan' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', region: 'Asia Timur & Selatan' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', region: 'Asia Timur & Selatan' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', region: 'Asia Timur & Selatan' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰', region: 'Asia Timur & Selatan' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', region: 'Asia Timur & Selatan' },

  // Timur Tengah
  { code: 'ar', name: 'Arab Standar', nativeName: 'العربية', flag: '🇸🇦', region: 'Timur Tengah', popular: true },
  { code: 'fa', name: 'Persia (Farsi)', nativeName: 'فارسی', flag: '🇮🇷', region: 'Timur Tengah' },
  { code: 'tr', name: 'Turki', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Timur Tengah', popular: true },
  { code: 'he', name: 'Ibrani (Hebrew)', nativeName: 'עברית', flag: '🇮🇱', region: 'Timur Tengah' },
  { code: 'ku', name: 'Kurdi', nativeName: 'Kurdî', flag: '🇮🇶', region: 'Timur Tengah' },

  // Eropa
  { code: 'es', name: 'Spanyol', nativeName: 'Español', flag: '🇪🇸', region: 'Eropa', popular: true },
  { code: 'fr', name: 'Prancis', nativeName: 'Français', flag: '🇫🇷', region: 'Eropa', popular: true },
  { code: 'de', name: 'Jerman', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Eropa', popular: true },
  { code: 'it', name: 'Italia', nativeName: 'Italiano', flag: '🇮🇹', region: 'Eropa', popular: true },
  { code: 'pt', name: 'Portugis (Portugal)', nativeName: 'Português', flag: '🇵🇹', region: 'Eropa' },
  { code: 'pt-BR', name: 'Portugis (Brasil)', nativeName: 'Português (Brasil)', flag: '🇧🇷', region: 'Amerika', popular: true },
  { code: 'ru', name: 'Rusia', nativeName: 'Русский', flag: '🇷🇺', region: 'Eropa', popular: true },
  { code: 'nl', name: 'Belanda (Dutch)', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Eropa' },
  { code: 'pl', name: 'Polandia', nativeName: 'Polski', flag: '🇵🇱', region: 'Eropa' },
  { code: 'uk', name: 'Ukraina', nativeName: 'Українська', flag: '🇺🇦', region: 'Eropa' },
  { code: 'sv', name: 'Swedia', nativeName: 'Svenska', flag: '🇸🇪', region: 'Eropa' },
  { code: 'no', name: 'Norwegia', nativeName: 'Norsk', flag: '🇳🇴', region: 'Eropa' },
  { code: 'da', name: 'Denmark', nativeName: 'Dansk', flag: '🇩🇰', region: 'Eropa' },
  { code: 'fi', name: 'Finlandia', nativeName: 'Suomi', flag: '🇫🇮', region: 'Eropa' },
  { code: 'el', name: 'Yunani', nativeName: 'Ελληνικά', flag: '🇬🇷', region: 'Eropa' },
  { code: 'cs', name: 'Ceko', nativeName: 'Čeština', flag: '🇨🇿', region: 'Eropa' },
  { code: 'ro', name: 'Rumania', nativeName: 'Română', flag: '🇷🇴', region: 'Eropa' },
  { code: 'hu', name: 'Hungaria', nativeName: 'Magyar', flag: '🇭🇺', region: 'Eropa' },
  { code: 'bg', name: 'Bulgaria', nativeName: 'Български', flag: '🇧🇬', region: 'Eropa' },
  { code: 'hr', name: 'Kroasia', nativeName: 'Hrvatski', flag: '🇭🇷', region: 'Eropa' },
  { code: 'sr', name: 'Serbia', nativeName: 'Српски', flag: '🇷🇸', region: 'Eropa' },
  { code: 'sk', name: 'Slowakia', nativeName: 'Slovenčina', flag: '🇸🇰', region: 'Eropa' },
  { code: 'ga', name: 'Irlandia (Gaeilge)', nativeName: 'Gaeilge', flag: '🇮🇪', region: 'Eropa' },

  // Afrika & Lainnya
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', region: 'Afrika & Lainnya' },
  { code: 'am', name: 'Amharik', nativeName: 'አማርኛ', flag: '🇪🇹', region: 'Afrika & Lainnya' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', flag: '🇳🇬', region: 'Afrika & Lainnya' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', flag: '🇳🇬', region: 'Afrika & Lainnya' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', region: 'Afrika & Lainnya' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', region: 'Afrika & Lainnya' },
];
