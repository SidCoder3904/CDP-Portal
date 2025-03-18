"use client"

import { toast } from "sonner";

interface LoginCredentials {
  email: string;
  password: string;
}

// After successful login
const handleLogin = async (credentials: LoginCredentials) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (response.ok) {
      // Store the token in a cookie with proper settings
      document.cookie = `jwt_token=${data.token}; path=/; secure; samesite=strict; max-age=86400`; // 24 hours
      // Handle successful login
      window.location.href = '/admin/notice'; // Redirect to notices page
    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error(error instanceof Error ? error.message : 'Login failed');
  }
};