
import { Button } from "@/components/ui/button";

interface ViewModeSwitcherProps {
  viewMode: "dock" | "drone";
  onViewModeChange: (mode: "dock" | "drone") => void;
}

export function ViewModeSwitcher({ viewMode, onViewModeChange }: ViewModeSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange("dock")}
        className={`px-4 py-2 transition-colors ${
          viewMode === "dock"
            ? "bg-gray-700 text-white"
            : "text-gray-400 hover:text-gray-300"
        }`}
      >
        Dock
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange("drone")}
        className={`px-4 py-2 transition-colors ${
          viewMode === "drone"
            ? "bg-gray-700 text-white"
            : "text-gray-400 hover:text-gray-300"
        }`}
      >
        Drone
      </Button>
    </div>
  );
}
