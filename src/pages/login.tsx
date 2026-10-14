import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getFromStorage, setToStorage, STORAGE_KEYS } from '@/lib/utils';
import { APP_CONFIG, DEFAULTS } from '@/lib/constants';
import { useAuth } from '@/lib/auth';
import { isMistralConfigured, isGeminiConfigured, isSupabaseConfigured } from '@/lib/supabase';
import {
  Button, Card, Input, Alert, Skeleton
} from '@/components/ui';
import {
  User, Lock, Eye, EyeOff, Loader2, ArrowRight, Settings, AlertCircle, Shield, Key
} from 'lucide-react';

export interface LoginPageProps {}

const LoginPage: React.FC<LoginPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Get redirect path from location state
  const redirectTo = (location.state as any)?.redirectTo || '/home';
  const fromClientPortal = (location.state as any)?.from?.pathname?.startsWith('/client/');

  // Check if we should redirect to client portal
  useEffect(() => {
    // If we're coming from a client portal route, redirect back
    if (fromClientPortal && auth.isAuthenticated) {
      navigate(redirectTo);
    }
  }, [fromClientPortal, auth.isAuthenticated, redirectTo, navigate]);

  // Check configuration
  useEffect(() => {
    const checkConfig = () => {
      const configs = [];
      if (!isSupabaseConfigured()) configs.push('Supabase');
      if (!isMistralConfigured()) configs.push('Mistral API');
      if (!isGeminiConfigured()) configs.push('Gemini API');
      
      if (configs.length > 0) {
        setError(`Warning: ${configs.join(', ')} not configured. Some features may not work.`);
      }
    };
    checkConfig();
  }, []);

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await auth.login(email, password);
      setSuccess('Login successful! Redirecting...');
      
      // Small delay to show success message
      setTimeout(() => {
        navigate(redirectTo);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientPortal = () => {
    // Store that we're going to client portal
    setToStorage('redirectingToClientPortal', 'true');
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings/api');
  };

  // Demo credentials for quick access
  const demoCredentials = [
    { email: 'admin@visamotion.ai', password: 'admin123', role: 'Admin' },
    { email: 'manager@visamotion.ai', password: 'manager123', role: 'Manager' },
    { email: 'agent@visamotion.ai', password: 'agent123', role: 'Agent' },
    { email: 'client@visamotion.ai', password: 'client123', role: 'Client' },
  ];

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsLoading(true);
    setError(null);

    try {
      // In production, you would use the actual login
      // For demo purposes, we'll simulate a quick login
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess('Demo login successful! Redirecting...');
      setTimeout(() => {
        navigate(redirectTo);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-4 bg-primary rounded-xl mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {APP_CONFIG.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Please sign in to continue.
          </p>
        </motion.div>

        {/* Error and Success Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <Alert variant="destructive" onClose={clearError}>
                <AlertCircle className="h-4 w-4" />
                {error}
              </Alert>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <Alert variant="success" onClose={clearSuccess}>
                <Shield className="h-4 w-4" />
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Card */}
        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            {/* Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-right"
            >
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => navigate('/forgot-password')}
                className="text-sm"
              >
                Forgot password?
              </Button>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
              >
                Sign In
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </form>
        </Card>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="Card p-4 mb-6"
        >
          <h3 className="font-semibold text-sm mb-3">Demo Credentials</h3>
          <div className="grid grid-cols-2 gap-2">
            {demoCredentials.map((demo) => (
              <Button
                key={demo.email}
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(demo.email, demo.password)}
                className="justify-start h-auto p-2"
              >
                <div className="text-left">
                  <p className="font-medium text-xs">{demo.role}</p>
                  <p className="text-xs text-muted-foreground">{demo.email}</p>
                </div>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Alternative Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="Card p-4 text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Or access as a client
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClientPortal}
            className="w-full"
          >
            <User className="h-4 w-4 mr-2" />
            Client Portal Access
          </Button>
        </motion.div>

        {/* Configuration Warning */}
        {!isSupabaseConfigured() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="Card p-4 mt-4 border-yellow-200 bg-yellow-50"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-800">Configuration Required</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Some features require API configuration. 
                  <Button variant="link" size="sm" onClick={handleSettings} className="p-0 h-auto">
                    Configure now
                  </Button>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          <p>
            {APP_CONFIG.company} &copy; {new Date().getFullYear()}
          </p>
          <p className="mt-1">
            <Button variant="link" size="sm" onClick={() => navigate('/register')} className="p-0 h-auto">
              Create an account
            </Button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
