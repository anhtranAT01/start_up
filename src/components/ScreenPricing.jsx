import React, { useState } from 'react';
import { Crown, Check, Sparkles, X, QrCode, ShieldCheck } from 'lucide-react';
import { PRICING_TIERS, formatVND } from '../data/mockData';
import { QrCodeSvg } from './SharedUI';

export default function ScreenPricing({ user, onUpgradeTier, showToast }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [selectedTier, setSelectedTier] = useState(null);

  const getDisplayPrice = (tier) => {
    if (tier.monthlyPrice === 0) return { main: '0đ', unit: 'Miễn phí trọn đời' };
    if (tier.isOneTime) return { main: formatVND(tier.monthlyPrice), unit: 'Trọn đời / 10 năm' };
    if (billingCycle === 'yearly') {
      const discountedMonthly = Math.round(tier.monthlyPrice * 0.8);
      const yearlyTotal = discountedMonthly * 12;
      return {
        main: formatVND(discountedMonthly),
        unit: `/tháng (${formatVND(yearlyTotal)}/năm)`,
      };
    }
    return { main: formatVND(tier.monthlyPrice), unit: '/tháng' };
  };

  const handleConfirmPayment = () => {
    const cleanName = selectedTier.name.replace(/^\d+\.\s/, '');
    onUpgradeTier(selectedTier.id, cleanName);
    showToast(`Chúc mừng! Tài khoản của bạn đã được nâng cấp lên ${cleanName}!`);
    setSelectedTier(null);
  };

  return (
    <div className="space-y-8">
      {/* Header & Billing Toggle */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5A93C]/20 text-[#7C4D2B] text-xs font-bold mb-2">
          <Crown className="w-3.5 h-3.5 text-[#D96B43]" />
          Mô hình Dịch vụ Phygital Toàn Diện
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2523]">
          Chọn Không Gian Lưu Giữ Ký Ức Phù Hợp
        </h1>
        <p className="text-sm text-[#6E6259] mt-2">
          Từ những dòng nhật ký số đầu tiên đến rương bảo quản phòng lạnh 24/7 cho cả gia đình.
        </p>

        {/* Billing Toggle */}
        <div className="mt-5 inline-flex items-center p-1 rounded-full bg-white border border-[#E6DEC8] shadow-sm">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-[#7C4D2B] text-white shadow-sm'
                : 'text-[#6E6259] hover:text-[#2C2523]'
            }`}
          >
            Thanh toán theo Tháng
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-[#D96B43] text-white shadow-sm'
                : 'text-[#6E6259] hover:text-[#2C2523]'
            }`}
          >
            <span>Thanh toán theo Năm</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                billingCycle === 'yearly'
                  ? 'bg-white text-[#D96B43]'
                  : 'bg-[#3B7A57]/15 text-[#3B7A57]'
              }`}
            >
              Tiết kiệm 20%
            </span>
          </button>
        </div>
      </div>

      {/* 4 Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {PRICING_TIERS.map((tier) => {
          const price = getDisplayPrice(tier);
          const isCurrent = user.tierId === tier.id;
          return (
            <div
              key={tier.id}
              className={`rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
                tier.popular
                  ? 'bg-white border-2 border-[#D96B43] shadow-warm-lg'
                  : 'bg-white border border-[#E6DEC8] shadow-warm'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#D96B43] text-white text-[11px] font-bold shadow">
                  Phổ biến nhất
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-[#7C4D2B]">{tier.badge}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3B7A57]/15 text-[#3B7A57]">
                      Đang sử dụng
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2C2523]">{tier.name}</h3>
                <p className="text-xs text-[#6E6259] mt-1 min-h-[36px]">{tier.target}</p>

                <div className="my-4 pb-4 border-b border-[#E6DEC8]">
                  <span className="font-serif text-2xl font-bold text-[#D96B43]">
                    {price.main}
                  </span>
                  <span className="text-xs text-[#6E6259] ml-1">{price.unit}</span>
                </div>

                <ul className="space-y-2 text-xs text-[#2C2523]">
                  {tier.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#3B7A57] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedTier(tier)}
                disabled={isCurrent}
                className={`mt-6 w-full py-2.5 rounded-full text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-[#FAF6F0] text-[#3B7A57] border border-[#3B7A57]/30 cursor-default'
                    : tier.popular
                    ? 'bg-[#D96B43] hover:bg-[#B84A24] text-white shadow'
                    : 'bg-[#7C4D2B] hover:bg-[#5E391F] text-white'
                }`}
              >
                {isCurrent ? 'Gói Hiện Tại' : 'Đăng Ký / Nâng Cấp Ngay'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white border border-[#E6DEC8] rounded-2xl p-5 sm:p-6 shadow-warm overflow-hidden">
        <h2 className="font-serif text-xl font-bold text-[#2C2523] mb-4">
          Bảng So Sánh Chi Tiết Quyền Lợi Các Gói
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px] text-xs">
            <thead>
              <tr className="bg-[#FAF6F0] border-b border-[#E6DEC8]">
                <th className="p-3.5 font-bold text-[#7C4D2B] w-48">Tiêu chí / Tính năng</th>
                {PRICING_TIERS.map((t) => (
                  <th key={t.id} className="p-3.5 font-bold text-[#2C2523]">
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DEC8]/70">
              {[
                { label: 'Đối tượng phù hợp', key: 'target' },
                { label: 'Lưu trữ Kỷ vật Vật lý tại kho', key: 'physicalStorage' },
                { label: 'Dịch vụ Nhân viên lấy & giao quà', key: 'pickupDelivery' },
                { label: 'Công nghệ định danh (NFC / QR)', key: 'nfcQr' },
                { label: 'Dung lượng Ký ức Số', key: 'digitalQuota' },
                { label: 'Hộp thời gian & Lời nhắc', key: 'timeCapsule' },
                { label: 'Bảo hiểm & Cam kết an toàn', key: 'insurance' },
              ].map((row) => (
                <tr key={row.key} className="hover:bg-[#FAF6F0]/60">
                  <td className="p-3.5 font-semibold text-[#7C4D2B] align-top">{row.label}</td>
                  {PRICING_TIERS.map((t) => (
                    <td key={t.id} className="p-3.5 text-[#2C2523] align-top leading-relaxed">
                      {t[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Bank QR Payment Modal */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 bg-[#2C2523]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6DEC8] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTier(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E5A93C]/20 text-[#7C4D2B] text-[11px] font-bold mb-2">
                <QrCode className="w-3.5 h-3.5" />
                Thanh toán VietQR giả lập
              </span>
              <h3 className="font-serif text-xl font-bold text-[#2C2523]">
                Nâng Cấp {selectedTier.name.replace(/^\d+\.\s/, '')}
              </h3>
              <p className="text-xs text-[#6E6259] mt-1">
                Quét mã QR bằng ứng dụng ngân hàng để kích hoạt gói ngay lập tức.
              </p>

              <div className="my-5 flex flex-col items-center">
                <QrCodeSvg value={`PAY-${selectedTier.id}-${billingCycle}`} size={160} />
                <div className="mt-3 text-sm font-bold text-[#D96B43]">
                  Số tiền: {getDisplayPrice(selectedTier).main} {getDisplayPrice(selectedTier).unit}
                </div>
                <div className="text-[11px] text-[#6E6259]">
                  Nội dung CK: <strong>KYUC {user.phone.replace(/\s/g, '')}</strong>
                </div>
              </div>

              <button
                onClick={handleConfirmPayment}
                className="w-full py-3 rounded-full bg-[#3B7A57] hover:bg-[#2F6346] text-white text-xs sm:text-sm font-bold shadow flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Xác Nhận Đã Chuyển Khoản & Kích Hoạt Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
