import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, Business, Branch } from '../../types';
import { encodePasswordPayload } from '../utils/security';

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

  const doRefresh = useCallback(async (): Promise<string | null> => {
    const storedRefreshToken = localStorage.getItem('tap_refresh_token');
    if (!storedRefreshToken) return null;
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data?.accessToken) {
        const newAccToken = json.data.accessToken;
        localStorage.setItem('tap_token', newAccToken);
        setToken(newAccToken);
        if (json.data.refreshToken) {
          localStorage.setItem('tap_refresh_token', json.data.refreshToken);
        }
        return newAccToken;
      }
    } catch (e) {
      console.error('Silent refresh failed:', e);
    }
    localStorage.removeItem('tap_token');
    localStorage.removeItem('tap_refresh_token');
    setToken(null);
    setUser(null);
    return null;
  }, []);

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    let activeToken = token || localStorage.getItem('tap_token');
    const headers = new Headers(options.headers || {});
    if (activeToken) {
      headers.set('Authorization', `Bearer ${activeToken}`);
    }
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    let res = await fetch(url, { ...options, headers });

    // Handle token expiration / 401 with automatic silent refresh
    if (res.status === 401) {
      const newToken = await doRefresh();
      if (newToken) {
        const retryHeaders = new Headers(options.headers || {});
        retryHeaders.set('Authorization', `Bearer ${newToken}`);
        if (options.body && !(options.body instanceof FormData) && !retryHeaders.has('Content-Type')) {
          retryHeaders.set('Content-Type', 'application/json');
        }
        res = await fetch(url, { ...options, headers: retryHeaders });
      }
    }

    return res;
  }, [token, doRefresh]);

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
      let storedToken = localStorage.getItem('tap_token');
      if (!storedToken) {
        storedToken = await doRefresh();
      }

      if (storedToken) {
        try {
          let res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (res.status === 401) {
            const refreshedToken = await doRefresh();
            if (refreshedToken) {
              res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${refreshedToken}` },
              });
            }
          }

          const json = await res.json();
          if (res.ok && json.success && json.data?.user) {
            setUser(json.data.user);
            setRole(json.data.user.role);
            setToken(storedToken);
          } else {
            localStorage.removeItem('tap_token');
            localStorage.removeItem('tap_refresh_token');
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
  }, [doRefresh]);

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
  }, [user, fetchBusinessData]);

  const login = async (loginId: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const encodedPassword = encodePasswordPayload(password);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: loginId.trim(), email: loginId.trim(), password: encodedPassword }),
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        const errorMsg = json.message || json.error || 'Authentication failed. Please verify credentials.';
        return { success: false, message: errorMsg };
      }

      if (json.data && json.data.accessToken && json.data.user) {
        const newJwt = json.data.accessToken;
        const refreshTokenVal = json.data.refreshToken;
        const loggedInUser = json.data.user;

        localStorage.setItem('tap_token', newJwt);
        if (refreshTokenVal) {
          localStorage.setItem('tap_refresh_token', refreshTokenVal);
        }
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

  const logout = async () => {
    const activeToken = token || localStorage.getItem('tap_token');
    const storedRefreshToken = localStorage.getItem('tap_refresh_token');

    try {
      if (activeToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify({ refreshToken: storedRefreshToken || undefined }),
        });
      }
    } catch (e) {
      console.error('Server logout call error:', e);
    }

    localStorage.removeItem('tap_token');
    localStorage.removeItem('tap_refresh_token');
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

