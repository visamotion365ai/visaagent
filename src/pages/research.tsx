import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, generateId, formatDate, getFromStorage, setToStorage, STORAGE_KEYS } from '@/lib/utils';
import { APP_CONFIG, AI_CONFIG } from '@/lib/constants';
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
  Textarea,
  Tabs
} from '@/components/ui';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Globe,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Upload,
  Copy,
  FileText,
  Link,
  ExternalLink,
  Check,
  X,
  SortAsc,
  SortDesc,
  Sparkles,
  Lightbulb,
  BookOpen,
  Brain
} from 'lucide-react';
import type { 
  ResearchRequest, 
  ResearchResult,
  PaginationParams,
  PaginatedResponse
} from '@/types';

// Sample research requests
const sampleResearchRequests: ResearchRequest[] = [
  {
    id: '1',
    url: 'https://www.gov.uk/apply-to-come-to-the-uk',
    query: 'UK student visa requirements for Bangladesh citizens 2024',
    language: 'bn',
    status: 'completed',
    result: {
      title: 'UK Student Visa Requirements 2024',
      summary: 'Complete guide to UK student visa requirements for Bangladeshi students including IELTS, financial proof, and CAS letter.',
      content: `
# UK Student Visa Requirements 2024 for Bangladesh Citizens

## Overview
The UK Student Visa allows Bangladeshi students to study at recognized educational institutions in the United Kingdom. This guide covers all requirements for 2024.

## Key Requirements

### 1. Confirmation of Acceptance for Studies (CAS)
- Must be issued by a licensed Tier 4 sponsor
- Valid for 6 months from date of issue
- Contains your personal details and course information

### 2. Financial Requirements
- Course fees: First year tuition fees (varies by institution)
- Living costs: £1,334 per month for London, £1,023 per month for outside London
- Minimum 28 days of funds required
- Acceptable financial proof: Bank statements, loan letters, scholarship letters

### 3. English Language Requirements
- IELTS Academic: Minimum 5.5 overall with no band less than 5.5
- TOEFL iBT: Minimum 72 overall
- PTE Academic: Minimum 59 overall
- Some universities may have higher requirements

### 4. Academic Requirements
- Unconditional offer from a recognized UK institution
- Academic transcripts and certificates
- Reference letters from previous institutions

### 5. Tuberculosis (TB) Test
- Required for all applicants from Bangladesh
- Must be done at an approved clinic
- Certificate valid for 6 months

### 6. Passport and Photographs
- Valid passport with at least 6 months validity
- 2 recent passport-sized photographs
- Biometric information (fingerprints and photograph)

## Application Process

1. **Receive CAS**: From your chosen university (usually 3-4 months before course start)
2. **Prepare Documents**: Gather all required documents
3. **Pay Application Fee**: £490 for student visa (outside UK)
4. **Pay Immigration Health Surcharge**: £776 per year
5. **Submit Online Application**: On UK Visas and Immigration website
6. **Book Biometrics Appointment**: At VFS Global in Dhaka
7. **Attend Interview**: If required by the visa officer
8. **Wait for Decision**: Usually 3-6 weeks processing time

## Processing Time
- Standard: 3-6 weeks
- Priority: 5 working days (additional £500)
- Super Priority: Next working day (additional £800)

## Visa Fees
- Student Visa: £490
- Immigration Health Surcharge: £776 per year
- Priority Processing: £500
- Super Priority Processing: £800

## Success Rate
- Overall success rate for Bangladeshi students: 85%
- Higher for students with complete documentation
- Lower for applications with missing information

## Common Reasons for Rejection
1. Insufficient funds
2. Invalid CAS
3. Low IELTS score
4. Incomplete application form
5. Missing documents
6. Previous visa refusals

## Tips for Success
- Apply early (at least 3 months before course start)
- Double-check all documents
- Ensure sufficient funds in your account
- Prepare for the visa interview
- Be honest in your application
- Seek professional advice if needed

## Useful Links
- [UK Government Visa Website](https://www.gov.uk/student-visa)
- [VFS Global Bangladesh](https://www.vfsglobal.co.uk/bangladesh)
- [British Council Bangladesh](https://www.britishcouncil.org.bd)
      `,
      language: 'bn',
      extractedData: {
        visaType: 'student',
        country: 'UK',
        fees: { application: 490, healthSurcharge: 776 },
        processingTime: '3-6 weeks',
        successRate: 85,
        requirements: ['CAS', 'Financial Proof', 'IELTS', 'Academic Documents', 'TB Test'],
      },
      screenshots: [],
    },
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:05:00Z',
  },
  {
    id: '2',
    url: 'https://travel.gc.ca/visiting/visas',
    query: 'Canada tourist visa requirements and processing time',
    language: 'en',
    status: 'completed',
    result: {
      title: 'Canada Tourist Visa Requirements',
      summary: 'Complete information about Canada visitor visa requirements, processing times, and application process for tourists.',
      content: `
# Canada Tourist Visa (Visitor Visa) Requirements

## Overview
The Canada Visitor Visa (also known as a Temporary Resident Visa) allows foreign nationals to visit Canada for tourism, family visits, or business purposes.

## Eligibility
- Valid passport
- Good health
- No criminal record
- Proof of ties to home country
- Sufficient funds for the trip
- Invitation letter (if applicable)

## Required Documents

### Mandatory Documents
1. **Valid Passport**: Must be valid for the duration of your stay
2. **Application Form**: IMM 5257 (Application for Visitor Visa)
3. **Passport Photos**: 2 recent photographs (35mm x 45mm)
4. **Proof of Financial Support**: Bank statements, employment letter, property documents
5. **Travel Itinerary**: Flight bookings, hotel reservations, travel plans

### Supporting Documents
1. **Invitation Letter**: From Canadian host (if applicable)
2. **Employment Letter**: From your employer stating position, salary, and leave approval
3. **Property Documents**: Proof of property ownership in home country
4. **Family Documents**: Marriage certificate, birth certificates of children
5. **Previous Travel History**: Passport copies showing previous travel

## Financial Requirements
- Minimum CAD $100 per day of stay
- Or CAD $4,000 for the entire trip (whichever is less)
- Additional funds required if staying with friends/relatives
- Bank statements must show consistent balance for at least 6 months

## Processing Time
- Standard processing: 14-20 days
- Varies by country and time of year
- Can be longer during peak travel seasons
- Check current processing times on IRCC website

## Visa Fees
- Single entry: CAD $100
- Multiple entry: CAD $100
- Family (5+ members): CAD $500 maximum
- Biometrics: CAD $85 per person

## Visa Validity
- Single entry: Up to 6 months
- Multiple entry: Up to 10 years or passport expiry (whichever is earlier)
- Maximum stay per visit: 6 months

## Biometrics
- Required for applicants aged 14-79
- Must be given at a Visa Application Centre (VAC)
- Valid for 10 years for multiple applications
- Fee: CAD $85 per person

## Application Process
1. **Check Eligibility**: Ensure you meet all requirements
2. **Complete Application**: Fill out form IMM 5257 online
3. **Pay Fees**: Pay visa and biometrics fees online
4. **Submit Application**: Online through IRCC portal
5. **Book Biometrics**: Schedule appointment at VAC
6. **Submit Passport**: If requested by visa office
7. **Wait for Decision**: Processing takes 14-20 days

## Common Reasons for Rejection
1. Insufficient proof of ties to home country
2. Insufficient funds
3. Incomplete application
4. Previous visa refusals
5. Criminal record
6. Health issues
7. Doubt about intention to return

## Tips for Success
- Apply at least 2-3 months before planned travel
- Show strong ties to home country (job, property, family)
- Provide complete and accurate information
- Include detailed travel itinerary
- Show sufficient funds in bank account
- Be prepared for interview if requested

## Useful Links
- [IRCC Official Website](https://www.canada.ca/en/immigration-refugees-citizenship.html)
- [VAC Bangladesh](https://www.vfsglobal.ca/canada/bangladesh)
- [Canada Visa Application Centre](https://www.cic.gc.ca)
      `,
      language: 'en',
      extractedData: {
        visaType: 'tourist',
        country: 'Canada',
        fees: { application: 100, biometrics: 85 },
        processingTime: '14-20 days',
        validity: 'Up to 6 months',
        requirements: ['Passport', 'Application Form', 'Photos', 'Financial Proof', 'Itinerary'],
      },
      screenshots: [],
    },
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:35:00Z',
  },
  {
    id: '3',
    url: 'https://www.malaysia.my',
    query: 'Malaysia tourist visa requirements for Bangladesh passport holders',
    language: 'bn',
    status: 'processing',
    result: undefined,
    createdAt: '2024-01-28T09:00:00Z',
    updatedAt: '2024-01-28T09:00:00Z',
  },
  {
    id: '4',
    url: 'https://www.usa.gov/visas',
    query: 'US B1/B2 visa interview questions and preparation tips',
    language: 'en',
    status: 'pending',
    result: undefined,
    createdAt: '2024-01-27T11:00:00Z',
    updatedAt: '2024-01-27T11:00:00Z',
  },
  {
    id: '5',
    url: 'https://www.studyinaustralia.gov.au',
    query: 'Australia student visa subclass 500 requirements and checklist',
    language: 'en',
    status: 'failed',
    result: undefined,
    createdAt: '2024-01-26T16:00:00Z',
    updatedAt: '2024-01-26T16:05:00Z',
  },
];

