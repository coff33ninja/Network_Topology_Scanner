import { store } from '../store';
import { updateDeviceStatus } from '../store/slices/deviceSlice';
import { addAlert } from '../store/slices/alertSlice';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;

  connect() {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8765';
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
  }

  private handleOpen() {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
    
    // Subscribe to updates
    this.send({
      type: 'subscribe',
      data: {
        topics: ['device_status', 'alerts', 'scan_status']
      }
    });
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'device_status':
          store.dispatch(updateDeviceStatus(message.data));
          break;
        
        case 'alert':
          store.dispatch(addAlert(message.data));
          break;
        
        case 'scan_status':
          // Handle scan status updates
          break;
        
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }

  private handleClose() {
    console.log('WebSocket disconnected');
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectTimeout * this.reconnectAttempts);
    } else {
      store.dispatch(addAlert({
        type: 'error',
        message: 'WebSocket connection failed after multiple attempts'
      }));
    }
  }

  private handleError(error: Event) {
    console.error('WebSocket error:', error);
    store.dispatch(addAlert({
      type: 'error',
      message: 'WebSocket connection error'
    }));
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;