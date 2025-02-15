
export interface LayoutConfig {
  id: string;
  name: string;
  layout: string;
  aspectRatio: string;
  createdAt: string;
}

class LayoutService {
  private STORAGE_KEY = 'video-wall-layouts';

  private getLayouts(): LayoutConfig[] {
    const layouts = localStorage.getItem(this.STORAGE_KEY);
    return layouts ? JSON.parse(layouts) : [];
  }

  private saveLayouts(layouts: LayoutConfig[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layouts));
  }

  async saveLayout(name: string, layout: string, aspectRatio: string): Promise<LayoutConfig> {
    const layouts = this.getLayouts();
    const newLayout: LayoutConfig = {
      id: crypto.randomUUID(),
      name,
      layout,
      aspectRatio,
      createdAt: new Date().toISOString()
    };
    
    layouts.push(newLayout);
    this.saveLayouts(layouts);
    return newLayout;
  }

  async getLayoutConfigs(): Promise<LayoutConfig[]> {
    return this.getLayouts();
  }

  async deleteLayout(id: string): Promise<void> {
    const layouts = this.getLayouts();
    const filteredLayouts = layouts.filter(layout => layout.id !== id);
    this.saveLayouts(filteredLayouts);
  }
}

export const layoutService = new LayoutService();
