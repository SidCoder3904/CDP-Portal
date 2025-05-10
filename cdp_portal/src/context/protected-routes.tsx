"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Icons } from "@/components/icons";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {

        
        // Determine which login page to redirect to based on the current path
        if (pathname.startsWith("/admin")) {
          router.push("/admin_login");
        } else {
          router.push("/student_login");
        }
      } 
      // If role-based access control is enabled
      else if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        // Redirect to unauthorized page
        router.push("/unauthorized");
      }
    }
  }, [isAuthenticated, isLoading, router, user, allowedRoles, pathname]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // If authenticated and authorized, render children
  if (isAuthenticated && (!allowedRoles.length || (user && allowedRoles.includes(user.role)))) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}