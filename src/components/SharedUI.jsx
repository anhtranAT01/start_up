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

export function SafeImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

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
    <div className="fixed inset-0 z-50 bg-[#2C2523]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border-2 border-[#E6DEC8] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#E6DEC8] flex items-center justify-center text-[#2C2523]"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="font-serif text-xl font-bold text-[#2C2523]">
          Đổi Ảnh Đại Diện & Hồ Sơ Cá Nhân
        </h3>
        <p className="text-xs text-[#6E6259] mt-0.5">
          Tải ảnh trực tiếp từ máy tính của bạn hoặc chọn từ bộ sưu tập chân dung hoài niệm.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Current Avatar Preview + Upload from PC */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8]">
            <div className="relative group shrink-0">
              <SafeImage
                src={avatar}
                alt={name}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#E5A93C] shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#D96B43] text-white flex items-center justify-center shadow hover:bg-[#B84A24]"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D96B43] hover:bg-[#B84A24] text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh đại diện từ máy tính</span>
              </button>
              <div className="text-[11px] text-[#6E6259]">
                Hỗ trợ JPG, PNG, WebP hoặc GIF trực tiếp từ thiết bị của bạn.
              </div>
            </div>
          </div>

          {/* Preset Avatars */}
          <div>
            <label className="block text-xs font-semibold text-[#7C4D2B] mb-2">
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
                      ? 'border-[#D96B43] scale-110 ring-2 ring-[#D96B43]/30'
                      : 'border-[#E6DEC8] hover:border-[#7C4D2B]'
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
              <Link2 className="w-3.5 h-3.5 text-[#6E6259] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Hoặc dán đường dẫn URL ảnh bất kỳ..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-xs focus:outline-none focus:border-[#D96B43]"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#E6DEC8] border border-[#E6DEC8] text-xs font-semibold text-[#7C4D2B]"
            >
              Áp dụng
            </button>
          </div>

          {/* Profile Info Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E6DEC8]">
            <div>
              <label className="block text-xs font-semibold text-[#2C2523] mb-1">
                Tên hiển thị *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-xs font-medium focus:outline-none focus:border-[#D96B43]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#2C2523] mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-xs font-medium focus:outline-none focus:border-[#D96B43]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2C2523] mb-1">
              Châm ngôn / Giới thiệu ngắn dưới tên
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="VD: Sinh viên ĐH Ngoại Thương • Yêu những lá thư tay"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-xs focus:outline-none focus:border-[#D96B43]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#E6DEC8] text-xs font-semibold text-[#6E6259]"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#D96B43] to-[#B84A24] text-white text-xs font-bold shadow"
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
