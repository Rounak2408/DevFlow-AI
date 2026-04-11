import { motion } from 'framer-motion';

const STATS = [
  { value: '10k+', label: 'Developers using DevFlow' },
  { value: '1M+', label: 'Tasks managed end-to-end' },
  { value: '99.9%', label: 'Target platform uptime' },
  { value: '50+', label: 'Teams onboarded in beta' },
];

export function LandingStats() {
  return (
    <section id="stats" className="border-t border-white/[0.06] px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-[13px] font-medium uppercase tracking-wider text-white/35"
        >
          At a glance
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-3 max-w-xl text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Built for teams that ship every week.
        </motion.h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent px-6 py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0.6 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl font-semibold tracking-tight text-white sm:text-4xl tabular-nums"
              >
                {stat.value}
              </motion.div>
              <p className="mt-3 text-[13px] leading-snug text-white/40">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
