import * as mistral from './mistral';
import * as gemini from './gemini';
import { AI_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from './constants';
import { getFromStorage, setToStorage } from './utils';
import type { 
  AIChatMessage, 
  AIChatSession, 
  AIModel,
  ResearchRequest,
  ResearchResult
} from '@/types';

// AI Provider type
export type AIProvider = 'mistral' | 'gemini' | 'both';

// AI Configuration
export interface AIConfig {
  provider: AIProvider;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  language: string;
}

// Singleton AI client
let aiConfig: AIConfig | null = null;

// Get AI configuration
export function getAIConfig(): AIConfig {
  if (aiConfig) {
    return aiConfig;
  }

  const storedConfig = getFromStorage<AIConfig>(STORAGE_KEYS.settings);
  
  aiConfig = {
    provider: storedConfig?.provider || AI_CONFIG.defaultProvider,
    defaultModel: storedConfig?.defaultModel || AI_CONFIG.defaultModel,
    temperature: storedConfig?.temperature || AI_CONFIG.mistral.temperature,
    maxTokens: storedConfig?.maxTokens || AI_CONFIG.mistral.maxTokens,
    language: storedConfig?.language || AI_CONFIG.defaultLanguage,
  };

  return aiConfig;
}

// Set AI configuration
export function setAIConfig(config: Partial<AIConfig>): void {
  const current = getAIConfig();
  aiConfig = { ...current, ...config };
  setToStorage(STORAGE_KEYS.settings, aiConfig);
}

// Reset AI configuration
export function resetAIConfig(): void {
  aiConfig = null;
}

// Check if AI is configured
export function isAIConfigured(provider?: AIProvider): boolean {
  const config = getAIConfig();
  const targetProvider = provider || config.provider;
  
  if (targetProvider === 'mistral' || targetProvider === 'both') {
    if (!mistral.isMistralConfigured()) return false;
  }
  
  if (targetProvider === 'gemini' || targetProvider === 'both') {
    if (!gemini.isGeminiConfigured()) return false;
  }
  
  return true;
}

// Get available AI models
export async function getAvailableModels(provider?: AIProvider): Promise<AIModel[]> {
  const config = getAIConfig();
  const targetProvider = provider || config.provider;
  
  const models: AIModel[] = [];
  
  if (targetProvider === 'mistral' || targetProvider === 'both') {
    try {
      const mistralModels = await mistral.getMistralModels();
      mistralModels.forEach(m => {
        models.push({
          id: m.id,
          name: m.id,
          provider: 'mistral',
          modelId: m.id,
          description: `Mistral model: ${m.id}`,
          isActive: true,
          apiKey: mistral.getMistralApiKey() || '',
        });
      });
    } catch {
      // Ignore errors
    }
  }
  
  if (targetProvider === 'gemini' || targetProvider === 'both') {
    try {
      const geminiModels = await gemini.getGeminiModels();
      geminiModels.forEach(m => {
        models.push({
          id: m.id,
          name: m.name,
          provider: 'gemini',
          modelId: m.id,
          description: m.description,
          isActive: true,
          apiKey: gemini.getGeminiApiKey() || '',
        });
      });
    } catch {
      // Ignore errors
    }
  }
  
  return models;
}

// Chat with AI (auto-select provider)
export async function chatWithAI(
  messages: AIChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    language?: string;
    provider?: AIProvider;
  } = {}
): Promise<{ message: AIChatMessage; usage: { promptTokens: number; completionTokens: number; totalTokens: number }; provider: AIProvider }> {
  const config = getAIConfig();
  const {
    model = config.defaultModel,
    temperature = config.temperature,
    maxTokens = config.maxTokens,
    language = config.language,
    provider = config.provider,
  } = options;

  const targetProvider = provider;

  if (targetProvider === 'mistral' || targetProvider === 'both') {
    try {
      if (mistral.isMistralConfigured()) {
        const result = await mistral.chatWithMistral(messages, {
          model,
          temperature,
          maxTokens,
          language,
        });
        return { ...result, provider: 'mistral' };
      }
    } catch {
      // Fall through to gemini
    }
  }

  if (targetProvider === 'gemini' || targetProvider === 'both') {
    try {
      if (gemini.isGeminiConfigured()) {
        const result = await gemini.chatWithGemini(messages, {
          model,
          temperature,
          maxTokens,
          language,
        });
        return { ...result, provider: 'gemini' };
      }
    } catch {
      // Fall through to error
    }
  }

  throw new Error(ERROR_MESSAGES.apiKey[language] || ERROR_MESSAGES.apiKey.en);
}

