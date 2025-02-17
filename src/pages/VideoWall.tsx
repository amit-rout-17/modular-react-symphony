
import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { websocketService } from "@/services/websocket/websocket.service";
import { videoStreamingService } from "@/services/api/video-streaming.service";
import { layoutService, type LayoutConfig } from "@/services/layout/layout.service";
import VideoSDK from "@/components/VideoSDK";
import { VideoFeed } from "@/components/VideoWall/VideoFeed";
import { SiteSelector } from "@/components/VideoWall/SiteSelector";
import { LayoutManager } from "@/components/VideoWall/LayoutManager";
import { ViewModeSwitcher } from "@/components/VideoWall/ViewModeSwitcher";
import { useWebSocket } from "@/hooks/use-websocket";
import { ProcessedBinding, Device, Payload } from "@/types/video-wall";

const VideoWall = () => {
  const { organizationId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [deviceBindings, setDeviceBindings] = useState<ProcessedBinding[]>(
    location.state?.deviceBindings || []
  );
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"dock" | "fpv" | "payload">("dock");
  const [layout, setLayout] = useState("2");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [savedLayouts, setSavedLayouts] = useState<LayoutConfig[]>([]);

  useWebSocket((message) => {
    console.log('Received WebSocket message:', message);
    const { topic, data } = message;
    
    // Handle different topics
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
            const streamingDetails: { dock?: any; fpv?: any; payload?: any } = {};

            const processDeviceStreaming = async (device: Device | null, payloadType: "Dock" | "FPV" | "Payload") => {
              if (!device || !device.payloads) {
                console.log(`No device or payloads found for ${payloadType}`, device);
                return null;
              }
              
              const payload = device.payloads.find(p => p.type === payloadType);
              console.log(`Found payload for ${payloadType}:`, payload);
              
              if (payload) {
                try {
                  console.log(`Fetching streaming details for ${device.id}_${payload.payload_index}`);
                  const details = await videoStreamingService.getStreamingDetails(
                    token,
                    organizationId,
                    device.id,
                    payload.payload_index
                  );
                  return details;
                } catch (error) {
                  console.error(`Error fetching ${payloadType} streaming details:`, error);
                  return null;
                }
              }
              return null;
            };

            // Process Dock streaming for dock device
            if (binding.dockDetails) {
              streamingDetails.dock = await processDeviceStreaming(binding.dockDetails, "Dock");
            }
            
            // Process FPV and Payload streaming for drone device
            if (binding.droneDetails) {
              streamingDetails.fpv = await processDeviceStreaming(binding.droneDetails, "FPV");
              streamingDetails.payload = await processDeviceStreaming(binding.droneDetails, "Payload");
            }

            console.log('Processed streaming details:', streamingDetails);
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

  useEffect(() => {
    loadSavedLayouts();
  }, []);

  const loadSavedLayouts = async () => {
    try {
      const layouts = await layoutService.getLayoutConfigs();
      setSavedLayouts(layouts);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load saved layouts",
      });
    }
  };

  const handleSaveLayout = async (name: string) => {
    await layoutService.saveLayout(name, layout, aspectRatio);
    loadSavedLayouts();
  };

  const handleLoadLayout = async (layoutConfig: LayoutConfig) => {
    setLayout(layoutConfig.layout);
    setAspectRatio(layoutConfig.aspectRatio);
    toast({
      title: "Success",
      description: "Layout loaded successfully",
    });
  };

  const handleDeleteLayout = async (id: string) => {
    try {
      await layoutService.deleteLayout(id);
      loadSavedLayouts();
      toast({
        title: "Success",
        description: "Layout deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete layout",
      });
    }
  };

  const getLayoutClass = () => {
    switch (layout) {
      case "1":
        return "grid-cols-1";
      case "2":
        return "grid-cols-1 md:grid-cols-2";
      case "3":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "4":
        return "grid-cols-2 lg:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  };

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

  const filteredBindings =
    selectedSite === "all"
      ? deviceBindings
      : deviceBindings.filter((binding) => binding.site._id === selectedSite);

  if (!location.state?.deviceBindings) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-white">No device bindings data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#222222] p-4">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <SiteSelector
            selectedSite={selectedSite}
            deviceBindings={deviceBindings}
            onSiteChange={setSelectedSite}
          />
        </div>

        <div className="flex items-center gap-4">
          <LayoutManager
            savedLayouts={savedLayouts}
            layout={layout}
            aspectRatio={aspectRatio}
            onLayoutChange={setLayout}
            onAspectRatioChange={setAspectRatio}
            onSaveLayout={handleSaveLayout}
            onLoadLayout={handleLoadLayout}
            onDeleteLayout={handleDeleteLayout}
          />
          <ViewModeSwitcher
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

      <div className={`grid ${getLayoutClass()} gap-4`}>
        {filteredBindings.map((binding, index) => {
          const streamingDetails = binding.streamingDetails?.[viewMode];
          const deviceDetails = viewMode === "dock" ? binding.dockDetails : binding.droneDetails;

          return (
            <div
              key={`${binding.site._id}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="cursor-move"
            >
              <VideoFeed
                name={deviceDetails?.name || "Unknown"}
                isActive={!!streamingDetails}
                aspectRatio={aspectRatio}
              >
                {streamingDetails ? (
                  <VideoSDK
                    streamingDetails={streamingDetails}
                    className="w-full h-full rounded-lg"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <div className="mb-2">
                      <svg
                        className="w-12 h-12 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-lg">No {viewMode} video feed available</p>
                  </div>
                )}
              </VideoFeed>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoWall;
