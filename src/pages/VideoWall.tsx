
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { telemetryService } from "@/services/api/telemetry.service";
import { toast } from "@/components/ui/use-toast";

const VideoWall = () => {
  const { organizationId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [deviceBindings, setDeviceBindings] = useState<any>(null);

  useEffect(() => {
    const fetchDeviceBindings = async () => {
      if (!organizationId || !token) return;
      
      try {
        const response = await telemetryService.getDeviceBindings(organizationId, token);
        setDeviceBindings(response);
        toast({
          title: "Success",
          description: "Device bindings fetched successfully",
        });
      } catch (error) {
        console.error('Failed to fetch device bindings:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch device bindings",
        });
      }
    };

    fetchDeviceBindings();
  }, [organizationId, token]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold text-white">
        Organization ID: {organizationId}
      </h1>
      <p className="text-xl text-white">
        Token: {token}
      </p>
      {deviceBindings && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Device Bindings:</h2>
          <pre className="text-white overflow-auto max-w-2xl">
            {JSON.stringify(deviceBindings, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default VideoWall;
