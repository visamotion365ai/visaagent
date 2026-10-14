import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, DATE_FORMATS, DEFAULTS } from './constants';
import type { VisaType, Country, PaginationParams, ApiResponse, PaginatedResponse } from '@/types';

// Tailwind class merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate unique ID
export function generateId(): string {
  return uuidv4();
}

// Generate reference number
export function generateReferenceNumber(prefix: string = 'VISA'): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Format date
export function formatDate(date: string | Date, format: string = DATE_FORMATS.display): string {
  const d = new Date(date);
  
  const formats: Record<string, () => string> = {
    'DD MMM YYYY': () => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    'YYYY-MM-DD': () => d.toISOString().split('T')[0],
    'DD/MM/YYYY': () => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },
    'MMM DD, YYYY': () => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
  };
  
  return formats[format] ? formats[format]() : formats[DATE_FORMATS.display]();
}

// Format date in Bengali
export function formatDateBengali(date: string | Date): string {
  const d = new Date(date);
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const day = String(d.getDate()).padStart(2, '0').split('').map(c => banglaDigits[parseInt(c)]).join('');
  const month = String(d.getMonth() + 1).padStart(2, '0').split('').map(c => banglaDigits[parseInt(c)]).join('');
  const year = d.getFullYear().toString().split('').map(c => banglaDigits[parseInt(c)]).join('');
  return `${day}/${month}/${year}`;
}

// Format number with currency
export function formatCurrency(amount: number, currency: string = DEFAULTS.defaultCurrency): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    CAD: 'CA$',
    AUD: 'A$',
    SAR: '﷼',
    AED: 'د.إ',
    QAR: 'ر.ق',
    KWD: 'د.ك',
    OMR: 'ر.ع.',
    BHD: '.د.ب',
    MYR: 'RM',
    SGD: 'S$',
    BDT: '৳',
    INR: '₹',
  };
  
  const symbol = currencySymbols[currency] || currency;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${symbol} ${formatted}`;
}

// Format number in Bengali
export function formatNumberBengali(num: number): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(c => banglaDigits[parseInt(c)]).join('');
}

// Format phone number
export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Bangladesh phone format
  if (digits.startsWith('880') || digits.startsWith('0')) {
    const clean = digits.startsWith('880') ? digits : digits.startsWith('0') ? digits.substring(1) : digits;
    return `+880 ${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  
  // International format
  return phone;
}

// Truncate text
export function truncate(text: string, length: number = 100): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Capitalize first letter
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Capitalize all words
export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text.split(' ').map(word => capitalize(word)).join(' ');
}

// Get initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Get full name
export function getFullName(firstName: string, lastName: string, bengaliName?: string): string {
  if (bengaliName) {
    return `${firstName} ${lastName} (${bengaliName})`;
  }
  return `${firstName} ${lastName}`;
}

// Get country by ID
export function getCountryById(countries: Country[], id: string): Country | undefined {
  return countries.find(c => c.id === id);
}

// Get country flag emoji
export function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Get visa type label
export function getVisaTypeLabel(visaType: VisaType, language: string = 'en'): string {
  const labels: Record<VisaType, Record<string, string>> = {
    tourist: { en: 'Tourist Visa', bn: 'টুরিস্ট ভিসা', ar: 'فيزا سياحية', hi: 'टूरिस्ट वीज़ा', ur: 'سیاحی وزا' },
    student: { en: 'Student Visa', bn: 'স্টুডেন্ট ভিসা', ar: 'فيزا طالب', hi: 'स्टूडेंट वीज़ा', ur: 'طالب علم وزا' },
    work: { en: 'Work Visa', bn: 'ওয়ার্ক ভিসা', ar: 'فيزا عمل', hi: 'वर्क वीज़ा', ur: 'کام وزا' },
    business: { en: 'Business Visa', bn: 'বিজনেস ভিসা', ar: 'فيزا عمل تجاري', hi: 'बिजनेस वीज़ा', ur: 'بزنس وزا' },
    family: { en: 'Family Visa', bn: 'ফ্যামিলি ভিসা', ar: 'فيزا عائلية', hi: 'फैमिली वीज़ा', ur: 'خاندانی وزا' },
    medical: { en: 'Medical Visa', bn: 'মেডিক্যাল ভিসা', ar: 'فيزا طبية', hi: 'मेडिकल वीज़ा', ur: 'طبی وزا' },
    transit: { en: 'Transit Visa', bn: 'ট্রানজিট ভিসা', ar: 'فيزا عبور', hi: 'ट्रांज़िट वीज़ा', ur: 'گذرگاہ وزا' },
    other: { en: 'Other', bn: 'অন্যান্য', ar: 'أخرى', hi: 'अन्य', ur: 'دوسرے' },
  };
  return labels[visaType]?.[language] || labels[visaType]?.en || visaType;
}

