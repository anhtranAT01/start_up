import React, { useState } from 'react';
import {
  ClipboardCheck,
  Truck,
  ShieldCheck,
  QrCode,
  Camera,
  MapPin,
  Phone,
  CheckCircle2,
  UserCheck,
  Lock,
  Users,
  Briefcase,
  Crown,
} from 'lucide-react';
import { SafeImage } from './SharedUI';

export default function ScreenDispatch({
  user,
  accounts,
  dispatchOrders,
  onUpdateDispatchStep,
  onSendInspectionReport,
}) {
  const [activeAdminTab, setActiveAdminTab] = useState('orders'); // 'orders' | 'users'

  // Strict Role Guard if current user is not Admin
  if (user?.role !== 'admin') {
    return null;
  }

  const safeOrders = Array.isArray(dispatchOrders) ? dispatchOrders : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const stepLabels = {
    1: 'Mới tạo lệnh — Chờ điều phối',
    2: 'Shipper đang đến lấy quà',
    3: 'Đã niêm phong kẹp chì tại nhà khách',
    4: 'Đã nhập kho & Gán vị trí kệ',
  };

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-[#1E3A5F] via-[#2B6CB0] to-[#1E4E8C] text-[#F6F2EB] rounded-3xl p-6 sm:p-7 shadow-warm-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#C9A166] text-xs font-bold mb-2">
            <ClipboardCheck className="w-4 h-4" />
            <span>Phân quyền Quản Trị Viên Hệ Thống: {user.name}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Trạm Điều Phối Kho & Quản Trị Phân Quyền
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1">
            Mọi thao tác nghiệp vụ tại đây đồng bộ trực tiếp vào Kho Lưu Trữ của từng tài khoản khách hàng tương ứng.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 text-center">
            <div className="text-[11px] text-white/75">Tổng đơn vận hành</div>
            <div className="font-serif text-2xl font-bold text-[#C9A166]">
              {safeOrders.length} Đơn
            </div>
          </div>
          <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 text-center">
            <div className="text-[11px] text-white/75">Tài khoản đăng ký</div>
            <div className="font-serif text-2xl font-bold text-white">
              {safeAccounts.length} User
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs for Admin */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveAdminTab('orders')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-2 ${
            activeAdminTab === 'orders'
              ? 'bg-[#2B6CB0] text-white shadow'
              : 'bg-white border border-[#D6BD95] text-[#748067]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Điều Phối Đơn Lấy Quà & Nhập Kho ({safeOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-2 ${
            activeAdminTab === 'users'
              ? 'bg-[#2B6CB0] text-white shadow'
              : 'bg-white border border-[#D6BD95] text-[#748067]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản Lý Tài Khoản & Phân Quyền ({safeAccounts.length})</span>
        </button>
      </div>

      {activeAdminTab === 'orders' ? (
        <div className="space-y-4">
          {safeOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-[#D6BD95] rounded-2xl p-5 shadow-warm space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#606E5A] text-white text-xs font-bold">
                      #{order.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F6F2EB] border border-[#D6BD95] text-[#606E5A] text-xs font-bold">
                      Mã hộp: #{order.vaultId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#2B6CB0]/10 text-[#2B6CB0] text-xs font-semibold">
                      Tài khoản: {order.ownerEmail}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                        order.step >= 4
                          ? 'bg-[#606E5A]/15 text-[#606E5A]'
                          : order.step >= 2
                          ? 'bg-[#2B6CB0]/15 text-[#2B6CB0]'
                          : 'bg-[#C9A166]/20 text-[#606E5A]'
                      }`}
                    >
                      {stepLabels[order.step]}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#2C3329] mt-2">
                    {order.itemName}
                  </h3>
                  <div className="text-xs text-[#748067] mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#606E5A]" />
                      Khách: <strong className="text-[#2C3329]">{order.customerName}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#C9A166]" />
                      {order.phone}
                    </span>
                    <span>
                      Lịch hẹn: <strong>{order.pickupDate}</strong> ({order.timeSlot})
                    </span>
                  </div>
                  <div className="text-xs text-[#748067] mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A166] shrink-0" />
                    <span>{order.address}</span>
                  </div>
                  {order.assignedLocation && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#606E5A]/10 border border-[#606E5A]/30 text-xs font-semibold text-[#606E5A]">
                      <CheckCircle2 className="w-4 h-4" />
                      Vị trí kệ đã gán: {order.assignedLocation}
                    </div>
                  )}
                </div>
              </div>

              {/* 4 Staff Operational Buttons */}
              <div className="pt-3 border-t border-[#D6BD95] flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => onUpdateDispatchStep(order.id, 2)}
                  disabled={order.step >= 2}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                    order.step >= 2
                      ? 'bg-[#2B6CB0]/15 text-[#2B6CB0] cursor-default'
                      : 'bg-[#2B6CB0] hover:bg-[#22558B] text-white shadow-sm'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{order.step >= 2 ? '✓ Shipper đã nhận đơn' : 'Shipper nhận đơn'}</span>
                </button>

                <button
                  onClick={() => onUpdateDispatchStep(order.id, 3)}
                  disabled={order.step < 2 || order.step >= 3}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                    order.step >= 3
                      ? 'bg-[#606E5A]/15 text-[#606E5A] cursor-default'
                      : order.step < 2
                      ? 'bg-[#F6F2EB] text-[#748067]/50 border border-[#D6BD95] cursor-not-allowed'
                      : 'bg-[#606E5A] hover:bg-[#5E391F] text-white shadow-sm'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {order.step >= 3
                      ? '✓ Đã niêm phong & lấy hàng'
                      : 'Xác nhận đã niêm phong & lấy hàng tại nhà khách'}
                  </span>
                </button>

                <button
                  onClick={() => onUpdateDispatchStep(order.id, 4)}
                  disabled={order.step < 3 || order.step >= 4}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                    order.step >= 4
                      ? 'bg-[#606E5A]/15 text-[#606E5A] cursor-default'
                      : order.step < 3
                      ? 'bg-[#F6F2EB] text-[#748067]/50 border border-[#D6BD95] cursor-not-allowed'
                      : 'bg-[#606E5A] hover:bg-[#4A5645] text-white shadow-sm'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>
                    {order.step >= 4
                      ? '✓ Đã nhập kho & gán kệ'
                      : 'Quét mã QR nhập kho & Gán vị trí kệ'}
                  </span>
                </button>

                <button
                  onClick={() => onSendInspectionReport(order.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#C9A166] hover:bg-[#B38B50] text-white text-xs font-semibold shadow-sm transition-colors ml-auto"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>
                    {order.lastReportSent
                      ? 'Gửi lại báo cáo ảnh chụp định kỳ'
                      : 'Gửi báo cáo ảnh chụp định kỳ cho khách'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#D6BD95] rounded-2xl p-6 shadow-warm">
          <h3 className="font-serif text-xl font-bold text-[#2C3329] mb-4">
            Danh Sách Tài Khoản & Phân Quyền Hệ Thống
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F6F2EB] border-b border-[#D6BD95]">
                  <th className="p-3 font-bold text-[#606E5A]">Người dùng</th>
                  <th className="p-3 font-bold text-[#606E5A]">Email / Liên hệ</th>
                  <th className="p-3 font-bold text-[#606E5A]">Gói dịch vụ</th>
                  <th className="p-3 font-bold text-[#606E5A]">Vai trò hệ thống</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6BD95]/70">
                {safeAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-[#F6F2EB]/50">
                    <td className="p-3 flex items-center gap-2.5 font-semibold text-[#2C3329]">
                      <SafeImage
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#D6BD95]"
                      />
                      <span>{acc.name}</span>
                    </td>
                    <td className="p-3 text-[#748067]">
                      <div>{acc.email}</div>
                      <div className="text-[11px]">{acc.phone}</div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C9A166]/20 text-[#606E5A] font-semibold">
                        <Crown className="w-3 h-3 text-[#C9A166]" />
                        {acc.tierName}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold ${
                          acc.role === 'admin'
                            ? 'bg-[#2B6CB0] text-white'
                            : 'bg-[#606E5A]/15 text-[#606E5A]'
                        }`}
                      >
                        {acc.role === 'admin' ? 'Quản Trị Viên Duy Nhất (Admin)' : 'Khách Hàng (User)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
