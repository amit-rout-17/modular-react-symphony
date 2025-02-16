
import { VideoFeed } from "./VideoFeed";
import VideoSDK from "@/components/VideoSDK";
import { ProcessedBinding } from "@/types/video";

interface VideoGridProps {
  layout: string;
  viewMode: "dock" | "drone";
  aspectRatio: string;
  filteredBindings: ProcessedBinding[];
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, dropIndex: number) => void;
}

export function VideoGrid({
  layout,
  viewMode,
  aspectRatio,
  filteredBindings,
  onDragStart,
  onDragOver,
  onDrop,
}: VideoGridProps) {
  const getLayoutClass = () => {
    switch (layout) {
      case "1": return "grid-cols-1";
      case "2": return "grid-cols-1 md:grid-cols-2";
      case "3": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "4": return "grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2";
    }
  };

  return (
    <div className={`grid ${getLayoutClass()} gap-4`}>
      {filteredBindings.map((binding, index) => {
        const isViewingDrone = viewMode === "drone";
        const streamingDetails = isViewingDrone 
          ? binding.streamingDetails?.drone 
          : binding.streamingDetails?.dock;
        const deviceDetails = isViewingDrone 
          ? binding.droneDetails 
          : binding.dockDetails;

        return (
          <div
            key={binding.site._id}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, index)}
            className="cursor-move"
          >
            <VideoFeed
              name={deviceDetails?.name || 'Unknown'}
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
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-lg">No {isViewingDrone ? 'drone' : 'dock'} video feed available</p>
                </div>
              )}
            </VideoFeed>
          </div>
        );
      })}
    </div>
  );
}
