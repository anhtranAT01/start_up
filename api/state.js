import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_ACCOUNTS,
  INITIAL_POSTS,
  INITIAL_VAULT_ITEMS,
  INITIAL_TIME_CAPSULES,
  INITIAL_REMINDERS,
  INITIAL_DISPATCH_ORDERS,
} from '../src/data/mockData.js';

const TMP_DB = path.join('/tmp', 'cua-hang-ky-uc-db.json');
let memoryStore = null;

// Optional Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null;

function getSeed() {
  return {
    accounts: INITIAL_ACCOUNTS,
    posts: INITIAL_POSTS,
    vaultItems: INITIAL_VAULT_ITEMS,
    capsules: INITIAL_TIME_CAPSULES,
    reminders: INITIAL_REMINDERS,
    dispatchOrders: INITIAL_DISPATCH_ORDERS,
    isSeed: true,
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

async function loadFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('payload, updated_at')
      .eq('id', 'main')
      .maybeSingle();

    if (!error && data && data.payload) {
      return {
        ...data.payload,
        isSeed: false,
        updatedAt: data.updated_at || data.payload.updatedAt,
      };
    }
  } catch (err) {
    console.error('Supabase load error:', err);
  }
  return null;
}

async function saveToSupabase(payload) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('app_state').upsert(
      {
        id: 'main',
        payload,
        updated_at: payload.updatedAt || new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    return !error;
  } catch (err) {
    console.error('Supabase save error:', err);
    return false;
  }
}

function loadStateLocal() {
  try {
    if (fs.existsSync(TMP_DB)) {
      return JSON.parse(fs.readFileSync(TMP_DB, 'utf-8'));
    }
  } catch {
    // Fallback to memoryStore
  }
  if (!memoryStore) {
    memoryStore = getSeed();
  }
  return memoryStore;
}

function saveStateLocal(nextState) {
  const payload = { ...nextState, isSeed: false, updatedAt: new Date().toISOString() };
  memoryStore = payload;
  try {
    fs.writeFileSync(TMP_DB, JSON.stringify(payload), 'utf-8');
  } catch {
    // Ignore read-only filesystem errors outside /tmp
  }
  return payload;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    // Try Supabase first if configured
    const remote = await loadFromSupabase();
    if (remote) {
      return res.status(200).json(remote);
    }

    const state = loadStateLocal();
    return res.status(200).json(state);
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const remote = (await loadFromSupabase()) || loadStateLocal();
    const current = remote || getSeed();
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    if (body.reset) {
      const fresh = getSeed();
      await saveToSupabase(fresh);
      const saved = saveStateLocal(fresh);
      return res.status(200).json({ ok: true, state: saved });
    }

    const merged = {
      accounts: body.accounts ?? current.accounts,
      posts: body.posts ?? current.posts,
      vaultItems: body.vaultItems ?? current.vaultItems,
      capsules: body.capsules ?? current.capsules,
      reminders: body.reminders ?? current.reminders,
      dispatchOrders: body.dispatchOrders ?? current.dispatchOrders,
      isSeed: false,
      updatedAt: new Date().toISOString(),
    };

    await saveToSupabase(merged);
    const saved = saveStateLocal(merged);
    return res.status(200).json({ ok: true, updatedAt: saved.updatedAt, source: supabase ? 'supabase' : 'local' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
