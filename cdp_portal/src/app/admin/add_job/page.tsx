"use client"
import { JobFloatForm } from "@/components/job_float_form"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-white">
   

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <JobFloatForm onSuccess={() => {}} />
          </div>
        </div>
      </main>
    </div>
  )
}

