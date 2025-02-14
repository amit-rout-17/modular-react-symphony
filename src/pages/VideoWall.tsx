
import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { telemetryService } from "@/services/api/telemetry.service";
import { toast } from "@/components/ui/use-toast";

const VideoWall = () => {
  const { organizationId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const fetchTelemetry = async () => {
      if (!organizationId || !token) return;
      
      try {
        await telemetryService.getUserTelemetry(organizationId, token);
        toast({
          title: "Success",
          description: "Telemetry data fetched successfully",
        });
      } catch (error) {
        console.error('Failed to fetch telemetry:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch telemetry data",
        });
      }
    };

    fetchTelemetry();
  }, [organizationId, token]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold text-white">
        Organization ID: {organizationId}
      </h1>
      <p className="text-xl text-white">
        Token: {token}
      </p>
    </div>
  );
};

export default VideoWall;
