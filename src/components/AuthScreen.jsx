import React, { useState } from 'react';
import {
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
          ? 'fixed inset-0 z-50 bg-[#2C3329]/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto'
          : 'min-h-screen bg-gradient-to-br from-[#F6F2EB] via-[#EAE1D4] to-[#D6BD95]/40 flex items-center justify-center p-4 sm:p-6'
      }`}
    >
      <div className="max-w-4xl w-full bg-white border-2 border-[#D6BD95] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative my-auto">
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#F6F2EB] hover:bg-[#EAE1D4] flex items-center justify-center text-[#2C3329] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Left Artistic Showcase Column - Moclant Olive Green & Champagne Gold */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#606E5A] via-[#525E4C] to-[#3B4537] text-[#F6F2EB] p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#C9A166]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[#D6BD95]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Official Moclant Logo */}
            <div className="inline-flex items-center gap-3 mb-6 bg-white/95 text-[#606E5A] p-2.5 pr-4 rounded-2xl shadow-lg border border-[#D6BD95]">
              <img
                src="/moclant-logo.jpg"
                alt="Moclant"
                className="w-14 h-14 rounded-xl object-contain bg-white border border-[#EAE1D4]"
              />
              <div className="font-serif text-xl font-bold tracking-wide text-[#606E5A]">
                Moclant
              </div>
            </div>

            <p className="mt-2 text-xs sm:text-sm text-[#EAE1D4]/90 leading-relaxed">
              Nền tảng lưu trữ kỷ vật vật lý chuẩn bảo tàng kết hợp không gian ký ức số NFC & mạng xã hội hoài niệm.
            </p>

            <div className="mt-6 space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-[#D6BD95]/30 backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-[#C9A166] shrink-0" />
                <span>Niêm phong sáp Hoa Mộc Lan bảo mật tại nhà & gắn chip NFC định danh</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-[#D6BD95]/30 backdrop-blur-sm">
                <Crown className="w-5 h-5 text-[#C9A166] shrink-0" />
                <span>Không gian lưu trữ cá nhân hóa & bảo mật tuyệt đối theo từng tài khoản</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-[#EAE1D4]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D6BD95] animate-ping" />
              Kho Moclant Hà Nội
            </span>
            <span className="inline-flex items-center gap-2">
              <Thermometer className="w-3.5 h-3.5 text-[#C9A166]" /> 22°C
              <Droplets className="w-3.5 h-3.5 text-[#C9A166]" /> 45%
            </span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-9 bg-white flex flex-col justify-between">
          <div>
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#F6F2EB] border border-[#D6BD95] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-[#606E5A] text-white shadow-sm'
                    : 'text-[#748067] hover:text-[#2C3329]'
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
                    ? 'bg-[#C9A166] text-white shadow-sm'
                    : 'text-[#748067] hover:text-[#2C3329]'
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
                  <label className="block text-xs font-semibold text-[#2C3329] mb-1.5">
                    Tên đăng nhập hoặc Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#748067] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Nhập email khách hàng (VD: minhanh.kyuc@gmail.com)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-sm focus:outline-none focus:border-[#606E5A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C3329] mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#748067] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu của bạn"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-sm focus:outline-none focus:border-[#606E5A]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F6F2EB] border border-[#D6BD95]/80 text-[11px] text-[#748067] space-y-1">
                  <div className="font-semibold text-[#606E5A]">Tài khoản khách hàng mẫu để trải nghiệm Moclant:</div>
                  <div>
                    • Khách hàng 1: <strong>minhanh.kyuc@gmail.com</strong> / Mật khẩu: <strong>123456</strong>
                  </div>
                  <div>
                    • Khách hàng 2: <strong>thaonhi@gmail.com</strong> / Mật khẩu: <strong>123456</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#606E5A] to-[#4A5645] hover:from-[#C9A166] hover:to-[#B38B50] text-white font-bold text-sm shadow-warm flex items-center justify-center gap-2 transition-all"
                >
                  <span>Đăng Nhập Vào Không Gian Moclant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2C3329] mb-1">
                      Họ và tên của bạn *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#748067] absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="VD: Nguyễn Khánh Linh"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-sm focus:outline-none focus:border-[#606E5A]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#2C3329] mb-1">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#748067] absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0912 xxx xxx"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-sm focus:outline-none focus:border-[#606E5A]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C3329] mb-1">
                    Email đăng ký *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#748067] absolute left-3.5 top-2.5" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ban@email.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-sm focus:outline-none focus:border-[#606E5A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C3329] mb-1">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#748067] absolute left-3.5 top-2.5" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-sm focus:outline-none focus:border-[#606E5A]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F6F2EB] border border-[#D6BD95] text-xs text-[#748067]">
                  Tài khoản mới sẽ được kích hoạt mặc định với <strong>Gói Mầm Ký Ức (Miễn phí)</strong> và có thể nâng cấp gói bất kỳ lúc nào.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#C9A166] to-[#B38B50] hover:from-[#606E5A] hover:to-[#4A5645] text-white font-bold text-sm shadow-warm flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#F6F2EB]" />
                  <span>Đăng Ký Tài Khoản Moclant</span>
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#D6BD95] text-[11px] text-[#748067] flex items-center justify-between">
            <span>Mọi dữ liệu hộp kỷ vật & bài đăng được đồng bộ theo tài khoản của bạn.</span>
            <span className="font-semibold text-[#606E5A]">Moclant SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
