type Tone = 'success' | 'danger' | 'learn';

type Props = {
  tone: Tone;
  title: string;
  items: string[];
};

const toneStyles: Record<Tone, string> = { success: 'border-state-standing-text/40', danger: 'border-state-nudge-text/40', learn: 'border-state-walking-text/40' };

export default function InfoCard({ tone, title, items }: Props) {
  return <div className={'rounded-2xl border bg-surface p-6 ' + toneStyles[tone]}><h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-muted">{title}</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-ink-muted">{items.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-strong" />{item}</li>)}</ul></div>;
}
