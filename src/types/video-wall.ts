
export interface Site {
  _id: string;
  name: string;
}

export interface Payload {
  _id: string;
  is_delete: boolean;
  payload_index: string;
  edge_type: number;
  model: string;
  type: "Dock" | "FPV" | "Payload";
  created_at: string;
  updated_at: string;
}

export interface Device {
  name: string;
  model: string;
  device_type: string;
  serial_no: string;
  id: string;
  payloads: Payload[];
}

export interface ProcessedBinding {
  site: Site;
  droneDetails: Device | null;
  dockDetails: Device | null;
  streamingDetails?: {
    dock?: any;
    fpv?: any;
    payload?: any;
  };
}
