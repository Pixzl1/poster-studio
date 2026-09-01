import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';
import { logger } from '@/lib/logger';
export function apiError(error: unknown): NextResponse {
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error: { code: 'INVALID_INPUT', message: 'The request is not valid.' },
      },
      { status: 400 },
    );
  if (error instanceof AppError)
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  logger.error('Unhandled API error', error);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong. Please try again.',
      },
    },
    { status: 500 },
  );
}
