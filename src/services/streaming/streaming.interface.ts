
export interface StreamingService {
  initialize(streamDetails: any): Promise<void>;
  startStream(): Promise<void>;
  stopStream(): Promise<void>;
  destroy(): void;
  setVideoContainer?(container: HTMLDivElement): void;
  setPauseState?(paused: boolean): void;
}
