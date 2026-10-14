import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, generateId, generateReferenceNumber, formatDate } from '@/lib/utils';
import { APP_CONFIG, VISA_TYPES, LEAD_SOURCE_CONFIG, LEAD_STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
import { useApp } from '@/App';
import {
  Button, Card, Input, Select, Badge, Alert, Skeleton, Dialog,
  DialogActions, DialogContent, Sheet, SheetContent, Table,
  TableCell, TableHeaderCell, TableRow, Progress, DropdownMenu,
  DropdownMenuItem as DropdownMenuItemType, Textarea, Avatar
} from '@/components/ui';
import {
  Users, Search, MoreVertical, Eye, Edit, Trash2, Phone, Mail,
  Calendar, Clock, ChevronLeft, ChevronRight, Upload, Plus,
  X, SortAsc, SortDesc, UserPlus, Filter, Tag
} from 'lucide-react';
import type { Lead, VisaType, PaginationParams, PaginatedResponse } from '@/types';

const sampleLeads: Lead[] = [
  {
    id: '1',
    name: 'Rahim Mia',
    email: 'rahim.mia@email.com',
    phone: '+8801712345678',
    visaType: 'work',
    targetCountry: 'saudi-arabia',
    message: 'Interested in work visa for Saudi Arabia. Need guidance on requirements.',
    source: 'phone',
    status: 'interested',
    priority: 'high',
    assignedTo: 'Agent 1',
    followUpDate: '2024-02-01',
    notes: 'Called on 25 Jan, very serious about moving',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:05:00Z',
  },
  {
    id: '2',
    name: 'Fatema Akter',
    email: 'fatema.akter@email.com',
    phone: '+8801812345678',
    visaType: 'student',
    targetCountry: 'uk',
    message: 'Want to study in UK. Need help with university selection and visa process.',
    source: 'website',
    status: 'new',
    priority: 'medium',
    assignedTo: '',
    followUpDate: '',
    notes: 'Submitted contact form',
    createdAt: '2024-01-24T14:00:00Z',
    updatedAt: '2024-01-24T14:00:00Z',
  },
  {
    id: '3',
    name: 'Mohammad Ali',
    email: 'm.ali@company.com',
    phone: '+8801912345678',
    visaType: 'business',
    targetCountry: 'uae',
    message: 'Looking for business visa to attend conference in Dubai.',
    source: 'email',
    status: 'contacted',
    priority: 'low',
    assignedTo: 'Agent 2',
    followUpDate: '2024-01-30',
    notes: 'Emailed with conference details',
    createdAt: '2024-01-23T09:00:00Z',
    updatedAt: '2024-01-23T09:15:00Z',
  },
  {
    id: '4',
    name: 'Sara Begum',
    email: 'sara.begum@email.com',
    phone: '+8801612345678',
    visaType: 'tourist',
    targetCountry: 'malaysia',
    message: 'Family trip to Malaysia. Need visa for 4 family members.',
    source: 'referral',
    status: 'interested',
    priority: 'medium',
    assignedTo: 'Agent 1',
    followUpDate: '2024-02-05',
    notes: 'Referred by existing client',
    createdAt: '2024-01-22T11:00:00Z',
    updatedAt: '2024-01-22T11:05:00Z',
  },
  {
    id: '5',
    name: 'Ahmed Hossain',
    email: 'ahmed.hossain@email.com',
    phone: '+8801512345678',
    visaType: 'work',
    targetCountry: 'qatar',
    message: 'Job offer from Qatar company. Need work visa processing.',
    source: 'social',
    status: 'converted',
    priority: 'urgent',
    assignedTo: 'Agent 3',
    followUpDate: '',
    notes: 'Converted to client on 20 Jan',
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
  },
];

const visaTypeOptions = VISA_TYPES.map(v => ({ value: v.id, label: v.label.en }));
const countryOptions = [{ value: 'usa', label: 'United States' }, { value: 'uk', label: 'United Kingdom' }, { value: 'canada', label: 'Canada' }, { value: 'australia', label: 'Australia' }, { value: 'saudi-arabia', label: 'Saudi Arabia' }, { value: 'uae', label: 'UAE' }, { value: 'malaysia', label: 'Malaysia' }];
const sourceOptions = Object.entries(LEAD_SOURCE_CONFIG).map(([k, v]) => ({ value: k, label: v.label.en }));
const statusOptions = Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label.en }));
const priorityOptions = Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label.en }));
const assignedToOptions = [{ value: '', label: 'Unassigned' }, { value: 'Agent 1', label: 'Agent 1' }, { value: 'Agent 2', label: 'Agent 2' }, { value: 'Agent 3', label: 'Agent 3' }];

