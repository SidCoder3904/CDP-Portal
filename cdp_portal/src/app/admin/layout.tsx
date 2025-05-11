"use client";

import Navbar from "@/components/navbar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoginFooter from "@/components/login_footer";
import { Icons } from "@/components/icons";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        router.push("/admin_login");
      } else if (user?.role !== "admin") {
        console.log("Not a student, redirecting to unauthorized");
        router.push("/unauthorized");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [isAuthenticated, user, router, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        menuItems={[
          { label: "Notifications", href: "/admin" },
          { label: "Placement Cycles", href: "/admin/placement_cycles" },
          { label: "Notices", href: "/admin/notice" },
          { label: "Reports", href: "/admin/report" },
          { label: "Verification", href: "/admin/verification" },
        ]}
      />
      <main className="flex-grow max-w-7xl mx-auto w-full">{children}</main>
      <LoginFooter />
    </div>
  );
}
