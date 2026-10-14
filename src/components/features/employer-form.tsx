import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, generateId, formatDate } from '@/lib/utils';
import { INDUSTRIES } from '@/lib/constants';
import { 
  Button, 
  Card, 
  Input, 
  Select,
  Badge,
  Alert,
  FileUpload,
  Avatar,
  Progress,
  Switch,
  DatePicker
} from '@/components/ui';
import { 
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
  Users,
  Briefcase,
  Camera,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import type { Employer, EmployerDocument } from '@/types';

export interface EmployerFormProps {
  employer?: Employer | null;
  onSubmit: (data: Partial<Employer>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
}

// Industry options
const industryOptions = INDUSTRIES.map(i => ({ value: i.id, label: i.label.en }));

// Company size options
const companySizeOptions = [
  { value: '1-10', label: '1-10 Employees' },
  { value: '11-50', label: '11-50 Employees' },
  { value: '51-200', label: '51-200 Employees' },
  { value: '201-500', label: '201-500 Employees' },
  { value: '500+', label: '500+ Employees' },
];

// Country options
const countryOptions = [
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'India', label: 'India' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'Sri Lanka', label: 'Sri Lanka' },
  { value: 'Nepal', label: 'Nepal' },
  { value: 'Other', label: 'Other' },
];

// Document type options
const documentTypeOptions = [
  { value: 'registration', label: 'Registration Certificate' },
  { value: 'tax', label: 'Tax Certificate' },
  { value: 'license', label: 'Business License' },
  { value: 'bank', label: 'Bank Documents' },
  { value: 'office', label: 'Office Documents' },
  { value: 'other', label: 'Other' },
];

// Form steps
const steps = [
  { number: 1, label: 'Company Info' },
  { number: 2, label: 'Contact Info' },
  { number: 3, label: 'Documents' },
  { number: 4, label: 'Review' },
];

export const EmployerForm: React.FC<EmployerFormProps> = ({
  employer,
  onSubmit,
  onCancel,
  isLoading = false,
  title = employer ? 'Edit Employer' : 'New Employer',
}) => {
  const navigate = useNavigate();
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
  
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [documents, setDocuments] = useState<Partial<EmployerDocument>[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [previewDocument, setPreviewDocument] = useState<File | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Load existing employer data
  useEffect(() => {
    if (employer) {
      setFormData(employer);
      setDocuments(employer.documents || []);
    }
  }, [employer]);
  
  // Calculate progress
  const getStepProgress = () => ((step - 1) / (steps.length - 1)) * 100;
  
  // Validate current step
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1: // Company Info
        if (!formData.companyName?.trim()) {
          newErrors.companyName = 'Company name is required';
        }
        if (!formData.registrationNumber?.trim()) {
          newErrors.registrationNumber = 'Registration number is required';
        }
        if (!formData.industry) {
          newErrors.industry = 'Industry is required';
        }
        if (!formData.companySize) {
          newErrors.companySize = 'Company size is required';
        }
        break;
      case 2: // Contact Info
        if (!formData.address?.trim()) {
          newErrors.address = 'Address is required';
        }
        if (!formData.city?.trim()) {
          newErrors.city = 'City is required';
        }
        if (!formData.country) {
          newErrors.country = 'Country is required';
        }
        if (!formData.contactPerson?.trim()) {
          newErrors.contactPerson = 'Contact person is required';
        }
        if (!formData.contactEmail?.trim()) {
          newErrors.contactEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
          newErrors.contactEmail = 'Invalid email format';
        }
        if (!formData.contactPhone?.trim()) {
          newErrors.contactPhone = 'Phone is required';
        }
        break;
      case 3: // Documents
        // No required validation for documents
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle field change
  const handleChange = (field: keyof Employer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
      issueDate: '',
      expiryDate: '',
      verified: false,
      verificationNotes: '',
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
  const handleDocumentDateChange = (index: number, field: 'issueDate' | 'expiryDate', value: string) => {
    const newDocs = [...documents];
    newDocs[index] = { ...newDocs[index], [field]: value };
    setDocuments(newDocs);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(step)) return;
    
    try {
      setIsLoading(true);
      
      const submitData: Partial<Employer> = {
        ...formData,
        documents: documents as EmployerDocument[],
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
      case 'registration': return <FileText className="h-4 w-4" />;
      case 'tax': return <Briefcase className="h-4 w-4" />;
      case 'license': return <CheckCircle className="h-4 w-4" />;
      case 'bank': return <Globe className="h-4 w-4" />;
      case 'office': return <Building2 className="h-4 w-4" />;
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
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div>
            <h2 className="text-xl font-bold text-primary-900">{title}</h2>
            <p className="text-secondary-600 mt-1">Complete the form to {employer ? 'update' : 'create'} employer profile</p>
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
            {/* Step 1: Company Information */}
            {step === 1 && (
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-900">Company Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Company Name *
                    </label>
                    <Input
                      value={formData.companyName || ''}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                      error={errors.companyName}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Bengali Name
                    </label>
                    <Input
                      value={formData.companyBengaliName || ''}
                      onChange={(e) => handleChange('companyBengaliName', e.target.value)}
                      placeholder="Enter Bengali company name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Registration Number *
                    </label>
                    <Input
                      value={formData.registrationNumber || ''}
                      onChange={(e) => handleChange('registrationNumber', e.target.value)}
                      placeholder="Enter registration number"
                      error={errors.registrationNumber}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Industry *
                    </label>
                    <Select
                      value={formData.industry || ''}
                      onValueChange={(v) => handleChange('industry', v)}
                      placeholder="Select industry"
                      error={errors.industry}
                    >
                      {industryOptions.map(ind => (
                        <Select.Option key={ind.value} value={ind.value}>{ind.label}</Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Company Size *
                    </label>
                    <Select
                      value={formData.companySize || ''}
                      onValueChange={(v) => handleChange('companySize', v as any)}
                      placeholder="Select company size"
                      error={errors.companySize}
                    >
                      {companySizeOptions.map(size => (
                        <Select.Option key={size.value} value={size.value}>{size.label}</Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Website
                    </label>
                    <Input
                      value={formData.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder="https://company.com"
                      prefix={<Globe className="h-4 w-4 text-secondary-400" />}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isVerified || false}
                    onCheckedChange={(v) => handleChange('isVerified', v)}
                  />
                  <label className="text-sm font-medium text-primary-700">
                    Verified Company
                  </label>
                </div>
                
                {formData.isVerified && (
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Verification Date
                    </label>
                    <DatePicker
                      value={formData.verificationDate || ''}
                      onChange={(v) => handleChange('verificationDate', v)}
                      placeholder="Select verification date"
                    />
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Step 2: Contact Information */}
            {step === 2 && (
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-900">Contact Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-1">
                    Address *
                  </label>
                  <Input
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Enter company address"
                    error={errors.address}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      City *
                    </label>
                    <Input
                      value={formData.city || ''}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Enter city"
                      error={errors.city}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Country *
                    </label>
                    <Select
                      value={formData.country || ''}
                      onValueChange={(v) => handleChange('country', v)}
                      placeholder="Select country"
                      error={errors.country}
                    >
                      {countryOptions.map(country => (
                        <Select.Option key={country.value} value={country.value}>{country.label}</Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Postal Code
                    </label>
                    <Input
                      value={formData.postalCode || ''}
                      onChange={(e) => handleChange('postalCode', e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Contact Person *
                    </label>
                    <Input
                      value={formData.contactPerson || ''}
                      onChange={(e) => handleChange('contactPerson', e.target.value)}
                      placeholder="Enter contact person name"
                      error={errors.contactPerson}
                      prefix={<Users className="h-4 w-4 text-secondary-400" />}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Email *
                    </label>
                    <Input
                      value={formData.contactEmail || ''}
                      onChange={(e) => handleChange('contactEmail', e.target.value)}
                      placeholder="Enter email"
                      error={errors.contactEmail}
                      prefix={<Mail className="h-4 w-4 text-secondary-400" />}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-700 mb-1">
                      Phone *
                    </label>
                    <Input
                      value={formData.contactPhone || ''}
                      onChange={(e) => handleChange('contactPhone', e.target.value)}
                      placeholder="Enter phone number"
                      error={errors.contactPhone}
                      prefix={<Phone className="h-4 w-4 text-secondary-400" />}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Step 3: Documents */}
            {step === 3 && (
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-900">Company Documents</h3>
                
                <Card variant="bordered" className="p-4">
                  <FileUpload
                    multiple
                    accept="application/pdf,image/jpeg,image/png"
                    onUpload={(files) => handleDocumentUpload(files as File[])}
                    maxFiles={10}
                    maxFileSize={5 * 1024 * 1024}
                  >
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 mx-auto text-primary-400 mb-2" />
                      <div className="text-primary-700 font-medium mb-1">Upload Company Documents</div>
                      <div className="text-sm text-secondary-600">
                        Drag & drop files here or click to browse
                      </div>
                      <div className="text-xs text-secondary-500 mt-2">
                        Supported: PDF, JPG, PNG (Max 5MB each, Max 10 files)
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
                                Issue Date
                              </label>
                              <DatePicker
                                value={doc.issueDate || ''}
                                onChange={(v) => handleDocumentDateChange(index, 'issueDate', v)}
                                size="sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-primary-700 mb-1">
                                Expiry Date (Optional)
                              </label>
                              <DatePicker
                                value={doc.expiryDate || ''}
                                onChange={(v) => handleDocumentDateChange(index, 'expiryDate', v)}
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
            
            {/* Step 4: Review */}
            {step === 4 && (
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-900">Review Information</h3>
                
                <Card variant="bordered" className="p-4">
                  <h4 className="font-medium mb-4">Company Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Company Name</span>
                      <span className="font-medium">{formData.companyName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Bengali Name</span>
                      <span className="font-medium">{formData.companyBengaliName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Registration Number</span>
                      <span className="font-medium">{formData.registrationNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Industry</span>
                      <span className="font-medium">{industryOptions.find(i => i.value === formData.industry)?.label || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Company Size</span>
                      <span className="font-medium">{companySizeOptions.find(s => s.value === formData.companySize)?.label || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Website</span>
                      <span className="font-medium">{formData.website || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Verification Status</span>
                      <span className="font-medium">
                        {formData.isVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                </Card>
                
                <Card variant="bordered" className="p-4">
                  <h4 className="font-medium mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Address</span>
                      <span className="font-medium">{formData.address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">City</span>
                      <span className="font-medium">{formData.city || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Country</span>
                      <span className="font-medium">{formData.country || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Postal Code</span>
                      <span className="font-medium">{formData.postalCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Contact Person</span>
                      <span className="font-medium">{formData.contactPerson || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Email</span>
                      <span className="font-medium">{formData.contactEmail || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Phone</span>
                      <span className="font-medium">{formData.contactPhone || 'N/A'}</span>
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
                      Save Employer
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
              Employer saved successfully!
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
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(previewDocument);
                      link.download = previewDocument.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
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

export default EmployerForm;
