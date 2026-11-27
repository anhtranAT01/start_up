import React from 'react';
import {
  Newspaper,
  Truck,
  Vault,
  Hourglass,
  Crown,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    id: 'feed',
    label: 'Bảng Tin Ký Ức',
    shortLabel: 'Bảng Tin',
    sub: 'Mạng xã hội hoài niệm Moclant',
    icon: Newspaper,
  },
  {
    id: 'pickup',
    label: 'Đặt Lịch Gửi Quà',
    shortLabel: 'Gửi Quà',
    sub: 'Nhân viên đến lấy tại nhà',
    icon: Truck,
  },
  {
    id: 'vault',
    label: 'Kho Lưu Trữ Của Tôi',
    shortLabel: 'Kho Kỷ Vật',
    sub: 'Quản lý quà & dữ liệu NFC',
    icon: Vault,
  },
  {
    id: 'capsule',
    label: 'Hộp Thời Gian & Lời Nhắc',
    shortLabel: 'Thời Gian',
    sub: 'Đếm ngược kỷ niệm',
    icon: Hourglass,
  },
  {
    id: 'pricing',
    label: 'Gói Dịch Vụ & Bảng Giá',
    shortLabel: 'Bảng Giá',
    sub: 'Nâng cấp tài khoản Moclant',
    icon: Crown,
  },
  {
    id: 'dispatch',
    label: 'Trạm Điều Phối Kho',
    shortLabel: 'Điều Phối',
    sub: 'Quản trị & Điều phối kho',
    icon: ClipboardCheck,
    isAdmin: true,
  },
];

export default function Sidebar({
  user,
  activeScreen,
  onNavigate,
  vaultCount,
  pendingDispatchCount,
}) {
  const isUserAdmin = user?.role === 'admin';

  // Hide 'dispatch' completely from regular users
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.isAdmin || isUserAdmin);

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-20 self-start gap-3">
        <div className="bg-white border border-[#D6BD95] rounded-2xl p-3 shadow-warm">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#748067]">
              Không gian Moclant
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isUserAdmin
                  ? 'bg-[#606E5A] text-white'
                  : 'bg-[#EAE1D4] text-[#606E5A] border border-[#D6BD95]'
              }`}
            >
              {isUserAdmin ? 'ADMIN' : 'KHÁCH HÀNG'}
            </span>
          </div>

          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#606E5A] to-[#4A5645] text-[#F6F2EB] shadow-md border border-[#C9A166]/40'
                      : 'text-[#2C3329] hover:bg-[#F6F2EB]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-white/15 text-[#C9A166]'
                        : 'bg-[#F6F2EB] text-[#606E5A] border border-[#D6BD95]/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                      <span>{item.label}</span>
                    </div>
                    <div
                      className={`text-[11px] truncate ${
                        isActive ? 'text-[#EAE1D4]/90' : 'text-[#748067]'
                      }`}
                    >
                      {item.sub}
                    </div>
                  </div>
                  {item.id === 'vault' && vaultCount > 0 && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-[#C9A166] text-white'
                          : 'bg-[#EAE1D4] text-[#606E5A] border border-[#D6BD95]'
                      }`}
                    >
                      {vaultCount}
                    </span>
                  )}
                  {item.id === 'dispatch' && isUserAdmin && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#C9A166] text-white border border-white/20">
                      {pendingDispatchCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Trust Commitment Card */}
        <div className="bg-gradient-to-br from-[#606E5A] via-[#53604D] to-[#3F4A3B] text-[#F6F2EB] rounded-2xl p-4 shadow-warm relative overflow-hidden border border-[#C9A166]/40">
          <div className="flex items-center gap-1.5 text-[#D6BD95] font-semibold text-xs mb-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C9A166]" />
            <span>Cam Kết Bảo Mật Kép</span>
          </div>
          <p className="text-xs text-[#EAE1D4]/90 leading-relaxed">
            Mọi kỷ vật đều được niêm phong bảo mật tại nhà. Kho lưu trữ đạt chuẩn nhiệt độ 22°C & chống ẩm 45%.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D6BD95] px-1 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(96,110,90,0.08)]">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl min-w-[54px] transition-colors ${
                isActive ? 'text-[#606E5A] font-bold' : 'text-[#748067]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#C9A166]' : ''}`} />
              <span className="text-[10px] mt-0.5 truncate max-w-[58px]">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
