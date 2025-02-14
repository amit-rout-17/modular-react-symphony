
import { useEffect, useCallback } from 'react';
import { websocketService } from '@/services/websocket/websocket.service';

export function useWebSocket<T = any>(onMessage: (data: T) => void) {
  const messageHandler = useCallback((data: T) => {
    onMessage(data);
  }, [onMessage]);

  useEffect(() => {
    websocketService.addMessageHandler(messageHandler);
    return () => {
      websocketService.removeMessageHandler(messageHandler);
    };
  }, [messageHandler]);

  return {
    send: websocketService.send.bind(websocketService),
  };
}
