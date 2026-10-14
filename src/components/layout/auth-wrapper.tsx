import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { getFromStorage, STORAGE_KEYS } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';
import {
  Button, Card, Alert, Skeleton
} from '@/components/ui';
import {
  Shield, Loader2, User, LogIn, Home
} from 'lucide-react';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/splash',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/client/:referenceNumber',
];

// Routes that require authentication
const AUTH_REQUIRED_ROUTES = [
  '/home',
  '/applicants',
  '/employers',
  '/cases',
  '/documents',
  '/research',
  '/analysis',
  '/leads',
  '/approvals',
  '/audit',
  '/settings',
  '/ai-chat',
];

// Client-only routes
const CLIENT_ROUTES = [
  '/client/:referenceNumber',
];

export interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // Check if current route is public
  const isPublicRoute = (pathname: string): boolean => {
    return PUBLIC_ROUTES.some(route => {
      if (route.includes(':referenceNumber')) {
        return pathname.match(/^\/client\/[^\/]+$/);
      }
      return pathname === route || pathname.startsWith(route + '/');
    });
  };

  // Check if current route requires authentication
  const requiresAuth = (pathname: string): boolean => {
    if (isPublicRoute(pathname)) return false;
    return AUTH_REQUIRED_ROUTES.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
  };

  // Check if current route is client portal
  const isClientPortalRoute = (pathname: string): boolean => {
    return pathname.match(/^\/client\/[^\/]+$/);
  };

  // Initialize auth check
  useEffect(() => {
    const checkAuth = async () => {
      // If we've already checked the session, don't check again
      if (hasCheckedSession) {
        setIsCheckingAuth(false);
        return;
      }

      const pathname = location.pathname;
      
      // Public routes - allow access
      if (isPublicRoute(pathname)) {
        setIsCheckingAuth(false);
        setHasCheckedSession(true);
        return;
      }

      // Check if we have a valid session
      const session = getFromStorage<string>(STORAGE_KEYS.token);
      
      if (!session) {
        // No session - redirect to login or client portal
        if (isClientPortalRoute(pathname)) {
          // Client portal - allow access (will be validated in ClientPortalPage)
          setIsCheckingAuth(false);
          setHasCheckedSession(true);
        } else {
          // Redirect to login
          navigate('/login', { 
            state: { from: location, redirectTo: pathname } 
          });
        }
        return;
      }

      // We have a session - check if it's valid
      try {
        const sessionObj = JSON.parse(session);
        if (sessionObj.expiresAt && sessionObj.expiresAt > Date.now()) {
          // Valid session - continue
          setHasCheckedSession(true);
        } else {
          // Expired session - logout and redirect
          await auth.logout();
          navigate('/login', { 
            state: { from: location, redirectTo: pathname, expired: true } 
          });
        }
      } catch {
        // Invalid session - logout and redirect
        await auth.logout();
        navigate('/login', { 
          state: { from: location, redirectTo: pathname } 
        });
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [location.pathname, navigate, auth, hasCheckedSession]);

  // Handle route changes
  useEffect(() => {
    const pathname = location.pathname;
    
    // If we're on a client portal route and have a reference number, we're good
    if (isClientPortalRoute(pathname)) {
      return;
    }

    // If we're on a protected route and not authenticated, redirect
    if (requiresAuth(pathname) && !auth.isAuthenticated && hasCheckedSession) {
      navigate('/login', { 
        state: { from: location, redirectTo: pathname } 
      });
    }
  }, [location.pathname, auth.isAuthenticated, hasCheckedSession, navigate]);

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <Card className="p-8 max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-bold">Checking Authentication</h2>
            <p className="text-muted-foreground text-sm">
              Please wait while we verify your session...
            </p>
            <div className="mt-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </motion.div>
        </Card>
      </div>
    );
  }

  // Render children
  return <>{children}</>;
};

export default AuthWrapper;
