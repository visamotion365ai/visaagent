import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { formatDate, formatCurrency, getFullName, getCountryById, getVisaTypeLabel } from './utils';
import { COUNTRIES, VISA_TYPES, APP_CONFIG } from './constants';
import type { 
  Applicant, 
  Employer, 
  VisaCase, 
  Checklist,
  CaseDocument,
  PDFGenerationOptions
} from '@/types';

// PDF Configuration
export interface PDFConfig {
  fontSize: {
    title: number;
    heading: number;
    subheading: number;
    body: number;
    small: number;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    border: string;
  };
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  pageSize: 'a4' | 'letter' | 'a5' | 'legal' | 'executive';
  orientation: 'portrait' | 'landscape';
}

// Default PDF configuration
export const DEFAULT_PDF_CONFIG: PDFConfig = {
  fontSize: {
    title: 18,
    heading: 14,
    subheading: 12,
    body: 10,
    small: 8,
  },
  colors: {
    primary: '#1e40af',
    secondary: '#3b82f6',
    text: '#1f2937',
    background: '#f8fafc',
    border: '#e2e8f0',
  },
  margins: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
  },
  pageSize: 'a4',
  orientation: 'portrait',
};

// PDF Document class
export class PDFDocument {
  private doc: jsPDF;
  private config: PDFConfig;
  private currentY: number;
  private pageHeight: number;
  private pageWidth: number;

  constructor(config: Partial<PDFConfig> = {}) {
    this.config = { ...DEFAULT_PDF_CONFIG, ...config };
    this.doc = new jsPDF({
      orientation: this.config.orientation,
      unit: 'mm',
      format: this.config.pageSize,
    });
    
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.currentY = this.config.margins.top;
  }

  // Add header
defaultAddHeader(title: string = APP_CONFIG.name): void {
    // Save current position
    const startY = this.currentY;
    
    // Set colors
    this.doc.setTextColor(this.config.colors.primary);
    this.doc.setFontSize(this.config.fontSize.title);
    this.doc.setFont('helvetica', 'bold');
    
    // Add logo placeholder
    this.doc.rect(
      this.config.margins.left,
      this.currentY,
      20,
      20,
      'F'
    );
    this.doc.setTextColor(this.config.colors.secondary);
    this.doc.text(
      'LOGO',
      this.config.margins.left + 10,
      this.currentY + 12,
      { align: 'center' }
    );
    
    // Add title
    this.doc.setTextColor(this.config.colors.primary);
    this.doc.text(
      title,
      this.pageWidth / 2,
      this.currentY + 10,
      { align: 'center' }
    );
    
    // Add company info
    this.doc.setFontSize(this.config.fontSize.small);
    this.doc.setTextColor(this.config.colors.text);
    this.doc.setFont('helvetica', 'normal');
    
    const companyInfo = [
      APP_CONFIG.company,
      `Email: ${APP_CONFIG.supportEmail}`,
      `Phone: ${APP_CONFIG.supportPhone}`,
      `Website: ${APP_CONFIG.website}`,
    ];
    
    this.doc.text(
      companyInfo.join(' | '),
      this.pageWidth / 2,
      this.currentY + 18,
      { align: 'center' }
    );
    
    // Draw line
    this.doc.setDrawColor(this.config.colors.border);
    this.doc.setLineWidth(0.2);
    this.doc.line(
      this.config.margins.left,
      this.currentY + 25,
      this.pageWidth - this.config.margins.right,
      this.currentY + 25
    );
    
    // Update current Y
    this.currentY = startY + 35;
    
    // Reset colors
    this.doc.setTextColor(this.config.colors.text);
    this.doc.setFontSize(this.config.fontSize.body);
    this.doc.setFont('helvetica', 'normal');
  }

  // Add footer
defaultAddFooter(pageNumber: number, totalPages: number): void {
    this.doc.setFontSize(this.config.fontSize.small);
    this.doc.setTextColor(this.config.colors.text);
    
    const footerText = `Page ${pageNumber} of ${totalPages} | Generated on ${formatDate(new Date())} | ${APP_CONFIG.name}`;
    this.doc.text(
      footerText,
      this.pageWidth / 2,
      this.pageHeight - this.config.margins.bottom + 5,
      { align: 'center' }
    );
    
    // Add watermark if configured
    if (this.config.colors.background !== '#f8fafc') {
      this.doc.setTextColor(this.config.colors.background);
      this.doc.setFontSize(60);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(
        'CONFIDENTIAL',
        this.pageWidth / 2,
        this.pageHeight / 2,
        { align: 'center', angle: 45, opacity: 0.1 }
      );
      this.doc.setTextColor(this.config.colors.text);
      this.doc.setFontSize(this.config.fontSize.body);
      this.doc.setFont('helvetica', 'normal');
    }
  }

