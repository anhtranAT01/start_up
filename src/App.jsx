import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, X, Cloud, RefreshCw } from 'lucide-react';
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
import { AvatarProfileModal } from './components/SharedUI';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import { soundEngine } from './utils/soundEngine';
import {
  loadLocalCache,
  saveLocalCache,
  fetchBackendState,
  pushBackendState,
  loadSessionUser,
  saveSessionUser,
} from './utils/apiClient';
import { hasSupabaseConfig } from './utils/supabaseClient';

// Ensure Moclant signature magnolia posts and vault items are always merged and sanitized in existing cache
function ensureMoclantPosts(list) {
  if (!Array.isArray(list) || list.length === 0) return INITIAL_POSTS;
  const moclantSeeds = INITIAL_POSTS.filter((p) => p.id.startsWith('post-moclant-'));
  const seedMap = new Map(moclantSeeds.map((p) => [p.id, p]));
  const updatedList = list.map((p) => (p && seedMap.has(p.id) ? { ...seedMap.get(p.id), candles: p.candles ?? seedMap.get(p.id).candles, comments: p.comments ?? seedMap.get(p.id).comments } : p));
  const existingIds = new Set(updatedList.map((p) => p?.id));
  const missingSeeds = moclantSeeds.filter((p) => !existingIds.has(p.id));
  return missingSeeds.length > 0 ? [...missingSeeds, ...updatedList] : updatedList;
}

function ensureMoclantVault(list) {
  if (!Array.isArray(list) || list.length === 0) return INITIAL_VAULT_ITEMS;
  const moclantBox = INITIAL_VAULT_ITEMS.find((v) => v.id === 'MK-8899');
  if (moclantBox && !list.some((v) => v?.id === 'MK-8899')) {
    return [moclantBox, ...list];
  }
  return list;
}

