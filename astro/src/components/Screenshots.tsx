/**
 * App Screenshots section — placeholder gray boxes for future real screenshots.
 * Will be replaced with actual app screenshots by the user later.
 */
export default function Screenshots() {
  const placeholders = [
    'Main floating window — daily stats',
    'Overlay bar — green to red progression',
    'Settings panel — session configuration',
    'Phone dashboard — remote display',
  ];

  return (
    <section className="py-24 border-t border-line/50">
      <div className="section-container">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          See it in action
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-lg text-ink-muted">
          Real screenshots from the desktop app. What you see is what you get.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {placeholders.map((label) => (
            <div
              key={label}
              className="flex aspect-video items-center justify-center rounded-2xl border border-line bg-surface-2"
            >
              <div className="text-center px-4">
                <div className="text-4xl text-ink-muted mb-3">🖼️</div>
                <p className="text-sm text-ink-muted">{label}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  screenshot coming soon
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
