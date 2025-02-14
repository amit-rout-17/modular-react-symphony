
import { useEffect } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { websocketService } from "@/services/websocket/websocket.service";

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
}

const VideoWall = () => {
  const { organizationId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const deviceBindings = location.state?.deviceBindings || [];

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
            Device Bindings:
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
