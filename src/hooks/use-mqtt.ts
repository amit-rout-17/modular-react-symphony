
import { useEffect, useCallback } from 'react';
import { mqttService } from '@/services/mqtt/mqtt.service';

export function useMqtt(topic: string, onMessage: (topic: string, message: Buffer) => void) {
  const messageHandler = useCallback((receivedTopic: string, message: Buffer) => {
    if (receivedTopic === topic) {
      onMessage(receivedTopic, message);
    }
  }, [topic, onMessage]);

  useEffect(() => {
    mqttService.addMessageHandler(messageHandler);
    mqttService.subscribe(topic);

    return () => {
      mqttService.removeMessageHandler(messageHandler);
    };
  }, [topic, messageHandler]);

  return {
    isConnected: mqttService.isConnected(),
  };
}
