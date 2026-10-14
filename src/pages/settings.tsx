import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn, getFromStorage, setToStorage, STORAGE_KEYS } from '@/lib/utils';
import { APP_CONFIG, AI_CONFIG } from '@/lib/constants';
import { useApp } from '@/App';
import { 
  Button, 
  Card, 
  Input, 
  Select,
  Badge,
  Alert,
  Switch,
  Tabs,
  TabPanel
} from '@/components/ui';
import { 
  Settings as SettingsIcon, 
  Key, 
  Globe,
  Moon,
  Sun,
  Monitor,
  Bell,
  Shield,
  Database,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  initializeMistral,
  initializeGemini,
  isMistralConfigured,
  isGeminiConfigured,
  checkMistralConnection,
  checkGeminiConnection,
  getMistralApiKey,
  getGeminiApiKey
} from '@/lib/mistral';
import { getSupabaseClient, initializeSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface SettingsPageProps {
  activeTab?: 'general' | 'api' | 'appearance' | 'notifications' | 'security';
  mode?: 'view' | 'edit';
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  activeTab = 'general',
}) => {
  const navigate = useNavigate();
  const { theme, setTheme, language, setLanguage } = useApp();
  const [activeTabInternal, setActiveTabInternal] = useState(activeTab);
  const [isLoading, setIsLoading] = useState(false);
  
  // API Key states
  const [mistralApiKey, setMistralApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  
  // Connection status
  const [mistralConnected, setMistralConnected] = useState<boolean | null>(null);
  const [geminiConnected, setGeminiConnected] = useState<boolean | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  
  // Show/hide keys
  const [showMistralKey, setShowMistralKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showSupabaseUrl, setShowSupabaseUrl] = useState(false);
  const [showSupabaseKey, setShowSupabaseKey] = useState(false);
  
  // Notifications
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
  });
  
  // Appearance
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: theme,
    language: language,
    dateFormat: 'DD/MM/YYYY',
    currency: 'BDT',
  });

  // Load saved settings
  useEffect(() => {
    const savedMistralKey = getFromStorage<string>(`${STORAGE_KEYS.settings}_mistralApiKey`) || '';
    const savedGeminiKey = getFromStorage<string>(`${STORAGE_KEYS.settings}_geminiApiKey`) || '';
    const savedSupabaseUrl = getFromStorage<string>(`${STORAGE_KEYS.settings}_supabaseUrl`) || '';
    const savedSupabaseKey = getFromStorage<string>(`${STORAGE_KEYS.settings}_supabaseAnonKey`) || '';
    
    setMistralApiKey(savedMistralKey);
    setGeminiApiKey(savedGeminiKey);
    setSupabaseUrl(savedSupabaseUrl);
    setSupabaseAnonKey(savedSupabaseKey);
    
    setAppearanceSettings(prev => ({
      ...prev,
      theme: theme,
      language: language,
    }));
  }, [theme, language]);

  // Check connections
  useEffect(() => {
    const checkConnections = async () => {
      setIsLoading(true);
      
      if (mistralApiKey) {
        const connected = await checkMistralConnection();
        setMistralConnected(connected);
      } else {
        setMistralConnected(null);
      }
      
      if (geminiApiKey) {
        const connected = await checkGeminiConnection();
        setGeminiConnected(connected);
      } else {
        setGeminiConnected(null);
      }
      
      setIsLoading(false);
    };

    checkConnections();
  }, [mistralApiKey, geminiApiKey]);

  // Check Supabase connection
  useEffect(() => {
    const checkSupabase = async () => {
      if (supabaseUrl && supabaseAnonKey) {
        try {
          const client = getSupabaseClient();
          const { data, error } = await client.rpc('version');
          setSupabaseConnected(!error);
        } catch {
          setSupabaseConnected(false);
        }
      } else {
        setSupabaseConnected(null);
      }
    };

    checkSupabase();
  }, [supabaseUrl, supabaseAnonKey]);

  // Update active tab from URL
  useEffect(() => {
    setActiveTabInternal(activeTab);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTabInternal(tabId as 'general' | 'api' | 'appearance' | 'notifications' | 'security');
    navigate(`/settings/${tabId}`);
  };

  // Save Mistral API key
  const handleSaveMistralKey = () => {
    if (mistralApiKey.trim()) {
      initializeMistral(mistralApiKey);
      setToStorage(`${STORAGE_KEYS.settings}_mistralApiKey`, mistralApiKey);
    }
  };

  // Save Gemini API key
  const handleSaveGeminiKey = () => {
    if (geminiApiKey.trim()) {
      initializeGemini(geminiApiKey);
      setToStorage(`${STORAGE_KEYS.settings}_geminiApiKey`, geminiApiKey);
    }
  };

  // Save Supabase config
  const handleSaveSupabaseConfig = () => {
    if (supabaseUrl.trim() && supabaseAnonKey.trim()) {
      initializeSupabase(supabaseUrl, supabaseAnonKey);
      setToStorage(`${STORAGE_KEYS.settings}_supabaseUrl`, supabaseUrl);
      setToStorage(`${STORAGE_KEYS.settings}_supabaseAnonKey`, supabaseAnonKey);
    }
  };

  // Save appearance settings
  const handleSaveAppearance = () => {
    setTheme(appearanceSettings.theme);
    setLanguage(appearanceSettings.language);
    setToStorage(STORAGE_KEYS.theme, appearanceSettings.theme);
    setToStorage(STORAGE_KEYS.language, appearanceSettings.language);
  };

  // Save notification settings
  const handleSaveNotifications = () => {
    setToStorage(STORAGE_KEYS.notifications, notificationSettings);
  };

  // Copy to clipboard
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    // Could show a toast here
  };

  // Theme options
  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  // Language options
  const languageOptions = [
    { value: 'bn', label: 'Bengali (বাংলা)' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'Arabic (العربية)' },
    { value: 'hi', label: 'Hindi (हिन्दी)' },
    { value: 'ur', label: 'Urdu (اردو)' },
  ];

  // Date format options
  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ];

  // Currency options
  const currencyOptions = [
    { value: 'BDT', label: 'Bangladeshi Taka (৳)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
  ];

  // Connection status badge
  const ConnectionStatus: React.FC<{ connected: boolean | null; label: string }> = ({
    connected,
    label,
  }) => {
    if (connected === null) {
      return <Badge variant="default">Not configured</Badge>;
    }
    if (connected) {
      return (
        <Badge variant="success" leftIcon={<CheckCircle className="h-3 w-3" />}>
          Connected
        </Badge>
      );
    }
    return (
      <Badge variant="danger" leftIcon={<XCircle className="h-3 w-3" />}>
        Connection failed
      </Badge>
    );
  };

  // Tab content
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'api', label: 'API Keys' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-6 w-6 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
            <p className="text-secondary-500">Configure your application preferences</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs
        items={tabs.map(t => ({
          id: t.id,
          label: t.label,
        }))}
        defaultValue={activeTabInternal}
        onChange={handleTabChange}
        variant="underline"
        className="mb-6"
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl"
      >
        {/* General Settings */}
        <TabPanel value="general" activeValue={activeTabInternal}>
          <Card variant="bordered" padding="lg" className="mb-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-secondary-900 mb-2">
                  Company Information
                </h2>
                <p className="text-sm text-secondary-500 mb-4">
                  Basic information about your agency
                </p>
                <div className="space-y-4">
                  <Input
                    label="Company Name"
                    value={APP_CONFIG.company}
                    disabled
                  />
                  <Input
                    label="Support Email"
                    value={APP_CONFIG.supportEmail}
                    disabled
                  />
                  <Input
                    label="Support Phone"
                    value={APP_CONFIG.supportPhone}
                    disabled
                  />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-secondary-900 mb-2">
                  Default Settings
                </h2>
                <p className="text-sm text-secondary-500 mb-4">
                  Default values for new cases and applicants
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Default Country"
                    options={[...COUNTRIES.map(c => ({ value: c.id, label: c.name }))]}
                    value="bangladesh"
                  />
                  <Select
                    label="Default Visa Type"
                    options={[...VISA_TYPES.map(v => ({ value: v.id, label: v.label.en }))]}
                    value="tourist"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary">Save Settings</Button>
              </div>
            </div>
          </Card>
        </TabPanel>

        {/* API Keys */}
        <TabPanel value="api" activeValue={activeTabInternal}>
          <div className="space-y-6">
            {/* Mistral */}
            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Key className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-secondary-900">
                      Mistral AI
                    </h2>
                    <p className="text-sm text-secondary-500">
                      Configure your Mistral API key
                    </p>
                  </div>
                </div>
                <ConnectionStatus connected={mistralConnected} label="Mistral" />
              </div>

              <div className="space-y-4">
                <Input
                  label="Mistral API Key"
                  type={showMistralKey ? 'text' : 'password'}
                  value={mistralApiKey}
                  onChange={(e) => setMistralApiKey(e.target.value)}
                  rightIcon={
                    showMistralKey ? (
                      <EyeOff
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => setShowMistralKey(!showMistralKey)}
                      />
                    ) : (
                      <Eye
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => setShowMistralKey(!showMistralKey)}
                      />
                    )
                  }
                  hint="Get your API key from https://mistral.ai"
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSaveMistralKey}
                    disabled={!mistralApiKey.trim()}
                  >
                    Save Key
                  </Button>
                  {mistralApiKey && (
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(mistralApiKey, 'Mistral API Key')}
                      leftIcon={<Copy className="h-4 w-4" />}
                    >
                      Copy
                    </Button>
                  )}
                </div>
              </div>

              {mistralConnected === false && mistralApiKey && (
                <Alert variant="error" className="mt-4">
                  Connection failed. Please check your API key.
                </Alert>
              )}
            </Card>

            {/* Gemini */}
            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Key className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-secondary-900">
                      Google Gemini
                    </h2>
                    <p className="text-sm text-secondary-500">
                      Configure your Gemini API key
                    </p>
                  </div>
                </div>
                <ConnectionStatus connected={geminiConnected} label="Gemini" />
              </div>

              <div className="space-y-4">
                <Input
                  label="Gemini API Key"
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  rightIcon={
                    showGeminiKey ? (
                      <EyeOff
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                      />
                    ) : (
                      <Eye
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                      />
                    )
                  }
                  hint="Get your API key from https://aistudio.google.com"
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSaveGeminiKey}
                    disabled={!geminiApiKey.trim()}
                  >
                    Save Key
                  </Button>
                  {geminiApiKey && (
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(geminiApiKey, 'Gemini API Key')}
                      leftIcon={<Copy className="h-4 w-4" />}
                    >
                      Copy
                    </Button>
                  )}
                </div>
              </div>

              {geminiConnected === false && geminiApiKey && (
                <Alert variant="error" className="mt-4">
                  Connection failed. Please check your API key.
                </Alert>
              )}
            </Card>

            {/* Supabase */}
            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-secondary-900">
                      Supabase Database
                    </h2>
                    <p className="text-sm text-secondary-500">
                      Configure your Supabase connection
                    </p>
                  </div>
                </div>
                <ConnectionStatus connected={supabaseConnected} label="Supabase" />
              </div>

              <div className="space-y-4">
                <Input
                  label="Supabase URL"
                  type={showSupabaseUrl ? 'text' : 'password'}
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  rightIcon={
                    showSupabaseUrl ? (
                      <EyeOff
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => setShowSupabaseUrl(!showSupabaseUrl)}
                      />
                    ) : (
                      <Eye
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => setShowSupabaseUrl(!showSupabaseUrl)}
                      />
                    )
                  }
                  hint="Your Supabase project URL"
                />
                <Input
                  label="Supabase Anon Key"
                  type={showSupabaseKey ? 'text' : 'password'}
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  rightIcon={
                    showSupabaseKey ? (
                      <EyeOff
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                      />
                    ) : (
                      <Eye
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                      />
                    )
                  }
                  hint="Your Supabase anon/public key"
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSaveSupabaseConfig}
                    disabled={!supabaseUrl.trim() || !supabaseAnonKey.trim()}
                  >
                    Save Configuration
                  </Button>
                </div>
              </div>

              {supabaseConnected === false && supabaseUrl && supabaseAnonKey && (
                <Alert variant="error" className="mt-4">
                  Connection failed. Please check your Supabase URL and Anon Key.
                </Alert>
              )}
            </Card>

            {/* AI Provider Selection */}
            <Card variant="bordered" padding="lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Globe className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-secondary-900">
                    AI Provider Settings
                  </h2>
                  <p className="text-sm text-secondary-500">
                    Choose your preferred AI provider
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Select
                  label="Default AI Provider"
                  options={[
                    { value: 'both', label: 'Both (Auto-select)' },
                    { value: 'mistral', label: 'Mistral AI' },
                    { value: 'gemini', label: 'Google Gemini' },
                  ]}
                  value="both"
                  hint="Which AI provider to use by default"
                />
                <Select
                  label="Default Model"
                  options={[
                    { value: AI_CONFIG.mistral.models.tiny, label: 'Mistral Tiny (Fast)' },
                    { value: AI_CONFIG.mistral.models.small, label: 'Mistral Small' },
                    { value: AI_CONFIG.mistral.models.medium, label: 'Mistral Medium' },
                    { value: AI_CONFIG.gemini.models.nano, label: 'Gemini Nano' },
                    { value: AI_CONFIG.gemini.models.flash, label: 'Gemini Flash' },
                    { value: AI_CONFIG.gemini.models.pro, label: 'Gemini Pro' },
                  ]}
                  value={AI_CONFIG.defaultModel}
                  hint="Default model for AI interactions"
                />
              </div>
            </Card>
          </div>
        </TabPanel>

        {/* Appearance */}
        <TabPanel value="appearance" activeValue={activeTabInternal}>
          <Card variant="bordered" padding="lg">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-secondary-900 mb-2">
                  Theme
                </h2>
                <p className="text-sm text-secondary-500 mb-4">
                  Choose your preferred color scheme
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {themeOptions.map((option) => (
                    <Card
                      key={option.value}
                      variant={appearanceSettings.theme === option.value ? 'bordered' : 'default'}
                      padding="md"
                      clickable
                      onClick={() => setAppearanceSettings(prev => ({
                        ...prev,
                        theme: option.value as 'light' | 'dark' | 'system',
                      }))}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          appearanceSettings.theme === option.value
                            ? 'bg-primary-100'
                            : 'bg-secondary-100'
                        )}>
                          {option.icon}
                        </div>
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs text-secondary-500">
                            {option.value === 'system' ? 'Follow system settings' : ''}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-secondary-900 mb-2">
                  Language
                </h2>
                <p className="text-sm text-secondary-500 mb-4">
                  Choose your preferred language
                </p>
                <Select
                  label="Language"
                  options={languageOptions.map(l => ({ value: l.value, label: l.label }))}
                  value={appearanceSettings.language}
                  onChange={(value) => setAppearanceSettings(prev => ({
                    ...prev,
                    language: value,
                  }))}
                  hint="Default language for the application"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-secondary-900 mb-2">
                    Date Format
                  </h2>
                  <p className="text-sm text-secondary-500 mb-4">
                    How dates are displayed
                  </p>
                  <Select
                    label="Date Format"
                    options={dateFormatOptions}
                    value={appearanceSettings.dateFormat}
                    onChange={(value) => setAppearanceSettings(prev => ({
                      ...prev,
                      dateFormat: value,
                    }))}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-secondary-900 mb-2">
                    Currency
                  </h2>
                  <p className="text-sm text-secondary-500 mb-4">
                    Default currency for financial values
                  </p>
                  <Select
                    label="Currency"
                    options={currencyOptions}
                    value={appearanceSettings.currency}
                    onChange={(value) => setAppearanceSettings(prev => ({
                      ...prev,
                      currency: value,
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveAppearance}
                  isLoading={false}
                >
                  Save Appearance Settings
                </Button>
              </div>
            </div>
          </Card>
        </TabPanel>

        {/* Notifications */}
        <TabPanel value="notifications" activeValue={activeTabInternal}>
          <Card variant="bordered" padding="lg">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-secondary-900 mb-2">
                  Notification Preferences
                </h2>
                <p className="text-sm text-secondary-500 mb-4">
                  Configure how you receive notifications
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-secondary-900">Email Notifications</h3>
                      <p className="text-sm text-secondary-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.email}
                      onChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        email: checked,
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-secondary-900">Push Notifications</h3>
                      <p className="text-sm text-secondary-500">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.push}
                      onChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        push: checked,
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-secondary-900">SMS Notifications</h3>
                      <p className="text-sm text-secondary-500">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.sms}
                      onChange={(checked) => setNotificationSettings(prev => ({
                        ...prev,
                        sms: checked,
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveNotifications}
                  isLoading={false}
                >
                  Save Notification Settings
                </Button>
              </div>
            </div>
          </Card>
        </TabPanel>

        {/* Security */}
        <TabPanel value="security" activeValue={activeTabInternal}>
          <Card variant="bordered" padding="lg">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-secondary-900 mb-2">
                  Security Settings
                </h2>
                <p className="text-sm text-secondary-500">
                  Configure security preferences
                </p>
              </div>

              <div className="space-y-4">
                <Alert variant="info">
                  Security settings are managed through your authentication provider.
                  Contact your administrator for advanced security options.
                </Alert>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-secondary-900">Session Timeout</h3>
                    <p className="text-sm text-secondary-500">
                      Automatically log out after inactivity
                    </p>
                  </div>
                  <Select
                    options={[
                      { value: '15', label: '15 minutes' },
                      { value: '30', label: '30 minutes' },
                      { value: '60', label: '1 hour' },
                      { value: '120', label: '2 hours' },
                      { value: '0', label: 'Never' },
                    ]}
                    value="30"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-secondary-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-secondary-500">
                      Enable 2FA for additional security
                    </p>
                  </div>
                  <Switch checked={false} disabled />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary">Save Security Settings</Button>
              </div>
            </div>
          </Card>
        </TabPanel>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
