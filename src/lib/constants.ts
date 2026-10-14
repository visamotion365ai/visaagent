// App Constants
import { Country, VisaType } from '@/types';

// App Configuration
export const APP_CONFIG = {
  name: 'VisaMOTion AI Agency',
  shortName: 'VisaMOTion',
  version: '1.0.0',
  description: 'Bangladesh-based visa consultancy and international recruitment agency platform',
  company: 'VisaMOTion Pte. Ltd.',
  supportEmail: 'support@visamotion.ai',
  supportPhone: '+880-1234-567890',
  website: 'https://visamotion.ai',
  defaultLanguage: 'bn',
  supportedLanguages: ['bn', 'en', 'ar', 'hi', 'ur'] as const,
  defaultCurrency: 'BDT',
  timezone: 'Asia/Dhaka',
  dateFormat: 'DD/MM/YYYY',
};

// API Configuration
export const API_CONFIG = {
  apiTimeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  maxFileUploadSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'],
};

// AI Configuration
export const AI_CONFIG = {
  defaultProvider: 'mistral' as const,
  defaultModel: 'mistral-tiny' as const,
  mistral: {
    baseUrl: 'https://api.mistral.ai/v1',
    models: {
      tiny: 'mistral-tiny-latest',
      small: 'mistral-small-latest',
      medium: 'mistral-medium-latest',
      large: 'mistral-large-latest',
    },
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: {
      nano: 'gemini-nano',
      flash: 'gemini-1.5-flash-latest',
      pro: 'gemini-1.5-pro-latest',
    },
    temperature: 0.7,
    maxTokens: 4096,
    topP: 0.9,
    topK: 40,
  },
  systemPrompts: {
    bengali: `তুমি একটি ভিসা কনসালটেন্সি এজেন্সির AI সহকারী। তুমি বাংলা ভাষায় সুনির্দিষ্ট, সহায়ক এবং পেশাদার উত্তর প্রদান করবে।
    
তুমি নিম্নলিখিত বিষয়গুলিতে সহায়তা করতে পারবে:
- ভিসা আবেদনের প্রক্রিয়া ব্যাখ্যা
- দস্তাবেজ চেকলিস্ট তৈরি
- ভিসা রিজেকশন লেটার বিশ্লেষণ
- দেশভিত্তিক ভিসা প্রয়োজনীয়তা
- আবেদনকারীর প্রোফাইল তৈরি
- নিয়োগকর্তার ডকুমেন্ট প্রস্তুতি
- কেস রিপোর্ট তৈরি
- ওয়েবসাইট গবেষণা রিপোর্ট

সর্বদা বাংলা ভাষায় উত্তর দাও। উত্তরগুলি সংক্ষিপ্ত, স্পষ্ট এবং প্রাসঙ্গিক হওয়া উচিত।
উত্তরগুলি HTML বা মার্কডাউন ফরম্যাটে দাও যাতে সুন্দরভাবে প্রদর্শন করা যায়।`,
    english: `You are an AI assistant for a visa consultancy agency. You provide specific, helpful, and professional responses in English.

You can assist with:
- Visa application process explanations
- Document checklist creation
- Visa rejection letter analysis
- Country-specific visa requirements
- Applicant profile creation
- Employer document preparation
- Case report generation
- Website research reports

Always respond in English. Keep responses concise, clear, and relevant. Format responses in HTML or Markdown for better presentation.`,
  },
  responseLanguages: {
    bn: 'Bengali',
    en: 'English',
    ar: 'Arabic',
    hi: 'Hindi',
    ur: 'Urdu',
  },
};

