import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { websocketService } from "@/services/websocket/websocket.service";
import { videoStreamingService } from "@/services/api/video-streaming.service";
import {
  layoutService,
  type LayoutConfig,
} from "@/services/layout/layout.service";
import VideoSDK from "@/components/VideoSDK";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { LayoutControls } from "@/components/VideoWall/LayoutControls";
import { SaveLayoutDialog } from "@/components/VideoWall/SaveLayoutDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VideoFeed } from "@/components/VideoWall/VideoFeed";

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
  streamingDetails?: {
    drone?: any;
    dock?: any;
  };
}

const VideoWall = () => {
  const { organizationId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [deviceBindings, setDeviceBindings] = useState<ProcessedBinding[]>(
    location.state?.deviceBindings || []
  );
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"dock" | "drone">("dock");
  const [layout, setLayout] = useState("2");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [savedLayouts, setSavedLayouts] = useState<LayoutConfig[]>([]);

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
            const streamingDetails: { drone?: any; dock?: any } = {};

            if (binding.droneDetails) {
              try {
                streamingDetails.drone =
                  await videoStreamingService.getStreamingDetails(
                    token,
                    organizationId,
                    binding.droneDetails.id
                  );
              } catch (error) {
                console.error(`Error fetching drone streaming details:`, error);
              }
            }

            if (binding.dockDetails) {
              try {
                streamingDetails.dock =
                  await videoStreamingService.getStreamingDetails(
                    token,
                    organizationId,
                    binding.dockDetails.id
                  );
              } catch (error) {
                console.error(`Error fetching dock streaming details:`, error);
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

  const filteredBindings =
    selectedSite === "all"
      ? deviceBindings
      : deviceBindings.filter((binding) => binding.site._id === selectedSite);

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

    // Create a new array from the deviceBindings
    const newBindings = [...deviceBindings];

    // If we're in filtered view, we need to map the filtered indices to the original array
    if (selectedSite !== "all") {
      const originalDragIndex = deviceBindings.findIndex(
        (binding) => binding === filteredBindings[dragIndex]
      );
      const originalDropIndex = deviceBindings.findIndex(
        (binding) => binding === filteredBindings[dropIndex]
      );

      // Perform the swap in the original array
      [newBindings[originalDragIndex], newBindings[originalDropIndex]] = [
        newBindings[originalDropIndex],
        newBindings[originalDragIndex],
      ];
    } else {
      // Direct swap in the original array
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
          <div className="w-48">
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                <SelectItem value="all">All Sites</SelectItem>
                {deviceBindings.map((binding) => (
                  <SelectItem key={binding.site._id} value={binding.site._id}>
                    {binding.site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SaveLayoutDialog onSave={handleSaveLayout} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 text-white"
              >
                Load Layout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
              {savedLayouts.map((layoutConfig) => (
                <DropdownMenuItem
                  key={layoutConfig.id}
                  className="flex items-center justify-between gap-4 hover:bg-gray-700"
                  onClick={() => handleLoadLayout(layoutConfig)}
                >
                  <span>{layoutConfig.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLayout(layoutConfig.id);
                    }}
                  >
                    ×
                  </Button>
                </DropdownMenuItem>
              ))}
              {savedLayouts.length === 0 && (
                <DropdownMenuItem disabled className="text-gray-400">
                  No saved layouts
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <LayoutControls
            layout={layout}
            aspectRatio={aspectRatio}
            onLayoutChange={setLayout}
            onAspectRatioChange={setAspectRatio}
          />
          <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-md">
            <span
              className={`text-sm font-medium transition-colors ${
                viewMode === "dock" ? "text-white" : "text-gray-400"
              }`}
            >
              Dock
            </span>
            <Switch
              checked={viewMode === "drone"}
              onCheckedChange={(checked) =>
                setViewMode(checked ? "drone" : "dock")
              }
              className="data-[state=checked]:bg-green-600"
            />
            <span
              className={`text-sm font-medium transition-colors ${
                viewMode === "drone" ? "text-white" : "text-gray-400"
              }`}
            >
              Drone
            </span>
          </div>
        </div>
      </div>

      <div className={`grid ${getLayoutClass()} gap-4`}>
        {filteredBindings.map((binding, index) => {
          const isViewingDrone = viewMode === "drone";
          const streamingDetails = isViewingDrone
            ? binding.streamingDetails?.drone
            : binding.streamingDetails?.dock;
          const deviceDetails = isViewingDrone
            ? binding.droneDetails
            : binding.dockDetails;

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
                    <p className="text-lg">
                      No {isViewingDrone ? "drone" : "dock"} video feed
                      available
                    </p>
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
