import React, { useEffect, useRef } from 'react';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

/**
 * Google Sign-In Button Component
 * Renders a native Google Sign-In button
 */
const GoogleSignInButton = ({ 
  role = 'PATIENT', 
  onSuccess, 
  onError,
  text = 'continue_with',
  theme = 'outline',
  size = 'large',
  shape = 'rectangular'
}) => {
  const buttonRef = useRef(null);
  const { handleGoogleSignIn, renderGoogleButton } = useGoogleAuth();

  // Your Google Client ID - Get this from Google Cloud Console
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 
                           'YOUR_GOOGLE_CLIENT_ID_HERE';

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google && buttonRef.current) {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse
        });

        // Render the button
        window.google.accounts.id.renderButton(
          buttonRef.current,
          {
            theme: theme,
            size: size,
            text: text,
            shape: shape,
            logo_alignment: 'left',
            width: buttonRef.current.offsetWidth || 350
          }
        );
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  /**
   * Handle the credential response from Google
   */
  const handleCredentialResponse = async (response) => {
    try {
      // Call the backend with the Google token
      const authResponse = await handleGoogleSignIn(response, role);
      
      if (onSuccess) {
        onSuccess(authResponse);
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <div 
      ref={buttonRef} 
      className="google-signin-button"
      style={{ width: '100%' }}
    />
  );
};

export default GoogleSignInButton;