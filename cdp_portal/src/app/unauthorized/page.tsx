"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg text-center mb-8 max-w-md">
        You don't have permission to access this page. Please contact an administrator if you believe this is an error.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => router.push("/")}>
          Go to Home
        </Button>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
} 