
import { StreamingService } from "./streaming.interface";
import { AgoraStreamingDetails } from "@/types/streaming";
import AgoraRTC, { IAgoraRTCClient, IRemoteVideoTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng";

export class AgoraStreamingService implements StreamingService {
  private client: IAgoraRTCClient | null = null;
  private streamDetails: AgoraStreamingDetails | null = null;
  private remoteVideoTrack: IRemoteVideoTrack | null = null;
  private remoteAudioTrack: IRemoteAudioTrack | null = null;
  private container: HTMLDivElement | null = null;

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
    
    // Set up user role as audience for live streaming
    await this.client.setClientRole("audience");

    // Set up event handlers
    this.client.on("user-published", async (user, mediaType) => {
      console.log("User published:", user.uid, mediaType);
      await this.client.subscribe(user, mediaType);
      
      if (mediaType === "video") {
        this.remoteVideoTrack = user.videoTrack;
        if (this.container && this.remoteVideoTrack) {
          this.remoteVideoTrack.play(this.container);
        }
      }
      
      if (mediaType === "audio") {
        this.remoteAudioTrack = user.audioTrack;
        this.remoteAudioTrack?.play();
      }
    });

    this.client.on("user-unpublished", (user, mediaType) => {
      console.log("User unpublished:", user.uid, mediaType);
      if (mediaType === "video") {
        this.remoteVideoTrack = null;
      }
      if (mediaType === "audio") {
        this.remoteAudioTrack = null;
      }
    });
  }

  setVideoContainer(container: HTMLDivElement): void {
    this.container = container;
    // If we already have a video track, play it in the new container
    if (this.remoteVideoTrack && this.container) {
      this.remoteVideoTrack.play(this.container);
    }
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
    if (this.remoteVideoTrack) {
      this.remoteVideoTrack.stop();
      this.remoteVideoTrack = null;
    }
    if (this.remoteAudioTrack) {
      this.remoteAudioTrack.stop();
      this.remoteAudioTrack = null;
    }
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
    this.container = null;
    this.remoteVideoTrack = null;
    this.remoteAudioTrack = null;
  }
}
