import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, formatDate, getFromStorage, STORAGE_KEYS } from '@/lib/utils';
import { APP_CONFIG, COUNTRIES, VISA_TYPES, DEFAULTS } from '@/lib/constants';
import { useApp } from '@/App';
import { 
  Button, 
  Card, 
  Badge,
  Alert,
  Progress,
  Skeleton,
  SkeletonText 
} from '@/components/ui';
import { 
  Plane, 
  Users, 
  Building2, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  TrendingUp,
  MessageSquare,
  Search,
  Settings,
  BarChart3,
  UserPlus,
  Briefcase,
  Globe
} from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { isAIConfigured } from '@/lib/ai';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  trend?: number;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'text-primary-600',
  trend,
  loading = false,
}) => (
  <Card
    variant="bordered"
    padding="md"
    className="flex-1 min-w-[150px]"
  >
    <div className="flex items-center gap-4">
      <div className={cn('p-3 rounded-xl', color === 'text-primary-600' ? 'bg-primary-50' : 'bg-secondary-50')}>
        {loading ? <Skeleton className="h-6 w-6 rounded" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        {loading ? (
          <>
            <SkeletonText lines={1} className="w-16 mb-1" />
            <SkeletonText lines={1} className="w-24" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-secondary-900 truncate">{value}</p>
            <p className="text-sm text-secondary-500 truncate">{title}</p>
          </>
        )}
      </div>
      {trend !== undefined && !loading && (
        <div className={cn(
          'flex items-center gap-1 text-sm font-medium',
          trend >= 0 ? 'text-green-600' : 'text-red-600'
        )}>
          {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingUp className="h-4 w-4 transform -scale-y-100" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  </Card>
);

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  to: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  color = 'bg-primary-100',
  to,
}) => (
  <Link to={to} className="block">
    <Card
      variant="bordered"
      padding="md"
      hoverable
      className="transition-transform hover:scale-[1.02]"
    >
      <div className="flex items-start gap-4">
        <div className={cn('p-3 rounded-xl', color)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-secondary-900 truncate">{title}</h3>
          <p className="text-sm text-secondary-500 truncate mt-1">{description}</p>
        </div>
      </div>
    </Card>
  </Link>
);

interface RecentActivityProps {
  type: 'case' | 'applicant' | 'document' | 'approval';
  title: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  type,
  title,
  time,
  status,
}) => {
  const icons = {
    case: <FileText className="h-4 w-4" />,
    applicant: <Users className="h-4 w-4" />,
    document: <Briefcase className="h-4 w-4" />,
    approval: <CheckCircle className="h-4 w-4" />,
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors">
      <div className="p-2 rounded-lg bg-secondary-100">
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-secondary-900 truncate">{title}</p>
        <p className="text-xs text-secondary-500">{time}</p>
      </div>
      <Badge variant={status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'}>
        {status}
      </Badge>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useApp();
  const [stats, setStats] = useState({
    totalApplicants: 0,
    totalCases: 0,
    pendingCases: 0,
    completedCases: 0,
    totalRevenue: 0,
    activeLeads: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivityProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState<'configured' | 'not-configured' | 'loading'>('loading');
  const [supabaseStatus, setSupabaseStatus] = useState<'configured' | 'not-configured' | 'loading'>('loading');
  const [showSetupAlert, setShowSetupAlert] = useState(false);

  // Check AI and Supabase configuration
  useEffect(() => {
    const checkConfigurations = async () => {
      setAiStatus('loading');
      setSupabaseStatus('loading');

      const aiConfigured = isAIConfigured();
      const supabaseConfigured = isSupabaseConfigured();

      setAiStatus(aiConfigured ? 'configured' : 'not-configured');
      setSupabaseStatus(supabaseConfigured ? 'configured' : 'not-configured');

      if (!aiConfigured || !supabaseConfigured) {
        setShowSetupAlert(true);
      }
    };

    checkConfigurations();
  }, []);

  // Load sample data (in a real app, this would come from Supabase)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Sample data
        setStats({
          totalApplicants: 42,
          totalCases: 28,
          pendingCases: 8,
          completedCases: 20,
          totalRevenue: 1250000,
          activeLeads: 15,
        });

        setRecentActivities([
          { type: 'case', title: 'New visa case submitted', time: '2 hours ago', status: 'pending' },
          { type: 'applicant', title: 'New applicant registered', time: '5 hours ago', status: 'completed' },
          { type: 'document', title: 'Documents uploaded', time: '1 day ago', status: 'approved' },
          { type: 'approval', title: 'Case approved', time: '2 days ago', status: 'approved' },
          { type: 'case', title: 'Rejection analysis', time: '3 days ago', status: 'rejected' },
        ]);

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Navigation handlers
  const handleStartNewCase = () => {
    navigate('/cases/new');
  };

  const handleStartChat = () => {
    navigate('/ai-chat');
  };

  const handleSetup = () => {
    navigate('/settings/api');
    setShowSetupAlert(false);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-secondary-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-900">
              Welcome to {APP_CONFIG.name}
            </h1>
            <p className="text-secondary-500 mt-1">
              {APP_CONFIG.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleStartChat}
              leftIcon={<MessageSquare className="h-4 w-4" />}
            >
              Chat with AI
            </Button>
            <Button
              onClick={handleStartNewCase}
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              New Case
            </Button>
          </div>
        </div>

        {/* Setup Alert */}
        {showSetupAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert
              variant={aiStatus === 'not-configured' || supabaseStatus === 'not-configured' ? 'warning' : 'info'}
              onClose={() => setShowSetupAlert(false)}
            >
              <div className="flex items-start gap-3">
                <div>
                  <p className="font-medium">
                    {aiStatus === 'not-configured' && supabaseStatus === 'not-configured'
                      ? 'AI and Database not configured'
                      : aiStatus === 'not-configured'
                        ? 'AI not configured'
                        : 'Database not configured'}
                  </p>
                  <p className="text-sm mt-1">
                    {aiStatus === 'not-configured' && supabaseStatus === 'not-configured'
                      ? 'Please configure your Mistral/Gemini API keys and Supabase connection to unlock all features.'
                      : aiStatus === 'not-configured'
                        ? 'Please configure your Mistral/Gemini API keys to unlock AI features.'
                        : 'Please configure your Supabase connection to unlock database features.'}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleSetup}
                >
                  Configure Now
                </Button>
              </div>
            </Alert>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Applicants"
            value={isLoading ? '-' : stats.totalApplicants}
            icon={<Users className="h-6 w-6 text-primary-600" />}
            loading={isLoading}
            trend={12}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Active Cases"
            value={isLoading ? '-' : stats.totalCases}
            icon={<FileText className="h-6 w-6 text-blue-600" />}
            color="text-blue-600"
            loading={isLoading}
            trend={8}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Pending Approvals"
            value={isLoading ? '-' : stats.pendingCases}
            icon={<Clock className="h-6 w-6 text-yellow-600" />}
            color="text-yellow-600"
            loading={isLoading}
            trend={-5}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Total Revenue"
            value={isLoading ? '-' : formatCurrency(stats.totalRevenue)}
            icon={<Briefcase className="h-6 w-6 text-green-600" />}
            color="text-green-600"
            loading={isLoading}
            trend={20}
          />
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary-900">Quick Actions</h2>
          <Link to="/cases/new" className="text-sm text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <QuickAction
              title="New Applicant"
              description="Register a new applicant"
              icon={<Users className="h-6 w-6 text-primary-600" />}
              to="/applicants/new"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <QuickAction
              title="New Employer"
              description="Add a new employer"
              icon={<Building2 className="h-6 w-6 text-blue-600" />}
              color="bg-blue-100"
              to="/employers/new"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <QuickAction
              title="New Case"
              description="Start a new visa case"
              icon={<FileText className="h-6 w-6 text-green-600" />}
              color="bg-green-100"
              to="/cases/new"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <QuickAction
              title="AI Analysis"
              description="Analyze documents with AI"
              icon={<Globe className="h-6 w-6 text-purple-600" />}
              color="bg-purple-100"
              to="/analysis"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Recent Activities */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card variant="bordered" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900">Recent Activities</h2>
              <Link to="/cases" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <>
                  <SkeletonText lines={1} className="w-full mb-2" />
                  <SkeletonText lines={1} className="w-3/4 mb-2" />
                  <SkeletonText lines={1} className="w-1/2" />
                </>
              ) : (
                recentActivities.map((activity, index) => (
                  <RecentActivity key={index} {...activity} />
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* System Status */}
        <motion.div variants={itemVariants}>
          <Card variant="bordered" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900">System Status</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">AI Integration</span>
                <div className="flex items-center gap-2">
                  {aiStatus === 'loading' ? (
                    <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                  ) : aiStatus === 'configured' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {aiStatus === 'loading' ? 'Checking...' : aiStatus === 'configured' ? 'Connected' : 'Not configured'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Database</span>
                <div className="flex items-center gap-2">
                  {supabaseStatus === 'loading' ? (
                    <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                  ) : supabaseStatus === 'configured' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {supabaseStatus === 'loading' ? 'Checking...' : supabaseStatus === 'configured' ? 'Connected' : 'Not configured'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-secondary-200">
                <span className="text-sm text-secondary-600">Storage</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Online</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Case Status Distribution */}
        <motion.div variants={itemVariants}>
          <Card variant="bordered" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900">Case Status</h2>
              <Link to="/cases" className="text-sm text-primary-600 hover:underline">
                View details
              </Link>
            </div>
            {isLoading ? (
              <SkeletonText lines={5} />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-16 rounded-full bg-green-500" />
                    <span className="text-sm">Approved</span>
                  </div>
                  <span className="text-sm font-medium">{stats.completedCases} cases</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-24 rounded-full bg-yellow-500" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="text-sm font-medium">{stats.pendingCases} cases</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-8 rounded-full bg-red-500" />
                    <span className="text-sm">Rejected</span>
                  </div>
                  <span className="text-sm font-medium">{stats.totalCases - stats.completedCases - stats.pendingCases} cases</span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Leads Overview */}
        <motion.div variants={itemVariants}>
          <Card variant="bordered" padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900">Active Leads</h2>
              <Link to="/leads" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            {isLoading ? (
              <SkeletonText lines={3} />
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-secondary-900">{stats.activeLeads}</p>
                  <p className="text-sm text-secondary-500">Active leads</p>
                </div>
                <Progress value={75} max={100} showLabel labelFormatter={(v) => `${v}% conversion rate`} />
                <div className="flex justify-center gap-4 text-xs">
                  <div className="text-center">
                    <p className="font-medium">New</p>
                    <p className="text-secondary-500">12</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Contacted</p>
                    <p className="text-secondary-500">8</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Converted</p>
                    <p className="text-secondary-500">5</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        className="mt-8 text-center"
        variants={itemVariants}
      >
        <p className="text-secondary-500 mb-4">
          Need help? Check out our documentation or contact support
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="outline" onClick={() => navigate('/settings')}>
            Settings
          </Button>
          <Button variant="outline" onClick={() => navigate('/audit')}>
            Audit Log
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
