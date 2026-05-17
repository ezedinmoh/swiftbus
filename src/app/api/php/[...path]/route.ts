import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function getPhpBaseUrl(req: NextRequest) {
  const envUrl = process.env.PHP_API_BASE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, '');

  const host = req.headers.get('host') ?? 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`.replace(/\/+$/, '');
}

async function handler(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await ctx.params;
  const phpBase = getPhpBaseUrl(req);

  const targetUrl = new URL(`${phpBase}/${path.join('/')}`);
  for (const [k, v] of req.nextUrl.searchParams) targetUrl.searchParams.set(k, v);

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) return;
    if (lower === 'host') return;
    headers.set(key, value);
  });

  let body: BodyInit | undefined;
  const method = req.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = req.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      body = JSON.stringify(await req.json());
      headers.set('content-type', 'application/json');
    } else {
      body = await req.arrayBuffer();
    }
  }

  const upstream = await fetch(targetUrl.toString(), {
    method,
    headers,
    body,
    redirect: 'manual',
  });

  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) return;
    // Preserve PHP session cookies
    if (lower === 'set-cookie') resHeaders.append('set-cookie', value);
    else resHeaders.set(key, value);
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;

