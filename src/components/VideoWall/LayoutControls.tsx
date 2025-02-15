
import { LayoutGrid, Monitor, Grid2X2, Grid3X3 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface LayoutControlsProps {
  layout: string;
  aspectRatio: string;
  onLayoutChange: (value: string) => void;
  onAspectRatioChange: (value: string) => void;
}

export function LayoutControls({ 
  layout, 
  aspectRatio, 
  onLayoutChange, 
  onAspectRatioChange 
}: LayoutControlsProps) {
  return (
    <div className="flex items-center space-x-4">
      <ToggleGroup type="single" value={layout} onValueChange={onLayoutChange}>
        <ToggleGroupItem value="1" className="bg-gray-800 hover:bg-gray-700 data-[state=on]:bg-green-600">
          <Monitor className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="2" className="bg-gray-800 hover:bg-gray-700 data-[state=on]:bg-green-600">
          <Grid2X2 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="3" className="bg-gray-800 hover:bg-gray-700 data-[state=on]:bg-green-600">
          <Grid3X3 className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="4" className="bg-gray-800 hover:bg-gray-700 data-[state=on]:bg-green-600">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup type="single" value={aspectRatio} onValueChange={onAspectRatioChange}>
        <ToggleGroupItem value="16:9" className="bg-gray-800 hover:bg-gray-700 data-[state=on]:bg-green-600">
          16:9
        </ToggleGroupItem>
        <ToggleGroupItem value="4:3" className="bg-gray-800 hover:bg-gray-700 data-[state=on]:bg-green-600">
          4:3
        </ToggleGroupItem>
        <ToggleGroupItem value="1:1" className="bg-gray-800 hover:bg-gray-700 data-[state=on]:bg-green-600">
          1:1
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
