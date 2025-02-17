
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { layoutService, type LayoutConfig } from "@/services/layout/layout.service";

/**
 * Custom hook to manage layout configurations
 * @returns Layout management state and handlers
 */
export const useLayoutManagement = () => {
  const [savedLayouts, setSavedLayouts] = useState<LayoutConfig[]>([]);
  const [layout, setLayout] = useState("2");
  const [aspectRatio, setAspectRatio] = useState("16:9");

  useEffect(() => {
    loadSavedLayouts();
  }, []);

  const loadSavedLayouts = async () => {
    try {
      const layouts = await layoutService.getLayoutConfigs();
      setSavedLayouts(layouts);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load saved layouts",
      });
    }
  };

  const handleSaveLayout = async (name: string) => {
    await layoutService.saveLayout(name, layout, aspectRatio);
    loadSavedLayouts();
  };

  const handleLoadLayout = async (layoutConfig: LayoutConfig) => {
    setLayout(layoutConfig.layout);
    setAspectRatio(layoutConfig.aspectRatio);
    toast({
      title: "Success",
      description: "Layout loaded successfully",
    });
  };

  const handleDeleteLayout = async (id: string) => {
    try {
      await layoutService.deleteLayout(id);
      loadSavedLayouts();
      toast({
        title: "Success",
        description: "Layout deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete layout",
      });
    }
  };

  return {
    savedLayouts,
    layout,
    aspectRatio,
    setLayout,
    setAspectRatio,
    handleSaveLayout,
    handleLoadLayout,
    handleDeleteLayout,
  };
};
