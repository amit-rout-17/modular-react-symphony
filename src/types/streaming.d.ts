
export interface AgoraStreamingDetails {
  appid: string;
  rtc_token: string;
  url: string;  // Adding the url property
}

export interface MillicastStreamingDetails {
  publish_token: string;
  subscribe_token: string;
  archivingEnabled: boolean;
  endPoints: {
    publish_api_url: string;
    rtmp_publish_url: string;
    rtmps_publish_url: string;
    whip_endpoint: string;
    subscribe_api_url: string;
  };
}

export interface StreamingDetails {
  platform: "agora" | "millicast";
  url_type: number;
  url: string;
  millicast: MillicastStreamingDetails;
  agora: AgoraStreamingDetails;
  opentok: any;
  antmedia: any;
  mediamtx: any;
}
