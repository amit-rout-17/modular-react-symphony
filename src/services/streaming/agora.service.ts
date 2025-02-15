
import { StreamingService } from "./streaming.interface";
import { AgoraStreamingDetails } from "@/types/streaming";
import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng";

export class AgoraStreamingService implements StreamingService {
  private client: IAgoraRTCClient | null = null;
  private streamDetails: AgoraStreamingDetails | null = null;

  private extractChannelFromUrl(url: string): string {
    const params = new URLSearchParams(url);
    const channel = params.get('channel');
    if (!channel) {
      throw new Error("Channel name not found in URL");
    }
    return channel;
  }

  async initialize(streamDetails: AgoraStreamingDetails): Promise<void> {
    this.streamDetails = streamDetails;
    this.client = AgoraRTC.createClient({ mode: "live", codec: "h264" });
  }

  async startStream(): Promise<void> {
    if (!this.client || !this.streamDetails) {
      throw new Error("Agora client not initialized");
    }

    try {
      const channelName = this.extractChannelFromUrl(this.streamDetails.url);
      await this.client.join(
        this.streamDetails.appid,
        channelName,
        this.streamDetails.rtc_token,
        null
      );
      console.log("Successfully joined Agora channel:", channelName);
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
