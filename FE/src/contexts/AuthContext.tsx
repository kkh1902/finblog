'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest, 
  ApiError 
} from '@/lib/types';
import { 
  getUser, 
  getAuthTokens, 
  setUser as setUserInStorage, 
  setAuthTokens as setTokensInStorage,
  removeAuthTokens,
  removeUser,
  isAuthenticated as checkIsAuthenticated,
  initializeAuth,
  scheduleTokenRefresh,
  cancelTokenRefresh
} from '@/lib/auth';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Utilities
  checkAuthStatus: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuthState();
  }, []);

  const initializeAuthState = async () => {
    setIsLoading(true);
    
    try {
      const storedUser = getUser();
      const tokens = getAuthTokens();
      
      if (storedUser && tokens && checkIsAuthenticated()) {
        setUser(storedUser);
        setIsAuthenticated(true);
        
        // Initialize auth utilities
        initializeAuth();
        
        // Try to refresh user data from server
        try {
          await refreshUserFromServer();
        } catch (error) {
          // If refresh fails, keep stored user data but log the error
          console.warn('Failed to refresh user data:', error);
        }
      } else {
        // Clear any stale auth data
        await handleLogout(false);
      }
    } catch (error) {
      console.error('Error initializing auth state:', error);
      await handleLogout(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserFromServer = async (): Promise<void> => {
    try {
      const userData = await apiClient.getProfile();
      setUser(userData);
      setUserInStorage(userData);
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.login(credentials);
      
      // Store tokens and user data
      setTokensInStorage(response.tokens);
      setUserInStorage(response.user);
      
      // Update state
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Initialize auth utilities
      initializeAuth();
      
      toast.success(`Welcome back, ${response.user.username}!`);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.register(userData);
      
      // Store tokens and user data
      setTokensInStorage(response.tokens);
      setUserInStorage(response.user);
      
      // Update state
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Initialize auth utilities
      initializeAuth();
      
      toast.success(`Welcome to FinBoard, ${response.user.username}!`);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await handleLogout(true);
  };

  const handleLogout = async (showMessage: boolean = true): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Call API logout endpoint
      if (isAuthenticated) {
        try {
          await apiClient.logout();
        } catch (error) {
          // Log error but don't throw - we still want to clear local state
          console.warn('API logout failed:', error);
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local auth state
      removeAuthTokens();
      removeUser();
      cancelTokenRefresh();
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      if (showMessage) {
        toast.success('Logged out successfully');
      }
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('User is not authenticated');
    }
    
    try {
      await refreshUserFromServer();
    } catch (error) {
      const apiError = error as ApiError;
      
      if (apiError.status === 401) {
        // Token is invalid, logout user
        await handleLogout(false);
        toast.error('Your session has expired. Please log in again.');
      }
      
      throw error;
    }
  };

  const checkAuthStatus = (): boolean => {
    const authenticated = checkIsAuthenticated();
    
    if (authenticated !== isAuthenticated) {
      setIsAuthenticated(authenticated);
      
      if (!authenticated) {
        setUser(null);
        removeAuthTokens();
        removeUser();
        cancelTokenRefresh();
      }
    }
    
    return authenticated;
  };

  // Monitor auth token changes
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const contextValue: AuthContextType = {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Actions
    login,
    register,
    logout,
    refreshUser,
    
    // Utilities
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC for protecting routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        // Redirect to login page
        window.location.href = '/auth/login';
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return AuthenticatedComponent;
};

// HOC for guest-only routes (redirect if authenticated)
export const withGuest = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const GuestComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    useEffect(() => {
      if (!isLoading && isAuthenticated) {
        // Redirect to home page
        window.location.href = '/';
      }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (isAuthenticated) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };

  GuestComponent.displayName = `withGuest(${Component.displayName || Component.name})`;
  
  return GuestComponent;
};