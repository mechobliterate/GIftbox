import React from "react";

interface VideoCameraProps {
  onClick: () => void;
}

export const VideoCamera: React.FC<VideoCameraProps> = ({ onClick }) => {
  return (
    <div className="group z-10 transform transition-all duration-300 ease-in-out hover:scale-110 hover:-translate-y-2">
      <button
        onClick={onClick}
        className="relative w-32 h-32 transition-all duration-300 ease-in-out group-hover:shadow-2xl"
        aria-label="Record video message"
      >
        {/* Camera body */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Main camera body */}
            <div className="w-28 h-20 bg-gradient-to-b from-stone-800 to-stone-900 rounded-lg shadow-lg relative">
              {/* Lens */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full border-2 border-stone-600 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-900 to-blue-950 rounded-full"></div>
                <div className="absolute top-1 left-1 w-2 h-2 bg-white/30 rounded-full blur-[1px]"></div>
              </div>

              {/* Record button */}
              <div className="absolute top-3 right-3 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>

              {/* Grip texture */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                <div className="w-1 h-1 bg-stone-700 rounded-full"></div>
                <div className="w-1 h-1 bg-stone-700 rounded-full"></div>
                <div className="w-1 h-1 bg-stone-700 rounded-full"></div>
              </div>
            </div>

            {/* Viewfinder */}
            <div className="absolute -top-3 -right-2 w-8 h-7 bg-gradient-to-br from-stone-700 to-stone-800 rounded-sm border border-stone-600">
              <div className="w-full h-full bg-blue-900/20 rounded-sm"></div>
            </div>

            {/* Bottom grip */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-gradient-to-b from-stone-800 to-stone-900 rounded-b-lg"></div>
          </div>
        </div>

        {/* Shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-black/20 rounded-full blur-sm group-hover:w-24 transition-all duration-300"></div>
      </button>
    </div>
  );
};
