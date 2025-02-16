
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
    <div className="w-56">
      <Select value={selectedSite} onValueChange={onSiteChange}>
        <SelectTrigger className="bg-[#2D333F] text-white border-none shadow-sm h-10">
          <SelectValue placeholder="Select site" />
        </SelectTrigger>
        <SelectContent className="bg-[#2D333F] text-white border-[#3A4251]">
          <SelectItem value="all" className="hover:bg-[#3A4251]">All Sites</SelectItem>
          {deviceBindings.map((binding) => (
            <SelectItem 
              key={binding.site._id} 
              value={binding.site._id}
              className="hover:bg-[#3A4251]"
            >
              {binding.site.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
