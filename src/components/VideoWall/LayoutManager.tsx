
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SaveLayoutDialog } from "./SaveLayoutDialog";
import { LayoutControls } from "./LayoutControls";
import { LayoutConfig } from "@/services/layout/layout.service";

interface LayoutManagerProps {
  savedLayouts: LayoutConfig[];
  layout: string;
  aspectRatio: string;
  onLayoutChange: (value: string) => void;
  onAspectRatioChange: (value: string) => void;
  onSaveLayout: (name: string) => Promise<void>;
  onLoadLayout: (layout: LayoutConfig) => void;
  onDeleteLayout: (id: string) => void;
}

export function LayoutManager({
  savedLayouts,
  layout,
  aspectRatio,
  onLayoutChange,
  onAspectRatioChange,
  onSaveLayout,
  onLoadLayout,
  onDeleteLayout,
}: LayoutManagerProps) {
  return (
    <>
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
    </>
  );
}
