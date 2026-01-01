"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Square, X, Play, Pause } from "lucide-react";

interface VideoRecorderProps {
  onClose: () => void;
  onVideoAdd: (videoBlob: Blob) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onClose,
  onVideoAdd,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraReady(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp8,opus",
    });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideo(videoUrl);
      stopCamera();
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!previewRef.current) return;

    if (isPlaying) {
      previewRef.current.pause();
      setIsPlaying(false);
    } else {
      previewRef.current.play();
      setIsPlaying(true);
    }
  };

  const retake = () => {
    setRecordedVideo(null);
    setRecordingTime(0);
    chunksRef.current = [];
    startCamera();
  };

  const handleSave = () => {
    if (chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      onVideoAdd(blob);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Record a video message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!recordedVideo ? (
            // Recording view
            <>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => setIsCameraReady(true)}
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
                {!isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <p>Loading camera...</p>
                  </div>
                )}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-mono">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={!isCameraReady}
                    className="flex-1"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive" className="flex-1">
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                <Button variant="outline" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            // Preview view
            <>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={previewRef}
                  src={recordedVideo}
                  className="w-full h-full object-cover"
                  onEnded={() => setIsPlaying(false)}
                  style={{ transform: "scaleX(-1)" }}
                />
                <button
                  onClick={togglePlayback}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                >
                  {!isPlaying ? (
                    <div className="bg-white/90 rounded-full p-4">
                      <Play className="h-8 w-8 text-black" />
                    </div>
                  ) : (
                    <div className="bg-white/90 rounded-full p-4">
                      <Pause className="h-8 w-8 text-black" />
                    </div>
                  )}
                </button>
                <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {formatTime(recordingTime)}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={retake} variant="outline" className="flex-1">
                  Retake
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  Add Video
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