  // Add section heading
  addHeading(text: string, level: 1 | 2 | 3 = 1): void {
    const fontSizes = {
      1: this.config.fontSize.heading,
      2: this.config.fontSize.subheading,
      3: this.config.fontSize.body,
    };
    
    const marginTop = level === 1 ? 10 : level === 2 ? 8 : 5;
    
    this.currentY += marginTop;
    
    this.doc.setFontSize(fontSizes[level]);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.config.colors.primary);
    
    this.doc.text(text, this.config.margins.left, this.currentY);
    
    this.currentY += 8;
    
    // Reset
    this.doc.setFontSize(this.config.fontSize.body);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.config.colors.text);
  }

  // Add paragraph
  addParagraph(text: string, options: { bold?: boolean; italic?: boolean; color?: string } = {}): void {
    const { bold = false, italic = false, color } = options;
    
    if (bold) this.doc.setFont('helvetica', 'bold');
    if (italic) this.doc.setFont('helvetica', 'italic');
    if (color) this.doc.setTextColor(color);
    
    const lines = this.doc.splitTextToSize(text, this.pageWidth - this.config.margins.left - this.config.margins.right);
    
    for (const line of lines) {
      if (this.currentY > this.pageHeight - this.config.margins.bottom) {
        this.addNewPage();
      }
      this.doc.text(line, this.config.margins.left, this.currentY);
      this.currentY += 6;
    }
    
    this.currentY += 2; // Add spacing between paragraphs
    
    // Reset
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.config.colors.text);
  }

  // Add text
  addText(text: string, x?: number, y?: number): void {
    const positionX = x !== undefined ? x : this.config.margins.left;
    const positionY = y !== undefined ? y : this.currentY;
    
    this.doc.text(text, positionX, positionY);
    
    if (y === undefined) {
      this.currentY += 6;
    }
  }

  // Add new page
  addNewPage(): void {
    this.doc.addPage();
    this.currentY = this.config.margins.top;
    this.defaultAddHeader();
  }

  // Add horizontal line
  addHorizontalLine(): void {
    this.doc.setDrawColor(this.config.colors.border);
    this.doc.setLineWidth(0.2);
    this.doc.line(
      this.config.margins.left,
      this.currentY,
      this.pageWidth - this.config.margins.right,
      this.currentY
    );
    this.currentY += 5;
  }

  // Add table
  addTable(
    headers: string[],
    data: any[],
    options: {
      startY?: number;
      headHeight?: number;
      rowHeight?: number;
      showHead?: boolean;
      showFoot?: boolean;
      columnStyles?: Record<string, any>;
      headerStyles?: Record<string, any>;
      bodyStyles?: Record<string, any>;
    } = {}
  ): void {
    const {
      startY = this.currentY,
      headHeight = 10,
      rowHeight = 8,
      showHead = true,
      showFoot = false,
      columnStyles = {},
      headerStyles = {},
      bodyStyles = {},
    } = options;

    autoTable(this.doc, {
      startY,
      head: showHead ? [headers] : [],
      body: data,
      headStyles: {
        fillColor: this.config.colors.primary,
        textColor: '#ffffff',
        fontSize: this.config.fontSize.body,
        fontStyle: 'bold',
        cellPadding: 2,
        ...headerStyles,
      },
      bodyStyles: {
        fillColor: '#ffffff',
        textColor: this.config.colors.text,
        fontSize: this.config.fontSize.body,
        cellPadding: 2,
        ...bodyStyles,
      },
      columnStyles,
      styles: {
        overflow: 'linebreak',
        cellWidth: 'auto',
        minCellHeight: rowHeight,
        lineColor: this.config.colors.border,
        lineWidth: 0.1,
      },
      headHeight,
      rowHeight,
      showFoot,
      margin: {
        top: 0,
        bottom: 0,
        left: this.config.margins.left,
        right: this.config.margins.right,
      },
    });

    // Update currentY (autoTable doesn't update it automatically)
    const finalY = (this.doc as any).lastAutoTable.finalY || startY + 20;
    this.currentY = finalY + 5;
  }

  // Add image
  async addImage(imageUrl: string, options: { width?: number; height?: number; align?: 'left' | 'center' | 'right' } = {}): Promise<void> {
    const { width = 50, height = 50, align = 'left' } = options;
    
    let x = this.config.margins.left;
    
    if (align === 'center') {
      x = (this.pageWidth - width) / 2;
    } else if (align === 'right') {
      x = this.pageWidth - this.config.margins.right - width;
    }
    
    // Check if image is base64 or URL
    if (imageUrl.startsWith('data:image/')) {
      this.doc.addImage(imageUrl, 'JPEG', x, this.currentY, width, height);
    } else {
      // For URLs, we need to fetch the image
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            this.doc.addImage(reader.result as string, 'JPEG', x, this.currentY, width, height);
            resolve();
          };
          reader.onerror = reject;
        });
      } catch (error) {
        console.error('Error loading image:', error);
        // Add placeholder
        this.doc.rect(x, this.currentY, width, height, 'F');
        this.doc.setTextColor(this.config.colors.border);
        this.doc.text('Image not available', x + width / 2, this.currentY + height / 2, { align: 'center' });
        this.doc.setTextColor(this.config.colors.text);
      }
    }
    
    this.currentY += height + 5;
  }

  // Add list
  addList(items: string[], options: { ordered?: boolean; bullet?: string } = {}): void {
    const { ordered = false, bullet = '•' } = options;
    
    for (let i = 0; i < items.length; i++) {
      const prefix = ordered ? `${i + 1}. ` : `${bullet} `;
      const text = prefix + items[i];
      
      this.addParagraph(text);
    }
  }

  // Add key-value pairs
  addKeyValuePairs(data: Record<string, any>, options: { columns?: number; spacing?: number } = {}): void {
    const { columns = 2, spacing = 40 } = options;
    
    const entries = Object.entries(data);
    const rows = Math.ceil(entries.length / columns);
    
    for (let row = 0; row < rows; row++) {
      const rowEntries = entries.slice(row * columns, (row + 1) * columns);
      
      for (let col = 0; col < rowEntries.length; col++) {
        const [key, value] = rowEntries[col];
        const x = this.config.margins.left + col * spacing;
        
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`${key}:`, x, this.currentY);
        
        this.doc.setFont('helvetica', 'normal');
        const valueX = x + this.doc.getTextWidth(`${key}:`) + 2;
        this.doc.text(String(value), valueX, this.currentY);
      }
      
      this.currentY += 7;
    }
    
    this.currentY += 3;
  }

  // Add rectangle
  addRectangle(x: number, y: number, width: number, height: number, options: { fill?: boolean; color?: string; border?: boolean } = {}): void {
    const { fill = false, color = this.config.colors.primary, border = true } = options;
    
    this.doc.setDrawColor(color);
    this.doc.setFillColor(color);
    
    const style = fill ? 'FD' : border ? 'D' : 'F';
    
    this.doc.rect(x, y, width, height, style);
    
    // Reset
    this.doc.setDrawColor(this.config.colors.border);
    this.doc.setFillColor('#ffffff');
  }

  // Get current Y position
  getCurrentY(): number {
    return this.currentY;
  }

  // Set current Y position
  setCurrentY(y: number): void {
    this.currentY = y;
  }

  // Get jsPDF instance
  getDoc(): jsPDF {
    return this.doc;
  }

  // Save PDF
  save(filename: string): void {
    this.doc.save(filename);
  }

  // Output as blob
  outputBlob(): Blob {
    return this.doc.output('blob');
  }

  // Output as data URL
  outputDataUrl(): string {
    return this.doc.output('dataurlstring');
  }

  // Output as array buffer
  outputArrayBuffer(): Promise<ArrayBuffer> {
    return new Promise((resolve) => {
      this.doc.output('arraybuffer', (buffer) => {
        resolve(buffer);
      });
    });
  }
}

