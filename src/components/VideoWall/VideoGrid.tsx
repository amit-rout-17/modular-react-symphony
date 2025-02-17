
import { VideoFeed } from "./VideoFeed";
import VideoSDK from "@/components/VideoSDK";
import { ProcessedBinding, VideoWallViewMode } from "@/types/video-wall";

interface VideoGridProps {
  layout: string;
  viewMode: VideoWallViewMode;
  aspectRatio: string;
  bindings: ProcessedBinding[];
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export function VideoGrid({
  layout,
  viewMode,
  aspectRatio,
  bindings,
  onDragStart,
  onDragOver,
  onDrop,
}: VideoGridProps) {
  const getLayoutClass = () => {
    switch (layout) {
      case "1":
        return "grid-cols-1";
      case "2":
        return "grid-cols-2";
      case "3":
        return "grid-cols-3";
      case "4":
        return "grid-cols-2 lg:grid-cols-4";
      default:
        return "grid-cols-2";
    }
  };

  return (
    <div className={`grid ${getLayoutClass()} gap-2 flex-1 min-h-0`}>
      {bindings.map((binding, index) => {
        const details = binding[`${viewMode}Details`];
        const streamingDetails = binding.streamingDetails?.[viewMode];

        if (!details) return null;

        return details.map((device, deviceIndex) => (
          <div
            key={`${binding.site._id}-${index}-${deviceIndex}`}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, index)}
            className="cursor-move h-full min-h-0"
          >
            <VideoFeed
              name={device.name}
              isActive={!!streamingDetails}
              aspectRatio={aspectRatio}
            >
              {streamingDetails ? (
                <VideoSDK
                  streamingDetails={streamingDetails}
                  className="w-full h-full rounded-lg"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <div className="mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg">No {viewMode} video feed available</p>
                </div>
              )}
            </VideoFeed>
          </div>
        ));
      })}
    </div>
  );
}
