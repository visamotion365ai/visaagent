import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, getFromStorage, STORAGE_KEYS } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';
import { useApp } from '@/App';
import { 
  Button, 
  Badge,
  DropdownMenu,
  DropdownMenuItem as DropdownMenuItemType,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui';
import { 
  Menu, 
  Bell, 
  Search,
  Sun, 
  Moon,
  Monitor,
  Globe,
  Settings,
  User,
  LogOut,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  isSidebarOpen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme, language, setLanguage, isSidebarOpen: isOpen } = useApp();
  const [notifications, setNotifications] = useState<{ id: string; title: string; time: string; read: boolean }[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/': 'Home',
      '/home': 'Home',
      '/ai-chat': 'AI Chat',
      '/applicants': 'Applicants',
      '/employers': 'Employers',
      '/cases': 'Visa Cases',
      '/documents': 'Documents',
      '/research': 'Research',
      '/analysis': 'Analysis',
      '/leads': 'Leads',
      '/approvals': 'Approvals',
      '/audit': 'Audit Log',
      '/settings': 'Settings',
    };
    return titles[path] || path.split('/').pop() || 'Dashboard';
  };

  // Load notifications
  useEffect(() => {
    // In a real app, this would come from Supabase
    const sampleNotifications = [
      { id: '1', title: 'New visa case submitted', time: '2 hours ago', read: false },
      { id: '2', title: 'Document verification complete', time: '5 hours ago', read: false },
      { id: '3', title: 'System update available', time: '1 day ago', read: true },
    ];
    setNotifications(sampleNotifications);
  }, []);

  // Theme toggle
  const handleThemeToggle = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setShowThemeMenu(false);
  };

  // Language toggle
  const handleLanguageToggle = (newLanguage: string) => {
    setLanguage(newLanguage);
    setShowLanguageMenu(false);
  };

  // Mark notification as read
  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Clear notifications
  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Profile menu items
  const profileMenuItems: DropdownMenuItemType[] = [
    { id: 'profile', label: 'My Profile', icon: <User className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    { id: 'help', label: 'Help Center', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'logout', label: 'Log Out', icon: <LogOut className="h-4 w-4" /> },
  ];

  // Language menu items
  const languageMenuItems: DropdownMenuItemType[] = [
    { id: 'bn', label: 'Bengali (বাংলা)', icon: <Globe className="h-4 w-4" /> },
    { id: 'en', label: 'English', icon: <Globe className="h-4 w-4" /> },
    { id: 'ar', label: 'Arabic (العربية)', icon: <Globe className="h-4 w-4" /> },
    { id: 'hi', label: 'Hindi (हिन्दी)', icon: <Globe className="h-4 w-4" /> },
    { id: 'ur', label: 'Urdu (اردو)', icon: <Globe className="h-4 w-4" /> },
  ];

  // Theme menu items
  const themeMenuItems: DropdownMenuItemType[] = [
    { id: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { id: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { id: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  // Notification menu items
  const notificationMenuItems: DropdownMenuItemType[] = [
    { id: 'mark-all-read', label: 'Mark all as read', icon: null },
    { id: 'clear', label: 'Clear all', icon: null },
  ];

  // Handle profile menu action
  const handleProfileMenuAction = (action: string) => {
    switch (action) {
      case 'profile':
        navigate('/settings');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'help':
        // Open help
        break;
      case 'logout':
        // Handle logout
        break;
    }
    setShowProfileMenu(false);
  };

  // Handle notification menu action
  const handleNotificationMenuAction = (action: string) => {
    switch (action) {
      case 'mark-all-read':
        handleMarkAllAsRead();
        break;
      case 'clear':
        handleClearNotifications();
        break;
    }
    setShowNotification(false);
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get current theme icon
  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // Get current language label
  const getLanguageLabel = () => {
    const lang = languageMenuItems.find(l => l.id === language);
    return lang ? lang.label : 'Bengali';
  };

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-secondary-200',
        'safe-area-top'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="p-2 rounded-lg hover:bg-secondary-100 md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5 text-secondary-600" />
            </motion.button>

            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <span className="text-white font-bold text-lg">{APP_CONFIG.name.split(' ')[0][0]}</span>
              </div>
              <span className="font-semibold text-secondary-900 hidden sm:block">
                {APP_CONFIG.name}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-secondary-500">/</span>
              <span className="font-medium text-secondary-700">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search - Hidden on mobile */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
            </div>

            {/* Language Selector */}
            <DropdownMenu
              items={languageMenuItems}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  rightIcon={<ChevronDown className="h-3 w-3" />}
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{getLanguageLabel()}</span>
                </Button>
              }
              onChange={(action) => handleLanguageToggle(action)}
            />

            {/* Theme Toggle */}
            <DropdownMenu
              items={themeMenuItems}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  {getThemeIcon()}
                </Button>
              }
              onChange={(action) => handleThemeToggle(action as 'light' | 'dark' | 'system')}
            />

            {/* Notifications */}
            <DropdownMenu
              items={notificationMenuItems}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2"
                  onClick={() => setShowNotification(!showNotification)}
                >
                  <Bell className="h-4 w-4 text-secondary-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              }
              onChange={(action) => handleNotificationMenuAction(action)}
            >
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-3 py-2 text-sm text-secondary-500">
                  No new notifications
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'px-3 py-2 cursor-pointer hover:bg-secondary-50',
                        !notification.read && 'bg-primary-50'
                      )}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-secondary-500">{notification.time}</p>
                    </div>
                  ))}
                </div>
              )}
              <DropdownMenuSeparator />
            </DropdownMenu>

            {/* Profile Menu */}
            <DropdownMenu
              items={profileMenuItems}
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1"
                >
                  <User className="h-5 w-5 text-secondary-600" />
                </Button>
              }
              onChange={(action) => handleProfileMenuAction(action)}
              align="end"
            >
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </DropdownMenu>

            {/* Settings Button - Mobile only */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 md:hidden"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4 text-secondary-600" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
