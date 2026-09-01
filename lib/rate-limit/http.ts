import { isIP } from 'node:net';
import { type NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from '.';
import type { RateLimitResult } from './provider';

function clientIdentifier(request: NextRequest): string {
  if (process.env.TRUST_PROXY_HEADERS !== 'true') return 'shared-client';

  const candidate =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  return candidate && isIP(candidate) ? candidate : 'unknown-client';
}

export async function checkApiRateLimit(
  request: NextRequest,
  scope = 'api',
  limit = 30,
  windowSeconds = 60,
): Promise<RateLimitResult> {
  return rateLimiter.consume(
    `${scope}:${clientIdentifier(request)}`,
    limit,
    windowSeconds,
  );
}

export function rateLimitedResponse(
  rate: RateLimitResult,
  message = 'Too many requests. Please wait a moment.',
): NextResponse {
  return NextResponse.json(
    { error: { code: 'RATE_LIMITED', message } },
    {
      status: 429,
      headers: { 'Retry-After': String(rate.retryAfterSeconds) },
    },
  );
}
