import { cookies, headers } from 'next/headers';

async function getBaseUrl() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

export async function phpApi<T>(
  pathWithQuery: string,
  init?: Omit<RequestInit, 'headers'> & { headers?: Record<string, string> },
) {
  const url = new URL(`/api/php/${pathWithQuery.replace(/^\/+/, '')}`, await getBaseUrl());

  const cookieHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    cache: 'no-store',
  });

  const json = (await res.json().catch(() => null)) as T | null;
  return { res, json };
}

