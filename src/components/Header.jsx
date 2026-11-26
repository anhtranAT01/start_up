import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Thermometer,
  Droplets,
  ShieldCheck,
  Crown,
  Clock,
  LogOut,
  ChevronDown,
  Briefcase,
  Camera,
  Database,
} from 'lucide-react';
import { SafeImage, MoclantLogo } from './SharedUI';

export default function Header({
  user,
  onEditProfile,
  onLogout,
  searchQuery,
  setSearchQuery,
  onNewPickup,
  remindersCount,
  notifications,
  onNavigate,
  onOpenSupabaseConfig,
  isSupabaseConnected,
}) {
  const [showNotif, setShowNotif] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#D6BD95] shadow-[0_4px_20px_-4px_rgba(96,110,90,0.12)]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-3">
        {/* Official Moclant Magnolia Brand Logo */}
        <button
          onClick={() => onNavigate('feed')}
          className="flex items-center gap-3 text-left shrink-0 group"
          title="Moclant • Cửa Hàng Ký Ức"
        >
          <MoclantLogo size="md" showText={true} />
        </button>

        {/* Quick Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#748067] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kỷ niệm Moclant, hoa mộc lan hoặc mã hộp (#MK-8899)..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#F6F2EB] border border-[#D6BD95] rounded-full text-[#2C3329] placeholder-[#748067]/75 focus:outline-none focus:ring-2 focus:ring-[#C9A166]/40 focus:border-[#606E5A] transition-all"
            />
          </div>
        </div>

        {/* Live Warehouse Sensor Status */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#606E5A]/10 to-[#748067]/15 border border-[#606E5A]/30 text-xs font-medium text-[#606E5A]">
          <span className="w-2 h-2 rounded-full bg-[#606E5A] animate-ping" />
          <span className="font-semibold">Kho Moclant Trung Tâm:</span>
          <span className="inline-flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-[#C9A166]" /> Nhiệt độ 22°C
          </span>
          <span className="opacity-40">|</span>
          <span className="inline-flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-[#748067]" /> Độ ẩm 45%
          </span>
          <span className="inline-flex items-center gap-1 font-semibold">
            - <ShieldCheck className="w-3.5 h-3.5 text-[#606E5A]" /> An toàn
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Supabase Cloud DB Connection Button */}
          <button
            onClick={onOpenSupabaseConfig}
            className={`relative w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
              isSupabaseConnected
                ? 'bg-[#606E5A]/15 border-[#606E5A]/40 text-[#606E5A] hover:bg-[#606E5A]/25'
                : 'bg-[#F6F2EB] border-[#D6BD95] text-[#606E5A] hover:bg-[#EAE1D4]'
            }`}
            title={
              isSupabaseConnected
                ? 'Cơ sở dữ liệu Supabase: Đang kết nối vĩnh viễn trên đám mây'
                : 'Kết nối Cơ sở dữ liệu Supabase đám mây'
            }
          >
            <Database className="w-4 h-4" />
            <span
              className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-[#606E5A]' : 'bg-[#C9A166]'
              }`}
            />
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotif(!showNotif);
                setShowAccountMenu(false);
              }}
              className="relative w-10 h-10 rounded-full bg-[#F6F2EB] border border-[#D6BD95] flex items-center justify-center text-[#606E5A] hover:bg-[#EAE1D4] transition-colors"
              title="Lời nhắc kỷ niệm sắp tới"
            >
              <Bell className="w-4 h-4" />
              {remindersCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C9A166] text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {remindersCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#D6BD95] rounded-2xl shadow-warm-lg p-4 z-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-serif font-bold text-sm text-[#606E5A]">
                    Lời Nhắc Kỷ Niệm Của {user?.name || 'Bạn'}
                  </h4>
                  <button
                    onClick={() => {
                      setShowNotif(false);
                      onNavigate('capsule');
                    }}
                    className="text-xs text-[#C9A166] font-semibold hover:underline"
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {!notifications || notifications.length === 0 ? (
                    <div className="text-xs text-[#748067] py-3 text-center">
                      Chưa có lời nhắc nào cho tài khoản này.
                    </div>
                  ) : (
                    (Array.isArray(notifications) ? notifications : []).map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-[#F6F2EB] border border-[#D6BD95]/70 text-xs"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-[#606E5A] mb-0.5">
                          <Clock className="w-3.5 h-3.5 text-[#C9A166]" />
                          {n.targetName}
                        </div>
                        <div className="text-[#748067]">{n.scheduleType}</div>
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
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-[#606E5A] to-[#4A5645] hover:from-[#C9A166] hover:to-[#B38B50] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all border border-[#C9A166]/40"
          >
            <Plus className="w-4 h-4 text-[#D6BD95]" />
            <span>Gửi Kỷ Vật Ngay</span>
          </button>

          {/* User Avatar & Account Profile Dropdown */}
          <div className="relative pl-2 border-l border-[#D6BD95]">
            <button
              onClick={() => {
                setShowAccountMenu(!showAccountMenu);
                setShowNotif(false);
              }}
              className="flex items-center gap-2.5 text-left group p-1 rounded-full hover:bg-[#F6F2EB] transition-colors"
            >
              <SafeImage
                src={user.avatar}
                alt={user.name}
                className={`w-9 h-9 rounded-full object-cover border-2 ${
                  isAdmin ? 'border-[#606E5A]' : 'border-[#C9A166]'
                }`}
              />
              <div className="hidden lg:block leading-tight">
                <div className="text-xs font-bold text-[#2C3329] flex items-center gap-1">
                  <span>{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#748067]" />
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? 'bg-[#606E5A]/15 text-[#606E5A]'
                      : 'bg-[#EAE1D4] text-[#606E5A] border border-[#D6BD95]'
                  }`}
                >
                  {isAdmin ? (
                    <>
                      <Briefcase className="w-2.5 h-2.5" /> QUẢN TRỊ VIÊN
                    </>
                  ) : (
                    <>
                      <Crown className="w-2.5 h-2.5 text-[#C9A166]" /> {user.tierName}
                    </>
                  )}
                </span>
              </div>
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#D6BD95] rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                <div className="pb-2.5 border-b border-[#D6BD95]">
                  <div className="text-xs font-bold text-[#2C3329]">{user.name}</div>
                  <div className="text-[11px] text-[#748067]">{user.email}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAdmin
                          ? 'bg-[#606E5A] text-white'
                          : 'bg-[#748067]/15 text-[#606E5A]'
                      }`}
                    >
                      {isAdmin ? 'Quản Trị Viên' : 'Khách Hàng'}
                    </span>
                    <span className="text-[10px] font-semibold text-[#606E5A]">
                      • {user.tierName}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      onEditProfile && onEditProfile();
                    }}
                    className="w-full py-2 rounded-xl bg-[#EAE1D4] hover:bg-[#D6BD95]/60 text-xs font-semibold text-[#606E5A] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#C9A166]" />
                    <span>Đổi ảnh đại diện & Hồ sơ</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAccountMenu(false);
                      onOpenSupabaseConfig && onOpenSupabaseConfig();
                    }}
                    className="w-full py-2 rounded-xl bg-[#606E5A]/10 hover:bg-[#606E5A]/20 text-xs font-semibold text-[#606E5A] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Cấu hình Supabase Cloud</span>
                  </button>
                  {!isAdmin && (
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        onNavigate('pricing');
                      }}
                      className="w-full py-2 rounded-xl bg-[#F6F2EB] hover:bg-[#EAE1D4] text-xs font-semibold text-[#606E5A] transition-colors border border-[#D6BD95]/50"
                    >
                      Nâng cấp gói dịch vụ Moclant
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
      <div className="xl:hidden bg-[#EAE1D4]/70 border-t border-[#D6BD95] px-4 py-1 flex items-center justify-center gap-2 text-[11px] text-[#606E5A] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-[#606E5A]" />
        <span>Kho Moclant Trung Tâm: 22°C | Độ ẩm 45% - An toàn</span>
      </div>
    </header>
  );
}