// Visa Types Configuration
export const VISA_TYPES: { id: VisaType; label: Record<string, string>; icon: string; description: Record<string, string> }[] = [
  {
    id: 'tourist',
    label: { en: 'Tourist Visa', bn: 'টুরিস্ট ভিসা', ar: 'فيزا سياحية', hi: 'टूरिस्ट वीज़ा', ur: 'سیاحی وزا' },
    icon: 'plane',
    description: { en: 'For tourism and leisure travel', bn: 'পরিব্রমণ ও অবসর ভ্রমণের জন্য', ar: 'للسفر السياحي والترفيه', hi: 'पर्यटन और अवकाश यात्रा के लिए', ur: 'سیاحت اور تفریحی سفر کے لیے' }
  },
  {
    id: 'student',
    label: { en: 'Student Visa', bn: 'স্টুডেন্ট ভিসা', ar: 'فيزا طالب', hi: 'स्टूडेंट वीज़ा', ur: 'طالب علم وزا' },
    icon: 'graduation-cap',
    description: { en: 'For studying abroad', bn: 'বিদেশে পড়াশোনার জন্য', ar: 'للدراسة في الخارج', hi: 'विदेश में पढ़ाई के लिए', ur: '外国 میں تعلیم کے لیے' }
  },
  {
    id: 'work',
    label: { en: 'Work Visa', bn: 'ওয়ার্ক ভিসা', ar: 'فيزا عمل', hi: 'वर्क वीज़ा', ur: 'کام وزا' },
    icon: 'briefcase',
    description: { en: 'For employment abroad', bn: 'বিদেশে চাকরির জন্য', ar: 'للعمل في الخارج', hi: 'विदेश में रोजगार के लिए', ur: '外国 میں ملازمت کے لیے' }
  },
  {
    id: 'business',
    label: { en: 'Business Visa', bn: 'বিজনেস ভিসা', ar: 'فيزا عمل تجاري', hi: 'बिजनेस वीज़ा', ur: 'بزنس وزا' },
    icon: 'dollar-sign',
    description: { en: 'For business meetings and conferences', bn: 'ব্যবসায়িক মিটিং ও কনফারেন্সের জন্য', ar: 'للقاءات التجارية والمؤتمرات', hi: 'व्यापारिक बैठकों और सम्मेलनों के लिए', ur: 'بزنس میٹنگز اور کانفرنس کے لیے' }
  },
  {
    id: 'family',
    label: { en: 'Family Visa', bn: 'ফ্যামিলি ভিসা', ar: 'فيزا عائلية', hi: 'फैमिली वीज़ा', ur: 'خاندانی وزا' },
    icon: 'users',
    description: { en: 'For joining family members abroad', bn: 'বিদেশে পরিবারের সদস্যদের সাথে যোগদানের জন্য', ar: 'لانضمام إلى أفراد الأسرة في الخارج', hi: 'विदेश में परिवार के सदस्यों से जुड़ने के लिए', ur: '外国 میں خاندان کے ارکان سے ملنے کے لیے' }
  },
  {
    id: 'medical',
    label: { en: 'Medical Visa', bn: 'মেডিক্যাল ভিসা', ar: 'فيزا طبية', hi: 'मेडिकल वीज़ा', ur: 'طبی وزا' },
    icon: 'heart',
    description: { en: 'For medical treatment abroad', bn: 'বিদেশে চিকিৎসার জন্য', ar: 'للعلاج الطبي في الخارج', hi: 'विदेश में चिकित्सा के लिए', ur: '外国 میں علاج کے لیے' }
  },
  {
    id: 'transit',
    label: { en: 'Transit Visa', bn: 'ট্রানজিট ভিসা', ar: 'فيزا عبور', hi: 'ट्रांज़िट वीज़ा', ur: 'گذرگاہ وزا' },
    icon: 'plane',
    description: { en: 'For passing through a country', bn: 'একটি দেশের মধ্য দিয়ে যাওয়ার জন্য', ar: 'للمرور عبر بلد', hi: 'एक देश से गुजरने के लिए', ur: 'ایک ملک سے گذرنے کے لیے' }
  },
  {
    id: 'other',
    label: { en: 'Other', bn: 'অন্যান্য', ar: 'أخرى', hi: 'अन्य', ur: 'دوسرے' },
    icon: 'more-horizontal',
    description: { en: 'Other visa types', bn: 'অন্যান্য ভিসা ধরন', ar: 'أنواع الفيزا الأخرى', hi: 'अन्य वीज़ा प्रकार', ur: 'دوسرے وزا قسم' }
  },
];

