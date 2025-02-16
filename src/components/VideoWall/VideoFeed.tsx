
import { useState, useRef, useEffect } from "react";
import { Maximize2, Pause, Play } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const aspectRatioClass = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
  }[aspectRatio] || "aspect-video";

  useEffect(() => {
    // Update video reference when children change
    if (containerRef.current) {
      videoRef.current = containerRef.current.querySelector('video');
    }
  }, [children]);

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handlePauseToggle = () => {
    if (!videoRef.current) return;

    setIsPaused((prevPaused) => {
      const newPausedState = !prevPaused;
      
      try {
        if (newPausedState) {
          videoRef.current?.pause();
        } else {
          videoRef.current?.play();
        }
      } catch (error) {
        console.error('Error toggling video state:', error);
      }

      return newPausedState;
    });
  };

  return (
    <div ref={containerRef} className="relative bg-gray-800 rounded-lg overflow-hidden group">
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-white text-sm font-medium">{name}</span>
      </div>
      
      {isActive && (
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
      
      <div className={`${aspectRatioClass} relative`}>
        <div className={`absolute inset-0 ${isPaused ? 'bg-black/50' : ''} transition-colors z-10 pointer-events-none`} />
        <div className={`relative ${isPaused ? 'opacity-75' : ''} transition-opacity`}>
          {children}
        </div>
      </div>
    </div>
  );
}
