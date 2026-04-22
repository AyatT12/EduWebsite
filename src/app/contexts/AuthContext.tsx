import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  status: string;
  teacherId?: number;
  studentId?: number;
  parentId?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState(() => {
  const saved = localStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
});
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/users');
      const users = await response.json();
      
      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (foundUser && foundUser.status === 'active') {
        const userData: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
          status: foundUser.status,
          teacherId: foundUser.teacherId,
          studentId: foundUser.studentId,
          parentId: foundUser.parentId,
        };
        setUser(userData);
       localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
