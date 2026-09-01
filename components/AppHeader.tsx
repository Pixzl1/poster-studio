import Link from 'next/link';
import { DiscIcon } from '@/components/ui/Icons';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-[var(--border)] bg-[color:var(--surface)]/95 px-5 backdrop-blur-sm lg:px-7">
      <Link
        className="flex items-center gap-2.5 text-sm font-semibold tracking-[-0.02em]"
        href="/"
        aria-label="Poster Studio – Startseite"
      >
        <span className="grid size-7 place-items-center rounded-md bg-[var(--accent)] text-white">
          <DiscIcon className="size-4" />
        </span>
        Poster Studio
      </Link>
      <span className="text-[11px] tracking-[0.08em] text-[var(--muted)]">
        Source Available
      </span>
    </header>
  );
}
