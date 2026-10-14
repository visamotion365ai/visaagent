import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, generateId, generateReferenceNumber, formatDate, getFromStorage, setToStorage, STORAGE_KEYS } from '@/lib/utils';
import { APP_CONFIG, COUNTRIES, VISA_TYPES, VISA_STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/constants';
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
  Folder, 
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
  Calendar,
  MapPin,
  Flag,
  Copy,
  Briefcase,
  Users,
  Globe,
  AlertCircle,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { generateCaseReportPDF } from '@/lib/pdf';
import type { VisaCase, Applicant, Employer, VisaType, VisaStatus, PaginationParams, PaginatedResponse } from '@/types';

// Sample applicants for reference
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
  {
    id: '2',
    referenceNumber: 'VISA-2024-002',
    firstName: 'Fatema',
    lastName: 'Khatun',
    bengaliName: '\u09ab\u09be\u09a4\u09c7\u09ae\u09be \u0996\u09be\u09a4\u09c1\u09a8',
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
];

// Sample employers for reference
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
  {
    id: '2',
    companyName: 'GreenField Agro Industries',
    companyBengaliName: '\u0997\u09cd\u09b0\u09c0\u09a8\u09ab\u09c7\u09b2\u09cd\u099f \u0986\u0997\u09cd\u09b0\u09cb \u0987\u09a8\u09cd\u099f\u09b8\u09c1\u099f\u09cd\u09b8',
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
    documents: [],
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
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
    documents: [
      {
        id: '1',
        name: 'Passport Copy',
        type: 'passport',
        filePath: '/documents/case-001-passport.pdf',
        fileUrl: '',
        uploadDate: '2024-01-15',
        verified: true,
        verificationNotes: 'Valid passport',
        version: 1,
      },
      {
        id: '2',
        name: 'Application Form',
        type: 'application',
        filePath: '/documents/case-001-application.pdf',
        fileUrl: '',
        uploadDate: '2024-01-18',
        verified: true,
        verificationNotes: 'Complete application',
        version: 1,
      },
      {
        id: '3',
        name: 'Offer Letter',
        type: 'offer-letter',
        filePath: '/documents/case-001-offer-letter.pdf',
        fileUrl: '',
        uploadDate: '2024-01-19',
        verified: true,
        verificationNotes: 'Valid offer from TechSolutions',
        version: 1,
      },
    ],
    checklists: [
      { id: '1', item: 'Passport Copy', category: 'Required Documents', required: true, completed: true, completionDate: '2024-01-15', completedBy: 'Agent 1', notes: '' },
      { id: '2', item: 'Application Form', category: 'Required Documents', required: true, completed: true, completionDate: '2024-01-18', completedBy: 'Agent 1', notes: '' },
      { id: '3', item: 'Offer Letter', category: 'Required Documents', required: true, completed: true, completionDate: '2024-01-19', completedBy: 'Agent 1', notes: '' },
      { id: '4', item: 'Financial Proof', category: 'Financial', required: true, completed: false, completionDate: '', completedBy: '', notes: 'Pending submission' },
      { id: '5', item: 'Medical Certificate', category: 'Medical', required: false, completed: false, completionDate: '', completedBy: '', notes: '' },
    ],
    notes: [
      { id: '1', content: 'Initial case submission', author: 'Agent 1', createdAt: '2024-01-20T10:00:00Z', isInternal: true },
      { id: '2', content: 'Documents verified', author: 'Agent 2', createdAt: '2024-01-22T14:00:00Z', isInternal: true },
    ],
    history: [
      { id: '1', action: 'Case Created', status: 'draft', author: 'Agent 1', timestamp: '2024-01-15T10:00:00Z', notes: '' },
      { id: '2', action: 'Submitted', status: 'submitted', author: 'Agent 1', timestamp: '2024-01-20T10:00:00Z', notes: 'All required documents uploaded' },
      { id: '3', action: 'Processing Started', status: 'processing', author: 'System', timestamp: '2024-01-22T12:00:00Z', notes: 'Case under review' },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-22T12:00:00Z',
  },
  {
    id: '2',
    referenceNumber: 'CASE-2024-002',
    applicantId: '2',
    employerId: '',
    visaType: 'student',
    targetCountry: 'uk',
    status: 'submitted',
    priority: 'medium',
    submissionDate: '2024-01-25',
    expectedDecisionDate: '2024-04-25',
    actualDecisionDate: '',
    decision: '',
    rejectionReason: '',
    documents: [
      {
        id: '1',
        name: 'Passport Copy',
        type: 'passport',
        filePath: '/documents/case-002-passport.pdf',
        fileUrl: '',
        uploadDate: '2024-01-20',
        verified: true,
        verificationNotes: 'Valid passport',
        version: 1,
      },
      {
        id: '2',
        name: 'Application Form',
        type: 'application',
        filePath: '/documents/case-002-application.pdf',
        fileUrl: '',
        uploadDate: '2024-01-22',
        verified: true,
        verificationNotes: 'Complete application',
        version: 1,
      },
    ],
    checklists: [
      { id: '1', item: 'Passport Copy', category: 'Required Documents', required: true, completed: true, completionDate: '2024-01-20', completedBy: 'Agent 1', notes: '' },
      { id: '2', item: 'Application Form', category: 'Required Documents', required: true, completed: true, completionDate: '2024-01-22', completedBy: 'Agent 1', notes: '' },
      { id: '3', item: 'IELTS Certificate', category: 'Language', required: true, completed: true, completionDate: '2024-01-23', completedBy: 'Agent 1', notes: '' },
      { id: '4', item: 'Financial Proof', category: 'Financial', required: true, completed: false, completionDate: '', completedBy: '', notes: 'Pending' },
    ],
    notes: [
      { id: '1', content: 'Student visa application for UK', author: 'Agent 1', createdAt: '2024-01-25T09:00:00Z', isInternal: true },
    ],
    history: [
      { id: '1', action: 'Case Created', status: 'draft', author: 'Agent 1', timestamp: '2024-01-20T09:00:00Z', notes: '' },
      { id: '2', action: 'Submitted', status: 'submitted', author: 'Agent 1', timestamp: '2024-01-25T09:00:00Z', notes: 'Ready for processing' },
    ],
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
  },
  {
    id: '3',
    referenceNumber: 'CASE-2024-003',
    applicantId: '1',
    employerId: '2',
    visaType: 'business',
    targetCountry: 'singapore',
    status: 'approved',
    priority: 'medium',
    submissionDate: '2024-01-10',
    expectedDecisionDate: '2024-02-10',
    actualDecisionDate: '2024-02-05',
    decision: 'Approved',
    rejectionReason: '',
    documents: [
      {
        id: '1',
        name: 'Passport Copy',
        type: 'passport',
        filePath: '/documents/case-003-passport.pdf',
        fileUrl: '',
        uploadDate: '2024-01-05',
        verified: true,
        verificationNotes: 'Valid passport',
        version: 1,
      },
      {
        id: '2',
        name: 'Application Form',
        type: 'application',
        filePath: '/documents/case-003-application.pdf',
        fileUrl: '',
        uploadDate: '2024-01-08',
        verified: true,
        verificationNotes: 'Complete application',
        version: 1,
      },
      {
        id: '3',
        name: 'Invitation Letter',
        type: 'other',
        filePath: '/documents/case-003-invitation.pdf',
        fileUrl: '',
        uploadDate: '2024-01-09',
        verified: true,
        verificationNotes: 'Business invitation',
        version: 1,
      },
    ],
    checklists: [
      { id: '1', item: 'Passport Copy', category: 'Required Documents', required: true, completed: true, completionDate: '2024-01-05', completedBy: 'Agent 1', notes: '' },
      { id: '2', item: 'Application Form', category: 'Required Documents', required: true, completed: true, completionDate: '2024-01-08', completedBy: 'Agent 1', notes: '' },
      { id: '3', item: 'Invitation Letter', category: 'Required Documents', required: true, completed: true, completionDate: '2024-01-09', completedBy: 'Agent 1', notes: '' },
      { id: '4', item: 'Financial Proof', category: 'Financial', required: true, completed: true, completionDate: '2024-01-09', completedBy: 'Agent 1', notes: '' },
    ],
    notes: [
      { id: '1', content: 'Business visa for Singapore conference', author: 'Agent 1', createdAt: '2024-01-10T08:00:00Z', isInternal: true },
      { id: '2', content: 'Approved by embassy', author: 'System', createdAt: '2024-02-05T10:00:00Z', isInternal: true },
    ],
    history: [
      { id: '1', action: 'Case Created', status: 'draft', author: 'Agent 1', timestamp: '2024-01-05T08:00:00Z', notes: '' },
      { id: '2', action: 'Submitted', status: 'submitted', author: 'Agent 1', timestamp: '2024-01-10T08:00:00Z', notes: '' },
      { id: '3', action: 'Processing Started', status: 'processing', author: 'System', timestamp: '2024-01-12T10:00:00Z', notes: '' },
      { id: '4', action: 'Approved', status: 'approved', author: 'System', timestamp: '2024-02-05T10:00:00Z', notes: 'Visa approved' },
    ],
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z',
  },
  {
    id: '4',
    referenceNumber: 'CASE-2024-004',
    applicantId: '2',
    employerId: '',
    visaType: 'tourist',
    targetCountry: 'malaysia',
    status: 'rejected',
    priority: 'low',
    submissionDate: '2024-01-01',
    expectedDecisionDate: '2024-02-01',
    actualDecisionDate: '2024-01-28',
    decision: 'Rejected',
    rejectionReason: 'Insufficient financial proof',
    documents: [
      {
        id: '1',
        name: 'Passport Copy',
        type: 'passport',
        filePath: '/documents/case-004-passport.pdf',
        fileUrl: '',
        uploadDate: '2023-12-28',
        verified: true,
        verificationNotes: 'Valid passport',
        version: 1,
      },
      {
        id: '2',
        name: 'Application Form',
        type: 'application',
        filePath: '/documents/case-004-application.pdf',
        fileUrl: '',
        uploadDate: '2023-12-30',
        verified: true,
        verificationNotes: 'Complete application',
        version: 1,
      },
    ],
    checklists: [
      { id: '1', item: 'Passport Copy', category: 'Required Documents', required: true, completed: true, completionDate: '2023-12-28', completedBy: 'Agent 1', notes: '' },
      { id: '2', item: 'Application Form', category: 'Required Documents', required: true, completed: true, completionDate: '2023-12-30', completedBy: 'Agent 1', notes: '' },
      { id: '3', item: 'Financial Proof', category: 'Financial', required: true, completed: true, completionDate: '2023-12-30', completedBy: 'Agent 1', notes: 'Insufficient balance' },
    ],
    notes: [
      { id: '1', content: 'Tourist visa for Malaysia', author: 'Agent 1', createdAt: '2024-01-01T08:00:00Z', isInternal: true },
      { id: '2', content: 'Rejected due to insufficient funds', author: 'System', createdAt: '2024-01-28T10:00:00Z', isInternal: true },
    ],
    history: [
      { id: '1', action: 'Case Created', status: 'draft', author: 'Agent 1', timestamp: '2023-12-28T08:00:00Z', notes: '' },
      { id: '2', action: 'Submitted', status: 'submitted', author: 'Agent 1', timestamp: '2024-01-01T08:00:00Z', notes: '' },
      { id: '3', action: 'Processing Started', status: 'processing', author: 'System', timestamp: '2024-01-02T10:00:00Z', notes: '' },
      { id: '4', action: 'Rejected', status: 'rejected', author: 'System', timestamp: '2024-01-28T10:00:00Z', notes: 'Insufficient financial proof' },
    ],
    createdAt: '2023-12-28T08:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z',
  },
  {
    id: '5',
    referenceNumber: 'CASE-2024-005',
    applicantId: '1',
    employerId: '1',
    visaType: 'work',
    targetCountry: 'canada',
    status: 'draft',
    priority: 'urgent',
    submissionDate: '',
    expectedDecisionDate: '',
    actualDecisionDate: '',
    decision: '',
    rejectionReason: '',
    documents: [],
    checklists: [
      { id: '1', item: 'Passport Copy', category: 'Required Documents', required: true, completed: false, completionDate: '', completedBy: '', notes: '' },
      { id: '2', item: 'Application Form', category: 'Required Documents', required: true, completed: false, completionDate: '', completedBy: '', notes: '' },
      { id: '3', item: 'Offer Letter', category: 'Required Documents', required: true, completed: false, completionDate: '', completedBy: '', notes: '' },
    ],
    notes: [],
    history: [
      { id: '1', action: 'Case Created', status: 'draft', author: 'Agent 1', timestamp: '2024-01-30T10:00:00Z', notes: 'Draft case for Canada work visa' },
    ],
    createdAt: '2024-01-30T10:00:00Z',
    updatedAt: '2024-01-30T10:00:00Z',
  },
];

// Helper functions
const getCountryName = (code: string) => {
  const country = COUNTRIES.find(c => c.id === code);
  return country ? country.name : code.toUpperCase();
};

const getVisaTypeLabel = (type: VisaType) => {
  const visaType = VISA_TYPES.find(v => v.id === type);
  return visaType ? visaType.label.en : type;
};

const getApplicantName = (applicantId: string) => {
  const applicant = sampleApplicants.find(a => a.id === applicantId);
  return applicant ? `${applicant.firstName} ${applicant.lastName}` : 'Unknown';
};

const getEmployerName = (employerId: string) => {
  const employer = sampleEmployers.find(e => e.id === employerId);
  return employer ? employer.companyName : 'None';
};

export interface CasesPageProps {
  mode?: 'list' | 'new' | 'edit' | 'view';
}

export const CasesPage: React.FC<CasesPageProps> = ({
  mode = 'list',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const { language } = useApp();
  
  // State for cases
  const [cases, setCases] = useState<VisaCase[]>(sampleCases);
  const [filteredCases, setFilteredCases] = useState<VisaCase[]>(sampleCases);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<VisaCase>>({
    visaType: 'tourist',
    targetCountry: 'usa',
    status: 'draft',
    priority: 'medium',
    submissionDate: '',
    expectedDecisionDate: '',
    actualDecisionDate: '',
    decision: '',
    rejectionReason: '',
    applicantId: '',
    employerId: '',
    documents: [],
    checklists: [],
    notes: [],
    history: [],
  });
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VisaStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [visaTypeFilter, setVisaTypeFilter] = useState<'all' | VisaType>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'reference' | 'date' | 'status' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Dialog and Sheet states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkActionsSheet, setShowBulkActionsSheet] = useState(false);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [editingCase, setEditingCase] = useState<VisaCase | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [viewingCase, setViewingCase] = useState<VisaCase | null>(null);
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setCases(sampleCases);
        setFilteredCases(sampleCases);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load cases');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter cases
  useEffect(() => {
    let result = [...cases];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(caseItem =>
        caseItem.referenceNumber.toLowerCase().includes(query) ||
        getApplicantName(caseItem.applicantId).toLowerCase().includes(query) ||
        getEmployerName(caseItem.employerId || '').toLowerCase().includes(query) ||
        getVisaTypeLabel(caseItem.visaType).toLowerCase().includes(query) ||
        getCountryName(caseItem.targetCountry).toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(caseItem => caseItem.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(caseItem => caseItem.priority === priorityFilter);
    }
    
    // Apply visa type filter
    if (visaTypeFilter !== 'all') {
      result = result.filter(caseItem => caseItem.visaType === visaTypeFilter);
    }
    
    // Apply country filter
    if (countryFilter !== 'all') {
      result = result.filter(caseItem => caseItem.targetCountry === countryFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'reference':
          return sortOrder === 'asc'
            ? a.referenceNumber.localeCompare(b.referenceNumber)
            : b.referenceNumber.localeCompare(a.referenceNumber);
        case 'status':
          return sortOrder === 'asc'
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return sortOrder === 'asc'
            ? (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
            : (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'date':
        default:
          return sortOrder === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    setFilteredCases(result);
    setCurrentPage(1);
  }, [cases, searchQuery, statusFilter, priorityFilter, visaTypeFilter, countryFilter, sortBy, sortOrder]);
  
  // Handle edit
  useEffect(() => {
    if (mode === 'edit' && params.id) {
      const caseItem = cases.find(c => c.id === params.id);
      if (caseItem) {
        setEditingCase(caseItem);
        setFormData(caseItem);
        setShowFormSheet(true);
      }
    } else if (mode === 'new') {
      setFormData({
        visaType: 'tourist',
        targetCountry: 'usa',
        status: 'draft',
        priority: 'medium',
        submissionDate: '',
        expectedDecisionDate: '',
        actualDecisionDate: '',
        decision: '',
        rejectionReason: '',
        applicantId: '',
        employerId: '',
        documents: [],
        checklists: [],
        notes: [],
        history: [],
      });
      setEditingCase(null);
      setShowFormSheet(true);
    }
  }, [mode, params.id, cases]);
  
  // Pagination
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const newCase: VisaCase = {
        id: editingCase?.id || generateId(),
        referenceNumber: editingCase?.referenceNumber || generateReferenceNumber('CASE'),
        visaType: formData.visaType || 'tourist',
        targetCountry: formData.targetCountry || 'usa',
        status: formData.status || 'draft',
        priority: formData.priority || 'medium',
        submissionDate: formData.submissionDate || '',
        expectedDecisionDate: formData.expectedDecisionDate || '',
        actualDecisionDate: formData.actualDecisionDate || '',
        decision: formData.decision || '',
        rejectionReason: formData.rejectionReason || '',
        applicantId: formData.applicantId || '',
        employerId: formData.employerId || '',
        documents: formData.documents || [],
        checklists: formData.checklists || [],
        notes: formData.notes || [],
        history: formData.history || [],
        createdAt: editingCase?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (editingCase) {
        // Update existing
        setCases(cases.map(c => c.id === editingCase.id ? newCase : c));
      } else {
        // Add new
        setCases([newCase, ...cases]);
      }
      
      setShowFormSheet(false);
      navigate('/cases');
      
    } catch (err) {
      setError('Failed to save case');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setCases(cases.filter(c => c.id !== id));
      setShowDeleteDialog(false);
      setDeletingId(null);
    } catch (err) {
      setError('Failed to delete case');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      setCases(cases.filter(c => !selectedCases.includes(c.id)));
      setSelectedCases([]);
      setShowBulkActionsSheet(false);
    } catch (err) {
      setError('Failed to delete selected cases');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle row selection
  const handleSelectRow = (id: string) => {
    setSelectedCases(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  // Handle select all
  const handleSelectAll = () => {
    if (selectedCases.length === paginatedCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(paginatedCases.map(c => c.id));
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: VisaStatus) => {
    const config = VISA_STATUS_CONFIG[status];
    if (!config) return <Badge variant="secondary">{status}</Badge>;
    return (
      <Badge variant={config.color.includes('green') ? 'success' : config.color.includes('red') ? 'danger' : config.color.includes('yellow') ? 'warning' : 'secondary'}>n        {config.label.en}
      </Badge>
    );
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
    if (!config) return <Badge variant="secondary">{priority}</Badge>;
    return (
      <Badge variant={config.color.includes('red') ? 'danger' : config.color.includes('orange') ? 'warning' : config.color.includes('yellow') ? 'warning' : 'primary'}>n        {config.label.en}
      </Badge>
    );
  };
  
  // Format date
  const formatDateDisplay = (date: string) => {
    if (!date) return 'N/A';
    return formatDate(date);
  };
  
  // Generate PDF
  const handleGeneratePDF = async (caseItem: VisaCase) => {
    try {
      setIsLoading(true);
      const applicant = sampleApplicants.find(a => a.id === caseItem.applicantId);
      const employer = caseItem.employerId ? sampleEmployers.find(e => e.id === caseItem.employerId) : undefined;
      
      if (applicant) {
        const pdf = await generateCaseReportPDF(caseItem, applicant, employer);
        // Download the PDF
        const link = document.createElement('a');
        link.href = pdf.content;
        link.download = `Case_Report_${caseItem.referenceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setError('Failed to generate PDF');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigation handlers
  const handleNewCase = () => {
    navigate('/cases/new');
  };
  
  const handleEditCase = (caseItem: VisaCase) => {
    navigate(`/cases/${caseItem.id}/edit`);
  };
  
  const handleViewCase = (caseItem: VisaCase) => {
    setViewingCase(caseItem);
    setShowDetailSheet(true);
  };
  
  const handleBack = () => {
    navigate('/cases');
    setShowFormSheet(false);
    setShowDetailSheet(false);
    setEditingCase(null);
    setViewingCase(null);
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
  
  const handleMenuAction = (action: string, caseItem: VisaCase) => {
    switch (action) {
      case 'view':
        handleViewCase(caseItem);
        break;
      case 'edit':
        handleEditCase(caseItem);
        break;
      case 'pdf':
        handleGeneratePDF(caseItem);
        break;
      case 'delete':
        setDeletingId(caseItem.id);
        setShowDeleteDialog(true);
        break;
    }
  };
  
  // Bulk menu items
  const bulkMenuItems: DropdownMenuItemType[] = [
    { id: 'export', label: 'Export Selected', icon: <Download className="h-4 w-4" /> },
    { id: 'pdf', label: 'Generate PDFs', icon: <FileText className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete Selected', icon: <Trash2 className="h-4 w-4" />, disabled: selectedCases.length === 0 },
  ];
  
  const handleBulkMenuAction = (action: string) => {
    switch (action) {
      case 'delete':
        setShowBulkActionsSheet(false);
        if (confirm(`Are you sure you want to delete ${selectedCases.length} cases?`)) {
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
  const totalCases = cases.length;
  const draftCases = cases.filter(c => c.status === 'draft').length;
  const submittedCases = cases.filter(c => c.status === 'submitted').length;
  const processingCases = cases.filter(c => c.status === 'processing').length;
  const approvedCases = cases.filter(c => c.status === 'approved').length;
  const rejectedCases = cases.filter(c => c.status === 'rejected').length;
  
  // Column definitions
  const columns = [
    {
      id: 'select',
      header: <input type="checkbox" checked={selectedCases.length === paginatedCases.length && paginatedCases.length > 0} onChange={handleSelectAll} />,
      accessor: (item: VisaCase) => (
        <input type="checkbox" checked={selectedCases.includes(item.id)} onChange={() => handleSelectRow(item.id)} />
      ),
      width: '50px',
    },
    {
      id: 'reference',
      header: 'Case Reference',
      accessor: (item: VisaCase) => (
        <div className="font-medium text-primary-600">
          {item.referenceNumber}
        </div>
      ),
      width: '150px',
      sortable: true,
    },
    {
      id: 'applicant',
      header: 'Applicant',
      accessor: (item: VisaCase) => (
        <div className="text-sm">
          {getApplicantName(item.applicantId)}
        </div>
      ),
      width: '200px',
    },
    {
      id: 'visaType',
      header: 'Visa Type',
      accessor: (item: VisaCase) => (
        <Badge variant="primary" size="sm">
          {getVisaTypeLabel(item.visaType)}
        </Badge>
      ),
      width: '120px',
    },
    {
      id: 'country',
      header: 'Country',
      accessor: (item: VisaCase) => (
        <div className="flex items-center gap-1">
          <span>{getCountryName(item.targetCountry)}</span>
        </div>
      ),
      width: '120px',
    },
    {
      id: 'employer',
      header: 'Employer',
      accessor: (item: VisaCase) => (
        <div className="text-sm">
          {getEmployerName(item.employerId || '')}
        </div>
      ),
      width: '180px',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item: VisaCase) => getStatusBadge(item.status),
      width: '120px',
      sortable: true,
    },
    {
      id: 'priority',
      header: 'Priority',
      accessor: (item: VisaCase) => getPriorityBadge(item.priority),
      width: '100px',
      sortable: true,
    },
    {
      id: 'submissionDate',
      header: 'Submitted',
      accessor: (item: VisaCase) => (
        <div className="text-sm text-secondary-600">
          {formatDateDisplay(item.submissionDate)}
        </div>
      ),
      width: '120px',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (item: VisaCase) => (
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
              <Folder className="h-6 w-6" />
              Visa Cases Management
            </h1>
            <p className="text-secondary-600 mt-1">
              Track and manage all visa applications and cases
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBulkActionsSheet(true)} disabled={selectedCases.length === 0}>
              <Upload className="h-4 w-4 mr-1" />
              Bulk Actions ({selectedCases.length})
            </Button>
            <Button size="sm" onClick={handleNewCase}>
              <Folder className="h-4 w-4 mr-1" />
              New Case
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
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6"
      >
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Folder className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-900">{totalCases}</div>
              <div className="text-sm text-secondary-600">Total Cases</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <FileText className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary-900">{draftCases}</div>
              <div className="text-sm text-secondary-600">Draft</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{submittedCases + processingCases}</div>
              <div className="text-sm text-secondary-600">In Progress</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{approvedCases}</div>
              <div className="text-sm text-secondary-600">Approved</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{rejectedCases}</div>
              <div className="text-sm text-secondary-600">Rejected</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{cases.filter(c => c.priority === 'urgent').length}</div>
              <div className="text-sm text-secondary-600">Urgent</div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Filters */}
      <Card className="p-4 mb-6" variant="bordered">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <Input
              placeholder="Search cases..."
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
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option value="submitted">Submitted</Select.Option>
            <Select.Option value="processing">Processing</Select.Option>
            <Select.Option value="approved">Approved</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
            <Select.Option value="expired">Expired</Select.Option>
          </Select>
          <Select
            value={priorityFilter}
            onValueChange={(v) => setPriorityFilter(v as any)}
            placeholder="Priority"
          >
            <Select.Option value="all">All Priorities</Select.Option>
            <Select.Option value="low">Low</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="high">High</Select.Option>
            <Select.Option value="urgent">Urgent</Select.Option>
          </Select>
          <Select
            value={visaTypeFilter}
            onValueChange={(v) => setVisaTypeFilter(v as any)}
            placeholder="Visa Type"
          >
            <Select.Option value="all">All Types</Select.Option>
            {VISA_TYPES.map(vt => (
              <Select.Option key={vt.id} value={vt.id}>{vt.label.en}</Select.Option>
            ))}
          </Select>
          <Select
            value={countryFilter}
            onValueChange={(v) => setCountryFilter(v)}
            placeholder="Country"
          >
            <Select.Option value="all">All Countries</Select.Option>
            {COUNTRIES.map(c => (
              <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
            ))}
          </Select>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setPriorityFilter('all');
            setVisaTypeFilter('all');
            setCountryFilter('all');
          }}>
            <X className="h-4 w-4 mr-1" />
            Clear Filters
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
                    <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedCases.length > 0 ? (
                paginatedCases.map(caseItem => (
                  <TableRow key={caseItem.id} className="hover:bg-secondary-50/50">
                    {columns.map(column => (
                      <TableCell key={column.id} width={column.width}>
                        {column.accessor(caseItem)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="flex flex-col items-center gap-4">
                      <Folder className="h-12 w-12 text-secondary-300" />
                      <div className="text-secondary-500">No cases found</div>
                      <Button variant="outline" size="sm" onClick={handleNewCase}>
                        <Folder className="h-4 w-4 mr-1" />
                        Create First Case
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Table.Body>
          </Table>
        </div>
        
        {/* Pagination */}
        {paginatedCases.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-200">
            <div className="text-sm text-secondary-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredCases.length)} of {filteredCases.length} cases
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
            <DialogContent.Title>Delete Case</DialogContent.Title>
            <DialogContent.Description>
              Are you sure you want to delete this case? This action cannot be undone.
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
              Perform actions on {selectedCases.length} selected cases
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
            <SheetContent.Title>Case Details</SheetContent.Title>
          </SheetContent.Header>
          {viewingCase && (
            <div className="py-4 space-y-6">
              {/* Case Info */}
              <Card variant="bordered" className="p-4">
                <h3 className="font-semibold mb-4">Case Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Reference Number</div>
                    <div className="font-medium">{viewingCase.referenceNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Status</div>
                    {getStatusBadge(viewingCase.status)}
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Visa Type</div>
                    <Badge variant="primary">{getVisaTypeLabel(viewingCase.visaType)}</Badge>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Priority</div>
                    {getPriorityBadge(viewingCase.priority)}
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Target Country</div>
                    <div className="font-medium">{getCountryName(viewingCase.targetCountry)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Applicant</div>
                    <div className="font-medium">{getApplicantName(viewingCase.applicantId)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Employer</div>
                    <div className="font-medium">{getEmployerName(viewingCase.employerId || '')}</div>
                  </div>
                </div>
              </Card>
              
              {/* Dates */}
              <Card variant="bordered" className="p-4">
                <h3 className="font-semibold mb-4">Important Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Submission Date</div>
                    <div className="font-medium">{formatDateDisplay(viewingCase.submissionDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Expected Decision</div>
                    <div className="font-medium">{formatDateDisplay(viewingCase.expectedDecisionDate)}</div>
                  </div>
                  {viewingCase.actualDecisionDate && (
                    <div>
                      <div className="text-sm text-secondary-600 mb-1">Actual Decision</div>
                      <div className="font-medium">{formatDateDisplay(viewingCase.actualDecisionDate)}</div>
                    </div>
                  )}
                  {viewingCase.decision && (
                    <div>
                      <div className="text-sm text-secondary-600 mb-1">Decision</div>
                      <div className="font-medium">{viewingCase.decision}</div>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Rejection Reason */}
              {viewingCase.rejectionReason && (
                <Card variant="bordered" className="p-4">
                  <h3 className="font-semibold mb-4">Rejection Information</h3>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-red-700 font-medium mb-2">Rejection Reason:</div>
                    <div className="text-red-600">{viewingCase.rejectionReason}</div>
                  </div>
                </Card>
              )}
              
              {/* Checklist */}
              <Card variant="bordered" className="p-4">
                <h3 className="font-semibold mb-4">Checklist</h3>
                <div className="space-y-2">
                  {viewingCase.checklists.map(checklist => (
                    <div
                      key={checklist.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg',
                        checklist.completed ? 'bg-green-50' : 'bg-secondary-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checklist.completed}
                          readOnly
                          className="h-4 w-4"
                        />
                        <div>
                          <div className="font-medium">{checklist.item}</div>
                          <div className="text-xs text-secondary-600">{checklist.category}</div>
                        </div>
                      </div>
                      {checklist.completed && (
                        <div className="text-xs text-secondary-500">
                          Completed on {formatDateDisplay(checklist.completionDate || '')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <div className="text-sm">
                    <span className="font-medium">
                      {viewingCase.checklists.filter(c => c.completed).length}/{viewingCase.checklists.length} completed
                    </span>
                    {viewingCase.checklists.filter(c => c.required && !c.completed).length > 0 && (
                      <span className="text-red-500 ml-2">
                        ({viewingCase.checklists.filter(c => c.required && !c.completed).length} required incomplete)
                      </span>
                    )}
                  </div>
                </div>
              </Card>
              
              {/* Documents */}
              {viewingCase.documents && viewingCase.documents.length > 0 && (
                <Card variant="bordered" className="p-4">
                  <h3 className="font-semibold mb-4">Documents ({viewingCase.documents.length})</h3>
                  <div className="space-y-2">
                    {viewingCase.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-secondary-400" />
                          <div>
                            <div className="text-sm font-medium">{doc.name}</div>
                            <div className="text-xs text-secondary-500">
                              Type: {doc.type} | Version: {doc.version}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.verified ? (
                            <Badge variant="success" size="xs">Verified</Badge>
                          ) : (
                            <Badge variant="warning" size="xs">Pending</Badge>
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
              
              {/* Notes */}
              {viewingCase.notes && viewingCase.notes.length > 0 && (
                <Card variant="bordered" className="p-4">
                  <h3 className="font-semibold mb-4">Internal Notes</h3>
                  <div className="space-y-3">
                    {viewingCase.notes.map(note => (
                      <div key={note.id} className="p-3 bg-secondary-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{note.author}</div>
                          <div className="text-xs text-secondary-500">{formatDate(note.createdAt)}</div>
                        </div>
                        <div className="text-sm mt-1">{note.content}</div>
                        {note.isInternal && (
                          <div className="text-xs text-secondary-400 mt-1">Internal note</div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              
              {/* History */}
              <Card variant="bordered" className="p-4">
                <h3 className="font-semibold mb-4">Case History</h3>
                <div className="space-y-3">
                  {viewingCase.history.map((history, index) => (
                    <div key={history.id} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{history.action}</div>
                        <div className="text-sm text-secondary-600">
                          {history.timestamp} by {history.author}
                        </div>
                        {history.notes && (
                          <div className="text-sm text-secondary-500 mt-1">{history.notes}</div>
                        )}
                        <div className="mt-2">
                          {getStatusBadge(history.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Metadata */}
              <Card variant="bordered" className="p-4">
                <h3 className="font-semibold mb-4">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Created At</div>
                    <div className="font-medium">{formatDate(viewingCase.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Updated At</div>
                    <div className="font-medium">{formatDate(viewingCase.updatedAt)}</div>
                  </div>
                </div>
              </Card>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={() => handleEditCase(viewingCase)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => handleGeneratePDF(viewingCase)}>
                  <FileText className="h-4 w-4 mr-1" />
                  Generate Report
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CasesPage;
