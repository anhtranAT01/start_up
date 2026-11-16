import React, { useState, useEffect } from 'react';
import {
  Hourglass,
  Lock,
  Unlock,
  KeyRound,
  Plus,
  Bell,
  Mail,
  MessageSquare,
  Truck,
  Users,
  X,
  CalendarClock,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

function CountdownClock({ targetDate }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, new Date(targetDate).getTime() - now);
  const totalSec = Math.floor(diff / 1000);
  const years = Math.floor(totalSec / (365 * 24 * 3600));
  const remAfterYears = totalSec % (365 * 24 * 3600);
  const days = Math.floor(remAfterYears / (24 * 3600));
  const remAfterDays = remAfterYears % (24 * 3600);
  const hours = Math.floor(remAfterDays / 3600);
  const mins = Math.floor((remAfterDays % 3600) / 60);
  const secs = remAfterDays % 60;

  const pad = (n, len = 2) => String(n).padStart(len, '0');

  return (
    <div className="bg-[#2C2523] text-[#FAF6F0] rounded-xl p-3 font-mono text-xs sm:text-sm flex flex-wrap items-center justify-center gap-1.5 shadow-inner">
      <span className="text-[#E5A93C] font-sans text-xs font-semibold mr-1">Còn lại:</span>
      <span className="px-2 py-1 rounded bg-white/10 font-bold">{pad(years)} Năm</span>
      <span>:</span>
      <span className="px-2 py-1 rounded bg-white/10 font-bold">{pad(days, 3)} Ngày</span>
      <span>:</span>
      <span className="px-2 py-1 rounded bg-white/10 font-bold">{pad(hours)} Giờ</span>
      <span>:</span>
      <span className="px-2 py-1 rounded bg-white/10 font-bold">{pad(mins)} Phút</span>
      <span>:</span>
      <span className="px-2 py-1 rounded bg-[#D96B43] font-bold">{pad(secs)} Giây</span>
    </div>
  );
}

