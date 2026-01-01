"use client";

import { Loader2, GripVertical } from "lucide-react";
import React, { useEffect, useState } from "react";

interface SpotifyPlayerProps {
  spotifyUrl: string;
}

type MusicService = "spotify" | "apple" | "unknown";

const detectMusicService = (url: string): MusicService => {
  if (url.includes("spotify.com")) return "spotify";
  if (url.includes("apple.com") || url.includes("music.apple")) return "apple";
  return "unknown";
};

const convertToAppleMusicEmbed = (url: string): string => {
  // Apple Music embed format:
  // Input: https://music.apple.com/us/album/album-name/123456789?i=987654321
  // Output: https://embed.music.apple.com/us/album/album-name/123456789?i=987654321

  if (url.includes("embed.music.apple.com")) {
    return url; // Already an embed URL
  }

  return url.replace("music.apple.com", "embed.music.apple.com");
};

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ spotifyUrl }) => {
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<MusicService>("unknown");

  useEffect(() => {
    const loadEmbed = async () => {
      setIsLoading(true);
      setError(null);

      const detectedService = detectMusicService(spotifyUrl);
      setService(detectedService);

      if (detectedService === "unknown") {
        setError(
          "Unsupported music service. Use Spotify or Apple Music links.",
        );
        setIsLoading(false);
        return;
      }

      try {
        if (detectedService === "spotify") {
          // Use Spotify oEmbed API
          const response = await fetch(
            `https://open.spotify.com/oembed?url=${encodeURIComponent(
              spotifyUrl,
            )}`,
          );
          if (!response.ok) {
            throw new Error("Failed to fetch Spotify embed");
          }
          const data = await response.json();

          // Extract iframe src from HTML string
          const srcMatch = data.html.match(/src="([^"]+)"/);
          if (!srcMatch) throw new Error("Could not find iframe src");
          setEmbedSrc(srcMatch[1]);
        } else if (detectedService === "apple") {
          // Convert Apple Music URL to embed format
          const embedUrl = convertToAppleMusicEmbed(spotifyUrl);
          setEmbedSrc(embedUrl);
        }
      } catch (err) {
        setError(
          `Error loading ${detectedService === "spotify" ? "Spotify" : "Apple Music"} embed. Check the URL.`,
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEmbed();
  }, [spotifyUrl]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 shadow-md rounded-lg w-[300px] h-[152px] flex items-center justify-center pointer-events-none">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 shadow-md rounded-lg w-[300px] h-[152px] flex items-center justify-center text-red-500 text-sm text-center px-6 pointer-events-none">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg w-[300px] h-[152px] transform-gpu relative group overflow-hidden">
      {/* Drag handle indicator */}
      <div className="absolute top-2 left-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-stone-700/80 text-white rounded px-2 py-1 flex items-center gap-1 text-xs">
          <GripVertical className="h-3 w-3" />
          <span>Drag to move</span>
        </div>
      </div>

      {embedSrc && (
        <iframe
          src={embedSrc}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          className="rounded-lg pointer-events-none"
          style={{
            border: "none",
            display: "block",
          }}
        />
      )}
    </div>
  );
};
