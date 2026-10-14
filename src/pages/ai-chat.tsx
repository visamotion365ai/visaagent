import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  SkeletonText,
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuItem as DropdownMenuItemType
} from '@/components/ui';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MoreVertical, 
  X, 
  Copy, 
  Download,
  Trash2,
  User,
  Bot,
  Settings,
  History,
  RefreshCw,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { chatWithAI, streamChatWithAI, createChatSession, addMessageToSession, AIProviderStatus, getAIProviderStatus, initializeAI } from '@/lib/ai';
import { analyzeDocumentWithMistral } from '@/lib/mistral';
import { translateWithGemini } from '@/lib/gemini';

type MessageRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  sessionId: string;
  model?: string;
  tokensUsed?: number;
  isStreaming?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  model: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface AIModelOption {
  value: string;
  label: string;
  provider: AIProvider;
}

export const AIChatPage: React.FC = () => {
  const params = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const { language, setLanguage } = useApp();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>(AI_CONFIG.defaultModel);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('both');
  const [aiStatus, setAiStatus] = useState<AIProviderStatus>({} as AIProviderStatus);
  const [showSetupAlert, setShowSetupAlert] = useState(false);
  const [showSessionMenu, setShowSessionMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load AI status
  useEffect(() => {
    const status = getAIProviderStatus();
    setAiStatus(status);
    setShowSetupAlert(!status.mistral.configured && !status.gemini.configured);
  }, []);

  // Load sessions from storage
  useEffect(() => {
    const storedSessions = getFromStorage<ChatSession[]>('ai_chat_sessions', []);
    setSessions(storedSessions);

    // If there's a sessionId in params, find and activate it
    if (params.sessionId) {
      const session = storedSessions.find(s => s.id === params.sessionId);
      if (session) {
        setActiveSessionId(session.id);
        setMessages(session.messages);
        setSelectedModel(session.model);
      }
    } else if (storedSessions.length > 0) {
      // Activate the most recent session
      const recentSession = storedSessions[0];
      setActiveSessionId(recentSession.id);
      setMessages(recentSession.messages);
      setSelectedModel(recentSession.model);
    } else {
      // Create a new session
      handleNewSession();
    }
  }, [params.sessionId]);

  // Update URL when active session changes
  useEffect(() => {
    if (activeSessionId) {
      navigate(`/ai-chat/${activeSessionId}`);
    }
  }, [activeSessionId, navigate]);

  // Save sessions to storage
  useEffect(() => {
    setToStorage('ai_chat_sessions', sessions);
  }, [sessions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Available models
  const modelOptions: AIModelOption[] = [
    { value: AI_CONFIG.mistral.models.tiny, label: 'Mistral Tiny', provider: 'mistral' },
    { value: AI_CONFIG.mistral.models.small, label: 'Mistral Small', provider: 'mistral' },
    { value: AI_CONFIG.mistral.models.medium, label: 'Mistral Medium', provider: 'mistral' },
    { value: AI_CONFIG.gemini.models.nano, label: 'Gemini Nano', provider: 'gemini' },
    { value: AI_CONFIG.gemini.models.flash, label: 'Gemini Flash', provider: 'gemini' },
    { value: AI_CONFIG.gemini.models.pro, label: 'Gemini Pro', provider: 'gemini' },
  ];

  // Language options
  const languageOptions = [
    { value: 'bn', label: 'Bengali (বাংলা)' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'Arabic (العربية)' },
    { value: 'hi', label: 'Hindi (हिन्दी)' },
    { value: 'ur', label: 'Urdu (اردو)' },
  ];

  // Create new session
  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: `Chat ${sessions.length + 1}`,
      model: selectedModel,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setMessages([]);
  };

  // Switch session
  const handleSessionSelect = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(session.id);
      setMessages(session.messages);
      setSelectedModel(session.model);
    }
  };

  // Delete session
  const handleSessionDelete = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);

    if (activeSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        const recentSession = updatedSessions[0];
        setActiveSessionId(recentSession.id);
        setMessages(recentSession.messages);
        setSelectedModel(recentSession.model);
      } else {
        handleNewSession();
      }
    }
  };

  // Rename session
  const handleSessionRename = (sessionId: string, newTitle: string) => {
    setSessions(sessions.map(s =>
      s.id === sessionId ? { ...s, title: newTitle } : s
    ));
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
      sessionId: activeSessionId || `session_${Date.now()}`,
    };

    // Add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');

    // Update session
    if (activeSessionId) {
      setSessions(sessions.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: updatedMessages, updatedAt: new Date().toISOString() }
          : s
      ));
    }

    // Prepare messages for AI
    const aiMessages = updatedMessages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      language: language,
      timestamp: msg.timestamp,
      sessionId: msg.sessionId,
      model: msg.model,
      tokensUsed: msg.tokensUsed,
    }));

    try {
      setIsLoading(true);
      setIsStreaming(true);

      // Get active session
      const activeSession = sessions.find(s => s.id === activeSessionId);
      const model = activeSession?.model || selectedModel;

      // Use streaming for better UX
      const stream = streamChatWithAI(aiMessages, {
        model,
        temperature: AI_CONFIG.mistral.temperature,
        language,
        provider: selectedProvider,
        onChunk: (chunk) => {
          // Update the last assistant message
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant' && lastMessage.isStreaming) {
              const updatedLastMessage = {
                ...lastMessage,
                content: lastMessage.content + chunk,
              };
              return [...prev.slice(0, -1), updatedLastMessage];
            }

            // Add new assistant message
            const assistantMessage: ChatMessage = {
              id: generateId(),
              role: 'assistant',
              content: chunk,
              timestamp: new Date().toISOString(),
              sessionId: activeSessionId || `session_${Date.now()}`,
              model,
              isStreaming: true,
            };
            return [...prev, assistantMessage];
          });
        },
      });

      // Consume the stream
      for await (const chunk of stream) {
        // Stream is handled in onChunk
      }

      // Mark last message as complete
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.isStreaming) {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, isStreaming: false }
          ];
        }
        return prev;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        sessionId: activeSessionId || `session_${Date.now()}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Update session title
  const updateSessionTitle = (title: string) => {
    if (activeSessionId) {
      setSessions(sessions.map(s =>
        s.id === activeSessionId ? { ...s, title } : s
      ));
    }
  };

  // Session menu items
  const sessionMenuItems: DropdownMenuItemType[] = [
    { id: 'rename', label: 'Rename', icon: <FileText className="h-4 w-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, disabled: sessions.length <= 1 },
  ];

  // Handle session menu action
  const handleSessionMenuAction = (action: string, sessionId: string) => {
    switch (action) {
      case 'rename':
        const newTitle = prompt('Enter new session title:', sessions.find(s => s.id === sessionId)?.title);
        if (newTitle) {
          handleSessionRename(sessionId, newTitle);
        }
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this session?')) {
          handleSessionDelete(sessionId);
        }
        break;
    }
    setShowSessionMenu(null);
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(timestamp);
  };

  // Copy message
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Message variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  };

  // Container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    },
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-secondary-200 bg-white p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-secondary-900">AI Chat</h1>
            <Badge variant="primary">
              {languageOptions.find(l => l.value === language)?.label || 'Bengali'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select
              options={languageOptions.map(l => ({ value: l.value, label: l.label }))}
              value={language}
              onChange={(value) => setLanguage(value)}
              size="sm"
              className="w-40"
            />
            <Select
              options={modelOptions.map(m => ({ value: m.value, label: m.label }))}
              value={selectedModel}
              onChange={(value) => setSelectedModel(value)}
              size="sm"
              className="w-48"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full flex overflow-hidden">
        {/* Sidebar - Session List */}
        <div className="w-64 bg-white border-r border-secondary-200 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-secondary-200">
            <Button
              variant="outline"
              onClick={handleNewSession}
              fullWidth
              leftIcon={<Send className="h-4 w-4" />}
            >
              New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-secondary-500">
                <p>No sessions yet</p>
                <p className="text-sm mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => {
                  const isActive = activeSessionId === session.id;
                  const lastMessage = session.messages[session.messages.length - 1];

                  return (
                    <motion.div
                      key={session.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div
                        className={cn(
                          'p-3 rounded-lg cursor-pointer transition-colors flex flex-col',
                          isActive
                            ? 'bg-primary-50 border border-primary-200'
                            : 'hover:bg-secondary-50'
                        )}
                        onClick={() => handleSessionSelect(session.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-secondary-900 truncate">
                              {session.title}
                            </p>
                            {lastMessage && (
                              <p className="text-xs text-secondary-500 truncate mt-1">
                                {lastMessage.role === 'user' ? 'You: ' : 'AI: '}
                                {lastMessage.content.slice(0, 50)}
                                {lastMessage.content.length > 50 ? '...' : ''}
                              </p>
                            )}
                          </div>
                          <DropdownMenu
                            items={sessionMenuItems}
                            trigger={
                              <button
                                className="p-1 rounded hover:bg-secondary-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowSessionMenu(session.id);
                                }}
                              >
                                <MoreVertical className="h-4 w-4 text-secondary-400" />
                              </button>
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-secondary-500">
                          <span>{formatMessageTime(session.updatedAt)}</span>
                          <span className="bg-secondary-100 px-2 py-0.5 rounded">
                            {session.model.split('-')[0]}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-secondary-200">
            <Button
              variant="ghost"
              onClick={() => setSessions([])}
              fullWidth
              leftIcon={<Trash2 className="h-4 w-4" />}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showSetupAlert && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Alert
                  variant="warning"
                  onClose={() => setShowSetupAlert(false)}
                >
                  <div className="flex items-start gap-3">
                    <div>
                      <p className="font-medium">AI not configured</p>
                      <p className="text-sm mt-1">
                        Please configure your Mistral or Gemini API key in settings to use AI chat.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate('/settings/api')}
                    >
                      Configure
                    </Button>
                  </div>
                </Alert>
              </motion.div>
            )}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                  <div className="p-4 bg-primary-50 rounded-full mb-4">
                    <Bot className="h-8 w-8 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                    Welcome to AI Chat
                  </h2>
                  <p className="text-secondary-500 max-w-md">
                    Start a conversation with our AI assistant. I can help you with visa applications,
                    document analysis, and more in Bengali and English.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Button variant="ghost" size="sm">
                      Visa Requirements
                    </Button>
                    <Button variant="ghost" size="sm">
                      Document Checklist
                    </Button>
                    <Button variant="ghost" size="sm">
                      Rejection Analysis
                    </Button>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    variants={message.role === 'assistant' ? messageVariants : {}}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role !== 'user' && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                    )}

                    <div
                      className={cn(
                        'max-w-[80%] md:max-w-[70%] lg:max-w-[60%]',
                        message.role === 'user' ? 'order-2' : 'order-1'
                      )}
                    >
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-3 relative',
                          message.role === 'user'
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-secondary-100 text-secondary-900 rounded-bl-none'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <span className="text-xs opacity-60">
                            {formatMessageTime(message.timestamp)}
                          </span>
                          {message.role === 'assistant' && (
                            <button
                              className="p-1 rounded hover:bg-black/10"
                              onClick={() => handleCopyMessage(message.content)}
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        {message.isStreaming && (
                          <div className="absolute bottom-0 right-0 -mb-3 -mr-1">
                            <div className="flex gap-1">
                              <motion.div
                                className="h-1.5 w-1.5 rounded-full bg-primary-500"
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 0.4, repeat: Infinity }}
                              />
                              <motion.div
                                className="h-1.5 w-1.5 rounded-full bg-primary-500"
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 0.4, repeat: Infinity, delay: 0.15 }}
                              />
                              <motion.div
                                className="h-1.5 w-1.5 rounded-full bg-primary-500"
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 0.4, repeat: Infinity, delay: 0.3 }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 order-1">
                        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-secondary-200 p-4 bg-white">
            <div className="flex items-end gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? 'Waiting for response...' : `Message in ${languageOptions.find(l => l.value === language)?.label || 'Bengali'}...`}
                disabled={isLoading || isStreaming}
                className="flex-1"
                rightIcon={isLoading || isStreaming ? (
                  <div className="flex gap-1 pr-1">
                    <motion.div
                      className="h-4 w-1 bg-primary-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    <motion.div
                      className="h-4 w-1 bg-primary-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="h-4 w-1 bg-primary-500 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                ) : null}
              />
              <Button
                variant="primary"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading || isStreaming}
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-secondary-500 mt-2 text-center">
              AI may produce inaccurate information. Verify important facts.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Session Toggle */}
      <div className="md:hidden fixed bottom-4 left-4 z-10">
        <Button
          variant="outline"
          onClick={() => navigate('/ai-chat')}
          className="w-48"
        >
          Sessions
        </Button>
      </div>
    </div>
  );
};

export default AIChatPage;
