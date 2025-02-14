
import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { websocketService } from "@/services/websocket/websocket.service";
import { videoStreamingService } from "@/services/api/video-streaming.service";

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
      // Initialize WebSocket connection with authentication
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

    // Cleanup WebSocket connection on component unmount
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

            // Fetch streaming details for drone if available
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

            // Fetch streaming details for dock if available
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
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold text-white">
        Organization ID: {organizationId}
      </h1>
      {deviceBindings.length > 0 && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">
            Device Bindings with Streaming Details:
          </h2>
          <pre className="text-white overflow-auto max-w-2xl">
            {JSON.stringify(deviceBindings, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default VideoWall;