// Country Configuration
export const COUNTRIES: Country[] = [
  {
    id: 'usa',
    name: 'United States',
    code: 'US',
    flag: '🇺🇸',
    visaTypes: ['tourist', 'student', 'work', 'business', 'family', 'medical', 'transit'],
    processingTime: '2-4 weeks',
    successRate: 75,
    requirements: ['Passport', 'Application Form', 'Photo', 'Financial Proof', 'Travel Itinerary'],
    fees: { tourist: 160, student: 185, work: 190, business: 160 },
    currency: 'USD',
    isActive: true,
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    visaTypes: ['tourist', 'student', 'work', 'business', 'family', 'medical'],
    processingTime: '3-6 weeks',
    successRate: 80,
    requirements: ['Passport', 'Application Form', 'Photo', 'Financial Proof', 'Tuberculosis Test'],
    fees: { tourist: 115, student: 490, work: 827, business: 115 },
    currency: 'GBP',
    isActive: true,
  },
  {
    id: 'canada',
    name: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    visaTypes: ['tourist', 'student', 'work', 'business', 'family', 'medical'],
    processingTime: '1-3 months',
    successRate: 70,
    requirements: ['Passport', 'Application Form', 'Photo', 'Financial Proof', 'Biometrics'],
    fees: { tourist: 100, student: 150, work: 155, business: 100 },
    currency: 'CAD',
    isActive: true,
  },
  {
    id: 'australia',
    name: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    visaTypes: ['tourist', 'student', 'work', 'business', 'family', 'medical'],
    processingTime: '1-4 months',
    successRate: 78,
    requirements: ['Passport', 'Application Form', 'Photo', 'Financial Proof', 'Health Examination'],
    fees: { tourist: 150, student: 651, work: 4640, business: 150 },
    currency: 'AUD',
    isActive: true,
  },
  {
    id: 'germany',
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    visaTypes: ['tourist', 'student', 'work', 'business', 'family', 'medical'],
    processingTime: '2-4 weeks',
    successRate: 85,
    requirements: ['Passport', 'Application Form', 'Photo', 'Financial Proof', 'Travel Insurance'],
    fees: { tourist: 80, student: 75, work: 75, business: 80 },
    currency: 'EUR',
    isActive: true,
  },
  {
    id: 'france',
    name: 'France',
    code: 'FR',
    flag: '🇫🇷',
    visaTypes: ['tourist', 'student', 'work', 'business', 'family', 'medical'],
    processingTime: '2-3 weeks',
    successRate: 82,
    requirements: ['Passport', 'Application Form', 'Photo', 'Financial Proof', 'Accommodation Proof'],
    fees: { tourist: 80, student: 99, work: 99, business: 80 },
    currency: 'EUR',
    isActive: true,
  },
  {
    id: 'malaysia',
    name: 'Malaysia',
    code: 'MY',
    flag: '🇲🇾',
    visaTypes: ['tourist', 'student', 'work', 'business', 'family', 'medical', 'transit'],
    processingTime: '1-2 weeks',
    successRate: 90,
    requirements: ['Passport', 'Application Form', 'Photo', 'Financial Proof'],
    fees: { tourist: 0, student: 0, work: 200, business: 0 },
    currency: 'MYR',
    isActive: true,
  },
  {
    id: 'singapore',
    name: 'Singapore',
    code: 'SG',
    flag: '🇸🇬',
    visaTypes: ['tourist', 'student', 'work', 'business', 'family', 'medical', 'transit'],
    processingTime: '1-3 days',
    successRate: 95,
    requirements: ['Passport', 'Application Form', 'Photo', 'Financial Proof'],
    fees: { tourist: 30, student: 30, work: 225, business: 30 },
    currency: 'SGD',
    isActive: true,
  },
  {
    id: 'saudi-arabia',
    name: 'Saudi Arabia',
    code: 'SA',
    flag: '🇸🇦',
    visaTypes: ['tourist', 'work', 'business', 'family', 'medical', 'transit'],
    processingTime: '1-2 weeks',
    successRate: 88,
    requirements: ['Passport', 'Application Form', 'Photo', 'Invitation Letter'],
    fees: { tourist: 0, student: 0, work: 200, business: 0 },
    currency: 'SAR',
    isActive: true,
  },
  {
    id: 'uae',
    name: 'United Arab Emirates',
    code: 'AE',
    flag: '🇦🇪',
    visaTypes: ['tourist', 'student', 'work', 'business', 'family', 'medical', 'transit'],
    processingTime: '3-5 days',
    successRate: 92,
    requirements: ['Passport', 'Application Form', 'Photo', 'Hotel Booking'],
    fees: { tourist: 0, student: 0, work: 300, business: 0 },
    currency: 'AED',
    isActive: true,
  },
  {
    id: 'qatar',
    name: 'Qatar',
    code: 'QA',
    flag: '🇶🇦',
    visaTypes: ['tourist', 'work', 'business', 'family', 'medical', 'transit'],
    processingTime: '1 week',
    successRate: 90,
    requirements: ['Passport', 'Application Form', 'Photo', 'Hotel Booking'],
    fees: { tourist: 0, student: 0, work: 200, business: 0 },
    currency: 'QAR',
    isActive: true,
  },
  {
    id: 'kuwait',
    name: 'Kuwait',
    code: 'KW',
    flag: '🇰🇼',
    visaTypes: ['tourist', 'work', 'business', 'family', 'medical'],
    processingTime: '1-2 weeks',
    successRate: 85,
    requirements: ['Passport', 'Application Form', 'Photo', 'Sponsor Letter'],
    fees: { tourist: 0, student: 0, work: 150, business: 0 },
    currency: 'KWD',
    isActive: true,
  },
  {
    id: 'oman',
    name: 'Oman',
    code: 'OM',
    flag: '🇴🇲',
    visaTypes: ['tourist', 'work', 'business', 'family', 'medical'],
    processingTime: '1 week',
    successRate: 88,
    requirements: ['Passport', 'Application Form', 'Photo'],
    fees: { tourist: 20, student: 0, work: 200, business: 20 },
    currency: 'OMR',
    isActive: true,
  },
  {
    id: 'bahrain',
    name: 'Bahrain',
    code: 'BH',
    flag: '🇧🇭',
    visaTypes: ['tourist', 'work', 'business', 'family', 'medical'],
    processingTime: '3-5 days',
    successRate: 90,
    requirements: ['Passport', 'Application Form', 'Photo'],
    fees: { tourist: 0, student: 0, work: 100, business: 0 },
    currency: 'BHD',
    isActive: true,
  },
];

