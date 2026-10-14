import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, generateId, formatDate } from '@/lib/utils';
import { APP_CONFIG, AI_CONFIG } from '@/lib/constants';
import { useApp } from '@/App';
import {
  Button, Card, Input, Select, Badge, Alert, Skeleton, Dialog,
  DialogActions, DialogContent, Sheet, SheetContent, Table,
  TableCell, TableHeaderCell, TableRow, Progress, DropdownMenu,
  DropdownMenuItem as DropdownMenuItemType, Textarea
} from '@/components/ui';
import {
  FileText, Search, MoreVertical, Eye, Trash2, Globe, Calendar,
  CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Upload,
  Sparkles, Lightbulb, Brain, Image, Mail, AlertCircle, Download,
  SortAsc, SortDesc, X, Check
} from 'lucide-react';
import type { ResearchRequest, ResearchResult } from '@/types';

// Sample analysis requests
const sampleAnalysisRequests: any[] = [
  {
    id: '1',
    type: 'rejection',
    title: 'UK Student Visa Rejection Analysis',
    description: 'Analysis of UK student visa rejection letter',
    fileName: 'UK_Rejection_Letter.pdf',
    filePath: '/analyses/uk-rejection.pdf',
    fileType: 'application/pdf',
    fileSize: 245000,
    language: 'bn',
    status: 'completed',
    result: {
      rejectionReasons: ['Insufficient financial proof', 'Bank statement issues', 'Funds not maintained for 28 days'],
      recommendation: 'Provide bank statements showing consistent balance for at least 28 days.',
      successRate: 65,
      suggestions: ['Open new bank account', 'Maintain balance for 28 days', 'Get scholarship'],
      confidence: 95,
    },
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-01-25T14:05:00Z',
  },
  {
    id: '2',
    type: 'website',
    title: 'Canada Visa Website Analysis',
    description: 'Analysis of Canada immigration website',
    fileName: '',
    filePath: '',
    fileUrl: 'https://www.canada.ca/immigration',
    fileType: 'text/html',
    fileSize: 0,
    language: 'en',
    status: 'completed',
    result: {
      keyFindings: ['Proof of ties required', 'Financial requirement: CAD $100/day', 'Processing time: 14-20 days'],
      requirements: ['Valid passport', 'Application form', 'Photos', 'Financial proof'],
      successTips: ['Show strong ties', 'Apply early', 'Complete all documents'],
      confidence: 90,
    },
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:05:00Z',
  },
  {
    id: '3',
    type: 'document',
    title: 'Passport Document Analysis',
    description: 'Analysis of passport document',
    fileName: 'Passport_Scan.pdf',
    filePath: '/analyses/passport.pdf',
    fileType: 'application/pdf',
    fileSize: 180000,
    language: 'en',
    status: 'completed',
    result: {
      documentType: 'Passport',
      validity: { isValid: true, daysRemaining: 1460 },
      details: { passportNumber: 'A12345678', fullName: 'Mohammad Rahman' },
      issues: [],
      recommendations: ['Passport is valid', 'Ready for visa application'],
      confidence: 98,
    },
    createdAt: '2024-01-18T16:00:00Z',
    updatedAt: '2024-01-18T16:05:00Z',
  },
  {
    id: '4',
    type: 'rejection',
    title: 'Australia Student Visa Rejection',
    description: 'Analysis of Australia student visa rejection',
    fileName: 'Australia_Rejection.pdf',
    filePath: '/analyses/australia-rejection.pdf',
    fileType: 'application/pdf',
    fileSize: 320000,
    language: 'en',
    status: 'processing',
    result: null,
    createdAt: '2024-01-22T09:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
  },
];

const analysisTypeOptions = [
  { value: 'rejection', label: 'Rejection Letter' },
  { value: 'website', label: 'Website' },
  { value: 'document', label: 'Document' },
  { value: 'email', label: 'Email' },
  { value: 'image', label: 'Image' },
];

