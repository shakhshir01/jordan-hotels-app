import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth, Hub } from 'aws-amplify';

const AuthCallback = () => {
  const [busy, setBusy] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if this is an OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          navigate('/login', { replace: true });
          setBusy(false);
          return;
        }

        if (code) {
          // Set up Hub listener for auth events
          const authListener = (data) => {
            if (data.payload.event === 'signIn') {
              Hub.remove('auth', authListener);
              navigate('/', { replace: true });
              setBusy(false);
            }
          };

          Hub.listen('auth', authListener);

          // Also periodically check for authentication
          let attempts = 0;
          const checkAuth = async () => {
            attempts++;
            try {
              const _user = await Auth.currentAuthenticatedUser({ bypassCache: true });
              Hub.remove('auth', authListener);
              navigate('/', { replace: true });
              setBusy(false);
              return;
            } catch (_err) {
              if (attempts < 10) {
                setTimeout(checkAuth, 1000);
              } else {
                Hub.remove('auth', authListener);
                navigate('/login', { replace: true });
                setBusy(false);
              }
            }
          };

          // Start checking
          setTimeout(checkAuth, 500);

        } else {
          navigate('/login', { replace: true });
          setBusy(false);
        }
      } catch (_error) {
        navigate('/login', { replace: true });
        setBusy(false);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (busy) return <div className="py-20 text-center">Completing sign in…</div>;
  return null;
};

export default AuthCallback;
