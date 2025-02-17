
import { ProcessedBinding, VideoWallViewMode } from "@/types/video-wall";
import { SiteSelector } from "./SiteSelector";
import { LayoutManager } from "./LayoutManager";
import { ViewModeSwitcher } from "./ViewModeSwitcher";
import { LayoutConfig } from "@/services/layout/layout.service";

interface HeaderProps {
  selectedSite: string;
  deviceBindings: ProcessedBinding[];
  viewMode: VideoWallViewMode;
  layout: string;
  aspectRatio: string;
  savedLayouts: LayoutConfig[];
  onSiteChange: (site: string) => void;
  onViewModeChange: (mode: VideoWallViewMode) => void;
  onLayoutChange: (layout: string) => void;
  onAspectRatioChange: (ratio: string) => void;
  onSaveLayout: (name: string) => Promise<void>;
  onLoadLayout: (layout: LayoutConfig) => void;
  onDeleteLayout: (id: string) => void;
}

export function Header({
  selectedSite,
  deviceBindings,
  viewMode,
  layout,
  aspectRatio,
  savedLayouts,
  onSiteChange,
  onViewModeChange,
  onLayoutChange,
  onAspectRatioChange,
  onSaveLayout,
  onLoadLayout,
  onDeleteLayout,
}: HeaderProps) {
  return (
    <div className="flex-none p-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <SiteSelector
            selectedSite={selectedSite}
            deviceBindings={deviceBindings}
            onSiteChange={onSiteChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <LayoutManager
            savedLayouts={savedLayouts}
            layout={layout}
            aspectRatio={aspectRatio}
            onLayoutChange={onLayoutChange}
            onAspectRatioChange={onAspectRatioChange}
            onSaveLayout={onSaveLayout}
            onLoadLayout={onLoadLayout}
            onDeleteLayout={onDeleteLayout}
          />
          <ViewModeSwitcher
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        </div>
      </div>
    </div>
  );
}
