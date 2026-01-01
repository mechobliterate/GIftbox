import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Upload, X } from "lucide-react";

interface PhotoUploaderProps {
  onClose: () => void;
  onPhotoAdd: (photoUrl: string) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onClose,
  onPhotoAdd,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onPhotoAdd(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsVideoReady(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && isVideoReady) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photoUrl = canvas.toDataURL("image/jpeg", 0.95);
        stopCamera();
        onPhotoAdd(photoUrl);
      }
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add a photo</DialogTitle>
        </DialogHeader>

        {!isCameraActive ? (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="light"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col gap-2 h-auto py-6 rounded-xl"
              >
                <Upload className="h-8 w-8 text-stone-400" />
                <span className="text-sm">Choose file</span>
              </Button>
              <Button
                variant="light"
                onClick={startCamera}
                className="flex flex-col gap-2 h-auto py-6 rounded-xl"
              >
                <Camera className="h-8 w-8 text-stone-400" />
                <span className="text-sm">Take photo</span>
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={() => setIsVideoReady(true)}
                className="w-full h-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
              {!isVideoReady && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <p>Loading camera...</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={capturePhoto}
                className="flex-1"
                disabled={!isVideoReady}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
