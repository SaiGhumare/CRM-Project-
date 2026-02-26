import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Dr. Admin HOD',
    email: 'admin@sandip.edu',
    role: 'admin',
    department: 'CO',
  },
  {
    id: '2',
    name: 'Prof. Mentor',
    email: 'mentor@sandip.edu',
    role: 'mentor',
    department: 'CO',
  },
  {
    id: '3',
    name: 'Purva Santosh Deshmane',
    email: 'student@sandip.edu',
    role: 'student',
    enrollmentNumber: '23611780192',
    rollNumber: '01',
    department: 'CO',
  },
  {
    id: '4',
    name: 'ITR Coordinator',
    email: 'itr@sandip.edu',
    role: 'itr_coordinator',
    department: 'CO',
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = MOCK_USERS.find(u => u.email === email && u.role === role);
    
    if (mockUser || (email && password)) {
      const loggedInUser = mockUser || {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        role,
      };
      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      return true;
    }
    return false;
  }, []);

  const signup = useCallback(async (data: SignupData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role || 'student',
      enrollmentNumber: data.enrollmentNumber,
      rollNumber: data.rollNumber,
      department: data.department as any,
    };
    
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Password reset email sent to:', email);
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
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