// Language options
const languageOptions = [
  { value: 'bn', label: 'Bengali (বাংলা)' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic (العربية)' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'ur', label: 'Urdu (اردو)' },
];

// Status options
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

export interface ResearchPageProps {
  mode?: 'list' | 'new' | 'view';
}

export const ResearchPage: React.FC<ResearchPageProps> = ({
  mode = 'list',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const { language } = useApp();
  
  // State for research requests
  const [researchRequests, setResearchRequests] = useState<ResearchRequest[]>(sampleResearchRequests);
  const [filteredRequests, setFilteredRequests] = useState<ResearchRequest[]>(sampleResearchRequests);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<ResearchRequest>>({
    url: '',
    query: '',
    language: language || 'bn',
    status: 'pending',
  });
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'url'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Dialog and Sheet states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkActionsSheet, setShowBulkActionsSheet] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFormSheet, setShowFormSheet] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ResearchRequest | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<ResearchRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setResearchRequests(sampleResearchRequests);
        setFilteredRequests(sampleResearchRequests);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load research requests');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter requests
  useEffect(() => {
    let result = [...researchRequests];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(req =>
        req.url.toLowerCase().includes(query) ||
        req.query.toLowerCase().includes(query) ||
        (req.result?.title && req.result.title.toLowerCase().includes(query)) ||
        (req.result?.summary && req.result.summary.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(req => req.status === statusFilter);
    }
    
    // Apply language filter
    if (languageFilter !== 'all') {
      result = result.filter(req => req.language === languageFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'url':
          return sortOrder === 'asc'
            ? a.url.localeCompare(b.url)
            : b.url.localeCompare(a.url);
        case 'status':
          return sortOrder === 'asc'
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        case 'date':
        default:
          return sortOrder === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    setFilteredRequests(result);
    setCurrentPage(1);
  }, [researchRequests, searchQuery, statusFilter, languageFilter, sortBy, sortOrder]);
  
  // Handle edit
  useEffect(() => {
    if (mode === 'edit' && params.id) {
      const request = researchRequests.find(r => r.id === params.id);
      if (request) {
        setEditingRequest(request);
        setFormData(request);
        setShowFormSheet(true);
      }
    } else if (mode === 'new') {
      setFormData({
        url: '',
        query: '',
        language: language || 'bn',
        status: 'pending',
      });
      setEditingRequest(null);
      setShowFormSheet(true);
    } else if (mode === 'view' && params.id) {
      const request = researchRequests.find(r => r.id === params.id);
      if (request) {
        setViewingRequest(request);
        setShowDetailSheet(true);
      }
    }
  }, [mode, params.id, researchRequests, language]);
  
  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const newRequest: ResearchRequest = {
        id: editingRequest?.id || generateId(),
        url: formData.url || '',
        query: formData.query || '',
        language: formData.language || 'bn',
        status: 'pending',
        result: undefined,
        createdAt: editingRequest?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (editingRequest) {
        // Update existing
        setResearchRequests(researchRequests.map(r => r.id === editingRequest.id ? newRequest : r));
      } else {
        // Add new
        setResearchRequests([newRequest, ...researchRequests]);
      }
      
      setShowFormSheet(false);
      navigate('/research');
      
    } catch (err) {
      setError('Failed to save research request');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      setResearchRequests(researchRequests.filter(r => r.id !== id));
      setShowDeleteDialog(false);
      setDeletingId(null);
    } catch (err) {
      setError('Failed to delete research request');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      setResearchRequests(researchRequests.filter(r => !selectedRequests.includes(r.id)));
      setSelectedRequests([]);
      setShowBulkActionsSheet(false);
    } catch (err) {
      setError('Failed to delete selected requests');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle row selection
  const handleSelectRow = (id: string) => {
    setSelectedRequests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  // Handle select all
  const handleSelectAll = () => {
    if (selectedRequests.length === paginatedRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(paginatedRequests.map(r => r.id));
    }
  };
  
  // Process research request (simulate AI research)
  const handleProcessRequest = async (request: ResearchRequest) => {
    try {
      setIsProcessing(true);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a sample result based on the URL
      const sampleResults: Record<string, ResearchResult> = {
        'https://www.gov.uk/apply-to-come-to-the-uk': {
          title: 'UK Visa Information - Official Government Site',
          summary: 'Comprehensive information about UK visa types, requirements, and application processes from the official UK government website.',
          content: `
# UK Visa Information

This is the official UK government website for visa and immigration information.

## Available Visa Types
- Student Visa
- Work Visa
- Visitor Visa
- Family Visa
- Settlement Visa

## How to Apply
1. Check your eligibility
2. Prepare your documents
3. Apply online
4. Pay the application fee
5. Book biometrics appointment
6. Submit your application

## Processing Times
- Standard: 3-6 weeks
- Priority: 5 working days
- Super Priority: Next working day

## Contact Information
- Phone: +44 (0)300 790 6268
- Email: customer.service@homeoffice.gov.uk
- Website: https://www.gov.uk/contact-ukvi-inside-uk
          `,
          language: request.language,
          extractedData: { source: 'UK Government', type: 'visa-information' },
          screenshots: [],
        },
        'https://travel.gc.ca/visiting/visas': {
          title: 'Canada Visa Information - Official Government Site',
          summary: 'Official information about Canada visa types, requirements, and application processes from Immigration, Refugees and Citizenship Canada.',
          content: `
# Canada Visa Information

This is the official Government of Canada website for visa and immigration information.

## Available Visa Types
- Visitor Visa
- Study Permit
- Work Permit
- Permanent Residence
- Express Entry

## How to Apply
1. Check your eligibility
2. Gather documents
3. Apply online or on paper
4. Pay application fees
5. Submit biometrics
6. Wait for processing

## Processing Times
- Visitor Visa: 14-20 days
- Study Permit: 4-6 weeks
- Work Permit: 4-8 weeks

## Contact Information
- Phone: +1 (888) 242-2100
- Website: https://www.canada.ca/en/immigration-refugees-citizenship.html
          `,
          language: request.language,
          extractedData: { source: 'Canada Government', type: 'visa-information' },
          screenshots: [],
        },
        'https://www.malaysia.my': {
          title: 'Malaysia Official Tourism Website',
          summary: 'Official tourism website of Malaysia with visa information, travel guides, and requirements for visitors.',
          content: `
# Malaysia Tourism

Welcome to the official tourism website of Malaysia.

## Visa Information
- Visa-free entry for many countries
- eVisa available for tourist visits
- eNTRI for short-term visits

## Popular Destinations
- Kuala Lumpur
- Penang
- Langkawi
- Malacca
- Borneo

## Travel Requirements
- Valid passport (6 months validity)
- Return ticket
- Sufficient funds
- Hotel reservations

## Contact Information
- Website: https://www.malaysia.travel
- Phone: +603 8891 8000
          `,
          language: request.language,
          extractedData: { source: 'Malaysia Tourism', type: 'travel-information' },
          screenshots: [],
        },
      };
      
      // Update the request with a result
      setResearchRequests(researchRequests.map(r =>
        r.id === request.id ? {
          ...r,
          status: 'completed',
          result: sampleResults[request.url] || {
            title: `Research Result for ${request.url}`,
            summary: `Research completed for: ${request.query}`,
            content: `Detailed research content for the URL: ${request.url}\n\nQuery: ${request.query}`,
            language: request.language,
            extractedData: {},
            screenshots: [],
          },
          updatedAt: new Date().toISOString(),
        } : r
      ));
      
    } catch (err) {
      // Mark as failed
      setResearchRequests(researchRequests.map(r =>
        r.id === request.id ? {
          ...r,
          status: 'failed',
          updatedAt: new Date().toISOString(),
        } : r
      ));
      setError('Failed to process research request');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Navigation handlers
  const handleNewRequest = () => {
    navigate('/research/new');
  };
  
  const handleEditRequest = (request: ResearchRequest) => {
    navigate(`/research/${request.id}/edit`);
  };
  
  const handleViewRequest = (request: ResearchRequest) => {
    setViewingRequest(request);
    setShowDetailSheet(true);
  };
  
  const handleBack = () => {
    navigate('/research');
    setShowFormSheet(false);
    setShowDetailSheet(false);
    setEditingRequest(null);
    setViewingRequest(null);
  };
  
  // Clear error
  const clearError = () => {
    setError(null);
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary" size="sm"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'processing': return <Badge variant="warning" size="sm"><Sparkles className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'completed': return <Badge variant="success" size="sm"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed': return <Badge variant="danger" size="sm"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default: return <Badge variant="secondary" size="sm">{status}</Badge>;
    }
  };
  
  // Get language label
  const getLanguageLabel = (code: string) => {
    return languageOptions.find(l => l.value === code)?.label || code;
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
    { id: 'process', label: 'Process', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, disabled: false },
  ];
  
  const handleMenuAction = (action: string, request: ResearchRequest) => {
    switch (action) {
      case 'view':
        handleViewRequest(request);
        break;
      case 'process':
        if (request.status === 'pending') {
          handleProcessRequest(request);
        }
        break;
      case 'delete':
        setDeletingId(request.id);
        setShowDeleteDialog(true);
        break;
    }
  };
  
  // Bulk menu items
  const bulkMenuItems: DropdownMenuItemType[] = [
    { id: 'process', label: 'Process All', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete Selected', icon: <Trash2 className="h-4 w-4" />, disabled: selectedRequests.length === 0 },
  ];
  
  const handleBulkMenuAction = (action: string) => {
    switch (action) {
      case 'delete':
        setShowBulkActionsSheet(false);
        if (confirm(`Are you sure you want to delete ${selectedRequests.length} requests?`)) {
          handleBulkDelete();
        }
        break;
      case 'process':
        // Process all pending requests
        const pendingRequests = researchRequests.filter(r => r.status === 'pending' && selectedRequests.includes(r.id));
        pendingRequests.forEach(req => handleProcessRequest(req));
        setShowBulkActionsSheet(false);
        break;
    }
    setShowBulkActionsSheet(false);
  };
  
  // Stats
  const totalRequests = researchRequests.length;
  const pendingRequests = researchRequests.filter(r => r.status === 'pending').length;
  const processingRequests = researchRequests.filter(r => r.status === 'processing').length;
  const completedRequests = researchRequests.filter(r => r.status === 'completed').length;
  const failedRequests = researchRequests.filter(r => r.status === 'failed').length;
  
  // Column definitions
  const columns = [
    {
      id: 'select',
      header: <input type="checkbox" checked={selectedRequests.length === paginatedRequests.length && paginatedRequests.length > 0} onChange={handleSelectAll} />,
      accessor: (item: ResearchRequest) => (
        <input type="checkbox" checked={selectedRequests.includes(item.id)} onChange={() => handleSelectRow(item.id)} />
      ),
      width: '50px',
    },
    {
      id: 'url',
      header: 'URL',
      accessor: (item: ResearchRequest) => (
        <div className="text-sm font-medium text-primary-600 truncate max-w-[200px]">
          {item.url}
        </div>
      ),
      width: '250px',
      sortable: true,
    },
    {
      id: 'query',
      header: 'Query',
      accessor: (item: ResearchRequest) => (
        <div className="text-sm">{item.query}</div>
      ),
      width: '200px',
    },
    {
      id: 'language',
      header: 'Language',
      accessor: (item: ResearchRequest) => (
        <Badge variant="primary" size="sm">{getLanguageLabel(item.language)}</Badge>
      ),
      width: '100px',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (item: ResearchRequest) => getStatusBadge(item.status),
      width: '100px',
      sortable: true,
    },
    {
      id: 'date',
      header: 'Created',
      accessor: (item: ResearchRequest) => (
        <span className="text-sm text-secondary-600">{formatDate(item.createdAt)}</span>
      ),
      width: '120px',
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (item: ResearchRequest) => (
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
                disabled={item.disabled || (item.id === 'process' && item.status !== 'pending')}
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
  
  // Handle field change
  const handleChange = (field: keyof ResearchRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Main render
  if (mode === 'new' || mode === 'edit') {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <div>
              <h2 className="text-xl font-bold text-primary-900">{editingRequest ? 'Edit Research Request' : 'New Research Request'}</h2>
              <p className="text-secondary-600 mt-1">Enter URL and query to research</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-150px)] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Website URL *
                </label>
                <Input
                  value={formData.url || ''}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://example.com"
                  prefix={<Globe className="h-4 w-4 text-secondary-400" />}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Research Query *
                </label>
                <Textarea
                  value={formData.query || ''}
                  onChange={(e) => handleChange('query', e.target.value)}
                  placeholder="What specific information are you looking for?"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">
                  Language
                </label>
                <Select
                  value={formData.language || 'bn'}
                  onValueChange={(v) => handleChange('language', v)}
                >
                  {languageOptions.map(lang => (
                    <Select.Option key={lang.value} value={lang.value}>{lang.label}</Select.Option>
                  ))}
                </Select>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">AI Research Tips:</div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Enter a specific, focused query for best results</li>
                      <li>Include country name and visa type if applicable</li>
                      <li>Use clear, concise language</li>
                      <li>Select Bengali for local language results</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-secondary-200">
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !formData.url || !formData.query}>
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-1" />
                    Start Research
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }
  
  if (mode === 'view' && viewingRequest) {
    return null; // Handled by detail sheet
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
              <Search className="h-6 w-6" />
              Website Research
            </h1>
            <p className="text-secondary-600 mt-1">
              Research visa requirements and information from any public website
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBulkActionsSheet(true)} disabled={selectedRequests.length === 0}>
              <Upload className="h-4 w-4 mr-1" />
              Bulk Actions ({selectedRequests.length})
            </Button>
            <Button size="sm" onClick={handleNewRequest}>
              <Search className="h-4 w-4 mr-1" />
              New Research
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
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Search className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-900">{totalRequests}</div>
              <div className="text-sm text-secondary-600">Total Requests</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <Clock className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary-900">{pendingRequests}</div>
              <div className="text-sm text-secondary-600">Pending</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{processingRequests}</div>
              <div className="text-sm text-secondary-600">Processing</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4" variant="glass">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{completedRequests}</div>
              <div className="text-sm text-secondary-600">Completed</div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Failed requests alert */}
      {failedRequests > 0 && (
        <Alert variant="warning" className="mb-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            <span>{failedRequests} research request(s) failed. </span>
            <Button variant="text" size="sm" onClick={() => setStatusFilter('failed')}>
              View Failed
            </Button>
          </div>
        </Alert>
      )}
      
      {/* Filters */}
      <Card className="p-4 mb-6" variant="bordered">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
            <Input
              placeholder="Search research..."
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
            {statusOptions.map(s => (
              <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>
            ))}
          </Select>
          <Select
            value={languageFilter}
            onValueChange={(v) => setLanguageFilter(v)}
            placeholder="Language"
          >
            <Select.Option value="all">All Languages</Select.Option>
            {languageOptions.map(lang => (
              <Select.Option key={lang.value} value={lang.value}>{lang.label}</Select.Option>
            ))}
          </Select>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setLanguageFilter('all');
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
                    <TableCell><Skeleton className="h-4 w-40 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedRequests.length > 0 ? (
                paginatedRequests.map(request => (
                  <TableRow key={request.id} className="hover:bg-secondary-50/50">
                    {columns.map(column => (
                      <TableCell key={column.id} width={column.width}>
                        {column.accessor(request)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="flex flex-col items-center gap-4">
                      <Search className="h-12 w-12 text-secondary-300" />
                      <div className="text-secondary-500">No research requests found</div>
                      <Button variant="outline" size="sm" onClick={handleNewRequest}>
                        <Search className="h-4 w-4 mr-1" />
                        Create First Request
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Table.Body>
          </Table>
        </div>
        
        {/* Pagination */}
        {paginatedRequests.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-200">
            <div className="text-sm text-secondary-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
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
            <DialogContent.Title>Delete Research Request</DialogContent.Title>
            <DialogContent.Description>
              Are you sure you want to delete this research request? This action cannot be undone.
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
              Perform actions on {selectedRequests.length} selected requests
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
        <SheetContent side="right" className="w-full max-w-3xl">
          <SheetContent.Header>
            <SheetContent.Title>Research Results</SheetContent.Title>
          </SheetContent.Header>
          {viewingRequest && (
            <div className="py-4 space-y-6">
              {/* Request Info */}
              <Card variant="bordered" className="p-4">
                <h3 className="font-semibold mb-4">Research Request</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">URL</div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-secondary-400" />
                      <a href={viewingRequest.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {viewingRequest.url}
                      </a>
                      <ExternalLink className="h-3 w-3 text-secondary-400" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Status</div>
                    {getStatusBadge(viewingRequest.status)}
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Query</div>
                    <div className="font-medium">{viewingRequest.query}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Language</div>
                    <Badge variant="primary">{getLanguageLabel(viewingRequest.language)}</Badge>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Created</div>
                    <div className="font-medium">{formatDate(viewingRequest.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-secondary-600 mb-1">Updated</div>
                    <div className="font-medium">{formatDate(viewingRequest.updatedAt)}</div>
                  </div>
                </div>
              </Card>
              
              {/* Results */}
              {viewingRequest.result ? (
                <>
                  <Card variant="bordered" className="p-4">
                    <h3 className="font-semibold mb-4">Research Results</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-secondary-600 mb-1">Title</div>
                        <h4 className="text-lg font-medium">{viewingRequest.result.title}</h4>
                      </div>
                      <div>
                        <div className="text-sm text-secondary-600 mb-1">Summary</div>
                        <p className="text-secondary-700">{viewingRequest.result.summary}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card variant="bordered" className="p-4">
                    <Tabs defaultValue="content" className="space-y-4">
                      <Tabs.List>
                        <Tabs.Trigger value="content">Content</Tabs.Trigger>
                        <Tabs.Trigger value="extracted">Extracted Data</Tabs.Trigger>
                      </Tabs.List>
                      <Tabs.Content value="content">
                        <div className="max-h-96 overflow-y-auto bg-secondary-50 p-4 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap">{viewingRequest.result.content}</pre>
                        </div>
                      </Tabs.Content>
                      <Tabs.Content value="extracted">
                        <div className="p-4">
                          {Object.keys(viewingRequest.result.extractedData || {}).length > 0 ? (
                            <div className="space-y-3">
                              {Object.entries(viewingRequest.result.extractedData || {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium">{key}:</span>
                                  <span className="text-secondary-700">{JSON.stringify(value)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-secondary-500 py-4">
                              No extracted data available
                            </div>
                          )}
                        </div>
                      </Tabs.Content>
                    </Tabs>
                  </Card>
                  
                  {viewingRequest.result.screenshots && viewingRequest.result.screenshots.length > 0 && (
                    <Card variant="bordered" className="p-4">
                      <h3 className="font-semibold mb-4">Screenshots</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {viewingRequest.result.screenshots.map((screenshot, index) => (
                          <div key={index} className="bg-secondary-50 p-4 rounded-lg">
                            <img
                              src={screenshot}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card variant="bordered" className="p-4">
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 mx-auto text-secondary-400 mb-4" />
                    <div className="text-secondary-500 mb-4">
                      {viewingRequest.status === 'pending' ? 'Research request is pending' : 
                       viewingRequest.status === 'processing' ? 'Research is being processed' : 
                       'No results available'}
                    </div>
                    {viewingRequest.status === 'pending' && (
                      <Button onClick={() => handleProcessRequest(viewingRequest)}>
                        <Sparkles className="h-4 w-4 mr-1" />
                        Process Now
                      </Button>
                    )}
                  </div>
                </Card>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                {viewingRequest.status === 'completed' && (
                  <Button variant="outline" onClick={() => {
                    // Export functionality
                    const blob = new Blob([viewingRequest.result?.content || ''], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${viewingRequest.result?.title || 'research-result'}.md`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}>
                    <Download className="h-4 w-4 mr-1" />
                    Export Markdown
                  </Button>
                )}
                <Button onClick={() => handleEditRequest(viewingRequest)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ResearchPage;