// Get error message
export function getErrorMessage(key: keyof typeof ERROR_MESSAGES, language: string = 'en'): string {
  const message = ERROR_MESSAGES[key];
  if (typeof message === 'string') return message;
  return message[language] || message.en || 'An error occurred';
}

// Get success message
export function getSuccessMessage(key: keyof typeof SUCCESS_MESSAGES, language: string = 'en'): string {
  const message = SUCCESS_MESSAGES[key];
  if (typeof message === 'string') return message;
  return message[language] || message.en || 'Operation successful';
}

// Validate email
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

// Validate phone
export function isValidPhone(phone: string): boolean {
  const pattern = /^\+?[0-9\s\-\(\)]{10,20}$/;
  return pattern.test(phone);
}

// Validate passport
export function isValidPassport(passport: string): boolean {
  const pattern = /^[A-Z0-9]{6,20}$/;
  return pattern.test(passport);
}

// Validate URL
export function isValidUrl(url: string): boolean {
  const pattern = /^https?:\/\/[^\s]+$/;
  return pattern.test(url);
}

// Validate required fields
export function validateRequired<T extends object>(obj: T, requiredFields: (keyof T)[]): { valid: boolean; missing: (keyof T)[] } {
  const missing: (keyof T)[] = [];
  for (const field of requiredFields) {
    const value = obj[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }
  return { valid: missing.length === 0, missing };
}

// Sleep function
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number = DEFAULTS.debounceTime): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

// Retry function
export async function retry<T>(fn: () => Promise<T>, options: { retries?: number; delay?: number } = {}): Promise<T> {
  const { retries = 3, delay = 1000 } = options;
  let lastError: Error | undefined;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        await sleep(delay * (i + 1));
      }
    }
  }
  
  throw lastError || new Error('Unknown error');
}

// Pagination helper
export function getPagination(params: PaginationParams, total: number): { page: number; pageSize: number; offset: number; totalPages: number } {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(DEFAULTS.maxPageSize, params.pageSize || DEFAULTS.pageSize);
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  
  return { page, pageSize, offset, totalPages };
}

// Create paginated response
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const { page, pageSize } = getPagination(params, total);
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };
}

// Create API response
export function createApiResponse<T>(
  data?: T,
  error?: string,
  message?: string,
  warnings?: string[]
): ApiResponse<T> {
  return {
    success: !error,
    data,
    error,
    message,
    warnings,
  };
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// Get file name without extension
export function getFileNameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

// Get file size in human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check if file is image
export function isImageFile(filename: string): boolean {
  const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  return extensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// Check if file is PDF
export function isPdfFile(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf');
}

// Check if file is document
export function isDocumentFile(filename: string): boolean {
  const extensions = ['.doc', '.docx', '.txt', '.rtf'];
  return extensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// Get MIME type from file extension
export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    rtf: 'application/rtf',
  };
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

// Get base64 from file
export function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Get blob from base64
export function getBlobFromBase64(base64: string): Blob {
  const block = base64.split(';');
  const contentType = block[0].split(':')[1];
  const realData = block[1].split(',')[1];
  const byteString = atob(realData);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: contentType });
}

// Download file
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download blob
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

