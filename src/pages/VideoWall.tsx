import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { websocketService } from "@/services/websocket/websocket.service";
import { videoStreamingService } from "@/services/api/video-streaming.service";
import VideoSDK from "@/components/VideoSDK";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LayoutControls } from "@/components/VideoWall/LayoutControls";
import { VideoFeed } from "@/components/VideoWall/VideoFeed";

interface Site {
  _id: string;
  name: string;
}

interface Device {
  name: string;
  model: string;
  device_type: string;
  serial_no: string;
  id: string;
}

interface ProcessedBinding {
  site: Site;
  droneDetails: Device | null;
  dockDetails: Device | null;
  streamingDetails?: {
    drone?: any;
    dock?: any;
  };
}

const VideoWall = () => {
  const { organizationId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [deviceBindings, setDeviceBindings] = useState<ProcessedBinding[]>(
    location.state?.deviceBindings || []
  );
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"dock" | "drone">("dock");
  const [layout, setLayout] = useState("2");
  const [aspectRatio, setAspectRatio] = useState("16:9");

  useEffect(() => {
    if (organizationId && token) {
      websocketService.initialize({
        token,
        organizationId,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing authentication details",
      });
    }

    return () => {
      websocketService.disconnect();
    };
  }, [organizationId, token]);

  useEffect(() => {
    const fetchStreamingDetails = async () => {
      if (!organizationId || !token || deviceBindings.length === 0) return;

      try {
        const updatedBindings = await Promise.all(
          deviceBindings.map(async (binding) => {
            const streamingDetails: { drone?: any; dock?: any } = {};

            if (binding.droneDetails) {
              try {
                streamingDetails.drone = await videoStreamingService.getStreamingDetails(
                  token,
                  organizationId,
                  binding.droneDetails.id
                );
              } catch (error) {
                console.error(`Error fetching drone streaming details:`, error);
              }
            }

            if (binding.dockDetails) {
              try {
                streamingDetails.dock = await videoStreamingService.getStreamingDetails(
                  token,
                  organizationId,
                  binding.dockDetails.id
                );
              } catch (error) {
                console.error(`Error fetching dock streaming details:`, error);
              }
            }

            return {
              ...binding,
              streamingDetails,
            };
          })
        );

        setDeviceBindings(updatedBindings);
        toast({
          title: "Success",
          description: "Streaming details fetched successfully",
        });
      } catch (error) {
        console.error("Error fetching streaming details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch streaming details",
        });
      }
    };

    fetchStreamingDetails();
  }, [organizationId, token, deviceBindings.length]);

  const filteredBindings = selectedSite === "all" 
    ? deviceBindings 
    : deviceBindings.filter(binding => binding.site._id === selectedSite);

  const getLayoutClass = () => {
    switch (layout) {
      case "1": return "grid-cols-1";
      case "2": return "grid-cols-1 md:grid-cols-2";
      case "3": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "4": return "grid-cols-2 lg:grid-cols-4";
      default: return "grid-cols-1 md:grid-cols-2";
    }
  };

  if (!location.state?.deviceBindings) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-white">No device bindings data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white">
            Video Wall
          </h1>
          <div className="w-48">
            <Select
              value={selectedSite}
              onValueChange={setSelectedSite}
            >
              <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                <SelectItem value="all">All Sites</SelectItem>
                {deviceBindings.map((binding) => (
                  <SelectItem key={binding.site._id} value={binding.site._id}>
                    {binding.site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LayoutControls
            layout={layout}
            aspectRatio={aspectRatio}
            onLayoutChange={setLayout}
            onAspectRatioChange={setAspectRatio}
          />
          <div className="flex items-center gap-2">
            <span className="text-white">Dock</span>
            <Switch 
              checked={viewMode === "drone"}
              onCheckedChange={(checked) => setViewMode(checked ? "drone" : "dock")}
            />
            <span className="text-white">Drone</span>
          </div>
        </div>
      </div>

      <div className={`grid ${getLayoutClass()} gap-4`}>
        {filteredBindings.map((binding) => {
          const isViewingDrone = viewMode === "drone";
          const streamingDetails = isViewingDrone 
            ? binding.streamingDetails?.drone 
            : binding.streamingDetails?.dock;
          const deviceDetails = isViewingDrone 
            ? binding.droneDetails 
            : binding.dockDetails;

          return (
            <VideoFeed
              key={binding.site._id}
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
          );
        })}
      </div>
    </div>
  );
};

export default VideoWall;
