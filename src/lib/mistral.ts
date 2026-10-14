import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { AI_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from './constants';
import { retry, getFromStorage, setToStorage } from './utils';
import type { AIChatMessage, AIModel } from '@/types';

// Mistral API Configuration
export interface MistralConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
}

// Mistral Request Types
export interface MistralChatRequest {
  model: string;
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface MistralChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string | null;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface MistralModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: any[];
  root: string | null;
  parent: string | null;
}

export interface MistralModelsResponse {
  object: string;
  data: MistralModel[];
}

// Singleton Mistral client
let mistralClient: AxiosInstance | null = null;

export function getMistralClient(): AxiosInstance {
  if (mistralClient) {
    return mistralClient;
  }

  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY ||
    getFromStorage<string>(`${STORAGE_KEYS.settings}_mistralApiKey`) ||
    '';

  if (!apiKey) {
    console.warn('Mistral API key not configured. Using fallback.');
    // Return a mock client
    mistralClient = axios.create({
      baseURL: AI_CONFIG.mistral.baseUrl,
      timeout: AI_CONFIG.apiTimeout,
    });
    return mistralClient;
  }

  mistralClient = axios.create({
    baseURL: AI_CONFIG.mistral.baseUrl,
    timeout: AI_CONFIG.apiTimeout,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  return mistralClient;
}

export function resetMistralClient(): void {
  mistralClient = null;
}

// Initialize Mistral with custom API key
export function initializeMistral(apiKey: string): void {
  setToStorage(`${STORAGE_KEYS.settings}_mistralApiKey`, apiKey);
  resetMistralClient();
}

// Check if Mistral is configured
export function isMistralConfigured(): boolean {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY ||
    getFromStorage<string>(`${STORAGE_KEYS.settings}_mistralApiKey`) ||
    '';
  return !!apiKey;
}

// Get Mistral API key
export function getMistralApiKey(): string | undefined {
  return import.meta.env.VITE_MISTRAL_API_KEY ||
    getFromStorage<string>(`${STORAGE_KEYS.settings}_mistralApiKey`);
}

// Chat with Mistral
export async function chatWithMistral(
  messages: AIChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    language?: string;
  } = {}
): Promise<{ message: AIChatMessage; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const apiKey = getMistralApiKey();
  
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.apiKey.en);
  }

  const {
    model = AI_CONFIG.mistral.models.tiny,
    temperature = AI_CONFIG.mistral.temperature,
    maxTokens = AI_CONFIG.mistral.maxTokens,
    topP = AI_CONFIG.mistral.topP,
    language = 'en',
  } = options;

  // Convert AIChatMessage to Mistral format
  const mistralMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  // Add system prompt for Bengali
  if (language === 'bn') {
    mistralMessages.unshift({
      role: 'system',
      content: AI_CONFIG.systemPrompts.bengali,
    });
  } else {
    mistralMessages.unshift({
      role: 'system',
      content: AI_CONFIG.systemPrompts.english,
    });
  }

  const request: MistralChatRequest = {
    model,
    messages: mistralMessages,
    temperature,
    max_tokens: maxTokens,
    top_p: topP,
    stream: false,
  };

  const client = getMistralClient();

  try {
    const response = await retry<MistralChatResponse>(() => 
      client.post<MistralChatResponse>('/chat/completions', request)
    );

    const choice = response.data.choices[0];
    const content = choice.message.content;
    const usage = response.data.usage;

    const assistantMessage: AIChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content,
      language,
      timestamp: new Date().toISOString(),
      sessionId: messages[0]?.sessionId || `session_${Date.now()}`,
      model: model,
      tokensUsed: usage.completion_tokens,
    };

    return {
      message: assistantMessage,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 401) {
        throw new Error('Invalid Mistral API key. Please check your API key in settings.');
      } else if (status === 429) {
        throw new Error('Mistral API rate limit exceeded. Please try again later.');
      } else if (status >= 500) {
        throw new Error('Mistral server error. Please try again later.');
      }
    }
    throw new Error(`Mistral API error: ${axiosError.message}`);
  }
}

