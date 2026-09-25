type Props = {
  label: string;
  value: string;
};

export default function StatCard({ label, value }: Props) {
  return <div className="rounded-2xl border border-line bg-surface p-5"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">{label}</div><div className="mt-3 text-xl font-semibold text-ink">{value}</div></div>;
}
