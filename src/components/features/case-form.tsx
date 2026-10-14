import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, generateId, formatDate } from '@/lib/utils';
import { COUNTRIES, VISA_TYPES, sampleApplicants, sampleEmployers } from '@/lib/constants';
import { 
  Button, 
  Card, 
  Input, 
  Select,
  Badge,
  Alert,
  FileUpload,
  Progress,
  Switch,
  DatePicker,
  Textarea,
  Checkbox
} from '@/components/ui';
import { 
  Folder, 
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Upload,
  X,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  MoreVertical
} from 'lucide-react';
import type { VisaCase, Applicant, Employer, VisaType, CaseDocument, Checklist } from '@/types';

export interface CaseFormProps {
  caseItem?: VisaCase | null;
  onSubmit: (data: Partial<VisaCase>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
}

// Form steps
const steps = [
  { number: 1, label: 'Case Info' },
  { number: 2, label: 'Applicant & Employer' },
  { number: 3, label: 'Documents' },
  { number: 4, label: 'Checklist' },
  { number: 5, label: 'Review' },
];

// Visa type options
const visaTypeOptions = VISA_TYPES.map(v => ({ value: v.id, label: v.label.en }));

// Country options
const countryOptions = COUNTRIES.map(c => ({ value: c.id, label: c.name }));

// Status options
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
];

// Priority options
const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

