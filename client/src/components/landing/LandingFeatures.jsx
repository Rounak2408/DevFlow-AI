import { motion } from 'framer-motion';
import {
  Users,
  Sparkles,
  Github,
  BarChart3,
  Activity,
  Bell,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'Real-time collaboration',
    description:
      'Project rooms with Socket.io: messages land instantly, typing hints keep async work human.',
  },
  {
    icon: Sparkles,
    title: 'AI-powered task assistant',
    description:
      'Turn a spec into a structured backlog. Redis-backed queues, retries, and response caching.',
  },
  {
    icon: Github,
    title: 'GitHub integration',
    description:
      'Wire a repo as owner/name. Pull commits and contributor stats next to the work that shipped.',
  },
  {
    icon: BarChart3,
    title: 'Advanced analytics dashboard',
    description:
      'Completion rate, status mix, and a 7-day trend — cached so dashboards stay fast at scale.',
  },
  {
    icon: Activity,
    title: 'Team productivity tracking',
    description:
      'See who owns what, what’s blocked in review, and how work moves across the board.',
  },
  {
    icon: Bell,
    title: 'Smart notifications',
    description:
      'Surface invites, assignments, and room activity without another noisy channel.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export function LandingFeatures() {
  return (
    <section id="features" className="border-t border-white/[0.06] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <p className="text-[13px] font-medium uppercase tracking-wider text-indigo-400/90">
            Platform
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything your team needs to plan, build, and ship.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/45">
            One surface for issues, chat, repos, and metrics — opinionated where it helps, flexible where
            it matters.
          </p>
        </motion.div>

        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <motion.li
              key={title}
              variants={item}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-indigo-300/90 transition group-hover:border-indigo-500/20 group-hover:text-indigo-200">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 text-[15px] font-semibold tracking-tight text-white">{title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/45">{description}</p>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
