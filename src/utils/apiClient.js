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
    // Ignore quota errors if payload contains large base64 images
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

/**
 * Fetch remote state safely with a strict 3-second timeout.
 * Never throws an unhandled exception or hangs the main thread.
 */
export async function fetchBackendState() {
  const endpoint = getApiEndpoint();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

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
    return data;
  } catch (err) {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Push state to the backend in the background.
 * Immediate local save + debounced non-blocking HTTP request.
 */
let debounceTimer = null;
export function pushBackendState(state) {
  // 1. Immediately save to local storage (instant UI persistence)
  saveLocalCache(state);

  // 2. Debounce backend push so rapid clicks never create a network traffic jam
  return new Promise((resolve) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      try {
        const endpoint = getApiEndpoint();
        const controller = new AbortController();
        const abortTimeout = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
          signal: controller.signal,
        });
        clearTimeout(abortTimeout);

        if (res.ok) {
          const result = await res.json().catch(() => ({ ok: true }));
          resolve({ ok: true, updatedAt: state.updatedAt, ...result });
        } else {
          resolve({ ok: false, error: `HTTP ${res.status}` });
        }
      } catch (err) {
        resolve({ ok: false, error: err.message });
      }
    }, 500);
  });
}