// Stream chat with AI
export async function* streamChatWithAI(
  messages: AIChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    language?: string;
    provider?: AIProvider;
    onChunk?: (chunk: string, provider: AIProvider) => void;
  } = {}
): AsyncGenerator<string, void, unknown> {
  const config = getAIConfig();
  const {
    model = config.defaultModel,
    temperature = config.temperature,
    maxTokens = config.maxTokens,
    language = config.language,
    provider = config.provider,
    onChunk,
  } = options;

  const targetProvider = provider;

  if (targetProvider === 'mistral' || targetProvider === 'both') {
    try {
      if (mistral.isMistralConfigured()) {
        for await (const chunk of mistral.streamChatWithMistral(messages, {
          model,
          temperature,
          maxTokens,
          language,
          onChunk: (chunk) => onChunk?.(chunk, 'mistral'),
        })) {
          yield chunk;
        }
        return;
      }
    } catch {
      // Fall through to gemini
    }
  }

  if (targetProvider === 'gemini' || targetProvider === 'both') {
    try {
      if (gemini.isGeminiConfigured()) {
        for await (const chunk of gemini.streamChatWithGemini(messages, {
          model,
          temperature,
          maxTokens,
          language,
          onChunk: (chunk) => onChunk?.(chunk, 'gemini'),
        })) {
          yield chunk;
        }
        return;
      }
    } catch {
      // Fall through to error
    }
  }

  throw new Error(ERROR_MESSAGES.apiKey[language] || ERROR_MESSAGES.apiKey.en);
}

// Generate text with AI
export async function generateText(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    language?: string;
    provider?: AIProvider;
  } = {}
): Promise<{ text: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number }; provider: AIProvider }> {
  const config = getAIConfig();
  const {
    model = config.defaultModel,
    temperature = config.temperature,
    maxTokens = config.maxTokens,
    language = config.language,
    provider = config.provider,
    systemPrompt,
  } = options;

  const targetProvider = provider;

  if (targetProvider === 'mistral' || targetProvider === 'both') {
    try {
      if (mistral.isMistralConfigured()) {
        const result = await mistral.generateTextWithMistral(prompt, {
          model,
          temperature,
          maxTokens,
          systemPrompt,
        });
        return { ...result, provider: 'mistral' };
      }
    } catch {
      // Fall through to gemini
    }
  }

  if (targetProvider === 'gemini' || targetProvider === 'both') {
    try {
      if (gemini.isGeminiConfigured()) {
        const result = await gemini.generateTextWithGemini(prompt, {
          model,
          temperature,
          maxTokens,
          systemPrompt,
        });
        return { ...result, provider: 'gemini' };
      }
    } catch {
      // Fall through to error
    }
  }

  throw new Error(ERROR_MESSAGES.apiKey[language] || ERROR_MESSAGES.apiKey.en);
}

// Analyze document with AI
export async function analyzeDocument(
  documentContent: string,
  analysisType: 'rejection-letter' | 'visa-requirements' | 'general',
  language: string = 'bn',
  provider?: AIProvider
): Promise<{ analysis: string; summary: string; recommendations: string[]; extractedData?: any; provider: AIProvider }> {
  const config = getAIConfig();
  const targetProvider = provider || config.provider;

  if (targetProvider === 'mistral' || targetProvider === 'both') {
    try {
      if (mistral.isMistralConfigured()) {
        const result = await mistral.analyzeDocumentWithMistral(documentContent, analysisType, language);
        return { ...result, provider: 'mistral' };
      }
    } catch {
      // Fall through to gemini
    }
  }

  if (targetProvider === 'gemini' || targetProvider === 'both') {
    try {
      if (gemini.isGeminiConfigured()) {
        const result = await gemini.analyzeDocumentWithGemini(documentContent, analysisType, language);
        return { ...result, provider: 'gemini' };
      }
    } catch {
      // Fall through to error
    }
  }

  throw new Error(ERROR_MESSAGES.apiKey[language] || ERROR_MESSAGES.apiKey.en);
}

