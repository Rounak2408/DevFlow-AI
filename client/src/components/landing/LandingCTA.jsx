import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function LandingCTA() {
  return (
    <section className="border-t border-white/[0.06] px-4 py-20 sm:px-6 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl rounded-3xl border border-white/[0.08] bg-gradient-to-br from-indigo-500/15 via-white/[0.03] to-cyan-500/10 px-8 py-14 text-center sm:px-12 sm:py-16"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl sm:leading-tight">
          Start building better software with DevFlow
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/45">
          Spin up a workspace in minutes. Bring your repo, your team, and your backlog — we’ll keep the
          context in one place.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            to="/register"
            className="inline-flex w-full min-w-[200px] items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95 sm:w-auto"
          >
            Get Started
          </Link>
          <a
            href="#product"
            className="inline-flex w-full min-w-[200px] items-center justify-center rounded-full border border-white/15 bg-black/30 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/25 hover:bg-white/[0.06] sm:w-auto"
          >
            View Demo
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
