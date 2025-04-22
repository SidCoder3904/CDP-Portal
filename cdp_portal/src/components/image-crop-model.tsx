"use client";

import { useState, useRef } from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

export function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    width: 200,
    height: 200,
    x: 0,
    y: 0,
  });
  const imageRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = (image: HTMLImageElement, crop: Crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Convert percentage values to pixels if needed
    const cropWidth = crop.unit === "%" ? (crop.width * image.width) / 100 : crop.width;
    const cropHeight = crop.unit === "%" ? (crop.height * image.height) / 100 : crop.height;
    const cropX = crop.unit === "%" ? (crop.x * image.width) / 100 : crop.x;
    const cropY = crop.unit === "%" ? (crop.y * image.height) / 100 : crop.y;

    // Set canvas dimensions to match the crop dimensions
    canvas.width = cropWidth * scaleX;
    canvas.height = cropHeight * scaleY;
    const ctx = canvas.getContext("2d");

    if (
      ctx &&
      cropWidth &&
      cropHeight &&
      cropX !== undefined &&
      cropY !== undefined
    ) {
      ctx.drawImage(
        image,
        cropX * scaleX,
        cropY * scaleY,
        cropWidth * scaleX,
        cropHeight * scaleY,
        0,
        0,
        cropWidth * scaleX,
        cropHeight * scaleY
      );
    }

    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        }
      }, "image/jpeg");
    });
  };

  const handleCropComplete = async () => {
    if (imageRef.current && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(imageRef.current, crop);
      onCropComplete(croppedImageUrl);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={1}
            circularCrop
          >
            <img
              ref={imageRef}
              src={imageSrc || "/placeholder.svg"}
              alt="Crop preview"
              className="max-h-[400px] w-full object-contain"
            />
          </ReactCrop>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCropComplete}>Save Crop</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
