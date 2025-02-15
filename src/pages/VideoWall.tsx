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

  if (!location.state?.deviceBindings) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-white">No device bindings data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-white mr-4">
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
        <div className="flex items-center gap-2">
          <span className="text-white">Dock</span>
          <Switch 
            checked={viewMode === "drone"}
            onCheckedChange={(checked) => setViewMode(checked ? "drone" : "dock")}
          />
          <span className="text-white">Drone</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBindings.map((binding) => (
          <div key={binding.site._id} className="bg-gray-800 rounded-lg p-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white mb-4">
                {binding.site.name}
              </h3>
              {viewMode === "drone" ? (
                binding.streamingDetails?.drone && (
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">
                      Drone Stream: {binding.droneDetails?.name}
                    </h4>
                    <div className="aspect-video">
                      <VideoSDK
                        streamingDetails={binding.streamingDetails.drone}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )
              ) : (
                binding.streamingDetails?.dock && (
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">
                      Dock Stream: {binding.dockDetails?.name}
                    </h4>
                    <div className="aspect-video">
                      <VideoSDK
                        streamingDetails={binding.streamingDetails.dock}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoWall;
