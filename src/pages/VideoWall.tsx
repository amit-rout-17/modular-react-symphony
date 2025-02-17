
import { useState, useEffect } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { websocketService } from "@/services/websocket/websocket.service";
import { videoStreamingService } from "@/services/api/video-streaming.service";
import { SiteSelector } from "@/components/VideoWall/SiteSelector";
import { LayoutManager } from "@/components/VideoWall/LayoutManager";
import { ViewModeSwitcher } from "@/components/VideoWall/ViewModeSwitcher";
import { VideoFeed } from "@/components/VideoWall/VideoFeed";
import { VideoDisplay } from "@/components/VideoWall/VideoDisplay";
import { useWebSocket } from "@/hooks/use-websocket";
import { useLayoutManagement } from "@/hooks/video-wall/use-layout-management";
import { getLayoutClass } from "@/utils/video-wall-utils";
import { ProcessedBinding, VideoWallViewMode } from "@/types/video-wall";

/**
 * VideoWall Component
 * Implements a drag-and-drop enabled video wall with multiple viewing modes and layouts
 */
const VideoWall = () => {
  // Route and authentication params
  const { organizationId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // State management
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [viewMode, setViewMode] = useState<VideoWallViewMode>("fpv");
  const [deviceBindings, setDeviceBindings] = useState<ProcessedBinding[]>(
    location.state?.deviceBindings || []
  );
  
  // Custom hooks for layout management
  const layoutManagement = useLayoutManagement();

  // WebSocket connection
  useWebSocket((message) => {
    console.log('Received WebSocket message:', message);
    const { topic, data } = message;
    
    switch (topic) {
      case 'drone_telemetry':
        console.log('Received drone telemetry:', data);
        break;
      case 'dock_status':
        console.log('Received dock status:', data);
        break;
      case 'mission_updates':
        console.log('Received mission update:', data);
        break;
      case 'device_health':
        console.log('Received device health update:', data);
        break;
      case 'connection_status':
        console.log('Received connection status:', data);
        break;
      default:
        console.log('Received unknown topic:', topic, data);
    }
  });

  // Initialize WebSocket connection
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

  // Initialize video streaming
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));

    if (dragIndex === dropIndex) return;

    const newBindings = [...deviceBindings];
    const filteredBindings = getFilteredBindings();

    if (selectedSite !== "all") {
      const originalDragIndex = deviceBindings.findIndex(
        (binding) => binding === filteredBindings[dragIndex]
      );
      const originalDropIndex = deviceBindings.findIndex(
        (binding) => binding === filteredBindings[dropIndex]
      );

      [newBindings[originalDragIndex], newBindings[originalDropIndex]] = [
        newBindings[originalDropIndex],
        newBindings[originalDragIndex],
      ];
    } else {
      [newBindings[dragIndex], newBindings[dropIndex]] = [
        newBindings[dropIndex],
        newBindings[dragIndex],
      ];
    }

    setDeviceBindings(newBindings);
    toast({
      title: "Success",
      description: "Video feeds rearranged successfully",
    });
  };

  // Helper functions
  const getFilteredBindings = () => {
    return selectedSite === "all"
      ? deviceBindings
      : deviceBindings.filter((binding) => binding.site._id === selectedSite);
  };

  if (!location.state?.deviceBindings) {
    return (
      <div className="h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-white">No device bindings data available</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#222222] flex flex-col">
      {/* Header Controls */}
      <div className="flex-none p-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <SiteSelector
              selectedSite={selectedSite}
              deviceBindings={deviceBindings}
              onSiteChange={setSelectedSite}
            />
          </div>

          <div className="flex items-center gap-2">
            <LayoutManager
              savedLayouts={layoutManagement.savedLayouts}
              layout={layoutManagement.layout}
              aspectRatio={layoutManagement.aspectRatio}
              onLayoutChange={layoutManagement.setLayout}
              onAspectRatioChange={layoutManagement.setAspectRatio}
              onSaveLayout={layoutManagement.handleSaveLayout}
              onLoadLayout={layoutManagement.handleLoadLayout}
              onDeleteLayout={layoutManagement.handleDeleteLayout}
            />
            <ViewModeSwitcher
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-2 min-h-0">
        <div className={`grid ${getLayoutClass(layoutManagement.layout)} gap-2 flex-1 min-h-0`}>
          {getFilteredBindings().map((binding, index) => {
            const details = binding[`${viewMode}Details`];
            const streamingDetails = binding.streamingDetails?.[viewMode];

            if (!details) return null;

            return details.map((device, deviceIndex) => (
              <div
                key={`${binding.site._id}-${index}-${deviceIndex}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="cursor-move h-full min-h-0"
              >
                <VideoFeed
                  name={device.name}
                  isActive={!!streamingDetails}
                  aspectRatio={layoutManagement.aspectRatio}
                >
                  <VideoDisplay
                    viewMode={viewMode}
                    binding={binding}
                    device={device}
                    streamingDetails={streamingDetails}
                  />
                </VideoFeed>
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
};

export default VideoWall;
