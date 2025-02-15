
import React, { useEffect, useRef } from "react";
import { StreamingDetails } from "@/types/streaming";
import { StreamingService } from "@/services/streaming/streaming.interface";
import { AgoraStreamingService } from "@/services/streaming/agora.service";
import { MillicastStreamingService } from "@/services/streaming/millicast.service";

interface VideoSDKProps {
  streamingDetails: StreamingDetails;
  className?: string;
}

const VideoSDK: React.FC<VideoSDKProps> = ({ streamingDetails, className }) => {
  const streamingServiceRef = useRef<StreamingService | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeStream = async () => {
      if (streamingServiceRef.current) {
        streamingServiceRef.current.destroy();
      }

      // Create the appropriate streaming service based on platform
      if (streamingDetails.platform === "agora") {
        streamingServiceRef.current = new AgoraStreamingService();
        await streamingServiceRef.current.initialize(streamingDetails.agora);
      } else if (streamingDetails.platform === "millicast") {
        streamingServiceRef.current = new MillicastStreamingService();
        await streamingServiceRef.current.initialize(streamingDetails.millicast);
      }

      // Start streaming if service was initialized
      if (streamingServiceRef.current) {
        try {
          await streamingServiceRef.current.startStream();
        } catch (error) {
          console.error("Failed to start stream:", error);
        }
      }
    };

    initializeStream();

    // Cleanup function
    return () => {
      if (streamingServiceRef.current) {
        streamingServiceRef.current.stopStream().then(() => {
          streamingServiceRef.current?.destroy();
          streamingServiceRef.current = null;
        });
      }
    };
  }, [streamingDetails]);

  return (
    <div
      ref={videoContainerRef}
      className={`relative w-full h-full bg-black ${className || ""}`}
    />
  );
};

export default VideoSDK;
