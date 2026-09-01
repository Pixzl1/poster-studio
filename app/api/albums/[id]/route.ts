import { type NextRequest, NextResponse } from 'next/server';
import { isMusicBrainzEnabled } from '@/lib/config/musicbrainz';
import { MusicBrainzDisabledError } from '@/lib/music/errors';
import { apiError } from '@/lib/music/http';
import { musicProvider } from '@/lib/music';
import { mbidSchema } from '@/lib/music/schemas';
import { checkApiRateLimit, rateLimitedResponse } from '@/lib/rate-limit/http';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!isMusicBrainzEnabled()) throw new MusicBrainzDisabledError();
    const rate = await checkApiRateLimit(request, 'album-detail', 30);
    if (!rate.allowed) return rateLimitedResponse(rate);
    const { id } = await params;
    return NextResponse.json(
      { data: await musicProvider.getAlbum(mbidSchema.parse(id)) },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=43200, stale-while-revalidate=86400',
        },
      },
    );
  } catch (error) {
    return apiError(error);
  }
}
