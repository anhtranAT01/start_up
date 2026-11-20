import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Mic,
  Link2,
  EyeOff,
  Globe,
  Lock,
  Hourglass,
  Flame,
  MessageCircle,
  BellRing,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  CalendarHeart,
  TrendingUp,
  Truck,
  X,
  Download,
  Crown,
  Upload,
  Camera,
  Users,
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/mockData';
import { SafeImage, QrCodeSvg, AudioPlayer } from './SharedUI';

const FILTER_TABS = [
  { id: 'all', label: 'Tất cả ký ức' },
  { id: 'physical', label: 'Có kỷ vật thật tại kho' },
  { id: 'future', label: 'Thư gửi tương lai' },
  { id: 'anonymous', label: 'Góc ẩn danh' },
  { id: 'trending', label: 'Đang thịnh hành' },
];

export default function ScreenFeed({
  user,
  onEditProfile,
  posts,
  setPosts,
  vaultItems,
  searchQuery,
  showToast,
  onNavigate,
}) {
  const [activeTab, setActiveTab] = useState('all');

  // Composer state
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [showBoxPicker, setShowBoxPicker] = useState(false);
  const [linkedBox, setLinkedBox] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [visibility, setVisibility] = useState('Công khai');

  const postImageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Comment state per post
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // Postcard QR modal state
  const [postcardPost, setPostcardPost] = useState(null);

  const handleUploadPostImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
        setShowImagePicker(false);
        showToast(`Đã tải ảnh "${file.name}" từ máy tính lên bài viết!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      } else {
        setRecordedAudio({
          title: `Ghi âm tâm sự của ${user.name}.mp3`,
          durationSeconds: 45,
        });
        showToast('Đã lưu bản thu âm kèm giai điệu nền vào bài viết!');
      }
    } else {
      setRecordedAudio(null);
      setIsRecording(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mr = new MediaRecorder(stream);
          chunksRef.current = [];
          mr.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };
          mr.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const blobUrl = URL.createObjectURL(blob);
            setRecordedAudio({
              title: `Giọng nói thu âm của ${user.name}.webm`,
              durationSeconds: 30,
              blobUrl,
            });
            stream.getTracks().forEach((t) => t.stop());
            showToast('Đã lưu bản ghi âm giọng nói thực tế của bạn!');
          };
          mediaRecorderRef.current = mr;
          mr.start();
        } catch {
          // Fallback to synthesized melody if microphone permission denied
        }
      }
    }
  };

  const handleCreatePost = () => {
    if (!content.trim() && !selectedImage) {
      showToast('Hãy viết vài dòng ký ức hoặc đính kèm bức ảnh trước khi đăng nhé!', 'error');
      return;
    }

    const newPost = {
      id: `post-${Date.now()}`,
      authorEmail: user.email,
      author: isAnonymous ? 'Người gửi ký ức ẩn danh' : user.name,
      authorRole: isAnonymous
        ? 'Góc tâm sự ẩn danh'
        : user.bio || `Thành viên ${user.tierName}`,
      avatar: isAnonymous ? '' : user.avatar,
      isAnonymous,
      visibility,
      createdAt: 'Vừa xong',
      memoryDate: 'Tháng 11, 2026',
      category: isAnonymous
        ? 'anonymous'
        : visibility === 'Khóa đến ngày kỷ niệm'
        ? 'future'
        : linkedBox
        ? 'physical'
        : 'all',
      isTrending: false,
      verifiedBox: linkedBox
        ? {
            id: linkedBox.id,
            label: `✓ Kỷ vật thật đang lưu tại ${
              linkedBox.location.split(' - ').slice(1, 3).join(' - ') || 'Kho Trung Tâm'
            } - Mã #${linkedBox.id}`,
          }
        : null,
      hashtags: ['#KyUcHomNay', isAnonymous ? '#GocAnDanh' : '#GoiGhemKhoanhKhac'],
      content: content.trim() || 'Một khoảnh khắc đáng nhớ được gói ghém tại Cửa Hàng Ký Ức.',
      image: selectedImage || '',
      audio: recordedAudio,
      candles: 0,
      candledByMe: false,
      comments: [],
    };

    setPosts((prev) => [newPost, ...(Array.isArray(prev) ? prev : [])]);
    setContent('');
    setSelectedImage('');
    setRecordedAudio(null);
    setLinkedBox(null);
    setIsAnonymous(false);
    setVisibility('Công khai');
    setShowImagePicker(false);
    setShowBoxPicker(false);
    showToast('Đã gói ghém và đăng tải ký ức của bạn lên bảng tin!');
  };

  const handleToggleCandle = (postId) => {
    setPosts((prev) =>
      (Array.isArray(prev) ? prev : []).map((p) => {
        if (p.id !== postId) return p;
        const next = !p.candledByMe;
        return {
          ...p,
          candledByMe: next,
          candles: next ? (p.candles || 0) + 1 : Math.max(0, (p.candles || 0) - 1),
        };
      })
    );
  };

  const handleAddComment = (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    setPosts((prev) =>
      (Array.isArray(prev) ? prev : []).map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...(Array.isArray(p.comments) ? p.comments : []),
                {
                  id: `c-${Date.now()}`,
                  author: user?.name || 'Thành viên',
                  text,
                  time: 'Vừa xong',
                },
              ],
            }
          : p
      )
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const safePosts = Array.isArray(posts) ? posts : [];
  const filteredPosts = safePosts.filter((p) => {
    if (!p) return false;
    if (
      p.visibility === 'Chỉ mình tôi' &&
      p.authorEmail !== user?.email &&
      user?.role !== 'admin'
    ) {
      return false;
    }

    const q = (searchQuery || '').trim().toLowerCase();
    const matchSearch =
      !q ||
      (p.content && p.content.toLowerCase().includes(q)) ||
      (p.author && p.author.toLowerCase().includes(q)) ||
      (Array.isArray(p.hashtags) && p.hashtags.some((h) => h.toLowerCase().includes(q))) ||
      (p.verifiedBox && p.verifiedBox.id && p.verifiedBox.id.toLowerCase().includes(q));

    if (!matchSearch) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'physical') return Boolean(p.verifiedBox);
    if (activeTab === 'future')
      return p.category === 'future' || p.visibility === 'Khóa đến ngày kỷ niệm';
    if (activeTab === 'anonymous') return Boolean(p.isAnonymous);
    if (activeTab === 'trending') return Boolean(p.isTrending) || (p.candles || 0) >= 150;
    return true;
  });

  const handleDownloadPostcard = (post) => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360"><rect width="100%" height="100%" fill="#FAF6F0"/><rect x="16" y="16" width="568" height="328" fill="none" stroke="#7C4D2B" stroke-width="2"/><text x="40" y="65" font-family="Georgia" font-size="24" fill="#7C4D2B">BƯU THIẾP KÝ ỨC — ${post.author}</text><text x="40" y="105" font-family="sans-serif" font-size="14" fill="#2C2523">${post.content.slice(0, 90).replace(/[<>&]/g, '')}...</text><text x="40" y="310" font-family="sans-serif" font-size="12" fill="#6E6259">Cửa Hàng Ký Ức • Gói ghém khoảnh khắc, Chạm để quay về</text></svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buu-thiep-ky-uc-${post.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã tải Bưu Thiếp QR về máy của bạn!');
  };

  return (
    <div className="space-y-6">
      {/* Boutique Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#5C361C] via-[#7C4D2B] to-[#965D36] text-[#FAF6F0] p-6 sm:p-7 shadow-warm-lg relative overflow-hidden border border-[#E5A93C]/30">
        <div className="absolute -right-12 -bottom-16 w-64 h-64 rounded-full bg-[#E5A93C]/15 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-[#E5A93C] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Không gian hoài niệm đồng bộ tài khoản: {user.name}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              Cộng đồng lưu giữ ký ức & kỷ vật thời gian
            </h1>
            <p className="text-xs sm:text-sm text-white/85 mt-1 max-w-2xl">
              Nơi hàng ngàn câu chuyện từ sinh viên, gia đình trẻ đến những di sản thế hệ được gói ghém và sẻ chia mỗi ngày.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onEditProfile}
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all"
            >
              <Camera className="w-4 h-4 text-[#E5A93C]" />
              <span>Đổi Avatar</span>
            </button>
            <button
              onClick={() => onNavigate('pickup')}
              className="px-4 py-3 rounded-2xl bg-[#D96B43] hover:bg-[#B84A24] text-white text-xs font-bold shadow-md transition-all"
            >
              + Đặt lịch gửi quà
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 70% Feed */}
        <div className="lg:col-span-8 space-y-5">
          {/* Composer Box */}
          <div className="bg-white border border-[#E6DEC8] rounded-2xl p-5 shadow-warm">
            <div className="flex items-start gap-3.5">
              {/* Clickable Avatar to change profile picture */}
              <button
                type="button"
                onClick={onEditProfile}
                className="relative group shrink-0"
                title="Bấm để đổi ảnh đại diện của bạn"
              >
                <SafeImage
                  src={isAnonymous ? '' : user.avatar}
                  alt={isAnonymous ? 'Ẩn danh' : user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#E5A93C] group-hover:opacity-85 transition-opacity"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#D96B43] text-white flex items-center justify-center shadow">
                  <Camera className="w-3 h-3" />
                </span>
              </button>

              <div className="flex-1 min-w-0">
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Hôm nay ${user.name} muốn gói ghém mảnh ký ức nào?`}
                  className="w-full bg-[#FAF6F0] border border-[#E6DEC8] rounded-xl p-3.5 text-sm text-[#2C2523] placeholder-[#6E6259]/75 focus:outline-none focus:ring-2 focus:ring-[#D96B43]/30 focus:border-[#D96B43] resize-none transition-all"
                />

                {/* Hidden File Input for direct PC upload */}
                <input
                  ref={postImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPostImage}
                  className="hidden"
                />

                {/* Attached Image Preview */}
                {selectedImage && (
                  <div className="mt-3 relative inline-block">
                    <SafeImage
                      src={selectedImage}
                      alt="Ảnh đính kèm"
                      className="max-h-48 w-auto rounded-xl border-2 border-[#D96B43]/40 shadow-sm object-cover"
                    />
                    <button
                      onClick={() => setSelectedImage('')}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#2C2523] text-white flex items-center justify-center shadow"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {isRecording && (
                  <div className="mt-3 p-3 rounded-xl bg-[#D96B43]/10 border border-[#D96B43]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#9B2C2C] animate-ping" />
                      <span className="text-xs font-semibold text-[#D96B43]">
                        Đang thu âm giọng nói của bạn...
                      </span>
                      <div className="flex items-center gap-1 h-5">
                        <span className="w-1 h-4 bg-[#D96B43] rounded-full animate-wave-1" />
                        <span className="w-1 h-5 bg-[#E5A93C] rounded-full animate-wave-2" />
                        <span className="w-1 h-3 bg-[#D96B43] rounded-full animate-wave-3" />
                        <span className="w-1 h-5 bg-[#7C4D2B] rounded-full animate-wave-4" />
                        <span className="w-1 h-4 bg-[#D96B43] rounded-full animate-wave-1" />
                      </div>
                    </div>
                    <button
                      onClick={handleToggleRecord}
                      className="px-3 py-1 rounded-full bg-[#9B2C2C] text-white text-xs font-semibold"
                    >
                      Hoàn tất thu âm
                    </button>
                  </div>
                )}

                {recordedAudio && !isRecording && (
                  <div className="mt-2">
                    <AudioPlayer audio={recordedAudio} trackId="composer-preview" compact />
                  </div>
                )}

                {linkedBox && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3B7A57]/10 border border-[#3B7A57]/30 text-xs font-semibold text-[#3B7A57]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      Đã liên kết hộp #{linkedBox.id} — {linkedBox.name}
                    </span>
                    <button onClick={() => setLinkedBox(null)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Image Upload & Sample Picker Drawer */}
                {showImagePicker && (
                  <div className="mt-3 p-4 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#7C4D2B]">
                        Đính kèm hình ảnh kỷ niệm vào bài viết:
                      </span>
                      <button
                        type="button"
                        onClick={() => postImageInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#D96B43] hover:bg-[#B84A24] text-white text-xs font-bold shadow-sm transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh từ máy tính của bạn</span>
                      </button>
                    </div>

                    {/* Paste custom image URL */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        placeholder="Hoặc dán đường dẫn URL ảnh (https://...)..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E6DEC8] text-xs focus:outline-none focus:border-[#D96B43]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customImageUrl.trim()) {
                            setSelectedImage(customImageUrl.trim());
                            setCustomImageUrl('');
                            setShowImagePicker(false);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#E6DEC8] hover:border-[#7C4D2B] text-xs font-semibold text-[#7C4D2B]"
                      >
                        Dùng URL
                      </button>
                    </div>

                    <div className="text-[11px] font-semibold text-[#6E6259]">
                      Hoặc chọn nhanh từ thư viện ảnh hoài niệm:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SAMPLE_IMAGES.map((img) => (
                        <button
                          type="button"
                          key={img.url}
                          onClick={() => {
                            setSelectedImage(img.url);
                            setShowImagePicker(false);
                          }}
                          className="group relative rounded-lg overflow-hidden border border-[#E6DEC8] hover:border-[#D96B43] text-left"
                        >
                          <SafeImage
                            src={img.url}
                            alt={img.label}
                            className="w-full h-16 object-cover"
                          />
                          <div className="text-[10px] p-1 bg-white/95 truncate text-[#2C2523]">
                            {img.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vault Box Picker Drawer */}
                {showBoxPicker && (
                  <div className="mt-3 p-3 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8]">
                    <div className="text-xs font-semibold text-[#7C4D2B] mb-2">
                      Chọn Hộp kỷ vật của {user.name} đang gửi tại Kho:
                    </div>
                    {vaultItems.length === 0 ? (
                      <div className="text-xs text-[#6E6259] py-2">
                        Tài khoản của bạn chưa có hộp kỷ vật nào tại kho. Hãy đặt lịch gửi quà trước nhé!
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {vaultItems.map((box) => (
                          <button
                            key={box.id}
                            onClick={() => {
                              setLinkedBox(box);
                              setShowBoxPicker(false);
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-[#E6DEC8] hover:border-[#3B7A57] text-left text-xs transition-colors"
                          >
                            <div>
                              <span className="font-bold text-[#7C4D2B]">#{box.id}</span> —{' '}
                              <span className="font-medium text-[#2C2523]">{box.name}</span>
                            </div>
                            <span className="text-[11px] text-[#3B7A57] font-semibold">
                              {box.statusLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Composer Toolbar */}
                <div className="mt-3 pt-3 border-t border-[#E6DEC8]/70 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImagePicker(!showImagePicker);
                        setShowBoxPicker(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6F0] hover:bg-[#F3E9D8] text-xs font-medium text-[#7C4D2B] border border-[#E6DEC8] transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#D96B43]" />
                      <span>Đính kèm Ảnh/Video</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleRecord}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isRecording
                          ? 'bg-[#9B2C2C] text-white border-[#9B2C2C]'
                          : 'bg-[#FAF6F0] hover:bg-[#F3E9D8] text-[#7C4D2B] border-[#E6DEC8]'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isRecording ? 'Đang thu âm...' : 'Thu âm giọng nói'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowBoxPicker(!showBoxPicker);
                        setShowImagePicker(false);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF6F0] hover:bg-[#F3E9D8] text-xs font-medium text-[#3B7A57] border border-[#E6DEC8] transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Liên kết Hộp kỷ vật ({vaultItems.length})</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 ml-auto">
                    {/* Anonymous Toggle */}
                    <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-xs text-[#6E6259]">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-[#E6DEC8] peer-checked:bg-[#7C4D2B] rounded-full relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-4" />
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Đăng ẩn danh</span>
                    </label>

                    {/* Visibility Select */}
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="text-xs bg-[#FAF6F0] border border-[#E6DEC8] rounded-full px-3 py-1.5 text-[#2C2523] font-medium focus:outline-none"
                    >
                      <option value="Công khai">Công khai</option>
                      <option value="Chỉ mình tôi">Chỉ mình tôi</option>
                      <option value="Khóa đến ngày kỷ niệm">Khóa đến ngày kỷ niệm</option>
                    </select>

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={handleCreatePost}
                      className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#D96B43] to-[#B84A24] hover:from-[#B84A24] hover:to-[#9B3B1B] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
                    >
                      Đăng Ký Ức
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {FILTER_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    active
                      ? 'bg-[#7C4D2B] text-white border-[#7C4D2B] shadow-sm'
                      : 'bg-white text-[#6E6259] border-[#E6DEC8] hover:border-[#7C4D2B] hover:text-[#7C4D2B]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Memory Post Cards */}
          <div className="space-y-5">
            {filteredPosts.length === 0 ? (
              <div className="bg-white border border-[#E6DEC8] rounded-2xl p-10 text-center text-[#6E6259]">
                Không tìm thấy bài viết ký ức nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-[#E6DEC8] rounded-2xl p-5 sm:p-6 shadow-warm hover:shadow-warm-lg transition-all"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {post.isAnonymous ? (
                        <div className="w-11 h-11 rounded-full bg-[#7C4D2B]/10 border border-[#E6DEC8] flex items-center justify-center text-[#7C4D2B]">
                          <EyeOff className="w-5 h-5" />
                        </div>
                      ) : (
                        <SafeImage
                          src={post.avatar}
                          alt={post.author}
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#E6DEC8]"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[#2C2523]">
                            {post.author}
                          </span>
                          {post.authorRole && (
                            <span className="text-[11px] font-medium text-[#7C4D2B] bg-[#FAF6F0] px-2 py-0.5 rounded-full border border-[#E6DEC8]/80">
                              {post.authorRole}
                            </span>
                          )}
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF6F0] border border-[#E6DEC8] text-[#6E6259] inline-flex items-center gap-1">
                            {post.visibility === 'Công khai' && <Globe className="w-3 h-3" />}
                            {post.visibility === 'Chỉ mình tôi' && <Lock className="w-3 h-3" />}
                            {post.visibility === 'Khóa đến ngày kỷ niệm' && (
                              <Hourglass className="w-3 h-3 text-[#9B2C2C]" />
                            )}
                            {post.visibility}
                          </span>
                        </div>
                        <div className="text-xs text-[#6E6259] mt-0.5">
                          {post.createdAt} • Kỷ niệm:{' '}
                          <span className="font-medium text-[#7C4D2B]">{post.memoryDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verified Physical Box Badge */}
                  {post.verifiedBox && (
                    <div className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3B7A57]/10 border border-[#3B7A57]/30 text-xs font-semibold text-[#3B7A57]">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>{post.verifiedBox.label}</span>
                    </div>
                  )}

                  {/* Story Content */}
                  <p className="mt-3.5 text-sm text-[#2C2523] leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Hashtags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(post.hashtags || []).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium text-[#7C4D2B] bg-[#FAF6F0] px-2.5 py-0.5 rounded-full border border-[#E6DEC8]/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Image */}
                  {post.image && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-[#E6DEC8] shadow-sm">
                      <SafeImage
                        src={post.image}
                        alt="Hình ảnh kỷ niệm"
                        className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Real Working Audio Player */}
                  {post.audio && (
                    <AudioPlayer audio={post.audio} trackId={`feed-${post.id}`} />
                  )}

                  {/* Interactive Action Bar */}
                  <div className="mt-4 pt-3.5 border-t border-[#E6DEC8]/70 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Candle Reaction */}
                      <button
                        onClick={() => handleToggleCandle(post.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          post.candledByMe
                            ? 'bg-[#E5A93C]/25 border-[#E5A93C] text-[#7C4D2B] shadow-sm'
                            : 'bg-[#FAF6F0] border-[#E6DEC8] text-[#6E6259] hover:border-[#E5A93C] hover:text-[#7C4D2B]'
                        }`}
                      >
                        <Flame
                          className={`w-4 h-4 ${
                            post.candledByMe ? 'text-[#D96B43] fill-[#E5A93C]' : ''
                          }`}
                        />
                        <span>Thắp nến đồng cảm ({post.candles || 0})</span>
                      </button>

                      {/* Comment Toggle */}
                      <button
                        onClick={() =>
                          setOpenComments({
                            ...openComments,
                            [post.id]: !openComments[post.id],
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FAF6F0] border border-[#E6DEC8] text-[#6E6259] hover:border-[#7C4D2B] hover:text-[#7C4D2B] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Gửi lời nhắn ({(post.comments || []).length})</span>
                      </button>

                      {/* Remind Me */}
                      <button
                        onClick={() =>
                          showToast('Đã thêm vào danh sách nhắc lại sau 1 năm')
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FAF6F0] border border-[#E6DEC8] text-[#6E6259] hover:border-[#D96B43] hover:text-[#D96B43] transition-colors"
                      >
                        <BellRing className="w-4 h-4" />
                        <span>Nhắc tôi nhớ lại</span>
                      </button>
                    </div>

                    {/* QR Postcard */}
                    <button
                      onClick={() => setPostcardPost(post)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#7C4D2B]/10 text-[#7C4D2B] hover:bg-[#7C4D2B] hover:text-white transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Tạo Bưu Thiếp QR</span>
                    </button>
                  </div>

                  {/* Expandable Comments Section */}
                  {openComments[post.id] && (
                    <div className="mt-4 pt-3 border-t border-[#E6DEC8]/60 space-y-3">
                      {(post.comments || []).length > 0 && (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {(post.comments || []).map((c) => (
                            <div
                              key={c.id}
                              className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8]/60 text-xs"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-[#7C4D2B]">{c.author}</span>
                                <span className="text-[10px] text-[#6E6259]">{c.time}</span>
                              </div>
                              <p className="text-[#2C2523]">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          placeholder={`Bình luận dưới tên ${user?.name || 'Thành viên'}...`}
                          className="flex-1 px-3.5 py-2 rounded-full bg-[#FAF6F0] border border-[#E6DEC8] text-xs focus:outline-none focus:border-[#D96B43]"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#D96B43] hover:bg-[#B84A24] text-white text-xs font-semibold"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>

        {/* Right 30% Utility Column */}
        <div className="lg:col-span-4 space-y-5">
          {/* Account Profile & Avatar Edit Card */}
          <div className="bg-white border border-[#E6DEC8] rounded-2xl p-5 shadow-warm">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={onEditProfile}
                className="relative group shrink-0"
                title="Đổi ảnh đại diện"
              >
                <SafeImage
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#E5A93C]"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#D96B43] text-white flex items-center justify-center shadow">
                  <Camera className="w-3 h-3" />
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[#2C2523] truncate">{user.name}</div>
                <div className="text-xs text-[#6E6259] truncate">
                  {user.bio || 'Người lưu giữ khoảnh khắc'}
                </div>
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#D96B43] hover:underline"
                >
                  <Camera className="w-3 h-3" />
                  <span>Đổi ảnh đại diện & hồ sơ</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E6DEC8] grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-[#FAF6F0]">
                <div className="text-[10px] text-[#6E6259]">Hộp đang gửi</div>
                <div className="font-serif text-base font-bold text-[#7C4D2B]">
                  {vaultItems.length} Hộp
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF6F0]">
                <div className="text-[10px] text-[#6E6259]">Gói hiện tại</div>
                <div className="text-xs font-bold text-[#D96B43] truncate">
                  {user.tierName}
                </div>
              </div>
            </div>
          </div>

          {/* Community Memory Keepers Widget */}
          <div className="bg-white border border-[#E6DEC8] rounded-2xl p-5 shadow-warm">
            <div className="flex items-center gap-2 text-[#7C4D2B] font-semibold text-xs uppercase tracking-wider mb-3">
              <Users className="w-4 h-4 text-[#D96B43]" />
              <span>Cộng Đồng Người Giữ Ký Ức</span>
            </div>
            <div className="space-y-3">
              {[
                {
                  name: 'Mẹ Khánh Vy & Bé Sữa',
                  role: 'Hộp thời gian 18 năm cho con',
                  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
                  badge: '512 nến',
                },
                {
                  name: 'Đức Minh (KTS)',
                  role: 'Lưu trữ di sản Ông Nội (1970)',
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
                  badge: '386 nến',
                },
                {
                  name: 'Linh Đan (Nhạc sĩ Indie)',
                  role: 'Bản thảo nhạc & Demo Guitar',
                  avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
                  badge: '309 nến',
                },
                {
                  name: 'Thảo Nhi',
                  role: 'Nhiếp ảnh gia Film Đà Lạt',
                  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
                  badge: '215 nến',
                },
              ].map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8]/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SafeImage
                      src={member.avatar}
                      alt={member.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#E6DEC8] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#2C2523] truncate">
                        {member.name}
                      </div>
                      <div className="text-[10px] text-[#6E6259] truncate">{member.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5A93C]/20 text-[#7C4D2B] shrink-0">
                    🔥 {member.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* On This Day */}
          <div className="bg-white border border-[#E6DEC8] rounded-2xl p-5 shadow-warm">
            <div className="flex items-center gap-2 text-[#D96B43] font-semibold text-xs uppercase tracking-wider mb-2">
              <CalendarHeart className="w-4 h-4" />
              <span>Ký ức ngày này năm xưa</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C2523] mb-2">
              17/11/2023 — Chiều mưa ở ga Hà Nội
            </h3>
            <p className="text-xs text-[#6E6259] leading-relaxed mb-3">
              3 năm trước, một mảnh ký ức về tấm vé tàu SE1 và chiếc hộp nhạc gỗ đã được niêm phong tại Kho Trung Tâm.
            </p>
            <button
              onClick={() => onNavigate('vault')}
              className="w-full py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#F3E9D8] border border-[#E6DEC8] text-xs font-semibold text-[#7C4D2B] transition-colors"
            >
              Mở lại không gian số
            </button>
          </div>

          {/* Trending Topics */}
          <div className="bg-white border border-[#E6DEC8] rounded-2xl p-5 shadow-warm">
            <div className="flex items-center gap-2 text-[#7C4D2B] font-semibold text-xs uppercase tracking-wider mb-3">
              <TrendingUp className="w-4 h-4 text-[#E5A93C]" />
              <span>Chủ đề đang được đồng cảm</span>
            </div>
            <div className="space-y-2.5">
              {[
                { tag: '#ThanhXuan', count: '1.240 câu chuyện' },
                { tag: '#QuaChoConTuoi18', count: '980 rương thời gian' },
                { tag: '#DiSanGiaDinh', count: '730 kỷ vật gia tộc' },
                { tag: '#GocAnDanh', count: '512 tâm sự thầm kín' },
              ].map((topic) => (
                <div
                  key={topic.tag}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8]/60"
                >
                  <span className="text-xs font-semibold text-[#7C4D2B]">{topic.tag}</span>
                  <span className="text-[11px] text-[#6E6259]">{topic.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vintage Postcard QR Modal */}
      {postcardPost && (
        <div className="fixed inset-0 z-50 bg-[#2C2523]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] border-2 border-[#7C4D2B] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setPostcardPost(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-[#E6DEC8] flex items-center justify-center text-[#6E6259] hover:text-[#2C2523]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border border-dashed border-[#7C4D2B]/40 rounded-xl p-5 bg-white">
              <div className="flex items-center justify-between border-b border-[#E6DEC8] pb-3 mb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#D96B43] font-bold">
                    Bưu Thiếp Ký Ức Phygital
                  </div>
                  <h4 className="font-serif text-xl font-bold text-[#2C2523]">
                    Cửa Hàng Ký Ức
                  </h4>
                </div>
                <div className="w-12 h-14 border-2 border-[#7C4D2B]/40 rounded flex flex-col items-center justify-center text-[9px] font-bold text-[#7C4D2B] bg-[#FAF6F0]">
                  <Sparkles className="w-4 h-4 text-[#E5A93C] mb-0.5" />
                  TEM KÝ ỨC
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <p className="font-serif italic text-sm text-[#2C2523] leading-relaxed line-clamp-5">
                    “{postcardPost.content}”
                  </p>
                  <div className="mt-3 text-xs font-semibold text-[#7C4D2B]">
                    — {postcardPost.author} ({postcardPost.memoryDate})
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-center">
                  <QrCodeSvg value={postcardPost.id} size={110} />
                  <span className="text-[10px] text-[#6E6259] mt-1.5">
                    Quét QR để nghe & xem kỷ niệm
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setPostcardPost(null)}
                className="px-4 py-2 rounded-full border border-[#E6DEC8] bg-white text-xs font-semibold text-[#6E6259]"
              >
                Đóng
              </button>
              <button
                onClick={() => handleDownloadPostcard(postcardPost)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#D96B43] hover:bg-[#B84A24] text-white text-xs font-semibold shadow"
              >
                <Download className="w-4 h-4" />
                <span>Tải thiệp về máy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