// Stream chat with Mistral
export async function* streamChatWithMistral(
  messages: AIChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    language?: string;
    onChunk?: (chunk: string) => void;
  } = {}
): AsyncGenerator<string, void, unknown> {
  const apiKey = getMistralApiKey();
  
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.apiKey.en);
  }

  const {
    model = AI_CONFIG.mistral.models.tiny,
    temperature = AI_CONFIG.mistral.temperature,
    maxTokens = AI_CONFIG.mistral.maxTokens,
    topP = AI_CONFIG.mistral.topP,
    language = 'en',
    onChunk,
  } = options;

  // Convert AIChatMessage to Mistral format
  const mistralMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  // Add system prompt for Bengali
  if (language === 'bn') {
    mistralMessages.unshift({
      role: 'system',
      content: AI_CONFIG.systemPrompts.bengali,
    });
  } else {
    mistralMessages.unshift({
      role: 'system',
      content: AI_CONFIG.systemPrompts.english,
    });
  }

  const request: MistralChatRequest = {
    model,
    messages: mistralMessages,
    temperature,
    max_tokens: maxTokens,
    top_p: topP,
    stream: true,
  };

  const client = getMistralClient();

  try {
    const response = await client.post('/chat/completions', request, {
      responseType: 'stream',
    });

    const stream = response.data as any;
    
    for await (const chunk of stream) {
      // Parse the chunk (Mistral streams in a specific format)
      const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                if (onChunk) {
                  onChunk(content);
                }
                yield content;
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 401) {
        throw new Error('Invalid Mistral API key. Please check your API key in settings.');
      } else if (status === 429) {
        throw new Error('Mistral API rate limit exceeded. Please try again later.');
      } else if (status >= 500) {
        throw new Error('Mistral server error. Please try again later.');
      }
    }
    throw new Error(`Mistral API error: ${axiosError.message}`);
  }
}

// Get available models from Mistral
export async function getMistralModels(): Promise<MistralModel[]> {
  const apiKey = getMistralApiKey();
  
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.apiKey.en);
  }

  const client = getMistralClient();

  try {
    const response = await retry<MistralModelsResponse>(() => 
      client.get<MistralModelsResponse>('/models')
    );

    return response.data.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      throw new Error('Invalid Mistral API key. Please check your API key in settings.');
    }
    throw new Error(`Failed to fetch Mistral models: ${axiosError.message}`);
  }
}

// Get model information
export async function getMistralModel(modelId: string): Promise<MistralModel | undefined> {
  const models = await getMistralModels();
  return models.find(m => m.id === modelId);
}

// Generate text with Mistral
export async function generateTextWithMistral(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    systemPrompt?: string;
  } = {}
): Promise<{ text: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const {
    model = AI_CONFIG.mistral.models.tiny,
    temperature = AI_CONFIG.mistral.temperature,
    maxTokens = AI_CONFIG.mistral.maxTokens,
    topP = AI_CONFIG.mistral.topP,
    systemPrompt,
  } = options;

  const messages: AIChatMessage[] = [
    {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: prompt,
      language: 'en',
      timestamp: new Date().toISOString(),
      sessionId: `session_${Date.now()}`,
      model: model,
    },
  ];

  if (systemPrompt) {
    messages.unshift({
      id: `sys_${Date.now()}`,
      role: 'system',
      content: systemPrompt,
      language: 'en',
      timestamp: new Date().toISOString(),
      sessionId: `session_${Date.now()}`,
      model: model,
    });
  }

  const result = await chatWithMistral(messages, { model, temperature, maxTokens, topP });
  return { text: result.message.content, usage: result.usage };
}

