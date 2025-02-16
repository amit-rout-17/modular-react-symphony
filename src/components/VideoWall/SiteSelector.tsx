
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProcessedBinding } from "@/types/video-wall";

interface SiteSelectorProps {
  selectedSite: string;
  deviceBindings: ProcessedBinding[];
  onSiteChange: (value: string) => void;
}

export function SiteSelector({ selectedSite, deviceBindings, onSiteChange }: SiteSelectorProps) {
  return (
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
  );
}
