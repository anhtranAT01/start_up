import fs from 'node:fs';
import path from 'node:path';
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

function getSeed() {
  return {
    accounts: INITIAL_ACCOUNTS,
    posts: INITIAL_POSTS,
    vaultItems: INITIAL_VAULT_ITEMS,
    capsules: INITIAL_TIME_CAPSULES,
    reminders: INITIAL_REMINDERS,
    dispatchOrders: INITIAL_DISPATCH_ORDERS,
    updatedAt: new Date().toISOString(),
  };
}

function loadState() {
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

function saveState(nextState) {
  const payload = { ...nextState, updatedAt: new Date().toISOString() };
  memoryStore = payload;
  try {
    fs.writeFileSync(TMP_DB, JSON.stringify(payload), 'utf-8');
  } catch {
    // Ignore read-only filesystem errors outside /tmp
  }
  return payload;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    const state = loadState();
    return res.status(200).json(state);
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const current = loadState();
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    if (body.reset) {
      const fresh = saveState(getSeed());
      return res.status(200).json({ ok: true, state: fresh });
    }

    const merged = {
      accounts: body.accounts ?? current.accounts,
      posts: body.posts ?? current.posts,
      vaultItems: body.vaultItems ?? current.vaultItems,
      capsules: body.capsules ?? current.capsules,
      reminders: body.reminders ?? current.reminders,
      dispatchOrders: body.dispatchOrders ?? current.dispatchOrders,
    };

    const saved = saveState(merged);
    return res.status(200).json({ ok: true, updatedAt: saved.updatedAt });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
