import { useState } from 'react';
import toast from 'react-hot-toast';
import { SocialAuthModal } from './SocialAuthModal.jsx';

function IconGoogle() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconApple() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

const btnClass =
  'flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-zinc-800/70 py-3 px-2 text-[11px] font-medium text-white transition hover:border-white/[0.15] hover:bg-zinc-800 sm:text-[12px]';

export function AuthSocialRow() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('google');

  const openProvider = (provider) => {
    setSelectedProvider(provider);
    setModalOpen(true);
  };

  return (
    <>
      <div className="mt-8">
        <div className="relative flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Or continue with</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>
        <div className="mt-5 flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => openProvider('facebook')}
            className={btnClass}
            title="Continue with Facebook"
          >
            <IconFacebook />
            Facebook
          </button>
          <button
            type="button"
            onClick={() => openProvider('google')}
            className={btnClass}
            title="Continue with Google / Gmail"
          >
            <IconGoogle />
            Google
          </button>
          <button
            type="button"
            onClick={() => openProvider('apple')}
            className={btnClass}
            title="Continue with Apple"
          >
            <IconApple />
            Apple
          </button>
        </div>
      </div>

      <SocialAuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialProvider={selectedProvider}
      />
    </>
  );
}
