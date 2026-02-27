import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { apiPost, apiGet, setToken, removeToken } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  enrollmentNumber?: string;
  rollNumber?: string;
  department?: string;
  role?: UserRole;
}

// Backend response types
interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    enrollmentNumber?: string;
    rollNumber?: string;
    division?: string;
    avatarUrl?: string;
  };
}

interface MeResponse {
  success: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    department?: string;
    enrollmentNumber?: string;
    rollNumber?: string;
    division?: string;
    avatarUrl?: string;
    groupId?: unknown;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map backend user to frontend User type
function mapUser(backendUser: AuthResponse['user']): User {
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    role: backendUser.role,
    department: backendUser.department as User['department'],
    enrollmentNumber: backendUser.enrollmentNumber,
    rollNumber: backendUser.rollNumber,
    avatarUrl: backendUser.avatarUrl,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check if we have a stored token and restore the session
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiGet<MeResponse>('/auth/me');
        if (data.success && data.user) {
          setUser({
            id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            department: data.user.department as User['department'],
            enrollmentNumber: data.user.enrollmentNumber,
            rollNumber: data.user.rollNumber,
            avatarUrl: data.user.avatarUrl,
          });
        }
      } catch (error) {
        console.error('Session restore failed:', error);
        removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const data = await apiPost<AuthResponse>('/auth/login', { email, password, role });

      if (data.success && data.token) {
        setToken(data.token);
        setUser(mapUser(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const signup = useCallback(async (data: SignupData): Promise<boolean> => {
    try {
      const response = await apiPost<AuthResponse>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'student',
        enrollmentNumber: data.enrollmentNumber,
        rollNumber: data.rollNumber,
        department: data.department,
      });

      if (response.success && response.token) {
        setToken(response.token);
        setUser(mapUser(response.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeToken();
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      await apiPost('/auth/forgot-password', { email });
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
