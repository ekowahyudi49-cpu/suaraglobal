import React from 'react';
import { History, Play, Pause, Download, Trash2, Clock, FileAudio } from 'lucide-react';
import { GeneratedVoiceItem } from './AudioPlayerCard';
import {
  createWavBlobFromBase64,
  createMp3BlobFromVoice,
  downloadBlob,
} from '../utils/audioEncoder';

interface HistoryListProps {
  history: GeneratedVoiceItem[];
  currentPlayingId: string | null;
  isPlaying: boolean;
  onSelectVoiceItem: (item: GeneratedVoiceItem) => void;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  currentPlayingId,
  isPlaying,
  onSelectVoiceItem,
  onClearHistory,
  onRemoveItem,
}) => {
  if (history.length === 0) return null;

  const handleDownloadWav = (e: React.MouseEvent, item: GeneratedVoiceItem) => {
    e.stopPropagation();
    try {
      const blob = createWavBlobFromBase64(item.wavBase64);
      downloadBlob(blob, `suaraglobal_${item.voicePreset.id}_${item.id}.wav`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadMp3 = (e: React.MouseEvent, item: GeneratedVoiceItem) => {
    e.stopPropagation();
    try {
      const mp3Blob = createMp3BlobFromVoice(item.wavBase64, item.mp3Base64);
      downloadBlob(mp3Blob, `suaraglobal_${item.voicePreset.id}_${item.id}.mp3`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Riwayat Suara yang Dibuat ({history.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
        >
          Bersihkan Semua
        </button>
      </div>

      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
        {history.map((item) => {
          const isCurrent = currentPlayingId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectVoiceItem(item)}
              className={`p-3 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isCurrent
                  ? 'bg-indigo-50/70 border border-indigo-200/80'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                  {item.voicePreset.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {item.voicePreset.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {item.language.flag} {item.language.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.mood.icon} {item.tempo}x
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5 max-w-md">
                    "{item.text}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectVoiceItem(item);
                  }}
                  className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-2xs"
                  title="Putar Suara"
                >
                  {isCurrent && isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDownloadWav(e, item)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Unduh WAV"
                >
                  <FileAudio className="w-3.5 h-3.5 text-sky-600" />
                  <span className="hidden md:inline">WAV</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDownloadMp3(e, item)}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors border border-emerald-200/50"
                  title="Unduh MP3"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">MP3</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.id);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Hapus dari riwayat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
