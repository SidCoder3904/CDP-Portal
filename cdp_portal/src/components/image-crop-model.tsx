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
  onCropComplete: (croppedImageBlob: Blob) => void;
}

export function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    width: 150,
    height: 150,
    x: 50,
    y: 50,
  });
  const imageRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const { width: displayedWidth, height: displayedHeight } = img;
    const { naturalWidth, naturalHeight } = img;

    let initialCropPx = Math.min(displayedWidth, displayedHeight) * 0.5;

    if (naturalWidth < initialCropPx * (naturalWidth / displayedWidth) || naturalHeight < initialCropPx * (naturalHeight/displayedHeight) ) {
        initialCropPx = Math.min(naturalWidth * (displayedWidth / naturalWidth) , naturalHeight * (displayedHeight / naturalHeight) );
    }

    setCrop({
      unit: "px",
      width: initialCropPx,
      height: initialCropPx,
      x: (displayedWidth - initialCropPx) / 2,
      y: (displayedHeight - initialCropPx) / 2,
    });
  };

  const handleCropComplete = () => {
    if (!imageRef.current || !crop.width || !crop.height) {
      console.error("Image ref or crop dimensions are missing.");
      return;
    }

    const image = imageRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Failed to get 2D context");
      return;
    }

    const { naturalWidth, naturalHeight } = image;
    const { width: displayedWidth, height: displayedHeight } = image;

    if (displayedWidth === 0 || displayedHeight === 0 || naturalWidth === 0 || naturalHeight === 0) {
        console.error("Image dimensions are zero. Cannot crop.");
        return;
    }

    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;

    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;

    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    
    console.log("Crop (px, relative to displayed):", crop);
    console.log("Displayed Size (px):", { displayedWidth, displayedHeight });
    console.log("Natural Size (px):", { naturalWidth, naturalHeight });
    console.log("Scale Factors:", { scaleX, scaleY });
    console.log("Source Rect (px, relative to natural):", { sourceX, sourceY, sourceWidth, sourceHeight });

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth, 
      sourceHeight
    );

    // Clip the canvas to a circle
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over'; // Restore default composite operation

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Canvas to Blob failed.");
        return;
      }
      onCropComplete(blob);
      onClose();
    }, "image/png", 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ReactCrop
            crop={crop}
            onChange={(pixelCrop, percentCrop) => setCrop(pixelCrop)}
            aspect={1}
            circularCrop={true}
          >
            <img
              ref={imageRef}
              src={imageSrc || "/placeholder.svg"}
              alt="Crop preview"
              className="max-h-[500px] w-full object-contain"
              onLoad={onImageLoad}
              crossOrigin="anonymous"
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
