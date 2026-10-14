import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, generateId, generateReferenceNumber, formatDate } from '@/lib/utils';
import { COUNTRIES, VISA_TYPES } from '@/lib/constants';
import { 
  Button, 
  Card, 
  Input, 
  Select,
  Badge,
  Alert,
  FileUpload,
  Avatar,
  Progress
} from '@/components/ui';
import { 
  User, 
  Mail,
  Phone,
  Calendar,
  MapPin,
  Flag,
  Camera,
  Upload,
  X,
  CheckCircle
} from 'lucide-react';
import type { Applicant, Country } from '@/types';

export interface ApplicantFormProps {
  applicant?: Applicant | null;
  onSubmit: (data: Partial<Applicant>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blacklisted', label: 'Blacklisted' },
];

const nationalityOptions = [
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'India', label: 'India' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'Sri Lanka', label: 'Sri Lanka' },
  { value: 'Nepal', label: 'Nepal' },
  { value: 'Other', label: 'Other' },
];

const countryOptions = COUNTRIES.map(c => ({ value: c.id, label: c.name }));

export const ApplicantForm: React.FC<ApplicantFormProps> = ({
  applicant,
  onSubmit,
  onCancel,
  isLoading = false,
  title = applicant ? 'Edit Applicant' : 'New Applicant',
}) => {
  const navigate = useNavigate();
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
    photo: '',
    signature: '',
    status: 'active',
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Load existing applicant data
  useEffect(() => {
    if (applicant) {
      setFormData(applicant);
      if (applicant.photo) setPhotoPreview(applicant.photo);
      if (applicant.signature) setSignaturePreview(applicant.signature);
    }
  }, [applicant]);
  
  // Handle photo upload
  const handlePhotoUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle signature upload
  const handleSignatureUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSignaturePreview(reader.result as string);
        setFormData(prev => ({ ...prev, signature: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Remove photo
  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo: '' }));
  };
  
  // Remove signature
  const removeSignature = () => {
    setSignatureFile(null);
    setSignaturePreview(null);
    setFormData(prev => ({ ...prev, signature: '' }));
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.passportNumber?.trim()) {
      newErrors.passportNumber = 'Passport number is required';
    }
    if (!formData.passportExpiry) {
      newErrors.passportExpiry = 'Passport expiry date is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSubmit({
        ...formData,
        id: applicant?.id || generateId(),
        referenceNumber: applicant?.referenceNumber || generateReferenceNumber('APP'),
        createdAt: applicant?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onCancel();
      }, 2000);
    } catch (err) {
      console.error('Failed to submit form:', err);
    }
  };
  
  // Calculate age
  const getAge = () => {
    if (!formData.dateOfBirth) return null;
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };
  
  // Next step
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };
  
  // Previous step
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Validate current step
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    } else if (currentStep === 2) {
      if (!formData.passportNumber?.trim()) newErrors.passportNumber = 'Passport number is required';
      if (!formData.passportIssueDate) newErrors.passportIssueDate = 'Issue date is required';
      if (!formData.passportExpiry) newErrors.passportExpiry = 'Expiry date is required';
    } else if (currentStep === 3) {
      if (!formData.email?.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
      if (!formData.address?.trim()) newErrors.address = 'Address is required';
      if (!formData.city?.trim()) newErrors.city = 'City is required';
      if (!formData.country) newErrors.country = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Step progress
  const getStepProgress = () => {
    return ((step - 1) / 3) * 100;
  };
  
  // Form steps
  const steps = [
    { number: 1, label: 'Personal Info' },
    { number: 2, label: 'Passport Info' },
    { number: 3, label: 'Contact Info' },
    { number: 4, label: 'Review' },
  ];
  
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary-900">{title}</h2>
            <p className="text-secondary-500 mt-1">
              {applicant ? 'Update existing applicant' : 'Register a new applicant'}
            </p>
          </div>
          {applicant && (
            <Badge variant="primary" className="text-sm">
              {applicant.referenceNumber}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    step > s.number ? 'bg-green-500 text-white' :
                    step === s.number ? 'bg-primary-600 text-white' :
                    'bg-secondary-200 text-secondary-500'
                  )}
                >
                  {step > s.number ? <CheckCircle className="h-4 w-4" /> : s.number}
                </div>
                <span className="text-xs text-secondary-500 mt-1 hidden md:block">
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-1 flex-1 mx-2 rounded transition-colors',
                    step > s.number + 1 ? 'bg-green-500' :
                    step === s.number + 1 ? 'bg-primary-600' :
                    'bg-secondary-200'
                  )}
                  style={{ minWidth: '60px' }}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={getStepProgress()} max={100} />
      </motion.div>

      {/* Success Alert */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert variant="success" onClose={() => setShowSuccess(false)}>
            Applicant saved successfully!
          </Alert>
        </motion.div>
      )}

      {/* Step 1: Personal Information */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card variant="bordered" padding="md">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <Input
                    label="First Name"
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    error={errors.firstName}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Input
                    label="Last Name"
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    error={errors.lastName}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="md:col-span-2">
                  <Input
                    label="Bengali Name"
                    value={formData.bengaliName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bengaliName: e.target.value }))}
                    hint="Optional - আবেদনকারীর বাংলা নাম"
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    error={errors.dateOfBirth}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Select
                    label="Gender"
                    options={genderOptions}
                    value={formData.gender || 'male'}
                    onChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                    error={errors.gender}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Select
                    label="Nationality"
                    options={nationalityOptions}
                    value={formData.nationality || 'Bangladesh'}
                    onChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
                    error={errors.nationality}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  {getAge() !== null && (
                    <Input
                      label="Age"
                      value={String(getAge())}
                      disabled
                      hint="Calculated from date of birth"
                    />
                  )}
                </motion.div>
              </div>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                isLoading={isLoading}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Passport Information */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card variant="bordered" padding="md">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Passport Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <Input
                    label="Passport Number"
                    value={formData.passportNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, passportNumber: e.target.value.toUpperCase() }))}
                    error={errors.passportNumber}
                    hint="Enter passport number without spaces"
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Input
                    label="Passport Issue Date"
                    type="date"
                    value={formData.passportIssueDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, passportIssueDate: e.target.value }))}
                    error={errors.passportIssueDate}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Input
                    label="Passport Expiry Date"
                    type="date"
                    value={formData.passportExpiry || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, passportExpiry: e.target.value }))}
                    error={errors.passportExpiry}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="flex items-end">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Passport Photo
                    </label>
                    <FileUpload
                      accept="image/jpeg,image/png,image/webp"
                      multiple={false}
                      onChange={handlePhotoUpload}
                      variant="drag-drop"
                      size="sm"
                    />
                    {photoPreview && (
                      <div className="mt-2 relative">
                        <img
                          src={photoPreview}
                          alt="Passport photo"
                          className="h-32 w-32 object-cover rounded-lg border-2 border-secondary-200"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="md:col-span-2">
                  <div className="w-full">
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Signature
                    </label>
                    <FileUpload
                      accept="image/jpeg,image/png,image/webp"
                      multiple={false}
                      onChange={handleSignatureUpload}
                      variant="drag-drop"
                      size="sm"
                    />
                    {signaturePreview && (
                      <div className="mt-2 relative">
                        <img
                          src={signaturePreview}
                          alt="Signature"
                          className="h-24 w-full object-contain rounded-lg border-2 border-secondary-200"
                        />
                        <button
                          type="button"
                          onClick={removeSignature}
                          className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={prevStep}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                isLoading={isLoading}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Contact Information */}
        {step === 3 && (
          <motion.div
            key="step3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card variant="bordered" padding="md">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    error={errors.email}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Input
                    label="Phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    error={errors.phone}
                    hint="Format: +880XXXXXXXXXX"
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants} className="md:col-span-2">
                  <Input
                    label="Address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    error={errors.address}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Input
                    label="City"
                    value={formData.city || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    error={errors.city}
                    required
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Select
                    label="Country"
                    options={countryOptions}
                    value={formData.country || 'Bangladesh'}
                    onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                    error={errors.country}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Input
                    label="Postal Code"
                    value={formData.postalCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={formData.status || 'active'}
                    onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    hint="Active applicants can be assigned to visa cases"
                  />
                </motion.div>
              </div>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={prevStep}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={nextStep}
                isLoading={isLoading}
              >
                Review
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <motion.div
            key="step4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card variant="bordered" padding="md">
              <h2 className="text-lg font-semibold text-secondary-900 mb-4">
                Review Information
              </h2>
              
              {/* Preview Card */}
              <Card variant="elevated" padding="md" className="mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Avatar
                      name={`${formData.firstName || ''} ${formData.lastName || ''}`}
                      size="xl"
                      src={photoPreview || undefined}
                      className="border-4 border-white shadow-lg"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  {formData.bengaliName && (
                    <p className="text-lg text-secondary-600">{formData.bengaliName}</p>
                  )}
                  <Badge variant="primary" className="mt-2">
                    {applicant?.referenceNumber || 'New Applicant'}
                  </Badge>
                </div>
              </Card>

              {/* Personal Info Review */}
              <Card variant="bordered" padding="md" className="mb-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Full Name</p>
                    <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Date of Birth</p>
                    <p className="font-medium">{formatDate(formData.dateOfBirth || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Gender</p>
                    <p className="font-medium capitalize">{formData.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Nationality</p>
                    <p className="font-medium">{formData.nationality}</p>
                  </div>
                </div>
              </Card>

              {/* Passport Info Review */}
              <Card variant="bordered" padding="md" className="mb-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Passport Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Passport Number</p>
                    <p className="font-medium">{formData.passportNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Issue Date</p>
                    <p className="font-medium">{formatDate(formData.passportIssueDate || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Expiry Date</p>
                    <p className="font-medium">{formatDate(formData.passportExpiry || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Age</p>
                    <p className="font-medium">{getAge() || 'N/A'} years</p>
                  </div>
                </div>
              </Card>

              {/* Contact Info Review */}
              <Card variant="bordered" padding="md" className="mb-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Email</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Phone</p>
                    <p className="font-medium">{formData.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-secondary-500 mb-1">Address</p>
                    <p className="font-medium">
                      {formData.address}, {formData.city}, {formData.country} {formData.postalCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-500 mb-1">Status</p>
                    <Badge variant={formData.status === 'active' ? 'success' : formData.status === 'inactive' ? 'warning' : 'danger'}>
                      {formData.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={prevStep}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
              >
                {applicant ? 'Update Applicant' : 'Create Applicant'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

export default ApplicantForm;
