import { GeneratorWorkspace } from '@/components/GeneratorWorkspace';
import { isMusicBrainzEnabled } from '@/lib/config/musicbrainz';

export const dynamic = 'force-dynamic';

export default function Home() {
  const appName = process.env.APP_NAME || 'Poster Studio';
  return (
    <main className="min-h-screen bg-[var(--background)] xl:fixed xl:inset-0 xl:h-dvh xl:min-h-0 xl:overflow-hidden">
      <GeneratorWorkspace
        appName={appName}
        musicBrainzEnabled={isMusicBrainzEnabled()}
      />
    </main>
  );
}
