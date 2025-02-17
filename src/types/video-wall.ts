
export interface Site {
  _id: string;
  name: string;
}

export interface Device {
  name: string;
  model: string;
  device_type: string;
  serial_no: string;
  id: string;
  payload_index?: string;
}

export interface ProcessedBinding {
  site: Site;
  droneDetails: Device | null;
  dockDetails: Device | null;
  streamingDetails?: {
    drone?: any;
    dock?: any;
  };
}
