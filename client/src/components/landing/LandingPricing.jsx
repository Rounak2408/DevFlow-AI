import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    blurb: 'Solo builders and side projects.',
    features: [
      'Up to 3 projects',
      'Kanban + tasks',
      'Project chat (realtime)',
      'Community support',
    ],
    cta: 'Start free',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$18',
    cadence: 'per user / mo',
    blurb: 'Small teams shipping every sprint.',
    features: [
      'Unlimited projects',
      'GitHub activity + analytics cache',
      'AI task breakdown & bug hints',
      'Priority email support',
    ],
    cta: 'Get Pro',
    href: '/register',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$39',
    cadence: 'per user / mo',
    blurb: 'Org-wide collaboration and controls.',
    features: [
      'Everything in Pro',
      'Roles & project invites',
      'Advanced analytics export',
      'SLA & dedicated success (pilot)',
    ],
    cta: 'Talk to sales',
    href: '#contact',
    highlighted: false,
  },
];

export function LandingPricing() {
  return (
    <section id="pricing" className="border-t border-white/[0.06] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-[13px] font-medium uppercase tracking-wider text-indigo-400/90">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Simple plans. No surprise line items.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/45">
            Start free, upgrade when realtime chat, GitHub insights, and AI queues become part of your
            default workflow.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                tier.highlighted
                  ? 'border-indigo-500/40 bg-gradient-to-b from-indigo-500/10 to-white/[0.02] shadow-[0_0_0_1px_rgba(99,102,241,0.2)]'
                  : 'border-white/[0.08] bg-white/[0.02]'
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
              <p className="mt-2 text-[13px] text-white/45">{tier.blurb}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-white">{tier.price}</span>
                <span className="text-[13px] text-white/40">{tier.cadence}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3 text-[13px] text-white/55">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400/90" strokeWidth={2} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {tier.href.startsWith('#') ? (
                <a
                  href={tier.href}
                  className={`mt-8 block w-full rounded-full py-2.5 text-center text-sm font-semibold transition ${
                    tier.highlighted
                      ? 'bg-white text-black hover:bg-white/95'
                      : 'border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {tier.cta}
                </a>
              ) : (
                <Link
                  to={tier.href}
                  className={`mt-8 block w-full rounded-full py-2.5 text-center text-sm font-semibold transition ${
                    tier.highlighted
                      ? 'bg-white text-black hover:bg-white/95'
                      : 'border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {tier.cta}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
