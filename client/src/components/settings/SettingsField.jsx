export function SettingsField({ label, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label ? (
        <label className="mb-1.5 block text-[13px] font-medium text-slate-300">{label}</label>
      ) : null}
      {children}
      {hint ? <p className="mt-1.5 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function settingsInputClass(disabled) {
  return `w-full rounded-xl border border-white/[0.08] bg-[#0B0F19]/80 px-3.5 py-2.5 text-[13px] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] transition placeholder:text-slate-600 focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
    disabled ? 'cursor-not-allowed opacity-60' : ''
  }`;
}
