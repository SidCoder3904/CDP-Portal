"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { z, ZodIssue } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ValidationErrors = Record<string, string | undefined>;

interface Field {
  name: string;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
}

interface EditDialogProps {
  title: string;
  description?: string;
  fields: Field[];
  initialData?: Record<string, any>;
  onSaveValidated: (data: any) => void;
  triggerButton: React.ReactNode;
  zodSchema?: z.ZodObject<any, any>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditDialog({
  title,
  description,
  fields,
  initialData = {},
  onSaveValidated,
  triggerButton,
  zodSchema,
  isOpen,
  onOpenChange,
}: EditDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isControlled = isOpen !== undefined && onOpenChange !== undefined;
  const currentOpen = isControlled ? isOpen : isDialogOpen;

  // Only run this effect when dialog opens or initialData changes
  // Store initialData in a ref to prevent unnecessary re-renders
  useEffect(() => {
    if (currentOpen) {
      // Use functional updates to avoid dependency on previous state
      setFormData(() => ({...initialData}));
      setValidationErrors(() => ({}));
    }
  }, [currentOpen, JSON.stringify(initialData)]);

  const handleOpenChange = (open: boolean) => {
    if (isControlled) {
      onOpenChange(open);
    } else {
      setIsDialogOpen(open);
    }
    
    // Only reset form when dialog is closing
    if (!open) {
      // Use timeout to ensure state updates don't conflict
      setTimeout(() => {
        setFormData({...initialData});
        setValidationErrors({});
      }, 0);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Only clear validation error if it exists
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = () => {
    if (zodSchema) {
      const result = zodSchema.safeParse(formData);
      if (!result.success) {
        const errors: ValidationErrors = {};
        result.error.issues.forEach((issue: ZodIssue) => {
          const key = issue.path[0] as string;
          errors[key] = issue.message;
        });
        setValidationErrors(errors);
        return;
      }
      onSaveValidated(result.data);
    } else {
      onSaveValidated(formData);
    }
    handleOpenChange(false);
  };

  const renderInput = (field: Field) => {
    const error = validationErrors[field.name];
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || "",
      onChange: handleInputChange,
      placeholder: field.placeholder,
      className: cn("col-span-3", error ? "border-red-500" : ""),
    };

    if (field.type === "select") {
      return (
        <select {...commonProps} className={cn(commonProps.className, "border p-2 rounded")}>
          <option value="" disabled>{field.placeholder || `Select ${field.label}`}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    } else {
      return <Input {...commonProps} type={field.type} />;
    }
  };

  return (
    <Dialog open={currentOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {fields.map((field) => (
            <div key={field.name} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field.name} className="text-right">
                {field.label}
              </Label>
              <div className="col-span-3 flex flex-col">
                {renderInput(field)}
                {validationErrors[field.name] && (
                  <p className="text-xs text-red-500 mt-1">
                    {validationErrors[field.name]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}