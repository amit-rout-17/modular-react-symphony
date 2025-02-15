
import { Badge } from "@/components/ui/badge";

interface VideoFeedProps {
  name: string;
  isActive: boolean;
  aspectRatio: string;
  children: React.ReactNode;
}

export function VideoFeed({ name, isActive, aspectRatio, children }: VideoFeedProps) {
  const aspectRatioClass = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
  }[aspectRatio] || "aspect-video";

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-white text-sm font-medium">{name}</span>
      </div>
      <div className={`${aspectRatioClass}`}>
        {children}
      </div>
    </div>
  );
}