// Open in new tab
export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Get current timestamp
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// Get start of day
export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get end of day
export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Get days between dates
export function getDaysBetweenDates(start: Date, end: Date): number {
  const startDate = getStartOfDay(start);
  const endDate = getStartOfDay(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Get age from date of birth
export function getAge(dateOfBirth: string | Date): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// Check if date is in the past
export function isPastDate(date: string | Date): boolean {
  const d = new Date(date);
  const today = getStartOfDay();
  return d < today;
}

// Check if date is in the future
export function isFutureDate(date: string | Date): boolean {
  const d = new Date(date);
  const today = getEndOfDay();
  return d > today;
}

// Check if date is today
export function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

// Get random color
export function getRandomColor(): string {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get avatar color based on name
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Get initials avatar color
export function getInitialsAvatar(name: string): { initials: string; color: string } {
  const words = name.trim().split(/\s+/);
  const initials = words.length > 1 
    ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
    : `${words[0][0]}${words[0][1] || ' '}`.toUpperCase();
  return { initials, color: getAvatarColor(name) };
}

// Sanitize HTML
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Escape HTML
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Unescape HTML
export function unescapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, m => map[m]);
}

// Get query parameters
export function getQueryParams(url: string = window.location.search): Record<string, string> {
  const params = new URLSearchParams(url.startsWith('?') ? url : url.split('?')[1]);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

// Set query parameters
export function setQueryParams(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
}

// Get URL with query parameters
export function getUrlWithParams(baseUrl: string, params: Record<string, string | number | boolean | undefined>): string {
  const queryString = setQueryParams(params);
  if (!queryString) return baseUrl;
  return `${baseUrl}?${queryString}`;
}

// Check if object is empty
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

// Check if value is null or undefined
export function isNil(value: any): boolean {
  return value === null || value === undefined;
}

// Check if value is empty (null, undefined, empty string, empty array, empty object)
export function isEmptyValue(value: any): boolean {
  if (isNil(value)) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return isEmpty(value);
  return false;
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Deep merge objects
export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const output = { ...target };
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = deepMerge(output[key] as object, source[key] as object);
      } else {
        output[key] = source[key] as any;
      }
    }
  }
  return output as T & U;
}

// Get nested value
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// Set nested value
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

// Remove nested value
export function removeNestedValue(obj: any, path: string): void {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!current[key]) return;
    current = current[key];
  }
  delete current[keys[keys.length - 1]];
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const keyValue = String(item[key]);
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function filterBy<T>(array: T[], filters: Partial<Record<keyof T, any>>): T[] {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (isNil(value)) return true;
      const itemValue = item[key as keyof T];
      if (typeof value === 'function') {
        return value(itemValue);
      }
      return itemValue === value;
    });
  });
}

// String utilities
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, txt => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export function toCamelCase(text: string): string {
  return text.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
}

export function toSnakeCase(text: string): string {
  return text.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '').replace(/--+/g, '_');
}

// Number utilities
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function toFixed(value: number, decimals: number = 2): number {
  return parseFloat(value.toFixed(decimals));
}

// Object utilities
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

// Type guards
export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

// Promise utilities
export function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout exceeded')), timeout);
    }),
  ]);
}

export async function promiseAllSettled<T>(promises: Promise<T>[]): Promise<{ status: 'fulfilled' | 'rejected'; value?: T; reason?: any }[]> {
  const results = await Promise.all(
    promises.map(async promise => {
      try {
        const value = await promise;
        return { status: 'fulfilled' as const, value };
      } catch (reason) {
        return { status: 'rejected' as const, reason };
      }
    })
  );
  return results;
}

// Local storage utilities
export function getFromStorage<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// Session storage utilities
export function getFromSessionStorage<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToSessionStorage<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to sessionStorage:', error);
  }
}

// URL utilities
export function getBaseUrl(): string {
  return window.location.origin;
}

export function getPathname(): string {
  return window.location.pathname;
}

export function getFullUrl(): string {
  return window.location.href;
}

// Device detection
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

export function isTablet(): boolean {
  return /(iPad|Tablet|PlayBook|Silk|Kindle)/i.test(navigator.userAgent);
}

export function isDesktop(): boolean {
  return !isMobile() && !isTablet();
}

// Browser detection
export function isChrome(): boolean {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}

export function isFirefox(): boolean {
  return typeof InstallTrigger !== 'undefined';
}

export function isSafari(): boolean {
  return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
}

export function isEdge(): boolean {
  return /Edg/.test(navigator.userAgent);
}

// Network detection
export function isOnline(): boolean {
  return navigator.onLine;
}

// Screen utilities
export function getScreenWidth(): number {
  return window.innerWidth;
}

export function getScreenHeight(): number {
  return window.innerHeight;
}

export function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

export function isLandscape(): boolean {
  return window.innerWidth > window.innerHeight;
}

// Touch detection
export function hasTouchSupport(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Export all utilities
export * from './constants';
