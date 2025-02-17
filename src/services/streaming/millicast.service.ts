
import { StreamingService } from "./streaming.interface";
import { MillicastStreamingDetails } from "@/types/streaming";
import { View, Director } from '@millicast/sdk';

export class MillicastStreamingService implements StreamingService {
  private streamDetails: MillicastStreamingDetails | null = null;
  private videoContainer: HTMLDivElement | null = null;
  private millicastView: View | null = null;

  async initialize(streamDetails: MillicastStreamingDetails): Promise<void> {
    this.streamDetails = streamDetails;
  }

  setVideoContainer(container: HTMLDivElement): void {
    this.videoContainer = container;
  }

  async startStream(): Promise<void> {
    if (!this.streamDetails || !this.videoContainer) {
      throw new Error("Millicast client not initialized or video container not set");
    }

    try {
      // Initialize Director client
      const director = new Director();

      // Get connection options for subscriber
      const streamName = this.extractStreamName(this.streamDetails.endPoints.rtmp_publish_url);
      const options = await Director.getSubscriber({
        streamAccountId: streamName,
        streamName: streamName,
        subscriberToken: this.streamDetails.subscribe_token,
      });

      // Create and configure video element
      const mediaElement = this.videoContainer.querySelector('video') || document.createElement('video');
      mediaElement.id = `millicast-video-${streamName}`;
      mediaElement.autoplay = true;
      mediaElement.playsInline = true;
      if (!mediaElement.parentElement) {
        this.videoContainer.appendChild(mediaElement);
      }

      // Initialize View with correct parameters
      this.millicastView = new View(mediaElement.id, options);

      // Connect and start viewing the stream
      await this.millicastView.connect();
      console.log("Millicast stream connected successfully");
    } catch (error) {
      console.error("Error starting Millicast stream:", error);
      throw error;
    }
  }

  private extractStreamName(rtmpUrl: string): string {
    // Extract stream name from RTMP URL
    // Example URL: rtmp://rtmp-auto.millicast.com:1935/v2/pub/streamName
    const parts = rtmpUrl.split('/');
    return parts[parts.length - 1].split('?')[0]; // Remove any query parameters
  }

  async stopStream(): Promise<void> {
    if (this.millicastView) {
      try {
        await this.millicastView.stop();
        this.millicastView = null;
        console.log("Millicast stream stopped");
      } catch (error) {
        console.error("Error stopping Millicast stream:", error);
      }
    }
  }

  destroy(): void {
    this.stopStream();
    this.streamDetails = null;
    this.videoContainer = null;
  }
}
