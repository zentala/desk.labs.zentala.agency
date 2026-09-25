/**
 * Features section — 6-item icon grid highlighting key app capabilities.
 */

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '📊',
    title: 'Overlay Progress Bar',
    description:
      'A thin bar at the top of your screen that slowly changes from green to red as your sitting session grows. Subtle enough to ignore when focused, visible enough to nudge you.',
  },
  {
    icon: '📈',
    title: 'Daily KPIs',
    description:
      'See your sitting vs standing ratio, number of position changes, longest session, and daily score — all at a glance in the floating window.',
  },
  {
    icon: '🎮',
    title: 'Gamification',
    description:
      'A scoring system where sitting costs points and standing earns them. Negative score is valid gameplay — the comeback mechanic drives real motivation.',
  },
  {
    icon: '🔔',
    title: 'Smart Alerts',
    description:
      'Progressive notifications that escalate gently. Not annoying alarms — carefully tuned nudges based on 500+ hours of experimentation.',
  },
  {
    icon: '🔓',
    title: 'Open Source',
    description:
      'The entire desktop app is open source (MIT). Inspect the code, modify it, contribute. Your data, your rules, your app.',
  },
  {
    icon: '📱',
    title: 'Phone Display',
    description:
      'Mount an old phone next to your monitor as a dedicated desk dashboard. Real-time stats via built-in web server. No app install needed.',
  },
];

export default function Features() {
  return (
    <section className="py-24 border-t border-line/50">
      <div className="section-container">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          What the app does
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-lg text-ink-muted">
          Built from 300+ hours of self-experimentation. Every feature earned its place.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-line"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="text-lg font-bold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-ink-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