export interface LeadsPageProps {
  mode?: 'list' | 'new' | 'edit' | 'view';
}

export const LeadsPage: React.FC<LeadsPageProps> = ({ mode = 'list' }) => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>(sampleLeads);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '', email: '', phone: '', visaType: 'tourist', targetCountry: 'usa',
    message: '', source: 'phone', status: 'new', priority: 'medium',
    assignedTo: '', followUpDate: '', notes: '',
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'priority' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkActionsSheet, setShowBulkActionsSheet] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setLeads(sampleLeads);
      setFilteredLeads(sampleLeads);
      setIsLoading(false);
    };
    loadData();
  }, []);
  
  useEffect(() => {
    let result = [...leads];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(query) || l.email.toLowerCase().includes(query) ||
        l.phone.includes(query) || l.message.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter);
    if (priorityFilter !== 'all') result = result.filter(l => l.priority === priorityFilter);
    if (sourceFilter !== 'all') result = result.filter(l => l.source === sourceFilter);
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name': return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'status': return sortOrder === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
        case 'priority': {
          const order = { urgent: 4, high: 3, medium: 2, low: 1 };
          return sortOrder === 'asc' ? (order[a.priority] || 0) - (order[b.priority] || 0) : (order[b.priority] || 0) - (order[a.priority] || 0);
        }
        default: return sortOrder === 'asc' ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    setFilteredLeads(result);
    setCurrentPage(1);
  }, [leads, searchQuery, statusFilter, priorityFilter, sourceFilter, sortBy, sortOrder]);
  
  useEffect(() => {
    if (mode === 'new') {
      setFormData({ name: '', email: '', phone: '', visaType: 'tourist', targetCountry: 'usa', message: '', source: 'phone', status: 'new', priority: 'medium', assignedTo: '', followUpDate: '', notes: '' });
      setShowFormSheet(true);
    }
  }, [mode]);
  
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const newLead: Lead = {
        id: editingLead?.id || generateId(),
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        visaType: formData.visaType || 'tourist',
        targetCountry: formData.targetCountry || 'usa',
        message: formData.message || '',
        source: formData.source || 'phone',
        status: formData.status || 'new',
        priority: formData.priority || 'medium',
        assignedTo: formData.assignedTo || '',
        followUpDate: formData.followUpDate || '',
        notes: formData.notes || '',
        createdAt: editingLead?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (editingLead) {
        setLeads(leads.map(l => l.id === editingLead.id ? newLead : l));
      } else {
        setLeads([newLead, ...leads]);
      }
      setShowFormSheet(false);
      navigate('/leads');
    } catch (err) {
      setError('Failed to save lead');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setLeads(leads.filter(l => l.id !== id));
      setShowDeleteDialog(false);
      setDeletingId(null);
    } catch (err) {
      setError('Failed to delete lead');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      setLeads(leads.filter(l => !selectedLeads.includes(l.id)));
      setSelectedLeads([]);
      setShowBulkActionsSheet(false);
    } catch (err) {
      setError('Failed to delete selected leads');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectRow = (id: string) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  const handleSelectAll = () => {
    if (selectedLeads.length === paginatedLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(paginatedLeads.map(l => l.id));
    }
  };
  
  const handleNewLead = () => navigate('/leads/new');
  const handleEditLead = (lead: Lead) => { setEditingLead(lead); setFormData(lead); setShowFormSheet(true); };
  const handleViewLead = (lead: Lead) => { setViewingLead(lead); setShowDetailSheet(true); };
  const handleBack = () => { navigate('/leads'); setShowFormSheet(false); setShowDetailSheet(false); setEditingLead(null); setViewingLead(null); };
  const clearError = () => setError(null);
  
  const getStatusBadge = (status: string) => {
    const config = LEAD_STATUS_CONFIG[status as keyof typeof LEAD_STATUS_CONFIG];
    if (!config) return <Badge variant="secondary" size="sm">{status}</Badge>;
    return <Badge variant={config.color.includes('green') ? 'success' : config.color.includes('red') ? 'danger' : config.color.includes('yellow') ? 'warning' : 'primary'} size="sm">{config.label.en}</Badge>;
  };
  
  const getPriorityBadge = (priority: string) => {
    const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
    if (!config) return <Badge variant="secondary" size="sm">{priority}</Badge>;
    return <Badge variant={config.color.includes('red') ? 'danger' : config.color.includes('orange') ? 'warning' : config.color.includes('yellow') ? 'warning' : 'primary'} size="sm">{config.label.en}</Badge>;
  };
  
  const getSourceLabel = (source: string) => {
    return LEAD_SOURCE_CONFIG[source as keyof typeof LEAD_SOURCE_CONFIG]?.label.en || source;
  };
  
  const getCountryLabel = (code: string) => countryOptions.find(c => c.value === code)?.label || code;
  const getVisaTypeLabel = (type: VisaType) => VISA_TYPES.find(v => v.id === type)?.label.en || type;
  
  const handleChange = (field: keyof Lead, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleSort = (columnId: string) => { if (sortBy === columnId) { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); } else { setSortBy(columnId as any); setSortOrder('desc'); } };
  const getSortIndicator = (columnId: string) => { if (sortBy !== columnId) return null; return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />; };
  
  const menuItems: DropdownMenuItemType[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" /> },
    { id: 'edit', label: 'Edit', icon: <Edit className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, disabled: false },
  ];
  
  const handleMenuAction = (action: string, lead: Lead) => {
    switch (action) {
      case 'view': handleViewLead(lead); break;
      case 'edit': handleEditLead(lead); break;
      case 'delete': setDeletingId(lead.id); setShowDeleteDialog(true); break;
    }
  };
  
  const bulkMenuItems: DropdownMenuItemType[] = [
    { id: 'assign', label: 'Assign to Agent', icon: <UserPlus className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete Selected', icon: <Trash2 className="h-4 w-4" />, disabled: selectedLeads.length === 0 },
  ];
  
  const handleBulkMenuAction = (action: string) => {
    switch (action) {
      case 'delete': setShowBulkActionsSheet(false); if (confirm(`Delete ${selectedLeads.length} leads?`)) handleBulkDelete(); break;
      case 'assign': setShowBulkActionsSheet(false); break;
    }
  };
  
  const columns = [
    {
      id: 'select',
      header: <input type="checkbox" checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0} onChange={handleSelectAll} />,
      accessor: (item: Lead) => <input type="checkbox" checked={selectedLeads.includes(item.id)} onChange={() => handleSelectRow(item.id)} />,
      width: '50px',
    },
    {
      id: 'name',
      header: 'Lead Name',
      accessor: (item: Lead) => <div className="font-medium text-primary-600">{item.name}</div>,
      width: '180px',
      sortable: true,
    },
    {
      id: 'contact',
      header: 'Contact',
      accessor: (item: Lead) => <div className="text-sm"><div className="flex items-center gap-1"><Mail className="h-3 w-3" />{item.email}</div><div className="flex items-center gap-1"><Phone className="h-3 w-3" />{item.phone}</div></div>,
      width: '200px',
    },
    {
      id: 'visa',
      header: 'Visa Type',
      accessor: (item: Lead) => <Badge variant="primary" size="sm">{getVisaTypeLabel(item.visaType)}</Badge>,
      width: '120px',
    },
    {
      id: 'country',
      header: 'Country',
      accessor: (item: Lead) => <span className="text-sm">{getCountryLabel(item.targetCountry)}</span>,
      width: '120px',
    },
    {
      id: 'source',
      header: 'Source',
      accessor: (item: Lead) => <Badge variant="secondary" size="sm">{getSourceLabel(item.source)}</Badge>,
      width: '100px',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item: Lead) => getStatusBadge(item.status),
      width: '100px',
      sortable: true,
    },
    {
      id: 'priority',
      header: 'Priority',
      accessor: (item: Lead) => getPriorityBadge(item.priority),
      width: '100px',
      sortable: true,
    },
    {
      id: 'assigned',
      header: 'Assigned To',
      accessor: (item: Lead) => <span className="text-sm">{item.assignedTo || 'Unassigned'}</span>,
      width: '120px',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (item: Lead) => (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            {menuItems.map(i => <DropdownMenu.Item key={i.id} onClick={() => handleMenuAction(i.id, item)} disabled={i.disabled}><div className="flex items-center gap-2">{i.icon}{i.label}</div></DropdownMenu.Item>)}
          </DropdownMenu.Content>
        </DropdownMenu>
      ),
      width: '80px',
    },
  ];
  
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const interestedLeads = leads.filter(l => l.status === 'interested').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const urgentLeads = leads.filter(l => l.priority === 'urgent').length;
  
  if (mode === 'new' || mode === 'edit') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <div><h2 className="text-xl font-bold text-primary-900">{editingLead ? 'Edit Lead' : 'New Lead'}</h2><p className="text-secondary-600 mt-1">Enter lead information</p></div>
            <Button variant="ghost" size="sm" onClick={handleBack}><X className="h-4 w-4" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-150px)] overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Name *</label><Input value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Lead name" required /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Email</label><Input value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="email@example.com" type="email" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Phone *</label><Input value={formData.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+8801712345678" required /></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Visa Type</label><Select value={formData.visaType || ''} onValueChange={(v) => handleChange('visaType', v as VisaType)}>{visaTypeOptions.map(vt => <Select.Option key={vt.value} value={vt.value}>{vt.label}</Select.Option>)}</Select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Country</label><Select value={formData.targetCountry || ''} onValueChange={(v) => handleChange('targetCountry', v)}>{countryOptions.map(c => <Select.Option key={c.value} value={c.value}>{c.label}</Select.Option>)}</Select></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Source</label><Select value={formData.source || ''} onValueChange={(v) => handleChange('source', v as any)}>{sourceOptions.map(s => <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>)}</Select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Status</label><Select value={formData.status || ''} onValueChange={(v) => handleChange('status', v as any)}>{statusOptions.map(s => <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>)}</Select></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Priority</label><Select value={formData.priority || ''} onValueChange={(v) => handleChange('priority', v as any)}>{priorityOptions.map(p => <Select.Option key={p.value} value={p.value}>{p.label}</Select.Option>)}</Select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Assign To</label><Select value={formData.assignedTo || ''} onValueChange={(v) => handleChange('assignedTo', v)}>{assignedToOptions.map(a => <Select.Option key={a.value} value={a.value}>{a.label}</Select.Option>)}</Select></div>
                <div><label className="block text-sm font-medium text-primary-700 mb-1">Follow Up Date</label><Input value={formData.followUpDate || ''} onChange={(e) => handleChange('followUpDate', e.target.value)} type="date" /></div>
              </div>
              <div><label className="block text-sm font-medium text-primary-700 mb-1">Message</label><Textarea value={formData.message || ''} onChange={(e) => handleChange('message', e.target.value)} placeholder="Lead message or inquiry" rows={3} /></div>
              <div><label className="block text-sm font-medium text-primary-700 mb-1">Notes</label><Textarea value={formData.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Additional notes" rows={3} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-secondary-200">
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading || !formData.name || !formData.phone}>
                {isLoading ? <><div className="animate-spin h-4 w-4 mr-2" />Saving...</> : <><UserPlus className="h-4 w-4 mr-1" />Save Lead</>}
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
          <div><h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2"><Users className="h-6 w-6" />Leads Management</h1><p className="text-secondary-600 mt-1">Track and manage potential clients and inquiries</p></div>
          <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setShowBulkActionsSheet(true)} disabled={selectedLeads.length === 0}><Upload className="h-4 w-4 mr-1" />Bulk ({selectedLeads.length})</Button><Button size="sm" onClick={handleNewLead}><UserPlus className="h-4 w-4 mr-1" />New Lead</Button></div>
        </div>
      </motion.div>
      
      {error && <Alert variant="error" onDismiss={clearError} className="mb-4">{error}</Alert>}
      
      <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4" variant="glass"><div className="flex items-center gap-3"><div className="p-3 bg-primary-100 rounded-lg"><Users className="h-6 w-6 text-primary-600" /></div><div><div className="text-2xl font-bold text-primary-900">{totalLeads}</div><div className="text-sm text-secondary-600">Total Leads</div></div></div></Card>
        <Card className="p-4" variant="glass"><div className="flex items-center gap-3"><div className="p-3 bg-blue-100 rounded-lg"><UserPlus className="h-6 w-6 text-blue-600" /></div><div><div className="text-2xl font-bold text-blue-600">{newLeads}</div><div className="text-sm text-secondary-600">New</div></div></div></Card>
        <Card className="p-4" variant="glass"><div className="flex items-center gap-3"><div className="p-3 bg-green-100 rounded-lg"><Tag className="h-6 w-6 text-green-600" /></div><div><div className="text-2xl font-bold text-green-600">{interestedLeads}</div><div className="text-sm text-secondary-600">Interested</div></div></div></Card>
        <Card className="p-4" variant="glass"><div className="flex items-center gap-3"><div className="p-3 bg-purple-100 rounded-lg"><Check className="h-6 w-6 text-purple-600" /></div><div><div className="text-2xl font-bold text-purple-600">{convertedLeads}</div><div className="text-sm text-secondary-600">Converted</div></div></div></Card>
      </motion.div>
      
      <Card className="p-4 mb-6" variant="bordered">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" /><Input placeholder="Search leads..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} placeholder="Status"><Select.Option value="all">All Status</Select.Option>{statusOptions.map(s => <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>)}</Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)} placeholder="Priority"><Select.Option value="all">All Priorities</Select.Option>{priorityOptions.map(p => <Select.Option key={p.value} value={p.value}>{p.label}</Select.Option>)}</Select>
          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as any)} placeholder="Source"><Select.Option value="all">All Sources</Select.Option>{sourceOptions.map(s => <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>)}</Select>
        </div>
        <div className="mt-4"><Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPriorityFilter('all'); setSourceFilter('all'); }}><X className="h-4 w-4 mr-1" />Clear</Button></div>
      </Card>
      
      <Card className="p-4" variant="bordered">
        <div className="overflow-x-auto">
          <Table>
            <Table.Header><TableRow>{columns.map(column => <TableHeaderCell key={column.id} width={column.width} onClick={() => column.sortable && handleSort(column.id)} className={cn(column.sortable && 'cursor-pointer select-none hover:bg-secondary-50', column.id === 'select' && 'w-[50px]')}><div className="flex items-center gap-1">{column.header}{column.sortable && getSortIndicator(column.id)}</div></TableHeaderCell>)}</TableRow></Table.Header>
            <Table.Body>
              {isLoading ? Array.from({ length: itemsPerPage }).map((_, i) => <TableRow key={i}>{columns.map(c => <TableCell key={c.id}><Skeleton className="h-4 w-full rounded" /></TableCell>)}</TableRow>) : paginatedLeads.length > 0 ? paginatedLeads.map(lead => <TableRow key={lead.id} className="hover:bg-secondary-50/50">{columns.map(column => <TableCell key={column.id} width={column.width}>{column.accessor(lead)}</TableCell>)}</TableRow>) : <TableRow><TableCell colSpan={columns.length} className="text-center py-8"><div className="flex flex-col items-center gap-4"><Users className="h-12 w-12 text-secondary-300" /><div className="text-secondary-500">No leads found</div><Button variant="outline" size="sm" onClick={handleNewLead}><UserPlus className="h-4 w-4 mr-1" />Add First Lead</Button></div></TableCell></TableRow>}
            </Table.Body>
          </Table>
        </div>
        {paginatedLeads.length > 0 && <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-200"><div className="text-sm text-secondary-600">Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length}</div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" />Previous</Button><span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span><Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next<ChevronRight className="h-4 w-4" /></Button></div></div>}
      </Card>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent><DialogContent.Header><DialogContent.Title>Delete Lead</DialogContent.Title><DialogContent.Description>Are you sure? This cannot be undone.</DialogContent.Description></DialogContent.Header><DialogActions><Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button><Button variant="danger" onClick={() => deletingId && handleDelete(deletingId)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button></DialogActions></DialogContent>
      </Dialog>
      
      <Sheet open={showBulkActionsSheet} onOpenChange={setShowBulkActionsSheet}>
        <SheetContent side="right" className="w-80"><SheetContent.Header><SheetContent.Title>Bulk Actions</SheetContent.Title><SheetContent.Description>Actions on {selectedLeads.length} leads</SheetContent.Description></SheetContent.Header><div className="py-4 space-y-2">{bulkMenuItems.map(item => <Button key={item.id} variant="ghost" size="lg" className="w-full justify-start gap-3" onClick={() => handleBulkMenuAction(item.id)} disabled={item.disabled}>{item.icon}{item.label}</Button>)}</div></SheetContent>
      </Sheet>
      
      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent side="right" className="w-full max-w-2xl">
          <SheetContent.Header><SheetContent.Title>Lead Details</SheetContent.Title></SheetContent.Header>
          {viewingLead && <div className="py-4 space-y-6">
            <Card variant="bordered" className="p-4"><h3 className="font-semibold mb-4">Lead Information</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><div className="text-sm text-secondary-600 mb-1">Name</div><div className="font-medium">{viewingLead.name}</div></div>
              <div><div className="text-sm text-secondary-600 mb-1">Status</div>{getStatusBadge(viewingLead.status)}</div>
              <div><div className="text-sm text-secondary-600 mb-1">Email</div><div className="font-medium">{viewingLead.email}</div></div>
              <div><div className="text-sm text-secondary-600 mb-1">Priority</div>{getPriorityBadge(viewingLead.priority)}</div>
              <div><div className="text-sm text-secondary-600 mb-1">Phone</div><div className="font-medium">{viewingLead.phone}</div></div>
              <div><div className="text-sm text-secondary-600 mb-1">Assigned To</div><Badge variant="primary">{viewingLead.assignedTo || 'Unassigned'}</Badge></div>
              <div><div className="text-sm text-secondary-600 mb-1">Visa Type</div><Badge variant="primary">{getVisaTypeLabel(viewingLead.visaType)}</Badge></div>
              <div><div className="text-sm text-secondary-600 mb-1">Country</div><span className="font-medium">{getCountryLabel(viewingLead.targetCountry)}</span></div>
              <div><div className="text-sm text-secondary-600 mb-1">Source</div><Badge variant="secondary">{getSourceLabel(viewingLead.source)}</Badge></div>
              <div><div className="text-sm text-secondary-600 mb-1">Follow Up</div><span className="font-medium">{viewingLead.followUpDate || 'N/A'}</span></div>
            </div></Card>
            {viewingLead.message && <Card variant="bordered" className="p-4"><h3 className="font-semibold mb-4">Message</h3><p className="text-secondary-700">{viewingLead.message}</p></Card>}
            {viewingLead.notes && <Card variant="bordered" className="p-4"><h3 className="font-semibold mb-4">Notes</h3><p className="text-secondary-700">{viewingLead.notes}</p></Card>}
            <Card variant="bordered" className="p-4"><h3 className="font-semibold mb-4">Metadata</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><div className="text-sm text-secondary-600 mb-1">Created</div><div className="font-medium">{formatDate(viewingLead.createdAt)}</div></div>
              <div><div className="text-sm text-secondary-600 mb-1">Updated</div><div className="font-medium">{formatDate(viewingLead.updatedAt)}</div></div>
            </div></Card>
            <div className="flex gap-2"><Button variant="outline" onClick={handleBack}>Back</Button><Button onClick={() => handleEditLead(viewingLead)}><Edit className="h-4 w-4 mr-1" />Edit</Button></div>
          </div>}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LeadsPage;
