import type { ReactNode } from 'react';

interface Props {
  title: string;
  value?: string;
  children: ReactNode;
}

export function SettingSection({ title, value, children }: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3 className="text-sm font-normal text-[var(--muted)]">{title}</h3>
        {value && <span className="text-sm text-[var(--muted)]">{value}</span>}
      </div>
      {children}
    </section>
  );
}
