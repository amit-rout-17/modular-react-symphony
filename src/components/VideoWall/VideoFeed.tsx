
import { useState, useRef } from "react";
import { ExternalLink, Maximize2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoFeedProps {
  name: string;
  isActive: boolean;
  aspectRatio: string;
  children: React.ReactNode;
}

export function VideoFeed({ name, isActive, aspectRatio, children }: VideoFeedProps) {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const aspectRatioClass = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
  }[aspectRatio] || "aspect-video";

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    // Find the video element within the container and pause/play it
    const videoElement = containerRef.current?.querySelector('video');
    if (videoElement) {
      if (isPaused) {
        videoElement.play();
      } else {
        videoElement.pause();
      }
    }
  };

  const handleNavigate = () => {
    window.open('https://example.com/device-details', '_blank');
  };

  return (
    <div ref={containerRef} className="relative bg-gray-800 rounded-lg overflow-hidden group">
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-[#333333] rounded-md px-3 py-1.5">
          <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-white text-sm font-medium">{name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNavigate}
            className="ml-2 h-6 w-6 p-0 hover:bg-gray-700/50"
          >
            <ExternalLink className="h-4 w-4 text-white" />
          </Button>
        </div>
        
        {isActive && (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
              onClick={handlePauseToggle}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
              onClick={handleFullscreen}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className={`${aspectRatioClass} relative ${isPaused ? 'opacity-60' : ''}`}>
        {children}
      </div>
    </div>
  );
}
