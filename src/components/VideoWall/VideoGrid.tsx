
import { ProcessedBinding, VideoWallViewMode } from "@/types/video-wall";
import { VideoFeed } from "./VideoFeed";
import { VideoDisplay } from "./VideoDisplay";
import { getLayoutClass } from "@/utils/video-wall-utils";

interface VideoGridProps {
  layout: string;
  viewMode: VideoWallViewMode;
  filteredBindings: ProcessedBinding[];
  aspectRatio: string;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export function VideoGrid({
  layout,
  viewMode,
  filteredBindings,
  aspectRatio,
  onDragStart,
  onDragOver,
  onDrop
}: VideoGridProps) {
  return (
    <div className="flex-1 p-2 overflow-hidden">
      <div 
        className={`grid ${getLayoutClass(layout)} gap-4 w-full h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)]`}
        style={{ gridTemplateRows: `repeat(${Math.ceil(filteredBindings.length / Number(layout))}, 1fr)` }}
      >
        {filteredBindings.map((binding, index) => {
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
              className="cursor-move w-full h-full min-h-0"
            >
              <VideoFeed
                name={device.name}
                isActive={!!streamingDetails}
                aspectRatio={aspectRatio}
              >
                <VideoDisplay
                  viewMode={viewMode}
                  binding={binding}
                  device={device}
                  streamingDetails={streamingDetails}
                />
              </VideoFeed>
            </div>
          ));
        })}
      </div>
    </div>
  );
}
