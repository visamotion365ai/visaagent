import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';
import { Button, Card } from '@/components/ui';
import { 
  AlertTriangle, 
  Home, 
  Search, 
  ArrowLeft,
  Rocket
} from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card variant="elevated" padding="lg" className="text-center">
          {/* Icon */}
          <motion.div
            className="flex items-center justify-center mb-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="relative">
              <AlertTriangle className="h-20 w-20 text-red-500" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-red-600">
                404
              </span>
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-secondary-500 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.history.back()}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              variant="outline"
            >
              Go Back
            </Button>
            <Button
              asChild
              leftIcon={<Home className="h-4 w-4" />}
            >
              <Link to="/">
                Go to Home
              </Link>
            </Button>
          </div>

          {/* Suggestions */}
          <div className="mt-8 pt-6 border-t border-secondary-200">
            <p className="text-sm text-secondary-500 mb-4">
              Maybe you're looking for:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">Home</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/ai-chat">AI Chat</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/cases">Cases</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/applicants">Applicants</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/settings">Settings</Link>
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <motion.div
            className="absolute top-0 left-0 w-32 h-32 bg-primary-100 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: -1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-40 h-40 bg-primary-100 rounded-full translate-x-1/2 translate-y-1/2"
            style={{ zIndex: -1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
