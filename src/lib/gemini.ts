import { GoogleGenerativeAI, type Content, type GenerateContentResult, type GenerateContentStreamResult } from '@google/generative-ai';
import { AI_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from './constants';
import { retry, getFromStorage, setToStorage } from './utils';
import type { AIChatMessage } from '@/types';

// Gemini Configuration
export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
}

// Singleton Gemini client
let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ||
    getFromStorage<string>(`${STORAGE_KEYS.settings}_geminiApiKey`) ||
    '';

  if (!apiKey) {
    console.warn('Gemini API key not configured. Using fallback.');
    // Return a mock client
    geminiClient = new GoogleGenerativeAI('placeholder-api-key');
    return geminiClient;
  }

  geminiClient = new GoogleGenerativeAI(apiKey);
  return geminiClient;
}

export function resetGeminiClient(): void {
  geminiClient = null;
}

// Initialize Gemini with custom API key
export function initializeGemini(apiKey: string): void {
  setToStorage(`${STORAGE_KEYS.settings}_geminiApiKey`, apiKey);
  resetGeminiClient();
}

// Check if Gemini is configured
export function isGeminiConfigured(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ||
    getFromStorage<string>(`${STORAGE_KEYS.settings}_geminiApiKey`) ||
    '';
  return !!apiKey;
}

// Get Gemini API key
export function getGeminiApiKey(): string | undefined {
  return import.meta.env.VITE_GEMINI_API_KEY ||
    getFromStorage<string>(`${STORAGE_KEYS.settings}_geminiApiKey`);
}

// Get Gemini model
export function getGeminiModel(modelId: string = AI_CONFIG.gemini.models.flash) {
  const client = getGeminiClient();
  return client.getGenerativeModel(modelId, {
    generationConfig: {
      temperature: AI_CONFIG.gemini.temperature,
      maxOutputTokens: AI_CONFIG.gemini.maxTokens,
      topP: AI_CONFIG.gemini.topP,
      topK: AI_CONFIG.gemini.topK,
    },
  });
}

// Convert AIChatMessage to Gemini Content
export function convertToGeminiContent(messages: AIChatMessage[], language: string = 'en'): Content[] {
  const contents: Content[] = [];
  
  // Add system prompt
  const systemPrompt = language === 'bn' 
    ? AI_CONFIG.systemPrompts.bengali 
    : AI_CONFIG.systemPrompts.english;
  
  contents.push({
    role: 'user',
    parts: [{ text: systemPrompt }],
  });

  // Add messages
  for (const msg of messages) {
    const role = msg.role === 'system' ? 'user' : msg.role;
    contents.push({
      role,
      parts: [{ text: msg.content }],
    });
  }

  return contents;
}

// Chat with Gemini
export async function chatWithGemini(
  messages: AIChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    language?: string;
  } = {}
): Promise<{ message: AIChatMessage; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.apiKey.en);
  }

  const {
    model = AI_CONFIG.gemini.models.flash,
    temperature = AI_CONFIG.gemini.temperature,
    maxTokens = AI_CONFIG.gemini.maxTokens,
    topP = AI_CONFIG.gemini.topP,
    topK = AI_CONFIG.gemini.topK,
    language = 'en',
  } = options;

  const geminiModel = getGeminiModel(model);
  const contents = convertToGeminiContent(messages, language);

  try {
    const result: GenerateContentResult = await retry(() => 
      geminiModel.generateContent({
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topP,
          topK,
        },
      })
    );

    const responseText = result.response.text();
    const usage = result.response.usageMetadata;

    const assistantMessage: AIChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: responseText,
      language,
      timestamp: new Date().toISOString(),
      sessionId: messages[0]?.sessionId || `session_${Date.now()}`,
      model: model,
      tokensUsed: usage?.candidatesTokenCount || 0,
    };

    return {
      message: assistantMessage,
      usage: {
        promptTokens: usage?.promptTokenCount || 0,
        completionTokens: usage?.candidatesTokenCount || 0,
        totalTokens: (usage?.promptTokenCount || 0) + (usage?.candidatesTokenCount || 0),
      },
    };
  } catch (error) {
    const err = error as Error;
    if (err.message.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API key. Please check your API key in settings.');
    } else if (err.message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Gemini API quota exceeded. Please try again later.');
    } else if (err.message.includes('PERMISSION_DENIED')) {
      throw new Error('Gemini API permission denied. Please check your API key.');
    }
    throw new Error(`Gemini API error: ${err.message}`);
  }
}

