import { getSupabaseClient, resetSupabaseClient } from './supabase';
import { getFromStorage, setToStorage, removeFromStorage, STORAGE_KEYS } from './utils';
import { ERROR_MESSAGES } from './constants';
import type { User, Client } from '@/types';

// Auth state types
export interface AuthState {
  user: User | null;
  client: Client | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Session types
export interface Session {
  user: User;
  client: Client | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Authentication provider
class AuthProvider {
  private static instance: AuthProvider;
  private state: AuthState;
  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    this.state = {
      user: null,
      client: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    };
    this.initialize();
  }

  public static getInstance(): AuthProvider {
    if (!AuthProvider.instance) {
      AuthProvider.instance = new AuthProvider();
    }
    return AuthProvider.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Check for existing session
      const session = this.getSessionFromStorage();
      
      if (session && session.expiresAt > Date.now()) {
        // Validate session
        const supabase = getSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user && !error) {
          // Fetch client data if available
          const { data: client } = await supabase
            .from('clients')
            .select('*')
            .eq('userId', user.id)
            .single();
          
          this.state = {
            user: this.convertSupabaseUser(user),
            client: client || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          };
        } else {
          this.clearSession();
          this.state = {
            user: null,
            client: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          };
        }
      } else {
        this.clearSession();
        this.state = {
          user: null,
          client: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        };
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.state = {
        user: null,
        client: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      };
    } finally {
      this.notifyListeners();
    }
  }

  private convertSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      passwordHash: '',
      firstName: supabaseUser.user_metadata?.firstName || '',
      lastName: supabaseUser.user_metadata?.lastName || '',
      role: supabaseUser.user_metadata?.role || 'client',
      permissions: supabaseUser.user_metadata?.permissions || [],
      lastLogin: supabaseUser.last_sign_in_at || undefined,
      loginCount: supabaseUser.loginCount || 0,
      isActive: true,
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      updatedAt: supabaseUser.updated_at || new Date().toISOString(),
    };
  }

  private getSessionFromStorage(): Session | null {
    const sessionStr = getFromStorage<string>(STORAGE_KEYS.token);
    if (!sessionStr) return null;
    
    try {
      const session: Session = JSON.parse(sessionStr);
      return session;
    } catch {
      return null;
    }
  }

  private saveSessionToStorage(session: Session): void {
    setToStorage(STORAGE_KEYS.token, JSON.stringify(session));
  }

  private clearSession(): void {
    removeFromStorage(STORAGE_KEYS.token);
    removeFromStorage(STORAGE_KEYS.user);
    resetSupabaseClient();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Public methods

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getState(): AuthState {
    return this.state;
  }

  // Login with email and password
  public async login(email: string, password: string): Promise<void> {
    this.state = { ...this.state, isLoading: true, error: null };
    this.notifyListeners();

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      // Fetch client data
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('userId', data.user.id)
        .single();

      const session: Session = {
        user: this.convertSupabaseUser(data.user),
        client: client || null,
        accessToken: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || '',
        expiresAt: data.session?.expires_at ? new Date(data.session.expires_at).getTime() : Date.now() + 3600000,
      };

      this.saveSessionToStorage(session);
      this.state = {
        user: session.user,
        client: session.client,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
      this.notifyListeners();
    } catch (error: any) {
      this.state = {
        ...this.state,
        isLoading: false,
        error: error.message || 'Login failed',
      };
      this.notifyListeners();
      throw error;
    }
  }

  // Login as client with reference number (for client portal)
  public async loginWithReferenceNumber(referenceNumber: string): Promise<{ user: User | null; client: Client | null; }> {
    this.state = { ...this.state, isLoading: true, error: null };
    this.notifyListeners();

    try {
      const supabase = getSupabaseClient();
      
      // Look up client by reference number
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*, users(*)')
        .eq('referenceNumber', referenceNumber)
        .single();

      if (clientError || !client) {
        throw new Error('Client not found');
      }

      // Create a mock user for client portal access
      const user: User = {
        id: client.userId,
        email: client.users?.email || `client_${referenceNumber}@visamotion.ai`,
        passwordHash: '',
        firstName: client.users?.firstName || 'Client',
        lastName: client.users?.lastName || '',
        role: 'client',
        permissions: ['read-own', 'view-own-cases'],
        lastLogin: new Date().toISOString(),
        loginCount: (client.users?.loginCount || 0) + 1,
        isActive: true,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      };

      const session: Session = {
        user,
        client,
        accessToken: 'client_token',
        refreshToken: '',
        expiresAt: Date.now() + 86400000, // 24 hours
      };

      this.saveSessionToStorage(session);
      this.state = {
        user,
        client,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
      this.notifyListeners();

      return { user, client };
    } catch (error: any) {
      this.state = {
        ...this.state,
        isLoading: false,
        error: error.message || 'Login failed',
      };
      this.notifyListeners();
      throw error;
    }
  }

  // Register new user
  public async register(email: string, password: string, firstName: string, lastName: string, role: 'admin' | 'manager' | 'agent' | 'client' = 'client'): Promise<void> {
    this.state = { ...this.state, isLoading: true, error: null };
    this.notifyListeners();

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            role,
            permissions: this.getDefaultPermissions(role),
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user returned from registration');
      }

      // Create client record if role is client
      if (role === 'client') {
        const referenceNumber = `VISA-CLIENT-${Date.now().toString().slice(-6)}`;
        await supabase.from('clients').insert({
          userId: data.user.id,
          referenceNumber,
          cases: [],
          documents: [],
          canAccessAllCases: false,
          restrictedToOwnCases: true,
        });
      }

      // Auto-login after registration
      await this.login(email, password);
    } catch (error: any) {
      this.state = {
        ...this.state,
        isLoading: false,
        error: error.message || 'Registration failed',
      };
      this.notifyListeners();
      throw error;
    }
  }

  private getDefaultPermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      admin: ['create', 'read', 'update', 'delete', 'approve', 'manage-users', 'manage-settings', 'view-audit'],
      manager: ['create', 'read', 'update', 'delete', 'approve', 'manage-users', 'view-reports'],
      agent: ['create', 'read', 'update', 'view-own'],
      client: ['read-own', 'view-own-cases'],
    };
    return permissions[role] || [];
  }

  // Logout
  public async logout(): Promise<void> {
    this.state = { ...this.state, isLoading: true, error: null };
    this.notifyListeners();

    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      this.clearSession();
      
      this.state = {
        user: null,
        client: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
      this.notifyListeners();
    } catch (error: any) {
      this.clearSession();
      this.state = {
        user: null,
        client: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Logout failed',
      };
      this.notifyListeners();
    }
  }

  // Reset password
  public async resetPassword(email: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Check if user has permission
  public hasPermission(permission: string): boolean {
    if (!this.state.isAuthenticated) return false;
    if (this.state.user?.role === 'admin') return true;
    return this.state.user?.permissions?.includes(permission) || false;
  }

  // Check if user can access a specific resource
  public canAccessResource(resourceType: string, resourceUserId?: string): boolean {
    if (!this.state.isAuthenticated) return false;
    
    // Admins can access everything
    if (this.state.user?.role === 'admin') return true;
    
    // Clients can only access their own resources
    if (this.state.user?.role === 'client') {
      if (this.state.client?.restrictedToOwnCases) {
        return resourceUserId === this.state.user?.id;
      }
      return this.state.client?.canAccessAllCases || false;
    }
    
    // Managers and agents can access resources in their scope
    return true;
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.state.user;
  }

  // Get current client
  public getCurrentClient(): Client | null {
    return this.state.client;
  }

  // Get access token
  public getAccessToken(): string | null {
    const session = this.getSessionFromStorage();
    return session?.accessToken || null;
  }
}

