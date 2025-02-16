
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

  // When the component mounts, get the video element reference
  useEffect(() => {
    if (containerRef.current) {
      videoRef.current = containerRef.current.querySelector('video');
      
      // Add event listeners to handle play/pause events from the video element
      if (videoRef.current) {
        const handlePlay = () => {
          console.log('Video played');
          // Only allow play if we're not in paused state
          if (isPaused) {
            console.log('Preventing auto-play while paused');
            videoRef.current?.pause();
            return;
          }
          setIsPaused(false);
        };
        
        const handlePause = () => {
          console.log('Video paused');
          setIsPaused(true);
        };
        
        videoRef.current.addEventListener('play', handlePlay);
        videoRef.current.addEventListener('pause', handlePause);
        
        // Cleanup event listeners when component unmounts
        return () => {
          if (videoRef.current) {
            videoRef.current.removeEventListener('play', handlePlay);
            videoRef.current.removeEventListener('pause', handlePause);
          }
        };
      }
    }
  }, [isPaused]); // Add isPaused to dependencies to update the event listener when it changes

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const handlePauseToggle = () => {
    if (!videoRef.current) {
      console.log('No video element found');
      return;
    }

    try {
      if (videoRef.current.paused) {
        setIsPaused(false);
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setIsPaused(true);
        });
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    } catch (err) {
      console.error('Error toggling video:', err);
    }
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
      
      <div className={`${aspectRatioClass} relative ${isPaused ? 'opacity-60' : ''}`}>
        {children}
      </div>
    </div>
  );
}
