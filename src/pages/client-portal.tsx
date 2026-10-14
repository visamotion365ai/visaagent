import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatDate } from '@/lib/utils';
import { APP_CONFIG, VISA_TYPES, COUNTRIES, VISA_STATUS_CONFIG } from '@/lib/constants';
import { useApp } from '@/App';
import {
  Button, Card, Input, Select, Badge, Alert, Skeleton, Sheet, SheetContent, Table,
  TableCell, TableHeaderCell, TableRow, Progress, Tabs, TabsList, TabsTrigger, TabsContent
} from '@/components/ui';
import {
  User, FileText, Eye, Search, MoreVertical, Calendar, Clock, Shield, Bell, Settings, LogOut, Home,
  CheckCircle, XCircle, Download, Upload, HelpCircle, X, Briefcase, GraduationCap, Plane, Users, Heart
} from 'lucide-react';
import { generateCaseReportPDF } from '@/lib/pdf';
import type { Applicant, VisaCase, Client, Notification } from '@/types';

const sampleClients: Client[] = [
  { id: 'client-1', userId: 'user-4', referenceNumber: 'VISA-CLIENT-001', cases: ['CASE-2024-001', 'CASE-2024-003'], documents: ['DOC-1', 'DOC-2'], canAccessAllCases: false, restrictedToOwnCases: true, createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-20T14:00:00Z' },
  { id: 'client-2', userId: 'user-5', referenceNumber: 'VISA-CLIENT-002', cases: ['CASE-2024-002'], documents: ['DOC-3'], canAccessAllCases: false, restrictedToOwnCases: true, createdAt: '2024-01-05T11:00:00Z', updatedAt: '2024-01-18T15:00:00Z' },
];

const sampleCases: VisaCase[] = [
  { id: 'CASE-2024-001', referenceNumber: 'CASE-2024-001', applicantId: '1', visaType: 'work', targetCountry: 'saudi-arabia', status: 'processing', priority: 'high', submissionDate: '2024-01-15', documents: [{ id: '1', name: 'Passport.pdf', type: 'passport', filePath: '/d/p1.pdf', fileUrl: '/d/p1.pdf', uploadDate: '2024-01-10', verified: true, version: 1 }], checklists: [{ id: '1', item: 'Passport valid', category: 'Required', required: true, completed: true }, { id: '2', item: 'Medical cert', category: 'Required', required: true, completed: false }], notes: [], history: [], createdAt: '2024-01-10T09:00:00Z', updatedAt: '2024-01-20T16:00:00Z' },
  { id: 'CASE-2024-002', referenceNumber: 'CASE-2024-002', applicantId: '2', visaType: 'student', targetCountry: 'uk', status: 'submitted', priority: 'medium', submissionDate: '2024-01-18', documents: [{ id: '1', name: 'Passport.pdf', type: 'passport', filePath: '/d/p2.pdf', fileUrl: '/d/p2.pdf', uploadDate: '2024-01-12', verified: true, version: 1 }], checklists: [{ id: '1', item: 'Passport', category: 'Required', required: true, completed: true }], notes: [], history: [], createdAt: '2024-01-12T08:00:00Z', updatedAt: '2024-01-18T15:00:00Z' },
  { id: 'CASE-2024-003', referenceNumber: 'CASE-2024-003', applicantId: '1', visaType: 'business', targetCountry: 'uae', status: 'draft', priority: 'medium', submissionDate: '', documents: [], checklists: [], notes: [], history: [], createdAt: '2024-01-20T09:00:00Z', updatedAt: '2024-01-20T10:00:00Z' },
];

const sampleApplicants: Applicant[] = [
  { id: '1', referenceNumber: 'VISA-2024-001', firstName: 'Mohammad', lastName: 'Rahman', bengaliName: 'মোহাম্মদ রহমান', dateOfBirth: '1990-05-15', gender: 'male', nationality: 'Bangladesh', passportNumber: 'A12345678', passportExpiry: '2026-05-15', passportIssueDate: '2016-05-15', email: 'm.rahman@example.com', phone: '+8801712345678', address: '123 Main St', city: 'Dhaka', country: 'Bangladesh', postalCode: '1200', createdAt: '2024-01-10T10:30:00Z', updatedAt: '2024-01-20T14:45:00Z', status: 'active' },
  { id: '2', referenceNumber: 'VISA-2024-002', firstName: 'Fatema', lastName: 'Khatun', bengaliName: 'ফাতেমা খাতুন', dateOfBirth: '1995-08-22', gender: 'female', nationality: 'Bangladesh', passportNumber: 'B87654321', passportExpiry: '2027-08-22', passportIssueDate: '2017-08-22', email: 'fatema@example.com', phone: '+8801812345678', address: '456 Side Rd', city: 'Chittagong', country: 'Bangladesh', postalCode: '4200', createdAt: '2024-01-12T14:00:00Z', updatedAt: '2024-01-18T16:00:00Z', status: 'active' },
];

const sampleNotifications: Notification[] = [
  { id: '1', userId: 'user-4', title: 'Case Status Update', message: 'Your case CASE-2024-001 is now processing.', type: 'info', read: false, createdAt: '2024-01-20T10:00:00Z' },
  { id: '2', userId: 'user-4', title: 'Document Verified', message: 'Your passport has been verified.', type: 'success', read: false, createdAt: '2024-01-19T14:00:00Z' },
  { id: '3', userId: 'user-4', title: 'New Message', message: 'New message from agent.', type: 'info', read: true, createdAt: '2024-01-18T09:00:00Z' },
];

export interface ClientPortalPageProps { mode?: string; }

export const ClientPortalPage: React.FC<ClientPortalPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { referenceNumber } = useParams<{ referenceNumber: string }>();
  const { language, setLanguage } = useApp();
  const [client, setClient] = useState<Client | null>(null);
  const [clientCases, setClientCases] = useState<VisaCase[]>([]);
  const [clientApplicants, setClientApplicants] = useState<Applicant[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCase, setSelectedCase] = useState<VisaCase | null>(null);
  const [showCaseDetail, setShowCaseDetail] = useState(false);

  useEffect(() => {
    const loadClientData = async () => {
      setIsLoading(true);
      try {
        const foundClient = sampleClients.find(c => c.referenceNumber === referenceNumber);
        if (!foundClient) throw new Error('Client not found');
        setClient(foundClient);
        const cases = sampleCases.filter(c => foundClient.cases.includes(c.id));
        setClientCases(cases);
        const applicantIds = [...new Set(cases.map(c => c.applicantId))];
        const applicants = sampleApplicants.filter(a => applicantIds.includes(a.id));
        setClientApplicants(applicants);
        const clientNotifications = sampleNotifications.filter(n => n.userId === foundClient.userId);
        setNotifications(clientNotifications);
        setUnreadCount(clientNotifications.filter(n => !n.read).length);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };
    if (referenceNumber) loadClientData();
  }, [referenceNumber]);

  useEffect(() => {
    if (mode && ['dashboard', 'cases', 'documents', 'profile', 'notifications'].includes(mode)) {
      setActiveTab(mode);
    }
  }, [mode]);

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);
  const handleTabChange = (tab: string) => { setActiveTab(tab); navigate(`/client/${referenceNumber}/${tab}`); };
  const handleViewCase = (caseItem: VisaCase) => { setSelectedCase(caseItem); setShowCaseDetail(true); };
  const handleCloseCaseDetail = () => { setSelectedCase(null); setShowCaseDetail(false); };
  const handleMarkAllAsRead = () => { setNotifications(n => n.map(n => ({ ...n, read: true }))); setUnreadCount(0); };
  const handleMarkAsRead = (id: string) => { setNotifications(n => n.map(n => n.id === id ? { ...n, read: true } : n))); setUnreadCount(notifications.filter(n => !n.read).length); };
  const handleGenerateCaseReport = async (caseItem: VisaCase) => {
    try {
      setIsLoading(true);
      const applicant = clientApplicants.find(a => a.id === caseItem.applicantId);
      const result = await generateCaseReportPDF(caseItem, applicant || null);
      if (result?.url) window.open(result.url, '_blank');
      setSuccess('Report generated'); setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError('Failed to generate report'); } finally { setIsLoading(false); }
  };

  const getStatusBadge = (status: string) => {
    const config = VISA_STATUS_CONFIG[status as keyof typeof VISA_STATUS_CONFIG];
    if (!config) return <Badge variant="secondary" size="sm">{status}</Badge>;
    const variant = config.color.includes('green') ? 'success' : config.color.includes('red') ? 'danger' : config.color.includes('yellow') ? 'warning' : 'primary';
    return <Badge variant={variant} size="sm">{config.label.en}</Badge>;
  };
  const getVisaTypeLabel = (type: string) => VISA_TYPES.find(v => v.id === type)?.label.en || type;
  const getCountryLabel = (code: string) => COUNTRIES.find(c => c.id === code)?.name || code;
  const getApplicantById = (id: string) => clientApplicants.find(a => a.id === id) || sampleApplicants.find(a => a.id === id);

  const stats = { totalCases: clientCases.length, submitted: clientCases.filter(c => c.status === 'submitted').length, processing: clientCases.filter(c => c.status === 'processing').length, approved: clientCases.filter(c => c.status === 'approved').length, draft: clientCases.filter(c => c.status === 'draft').length };

  if (!referenceNumber) {
    return <div className="min-h-screen flex items-center justify-center p-4"><Card className="p-8 max-w-md text-center"><Shield className="h-16 w-16 text-primary mx-auto mb-4" /><h2 className="text-2xl font-bold">Client Portal</h2><p className="text-muted-foreground mt-2">Enter reference number</p><Input className="mt-4" placeholder="Reference number" onChange={(e) => e.target.value.trim() && navigate(`/client/${e.target.value.trim()}`)} /><Button className="w-full mt-4" onClick={() => navigate('/')}>Back to Home</Button></Card></div>;
  }

  if (isLoading) {
    return <div className="min-h-screen p-4 md:p-6"><Skeleton className="h-8 w-64 mb-6" /><div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">{[...Array(5)].map((_, i) => <Card key={i} className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></Card>)}</div><Card className="p-4"><Skeleton className="h-64" /></Card></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center p-4"><Card className="p-8 max-w-md text-center"><Alert variant="destructive" className="mb-4">{error}</Alert><Button onClick={() => navigate('/')}>Back to Home</Button></Card></div>;
  }

  if (!client) {
    return <div className="min-h-screen flex items-center justify-center p-4"><Card className="p-8 max-w-md text-center"><XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" /><h2 className="text-2xl font-bold">Access Denied</h2><p className="text-muted-foreground mt-2">Client not found</p><Input className="mt-4" placeholder="Correct reference number" onChange={(e) => e.target.value.trim() && navigate(`/client/${e.target.value.trim()}`)} /><Button className="w-full mt-4" onClick={() => navigate('/')}>Back to Home</Button></Card></div>;
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="sticky top-0 z-40 bg-white border-b"><div className="max-w-6xl mx-auto px-4 py-3"><div className="flex items-center justify-between"><Button variant="ghost" size="icon" onClick={() => navigate('/')}><Home className="h-5 w-5" /></Button><div className="border-l pl-3"><h1 className="font-bold text-lg">{APP_CONFIG.name}</h1><p className="text-sm text-muted-foreground">Client Portal</p></div><div className="flex items-center gap-4"><Select value={language} onChange={setLanguage} options={[{ value: 'bn', label: 'বাংলা' }, { value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]} className="w-24" /><Button variant="outline" size="sm" onClick={() => navigate('/')}><LogOut className="h-4 w-4 mr-2" />Exit</Button></div></div></div></header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6"><Card className="p-6"><div className="flex flex-col md:flex-row md:items-center gap-4"><div className="flex-1"><h2 className="text-xl font-bold">Welcome, {clientApplicants[0]?.firstName || 'Client'}!</h2><p className="text-muted-foreground mt-1">Ref: {client.referenceNumber}</p></div><div className="flex items-center gap-2"><Badge variant="secondary" className="px-4 py-2"><User className="h-4 w-4 mr-2" />{clientCases.length} Cases</Badge><Badge variant="secondary" className="px-4 py-2"><Bell className="h-4 w-4 mr-2" />{unreadCount} New</Badge></div></div></Card></motion.div>
        <AnimatePresence>{error && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><Alert variant="destructive" onClose={clearError}>{error}</Alert></motion.div>}{success && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><Alert variant="success" onClose={clearSuccess}>{success}</Alert></motion.div>}</AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6"><Tabs value={activeTab} onValueChange={handleTabChange} className="w-full"><TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
          <TabsTrigger value="dashboard"><div className="flex flex-col items-center gap-1"><Home className="h-4 w-4" /><span className="text-xs">Dashboard</span></div></TabsTrigger>
          <TabsTrigger value="cases"><div className="flex flex-col items-center gap-1"><FileText className="h-4 w-4" /><span className="text-xs">Cases</span></div></TabsTrigger>
          <TabsTrigger value="documents"><div className="flex flex-col items-center gap-1"><FileText className="h-4 w-4" /><span className="text-xs">Documents</span></div></TabsTrigger>
          <TabsTrigger value="notifications"><div className="flex flex-col items-center gap-1 relative"><Bell className="h-4 w-4" /><span className="text-xs">Notifications</span>{unreadCount > 0 && <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>}</div></TabsTrigger>
          <TabsTrigger value="profile"><div className="flex flex-col items-center gap-1"><User className="h-4 w-4" /><span className="text-xs">Profile</span></div></TabsTrigger>
        </TabsList></Tabs></motion.div>
        <TabsContent value="dashboard"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-full"><FileText className="h-5 w-5 text-primary" /></div><div><p className="text-2xl font-bold">{stats.totalCases}</p><p className="text-sm text-muted-foreground">Total Cases</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-full"><Clock className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{stats.processing}</p><p className="text-sm text-muted-foreground">Processing</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-500/10 rounded-full"><CheckCircle className="h-5 w-5 text-green-600" /></div><div><p className="text-2xl font-bold">{stats.approved}</p><p className="text-sm text-muted-foreground">Approved</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-yellow-500/10 rounded-full"><Calendar className="h-5 w-5 text-yellow-600" /></div><div><p className="text-2xl font-bold">{stats.submitted}</p><p className="text-sm text-muted-foreground">Submitted</p></div></div></Card>
            <Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-500/10 rounded-full"><FileText className="h-5 w-5 text-orange-600" /></div><div><p className="text-2xl font-bold">{stats.draft}</p><p className="text-sm text-muted-foreground">Draft</p></div></div></Card>
          </div>
          <Card className="p-4"><h3 className="font-semibold mb-4">Quick Actions</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3"><Button variant="outline" size="sm" onClick={() => handleTabChange('cases')} className="justify-start"><FileText className="h-4 w-4 mr-2" />View Cases</Button><Button variant="outline" size="sm" onClick={() => handleTabChange('documents')} className="justify-start"><FileText className="h-4 w-4 mr-2" />Documents</Button><Button variant="outline" size="sm" onClick={() => handleTabChange('notifications')} className="justify-start"><Bell className="h-4 w-4 mr-2" />Notifications</Button><Button variant="outline" size="sm" onClick={() => handleTabChange('profile')} className="justify-start"><User className="h-4 w-4 mr-2" />Profile</Button></div></Card>
          {clientCases.length > 0 && <Card className="p-4"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Recent Cases</h3><Button variant="ghost" size="sm" onClick={() => handleTabChange('cases')}>View All</Button></div><div className="space-y-3">{clientCases.slice(0, 3).map(caseItem => {
            const applicant = getApplicantById(caseItem.applicantId);
            return <Card key={caseItem.id} className="p-3 hover:bg-muted/50 cursor-pointer" onClick={() => handleViewCase(caseItem)}><div className="flex items-center justify-between"><div className="flex-1"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded">{caseItem.visaType === 'work' && <Briefcase className="h-4 w-4 text-primary" />}{caseItem.visaType === 'student' && <GraduationCap className="h-4 w-4 text-primary" />}{caseItem.visaType === 'tourist' && <Plane className="h-4 w-4 text-primary" />}{caseItem.visaType === 'business' && <Users className="h-4 w-4 text-primary" />}</div><div><p className="font-medium">{caseItem.referenceNumber}</p><p className="text-sm text-muted-foreground">{getVisaTypeLabel(caseItem.visaType)} - {getCountryLabel(caseItem.targetCountry)}</p></div></div></div><div className="flex items-center gap-2">{getStatusBadge(caseItem.status)}<ChevronRight className="h-4 w-4 text-muted-foreground" /></div></div></Card>;
          })}</div></Card>}
        </motion.div></TabsContent>
        <TabsContent value="cases"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4"><Card className="p-4"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold">My Cases ({clientCases.length})</h3></div>{clientCases.length === 0 ? <div className="text-center py-8"><FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No cases</p></div> : <div className="space-y-3">{clientCases.map(caseItem => {
            const applicant = getApplicantById(caseItem.applicantId);
            const progress = caseItem.checklists.length > 0 ? Math.round((caseItem.checklists.filter(c => c.completed).length / caseItem.checklists.length) * 100) : 0;
            return <Card key={caseItem.id} className="p-4 hover:bg-muted/50"><div className="flex flex-col md:flex-row md:items-center gap-4"><div className="flex-1"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-primary/10 rounded">{caseItem.visaType === 'work' && <Briefcase className="h-5 w-5 text-primary" />}{caseItem.visaType === 'student' && <GraduationCap className="h-5 w-5 text-primary" />}{caseItem.visaType === 'tourist' && <Plane className="h-5 w-5 text-primary" />}{caseItem.visaType === 'business' && <Users className="h-5 w-5 text-primary" />}</div><div><p className="font-bold">{caseItem.referenceNumber}</p><p className="text-sm text-muted-foreground">{getVisaTypeLabel(caseItem.visaType)} - {getCountryLabel(caseItem.targetCountry)}</p></div></div><div className="flex flex-wrap items-center gap-4 text-sm"><div><p className="text-muted-foreground">Applicant</p><p className="font-medium">{applicant?.firstName} {applicant?.lastName}</p></div><div><p className="text-muted-foreground">Status</p><div>{getStatusBadge(caseItem.status)}</div></div><div><p className="text-muted-foreground">Priority</p><Badge variant="secondary" size="sm">{caseItem.priority}</Badge></div><div><p className="text-muted-foreground">Progress</p><div className="flex items-center gap-2"><Progress value={progress} className="h-2 w-20" /><span className="text-xs">{progress}%</span></div></div></div></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => handleViewCase(caseItem)}><Eye className="h-4 w-4 mr-2" />View</Button><Button variant="outline" size="sm" onClick={() => handleGenerateCaseReport(caseItem)}><Download className="h-4 w-4 mr-2" />Report</Button></div></div></Card>;
          })}</div>}</Card></motion.div></TabsContent>
        <TabsContent value="documents"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4"><Card className="p-4"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold">My Documents</h3></div><div className="space-y-2">{clientCases.map(caseItem => caseItem.documents.length > 0 && <div key={caseItem.id} className="space-y-2"><h4 className="font-medium pt-2">Case: {caseItem.referenceNumber}</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{caseItem.documents.map(doc => <Card key={doc.id} className="p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><FileText className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-sm">{doc.name}</p><p className="text-xs text-muted-foreground">{doc.type}</p></div></div><div className="flex items-center gap-2">{doc.verified && <CheckCircle className="h-4 w-4 text-green-500" />}<Badge variant="secondary" size="sm">{formatDate(doc.uploadDate, 'DD MMM')}</Badge></div></div></Card>)}</div>)}</div></Card></motion.div></TabsContent>
        <TabsContent value="notifications"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4"><Card className="p-4"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Notifications ({notifications.length})</h3>{unreadCount > 0 && <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}><CheckCircle className="h-4 w-4 mr-2" />Mark All Read</Button>}</div>{notifications.length === 0 ? <div className="text-center py-8"><Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No notifications</p></div> : <div className="space-y-3">{notifications.map(notification => <Card key={notification.id} className={cn('p-3', !notification.read && 'border-l-2 border-l-primary')}><div className="flex items-start gap-3"><div className="p-1.5 rounded-full bg-muted">{notification.type === 'info' && <AlertCircle className="h-4 w-4 text-blue-500" />}{notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}{notification.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}{notification.type === 'error' && <XCircle className="h-4 w-4 text-red-500" />}</div><div className="flex-1"><p className="font-medium text-sm">{notification.title}</p><p className="text-sm text-muted-foreground">{notification.message}</p><p className="text-xs text-muted-foreground mt-1">{formatDate(notification.createdAt, 'DD MMM YYYY, HH:mm')}</p></div><div className="flex items-center gap-2">{!notification.read && <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>Mark Read</Button>}</div></div></Card>)}</div>}</Card></motion.div></TabsContent>
        <TabsContent value="profile"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4"><Card className="p-6"><div className="flex flex-col md:flex-row gap-6"><div className="flex-1"><h3 className="font-semibold mb-4">My Profile</h3><div className="space-y-4"><div className="flex items-center gap-4"><Avatar className="h-20 w-20">{clientApplicants[0]?.firstName.slice(0, 2)}</Avatar><div><h4 className="font-bold text-xl">{clientApplicants[0]?.firstName} {clientApplicants[0]?.lastName}</h4><p className="text-muted-foreground">{clientApplicants[0]?.bengaliName}</p></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><p className="text-sm text-muted-foreground">Reference Number</p><p className="font-medium">{client.referenceNumber}</p></div><div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{clientApplicants[0]?.email}</p></div><div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{clientApplicants[0]?.phone}</p></div><div><p className="text-sm text-muted-foreground">Date of Birth</p><p className="font-medium">{formatDate(clientApplicants[0]?.dateOfBirth || '', 'DD MMM YYYY')}</p></div><div><p className="text-sm text-muted-foreground">Gender</p><p className="font-medium capitalize">{clientApplicants[0]?.gender}</p></div><div><p className="text-sm text-muted-foreground">Nationality</p><p className="font-medium">{clientApplicants[0]?.nationality}</p></div></div><div className="pt-4"><p className="text-sm text-muted-foreground">Address</p><p className="font-medium">{clientApplicants[0]?.address}, {clientApplicants[0]?.city}, {clientApplicants[0]?.country}</p></div></div></div><div className="flex-1"><h3 className="font-semibold mb-4">Account Info</h3><div className="space-y-4"><div><p className="text-sm text-muted-foreground">Member Since</p><p className="font-medium">{formatDate(client?.createdAt || '', 'DD MMM YYYY')}</p></div><div><p className="text-sm text-muted-foreground">Total Cases</p><p className="font-medium">{stats.totalCases}</p></div><div><p className="text-sm text-muted-foreground">Active Cases</p><p className="font-medium">{stats.processing + stats.submitted}</p></div><div><p className="text-sm text-muted-foreground">Completed Cases</p><p className="font-medium">{stats.approved}</p></div></div><div className="pt-6 space-y-3"><Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings')}><Settings className="h-4 w-4 mr-2" />Settings</Button><Button variant="outline" className="w-full justify-start" onClick={() => navigate('/')}><HelpCircle className="h-4 w-4 mr-2" />Help</Button><Button variant="destructive" className="w-full justify-start" onClick={() => navigate('/')}><LogOut className="h-4 w-4 mr-2" />Logout</Button></div></div></div></Card></motion.div></TabsContent>
      </main>
      <Sheet open={showCaseDetail} onOpenChange={open => { if (!open) handleCloseCaseDetail(); }}><SheetContent className="w-full md:w-2/3 lg:w-1/2" side="right">{selectedCase && <div className="space-y-6"><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Case Details</h2><p className="text-sm text-muted-foreground">{selectedCase.referenceNumber}</p></div><Button variant="ghost" size="icon" onClick={handleCloseCaseDetail}><X className="h-4 w-4" /></Button></motion.div><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4"><Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Status</p><div className="flex items-center gap-2 mt-1">{getStatusBadge(selectedCase.status)}</div></div><div className="text-right"><p className="text-sm text-muted-foreground">Priority</p><Badge variant="secondary" className="mt-1">{selectedCase.priority}</Badge></div></div></Card><Card className="p-4 space-y-4"><h3 className="font-semibold">Case Information</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><p className="text-sm text-muted-foreground">Reference Number</p><p className="font-mono font-medium">{selectedCase.referenceNumber}</p></div><div><p className="text-sm text-muted-foreground">Visa Type</p><p className="font-medium">{getVisaTypeLabel(selectedCase.visaType)}</p></div><div><p className="text-sm text-muted-foreground">Country</p><p className="font-medium">{getCountryLabel(selectedCase.targetCountry)}</p></div><div><p className="text-sm text-muted-foreground">Submission Date</p><p className="font-medium">{selectedCase.submissionDate ? formatDate(selectedCase.submissionDate, 'DD MMM YYYY') : 'Not submitted'}</p></div></div></Card>{selectedCase.applicantId && <Card className="p-4 space-y-4"><h3 className="font-semibold">Applicant</h3>{(() => { const applicant = getApplicantById(selectedCase.applicantId); if (!applicant) return null; return <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{applicant.firstName} {applicant.lastName}</p></div><div><p className="text-sm text-muted-foreground">Passport</p><p className="font-mono font-medium">{applicant.passportNumber}</p></div><div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{applicant.email}</p></div><div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{applicant.phone}</p></div></div>; })()}</Card>}<Card className="p-4 space-y-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Documents</h3><Badge variant="secondary" size="sm">{selectedCase.documents.length}</Badge></div><div className="space-y-2">{selectedCase.documents.map(doc => <div key={doc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{doc.name}</span></div><div className="flex items-center gap-2">{doc.verified && <CheckCircle className="h-4 w-4 text-green-500" />}<Badge variant="secondary" size="sm">{formatDate(doc.uploadDate, 'DD MMM')}</Badge></div></div>)}</div></Card><Card className="p-4 space-y-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Checklist</h3><Badge variant="secondary" size="sm">{selectedCase.checklists.filter(c => c.completed).length}/{selectedCase.checklists.length} completed</Badge></div><div className="space-y-2">{selectedCase.checklists.map(checklist => <div key={checklist.id} className={cn('flex items-center gap-2 p-2 rounded', checklist.completed ? 'bg-green-500/10' : 'bg-muted/50')}><div className="p-1 rounded-full">{checklist.completed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</div><span className={cn('text-sm', checklist.completed && 'line-through')}>{checklist.item}</span></div>)}</div></Card><div className="flex gap-2"><Button size="sm" onClick={() => handleGenerateCaseReport(selectedCase)}><Download className="h-4 w-4 mr-2" />Generate Report</Button><Button size="sm" variant="outline" onClick={handleCloseCaseDetail}>Close</Button></div></motion.div>}</div>}</SheetContent></Sheet>
    </div>
  );
};

export default ClientPortalPage;
