import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { telemetryService } from "@/services/api/telemetry.service";
import { toast } from "@/components/ui/use-toast";

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

const transformBindingsData = (bindings: any[]): ProcessedBinding[] => {
  return bindings.map((binding) => {
    const drone = binding.devices.find(
      (device: any) => device.device_type === "Drone"
    );
    const dock = binding.devices.find(
      (device: any) => device.device_type === "DockingStation"
    );

    return {
      site: {
        _id: binding.site._id,
        name: binding.site.name,
      },
      droneDetails: drone
        ? {
            name: drone.name,
            model: drone.model,
            device_type: drone.device_type,
            serial_no: drone.serial_no,
            id: drone.id,
          }
        : null,
      dockDetails: dock
        ? {
            name: dock.name,
            model: dock.model,
            device_type: dock.device_type,
            serial_no: dock.serial_no,
            id: dock.id,
          }
        : null,
    };
  });
};

const VideoWall = () => {
  const { organizationId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [deviceBindings, setDeviceBindings] = useState<ProcessedBinding[]>([]);

  useEffect(() => {
    const fetchDeviceBindings = async () => {
      if (!organizationId || !token) return;

      try {
        // Assuming the API returns an object with a "data" property that is an array of bindings
        const response = await telemetryService.getDeviceBindings(
          organizationId,
          token
        );
        const processedData = transformBindingsData(response.data);
        setDeviceBindings(processedData);
        toast({
          title: "Success",
          description: "Device bindings fetched successfully",
        });
      } catch (error) {
        console.error("Failed to fetch device bindings:", error);
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
      <p className="text-xl text-white">Token: {token}</p>
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
