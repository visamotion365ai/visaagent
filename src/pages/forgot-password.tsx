import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '@/lib/constants';
import { useAuth } from '@/lib/auth';
import {
  Button, Card, Input, Alert
} from '@/components/ui';
import {
  Mail, ArrowRight, Shield, Key, AlertCircle, CheckCircle
} from 'lucide-react';

export interface ForgotPasswordPageProps {}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      // In production, this would send a password reset email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`Password reset link sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
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
            <Key className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Forgot Password?
          </h1>
          <p className="text-muted-foreground mt-2">
            Enter your email to reset your password
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
                <CheckCircle className="h-4 w-4" />
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forgot Password Card */}
        <Card className="p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
              >
                Send Reset Link
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </form>
        </Card>

        {/* Additional Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="Card p-4 text-center mb-6"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Remember your password?
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="Card p-4"
        >
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Password Requirements</p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• At least 6 characters long</li>
                <li>• Contains letters and numbers</li>
                <li>• Special characters are allowed</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          <p>
            {APP_CONFIG.company} &copy; {new Date().getFullYear()}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
