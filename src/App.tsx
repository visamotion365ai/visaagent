import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { isMobile, getFromStorage, setToStorage, STORAGE_KEYS } from '@/lib';
import { APP_CONFIG } from '@/lib/constants';
import { SplashScreen } from '@/pages/splash';
import { HomePage } from '@/pages/home';
import { AIChatPage } from '@/pages/ai-chat';
import { ApplicantsPage } from '@/pages/applicants';
import { EmployersPage } from '@/pages/employers';
import { CasesPage } from '@/pages/cases';
import { DocumentsPage } from '@/pages/documents';
import { ResearchPage } from '@/pages/research';
import { AnalysisPage } from '@/pages/analysis';
import { LeadsPage } from '@/pages/leads';
import { ApprovalsPage } from '@/pages/approvals';
import { AuditPage } from '@/pages/audit';
import { SettingsPage } from '@/pages/settings';
import { ClientPortalPage } from '@/pages/client-portal';
import { NotFoundPage } from '@/pages/not-found';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { ForgotPasswordPage } from '@/pages/forgot-password';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { AuthWrapper } from '@/components/layout/auth-wrapper';
import { AuthProviderComponent } from '@/lib/auth';

// App Context
interface AppContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  language: string;
  setLanguage: (language: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/splash',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

// Check if route is public
const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/')) ||
         pathname.match(/^\/client\/[^\/]+$/);
};

