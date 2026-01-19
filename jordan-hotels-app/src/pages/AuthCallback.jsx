import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth, Hub } from 'aws-amplify';
import { saveProfile } from '../utils/userProfile';

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
              
              // Extract and save user profile information
              const user = data.payload.data;
              if (user && user.attributes) {
                const attributes = user.attributes;
                console.log('OAuth callback - User attributes:', attributes);
                const email = attributes.email || user.username;
                
                // Extract OAuth-provided names
                const givenName = attributes.given_name || attributes.firstName || attributes.firstname;
                const familyName = attributes.family_name || attributes.lastName || attributes.lastname;
                const fullName = attributes.name || attributes.fullName || attributes.displayName;
                const googleName = attributes['identities'] ? 
                  attributes.identities.find(id => id.providerName === 'Google')?.name : null;
                
                console.log('OAuth callback - Name attributes:', { givenName, familyName, fullName, googleName });
                
                if (givenName || familyName || fullName || googleName) {
                  const firstName = givenName || (fullName ? fullName.split(' ')[0] : '') || (googleName ? googleName.split(' ')[0] : '');
                  const lastName = familyName || (fullName && fullName.split(' ').length > 1 ? fullName.split(' ').slice(1).join(' ') : '') || (googleName && googleName.split(' ').length > 1 ? googleName.split(' ').slice(1).join(' ') : '');
                  const displayName = [firstName, lastName].filter(Boolean).join(' ') || fullName || googleName;
                  
                  const profile = {
                    email,
                    firstName,
                    lastName,
                    displayName,
                    hasCustomName: true,
                  };
                  
                  // Save to localStorage for persistence
                  saveProfile(email, profile);
                }
              }
              
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
