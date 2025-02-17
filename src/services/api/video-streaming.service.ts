
import { httpService } from "./http.service";

interface StreamingDetails {
  [key: string]: any;
}

class VideoStreamingService {
  private static instance: VideoStreamingService;

  private constructor() {}

  public static getInstance(): VideoStreamingService {
    if (!VideoStreamingService.instance) {
      VideoStreamingService.instance = new VideoStreamingService();
    }
    return VideoStreamingService.instance;
  }

  public async getStreamingDetails(
    token: string,
    organizationId: string,
    deviceId: string,
    payloadIndex: string
  ): Promise<StreamingDetails> {
    const streamName = `${deviceId}_${payloadIndex}`;
    console.log('Requesting stream:', streamName);
    
    return httpService.request<StreamingDetails>(
      "video_streaming/token/get_streaming_details",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Org-Id": organizationId,
          "Device-Id": deviceId,
          streamname: streamName,
          Accept: "application/json, text/plain, */*",
        },
      }
    );
  }
}

export const videoStreamingService = VideoStreamingService.getInstance();
