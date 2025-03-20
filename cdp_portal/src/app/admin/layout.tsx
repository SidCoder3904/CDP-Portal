"use client";

import Navbar from "@/components/navbar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MainFooter from "@/components/main_footer";

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
    <>
      <Navbar
        menuItems={[
          { label: "Notifications", href: "/admin" },
          { label: "Placement Cycles", href: "/admin/placement_cycles" },
          { label: "Notices", href: "/admin/notice" },
          { label: "Reports", href: "/admin/report" },
        ]}
      />
      <main className="flex-grow max-w-7xl mx-auto w-full">{children}</main>
      <MainFooter />

    </>
  );
}
