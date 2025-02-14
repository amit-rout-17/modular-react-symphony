
import { io, Socket } from 'socket.io-client';
import { environment } from '@/config/environment';

type MessageHandler = (data: any) => void;

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();

  private constructor() {
    this.connect();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private connect() {
    try {
      this.socket = io(environment.websocket.url, {
        reconnection: true,
        reconnectionAttempts: environment.websocket.maxRetries,
        reconnectionDelay: environment.websocket.reconnectInterval,
        transports: ['websocket'],
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Socket.IO connection failed:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    // Handle incoming messages
    this.socket.on('message', (data: any) => {
      try {
        this.messageHandlers.forEach((handler) => handler(data));
      } catch (error) {
        console.error('Error handling Socket.IO message:', error);
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
      this.socket.emit('message', data);
    } else {
      console.error('Socket.IO is not connected');
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const websocketService = WebSocketService.getInstance();
