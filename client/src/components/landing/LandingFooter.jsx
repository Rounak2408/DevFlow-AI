import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

const PRODUCT = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Changelog', href: '#changelog' },
  { label: 'Docs', href: '#docs' },
];

const COMPANY = [
  { label: 'About', href: '#company' },
  { label: 'Blog', href: '#blog' },
  { label: 'Careers', href: '#careers' },
  { label: 'Contact', href: '#contact' },
];

const SOCIAL = [
  { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { label: 'GitHub', href: 'https://github.com', icon: Github },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
];

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-white/[0.06] bg-black px-4 py-14 sm:px-6">
      <div id="changelog" className="sr-only" aria-hidden>
        Changelog anchor
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-black">
                <span className="text-sm font-bold">D</span>
              </div>
              <span className="text-sm font-semibold">DevFlow</span>
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/40">
              The workspace for issues, chat, GitHub context, and AI — without tab overload.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35">Product</p>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[13px] text-white/50 transition hover:text-white/80"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35">Company</p>
            <ul className="mt-4 space-y-2.5">
              {COMPANY.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-[13px] text-white/50 transition hover:text-white/80"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div id="company">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/35">Social</p>
            <ul className="mt-4 flex gap-3">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-white/45 transition hover:border-white/15 hover:text-white/80"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 text-[12px] text-white/35 sm:flex-row">
          <p>© {year} DevFlow. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-white/55">
              Privacy
            </a>
            <a href="#terms" className="hover:text-white/55">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
