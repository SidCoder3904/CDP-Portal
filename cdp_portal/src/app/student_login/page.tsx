"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useAuth } from "@/context/auth-context";

// Regex pattern for iitrpr.ac.in email validation
const IITRPR_EMAIL_REGEX = /^[a-zA-Z0-9_]+@iitrpr\.ac\.in$/;

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState("");

  const router = useRouter();
  const { requestOtp, loginWithOtp, isLoading } = useAuth();

  useEffect(() => {
    if (email && !IITRPR_EMAIL_REGEX.test(email)) {
      setError("Please use a valid IIT Ropar student email (abc@iitrpr.ac.in)");
    } else {
      setError("");
    }
  }, [email]);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!IITRPR_EMAIL_REGEX.test(email)) return;
    
    setError("");
    setSuccess("");

    try {
      const userId = await requestOtp(email);
      setSuccess("OTP sent to your email!");
      setUserId(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    }
  }

  async function handleLoginWithOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await loginWithOtp(userId, otp);
      setSuccess("Logged in successfully!");
      
      // Get redirect path or default to student dashboard
      const redirectPath = "/student";   
      setTimeout(() => router.push(redirectPath), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login with OTP");
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-template rounded-full mx-auto mb-4 flex items-center justify-center">
              <Icons.shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Student Portal</h2>
            <p className="text-gray-600 mt-2">Access your Student dashboard</p>
          </div>
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Student Login</CardTitle>
              <CardDescription>
                Sign in with your student email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!userId ? (
                // Step 1: Request OTP form
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      placeholder="student@iitrpr.ac.in"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                      pattern="[a-zA-Z0-9_]+@iitrpr\.ac\.in"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && (
                      <p className="text-green-500 text-sm">{success}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-template hover:bg-template/90 text-white"
                    disabled={isLoading || !!error}
                  >
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Request OTP
                  </Button>
                </form>
              ) : (
                // Step 2: Enter OTP form
                <form onSubmit={handleLoginWithOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-gray-700">
                      OTP
                    </Label>
                    <Input
                      id="otp"
                      placeholder="Enter OTP"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && (
                      <p className="text-green-500 text-sm">{success}</p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      type="submit"
                      className="w-full bg-template hover:bg-template/90 text-white"
                      disabled={isLoading || !!error}
                    >
                      {isLoading && (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Login with OTP
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setUserId("")}
                    >
                      Back
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
