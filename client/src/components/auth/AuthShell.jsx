import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 0% 50%, rgba(99, 102, 241, 0.08), transparent 45%), radial-gradient(ellipse 50% 40% at 100% 50%, rgba(59, 130, 246, 0.08), transparent 45%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="rounded-[28px] border border-white/[0.08] bg-zinc-900/95 p-8 shadow-[0_0_80px_-24px_rgba(59,130,246,0.35),0_0_100px_-40px_rgba(99,102,241,0.15)] ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 text-[13px] font-semibold tracking-tight text-white/90"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
                D
              </span>
              DevFlow
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">{title}</h1>
            {subtitle && (
              <p className="mx-auto mt-4 max-w-sm text-[14px] leading-relaxed text-zinc-400">{subtitle}</p>
            )}
          </div>
          {children}
          {footer && <div className="mt-8 text-center text-[14px] text-zinc-400">{footer}</div>}
        </div>

        <p className="mt-8 text-center text-[12px] text-zinc-600">
          <Link to="/" className="transition hover:text-zinc-400">
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
