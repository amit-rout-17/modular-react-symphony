
export const environment = {
  api: {
    baseUrl: "https://api-stag.flytbase.com",
    timeout: 30000,
  },
  websocket: {
    url: "wss://api-stag.flytbase.com",
    reconnectInterval: 3000,
    maxRetries: 5,
    socketServiceClientPath: "/ws", // Changed from /socket/socket.io to /ws
  },
  auth: {
    tokenKey: "app_token",
    refreshTokenKey: "refresh_token",
  },
} as const;
