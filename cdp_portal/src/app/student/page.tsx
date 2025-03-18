import { Separator } from "@/components/ui/separator"
import { NoticeList } from "@/components/notice_list"
import { CommentSection } from "@/components/comment_section"

export default function NoticePage() {
  return (
    <div className="min-h-screen bg-white">

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold text-template mb-4">Latest Notifications</h2>
            <Separator className="mb-6" />
            <NoticeList />
          </div>
          <div className="space-y-6">
            <CommentSection />
          </div>
        </div>
      </main>
    </div>
  )
}

