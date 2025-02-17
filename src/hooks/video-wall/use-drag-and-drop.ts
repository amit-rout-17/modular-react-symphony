
import { ProcessedBinding } from "@/types/video-wall";
import { toast } from "@/components/ui/use-toast";

export const useDragAndDrop = (
  deviceBindings: ProcessedBinding[],
  setDeviceBindings: (bindings: ProcessedBinding[]) => void,
  selectedSite: string,
  getFilteredBindings: () => ProcessedBinding[]
) => {
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

    const newBindings = [...deviceBindings];
    const filteredBindings = getFilteredBindings();

    if (selectedSite !== "all") {
      const originalDragIndex = deviceBindings.findIndex(
        (binding) => binding === filteredBindings[dragIndex]
      );
      const originalDropIndex = deviceBindings.findIndex(
        (binding) => binding === filteredBindings[dropIndex]
      );

      [newBindings[originalDragIndex], newBindings[originalDropIndex]] = [
        newBindings[originalDropIndex],
        newBindings[originalDragIndex],
      ];
    } else {
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

  return {
    handleDragStart,
    handleDragOver,
    handleDrop
  };
};