// Industry Types
export const INDUSTRIES = [
  { id: 'it', label: { en: 'Information Technology', bn: 'তথ্য প্রযুক্তি' } },
  { id: 'healthcare', label: { en: 'Healthcare', bn: 'স্বাস্থ্যসেবা' } },
  { id: 'education', label: { en: 'Education', bn: 'শিক্ষা' } },
  { id: 'construction', label: { en: 'Construction', bn: 'নির্মাণ' } },
  { id: 'manufacturing', label: { en: 'Manufacturing', bn: 'উত্পাদন' } },
  { id: 'retail', label: { en: 'Retail', bn: 'খুচরা বিক্রয়' } },
  { id: 'hospitality', label: { en: 'Hospitality', bn: 'আতিথেয়তা' } },
  { id: 'finance', label: { en: 'Finance', bn: 'আর্থিক' } },
  { id: 'transportation', label: { en: 'Transportation', bn: 'পরিবহন' } },
  { id: 'agriculture', label: { en: 'Agriculture', bn: 'কৃষি' } },
  { id: 'oil-gas', label: { en: 'Oil & Gas', bn: 'তেল ও গ্যাস' } },
  { id: 'telecom', label: { en: 'Telecommunications', bn: 'টেলিকমিউনিকেশন' } },
  { id: 'media', label: { en: 'Media', bn: 'মিডিয়া' } },
  { id: 'ngo', label: { en: 'NGO', bn: 'এনজিও' } },
  { id: 'other', label: { en: 'Other', bn: 'অন্যান্য' } },
];

