import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, generateId, generateReferenceNumber, formatDate, formatDateBengali } from '@/lib/utils';
import { APP_CONFIG, APPROVAL_STATUS_CONFIG, VISA_TYPES, COUNTRIES, DEFAULTS } from '@/lib/constants';
import { useApp } from '@/App';
import {
  Button, Card, Input, Select, Badge, Alert, Skeleton, Dialog,
  DialogActions, DialogContent, Sheet, SheetContent, Table,
  TableCell, TableHeaderCell, TableRow, Progress, DropdownMenu,
  DropdownMenuItem as DropdownMenuItemType, Textarea, Avatar
} from '@/components/ui';
import {
  CheckCircle, XCircle, Clock, Eye, Edit, Trash2, Search, Filter,
  MoreVertical, ChevronLeft, ChevronRight, Plus, SortAsc, SortDesc,
  FileText, User, Calendar, AlertCircle, Check, X, RefreshCw
} from 'lucide-react';
import { generateApprovalReportPDF } from '@/lib/pdf';
import type { Approval, VisaCase, Applicant, PaginationParams, PaginatedResponse } from '@/types';

// Sample data for approvals
const sampleApprovals: Approval[] = [
  {
    id: '1',
    caseId: 'CASE-2024-001',
    type: 'application',
    requestedBy: 'Agent 1',
    requestedAt: '2024-01-25T10:00:00Z',
    approvedBy: 'Manager 1',
    approvedAt: '2024-01-25T14:30:00Z',
    status: 'approved',
    comments: 'Application approved. All documents verified.',
  },
  {
    id: '2',
    caseId: 'CASE-2024-002',
    type: 'document',
    requestedBy: 'Agent 2',
    requestedAt: '2024-01-24T09:00:00Z',
    status: 'pending',
    comments: 'Waiting for document verification.',
  },
  {
    id: '3',
    caseId: 'CASE-2024-003',
    type: 'payment',
    requestedBy: 'Agent 1',
    requestedAt: '2024-01-23T11:00:00Z',
    rejectedBy: 'Manager 1',
    rejectedAt: '2024-01-23T15:00:00Z',
    rejectionReason: 'Payment not received',
    status: 'rejected',
    comments: 'Client needs to complete payment.',
  },
  {
    id: '4',
    caseId: 'CASE-2024-004',
    type: 'final',
    requestedBy: 'Agent 3',
    requestedAt: '2024-01-22T14:00:00Z',
    status: 'pending',
    comments: 'Final approval pending.',
  },
  {
    id: '5',
    caseId: 'CASE-2024-005',
    type: 'application',
    requestedBy: 'Agent 2',
    requestedAt: '2024-01-21T16:00:00Z',
    approvedBy: 'Manager 2',
    approvedAt: '2024-01-21T18:00:00Z',
    status: 'approved',
    comments: 'Urgent case - fast tracked.',
  },
  {
    id: '6',
    caseId: 'CASE-2024-006',
    type: 'document',
    requestedBy: 'Agent 1',
    requestedAt: '2024-01-20T10:00:00Z',
    rejectedBy: 'Manager 1',
    rejectedAt: '2024-01-20T12:00:00Z',
    rejectionReason: 'Missing documents',
    status: 'rejected',
    comments: 'Passport copy not provided.',
  },
  {
    id: '7',
    caseId: 'CASE-2024-007',
    type: 'payment',
    requestedBy: 'Agent 3',
    requestedAt: '2024-01-19T08:00:00Z',
    approvedBy: 'Manager 2',
    approvedAt: '2024-01-19T10:00:00Z',
    status: 'approved',
    comments: 'Payment verified.',
  },
  {
    id: '8',
    caseId: 'CASE-2024-008',
    type: 'final',
    requestedBy: 'Agent 2',
    requestedAt: '2024-01-18T15:00:00Z',
    status: 'pending',
    comments: 'Awaiting final review.',
  },
];

