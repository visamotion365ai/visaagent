import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, generateId, formatDate, getFromStorage, setToStorage, STORAGE_KEYS } from '@/lib/utils';
import { APP_CONFIG, DOCUMENT_TYPES } from '@/lib/constants';
import { useApp } from '@/App';
import { 
  Button, 
  Card, 
  Input, 
  Select,
  Badge,
  Alert,
  Skeleton,
  Dialog,
  DialogActions,
  DialogContent,
  Sheet,
  SheetContent,
  Table,
  TableCell,
  TableHeaderCell,
  TableRow,
  Progress,
  DropdownMenu,
  DropdownMenuItem as DropdownMenuItemType,
  FileUpload
} from '@/components/ui';
import { 
  FileText, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Copy,
  Folder,
  Tag,
  User,
  Building2,
  Check,
  X,
  SortAsc,
  SortDesc
} from 'lucide-react';
import type { 
  CaseDocument, 
  Applicant, 
  Employer, 
  VisaCase,
  PaginationParams,
  PaginatedResponse 
} from '@/types';

// Sample applicants
const sampleApplicants: Applicant[] = [
  {
    id: '1',
    referenceNumber: 'VISA-2024-001',
    firstName: 'Mohammad',
    lastName: 'Rahman',
    bengaliName: '\u09ae\u09cb\u09b9\u09be\u09ae\u09cd\u09ae\u09a6 \u09b0\u09b9\u09ae\u09be\u09a8',
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
];

// Sample employers
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
    documents: [],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
  },
];

// Sample cases
const sampleCases: VisaCase[] = [
  {
    id: '1',
    referenceNumber: 'CASE-2024-001',
    applicantId: '1',
    employerId: '1',
    visaType: 'work',
    targetCountry: 'usa',
    status: 'processing',
    priority: 'high',
    submissionDate: '2024-01-20',
    expectedDecisionDate: '2024-03-20',
    actualDecisionDate: '',
    decision: '',
    rejectionReason: '',
    documents: [],
    checklists: [],
    notes: [],
    history: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-22T12:00:00Z',
  },
];

// Sample documents with various types
const sampleDocuments: CaseDocument[] = [
  {
    id: '1',
    name: 'Passport - Mohammad Rahman',
    type: 'passport',
    filePath: '/documents/passport-mohammad-rahman.pdf',
    fileUrl: '',
    uploadDate: '2024-01-15',
    verified: true,
    verificationNotes: 'Valid passport with 2 years validity',
    version: 1,
  },
  {
    id: '2',
    name: 'Photograph - Mohammad Rahman',
    type: 'photo',
    filePath: '/documents/photo-mohammad-rahman.jpg',
    fileUrl: '',
    uploadDate: '2024-01-15',
    verified: true,
    verificationNotes: 'Recent passport size photograph',
    version: 1,
  },
  {
    id: '3',
    name: 'Application Form - CASE-2024-001',
    type: 'application',
    filePath: '/documents/application-case-001.pdf',
    fileUrl: '',
    uploadDate: '2024-01-18',
    verified: true,
    verificationNotes: 'Complete and signed application',
    version: 2,
  },
  {
    id: '4',
    name: 'Offer Letter - TechSolutions',
    type: 'offer-letter',
    filePath: '/documents/offer-letter-techsolutions.pdf',
    fileUrl: '',
    uploadDate: '2024-01-19',
    verified: true,
    verificationNotes: 'Valid offer letter from TechSolutions Bangladesh Ltd',
    version: 1,
  },
  {
    id: '5',
    name: 'Bank Statement - Mohammad Rahman',
    type: 'financial',
    filePath: '/documents/bank-statement-mohammad.pdf',
    fileUrl: '',
    uploadDate: '2024-01-20',
    verified: false,
    verificationNotes: 'Pending verification',
    version: 1,
  },
  {
    id: '6',
    name: 'Degree Certificate - BSc Computer Science',
    type: 'education',
    filePath: '/documents/degree-certificate-bsc.pdf',
    fileUrl: '',
    uploadDate: '2024-01-16',
    verified: true,
    verificationNotes: 'Verified degree certificate',
    version: 1,
  },
  {
    id: '7',
    name: 'Experience Certificate - Previous Company',
    type: 'experience',
    filePath: '/documents/experience-certificate.pdf',
    fileUrl: '',
    uploadDate: '2024-01-17',
    verified: true,
    verificationNotes: '3 years of experience verified',
    version: 1,
  },
  {
    id: '8',
    name: 'Medical Certificate - Health Check',
    type: 'medical',
    filePath: '/documents/medical-certificate.pdf',
    fileUrl: '',
    uploadDate: '2024-01-21',
    verified: false,
    verificationNotes: 'Pending medical verification',
    version: 1,
  },
  {
    id: '9',
    name: 'Travel Insurance - World Cover',
    type: 'insurance',
    filePath: '/documents/travel-insurance.pdf',
    fileUrl: '',
    uploadDate: '2024-01-22',
    verified: true,
    verificationNotes: 'Valid insurance coverage',
    version: 1,
  },
  {
    id: '10',
    name: 'Police Clearance Certificate',
    type: 'other',
    filePath: '/documents/police-clearance.pdf',
    fileUrl: '',
    uploadDate: '2024-01-23',
    verified: false,
    verificationNotes: 'Pending police verification',
    version: 1,
  },
];

