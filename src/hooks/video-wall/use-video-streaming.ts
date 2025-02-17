
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { videoStreamingService } from "@/services/api/video-streaming.service";
import { ProcessedBinding } from "@/types/video-wall";

export const useVideoStreaming = (
  organizationId: string | undefined,
  token: string | null,
  initialBindings: ProcessedBinding[]
) => {
  const [deviceBindings, setDeviceBindings] = useState<ProcessedBinding[]>(initialBindings);

  useEffect(() => {
    const fetchStreamingDetails = async () => {
      if (!organizationId || !token || deviceBindings.length === 0) return;

      try {
        const updatedBindings = await Promise.all(
          deviceBindings.map(async (binding) => {
            const streamingDetails: { fpv?: any; payload?: any; dock?: any } = {};

            // Fetch FPV streaming details
            if (binding.fpvDetails) {
              for (const device of binding.fpvDetails) {
                try {
                  streamingDetails.fpv = await videoStreamingService.getStreamingDetails(
                    token,
                    organizationId,
                    device.id,
                    device.payload_index
                  );
                } catch (error) {
                  console.error(`Error fetching FPV streaming details:`, error);
                }
              }
            }

            // Fetch payload streaming details
            if (binding.payloadDetails) {
              for (const device of binding.payloadDetails) {
                try {
                  streamingDetails.payload = await videoStreamingService.getStreamingDetails(
                    token,
                    organizationId,
                    device.id,
                    device.payload_index
                  );
                } catch (error) {
                  console.error(`Error fetching payload streaming details:`, error);
                }
              }
            }

            // Fetch dock streaming details
            if (binding.dockDetails) {
              for (const device of binding.dockDetails) {
                try {
                  streamingDetails.dock = await videoStreamingService.getStreamingDetails(
                    token,
                    organizationId,
                    device.id,
                    device.payload_index
                  );
                } catch (error) {
                  console.error(`Error fetching dock streaming details:`, error);
                }
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

  return {
    deviceBindings,
    setDeviceBindings
  };
};