// Sample cases for reference
const sampleCases: Record<string, Partial<VisaCase>> = {
  'CASE-2024-001': { referenceNumber: 'CASE-2024-001', visaType: 'work', targetCountry: 'saudi-arabia', status: 'processing' },
  'CASE-2024-002': { referenceNumber: 'CASE-2024-002', visaType: 'student', targetCountry: 'uk', status: 'submitted' },
  'CASE-2024-003': { referenceNumber: 'CASE-2024-003', visaType: 'business', targetCountry: 'uae', status: 'draft' },
  'CASE-2024-004': { referenceNumber: 'CASE-2024-004', visaType: 'tourist', targetCountry: 'malaysia', status: 'submitted' },
  'CASE-2024-005': { referenceNumber: 'CASE-2024-005', visaType: 'work', targetCountry: 'qatar', status: 'urgent' },
  'CASE-2024-006': { referenceNumber: 'CASE-2024-006', visaType: 'student', targetCountry: 'canada', status: 'processing' },
  'CASE-2024-007': { referenceNumber: 'CASE-2024-007', visaType: 'business', targetCountry: 'singapore', status: 'approved' },
  'CASE-2024-008': { referenceNumber: 'CASE-2024-008', visaType: 'tourist', targetCountry: 'usa', status: 'submitted' },
};

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'document', label: 'Document Approval' },
  { value: 'application', label: 'Application Approval' },
  { value: 'payment', label: 'Payment Approval' },
  { value: 'final', label: 'Final Approval' },
];

const statusOptions = Object.entries(APPROVAL_STATUS_CONFIG).map(([k, v]) => ({
  value: k,
  label: v.label.en,
}));

const requesterOptions = [
  { value: 'all', label: 'All Requesters' },
  { value: 'Agent 1', label: 'Agent 1' },
  { value: 'Agent 2', label: 'Agent 2' },
  { value: 'Agent 3', label: 'Agent 3' },
];

export interface ApprovalsPageProps {
  mode?: 'list' | 'new' | 'edit' | 'view';
}

