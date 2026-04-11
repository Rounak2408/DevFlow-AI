import { motion } from 'framer-motion';

const BRANDS = ['Opal', 'Dune', 'Oasis', 'Asterisk', 'Looks', 'Northwind', 'Vercel', 'Raycast'];

export function LandingTrustedBy() {
  return (
    <section id="trusted" className="border-t border-white/[0.06] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-[15px] font-medium tracking-tight text-white/50"
        >
          Trusted by developers and teams worldwide
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06, duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8"
        >
          {BRANDS.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.04 * i }}
              className="text-[16px] font-semibold tracking-tight text-white/[0.2] transition hover:text-white/35 sm:text-[17px]"
            >
              {name}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
