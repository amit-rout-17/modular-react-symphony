
import { httpService } from "./http.service";

interface StreamingDetails {
  // Add specific streaming details interface based on API response
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
    return httpService.request<StreamingDetails>(
      "video_streaming/token/get_streaming_details",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Org-Id": organizationId,
          "Device-Id": deviceId,
          streamname: `${deviceId}_${payloadIndex}`,
          Accept: "application/json, text/plain, */*",
        },
      }
    );
  }
}

export const videoStreamingService = VideoStreamingService.getInstance();
