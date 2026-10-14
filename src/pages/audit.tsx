import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, generateId, formatDate, formatDateBengali } from '@/lib/utils';
import { APP_CONFIG, DEFAULTS } from '@/lib/constants';
import { useApp } from '@/App';
import {
  Button, Card, Input, Select, Badge, Alert, Skeleton, Dialog,
  DialogActions, DialogContent, Sheet, SheetContent, Table,
  TableCell, TableHeaderCell, TableRow, Progress, DropdownMenu,
  DropdownMenuItem as DropdownMenuItemType, Textarea, Avatar
} from '@/components/ui';
import {
  FileText, Eye, Search, Filter, MoreVertical, ChevronLeft, ChevronRight,
  Calendar, Clock, User, Shield, AlertCircle, CheckCircle, XCircle,
  Trash2, Download, RefreshCw, SortAsc, SortDesc, BarChart3, Activity
} from 'lucide-react';
import { generateAuditReportPDF } from '@/lib/pdf';
import type { AuditLog, User, PaginationParams, PaginatedResponse } from '@/types';

// Sample audit logs
const sampleAuditLogs: AuditLog[] = [
  {
    id: '1',
    userId: 'user-1',
    action: 'CREATE',
    entityType: 'applicant',
    entityId: 'APPL-2024-001',
    oldValue: null,
    newValue: { name: 'Mohammad Rahman', email: 'm.rahman@example.com' },
    timestamp: '2024-01-25T10:00:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
  {
    id: '2',
    userId: 'user-2',
    action: 'UPDATE',
    entityType: 'case',
    entityId: 'CASE-2024-001',
    oldValue: { status: 'draft' },
    newValue: { status: 'submitted' },
    timestamp: '2024-01-25T11:30:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
  {
    id: '3',
    userId: 'user-1',
    action: 'DELETE',
    entityType: 'document',
    entityId: 'DOC-2024-001',
    oldValue: { name: 'Old Passport.pdf', type: 'passport' },
    newValue: null,
    timestamp: '2024-01-25T14:00:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
  {
    id: '4',
    userId: 'user-3',
    action: 'CREATE',
    entityType: 'employer',
    entityId: 'EMP-2024-001',
    oldValue: null,
    newValue: { companyName: 'ABC Corporation', industry: 'IT' },
    timestamp: '2024-01-24T09:00:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
  },
  {
    id: '5',
    userId: 'user-2',
    action: 'UPDATE',
    entityType: 'case',
    entityId: 'CASE-2024-002',
    oldValue: { visaType: 'tourist' },
    newValue: { visaType: 'work' },
    timestamp: '2024-01-24T10:30:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
  {
    id: '6',
    userId: 'user-1',
    action: 'APPROVE',
    entityType: 'approval',
    entityId: 'APP-2024-001',
    oldValue: { status: 'pending' },
    newValue: { status: 'approved' },
    timestamp: '2024-01-24T15:00:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
  {
    id: '7',
    userId: 'user-4',
    action: 'LOGIN',
    entityType: 'user',
    entityId: 'user-4',
    oldValue: null,
    newValue: { action: 'login' },
    timestamp: '2024-01-23T08:00:00Z',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
  {
    id: '8',
    userId: 'user-1',
    action: 'LOGOUT',
    entityType: 'user',
    entityId: 'user-1',
    oldValue: null,
    newValue: { action: 'logout' },
    timestamp: '2024-01-23T18:00:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
  {
    id: '9',
    userId: 'user-2',
    action: 'CREATE',
    entityType: 'research',
    entityId: 'RES-2024-001',
    oldValue: null,
    newValue: { url: 'https://example.com', query: 'visa requirements' },
    timestamp: '2024-01-22T14:00:00Z',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  },
  {
    id: '10',
    userId: 'user-1',
    action: 'EXPORT',
    entityType: 'report',
    entityId: 'REP-2024-001',
    oldValue: null,
    newValue: { type: 'case-report', format: 'pdf' },
    timestamp: '2024-01-22T16:00:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
  {
    id: '11',
    userId: 'user-3',
    action: 'UPDATE',
    entityType: 'settings',
    entityId: 'SETTINGS-001',
    oldValue: { theme: 'light' },
    newValue: { theme: 'dark' },
    timestamp: '2024-01-21T12:00:00Z',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
  },
  {
    id: '12',
    userId: 'user-5',
    action: 'CREATE',
    entityType: 'lead',
    entityId: 'LEAD-2024-001',
    oldValue: null,
    newValue: { name: 'New Lead', source: 'website' },
    timestamp: '2024-01-20T10:00:00Z',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  },
];

// Sample users for reference
const sampleUsers: Record<string, Partial<User>> = {
  'user-1': { firstName: 'Admin', lastName: 'User', email: 'admin@visamotion.ai', role: 'admin' },
  'user-2': { firstName: 'Manager', lastName: 'One', email: 'manager1@visamotion.ai', role: 'manager' },
  'user-3': { firstName: 'Agent', lastName: 'One', email: 'agent1@visamotion.ai', role: 'agent' },
  'user-4': { firstName: 'Client', lastName: 'One', email: 'client1@visamotion.ai', role: 'client' },
  'user-5': { firstName: 'Agent', lastName: 'Two', email: 'agent2@visamotion.ai', role: 'agent' },
};

// Action types for filtering
const actionOptions = [
  { value: 'all', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'EXPORT', label: 'Export' },
];

// Entity types for filtering
const entityOptions = [
  { value: 'all', label: 'All Entities' },
  { value: 'applicant', label: 'Applicant' },
  { value: 'case', label: 'Case' },
  { value: 'document', label: 'Document' },
  { value: 'employer', label: 'Employer' },
  { value: 'approval', label: 'Approval' },
  { value: 'user', label: 'User' },
  { value: 'research', label: 'Research' },
  { value: 'report', label: 'Report' },
  { value: 'settings', label: 'Settings' },
  { value: 'lead', label: 'Lead' },
];

// User options for filtering
const userOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'user-1', label: 'Admin User (admin)' },
  { value: 'user-2', label: 'Manager One (manager)' },
  { value: 'user-3', label: 'Agent One (agent)' },
  { value: 'user-4', label: 'Client One (client)' },
  { value: 'user-5', label: 'Agent Two (agent)' },
];

export interface AuditPageProps {
  mode?: 'list' | 'view';
}

export const AuditPage: React.FC<AuditPageProps> = ({ mode = 'list' }) => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(sampleAuditLogs);
  const [filteredAuditLogs, setFilteredAuditLogs] = useState<AuditLog[]>(sampleAuditLogs);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | string>('all');
  const [entityFilter, setEntityFilter] = useState<'all' | string>('all');
  const [userFilter, setUserFilter] = useState<'all' | string>('all');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  });
  const [sortBy, setSortBy] = useState<'timestamp' | 'action' | 'entityType' | 'userId'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [viewingAudit, setViewingAudit] = useState<AuditLog | null>(null);
  const [showDateRangeSheet, setShowDateRangeSheet] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setAuditLogs(sampleAuditLogs);
      setFilteredAuditLogs(sampleAuditLogs);
      setIsLoading(false);
    };
    loadData();
  }, []);
  
  useEffect(() => {
    let result = [...auditLogs];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.userId.toLowerCase().includes(query) ||
        a.action.toLowerCase().includes(query) ||
        a.entityType.toLowerCase().includes(query) ||
        a.entityId.toLowerCase().includes(query) ||
        a.ipAddress?.toLowerCase().includes(query)
      );
    }
    
    if (actionFilter !== 'all') result = result.filter(a => a.action === actionFilter);
    if (entityFilter !== 'all') result = result.filter(a => a.entityType === entityFilter);
    if (userFilter !== 'all') result = result.filter(a => a.userId === userFilter);
    
    if (dateRange.from) {
      result = result.filter(a => new Date(a.timestamp) >= new Date(dateRange.from));
    }
    if (dateRange.to) {
      result = result.filter(a => new Date(a.timestamp) <= new Date(dateRange.to));
    }
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'action':
          return sortOrder === 'asc' ? a.action.localeCompare(b.action) : b.action.localeCompare(a.action);
        case 'entityType':
          return sortOrder === 'asc' ? a.entityType.localeCompare(b.entityType) : b.entityType.localeCompare(a.entityType);
        case 'userId':
          return sortOrder === 'asc' ? a.userId.localeCompare(b.userId) : b.userId.localeCompare(a.userId);
        default:
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
    
    setFilteredAuditLogs(result);
    setCurrentPage(1);
  }, [auditLogs, searchQuery, actionFilter, entityFilter, userFilter, dateRange, sortBy, sortOrder]);
  
  const totalPages = Math.ceil(filteredAuditLogs.length / itemsPerPage);
  const paginatedAuditLogs = filteredAuditLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleViewAudit = (audit: AuditLog) => {
    setViewingAudit(audit);
    setShowDetailSheet(true);
  };
  
  const handleBack = () => {
    navigate('/audit');
    setShowDetailSheet(false);
    setViewingAudit(null);
  };
  
  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);
  
  const getActionBadge = (action: string) => {
    const variants: Record<string, 'success' | 'danger' | 'warning' | 'primary' | 'secondary'> = {
      CREATE: 'success',
      UPDATE: 'primary',
      DELETE: 'danger',
      APPROVE: 'success',
      LOGIN: 'success',
      LOGOUT: 'warning',
      EXPORT: 'primary',
    };
    return <Badge variant={variants[action] || 'secondary'} size="sm">{action}</Badge>;
  };
  
  const getEntityTypeLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      applicant: 'Applicant',
      case: 'Visa Case',
      document: 'Document',
      employer: 'Employer',
      approval: 'Approval',
      user: 'User',
      research: 'Research',
      report: 'Report',
      settings: 'Settings',
      lead: 'Lead',
    };
    return labels[entityType] || entityType;
  };
  
  const getUserDisplayName = (userId: string) => {
    const user = sampleUsers[userId];
    if (user) {
      return `${user.firstName} ${user.lastName} (${user.role})`;
    }
    return userId;
  };
  
  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId as any);
      setSortOrder('desc');
    }
  };
  
  const getSortIndicator = (columnId: string) => {
    if (sortBy !== columnId) return null;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };
  
  const handleGenerateReport = async () => {
    try {
      setIsLoading(true);
      const result = await generateAuditReportPDF(filteredAuditLogs);
      if (result && result.url) {
        window.open(result.url, '_blank');
        setSuccess('Audit report generated successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearFilters = () => {
    setSearchQuery('');
    setActionFilter('all');
    setEntityFilter('all');
    setUserFilter('all');
    setDateRange({ from: '', to: '' });
  };
  
  const stats = {
    total: auditLogs.length,
    today: auditLogs.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length,
    thisWeek: auditLogs.filter(a => {
      const date = new Date(a.timestamp);
      const today = new Date();
      const diff = today.getTime() - date.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }).length,
    users: new Set(auditLogs.map(a => a.userId)).size,
    actions: new Set(auditLogs.map(a => a.action)).size,
  };
  
  // Group by action for summary
  const actionCounts = auditLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (isLoading && auditLogs.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        <Card className="p-4">
          <Skeleton className="h-64" />
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Audit Log
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete history of all system activities and changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>
      
      {/* Error and Success Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
          >
            <Alert variant="success" onClose={clearSuccess}>
              <CheckCircle className="h-4 w-4" />
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Logs</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.today}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-full">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.users}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-full">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.actions}</p>
              <p className="text-sm text-muted-foreground">Action Types</p>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Action Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="Card p-4"
      >
        <h3 className="font-semibold text-foreground mb-4">Action Summary</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(actionCounts).map(([action, count]) => (
            <Badge key={action} variant="secondary" className="px-3 py-1">
              {getActionBadge(action)} <span className="ml-1">{count}</span>
            </Badge>
          ))}
        </div>
      </motion.div>
      
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="Card p-4 space-y-4"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, entity, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={actionFilter}
            onChange={(v) => setActionFilter(v)}
            options={actionOptions}
            placeholder="Filter by action"
            className="min-w-32"
          />
          <Select
            value={entityFilter}
            onChange={(v) => setEntityFilter(v)}
            options={entityOptions}
            placeholder="Filter by entity"
            className="min-w-32"
          />
          <Select
            value={userFilter}
            onChange={(v) => setUserFilter(v)}
            options={userOptions}
            placeholder="Filter by user"
            className="min-w-32"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDateRangeSheet(true)}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </motion.div>
      
      {/* Date Range Sheet */}
      <Sheet open={showDateRangeSheet} onOpenChange={(open) => { if (!open) setShowDateRangeSheet(false); }}>
        <SheetContent className="w-full md:w-80" side="bottom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Date Range Filter</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowDateRangeSheet(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">From Date</label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">To Date</label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDateRange({ from: '', to: '' })}
                >
                  Clear
                </Button>
                <Button onClick={() => setShowDateRangeSheet(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </motion.div>
        </SheetContent>
      </Sheet>
      
      {/* Audit Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="Card overflow-hidden"
      >
        <Table>
          <TableRow className="bg-muted/50">
            <TableHeaderCell onClick={() => handleSort('timestamp')} className="cursor-pointer">
              <div className="flex items-center gap-1">
                Timestamp
                {getSortIndicator('timestamp')}
              </div>
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('action')} className="cursor-pointer">
              <div className="flex items-center gap-1">
                Action
                {getSortIndicator('action')}
              </div>
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('entityType')} className="cursor-pointer">
              <div className="flex items-center gap-1">
                Entity
                {getSortIndicator('entityType')}
              </div>
            </TableHeaderCell>
            <TableHeaderCell>Entity ID</TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('userId')} className="cursor-pointer">
              <div className="flex items-center gap-1">
                User
                {getSortIndicator('userId')}
              </div>
            </TableHeaderCell>
            <TableHeaderCell>IP Address</TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </TableRow>
          
          {paginatedAuditLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="flex flex-col items-center gap-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No audit logs found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedAuditLogs.map((audit) => (
              <TableRow
                key={audit.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell>
                  <div>
                    <span>{formatDate(audit.timestamp, 'DD MMM YYYY')}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDate(audit.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getActionBadge(audit.action)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" size="sm">
                    {getEntityTypeLabel(audit.entityType)}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {audit.entityId}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 text-xs">
                      {getUserDisplayName(audit.userId).slice(0, 2)}
                    </Avatar>
                    <div>
                      <p className="font-medium">{getUserDisplayName(audit.userId)}</p>
                      <p className="text-xs text-muted-foreground">{audit.userId}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {audit.ipAddress || 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewAudit(audit)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </motion.div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="Card p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({filteredAuditLogs.length} total)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Go to page:</span>
            <Input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
              className="w-16"
            />
          </div>
        </motion.div>
      )}
      
      {/* Detail Sheet */}
      <Sheet open={showDetailSheet} onOpenChange={(open) => { if (!open) handleBack(); }}>
        <SheetContent className="w-full md:w-2/3 lg:w-1/2 xl:w-1/3" side="right">
          {viewingAudit && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold">Audit Log Details</h2>
                  <p className="text-sm text-muted-foreground">
                    {viewingAudit.id}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                {/* Action Card */}
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Action</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getActionBadge(viewingAudit.action)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Entity Type</p>
                      <Badge variant="secondary" className="mt-1">{getEntityTypeLabel(viewingAudit.entityType)}</Badge>
                    </div>
                  </div>
                </Card>
                
                {/* Timestamp */}
                <Card className="p-4 space-y-4">
                  <h3 className="font-semibold text-foreground">Timestamp</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(viewingAudit.timestamp, 'DD MMM YYYY')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{formatDate(viewingAudit.timestamp, 'HH:mm:ss')}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Bengali Date</p>
                      <p className="font-medium">{formatDateBengali(viewingAudit.timestamp)}</p>
                    </div>
                  </div>
                </Card>
                
                {/* Entity Information */}
                <Card className="p-4 space-y-4">
                  <h3 className="font-semibold text-foreground">Entity Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entity Type</p>
                      <p className="font-medium">{getEntityTypeLabel(viewingAudit.entityType)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entity ID</p>
                      <p className="font-mono font-medium">{viewingAudit.entityId}</p>
                    </div>
                  </div>
                </Card>
                
                {/* User Information */}
                <Card className="p-4 space-y-4">
                  <h3 className="font-semibold text-foreground">User Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">User ID</p>
                      <p className="font-mono font-medium">{viewingAudit.userId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Display Name</p>
                      <p className="font-medium">{getUserDisplayName(viewingAudit.userId)}</p>
                    </div>
                  </div>
                </Card>
                
                {/* IP and Device Information */}
                <Card className="p-4 space-y-4">
                  <h3 className="font-semibold text-foreground">Connection Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">IP Address</p>
                      <p className="font-mono font-medium">{viewingAudit.ipAddress || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">User Agent</p>
                      <p className="font-medium text-sm break-all">{viewingAudit.userAgent || 'N/A'}</p>
                    </div>
                  </div>
                </Card>
                
                {/* Changes */}
                {(viewingAudit.oldValue || viewingAudit.newValue) && (
                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold text-foreground">Changes</h3>
                    <div className="space-y-4">
                      {viewingAudit.oldValue && (
                        <div>
                          <p className="text-sm text-muted-foreground">Old Value</p>
                          <div className="mt-2 p-3 bg-red-500/10 rounded-md">
                            <pre className="text-sm overflow-x-auto">{JSON.stringify(viewingAudit.oldValue, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                      {viewingAudit.newValue && (
                        <div>
                          <p className="text-sm text-muted-foreground">New Value</p>
                          <div className="mt-2 p-3 bg-green-500/10 rounded-md">
                            <pre className="text-sm overflow-x-auto">{JSON.stringify(viewingAudit.newValue, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(viewingAudit, null, 2))}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Copy Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateReport()}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AuditPage;
