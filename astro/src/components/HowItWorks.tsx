/**
 * How It Works section — 3 simple steps to show the product is easy.
 * Emphasizes simplicity: mount, plug, done. No cloud, no account.
 */

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Mount the sensor',
    description:
      'Stick the tiny sensor under your desk with the included mounting tape. It points down to the floor and measures desk height using a safe laser distance sensor.',
    icon: '📐',
  },
  {
    number: '02',
    title: 'Plug in USB',
    description:
      'Connect the sensor to your computer with the included USB-C cable. The app auto-detects the device — no drivers, no pairing, no setup wizard.',
    icon: '🔌',
  },
  {
    number: '03',
    title: 'The app does everything',
    description:
      'Open source desktop app tracks your sitting and standing time, shows a subtle overlay bar, sends smart notifications, and learns your patterns. All data stays on your machine.',
    icon: '✨',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 border-t border-line/50">
      <div className="section-container">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-lg text-ink-muted">
          Three steps. Two minutes. No cloud. No account.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-line bg-surface p-8"
            >
              <div className="mb-4 text-4xl">{step.icon}</div>
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-text">
                Step {step.number}
              </div>
              <h3 className="text-xl font-bold text-ink">{step.title}</h3>
              <p className="mt-3 text-ink-muted">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-line bg-surface-2 px-6 py-3 text-sm text-ink-muted">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-strong" />
            All data stays on your computer. No cloud. No tracking. No account needed.
          </div>
        </div>
      </div>
    </section>
  );
}
