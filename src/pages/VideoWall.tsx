
import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { websocketService } from "@/services/websocket/websocket.service";
import { videoStreamingService } from "@/services/api/video-streaming.service";
import { layoutService, type LayoutConfig } from "@/services/layout/layout.service";
import { SiteSelector } from "@/components/VideoWall/SiteSelector";
import { LayoutManager } from "@/components/VideoWall/LayoutManager";
import { ViewModeSwitcher } from "@/components/VideoWall/ViewModeSwitcher";
import { VideoGrid } from "@/components/VideoWall/VideoGrid";
import { VideoPagination } from "@/components/VideoWall/VideoPagination";
import { useWebSocket } from "@/hooks/use-websocket";
import { ProcessedBinding, VideoWallViewMode } from "@/types/video-wall";

const VideoWall = () => {
  const { organizationId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [deviceBindings, setDeviceBindings] = useState<ProcessedBinding[]>(
    location.state?.deviceBindings || []
  );
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [viewMode, setViewMode] = useState<VideoWallViewMode>("fpv");
  const [layout, setLayout] = useState("2");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [savedLayouts, setSavedLayouts] = useState<LayoutConfig[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

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
            const streamingDetails: { fpv?: any; payload?: any; dock?: any } = {};

            if (binding.fpvDetails) {
              for (const device of binding.fpvDetails) {
                try {
                  const details = await videoStreamingService.getStreamingDetails(
                    token,
                    organizationId,
                    device.id,
                    device.payload_index
                  );
                  streamingDetails.fpv = details;
                } catch (error) {
                  console.error(`Error fetching FPV streaming details:`, error);
                }
              }
            }

            if (binding.payloadDetails) {
              for (const device of binding.payloadDetails) {
                try {
                  const details = await videoStreamingService.getStreamingDetails(
                    token,
                    organizationId,
                    device.id,
                    device.payload_index
                  );
                  streamingDetails.payload = details;
                } catch (error) {
                  console.error(`Error fetching payload streaming details:`, error);
                }
              }
            }

            if (binding.dockDetails) {
              for (const device of binding.dockDetails) {
                try {
                  const details = await videoStreamingService.getStreamingDetails(
                    token,
                    organizationId,
                    device.id,
                    device.payload_index
                  );
                  streamingDetails.dock = details;
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

  const getGridSize = () => {
    switch (layout) {
      case "1": return 1;
      case "2": return 4;
      case "3": return 6;
      case "4": return 8;
      default: return 4;
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

  const paginatedBindings = () => {
    const gridSize = getGridSize();
    const startIndex = (currentPage - 1) * gridSize;
    return filteredBindings.slice(startIndex, startIndex + gridSize);
  };

  const totalPages = Math.ceil(filteredBindings.length / getGridSize());

  if (!location.state?.deviceBindings) {
    return (
      <div className="h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-white">No device bindings data available</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#222222] flex flex-col">
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
      </div>

      <div className="flex-1 p-2 min-h-0 flex flex-col">
        <VideoGrid
          layout={layout}
          viewMode={viewMode}
          aspectRatio={aspectRatio}
          bindings={paginatedBindings()}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
        <VideoPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default VideoWall;
