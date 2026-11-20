import {
  INITIAL_ACCOUNTS,
  INITIAL_POSTS,
  INITIAL_VAULT_ITEMS,
  INITIAL_TIME_CAPSULES,
  INITIAL_REMINDERS,
  INITIAL_DISPATCH_ORDERS,
} from '../../src/data/mockData.js';

let edgeMemoryState = null;

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

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method === 'GET') {
    if (env && env.MEMORY_VAULT_KV) {
      const kvRaw = await env.MEMORY_VAULT_KV.get('APP_STATE');
      if (kvRaw) {
        return new Response(kvRaw, { status: 200, headers: CORS_HEADERS });
      }
    }
    if (!edgeMemoryState) {
      edgeMemoryState = getSeed();
    }
    return new Response(JSON.stringify(edgeMemoryState), {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    const body = await request.json().catch(() => ({}));
    if (body.reset) {
      edgeMemoryState = getSeed();
      if (env && env.MEMORY_VAULT_KV) {
        await env.MEMORY_VAULT_KV.put('APP_STATE', JSON.stringify(edgeMemoryState));
      }
      return new Response(JSON.stringify({ ok: true, state: edgeMemoryState }), {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    const current = edgeMemoryState || getSeed();
    edgeMemoryState = {
      accounts: body.accounts ?? current.accounts,
      posts: body.posts ?? current.posts,
      vaultItems: body.vaultItems ?? current.vaultItems,
      capsules: body.capsules ?? current.capsules,
      reminders: body.reminders ?? current.reminders,
      dispatchOrders: body.dispatchOrders ?? current.dispatchOrders,
      updatedAt: new Date().toISOString(),
    };

    if (env && env.MEMORY_VAULT_KV) {
      await env.MEMORY_VAULT_KV.put('APP_STATE', JSON.stringify(edgeMemoryState));
    }

    return new Response(
      JSON.stringify({ ok: true, updatedAt: edgeMemoryState.updatedAt }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: CORS_HEADERS,
  });
}
