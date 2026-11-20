import React, { useState } from 'react';
import {
  Archive,
  Sparkles,
  ShieldCheck,
  Lock,
  User,
  Phone,
  ArrowRight,
  Crown,
  Thermometer,
  Droplets,
  X,
  Mail,
} from 'lucide-react';

export default function AuthScreen({
  accounts,
  onLoginSuccess,
  onRegisterAccount,
  onClose,
  isModal = false,
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register fields (strictly customer role = 'user')
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    const inputId = identifier.trim().toLowerCase();
    if (!inputId || !password) {
      setError('Vui lòng nhập đầy đủ Tên đăng nhập / Email và Mật khẩu!');
      return;
    }

    // Strict check for the single Admin account: username 'admin' and password 'admin123'
    if (inputId === 'admin') {
      const adminAcc = safeAccounts.find((a) => a.role === 'admin');
      if (password === 'admin123' && adminAcc) {
        onLoginSuccess(adminAcc);
        return;
      } else {
        setError('Mật khẩu Quản trị viên không chính xác!');
        return;
      }
    }

    const found = safeAccounts.find(
      (a) =>
        a.role !== 'admin' &&
        (a.email.toLowerCase() === inputId ||
          (a.username && a.username.toLowerCase() === inputId))
    );

    if (!found) {
      setError('Tài khoản không tồn tại. Vui lòng kiểm tra lại hoặc chuyển sang tab Đăng ký!');
      return;
    }

    if (found.password !== password) {
      setError('Mật khẩu chưa chính xác. Vui lòng thử lại!');
      return;
    }

    onLoginSuccess(found);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu!');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    if (cleanEmail === 'admin' || cleanEmail.startsWith('admin@')) {
      setError('Không thể đăng ký bằng tên định danh dành riêng cho Quản trị viên!');
      return;
    }

    const exists = safeAccounts.some((a) => a.email.toLowerCase() === cleanEmail);
    if (exists) {
      setError('Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập!');
      return;
    }

    const newAccount = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      email: cleanEmail,
      password: regPassword,
      phone: regPhone.trim() || '0901 234 567',
      role: 'user', // Strictly Customer role
      tierId: 'seed',
      tierName: 'Gói Mầm Ký Ức',
      usedStorageGB: 0.1,
      maxStorageGB: 1,
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };

    onRegisterAccount(newAccount);
  };

  return (
    <div
      className={`${
        isModal
          ? 'fixed inset-0 z-50 bg-[#2C2523]/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto'
          : 'min-h-screen bg-gradient-to-br from-[#FAF6F0] via-[#F4ECE0] to-[#EAE0D0] flex items-center justify-center p-4 sm:p-6'
      }`}
    >
      <div className="max-w-4xl w-full bg-white border-2 border-[#E6DEC8] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative my-auto">
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#FAF6F0] hover:bg-[#E6DEC8] flex items-center justify-center text-[#2C2523] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Left Artistic Showcase Column */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#5C361C] via-[#7C4D2B] to-[#3E2412] text-[#FAF6F0] p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#E5A93C]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[#D96B43]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-[#E5A93C]/40 flex items-center justify-center shadow-lg relative">
                <Archive className="w-6 h-6 text-[#E5A93C]" />
                <Sparkles className="w-4 h-4 text-[#E5A93C] absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <div className="font-serif text-xl font-bold tracking-wide text-white">
                  CỬA HÀNG KÝ ỨC
                </div>
                <div className="text-xs text-[#E5A93C] italic">
                  Memory Store & Phygital Vault
                </div>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-snug text-white">
              “Gói ghém khoảnh khắc, <br />
              <span className="text-[#E5A93C]">Chạm để quay về.”</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-white/85 leading-relaxed">
              Nền tảng lưu trữ kỷ vật vật lý chuẩn bảo tàng kết hợp không gian ký ức số NFC & mạng xã hội hoài niệm đầu tiên tại Việt Nam.
            </p>

            <div className="mt-6 space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-[#E5A93C] shrink-0" />
                <span>Niêm phong kẹp chì bảo mật tại nhà & gắn chip NFC định danh</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm">
                <Crown className="w-5 h-5 text-[#E5A93C] shrink-0" />
                <span>Không gian lưu trữ cá nhân hóa & bảo mật tuyệt đối theo từng tài khoản</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
              Kho Trung Tâm Hà Nội
            </span>
            <span className="inline-flex items-center gap-2">
              <Thermometer className="w-3.5 h-3.5 text-[#E5A93C]" /> 22°C
              <Droplets className="w-3.5 h-3.5 text-[#E5A93C]" /> 45%
            </span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-9 bg-white flex flex-col justify-between">
          <div>
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#FAF6F0] border border-[#E6DEC8] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-[#7C4D2B] text-white shadow-sm'
                    : 'text-[#6E6259] hover:text-[#2C2523]'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-[#D96B43] text-white shadow-sm'
                    : 'text-[#6E6259] hover:text-[#2C2523]'
                }`}
              >
                Đăng Ký Tài Khoản Mới
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#9B2C2C]/10 border border-[#9B2C2C]/30 text-xs font-semibold text-[#9B2C2C]">
                {error}
              </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C2523] mb-1.5">
                    Tên đăng nhập hoặc Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Nhập email khách hàng (VD: minhanh.kyuc@gmail.com)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C2523] mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8]/80 text-[11px] text-[#6E6259] space-y-1">
                  <div className="font-semibold text-[#7C4D2B]">Tài khoản khách hàng mẫu để trải nghiệm:</div>
                  <div>
                    • Khách hàng 1: <strong>minhanh.kyuc@gmail.com</strong> / Mật khẩu: <strong>123456</strong>
                  </div>
                  <div>
                    • Khách hàng 2: <strong>thaonhi@gmail.com</strong> / Mật khẩu: <strong>123456</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#D96B43] to-[#B84A24] hover:from-[#B84A24] hover:to-[#9B3B1B] text-white font-bold text-sm shadow-warm flex items-center justify-center gap-2 transition-all"
                >
                  <span>Đăng Nhập Vào Không Gian Ký Ức</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2523] mb-1">
                      Họ và tên của bạn *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="VD: Nguyễn Khánh Linh"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C2523] mb-1">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0912 xxx xxx"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C2523] mb-1">
                    Email đăng ký *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ban@email.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C2523] mb-1">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6E6259] absolute left-3.5 top-2.5" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-sm focus:outline-none focus:border-[#D96B43]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-xs text-[#6E6259]">
                  Tài khoản mới sẽ được kích hoạt mặc định với <strong>Gói Mầm Ký Ức (Miễn phí)</strong> và có thể nâng cấp gói bất kỳ lúc nào.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#7C4D2B] to-[#59341B] hover:from-[#D96B43] hover:to-[#B84A24] text-white font-bold text-sm shadow-warm flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#E5A93C]" />
                  <span>Đăng Ký Tài Khoản Khách Hàng</span>
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E6DEC8] text-[11px] text-[#6E6259] flex items-center justify-between">
            <span>Mọi dữ liệu hộp kỷ vật & bài đăng được đồng bộ theo tài khoản của bạn.</span>
            <span className="font-semibold text-[#7C4D2B]">Bảo mật SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
