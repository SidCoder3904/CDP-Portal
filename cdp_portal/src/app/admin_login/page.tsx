"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Icons } from "@/components/icons"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-template rounded-full mx-auto mb-4 flex items-center justify-center">
              <Icons.shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
            <p className="text-gray-600 mt-2">Access your admin dashboard</p>
          </div>

          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Admin Login</CardTitle>
              <CardDescription>Sign in with your admin email address</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="admin@iitrpr.ac.in"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-template hover:bg-template/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Continue with Email
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-gray-500 w-full">or</div>
              <Button variant="outline" className="w-full border-gray-200 hover:bg-gray-50" disabled={isLoading}>
                <Icons.google className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
            </CardFooter>
          </Card>

          <div className="text-center space-y-2">
            <a href="#" className="text-gray-600 hover:text-template text-sm block">
              Need help signing in?
            </a>
          </div>
        </div>
      </main>

      <footer className="w-full bg-template py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-white text-sm">
          Career Development and Placement Cell, IIT Ropar
        </div>
      </footer>
    </div>
  )
}
