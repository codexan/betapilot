import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import AppIcon from '../AppIcon';
import { googleOAuthService } from '../../services/googleOAuthService';

const GoogleOAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Get authorization code from URL
      const code = searchParams?.get('code');
      const error = searchParams?.get('error');

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      setStatus('exchanging');

      // Exchange code for tokens
      const tokenResult = await googleOAuthService?.exchangeCodeForTokens(code);
      if (!tokenResult?.success) {
        throw new Error(tokenResult?.error || 'Failed to exchange authorization code');
      }

      setStatus('getting_user_info');

      // Get user info
      const userResult = await googleOAuthService?.getUserInfo(tokenResult?.tokens?.access_token);
      if (!userResult?.success) {
        throw new Error(userResult?.error || 'Failed to get user information');
      }

      setUserEmail(userResult?.userInfo?.email);
      setStatus('storing');

      // Store tokens in Supabase
      const storeResult = await googleOAuthService?.storeGoogleTokens(
        tokenResult?.tokens,
        userResult?.userInfo
      );

      if (!storeResult?.success) {
        throw new Error(storeResult?.error || 'Failed to store authentication tokens');
      }

      setStatus('success');

      // Redirect back to the original page after a short delay
      setTimeout(() => {
        const returnUrl = sessionStorage?.getItem('oauth_return_url');
        sessionStorage?.removeItem('oauth_pending');
        sessionStorage?.removeItem('oauth_return_url');
        
        navigate(returnUrl || '/campaign/create', { 
          replace: true,
          state: { 
            message: 'Google account connected successfully!',
            type: 'success'
          }
        });
      }, 2000);

    } catch (error) {
      setError(error?.message);
      setStatus('error');
      
      // Redirect back after error display
      setTimeout(() => {
        const returnUrl = sessionStorage?.getItem('oauth_return_url');
        sessionStorage?.removeItem('oauth_pending');
        sessionStorage?.removeItem('oauth_return_url');
        
        navigate(returnUrl || '/campaign/create', { 
          replace: true,
          state: { 
            message: `Failed to connect Google account: ${error?.message}`,
            type: 'error'
          }
        });
      }, 3000);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing authorization...';
      case 'exchanging':
        return 'Exchanging authorization code...';
      case 'getting_user_info':
        return 'Getting user information...';
      case 'storing':
        return 'Storing authentication tokens...';
      case 'success':
        return 'Successfully connected Google account!';
      case 'error':
        return 'Failed to connect Google account';
      default:
        return 'Processing...';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <AppIcon name="CheckCircle" size={48} className="text-success" />;
      case 'error':
        return <AppIcon name="XCircle" size={48} className="text-destructive" />;
      default:
        return <AppIcon name="Loader2" size={48} className="text-primary animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Google OAuth Integration
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {getStatusMessage()}
          </p>

          {userEmail && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-success">
                Connected as: {userEmail}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-destructive">
                <AppIcon name="AlertCircle" size={16} />
                <p className="text-sm font-medium">Connection Failed</p>
              </div>
              <p className="text-sm text-destructive/80 mt-2">{error}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <AppIcon name="ArrowLeft" size={14} />
                <span>Redirecting back to campaign creation...</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => window?.location?.reload()}
                className="text-sm text-primary hover:text-primary/80 underline"
              >
                Try Again
              </button>
              <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <AppIcon name="ArrowLeft" size={12} />
                <span>Redirecting back in a few seconds...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;