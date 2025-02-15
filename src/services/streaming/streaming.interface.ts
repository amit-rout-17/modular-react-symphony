
export interface StreamingService {
  initialize(streamDetails: any): Promise<void>;
  startStream(): Promise<void>;
  stopStream(): Promise<void>;
  destroy(): void;
}
