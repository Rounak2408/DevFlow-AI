import { motion } from 'framer-motion';

const QUOTES = [
  {
    name: 'Priya N.',
    role: 'Engineering Manager · infra SaaS',
    body: 'We replaced a Jira + Slack + random Git scripts combo with DevFlow. On-call actually knows what shipped because commits sit next to the task.',
  },
  {
    name: 'Marcus Chen',
    role: 'Staff Frontend Engineer',
    body: 'The Kanban + realtime chat combo is deceptively simple. My team stopped duplicating context in DMs — the project room is the source of truth.',
  },
  {
    name: 'Elena Vásquez',
    role: 'Tech Lead · fintech',
    body: 'Analytics are fast enough to leave open on a wall display. Redis-backed caching means we’re not hammering the API during incident weeks.',
  },
];

export function LandingTestimonials() {
  return (
    <section id="testimonials" className="border-t border-white/[0.06] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="text-[13px] font-medium uppercase tracking-wider text-indigo-400/90">
            Teams
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Used by engineers who care about the craft.
          </h2>
          <p className="mt-4 text-base text-white/45">
            Real workflows, not slide-deck promises — here’s what early teams told us.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {QUOTES.map((q, i) => (
            <motion.blockquote
              key={q.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
            >
              <p className="flex-1 text-[14px] leading-relaxed text-white/55">“{q.body}”</p>
              <footer className="mt-6 border-t border-white/[0.06] pt-5">
                <cite className="not-italic">
                  <span className="text-sm font-semibold text-white">{q.name}</span>
                  <span className="mt-1 block text-[12px] text-white/40">{q.role}</span>
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
