"use client"
import { Separator } from "@/components/ui/separator"
import { NoticeListAdmin } from "@/components/notice_list_admin"
import { CommentSectionAdmin } from "@/components/comment_section_admin"
import { AddNoticeButton } from "@/components/add_notice_button"
import { PlacementCyclesList } from "@/components/placement_cycles_list"
import { JobFloatForm } from "@/components/job_float_form"

export default function AdminNoticePage() {
  return (
    <div className="min-h-screen bg-white">

<main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#002147]">Placement Cycles</h2>
              <AddNoticeButton />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#002147] mb-4">Recent Notices</h2>
              <NoticeListAdmin />
              {/* <JobFloatForm onSuccess={() => {}} /> */}
            </div>
          </div>
          <div>
            <CommentSectionAdmin />
          </div>
        </div>
      </main>
    </div>
  )
}

