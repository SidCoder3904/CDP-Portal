"use client";

import Navbar from "@/components/navbar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginFooter from "@/components/login_footer";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin_login");
    } else if (user?.role !== "admin") {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, user, router]);

  return (
    // <div className="min-h-screen flex flex-col">
      
    //   <main className="flex-grow max-w-7xl mx-auto w-full">{children}</main>
    //   <div className="mb-0"><LoginFooter /></div>

    // </>
    <div className="min-h-screen flex flex-col">
      <Navbar
        menuItems={[
          { label: "Notifications", href: "/admin" },
          { label: "Placement Cycles", href: "/admin/placement_cycles" },
          { label: "Notices", href: "/admin/notice" },
          { label: "Reports", href: "/admin/report" },
          { label: "Verification", href: "/admin/verification" }
        ]}
      />
      <main className="flex-grow max-w-7xl mx-auto w-full">{children}</main>
      <LoginFooter />
    </div>
  );
}
