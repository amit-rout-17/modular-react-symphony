
/**
 * Get the grid layout class based on the selected layout
 * @param layout - Selected layout configuration
 * @returns Tailwind CSS grid class
 */
export const getLayoutClass = (layout: string): string => {
  switch (layout) {
    case "1":
      return "grid-cols-1";
    case "2":
      return "grid-cols-2";
    case "3":
      return "grid-cols-3";
    case "4":
      return "grid-cols-2 lg:grid-cols-4";
    default:
      return "grid-cols-2";
  }
};

/**
 * Get the grid size based on the layout
 * @param layout - Selected layout configuration
 * @returns Number of grid items
 */
export const getGridSize = (layout: string): number => {
  switch (layout) {
    case "1": return 1;
    case "2": return 4;
    case "3": return 6;
    case "4": return 8;
    default: return 4;
  }
};
