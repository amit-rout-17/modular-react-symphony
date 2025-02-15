
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
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [viewMode, setViewMode] = useState<"dock" | "drone">("dock");

  useEffect(() => {
    // Set the first site as default selected site
    if (deviceBindings.length > 0 && !selectedSite) {
      setSelectedSite(deviceBindings[0].site._id);
    }
  }, [deviceBindings.length, selectedSite]);

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

  const selectedBinding = deviceBindings.find(binding => binding.site._id === selectedSite);

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

      {selectedBinding && (
        <div className="grid grid-cols-1 gap-4">
          {viewMode === "drone" ? (
            selectedBinding.streamingDetails?.drone && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    Drone Stream: {selectedBinding.droneDetails?.name}
                  </h3>
                  <div className="aspect-video">
                    <VideoSDK
                      streamingDetails={selectedBinding.streamingDetails.drone}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )
          ) : (
            selectedBinding.streamingDetails?.dock && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    Dock Stream: {selectedBinding.dockDetails?.name}
                  </h3>
                  <div className="aspect-video">
                    <VideoSDK
                      streamingDetails={selectedBinding.streamingDetails.dock}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default VideoWall;
