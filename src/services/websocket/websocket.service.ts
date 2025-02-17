
import { environment } from "@/config/environment";
import { WEBSOCKET_TOPICS, WebSocketTopic } from "@/constants/websocket-topics";

type MessageHandler = (data: any) => void;
interface SocketAuth {
  token: string;
  organizationId: string;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private auth: SocketAuth | null = null;
  private subscribedTopics: Set<WebSocketTopic> = new Set();
  private reconnectAttempts: number = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public initialize(auth: SocketAuth) {
    this.auth = auth;
    this.connect();
  }

  private connect() {
    if (!this.auth) {
      console.error("Authentication details not provided");
      return;
    }

    try {
      // Convert HTTP/HTTPS to WS/WSS
      const wsUrl = environment.websocket.url.replace(/^http/, 'ws');
      const url = new URL(wsUrl);
      url.pathname = environment.websocket.socketServiceClientPath;
      url.searchParams.append('authorization', `Bearer ${this.auth.token}`);
      url.searchParams.append('org-id', this.auth.organizationId);

      this.socket = new WebSocket(url.toString());
      this.setupEventListeners();
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      this.handleReconnection();
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log("WebSocket connected successfully");
      this.reconnectAttempts = 0;
      this.subscribeToAllTopics();
    };

    this.socket.onclose = (event) => {
      console.log("WebSocket disconnected. Code:", event.code, "Reason:", event.reason);
      this.handleReconnection();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.topic && message.data) {
          console.log(`Received message for topic ${message.topic}:`, message.data);
          this.messageHandlers.forEach((handler) => {
            handler({ topic: message.topic, data: message.data });
          });
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= environment.websocket.maxRetries) {
      console.error("Max reconnection attempts reached");
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${environment.websocket.maxRetries})`);
      this.reconnectAttempts++;
      this.connect();
    }, environment.websocket.reconnectInterval);
  }

  private subscribeToAllTopics() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    WEBSOCKET_TOPICS.forEach(topic => {
      if (!this.subscribedTopics.has(topic)) {
        this.send({ type: 'subscribe', topic });
        this.subscribedTopics.add(topic);
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  }

  public addMessageHandler(handler: MessageHandler) {
    this.messageHandlers.add(handler);
  }

  public removeMessageHandler(handler: MessageHandler) {
    this.messageHandlers.delete(handler);
  }

  public send(data: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  public disconnect() {
    if (this.socket) {
      // Unsubscribe from all topics before disconnecting
      this.subscribedTopics.forEach(topic => {
        this.send({ type: 'unsubscribe', topic });
      });
      this.subscribedTopics.clear();
      
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.auth = null;
    this.reconnectAttempts = 0;
  }

  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = WebSocketService.getInstance();
