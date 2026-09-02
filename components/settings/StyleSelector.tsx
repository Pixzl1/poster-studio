import type { PosterMode, PosterTemplateId } from '@/types/poster';

const styles: ReadonlyArray<{ id: PosterTemplateId; label: string }> = [
  { id: 'classic', label: 'Classic' },
  { id: 'chromatic-index', label: 'Chromatic Index' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'noir', label: 'Noir' },
  { id: 'mono', label: 'Mono' },
  { id: 'bloom', label: 'Bloom' },
];

export function StyleSelector({
  value,
  onChange,
  mode,
}: {
  value: PosterTemplateId;
  mode: PosterMode;
  onChange(value: PosterTemplateId): void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {(mode === 'custom'
        ? [
            { id: 'editorial-dark' as const, label: 'Editorial Dark' },
            { id: 'editorial-white' as const, label: 'Editorial White' },
          ]
        : styles
      ).map((style) => {
        const selected = style.id === value;
        return (
          <button
            key={style.id}
            type="button"
            className={`relative h-12 rounded-md border px-3 text-sm font-medium transition-colors ${selected ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]'} disabled:cursor-not-allowed disabled:opacity-55`}
            aria-pressed={selected}
            onClick={() => onChange(style.id)}
          >
            {style.label}
          </button>
        );
      })}
    </div>
  );
}
