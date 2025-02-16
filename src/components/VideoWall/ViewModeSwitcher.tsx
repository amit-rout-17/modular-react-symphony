
import { Button } from "@/components/ui/button";

interface ViewModeSwitcherProps {
  viewMode: "dock" | "drone";
  onViewModeChange: (mode: "dock" | "drone") => void;
}

export function ViewModeSwitcher({ viewMode, onViewModeChange }: ViewModeSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-[#2D333F] p-1.5 rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange("dock")}
        className={`px-4 py-2 transition-all duration-200 ${
          viewMode === "dock"
            ? "bg-[#3A4251] text-white shadow-sm"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        Dock
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange("drone")}
        className={`px-4 py-2 transition-all duration-200 ${
          viewMode === "drone"
            ? "bg-[#3A4251] text-white shadow-sm"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        Drone
      </Button>
    </div>
  );
}
