/**
 * FAQ section — common questions about the product, shipping, and business model.
 */
import { trackEvent } from '../utils/analytics';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How does the sensor work?',
    answer:
      'The sensor uses a VL53L1X Time-of-Flight (ToF) laser module mounted under your desk, pointing down to the floor. It measures the distance every second. When the desk goes up, the distance increases — the app knows you\'re standing. It\'s Class 1 eye-safe (same as your phone\'s face unlock) and connects via USB-C.',
  },
  {
    question: 'Does it need batteries or WiFi?',
    answer:
      'No batteries, no WiFi, no Bluetooth. The sensor is powered by USB from your computer. All data processing happens locally on your machine. No cloud, no account, no internet required.',
  },
  {
    question: 'Is the software really open source?',
    answer:
      'Yes, the desktop app is fully open source under MIT license. You can inspect the code, modify it, or contribute. The sensor firmware is also open source. Premium features (cloud sync, AI coaching) will be separate paid services in the future.',
  },
  {
    question: 'When does it ship?',
    answer:
      'Production starts when we hit the pre-order threshold (200 for Basic, 500 for Pro). Estimated 6-8 weeks from threshold to delivery. We ship from Poland — 1-2 days within Poland, 2-6 days EU, 7-14 days worldwide.',
  },
  {
    question: 'What if the threshold is not reached?',
    answer:
      'You get a full refund, no questions asked. Your card is charged at pre-order, and if we don\'t hit the threshold within 6 months, every order is automatically refunded.',
  },
  {
    question: 'Does it work with any desk?',
    answer:
      'It works with any height-adjustable desk — electric, manual crank, or pneumatic. The sensor measures absolute desk height, so it doesn\'t matter how your desk moves. Just stick it under the surface and plug it in.',
  },
  {
    question: 'What operating systems are supported?',
    answer:
      'Windows is fully supported today. macOS and Linux support are planned — the app is built with Tauri (Rust + web tech), so cross-platform is architecturally ready. Join the waitlist for your OS.',
  },
  {
    question: 'Can I build it myself?',
    answer:
      'Absolutely. The hardware is off-the-shelf components (VL53L1X sensor + XIAO ESP32-C3 microcontroller) and the software is open source. Total DIY cost is around €15-20 if you source the parts yourself. The kit just saves you the hassle.',
  },
];

function trackFaqExpand() {
  trackEvent('faq-expand');
}

export default function FAQ() {
  return (
    <section className="py-24 border-t border-line/50">
      <div className="section-container">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Frequently asked questions
        </h2>

        <div className="mx-auto mt-16 max-w-3xl space-y-6">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-line bg-surface"
              onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) trackFaqExpand(); }}
            >
              <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span className="ml-4 text-ink-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-6 pb-6">
                <p className="text-ink-muted leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
