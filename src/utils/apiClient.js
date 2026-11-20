import {
  hasSupabaseConfig,
  fetchSupabaseState,
  saveSupabaseState,
  subscribeToSupabaseRealtime,
} from './supabaseClient';

const STORAGE_KEY = 'CUA_HANG_KY_UC_STATE_V2';
const SESSION_USER_KEY = 'CUA_HANG_KY_UC_USER_V2';

export function getApiEndpoint() {
  const customUrl =
    (typeof window !== 'undefined' && localStorage.getItem('KYUC_BACKEND_URL')) ||
    import.meta.env.VITE_API_URL ||
    '';
  const base = customUrl.replace(/\/$/, '');
  return `${base}/api/state`;
}

export function loadLocalCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalCache(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors if very large base64 images
  }
}

export function loadSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSessionUser(user) {
  try {
    if (!user) {
      localStorage.removeItem(SESSION_USER_KEY);
    } else {
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
    }
  } catch {
    // Ignore
  }
}

export async function fetchBackendState() {
  // 1. If Supabase is configured on client, try fetching from Supabase with timeout
  if (hasSupabaseConfig()) {
    try {
      const supaData = await Promise.race([
        fetchSupabaseState(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 3000)),
      ]);
      if (supaData) {
        saveLocalCache(supaData);
        return supaData;
      }
    } catch (err) {
      console.warn('Direct Supabase fetch failed/timeout, falling back to /api/state:', err);
    }
  }

  // 2. Fallback to /api/state with 4s timeout
  const endpoint = getApiEndpoint();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    saveLocalCache(data);
    return data;
  } catch (err) {
    clearTimeout(timer);
    const local = loadLocalCache();
    if (local) return local;
    throw err;
  }
}

export async function pushBackendState(state) {
  saveLocalCache(state);

  // 1. If Supabase is configured directly on client, save with timeout
  if (hasSupabaseConfig()) {
    try {
      await Promise.race([
        saveSupabaseState(state),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase save timeout')), 3000)),
      ]);
    } catch (err) {
      console.warn('Direct Supabase save failed:', err);
    }
  }

  // 2. Also push to /api/state with 4s timeout
  const endpoint = getApiEndpoint();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    clearTimeout(timer);
    console.warn('Push to /api/state failed/timeout (handled by local cache):', err);
  }

  return { ok: true, updatedAt: state.updatedAt };
}

export function subscribeToRealtimeSync(callback) {
  if (hasSupabaseConfig()) {
    return subscribeToSupabaseRealtime(callback);
  }
  return () => {};
}
