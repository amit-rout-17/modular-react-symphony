
export const environment = {
  api: {
    baseUrl: 'https://api.example.com',
    version: 'v1',
    timeout: 30000, // 30 seconds
  },
  websocket: {
    url: 'wss://ws.example.com',
    reconnectInterval: 3000,
    maxRetries: 5,
  },
  auth: {
    tokenKey: 'app_token',
    refreshTokenKey: 'refresh_token',
  },
} as const;