// Generate applicant profile PDF
export async function generateApplicantProfilePDF(
  applicant: Applicant,
  country?: Country,
  options: PDFGenerationOptions = { templateId: 'applicant-profile', data: applicant, language: 'bn' }
): Promise<PDFDocument> {
  const pdf = new PDFDocument();
  
  // Add header
  pdf.defaultAddHeader('Applicant Profile');
  
  // Add title
  pdf.addHeading('APPLICANT PROFILE', 1);
  
  // Add applicant info section
  pdf.addHeading('Personal Information', 2);
  pdf.addHorizontalLine();
  
  const personalInfo = [
    ['Full Name', getFullName(applicant.firstName, applicant.lastName, applicant.bengaliName)],
    ['Bengali Name', applicant.bengaliName || 'N/A'],
    ['Date of Birth', formatDate(applicant.dateOfBirth)],
    ['Gender', applicant.gender.toUpperCase()],
    ['Nationality', applicant.nationality],
    ['Passport Number', applicant.passportNumber],
    ['Passport Issue Date', formatDate(applicant.passportIssueDate)],
    ['Passport Expiry Date', formatDate(applicant.passportExpiry)],
    ['Age', String(new Date().getFullYear() - new Date(applicant.dateOfBirth).getFullYear())],
  ];
  
  pdf.addTable(['Field', 'Value'], personalInfo);
  
  // Add contact info
  pdf.addHeading('Contact Information', 2);
  pdf.addHorizontalLine();
  
  const contactInfo = [
    ['Email', applicant.email],
    ['Phone', applicant.phone],
    ['Address', applicant.address],
    ['City', applicant.city],
    ['Country', applicant.country],
    ['Postal Code', applicant.postalCode],
    ['Status', applicant.status.toUpperCase()],
  ];
  
  pdf.addTable(['Field', 'Value'], contactInfo);
  
  // Add reference number
  pdf.addHeading('Reference Information', 2);
  pdf.addHorizontalLine();
  
  pdf.addParagraph(`Reference Number: ${applicant.referenceNumber}`);
  pdf.addParagraph(`Created: ${formatDate(applicant.createdAt)}`);
  pdf.addParagraph(`Last Updated: ${formatDate(applicant.updatedAt)}`);
  
  // Add footer
  const totalPages = pdf.getDoc().internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.getDoc().setPage(i);
    pdf.defaultAddFooter(i, totalPages);
  }
  
  return {
    id: `pdf_${applicant.id}_profile`,
    name: `Applicant Profile - ${applicant.referenceNumber}`,
    type: 'applicant-profile',
    content: pdf.outputDataUrl(),
    path: `/pdf/applicant-profile-${applicant.referenceNumber}.pdf`,
    url: '',
    size: pdf.outputBlob().size,
    pages: totalPages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate employer document PDF
export async function generateEmployerDocumentPDF(
  employer: Employer,
  options: PDFGenerationOptions = { templateId: 'employer-letter', data: employer, language: 'bn' }
): Promise<PDFDocument> {
  const pdf = new PDFDocument();
  
  // Add header
  pdf.defaultAddHeader('Employer Information');
  
  // Add title
  pdf.addHeading('EMPLOYER INFORMATION', 1);
  
  // Add company info
  pdf.addHeading('Company Details', 2);
  pdf.addHorizontalLine();
  
  const companyInfo = [
    ['Company Name', employer.companyName],
    ['Bengali Name', employer.companyBengaliName || 'N/A'],
    ['Registration Number', employer.registrationNumber],
    ['Industry', employer.industry],
    ['Company Size', employer.companySize],
    ['Verification Status', employer.isVerified ? 'Verified' : 'Not Verified'],
    ['Verification Date', employer.verificationDate ? formatDate(employer.verificationDate) : 'N/A'],
  ];
  
  pdf.addTable(['Field', 'Value'], companyInfo);
  
  // Add contact info
  pdf.addHeading('Contact Information', 2);
  pdf.addHorizontalLine();
  
  const contactInfo = [
    ['Address', employer.address],
    ['City', employer.city],
    ['Country', employer.country],
    ['Postal Code', employer.postalCode],
    ['Contact Person', employer.contactPerson],
    ['Email', employer.contactEmail],
    ['Phone', employer.contactPhone],
    ['Website', employer.website || 'N/A'],
  ];
  
  pdf.addTable(['Field', 'Value'], contactInfo);
  
  // Add documents section
  if (employer.documents && employer.documents.length > 0) {
    pdf.addHeading('Company Documents', 2);
    pdf.addHorizontalLine();
    
    const docData = employer.documents.map(doc => [
      doc.name,
      doc.type,
      doc.verified ? 'Verified' : 'Not Verified',
      doc.issueDate,
      doc.expiryDate || 'N/A',
    ]);
    
    pdf.addTable(
      ['Document Name', 'Type', 'Status', 'Issue Date', 'Expiry Date'],
      docData
    );
  }
  
  // Add footer
  const totalPages = pdf.getDoc().internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.getDoc().setPage(i);
    pdf.defaultAddFooter(i, totalPages);
  }
  
  return {
    id: `pdf_${employer.id}_employer`,
    name: `Employer Information - ${employer.companyName}`,
    type: 'employer-letter',
    content: pdf.outputDataUrl(),
    path: `/pdf/employer-${employer.id}.pdf`,
    url: '',
    size: pdf.outputBlob().size,
    pages: totalPages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate case report PDF
export async function generateCaseReportPDF(
  visaCase: VisaCase,
  applicant: Applicant,
  employer?: Employer,
  options: PDFGenerationOptions = { templateId: 'case-report', data: { visaCase, applicant, employer }, language: 'bn' }
): Promise<PDFDocument> {
  const pdf = new PDFDocument();
  
  // Add header
  pdf.defaultAddHeader('Case Report');
  
  // Add title
  pdf.addHeading('VISA CASE REPORT', 1);
  
  // Add case info
  pdf.addHeading('Case Information', 2);
  pdf.addHorizontalLine();
  
  const caseInfo = [
    ['Reference Number', visaCase.referenceNumber],
    ['Applicant', getFullName(applicant.firstName, applicant.lastName)],
    ['Visa Type', getVisaTypeLabel(visaCase.visaType as any, options.language || 'en')],
    ['Target Country', visaCase.targetCountry.toUpperCase()],
    ['Status', visaCase.status.toUpperCase()],
    ['Priority', visaCase.priority.toUpperCase()],
    ['Submission Date', formatDate(visaCase.submissionDate)],
    ['Expected Decision Date', visaCase.expectedDecisionDate ? formatDate(visaCase.expectedDecisionDate) : 'N/A'],
  ];
  
  if (visaCase.actualDecisionDate) {
    caseInfo.push(['Actual Decision Date', formatDate(visaCase.actualDecisionDate)]);
  }
  if (visaCase.decision) {
    caseInfo.push(['Decision', visaCase.decision]);
  }
  if (visaCase.rejectionReason) {
    caseInfo.push(['Rejection Reason', visaCase.rejectionReason]);
  }
  
  pdf.addTable(['Field', 'Value'], caseInfo);
  
  // Add employer info if available
  if (employer) {
    pdf.addHeading('Employer Information', 2);
    pdf.addHorizontalLine();
    
    const employerInfo = [
      ['Company Name', employer.companyName],
      ['Registration Number', employer.registrationNumber],
      ['Industry', employer.industry],
      ['Contact Person', employer.contactPerson],
      ['Email', employer.contactEmail],
      ['Phone', employer.contactPhone],
    ];
    
    pdf.addTable(['Field', 'Value'], employerInfo);
  }
  
  // Add applicant info
  pdf.addHeading('Applicant Information', 2);
  pdf.addHorizontalLine();
  
  const applicantInfo = [
    ['Name', getFullName(applicant.firstName, applicant.lastName, applicant.bengaliName)],
    ['Date of Birth', formatDate(applicant.dateOfBirth)],
    ['Nationality', applicant.nationality],
    ['Passport Number', applicant.passportNumber],
    ['Passport Expiry', formatDate(applicant.passportExpiry)],
    ['Email', applicant.email],
    ['Phone', applicant.phone],
  ];
  
  pdf.addTable(['Field', 'Value'], applicantInfo);
  
  // Add documents section
  if (visaCase.documents && visaCase.documents.length > 0) {
    pdf.addHeading('Case Documents', 2);
    pdf.addHorizontalLine();
    
    const docData = visaCase.documents.map(doc => [
      doc.name,
      doc.type,
      doc.verified ? 'Verified' : 'Not Verified',
      formatDate(doc.uploadDate),
      `v${doc.version}`,
    ]);
    
    pdf.addTable(
      ['Document Name', 'Type', 'Status', 'Upload Date', 'Version'],
      docData
    );
  }
  
  // Add checklists section
  if (visaCase.checklists && visaCase.checklists.length > 0) {
    pdf.addHeading('Checklist Status', 2);
    pdf.addHorizontalLine();
    
    const checklistData = visaCase.checklists.map(check => [
      check.item,
      check.category,
      check.required ? 'Yes' : 'No',
      check.completed ? 'Yes' : 'No',
      check.completionDate ? formatDate(check.completionDate) : 'N/A',
    ]);
    
    pdf.addTable(
      ['Item', 'Category', 'Required', 'Completed', 'Completion Date'],
      checklistData
    );
  }
  
  // Add notes section
  if (visaCase.notes && visaCase.notes.length > 0) {
    pdf.addHeading('Case Notes', 2);
    pdf.addHorizontalLine();
    
    visaCase.notes.forEach((note, index) => {
      pdf.addParagraph(`Note ${index + 1} (${formatDate(note.createdAt)}): ${note.content}`);
    });
  }
  
  // Add history section
  if (visaCase.history && visaCase.history.length > 0) {
    pdf.addHeading('Case History', 2);
    pdf.addHorizontalLine();
    
    const historyData = visaCase.history.map(h => [
      formatDate(h.timestamp),
      h.action,
      h.status,
      h.author,
      h.notes || '',
    ]);
    
    pdf.addTable(
      ['Date', 'Action', 'Status', 'By', 'Notes'],
      historyData
    );
  }
  
  // Add footer
  const totalPages = pdf.getDoc().internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.getDoc().setPage(i);
    pdf.defaultAddFooter(i, totalPages);
  }
  
  return {
    id: `pdf_${visaCase.id}_case_report`,
    name: `Case Report - ${visaCase.referenceNumber}`,
    type: 'case-report',
    content: pdf.outputDataUrl(),
    path: `/pdf/case-report-${visaCase.referenceNumber}.pdf`,
    url: '',
    size: pdf.outputBlob().size,
    pages: totalPages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate checklist PDF
export async function generateChecklistPDF(
  checklists: Checklist[],
  applicant: Applicant,
  visaCase?: VisaCase,
  options: PDFGenerationOptions = { templateId: 'checklist', data: { checklists, applicant, visaCase }, language: 'bn' }
): Promise<PDFDocument> {
  const pdf = new PDFDocument();
  
  // Add header
  pdf.defaultAddHeader('Visa Application Checklist');
  
  // Add title
  pdf.addHeading('VISA APPLICATION CHECKLIST', 1);
  
  // Add applicant info
  if (applicant) {
    pdf.addHeading('Applicant Information', 2);
    pdf.addHorizontalLine();
    
    pdf.addParagraph(`Name: ${getFullName(applicant.firstName, applicant.lastName)}`);
    pdf.addParagraph(`Reference Number: ${applicant.referenceNumber}`);
    pdf.addParagraph(`Passport Number: ${applicant.passportNumber}`);
    pdf.addHorizontalLine();
  }
  
  if (visaCase) {
    pdf.addParagraph(`Visa Type: ${getVisaTypeLabel(visaCase.visaType as any, options.language || 'en')}`);
    pdf.addParagraph(`Target Country: ${visaCase.targetCountry.toUpperCase()}`);
    pdf.addHorizontalLine();
  }
  
  // Group checklists by category
  const groupedChecklists = checklists.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, Checklist[]>);
  
  // Add checklists by category
  Object.entries(groupedChecklists).forEach(([category, checks]) => {
    pdf.addHeading(category, 2);
    pdf.addHorizontalLine();
    
    const tableData = checks.map(check => [
      check.item,
      check.required ? 'Yes' : 'No',
      check.completed ? 'Yes' : 'No',
      check.completionDate ? formatDate(check.completionDate) : 'N/A',
      check.notes || '',
    ]);
    
    pdf.addTable(
      ['Item', 'Required', 'Completed', 'Completion Date', 'Notes'],
      tableData
    );
  });
  
  // Add summary
  const totalChecklists = checklists.length;
  const completedChecklists = checklists.filter(c => c.completed).length;
  const completionPercentage = Math.round((completedChecklists / totalChecklists) * 100);
  
  pdf.addHeading('Summary', 2);
  pdf.addHorizontalLine();
  
  pdf.addParagraph(`Total Items: ${totalChecklists}`);
  pdf.addParagraph(`Completed: ${completedChecklists}`);
  pdf.addParagraph(`Incomplete: ${totalChecklists - completedChecklists}`);
  pdf.addParagraph(`Completion: ${completionPercentage}%`);
  
  // Add footer
  const totalPages = pdf.getDoc().internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.getDoc().setPage(i);
    pdf.defaultAddFooter(i, totalPages);
  }
  
  return {
    id: `pdf_checklist_${applicant?.id || Date.now()}`,
    name: `Checklist - ${applicant?.referenceNumber || 'General'}`,
    type: 'checklist',
    content: pdf.outputDataUrl(),
    path: `/pdf/checklist-${applicant?.referenceNumber || 'general'}.pdf`,
    url: '',
    size: pdf.outputBlob().size,
    pages: totalPages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate complete case pack PDF
export async function generateCasePackPDF(
  visaCase: VisaCase,
  applicant: Applicant,
  employer?: Employer,
  documents: CaseDocument[] = [],
  checklists: Checklist[] = [],
  options: PDFGenerationOptions = { templateId: 'case-pack', data: { visaCase, applicant, employer, documents, checklists }, language: 'bn' }
): Promise<PDFDocument> {
  const pdf = new PDFDocument();
  
  // Add header
  pdf.defaultAddHeader('Complete Case Pack');
  
  // Add title
  pdf.addHeading('COMPLETE CASE PACK', 1);
  pdf.addParagraph(`Reference Number: ${visaCase.referenceNumber}`, { bold: true });
  pdf.addHorizontalLine();
  
  // Add table of contents placeholder
  pdf.addHeading('Table of Contents', 2);
  pdf.addHorizontalLine();
  
  const tocItems = [
    ['1.', 'Cover Letter'],
    ['2.', 'Applicant Information'],
    ['3.', 'Employer Information'],
    ['4.', 'Case Details'],
    ['5.', 'Checklist'],
    ['6.', 'Documents'],
    ['7.', 'Declaration'],
  ];
  
  pdf.addTable([], tocItems, { columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 150 } } });
  
  // Add new page for cover letter
  pdf.addNewPage();
  pdf.addHeading('1. COVER LETTER', 1);
  pdf.addHorizontalLine();
  
  pdf.addParagraph(`To,`);
  pdf.addParagraph(`The Visa Officer,`);
  pdf.addParagraph(`Embassy of ${visaCase.targetCountry.toUpperCase()},`);
  pdf.addParagraph(`Dhaka, Bangladesh`);
  pdf.addParagraph(``);
  pdf.addParagraph(`Date: ${formatDate(new Date())}`);
  pdf.addParagraph(``);
  pdf.addParagraph(`Subject: Visa Application for ${getFullName(applicant.firstName, applicant.lastName)}`);
  pdf.addParagraph(``);
  pdf.addParagraph(`Dear Sir/Madam,`);
  pdf.addParagraph(``);
  pdf.addParagraph(`We are pleased to submit the visa application for ${getFullName(applicant.firstName, applicant.lastName)} (Passport No: ${applicant.passportNumber}) for a ${getVisaTypeLabel(visaCase.visaType as any, options.language || 'en')} visa to ${visaCase.targetCountry.toUpperCase()}.`);
  pdf.addParagraph(``);
  pdf.addParagraph(`The applicant has provided all necessary documents as per the requirements. We kindly request you to process this application at your earliest convenience.`);
  pdf.addParagraph(``);
  pdf.addParagraph(`Thank you for your attention.`);
  pdf.addParagraph(``);
  pdf.addParagraph(`Sincerely,`);
  pdf.addParagraph(`VisaMOTion Pte. Ltd.`);
  
  // Add new page for applicant information
  pdf.addNewPage();
  pdf.addHeading('2. APPLICANT INFORMATION', 1);
  pdf.addHorizontalLine();
  
  const applicantInfo = [
    ['Full Name', getFullName(applicant.firstName, applicant.lastName, applicant.bengaliName)],
    ['Date of Birth', formatDate(applicant.dateOfBirth)],
    ['Gender', applicant.gender.toUpperCase()],
    ['Nationality', applicant.nationality],
    ['Passport Number', applicant.passportNumber],
    ['Passport Issue Date', formatDate(applicant.passportIssueDate)],
    ['Passport Expiry Date', formatDate(applicant.passportExpiry)],
    ['Email', applicant.email],
    ['Phone', applicant.phone],
    ['Address', applicant.address],
    ['City', applicant.city],
    ['Country', applicant.country],
    ['Postal Code', applicant.postalCode],
  ];
  
  pdf.addTable(['Field', 'Value'], applicantInfo);
  
  // Add employer information if available
  if (employer) {
    pdf.addNewPage();
    pdf.addHeading('3. EMPLOYER INFORMATION', 1);
    pdf.addHorizontalLine();
    
    const employerInfo = [
      ['Company Name', employer.companyName],
      ['Bengali Name', employer.companyBengaliName || 'N/A'],
      ['Registration Number', employer.registrationNumber],
      ['Industry', employer.industry],
      ['Address', employer.address],
      ['City', employer.city],
      ['Country', employer.country],
      ['Contact Person', employer.contactPerson],
      ['Email', employer.contactEmail],
      ['Phone', employer.contactPhone],
    ];
    
    pdf.addTable(['Field', 'Value'], employerInfo);
  }
  
  // Add case details
  pdf.addNewPage();
  pdf.addHeading('4. CASE DETAILS', 1);
  pdf.addHorizontalLine();
  
  const caseInfo = [
    ['Reference Number', visaCase.referenceNumber],
    ['Visa Type', getVisaTypeLabel(visaCase.visaType as any, options.language || 'en')],
    ['Target Country', visaCase.targetCountry.toUpperCase()],
    ['Status', visaCase.status.toUpperCase()],
    ['Priority', visaCase.priority.toUpperCase()],
    ['Submission Date', formatDate(visaCase.submissionDate)],
    ['Expected Decision Date', visaCase.expectedDecisionDate ? formatDate(visaCase.expectedDecisionDate) : 'N/A'],
  ];
  
  if (visaCase.decision) {
    caseInfo.push(['Decision', visaCase.decision]);
  }
  if (visaCase.rejectionReason) {
    caseInfo.push(['Rejection Reason', visaCase.rejectionReason]);
  }
  
  pdf.addTable(['Field', 'Value'], caseInfo);
  
  // Add checklists
  pdf.addNewPage();
  pdf.addHeading('5. CHECKLIST', 1);
  pdf.addHorizontalLine();
  
  const checklistData = checklists.map(check => [
    check.item,
    check.category,
    check.required ? 'Yes' : 'No',
    check.completed ? 'Yes' : 'No',
    check.completionDate ? formatDate(check.completionDate) : 'N/A',
  ]);
  
  pdf.addTable(
    ['Item', 'Category', 'Required', 'Completed', 'Completion Date'],
    checklistData
  );
  
  // Add documents list
  pdf.addNewPage();
  pdf.addHeading('6. DOCUMENTS', 1);
  pdf.addHorizontalLine();
  
  const docData = documents.map(doc => [
    doc.name,
    doc.type,
    formatDate(doc.uploadDate),
    doc.verified ? 'Verified' : 'Not Verified',
    `v${doc.version}`,
  ]);
  
  pdf.addTable(
    ['Document Name', 'Type', 'Upload Date', 'Status', 'Version'],
    docData
  );
  
  // Add declaration
  pdf.addNewPage();
  pdf.addHeading('7. DECLARATION', 1);
  pdf.addHorizontalLine();
  
  pdf.addParagraph(`I, ${getFullName(applicant.firstName, applicant.lastName)}, hereby declare that all the information provided in this application is true and correct to the best of my knowledge.`);
  pdf.addParagraph(``);
  pdf.addParagraph(`I understand that any false information may result in the rejection of my visa application.`);
  pdf.addParagraph(``);
  pdf.addParagraph(`Date: ${formatDate(new Date())}`);
  pdf.addParagraph(`Signature: _______________________`);
  
  // Add footer to all pages
  const totalPages = pdf.getDoc().internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.getDoc().setPage(i);
    pdf.defaultAddFooter(i, totalPages);
  }
  
  return {
    id: `pdf_${visaCase.id}_case_pack`,
    name: `Complete Case Pack - ${visaCase.referenceNumber}`,
    type: 'case-pack',
    content: pdf.outputDataUrl(),
    path: `/pdf/case-pack-${visaCase.referenceNumber}.pdf`,
    url: '',
    size: pdf.outputBlob().size,
    pages: totalPages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate rejection analysis PDF
export async function generateRejectionAnalysisPDF(
  visaCase: VisaCase,
  applicant: Applicant,
  analysis: string,
  recommendations: string[],
  options: PDFGenerationOptions = { templateId: 'rejection-analysis', data: { visaCase, applicant, analysis, recommendations }, language: 'bn' }
): Promise<PDFDocument> {
  const pdf = new PDFDocument();
  
  // Add header
  pdf.defaultAddHeader('Rejection Analysis');
  
  // Add title
  pdf.addHeading('VISA REJECTION ANALYSIS REPORT', 1);
  
  // Add case info
  pdf.addHeading('Case Information', 2);
  pdf.addHorizontalLine();
  
  const caseInfo = [
    ['Reference Number', visaCase.referenceNumber],
    ['Applicant', getFullName(applicant.firstName, applicant.lastName)],
    ['Visa Type', getVisaTypeLabel(visaCase.visaType as any, options.language || 'en')],
    ['Target Country', visaCase.targetCountry.toUpperCase()],
    ['Rejection Date', formatDate(visaCase.actualDecisionDate || visaCase.updatedAt)],
  ];
  
  pdf.addTable(['Field', 'Value'], caseInfo);
  
  // Add rejection reason
  if (visaCase.rejectionReason) {
    pdf.addHeading('Rejection Reason', 2);
    pdf.addHorizontalLine();
    pdf.addParagraph(visaCase.rejectionReason);
  }
  
  // Add AI analysis
  pdf.addHeading('AI Analysis', 2);
  pdf.addHorizontalLine();
  
  // Split analysis into paragraphs
  const analysisParagraphs = analysis.split('\n\n').filter(p => p.trim());
  analysisParagraphs.forEach(para => {
    pdf.addParagraph(para);
  });
  
  // Add recommendations
  pdf.addHeading('Recommendations', 2);
  pdf.addHorizontalLine();
  
  pdf.addList(recommendations, { ordered: true });
  
  // Add footer
  const totalPages = pdf.getDoc().internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.getDoc().setPage(i);
    pdf.defaultAddFooter(i, totalPages);
  }
  
  return {
    id: `pdf_${visaCase.id}_rejection_analysis`,
    name: `Rejection Analysis - ${visaCase.referenceNumber}`,
    type: 'rejection-analysis',
    content: pdf.outputDataUrl(),
    path: `/pdf/rejection-analysis-${visaCase.referenceNumber}.pdf`,
    url: '',
    size: pdf.outputBlob().size,
    pages: totalPages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Generate research report PDF
export async function generateResearchReportPDF(
  title: string,
  summary: string,
  content: string,
  url: string,
  query: string,
  extractedData: any,
  language: string = 'bn',
  options: PDFGenerationOptions = { templateId: 'research-report', data: { title, summary, content, url, query, extractedData }, language }
): Promise<PDFDocument> {
  const pdf = new PDFDocument();
  
  // Add header
  pdf.defaultAddHeader('Research Report');
  
  // Add title
  pdf.addHeading('WEBSITE RESEARCH REPORT', 1);
  
  // Add report info
  pdf.addHeading('Report Information', 2);
  pdf.addHorizontalLine();
  
  const reportInfo = [
    ['Title', title],
    ['URL', url],
    ['Query', query || 'General Research'],
    ['Language', language.toUpperCase()],
    ['Date', formatDate(new Date())],
  ];
  
  pdf.addTable(['Field', 'Value'], reportInfo);
  
  // Add summary
  pdf.addHeading('Summary', 2);
  pdf.addHorizontalLine();
  pdf.addParagraph(summary);
  
  // Add content
  pdf.addHeading('Detailed Analysis', 2);
  pdf.addHorizontalLine();
  
  // Split content into paragraphs
  const contentParagraphs = content.split('\n\n').filter(p => p.trim());
  contentParagraphs.forEach(para => {
    pdf.addParagraph(para);
  });
  
  // Add extracted data if available
  if (extractedData && Object.keys(extractedData).length > 0) {
    pdf.addHeading('Extracted Data', 2);
    pdf.addHorizontalLine();
    
    const dataEntries = Object.entries(extractedData).map(([key, value]) => [
      key,
      typeof value === 'object' ? JSON.stringify(value) : String(value),
    ]);
    
    pdf.addTable(['Key', 'Value'], dataEntries);
  }
  
  // Add footer
  const totalPages = pdf.getDoc().internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.getDoc().setPage(i);
    pdf.defaultAddFooter(i, totalPages);
  }
  
  return {
    id: `pdf_research_${Date.now()}`,
    name: `Research Report - ${title}`,
    type: 'research-report',
    content: pdf.outputDataUrl(),
    path: `/pdf/research-${Date.now()}.pdf`,
    url: '',
    size: pdf.outputBlob().size,
    pages: totalPages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Export PDF utilities
export {
  PDFDocument,
  DEFAULT_PDF_CONFIG,
  DEFAULT_PDF_CONFIG as PDF_CONFIG,
};

export default {
  // Classes
  PDFDocument,
  
  // Config
  DEFAULT_PDF_CONFIG,
  
  // Generation functions
  generateApplicantProfilePDF,
  generateEmployerDocumentPDF,
  generateCaseReportPDF,
  generateChecklistPDF,
  generateCasePackPDF,
  generateRejectionAnalysisPDF,
  generateResearchReportPDF,
};
