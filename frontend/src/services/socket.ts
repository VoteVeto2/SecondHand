import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('🔗 Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join-room', roomId);
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('leave-room', roomId);
    }
  }

  onItemStatusUpdate(callback: (data: { itemId: string; status: string }) => void) {
    if (this.socket) {
      this.socket.on('item-status-updated', callback);
    }
  }

  onItemUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('item-updated', callback);
    }
  }

  onAppointmentUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('appointment-updated', callback);
    }
  }

  onAppointmentCreated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('appointment-created', callback);
    }
  }

  onNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  offItemStatusUpdate() {
    if (this.socket) {
      this.socket.off('item-status-updated');
    }
  }

  offItemUpdate() {
    if (this.socket) {
      this.socket.off('item-updated');
    }
  }

  offAppointmentUpdate() {
    if (this.socket) {
      this.socket.off('appointment-updated');
    }
  }

  offAppointmentCreated() {
    if (this.socket) {
      this.socket.off('appointment-created');
    }
  }

  offNotification() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  // Method to listen for all real-time updates
  onRealtimeUpdates(callbacks: {
    onItemStatusUpdate?: (data: { itemId: string; status: string }) => void;
    onItemUpdate?: (data: any) => void;
    onAppointmentUpdate?: (data: any) => void;
    onAppointmentCreated?: (data: any) => void;
    onNotification?: (data: any) => void;
  }) {
    if (callbacks.onItemStatusUpdate) this.onItemStatusUpdate(callbacks.onItemStatusUpdate);
    if (callbacks.onItemUpdate) this.onItemUpdate(callbacks.onItemUpdate);
    if (callbacks.onAppointmentUpdate) this.onAppointmentUpdate(callbacks.onAppointmentUpdate);
    if (callbacks.onAppointmentCreated) this.onAppointmentCreated(callbacks.onAppointmentCreated);
    if (callbacks.onNotification) this.onNotification(callbacks.onNotification);
  }

  // Method to remove all real-time listeners
  offRealtimeUpdates() {
    this.offItemStatusUpdate();
    this.offItemUpdate();
    this.offAppointmentUpdate();
    this.offAppointmentCreated();
    this.offNotification();
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();