// Analyze document with Mistral
export async function analyzeDocumentWithMistral(
  documentContent: string,
  analysisType: 'rejection-letter' | 'visa-requirements' | 'general',
  language: string = 'bn'
): Promise<{ analysis: string; summary: string; recommendations: string[] }> {
  const systemPrompt = language === 'bn'
    ? `তুমি একটি ভিসা কনসালটেন্সি এজেন্সির AI সহকারী। তুমি নিম্নলিখিত ধরনের দস্তাবেজ বিশ্লেষণ করতে পারবে:
    
${analysisType === 'rejection-letter' ? 'ভিসা রিজেকশন লেটার' : analysisType === 'visa-requirements' ? 'ভিসা প্রয়োজনীয়তা' : 'সাধারণ দস্তাবেজ'}

বিশ্লেষণের জন্য নিম্নলিখিত বিষয়গুলি অন্তর্ভুক্ত করবে:
1. দস্তাবেজের সংক্ষিপ্ত বিবরণ
2. প্রধান বিষয়বস্তু
3. গুরুত্বপূর্ণ তথ্য
4. সুপারিশসমূহ

সর্বদা বাংলা ভাষায় উত্তর দাও। উত্তরগুলি সংক্ষিপ্ত, স্পষ্ট এবং প্রাসঙ্গিক হওয়া উচিত।`
    : `You are an AI assistant for a visa consultancy agency. Analyze the following document:

${analysisType === 'rejection-letter' ? 'Visa Rejection Letter' : analysisType === 'visa-requirements' ? 'Visa Requirements' : 'General Document'}

Your analysis should include:
1. Brief summary of the document
2. Main content
3. Key information
4. Recommendations

Always respond in English. Keep responses concise, clear, and relevant.`;

  const userPrompt = `Please analyze the following document:

${documentContent}

Provide a comprehensive analysis including summary, key points, and recommendations.`;

  const result = await generateTextWithMistral(userPrompt, {
    model: AI_CONFIG.mistral.models.small,
    temperature: 0.3,
    systemPrompt,
  });

  // Parse the response to extract structured data
  const analysis = result.text;
  
  // Simple parsing for summary and recommendations
  const summaryMatch = analysis.match(/summary[:\s]+([\s\S]*?)(?=\n\n|\n|$)/i);
  const recommendationsMatch = analysis.match(/recommendations?[:\s]+([\s\S]*?)(?=\n\n|\n|$)/i);
  
  const summary = summaryMatch ? summaryMatch[1].trim() : analysis.slice(0, 200);
  const recommendations = recommendationsMatch 
    ? recommendationsMatch[1].split(/\n|\d+\.|\-/).filter(r => r.trim()).map(r => r.trim())
    : [analysis.slice(0, 100)];

  return { analysis, summary, recommendations };
}

// Generate document with Mistral
export async function generateDocumentWithMistral(
  template: string,
  data: Record<string, any>,
  language: string = 'bn'
): Promise<string> {
  const systemPrompt = language === 'bn'
    ? `তুমি একটি ভিসা কনসালটেন্সি এজেন্সির AI সহকারী। তুমি নিম্নলিখিত টেমপ্লেট এবং ডেটা ব্যবহার করে দস্তাবেজ তৈরি করতে পারবে।
    
টেমপ্লেটে ডেটা ইনজেক্ট কর এবং সম্পূর্ণ দস্তাবেজ তৈরি কর।
সর্বদা বাংলা ভাষায় উত্তর দাও।`
    : `You are an AI assistant for a visa consultancy agency. Generate a document using the following template and data.

Inject the data into the template and create a complete document. Always respond in English.`;

  const userPrompt = `Template:
${template}

Data:
${JSON.stringify(data, null, 2)}

Please generate the complete document by filling in the template with the provided data.`;

  const result = await generateTextWithMistral(userPrompt, {
    model: AI_CONFIG.mistral.models.medium,
    temperature: 0.2,
    systemPrompt,
  });

  return result.text;
}

// Translate text with Mistral
export async function translateWithMistral(
  text: string,
  targetLanguage: string = 'bn',
  sourceLanguage: string = 'en'
): Promise<string> {
  const systemPrompt = `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Preserve the original meaning and tone.`;

  const userPrompt = `Translate this text to ${targetLanguage}:

${text}`;

  const result = await generateTextWithMistral(userPrompt, {
    model: AI_CONFIG.mistral.models.small,
    temperature: 0.1,
    systemPrompt,
  });

  return result.text;
}

// Check if Mistral API is available
export async function checkMistralConnection(): Promise<boolean> {
  try {
    const apiKey = getMistralApiKey();
    if (!apiKey) return false;
    
    const client = getMistralClient();
    await client.get('/models', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

// Get Mistral usage statistics
export async function getMistralUsage(): Promise<{ totalTokens: number; usedTokens: number; remainingTokens: number } | undefined> {
  try {
    const apiKey = getMistralApiKey();
    if (!apiKey) return undefined;
    
    // Note: Mistral doesn't have a direct usage endpoint in their public API
    // This is a placeholder for future implementation
    return {
      totalTokens: 1000000,
      usedTokens: 0,
      remainingTokens: 1000000,
    };
  } catch {
    return undefined;
  }
}

export default {
  getMistralClient,
  resetMistralClient,
  initializeMistral,
  isMistralConfigured,
  getMistralApiKey,
  chatWithMistral,
  streamChatWithMistral,
  getMistralModels,
  getMistralModel,
  generateTextWithMistral,
  analyzeDocumentWithMistral,
  generateDocumentWithMistral,
  translateWithMistral,
  checkMistralConnection,
  getMistralUsage,
};
