import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INITIAL_ACCOUNTS,
  INITIAL_POSTS,
  INITIAL_VAULT_ITEMS,
  INITIAL_TIME_CAPSULES,
  INITIAL_REMINDERS,
  INITIAL_DISPATCH_ORDERS,
} from '../src/data/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');
const DIST_PATH = path.join(__dirname, '..', 'dist');

function getInitialSeed() {
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

function readDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db.json, falling back to seed:', err);
  }
  const seed = getInitialSeed();
  writeDb(seed);
  return seed;
}

function writeDb(data) {
  try {
    const next = { ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(DB_PATH, JSON.stringify(next, null, 2), 'utf-8');
    return next;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return data;
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Enable CORS for Cloudflare Pages / Vercel frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Health check endpoint
  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'Cua Hang Ky Uc Backend API',
        updatedAt: new Date().toISOString(),
      })
    );
    return;
  }

  // GET full application state
  if (url.pathname === '/api/state' && req.method === 'GET') {
    const state = readDb();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(state));
    return;
  }

  // POST update application state
  if (url.pathname === '/api/state' && (req.method === 'POST' || req.method === 'PUT')) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Allow up to 15MB for base64 uploaded photos/avatars
      if (body.length > 15 * 1024 * 1024) {
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const incoming = JSON.parse(body || '{}');
        const current = readDb();
        const merged = {
          accounts: incoming.accounts ?? current.accounts,
          posts: incoming.posts ?? current.posts,
          vaultItems: incoming.vaultItems ?? current.vaultItems,
          capsules: incoming.capsules ?? current.capsules,
          reminders: incoming.reminders ?? current.reminders,
          dispatchOrders: incoming.dispatchOrders ?? current.dispatchOrders,
        };
        const saved = writeDb(merged);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, updatedAt: saved.updatedAt }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // POST reset database to initial demo seed
  if (url.pathname === '/api/reset' && req.method === 'POST') {
    const seed = writeDb(getInitialSeed());
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, state: seed }));
    return;
  }

  // Serve static files from dist/ if available (for unified Render deployment)
  if (fs.existsSync(DIST_PATH)) {
    let filePath = path.join(DIST_PATH, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_PATH, 'index.html');
    }
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      return;
    } catch {
      // Fallback below
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(
    JSON.stringify({
      service: 'Cua Hang Ky Uc Backend API',
      endpoints: ['/api/health', '/api/state', '/api/reset'],
    })
  );
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`[Cửa Hàng Ký Ức Backend] Server running on http://localhost:${PORT}`);
});