// Document type options
const documentTypeOptions = DOCUMENT_TYPES.map(d => ({ value: d.id, label: d.label.en }));

// Verification status options
const verificationStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending Verification' },
];

// Entity type options
const entityTypeOptions = [
  { value: 'all', label: 'All Entities' },
  { value: 'applicant', label: 'Applicants' },
  { value: 'employer', label: 'Employers' },
  { value: 'case', label: 'Cases' },
];

export interface DocumentsPageProps {
  mode?: 'list' | 'upload' | 'view';
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  mode = 'list',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const { language } = useApp();
  
  // State for documents
  const [documents, setDocuments] = useState<CaseDocument[]>(sampleDocuments);
  const [filteredDocuments, setFilteredDocuments] = useState<CaseDocument[]>(sampleDocuments);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'type' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Dialog and Sheet states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkActionsSheet, setShowBulkActionsSheet] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<CaseDocument | null>(null);
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setDocuments(sampleDocuments);
        setFilteredDocuments(sampleDocuments);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load documents');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter documents
  useEffect(() => {
    let result = [...documents];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(doc =>
        doc.name.toLowerCase().includes(query) ||
        doc.type.toLowerCase().includes(query) ||
        doc.filePath.toLowerCase().includes(query) ||
        (doc.verificationNotes && doc.verificationNotes.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(doc => doc.type === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(doc => 
        statusFilter === 'verified' ? doc.verified : !doc.verified
      );
    }
    
    // Apply entity filter (simulated - in real app, documents would have entityType)
    if (entityFilter !== 'all') {
      // For demo purposes, filter by document type that might be associated with entities
      if (entityFilter === 'applicant') {
        result = result.filter(doc => ['passport', 'photo', 'education', 'experience'].includes(doc.type));
      } else if (entityFilter === 'employer') {
        result = result.filter(doc => ['offer-letter', 'financial'].includes(doc.type));
      } else if (entityFilter === 'case') {
        result = result.filter(doc => ['application', 'medical', 'insurance'].includes(doc.type));
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'type':
          return sortOrder === 'asc'
            ? a.type.localeCompare(b.type)
            : b.type.localeCompare(a.type);
        case 'status':
          return sortOrder === 'asc'
            ? (a.verified ? 1 : 0) - (b.verified ? 1 : 0)
            : (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
        case 'date':
        default:
          return sortOrder === 'asc'
            ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
            : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
    });
    
    setFilteredDocuments(result);
    setCurrentPage(1);
  }, [documents, searchQuery, typeFilter, statusFilter, entityFilter, sortBy, sortOrder]);
  
  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setDocuments(documents.filter(d => d.id !== id));
      setShowDeleteDialog(false);
      setDeletingId(null);
    } catch (err) {
      setError('Failed to delete document');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      setDocuments(documents.filter(d => !selectedDocuments.includes(d.id)));
      setSelectedDocuments([]);
      setShowBulkActionsSheet(false);
    } catch (err) {
      setError('Failed to delete selected documents');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle row selection
  const handleSelectRow = (id: string) => {
    setSelectedDocuments(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  // Handle select all
  const handleSelectAll = () => {
    if (selectedDocuments.length === paginatedDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(paginatedDocuments.map(d => d.id));
    }
  };
  
  // Handle document upload
  const handleDocumentUpload = async (files: File[]) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }
      
      // Create new document entries
      const newDocs = files.map(file => ({
        id: generateId(),
        name: file.name,
        type: 'other',
        filePath: URL.createObjectURL(file),
        fileUrl: '',
        uploadDate: new Date().toISOString().split('T')[0],
        verified: false,
        verificationNotes: 'Pending verification',
        version: 1,
      }));
      
      setDocuments(prev => [...newDocs, ...prev]);
      setUploadedFiles(prev => [...prev, ...files]);
      setShowUploadSheet(false);
      
    } catch (err) {
      setError('Failed to upload documents');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Get document type label
  const getDocumentTypeLabel = (type: string) => {
    return documentTypeOptions.find(d => d.value === type)?.label || type;
  };
  
  // Get document icon
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'passport': return <FileText className="h-5 w-5" />;
      case 'photo': return <User className="h-5 w-5" />;
      case 'application': return <Folder className="h-5 w-5" />;
      case 'offer-letter': return <Building2 className="h-5 w-5" />;
      case 'financial': return <Tag className="h-5 w-5" />;
      case 'education': return <CheckCircle className="h-5 w-5" />;
      case 'experience': return <Clock className="h-5 w-5" />;
      case 'medical': return <XCircle className="h-5 w-5" />;
      case 'insurance': return <Check className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };
  
  // Get verification badge
  const getVerificationBadge = (verified: boolean) => {
    if (verified) {
      return <Badge variant="success" size="sm"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
    }
    return <Badge variant="warning" size="sm"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };
  
  // Format file size
  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  // Navigation handlers
  const handleNewDocument = () => {
    setShowUploadSheet(true);
  };
  
  const handleViewDocument = (document: CaseDocument) => {
    setViewingDocument(document);
    setShowDetailSheet(true);
  };
  
  const handleBack = () => {
    navigate('/documents');
    setShowUploadSheet(false);
    setShowDetailSheet(false);
    setViewingDocument(null);
  };
  
  // Clear error
  const clearError = () => {
    setError(null);
  };
  
  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
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
    { id: 'download', label: 'Download', icon: <Download className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, disabled: false },
  ];
  
  const handleMenuAction = (action: string, document: CaseDocument) => {
    switch (action) {
      case 'view':
        handleViewDocument(document);
        break;
      case 'download':
        // Download the document
        const link = document.createElement('a');
        link.href = document.filePath;
        link.download = document.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;
      case 'delete':
        setDeletingId(document.id);
        setShowDeleteDialog(true);
        break;
    }
  };
  
  // Bulk menu items
  const bulkMenuItems: DropdownMenuItemType[] = [
    { id: 'download', label: 'Download All', icon: <Download className="h-4 w-4" /> },
    { id: 'verify', label: 'Mark as Verified', icon: <CheckCircle className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete Selected', icon: <Trash2 className="h-4 w-4" />, disabled: selectedDocuments.length === 0 },
  ];
  
  const handleBulkMenuAction = (action: string) => {
    switch (action) {
      case 'delete':
        setShowBulkActionsSheet(false);
        if (confirm(`Are you sure you want to delete ${selectedDocuments.length} documents?`)) {
          handleBulkDelete();
        }
        break;
      case 'download':
        // Handle bulk download
        break;
      case 'verify':
        // Handle bulk verify
        setDocuments(documents.map(d => 
          selectedDocuments.includes(d.id) ? { ...d, verified: true, verificationNotes: 'Bulk verified' } : d
        ));
        setShowBulkActionsSheet(false);
        break;
    }
    setShowBulkActionsSheet(false);
  };
  
  // Stats
  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter(d => d.verified).length;
  const pendingDocuments = documents.filter(d => !d.verified).length;
  
  // Column definitions
  const columns = [
    {
      id: 'select',
      header: <input type="checkbox" checked={selectedDocuments.length === paginatedDocuments.length && paginatedDocuments.length > 0} onChange={handleSelectAll} />,
      accessor: (item: CaseDocument) => (
        <input type="checkbox" checked={selectedDocuments.includes(item.id)} onChange={() => handleSelectRow(item.id)} />
      ),
      width: '50px',
    },
    {
      id: 'name',
      header: 'Document Name',
      accessor: (item: CaseDocument) => (
        <div className="flex items-center gap-2">
          <div className="text-secondary-400">{getDocumentIcon(item.type)}</div>
          <div className="font-medium">{item.name}</div>
        </div>
      ),
      width: '250px',
      sortable: true,
    },
    {
      id: 'type',
      header: 'Type',
      accessor: (item: CaseDocument) => (
        <Badge variant="secondary" size="sm">{getDocumentTypeLabel(item.type)}</Badge>
      ),
      width: '120px',
      sortable: true,
    },
    {
      id: 'entity',
      header: 'Entity',
      accessor: (item: CaseDocument) => {
        // Simulate entity association
        if (['passport', 'photo', 'education', 'experience'].includes(item.type)) {
          return <Badge variant="primary" size="sm">Applicant</Badge>;
        }
        if (['offer-letter', 'financial'].includes(item.type)) {
          return <Badge variant="info" size="sm">Employer</Badge>;
        }
        return <Badge variant="secondary" size="sm">Case</Badge>;
      },
      width: '100px',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item: CaseDocument) => getVerificationBadge(item.verified),
      width: '100px',
      sortable: true,
    },
    {
      id: 'version',
      header: 'Version',
      accessor: (item: CaseDocument) => (
        <span className="text-sm">v{item.version}</span>
      ),
      width: '80px',
    },
    {
      id: 'date',
      header: 'Upload Date',
      accessor: (item: CaseDocument) => (
        <span className="text-sm text-secondary-600">{formatDate(item.uploadDate)}</span>
      ),
      width: '120px',
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (item: CaseDocument) => (
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
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };
  
  // Main render
  if (mode === 'upload') {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/documents')}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </motion.div>
        
        <Sheet open={showUploadSheet} onOpenChange={setShowUploadSheet}>
          <SheetContent side="center" className="w-full max-w-2xl">
            <SheetContent.Header>
              <SheetContent.Title>Upload Documents</SheetContent.Title>
              <SheetContent.Description>
                Upload one or more documents to the system
              </SheetContent.Description>
            </SheetContent.Header>
            
            <div className="py-4">
              {uploading ? (
                <div className="space-y-4">
                  <Progress value={uploadProgress} />
                  <div className="text-center text-secondary-600">
                    Uploading... {uploadProgress}%
                  </div>
                </div>
              ) : (
                <FileUpload
                  multiple
                  accept="application/pdf,image/jpeg,image/png"
                  onUpload={handleDocumentUpload}
                  maxFiles={20}
                  maxFileSize={10 * 1024 * 1024}
                >
                  <div className="text-center py-12">
                    <Upload className="h-16 w-16 mx-auto text-primary-400 mb-4" />
                    <div className="text-xl font-medium text-primary-700 mb-2">Upload Documents</div>
                    <div className="text-secondary-600 mb-4">
                      Drag & drop files here or click to browse
                    </div>
                    <div className="text-sm text-secondary-500">
                      Supported: PDF, JPG, PNG<br />
                      Max size: 10MB per file<br />
                      Max files: 20
                    </div>
                  </div>
                </FileUpload>
              )}
              
              {uploadedFiles.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium">Recently Uploaded Files</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-secondary-400" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <span className="text-xs text-secondary-600">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowUploadSheet(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }
  
  if (mode === 'view' && params.id) {
    // View mode handled by detail sheet
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
              <FileText className="h-6 w-6" />
              Documents Management
            </h1>
            <p className="text-secondary-600 mt-1">
              Manage all uploaded documents, verification, and organization
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBulkActionsSheet(true)} disabled={selectedDocuments.length === 0}>
              <Upload className="h-4 w-4 mr-1" />
              Bulk Actions ({selectedDocuments.length})
            </Button>
            <Button size="sm" onClick={handleNewDocument}>
              <Upload className="h-4 w-4 mr-1" />
              Upload Documents
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
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-900">{totalDocuments}</div>
              <div className="text-sm text-secondary-600">Total Documents</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{verifiedDocuments}</div>
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
              <div className="text-2xl font-bold text-yellow-600">{pendingDocuments}</div>
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
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v)}
            placeholder="Type"
          >
            <Select.Option value="all">All Types</Select.Option>
            {documentTypeOptions.map(dt => (
              <Select.Option key={dt.value} value={dt.value}>{dt.label}</Select.Option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as any)}
            placeholder="Status"
          >
            {verificationStatusOptions.map(s => (
              <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>
            ))}
          </Select>
          <Select
            value={entityFilter}
            onValueChange={(v) => setEntityFilter(v)}
            placeholder="Entity"
          >
            {entityTypeOptions.map(e => (
              <Select.Option key={e.value} value={e.value}>{e.label}</Select.Option>
            ))}
          </Select>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            setSearchQuery('');
            setTypeFilter('all');
            setStatusFilter('all');
            setEntityFilter('all');
          }}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
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
                      <Skeleton className="h-4 w-32 rounded" />
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedDocuments.length > 0 ? (
                paginatedDocuments.map(document => (
                  <TableRow key={document.id} className="hover:bg-secondary-50/50">
                    {columns.map(column => (
                      <TableCell key={column.id} width={column.width}>
                        {column.accessor(document)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="flex flex-col items-center gap-4">
                      <FileText className="h-12 w-12 text-secondary-300" />
                      <div className="text-secondary-500">No documents found</div>
                      <Button variant="outline" size="sm" onClick={handleNewDocument}>
                        <Upload className="h-4 w-4 mr-1" />
                        Upload First Document
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Table.Body>
          </Table>
        </div>
        
        {/* Pagination */}
        {paginatedDocuments.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-200">
            <div className="text-sm text-secondary-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length} documents
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
            <DialogContent.Title>Delete Document</DialogContent.Title>
            <DialogContent.Description>
              Are you sure you want to delete this document? This action cannot be undone.
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
              Perform actions on {selectedDocuments.length} selected documents
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
      
      {/* Upload Sheet */}
      <Sheet open={showUploadSheet} onOpenChange={setShowUploadSheet}>
        <SheetContent side="center" className="w-full max-w-2xl">
          <SheetContent.Header>
            <SheetContent.Title>Upload Documents</SheetContent.Title>
            <SheetContent.Description>
              Upload one or more documents to the system
            </SheetContent.Description>
          </SheetContent.Header>
          
          <div className="py-4">
            {uploading ? (
              <div className="space-y-4">
                <Progress value={uploadProgress} />
                <div className="text-center text-secondary-600">
                  Uploading... {uploadProgress}%
                </div>
              </div>
            ) : (
              <FileUpload
                multiple
                accept="application/pdf,image/jpeg,image/png"
                onUpload={handleDocumentUpload}
                maxFiles={20}
                maxFileSize={10 * 1024 * 1024}
              >
                <div className="text-center py-12">
                  <Upload className="h-16 w-16 mx-auto text-primary-400 mb-4" />
                  <div className="text-xl font-medium text-primary-700 mb-2">Upload Documents</div>
                  <div className="text-secondary-600 mb-4">
                    Drag & drop files here or click to browse
                  </div>
                  <div className="text-sm text-secondary-500">
                    Supported: PDF, JPG, PNG<br />
                    Max size: 10MB per file<br />
                    Max files: 20
                  </div>
                </div>
              </FileUpload>
            )}
            
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium">Recently Uploaded Files</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-secondary-400" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <span className="text-xs text-secondary-600">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowUploadSheet(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Detail Sheet */}
      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent side="right" className="w-full max-w-2xl">
          <SheetContent.Header>
            <SheetContent.Title>Document Details</SheetContent.Title>
          </SheetContent.Header>
          {viewingDocument && (
            <div className="py-4 space-y-6">
              {/* Document Info */}
              <Card variant="bordered" className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-primary-100 rounded-lg">
                    {getDocumentIcon(viewingDocument.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{viewingDocument.name}</h3>
                    <div className="text-sm text-secondary-600">
                      {getDocumentTypeLabel(viewingDocument.type)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Document Type</div>
                    <Badge variant="primary">{getDocumentTypeLabel(viewingDocument.type)}</Badge>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Version</div>
                    <span className="font-medium">v{viewingDocument.version}</span>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Upload Date</div>
                    <span className="font-medium">{formatDate(viewingDocument.uploadDate)}</span>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">File Path</div>
                    <span className="font-medium text-xs">{viewingDocument.filePath}</span>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Verification Status</div>
                    {getVerificationBadge(viewingDocument.verified)}
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Entity</div>
                    {['passport', 'photo', 'education', 'experience'].includes(viewingDocument.type) ? (
                      <Badge variant="primary">Applicant</Badge>
                    ) : ['offer-letter', 'financial'].includes(viewingDocument.type) ? (
                      <Badge variant="info">Employer</Badge>
                    ) : (
                      <Badge variant="secondary">Case</Badge>
                    )}
                  </div>
                </div>
              </Card>
              
              {/* Verification Notes */}
              {viewingDocument.verificationNotes && (
                <Card variant="bordered" className="p-4">
                  <h3 className="font-semibold mb-4">Verification Notes</h3>
                  <div className="p-4 bg-secondary-50 rounded-lg">
                    <p className="text-secondary-700">{viewingDocument.verificationNotes}</p>
                  </div>
                </Card>
              )}
              
              {/* Metadata */}
              <Card variant="bordered" className="p-4">
                <h3 className="font-semibold mb-4">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">File URL</div>
                    <span className="font-medium text-xs">{viewingDocument.fileUrl || 'N/A'}</span>
                  </div>
                </div>
              </Card>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="outline" onClick={() => {
                  const link = document.createElement('a');
                  link.href = viewingDocument.filePath;
                  link.download = viewingDocument.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button onClick={() => {
                  // Mark as verified
                  setDocuments(documents.map(d =>
                    d.id === viewingDocument.id ? { ...d, verified: true, verificationNotes: 'Verified manually' } : d
                  ));
                  setShowDetailSheet(false);
                }}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Verified
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DocumentsPage;
