import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface CDProps {
  onAddMusic: (url: string) => void;
}

export const CD: React.FC<CDProps> = ({ onAddMusic }) => {
  const [musicUrl, setMusicUrl] = React.useState("");

  const handleMusicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (musicUrl.trim()) {
      onAddMusic(musicUrl.trim());
      setMusicUrl("");
    }
  };

  return (
    <div className="group z-10 transform translate-y-4 transition-all duration-300 ease-in-out hover:-translate-y-8 ">
      <Popover>
        <PopoverTrigger asChild>
          <div className="w-40 h-40 relative rounded-full hover:shadow-2xl cursor-pointer transition-all duration-300 ease-in-out group-hover:-translate-y-1 group-hover:scale-110">
            <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-[#e2e2e2] via-[#f5f5f5] to-[#e2e2e2] overflow-hidden">
              <div className="absolute inset-0 bg-[conic-gradient(from_215deg,transparent_0deg,rgba(255,0,0,0.1)_10deg,rgba(255,165,0,0.1)_20deg,rgba(255,255,0,0.1)_30deg,rgba(0,128,0,0.1)_40deg,rgba(0,0,255,0.1)_50deg,rgba(75,0,130,0.1)_60deg,rgba(238,130,238,0.1)_70deg,transparent_80deg)] opacity-70 group-hover:animate-cd-spin"></div>
              <div className="absolute inset-0 bg-[conic-gradient(from_35deg,transparent_0deg,rgba(255,0,0,0.1)_10deg,rgba(255,165,0,0.1)_20deg,rgba(255,255,0,0.1)_30deg,rgba(0,128,0,0.1)_40deg,rgba(0,0,255,0.1)_50deg,rgba(75,0,130,0.1)_60deg,rgba(238,130,238,0.1)_70deg,transparent_80deg)] opacity-70 group-hover:animate-cd-spin"></div>
              <div className="absolute inset-[15%] rounded-full bg-[repeating-radial-gradient(circle,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_2px)]"></div>
              <div className="absolute inset-[38%] rounded-full bg-gradient-to-b from-[#9ca3af] to-[#4b5563] flex items-center justify-center">
                <div className="absolute inset-[25%] rounded-full bg-[#1f2937]"></div>
              </div>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 rounded-xl">
          <div className="space-y-3">
            <div>
              <Label htmlFor="music-url" className="text-sm font-medium">
                Add Music
              </Label>
              <p className="text-xs text-stone-500 mt-1">
                Paste a Spotify or Apple Music link
              </p>
            </div>
            <form onSubmit={handleMusicSubmit} className="flex gap-2">
              <Input
                id="music-url"
                type="url"
                placeholder="https://open.spotify.com/... or https://music.apple.com/..."
                value={musicUrl}
                onChange={(e) => setMusicUrl(e.target.value)}
                className="bg-stone-100 flex-1"
              />
              <Button type="submit">Add</Button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
      <style jsx>{`
        @keyframes cd-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .group-hover\:animate-cd-spin {
          animation: cd-spin 5s linear infinite;
        }
      `}</style>
    </div>
  );
};
