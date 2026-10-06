export interface VoicePreset {
  id: string;
  name: string;
  category: 'anak' | 'boneka' | 'dewasa' | 'fantasi';
  gender: 'male' | 'female';
  icon: string;
  badge: string;
  color: string;
  description: string;
  geminiVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  stylePrompt: string;
  pitch: number; // playback pitch multiplier (0.5 to 2.0)
  defaultTempo: number;
  sampleText: {
    id: string;
    en: string;
  };
}

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'anak-laki',
    name: 'Anak Laki-Laki',
    category: 'anak',
    gender: 'male',
    icon: '👦',
    badge: 'Populer Anak',
    color: 'from-blue-500 to-sky-400',
    description: 'Suara anak laki-laki usia 8 tahun yang lincah, penasaran, dan penuh semangat petualangan.',
    geminiVoice: 'Puck',
    stylePrompt: 'A lively, curious 8-year-old young boy with high-spirited, enthusiastic intonation, youthful bright timbre, and playful bounce.',
    pitch: 1.15,
    defaultTempo: 1.05,
    sampleText: {
      id: 'Halo teman-teman! Lihat layang-layang buatanku yang terbang tinggi di langit. Ayo kita bermain bersama di taman!',
      en: 'Hello everyone! Look at my colorful kite flying so high in the blue sky. Come on, let us go play together!',
    },
  },
  {
    id: 'anak-perempuan',
    name: 'Anak Perempuan',
    category: 'anak',
    gender: 'female',
    icon: '👧',
    badge: 'Populer Anak',
    color: 'from-pink-500 to-rose-400',
    description: 'Suara manis, imut, dan ceria anak perempuan kecil, lembut, ramah, dan menggemaskan.',
    geminiVoice: 'Kore',
    stylePrompt: 'A sweet, innocent, cheerful 7-year-old little girl with an enthusiastic, bright, bubbly voice and gentle melodic intonation.',
    pitch: 1.2,
    defaultTempo: 1.0,
    sampleText: {
      id: 'Selamat pagi bintang kejora! Hari ini bungaku mekar warna merah muda yang sangat cantik. Siapa yang mau kupeluk erat?',
      en: 'Good morning little star! Today my pink flower is blooming so beautifully. Who wants a warm gentle hug?',
    },
  },
  {
    id: 'boneka-laki',
    name: 'Boneka Laki-Laki',
    category: 'boneka',
    gender: 'male',
    icon: '🧸',
    badge: 'Karakter Lucu',
    color: 'from-amber-500 to-orange-400',
    description: 'Suara boneka karakter laki-laki jenaka, melengking ceria, ekspresif dan penuh tawa ala kartun.',
    geminiVoice: 'Puck',
    stylePrompt: 'A squeaky, animated boy doll puppet character with cartoonish high energy, cheerful bounce, humorous charm, and theatrical inflections.',
    pitch: 1.35,
    defaultTempo: 1.15,
    sampleText: {
      id: 'Hahaha! Aku boneka beruang kayu ajaibmu! Putar kunci di punggungku dan kita akan terbang ke planet permen!',
      en: 'Hahaha! I am your magical toy puppet! Wind up the key on my back and let us zoom off to candy planet!',
    },
  },
  {
    id: 'boneka-perempuan',
    name: 'Boneka Perempuan',
    category: 'boneka',
    gender: 'female',
    icon: '🎀',
    badge: 'Karakter Imut',
    color: 'from-purple-500 to-fuchsia-400',
    description: 'Suara boneka pita perempuan yang imut melengking, manis, manja, dan sangat menggemaskan.',
    geminiVoice: 'Kore',
    stylePrompt: 'A cute, adorable girl plush doll puppet voice with squeaky, melodic, high-pitched whimsical charm, giggles, and playful warmth.',
    pitch: 1.38,
    defaultTempo: 1.1,
    sampleText: {
      id: 'Ting-ting! Aku boneka pita kesayanganmu! Jangan lupa teh manis untuk pesta boneka kita sore ini ya! Hihihi.',
      en: 'Ting-ting! I am your favorite ribbon dolly! Do not forget sweet tea for our doll tea party this afternoon! Teehee!',
    },
  },
  {
    id: 'wanita-ramah',
    name: 'Wanita Ramah & Alami',
    category: 'dewasa',
    gender: 'female',
    icon: '👩',
    badge: 'Narator',
    color: 'from-emerald-500 to-teal-400',
    description: 'Suara wanita dewasa yang hangat, tenang, artikulatif, dan sangat jelas untuk mendongeng atau edukasi.',
    geminiVoice: 'Zephyr',
    stylePrompt: 'Warm, articulate, pleasant and friendly adult female narrator with natural conversational cadence and clear pronunciation.',
    pitch: 1.0,
    defaultTempo: 1.0,
    sampleText: {
      id: 'Di sebuah desa di kaki gunung yang hijau, angin sepoi-sepoi membawa kehangatan dan kedamaian bagi semua penduduknya.',
      en: 'In a peaceful village at the foot of emerald hills, the gentle breeze carried warmth and serenity to everyone.',
    },
  },
  {
    id: 'pria-wibawa',
    name: 'Pria Narator Berwibawa',
    category: 'dewasa',
    gender: 'male',
    icon: '👨',
    badge: 'Narator',
    color: 'from-indigo-600 to-blue-500',
    description: 'Suara pria dewasa dengan timbre dalam, tenang, meyakinkan, cocok untuk dokumenter dan berita.',
    geminiVoice: 'Fenrir',
    stylePrompt: 'Deep, resonant, authoritative yet calm adult male documentary narrator with confident steady delivery.',
    pitch: 0.95,
    defaultTempo: 0.95,
    sampleText: {
      id: 'Alam semesta menyimpan misteri yang tak terhingga, membuka jendela pengetahuan bagi setiap insan yang terus mencari kebenaran.',
      en: 'The universe holds boundless mysteries, opening windows of discovery for those who endlessly seek knowledge.',
    },
  },
  {
    id: 'kakek-bijak',
    name: 'Kakek Pendongeng Bijak',
    category: 'dewasa',
    gender: 'male',
    icon: '👴',
    badge: 'Dongeng',
    color: 'from-stone-600 to-amber-700',
    description: 'Suara kakek tua yang bijaksana, penuh kasih sayang, lambat dan menentramkan seperti dongeng pengantar tidur.',
    geminiVoice: 'Charon',
    stylePrompt: 'A wise, gentle, elderly grandfather storyteller with deep warmth, comforting gravel, and soothing slow cadence.',
    pitch: 0.88,
    defaultTempo: 0.85,
    sampleText: {
      id: 'Duduklah di samping kakek, anakku. Kakek akan menceritakan kisah tentang pohon ajaib yang selalu membalas kebaikan hati.',
      en: 'Come sit beside me, my child. Let me tell you an old tale of a wondrous tree that rewarded kindness with golden light.',
    },
  },
  {
    id: 'robot-lucu',
    name: 'Robot Lucu Futuristik',
    category: 'fantasi',
    gender: 'male',
    icon: '🤖',
    badge: 'Karakter Sci-Fi',
    color: 'from-cyan-500 to-blue-600',
    description: 'Suara robot asisten ramah bernada ritmis, futuristik, dan ceria dengan modulasi mekanik manis.',
    geminiVoice: 'Zephyr',
    stylePrompt: 'A cute, friendly, slightly rhythmic futuristic companion robot with cheerful melodic beeps and clear robotic inflection.',
    pitch: 1.1,
    defaultTempo: 1.05,
    sampleText: {
      id: 'Bip-bop! Sistem siap beroperasi! Pesawat penjelajah waktu telah terisi energi penuh. Menghitung mundur: tiga, dua, satu, meluncur!',
      en: 'Beep-boop! Systems fully operational! Time capsule charged to one hundred percent. Countdown initiated: three, two, one, blast off!',
    },
  },
];
