
import { StreamingService } from "./streaming.interface";
import { MillicastStreamingDetails } from "@/types/streaming";
import { Director, Subscriber, WebRTCStats } from "@millicast/sdk";

export class MillicastStreamingService implements StreamingService {
  private streamDetails: MillicastStreamingDetails | null = null;
  private subscriber: Subscriber | null = null;
  private container: HTMLDivElement | null = null;
  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  async initialize(streamDetails: MillicastStreamingDetails): Promise<void> {
    this.streamDetails = streamDetails;
    
    // Create a subscriber instance
    const tokenGenerator = () => Promise.resolve(this.streamDetails?.subscribe_token || "");
    this.subscriber = new Subscriber(tokenGenerator);

    // Set up event listeners
    this.subscriber.on("track", (event) => {
      const { streams } = event;
      if (streams && streams[0]) {
        this.mediaStream = streams[0];
        this.playStream();
      }
    });

    this.subscriber.on("connectionError", (error) => {
      console.error("Millicast connection error:", error);
    });

    this.subscriber.on("webrtcStats", (stats: WebRTCStats) => {
      console.log("Millicast WebRTC stats:", stats);
    });
  }

  private playStream() {
    if (!this.container || !this.mediaStream) return;

    // Create video element if it doesn't exist
    if (!this.videoElement) {
      this.videoElement = document.createElement("video");
      this.videoElement.style.width = "100%";
      this.videoElement.style.height = "100%";
      this.videoElement.style.objectFit = "cover";
      this.videoElement.playsInline = true;
      this.videoElement.autoplay = true;
      this.container.appendChild(this.videoElement);
    }

    // Set the media stream as the source
    this.videoElement.srcObject = this.mediaStream;
    this.videoElement.play().catch(error => {
      console.error("Error playing Millicast stream:", error);
    });
  }

  setVideoContainer(container: HTMLDivElement): void {
    this.container = container;
    if (this.mediaStream) {
      this.playStream();
    }
  }

  async startStream(): Promise<void> {
    if (!this.streamDetails) {
      throw new Error("Millicast client not initialized");
    }

    try {
      // Get the Director instance
      const director = await Director.getSubscriber({
        streamName: this.extractStreamName(this.streamDetails.subscribe_api_url),
        streamAccountId: this.extractAccountId(this.streamDetails.subscribe_api_url),
      });

      // Connect to the WebSocket
      const { wsUrl, jwt } = await director.connect();
      
      // Connect the subscriber
      await this.subscriber?.connect({
        url: wsUrl,
        token: jwt,
      });

      console.log("Successfully connected to Millicast stream");
    } catch (error) {
      console.error("Error starting Millicast stream:", error);
      throw error;
    }
  }

  private extractStreamName(url: string): string {
    const match = url.match(/\/stream\/([^\/]+)/);
    if (!match) {
      throw new Error("Stream name not found in URL");
    }
    return match[1];
  }

  private extractAccountId(url: string): string {
    const match = url.match(/\/([^\/]+)\/stream/);
    if (!match) {
      throw new Error("Account ID not found in URL");
    }
    return match[1];
  }

  async stopStream(): Promise<void> {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      this.videoElement.remove();
      this.videoElement = null;
    }
    
    if (this.subscriber) {
      await this.subscriber.disconnect();
    }
    
    this.mediaStream = null;
  }

  destroy(): void {
    this.stopStream();
    this.streamDetails = null;
    this.subscriber = null;
    this.container = null;
  }
}
