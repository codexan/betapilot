import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import SSOButton from './SSOButton';
import TrustIndicators from './TrustIndicators';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Checkbox from '../../../components/ui/Checkbox';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';

const AuthCard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithOAuth, signInWithDemo, signIn } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [authMode, setAuthMode] = useState('oauth'); // 'oauth' or 'credentials'
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm();

  const handleSSOLogin = async (provider) => {
    setLoadingProvider(provider);
    setError('');

    try {
      const { error } = await signInWithOAuth(provider);
      
      if (error) {
        if (error?.includes('Cannot connect to authentication service') || 
            error?.includes('Failed to fetch') ||
            error?.includes('AuthRetryableFetchError')) {
          setError('Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.');
        } else {
          setError(`Failed to authenticate with ${provider}. Please try again.`);
        }
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        setError('Cannot connect to authentication service. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    try {
      const { error } = await signInWithDemo();
      if (error) {
        setError(error);
      } else {
        // Redirect to intended destination or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (error) {
      setError('Demo login failed. Please try again.');
    }
  };

  const onCredentialsSubmit = async (data) => {
    setError('');
    try {
      console.log('Attempting email signin with:', { email: data?.email, hasPassword: !!data?.password });
      const { error } = await signIn(data?.email, data?.password, { rememberMe });
      
      if (error) {
        console.error('Signin error:', error);
        if (error?.includes('Invalid login credentials') || error?.includes('Invalid email or password')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error?.includes('Cannot connect to authentication service') || 
                   error?.includes('Failed to fetch')) {
          setError('Cannot connect to authentication service. Your Supabase project may be paused or inactive.');
        } else if (error?.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else {
          setError(`Login failed: ${error}`);
        }
      } else {
        console.log('Signin successful, redirecting...');
        // Redirect to intended destination or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Signin catch error:', error);
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        setError('Cannot connect to authentication service. Please check your connection.');
      } else {
        setError(`An unexpected error occurred during login: ${error?.message || error}`);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card rounded-lg shadow-elevated border border-border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="UserCheck" size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome!</h2>
          <p className="text-muted-foreground">
            Sign in to your PilotBeta account to manage your beta testing campaigns
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-error leading-relaxed">{error}</p>
                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => navigator?.clipboard?.writeText(error)}
                    className="text-xs text-error/80 hover:text-error underline"
                  >
                    Copy Error
                  </button>
                  <button
                    onClick={() => setError('')}
                    className="text-xs text-error/80 hover:text-error underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auth Mode Toggle */}
        <div className="flex rounded-lg bg-muted p-1 mb-6">
          <button
            onClick={() => setAuthMode('oauth')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              authMode === 'oauth' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            SSO Login
          </button>
          <button
            onClick={() => setAuthMode('credentials')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              authMode === 'credentials' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            Email Login
          </button>
        </div>

        {authMode === 'oauth' ? (
          // SSO Login Mode
          <>
            {/* SSO Buttons */}
            <div className="space-y-4 mb-6">
              <SSOButton
                provider="google"
                onClick={() => handleSSOLogin('google')}
                loading={loadingProvider === 'google'}
                disabled={loadingProvider !== null}
              />
              <SSOButton
                provider="microsoft"
                onClick={() => handleSSOLogin('microsoft')}
                loading={loadingProvider === 'microsoft'}
                disabled={loadingProvider !== null}
              />
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            {/* Demo Login */}
            <Button 
              onClick={handleDemoLogin}
              variant="outline"
              size="lg"
              className="w-full"
              disabled={loadingProvider !== null}
            >
              <Icon name="Play" size={16} className="mr-2" />
              Demo Login (Click for access!)
            </Button>
          </>
        ) : (
          // Credentials Login Mode
          <form onSubmit={handleSubmit(onCredentialsSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <Input
                type="email"
                placeholder="Email address"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                error={errors?.email?.message}
              />
            </div>

            {/* Password Field */}
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                error={errors?.password?.message}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onChange={setRememberMe}
                label="Remember me"
                error=""
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingIndicator size="sm" className="mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <Icon name="LogIn" size={16} className="mr-2" />
                  Sign In
                </>
              )}
            </Button>

            {/* Demo Credentials Helper */}
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Demo Credentials</h4>
                  <div className="bg-blue-100 rounded px-3 py-2 text-xs font-mono">
                  </div>
                </div>
              </div>
            </div> */}
          </form>
        )}

        {/* Security Notice */}
        <div className="bg-muted/50 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <Icon name="Shield" size={20} className="text-accent mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Secure Access</h4>
              <p className="text-xs text-muted-foreground">
                Your data is protected with enterprise-grade security. We use OAuth 2.0 
                authentication and never store your credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Sign Up Call to Action - New prominent placement */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Don't have an account yet?
          </p>
          <Link to="/signup">
            <Button 
              variant="outline"
              size="lg"
              className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
            >
              <Icon name="UserPlus" size={16} className="mr-2" />
              Create New Account
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <TrustIndicators />
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-xs text-muted-foreground mb-2">
          By signing in, you agree to our Terms of Service and {' '}
          <Link 
            to="/privacy-policy" 
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Privacy Policy
          </Link>
        </p>
        {/* Updated signup link to direct signup page */}
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link 
            to="/signup" 
            className="text-primary hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthCard;