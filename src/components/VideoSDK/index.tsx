
import React, { useEffect, useRef, useState } from "react";
import { StreamingDetails } from "@/types/streaming";
import { StreamingService } from "@/services/streaming/streaming.interface";
import { AgoraStreamingService, AgoraStats } from "@/services/streaming/agora.service";
import { MillicastStreamingService } from "@/services/streaming/millicast.service";
import { Activity, BarChart2 } from "lucide-react";

interface VideoSDKProps {
  streamingDetails: StreamingDetails;
  className?: string;
}

const VideoSDK: React.FC<VideoSDKProps> = ({ streamingDetails, className }) => {
  const streamingServiceRef = useRef<StreamingService | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<AgoraStats | null>(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const initializeStream = async () => {
      if (streamingServiceRef.current) {
        streamingServiceRef.current.destroy();
      }

      // Create the appropriate streaming service based on platform
      if (streamingDetails.platform === "agora") {
        const agoraService = new AgoraStreamingService();
        streamingServiceRef.current = agoraService;
        
        // Set up stats callback
        agoraService.setStatsCallback((newStats) => {
          setStats(newStats);
        });

        await streamingServiceRef.current.initialize({
          ...streamingDetails.agora,
          url: streamingDetails.url
        });
        
        // Set the video container for Agora service
        if (videoContainerRef.current) {
          agoraService.setVideoContainer(videoContainerRef.current);
        }
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

  const getNetworkQualityText = (quality: number) => {
    switch (quality) {
      case 1: return "Excellent";
      case 2: return "Good";
      case 3: return "Fair";
      case 4: return "Poor";
      case 5: return "Very Poor";
      default: return "Unknown";
    }
  };

  return (
    <div className="relative w-full h-full">
      <div
        ref={videoContainerRef}
        className={`relative w-full h-full bg-black ${className || ""}`}
      />
      
      {streamingDetails.platform === "agora" && (
        <div className="absolute top-4 right-24 z-20 flex items-center">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2.5 bg-neutral-700/90 hover:bg-neutral-600/90 rounded-lg text-white transition-colors"
          >
            {showStats ? <Activity className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}
          </button>
        </div>
      )}

      {showStats && stats && (
        <div className="absolute bottom-4 right-4 z-20 bg-black/80 text-white p-4 rounded-lg text-sm space-y-2">
          <div className="font-semibold mb-2">Network Stats</div>
          
          <div>
            Download Quality: {getNetworkQualityText(stats.networkQuality?.downlinkNetworkQuality || 0)}
          </div>
          <div>
            Upload Quality: {getNetworkQualityText(stats.networkQuality?.uplinkNetworkQuality || 0)}
          </div>
          
          {stats.video && (
            <>
              <div>
                Received Packets: {stats.video.receivePackets}
              </div>
              <div>
                Packet Loss Rate: {stats.video.receivePacketsLost}%
              </div>
              <div>
                Resolution: {stats.video.receiveResolutionWidth}x{stats.video.receiveResolutionHeight}
              </div>
              <div>
                FPS: {Math.round(stats.video.receiveFrameRate)}
              </div>
            </>
          )}
          
          {stats.rtc && (
            <div>
              RTT: {stats.rtc.RTT}ms
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoSDK;
