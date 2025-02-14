
export const environment = {
  api: {
    baseUrl: 'https://api-stag.flytbase.com',
    version: 'v2',
    timeout: 30000,
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
