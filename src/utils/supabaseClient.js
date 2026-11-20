import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from Vite environment or localStorage override
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  let localUrl = '';
  let localKey = '';
  if (typeof window !== 'undefined') {
    localUrl = localStorage.getItem('KYUC_SUPABASE_URL') || '';
    localKey = localStorage.getItem('KYUC_SUPABASE_ANON_KEY') || '';
  }

  const url = (localUrl || envUrl || '').trim();
  const key = (localKey || envKey || '').trim();

  return { url, key, isCustom: Boolean(localUrl || localKey) };
}

let cachedClient = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient() {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false },
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
}

export function hasSupabaseConfig() {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key);
}

export function setCustomSupabaseCredentials(url, key) {
  if (typeof window === 'undefined') return;
  if (!url || !key) {
    localStorage.removeItem('KYUC_SUPABASE_URL');
    localStorage.removeItem('KYUC_SUPABASE_ANON_KEY');
  } else {
    localStorage.setItem('KYUC_SUPABASE_URL', url.trim());
    localStorage.setItem('KYUC_SUPABASE_ANON_KEY', key.trim());
  }
  cachedClient = null;
}

/**
 * Fetch full state from Supabase table 'app_state' with id = 'main'
 */
export async function fetchSupabaseState() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('app_state')
    .select('payload, updated_at')
    .eq('id', 'main')
    .maybeSingle();

  if (error) {
    console.warn('Supabase fetch error (table may need schema setup):', error.message);
    throw error;
  }

  if (data && data.payload) {
    return {
      ...data.payload,
      isSeed: false,
      updatedAt: data.updated_at || data.payload.updatedAt,
    };
  }

  return null;
}

/**
 * Save full state to Supabase table 'app_state'
 */
export async function saveSupabaseState(state) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const now = new Date().toISOString();
  const payloadToSave = {
    ...state,
    isSeed: false,
    updatedAt: now,
  };

  const { error } = await supabase.from('app_state').upsert(
    {
      id: 'main',
      payload: payloadToSave,
      updated_at: now,
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('Supabase upsert error:', error.message);
    throw error;
  }

  return payloadToSave;
}

/**
 * Subscribe to realtime updates on 'app_state'
 */
export function subscribeToSupabaseRealtime(onUpdate) {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  try {
    const channel = supabase
      .channel('app_state_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_state', filter: 'id=eq.main' },
        (payload) => {
          if (payload.new && payload.new.payload) {
            onUpdate({
              ...payload.new.payload,
              isSeed: false,
              updatedAt: payload.new.updated_at || payload.new.payload.updatedAt,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Could not establish Supabase realtime channel:', err);
    return () => {};
  }
}