// Document Types
export const DOCUMENT_TYPES = [
  { id: 'passport', label: { en: 'Passport', bn: 'পাসপোর্ট' }, required: true },
  { id: 'photo', label: { en: 'Photograph', bn: 'ফটোগ্রাফ' }, required: true },
  { id: 'application', label: { en: 'Application Form', bn: 'আবেদন ফর্ম' }, required: true },
  { id: 'offer-letter', label: { en: 'Offer Letter', bn: 'অফার লেটার' }, required: false },
  { id: 'financial', label: { en: 'Financial Documents', bn: 'আর্থিক দস্তাবেজ' }, required: true },
  { id: 'education', label: { en: 'Educational Certificates', bn: 'শিক্ষাগত সনদ' }, required: false },
  { id: 'experience', label: { en: 'Experience Certificates', bn: 'অভিজ্ঞতার সনদ' }, required: false },
  { id: 'medical', label: { en: 'Medical Certificate', bn: 'মেডিক্যাল সনদ' }, required: false },
  { id: 'insurance', label: { en: 'Insurance', bn: 'বীমা' }, required: false },
  { id: 'police-clearance', label: { en: 'Police Clearance', bn: 'পুলিশ ক্লিয়ারেন্স' }, required: false },
  { id: 'birth-certificate', label: { en: 'Birth Certificate', bn: 'জন্ম সনদ' }, required: false },
  { id: 'marriage-certificate', label: { en: 'Marriage Certificate', bn: 'বিবাহ সনদ' }, required: false },
  { id: 'nid', label: { en: 'National ID', bn: 'জাতীয় পরিচয়পত্র' }, required: false },
  { id: 'tin', label: { en: 'TIN Certificate', bn: 'টিআইএন সনদ' }, required: false },
  { id: 'bank-statement', label: { en: 'Bank Statement', bn: 'ব্যাংক স্টেটমেন্ট' }, required: false },
  { id: 'other', label: { en: 'Other', bn: 'অন্যান্য' }, required: false },
];

// Visa Status Configuration
export const VISA_STATUS_CONFIG: Record<string, { label: Record<string, string>; color: string; icon: string }> = {
  draft: { label: { en: 'Draft', bn: 'খসড়া' }, color: 'bg-gray-100 text-gray-800', icon: 'file' },
  submitted: { label: { en: 'Submitted', bn: 'জমা দেওয়া হয়েছে' }, color: 'bg-blue-100 text-blue-800', icon: 'send' },
  processing: { label: { en: 'Processing', bn: 'প্রক্রিয়াধীন' }, color: 'bg-yellow-100 text-yellow-800', icon: 'loader-2' },
  approved: { label: { en: 'Approved', bn: 'অনুমোদিত' }, color: 'bg-green-100 text-green-800', icon: 'check-circle-2' },
  rejected: { label: { en: 'Rejected', bn: 'প্রত্যাখ্যাত' }, color: 'bg-red-100 text-red-800', icon: 'x-circle' },
  cancelled: { label: { en: 'Cancelled', bn: 'বাতিল' }, color: 'bg-gray-100 text-gray-800', icon: 'x' },
  expired: { label: { en: 'Expired', bn: 'মেয়াদ উত্তীর্ণ' }, color: 'bg-orange-100 text-orange-800', icon: 'calendar-x' },
};

