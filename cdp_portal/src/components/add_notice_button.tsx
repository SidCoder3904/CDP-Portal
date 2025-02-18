"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreateNoticeForm } from "@/components/create_notice_form"

export function AddNoticeButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#002147] hover:bg-[#003167]">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Notice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Notice</DialogTitle>
        </DialogHeader>
        <CreateNoticeForm onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

