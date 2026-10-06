export interface MoodOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  instructionPrompt: string;
}

export interface AccentOption {
  id: string;
  name: string;
  flag: string;
  description: string;
  instructionPrompt: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'ceria',
    name: 'Ceria & Gembira',
    icon: '😄',
    description: 'Penuh tawa, nada riang, dan bersemangat',
    instructionPrompt: 'Spoken in a joyful, cheerful, smiling tone with upbeat, bright inflections and lighthearted warmth.',
  },
  {
    id: 'hangat',
    name: 'Hangat & Bersahabat',
    icon: '☕',
    description: 'Ramah, bersahabat, dan menenangkan hati',
    instructionPrompt: 'Spoken in a warm, welcoming, friendly tone with gentle cadence, comforting reassurance, and empathy.',
  },
  {
    id: 'menenangkan',
    name: 'Menenangkan / Dongeng',
    icon: '🌙',
    description: 'Lembut, santai, cocok untuk pengantar tidur',
    instructionPrompt: 'Spoken softly, gently, and serenely like a bedtime story, with slow calming breaths and a peaceful rhythm.',
  },
  {
    id: 'semangat',
    name: 'Bersemangat & Antusias',
    icon: '🔥',
    description: 'Penuh energi, menggelora, memotivasi',
    instructionPrompt: 'Spoken with dynamic excitement, energetic passion, inspiring punchiness, and active engagement.',
  },
  {
    id: 'formal',
    name: 'Formal & Profesional',
    icon: '👔',
    description: 'Jelas, berwibawa, artikulatif seperti pembawa berita',
    instructionPrompt: 'Spoken in a clear, measured, professional broadcast manner with crisp diction, confidence, and neutrality.',
  },
  {
    id: 'misterius',
    name: 'Misterius & Menegangkan',
    icon: '🕵️',
    description: 'Nuansa teka-teki, mendalam, dan dramatis',
    instructionPrompt: 'Spoken with dramatic suspense, lowered hushed undertones, deliberate pauses, and an intriguing mystery feel.',
  },
  {
    id: 'lucu',
    name: 'Lucu & Menggemaskan',
    icon: '🍭',
    description: 'Kocak, centil, dan menyenangkan untuk anak',
    instructionPrompt: 'Spoken with playful comedy, exaggerated bouncy pitch, cheerful squeaks, and child-delighting animated charm.',
  },
  {
    id: 'berbisik',
    name: 'Berbisik Halus',
    icon: '🤫',
    description: 'Bisikan lembut, rahasia, dan intimate',
    instructionPrompt: 'Spoken in a soft, gentle whisper with breathy intimate closeness and delicate volume.',
  },
];

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    id: 'standar',
    name: 'Netral & Alami',
    flag: '🌐',
    description: 'Pelafalan baku standar bahasa yang fasih dan alami',
    instructionPrompt: 'Pronounced in standard natural native clear accent without exaggerated regional traits.',
  },
  {
    id: 'indonesia',
    name: 'Aksen Indonesia',
    flag: '🇮🇩',
    description: 'Gaya bicara natural dengan intonasi khas bahasa Indonesia',
    instructionPrompt: 'Spoken with natural Indonesian phonology, warm vocalic rhythm, and clear open vowels.',
  },
  {
    id: 'british',
    name: 'Aksen British (UK)',
    flag: '🇬🇧',
    description: 'Gaya British klasik yang elegan dan artikulatif',
    instructionPrompt: 'Spoken with a distinguished Received Pronunciation (British English) accent, refined cadence, and non-rhotic elegance.',
  },
  {
    id: 'american',
    name: 'Aksen Amerika (US)',
    flag: '🇺🇸',
    description: 'Gaya Amerika modern yang kasual dan jelas',
    instructionPrompt: 'Spoken with standard General American English accent, clear rhotic consonants, and crisp modern flow.',
  },
  {
    id: 'australia',
    name: 'Aksen Australia',
    flag: '🇦🇺',
    description: 'Gaya santai khas Aussie dengan intonasi bersahabat',
    instructionPrompt: 'Spoken with friendly Australian accent intonation, relaxed vowels, and approachable Aussie warmth.',
  },
  {
    id: 'jepang',
    name: 'Nuansa Jepang',
    flag: '🇯🇵',
    description: 'Sentuhan intonasi halus dan sopan khas Jepang',
    instructionPrompt: 'Spoken with polite Japanese phonetic cadence, clean rhythmic timing, and gentle honorific nuance.',
  },
  {
    id: 'arab',
    name: 'Nuansa Arab',
    flag: '🇸🇦',
    description: 'Kefasihan makhraj huruf dan intonasi khas Timur Tengah',
    instructionPrompt: 'Spoken with authentic Arabic phonetic resonance, lyrical pacing, and warm Middle Eastern cadence.',
  },
  {
    id: 'prancis',
    name: 'Aksen Prancis',
    flag: '🇫🇷',
    description: 'Intonasi merdu dan romantis khas Prancis',
    instructionPrompt: 'Spoken with a charming French melodic cadence, soft lilt, and refined romantic pacing.',
  },
  {
    id: 'jerman',
    name: 'Aksen Jerman',
    flag: '🇩🇪',
    description: 'Artikulasi tegas, presisi, dan terstruktur',
    instructionPrompt: 'Spoken with precise, crisp German phonetic articulation and clear rhythmic precision.',
  },
  {
    id: 'spanyol',
    name: 'Aksen Spanyol',
    flag: '🇪🇸',
    description: 'Irama bersemangat dan ekspresif khas Hispanik',
    instructionPrompt: 'Spoken with vibrant, rhythmic Spanish lyrical phrasing, energetic cadence, and expressive flair.',
  },
];

export const TEMPO_OPTIONS = [
  { value: 0.5, label: '0.5x', name: 'Sangat Lambat', desc: 'Mengeja kata' },
  { value: 0.75, label: '0.75x', name: 'Perlahan', desc: 'Tenang & santai' },
  { value: 1.0, label: '1.0x', name: 'Normal', desc: 'Kecepatan alami' },
  { value: 1.25, label: '1.25x', name: 'Sedikit Cepat', desc: 'Lincah & dinamis' },
  { value: 1.5, label: '1.5x', name: 'Cepat', desc: 'Ringkas & gesit' },
  { value: 2.0, label: '2.0x', name: 'Kilat', desc: 'Super kilat' },
];