// Generate document with AI
export async function generateDocument(
  template: string,
  data: Record<string, any>,
  language: string = 'bn',
  provider?: AIProvider
): Promise<{ content: string; provider: AIProvider }> {
  const config = getAIConfig();
  const targetProvider = provider || config.provider;

  if (targetProvider === 'mistral' || targetProvider === 'both') {
    try {
      if (mistral.isMistralConfigured()) {
        const content = await mistral.generateDocumentWithMistral(template, data, language);
        return { content, provider: 'mistral' };
      }
    } catch {
      // Fall through to gemini
    }
  }

  if (targetProvider === 'gemini' || targetProvider === 'both') {
    try {
      if (gemini.isGeminiConfigured()) {
        const content = await gemini.generateDocumentWithGemini(template, data, language);
        return { content, provider: 'gemini' };
      }
    } catch {
      // Fall through to error
    }
  }

  throw new Error(ERROR_MESSAGES.apiKey[language] || ERROR_MESSAGES.apiKey.en);
}

// Translate text with AI
export async function translateText(
  text: string,
  targetLanguage: string = 'bn',
  sourceLanguage: string = 'en',
  provider?: AIProvider
): Promise<{ text: string; provider: AIProvider }> {
  const config = getAIConfig();
  const targetProvider = provider || config.provider;

  if (targetProvider === 'mistral' || targetProvider === 'both') {
    try {
      if (mistral.isMistralConfigured()) {
        const translated = await mistral.translateWithMistral(text, targetLanguage, sourceLanguage);
        return { text: translated, provider: 'mistral' };
      }
    } catch {
      // Fall through to gemini
    }
  }

  if (targetProvider === 'gemini' || targetProvider === 'both') {
    try {
      if (gemini.isGeminiConfigured()) {
        const translated = await gemini.translateWithGemini(text, targetLanguage, sourceLanguage);
        return { text: translated, provider: 'gemini' };
      }
    } catch {
      // Fall through to error
    }
  }

  throw new Error(ERROR_MESSAGES.apiKey[targetLanguage] || ERROR_MESSAGES.apiKey.en);
}

// Analyze website URL with AI
export async function analyzeWebsite(
  url: string,
  query: string = '',
  language: string = 'bn',
  provider?: AIProvider
): Promise<{ 
  title: string; 
  summary: string; 
  content: string; 
  language: string; 
  extractedData: any;
  provider: AIProvider;
}> {
  const config = getAIConfig();
  const targetProvider = provider || config.provider;

  if (targetProvider === 'gemini' || targetProvider === 'both') {
    try {
      if (gemini.isGeminiConfigured()) {
        const result = await gemini.analyzeWebsiteWithGemini(url, query, language);
        return { ...result, provider: 'gemini' };
      }
    } catch {
      // Fall through to mistral
    }
  }

  if (targetProvider === 'mistral' || targetProvider === 'both') {
    try {
      if (mistral.isMistralConfigured()) {
        // For Mistral, we'll use text generation since it doesn't have direct website analysis
        const result = await mistral.generateTextWithMistral(
          `Analyze the website at ${url}. ${query ? `Focus on: ${query}` : ''}`,
          { model: AI_CONFIG.mistral.models.medium, temperature: 0.3 }
        );
        return {
          title: url,
          summary: result.text.slice(0, 500),
          content: result.text,
          language,
          extractedData: { url, query },
          provider: 'mistral',
        };
      }
    } catch {
      // Fall through to error
    }
  }

  throw new Error(ERROR_MESSAGES.apiKey[language] || ERROR_MESSAGES.apiKey.en);
}

// Extract text from image with AI
export async function extractTextFromImage(
  imageBase64: string,
  language: string = 'bn',
  provider?: AIProvider
): Promise<{ text: string; provider: AIProvider }> {
  const config = getAIConfig();
  const targetProvider = provider || config.provider;

  if (targetProvider === 'gemini' || targetProvider === 'both') {
    try {
      if (gemini.isGeminiConfigured()) {
        const text = await gemini.extractTextFromImageWithGemini(imageBase64, language);
        return { text, provider: 'gemini' };
      }
    } catch {
      // Fall through to error
    }
  }

  throw new Error('Image text extraction requires Gemini API. Please configure your Gemini API key in settings.');
}