// Singleton instance
export const auth = AuthProvider.getInstance();

// Hook for React components
export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<void>;
  loginWithReferenceNumber: (referenceNumber: string) => Promise<{ user: User | null; client: Client | null; }>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: 'admin' | 'manager' | 'agent' | 'client') => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canAccessResource: (resourceType: string, resourceUserId?: string) => boolean;
  getCurrentUser: () => User | null;
  getCurrentClient: () => Client | null;
  getAccessToken: () => string | null;
} {
  const state = auth.getState();
  
  return {
    ...state,
    login: auth.login.bind(auth),
    loginWithReferenceNumber: auth.loginWithReferenceNumber.bind(auth),
    register: auth.register.bind(auth),
    logout: auth.logout.bind(auth),
    resetPassword: auth.resetPassword.bind(auth),
    hasPermission: auth.hasPermission.bind(auth),
    canAccessResource: auth.canAccessResource.bind(auth),
    getCurrentUser: auth.getCurrentUser.bind(auth),
    getCurrentClient: auth.getCurrentClient.bind(auth),
    getAccessToken: auth.getAccessToken.bind(auth),
  };
}

// Provider component for React
export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProviderComponent({ children }: AuthProviderProps): React.ReactElement {
  const [state, setState] = React.useState(auth.getState());

  React.useEffect(() => {
    const unsubscribe = auth.subscribe(setState);
    return () => unsubscribe();
  }, []);

  return React.createElement(
    React.createContext<AuthState>(state).Provider,
    { value: state },
    children
  );
}
