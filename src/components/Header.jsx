import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Thermometer,
  Droplets,
  ShieldCheck,
  Archive,
  Sparkles,
  Crown,
  Clock,
  LogOut,
  ChevronDown,
  Briefcase,
} from 'lucide-react';
import { SafeImage } from './SharedUI';

export default function Header({
  user,
  onLogout,
  searchQuery,
  setSearchQuery,
  onNewPickup,
  remindersCount,
  notifications,
  onNavigate,
}) {
  const [showNotif, setShowNotif] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E6DEC8] shadow-[0_4px_20px_-4px_rgba(124,77,43,0.08)]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <button
          onClick={() => onNavigate('feed')}
          className="flex items-center gap-3 text-left shrink-0 group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C4D2B] via-[#663D20] to-[#4A2B15] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform ring-2 ring-[#E5A93C]/30">
            <Archive className="w-5 h-5 text-[#FAF6F0]" />
            <Sparkles className="w-3.5 h-3.5 text-[#E5A93C] absolute -top-1 -right-1 drop-shadow-[0_0_6px_rgba(229,169,60,0.9)] animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <div className="font-serif text-lg font-bold text-[#2C2523] leading-tight tracking-tight">
              Cửa Hàng Ký Ức
            </div>
            <div className="text-[11px] text-[#6E6259] italic">
              Gói ghém khoảnh khắc, Chạm để quay về
            </div>
          </div>
        </button>

        {/* Quick Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kỷ niệm, câu chuyện hoặc mã hộp (#MK-1024)..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#FAF6F0] border border-[#E6DEC8] rounded-full text-[#2C2523] placeholder-[#6E6259]/70 focus:outline-none focus:ring-2 focus:ring-[#D96B43]/30 focus:border-[#D96B43] transition-all"
            />
          </div>
        </div>

        {/* Live Warehouse Sensor Status */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#3B7A57]/10 to-[#3B7A57]/15 border border-[#3B7A57]/25 text-xs font-medium text-[#3B7A57]">
          <span className="w-2 h-2 rounded-full bg-[#3B7A57] animate-ping" />
          <span className="font-semibold">Cảm biến Kho Trung Tâm:</span>
          <span className="inline-flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5" /> Nhiệt độ 22°C
          </span>
          <span className="opacity-40">|</span>
          <span className="inline-flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5" /> Độ ẩm 45%
          </span>
          <span className="inline-flex items-center gap-1 font-semibold">
            - <ShieldCheck className="w-3.5 h-3.5" /> An toàn
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotif(!showNotif);
                setShowAccountMenu(false);
              }}
              className="relative w-10 h-10 rounded-full bg-[#FAF6F0] border border-[#E6DEC8] flex items-center justify-center text-[#7C4D2B] hover:bg-[#F3E9D8] transition-colors"
              title="Lời nhắc kỷ niệm sắp tới"
            >
              <Bell className="w-4 h-4" />
              {remindersCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#9B2C2C] text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {remindersCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E6DEC8] rounded-2xl shadow-warm-lg p-4 z-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif font-bold text-sm text-[#2C2523]">
                    Lời Nhắc Kỷ Niệm Của {user.name}
                  </h4>
                  <button
                    onClick={() => {
                      setShowNotif(false);
                      onNavigate('capsule');
                    }}
                    className="text-xs text-[#D96B43] font-medium hover:underline"
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-xs text-[#6E6259] py-3 text-center">
                      Chưa có lời nhắc nào cho tài khoản này.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8]/70 text-xs"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-[#7C4D2B] mb-0.5">
                          <Clock className="w-3.5 h-3.5 text-[#E5A93C]" />
                          {n.targetName}
                        </div>
                        <div className="text-[#6E6259]">{n.scheduleType}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA */}
          <button
            onClick={onNewPickup}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-[#D96B43] to-[#B84A24] hover:from-[#B84A24] hover:to-[#9B3B1B] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Gửi Kỷ Vật Ngay</span>
          </button>

          {/* User Avatar & Account Profile Dropdown */}
          <div className="relative pl-2 border-l border-[#E6DEC8]">
            <button
              onClick={() => {
                setShowAccountMenu(!showAccountMenu);
                setShowNotif(false);
              }}
              className="flex items-center gap-2.5 text-left group p-1 rounded-full hover:bg-[#FAF6F0] transition-colors"
            >
              <SafeImage
                src={user.avatar}
                alt={user.name}
                className={`w-9 h-9 rounded-full object-cover border-2 ${
                  isAdmin ? 'border-[#2B6CB0]' : 'border-[#E5A93C]'
                }`}
              />
              <div className="hidden lg:block leading-tight">
                <div className="text-xs font-bold text-[#2C2523] flex items-center gap-1">
                  <span>{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6E6259]" />
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-[#2B6CB0]/15 text-[#2B6CB0]'
                      : 'bg-[#E5A93C]/25 text-[#7C4D2B]'
                  }`}
                >
                  {isAdmin ? (
                    <>
                      <Briefcase className="w-2.5 h-2.5" /> QUẢN TRỊ VIÊN
                    </>
                  ) : (
                    <>
                      <Crown className="w-2.5 h-2.5 text-[#D96B43]" /> {user.tierName}
                    </>
                  )}
                </span>
              </div>
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E6DEC8] rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                <div className="pb-2.5 border-b border-[#E6DEC8]">
                  <div className="text-xs font-bold text-[#2C2523]">{user.name}</div>
                  <div className="text-[11px] text-[#6E6259]">{user.email}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAdmin
                          ? 'bg-[#2B6CB0] text-white'
                          : 'bg-[#3B7A57]/15 text-[#3B7A57]'
                      }`}
                    >
                      {isAdmin ? 'Quản Trị Viên' : 'Khách Hàng'}
                    </span>
                    <span className="text-[10px] font-semibold text-[#7C4D2B]">
                      • {user.tierName}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  {!isAdmin && (
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        onNavigate('pricing');
                      }}
                      className="w-full py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#F3E9D8] text-xs font-semibold text-[#7C4D2B] transition-colors"
                    >
                      Nâng cấp gói dịch vụ
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      onLogout();
                    }}
                    className="w-full py-2 rounded-xl bg-[#9B2C2C]/10 hover:bg-[#9B2C2C]/20 text-xs font-semibold text-[#9B2C2C] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất tài khoản</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sensor Banner */}
      <div className="xl:hidden bg-[#3B7A57]/10 border-t border-[#3B7A57]/20 px-4 py-1 flex items-center justify-center gap-2 text-[11px] text-[#3B7A57] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3B7A57]" />
        <span>Kho Trung Tâm: 22°C | Độ ẩm 45% - An toàn</span>
      </div>
    </header>
  );
}