// Create AI chat session
export function createChatSession(
  userId: string,
  caseId?: string,
  title: string = 'New Chat',
  model: string = getAIConfig().defaultModel
): AIChatSession {
  return {
    id: `session_${Date.now()}`,
    userId,
    caseId,
    title,
    messages: [],
    model,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Add message to chat session
export function addMessageToSession(
  session: AIChatSession,
  message: AIChatMessage
): AIChatSession {
  return {
    ...session,
    messages: [...session.messages, message],
    updatedAt: new Date().toISOString(),
  };
}

// Update chat session
export function updateChatSession(
  session: AIChatSession,
  updates: Partial<AIChatSession>
): AIChatSession {
  return {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

// Create research request
export function createResearchRequest(
  url: string,
  query: string,
  language: string = 'bn'
): ResearchRequest {
  return {
    id: `research_${Date.now()}`,
    url,
    query,
    language,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Update research request
export function updateResearchRequest(
  request: ResearchRequest,
  updates: Partial<ResearchRequest>
): ResearchRequest {
  return {
    ...request,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

// Create research result
export function createResearchResult(
  title: string,
  summary: string,
  content: string,
  language: string,
  extractedData: any = {},
  screenshots: string[] = []
): ResearchResult {
  return {
    title,
    summary,
    content,
    language,
    extractedData,
    screenshots,
  };
}

// Check AI connection
export async function checkAIConnection(provider?: AIProvider): Promise<{ mistral: boolean; gemini: boolean }> {
  const mistralConnected = await mistral.checkMistralConnection();
  const geminiConnected = await gemini.checkGeminiConnection();

  return {
    mistral: mistralConnected,
    gemini: geminiConnected,
  };
}

// Get AI usage statistics
export async function getAIUsage(): Promise<{
  mistral?: { totalTokens: number; usedTokens: number; remainingTokens: number };
  gemini?: { totalTokens: number; usedTokens: number; remainingTokens: number };
}> {
  const mistralUsage = await mistral.getMistralUsage();
  const geminiUsage = await gemini.getGeminiUsage();

  return {
    mistral: mistralUsage,
    gemini: geminiUsage,
  };
}

// Initialize AI with API keys
export function initializeAI(
  mistralApiKey?: string,
  geminiApiKey?: string,
  provider?: AIProvider
): void {
  if (mistralApiKey) {
    mistral.initializeMistral(mistralApiKey);
  }
  if (geminiApiKey) {
    gemini.initializeGemini(geminiApiKey);
  }
  if (provider) {
    setAIConfig({ provider });
  }
}

// Get AI provider status
export function getAIProviderStatus(): { 
  mistral: { configured: boolean; apiKey: string | undefined };
  gemini: { configured: boolean; apiKey: string | undefined };
  currentProvider: AIProvider;
} {
  return {
    mistral: {
      configured: mistral.isMistralConfigured(),
      apiKey: mistral.getMistralApiKey(),
    },
    gemini: {
      configured: gemini.isGeminiConfigured(),
      apiKey: gemini.getGeminiApiKey(),
    },
    currentProvider: getAIConfig().provider,
  };
}

export default {
  // Configuration
  getAIConfig,
  setAIConfig,
  resetAIConfig,
  isAIConfigured,
  initializeAI,
  getAIProviderStatus,
  
  // Models
  getAvailableModels,
  
  // Chat
  chatWithAI,
  streamChatWithAI,
  
  // Generation
  generateText,
  
  // Analysis
  analyzeDocument,
  generateDocument,
  translateText,
  analyzeWebsite,
  extractTextFromImage,
  
  // Research
  createResearchRequest,
  updateResearchRequest,
  createResearchResult,
  
  // Chat sessions
  createChatSession,
  addMessageToSession,
  updateChatSession,
  
  // Connection
  checkAIConnection,
  getAIUsage,
  
  // Re-exports
  ...mistral,
  ...gemini,
};
