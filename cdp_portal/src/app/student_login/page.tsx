"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get backend URL from environment variables
  const backendUrl =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (email && !IITRPR_EMAIL_REGEX.test(email)) {
      setError("Please use a valid IIT Ropar student email (abc@iitrpr.ac.in)");
    } else {
      setError("");
    }
  }, [email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!IITRPR_EMAIL_REGEX.test(email)) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${backendUrl}/api/auth/request-otp`, {
        email: email,
        password: "your-password-here", // Update with actual password field
      });

      if (response.status === 200) {
        setSuccess("OTP sent to your email!");
        // Here you would typically redirect to OTP verification
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* ... existing header code ... */}

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
                  Continue with Email
                </Button>
              </form>
            </CardContent>
            {/* ... existing footer code ... */}
          </Card>
        </div>
      </main>
      {/* ... existing footer code ... */}
    </div>
  );
}
