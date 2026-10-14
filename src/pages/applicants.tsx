import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, generateId, generateReferenceNumber, formatDate, getFromStorage, setToStorage, STORAGE_KEYS, getCountryById, getVisaTypeLabel } from '@/lib/utils';
import { APP_CONFIG, COUNTRIES, VISA_TYPES, DEFAULTS } from '@/lib/constants';
import { useApp } from '@/App';
import { 
  Button, 
  Card, 
  Input, 
  Select,
  Badge,
  Alert,
  Skeleton,
  SkeletonText,
  Dialog,
  DialogActions,
  DialogContent,
  Sheet,
  SheetContent,
  Tabs,
  Table,
  TableCell,
  TableHeaderCell,
  TableRow,
  Progress,
  Avatar,
  DropdownMenu,
  DropdownMenuItem as DropdownMenuItemType,
  DropdownMenuSeparator
} from '@/components/ui';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Upload,
  Camera,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Flag,
  Copy
} from 'lucide-react';
import { generateApplicantProfilePDF } from '@/lib/pdf';
import type { Applicant, VisaType, Country, PaginationParams, PaginatedResponse } from '@/types';

// Sample data for applicants
const sampleApplicants: Applicant[] = [
  {
    id: '1',
    referenceNumber: 'VISA-2024-001',
    firstName: 'Mohammad',
    lastName: 'Rahman',
    bengaliName: 'মোহাম্মদ রহমান',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    nationality: 'Bangladesh',
    passportNumber: 'A12345678',
    passportExpiry: '2026-05-15',
    passportIssueDate: '2016-05-15',
    email: 'm.rahman@example.com',
    phone: '+8801712345678',
    address: '123 Main Street',
    city: 'Dhaka',
    country: 'Bangladesh',
    postalCode: '1200',
    photo: '',
    signature: '',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    status: 'active',
  },
  {
    id: '2',
    referenceNumber: 'VISA-2024-002',
    firstName: 'Fatema',
    lastName: 'Khatun',
    bengaliName: 'ফাতেমা খাতুন',
    dateOfBirth: '1995-08-22',
    gender: 'female',
    nationality: 'Bangladesh',
    passportNumber: 'B87654321',
    passportExpiry: '2027-08-22',
    passportIssueDate: '2017-08-22',
    email: 'fatema.khatun@example.com',
    phone: '+8801812345678',
    address: '456 Side Road',
    city: 'Chittagong',
    country: 'Bangladesh',
    postalCode: '4200',
    photo: '',
    signature: '',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
    status: 'active',
  },
  {
    id: '3',
    referenceNumber: 'VISA-2024-003',
    firstName: 'Ahmed',
    lastName: 'Hossain',
    bengaliName: 'আহমেদ হোসেন',
    dateOfBirth: '1985-11-30',
    gender: 'male',
    nationality: 'Bangladesh',
    passportNumber: 'C13579246',
    passportExpiry: '2025-11-30',
    passportIssueDate: '2015-11-30',
    email: 'ahmed.hossain@example.com',
    phone: '+8801912345678',
    address: '789 North Avenue',
    city: 'Sylhet',
    country: 'Bangladesh',
    postalCode: '3100',
    photo: '',
    signature: '',
    createdAt: '2024-01-05T14:20:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
    status: 'inactive',
  },
  {
    id: '4',
    referenceNumber: 'VISA-2024-004',
    firstName: 'Sara',
    lastName: 'Islam',
    bengaliName: 'সারা ইসলাম',
    dateOfBirth: '2000-03-10',
    gender: 'female',
    nationality: 'Bangladesh',
    passportNumber: 'D24681357',
    passportExpiry: '2028-03-10',
    passportIssueDate: '2018-03-10',
    email: 'sara.islam@example.com',
    phone: '+8801612345678',
    address: '321 South Boulevard',
    city: 'Khulna',
    country: 'Bangladesh',
    postalCode: '9000',
    photo: '',
    signature: '',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-08T10:15:00Z',
    status: 'active',
  },
  {
    id: '5',
    referenceNumber: 'VISA-2024-005',
    firstName: 'Rajib',
    lastName: 'Chowdhury',
    bengaliName: 'রাজিব চৌধুরী',
    dateOfBirth: '1992-07-18',
    gender: 'male',
    nationality: 'Bangladesh',
    passportNumber: 'E78912345',
    passportExpiry: '2026-07-18',
    passportIssueDate: '2017-07-18',
    email: 'rajib.chowdhury@example.com',
    phone: '+8801512345678',
    address: '654 East Street',
    city: 'Rajshahi',
    country: 'Bangladesh',
    postalCode: '6000',
    photo: '',
    signature: '',
    createdAt: '2023-12-28T13:45:00Z',
    updatedAt: '2024-01-02T10:30:00Z',
    status: 'active',
  },
];

