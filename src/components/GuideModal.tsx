import React from 'react';
import { X, Sparkles, Volume2, Globe, Music, Download } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">
                Panduan & Fitur Aplikasi
              </h3>
              <p className="text-xs text-slate-500">
                Cara menggunakan SuaraGlobal dengan mudah untuk semua usia
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

        <div className="p-5 overflow-y-auto space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1">
            <h4 className="font-bold text-indigo-900 flex items-center gap-1.5 text-sm">
              <Globe className="w-4 h-4 text-indigo-600" />
              1. Seluruh Bahasa di Dunia
            </h4>
            <p className="text-indigo-950/80">
              Mendukung lebih dari 100 bahasa dunia, mulai dari Bahasa Indonesia, Jawa, Sunda, hingga Inggris, Arab, Jepang, Mandarin, dan Spanyol. Anda dapat menerjemahkan teks secara akurat dan langsung mendengarkan hasilnya.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 space-y-1">
            <h4 className="font-bold text-pink-900 flex items-center gap-1.5 text-sm">
              <Volume2 className="w-4 h-4 text-pink-600" />
              2. Karakter Suara Anak & Boneka
            </h4>
            <p className="text-pink-950/80">
              Tersedia preset khusus: <strong>Anak Laki-Laki 👦</strong> (lincah & penasaran), <strong>Anak Perempuan 👧</strong> (manis & ramah), <strong>Boneka Laki-Laki 🧸</strong> (jenaka ala kartun), dan <strong>Boneka Perempuan 🎀</strong> (imut menggemaskan). Klik <em>"Dengarkan Contoh"</em> pada kartu untuk mencoba secara instan!
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
              <Music className="w-4 h-4 text-amber-600" />
              3. Tempo, Suasana & Pilihan Aksen
            </h4>
            <p className="text-amber-950/80">
              Sesuaikan tempo bicara (0.5x hingga 2.0x), pilih suasana (Ceria, Hangat, Menenangkan/Dongeng, Misterius, Formal, dll.), dan pilih aksen (Indonesia, British, Amerika, Jepang, Arab, dll.) agar intonasi terdengar sangat ekspresif dan natural.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
              <Download className="w-4 h-4 text-emerald-600" />
              4. Pilihan Unduh WAV & MP3
            </h4>
            <p className="text-emerald-950/80">
              Unduh hasil audio dalam format <strong>.WAV</strong> (kualitas studio lossless 24kHz tanpa kompresi) atau <strong>.MP3</strong> (ukuran berkas kecil, praktis untuk dikirim via chat atau digunakan di video).
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs sm:text-sm hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Mengerti, Mulai Pakai!
          </button>
        </div>
      </div>
    </div>
  );
};