// Stream chat with Gemini
export async function* streamChatWithGemini(
  messages: AIChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    language?: string;
    onChunk?: (chunk: string) => void;
  } = {}
): AsyncGenerator<string, void, unknown> {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.apiKey.en);
  }

  const {
    model = AI_CONFIG.gemini.models.flash,
    temperature = AI_CONFIG.gemini.temperature,
    maxTokens = AI_CONFIG.gemini.maxTokens,
    topP = AI_CONFIG.gemini.topP,
    topK = AI_CONFIG.gemini.topK,
    language = 'en',
    onChunk,
  } = options;

  const geminiModel = getGeminiModel(model);
  const contents = convertToGeminiContent(messages, language);

  try {
    const result: GenerateContentStreamResult = await geminiModel.generateContentStream({
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP,
        topK,
      },
    });

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        if (onChunk) {
          onChunk(chunkText);
        }
        yield chunkText;
      }
    }
  } catch (error) {
    const err = error as Error;
    if (err.message.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API key. Please check your API key in settings.');
    } else if (err.message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('Gemini API quota exceeded. Please try again later.');
    } else if (err.message.includes('PERMISSION_DENIED')) {
      throw new Error('Gemini API permission denied. Please check your API key.');
    }
    throw new Error(`Gemini API error: ${err.message}`);
  }
}

