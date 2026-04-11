import { mediaUrl } from '../../lib/mediaUrl.js';

const sizeMap = {
  sm: 'h-10 w-10 text-sm rounded-full',
  md: 'h-14 w-14 text-xl rounded-2xl',
  lg: 'h-20 w-20 text-3xl rounded-2xl',
  xl: 'h-24 w-24 text-4xl rounded-3xl',
};

export function MemberAvatar({ user, size = 'md' }) {
  const cls = sizeMap[size] || sizeMap.md;
  const src = user?.avatar ? mediaUrl(user.avatar) : null;

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${cls} object-cover ring-2 ring-white/10`}
      />
    );
  }

  if (user?.avatarEmoji) {
    return (
      <div
        className={`flex ${cls} items-center justify-center bg-[#1a2234] ring-2 ring-white/10`}
        aria-hidden
      >
        <span className="leading-none">{user.avatarEmoji}</span>
      </div>
    );
  }

  const initial = (user?.name || '?').slice(0, 1).toUpperCase();
  return (
    <div
      className={`flex ${cls} items-center justify-center bg-gradient-to-br from-blue-600 to-violet-600 font-bold text-white ring-2 ring-white/10`}
    >
      {initial}
    </div>
  );
}
