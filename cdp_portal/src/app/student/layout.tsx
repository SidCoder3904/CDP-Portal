"use client";

import Navbar from "@/components/navbar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";
import MainFooter from "@/components/main_footer";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        router.push("/student_login");
      } else if (user?.role !== "student") {
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
    <>
      <Navbar
        menuItems={[
          { label: "Notifications", href: "/student/" },
          { label: "My Profile", href: "/student/profile" },
          { label: "Job Openings", href: "/student/job_openings" },
          { label: "Notices", href: "/student/notices" },
        ]}
      />
      <main>{children}</main>
      <MainFooter />

    </>
  );
}
