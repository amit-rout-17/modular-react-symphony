
import { ProcessedBinding, VideoWallViewMode } from "@/types/video-wall";
import VideoSDK from "@/components/VideoSDK";

interface VideoDisplayProps {
  viewMode: VideoWallViewMode;
  binding: ProcessedBinding;
  device: any;
  streamingDetails: any;
}

/**
 * Component to handle video display and fallback states
 */
export function VideoDisplay({ viewMode, binding, device, streamingDetails }: VideoDisplayProps) {
  if (!streamingDetails) {
    return (
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
    );
  }

  return (
    <VideoSDK
      streamingDetails={streamingDetails}
      className="w-full h-full rounded-lg"
    />
  );
}