export const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ mode = 'list' }) => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [approvals, setApprovals] = useState<Approval[]>(sampleApprovals);
  const [filteredApprovals, setFilteredApprovals] = useState<Approval[]>(sampleApprovals);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [requesterFilter, setRequesterFilter] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'type' | 'caseId'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkActionsSheet, setShowBulkActionsSheet] = useState(false);
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [viewingApproval, setViewingApproval] = useState<Approval | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setApprovals(sampleApprovals);
      setFilteredApprovals(sampleApprovals);
      setIsLoading(false);
    };
    loadData();
  }, []);
  
  useEffect(() => {
    let result = [...approvals];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.caseId.toLowerCase().includes(query) ||
        a.requestedBy.toLowerCase().includes(query) ||
        a.type.toLowerCase().includes(query) ||
        (a.comments && a.comments.toLowerCase().includes(query))
      );
    }
    
    if (typeFilter !== 'all') result = result.filter(a => a.type === typeFilter);
    if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
    if (requesterFilter !== 'all') result = result.filter(a => a.requestedBy === requesterFilter);
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'status':
          return sortOrder === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
        case 'type':
          return sortOrder === 'asc' ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
        case 'caseId':
          return sortOrder === 'asc' ? a.caseId.localeCompare(b.caseId) : b.caseId.localeCompare(a.caseId);
        default:
          const dateA = new Date(a.requestedAt).getTime();
          const dateB = new Date(b.requestedAt).getTime();
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
    
    setFilteredApprovals(result);
    setCurrentPage(1);
  }, [approvals, searchQuery, typeFilter, statusFilter, requesterFilter, sortBy, sortOrder]);
  
  useEffect(() => {
    if (mode === 'view') {
      // View mode - will be handled by viewing specific approval
    }
  }, [mode]);
  
  const totalPages = Math.ceil(filteredApprovals.length / itemsPerPage);
  const paginatedApprovals = filteredApprovals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      setApprovals(approvals.map(a =>
        a.id === id ? {
          ...a,
          status: 'approved',
          approvedBy: 'Current User',
          approvedAt: new Date().toISOString(),
          comments: a.comments ? `${a.comments}\n\nApproved at ${new Date().toISOString()}` : `Approved at ${new Date().toISOString()}`,
        } : a
      ));
      setSuccess('Approval approved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (id: string, reason: string = '') => {
    try {
      setProcessingId(id);
      setApprovals(approvals.map(a =>
        a.id === id ? {
          ...a,
          status: 'rejected',
          rejectedBy: 'Current User',
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason || 'Rejected by approver',
          comments: a.comments ? `${a.comments}\n\nRejected: ${reason || 'No reason provided'}` : `Rejected: ${reason || 'No reason provided'}`,
        } : a
      ));
      setSuccess('Approval rejected successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleCancel = async (id: string) => {
    try {
      setProcessingId(id);
      setApprovals(approvals.map(a =>
        a.id === id ? {
          ...a,
          status: 'cancelled',
          comments: a.comments ? `${a.comments}\n\nCancelled at ${new Date().toISOString()}` : `Cancelled at ${new Date().toISOString()}`,
        } : a
      ));
      setSuccess('Approval cancelled successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to cancel');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setApprovals(approvals.filter(a => a.id !== id));
      setShowDeleteDialog(false);
      setDeletingId(null);
      setSuccess('Approval deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete approval');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      setApprovals(approvals.filter(a => !selectedApprovals.includes(a.id)));
      setSelectedApprovals([]);
      setShowBulkActionsSheet(false);
      setSuccess('Selected approvals deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete selected approvals');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBulkApprove = async () => {
    try {
      setIsLoading(true);
      setApprovals(approvals.map(a =>
        selectedApprovals.includes(a.id) && a.status === 'pending' ? {
          ...a,
          status: 'approved',
          approvedBy: 'Current User',
          approvedAt: new Date().toISOString(),
          comments: a.comments ? `${a.comments}\n\nBulk approved at ${new Date().toISOString()}` : `Bulk approved at ${new Date().toISOString()}`,
        } : a
      ));
      setSelectedApprovals([]);
      setShowBulkActionsSheet(false);
      setSuccess('Selected approvals approved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to approve selected approvals');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectRow = (id: string) => {
    setSelectedApprovals(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const handleSelectAll = () => {
    if (selectedApprovals.length === paginatedApprovals.length) {
      setSelectedApprovals([]);
    } else {
      setSelectedApprovals(paginatedApprovals.map(a => a.id));
    }
  };
  
  const handleViewApproval = (approval: Approval) => {
    setViewingApproval(approval);
    setShowDetailSheet(true);
  };
  
  const handleBack = () => {
    navigate('/approvals');
    setShowDetailSheet(false);
    setViewingApproval(null);
  };
  
  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);
  
  const getStatusBadge = (status: string) => {
    const config = APPROVAL_STATUS_CONFIG[status as keyof typeof APPROVAL_STATUS_CONFIG];
    if (!config) return <Badge variant="secondary" size="sm">{status}</Badge>;
    return <Badge 
      variant={config.color.includes('green') ? 'success' : config.color.includes('red') ? 'danger' : config.color.includes('yellow') ? 'warning' : 'primary'} 
      size="sm"
    >{config.label.en}</Badge>;
  };
  
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      document: 'Document',
      application: 'Application',
      payment: 'Payment',
      final: 'Final',
    };
    return labels[type] || type;
  };
  
  const getCaseInfo = (caseId: string) => {
    return sampleCases[caseId] || { referenceNumber: caseId };
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
  
  const handleGenerateReport = async (approval: Approval) => {
    try {
      setIsLoading(true);
      const caseInfo = getCaseInfo(approval.caseId);
      const result = await generateApprovalReportPDF(approval, caseInfo as any);
      if (result && result.url) {
        window.open(result.url, '_blank');
        setSuccess('Approval report generated successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };
  
  const stats = {
    total: approvals.length,
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
    cancelled: approvals.filter(a => a.status === 'cancelled').length,
  };
  
  if (isLoading && approvals.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
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
            Approvals Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all approval requests for visa cases
          </p>
        </div>
        <div className="flex items-center gap-2">
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
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-full">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-full">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-500/10 rounded-full">
              <X className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.cancelled}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="Card p-4 space-y-4"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by case ID, requester, or comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={typeFilter}
            onChange={(v) => setTypeFilter(v)}
            options={typeOptions}
            placeholder="Filter by type"
            className="min-w-32"
          />
          <Select
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            options={[{ value: 'all', label: 'All Statuses' }, ...statusOptions]}
            placeholder="Filter by status"
            className="min-w-32"
          />
          <Select
            value={requesterFilter}
            onChange={(v) => setRequesterFilter(v)}
            options={requesterOptions}
            placeholder="Filter by requester"
            className="min-w-32"
          />
          <Button variant="outline" size="sm" onClick={() => {
            setSearchQuery('');
            setTypeFilter('all');
            setStatusFilter('all');
            setRequesterFilter('all');
          }}>
            Clear Filters
          </Button>
        </div>
      </motion.div>
      
      {/* Bulk Actions */}
      {selectedApprovals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="Card p-4 flex flex-wrap items-center gap-4"
        >
          <span className="text-sm text-muted-foreground">
            {selectedApprovals.length} selected
          </span>
          <Button variant="outline" size="sm" onClick={() => handleBulkApprove()}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve Selected
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowBulkActionsSheet(true)}>
            <MoreVertical className="h-4 w-4 mr-2" />
            More Actions
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedApprovals([])}>
            Clear Selection
          </Button>
        </motion.div>
      )}
      
      {/* Approvals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="Card overflow-hidden"
      >
        <Table>
          <TableRow className="bg-muted/50">
            <TableHeaderCell className="w-12">
              <input
                type="checkbox"
                checked={selectedApprovals.length === paginatedApprovals.length && paginatedApprovals.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4"
              />
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('caseId')} className="cursor-pointer">
              <div className="flex items-center gap-1">
                Case ID
                {getSortIndicator('caseId')}
              </div>
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('type')} className="cursor-pointer">
              <div className="flex items-center gap-1">
                Type
                {getSortIndicator('type')}
              </div>
            </TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('status')} className="cursor-pointer">
              <div className="flex items-center gap-1">
                Status
                {getSortIndicator('status')}
              </div>
            </TableHeaderCell>
            <TableHeaderCell>Requester</TableHeaderCell>
            <TableHeaderCell onClick={() => handleSort('date')} className="cursor-pointer">
              <div className="flex items-center gap-1">
                Requested At
                {getSortIndicator('date')}
              </div>
            </TableHeaderCell>
            <TableHeaderCell className="text-right">Actions</TableHeaderCell>
          </TableRow>
          
          {paginatedApprovals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <div className="flex flex-col items-center gap-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No approvals found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedApprovals.map((approval) => (
              <TableRow
                key={approval.id}
                className={cn(
                  selectedApprovals.includes(approval.id) && 'bg-muted/50',
                  'hover:bg-muted/50 transition-colors'
                )}
                onClick={() => handleSelectRow(approval.id)}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedApprovals.includes(approval.id)}
                    onChange={(e) => e.stopPropagation()}
                    className="w-4 h-4"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    {approval.caseId}
                    <span className="block text-xs text-muted-foreground">
                      {sampleCases[approval.caseId]?.referenceNumber || ''}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" size="sm">
                    {getTypeLabel(approval.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getStatusBadge(approval.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 text-xs">
                      {approval.requestedBy.slice(0, 2)}
                    </Avatar>
                    <span>{approval.requestedBy}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <span>{formatDate(approval.requestedAt, 'DD MMM YYYY')}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatDate(approval.requestedAt, 'HH:mm')}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleViewApproval(approval); }}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <DropdownMenu
                      onSelect={(value) => {
                        if (value === 'approve') handleApprove(approval.id);
                        if (value === 'reject') handleReject(approval.id);
                        if (value === 'cancel') handleCancel(approval.id);
                        if (value === 'delete') { setDeletingId(approval.id); setShowDeleteDialog(true); }
                        if (value === 'report') handleGenerateReport(approval);
                      }}
                    >
                      <DropdownMenuItemType
                        icon={<CheckCircle className="h-4 w-4" />}
                        value="approve"
                        disabled={approval.status !== 'pending' || processingId === approval.id}
                      >
                        Approve
                      </DropdownMenuItemType>
                      <DropdownMenuItemType
                        icon={<XCircle className="h-4 w-4" />}
                        value="reject"
                        disabled={approval.status !== 'pending' || processingId === approval.id}
                      >
                        Reject
                      </DropdownMenuItemType>
                      <DropdownMenuItemType
                        icon={<X className="h-4 w-4" />}
                        value="cancel"
                        disabled={approval.status !== 'pending' || processingId === approval.id}
                      >
                        Cancel
                      </DropdownMenuItemType>
                      <DropdownMenuSeparator />
                      <DropdownMenuItemType
                        icon={<FileText className="h-4 w-4" />}
                        value="report"
                      >
                        Generate Report
                      </DropdownMenuItemType>
                      <DropdownMenuSeparator />
                      <DropdownMenuItemType
                        icon={<Trash2 className="h-4 w-4" />}
                        value="delete"
                        variant="destructive"
                      >
                        Delete
                      </DropdownMenuItemType>
                    </DropdownMenu>
                  </div>
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
          transition={{ delay: 0.4 }}
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
              Page {currentPage} of {totalPages}
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
          {viewingApproval && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold">Approval Details</h2>
                  <p className="text-sm text-muted-foreground">
                    {viewingApproval.caseId} - {getTypeLabel(viewingApproval.type)}
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
                {/* Status Card */}
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(viewingApproval.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Type</p>
                      <Badge variant="secondary" className="mt-1">{getTypeLabel(viewingApproval.type)}</Badge>
                    </div>
                  </div>
                </Card>
                
                {/* Case Information */}
                <Card className="p-4 space-y-4">
                  <h3 className="font-semibold text-foreground">Case Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Case ID</p>
                      <p className="font-medium">{viewingApproval.caseId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reference Number</p>
                      <p className="font-medium">{sampleCases[viewingApproval.caseId]?.referenceNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Visa Type</p>
                      <p className="font-medium">
                        {sampleCases[viewingApproval.caseId]?.visaType ? VISA_TYPES.find(v => v.id === sampleCases[viewingApproval.caseId].visaType)?.label.en : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Target Country</p>
                      <p className="font-medium">
                        {sampleCases[viewingApproval.caseId]?.targetCountry ? COUNTRIES.find(c => c.id === sampleCases[viewingApproval.caseId].targetCountry)?.name : 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>
                
                {/* Request Information */}
                <Card className="p-4 space-y-4">
                  <h3 className="font-semibold text-foreground">Request Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Requested By</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6 text-xs">{viewingApproval.requestedBy.slice(0, 2)}</Avatar>
                        <span>{viewingApproval.requestedBy}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Requested At</p>
                      <p className="font-medium">{formatDate(viewingApproval.requestedAt, 'DD MMM YYYY, HH:mm')}</p>
                    </div>
                  </div>
                </Card>
                
                {/* Approval/Rejection Information */}
                {(viewingApproval.status === 'approved' || viewingApproval.status === 'rejected') && (
                  <Card className="p-4 space-y-4">
                    <h3 className="font-semibold text-foreground">
                      {viewingApproval.status === 'approved' ? 'Approval' : 'Rejection'} Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viewingApproval.status === 'approved' && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Approved By</p>
                            <p className="font-medium">{viewingApproval.approvedBy || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Approved At</p>
                            <p className="font-medium">{viewingApproval.approvedAt ? formatDate(viewingApproval.approvedAt, 'DD MMM YYYY, HH:mm') : 'N/A'}</p>
                          </div>
                        </>
                      )}
                      {viewingApproval.status === 'rejected' && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Rejected By</p>
                            <p className="font-medium">{viewingApproval.rejectedBy || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Rejected At</p>
                            <p className="font-medium">{viewingApproval.rejectedAt ? formatDate(viewingApproval.rejectedAt, 'DD MMM YYYY, HH:mm') : 'N/A'}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">Rejection Reason</p>
                            <p className="font-medium text-red-600">{viewingApproval.rejectionReason || 'No reason provided'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                )}
                
                {/* Comments */}
                <Card className="p-4">
                  <h3 className="font-semibold text-foreground">Comments</h3>
                  <div className="mt-4 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{viewingApproval.comments || 'No comments'}</p>
                  </div>
                </Card>
                
                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {viewingApproval.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(viewingApproval.id)}
                        disabled={processingId === viewingApproval.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(viewingApproval.id)}
                        disabled={processingId === viewingApproval.id}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(viewingApproval.id)}
                        disabled={processingId === viewingApproval.id}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateReport(viewingApproval)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { setDeletingId(viewingApproval.id); setShowDeleteDialog(true); handleBack(); }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => { if (!open) setShowDeleteDialog(false); }}>
        <DialogContent className="max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Delete Approval</h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this approval? This action cannot be undone.
                </p>
              </div>
            </div>
            <DialogActions>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deletingId && handleDelete(deletingId)}
                loading={isLoading}
              >
                Delete
              </Button>
            </DialogActions>
          </motion.div>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Actions Sheet */}
      <Sheet open={showBulkActionsSheet} onOpenChange={(open) => { if (!open) setShowBulkActionsSheet(false); }}>
        <SheetContent className="w-full md:w-80" side="bottom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Bulk Actions</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowBulkActionsSheet(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedApprovals.length} approvals selected
            </p>
            <div className="space-y-2">
              <Button
                className="w-full justify-start"
                onClick={handleBulkApprove}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve All
              </Button>
              <Button
                className="w-full justify-start"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All
              </Button>
            </div>
          </motion.div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ApprovalsPage;
