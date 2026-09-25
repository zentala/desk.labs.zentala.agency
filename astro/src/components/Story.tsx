/**
 * Story section — founder's personal journey from problem to solution.
 * Authentic, first-person narrative that builds trust and explains the product origin.
 */

interface StoryStep {
  phase: string;
  title: string;
  text: string;
}

const steps: StoryStep[] = [
  {
    phase: 'The Problem',
    title: "I'm a programmer. I sit 10+ hours a day.",
    text: "I bought a standing desk three years ago. Electric, motorized, with memory presets. I was going to change my life. But after the novelty wore off, the desk stayed down. I had no idea how bad it actually was.",
  },
  {
    phase: 'The Realization',
    title: 'I had no clue how much I actually stood.',
    text: "So I built a sensor — a small laser distance module mounted under the desk. It measures desk height every second. After a week of data, the number hit me: 8% standing time. Out of a 10-hour workday, I stood for less than 50 minutes. And most of that was getting coffee.",
  },
  {
    phase: 'The First Version',
    title: 'I built an app. It showed numbers. Nothing changed.',
    text: "A dashboard with charts, daily stats, weekly averages. Technically impressive. Behaviorally useless. Knowing I sat 92% of the time didn't make me stand up. I needed behavior change, not just data.",
  },
  {
    phase: 'The Breakthrough',
    title: 'I stripped it down and started experimenting.',
    text: "I threw away the dashboard. Instead, I tried different approaches: a thin overlay bar at the top of the screen that slowly turns red. Subtle notifications. A scoring system where sitting too long costs you points. Each experiment taught me something.",
  },
  {
    phase: 'The Experiments',
    title: '300+ hours of testing. 500+ iterations.',
    text: "I tested overlay bars, toast notifications, sound alerts, gamification with negative scores, progressive warnings, break credit systems. Most things didn't work. Some made it worse. But a few combinations clicked — and the results were dramatic.",
  },
  {
    phase: 'The Results',
    title: 'Standing time: 8% → 22%. Back pain: gone.',
    text: "Position changes went from 1.2 per day to 4.8. My lower back pain disappeared after two weeks. The key wasn't showing data — it was the right nudge at the right moment. A subtle color change beats a loud alarm every time.",
  },
];

export default function Story() {
  return (
    <section className="py-24 border-t border-line/50">
      <div className="section-container">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          How this started
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-ink-muted">
          A personal story about building something I needed myself.
        </p>

        <div className="relative mt-16">
          {/* Vertical timeline line */}
          <div className="absolute left-4 top-0 hidden h-full w-px bg-gradient-to-b from-brand-text/50 via-brand-text/20 to-transparent md:left-1/2 md:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <StoryCard key={step.phase} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StoryCard({ step, index }: { step: StoryStep; index: number }) {
  const isLeft = index % 2 === 0;

  return (
    <div className={`relative flex items-start md:items-center ${
      isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
    }`}>
      {/* Timeline dot */}
      <div className="absolute left-4 top-2 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-brand-strong md:left-1/2 md:block" />

      {/* Spacer */}
      <div className="hidden w-1/2 md:block" />

      {/* Content */}
      <div className={`ml-10 w-full md:ml-0 md:w-1/2 ${
        isLeft ? 'md:pr-12' : 'md:pl-12'
      }`}>
        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-text">
            {step.phase}
          </span>
          <h3 className="mt-2 text-xl font-bold text-ink">
            {step.title}
          </h3>
          <p className="mt-3 text-ink-muted">{step.text}</p>
        </div>
      </div>
    </div>
  );
}
