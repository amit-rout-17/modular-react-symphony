
import { StreamingService } from "./streaming.interface";
import { AgoraStreamingDetails } from "@/types/streaming";
import AgoraRTC, {
  IAgoraRTCClient,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  AgoraRTCStats,
  RemoteAudioTrackStats,
  RemoteVideoTrackStats,
} from "agora-rtc-sdk-ng";

export interface AgoraStats {
  networkQuality?: {
    uplinkNetworkQuality: number;
    downlinkNetworkQuality: number;
  };
  rtc?: AgoraRTCStats;
  video?: RemoteVideoTrackStats;
  audio?: RemoteAudioTrackStats;
}

export class AgoraStreamingService implements StreamingService {
  private client: IAgoraRTCClient | null = null;
  private streamDetails: AgoraStreamingDetails | null = null;
  private remoteVideoTrack: IRemoteVideoTrack | null = null;
  private remoteAudioTrack: IRemoteAudioTrack | null = null;
  private container: HTMLDivElement | null = null;
  private statsInterval: NodeJS.Timeout | null = null;
  private onStatsUpdate: ((stats: AgoraStats) => void) | null = null;
  private lastNetworkQuality: { uplink: number; downlink: number } = { uplink: 0, downlink: 0 };

  private extractChannelFromUrl(url: string): string {
    const params = new URLSearchParams(url);
    const channel = params.get("channel");
    if (!channel) {
      throw new Error("Channel name not found in URL");
    }
    return channel;
  }

  setStatsCallback(callback: (stats: AgoraStats) => void) {
    this.onStatsUpdate = callback;
  }

  private startStatsMonitoring() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    // Set up network quality callback
    if (this.client) {
      this.client.on("network-quality", (stats) => {
        this.lastNetworkQuality = {
          uplink: stats.uplinkNetworkQuality,
          downlink: stats.downlinkNetworkQuality
        };
      });
    }

    this.statsInterval = setInterval(async () => {
      if (!this.client || !this.onStatsUpdate) return;

      const stats: AgoraStats = {};

      // Get network quality stats from stored values
      stats.networkQuality = {
        uplinkNetworkQuality: this.lastNetworkQuality.uplink,
        downlinkNetworkQuality: this.lastNetworkQuality.downlink,
      };

      // Get RTC connection stats
      stats.rtc = this.client.getRTCStats();

      // Get remote video track stats
      if (this.remoteVideoTrack) {
        stats.video = this.remoteVideoTrack.getStats();
      }

      // Get remote audio track stats
      if (this.remoteAudioTrack) {
        stats.audio = this.remoteAudioTrack.getStats();
      }

      this.onStatsUpdate(stats);
    }, 1000);
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
      this.startStatsMonitoring();
    } catch (error) {
      console.error("Error joining Agora channel:", error);
      throw error;
    }
  }

  async stopStream(): Promise<void> {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

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
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    if (this.client) {
      this.client.removeAllListeners();
      this.client = null;
    }
    this.streamDetails = null;
    this.container = null;
    this.remoteVideoTrack = null;
    this.remoteAudioTrack = null;
    this.onStatsUpdate = null;
  }
}
