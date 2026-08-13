import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, Business, Branch } from '../../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  currentBusiness: Business | null;
  currentBranch: Branch | null;
  isDbConnected: boolean | null;
  isLoadingAuth: boolean;
  setRole: (role: UserRole) => void;
  setCurrentBusiness: (biz: Business | null) => void;
  setCurrentBranch: (branch: Branch | null) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refetchBusinessData: () => Promise<void>;
  checkHealth: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('BUSINESS_OWNER');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tap_token'));
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const activeToken = token || localStorage.getItem('tap_token');
    const headers = new Headers(options.headers || {});
    if (activeToken) {
      headers.set('Authorization', `Bearer ${activeToken}`);
    }
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return fetch(url, { ...options, headers });
  }, [token]);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const json = await res.json();
      if (json.isDbConnected !== undefined) {
        setIsDbConnected(json.isDbConnected);
      } else if (res.ok) {
        setIsDbConnected(true);
      } else {
        setIsDbConnected(false);
      }
    } catch (e) {
      setIsDbConnected(false);
    }
  };

  const fetchBusinessData = useCallback(async () => {
    await checkHealth();
    try {
      const currentUserRole = user?.role || role;
      if (currentUserRole === 'BUSINESS_OWNER') {
        const userId = user?.id;
        const url = userId ? `/api/businesses?ownerId=${userId}` : '/api/businesses';
        const res = await fetchWithAuth(url);
        const json = await res.json();
        if (json.isDbConnected === false) {
          setIsDbConnected(false);
        }
        if (json.success && json.data && json.data.length > 0) {
          setCurrentBusiness(json.data[0]);
          const bRes = await fetchWithAuth(`/api/branches?businessId=${json.data[0].id}`);
          const bJson = await bRes.json();
          if (bJson.success && bJson.data && bJson.data.length > 0) {
            setCurrentBranch(bJson.data[0]);
          }
        }
      } else if (currentUserRole === 'AGENCY_ADMIN') {
        const bRes = await fetchWithAuth('/api/branches');
        const bJson = await bRes.json();
        if (bJson.isDbConnected === false) {
          setIsDbConnected(false);
        }
        if (bJson.success && bJson.data && bJson.data.length > 0) {
          setCurrentBranch(bJson.data[0]);
          const bizRes = await fetchWithAuth(`/api/businesses/${bJson.data[0].businessId}`);
          const bizJson = await bizRes.json();
          if (bizJson.success) {
            setCurrentBusiness(bizJson.data);
          }
        }
      }
    } catch (err) {
      console.error('Error loading business data:', err);
    }
  }, [fetchWithAuth, user, role]);

  // Load profile from token on boot
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('tap_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const json = await res.json();
          if (res.ok && json.success && json.data?.user) {
            setUser(json.data.user);
            setRole(json.data.user.role);
            setToken(storedToken);
          } else {
            // Invalid or expired token
            localStorage.removeItem('tap_token');
            setToken(null);
            setUser(null);
          }
        } catch (e) {
          console.error('Auth initialization error:', e);
        }
      }
      setIsLoadingAuth(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
  }, [user, fetchBusinessData]);

  const login = async (loginId: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: loginId.trim(), email: loginId.trim(), password: password ? password.trim() : undefined }),
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        const errorMsg = json.message || json.error || 'Authentication failed. Please verify credentials.';
        return { success: false, message: errorMsg };
      }

      if (json.data && json.data.accessToken && json.data.user) {
        const newJwt = json.data.accessToken;
        const loggedInUser = json.data.user;

        localStorage.setItem('tap_token', newJwt);
        setToken(newJwt);
        setUser(loggedInUser);
        setRole(loggedInUser.role);

        // Redirect based on database role
        if (loggedInUser.role === 'AGENCY_ADMIN') {
          navigate('/agency');
        } else {
          navigate('/business');
        }

        return { success: true };
      }
      return { success: false, message: 'Invalid response format from server.' };
    } catch (err: any) {
      console.error('Login exception:', err);
      return { success: false, message: 'Connection error. Unable to communicate with authentication server.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('tap_token');
    setToken(null);
    setUser(null);
    setCurrentBusiness(null);
    setCurrentBranch(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        currentBusiness,
        currentBranch,
        isDbConnected,
        isLoadingAuth,
        setRole,
        setCurrentBusiness,
        setCurrentBranch,
        login,
        logout,
        refetchBusinessData: fetchBusinessData,
        checkHealth,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

