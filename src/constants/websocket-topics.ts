
export const WEBSOCKET_TOPICS = [
  "drone_telemetry",
  "dock_status",
  "mission_updates",
  "device_health",
  "connection_status"
] as const;

export type WebSocketTopic = typeof WEBSOCKET_TOPICS[number];
