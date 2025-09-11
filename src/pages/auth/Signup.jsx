import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Checkbox from '../../components/ui/Checkbox';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import Footer from '../../components/ui/Footer';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, signInWithOAuth } = useAuth();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm();

  const password = watch('password');

  const validatePassword = (value) => {
    if (value?.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/?.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/?.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/?.test(value)) return 'Password must contain at least one number';
    return true;
  };

  const onSubmit = async (data) => {
    setError('');
    setSuccessMessage('');

    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    try {
      const { data: result, error: signupError } = await signUp(
        data?.email,
        data?.password,
        {
          fullName: data?.fullName
        }
      );

      if (signupError) {
        if (signupError?.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (signupError?.includes('Cannot connect to authentication service')) {
          setError('Cannot connect to authentication service. Your Supabase project may be paused or inactive.');
        } else {
          setError(signupError);
        }
        return;
      }

      if (result?.user) {
        setSuccessMessage('Account created successfully! Please check your email to verify your account.');
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Account created! Please check your email to verify your account before signing in.',
              email: data?.email
            }
          });
        }, 2000);
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        setError('Cannot connect to authentication service. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleOAuthSignup = async (provider) => {
    setLoadingProvider(provider);
    setError('');

    try {
      const { error } = await signInWithOAuth(provider);

      if (error) {
        if (error?.includes('Cannot connect to authentication service') || 
            error?.includes('Failed to fetch')) {
          setError('Cannot connect to authentication service. Your Supabase project may be paused or inactive.');
        } else {
          setError(`Failed to sign up with ${provider}. Please try again.`);
        }
      }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        setError('Cannot connect to authentication service. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={20} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">BetaPilot</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-sm"
            >
              Already have an account? Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Marketing Content */}
            <div className="hidden lg:block">
              <div className="max-w-lg">
                <h1 className="text-4xl font-bold text-foreground mb-6">
                  Join BetaPilot Today
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Start managing your beta testing campaigns with powerful automation 
                  tools designed for product managers and developers.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-accent" />
                    </div>
                    <span className="text-foreground">Automated tester recruitment and management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-accent" />
                    </div>
                    <span className="text-foreground">Rich email templates with personalization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-accent" />
                    </div>
                    <span className="text-foreground">Workflow automation and tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <Icon name="Check" size={16} className="text-accent" />
                    </div>
                    <span className="text-foreground">Enterprise-grade security and compliance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full">
              <div className="w-full max-w-md mx-auto">
                <div className="bg-card rounded-lg shadow-elevated border border-border p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="UserPlus" size={32} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Create Your Account</h2>
                    <p className="text-muted-foreground">
                      Start your beta testing journey with BetaPilot
                    </p>
                  </div>

                  {/* Success Message */}
                  {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-green-800">{successMessage}</p>
                      </div>
                    </div>
                  )}

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

                  {/* OAuth Buttons */}
                  <div className="space-y-4 mb-6">
                    <Button
                      onClick={() => handleOAuthSignup('google')}
                      variant="outline"
                      size="lg"
                      className="w-full"
                      disabled={loadingProvider !== null}
                    >
                      {loadingProvider === 'google' ? (
                        <LoadingIndicator size="sm" className="mr-2" />
                      ) : (
                        <Icon name="Chrome" size={16} className="mr-2" />
                      )}
                      Sign up with Google
                    </Button>
                    
                    <Button
                      onClick={() => handleOAuthSignup('microsoft')}
                      variant="outline"
                      size="lg"
                      className="w-full"
                      disabled={loadingProvider !== null}
                    >
                      {loadingProvider === 'microsoft' ? (
                        <LoadingIndicator size="sm" className="mr-2" />
                      ) : (
                        <Icon name="Box" size={16} className="mr-2" />
                      )}
                      Sign up with Microsoft
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-card text-muted-foreground">or sign up with email</span>
                    </div>
                  </div>

                  {/* Signup Form */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Full Name Field */}
                    <div>
                      <Input
                        type="text"
                        placeholder="Full Name"
                        {...register('fullName', {
                          required: 'Full name is required',
                          minLength: {
                            value: 2,
                            message: 'Full name must be at least 2 characters'
                          }
                        })}
                        error={errors?.fullName?.message}
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <Input
                        type="email"
                        placeholder="Email Address"
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
                          validate: validatePassword
                        })}
                        error={errors?.password?.message}
                      />
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <Input
                        type="password"
                        placeholder="Confirm Password"
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: value => value === password || 'Passwords do not match'
                        })}
                        error={errors?.confirmPassword?.message}
                      />
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center space-x-2 mb-2">
                          <span>Password strength:</span>
                          <div className="flex-1 bg-muted rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full transition-all ${
                                validatePassword(password) === true 
                                  ? 'w-full bg-green-500' 
                                  : password?.length >= 6 
                                  ? 'w-2/3 bg-yellow-500' :'w-1/3 bg-red-500'
                              }`}
                            />
                          </div>
                        </div>
                        <ul className="space-y-1">
                          <li className={password?.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}>
                            ✓ At least 8 characters
                          </li>
                          <li className={/(?=.*[a-z])/?.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                            ✓ One lowercase letter
                          </li>
                          <li className={/(?=.*[A-Z])/?.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                            ✓ One uppercase letter  
                          </li>
                          <li className={/(?=.*\d)/?.test(password) ? 'text-green-600' : 'text-muted-foreground'}>
                            ✓ One number
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Terms Agreement */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={agreeToTerms}
                        onChange={setAgreeToTerms}
                        label=""
                        error=""
                      />
                      <label htmlFor="agreeToTerms" className="text-xs text-muted-foreground leading-relaxed">
                        I agree to the{' '}
                        <a href="/terms" target="_blank" className="text-primary hover:underline">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting || !agreeToTerms}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingIndicator size="sm" className="mr-2" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <Icon name="UserPlus" size={16} className="mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Login Link */}
                  <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Link
                        to="/login"
                        className="text-primary hover:underline font-medium"
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-muted/50 rounded-lg p-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <Icon name="Shield" size={20} className="text-accent mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Secure Account Creation</h4>
                      <p className="text-xs text-muted-foreground">
                        Your data is protected with enterprise-grade security. We use OAuth 2.0 
                        authentication and never store your credentials.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Signup;