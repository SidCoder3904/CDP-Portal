"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";

// Regex pattern for iitrpr.ac.in email validation
const IITRPR_EMAIL_REGEX = /^[a-zA-Z0-9_]+@iitrpr\.ac\.in$/;

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState("");

  const router = useRouter(); // Initialize the router

  const backendUrl =
    process.env.NEXT_PUBLIC_NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (email && !IITRPR_EMAIL_REGEX.test(email)) {
      setError("Please use a valid IIT Ropar student email (abc@iitrpr.ac.in)");
    } else {
      setError("");
    }
  }, [email]);

  async function requestOtp() {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${backendUrl}/api/auth/request-otp`, {
        email: email,
        password: password,
      });

      if (response.status === 200) {
        setSuccess("OTP sent to your email!");
        setUserId(response.data.user_id);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as any)?.response?.data?.message || "Failed to send OTP";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithOtp() {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${backendUrl}/api/auth/login-with-otp`,
        {
          user_id: userId,
          otp: otp,
        }
      );

      if (response.status === 200) {
        setSuccess("Logged in successfully!");
        setTimeout(() => router.push("/student"), 1500); // Redirect to /student
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as any)?.response?.data?.message || "Failed to login with OTP";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!IITRPR_EMAIL_REGEX.test(email)) return;

    if (!userId) {
      requestOtp();
    } else {
      loginWithOtp();
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
              <form onSubmit={onSubmit} className="space-y-4">
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
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                  {userId && (
                    <>
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
                    </>
                  )}
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
                  {userId ? "Login with OTP" : "Request OTP"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
