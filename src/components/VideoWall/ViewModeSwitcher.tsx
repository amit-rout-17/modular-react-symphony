
import { Button } from "@/components/ui/button";

interface ViewModeSwitcherProps {
  viewMode: "dock" | "fpv" | "payload";
  onViewModeChange: (mode: "dock" | "fpv" | "payload") => void;
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
        onClick={() => onViewModeChange("fpv")}
        className={`px-4 py-2 transition-colors ${
          viewMode === "fpv"
            ? "bg-gray-700 text-white"
            : "text-gray-400 hover:text-gray-300"
        }`}
      >
        FPV
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange("payload")}
        className={`px-4 py-2 transition-colors ${
          viewMode === "payload"
            ? "bg-gray-700 text-white"
            : "text-gray-400 hover:text-gray-300"
        }`}
      >
        Payload
      </Button>
    </div>
  );
}
