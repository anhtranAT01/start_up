import React from 'react';
import {
  Newspaper,
  Truck,
  Vault,
  Hourglass,
  Crown,
  ClipboardCheck,
  ShieldCheck,
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    id: 'feed',
    label: 'Bảng Tin Ký Ức',
    shortLabel: 'Bảng Tin',
    sub: 'Mạng xã hội hoài niệm',
    icon: Newspaper,
  },
  {
    id: 'pickup',
    label: 'Đặt Lịch Gửi Quà',
    shortLabel: 'Gửi Quà',
    sub: 'Nhân viên đến lấy',
    icon: Truck,
  },
  {
    id: 'vault',
    label: 'Kho Lưu Trữ Của Tôi',
    shortLabel: 'Kho Kỷ Vật',
    sub: 'Quản lý quà & dữ liệu',
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
    sub: 'Nâng cấp tài khoản',
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
        <div className="bg-white border border-[#E6DEC8] rounded-2xl p-3 shadow-warm">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6259]">
              Không gian điều hướng
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isUserAdmin
                  ? 'bg-[#2B6CB0]/15 text-[#2B6CB0]'
                  : 'bg-[#3B7A57]/15 text-[#3B7A57]'
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
                      ? item.isAdmin
                        ? 'bg-gradient-to-r from-[#2B6CB0] to-[#1E4E8C] text-white shadow-md'
                        : 'bg-gradient-to-r from-[#7C4D2B] to-[#59341B] text-white shadow-md'
                      : 'text-[#2C2523] hover:bg-[#FAF6F0]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-white/15 text-[#E5A93C]'
                        : item.isAdmin
                        ? 'bg-[#2B6CB0]/10 text-[#2B6CB0]'
                        : 'bg-[#FAF6F0] text-[#7C4D2B]'
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
                        isActive ? 'text-white/80' : 'text-[#6E6259]'
                      }`}
                    >
                      {item.sub}
                    </div>
                  </div>
                  {item.id === 'vault' && vaultCount > 0 && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-[#E5A93C] text-[#2C2523]' : 'bg-[#FAF6F0] text-[#7C4D2B]'
                      }`}
                    >
                      {vaultCount}
                    </span>
                  )}
                  {item.id === 'dispatch' && isUserAdmin && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#2B6CB0] text-white border border-white/20">
                      {pendingDispatchCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Trust Commitment Box */}
        <div className="bg-gradient-to-br from-[#7C4D2B] via-[#633B1F] to-[#472914] text-[#FAF6F0] rounded-2xl p-4 shadow-warm relative overflow-hidden">
          <div className="flex items-center gap-2 text-[#E5A93C] font-semibold text-xs mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Cam Kết Bảo Mật Kép</span>
          </div>
          <p className="text-xs text-white/85 leading-relaxed">
            Mọi kỷ vật đều được khách hàng tự tay niêm phong kẹp chì tại nhà. Kho lưu trữ đạt chuẩn nhiệt độ 22°C & chống ẩm 45%.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6DEC8] px-1 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl min-w-[54px] transition-colors ${
                isActive ? 'text-[#D96B43] font-semibold' : 'text-[#6E6259]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#D96B43]' : ''}`} />
              <span className="text-[10px] mt-0.5 truncate max-w-[58px]">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
