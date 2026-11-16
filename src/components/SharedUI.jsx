import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export function SafeImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F3E9D8] via-[#EFE3CE] to-[#E6DEC8] text-[#7C4D2B] p-4 ${className}`}
      >
        <Sparkles className="w-7 h-7 opacity-60 mb-1" />
        <span className="text-xs font-medium opacity-75 text-center">{alt || 'Kỷ vật ký ức'}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export function QrCodeSvg({ value = 'MK-1024', size = 128 }) {
  const grid = 21;
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  const isFinder = (r, c) => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= grid - 7;
    const inBottomLeft = r >= grid - 7 && c < 7;
    return inTopLeft || inTopRight || inBottomLeft;
  };

  const finderCell = (r, c) => {
    const lr = r >= grid - 7 ? r - (grid - 7) : r;
    const lc = c >= grid - 7 ? c - (grid - 7) : c;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
    return false;
  };

  const cells = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      let filled = false;
      if (isFinder(r, c)) {
        filled = finderCell(r, c);
      } else {
        const seed = (hash ^ (r * 73856093) ^ (c * 19349663)) >>> 0;
        filled = seed % 3 !== 0;
      }
      if (filled) {
        cells.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#2C2523" />);
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      className="bg-white p-2 rounded-xl border border-[#E6DEC8] shadow-sm"
      shapeRendering="crispEdges"
    >
      {cells}
    </svg>
  );
}

export function AudioPlayer({ audio, trackId = 'track-default', compact = false }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const htmlAudioRef = useRef(null);

  const durationSeconds = audio?.durationSeconds || 95;

  useEffect(() => {
    return () => {
      if (soundEngine.currentTrackId === trackId) {
        soundEngine.stop();
      }
    };
  }, [trackId]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= durationSeconds) {
          setPlaying(false);
          soundEngine.stop();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, durationSeconds]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      if (audio?.blobUrl && htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      } else {
        soundEngine.stop();
      }
    } else {
      setPlaying(true);
      if (audio?.blobUrl && htmlAudioRef.current) {
        htmlAudioRef.current.play().catch(() => {
          soundEngine.start(trackId, audio?.title || '');
        });
      } else {
        soundEngine.start(trackId, audio?.title || '');
      }
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.setVolume(next ? 0 : 0.65);
    if (htmlAudioRef.current) {
      htmlAudioRef.current.muted = next;
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const nextSec = Math.floor(ratio * durationSeconds);
    setElapsed(nextSec);
    if (htmlAudioRef.current && audio?.blobUrl) {
      htmlAudioRef.current.currentTime = nextSec;
    }
  };

  const formatSec = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = Math.min(100, (elapsed / durationSeconds) * 100);

  return (
    <div
      className={`${
        compact ? 'p-3' : 'mt-3.5 p-3.5'
      } rounded-2xl bg-gradient-to-r from-[#FAF6F0] via-[#F7EFE4] to-[#FAF6F0] border border-[#E6DEC8] shadow-inner flex items-center gap-3.5 transition-all`}
    >
      {audio?.blobUrl && (
        <audio
          ref={htmlAudioRef}
          src={audio.blobUrl}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
      )}

      <button
        type="button"
        onClick={togglePlay}
        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md ${
          playing
            ? 'bg-gradient-to-br from-[#D96B43] to-[#B84A24] text-white scale-105 ring-4 ring-[#D96B43]/20'
            : 'bg-gradient-to-br from-[#7C4D2B] to-[#5A361C] hover:from-[#D96B43] hover:to-[#B84A24] text-white'
        }`}
        title={playing ? 'Tạm dừng' : 'Phát giai điệu ký ức'}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
          <div className="font-semibold text-[#2C2523] truncate flex items-center gap-1.5">
            <Music className={`w-3.5 h-3.5 text-[#D96B43] shrink-0 ${playing ? 'animate-spin' : ''}`} />
            <span className="truncate">{audio?.title || 'Bản ghi âm kỷ niệm.mp3'}</span>
            {playing && (
              <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#D96B43]/15 text-[#D96B43]">
                Đang phát giai điệu
              </span>
            )}
          </div>
          <span className="text-[#6E6259] font-mono text-[11px] shrink-0">
            {formatSec(elapsed)} / {formatSec(durationSeconds)}
          </span>
        </div>

        {/* Clickable Seek Bar */}
        <div
          onClick={handleSeek}
          className="w-full h-2 bg-[#E6DEC8]/80 rounded-full overflow-hidden cursor-pointer relative group"
          title="Bấm để tua thời gian"
        >
          <div
            className="h-full bg-gradient-to-r from-[#7C4D2B] via-[#D96B43] to-[#E5A93C] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Equalizer animation when playing */}
      {playing && (
        <div className="hidden sm:flex items-end gap-0.5 h-5 px-1">
          <span className="w-1 h-4 bg-[#D96B43] rounded-full animate-wave-1" />
          <span className="w-1 h-5 bg-[#E5A93C] rounded-full animate-wave-2" />
          <span className="w-1 h-3 bg-[#7C4D2B] rounded-full animate-wave-3" />
          <span className="w-1 h-5 bg-[#D96B43] rounded-full animate-wave-4" />
        </div>
      )}

      <button
        type="button"
        onClick={toggleMute}
        className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#E6DEC8] flex items-center justify-center text-[#7C4D2B] shrink-0 transition-colors"
        title={muted ? 'Bật tiếng' : 'Tắt tiếng'}
      >
        {muted ? <VolumeX className="w-4 h-4 text-[#9B2C2C]" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
