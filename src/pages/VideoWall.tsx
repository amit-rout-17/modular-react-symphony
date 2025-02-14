
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
  drone_type: string | null;
}

interface ProcessedBinding {
  site: Site;
  device: Device;
}

const transformBindingsData = (data: any[]): ProcessedBinding[] => {
  return data.flatMap(binding => 
    binding.devices.map((device: any) => ({
      site: {
        _id: binding.site._id,
        name: binding.site.name
      },
      device: {
        name: device.name,
        model: device.model,
        device_type: device.device_type,
        serial_no: device.serial_no,
        id: device.id,
        drone_type: device.drone_type
      }
    }))
  );
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
        const response = await telemetryService.getDeviceBindings(organizationId, token);
        const processedData = transformBindingsData(response);
        setDeviceBindings(processedData);
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
