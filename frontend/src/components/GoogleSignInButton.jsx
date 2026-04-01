import { useEffect, useRef } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services-sdk';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.body.appendChild(script);
  });

const GoogleSignInButton = ({ mode = 'signin', onSuccess, onError }) => {
  const buttonRef = useRef(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const text = mode === 'signup' ? 'signup_with' : 'signin_with';
  const label = mode === 'signup' ? 'Continue with Google' : 'Sign in with Google';

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let cancelled = false;

    const renderButton = () => {
      if (cancelled || !clientId || !buttonRef.current || !window.google?.accounts?.id) {
        return;
      }

      const container = buttonRef.current;
      const width = Math.max(280, Math.min(container.clientWidth || 320, 400));
      container.innerHTML = '';

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            await onSuccessRef.current?.(response.credential, response);
          } catch (error) {
            onErrorRef.current?.(error);
          }
        },
      });

      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width,
      });
    };

    if (!clientId) {
      return () => {
        cancelled = true;
      };
    }

    loadGoogleScript()
      .then(() => {
        if (!cancelled) {
          renderButton();
        }
      })
      .catch((error) => {
        if (!cancelled) {
          onErrorRef.current?.(error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, text]);

  if (!clientId) {
    return <div className="google-auth google-auth--missing">Google sign-in is not configured yet.</div>;
  }

  return (
    <div className="google-auth">
      <div className="google-auth__label">{label}</div>
      <div ref={buttonRef} className="google-auth__slot" />
    </div>
  );
};

export default GoogleSignInButton;