// Priority Configuration
export const PRIORITY_CONFIG: Record<string, { label: Record<string, string>; color: string }> = {
  low: { label: { en: 'Low', bn: 'নিম্ন' }, color: 'bg-green-100 text-green-800' },
  medium: { label: { en: 'Medium', bn: 'মধ্যম' }, color: 'bg-yellow-100 text-yellow-800' },
  high: { label: { en: 'High', bn: 'উচ্চ' }, color: 'bg-orange-100 text-orange-800' },
  urgent: { label: { en: 'Urgent', bn: 'জরুরী' }, color: 'bg-red-100 text-red-800' },
};

// Lead Source Configuration
export const LEAD_SOURCE_CONFIG: Record<string, { label: Record<string, string> }> = {
  website: { label: { en: 'Website', bn: 'ওয়েবসাইট' } },
  phone: { label: { en: 'Phone', bn: 'ফোন' } },
  email: { label: { en: 'Email', bn: 'ইমেইল' } },
  social: { label: { en: 'Social Media', bn: 'সোশ্যাল মিডিয়া' } },
  referral: { label: { en: 'Referral', bn: 'রেফারেল' } },
  'walk-in': { label: { en: 'Walk-in', bn: 'সশরীরে' } },
};

// Lead Status Configuration
export const LEAD_STATUS_CONFIG: Record<string, { label: Record<string, string>; color: string }> = {
  new: { label: { en: 'New', bn: 'নতুন' }, color: 'bg-blue-100 text-blue-800' },
  contacted: { label: { en: 'Contacted', bn: 'যোগাযোগ করা হয়েছে' }, color: 'bg-yellow-100 text-yellow-800' },
  interested: { label: { en: 'Interested', bn: 'আগ্রহী' }, color: 'bg-green-100 text-green-800' },
  'not-interested': { label: { en: 'Not Interested', bn: 'আগ্রহী নয়' }, color: 'bg-red-100 text-red-800' },
  converted: { label: { en: 'Converted', bn: 'রূপান্তরিত' }, color: 'bg-purple-100 text-purple-800' },
};

// Approval Status Configuration
export const APPROVAL_STATUS_CONFIG: Record<string, { label: Record<string, string>; color: string }> = {
  pending: { label: { en: 'Pending', bn: 'মুলতুবি' }, color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: { en: 'Approved', bn: 'অনুমোদিত' }, color: 'bg-green-100 text-green-800' },
  rejected: { label: { en: 'Rejected', bn: 'প্রত্যাখ্যাত' }, color: 'bg-red-100 text-red-800' },
  cancelled: { label: { en: 'Cancelled', bn: 'বাতিল' }, color: 'bg-gray-100 text-gray-800' },
};

// Payment Method Configuration
export const PAYMENT_METHOD_CONFIG: Record<string, { label: Record<string, string> }> = {
  cash: { label: { en: 'Cash', bn: 'নগদ' } },
  bank: { label: { en: 'Bank Transfer', bn: 'ব্যাংক ট্রান্সফার' } },
  mobile: { label: { en: 'Mobile Banking', bn: 'মোবাইল ব্যাংকিং' } },
  card: { label: { en: 'Credit/Debit Card', bn: 'ক্রেডিট/ডেবিট কার্ড' } },
  online: { label: { en: 'Online Payment', bn: 'অনলাইন পেমেন্ট' } },
};

// Payment Status Configuration
export const PAYMENT_STATUS_CONFIG: Record<string, { label: Record<string, string>; color: string }> = {
  pending: { label: { en: 'Pending', bn: 'মুলতুবি' }, color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: { en: 'Paid', bn: 'পরিশোধিত' }, color: 'bg-green-100 text-green-800' },
  failed: { label: { en: 'Failed', bn: 'বিফল' }, color: 'bg-red-100 text-red-800' },
  refunded: { label: { en: 'Refunded', bn: 'ফেরত দেওয়া হয়েছে' }, color: 'bg-blue-100 text-blue-800' },
};

