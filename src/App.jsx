import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import {
  INITIAL_ACCOUNTS,
  INITIAL_POSTS,
  INITIAL_VAULT_ITEMS,
  INITIAL_TIME_CAPSULES,
  INITIAL_REMINDERS,
  INITIAL_DISPATCH_ORDERS,
  PRICING_TIERS,
} from './data/mockData';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AuthScreen from './components/AuthScreen';
import ScreenFeed from './components/ScreenFeed';
import ScreenPickupWizard from './components/ScreenPickupWizard';
import ScreenVault from './components/ScreenVault';
import ScreenTimeCapsule from './components/ScreenTimeCapsule';
import ScreenPricing from './components/ScreenPricing';
import ScreenDispatch from './components/ScreenDispatch';
import { soundEngine } from './utils/soundEngine';

export default function App() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [user, setUser] = useState(null);

  const [activeScreen, setActiveScreen] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');

  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [vaultItems, setVaultItems] = useState(INITIAL_VAULT_ITEMS);
  const [capsules, setCapsules] = useState(INITIAL_TIME_CAPSULES);
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [dispatchOrders, setDispatchOrders] = useState(INITIAL_DISPATCH_ORDERS);

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && prev.message === message ? null : prev));
    }, 3600);
  }, []);

  const handleLoginSuccess = (acc) => {
    soundEngine.stop();
    setUser(acc);
    if (acc.role === 'admin') {
      setActiveScreen('dispatch');
      showToast(`Xin chào Quản trị viên! Đã mở quyền Trạm Điều Phối Kho.`);
    } else {
      setActiveScreen('feed');
      showToast(`Chào mừng ${acc.name} quay về Cửa Hàng Ký Ức!`);
    }
  };

  const handleRegisterAccount = (newAccount) => {
    setAccounts((prev) => [newAccount, ...prev]);
    setUser(newAccount);

    const starterReminder = {
      id: `REM-${String(Date.now()).slice(-4)}`,
      ownerEmail: newAccount.email,
      targetName: `Lời chào mừng thành viên mới (${newAccount.name})`,
      scheduleType: 'Định kỳ hàng năm',
      channels: ['Thông báo App'],
      autoShip: false,
      recipients: newAccount.email,
    };
    setReminders((prev) => [starterReminder, ...prev]);

    setActiveScreen('feed');
    showToast(`Chào mừng ${newAccount.name}! Tài khoản khách hàng của bạn đã sẵn sàng.`);
  };

  const handleLogout = () => {
    soundEngine.stop();
    setUser(null);
    setActiveScreen('feed');
  };

  const handleCreateOrder = (newVaultItem, newDispatchOrder) => {
    setVaultItems((prev) => [newVaultItem, ...prev]);
    setDispatchOrders((prev) => [newDispatchOrder, ...prev]);
  };

  const handleUpgradeTier = (tierId, tierName) => {
    const tierObj = PRICING_TIERS.find((t) => t.id === tierId);
    const maxStorageGB = tierObj?.maxStorageGB || 100;

    setUser((prev) => ({ ...prev, tierId, tierName, maxStorageGB }));
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.email === user.email
          ? { ...acc, tierId, tierName, maxStorageGB }
          : acc
      )
    );
  };

  const handleUpdateDispatchStep = (orderId, nextStep) => {
    const targetOrder = dispatchOrders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    let generatedLocation = targetOrder.assignedLocation;
    if (nextStep === 4) {
      const zones = ['Khu A', 'Khu B', 'Khu C'];
      const zone = zones[Math.floor(Math.random() * zones.length)];
      const shelf = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
      const slot = String(Math.floor(1 + Math.random() * 20)).padStart(2, '0');
      generatedLocation = `Kho Trung Tâm Hà Nội - ${zone} - Kệ ${shelf} - Ngăn ${slot}`;
    }

    setDispatchOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, step: nextStep, assignedLocation: generatedLocation }
          : o
      )
    );

    setVaultItems((prev) =>
      prev.map((v) => {
        if (v.id !== targetOrder.vaultId) return v;
        if (nextStep === 2) {
          return {
            ...v,
            status: 'picking_up',
            statusLabel: 'Shipper đang đến lấy quà',
          };
        }
        if (nextStep === 3) {
          return {
            ...v,
            status: 'picking_up',
            statusLabel: 'Đã niêm phong kẹp chì & đang về kho',
            location: 'Đang vận chuyển an toàn về Kho Trung Tâm Hà Nội',
          };
        }
        if (nextStep === 4) {
          return {
            ...v,
            status: v.isTimeCapsule ? 'locked' : 'stored',
            statusLabel: v.isTimeCapsule ? 'Đang khóa Hộp thời gian' : 'Đang lưu tại kho',
            location: generatedLocation,
            lastInspected: 'Vừa nhập kho xong',
            digitalSpace: {
              ...v.digitalSpace,
              inspectionLogs: [
                {
                  date: '16/11/2026 - Vừa xong',
                  status: `Đã quét mã QR nhập kho thành công tại ${generatedLocation}.`,
                },
                ...v.digitalSpace.inspectionLogs,
              ],
            },
          };
        }
        return v;
      })
    );

    if (nextStep === 2) showToast(`Shipper đã nhận đơn #${orderId}!`);
    if (nextStep === 3) showToast(`Đã xác nhận niêm phong kẹp chì tại nhà cho #${orderId}!`);
    if (nextStep === 4) {
      showToast(`Đã nhập kho #${targetOrder.vaultId} tại ${generatedLocation}!`);
    }
  };

  const handleSendInspectionReport = (orderId) => {
    const targetOrder = dispatchOrders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    setDispatchOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, lastReportSent: true } : o))
    );

    setVaultItems((prev) =>
      prev.map((v) =>
        v.id === targetOrder.vaultId
          ? {
              ...v,
              lastInspected: 'Vừa gửi báo cáo ảnh chụp',
              digitalSpace: {
                ...v.digitalSpace,
                inspectionLogs: [
                  {
                    date: '16/11/2026 - Vừa xong',
                    status: 'Nhân viên kho đã gửi bộ ảnh kiểm định tình trạng hộp nguyên vẹn 100%.',
                  },
                  ...v.digitalSpace.inspectionLogs,
                ],
              },
            }
          : v
      )
    );

    showToast(`Đã gửi báo cáo ảnh chụp định kỳ cho hộp #${targetOrder.vaultId} tới khách hàng!`);
  };

  if (!user) {
    return (
      <AuthScreen
        accounts={accounts}
        onLoginSuccess={handleLoginSuccess}
        onRegisterAccount={handleRegisterAccount}
      />
    );
  }

  const userVaultItems =
    user.role === 'admin'
      ? vaultItems
      : vaultItems.filter((v) => v.ownerEmail === user.email);

  const userCapsules =
    user.role === 'admin'
      ? capsules
      : capsules.filter((c) => !c.ownerEmail || c.ownerEmail === user.email);

  const userReminders =
    user.role === 'admin'
      ? reminders
      : reminders.filter((r) => !r.ownerEmail || r.ownerEmail === user.email);

  const pendingDispatchCount = dispatchOrders.filter((o) => o.step < 4).length;

  const safeActiveScreen =
    activeScreen === 'dispatch' && user.role !== 'admin' ? 'feed' : activeScreen;

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C2523] flex flex-col pb-20 lg:pb-10">
      <Header
        user={user}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNewPickup={() => setActiveScreen('pickup')}
        remindersCount={userReminders.length}
        notifications={userReminders}
        onNavigate={(scr) => {
          soundEngine.stop();
          setActiveScreen(scr);
        }}
      />

      <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-6 pt-6 flex gap-6 flex-1">
        <Sidebar
          user={user}
          activeScreen={safeActiveScreen}
          onNavigate={(scr) => {
            soundEngine.stop();
            setActiveScreen(scr);
          }}
          vaultCount={userVaultItems.length}
          pendingDispatchCount={pendingDispatchCount}
        />

        <main className="flex-1 min-w-0">
          {safeActiveScreen === 'feed' && (
            <ScreenFeed
              user={user}
              posts={posts}
              setPosts={setPosts}
              vaultItems={userVaultItems}
              searchQuery={searchQuery}
              showToast={showToast}
              onNavigate={setActiveScreen}
            />
          )}

          {safeActiveScreen === 'pickup' && (
            <ScreenPickupWizard
              user={user}
              onCreateOrder={handleCreateOrder}
              showToast={showToast}
              onNavigate={setActiveScreen}
            />
          )}

          {safeActiveScreen === 'vault' && (
            <ScreenVault
              user={user}
              vaultItems={userVaultItems}
              setVaultItems={setVaultItems}
              searchQuery={searchQuery}
              showToast={showToast}
              onNavigate={setActiveScreen}
            />
          )}

          {safeActiveScreen === 'capsule' && (
            <ScreenTimeCapsule
              user={user}
              capsules={userCapsules}
              setCapsules={setCapsules}
              reminders={userReminders}
              setReminders={setReminders}
              vaultItems={userVaultItems}
              showToast={showToast}
            />
          )}

          {safeActiveScreen === 'pricing' && (
            <ScreenPricing
              user={user}
              onUpgradeTier={handleUpgradeTier}
              showToast={showToast}
            />
          )}

          {safeActiveScreen === 'dispatch' && user.role === 'admin' && (
            <ScreenDispatch
              user={user}
              accounts={accounts}
              dispatchOrders={dispatchOrders}
              onUpdateDispatchStep={handleUpdateDispatchStep}
              onSendInspectionReport={handleSendInspectionReport}
            />
          )}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 max-w-sm bg-[#2C2523] text-[#FAF6F0] px-4 py-3 rounded-2xl shadow-2xl border border-[#E5A93C]/40 flex items-center gap-3">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-[#D96B43] shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#E5A93C] shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-white/60 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