const languageOptions = [
  { value: 'bn', label: 'Bengali' },
  { value: 'en', label: 'English' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
];

export interface AnalysisPageProps {
  mode?: 'list' | 'rejection' | 'website' | 'document' | 'view';
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  mode = 'list',
}) => {
  const navigate = useNavigate();
  const { language } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [analysisRequests, setAnalysisRequests] = useState<any[]>(sampleAnalysisRequests);
  const [filteredRequests, setFilteredRequests] = useState<any[]>(sampleAnalysisRequests);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<any>>({
    type: mode === 'rejection' ? 'rejection' : mode === 'website' ? 'website' : 'document',
    title: '', description: '', file: null, url: '', language: language || 'bn',
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'status' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkActionsSheet, setShowBulkActionsSheet] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisRequests(sampleAnalysisRequests);
      setFilteredRequests(sampleAnalysisRequests);
      setIsLoading(false);
    };
    loadData();
  }, []);
  
  useEffect(() => {
    let result = [...analysisRequests];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(req =>
        req.title.toLowerCase().includes(query) || req.description.toLowerCase().includes(query) ||
        req.fileName.toLowerCase().includes(query)
      );
    }
    if (typeFilter !== 'all') result = result.filter(req => req.type === typeFilter);
    if (statusFilter !== 'all') result = result.filter(req => req.status === statusFilter);
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title': return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        case 'type': return sortOrder === 'asc' ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
        case 'status': return sortOrder === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
        default: return sortOrder === 'asc' ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    setFilteredRequests(result);
    setCurrentPage(1);
  }, [analysisRequests, searchQuery, typeFilter, statusFilter, sortBy, sortOrder]);
  
  useEffect(() => {
    if (mode === 'rejection' || mode === 'website' || mode === 'document') {
      setFormData({ type: mode, title: '', description: '', file: null, url: '', language: language || 'bn' });
      setShowFormSheet(true);
    }
  }, [mode, language]);
  
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(i);
      }
      
      const newRequest = {
        id: editingRequest?.id || generateId(),
        type: formData.type,
        title: formData.title || 'Untitled Analysis',
        description: formData.description || '',
        fileName: formData.file ? formData.file.name : '',
        filePath: formData.file ? URL.createObjectURL(formData.file) : '',
        fileUrl: formData.url || '',
        fileType: formData.file ? formData.file.type : 'text/plain',
        fileSize: formData.file ? formData.file.size : 0,
        language: formData.language || 'bn',
        status: 'processing',
        result: null,
        createdAt: editingRequest?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (editingRequest) {
        setAnalysisRequests(analysisRequests.map(r => r.id === editingRequest.id ? newRequest : r));
      } else {
        setAnalysisRequests([newRequest, ...analysisRequests]);
      }
      
      setShowFormSheet(false);
      navigate('/analysis');
      
      setTimeout(() => {
        setAnalysisRequests(prev => prev.map(r =>
          r.id === newRequest.id ? { ...r, status: 'completed', result: generateSampleResult(r.type, r.language), updatedAt: new Date().toISOString() } : r
        ));
      }, 3000);
    } catch (err) {
      setError('Failed to save analysis request');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };
  
  const generateSampleResult = (type: string, lang: string) => {
    const results: Record<string, any> = {
      rejection: {
        rejectionReasons: ['Insufficient financial proof', 'Bank statement issues'],
        recommendation: 'Provide complete financial documentation',
        successRate: 65,
        suggestions: ['Maintain funds for 28 days', 'Get sponsorship letter'],
        confidence: 95,
      },
      website: {
        keyFindings: ['Visa requirements listed', 'Processing times provided'],
        requirements: ['Valid passport', 'Application form', 'Photos'],
        successTips: ['Apply early', 'Complete all documents'],
        confidence: 90,
      },
      document: {
        documentType: 'Passport',
        validity: { isValid: true, daysRemaining: 1460 },
        details: { passportNumber: 'A12345678' },
        issues: [],
        recommendations: ['Document is valid'],
        confidence: 98,
      },
    };
    return results[type] || { analysis: 'General analysis', confidence: 85 };
  };
  
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setAnalysisRequests(analysisRequests.filter(r => r.id !== id));
      setShowDeleteDialog(false);
      setDeletingId(null);
    } catch (err) {
      setError('Failed to delete');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      setAnalysisRequests(analysisRequests.filter(r => !selectedRequests.includes(r.id)));
      setSelectedRequests([]);
      setShowBulkActionsSheet(false);
    } catch (err) {
      setError('Failed to delete selected');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectRow = (id: string) => {
    setSelectedRequests(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const handleSelectAll = () => {
    if (selectedRequests.length === paginatedRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(paginatedRequests.map(r => r.id));
    }
  };
  
  const handleNewRequest = (type?: string) => {
    navigate(`/analysis/${type || 'rejection'}`);
  };
  
  const handleViewRequest = (request: any) => {
    setViewingRequest(request);
    setShowDetailSheet(true);
  };
  
  const handleBack = () => {
    navigate('/analysis');
    setShowFormSheet(false);
    setShowDetailSheet(false);
    setEditingRequest(null);
    setViewingRequest(null);
  };
  
  const clearError = () => setError(null);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" size="sm"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'processing': return <Badge variant="warning" size="sm"><Sparkles className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'completed': return <Badge variant="success" size="sm"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed': return <Badge variant="danger" size="sm"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default: return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };
  
  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      rejection: { label: 'Rejection', color: 'red' },
      website: { label: 'Website', color: 'blue' },
      document: { label: 'Document', color: 'purple' },
      email: { label: 'Email', color: 'orange' },
      image: { label: 'Image', color: 'green' },
    };
    const config = types[type] || { label: type, color: 'secondary' };
    return <Badge variant={config.color as any} size="sm">{config.label}</Badge>;
  };
  
  const getLanguageLabel = (code: string) => languageOptions.find(l => l.value === code)?.label || code;
  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFormData(prev => ({ ...prev, file: e.target.files![0] }));
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
  
  const menuItems: DropdownMenuItemType[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, disabled: false },
  ];
  
  const handleMenuAction = (action: string, request: any) => {
    switch (action) {
      case 'view': handleViewRequest(request); break;
      case 'delete': setDeletingId(request.id); setShowDeleteDialog(true); break;
    }
  };
  
  const bulkMenuItems: DropdownMenuItemType[] = [
    { id: 'delete', label: 'Delete Selected', icon: <Trash2 className="h-4 w-4" />, disabled: selectedRequests.length === 0 },
  ];
  
  const handleBulkMenuAction = (action: string) => {
    switch (action) {
      case 'delete':
        setShowBulkActionsSheet(false);
        if (confirm(`Delete ${selectedRequests.length} requests?`)) handleBulkDelete();
        break;
    }
    setShowBulkActionsSheet(false);
  };
  
  const columns = [
    {
      id: 'select',
      header: <input type="checkbox" checked={selectedRequests.length === paginatedRequests.length && paginatedRequests.length > 0} onChange={handleSelectAll} />,
      accessor: (item: any) => <input type="checkbox" checked={selectedRequests.includes(item.id)} onChange={() => handleSelectRow(item.id)} />,
      width: '50px',
    },
    {
      id: 'title',
      header: 'Title',
      accessor: (item: any) => <div className="font-medium text-primary-600">{item.title}</div>,
      width: '200px',
      sortable: true,
    },
    {
      id: 'type',
      header: 'Type',
      accessor: (item: any) => getTypeBadge(item.type),
      width: '100px',
      sortable: true,
    },
    {
      id: 'file',
      header: 'File/URL',
      accessor: (item: any) => <div className="text-sm">{item.fileName || item.fileUrl || 'N/A'}</div>,
      width: '180px',
    },
    {
      id: 'language',
      header: 'Language',
      accessor: (item: any) => <Badge variant="primary" size="sm">{getLanguageLabel(item.language)}</Badge>,
      width: '100px',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item: any) => getStatusBadge(item.status),
      width: '100px',
      sortable: true,
    },
    {
      id: 'date',
      header: 'Created',
      accessor: (item: any) => <span className="text-sm text-secondary-600">{formatDate(item.createdAt)}</span>,
      width: '120px',
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (item: any) => (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            {menuItems.map(i => (
              <DropdownMenu.Item key={i.id} onClick={() => handleMenuAction(i.id, item)} disabled={i.disabled}>
                <div className="flex items-center gap-2">{i.icon}{i.label}</div>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      ),
      width: '80px',
    },
  ];
  
  const totalRequests = analysisRequests.length;
  const pendingRequests = analysisRequests.filter(r => r.status === 'pending').length;
  const processingRequests = analysisRequests.filter(r => r.status === 'processing').length;
  const completedRequests = analysisRequests.filter(r => r.status === 'completed').length;
  
  if (mode === 'rejection' || mode === 'website' || mode === 'document') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <div>
              <h2 className="text-xl font-bold text-primary-900">{mode === 'rejection' ? 'Rejection Analysis' : mode === 'website' ? 'Website Analysis' : 'Document Analysis'}</h2>
              <p className="text-secondary-600 mt-1">Upload or provide details for AI analysis</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleBack}><X className="h-4 w-4" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-150px)] overflow-y-auto">
            {uploadProgress > 0 ? (
              <div className="space-y-4"><Progress value={uploadProgress} /><div className="text-center text-secondary-600">Processing... {uploadProgress}%</div></div>
            ) : (
              <div className="space-y-4">
                {mode === 'website' ? (
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Website URL *</label>
                    <Input value={formData.url || ''} onChange={(e) => handleChange('url', e.target.value)} placeholder="https://example.com" prefix={<Globe className="h-4 w-4 text-secondary-400" />} required />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">Upload File</label>
                    <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center">
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={mode === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt'} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-primary-400" />
                        <span className="text-primary-700 font-medium">{formData.file ? formData.file.name : 'Upload File'}</span>
                        <span className="text-xs text-secondary-500">{mode === 'image' ? 'Images only' : 'PDF, DOC, DOCX, TXT'}</span>
                      </button>
                    </div>
                    {formData.file && <div className="mt-2 text-sm text-secondary-600">Selected: {formData.file.name} ({formatFileSize(formData.file.size)})</div>}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Title *</label>
                  <Input value={formData.title || ''} onChange={(e) => handleChange('title', e.target.value)} placeholder={`Title for ${mode} analysis`} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Description</label>
                  <Textarea value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} placeholder="Brief description" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">Language</label>
                  <Select value={formData.language || 'bn'} onValueChange={(v) => handleChange('language', v)}>
                    {languageOptions.map(lang => <Select.Option key={lang.value} value={lang.value}>{lang.label}</Select.Option>)}
                  </Select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t border-secondary-200">
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading || (mode === 'website' && !formData.url) || (mode !== 'website' && !formData.file && !formData.title)}>
                {isLoading ? <><div className="animate-spin h-4 w-4 mr-2" />Processing...</> : <><Brain className="h-4 w-4 mr-1" />Start Analysis</>}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2"><Brain className="h-6 w-6" />AI Analysis</h1>
            <p className="text-secondary-600 mt-1">Analyze rejection letters, websites, documents, emails, and images</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBulkActionsSheet(true)} disabled={selectedRequests.length === 0}><Upload className="h-4 w-4 mr-1" />Bulk ({selectedRequests.length})</Button>
            <Button size="sm" onClick={() => handleNewRequest('rejection')}><XCircle className="h-4 w-4 mr-1" />Analyze Rejection</Button>
          </div>
        </div>
      </motion.div>
      
      {error && <Alert variant="error" onDismiss={clearError} className="mb-4">{error}</Alert>}
      
      <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleNewRequest('rejection')}>
          <XCircle className="h-6 w-6 text-red-500" /><span className="text-sm font-medium">Rejection</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleNewRequest('website')}>
          <Globe className="h-6 w-6 text-blue-500" /><span className="text-sm font-medium">Website</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleNewRequest('document')}>
          <FileText className="h-6 w-6 text-purple-500" /><span className="text-sm font-medium">Document</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleNewRequest('email')}>
          <Mail className="h-6 w-6 text-orange-500" /><span className="text-sm font-medium">Email</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2" onClick={() => handleNewRequest('image')}>
          <Image className="h-6 w-6 text-green-500" /><span className="text-sm font-medium">Image</span>
        </Button>
      </motion.div>
      
      <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4" variant="glass"><div className="flex items-center gap-3"><div className="p-3 bg-primary-100 rounded-lg"><Brain className="h-6 w-6 text-primary-600" /></div><div><div className="text-2xl font-bold text-primary-900">{totalRequests}</div><div className="text-sm text-secondary-600">Total</div></div></div></Card>
        <Card className="p-4" variant="glass"><div className="flex items-center gap-3"><div className="p-3 bg-secondary-100 rounded-lg"><Clock className="h-6 w-6 text-secondary-600" /></div><div><div className="text-2xl font-bold text-secondary-900">{pendingRequests}</div><div className="text-sm text-secondary-600">Pending</div></div></div></Card>
        <Card className="p-4" variant="glass"><div className="flex items-center gap-3"><div className="p-3 bg-yellow-100 rounded-lg"><Sparkles className="h-6 w-6 text-yellow-600" /></div><div><div className="text-2xl font-bold text-yellow-600">{processingRequests}</div><div className="text-sm text-secondary-600">Processing</div></div></div></Card>
        <Card className="p-4" variant="glass"><div className="flex items-center gap-3"><div className="p-3 bg-green-100 rounded-lg"><CheckCircle className="h-6 w-6 text-green-600" /></div><div><div className="text-2xl font-bold text-green-600">{completedRequests}</div><div className="text-sm text-secondary-600">Completed</div></div></div></Card>
      </motion.div>
      
      <Card className="p-4 mb-6" variant="bordered">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" /><Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)} placeholder="Type"><Select.Option value="all">All Types</Select.Option>{analysisTypeOptions.map(t => <Select.Option key={t.value} value={t.value}>{t.label}</Select.Option>)}</Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} placeholder="Status">{statusOptions.map(s => <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>)}</Select>
        </div>
        <div className="mt-4"><Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setTypeFilter('all'); setStatusFilter('all'); }}><X className="h-4 w-4 mr-1" />Clear</Button></div>
      </Card>
      
      <Card className="p-4" variant="bordered">
        <div className="overflow-x-auto">
          <Table>
            <Table.Header><TableRow>{columns.map(column => <TableHeaderCell key={column.id} width={column.width} onClick={() => column.sortable && handleSort(column.id)} className={cn(column.sortable && 'cursor-pointer select-none hover:bg-secondary-50', column.id === 'select' && 'w-[50px]')}><div className="flex items-center gap-1">{column.header}{column.sortable && getSortIndicator(column.id)}</div></TableHeaderCell>)}</TableRow></Table.Header>
            <Table.Body>
              {isLoading ? Array.from({ length: itemsPerPage }).map((_, i) => <TableRow key={i}>{columns.map(c => <TableCell key={c.id}><Skeleton className="h-4 w-full rounded" /></TableCell>)}</TableRow>) : paginatedRequests.length > 0 ? paginatedRequests.map(request => <TableRow key={request.id} className="hover:bg-secondary-50/50">{columns.map(column => <TableCell key={column.id} width={column.width}>{column.accessor(request)}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className="text-center py-8"><div className="flex flex-col items-center gap-4"><Brain className="h-12 w-12 text-secondary-300" /><div className="text-secondary-500">No analysis requests found</div><Button variant="outline" size="sm" onClick={() => handleNewRequest('rejection')}><Brain className="h-4 w-4 mr-1" />Start Analysis</Button></div></TableCell></TableRow>}
            </Table.Body>
          </Table>
        </div>
        {paginatedRequests.length > 0 && <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-200"><div className="text-sm text-secondary-600">Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length}</div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" />Previous</Button><span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span><Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next<ChevronRight className="h-4 w-4" /></Button></div></div>}
      </Card>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent><DialogContent.Header><DialogContent.Title>Delete Analysis</DialogContent.Title><DialogContent.Description>Are you sure? This cannot be undone.</DialogContent.Description></DialogContent.Header><DialogActions><Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button><Button variant="danger" onClick={() => deletingId && handleDelete(deletingId)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button></DialogActions></DialogContent>
      </Dialog>
      
      <Sheet open={showBulkActionsSheet} onOpenChange={setShowBulkActionsSheet}>
        <SheetContent side="right" className="w-80"><SheetContent.Header><SheetContent.Title>Bulk Actions</SheetContent.Title><SheetContent.Description>Actions on {selectedRequests.length} requests</SheetContent.Description></SheetContent.Header><div className="py-4 space-y-2">{bulkMenuItems.map(item => <Button key={item.id} variant="ghost" size="lg" className="w-full justify-start gap-3" onClick={() => handleBulkMenuAction(item.id)} disabled={item.disabled}>{item.icon}{item.label}</Button>)}</div></SheetContent>
      </Sheet>
      
      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent side="right" className="w-full max-w-2xl">
          <SheetContent.Header><SheetContent.Title>Analysis Results</SheetContent.Title></SheetContent.Header>
          {viewingRequest && <div className="py-4 space-y-6">
            <Card variant="bordered" className="p-4"><h3 className="font-semibold mb-4">Request Info</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><div className="text-sm text-secondary-600 mb-1">Title</div><div className="font-medium">{viewingRequest.title}</div></div>
              <div><div className="text-sm text-secondary-600 mb-1">Type</div>{getTypeBadge(viewingRequest.type)}</div>
              <div><div className="text-sm text-secondary-600 mb-1">Status</div>{getStatusBadge(viewingRequest.status)}</div>
              <div><div className="text-sm text-secondary-600 mb-1">Language</div><Badge variant="primary">{getLanguageLabel(viewingRequest.language)}</Badge></div>
              <div><div className="text-sm text-secondary-600 mb-1">Created</div><div className="font-medium">{formatDate(viewingRequest.createdAt)}</div></div>
              <div><div className="text-sm text-secondary-600 mb-1">Updated</div><div className="font-medium">{formatDate(viewingRequest.updatedAt)}</div></div>
              {viewingRequest.fileName && <div><div className="text-sm text-secondary-600 mb-1">File</div><div className="font-medium">{viewingRequest.fileName}</div></div>}
              {viewingRequest.description && <div className="mt-4 pt-4 border-t border-secondary-200"><div className="text-sm text-secondary-600 mb-1">Description</div><p className="text-secondary-700">{viewingRequest.description}</p></div>}
            </div></Card>
            {viewingRequest.result ? <Card variant="bordered" className="p-4"><h3 className="font-semibold mb-4">Results</h3><div className="p-4 bg-secondary-50 rounded-lg"><pre className="text-sm whitespace-pre-wrap">{JSON.stringify(viewingRequest.result, null, 2)}</pre></div></Card> : <Card variant="bordered" className="p-4"><div className="text-center py-8"><Brain className="h-12 w-12 mx-auto text-secondary-400 mb-4" /><div className="text-secondary-500">{viewingRequest.status === 'pending' ? 'Pending' : viewingRequest.status === 'processing' ? 'Processing' : 'No results'}</div></div></Card>}
            <div className="flex gap-2"><Button variant="outline" onClick={handleBack}>Back</Button>{viewingRequest.status === 'completed' && <Button variant="outline" onClick={() => { const blob = new Blob([JSON.stringify(viewingRequest.result, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${viewingRequest.title.replace(/\s+/g, '_')}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}><Download className="h-4 w-4 mr-1" />Export</Button>}<Button onClick={() => { setEditingRequest(viewingRequest); setFormData(viewingRequest); setShowFormSheet(true); setShowDetailSheet(false); }}><Edit className="h-4 w-4 mr-1" />Edit</Button></div>
          </div>}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AnalysisPage;
