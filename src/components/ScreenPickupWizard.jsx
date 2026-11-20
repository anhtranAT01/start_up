import React, { useState, useRef } from 'react';
import {
  Package,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Upload,
  Lock,
  Cpu,
  Clock,
  MapPin,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { SAMPLE_IMAGES, formatVND } from '../data/mockData';
import { SafeImage } from './SharedUI';

const STEPS = [
  { num: 1, title: 'Thông tin Kỷ vật' },
  { num: 2, title: 'Quy cách Bảo quản' },
  { num: 3, title: 'Lịch Nhân viên lấy quà' },
  { num: 4, title: 'Bảo hiểm & Xác nhận' },
];

const BOX_TYPES = [
  {
    id: 'cedar',
    name: 'Hộp Gỗ Tuyết Tùng chống ẩm',
    price: 180000,
    desc: 'Gỗ tự nhiên hút ẩm, khử mùi, bảo vệ giấy và vải vóc bền bỉ 10+ năm.',
  },
  {
    id: 'acrylic',
    name: 'Hộp Acrylic trong suốt trưng bày',
    price: 150000,
    desc: 'Chống tia UV, chống bụi tuyệt đối, phù hợp mô hình, hộp nhạc, trang sức.',
  },
  {
    id: 'vacuum',
    name: 'Túi hút chân không chuyên dụng',
    price: 70000,
    desc: 'Ép khí chuẩn công nghiệp, chống oxy hóa cho áo kỷ yếu, gấu bông, khăn len.',
  },
];

const DURATIONS = [
  { label: '6 tháng', years: 0.5 },
  { label: '1 năm', years: 1 },
  { label: '3 năm', years: 3 },
  { label: '5 năm', years: 5 },
  { label: 'Trọn đời', years: 20 },
];

const TIME_SLOTS = [
  'Sáng 08:00 - 12:00',
  'Chiều 13:00 - 17:00',
  'Tối 18:00 - 21:00',
];

export default function ScreenPickupWizard({ user, onCreateOrder, showToast, onNavigate }) {
  const [step, setStep] = useState(1);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  // Step 1
  const [boxName, setBoxName] = useState('');
  const [category, setCategory] = useState('Quà lưu niệm');
  const [size, setSize] = useState('Hộp Vừa (35x25x15cm)');
  const [photo, setPhoto] = useState(SAMPLE_IMAGES[0].url);
  const [story, setStory] = useState('');
  const pickupFileRef = useRef(null);

  const handleUploadPickupPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhoto(reader.result);
        showToast(`Đã tải ảnh kỷ vật "${file.name}" từ máy tính!`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Step 2
  const [boxType, setBoxType] = useState(BOX_TYPES[0].name);
  const [addNfc, setAddNfc] = useState(true);
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [duration, setDuration] = useState('3 năm');

  // Step 3
  const [senderName, setSenderName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState('P.804, Ký túc xá Mỹ Đình, Nam Từ Liêm, Hà Nội');
  const [pickupDate, setPickupDate] = useState('2026-11-18');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [leadSeal, setLeadSeal] = useState(true);

  // Step 4
  const [agreed, setAgreed] = useState(false);

  const selectedBoxObj = BOX_TYPES.find((b) => b.name === boxType) || BOX_TYPES[0];
  const pickupFee = user.tierId === 'chest' || user.tierId === 'legacy' ? 0 : 35000;
  const nfcFee = addNfc ? (user.tierId === 'chest' || user.tierId === 'legacy' ? 0 : 60000) : 0;
  const totalAmount = selectedBoxObj.price + pickupFee + nfcFee;
  const insuranceCover = user.tierId === 'legacy' ? 20000000 : user.tierId === 'chest' ? 5000000 : 1000000;

  const handleNext = () => {
    if (step === 1 && !boxName.trim()) {
      showToast('Vui lòng nhập Tên hộp kỷ vật trước khi tiếp tục!', 'error');
      return;
    }
    if (step === 3 && (!senderName.trim() || !phone.trim() || !address.trim())) {
      showToast('Vui lòng điền đầy đủ thông tin nhận hàng!', 'error');
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  };

  const handleConfirm = () => {
    if (!agreed) {
      showToast('Vui lòng đồng ý với Hợp đồng Dịch vụ & Cam kết Bảo mật!', 'error');
      return;
    }

    const randomNum = Math.floor(4000 + Math.random() * 5000);
    const vaultId = `MK-${randomNum}`;
    const orderId = `ORD-${String(Date.now()).slice(-6)}`;

    const newVaultItem = {
      id: vaultId,
      ownerEmail: user.email,
      ownerName: user.name,
      name: boxName.trim(),
      category,
      size,
      boxType,
      status: isTimeCapsule ? 'locked' : 'picking_up',
      statusLabel: 'Shipper đang đến lấy quà',
      location: `Đang điều phối thu gom — ${address}`,
      sentDate: '16/11/2026',
      expiryDate: duration === 'Trọn đời' ? 'Vĩnh viễn' : `16/11/${2026 + (DURATIONS.find((d) => d.label === duration)?.years || 1)}`,
      durationLabel: duration,
      sensorTemp: '22.0°C',
      sensorHumidity: '45%',
      insuranceValue: insuranceCover,
      hasNfc: addNfc,
      isTimeCapsule,
      lastInspected: 'Chờ nhập kho',
      coverImage: photo,
      story: story.trim() || 'Kỷ vật quý giá được gửi gắm tại Cửa Hàng Ký Ức.',
      digitalSpace: {
        audioTitle: 'Lời nhắn đính kèm khi gửi hộp.mp3',
        audioDuration: '01:00',
        durationSeconds: 60,
        letter: story.trim() || 'Gửi tương lai — mong mọi thứ vẫn vẹn nguyên như ngày đầu.',
        photos: [photo],
        notes: [
          {
            date: '16/11/2026',
            text: leadSeal
              ? 'Đã yêu cầu nhân viên mang kẹp chì & túi niêm phong tại nhà.'
              : 'Đã tạo lệnh thu gom tiêu chuẩn.',
          },
        ],
        inspectionLogs: [
          { date: '16/11/2026', status: 'Đơn hàng mới tạo — Đang chờ Custodian tiếp nhận.' },
        ],
      },
    };

    const newDispatchOrder = {
      id: orderId,
      vaultId,
      ownerEmail: user.email,
      customerName: senderName,
      phone,
      address,
      itemName: boxName.trim(),
      boxType,
      timeSlot,
      pickupDate,
      leadSealRequested: leadSeal,
      step: 1,
      assignedLocation: '',
      lastReportSent: false,
    };

    onCreateOrder(newVaultItem, newDispatchOrder);
    setSubmittedOrder({ orderId, vaultId, totalAmount });
    showToast(`Đã tạo lệnh thu gom #${orderId} & thêm #${vaultId} vào Kho Lưu Trữ!`);
  };

  const resetWizard = () => {
    setSubmittedOrder(null);
    setStep(1);
    setBoxName('');
    setStory('');
    setAgreed(false);
  };

  if (submittedOrder) {
    const trackingSteps = [
      '1. Đã tạo lệnh',
      '2. Shipper đang đến lấy quà',
      '3. Đã ký biên bản & Niêm phong tại nhà',
      '4. Đang vận chuyển về kho',
      '5. Đã nhập kho an toàn',
    ];
    return (
      <div className="max-w-3xl mx-auto bg-white border border-[#E6DEC8] rounded-2xl p-6 sm:p-8 shadow-warm">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-[#3B7A57]/15 text-[#3B7A57] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2C2523]">
            Điều Phối Nhân Viên Thành Công!
          </h2>
          <p className="text-sm text-[#6E6259] mt-1.5">
            Mã đơn vận chuyển: <span className="font-bold text-[#7C4D2B]">#{submittedOrder.orderId}</span> • Mã hộp định danh:{' '}
            <span className="font-bold text-[#3B7A57]">#{submittedOrder.vaultId}</span>
          </p>
        </div>

        {/* 5-step Live Tracking */}
        <div className="mt-8 bg-[#FAF6F0] border border-[#E6DEC8] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C4D2B]">
              Theo Dõi Trạng Thái Đơn Hàng Trực Tiếp (Live Tracking)
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2B6CB0]/15 text-[#2B6CB0]">
              Đang hoạt động
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {trackingSteps.map((label, idx) => {
              const active = idx === 0;
              return (
                <div
                  key={label}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    active
                      ? 'bg-white border-[#2B6CB0] shadow-sm'
                      : 'bg-white/50 border-[#E6DEC8] opacity-65'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold ${
                      active ? 'bg-[#2B6CB0] text-white' : 'bg-[#E6DEC8] text-[#6E6259]'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="text-[11px] font-semibold text-[#2C2523] leading-snug">
                    {label.replace(/^\d+\.\s/, '')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('vault')}
            className="px-5 py-2.5 rounded-full bg-[#7C4D2B] hover:bg-[#5E391F] text-white text-xs sm:text-sm font-semibold shadow"
          >
            Xem trong Kho Lưu Trữ Của Tôi
          </button>
          <button
            onClick={resetWizard}
            className="px-5 py-2.5 rounded-full border border-[#E6DEC8] bg-[#FAF6F0] text-[#7C4D2B] text-xs sm:text-sm font-semibold"
          >
            Đặt thêm đơn mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Stepper */}
      <div className="bg-white border border-[#E6DEC8] rounded-2xl p-5 sm:p-6 shadow-warm">
        <h1 className="font-serif text-2xl font-bold text-[#2C2523]">
          Đặt Lịch Gửi Quà & Điều Phối Nhân Viên Đến Lấy
        </h1>
        <p className="text-sm text-[#6E6259] mt-1">
          Quy trình 4 bước niêm phong bảo mật tại nhà và đưa về bảo quản tại Kho Trung Tâm.
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((s) => {
            const isCurrent = step === s.num;
            const isDone = step > s.num;
            return (
              <div
                key={s.num}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-[#D96B43]/10 border-[#D96B43]'
                    : isDone
                    ? 'bg-[#3B7A57]/10 border-[#3B7A57]/40'
                    : 'bg-[#FAF6F0] border-[#E6DEC8]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-[#D96B43] text-white'
                      : isDone
                      ? 'bg-[#3B7A57] text-white'
                      : 'bg-[#E6DEC8] text-[#6E6259]'
                  }`}
                >
                  {isDone ? '✓' : s.num}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-[#D96B43]' : isDone ? 'text-[#3B7A57]' : 'text-[#6E6259]'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white border border-[#E6DEC8] rounded-2xl p-6 shadow-warm">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-bold text-[#7C4D2B] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#D96B43]" />
              Bước 1: Thông tin Kỷ vật & Câu chuyện
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C2523] mb-1.5">
                  Tên hộp kỷ vật <span className="text-[#9B2C2C]">*</span>
                </label>
                <input
                  type="text"
                  value={boxName}
                  onChange={(e) => setBoxName(e.target.value)}
                  placeholder="VD: Hộp thư tay & chiếc khăn len năm nhất"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2C2523] mb-1.5">
                  Phân loại vật phẩm
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                >
                  <option>Quà lưu niệm</option>
                  <option>Thư từ / Sách ảnh</option>
                  <option>Trang sức / Đồ quý giá</option>
                  <option>Quần áo / Vải vóc</option>
                  <option>Thiết bị lưu trữ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C2523] mb-2">
                Kích thước ước tính
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  'Hộp Nhỏ (20x15x10cm)',
                  'Hộp Vừa (35x25x15cm)',
                  'Rương Lớn (50x40x30cm)',
                ].map((sz) => (
                  <button
                    type="button"
                    key={sz}
                    onClick={() => setSize(sz)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      size === sz
                        ? 'bg-[#7C4D2B] text-white border-[#7C4D2B]'
                        : 'bg-[#FAF6F0] text-[#2C2523] border-[#E6DEC8] hover:border-[#7C4D2B]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="block text-xs font-semibold text-[#2C2523]">
                  Tải lên ảnh chụp kỷ vật trước khi bàn giao (Biên bản đối chiếu)
                </label>
                <input
                  ref={pickupFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPickupPhoto}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => pickupFileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#D96B43] hover:bg-[#B84A24] text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh từ máy tính của bạn</span>
                </button>
              </div>
              {photo && !SAMPLE_IMAGES.some((img) => img.url === photo) && (
                <div className="mb-3 inline-flex items-center gap-3 p-2 rounded-xl bg-[#FAF6F0] border-2 border-[#D96B43]">
                  <SafeImage src={photo} alt="Ảnh tải lên" className="w-20 h-16 object-cover rounded-lg" />
                  <span className="text-xs font-semibold text-[#D96B43] pr-2">
                    ✓ Đang dùng ảnh tải từ máy của bạn
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SAMPLE_IMAGES.slice(0, 4).map((img) => (
                  <button
                    type="button"
                    key={img.url}
                    onClick={() => setPhoto(img.url)}
                    className={`rounded-xl overflow-hidden border-2 transition-all text-left ${
                      photo === img.url ? 'border-[#D96B43] ring-2 ring-[#D96B43]/30' : 'border-[#E6DEC8]'
                    }`}
                  >
                    <SafeImage src={img.url} alt={img.label} className="w-full h-20 object-cover" />
                    <div className="p-1.5 text-[11px] bg-[#FAF6F0] truncate font-medium">
                      {img.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C2523] mb-1.5">
                Câu chuyện & Ghi chú bảo quản đặc biệt
              </label>
              <textarea
                rows={3}
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="VD: Yêu cầu hút ẩm kỹ, tuyệt đối không mở phong bì màu kem bên trong..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43] resize-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-bold text-[#7C4D2B] flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#D96B43]" />
              Bước 2: Chọn Quy cách Bảo quản & Đính kèm Công nghệ
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {BOX_TYPES.map((b) => {
                const selected = boxType === b.name;
                return (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => setBoxType(b.name)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      selected
                        ? 'bg-[#FAF6F0] border-[#D96B43] ring-2 ring-[#D96B43]/25'
                        : 'bg-white border-[#E6DEC8] hover:border-[#7C4D2B]'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-[#2C2523] mb-1">{b.name}</div>
                      <p className="text-xs text-[#6E6259] leading-relaxed">{b.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#E6DEC8] text-sm font-bold text-[#D96B43]">
                      +{formatVND(b.price)}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 bg-[#FAF6F0] p-4 rounded-2xl border border-[#E6DEC8]">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addNfc}
                  onChange={(e) => setAddNfc(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#D96B43]"
                />
                <div>
                  <div className="text-sm font-semibold text-[#2C2523]">
                    Gắn chip NFC & Tem QR định danh lên hộp (Tặng kèm 1 thẻ NFC bản sao giữ tại nhà)
                  </div>
                  <div className="text-xs text-[#6E6259]">
                    Chạm điện thoại vào thẻ bản sao ở nhà để mở ngay Không gian Ký ức Số của hộp quà đang nằm tại kho.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-[#E6DEC8]/70">
                <input
                  type="checkbox"
                  checked={isTimeCapsule}
                  onChange={(e) => setIsTimeCapsule(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#9B2C2C]"
                />
                <div>
                  <div className="text-sm font-semibold text-[#9B2C2C] flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    Bật chế độ Hộp thời gian (Khóa không cho mở trước ngày hẹn)
                  </div>
                  <div className="text-xs text-[#6E6259]">
                    Hộp sẽ được chuyển vào khu vực Khóa Kín và tự động đếm ngược đến ngày mở khóa.
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C2523] mb-2">
                Thời hạn lưu kho dự kiến
              </label>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <button
                    type="button"
                    key={d.label}
                    onClick={() => setDuration(d.label)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                      duration === d.label
                        ? 'bg-[#7C4D2B] text-white border-[#7C4D2B]'
                        : 'bg-[#FAF6F0] text-[#2C2523] border-[#E6DEC8]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-bold text-[#7C4D2B] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#D96B43]" />
              Bước 3: Đặt lịch Nhân viên đến nhận quà tận nơi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C2523] mb-1.5">
                  Họ tên người gửi
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#2C2523] mb-1.5">
                  Số điện thoại liên hệ
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2C2523] mb-1.5">
                Địa chỉ lấy hàng chi tiết
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#D96B43] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2C2523] mb-1.5">
                  Ngày lấy hàng
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#2C2523] mb-1.5">
                  Khung giờ nhân viên đến lấy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                        timeSlot === slot
                          ? 'bg-[#2B6CB0] text-white border-[#2B6CB0]'
                          : 'bg-[#FAF6F0] text-[#2C2523] border-[#E6DEC8]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#3B7A57]/10 border border-[#3B7A57]/30 flex items-start gap-3">
              <input
                type="checkbox"
                checked={leadSeal}
                onChange={(e) => setLeadSeal(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#3B7A57]"
              />
              <div>
                <div className="text-sm font-bold text-[#3B7A57] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Yêu cầu Nhân viên mang Kẹp chì & Túi niêm phong bảo mật tại chỗ
                </div>
                <p className="text-xs text-[#2C2523]/80 mt-1 leading-relaxed">
                  Bạn tự tay niêm phong và ký tên lên tem bảo mật ngay tại nhà. Nhân viên kho chỉ bảo quản nguyên trạng bên ngoài, tuyệt đối không biết nội dung bên trong.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h2 className="font-serif text-xl font-bold text-[#7C4D2B] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#D96B43]" />
              Bước 4: Biên bản Bảo hiểm & Xác nhận Điều phối
            </h2>

            <div className="bg-[#FAF6F0] border border-[#E6DEC8] rounded-2xl p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6E6259]">Kỷ vật gửi lưu kho:</span>
                <span className="font-bold text-[#2C2523]">{boxName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6259]">Quy cách hộp bảo quản:</span>
                <span className="font-semibold text-[#7C4D2B]">{boxType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6259]">Thời hạn lưu trữ:</span>
                <span className="font-semibold">{duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6259]">Chi phí hộp chuyên dụng:</span>
                <span className="font-semibold">{formatVND(selectedBoxObj.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6259]">Phí nhân viên thu gom tận nhà:</span>
                <span className="font-semibold text-[#3B7A57]">
                  {pickupFee === 0 ? 'Miễn phí (Ưu đãi gói)' : formatVND(pickupFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6259]">Mức đền bù bảo hiểm cam kết:</span>
                <span className="font-bold text-[#3B7A57]">{formatVND(insuranceCover)}</span>
              </div>
              <div className="pt-3 border-t border-[#E6DEC8] flex justify-between items-center">
                <span className="font-bold text-base text-[#2C2523]">Tổng thanh toán:</span>
                <span className="font-serif text-2xl font-bold text-[#D96B43]">
                  {formatVND(totalAmount)}
                </span>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-white border border-[#E6DEC8]">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#D96B43]"
              />
              <span className="text-xs text-[#2C2523] leading-relaxed">
                Tôi đồng ý với <strong>Hợp đồng Dịch vụ Lưu trữ & Cam kết Bảo mật</strong> của Cửa Hàng Ký Ức. Kỷ vật không chứa chất cấm, chất dễ cháy nổ theo quy định pháp luật.
              </span>
            </label>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-full bg-[#D96B43] hover:bg-[#B84A24] text-white font-bold text-sm sm:text-base shadow-warm hover:shadow-warm-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-[#E5A93C]" />
              <span>Xác Nhận & Điều Phối Nhân Viên Đến Lấy Quà</span>
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 pt-4 border-t border-[#E6DEC8] flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
              step === 1
                ? 'opacity-40 cursor-not-allowed bg-[#FAF6F0] border-[#E6DEC8] text-[#6E6259]'
                : 'bg-white border-[#E6DEC8] text-[#7C4D2B] hover:bg-[#FAF6F0]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          {step < 4 && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#7C4D2B] hover:bg-[#5E391F] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
