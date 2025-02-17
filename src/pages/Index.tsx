
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { telemetryService } from "@/services/api/telemetry.service";
import { websocketService } from "@/services/websocket/websocket.service";
import { toast } from "@/components/ui/use-toast";
import { ProcessedBinding } from "@/types/video-wall";

const transformBindingsData = (bindings: any[]): ProcessedBinding[] => {
  return bindings.map((binding) => {
    // Check if devices array exists and has at least one device
    if (!binding.devices || !binding.devices.length) {
      console.warn('No devices found for binding:', binding);
      return null;
    }

    return {
      site: binding.site,
      device: binding.devices[0], // Take the first device
      streamingDetails: {}
    };
  }).filter((binding): binding is ProcessedBinding => binding !== null); // Filter out null entries
};

const Index = () => {
  const [organizationId, setOrganizationId] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (organizationId.trim() && token.trim()) {
      try {
        websocketService.initialize({
          token,
          organizationId,
        });

        const response = await telemetryService.getDeviceBindings(
          organizationId,
          token
        );
        
        console.log('Raw device bindings:', response.data);
        const processedData = transformBindingsData(response.data);
        console.log('Processed device bindings:', processedData);
        
        if (processedData.length === 0) {
          toast({
            variant: "destructive",
            title: "Warning",
            description: "No valid device bindings found",
          });
          return;
        }

        navigate(`/${organizationId}/video-wall?token=${token}`, {
          state: { deviceBindings: processedData }
        });
        
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Flytbase</h1>
          <p className="text-gray-400">Enter your organization details to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="organizationId" className="text-sm font-medium text-gray-300">
              Organization ID
            </label>
            <Input
              id="organizationId"
              type="text"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              placeholder="Enter your organization ID"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="token" className="text-sm font-medium text-gray-300">
              Token
            </label>
            <Input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              placeholder="Enter your token"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continue to Video Wall
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Index;
