import { useAuth } from "@/context/auth-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function useApi() {
  const { token, logout } = useAuth();
  
  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const headers: Record<string, string> = {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
      };

      // Only set Content-Type if it's not FormData
      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      
      if (response.status === 401) {
        logout();
        throw new Error("Your session has expired. Please log in again.");
      }
      
      return response;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  };
  
  return { fetchWithAuth };
} 



