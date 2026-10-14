// Visa Types
export type VisaType = 
  | 'tourist'
  | 'student'
  | 'work'
  | 'business'
  | 'family'
  | 'medical'
  | 'transit'
  | 'other';

export type VisaStatus = 
  | 'draft'
  | 'submitted'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'expired';

// Country Types
export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  visaTypes: VisaType[];
  processingTime: string;
  successRate: number;
  requirements: string[];
  fees: {
    tourist: number;
    student: number;
    work: number;
    business: number;
  };
  currency: string;
  isActive: boolean;
}

// Applicant Types
export interface Applicant {
  id: string;
  referenceNumber: string;
  firstName: string;
  lastName: string;
  bengaliName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  passportIssueDate: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  photo?: string;
  signature?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'blacklisted';
}

// Employer Types
export interface Employer {
  id: string;
  companyName: string;
  companyBengaliName?: string;
  registrationNumber: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  industry: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  isVerified: boolean;
  verificationDate?: string;
  documents: EmployerDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface EmployerDocument {
  id: string;
  name: string;
  type: 'registration' | 'tax' | 'license' | 'bank' | 'office' | 'other';
  filePath: string;
  fileUrl: string;
  issueDate: string;
  expiryDate?: string;
  verified: boolean;
  verificationNotes?: string;
}

// Employee Types
export interface Employee {
  id: string;
  applicantId: string;
  employerId: string;
  position: string;
  department: string;
  salary: number;
  currency: string;
  startDate: string;
  endDate?: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  contractDuration?: string;
  jobDescription: string;
  createdAt: string;
  updatedAt: string;
}

// Partner Types
export interface Partner {
  id: string;
  name: string;
  type: 'agent' | 'consultant' | 'lawyer' | 'recruiter' | 'other';
  company?: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  commissionRate: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Lead Types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  visaType: VisaType;
  targetCountry: string;
  message: string;
  source: 'website' | 'phone' | 'email' | 'social' | 'referral' | 'walk-in';
  status: 'new' | 'contacted' | 'interested' | 'not-interested' | 'converted';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Case Types
export interface VisaCase {
  id: string;
  referenceNumber: string;
  applicantId: string;
  employerId?: string;
  visaType: VisaType;
  targetCountry: string;
  status: VisaStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submissionDate: string;
  expectedDecisionDate?: string;
  actualDecisionDate?: string;
  decision?: string;
  rejectionReason?: string;
  documents: CaseDocument[];
  checklists: Checklist[];
  notes: CaseNote[];
  history: CaseHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface CaseDocument {
  id: string;
  name: string;
  type: 'passport' | 'photo' | 'application' | 'offer-letter' | 'financial' | 'education' | 'experience' | 'medical' | 'insurance' | 'other';
  filePath: string;
  fileUrl: string;
  uploadDate: string;
  verified: boolean;
  verificationNotes?: string;
  version: number;
}

export interface Checklist {
  id: string;
  item: string;
  category: string;
  required: boolean;
  completed: boolean;
  completionDate?: string;
  completedBy?: string;
  notes?: string;
}

export interface CaseNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  isInternal: boolean;
}

export interface CaseHistory {
  id: string;
  action: string;
  status: VisaStatus;
  author: string;
  timestamp: string;
  notes?: string;
}

// Approval Types
export interface Approval {
  id: string;
  caseId: string;
  type: 'document' | 'application' | 'payment' | 'final';
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  comments?: string;
}

// Audit Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// Document Types
export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'applicant-profile' | 'employer-letter' | 'case-report' | 'checklist' | 'case-pack' | 'rejection-analysis';
  template: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// AI Types
export interface AIModel {
  id: string;
  name: string;
  provider: 'mistral' | 'gemini';
  modelId: string;
  description: string;
  isActive: boolean;
  apiKey: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language: string;
  timestamp: string;
  sessionId: string;
  model: string;
  tokensUsed?: number;
}

export interface AIChatSession {
  id: string;
  userId: string;
  caseId?: string;
  title: string;
  messages: AIChatMessage[];
  model: string;
  createdAt: string;
  updatedAt: string;
}

// Research Types
export interface ResearchRequest {
  id: string;
  url: string;
  query: string;
  language: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: ResearchResult;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchResult {
  title: string;
  summary: string;
  content: string;
  language: string;
  extractedData: any;
  screenshots?: string[];
}

// Settings Types
export interface AppSettings {
  id: string;
  appName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  currency: string;
  timezone: string;
  dateFormat: string;
  aiProvider: 'mistral' | 'gemini' | 'both';
  defaultAIModel: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  mistralApiKey: string;
  geminiApiKey: string;
  enableAnalytics: boolean;
  enableAuditLog: boolean;
  maxFileUploadSize: number;
  allowedFileTypes: string[];
}

export interface UserSettings {
  id: string;
  userId: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboardLayout: string;
  quickActions: string[];
}

// User Types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'agent' | 'client';
  permissions: string[];
  lastLogin?: string;
  loginCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings?: UserSettings;
}

// Client Types
export interface Client {
  id: string;
  userId: string;
  referenceNumber: string;
  cases: string[];
  documents: string[];
  canAccessAllCases: boolean;
  restrictedToOwnCases: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  data?: any;
  createdAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  caseId: string;
  applicantId: string;
  amount: number;
  currency: string;
  method: 'cash' | 'bank' | 'mobile' | 'card' | 'online';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  receipt?: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Report Types
export interface Report {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  title: string;
  data: any;
  filters: any;
  generatedBy: string;
  generatedAt: string;
  filePath?: string;
  fileUrl?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  warnings?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Form Types
export interface VisaApplicationForm {
  applicantId: string;
  visaType: VisaType;
  targetCountry: string;
  purpose: string;
  duration: string;
  travelDate?: string;
  returnDate?: string;
  accommodation?: string;
  sponsor?: string;
  financialProof?: string;
  previousVisas?: PreviousVisa[];
  criminalRecord?: boolean;
  medicalConditions?: string;
}

export interface PreviousVisa {
  country: string;
  visaType: VisaType;
  issueDate: string;
  expiryDate: string;
  status: VisaStatus;
  rejectionReason?: string;
}

// PDF Types
export interface PDFDocument {
  id: string;
  name: string;
  type: string;
  content: string | Uint8Array;
  path: string;
  url: string;
  size: number;
  pages: number;
  createdAt: string;
  updatedAt: string;
}

export interface PDFGenerationOptions {
  templateId: string;
  data: any;
  language: string;
  includeHeader: boolean;
  includeFooter: boolean;
  watermark?: string;
  encryption?: {
    password: string;
    permissions: string[];
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type RequireAllOrNone<T, Keys extends keyof T = keyof T> = 
  | Pick<T, Exclude<keyof T, Keys>> & Required<Pick<T, Keys>>
  | Pick<T, Exclude<keyof T, Keys>> & Partial<Pick<T, Keys>>;
