import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroMockup } from '../components/landing/HeroMockup.jsx';
import { LandingFeatures } from '../components/landing/LandingFeatures.jsx';
import { LandingStats } from '../components/landing/LandingStats.jsx';
import { LandingTestimonials } from '../components/landing/LandingTestimonials.jsx';
import { LandingPricing } from '../components/landing/LandingPricing.jsx';
import { LandingTrustedBy } from '../components/landing/LandingTrustedBy.jsx';
import { LandingCTA } from '../components/landing/LandingCTA.jsx';
import { LandingFooter } from '../components/landing/LandingFooter.jsx';

const nav = [
  { label: 'Product', href: '#product' },
  { label: 'Features', href: '#features' },
  { label: 'Stats', href: '#stats' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Customers', href: '#testimonials' },
  { label: 'Contact', href: '#contact' },
];

const spring = { type: 'spring', stiffness: 380, damping: 40 };

export function Landing() {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-white/20">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 55% 40% at 50% -5%, rgba(99, 102, 241, 0.16), transparent 55%), radial-gradient(ellipse 40% 30% at 80% 20%, rgba(14, 165, 233, 0.08), transparent 50%), linear-gradient(105deg, transparent 40%, rgba(99,102,241,0.06) 50%, transparent 60%), #000000',
        }}
      />

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-black">
              <span className="text-xs font-bold">D</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">DevFlow</span>
          </Link>

          <nav className="hidden flex-1 justify-center lg:flex">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="rounded-md px-3 py-1.5 text-[13px] text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/80"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/login"
              className="text-[13px] font-medium text-white/50 transition hover:text-white/90"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition hover:bg-white/95"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-8 text-center sm:px-6 sm:pt-20 md:pt-28">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="text-[2rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-[3.25rem] md:leading-[1.08]"
          >
            DevFlow is a purpose-built tool for planning and shipping software.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/50 sm:text-lg"
          >
            Meet the system for modern product development. Streamline issues, projects, realtime chat,
            GitHub activity, and AI — without switching tools.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/40"
          >
            The fastest way to keep backlog, code context, and team chat aligned — so reviews ship, not
            slide decks.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, ...spring }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              to="/register"
              className="inline-flex w-full min-w-[200px] items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-95 sm:w-auto"
            >
              Get Started Now
            </Link>
            <a
              href="#contact"
              className="inline-flex w-full min-w-[200px] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/25 hover:bg-white/[0.08] sm:w-auto"
            >
              Book a Demo
            </a>
          </motion.div>
        </section>

        <section id="product" className="relative mx-auto max-w-6xl px-4 pb-12 sm:px-6 md:pb-20">
          <div
            className="relative mx-auto mt-2 [perspective:1600px]"
            style={{ perspectiveOrigin: '50% 30%' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 56 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="origin-[50%_20%] [transform-style:preserve-3d] will-change-transform max-md:[transform:rotateX(6deg)_rotateY(-9deg)_scale(0.88)] md:[transform:rotateX(11deg)_rotateY(-13deg)_scale(0.94)]"
            >
              <HeroMockup />
            </motion.div>
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent"
            aria-hidden
          />
        </section>

        <LandingTrustedBy />
        <LandingFeatures />
        <LandingStats />
        <LandingTestimonials />
        <LandingPricing />
        <LandingCTA />
        <LandingFooter />
      </main>
    </div>
  );
}
