/**
 * Problem section — emotional hook.
 * Makes the reader feel seen: you bought a standing desk, you don't use it.
 */
export default function Problem() {
  const painPoints = [
    {
      stat: '€800',
      label: 'spent on a motorized standing desk',
      detail: 'Premium brand. Electric motors. Memory presets.',
    },
    {
      stat: '2x',
      label: 'stood up this month',
      detail: 'Both times to look for a cable behind the desk.',
    },
    {
      stat: '3 days',
      label: 'how long manual tracking lasted',
      detail: '"I\'ll just note when I stand." You won\'t. Nobody does.',
    },
  ];

  return (
    <section className="py-24 border-t border-line/50">
      <div className="section-container">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Sound familiar?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-ink-muted">
          You bought the desk. You had the best intentions.
          But without feedback, nothing changes.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {painPoints.map((point) => (
            <div
              key={point.stat}
              className="rounded-2xl border border-line bg-surface p-8 text-center"
            >
              <div className="text-4xl font-extrabold text-brand-text">
                {point.stat}
              </div>
              <div className="mt-3 text-lg font-semibold text-ink">
                {point.label}
              </div>
              <p className="mt-3 text-sm text-ink-muted">{point.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
