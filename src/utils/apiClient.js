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
  const endpoint = getApiEndpoint();
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return await res.json();
}
