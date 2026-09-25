/**
 * Comparison table — zntlDesk vs alternative tracking solutions.
 * Horizontally scrollable on mobile, dark card styling.
 */
import { PRICING } from '../data/pricing';

interface ComparisonRow {
  feature: string;
  zntlDesk: string;
  manualApps: string;
  fitnessWatch: string;
  deskTimer: string;
}

const rows: ComparisonRow[] = [
  {
    feature: 'Automatic detection',
    zntlDesk: 'yes',
    manualApps: 'no',
    fitnessWatch: 'no',
    deskTimer: 'no',
  },
  {
    feature: 'Real-time coaching',
    zntlDesk: 'yes',
    manualApps: 'no',
    fitnessWatch: 'no',
    deskTimer: 'partial',
  },
  {
    feature: 'Privacy (no cloud)',
    zntlDesk: 'yes',
    manualApps: 'no',
    fitnessWatch: 'no',
    deskTimer: 'yes',
  },
  {
    feature: 'Gamification',
    zntlDesk: 'yes',
    manualApps: 'no',
    fitnessWatch: 'partial',
    deskTimer: 'no',
  },
  {
    feature: 'Open source',
    zntlDesk: 'yes',
    manualApps: 'no',
    fitnessWatch: 'no',
    deskTimer: 'partial',
  },
  {
    feature: 'Desk height data',
    zntlDesk: 'yes',
    manualApps: 'no',
    fitnessWatch: 'no',
    deskTimer: 'no',
  },
  {
    feature: 'Price',
    zntlDesk: `${PRICING.basic.currency}${PRICING.basic.price} one-time`,
    manualApps: 'Free\u2013$10/mo',
    fitnessWatch: '$200\u2013400',
    deskTimer: '$20\u201350',
  },
];

const STATUS_ICON: Record<string, { symbol: string; color: string }> = {
  yes: { symbol: '\u2713', color: 'text-brand-text' },
  no: { symbol: '\u2717', color: 'text-state-nudge-text' },
  partial: { symbol: '\u26A0', color: 'text-state-sitting-text' },
};

function CellContent({ value }: { value: string }) {
  const icon = STATUS_ICON[value];
  if (icon) {
    return (
      <span className={`text-lg font-bold ${icon.color}`}>{icon.symbol}</span>
    );
  }
  return <span className="text-sm text-ink-muted">{value}</span>;
}

const COLUMNS = [
  { key: 'zntlDesk' as const, label: 'zntlDesk', highlight: true },
  { key: 'manualApps' as const, label: 'Manual Tracking Apps', highlight: false },
  { key: 'fitnessWatch' as const, label: 'Fitness Watches', highlight: false },
  { key: 'deskTimer' as const, label: 'Standing Desk Timers', highlight: false },
];

export default function ComparisonTable() {
  return (
    <section id="compare" className="py-24 border-t border-line/50">
      <div className="section-container">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          How zntlDesk compares
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-ink-muted">
          Not another app that you forget to open. Hardware-level awareness that
          works without thinking.
        </p>

        {/* Scrollable wrapper for mobile */}
        <div className="mt-16 -mx-4 sm:mx-0 overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 bg-bg p-4 text-left text-sm font-semibold text-ink-muted">
                  Feature
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`p-4 text-center text-sm font-semibold ${
                      col.highlight
                        ? 'text-brand-text bg-surface-2 rounded-t-xl'
                        : 'text-ink-muted'
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isLast = i === rows.length - 1;
                return (
                  <tr
                    key={row.feature}
                    className="border-t border-line/50"
                  >
                    <td className="sticky left-0 bg-bg p-4 text-sm text-ink-muted font-medium">
                      {row.feature}
                    </td>
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className={`p-4 text-center ${
                          col.highlight
                            ? `bg-surface-2 ${isLast ? 'rounded-b-xl' : ''}`
                            : ''
                        }`}
                      >
                        <CellContent value={row[col.key]} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
