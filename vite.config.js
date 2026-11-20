import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import {
  INITIAL_ACCOUNTS,
  INITIAL_POSTS,
  INITIAL_VAULT_ITEMS,
  INITIAL_TIME_CAPSULES,
  INITIAL_REMINDERS,
  INITIAL_DISPATCH_ORDERS,
} from './src/data/mockData.js';

const DB_FILE = path.resolve('server', 'db.json');

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

function readLocalDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch {
    // fallback
  }
  const seed = getSeed();
  writeLocalDb(seed);
  return seed;
}

function writeLocalDb(data) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const payload = { ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return payload;
  } catch {
    return data;
  }
}

function localBackendPlugin() {
  return {
    name: 'cua-hang-ky-uc-local-api',
    configureServer(server) {
      server.middlewares.use('/api/state', (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (req.method === 'GET') {
          res.end(JSON.stringify(readLocalDb()));
          return;
        }
        if (req.method === 'POST' || req.method === 'PUT') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const incoming = JSON.parse(body || '{}');
              if (incoming.reset) {
                const fresh = writeLocalDb(getSeed());
                res.end(JSON.stringify({ ok: true, state: fresh }));
                return;
              }
              const current = readLocalDb();
              const saved = writeLocalDb({
                accounts: incoming.accounts ?? current.accounts,
                posts: incoming.posts ?? current.posts,
                vaultItems: incoming.vaultItems ?? current.vaultItems,
                capsules: incoming.capsules ?? current.capsules,
                reminders: incoming.reminders ?? current.reminders,
                dispatchOrders: incoming.dispatchOrders ?? current.dispatchOrders,
              });
              res.end(JSON.stringify({ ok: true, updatedAt: saved.updatedAt }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false, error: e.message }));
            }
          });
          return;
        }
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localBackendPlugin()],
  build: {
    outDir: 'dist',
  },
});