// Generate text with Gemini
export async function generateTextWithGemini(
  prompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    systemPrompt?: string;
  } = {}
): Promise<{ text: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const {
    model = AI_CONFIG.gemini.models.flash,
    temperature = AI_CONFIG.gemini.temperature,
    maxTokens = AI_CONFIG.gemini.maxTokens,
    topP = AI_CONFIG.gemini.topP,
    topK = AI_CONFIG.gemini.topK,
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

  const result = await chatWithGemini(messages, { model, temperature, maxTokens, topP, topK });
  return { text: result.message.content, usage: result.usage };
}

// Analyze document with Gemini
export async function analyzeDocumentWithGemini(
  documentContent: string,
  analysisType: 'rejection-letter' | 'visa-requirements' | 'website' | 'general',
  language: string = 'bn'
): Promise<{ analysis: string; summary: string; recommendations: string[]; extractedData?: any }> {
  const systemPrompt = language === 'bn'
    ? `তুমি একটি ভিসা কনসালটেন্সি এজেন্সির AI সহকারী। তুমি নিম্নলিখিত ধরনের দস্তাবেজ বিশ্লেষণ করতে পারবে:
    
${analysisType === 'rejection-letter' ? 'ভিসা রিজেকশন লেটার' : 
     analysisType === 'visa-requirements' ? 'ভিসা প্রয়োজনীয়তা' :
     analysisType === 'website' ? 'ওয়েবসাইট' : 'সাধারণ দস্তাবেজ'}

বিশ্লেষণের জন্য নিম্নলিখিত বিষয়গুলি অন্তর্ভুক্ত করবে:
1. দস্তাবেজের সংক্ষিপ্ত বিবরণ
2. প্রধান বিষয়বস্তু
3. গুরুত্বপূর্ণ তথ্য
4. সুপারিশসমূহ

সর্বদা বাংলা ভাষায় উত্তর দাও। উত্তরগুলি সংক্ষিপ্ত, স্পষ্ট এবং প্রাসঙ্গিক হওয়া উচিত।
ফলাফলকে মার্কডাউন ফরম্যাটে উপস্থাপন কর।`
    : `You are an AI assistant for a visa consultancy agency. Analyze the following document:

${analysisType === 'rejection-letter' ? 'Visa Rejection Letter' : 
     analysisType === 'visa-requirements' ? 'Visa Requirements' :
     analysisType === 'website' ? 'Website Content' : 'General Document'}

Your analysis should include:
1. Brief summary of the document
2. Main content
3. Key information
4. Recommendations

Always respond in English. Keep responses concise, clear, and relevant. Format the result in Markdown.`;

  const userPrompt = `Please analyze the following document content:

${documentContent}

Provide a comprehensive analysis including summary, key points, and recommendations.`;

  const result = await generateTextWithGemini(userPrompt, {
    model: AI_CONFIG.gemini.models.flash,
    temperature: 0.3,
    systemPrompt,
  });

  const analysis = result.text;
  
  // Try to extract structured data (Gemini is good at this)
  let extractedData: any = null;
  try {
    // Look for JSON in the response
    const jsonMatch = analysis.match(/\{.*\}/s);
    if (jsonMatch) {
      extractedData = JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Ignore parse errors
  }

  // Parse for summary and recommendations
  const summaryMatch = analysis.match(/##?\s*Summary[\s\S]*?\n\n([\s\S]*?)(?=\n\n##|\n\n\*\*|$)/i);
  const recommendationsMatch = analysis.match(/##?\s*Recommendations?[\s\S]*?\n\n([\s\S]*?)(?=\n\n##|\n\n\*\*|$)/i);
  
  const summary = summaryMatch ? summaryMatch[1].trim() : analysis.slice(0, 500);
  const recommendations = recommendationsMatch 
    ? recommendationsMatch[1].split(/\n\d+\.|\n\-|\n\*/).filter(r => r.trim()).map(r => r.trim())
    : [analysis.slice(0, 200)];

  return { analysis, summary, recommendations, extractedData };
}

// Generate document with Gemini
export async function generateDocumentWithGemini(
  template: string,
  data: Record<string, any>,
  language: string = 'bn'
): Promise<string> {
  const systemPrompt = language === 'bn'
    ? `তুমি একটি ভিসা কনসালটেন্সি এজেন্সির AI সহকারী। তুমি নিম্নলিখিত টেমপ্লেট এবং ডেটা ব্যবহার করে দস্তাবেজ তৈরি করতে পারবে।
    
টেমপ্লেটে ডেটা ইনজেক্ট কর এবং সম্পূর্ণ দস্তাবেজ তৈরি কর।
সর্বদা বাংলা ভাষায় উত্তর দাও।
ফলাফলকে সুন্দরভাবে ফরম্যাট কর।`
    : `You are an AI assistant for a visa consultancy agency. Generate a document using the following template and data.

Inject the data into the template and create a complete document. Always respond in English. Format the result nicely.`;

  const userPrompt = `Template:
${template}

Data:
${JSON.stringify(data, null, 2)}

Please generate the complete document by filling in the template with the provided data. Format the output as a professional document.`;

  const result = await generateTextWithGemini(userPrompt, {
    model: AI_CONFIG.gemini.models.pro,
    temperature: 0.2,
    systemPrompt,
  });

  return result.text;
}

// Translate text with Gemini
export async function translateWithGemini(
  text: string,
  targetLanguage: string = 'bn',
  sourceLanguage: string = 'en'
): Promise<string> {
  const systemPrompt = `You are a professional translator. Translate the following text from ${sourceLanguage} to ${targetLanguage}. Preserve the original meaning, tone, and formatting.`;

  const userPrompt = `Translate this text to ${targetLanguage}:

${text}`;

  const result = await generateTextWithGemini(userPrompt, {
    model: AI_CONFIG.gemini.models.flash,
    temperature: 0.1,
    systemPrompt,
  });

  return result.text;
}

// Analyze website URL with Gemini
export async function analyzeWebsiteWithGemini(
  url: string,
  query: string = '',
  language: string = 'bn'
): Promise<{ 
  title: string; 
  summary: string; 
  content: string; 
  language: string; 
  extractedData: any;
  screenshots?: string[];
}> {
  const systemPrompt = language === 'bn'
    ? `তুমি একটি ভিসা কনসালটেন্সি এজেন্সির AI সহকারী। তুমি ওয়েবসাইট বিশ্লেষণ করতে পারবে।
    
ওয়েবসাইটের বিষয়বস্তু বিশ্লেষণ কর এবং নিম্নলিখিত তথ্য প্রদান কর:
1. ওয়েবসাইটের শিরোনাম
2. সংক্ষিপ্ত বিবরণ
3. প্রধান বিষয়বস্তু
4. গুরুত্বপূর্ণ তথ্য
5. সুপারিশসমূহ

${query ? `বিশেষ কোয়ারী: ${query}` : ''}

সর্বদা বাংলা ভাষায় উত্তর দাও। উত্তরগুলি সংক্ষিপ্ত, স্পষ্ট এবং প্রাসঙ্গিক হওয়া উচিত।`
    : `You are an AI assistant for a visa consultancy agency. Analyze the following website:

${url}

${query ? `Specific query: ${query}` : ''}

Your analysis should include:
1. Website title
2. Brief summary
3. Main content
4. Key information
5. Recommendations

Always respond in English. Keep responses concise, clear, and relevant.`;

  const userPrompt = `Please analyze the following website URL: ${url}

${query ? `Focus on: ${query}` : ''}

Provide a comprehensive analysis including title, summary, content, and key information.`;

  // Note: In a real implementation, we would fetch the website content first
  // For now, we'll just send the URL to Gemini
  const result = await generateTextWithGemini(userPrompt, {
    model: AI_CONFIG.gemini.models.flash,
    temperature: 0.3,
    systemPrompt,
  });

  const analysis = result.text;
  
  // Parse the response
  const titleMatch = analysis.match(/##?\s*Title[\s\S]*?\n\n([\s\S]*?)(?=\n\n##|\n\n\*\*|$)/i);
  const summaryMatch = analysis.match(/##?\s*Summary[\s\S]*?\n\n([\s\S]*?)(?=\n\n##|\n\n\*\*|$)/i);
  const contentMatch = analysis.match(/##?\s*Content[\s\S]*?\n\n([\s\S]*?)(?=\n\n##|\n\n\*\*|$)/i);
  
  const title = titleMatch ? titleMatch[1].trim() : url;
  const summary = summaryMatch ? summaryMatch[1].trim() : analysis.slice(0, 500);
  const content = contentMatch ? contentMatch[1].trim() : analysis;

  return {
    title,
    summary,
    content,
    language,
    extractedData: { url, query },
  };
}

// Extract text from image with Gemini (using Google's multimodal capabilities)
export async function extractTextFromImageWithGemini(
  imageBase64: string,
  language: string = 'bn'
): Promise<string> {
  const systemPrompt = language === 'bn'
    ? 'তুমি একটি ছবি থেকে টেক্সট বের করতে পারবে। ছবিতে থাকা সব টেক্সট বাংলা ভাষায় বের কর।'
    : 'Extract all text from the following image. Return the text in English.';

  const geminiModel = getGeminiModel(AI_CONFIG.gemini.models.flash);

  try {
    const result = await geminiModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            { 
              inlineData: {
                mimeType: 'image/png',
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    });

    return result.response.text();
  } catch (error) {
    const err = error as Error;
    if (err.message.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API key. Please check your API key in settings.');
    }
    throw new Error(`Failed to extract text from image: ${err.message}`);
  }
}

// Check if Gemini API is available
export async function checkGeminiConnection(): Promise<boolean> {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) return false;
    
    const geminiModel = getGeminiModel(AI_CONFIG.gemini.models.nano);
    await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
    });
    return true;
  } catch {
    return false;
  }
}

// Get Gemini usage statistics
export async function getGeminiUsage(): Promise<{ totalTokens: number; usedTokens: number; remainingTokens: number } | undefined> {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) return undefined;
    
    // Note: Google's API doesn't provide usage stats directly in the client
    // This would need to be implemented via a backend service
    return {
      totalTokens: 1000000,
      usedTokens: 0,
      remainingTokens: 1000000,
    };
  } catch {
    return undefined;
  }
}

// Get available models from Google
export async function getGeminiModels(): Promise<{ id: string; name: string; description: string }[]> {
  // Google doesn't provide a list of models via API
  // Return the known models from config
  return [
    { id: AI_CONFIG.gemini.models.nano, name: 'Gemini Nano', description: 'Fast, lightweight model for simple tasks' },
    { id: AI_CONFIG.gemini.models.flash, name: 'Gemini Flash', description: 'Fast, versatile model for most tasks' },
    { id: AI_CONFIG.gemini.models.pro, name: 'Gemini Pro', description: 'Most capable model for complex tasks' },
  ];
}

export default {
  getGeminiClient,
  resetGeminiClient,
  initializeGemini,
  isGeminiConfigured,
  getGeminiApiKey,
  getGeminiModel,
  chatWithGemini,
  streamChatWithGemini,
  generateTextWithGemini,
  analyzeDocumentWithGemini,
  generateDocumentWithGemini,
  translateWithGemini,
  analyzeWebsiteWithGemini,
  extractTextFromImageWithGemini,
  checkGeminiConnection,
  getGeminiUsage,
  getGeminiModels,
};
