
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SaveLayoutDialog } from "./SaveLayoutDialog";
import { LayoutControls } from "./LayoutControls";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProcessedBinding, LayoutConfig } from "@/types/video";

interface ControlPanelProps {
  selectedSite: string;
  viewMode: "dock" | "drone";
  layout: string;
  aspectRatio: string;
  deviceBindings: ProcessedBinding[];
  savedLayouts: LayoutConfig[];
  onSiteChange: (value: string) => void;
  onViewModeChange: (checked: boolean) => void;
  onLayoutChange: (value: string) => void;
  onAspectRatioChange: (value: string) => void;
  onSaveLayout: (name: string) => Promise<void>;
  onLoadLayout: (layout: LayoutConfig) => void;
  onDeleteLayout: (id: string) => Promise<void>;
}

export function ControlPanel({
  selectedSite,
  viewMode,
  layout,
  aspectRatio,
  deviceBindings,
  savedLayouts,
  onSiteChange,
  onViewModeChange,
  onLayoutChange,
  onAspectRatioChange,
  onSaveLayout,
  onLoadLayout,
  onDeleteLayout,
}: ControlPanelProps) {
  return (
    <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select value={selectedSite} onValueChange={onSiteChange}>
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
        <SaveLayoutDialog onSave={onSaveLayout} />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-gray-800 hover:bg-gray-700 text-white">
              Load Layout
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
            {savedLayouts.map((layoutConfig) => (
              <DropdownMenuItem
                key={layoutConfig.id}
                className="flex items-center justify-between gap-4 hover:bg-gray-700"
                onClick={() => onLoadLayout(layoutConfig)}
              >
                <span>{layoutConfig.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLayout(layoutConfig.id);
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
          onLayoutChange={onLayoutChange}
          onAspectRatioChange={onAspectRatioChange}
        />

        <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-md">
          <span className={`text-sm font-medium transition-colors ${viewMode === 'dock' ? 'text-white' : 'text-gray-400'}`}>
            Dock
          </span>
          <Switch 
            checked={viewMode === "drone"}
            onCheckedChange={onViewModeChange}
            className="data-[state=checked]:bg-green-600"
          />
          <span className={`text-sm font-medium transition-colors ${viewMode === 'drone' ? 'text-white' : 'text-gray-400'}`}>
            Drone
          </span>
        </div>
      </div>
    </div>
  );
}
