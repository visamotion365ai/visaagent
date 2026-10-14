import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';
import { useApp } from '@/App';
import { Badge } from '@/components/ui';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Building2, 
  FileText, 
  Folder, 
  Search, 
  BarChart3, 
  Bell, 
  Settings, 
  HelpCircle,
  ChevronRight,
  Plane,
  CreditCard,
  ClipboardList,
  History,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  to: string;
  badge?: string | number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    to: '/',
  },
  {
    id: 'ai-chat',
    label: 'AI Chat',
    icon: <MessageSquare className="h-5 w-5" />,
    to: '/ai-chat',
    badge: 'New',
  },
  {
    id: 'applicants',
    label: 'Applicants',
    icon: <Users className="h-5 w-5" />,
    to: '/applicants',
  },
  {
    id: 'employers',
    label: 'Employers',
    icon: <Building2 className="h-5 w-5" />,
    to: '/employers',
  },
  {
    id: 'cases',
    label: 'Visa Cases',
    icon: <FileText className="h-5 w-5" />,
    to: '/cases',
    badge: 8,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: <Folder className="h-5 w-5" />,
    to: '/documents',
  },
  {
    id: 'research',
    label: 'Research',
    icon: <Search className="h-5 w-5" />,
    to: '/research',
  },
  {
    id: 'analysis',
    label: 'Analysis',
    icon: <BarChart3 className="h-5 w-5" />,
    to: '/analysis',
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: <ClipboardList className="h-5 w-5" />,
    to: '/leads',
    badge: 15,
  },
  {
    id: 'approvals',
    label: 'Approvals',
    icon: <CheckSquare className="h-5 w-5" />,
    to: '/approvals',
  },
  {
    id: 'audit',
    label: 'Audit Log',
    icon: <History className="h-5 w-5" />,
    to: '/audit',
  },
];

const bottomNavItems: NavItem[] = [
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="h-5 w-5" />,
    to: '/notifications',
    badge: 3,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    to: '/settings',
  },
  {
    id: 'help',
    label: 'Help Center',
    icon: <HelpCircle className="h-5 w-5" />,
    to: '/help',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onClose,
}) => {
  const location = useLocation();
  const { isSidebarOpen } = useApp();

  // Check if path is active
  const isActive = (to: string) => {
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  // Check if child is active
  const hasActiveChild = (children: NavItem[] | undefined) => {
    if (!children) return false;
    return children.some(child => isActive(child.to));
  };

  // Nav item component
  const NavItemComponent: React.FC<{ item: NavItem; level?: number }> = ({
    item,
    level = 0,
  }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.to) || hasActiveChild(item.children);

    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className={cn(
          'rounded-lg',
          isItemActive && 'bg-primary-50'
        )}
      >
        <Link
          to={item.to}
          className={cn(
            'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
            isItemActive
              ? 'text-primary-700 bg-primary-50'
              : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
          )}
        >
          <span
            className={cn(
              'flex-shrink-0',
              isItemActive && 'text-primary-600'
            )}
          >
            {item.icon}
          </span>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <Badge
              variant={typeof item.badge === 'number' ? 'primary' : 'default'}
              size="sm"
            >
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                isItemActive && 'rotate-90'
              )}
            />
          )}
        </Link>

        {hasChildren && isItemActive && (
          <div className="pl-6">
            {item.children?.map((child) => (
              <NavItemComponent key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // Sidebar variants
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 120,
      },
    },
    closed: {
      x: -300,
      opacity: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 120,
      },
    },
  };

  return (
    <motion.aside
      className={cn(
        'fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-secondary-200 flex flex-col',
        'safe-area-left'
      )}
      variants={sidebarVariants}
      animate={isOpen ? 'open' : 'closed'}
    >
      {/* Logo */}
      <div className="p-4 border-b border-secondary-200">
        <Link to="/" className="flex items-center gap-3">
          <div className="p-3 bg-primary-600 rounded-xl">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <div>
            <span className="font-semibold text-secondary-900">{APP_CONFIG.name}</span>
            <p className="text-xs text-secondary-500 truncate">{APP_CONFIG.description}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavItemComponent key={item.id} item={item} />
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-secondary-200 space-y-1">
        {bottomNavItems.map((item) => (
          <NavItemComponent key={item.id} item={item} />
        ))}
      </div>

      {/* Close button for mobile */}
      {onClose && (
        <div className="p-4 border-t border-secondary-200 md:hidden">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900"
          >
            Close
          </motion.button>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