export default function ScreenTimeCapsule({
  user,
  capsules,
  setCapsules,
  reminders,
  setReminders,
  vaultItems,
  showToast,
}) {
  const [otpModalCapsule, setOtpModalCapsule] = useState(null);
  const [otpInput, setOtpInput] = useState('');

  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(
    vaultItems[0] ? `${vaultItems[0].name} (#${vaultItems[0].id})` : 'Hộp kỷ vật #MK-1024'
  );
  const [scheduleType, setScheduleType] = useState('Sau 3 năm');
  const [channels, setChannels] = useState(['Thông báo App', 'Gửi Email cổ điển']);
  const [autoShip, setAutoShip] = useState(true);
  const [recipients, setRecipients] = useState('');

  const handleUnlockOtp = () => {
    if (otpInput.trim() !== '123456') {
      showToast('Mã OTP không đúng! Vui lòng nhập 123456 để mở khóa khẩn cấp.', 'error');
      return;
    }
    setCapsules(
      capsules.map((c) => (c.id === otpModalCapsule.id ? { ...c, unlocked: true } : c))
    );
    showToast(`Đã mở khóa sớm Hộp Thời Gian "${otpModalCapsule.title}"!`);
    setOtpInput('');
    setOtpModalCapsule(null);
  };

  const toggleChannel = (ch) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((item) => item !== ch) : [...prev, ch]
    );
  };

  const handleSaveReminder = () => {
    const newRem = {
      id: `REM-${String(Date.now()).slice(-4)}`,
      ownerEmail: user?.email || 'minhanh.kyuc@gmail.com',
      targetName: selectedTarget,
      scheduleType,
      channels: channels.length ? channels : ['Thông báo App'],
      autoShip,
      recipients: recipients.trim() || `${user?.name || 'Chủ tài khoản'} (${user?.phone || ''})`,
    };
    setReminders((prev) => [newRem, ...prev]);
    showToast('Đã lưu Lời Nhắc & đồng bộ vào tài khoản của bạn!');
    setShowNewModal(false);
    setRecipients('');
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Active Time Capsules */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#2C2523] flex items-center gap-2">
              <Hourglass className="w-6 h-6 text-[#9B2C2C]" />
              Hộp Thời Gian Đang Khóa (Time Capsules)
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6259] mt-0.5">
              Những mảnh ký ức đang ngủ yên chờ đúng ngày hẹn để đánh thức.
            </p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#D96B43] hover:bg-[#B84A24] text-white text-xs sm:text-sm font-semibold shadow transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Lời Nhắc & Hộp Thời Gian Mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {capsules.map((cap) => (
            <div
              key={cap.id}
              className="bg-white border border-[#E6DEC8] rounded-2xl p-5 shadow-warm flex flex-col justify-between gap-4 relative overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        cap.unlocked
                          ? 'bg-[#3B7A57]/15 text-[#3B7A57]'
                          : 'bg-[#9B2C2C]/10 text-[#9B2C2C]'
                      }`}
                    >
                      {cap.unlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#7C4D2B]">
                        Mã hộp #{cap.vaultId}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#2C2523]">
                        {cap.title}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      cap.unlocked
                        ? 'bg-[#3B7A57]/15 text-[#3B7A57] border-[#3B7A57]/30'
                        : cap.lockType === 'strict'
                        ? 'bg-[#9B2C2C]/15 text-[#9B2C2C] border-[#9B2C2C]/30'
                        : 'bg-[#E5A93C]/20 text-[#7C4D2B] border-[#E5A93C]/50'
                    }`}
                  >
                    {cap.unlocked
                      ? 'Đã mở khóa'
                      : cap.lockType === 'strict'
                      ? 'Khóa Cứng (Strict Lock)'
                      : 'Cho phép mở khẩn cấp'}
                  </span>
                </div>

                {/* Real-time Countdown */}
                {!cap.unlocked && <CountdownClock targetDate={cap.targetDate} />}

                <div className="mt-3 text-xs text-[#6E6259] flex items-center justify-between">
                  <span>
                    Mở khóa mục tiêu: <strong className="text-[#2C2523]">{cap.targetDateLabel}</strong>
                  </span>
                  <span>Kênh đánh thức: {cap.channel}</span>
                </div>

                {/* Blurred Secret Overlay */}
                <div className="mt-3 p-4 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] relative">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#7C4D2B] mb-1">
                    Nội dung bí mật bên trong
                  </div>
                  <p
                    className={`text-xs text-[#2C2523] leading-relaxed transition-all duration-500 ${
                      cap.unlocked ? '' : 'blur-[5px] select-none'
                    }`}
                  >
                    {cap.secretPreview}
                  </p>
                  {!cap.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#FAF6F0]/30 rounded-xl">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#E6DEC8] text-[11px] font-bold text-[#9B2C2C] shadow-sm">
                        <Lock className="w-3.5 h-3.5" /> Đang niêm phong bí mật
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lock Action */}
              <div className="pt-3 border-t border-[#E6DEC8] flex items-center justify-between gap-2">
                {cap.unlocked ? (
                  <span className="text-xs font-semibold text-[#3B7A57] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#E5A93C]" />
                    Đã mở khóa thành công!
                  </span>
                ) : cap.lockType === 'strict' ? (
                  <div className="w-full flex items-center justify-between gap-2">
                    <button
                      disabled
                      className="px-4 py-2 rounded-full bg-[#E6DEC8]/60 text-[#6E6259] text-xs font-semibold cursor-not-allowed inline-flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Mở khóa
                    </button>
                    <span className="text-[11px] text-[#9B2C2C] font-medium flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Không thể mở trước ngày hẹn
                    </span>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#6E6259]">
                      Có thể mở sớm khi thật sự cần thiết
                    </span>
                    <button
                      onClick={() => setOtpModalCapsule(cap)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7C4D2B] hover:bg-[#D96B43] text-white text-xs font-semibold transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Mở khóa sớm bằng OTP</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Recurring Reminders List */}
      <section className="bg-white border border-[#E6DEC8] rounded-2xl p-6 shadow-warm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2C2523] flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-[#D96B43]" />
              Danh Sách Lời Nhắc Kỷ Niệm Định Kỳ
            </h2>
            <p className="text-xs text-[#6E6259] mt-0.5">
              Hệ thống tự động gửi thông báo hoặc xuất kho giao quà đúng ngày bạn đã hẹn.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="p-4 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-semibold text-sm text-[#2C2523]">{rem.targetName}</div>
                <div className="text-xs text-[#7C4D2B] font-medium">{rem.scheduleType}</div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6E6259]">
                  <span className="inline-flex items-center gap-1">
                    <Bell className="w-3 h-3 text-[#D96B43]" />
                    {rem.channels.join(' • ')}
                  </span>
                  <span>|</span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#7C4D2B]" />
                    Đồng nhận: {rem.recipients}
                  </span>
                </div>
              </div>

              {rem.autoShip && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3B7A57]/15 text-[#3B7A57] text-xs font-semibold shrink-0 self-start sm:self-center">
                  <Truck className="w-3.5 h-3.5" />
                  Tự động ship hộp vật lý đúng hẹn
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Emergency OTP Modal */}
      {otpModalCapsule && (
        <div className="fixed inset-0 z-50 bg-[#2C2523]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6DEC8] rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-[#2C2523] mb-1">
              Xác Nhận Mở Khóa Khẩn Cấp
            </h3>
            <p className="text-xs text-[#6E6259] mb-4">
              Nhập mã OTP giả lập <strong className="text-[#D96B43]">123456</strong> để mở khóa sớm{' '}
              <strong>{otpModalCapsule.title}</strong>.
            </p>
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="Nhập mã OTP (123456)"
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-center font-mono text-lg tracking-widest focus:outline-none focus:border-[#D96B43]"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setOtpModalCapsule(null)}
                className="px-4 py-2 rounded-full border border-[#E6DEC8] text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleUnlockOtp}
                className="px-5 py-2 rounded-full bg-[#D96B43] text-white text-xs font-semibold"
              >
                Xác nhận mở khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Reminder Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-[#2C2523]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E6DEC8] rounded-2xl max-w-lg w-full p-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-[#2C2523]">
                Tạo Lời Nhắc & Hộp Thời Gian Mới
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF6F0] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Chọn hộp kỷ vật hoặc bài viết</label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8]"
                >
                  {vaultItems.map((v) => (
                    <option key={v.id} value={`${v.name} (#${v.id})`}>
                      {v.name} (#{v.id})
                    </option>
                  ))}
                  <option value="Thư viết cho bản thân năm 30 tuổi">
                    Thư viết cho bản thân năm 30 tuổi
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1.5">Thời điểm đánh thức</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Định kỳ hàng năm vào ngày kỷ niệm',
                    'Sau 1 năm',
                    'Sau 3 năm',
                    'Sau 5 năm',
                    'Sau 10 năm',
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setScheduleType(opt)}
                      className={`px-3 py-1.5 rounded-full border font-semibold ${
                        scheduleType === opt
                          ? 'bg-[#7C4D2B] text-white border-[#7C4D2B]'
                          : 'bg-[#FAF6F0] border-[#E6DEC8]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1.5">Kênh thông báo</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Thông báo App', icon: Bell },
                    { label: 'Gửi Email cổ điển', icon: Mail },
                    { label: 'Tin nhắn SMS/Zalo', icon: MessageSquare },
                  ].map((ch) => {
                    const Icon = ch.icon;
                    const active = channels.includes(ch.label);
                    return (
                      <button
                        type="button"
                        key={ch.label}
                        onClick={() => toggleChannel(ch.label)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-semibold ${
                          active
                            ? 'bg-[#D96B43] text-white border-[#D96B43]'
                            : 'bg-[#FAF6F0] border-[#E6DEC8]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#3B7A57]/10 border border-[#3B7A57]/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoShip}
                  onChange={(e) => setAutoShip(e.target.checked)}
                  className="mt-0.5 accent-[#3B7A57]"
                />
                <span className="font-semibold text-[#3B7A57]">
                  Tự động xuất kho và giao hộp quà vật lý về tận nhà vào đúng ngày mở khóa
                </span>
              </label>

              <div>
                <label className="block font-semibold mb-1">
                  Danh sách Email / SĐT của những người đồng nhận
                </label>
                <input
                  type="text"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  placeholder="VD: baongoc@gmail.com, 0988123456"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-full border border-[#E6DEC8] text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveReminder}
                className="px-5 py-2 rounded-full bg-[#D96B43] text-white text-xs font-semibold"
              >
                Lưu Lời Nhắc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
