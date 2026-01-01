"use client";

import React, { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface VideoPlayerProps {
  videoBlob: Blob | string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoBlob }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");

  React.useEffect(() => {
    if (typeof videoBlob === "string") {
      setVideoUrl(videoBlob);
    } else {
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoBlob]);

  const togglePlayback = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-white p-3 shadow-md rounded-lg w-[320px] transform-gpu">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          onEnded={handleVideoEnd}
          playsInline
        />

        {/* Play/Pause overlay */}
        <button
          onClick={togglePlayback}
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all duration-200"
        >
          <div className={`bg-white/90 rounded-full p-3 transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
            {isPlaying ? (
              <Pause className="h-6 w-6 text-black" />
            ) : (
              <Play className="h-6 w-6 text-black ml-0.5" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};
