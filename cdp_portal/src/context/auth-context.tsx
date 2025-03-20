"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  requestOtp: (email: string, password: string) => Promise<string>;
  loginWithOtp: (userId: string, otp: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Simple function to decode JWT without external dependencies
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Use synchronous localStorage access to prevent hydration issues
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem("access_token");
          const storedUser = localStorage.getItem("user");
          
          console.log("Initializing auth state:", { 
            hasToken: !!storedToken, 
            hasUser: !!storedUser 
          });
          
          if (storedToken && storedUser) {
            // Verify token hasn't expired
            const decodedToken = parseJwt(storedToken);
            const currentTime = Date.now() / 1000;
            
            if (decodedToken && decodedToken.exp && decodedToken.exp > currentTime) {
              console.log("Valid token found, setting auth state");
              setToken(storedToken);
              setUser(JSON.parse(storedUser));
            } else {
              console.log("Token expired, attempting refresh");
              refreshToken();
            }
          } else {
            console.log("No stored auth data found");
            setToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.error("Failed to initialize auth:", e);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initialize auth state
    initializeAuth();
    
    // Add event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "user") {
        console.log("Storage changed, reinitializing auth");
        initializeAuth();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const clearAuthData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
    setToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const refreshToken = localStorage.getItem("refresh_token");
      
      if (!refreshToken) {
        clearAuthData();
        return;
      }
      
      console.log("Attempting to refresh token");
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Token refreshed successfully");
        localStorage.setItem("access_token", data.access_token);
        setToken(data.access_token);
      } else {
        console.log("Token refresh failed");
        clearAuthData();
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      clearAuthData();
    }
  };

  // Request OTP function
  const requestOtp = async (email: string, password: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(errorData.message || `Failed to request OTP: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.user_id; // Return user_id for the OTP login step
    } catch (error) {
      console.error("OTP request error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Login with OTP function
  const loginWithOtp = async (userId: string, otp: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login-with-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, otp }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "OTP verification failed");
      }
      
      const data = await response.json();
      
      console.log("Login successful, storing auth data");
      
      // Store tokens and user data
      if (typeof window !== 'undefined') {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      
      setToken(data.access_token);
      setUser(data.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if token exists
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and state regardless of API success
      clearAuthData();
      router.push("/");
    }
  };

  // Check token expiration and refresh if needed
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiration = async () => {
      try {
        if (!token) return;
        
        // Decode JWT to check expiration
        const decodedToken = parseJwt(token);
        if (!decodedToken) {
          console.log("Invalid token format");
          clearAuthData();
          return;
        }
        
        const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        
        // If token is about to expire (less than 5 minutes remaining)
        if (expirationTime - currentTime < 5 * 60 * 1000) {
          console.log("Token about to expire, refreshing");
          await refreshToken();
        }
      } catch (error) {
        console.error("Token validation error:", error);
        clearAuthData();
      }
    };

    // Check token expiration every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000);
    
    // Initial check
    checkTokenExpiration();
    
    return () => clearInterval(interval);
  }, [token]);

  // Debug output for authentication state
  useEffect(() => {
    console.log("Auth state updated:", { 
      isAuthenticated: !!token,
      hasUser: !!user,
      isLoading
    });
  }, [token, user, isLoading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        requestOtp,
        loginWithOtp,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


