
import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { toast } from "@/components/ui/use-toast";

type MessageHandler = (topic: string, message: Buffer) => void;

export class MqttService {
  private static instance: MqttService;
  private client: MqttClient | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();

  private constructor() {}

  public static getInstance(): MqttService {
    if (!MqttService.instance) {
      MqttService.instance = new MqttService();
    }
    return MqttService.instance;
  }

  public initialize() {
    const mqttConfig = {
      host: 'cloud-dev.flytbase.com',
      port: 8883,
      username: 'flytnow-services',
      password: 'flytnow-services123',
      protocol: 'mqtts',
    };

    try {
      console.log('Connecting to MQTT broker...');
      this.client = mqtt.connect(`mqtt://${mqttConfig.host}`, {
        host: mqttConfig.host,
        port: mqttConfig.port,
        username: mqttConfig.username,
        password: mqttConfig.password,
        protocol: mqttConfig.protocol,
        rejectUnauthorized: false,
        clientId: `mqtt_client_${Math.random().toString(16).substring(2, 10)}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30 * 1000,
      });
      
      this.setupEventListeners();
    } catch (error) {
      console.error('MQTT connection error:', error);
      toast({
        variant: "destructive",
        title: "MQTT Connection Error",
        description: "Failed to connect to MQTT broker",
      });
    }
  }

  private setupEventListeners() {
    if (!this.client) return;

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      toast({
        title: "MQTT Connected",
        description: "Successfully connected to MQTT broker",
      });
      
      // Subscribe to default topic after connection
      this.subscribe('test/drone/position');
    });

    this.client.on('error', (error) => {
      console.error('MQTT error:', error);
      toast({
        variant: "destructive",
        title: "MQTT Error",
        description: error.message,
      });
    });

    this.client.on('message', (topic, message) => {
      console.log(`Received message on topic ${topic}:`, message.toString());
      this.messageHandlers.forEach(handler => handler(topic, message));
    });

    this.client.on('close', () => {
      console.log('MQTT connection closed');
    });
  }

  public subscribe(topic: string) {
    if (this.client?.connected) {
      this.client.subscribe(topic, (error) => {
        if (error) {
          console.error(`Error subscribing to topic ${topic}:`, error);
          toast({
            variant: "destructive",
            title: "MQTT Subscribe Error",
            description: `Failed to subscribe to topic ${topic}`,
          });
        } else {
          console.log(`Subscribed to topic: ${topic}`);
        }
      });
    }
  }

  public addMessageHandler(handler: MessageHandler) {
    this.messageHandlers.add(handler);
  }

  public removeMessageHandler(handler: MessageHandler) {
    this.messageHandlers.delete(handler);
  }

  public disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  public isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const mqttService = MqttService.getInstance();