export interface ApplicantsPageProps {
  mode?: 'list' | 'new' | 'edit' | 'view';
}

export const ApplicantsPage: React.FC<ApplicantsPageProps> = ({
  mode = 'list',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const { language } = useApp();
  
  // State for applicants
  const [applicants, setApplicants] = useState<Applicant[]>(sampleApplicants);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>(sampleApplicants);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Applicant>>({
    firstName: '',
    lastName: '',
    bengaliName: '',
    dateOfBirth: '',
    gender: 'male',
    nationality: 'Bangladesh',
    passportNumber: '',
    passportExpiry: '',
    passportIssueDate: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Bangladesh',
    postalCode: '',
    status: 'active',
  });
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blacklisted'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'reference'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Dialog and Sheet states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkActionsSheet, setShowBulkActionsSheet] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [viewingApplicant, setViewingApplicant] = useState<Applicant | null>(null);
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setApplicants(sampleApplicants);
        setFilteredApplicants(sampleApplicants);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load applicants');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter applicants
  useEffect(() => {
    let result = [...applicants];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(applicant =>
        applicant.firstName.toLowerCase().includes(query) ||
        applicant.lastName.toLowerCase().includes(query) ||
        applicant.bengaliName?.toLowerCase().includes(query) ||
        applicant.referenceNumber.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.phone.includes(query) ||
        applicant.passportNumber.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(applicant => applicant.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc'
            ? `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
            : `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        case 'reference':
          return sortOrder === 'asc'
            ? a.referenceNumber.localeCompare(b.referenceNumber)
            : b.referenceNumber.localeCompare(a.referenceNumber);
        case 'date':
        default:
          return sortOrder === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    setFilteredApplicants(result);
    setCurrentPage(1);
  }, [applicants, searchQuery, statusFilter, sortBy, sortOrder]);
  
  // Handle edit
  useEffect(() => {
    if (mode === 'edit' && params.id) {
      const applicant = applicants.find(a => a.id === params.id);
      if (applicant) {
        setEditingApplicant(applicant);
        setFormData(applicant);
        setShowFormSheet(true);
      }
    } else if (mode === 'new') {
      setFormData({
        firstName: '',
        lastName: '',
        bengaliName: '',
        dateOfBirth: '',
        gender: 'male',
        nationality: 'Bangladesh',
        passportNumber: '',
        passportExpiry: '',
        passportIssueDate: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: 'Bangladesh',
        postalCode: '',
        status: 'active',
      });
      setEditingApplicant(null);
      setShowFormSheet(true);
    }
  }, [mode, params.id, applicants]);
  
  // Pagination
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const newApplicant: Applicant = {
        id: editingApplicant?.id || generateId(),
        referenceNumber: editingApplicant?.referenceNumber || generateReferenceNumber('APP'),
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        bengaliName: formData.bengaliName || '',
        dateOfBirth: formData.dateOfBirth || '',
        gender: formData.gender || 'male',
        nationality: formData.nationality || 'Bangladesh',
        passportNumber: formData.passportNumber || '',
        passportExpiry: formData.passportExpiry || '',
        passportIssueDate: formData.passportIssueDate || '',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        city: formData.city || '',
        country: formData.country || 'Bangladesh',
        postalCode: formData.postalCode || '',
        photo: formData.photo || '',
        signature: formData.signature || '',
        createdAt: editingApplicant?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: formData.status || 'active',
      };
      
      if (editingApplicant) {
        // Update existing
        setApplicants(applicants.map(a => a.id === editingApplicant.id ? newApplicant : a));
      } else {
        // Add new
        setApplicants([newApplicant, ...applicants]);
      }
      
      setShowFormSheet(false);
      navigate('/applicants');
      
    } catch (err) {
      setError('Failed to save applicant');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setApplicants(applicants.filter(a => a.id !== id));
      setShowDeleteDialog(false);
      setDeletingId(null);
    } catch (err) {
      setError('Failed to delete applicant');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      setApplicants(applicants.filter(a => !selectedApplicants.includes(a.id)));
      setSelectedApplicants([]);
      setShowBulkActionsSheet(false);
    } catch (err) {
      setError('Failed to delete selected applicants');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle row selection
  const handleSelectRow = (id: string) => {
    setSelectedApplicants(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  // Handle select all
  const handleSelectAll = () => {
    if (selectedApplicants.length === paginatedApplicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(paginatedApplicants.map(a => a.id));
    }
  };
  
  // Calculate age
  const getAge = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };
  
  // Get passport status
  const getPassportStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { status: 'expired', color: 'red' };
    if (daysLeft < 90) return { status: 'expiring', color: 'yellow' };
    return { status: 'valid', color: 'green' };
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'blacklisted': return 'bg-red-100 text-red-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };
  
  // Format phone
  const formatPhone = (phone: string) => {
    if (!phone) return '';
    // Bangladesh phone format
    if (phone.startsWith('+880')) {
      return phone.replace('+880', '').replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
  };
  
  // Generate PDF
  const handleGeneratePDF = async (applicant: Applicant) => {
    try {
      setIsLoading(true);
      const pdf = await generateApplicantProfilePDF(applicant);
      // Download the PDF
      const link = document.createElement('a');
      link.href = pdf.content;
      link.download = `Applicant_Profile_${applicant.referenceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to generate PDF');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigation handlers
  const handleNewApplicant = () => {
    navigate('/applicants/new');
  };
  
  const handleEditApplicant = (applicant: Applicant) => {
    navigate(`/applicants/${applicant.id}/edit`);
  };
  
  const handleViewApplicant = (applicant: Applicant) => {
    setViewingApplicant(applicant);
    setShowDetailSheet(true);
  };
  
  const handleBack = () => {
    navigate('/applicants');
    setShowFormSheet(false);
    setShowDetailSheet(false);
    setEditingApplicant(null);
    setViewingApplicant(null);
  };
  
  // Clear error
  const clearError = () => {
    setError(null);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    },
  };
  
  // Menu items
  const menuItems: DropdownMenuItemType[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" /> },
    { id: 'edit', label: 'Edit', icon: <Edit className="h-4 w-4" /> },
    { id: 'pdf', label: 'Generate PDF', icon: <FileText className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, disabled: false },
  ];
  
  const handleMenuAction = (action: string, applicant: Applicant) => {
    switch (action) {
      case 'view':
        handleViewApplicant(applicant);
        break;
      case 'edit':
        handleEditApplicant(applicant);
        break;
      case 'pdf':
        handleGeneratePDF(applicant);
        break;
      case 'delete':
        setDeletingId(applicant.id);
        setShowDeleteDialog(true);
        break;
    }
  };
  
  // Bulk menu items
  const bulkMenuItems: DropdownMenuItemType[] = [
    { id: 'export', label: 'Export Selected', icon: <Download className="h-4 w-4" /> },
    { id: 'pdf', label: 'Generate PDFs', icon: <FileText className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete Selected', icon: <Trash2 className="h-4 w-4" />, disabled: selectedApplicants.length === 0 },
  ];
  
  const handleBulkMenuAction = (action: string) => {
    switch (action) {
      case 'delete':
        setShowBulkActionsSheet(false);
        if (confirm(`Are you sure you want to delete ${selectedApplicants.length} applicants?`)) {
          handleBulkDelete();
        }
        break;
      case 'export':
        // Handle export
        break;
      case 'pdf':
        // Handle bulk PDF
        break;
    }
    setShowBulkActionsSheet(false);
  };
  
  // Country options
  const countryOptions = COUNTRIES.map(c => ({ value: c.id, label: c.name }));
  
  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];
  
  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'blacklisted', label: 'Blacklisted' },
  ];
  
  // Nationality options
  const nationalityOptions = [
    { value: 'Bangladesh', label: 'Bangladesh' },
    { value: 'India', label: 'India' },
    { value: 'Pakistan', label: 'Pakistan' },
    { value: 'Sri Lanka', label: 'Sri Lanka' },
    { value: 'Nepal', label: 'Nepal' },
    { value: 'Other', label: 'Other' },
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date Created' },
    { value: 'reference', label: 'Reference Number' },
  ];
  
  // Status filter options
  const statusFilterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'blacklisted', label: 'Blacklisted' },
  ];
  
  return (
    <div className="min-h-screen bg-secondary-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            {mode !== 'list' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Back
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                {mode === 'new' ? 'New Applicant' : mode === 'edit' ? 'Edit Applicant' : mode === 'view' ? 'Applicant Details' : 'Applicants'}
              </h1>
              <p className="text-secondary-500 mt-1">
                {mode === 'list' ? `Manage ${applicants.length} applicants` : 
                 mode === 'new' ? 'Register a new applicant' :
                 mode === 'edit' ? 'Update applicant information' :
                 'View applicant details'}
              </p>
            </div>
          </div>
          
          {mode === 'list' && (
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <Input
                  placeholder="Search applicants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <Select
                options={statusFilterOptions}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive' | 'blacklisted')}
                className="w-40"
              />
              <Button
                onClick={handleNewApplicant}
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                New Applicant
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBulkActionsSheet(true)}
                leftIcon={<Filter className="h-4 w-4" />}
                disabled={selectedApplicants.length === 0}
              >
                Bulk Actions
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          onClose={clearError}
          className="mb-6"
        >
          {error}
        </Alert>
      )}

      {/* List Mode */}
      {mode === 'list' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div variants={itemVariants}>
              <Card variant="bordered" padding="md">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary-50">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary-900">{applicants.length}</p>
                    <p className="text-sm text-secondary-500">Total Applicants</p>
                  </div>
                </div>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card variant="bordered" padding="md">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-50">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary-900">
                      {applicants.filter(a => a.status === 'active').length}
                    </p>
                    <p className="text-sm text-secondary-500">Active</p>
                  </div>
                </div>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Card variant="bordered" padding="md">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-50">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary-900">
                      {applicants.filter(a => a.status === 'inactive').length}
                    </p>
                    <p className="text-sm text-secondary-500">Inactive</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Table */}
          <motion.div variants={itemVariants}>
            <Card variant="bordered" padding="none">
              <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select
                    options={sortOptions}
                    value={sortBy}
                    onChange={(value) => setSortBy(value as 'name' | 'date' | 'reference')}
                    size="sm"
                    className="w-40"
                  />
                  <Select
                    options={[
                      { value: 'asc', label: 'Ascending' },
                      { value: 'desc', label: 'Descending' },
                    ]}
                    value={sortOrder}
                    onChange={(value) => setSortOrder(value as 'asc' | 'desc')}
                    size="sm"
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-secondary-500">
                    {selectedApplicants.length} selected
                  </span>
                </div>
              </div>
              
              <Table
                columns={[
                  {
                    id: 'select',
                    header: (
                      <input
                        type="checkbox"
                        checked={selectedApplicants.length === paginatedApplicants.length && paginatedApplicants.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-secondary-300"
                      />
                    ),
                    accessor: (item: Applicant) => (
                      <input
                        type="checkbox"
                        checked={selectedApplicants.includes(item.id)}
                        onChange={() => handleSelectRow(item.id)}
                        className="h-4 w-4 rounded border-secondary-300"
                      />
                    ),
                    width: '50px',
                    sortable: false,
                  },
                  {
                    id: 'reference',
                    header: 'Reference No.',
                    accessor: (item: Applicant) => (
                      <div className="font-medium text-primary-600">
                        {item.referenceNumber}
                      </div>
                    ),
                    width: '150px',
                    sortable: true,
                  },
                  {
                    id: 'name',
                    header: 'Name',
                    accessor: (item: Applicant) => (
                      <div>
                        <p className="font-medium">{item.firstName} {item.lastName}</p>
                        {item.bengaliName && (
                          <p className="text-xs text-secondary-500">{item.bengaliName}</p>
                        )}
                      </div>
                    ),
                    width: '200px',
                    sortable: true,
                  },
                  {
                    id: 'passport',
                    header: 'Passport',
                    accessor: (item: Applicant) => (
                      <div>
                        <p className="font-medium">{item.passportNumber}</p>
                        <p className="text-xs text-secondary-500">
                          Exp: {formatDate(item.passportExpiry)}
                        </p>
                      </div>
                    ),
                    width: '150px',
                  },
                  {
                    id: 'contact',
                    header: 'Contact',
                    accessor: (item: Applicant) => (
                      <div>
                        <p className="text-sm">{item.email}</p>
                        <p className="text-sm text-secondary-500">{formatPhone(item.phone)}</p>
                      </div>
                    ),
                    width: '200px',
                  },
                  {
                    id: 'age',
                    header: 'Age',
                    accessor: (item: Applicant) => (
                      <span>{getAge(item.dateOfBirth)}</span>
                    ),
                    width: '80px',
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    accessor: (item: Applicant) => (
                      <Badge
                        variant={item.status === 'active' ? 'success' : item.status === 'inactive' ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    ),
                    width: '100px',
                  },
                  {
                    id: 'actions',
                    header: 'Actions',
                    accessor: (item: Applicant) => (
                      <DropdownMenu
                        items={menuItems}
                        trigger={
                          <button className="p-1 rounded hover:bg-secondary-100">
                            <MoreVertical className="h-4 w-4 text-secondary-400" />
                          </button>
                        }
                        onChange={(action) => handleMenuAction(action, item)}
                      />
                    ),
                    width: '80px',
                    sortable: false,
                  },
                ]}
                data={paginatedApplicants}
                isLoading={isLoading}
                emptyMessage="No applicants found"
                showSelection
                selectedRows={selectedApplicants}
                onSelectRow={handleSelectRow}
                onSelectAll={handleSelectAll}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-secondary-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      leftIcon={<ChevronLeft className="h-4 w-4" />}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-secondary-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-secondary-500">
                      Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredApplicants.length)} of {filteredApplicants.length}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Form Sheet (New/Edit) */}
      <Sheet
        isOpen={showFormSheet}
        onClose={() => {
          setShowFormSheet(false);
          setEditingApplicant(null);
          navigate('/applicants');
        }}
        title={editingApplicant ? 'Edit Applicant' : 'New Applicant'}
        size="xl"
      >
        <SheetContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card variant="bordered" padding="md">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
                <Input
                  label="Bengali Name"
                  value={formData.bengaliName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bengaliName: e.target.value }))}
                  hint="Optional"
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  required
                />
                <Select
                  label="Gender"
                  options={genderOptions}
                  value={formData.gender || 'male'}
                  onChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                />
                <Select
                  label="Nationality"
                  options={nationalityOptions}
                  value={formData.nationality || 'Bangladesh'}
                  onChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
                />
              </div>
            </Card>

            {/* Passport Information */}
            <Card variant="bordered" padding="md">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Passport Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Passport Number"
                  value={formData.passportNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value }))}
                  required
                />
                <Input
                  label="Passport Issue Date"
                  type="date"
                  value={formData.passportIssueDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, passportIssueDate: e.target.value }))}
                  required
                />
                <Input
                  label="Passport Expiry Date"
                  type="date"
                  value={formData.passportExpiry || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, passportExpiry: e.target.value }))}
                  required
                />
              </div>
            </Card>

            {/* Contact Information */}
            <Card variant="bordered" padding="md">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
                <Input
                  label="Address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
                <Input
                  label="City"
                  value={formData.city || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
                <Select
                  label="Country"
                  options={countryOptions}
                  value={formData.country || 'Bangladesh'}
                  onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                />
                <Input
                  label="Postal Code"
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                />
              </div>
            </Card>

            {/* Status */}
            <Card variant="bordered" padding="md">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Status
              </h2>
              <Select
                label="Applicant Status"
                options={statusOptions}
                value={formData.status || 'active'}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                hint="Active applicants can be assigned to visa cases"
              />
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowFormSheet(false);
                  setEditingApplicant(null);
                  navigate('/applicants');
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={!formData.firstName || !formData.lastName || !formData.dateOfBirth}
              >
                {editingApplicant ? 'Update Applicant' : 'Create Applicant'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Detail Sheet */}
      <Sheet
        isOpen={showDetailSheet}
        onClose={() => {
          setShowDetailSheet(false);
          setViewingApplicant(null);
        }}
        title="Applicant Details"
        size="xl"
      >
        <SheetContent>
          {viewingApplicant && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center py-6 border-b border-secondary-200">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Avatar
                    name={`${viewingApplicant.firstName} ${viewingApplicant.lastName}`}
                    size="xl"
                    className="border-4 border-white shadow-lg"
                  />
                </div>
                <h2 className="text-xl font-bold text-secondary-900">
                  {viewingApplicant.firstName} {viewingApplicant.lastName}
                </h2>
                {viewingApplicant.bengaliName && (
                  <p className="text-lg text-secondary-600">{viewingApplicant.bengaliName}</p>
                )}
                <Badge
                  variant={viewingApplicant.status === 'active' ? 'success' : viewingApplicant.status === 'inactive' ? 'warning' : 'danger'}
                  className="mt-2"
                >
                  {viewingApplicant.status}
                </Badge>
                <p className="text-sm text-secondary-500 mt-2">
                  Reference: {viewingApplicant.referenceNumber}
                </p>
              </div>

              {/* Personal Information */}
              <Card variant="bordered" padding="md">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Date of Birth</p>
                    <p className="font-medium">{formatDate(viewingApplicant.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Age</p>
                    <p className="font-medium">{getAge(viewingApplicant.dateOfBirth)} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Gender</p>
                    <p className="font-medium capitalize">{viewingApplicant.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Nationality</p>
                    <p className="font-medium">{viewingApplicant.nationality}</p>
                  </div>
                </div>
              </Card>

              {/* Passport Information */}
              <Card variant="bordered" padding="md">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                  Passport Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Passport Number</p>
                    <p className="font-medium">{viewingApplicant.passportNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Issue Date</p>
                    <p className="font-medium">{formatDate(viewingApplicant.passportIssueDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Expiry Date</p>
                    <p className="font-medium">{formatDate(viewingApplicant.passportExpiry)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Status</p>
                    <Badge variant={getPassportStatus(viewingApplicant.passportExpiry).color}>
                      {getPassportStatus(viewingApplicant.passportExpiry).status}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Contact Information */}
              <Card variant="bordered" padding="md">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary-100 rounded-lg">
                      <Mail className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Email</p>
                      <p className="font-medium">{viewingApplicant.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary-100 rounded-lg">
                      <Phone className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Phone</p>
                      <p className="font-medium">{formatPhone(viewingApplicant.phone)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-secondary-500">Address</p>
                      <p className="font-medium">
                        {viewingApplicant.address}, {viewingApplicant.city}, {viewingApplicant.country} {viewingApplicant.postalCode}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Metadata */}
              <Card variant="bordered" padding="md">
                <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                  Metadata
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Created</p>
                    <p className="font-medium">{formatDate(viewingApplicant.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Last Updated</p>
                    <p className="font-medium">{formatDate(viewingApplicant.updatedAt)}</p>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleGeneratePDF(viewingApplicant)}
                  leftIcon={<FileText className="h-4 w-4" />}
                >
                  Generate PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEditApplicant(viewingApplicant)}
                  leftIcon={<Edit className="h-4 w-4" />}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setDeletingId(viewingApplicant.id);
                    setShowDetailSheet(false);
                    setShowDeleteDialog(true);
                  }}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingId(null);
        }}
        title="Delete Applicant"
      >
        <DialogContent>
          <p className="text-secondary-600">
            Are you sure you want to delete this applicant? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteDialog(false);
              setDeletingId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deletingId && handleDelete(deletingId)}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Actions Sheet */}
      <Sheet
        isOpen={showBulkActionsSheet}
        onClose={() => setShowBulkActionsSheet(false)}
        title="Bulk Actions"
        side="right"
      >
        <SheetContent>
          <div className="space-y-4">
            <p className="text-secondary-600">
              {selectedApplicants.length} applicants selected
            </p>
            <div className="space-y-2">
              {bulkMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleBulkMenuAction(item.id)}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors text-left',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Search */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <Input
            placeholder="Search applicants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicantsPage;
