export function Skeleton({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#1e293b]/80 ${className}`}
      aria-hidden
    >
      <div className="absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
    </div>
  );
}
