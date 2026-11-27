import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  Upload,
  Camera,
  X,
  Check,
  Link2,
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { AVATAR_PRESETS } from '../data/mockData';

/**
 * Moclant Magnolia Brand Logo Component
 * Displays the official Moclant magnolia blossom logo image with refined framing.
 */
export function MoclantLogo({ size = 'md', showText = true, lightText = false, className = '' }) {
  const sizeClasses = {
    sm: 'w-9 h-9 rounded-xl',
    md: 'w-11 h-11 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-20 h-20 rounded-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`relative ${sizeClasses[size] || sizeClasses.md} bg-white border border-[#D6BD95] shadow-sm overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-[#C9A166]/25 group-hover:scale-105 transition-transform`}
      >
        <img
          src="/moclant-logo.jpg"
          alt="Moclant"
          className="w-full h-full object-contain p-0.5"
        />
      </div>
      {showText && (
        <span
          className={`font-serif text-lg sm:text-xl font-bold tracking-tight leading-tight ${
            lightText ? 'text-[#F6F2EB]' : 'text-[#606E5A]'
          }`}
        >
          Moclant
        </span>
      )}
    </div>
  );
}

export function SafeImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F6F2EB] via-[#EAE1D4] to-[#D6BD95]/40 text-[#606E5A] p-4 ${className}`}
      >
        <Sparkles className="w-7 h-7 opacity-60 mb-1 text-[#C9A166]" />
        <span className="text-xs font-medium opacity-80 text-center">{alt || 'Kỷ vật ký ức Moclant'}</span>
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
        cells.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#606E5A" />);
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      className="bg-white p-2 rounded-xl border border-[#D6BD95] shadow-sm"
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
    try {
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
    } catch (e) {
      console.warn('Audio play error:', e);
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
      } rounded-2xl bg-gradient-to-r from-[#F6F2EB] via-[#EAE1D4] to-[#F6F2EB] border border-[#D6BD95] shadow-inner flex items-center gap-3.5 transition-all`}
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
            ? 'bg-gradient-to-br from-[#C9A166] to-[#B38B50] text-white scale-105 ring-4 ring-[#C9A166]/25'
            : 'bg-gradient-to-br from-[#606E5A] to-[#4A5645] hover:from-[#C9A166] hover:to-[#B38B50] text-white'
        }`}
        title={playing ? 'Tạm dừng' : 'Phát giai điệu ký ức'}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
          <div className="font-semibold text-[#2C3329] truncate flex items-center gap-1.5">
            <Music className={`w-3.5 h-3.5 text-[#C9A166] shrink-0 ${playing ? 'animate-spin' : ''}`} />
            <span className="truncate">{audio?.title || 'Bản ghi âm kỷ niệm.mp3'}</span>
            {playing && (
              <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#C9A166]/20 text-[#606E5A]">
                Đang phát giai điệu
              </span>
            )}
          </div>
          <span className="text-[#748067] font-mono text-[11px] shrink-0">
            {formatSec(elapsed)} / {formatSec(durationSeconds)}
          </span>
        </div>

        {/* Clickable Seek Bar */}
        <div
          onClick={handleSeek}
          className="w-full h-2 bg-[#D6BD95]/60 rounded-full overflow-hidden cursor-pointer relative group"
          title="Bấm để tua thời gian"
        >
          <div
            className="h-full bg-gradient-to-r from-[#606E5A] via-[#748067] to-[#C9A166] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Equalizer animation when playing */}
      {playing && (
        <div className="hidden sm:flex items-end gap-0.5 h-5 px-1">
          <span className="w-1 h-4 bg-[#C9A166] rounded-full animate-wave-1" />
          <span className="w-1 h-5 bg-[#606E5A] rounded-full animate-wave-2" />
          <span className="w-1 h-3 bg-[#748067] rounded-full animate-wave-3" />
          <span className="w-1 h-5 bg-[#C9A166] rounded-full animate-wave-4" />
        </div>
      )}

      <button
        type="button"
        onClick={toggleMute}
        className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#D6BD95] flex items-center justify-center text-[#606E5A] shrink-0 transition-colors"
        title={muted ? 'Bật tiếng' : 'Tắt tiếng'}
      >
        {muted ? <VolumeX className="w-4 h-4 text-[#9B2C2C]" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function AvatarProfileModal({ user, onSaveProfile, onClose }) {
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || 'Yêu những mảnh ký ức bình dị.');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_PRESETS[0]);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setAvatar(customUrl.trim());
      setCustomUrl('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveProfile({
      name: name.trim(),
      bio: bio.trim(),
      phone: phone.trim(),
      avatar,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C3329]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-[#D6BD95] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F6F2EB] hover:bg-[#EAE1D4] flex items-center justify-center text-[#2C3329]"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-serif text-xl font-bold text-[#606E5A]">
          Đổi Ảnh Đại Diện & Hồ Sơ Cá Nhân
        </h3>
        <p className="text-xs text-[#748067] mt-0.5">
          Tải ảnh trực tiếp từ máy tính của bạn hoặc chọn từ bộ sưu tập chân dung hoài niệm Moclant.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Current Avatar Preview + Upload from PC */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#F6F2EB] border border-[#D6BD95]">
            <div className="relative group shrink-0">
              <SafeImage
                src={avatar}
                alt={name}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#C9A166] shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#606E5A] text-white flex items-center justify-center shadow hover:bg-[#4A5645]"
                title="Tải ảnh từ máy"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A166] hover:bg-[#B38B50] text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh đại diện từ máy tính</span>
              </button>
              <div className="text-[11px] text-[#748067]">
                Hỗ trợ JPG, PNG, WebP hoặc GIF trực tiếp từ thiết bị của bạn.
              </div>
            </div>
          </div>

          {/* Preset Avatars */}
          <div>
            <label className="block text-xs font-semibold text-[#606E5A] mb-2">
              Hoặc chọn nhanh ảnh đại diện mẫu:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {AVATAR_PRESETS.map((presetUrl, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setAvatar(presetUrl)}
                  className={`relative rounded-full overflow-hidden w-11 h-11 border-2 transition-all mx-auto ${
                    avatar === presetUrl
                      ? 'border-[#C9A166] scale-110 ring-2 ring-[#C9A166]/30'
                      : 'border-[#D6BD95] hover:border-[#606E5A]'
                  }`}
                >
                  <SafeImage
                    src={presetUrl}
                    alt={`Avatar ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Paste URL option */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Link2 className="w-3.5 h-3.5 text-[#748067] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Hoặc dán đường dẫn URL ảnh bất kỳ..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-xs focus:outline-none focus:border-[#606E5A]"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1.5 rounded-xl bg-[#F6F2EB] hover:bg-[#EAE1D4] border border-[#D6BD95] text-xs font-semibold text-[#606E5A]"
            >
              Áp dụng
            </button>
          </div>

          {/* Profile Info Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#D6BD95]">
            <div>
              <label className="block text-xs font-semibold text-[#2C3329] mb-1">
                Tên hiển thị *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-xs font-medium focus:outline-none focus:border-[#606E5A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2C3329] mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-xs font-medium focus:outline-none focus:border-[#606E5A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2C3329] mb-1">
              Châm ngôn / Giới thiệu ngắn dưới tên
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="VD: Sinh viên ĐH Ngoại Thương • Yêu những lá thư tay"
              className="w-full px-3.5 py-2 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-xs focus:outline-none focus:border-[#606E5A]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#D6BD95] text-xs font-semibold text-[#748067]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#606E5A] to-[#4A5645] hover:from-[#C9A166] hover:to-[#B38B50] text-white text-xs font-bold shadow"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Thay Đổi Hồ Sơ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
