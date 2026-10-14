import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { STORAGE_KEYS } from './constants';
import type { Database } from '@/types/supabase';

// Supabase database types
export interface Database {
  public: {
    Tables: {
      applicants: {
        Row: import('@/types').Applicant;
        Insert: Omit<import('@/types').Applicant, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<import('@/types').Applicant>;
      };
      employers: {
        Row: import('@/types').Employer;
        Insert: Omit<import('@/types').Employer, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<import('@/types').Employer>;
      };
      employees: {
        Row: import('@/types').Employee;
        Insert: Omit<import('@/types').Employee, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<import('@/types').Employee>;
      };
      partners: {
        Row: import('@/types').Partner;
        Insert: Omit<import('@/types').Partner, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<import('@/types').Partner>;
      };
      leads: {
        Row: import('@/types').Lead;
        Insert: Omit<import('@/types').Lead, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<import('@/types').Lead>;
      };
      visa_cases: {
        Row: import('@/types').VisaCase;
        Insert: Omit<import('@/types').VisaCase, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<import('@/types').VisaCase>;
      };
      approvals: {
        Row: import('@/types').Approval;
        Insert: Omit<import('@/types').Approval, 'id' | 'requestedAt' | 'approvedAt' | 'rejectedAt'>;
        Update: Partial<import('@/types').Approval>;
      };
      audit_logs: {
        Row: import('@/types').AuditLog;
        Insert: Omit<import('@/types').AuditLog, 'id' | 'timestamp'>;
        Update: Partial<import('@/types').AuditLog>;
      };
      users: {
        Row: import('@/types').User;
        Insert: Omit<import('@/types').User, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<import('@/types').User>;
      };
      clients: {
        Row: import('@/types').Client;
        Insert: Omit<import('@/types').Client, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<import('@/types').Client>;
      };
      notifications: {
        Row: import('@/types').Notification;
        Insert: Omit<import('@/types').Notification, 'id' | 'createdAt'>;
        Update: Partial<import('@/types').Notification>;
      };
      payments: {
        Row: import('@/types').Payment;
        Insert: Omit<import('@/types').Payment, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<import('@/types').Payment>;
      };
      documents: {
        Row: {
          id: string;
          name: string;
          type: string;
          case_id: string;
          applicant_id: string;
          employer_id: string | null;
          file_path: string;
          file_url: string;
          upload_date: string;
          verified: boolean;
          verification_notes: string | null;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Row']>;
      };
      ai_chat_sessions: {
        Row: import('@/types').AIChatSession;
        Insert: Omit<import('@/types').AIChatSession, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<import('@/types').AIChatSession>;
      };
      ai_chat_messages: {
        Row: import('@/types').AIChatMessage;
        Insert: Omit<import('@/types').AIChatMessage, 'id' | 'timestamp'>;
        Update: Partial<import('@/types').AIChatMessage>;
      };
      research_requests: {
        Row: import('@/types').ResearchRequest;
        Insert: Omit<import('@/types').ResearchRequest, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<import('@/types').ResearchRequest>;
      };
      app_settings: {
        Row: import('@/types').AppSettings;
        Insert: Omit<import('@/types').AppSettings, 'id'>;
        Update: Partial<import('@/types').AppSettings>;
      };
      user_settings: {
        Row: import('@/types').UserSettings;
        Insert: Omit<import('@/types').UserSettings, 'id'>;
        Update: Partial<import('@/types').UserSettings>;
      };
    };
  };
}

// Singleton Supabase client
let supabaseClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
    localStorage.getItem(`${STORAGE_KEYS.settings}_supabaseUrl`) ||
    '';
  
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem(`${STORAGE_KEYS.settings}_supabaseAnonKey`) ||
    '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key not configured. Using fallback.');
    // Return a mock client for development
    supabaseClient = createClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    );
    return supabaseClient;
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': `VisaMOTion/${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
      },
    },
  });

  return supabaseClient;
}

export function resetSupabaseClient(): void {
  supabaseClient = null;
}

// Initialize Supabase with custom keys
export function initializeSupabase(supabaseUrl: string, supabaseAnonKey: string): SupabaseClient<Database> {
  supabaseClient = null;
  localStorage.setItem(`${STORAGE_KEYS.settings}_supabaseUrl`, supabaseUrl);
  localStorage.setItem(`${STORAGE_KEYS.settings}_supabaseAnonKey`, supabaseAnonKey);
  return getSupabaseClient();
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
    localStorage.getItem(`${STORAGE_KEYS.settings}_supabaseUrl`) ||
    '';
  
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ||
    localStorage.getItem(`${STORAGE_KEYS.settings}_supabaseAnonKey`) ||
    '';

  return !!supabaseUrl && !!supabaseAnonKey;
}

// Get Supabase configuration for display
export function getSupabaseConfig(): { url: string; anonKey: string } {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || 
      localStorage.getItem(`${STORAGE_KEYS.settings}_supabaseUrl`) ||
      '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ||
      localStorage.getItem(`${STORAGE_KEYS.settings}_supabaseAnonKey`) ||
      '',
  };
}

export { createClient };
export type { SupabaseClient };