// User Role Configuration
export const USER_ROLE_CONFIG: Record<string, { label: Record<string, string>; permissions: string[] }> = {
  admin: {
    label: { en: 'Admin', bn: 'এডমিন' },
    permissions: ['create', 'read', 'update', 'delete', 'approve', 'manage-users', 'manage-settings', 'view-audit'],
  },
  manager: {
    label: { en: 'Manager', bn: 'ম্যানেজার' },
    permissions: ['create', 'read', 'update', 'delete', 'approve', 'manage-users', 'view-reports'],
  },
  agent: {
    label: { en: 'Agent', bn: 'এজেন্ট' },
    permissions: ['create', 'read', 'update', 'view-own'],
  },
  client: {
    label: { en: 'Client', bn: 'ক্লায়েন্ট' },
    permissions: ['read-own', 'view-own-cases'],
  },
};

// Template Types
export const TEMPLATE_TYPES = [
  { id: 'applicant-profile', label: { en: 'Applicant Profile', bn: 'আবেদনকারীর প্রোফাইল' } },
  { id: 'employer-letter', label: { en: 'Employer Letter', bn: 'নিয়োগকর্তার চিঠি' } },
  { id: 'case-report', label: { en: 'Case Report', bn: 'কেস রিপোর্ট' } },
  { id: 'checklist', label: { en: 'Checklist', bn: 'চেকলিস্ট' } },
  { id: 'case-pack', label: { en: 'Complete Case Pack', bn: 'পূর্ণ কেস প্যাক' } },
  { id: 'rejection-analysis', label: { en: 'Rejection Analysis', bn: 'প্রত্যাখ্যান বিশ্লেষণ' } },
];

// Notification Types
export const NOTIFICATION_TYPES = {
  info: { label: { en: 'Information', bn: 'তথ্য' }, color: 'bg-blue-100 text-blue-800' },
  success: { label: { en: 'Success', bn: 'সাফল্য' }, color: 'bg-green-100 text-green-800' },
  warning: { label: { en: 'Warning', bn: 'সতর্কতা' }, color: 'bg-yellow-100 text-yellow-800' },
  error: { label: { en: 'Error', bn: 'ত্রুটি' }, color: 'bg-red-100 text-red-800' },
};

// Storage Keys
export const STORAGE_KEYS = {
  settings: 'visamotion_settings',
  user: 'visamotion_user',
  token: 'visamotion_token',
  theme: 'visamotion_theme',
  language: 'visamotion_language',
  chatSessions: 'visamotion_chat_sessions',
  recentFiles: 'visamotion_recent_files',
  favorites: 'visamotion_favorites',
  lastUpdated: 'visamotion_last_updated',
};

// Error Messages
export const ERROR_MESSAGES = {
  network: { en: 'Network error. Please check your connection.', bn: 'নেটওয়ার্ক ত্রুটি। আপনার সংযোগ চেক করুন।' },
  authentication: { en: 'Authentication failed. Please login again.', bn: 'প্রমাণীকরণ ব্যর্থ। অনুগ্রহ করে আবার লগইন করুন।' },
  validation: { en: 'Please fill all required fields.', bn: 'অনুগ্রহ করে সব প্রয়োজনীয় ফিল্ড পূরণ করুন।' },
  fileSize: { en: 'File size exceeds the limit.', bn: 'ফাইল সাইজ সীমা অতিক্রম করেছে।' },
  fileType: { en: 'Invalid file type.', bn: 'অবৈধ ফাইল টাইপ।' },
  notFound: { en: 'Resource not found.', bn: 'রিসোর্স খুঁজে পাওয়া যায়নি।' },
  forbidden: { en: 'Access denied.', bn: 'অ্যাক্সেস অস্বীকৃত।' },
  server: { en: 'Server error. Please try again later.', bn: 'সার্ভার ত্রুটি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।' },
  aiLimit: { en: 'AI request limit exceeded. Please try again later.', bn: 'AI অনুরোধ সীমা অতিক্রম করেছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।' },
  apiKey: { en: 'API key not configured. Please set it up in settings.', bn: 'API কী কনফিগার করা হয়নি। অনুগ্রহ করে সেটিংসে সেট আপ করুন।' },
};

