
export interface Site {
  _id: string;
  name: string;
}

export interface DeviceDetails {
  name: string;
  model: string;
  device_type: string;
  serial_no: string;
  id: string;
  payload_index: string;
}

export interface ProcessedBinding {
  site: Site;
  fpvDetails: DeviceDetails[] | null;
  payloadDetails: DeviceDetails[] | null;
  dockDetails: DeviceDetails[] | null;
  streamingDetails?: {
    fpv?: any;
    payload?: any;
    dock?: any;
  };
}