// Document type options
const documentTypeOptions = [
  { value: 'passport', label: 'Passport' },
  { value: 'photo', label: 'Photograph' },
  { value: 'application', label: 'Application Form' },
  { value: 'offer-letter', label: 'Offer Letter' },
  { value: 'financial', label: 'Financial Documents' },
  { value: 'education', label: 'Educational Certificates' },
  { value: 'experience', label: 'Experience Certificates' },
  { value: 'medical', label: 'Medical Certificate' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];

// Required documents by visa type
const requiredDocuments: Record<VisaType, string[]> = {
  tourist: ['passport', 'photo', 'application', 'financial'],
  student: ['passport', 'photo', 'application', 'financial', 'education'],
  work: ['passport', 'photo', 'application', 'offer-letter', 'financial', 'experience'],
  business: ['passport', 'photo', 'application', 'financial', 'insurance'],
  family: ['passport', 'photo', 'application', 'financial', 'medical'],
  medical: ['passport', 'photo', 'application', 'medical', 'financial'],
  transit: ['passport', 'photo', 'application'],
  other: ['passport', 'photo', 'application'],
};

// Default checklist items
const getDefaultChecklist = (visaType: VisaType): Checklist[] => {
  const required = requiredDocuments[visaType] || [];
  
  return [
    { id: generateId(), item: 'Passport Copy', category: 'Required Documents', required: true, completed: false, notes: '' },
    { id: generateId(), item: 'Photograph', category: 'Required Documents', required: true, completed: false, notes: '' },
    { id: generateId(), item: 'Application Form', category: 'Required Documents', required: true, completed: false, notes: '' },
    ...(required.includes('financial') ? [
      { id: generateId(), item: 'Financial Proof', category: 'Financial', required: true, completed: false, notes: '' }
    ] : []),
    ...(required.includes('education') ? [
      { id: generateId(), item: 'Educational Certificates', category: 'Education', required: true, completed: false, notes: '' }
    ] : []),
    ...(required.includes('experience') ? [
      { id: generateId(), item: 'Experience Certificates', category: 'Experience', required: true, completed: false, notes: '' }
    ] : []),
    ...(required.includes('offer-letter') ? [
      { id: generateId(), item: 'Offer Letter', category: 'Employment', required: true, completed: false, notes: '' }
    ] : []),
    ...(required.includes('medical') ? [
      { id: generateId(), item: 'Medical Certificate', category: 'Medical', required: true, completed: false, notes: '' }
    ] : []),
    ...(required.includes('insurance') ? [
      { id: generateId(), item: 'Insurance', category: 'Insurance', required: true, completed: false, notes: '' }
    ] : []),
  ];
};

export const CaseForm: React.FC<CaseFormProps> = ({
  caseItem,
  onSubmit,
  onCancel,
  isLoading = false,
  title = caseItem ? 'Edit Case' : 'New Case',
}) => {
  const navigate = useNavigate();
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
  
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [documents, setDocuments] = useState<Partial<CaseDocument>[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [checklistItems, setChecklistItems] = useState<Checklist[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [previewDocument, setPreviewDocument] = useState<File | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Load existing case data
  useEffect(() => {
    if (caseItem) {
      setFormData(caseItem);
      setDocuments(caseItem.documents || []);
      setChecklistItems(caseItem.checklists || []);
    }
  }, [caseItem]);
  
  // Update checklist when visa type changes
  useEffect(() => {
    if (formData.visaType) {
      const defaultChecklist = getDefaultChecklist(formData.visaType as VisaType);
      if (checklistItems.length === 0 || caseItem) {
        setChecklistItems(caseItem?.checklists || defaultChecklist);
      }
    }
  }, [formData.visaType, caseItem]);
  
  // Calculate progress
  const getStepProgress = () => ((step - 1) / (steps.length - 1)) * 100;
  
  // Validate current step
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1: // Case Info
        if (!formData.visaType) {
          newErrors.visaType = 'Visa type is required';
        }
        if (!formData.targetCountry) {
          newErrors.targetCountry = 'Target country is required';
        }
        if (!formData.priority) {
          newErrors.priority = 'Priority is required';
        }
        if (formData.status === 'submitted' && !formData.submissionDate) {
          newErrors.submissionDate = 'Submission date is required';
        }
        break;
      case 2: // Applicant & Employer
        if (!formData.applicantId) {
          newErrors.applicantId = 'Applicant is required';
        }
        break;
      case 3: // Documents
        // No required validation for documents
        break;
      case 4: // Checklist
        // Check if required items are completed
        const requiredIncomplete = checklistItems.filter(c => c.required && !c.completed);
        if (requiredIncomplete.length > 0) {
          newErrors.checklist = `${requiredIncomplete.length} required items incomplete`;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle field change
  const handleChange = (field: keyof VisaCase, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };
  
  // Navigation
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Handle document upload
  const handleDocumentUpload = (files: File[]) => {
    const newFiles = [...documentFiles, ...files];
    setDocumentFiles(newFiles);
    
    const newDocs = files.map(file => ({
      id: generateId(),
      name: file.name,
      type: 'other',
      filePath: URL.createObjectURL(file),
      fileUrl: '',
      uploadDate: new Date().toISOString().split('T')[0],
      verified: false,
      verificationNotes: '',
      version: 1,
    }));
    
    setDocuments(prev => [...prev, ...newDocs]);
  };
  
  // Handle document removal
  const handleDocumentRemove = (index: number) => {
    const newDocs = [...documents];
    newDocs.splice(index, 1);
    setDocuments(newDocs);
    
    const newFiles = [...documentFiles];
    newFiles.splice(index, 1);
    setDocumentFiles(newFiles);
  };
  
  // Handle document type change
  const handleDocumentTypeChange = (index: number, type: string) => {
    const newDocs = [...documents];
    newDocs[index] = { ...newDocs[index], type: type as any };
    setDocuments(newDocs);
  };
  
  // Handle document date change
  const handleDocumentDateChange = (index: number, field: 'uploadDate' | 'expiryDate', value: string) => {
    const newDocs = [...documents];
    newDocs[index] = { ...newDocs[index], [field]: value };
    setDocuments(newDocs);
  };
  
  // Handle checklist item toggle
  const handleChecklistToggle = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed, completionDate: !item.completed ? new Date().toISOString() : '' } : item
      )
    );
  };
  
  // Handle checklist item removal
  const handleChecklistRemove = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id));
  };
  
  // Handle add new checklist item
  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems(prev => [
        ...prev,
        {
          id: generateId(),
          item: newChecklistItem,
          category: 'Additional',
          required: false,
          completed: false,
          notes: '',
        }
      ]);
      setNewChecklistItem('');
    }
  };
  
  // Handle checklist item edit
  const handleChecklistEdit = (id: string, field: keyof Checklist, value: any) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(step)) return;
    
    try {
      setIsLoading(true);
      
      const submitData: Partial<VisaCase> = {
        ...formData,
        documents: documents as CaseDocument[],
        checklists: checklistItems,
      };
      
      await onSubmit(submitData);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        onCancel();
      }, 2000);
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };
  
  // Preview document
  const handlePreviewDocument = (file: File) => {
    setPreviewDocument(file);
    setShowDocumentPreview(true);
  };
  
  // Get document icon
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'passport': return <FileText className="h-4 w-4" />;
      case 'photo': return <User className="h-4 w-4" />;
      case 'application': return <Folder className="h-4 w-4" />;
      case 'offer-letter': return <Building2 className="h-4 w-4" />;
      case 'financial': return <Globe className="h-4 w-4" />;
      case 'education': return <CheckCircle className="h-4 w-4" />;
      case 'experience': return <Clock className="h-4 w-4" />;
      case 'medical': return <AlertCircle className="h-4 w-4" />;
      case 'insurance': return <Check className="h-4 w-4" />;
      default: return <Upload className="h-4 w-4" />;
    }
  };
  
  // Get document type label
  const getDocumentTypeLabel = (type: string) => {
    return documentTypeOptions.find(d => d.value === type)?.label || type;
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  // Get applicant name
  const getApplicantName = (applicantId: string) => {
    const applicant = sampleApplicants.find(a => a.id === applicantId);
    return applicant ? `${applicant.firstName} ${applicant.lastName} (${applicant.referenceNumber})` : 'Select applicant';
  };
  
  // Get employer name
  const getEmployerName = (employerId: string) => {
    const employer = sampleEmployers.find(e => e.id === employerId);
    return employer ? `${employer.companyName} (${employer.registrationNumber})` : 'None';
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
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div>
            <h2 className="text-xl font-bold text-primary-900">{title}</h2>
            <p className="text-secondary-600 mt-1">Complete the form to {caseItem ? 'update' : 'create'} visa case</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                      step >= s.number 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-secondary-200 text-secondary-600'
                    )}
                  >
                    {step > s.number ? <CheckCircle className="h-4 w-4" /> : s.number}
                  </div>
                  <div className="text-xs text-secondary-600 mt-1">{s.label}</div>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-1 flex-1 mx-2 rounded transition-all',
                      step > s.number ? 'bg-primary-600' : 'bg-secondary-200'
                    )}
                    style={{ width: '60px' }}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={getStepProgress()} className="mt-2" />
        </div>
        
        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Step 1: Case Information */}
            {step === 1 && (
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-900">Case Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Visa Type *
                    </label>
                    <Select
                      value={formData.visaType || ''}
                      onValueChange={(v) => handleChange('visaType', v as VisaType)}
                      placeholder="Select visa type"
                      error={errors.visaType}
                    >
                      {visaTypeOptions.map(vt => (
                        <Select.Option key={vt.value} value={vt.value}>{vt.label}</Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Target Country *
                    </label>
                    <Select
                      value={formData.targetCountry || ''}
                      onValueChange={(v) => handleChange('targetCountry', v)}
                      placeholder="Select target country"
                      error={errors.targetCountry}
                    >
                      {countryOptions.map(c => (
                        <Select.Option key={c.value} value={c.value}>{c.label}</Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Status *
                    </label>
                    <Select
                      value={formData.status || ''}
                      onValueChange={(v) => handleChange('status', v as any)}
                      placeholder="Select status"
                      error={errors.status}
                    >
                      {statusOptions.map(s => (
                        <Select.Option key={s.value} value={s.value}>{s.label}</Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Priority *
                    </label>
                    <Select
                      value={formData.priority || ''}
                      onValueChange={(v) => handleChange('priority', v as any)}
                      placeholder="Select priority"
                      error={errors.priority}
                    >
                      {priorityOptions.map(p => (
                        <Select.Option key={p.value} value={p.value}>{p.label}</Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Submission Date
                    </label>
                    <DatePicker
                      value={formData.submissionDate || ''}
                      onChange={(v) => handleChange('submissionDate', v)}
                      placeholder="Select submission date"
                      error={errors.submissionDate}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Expected Decision Date
                    </label>
                    <DatePicker
                      value={formData.expectedDecisionDate || ''}
                      onChange={(v) => handleChange('expectedDecisionDate', v)}
                      placeholder="Select expected decision date"
                    />
                  </div>
                </div>
                
                {formData.status === 'approved' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-1">
                        Actual Decision Date
                      </label>
                      <DatePicker
                        value={formData.actualDecisionDate || ''}
                        onChange={(v) => handleChange('actualDecisionDate', v)}
                        placeholder="Select actual decision date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-1">
                        Decision
                      </label>
                      <Input
                        value={formData.decision || ''}
                        onChange={(e) => handleChange('decision', e.target.value)}
                        placeholder="Enter decision"
                      />
                    </div>
                  </div>
                )}
                
                {formData.status === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Rejection Reason
                    </label>
                    <Textarea
                      value={formData.rejectionReason || ''}
                      onChange={(e) => handleChange('rejectionReason', e.target.value)}
                      placeholder="Enter rejection reason"
                      rows={3}
                    />
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Step 2: Applicant & Employer */}
            {step === 2 && (
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-900">Applicant & Employer</h3>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Applicant *
                  </label>
                  <Select
                    value={formData.applicantId || ''}
                    onValueChange={(v) => handleChange('applicantId', v)}
                    placeholder="Select applicant"
                    error={errors.applicantId}
                  >
                    {sampleApplicants.map(a => (
                      <Select.Option key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} - {a.referenceNumber}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Employer (Optional)
                  </label>
                  <Select
                    value={formData.employerId || ''}
                    onValueChange={(v) => handleChange('employerId', v)}
                    placeholder="Select employer (if applicable)"
                  >
                    <Select.Option value="">None</Select.Option>
                    {sampleEmployers.map(e => (
                      <Select.Option key={e.id} value={e.id}>
                        {e.companyName} - {e.registrationNumber}
                      </Select.Option>
                    ))}
                  </Select>
                  <div className="text-xs text-secondary-500 mt-1">
                    Required for work visas
                  </div>
                </div>
                
                {/* Selected Applicant & Employer Info */}
                {(formData.applicantId || formData.employerId) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.applicantId && (
                      <Card variant="bordered" className="p-4">
                        <h4 className="font-medium mb-3">Selected Applicant</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-secondary-600">Name</span>
                            <span className="font-medium">{getApplicantName(formData.applicantId)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary-600">Passport</span>
                            <span className="font-medium">
                              {sampleApplicants.find(a => a.id === formData.applicantId)?.passportNumber || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary-600">Email</span>
                            <span className="font-medium">
                              {sampleApplicants.find(a => a.id === formData.applicantId)?.email || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </Card>
                    )}
                    {formData.employerId && (
                      <Card variant="bordered" className="p-4">
                        <h4 className="font-medium mb-3">Selected Employer</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-secondary-600">Company</span>
                            <span className="font-medium">{getEmployerName(formData.employerId)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary-600">Contact</span>
                            <span className="font-medium">
                              {sampleEmployers.find(e => e.id === formData.employerId)?.contactPerson || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-secondary-600">Email</span>
                            <span className="font-medium">
                              {sampleEmployers.find(e => e.id === formData.employerId)?.contactEmail || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Step 3: Documents */}
            {step === 3 && (
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-900">Case Documents</h3>
                
                <Card variant="bordered" className="p-4">
                  <FileUpload
                    multiple
                    accept="application/pdf,image/jpeg,image/png"
                    onUpload={(files) => handleDocumentUpload(files as File[])}
                    maxFiles={20}
                    maxFileSize={10 * 1024 * 1024}
                  >
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 mx-auto text-primary-400 mb-2" />
                      <div className="text-primary-700 font-medium mb-1">Upload Case Documents</div>
                      <div className="text-sm text-secondary-600">
                        Drag & drop files here or click to browse
                      </div>
                      <div className="text-xs text-secondary-500 mt-2">
                        Supported: PDF, JPG, PNG (Max 10MB each, Max 20 files)
                      </div>
                    </div>
                  </FileUpload>
                </Card>
                
                {documents.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-primary-700">Uploaded Documents ({documents.length})</h4>
                    <div className="space-y-2">
                      {documents.map((doc, index) => (
                        <Card key={doc.id || index} variant="bordered" className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="p-2 bg-secondary-100 rounded-lg">
                                {getDocumentIcon(doc.type || 'other')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{doc.name}</div>
                                <div className="text-xs text-secondary-600">
                                  Type: {getDocumentTypeLabel(doc.type || 'other')}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={doc.type || 'other'}
                                onValueChange={(v) => handleDocumentTypeChange(index, v)}
                                size="sm"
                                className="w-32"
                              >
                                {documentTypeOptions.map(dt => (
                                  <Select.Option key={dt.value} value={dt.value}>{dt.label}</Select.Option>
                                ))}
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handlePreviewDocument(documentFiles[index])}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={() => handleDocumentRemove(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="block text-xs font-medium text-primary-700 mb-1">
                                Upload Date
                              </label>
                              <DatePicker
                                value={doc.uploadDate || ''}
                                onChange={(v) => handleDocumentDateChange(index, 'uploadDate', v)}
                                size="sm"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Step 4: Checklist */}
            {step === 4 && (
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-900">Checklist</h3>
                
                {errors.checklist && (
                  <Alert variant="error" className="mb-4">
                    {errors.checklist}
                  </Alert>
                )}
                
                <Card variant="bordered" className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Required Documents</h4>
                    <div className="text-sm text-secondary-600">
                      {checklistItems.filter(c => c.completed).length}/{checklistItems.length} completed
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {checklistItems.map(item => (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg',
                          item.completed ? 'bg-green-50' : 'bg-secondary-50'
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => handleChecklistToggle(item.id)}
                          />
                          <div>
                            <div className="font-medium">{item.item}</div>
                            <div className="text-xs text-secondary-600">{item.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.required && (
                            <Badge variant="danger" size="xs">Required</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleChecklistRemove(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card variant="bordered" className="p-4">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Add custom checklist item"
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleAddChecklistItem}>
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
            
            {/* Step 5: Review */}
            {step === 5 && (
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-900">Review Information</h3>
                
                <Card variant="bordered" className="p-4">
                  <h4 className="font-medium mb-4">Case Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Reference Number</span>
                      <span className="font-medium">{caseItem?.referenceNumber || 'Will be generated'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Visa Type</span>
                      <span className="font-medium">{visaTypeOptions.find(v => v.value === formData.visaType)?.label || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Target Country</span>
                      <span className="font-medium">{countryOptions.find(c => c.value === formData.targetCountry)?.label || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Status</span>
                      <span className="font-medium">{statusOptions.find(s => s.value === formData.status)?.label || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Priority</span>
                      <span className="font-medium">{priorityOptions.find(p => p.value === formData.priority)?.label || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Submission Date</span>
                      <span className="font-medium">{formData.submissionDate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Expected Decision</span>
                      <span className="font-medium">{formData.expectedDecisionDate || 'N/A'}</span>
                    </div>
                  </div>
                </Card>
                
                <Card variant="bordered" className="p-4">
                  <h4 className="font-medium mb-4">Applicant & Employer</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Applicant</span>
                      <span className="font-medium">{getApplicantName(formData.applicantId || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Employer</span>
                      <span className="font-medium">{getEmployerName(formData.employerId || '')}</span>
                    </div>
                  </div>
                </Card>
                
                <Card variant="bordered" className="p-4">
                  <h4 className="font-medium mb-4">Documents</h4>
                  {documents.length > 0 ? (
                    <div className="space-y-2">
                      {documents.map((doc, index) => (
                        <div key={doc.id || index} className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                          <div className="flex items-center gap-2">
                            {getDocumentIcon(doc.type || 'other')}
                            <span className="text-sm">{doc.name}</span>
                          </div>
                          <span className="text-xs text-secondary-600">
                            {formatFileSize(documentFiles[index]?.size || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-secondary-500 py-4">
                      No documents uploaded
                    </div>
                  )}
                </Card>
                
                <Card variant="bordered" className="p-4">
                  <h4 className="font-medium mb-4">Checklist</h4>
                  <div className="space-y-2">
                    {checklistItems.map(item => (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center justify-between p-2 rounded',
                          item.completed ? 'bg-green-50' : 'bg-secondary-50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={item.completed} readOnly />
                          <span className="text-sm">{item.item}</span>
                        </div>
                        {item.required && !item.completed && (
                          <Badge variant="danger" size="xs">Required</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-secondary-200">
                    <div className="text-sm">
                      <span className="font-medium">
                        {checklistItems.filter(c => c.completed).length}/{checklistItems.length} completed
                      </span>
                      {checklistItems.filter(c => c.required && !c.completed).length > 0 && (
                        <span className="text-red-500 ml-2">
                          ({checklistItems.filter(c => c.required && !c.completed).length} required incomplete)
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
          
          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-secondary-200">
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={prevStep} disabled={isLoading}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step < steps.length && (
                <Button onClick={nextStep} disabled={isLoading}>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
              {step === steps.length && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Save Case
                    </>
                  )}
                </Button>
              )}
              <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
        
        {/* Success Alert */}
        {showSuccess && (
          <div className="p-4">
            <Alert variant="success" className="mb-4">
              Case saved successfully!
            </Alert>
          </div>
        )}
      </motion.div>
      
      {/* Document Preview Sheet */}
      <Sheet open={showDocumentPreview} onOpenChange={setShowDocumentPreview}>
        <SheetContent side="right" className="w-full max-w-2xl">
          <SheetContent.Header>
            <SheetContent.Title>Document Preview</SheetContent.Title>
          </SheetContent.Header>
          {previewDocument && (
            <div className="py-4">
              <div className="bg-secondary-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">{previewDocument.name}</span>
                </div>
                <div className="text-sm text-secondary-600 mb-2">
                  Type: {previewDocument.type}
                </div>
                <div className="text-sm text-secondary-600 mb-4">
                  Size: {formatFileSize(previewDocument.size)}
                </div>
                
                <div className="bg-white p-4 rounded border">
                  {previewDocument.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(previewDocument)}
                      alt="Document preview"
                      className="w-full max-h-96 object-contain"
                    />
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-secondary-400 mb-2" />
                      <div className="text-secondary-500">PDF Document</div>
                      <div className="text-xs text-secondary-400 mt-1">
                        Preview not available for PDF files
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowDocumentPreview(false)}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      const link = document.createObjectURL(previewDocument);
                      const a = document.createElement('a');
                      a.href = link;
                      a.download = previewDocument.name;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CaseForm;
