import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, generateId, generateReferenceNumber, formatDate, getFromStorage, setToStorage, STORAGE_KEYS } from '@/lib/utils';
import { APP_CONFIG, INDUSTRIES } from '@/lib/constants';
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
  Building2, 
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
  Copy,
  Briefcase,
  Users,
  Globe,
  Check,
  X
} from 'lucide-react';
import { generateEmployerDocumentPDF } from '@/lib/pdf';
import type { Employer, EmployerDocument, PaginationParams, PaginatedResponse } from '@/types';

// Sample data for employers
const sampleEmployers: Employer[] = [
  {
    id: '1',
    companyName: 'TechSolutions Bangladesh Ltd',
    companyBengaliName: '\u099f\u09c7\u0995\u09b8\u09b2\u09c1\u09b7\u09a8\u09cd\u09b8 \u09ac\u09be\u0982\u09b2\u09be\u09a1\u09c7\u09b8\u09cd',
    registrationNumber: 'REG-BD-2020-12345',
    address: '123 IT Avenue, Gulshan',
    city: 'Dhaka',
    country: 'Bangladesh',
    postalCode: '1212',
    contactPerson: 'Mr. Ahmed Khan',
    contactEmail: 'ahmed.khan@techsolutions.bd',
    contactPhone: '+8801712345678',
    website: 'https://techsolutions.bd',
    industry: 'it',
    companySize: '51-200',
    isVerified: true,
    verificationDate: '2024-01-15',
    documents: [
      {
        id: '1',
        name: 'Company Registration',
        type: 'registration',
        filePath: '/documents/tech-solutions-registration.pdf',
        fileUrl: '',
        issueDate: '2020-01-15',
        expiryDate: '2025-01-15',
        verified: true,
        verificationNotes: 'Verified by Ministry of Commerce',
      },
      {
        id: '2',
        name: 'Tax Certificate',
        type: 'tax',
        filePath: '/documents/tech-solutions-tax.pdf',
        fileUrl: '',
        issueDate: '2024-01-01',
        expiryDate: '2024-12-31',
        verified: true,
        verificationNotes: 'Valid for 2024',
      },
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
  {
    id: '2',
    companyName: 'GreenField Agro Industries',
    companyBengaliName: '\u0997\u09cd\u09b0\u09c0\u09a8\u09ab\u09c7\u09b2\u09cd\u099f \u0986\u0997\u09cd\u09b0\u09cb \u0987\u09a8\u09cd\u099f\u09b8\u09cd\u09b8\u09c1\u099f\u09cd\u09b8',
    registrationNumber: 'REG-BD-2018-67890',
    address: '456 Industrial Zone, Chittagong',
    city: 'Chittagong',
    country: 'Bangladesh',
    postalCode: '4200',
    contactPerson: 'Ms. Fatema Begum',
    contactEmail: 'fatema@greenfield-agro.com',
    contactPhone: '+8801812345678',
    website: 'https://greenfield-agro.com',
    industry: 'agriculture',
    companySize: '201-500',
    isVerified: true,
    verificationDate: '2024-02-01',
    documents: [
      {
        id: '1',
        name: 'Business License',
        type: 'license',
        filePath: '/documents/greenfield-license.pdf',
        fileUrl: '',
        issueDate: '2018-03-01',
        expiryDate: '2028-03-01',
        verified: true,
        verificationNotes: 'Valid business license',
      },
    ],
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: '3',
    companyName: 'Bright Future Education Consultancy',
    companyBengaliName: '\u09ac\u09cd\u09b0\u09bf\u0997\u09cd\u099f \u09ab\u09c2\u099f\u09c7\u09b0 \u0987\u09a1\u09c1\u0995\u09c7\u09b6\u09a8 \u0995\u09a8\u09cd\u09b8\u09c1\u09b2\u09cd\u099f\u09a8\u09cd\u09b8\u09c1',
    registrationNumber: 'REG-BD-2022-34567',
    address: '789 Education Street, Sylhet',
    city: 'Sylhet',
    country: 'Bangladesh',
    postalCode: '3100',
    contactPerson: 'Mr. Rajib Chowdhury',
    contactEmail: 'rajib@brightfuture.edu.bd',
    contactPhone: '+8801912345678',
    website: 'https://brightfuture.edu.bd',
    industry: 'education',
    companySize: '11-50',
    isVerified: false,
    verificationDate: '',
    documents: [
      {
        id: '1',
        name: 'Registration Certificate',
        type: 'registration',
        filePath: '/documents/bright-future-registration.pdf',
        fileUrl: '',
        issueDate: '2022-01-15',
        expiryDate: '',
        verified: false,
        verificationNotes: 'Pending verification',
      },
    ],
    createdAt: '2024-01-05T14:20:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
  },
  {
    id: '4',
    companyName: 'Global Trade Partners',
    companyBengaliName: '\u0997\u09cd\u09b2\u09cb\u09ac\u09be\u09b2 \u099f\u09cd\u09b0\u09c7\u099f\u09cd \u09aa\u09be\u09b0\u09cd\u099f\u09a8\u09be\u09b0\u09cd\u09b8',
    registrationNumber: 'REG-BD-2021-89012',
    address: '321 Commercial Area, Khulna',
    city: 'Khulna',
    country: 'Bangladesh',
    postalCode: '9000',
    contactPerson: 'Mr. Sara Islam',
    contactEmail: 'sara.islam@globaltrade.bd',
    contactPhone: '+8801612345678',
    website: 'https://globaltrade.bd',
    industry: 'retail',
    companySize: '51-200',
    isVerified: false,
    verificationDate: '',
    documents: [],
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-08T10:15:00Z',
  },
  {
    id: '5',
    companyName: 'HealthFirst Medical Services',
    companyBengaliName: '\u09b8\u09cd\u09ac\u09be\u09a5\u09cd\u09b0\u09cd\u09b8\u09cd\u099f \u09ae\u09c7\u09a1\u09bf\u0995\u09cd\u09af\u09be\u09b2 \u09b8\u09be\u09b0\u09cd\u09ac\u09bf\u09b8\u09cd\u09b8',
    registrationNumber: 'REG-BD-2019-45678',
    address: '654 Medical Road, Rajshahi',
    city: 'Rajshahi',
    country: 'Bangladesh',
    postalCode: '6000',
    contactPerson: 'Dr. Mohammad Ali',
    contactEmail: 'dr.ali@healthfirst.bd',
    contactPhone: '+8801512345678',
    website: 'https://healthfirst.bd',
    industry: 'healthcare',
    companySize: '1-10',
    isVerified: true,
    verificationDate: '2024-01-25',
    documents: [
      {
        id: '1',
        name: 'Medical License',
        type: 'license',
        filePath: '/documents/healthfirst-license.pdf',
        fileUrl: '',
        issueDate: '2019-05-01',
        expiryDate: '2029-05-01',
        verified: true,
        verificationNotes: 'Valid medical license',
      },
      {
        id: '2',
        name: 'Registration',
        type: 'registration',
        filePath: '/documents/healthfirst-registration.pdf',
        fileUrl: '',
        issueDate: '2019-01-01',
        expiryDate: '',
        verified: true,
        verificationNotes: 'Company registration',
      },
    ],
    createdAt: '2023-12-28T13:45:00Z',
    updatedAt: '2024-01-02T10:30:00Z',
  },
];

// Industry options with labels
const industryOptions = INDUSTRIES.map(i => ({ value: i.id, label: i.label.en }));

// Company size options
const companySizeOptions = [
  { value: '1-10', label: '1-10 Employees' },
  { value: '11-50', label: '11-50 Employees' },
  { value: '51-200', label: '51-200 Employees' },
  { value: '201-500', label: '201-500 Employees' },
  { value: '500+', label: '500+ Employees' },
];

// Document type options
const documentTypeOptions = [
  { value: 'registration', label: 'Registration' },
  { value: 'tax', label: 'Tax Certificate' },
  { value: 'license', label: 'License' },
  { value: 'bank', label: 'Bank Documents' },
  { value: 'office', label: 'Office Documents' },
  { value: 'other', label: 'Other' },
];

export interface EmployersPageProps {
  mode?: 'list' | 'new' | 'edit' | 'view';
}

export const EmployersPage: React.FC<EmployersPageProps> = ({
  mode = 'list',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const { language } = useApp();
  
  // State for employers
  const [employers, setEmployers] = useState<Employer[]>(sampleEmployers);
  const [filteredEmployers, setFilteredEmployers] = useState<Employer[]>(sampleEmployers);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Employer>>({
    companyName: '',
    companyBengaliName: '',
    registrationNumber: '',
    address: '',
    city: '',
    country: 'Bangladesh',
    postalCode: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    industry: 'it',
    companySize: '1-10',
    isVerified: false,
    verificationDate: '',
    documents: [],
  });
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'verification'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Dialog and Sheet states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkActionsSheet, setShowBulkActionsSheet] = useState(false);
  const [selectedEmployers, setSelectedEmployers] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [viewingEmployer, setViewingEmployer] = useState<Employer | null>(null);
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setEmployers(sampleEmployers);
        setFilteredEmployers(sampleEmployers);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load employers');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter employers
  useEffect(() => {
    let result = [...employers];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(employer =>
        employer.companyName.toLowerCase().includes(query) ||
        employer.companyBengaliName?.toLowerCase().includes(query) ||
        employer.registrationNumber.toLowerCase().includes(query) ||
        employer.contactPerson.toLowerCase().includes(query) ||
        employer.contactEmail.toLowerCase().includes(query) ||
        employer.contactPhone.includes(query) ||
        employer.industry.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(employer => 
        statusFilter === 'verified' ? employer.isVerified : !employer.isVerified
      );
    }
    
    // Apply industry filter
    if (industryFilter !== 'all') {
      result = result.filter(employer => employer.industry === industryFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc'
            ? a.companyName.localeCompare(b.companyName)
            : b.companyName.localeCompare(a.companyName);
        case 'verification':
          return sortOrder === 'asc'
            ? (a.isVerified ? 1 : 0) - (b.isVerified ? 1 : 0)
            : (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
        case 'date':
        default:
          return sortOrder === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    setFilteredEmployers(result);
    setCurrentPage(1);
  }, [employers, searchQuery, statusFilter, industryFilter, sortBy, sortOrder]);
  
  // Handle edit
  useEffect(() => {
    if (mode === 'edit' && params.id) {
      const employer = employers.find(e => e.id === params.id);
      if (employer) {
        setEditingEmployer(employer);
        setFormData(employer);
        setShowFormSheet(true);
      }
    } else if (mode === 'new') {
      setFormData({
        companyName: '',
        companyBengaliName: '',
        registrationNumber: '',
        address: '',
        city: '',
        country: 'Bangladesh',
        postalCode: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        industry: 'it',
        companySize: '1-10',
        isVerified: false,
        verificationDate: '',
        documents: [],
      });
      setEditingEmployer(null);
      setShowFormSheet(true);
    }
  }, [mode, params.id, employers]);
  
  // Pagination
  const totalPages = Math.ceil(filteredEmployers.length / itemsPerPage);
  const paginatedEmployers = filteredEmployers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const newEmployer: Employer = {
        id: editingEmployer?.id || generateId(),
        companyName: formData.companyName || '',
        companyBengaliName: formData.companyBengaliName || '',
        registrationNumber: formData.registrationNumber || '',
        address: formData.address || '',
        city: formData.city || '',
        country: formData.country || 'Bangladesh',
        postalCode: formData.postalCode || '',
        contactPerson: formData.contactPerson || '',
        contactEmail: formData.contactEmail || '',
        contactPhone: formData.contactPhone || '',
        website: formData.website || '',
        industry: formData.industry || 'it',
        companySize: formData.companySize || '1-10',
        isVerified: formData.isVerified || false,
        verificationDate: formData.verificationDate || '',
        documents: formData.documents || [],
        createdAt: editingEmployer?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (editingEmployer) {
        // Update existing
        setEmployers(employers.map(e => e.id === editingEmployer.id ? newEmployer : e));
      } else {
        // Add new
        setEmployers([newEmployer, ...employers]);
      }
      
      setShowFormSheet(false);
      navigate('/employers');
      
    } catch (err) {
      setError('Failed to save employer');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setEmployers(employers.filter(e => e.id !== id));
      setShowDeleteDialog(false);
      setDeletingId(null);
    } catch (err) {
      setError('Failed to delete employer');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      setEmployers(employers.filter(e => !selectedEmployers.includes(e.id)));
      setSelectedEmployers([]);
      setShowBulkActionsSheet(false);
    } catch (err) {
      setError('Failed to delete selected employers');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle row selection
  const handleSelectRow = (id: string) => {
    setSelectedEmployers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  // Handle select all
  const handleSelectAll = () => {
    if (selectedEmployers.length === paginatedEmployers.length) {
      setSelectedEmployers([]);
    } else {
      setSelectedEmployers(paginatedEmployers.map(e => e.id));
    }
  };
  
  // Get verification status
  const getVerificationStatus = (employer: Employer) => {
    if (employer.isVerified) {
      return { label: 'Verified', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> };
    }
    return { label: 'Not Verified', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> };
  };
  
  // Get industry label
  const getIndustryLabel = (industryId: string) => {
    const industry = INDUSTRIES.find(i => i.id === industryId);
    return industry ? industry.label.en : industryId;
  };
  
  // Format phone
  const formatPhone = (phone: string) => {
    if (!phone) return '';
    if (phone.startsWith('+880')) {
      return phone.replace('+880', '').replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
  };
  
  // Generate PDF
  const handleGeneratePDF = async (employer: Employer) => {
    try {
      setIsLoading(true);
      const pdf = await generateEmployerDocumentPDF(employer);
      // Download the PDF
      const link = document.createElement('a');
      link.href = pdf.content;
      link.download = `Employer_${employer.companyName.replace(/\s+/g, '_')}.pdf`;
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
  const handleNewEmployer = () => {
    navigate('/employers/new');
  };
  
  const handleEditEmployer = (employer: Employer) => {
    navigate(`/employers/${employer.id}/edit`);
  };
  
  const handleViewEmployer = (employer: Employer) => {
    setViewingEmployer(employer);
    setShowDetailSheet(true);
  };
  
  const handleBack = () => {
    navigate('/employers');
    setShowFormSheet(false);
    setShowDetailSheet(false);
    setEditingEmployer(null);
    setViewingEmployer(null);
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
  
  const handleMenuAction = (action: string, employer: Employer) => {
    switch (action) {
      case 'view':
        handleViewEmployer(employer);
        break;
      case 'edit':
        handleEditEmployer(employer);
        break;
      case 'pdf':
        handleGeneratePDF(employer);
        break;
      case 'delete':
        setDeletingId(employer.id);
        setShowDeleteDialog(true);
        break;
    }
  };
  
  // Bulk menu items
  const bulkMenuItems: DropdownMenuItemType[] = [
    { id: 'export', label: 'Export Selected', icon: <Download className="h-4 w-4" /> },
    { id: 'pdf', label: 'Generate PDFs', icon: <FileText className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete Selected', icon: <Trash2 className="h-4 w-4" />, disabled: selectedEmployers.length === 0 },
  ];
  
  const handleBulkMenuAction = (action: string) => {
    switch (action) {
      case 'delete':
        setShowBulkActionsSheet(false);
        if (confirm(`Are you sure you want to delete ${selectedEmployers.length} employers?`)) {
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
  
  // Stats
  const totalEmployers = employers.length;
  const verifiedEmployers = employers.filter(e => e.isVerified).length;
  const unverifiedEmployers = employers.filter(e => !e.isVerified).length;
  
  // Column definitions
  const columns = [
    {
      id: 'select',
      header: <input type="checkbox" checked={selectedEmployers.length === paginatedEmployers.length && paginatedEmployers.length > 0} onChange={handleSelectAll} />,
      accessor: (item: Employer) => (
        <input type="checkbox" checked={selectedEmployers.includes(item.id)} onChange={() => handleSelectRow(item.id)} />
      ),
      width: '50px',
    },
    {
      id: 'companyName',
      header: 'Company Name',
      accessor: (item: Employer) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 bg-primary-600 text-white text-xs" fallback={item.companyName.substring(0, 2)} />
          <div>
            <div className="font-medium text-primary-600">{item.companyName}</div>
            {item.companyBengaliName && <div className="text-xs text-secondary-500">{item.companyBengaliName}</div>}
          </div>
        </div>
      ),
      width: '250px',
      sortable: true,
    },
    {
      id: 'registration',
      header: 'Registration No.',
      accessor: (item: Employer) => <span className="text-sm font-mono">{item.registrationNumber}</span>,
      width: '180px',
    },
    {
      id: 'industry',
      header: 'Industry',
      accessor: (item: Employer) => (
        <Badge variant={getIndustryLabel(item.industry) === 'Information Technology' ? 'primary' : 'secondary'}>
          {getIndustryLabel(item.industry)}
        </Badge>
      ),
      width: '150px',
    },
    {
      id: 'contact',
      header: 'Contact',
      accessor: (item: Employer) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {formatPhone(item.contactPhone)}
          </div>
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {item.contactEmail}
          </div>
        </div>
      ),
      width: '200px',
    },
    {
      id: 'verification',
      header: 'Verification',
      accessor: (item: Employer) => {
        const status = getVerificationStatus(item);
        return (
          <Badge variant={status.color.includes('green') ? 'success' : status.color.includes('yellow') ? 'warning' : 'secondary'}>n            <span className="flex items-center gap-1">
              {status.icon}
              {status.label}
            </span>
          </Badge>
        );
      },
      width: '120px',
      sortable: true,
    },
    {
      id: 'size',
      header: 'Size',
      accessor: (item: Employer) => <span className="text-sm">{item.companySize}</span>,
      width: '100px',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (item: Employer) => (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            {menuItems.map(item => (
              <DropdownMenu.Item
                key={item.id}
                onClick={() => handleMenuAction(item.id, item)}
                disabled={item.disabled}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </div>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      ),
      width: '80px',
    },
  ];
  
  // Handle sort
  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId as any);
      setSortOrder('desc');
    }
  };
  
  // Get sort indicator
  const getSortIndicator = (columnId: string) => {
    if (sortBy !== columnId) return null;
    return sortOrder === 'asc' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />;
  };
  
  // Main render
  if (mode === 'new' || mode === 'edit') {
    // This will be handled by the form component
    return null;
  }
  
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Employers Management
            </h1>
            <p className="text-secondary-600 mt-1">
              Manage company profiles, verification, and documents
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBulkActionsSheet(true)} disabled={selectedEmployers.length === 0}>
              <Upload className="h-4 w-4 mr-1" />
              Bulk Actions ({selectedEmployers.length})
            </Button>
            <Button size="sm" onClick={handleNewEmployer}>
              <Building2 className="h-4 w-4 mr-1" />
              New Employer
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Error Alert */}
      {error && (
        <Alert variant="error" onDismiss={clearError} className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-900">{totalEmployers}</div>
              <div className="text-sm text-secondary-600">Total Employers</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{verifiedEmployers}</div>
              <div className="text-sm text-secondary-600">Verified</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{unverifiedEmployers}</div>
              <div className="text-sm text-secondary-600">Pending Verification</div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Filters */}
      <Card className="p-4 mb-6" variant="bordered">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as any)}
            placeholder="Status"
          >
            <Select.Option value="all">All Status</Select.Option>
            <Select.Option value="verified">Verified</Select.Option>
            <Select.Option value="unverified">Not Verified</Select.Option>
          </Select>
          <Select
            value={industryFilter}
            onValueChange={(v) => setIndustryFilter(v)}
            placeholder="Industry"
          >
            <Select.Option value="all">All Industries</Select.Option>
            {industryOptions.map(ind => (
              <Select.Option key={ind.value} value={ind.value}>{ind.label}</Select.Option>
            ))}
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setIndustryFilter('all');
            }}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Table */}
      <Card className="p-4" variant="bordered">
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <TableRow>
                {columns.map(column => (
                  <TableHeaderCell
                    key={column.id}
                    width={column.width}
                    onClick={() => column.sortable && handleSort(column.id)}
                    className={cn(
                      column.sortable && 'cursor-pointer select-none hover:bg-secondary-50',
                      column.id === 'select' && 'w-[50px]'
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && getSortIndicator(column.id)}
                    </div>
                  </TableHeaderCell>
                ))}
              </TableRow>
            </Table.Header>
            <Table.Body>
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 rounded mb-1" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 rounded mb-1" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedEmployers.length > 0 ? (
                paginatedEmployers.map(employer => (
                  <TableRow key={employer.id} className="hover:bg-secondary-50/50">
                    {columns.map(column => (
                      <TableCell key={column.id} width={column.width}>
                        {column.accessor(employer)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="flex flex-col items-center gap-4">
                      <Building2 className="h-12 w-12 text-secondary-300" />
                      <div className="text-secondary-500">No employers found</div>
                      <Button variant="outline" size="sm" onClick={handleNewEmployer}>
                        <Building2 className="h-4 w-4 mr-1" />
                        Add First Employer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Table.Body>
          </Table>
        </div>
        
        {/* Pagination */}
        {paginatedEmployers.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-200">
            <div className="text-sm text-secondary-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredEmployers.length)} of {filteredEmployers.length} employers
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="px-4 py-2 text-sm">
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
          </div>
        )}
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogContent.Header>
            <DialogContent.Title>Delete Employer</DialogContent.Title>
            <DialogContent.Description>
              Are you sure you want to delete this employer? This action cannot be undone.
            </DialogContent.Description>
          </DialogContent.Header>
          <DialogActions>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => deletingId && handleDelete(deletingId)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Actions Sheet */}
      <Sheet open={showBulkActionsSheet} onOpenChange={setShowBulkActionsSheet}>
        <SheetContent side="right" className="w-80">
          <SheetContent.Header>
            <SheetContent.Title>Bulk Actions</SheetContent.Title>
            <SheetContent.Description>
              Perform actions on {selectedEmployers.length} selected employers
            </SheetContent.Description>
          </SheetContent.Header>
          <div className="py-4 space-y-2">
            {bulkMenuItems.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                size="lg"
                className="w-full justify-start gap-3"
                onClick={() => handleBulkMenuAction(item.id)}
                disabled={item.disabled}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Detail Sheet */}
      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent side="right" className="w-full max-w-2xl">
          <SheetContent.Header>
            <SheetContent.Title>Employer Details</SheetContent.Title>
          </SheetContent.Header>
          {viewingEmployer && (
            <div className="py-4 space-y-6">
              {/* Company Info */}
              <Card variant="bordered" className="p-4">
                <h3 className="font-semibold mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Company Name</div>
                    <div className="font-medium">{viewingEmployer.companyName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Bengali Name</div>
                    <div className="font-medium">{viewingEmployer.companyBengaliName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Registration Number</div>
                    <div className="font-medium">{viewingEmployer.registrationNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Industry</div>
                    <Badge variant="primary">{getIndustryLabel(viewingEmployer.industry)}</Badge>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Company Size</div>
                    <div className="font-medium">{viewingEmployer.companySize}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Verification Status</div>
                    {viewingEmployer.isVerified ? (
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning">
                        <Clock className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
              
              {/* Contact Info */}
              <Card variant="bordered" className="p-4">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Address</div>
                    <div className="font-medium">{viewingEmployer.address}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">City</div>
                    <div className="font-medium">{viewingEmployer.city}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Country</div>
                    <div className="font-medium">{viewingEmployer.country}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Postal Code</div>
                    <div className="font-medium">{viewingEmployer.postalCode}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Contact Person</div>
                    <div className="font-medium">{viewingEmployer.contactPerson}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Email</div>
                    <div className="font-medium">{viewingEmployer.contactEmail}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Phone</div>
                    <div className="font-medium">{formatPhone(viewingEmployer.contactPhone)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Website</div>
                    <div className="font-medium">{viewingEmployer.website || 'N/A'}</div>
                  </div>
                </div>
              </Card>
              
              {/* Documents */}
              {viewingEmployer.documents && viewingEmployer.documents.length > 0 && (
                <Card variant="bordered" className="p-4">
                  <h3 className="font-semibold mb-4">Company Documents</h3>
                  <div className="space-y-3">
                    {viewingEmployer.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-secondary-600">
                            Type: {documentTypeOptions.find(d => d.value === doc.type)?.label || doc.type}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.verified ? (
                            <Badge variant="success">Verified</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              
              {/* Metadata */}
              <Card variant="bordered" className="p-4">
                <h3 className="font-semibold mb-4">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Created At</div>
                    <div className="font-medium">{formatDate(viewingEmployer.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Updated At</div>
                    <div className="font-medium">{formatDate(viewingEmployer.updatedAt)}</div>
                  </div>
                  {viewingEmployer.verificationDate && (
                    <div>
                      <div className="text-sm text-secondary-600 mb-1">Verification Date</div>
                      <div className="font-medium">{formatDate(viewingEmployer.verificationDate)}</div>
                    </div>
                  )}
                </div>
              </Card>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={() => handleEditEmployer(viewingEmployer)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => handleGeneratePDF(viewingEmployer)}>
                  <FileText className="h-4 w-4 mr-1" />
                  Generate PDF
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EmployersPage;
