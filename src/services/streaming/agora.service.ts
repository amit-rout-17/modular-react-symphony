
import { StreamingService } from "./streaming.interface";
import { AgoraStreamingDetails } from "@/types/streaming";
import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng";

export class AgoraStreamingService implements StreamingService {
  private client: IAgoraRTCClient | null = null;
  private streamDetails: AgoraStreamingDetails | null = null;

  async initialize(streamDetails: AgoraStreamingDetails): Promise<void> {
    this.streamDetails = streamDetails;
    this.client = AgoraRTC.createClient({ mode: "live", codec: "h264" });
  }

  async startStream(): Promise<void> {
    if (!this.client || !this.streamDetails) {
      throw new Error("Agora client not initialized");
    }

    try {
      await this.client.join(
        this.streamDetails.appid,
        "channel-name",
        this.streamDetails.rtc_token,
        null
      );
      console.log("Successfully joined Agora channel");
    } catch (error) {
      console.error("Error joining Agora channel:", error);
      throw error;
    }
  }

  async stopStream(): Promise<void> {
    if (this.client) {
      await this.client.leave();
    }
  }

  destroy(): void {
    if (this.client) {
      this.client.removeAllListeners();
      this.client = null;
    }
    this.streamDetails = null;
  }
}
