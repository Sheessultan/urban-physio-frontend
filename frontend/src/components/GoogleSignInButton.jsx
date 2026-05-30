import { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function GoogleSignInButton({ onSuccess, onError, text = 'continue_with' }) {
  const containerRef = useRef(null);
  const [btnWidth, setBtnWidth] = useState(320);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const updateWidth = () => {
      const available = el.getBoundingClientRect().width;
      if (available <= 0) return;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.floor(available)));
      setBtnWidth((prev) => (prev === next ? prev : next));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    window.addEventListener('resize', updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  if (!clientId) {
    return null;
  }

  return (
    <div ref={containerRef} className="google-signin-wrap w-full min-w-0">
      <div className="google-signin-inner flex justify-center w-full">
        <GoogleLogin
          onSuccess={(res) => {
            if (res.credential) {
              onSuccess(res.credential);
            } else {
              onError?.({ message: 'Google sign-in failed' });
            }
          }}
          onError={() => onError?.({ message: 'Google sign-in was cancelled' })}
          useOneTap={false}
          theme="outline"
          size="large"
          width={btnWidth}
          text={text}
          shape="rectangular"
        />
      </div>
    </div>
  );
}

export function hasGoogleAuth() {
  return Boolean(clientId);
}
