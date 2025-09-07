import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import AppIcon from '../AppIcon';
import { googleOAuthService } from '../../services/googleOAuthService';

const GoogleOAuthButton = ({ 
  onConnectionChange,
  showDisconnect = true,
  size = 'default',
  variant = 'outline',
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState(null);

  // Check connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Check current Google connection status
  const checkConnectionStatus = async () => {
    try {
      setCheckingStatus(true);
      const result = await googleOAuthService?.getConnectionStatus();
      
      if (result?.success) {
        setIsConnected(result?.isConnected);
        setUserEmail(result?.email || '');
        onConnectionChange?.(result?.isConnected, result?.email);
      }
    } catch (error) {
      setError('Failed to check connection status');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Handle Google OAuth connect
  const handleConnect = () => {
    try {
      setLoading(true);
      setError(null);

      // Generate and redirect to Google OAuth URL
      const authUrl = googleOAuthService?.generateAuthUrl();
      
      // Store callback info for handling return
      sessionStorage?.setItem('oauth_pending', 'google');
      sessionStorage?.setItem('oauth_return_url', window?.location?.href);
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      setError('Failed to initiate Google OAuth');
      setLoading(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await googleOAuthService?.disconnect();
      
      if (result?.success) {
        setIsConnected(false);
        setUserEmail('');
        onConnectionChange?.(false, '');
      } else {
        setError(result?.error || 'Failed to disconnect Google account');
      }
    } catch (error) {
      setError('Failed to disconnect Google account');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <Button 
        variant={variant}
        size={size}
        disabled
        className={className}
      >
        <AppIcon name="Loader2" size={16} className="animate-spin mr-2" />
        Checking status...
      </Button>
    );
  }

  if (isConnected) {
    return (
      <div className="space-y-2">
        {/* Connected state */}
        <div className="flex items-center space-x-3 p-3 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <AppIcon name="Mail" size={16} className="text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-success">Google Account Connected</p>
            <p className="text-xs text-success/80 truncate">{userEmail}</p>
          </div>
        </div>

        {/* Disconnect button */}
        {showDisconnect && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            {loading ? (
              <>
                <AppIcon name="Loader2" size={14} className="animate-spin mr-2" />
                Disconnecting...
              </>
            ) : (
              <>
                <AppIcon name="Unlink" size={14} className="mr-2" />
                Disconnect Google Account
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Connect button */}
      <Button
        variant={variant}
        size={size}
        onClick={handleConnect}
        disabled={loading}
        className={`${className} border-primary/20 bg-primary/5 hover:bg-primary/10`}
      >
        {loading ? (
          <>
            <AppIcon name="Loader2" size={16} className="animate-spin mr-2" />
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Connect Google Account
          </>
        )}
      </Button>

      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
          <AppIcon name="AlertCircle" size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Connect your Google account to send campaign invitations directly from your Gmail.
        Requires gmail.send and userinfo.email permissions.
      </p>
    </div>
  );
};

export default GoogleOAuthButton;