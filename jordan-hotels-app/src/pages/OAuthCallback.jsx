import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { exchangeCodeForTokens, popPostLoginPath } from '../auth/hostedUi';
import { useAuth } from '../context/AuthContext';

function useQueryParams() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const query = useQueryParams();
  const { setSessionFromHostedTokens } = useAuth();
  const [message, setMessage] = useState('Signing you in…');

  useEffect(() => {
    let isActive = true;

    const run = async () => {
      const error = query.get('error');
      const errorDescription = query.get('error_description');
      if (error) {
        throw new Error(errorDescription || error);
      }

      const code = query.get('code');
      const state = query.get('state');
      if (!code || !state) {
        throw new Error('Missing OAuth parameters');
      }

      const tokens = await exchangeCodeForTokens({ code, state });
      setSessionFromHostedTokens(tokens);

      const postLoginPath = popPostLoginPath() || '/';
      navigate(postLoginPath, { replace: true });
    };

    run().catch((err) => {
      if (!isActive) return;
      setMessage(`Sign-in failed: ${err?.message || String(err)}`);
      // Send user back to login after a short pause.
      setTimeout(() => {
        try {
          navigate('/login', { replace: true });
        } catch {
          // ignore
        }
      }, 1500);
    });

    return () => {
      isActive = false;
    };
  }, [query, navigate, setSessionFromHostedTokens]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2">Signing in</h1>
      <p className="text-sm opacity-80">{message}</p>
    </div>
  );
}
