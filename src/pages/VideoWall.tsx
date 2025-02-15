import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { websocketService } from "@/services/websocket/websocket.service";
import { videoStreamingService } from "@/services/api/video-streaming.service";
import VideoSDK from "@/components/VideoSDK";

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

  if (!location.state?.deviceBindings) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "No device bindings data available",
    });
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <h1 className="text-3xl font-bold text-white mb-8">
        Organization ID: {organizationId}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deviceBindings.map((binding, index) => (
          <div key={index} className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-bold text-white mb-4">
                {binding.site.name}
              </h2>
              
              {binding.streamingDetails?.drone && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    Drone Stream: {binding.droneDetails?.name}
                  </h3>
                  <div className="aspect-video">
                    <VideoSDK
                      streamingDetails={binding.streamingDetails.drone}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}
              
              {binding.streamingDetails?.dock && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-lg font-semibold text-white">
                    Dock Stream: {binding.dockDetails?.name}
                  </h3>
                  <div className="aspect-video">
                    <VideoSDK
                      streamingDetails={binding.streamingDetails.dock}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoWall;
