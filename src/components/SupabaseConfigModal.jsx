import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  Check,
  X,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  setCustomSupabaseCredentials,
  fetchSupabaseState,
} from '../utils/supabaseClient';

const SAMPLE_SQL = `-- Bảng lưu trạng thái cho Cửa Hàng Ký Ức
CREATE TABLE IF NOT EXISTS public.app_state (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai
DROP POLICY IF EXISTS "Cho phép đọc dữ liệu công khai" ON public.app_state;
CREATE POLICY "Cho phép đọc dữ liệu công khai"
ON public.app_state FOR SELECT USING (true);

-- Cho phép ghi công khai
DROP POLICY IF EXISTS "Cho phép ghi dữ liệu công khai" ON public.app_state;
CREATE POLICY "Cho phép ghi dữ liệu công khai"
ON public.app_state FOR ALL USING (true) WITH CHECK (true);

-- Bật Realtime đồng bộ tự động
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_state;`;

export default function SupabaseConfigModal({ isOpen, onClose, showToast, onConnected }) {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setKey(creds.key);
      setConnected(Boolean(creds.url && creds.key));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SAMPLE_SQL);
    setCopiedSql(true);
    showToast && showToast('Đã sao chép mã SQL Supabase vào bộ nhớ tạm!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveAndTest = async (e) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    const cleanKey = key.trim();

    if (!cleanUrl || !cleanKey) {
      setCustomSupabaseCredentials('', '');
      setConnected(false);
      showToast && showToast('Đã xóa thông tin Supabase, quay về lưu trữ cục bộ.');
      onClose();
      return;
    }

    setTesting(true);
    try {
      setCustomSupabaseCredentials(cleanUrl, cleanKey);
      await fetchSupabaseState();
      setConnected(true);
      showToast && showToast('Kết nối Supabase thành công! Dữ liệu đã được lưu vĩnh viễn trên đám mây.');
      if (onConnected) onConnected();
      onClose();
    } catch (err) {
      console.error(err);
      showToast &&
        showToast(
          'Không thể kết nối bảng app_state trên Supabase. Vui lòng đảm bảo bạn đã chạy mã SQL ở Bước 2!'
        );
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    setCustomSupabaseCredentials('', '');
    setUrl('');
    setKey('');
    setConnected(false);
    showToast && showToast('Đã ngắt kết nối Supabase, quay về lưu trữ cục bộ.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#E6DEC8] max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6DEC8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3ECF8E]/15 border border-[#3ECF8E]/30 flex items-center justify-center text-[#22774F]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2C2523] flex items-center gap-2">
                Kết Nối Supabase Cloud
                {connected && (
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#3B7A57]/15 text-[#3B7A57] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Đã kết nối
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#6E6259]">
                Lưu trữ dữ liệu vĩnh viễn & đồng bộ thời gian thực đa thiết bị
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#FAF6F0] flex items-center justify-center text-[#6E6259] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
            connected
              ? 'bg-[#3B7A57]/10 border-[#3B7A57]/30 text-[#22573B]'
              : 'bg-[#FAF6F0] border-[#E6DEC8] text-[#7C4D2B]'
          }`}
        >
          {connected ? (
            <ShieldCheck className="w-5 h-5 shrink-0 text-[#3B7A57]" />
          ) : (
            <Cloud className="w-5 h-5 shrink-0 text-[#D96B43]" />
          )}
          <div className="leading-relaxed">
            {connected ? (
              <span>
                <strong>Trạng thái: Đang hoạt động trên Supabase!</strong> Mọi thay đổi dữ liệu
                (bài viết, kỷ vật, người dùng) sẽ được lưu vĩnh viễn trên đám mây và đồng bộ tức
                thì giữa tất cả mọi người.
              </span>
            ) : (
              <span>
                <strong>Chưa cấu hình Supabase:</strong> Dữ liệu hiện đang được lưu trên trình
                duyệt của bạn và đồng bộ tạm qua Serverless. Kết nối Supabase để lưu vĩnh viễn
                cho người khác cùng xem.
              </span>
            )}
          </div>
        </div>

        {/* Guide Steps */}
        <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#E6DEC8] space-y-3">
          <div className="text-xs font-bold text-[#2C2523] uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#E5A93C]" />
            3 Bước kết nối Supabase hoàn toàn miễn phí:
          </div>

          <ol className="text-xs text-[#6E6259] space-y-2 list-decimal list-inside">
            <li>
              Truy cập{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#D96B43] font-semibold underline inline-flex items-center gap-0.5"
              >
                supabase.com <ExternalLink className="w-3 h-3 inline" />
              </a>
              , đăng ký tài khoản miễn phí và tạo một dự án mới (New Project).
            </li>
            <li>
              Vào mục <strong>SQL Editor</strong> ở thanh bên trái Supabase, dán đoạn mã SQL bên
              dưới rồi bấm nút <strong>RUN</strong>:
              <div className="mt-1.5 flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#E6DEC8]">
                <span className="font-mono text-[11px] text-[#2C2523] truncate mr-2">
                  CREATE TABLE public.app_state (...)
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] hover:bg-[#E6DEC8] border border-[#E6DEC8] text-[11px] font-bold text-[#7C4D2B] flex items-center gap-1 shrink-0"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3 text-[#3B7A57]" /> Đã chép
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Chép mã SQL
                    </>
                  )}
                </button>
              </div>
            </li>
            <li>
              Vào <strong>Project Settings → API</strong> (hoặc Data API), sao chép{' '}
              <strong>Project URL</strong> và <strong>anon public key</strong> dán vào 2 ô bên
              dưới:
            </li>
          </ol>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSaveAndTest} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#2C2523] mb-1">
              Project URL *
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://abcdefghijklm.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-xs font-mono text-[#2C2523] focus:outline-none focus:border-[#D96B43]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2C2523] mb-1">
              Anon Public API Key *
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#E6DEC8] text-xs font-mono text-[#2C2523] focus:outline-none focus:border-[#D96B43]"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {connected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3.5 py-2 rounded-full border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Ngắt kết nối
              </button>
            ) : (
              <span className="text-[11px] text-[#6E6259]">
                💡 Bạn cũng có thể thiết lập biến trên Vercel: <code>VITE_SUPABASE_URL</code> &{' '}
                <code>VITE_SUPABASE_ANON_KEY</code>.
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full border border-[#E6DEC8] text-xs font-semibold text-[#6E6259] hover:bg-[#FAF6F0]"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={testing}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#3ECF8E] to-[#22774F] hover:opacity-95 text-white text-xs font-bold shadow transition-all disabled:opacity-50"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu & Kết Nối Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
