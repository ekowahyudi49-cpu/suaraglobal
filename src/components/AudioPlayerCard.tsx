import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  Repeat,
  Sparkles,
  Music2,
  FileAudio,
} from 'lucide-react';
import { VoicePreset } from '../data/voices';
import { MoodOption, AccentOption } from '../data/presets';
import { Language } from '../data/languages';
import {
  createWavBlobFromBase64,
  createMp3BlobFromVoice,
  downloadBlob,
} from '../utils/audioEncoder';

export interface GeneratedVoiceItem {
  id: string;
  text: string;
  wavBase64: string;
  mp3Base64?: string;
  voicePreset: VoicePreset;
  mood: MoodOption;
  accent: AccentOption;
  language: Language;
  tempo: number;
  timestamp: number;
  duration?: number;
}

interface AudioPlayerCardProps {
  currentVoiceItem: GeneratedVoiceItem | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onAudioEnded: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({
  currentVoiceItem,
  isPlaying,
  onTogglePlay,
  onAudioEnded,
  audioRef,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isConvertingMp3, setIsConvertingMp3] = useState(false);

  // Sync audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (!isLooping) {
        onAudioEnded();
        setCurrentTime(0);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, isLooping, onAudioEnded]);

  // Adjust playback rate
  const handleChangeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Adjust Volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    if (audioRef.current) {
      audioRef.current.loop = next;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  // Format mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // Download Handlers
  const handleDownloadWav = () => {
    if (!currentVoiceItem) return;
    try {
      const blob = createWavBlobFromBase64(currentVoiceItem.wavBase64);
      const filename = `suaraglobal_${currentVoiceItem.voicePreset.id}_${Date.now()}.wav`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Download WAV error:', err);
    }
  };

  const handleDownloadMp3 = () => {
    if (!currentVoiceItem) return;
    setIsConvertingMp3(true);
    try {
      const mp3Blob = createMp3BlobFromVoice(
        currentVoiceItem.wavBase64,
        currentVoiceItem.mp3Base64
      );
      const filename = `suaraglobal_${currentVoiceItem.voicePreset.id}_${Date.now()}.mp3`;
      downloadBlob(mp3Blob, filename);
    } catch (err) {
      console.error('Download MP3 error:', err);
    } finally {
      setIsConvertingMp3(false);
    }
  };

  if (!currentVoiceItem) {
    return (
      <div className="bg-white/80 rounded-3xl p-8 border border-dashed border-slate-200 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
          <Music2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Pemutar Suara Siap
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Pilih karakter suara, ketik teks atau terjemahkan, lalu klik tombol "Generate Suara Sekarang" untuk mendengarkan dan mengunduh format WAV / MP3.
          </p>
        </div>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-linear-to-b from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-indigo-950 space-y-5 animate-in fade-in zoom-in-95 duration-200">
      {/* Audio Element Hidden */}
      <audio
        ref={audioRef}
        src={`data:audio/wav;base64,${currentVoiceItem.wavBase64}`}
        preload="auto"
      />

      {/* Top Bar: Character Info & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/15 shadow-inner">
            {currentVoiceItem.voicePreset.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg text-white">
                {currentVoiceItem.voicePreset.name}
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-medium">
                {currentVoiceItem.voicePreset.badge}
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
              <span>{currentVoiceItem.language.flag} {currentVoiceItem.language.name}</span>
              <span>•</span>
              <span>{currentVoiceItem.mood.icon} {currentVoiceItem.mood.name}</span>
              <span>•</span>
              <span>{currentVoiceItem.accent.flag} {currentVoiceItem.accent.name}</span>
            </p>
          </div>
        </div>

        {/* Audio Quality Tag */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Studio 24kHz HD
          </span>
        </div>
      </div>

      {/* Text Preview */}
      <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10">
        <p className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">
          Teks yang Diucapkan:
        </p>
        <p className="text-sm text-slate-100 italic leading-relaxed line-clamp-3">
          "{currentVoiceItem.text}"
        </p>
      </div>

      {/* Waveform Visualization Animation */}
      <div className="flex items-center justify-center gap-1 h-12 px-2 bg-black/20 rounded-2xl overflow-hidden">
        {Array.from({ length: 36 }).map((_, i) => {
          const isBarActive = (i / 36) * 100 <= progressPercent;
          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isBarActive
                  ? 'bg-linear-to-t from-indigo-400 to-sky-300'
                  : 'bg-white/20'
              }`}
              style={{
                height: isPlaying
                  ? `${Math.max(15, Math.sin((i + currentTime * 8) * 0.7) * 40 + 20)}%`
                  : `${Math.max(15, ((i % 5) + 1) * 14)}%`,
              }}
            />
          );
        })}
      </div>

      {/* Scrubber & Timers */}
      <div className="space-y-1.5">
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400"
        />
        <div className="flex justify-between text-xs text-slate-300 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls Bar: Play / Pause, Replay, Loop, Volume */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback & Loop Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Replay */}
          <button
            type="button"
            onClick={handleReplay}
            title="Putar Ulang dari Awal"
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            className="p-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Loop Toggle */}
          <button
            type="button"
            onClick={toggleLoop}
            title={isLooping ? 'Matikan putar berulang' : 'Putar berulang otomatis'}
            className={`p-2.5 rounded-2xl transition-colors ${
              isLooping
                ? 'bg-indigo-500/40 text-indigo-300 border border-indigo-400/40'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={toggleMute}
              className="text-slate-300 hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>

        {/* Live Playback Speed Picker */}
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10 text-xs">
          {[0.75, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleChangeRate(rate)}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                playbackRate === rate
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* DOWNLOAD SECTION (WAV & MP3) */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-white flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Pilihan Unduh Hasil Suara:
          </p>
          <p className="text-[11px] text-slate-400">
            Simpan audio bebas watermark untuk presentasi, video, atau edukasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Download WAV */}
          <button
            type="button"
            onClick={handleDownloadWav}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 shadow-xs hover:border-white/30 transition-all active:scale-98"
          >
            <FileAudio className="w-4 h-4 text-sky-400" />
            <span>Unduh .WAV</span>
            <span className="text-[10px] text-sky-300 font-mono opacity-80">(Lossless)</span>
          </button>

          {/* Download MP3 */}
          <button
            type="button"
            onClick={handleDownloadMp3}
            disabled={isConvertingMp3}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all active:scale-98 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isConvertingMp3 ? 'Mengonversi...' : 'Unduh .MP3'}</span>
            <span className="text-[10px] text-emerald-200 font-mono opacity-90">(Kecil)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
