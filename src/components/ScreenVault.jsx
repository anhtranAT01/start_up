import React, { useState, useRef } from 'react';
import {
  Package,
  HardDrive,
  ShieldCheck,
  Award,
  Search,
  MapPin,
  Calendar,
  Thermometer,
  Droplets,
  Smartphone,
  PlusCircle,
  Truck,
  Gift,
  Clock,
  X,
  Sparkles,
  CheckCircle2,
  UserCheck,
  Upload,
} from 'lucide-react';
import { SAMPLE_IMAGES, formatVND } from '../data/mockData';
import { SafeImage, AudioPlayer } from './SharedUI';
import { soundEngine } from '../utils/soundEngine';

const STATUS_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'stored', label: 'Đang lưu tại kho' },
  { id: 'picking_up', label: 'Shipper đang lấy' },
  { id: 'locked', label: 'Đang khóa Hộp thời gian' },
  { id: 'return_requested', label: 'Đã yêu cầu giao trả' },
];

export default function ScreenVault({
  user,
  vaultItems,
  setVaultItems,
  searchQuery,
  showToast,
  onNavigate,
}) {
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [nfcItem, setNfcItem] = useState(null);
  const [nfcStage, setNfcStage] = useState('scanning');

  const [addMemoryItem, setAddMemoryItem] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState(SAMPLE_IMAGES[2].url);
  const vaultFileRef = useRef(null);

  const handleUploadVaultPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPhotoUrl(reader.result);
        showToast(`Đã chọn ảnh "${file.name}" từ máy tính!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const [returnItem, setReturnItem] = useState(null);
  const [returnRecipientType, setReturnRecipientType] = useState('self');
  const [returnAddress, setReturnAddress] = useState('P.402, Indochina Plaza, Cầu Giấy, Hà Nội');
  const [returnDate, setReturnDate] = useState('2026-11-20');

  const [transferItem, setTransferItem] = useState(null);
  const [transferContact, setTransferContact] = useState('');
  const [transferMsg, setTransferMsg] = useState('');

  const [extendItem, setExtendItem] = useState(null);
  const [extendChoice, setExtendChoice] = useState('1 năm');

  const safeVaultList = Array.isArray(vaultItems) ? vaultItems : [];
  const totalInsurance = safeVaultList.reduce((sum, item) => sum + (item.insuranceValue || 0), 0);

  const getStatusBadge = (item) => {
    if (item.status === 'stored') {
      return 'bg-[#606E5A]/15 text-[#606E5A] border-[#606E5A]/30';
    }
    if (item.status === 'picking_up') {
      return 'bg-[#2B6CB0]/15 text-[#2B6CB0] border-[#2B6CB0]/30';
    }
    if (item.status === 'locked') {
      return 'bg-[#9B2C2C]/15 text-[#9B2C2C] border-[#9B2C2C]/30';
    }
    return 'bg-[#C9A166]/20 text-[#606E5A] border-[#C9A166]/50';
  };

  const openNfcModal = (item) => {
    setNfcItem(item);
    setNfcStage('scanning');
    setTimeout(() => {
      setNfcStage('opened');
    }, 950);
  };

  const closeNfcModal = () => {
    try {
      soundEngine.stop();
    } catch (e) {
      console.warn('Sound stop error:', e);
    }
    setNfcItem(null);
  };

  const handleAddDigitalMemory = () => {
    if (!newNoteText.trim() && !newPhotoUrl) return;
    setVaultItems((prev) =>
      (Array.isArray(prev) ? prev : []).map((item) => {
        if (item.id !== addMemoryItem.id) return item;
        const prevPhotos = item.digitalSpace?.photos || [];
        const prevNotes = item.digitalSpace?.notes || [];
        return {
          ...item,
          digitalSpace: {
            ...(item.digitalSpace || {}),
            photos: newPhotoUrl
              ? [newPhotoUrl, ...prevPhotos]
              : prevPhotos,
            notes: newNoteText.trim()
              ? [
                  { date: '16/11/2026', text: newNoteText.trim() },
                  ...prevNotes,
                ]
              : prevNotes,
          },
        };
      })
    );
    showToast(`Đã bổ sung ký ức số mới vào hộp #${addMemoryItem.id}!`);
    setNewNoteText('');
    setAddMemoryItem(null);
  };

  const handleConfirmReturn = () => {
    setVaultItems((prev) =>
      prev.map((item) =>
        item.id === returnItem.id
          ? {
              ...item,
              status: 'return_requested',
              statusLabel: 'Đang chuẩn bị xuất kho giao trả',
              location: `Lệnh xuất kho giao tới: ${returnAddress} (${returnDate})`,
            }
          : item
      )
    );
    showToast(`Đã tạo lệnh xuất kho giao trả hộp #${returnItem.id} về địa chỉ đã chọn!`);
    setReturnItem(null);
  };

  const handleConfirmTransfer = () => {
    if (!transferContact.trim()) {
      showToast('Vui lòng nhập Email hoặc SĐT người nhận!', 'error');
      return;
    }
    const targetEmail = transferContact.trim().toLowerCase();
    setVaultItems((prev) =>
      (Array.isArray(prev) ? prev : []).map((item) => {
        if (item.id !== transferItem.id) return item;
        const prevNotes = item.digitalSpace?.notes || [];
        return {
          ...item,
          ownerEmail: targetEmail.includes('@') ? targetEmail : item.ownerEmail,
          digitalSpace: {
            ...(item.digitalSpace || {}),
            notes: [
              {
                date: '16/11/2026',
                text: `Đã chuyển quyền sở hữu từ ${user?.name || 'Khách hàng'} tới ${transferContact}. Lời nhắn: "${
                  transferMsg || 'Gửi bạn giữ giùm phần ký ức này.'
                }"`,
              },
              ...prevNotes,
            ],
          },
        };
      })
    );
    showToast(`Đã trao quyền sở hữu hộp #${transferItem.id} tới ${transferContact}!`);
    setTransferContact('');
    setTransferMsg('');
    setTransferItem(null);
  };

  const handleConfirmExtend = () => {
    setVaultItems((prev) =>
      (Array.isArray(prev) ? prev : []).map((item) =>
        item.id === extendItem.id
          ? {
              ...item,
              durationLabel: `${item.durationLabel} (+${extendChoice})`,
              expiryDate:
                extendChoice === 'Trọn đời'
                  ? 'Vĩnh viễn'
                  : `Gia hạn thêm ${extendChoice}`,
            }
          : item
      )
    );
    showToast(`Đã gia hạn lưu kho hộp #${extendItem.id} thêm ${extendChoice}!`);
    setExtendItem(null);
  };

  const combinedQuery = (localSearch || searchQuery || '').trim().toLowerCase();
  const filteredItems = (Array.isArray(vaultItems) ? vaultItems : []).filter((item) => {
    if (!item) return false;
    const matchQuery =
      !combinedQuery ||
      (item.name && item.name.toLowerCase().includes(combinedQuery)) ||
      (item.id && item.id.toLowerCase().includes(combinedQuery));
    if (!matchQuery) return false;
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Account Sync Banner */}
      <div className="bg-white border border-[#D6BD95] rounded-2xl p-4 sm:p-5 shadow-warm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#606E5A] text-[#C9A166] flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#2C3329]">
              Kho Kỷ Vật Của {user.name}
            </h2>
            <p className="text-xs text-[#748067]">
              Tài khoản: <strong>{user.email}</strong> • Gói đang kích hoạt:{' '}
              <strong className="text-[#C9A166]">{user.tierName}</strong>
            </p>
          </div>
        </div>
        {user.role === 'admin' && (
          <span className="px-3 py-1 rounded-full bg-[#2B6CB0]/15 text-[#2B6CB0] text-xs font-bold">
            Chế độ Admin: Đang xem toàn bộ hộp kỷ vật trên hệ thống
          </span>
        )}
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D6BD95] rounded-2xl p-4 shadow-warm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#606E5A]/10 text-[#606E5A] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#748067]">Tổng hộp quà của tài khoản</div>
            <div className="font-serif text-xl font-bold text-[#2C3329]">
              {String(vaultItems.length).padStart(2, '0')} Hộp
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#D6BD95] rounded-2xl p-4 shadow-warm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#C9A166]/10 text-[#C9A166] flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#748067]">Dung lượng số theo gói</div>
            <div className="font-serif text-xl font-bold text-[#2C3329]">
              {user.usedStorageGB || 1.2} GB / {user.maxStorageGB || 100} GB
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#D6BD95] rounded-2xl p-4 shadow-warm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#606E5A]/10 text-[#606E5A] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-[#748067]">Tình trạng bảo quản thực tế</div>
            <div className="text-sm font-bold text-[#606E5A]">100% An toàn</div>
            <div className="text-[11px] text-[#748067]">Kiểm tra 2 giờ trước</div>
          </div>
        </div>

        <div className="bg-white border border-[#D6BD95] rounded-2xl p-4 shadow-warm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#C9A166]/20 text-[#606E5A] flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-[#C9A166]" />
          </div>
          <div>
            <div className="text-xs text-[#748067]">Bảo hiểm đang kích hoạt</div>
            <div className="font-serif text-xl font-bold text-[#2C3329]">
              {formatVND(totalInsurance)}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-[#D6BD95] rounded-2xl p-4 shadow-warm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#748067] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã hộp (#MK-1024)..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F6F2EB] border border-[#D6BD95] text-xs focus:outline-none focus:border-[#C9A166]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                statusFilter === f.id
                  ? 'bg-[#606E5A] text-white border-[#606E5A]'
                  : 'bg-[#F6F2EB] text-[#748067] border-[#D6BD95] hover:border-[#606E5A]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vault Item Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-[#D6BD95] rounded-2xl p-10 text-center space-y-3 shadow-warm">
          <Package className="w-12 h-12 text-[#C9A166] mx-auto opacity-80" />
          <h3 className="font-serif text-xl font-bold text-[#2C3329]">
            Chưa có hộp kỷ vật nào trong danh mục này
          </h3>
          <p className="text-xs text-[#748067] max-w-md mx-auto">
            Hãy đặt lịch để nhân viên Cửa Hàng Ký Ức đến tận nơi nhận quà, niêm phong kẹp chì và khởi tạo Không gian Ký ức Số cho tài khoản <strong>{user.name}</strong>.
          </p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('pickup')}
              className="px-5 py-2.5 rounded-full bg-[#C9A166] hover:bg-[#B38B50] text-white text-xs font-bold shadow"
            >
              + Đặt lịch gửi kỷ vật đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#D6BD95] rounded-2xl p-5 shadow-warm hover:shadow-warm-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row gap-5">
                {/* Photo */}
                <div className="w-full lg:w-56 h-44 rounded-xl overflow-hidden border border-[#D6BD95] shrink-0 relative">
                  <SafeImage
                    src={item.coverImage}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#2C3329]/80 text-white text-xs font-bold backdrop-blur-sm">
                    #{item.id}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-[#2C3329]">
                          {item.name}
                        </h3>
                        <div className="text-xs text-[#748067] mt-0.5">
                          Chủ sở hữu: <strong>{item.ownerName || user.name}</strong> • {item.category} • {item.boxType}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                          item
                        )}`}
                      >
                        {item.statusLabel}
                      </span>
                    </div>

                    <p className="text-xs text-[#2C3329]/85 mt-2.5 leading-relaxed">
                      {item.story}
                    </p>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 text-xs">
                      <div className="flex items-center gap-1.5 text-[#606E5A] bg-[#F6F2EB] px-3 py-2 rounded-xl border border-[#D6BD95]/70 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-[#C9A166] shrink-0" />
                        <span className="truncate font-medium">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#748067] bg-[#F6F2EB] px-3 py-2 rounded-xl border border-[#D6BD95]/70">
                        <Calendar className="w-4 h-4 text-[#606E5A] shrink-0" />
                        <span>
                          {item.sentDate} → <strong>{item.expiryDate}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[#606E5A] bg-[#606E5A]/10 px-3 py-2 rounded-xl border border-[#606E5A]/20 font-semibold">
                        <Thermometer className="w-3.5 h-3.5" /> {item.sensorTemp}
                        <Droplets className="w-3.5 h-3.5 ml-1" /> {item.sensorHumidity}
                      </div>
                    </div>
                  </div>

                  {/* 5 Required Action Buttons */}
                  <div className="mt-4 pt-3.5 border-t border-[#D6BD95] flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openNfcModal(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#C9A166] to-[#B38B50] hover:from-[#B38B50] hover:to-[#9A7540] text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Quét NFC / Xem Không Gian Số</span>
                    </button>

                    <button
                      onClick={() => setAddMemoryItem(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#606E5A] hover:bg-[#5E391F] text-white text-xs font-semibold transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Bổ Sung Ký Ức Số</span>
                    </button>

                    <button
                      onClick={() => setReturnItem(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F6F2EB] hover:bg-[#EAE1D4] border border-[#D6BD95] text-[#2C3329] text-xs font-semibold transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#2B6CB0]" />
                      <span>Yêu Cầu Giao Trả Quà Về Nhà</span>
                    </button>

                    <button
                      onClick={() => setTransferItem(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F6F2EB] hover:bg-[#EAE1D4] border border-[#D6BD95] text-[#2C3329] text-xs font-semibold transition-colors"
                    >
                      <Gift className="w-3.5 h-3.5 text-[#C9A166]" />
                      <span>Chuyển Quyền Sở Hữu / Tặng Lại</span>
                    </button>

                    <button
                      onClick={() => setExtendItem(item)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F6F2EB] hover:bg-[#EAE1D4] border border-[#D6BD95] text-[#2C3329] text-xs font-semibold transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#606E5A]" />
                      <span>Gia Hạn Lưu Kho</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. Fullscreen NFC / Digital Space Modal */}
      {nfcItem && (
        <div className="fixed inset-0 z-50 bg-[#2C3329]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F6F2EB] border-2 border-[#C9A166] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-auto">
            <button
              onClick={closeNfcModal}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-[#D6BD95] flex items-center justify-center text-[#748067] hover:text-[#2C3329]"
            >
              <X className="w-4 h-4" />
            </button>

            {nfcStage === 'scanning' ? (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                  <span className="absolute inset-0 rounded-full border-2 border-[#C9A166] animate-nfc-ripple" />
                  <span className="absolute inset-2 rounded-full border-2 border-[#C9A166] animate-nfc-ripple" />
                  <div className="w-16 h-16 rounded-full bg-[#606E5A] text-white flex items-center justify-center shadow-lg">
                    <Smartphone className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#606E5A]">
                  Đang chạm thẻ NFC #{nfcItem.id}...
                </h3>
                <p className="text-sm text-[#748067] mt-2">
                  Đang mở nắp hộp ký ức số và đồng bộ dữ liệu từ Kho Trung Tâm
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#606E5A]">
                  <Sparkles className="w-4 h-4 text-[#C9A166]" />
                  <span>Không Gian Ký Ức Số — #{nfcItem.id}</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#2C3329]">
                  {nfcItem.name}
                </h2>

                {/* Real Working Audio Player inside NFC Modal */}
                <AudioPlayer
                  audio={{
                    title: nfcItem.digitalSpace.audioTitle,
                    durationSeconds: nfcItem.digitalSpace.durationSeconds || 120,
                  }}
                  trackId={`nfc-${nfcItem.id}`}
                />

                {/* Heartfelt Letter */}
                <div className="p-5 rounded-2xl bg-white border border-[#D6BD95] shadow-inner">
                  <div className="text-xs font-bold text-[#606E5A] uppercase tracking-wider mb-2">
                    Tâm thư của chủ nhân
                  </div>
                  <p className="font-serif italic text-sm text-[#2C3329] leading-relaxed whitespace-pre-line">
                    {nfcItem.digitalSpace.letter}
                  </p>
                </div>

                {/* Photo Gallery */}
                <div>
                  <div className="text-xs font-bold text-[#606E5A] uppercase tracking-wider mb-2">
                    Bộ ảnh kỷ niệm ({nfcItem.digitalSpace.photos.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {nfcItem.digitalSpace.photos.map((p, idx) => (
                      <SafeImage
                        key={idx}
                        src={p}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-28 object-cover rounded-xl border border-[#D6BD95]"
                      />
                    ))}
                  </div>
                </div>

                {/* Inspection History */}
                <div className="p-4 rounded-2xl bg-white border border-[#D6BD95]">
                  <div className="text-xs font-bold text-[#606E5A] uppercase tracking-wider mb-2">
                    Lịch sử kiểm định bảo quản tại kho
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {nfcItem.digitalSpace.inspectionLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#606E5A] mt-0.5 shrink-0" />
                        <span>
                          <strong>{log.date}:</strong> {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Add Digital Memory Modal */}
      {addMemoryItem && (
        <div className="fixed inset-0 z-50 bg-[#2C3329]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D6BD95] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-[#2C3329] mb-1">
              Bổ Sung Ký Ức Số — #{addMemoryItem.id}
            </h3>
            <p className="text-xs text-[#748067] mb-4">
              Thêm ảnh và nhật ký mới vào hộp quà đang bảo quản tại kho mà không cần lấy hộp về.
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold">Ảnh kỷ niệm bổ sung</label>
                  <input
                    ref={vaultFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadVaultPhoto}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => vaultFileRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C9A166] text-white text-[11px] font-bold"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Tải ảnh từ máy tính</span>
                  </button>
                </div>
                {newPhotoUrl && (
                  <div className="mb-2">
                    <SafeImage
                      src={newPhotoUrl}
                      alt="Xem trước"
                      className="w-full h-28 object-cover rounded-xl border border-[#C9A166]"
                    />
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_IMAGES.slice(0, 4).map((img) => (
                    <button
                      key={img.url}
                      onClick={() => setNewPhotoUrl(img.url)}
                      className={`rounded-lg overflow-hidden border-2 ${
                        newPhotoUrl === img.url ? 'border-[#C9A166]' : 'border-[#D6BD95]'
                      }`}
                    >
                      <SafeImage src={img.url} alt={img.label} className="w-full h-12 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Nhật ký bổ sung</label>
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Viết thêm cảm xúc hôm nay gửi vào hộp..."
                  className="w-full p-3 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-xs focus:outline-none focus:border-[#C9A166]"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setAddMemoryItem(null)}
                className="px-4 py-2 rounded-full border border-[#D6BD95] text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleAddDigitalMemory}
                className="px-5 py-2 rounded-full bg-[#606E5A] text-white text-xs font-semibold"
              >
                Lưu vào không gian số
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Request Return Modal */}
      {returnItem && (
        <div className="fixed inset-0 z-50 bg-[#2C3329]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D6BD95] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-[#2C3329] mb-1">
              Yêu Cầu Giao Trả Quà — #{returnItem.id}
            </h3>
            <p className="text-xs text-[#748067] mb-4">
              Chọn người nhận và thời gian để nhân viên xuất kho giao tận tay.
            </p>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setReturnRecipientType('self')}
                  className={`p-2.5 rounded-xl border font-semibold ${
                    returnRecipientType === 'self'
                      ? 'bg-[#606E5A] text-white border-[#606E5A]'
                      : 'bg-[#F6F2EB] border-[#D6BD95]'
                  }`}
                >
                  Nhận lại cho bản thân
                </button>
                <button
                  onClick={() => setReturnRecipientType('surprise')}
                  className={`p-2.5 rounded-xl border font-semibold ${
                    returnRecipientType === 'surprise'
                      ? 'bg-[#C9A166] text-white border-[#C9A166]'
                      : 'bg-[#F6F2EB] border-[#D6BD95]'
                  }`}
                >
                  Ship bất ngờ cho người khác
                </button>
              </div>
              <div>
                <label className="block font-semibold mb-1">Địa chỉ giao nhận</label>
                <input
                  type="text"
                  value={returnAddress}
                  onChange={(e) => setReturnAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6F2EB] border border-[#D6BD95]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Ngày giao dự kiến</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6F2EB] border border-[#D6BD95]"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setReturnItem(null)}
                className="px-4 py-2 rounded-full border border-[#D6BD95] text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-5 py-2 rounded-full bg-[#C9A166] text-white text-xs font-semibold"
              >
                Xác nhận lệnh xuất kho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Transfer Ownership Modal */}
      {transferItem && (
        <div className="fixed inset-0 z-50 bg-[#2C3329]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D6BD95] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-[#2C3329] mb-1">
              Chuyển Quyền Sở Hữu / Tặng Lại
            </h3>
            <p className="text-xs text-[#748067] mb-4">
              Trao quyền làm chủ hộp #{transferItem.id} cho tài khoản khác (VD: thaonhi@gmail.com).
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Email / SĐT người nhận</label>
                <input
                  type="text"
                  value={transferContact}
                  onChange={(e) => setTransferContact(e.target.value)}
                  placeholder="VD: thaonhi@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-[#F6F2EB] border border-[#D6BD95]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Lời nhắn gửi kèm</label>
                <textarea
                  rows={3}
                  value={transferMsg}
                  onChange={(e) => setTransferMsg(e.target.value)}
                  placeholder="Gửi tặng bạn phần ký ức này..."
                  className="w-full p-3 rounded-xl bg-[#F6F2EB] border border-[#D6BD95]"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setTransferItem(null)}
                className="px-4 py-2 rounded-full border border-[#D6BD95] text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="px-5 py-2 rounded-full bg-[#606E5A] text-white text-xs font-semibold"
              >
                Gửi lời mời trao quyền
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Extend Storage Modal */}
      {extendItem && (
        <div className="fixed inset-0 z-50 bg-[#2C3329]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D6BD95] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-[#2C3329] mb-1">
              Gia Hạn Lưu Kho — #{extendItem.id}
            </h3>
            <p className="text-xs text-[#748067] mb-4">
              Chọn thời gian cộng thêm hoặc nâng cấp gói bảo quản.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {['1 năm', '3 năm', 'Trọn đời'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setExtendChoice(opt)}
                  className={`py-2.5 rounded-xl border text-xs font-bold ${
                    extendChoice === opt
                      ? 'bg-[#606E5A] text-white border-[#606E5A]'
                      : 'bg-[#F6F2EB] border-[#D6BD95] text-[#2C3329]'
                  }`}
                >
                  +{opt}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setExtendItem(null)}
                className="px-4 py-2 rounded-full border border-[#D6BD95] text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmExtend}
                className="px-5 py-2 rounded-full bg-[#C9A166] text-white text-xs font-semibold"
              >
                Xác nhận gia hạn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
