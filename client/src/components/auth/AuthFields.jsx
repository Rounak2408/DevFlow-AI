import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const inputClass =
  'w-full rounded-full border border-white/[0.1] bg-zinc-800/90 py-3.5 pl-11 pr-4 text-[14px] text-white placeholder:text-zinc-500 transition focus:border-blue-500/45 focus:outline-none focus:ring-1 focus:ring-blue-500/35';

export function AuthEmailField({ value, onChange, placeholder = 'Enter your email address' }) {
  return (
    <div className="relative">
      <Mail
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500"
        strokeWidth={1.5}
      />
      <input
        type="email"
        required
        autoComplete="email"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

export function AuthNameField({ value, onChange, placeholder = 'Enter your full name' }) {
  return (
    <div className="relative">
      <User
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500"
        strokeWidth={1.5}
      />
      <input
        type="text"
        required
        autoComplete="name"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}

export function AuthPasswordField({
  value,
  onChange,
  show,
  onToggleShow,
  placeholder = 'Enter your password',
  autoComplete = 'current-password',
  minLength,
}) {
  return (
    <div className="relative">
      <Lock
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500"
        strokeWidth={1.5}
      />
      <input
        type={show ? 'text' : 'password'}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={onToggleShow}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-blue-400/90 transition hover:bg-white/5 hover:text-blue-300"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={1.5} />}
      </button>
    </div>
  );
}
