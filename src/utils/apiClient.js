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
  // 1. If Supabase is configured on client, try fetching from Supabase first
  if (hasSupabaseConfig()) {
    try {
      const supaData = await fetchSupabaseState();
      if (supaData) {
        saveLocalCache(supaData);
        return supaData;
      }
    } catch (err) {
      console.warn('Direct Supabase fetch failed, falling back to /api/state:', err);
    }
  }

  // 2. Fallback to /api/state (which also checks Supabase on server if configured in Vercel)
  const endpoint = getApiEndpoint();
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  saveLocalCache(data);
  return data;
}

export async function pushBackendState(state) {
  saveLocalCache(state);

  // 1. If Supabase is configured directly on client, save to Supabase
  if (hasSupabaseConfig()) {
    try {
      await saveSupabaseState(state);
    } catch (err) {
      console.warn('Direct Supabase save failed:', err);
    }
  }

  // 2. Also push to /api/state
  const endpoint = getApiEndpoint();
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Push to /api/state failed (handled by local cache/Supabase):', err);
  }

  return { ok: true, updatedAt: state.updatedAt };
}

export function subscribeToRealtimeSync(callback) {
  if (hasSupabaseConfig()) {
    return subscribeToSupabaseRealtime(callback);
  }
  return () => {};
}