const App: React.FC = () => {
  const location = useLocation();
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    getFromStorage(STORAGE_KEYS.theme, 'system')
  );
  const [language, setLanguage] = useState<string>(
    getFromStorage(STORAGE_KEYS.language, APP_CONFIG.defaultLanguage)
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if user has seen splash screen
  useEffect(() => {
    const hasSeenSplash = getFromStorage<boolean>('hasSeenSplash', false);
    if (!hasSeenSplash) {
      setIsLoading(false);
    } else {
      setIsSplashDone(true);
      setIsLoading(false);
    }
  }, []);

  // Save theme to storage
  useEffect(() => {
    setToStorage(STORAGE_KEYS.theme, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save language to storage
  useEffect(() => {
    setToStorage(STORAGE_KEYS.language, language);
  }, [language]);

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobileView(isMobileView);
      if (isMobileView) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setIsSplashDone(true);
    setToStorage('hasSeenSplash', true);
  };

  // App context value
  const contextValue: AppContextType = {
    theme,
    setTheme,
    language,
    setLanguage,
    isSidebarOpen,
    setIsSidebarOpen,
    isLoading,
    setIsLoading,
  };

  // Page transition animations
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: 'spring',
    damping: 25,
    stiffness: 120,
    duration: 0.3,
  };

  // Skip splash screen
  const handleSkipSplash = () => {
    setIsSplashDone(true);
    setToStorage('hasSeenSplash', true);
  };

  if (!isSplashDone) {
    return (
      <SplashScreen
        onComplete={handleSplashComplete}
        onSkip={handleSkipSplash}
      />
    );
  }

  // Check if we should show the client portal
  const isClientPortal = location.pathname.startsWith('/client/');

  // Determine if we need auth wrapper
  const needsAuth = !isPublicRoute(location.pathname);

  return (
    <AuthProviderComponent>
      <AppContext.Provider value={contextValue}>
        <ToastProvider>
          <AuthWrapper>
            <div
              className={cn(
                'min-h-screen bg-secondary-50 font-sans',
                isMobileView && 'overflow-x-hidden'
              )}
            >
              {/* Main Layout */}
              <div className="flex min-h-screen">
                {/* Sidebar - Hidden on mobile, can be toggled */}
                {!isClientPortal && !isPublicRoute(location.pathname) && (
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={pageTransition}
                        className={cn(
                          'fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-lg md:relative md:translate-x-0 md:z-auto',
                          isMobileView && 'fixed inset-0 z-50'
                        )}
                      >
                        <Sidebar
                          isOpen={isSidebarOpen}
                          onClose={() => setIsSidebarOpen(false)}
                        />
                      </motion.aside>
                    )}
                  </AnimatePresence>
                )}

                {/* Main Content */}
                <div
                  className={cn(
                    'flex-1 flex flex-col min-h-screen',
                    isSidebarOpen && isMobileView && 'overflow-hidden'
                  )}
                >
                  {/* Header - Only show on non-public, non-client routes */}
                  {!isClientPortal && !isPublicRoute(location.pathname) && (
                    <Header
                      onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      isSidebarOpen={isSidebarOpen}
                    />
                  )}

                  {/* Page Content */}
                  <main className="flex-1">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={pageVariants}
                        transition={pageTransition}
                        className="h-full"
                      >
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/" element={<HomePage />} />
                          <Route path="/splash" element={<SplashScreen onComplete={handleSplashComplete} onSkip={handleSkipSplash} />} />
                          
                          {/* Auth Routes */}
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />
                          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                          <Route path="/reset-password" element={<ForgotPasswordPage />} />
                          
                          {/* Main Routes */}
                          <Route path="/home" element={<Navigate to="/" replace />} />
                          
                          {/* AI Features */}
                          <Route path="/ai-chat" element={<AIChatPage />} />
                          <Route path="/ai-chat/:sessionId" element={<AIChatPage />} />
                          
                          {/* Visa Management */}
                          <Route path="/applicants" element={<ApplicantsPage />} />
                          <Route path="/applicants/new" element={<ApplicantsPage mode="new" />} />
                          <Route path="/applicants/:id" element={<ApplicantsPage mode="edit" />} />
                          
                          <Route path="/employers" element={<EmployersPage />} />
                          <Route path="/employers/new" element={<EmployersPage mode="new" />} />
                          <Route path="/employers/:id" element={<EmployersPage mode="edit" />} />
                          
                          <Route path="/cases" element={<CasesPage />} />
                          <Route path="/cases/new" element={<CasesPage mode="new" />} />
                          <Route path="/cases/:id" element={<CasesPage mode="edit" />} />
                          
                          <Route path="/documents" element={<DocumentsPage />} />
                          <Route path="/documents/upload" element={<DocumentsPage mode="upload" />} />
                          <Route path="/documents/:id" element={<DocumentsPage mode="view" />} />
                          
                          {/* Research & Analysis */}
                          <Route path="/research" element={<ResearchPage />} />
                          <Route path="/research/new" element={<ResearchPage mode="new" />} />
                          <Route path="/research/:id" element={<ResearchPage mode="view" />} />
                          
                          <Route path="/analysis" element={<AnalysisPage />} />
                          <Route path="/analysis/rejection" element={<AnalysisPage mode="rejection" />} />
                          <Route path="/analysis/website" element={<AnalysisPage mode="website" />} />
                          <Route path="/analysis/document" element={<AnalysisPage mode="document" />} />
                          
                          {/* Business Management */}
                          <Route path="/leads" element={<LeadsPage />} />
                          <Route path="/leads/new" element={<LeadsPage mode="new" />} />
                          <Route path="/leads/:id" element={<LeadsPage mode="edit" />} />
                          
                          <Route path="/approvals" element={<ApprovalsPage />} />
                          <Route path="/approvals/:id" element={<ApprovalsPage mode="view" />} />
                          
                          <Route path="/audit" element={<AuditPage />} />
                          
                          {/* Settings */}
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/settings/api" element={<SettingsPage activeTab="api" />} />
                          <Route path="/settings/general" element={<SettingsPage activeTab="general" />} />
                          <Route path="/settings/appearance" element={<SettingsPage activeTab="appearance" />} />
                          
                          {/* Client Portal */}
                          <Route path="/client/:referenceNumber" element={<ClientPortalPage />} />
                          <Route path="/client/:referenceNumber/:mode" element={<ClientPortalPage />} />
                          
                          {/* 404 */}
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </motion.div>
                    </AnimatePresence>
                  </main>

                  {/* Footer */}
                  {!isClientPortal && !isPublicRoute(location.pathname) && <Footer />}
                </div>
              </div>

              {/* Overlay for mobile sidebar */}
              {isSidebarOpen && isMobileView && (
                <div
                  className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
            </div>
          </AuthWrapper>
        </ToastProvider>
      </AppContext.Provider>
    </AuthProviderComponent>
  );
};

// Hook to use app context
export const useApp = (): AppContextType => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppContext.Provider');
  }
  return context;
};

export default App;
