import { type NextRequest, NextResponse } from 'next/server';
import { isMusicBrainzEnabled } from '@/lib/config/musicbrainz';
import { MusicBrainzDisabledError } from '@/lib/music/errors';
import { apiError } from '@/lib/music/http';
import { musicProvider } from '@/lib/music';
import { searchQuerySchema } from '@/lib/music/schemas';
import { checkApiRateLimit, rateLimitedResponse } from '@/lib/rate-limit/http';

export async function GET(request: NextRequest) {
  try {
    if (!isMusicBrainzEnabled()) throw new MusicBrainzDisabledError();
    const rate = await checkApiRateLimit(request, 'album-search', 20);
    if (!rate.allowed) return rateLimitedResponse(rate);
    const query = searchQuerySchema.parse(
      request.nextUrl.searchParams.get('q') ?? '',
    );
    return NextResponse.json(
      { data: await musicProvider.searchAlbums(query) },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
        },
      },
    );
  } catch (error) {
    return apiError(error);
  }
}
