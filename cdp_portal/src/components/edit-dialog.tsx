"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditDialogProps {
  title: string
  fields: { name: string; label: string; type: string }[]
  onSave: (data: any) => void
  triggerButton: React.ReactNode
}

export function EditDialog({ title, fields, onSave, triggerButton }: EditDialogProps) {
  const [formData, setFormData] = useState({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    onSave(formData)
    setFormData({})
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {fields.map((field) => (
            <div key={field.name} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field.name} className="text-right">
                {field.label}
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                className="col-span-3"
                onChange={handleInputChange}
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSave}>Save changes</Button>
      </DialogContent>
    </Dialog>
  )
}