// Success Messages
export const SUCCESS_MESSAGES = {
  created: { en: 'Created successfully.', bn: 'সফলভাবে তৈরি করা হয়েছে।' },
  updated: { en: 'Updated successfully.', bn: 'সফলভাবে আপডেট করা হয়েছে।' },
  deleted: { en: 'Deleted successfully.', bn: 'সফলভাবে মুছে ফেলা হয়েছে।' },
  submitted: { en: 'Submitted successfully.', bn: 'সফলভাবে জমা দেওয়া হয়েছে।' },
  approved: { en: 'Approved successfully.', bn: 'সফলভাবে অনুমোদন করা হয়েছে।' },
  saved: { en: 'Saved successfully.', bn: 'সফলভাবে সংরক্ষণ করা হয়েছে।' },
  uploaded: { en: 'Uploaded successfully.', bn: 'সফলভাবে আপলোড করা হয়েছে।' },
  downloaded: { en: 'Downloaded successfully.', bn: 'সফলভাবে ডাউনলোড করা হয়েছে।' },
};

// Validation Rules
export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-\.']+$/,
    message: { en: 'Please enter a valid name.', bn: 'অনুগ্রহ করে একটি বৈধ নাম লিখুন।' },
  },
  bengaliName: {
    minLength: 2,
    maxLength: 100,
    message: { en: 'Please enter a valid Bengali name.', bn: 'অনুগ্রহ করে একটি বৈধ বাংলা নাম লিখুন।' },
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: { en: 'Please enter a valid email address.', bn: 'অনুগ্রহ করে একটি বৈধ ইমেইল ঠিকানা লিখুন।' },
  },
  phone: {
    pattern: /^\+?[0-9\s\-\(\)]{10,20}$/,
    message: { en: 'Please enter a valid phone number.', bn: 'অনুগ্রহ করে একটি বৈধ ফোন নম্বর লিখুন।' },
  },
  passport: {
    pattern: /^[A-Z0-9]{6,20}$/,
    message: { en: 'Please enter a valid passport number.', bn: 'অনুগ্রহ করে একটি বৈধ পাসপোর্ট নম্বর লিখুন।' },
  },
  date: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: { en: 'Please enter a valid date (YYYY-MM-DD).', bn: 'অনুগ্রহ করে একটি বৈধ তারিখ লিখুন (YYYY-MM-DD)।' },
  },
  url: {
    pattern: /^https?:\/\/[^\s]+$/,
    message: { en: 'Please enter a valid URL.', bn: 'অনুগ্রহ করে একটি বৈধ URL লিখুন।' },
  },
};

// Regex Patterns
export const REGEX_PATTERNS = {
  bengali: /[\u0980-\u09FF]/,
  english: /[a-zA-Z]/,
  number: /[0-9]/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[0-9\s\-\(\)]{10,20}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  url: /^https?:\/\/[^\s]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

// Date Formats
export const DATE_FORMATS = {
  display: 'DD MMM YYYY',
  input: 'YYYY-MM-DD',
  api: 'YYYY-MM-DD',
  bengali: 'DD/MM/YYYY',
};

// Default Values
export const DEFAULTS = {
  pageSize: 20,
  maxPageSize: 100,
  debounceTime: 300,
  animationDuration: 300,
  toastDuration: 3000,
  maxFileSize: 10 * 1024 * 1024,
  defaultLanguage: 'bn',
  defaultCurrency: 'BDT',
  defaultCountry: 'bd',
  defaultVisaType: 'tourist' as VisaType,
};
