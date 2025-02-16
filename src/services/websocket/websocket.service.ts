
import { io, Socket } from "socket.io-client";
import { environment } from "@/config/environment";
import { WEBSOCKET_TOPICS, WebSocketTopic } from "@/constants/websocket-topics";

type MessageHandler = (data: any) => void;
interface SocketAuth {
  token: string;
  organizationId: string;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private auth: SocketAuth | null = null;
  private subscribedTopics: Set<WebSocketTopic> = new Set();

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
      this.socket = io(environment.websocket.url, {
        path: environment.websocket.socketServiceClientPath,
        transports: ["websocket"],
        auth: {
          authorization: `Bearer ${this.auth.token}`,
          "org-id": this.auth.organizationId,
        },
        reconnection: true,
        reconnectionAttempts: environment.websocket.maxRetries,
        reconnectionDelay: environment.websocket.reconnectInterval,
        timeout: 10000,
      });

      this.setupEventListeners();
      this.subscribeToAllTopics();
    } catch (error) {
      console.error("Socket.IO connection failed:", error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket.IO connected successfully");
      console.log("Transport type:", this.socket?.io.engine.transport.name);
      console.log("Socket ID:", this.socket?.id);
      this.subscribeToAllTopics(); // Resubscribe on reconnection
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.IO disconnected. Reason:", reason);
    });

    this.socket.on("error", (error) => {
      console.error("Socket.IO error:", error);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      console.error("Error details:", {
        message: error.message,
        transport: this.socket?.io.engine.transport.name,
      });
    });

    // Subscribe to all topics
    WEBSOCKET_TOPICS.forEach(topic => {
      this.socket?.on(topic, (data: any) => {
        try {
          this.messageHandlers.forEach((handler) => handler({ topic, data }));
        } catch (error) {
          console.error(`Error handling Socket.IO message for topic ${topic}:`, error);
        }
      });
    });
  }

  private subscribeToAllTopics() {
    if (!this.socket?.connected) return;

    WEBSOCKET_TOPICS.forEach(topic => {
      if (!this.subscribedTopics.has(topic)) {
        this.socket?.emit('subscribe', topic);
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
    if (this.socket?.connected) {
      this.socket.emit("message", data);
    } else {
      console.error("Socket.IO is not connected");
    }
  }

  public disconnect() {
    if (this.socket) {
      // Unsubscribe from all topics
      this.subscribedTopics.forEach(topic => {
        this.socket?.emit('unsubscribe', topic);
      });
      this.subscribedTopics.clear();
      
      this.socket.disconnect();
      this.socket = null;
    }
    this.auth = null;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = WebSocketService.getInstance();
