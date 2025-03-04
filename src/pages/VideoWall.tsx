import { useState, useEffect } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { websocketService } from "@/services/websocket/websocket.service";
import { mqttService } from "@/services/mqtt/mqtt.service";
import { Header } from "@/components/VideoWall/Header";
import { VideoGrid } from "@/components/VideoWall/VideoGrid";
import { useWebSocket } from "@/hooks/use-websocket";
import { useMqtt } from "@/hooks/use-mqtt";
import { useVideoStreaming } from "@/hooks/video-wall/use-video-streaming";
import { useLayoutManagement } from "@/hooks/video-wall/use-layout-management";
import { useDragAndDrop } from "@/hooks/video-wall/use-drag-and-drop";
import { VideoWallViewMode } from "@/types/video-wall";

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
  
  // Custom hooks
  const { deviceBindings, setDeviceBindings } = useVideoStreaming(
    organizationId,
    token,
    location.state?.deviceBindings || []
  );
  const layoutManagement = useLayoutManagement();

  // Helper functions
  const getFilteredBindings = () => {
    return selectedSite === "all"
      ? deviceBindings
      : deviceBindings.filter((binding) => binding.site._id === selectedSite);
  };

  // Drag and drop handlers
  const dragAndDrop = useDragAndDrop(
    deviceBindings,
    setDeviceBindings,
    selectedSite,
    getFilteredBindings
  );

  // Initialize MQTT connection
  useEffect(() => {
    mqttService.initialize();
    return () => {
      mqttService.disconnect();
    };
  }, []);

  // Subscribe to MQTT topic
  useMqtt('your/mqtt/topic', (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received MQTT message:', data);
      // Handle the MQTT message data here
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
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

  if (!location.state?.deviceBindings) {
    return (
      <div className="min-h-screen h-full w-full bg-[#222222] p-4 flex items-center justify-center">
        <div className="text-white">No device bindings data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full w-full bg-[#222222] flex flex-col overflow-hidden">
      <Header
        selectedSite={selectedSite}
        deviceBindings={deviceBindings}
        viewMode={viewMode}
        layout={layoutManagement.layout}
        aspectRatio={layoutManagement.aspectRatio}
        savedLayouts={layoutManagement.savedLayouts}
        onSiteChange={setSelectedSite}
        onViewModeChange={setViewMode}
        onLayoutChange={layoutManagement.setLayout}
        onAspectRatioChange={layoutManagement.setAspectRatio}
        onSaveLayout={layoutManagement.handleSaveLayout}
        onLoadLayout={layoutManagement.handleLoadLayout}
        onDeleteLayout={layoutManagement.handleDeleteLayout}
      />
      <VideoGrid
        layout={layoutManagement.layout}
        viewMode={viewMode}
        filteredBindings={getFilteredBindings()}
        aspectRatio={layoutManagement.aspectRatio}
        onDragStart={dragAndDrop.handleDragStart}
        onDragOver={dragAndDrop.handleDragOver}
        onDrop={dragAndDrop.handleDrop}
      />
    </div>
  );
};

export default VideoWall;
