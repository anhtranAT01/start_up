import React from 'react';
import { AlertCircle, RefreshCw, Archive, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lỗi giao diện bị chặn bởi ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.removeItem('CUA_HANG_KY_UC_STATE_V2');
      localStorage.removeItem('CUA_HANG_KY_UC_USER_V2');
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF6F0] text-[#2C2523] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-warm-lg border border-[#E6DEC8] text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D96B43]/15 text-[#D96B43] flex items-center justify-center">
              <Archive className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2C2523]">
                Không Gian Ký Ức Đang Tải Lại
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6259] mt-2">
                Đã xảy ra sự cố hiển thị tạm thời. Dữ liệu kỷ vật và tài khoản của bạn vẫn được lưu giữ an toàn tuyệt đối.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-2xl bg-[#7C4D2B] hover:bg-[#5C361C] text-white text-sm font-bold shadow transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tải lại trang</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-[#FAF6F0] border border-[#E6DEC8] text-[#7C4D2B] text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục dữ liệu ban đầu (Nếu lỗi lặp lại)</span>
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <details className="text-left text-[11px] text-red-600 bg-red-50 p-3 rounded-xl overflow-x-auto">
                <summary className="font-semibold cursor-pointer">Chi tiết lỗi kỹ thuật</summary>
                <pre className="mt-2 whitespace-pre-wrap">{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