export default function App() {
  const cached = loadLocalCache();

  const [accounts, setAccounts] = useState(() =>
    Array.isArray(cached?.accounts) && cached.accounts.length > 0
      ? cached.accounts
      : INITIAL_ACCOUNTS
  );
  const [user, setUser] = useState(() => loadSessionUser());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(() => hasSupabaseConfig());

  const [activeScreen, setActiveScreen] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');

  const [posts, setPosts] = useState(() => ensureMoclantPosts(cached?.posts));
  const [vaultItems, setVaultItems] = useState(() => ensureMoclantVault(cached?.vaultItems));
  const [capsules, setCapsules] = useState(() =>
    Array.isArray(cached?.capsules) && cached.capsules.length > 0
      ? cached.capsules
      : INITIAL_TIME_CAPSULES
  );
  const [reminders, setReminders] = useState(() =>
    Array.isArray(cached?.reminders) && cached.reminders.length > 0
      ? cached.reminders
      : INITIAL_REMINDERS
  );
  const [dispatchOrders, setDispatchOrders] = useState(() =>
    Array.isArray(cached?.dispatchOrders) && cached.dispatchOrders.length > 0
      ? cached.dispatchOrders
      : INITIAL_DISPATCH_ORDERS
  );

  const [syncStatus, setSyncStatus] = useState('synced'); // 'syncing' | 'synced' | 'local'
  const [toast, setToast] = useState(null);
  const isInitialMount = useRef(true);
  const isRemoteUpdate = useRef(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && prev.message === message ? null : prev));
    }, 3600);
  }, []);

  const safeStopSound = useCallback(() => {
    try {
      soundEngine.stop();
    } catch (e) {
      console.warn('Sound stop error:', e);
    }
  }, []);

  // 1. Fetch state from Backend API on mount safely
  useEffect(() => {
    let mounted = true;
    fetchBackendState()
      .then((remote) => {
        if (!mounted || !remote) return;
        const local = loadLocalCache();

        // If local browser has user modifications, preserve them
        if (
          local &&
          !local.isSeed &&
          local.updatedAt &&
          remote.updatedAt &&
          local.updatedAt >= remote.updatedAt
        ) {
          setSyncStatus('synced');
          return;
        }

        // If backend cold-started with seed but local has user data, preserve local
        if (remote.isSeed && local && !local.isSeed) {
          pushBackendState(local);
          setSyncStatus('synced');
          return;
        }

        if (remote.updatedAt && (!local?.updatedAt || remote.updatedAt > local.updatedAt)) {
          isRemoteUpdate.current = true;
          if (Array.isArray(remote.accounts)) setAccounts(remote.accounts);
          if (Array.isArray(remote.posts)) setPosts(ensureMoclantPosts(remote.posts));
          if (Array.isArray(remote.vaultItems)) setVaultItems(ensureMoclantVault(remote.vaultItems));
          if (Array.isArray(remote.capsules)) setCapsules(remote.capsules);
          if (Array.isArray(remote.reminders)) setReminders(remote.reminders);
          if (Array.isArray(remote.dispatchOrders)) setDispatchOrders(remote.dispatchOrders);
          saveLocalCache({
            ...remote,
            posts: ensureMoclantPosts(remote.posts),
            vaultItems: ensureMoclantVault(remote.vaultItems),
          });
        }
        setSyncStatus('synced');
      })
      .catch(() => {
        if (mounted) setSyncStatus('local');
      });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Automatically sync state changes to localStorage (instantly) and backend (debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    const payload = {
      accounts,
      posts,
      vaultItems,
      capsules,
      reminders,
      dispatchOrders,
      isSeed: false,
      updatedAt: new Date().toISOString(),
    };

    // Instant local cache save - zero lag for user interactions
    try {
      saveLocalCache(payload);
    } catch (e) {
      console.warn('Failed to save local cache:', e);
    }

    // Debounced background push
    setSyncStatus('syncing');
    pushBackendState(payload)
      .then((res) => {
        setSyncStatus(res?.ok ? 'synced' : 'local');
      })
      .catch(() => {
        setSyncStatus('local');
      });
  }, [accounts, posts, vaultItems, capsules, reminders, dispatchOrders]);

  // 3. Persist logged-in user session
  useEffect(() => {
    try {
      saveSessionUser(user);
    } catch (e) {
      console.warn('Failed to save user session:', e);
    }
  }, [user]);

  const handleLoginSuccess = (acc) => {
    safeStopSound();
    setUser(acc);
    if (acc.role === 'admin') {
      setActiveScreen('dispatch');
      showToast(`Xin chào Quản trị viên! Đã mở quyền Trạm Điều Phối Kho Moclant.`);
    } else {
      setActiveScreen('feed');
      showToast(`Chào mừng ${acc.name} quay về Moclant • Cửa Hàng Ký Ức!`);
    }
  };

  const handleRegisterAccount = (newAccount) => {
    setAccounts((prev) => [newAccount, ...(Array.isArray(prev) ? prev : [])]);
    setUser(newAccount);

    const starterReminder = {
      id: `REM-${String(Date.now()).slice(-4)}`,
      ownerEmail: newAccount.email,
      targetName: `Lời chào mừng thành viên Moclant (${newAccount.name})`,
      scheduleType: 'Định kỳ hàng năm',
      channels: ['Thông báo App'],
      autoShip: false,
      recipients: newAccount.email,
    };
    setReminders((prev) => [starterReminder, ...(Array.isArray(prev) ? prev : [])]);

    setActiveScreen('feed');
    showToast(`Chào mừng ${newAccount.name} đến với Moclant! Tài khoản của bạn đã được lưu.`);
  };

  const handleLogout = () => {
    safeStopSound();
    setUser(null);
    setActiveScreen('feed');
  };

  const handleSaveProfile = ({ name, bio, phone, avatar }) => {
    setUser((prev) => ({
      ...prev,
      name,
      bio,
      phone,
      avatar,
    }));

    setAccounts((prev) =>
      (Array.isArray(prev) ? prev : []).map((acc) =>
        acc.email === user?.email ? { ...acc, name, bio, phone, avatar } : acc
      )
    );

    setPosts((prev) =>
      (Array.isArray(prev) ? prev : []).map((p) =>
        p.authorEmail === user?.email && !p.isAnonymous
          ? {
              ...p,
              author: name,
              authorRole: bio || p.authorRole,
              avatar,
            }
          : p
      )
    );

    setShowProfileModal(false);
    showToast('Đã lưu ảnh đại diện và hồ sơ mới vào hệ thống Moclant!');
  };

  const handleCreateOrder = (newVaultItem, newDispatchOrder) => {
    setVaultItems((prev) => [newVaultItem, ...(Array.isArray(prev) ? prev : [])]);
    setDispatchOrders((prev) => [newDispatchOrder, ...(Array.isArray(prev) ? prev : [])]);
  };

  const handleUpgradeTier = (tierId, tierName) => {
    const tierObj = PRICING_TIERS.find((t) => t.id === tierId);
    const maxStorageGB = tierObj?.maxStorageGB || 100;

    setUser((prev) => ({ ...prev, tierId, tierName, maxStorageGB }));
    setAccounts((prev) =>
      (Array.isArray(prev) ? prev : []).map((acc) =>
        acc.email === user?.email
          ? { ...acc, tierId, tierName, maxStorageGB }
          : acc
      )
    );
  };

  const handleUpdateDispatchStep = (orderId, nextStep) => {
    const safeOrders = Array.isArray(dispatchOrders) ? dispatchOrders : [];
    const targetOrder = safeOrders.find((o) => o.id === orderId);
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
      (Array.isArray(prev) ? prev : []).map((o) =>
        o.id === orderId
          ? { ...o, step: nextStep, assignedLocation: generatedLocation }
          : o
      )
    );

    setVaultItems((prev) =>
      (Array.isArray(prev) ? prev : []).map((v) => {
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
          const prevLogs = v.digitalSpace?.inspectionLogs || [];
          return {
            ...v,
            status: v.isTimeCapsule ? 'locked' : 'stored',
            statusLabel: v.isTimeCapsule ? 'Đang khóa Hộp thời gian' : 'Đang lưu tại kho',
            location: generatedLocation,
            lastInspected: 'Vừa nhập kho xong',
            digitalSpace: {
              ...(v.digitalSpace || {}),
              inspectionLogs: [
                {
                  date: '26/11/2026 - Vừa xong',
                  status: `Đã quét mã QR nhập kho thành công tại ${generatedLocation}.`,
                },
                ...prevLogs,
              ],
            },
          };
        }
        return v;
      })
    );

    if (nextStep === 2) showToast(`Shipper đã nhận đơn #${orderId}!`);
    if (nextStep === 3) showToast(`Đã xác nhận niêm phong dấu Hoa Mộc Lan tại nhà cho #${orderId}!`);
    if (nextStep === 4) {
      showToast(`Đã nhập kho #${targetOrder.vaultId} tại ${generatedLocation}!`);
    }
  };

  const handleSendInspectionReport = (orderId) => {
    const safeOrders = Array.isArray(dispatchOrders) ? dispatchOrders : [];
    const targetOrder = safeOrders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    setDispatchOrders((prev) =>
      (Array.isArray(prev) ? prev : []).map((o) =>
        o.id === orderId ? { ...o, lastReportSent: true } : o
      )
    );

    setVaultItems((prev) =>
      (Array.isArray(prev) ? prev : []).map((v) => {
        if (v.id !== targetOrder.vaultId) return v;
        const prevLogs = v.digitalSpace?.inspectionLogs || [];
        return {
          ...v,
          lastInspected: 'Vừa gửi báo cáo ảnh chụp',
          digitalSpace: {
            ...(v.digitalSpace || {}),
            inspectionLogs: [
              {
                date: '26/11/2026 - Vừa xong',
                status: 'Nhân viên kho đã gửi bộ ảnh kiểm định tình trạng hộp Moclant nguyên vẹn 100%.',
              },
              ...prevLogs,
            ],
          },
        };
      })
    );

    showToast(`Đã gửi báo cáo ảnh chụp định kỳ cho hộp #${targetOrder.vaultId} tới khách hàng!`);
  };

  if (!user) {
    return (
      <AuthScreen
        accounts={Array.isArray(accounts) ? accounts : INITIAL_ACCOUNTS}
        onLoginSuccess={handleLoginSuccess}
        onRegisterAccount={handleRegisterAccount}
      />
    );
  }

  const safeVaultItems = Array.isArray(vaultItems) ? vaultItems : [];
  const safeCapsules = Array.isArray(capsules) ? capsules : [];
  const safeReminders = Array.isArray(reminders) ? reminders : [];
  const safeDispatchOrders = Array.isArray(dispatchOrders) ? dispatchOrders : [];

  const userVaultItems =
    user.role === 'admin'
      ? safeVaultItems
      : safeVaultItems.filter((v) => v.ownerEmail === user.email);

  const userCapsules =
    user.role === 'admin'
      ? safeCapsules
      : safeCapsules.filter((c) => !c.ownerEmail || c.ownerEmail === user.email);

  const userReminders =
    user.role === 'admin'
      ? safeReminders
      : safeReminders.filter((r) => !r.ownerEmail || r.ownerEmail === user.email);

  const pendingDispatchCount = safeDispatchOrders.filter((o) => (o.step || 1) < 4).length;

  const safeActiveScreen =
    activeScreen === 'dispatch' && user.role !== 'admin' ? 'feed' : activeScreen;

  return (
    <div className="min-h-screen bg-[#F6F2EB] text-[#2C3329] flex flex-col pb-20 lg:pb-10">
      <Header
        user={user}
        onEditProfile={() => setShowProfileModal(true)}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNewPickup={() => setActiveScreen('pickup')}
        remindersCount={userReminders.length}
        notifications={userReminders}
        onNavigate={(scr) => {
          safeStopSound();
          setActiveScreen(scr);
        }}
        onOpenSupabaseConfig={() => setShowSupabaseModal(true)}
        isSupabaseConnected={isSupabaseConnected}
      />

      <div className="max-w-[1440px] w-full mx-auto px-4 lg:px-6 pt-6 flex gap-6 flex-1">
        <Sidebar
          user={user}
          activeScreen={safeActiveScreen}
          onNavigate={(scr) => {
            safeStopSound();
            setActiveScreen(scr);
          }}
          vaultCount={userVaultItems.length}
          pendingDispatchCount={pendingDispatchCount}
        />

        <main className="flex-1 min-w-0">
          {safeActiveScreen === 'feed' && (
            <ScreenFeed
              user={user}
              onEditProfile={() => setShowProfileModal(true)}
              posts={Array.isArray(posts) ? posts : []}
              setPosts={setPosts}
              vaultItems={userVaultItems}
              searchQuery={searchQuery}
              showToast={showToast}
              onNavigate={(scr) => {
                safeStopSound();
                setActiveScreen(scr);
              }}
            />
          )}

          {safeActiveScreen === 'pickup' && (
            <ScreenPickupWizard
              user={user}
              onCreateOrder={handleCreateOrder}
              showToast={showToast}
              onNavigate={(scr) => {
                safeStopSound();
                setActiveScreen(scr);
              }}
            />
          )}

          {safeActiveScreen === 'vault' && (
            <ScreenVault
              user={user}
              vaultItems={userVaultItems}
              setVaultItems={setVaultItems}
              searchQuery={searchQuery}
              showToast={showToast}
              onNavigate={(scr) => {
                safeStopSound();
                setActiveScreen(scr);
              }}
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
              accounts={Array.isArray(accounts) ? accounts : []}
              dispatchOrders={safeDispatchOrders}
              onUpdateDispatchStep={handleUpdateDispatchStep}
              onSendInspectionReport={handleSendInspectionReport}
            />
          )}
        </main>
      </div>

      {/* Live Backend Sync Badge */}
      <div className="fixed bottom-16 lg:bottom-4 left-4 z-30 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#D6BD95] shadow-sm text-[11px] font-medium text-[#748067]">
        {syncStatus === 'syncing' ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-[#C9A166] animate-spin" />
            <span>Đang đồng bộ Moclant Cloud...</span>
          </>
        ) : syncStatus === 'synced' ? (
          <>
            <Cloud className="w-3.5 h-3.5 text-[#606E5A]" />
            <span className="text-[#606E5A] font-semibold">
              {isSupabaseConnected ? 'Đã đồng bộ Supabase Cloud' : 'Đã đồng bộ Moclant API'}
            </span>
          </>
        ) : (
          <>
            <Cloud className="w-3.5 h-3.5 text-[#606E5A]" />
            <span>Lưu trữ Cloud & Local</span>
          </>
        )}
      </div>

      {showProfileModal && (
        <AvatarProfileModal
          user={user}
          onSaveProfile={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {showSupabaseModal && (
        <SupabaseConfigModal
          isOpen={showSupabaseModal}
          onClose={() => setShowSupabaseModal(false)}
          showToast={showToast}
          onConnected={() => {
            setIsSupabaseConnected(hasSupabaseConfig());
            fetchBackendState()
              .then((remote) => {
                if (remote) {
                  if (Array.isArray(remote.accounts)) setAccounts(remote.accounts);
                  if (Array.isArray(remote.posts)) setPosts(ensureMoclantPosts(remote.posts));
                  if (Array.isArray(remote.vaultItems))
                    setVaultItems(ensureMoclantVault(remote.vaultItems));
                  if (Array.isArray(remote.capsules)) setCapsules(remote.capsules);
                  if (Array.isArray(remote.reminders)) setReminders(remote.reminders);
                  if (Array.isArray(remote.dispatchOrders)) setDispatchOrders(remote.dispatchOrders);
                }
              })
              .catch(() => {});
          }}
        />
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 max-w-sm bg-[#606E5A] text-[#F6F2EB] px-4 py-3 rounded-2xl shadow-2xl border border-[#C9A166]/60 flex items-center gap-3">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-[#EAE1D4] shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#C9A166] shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-white/70 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
