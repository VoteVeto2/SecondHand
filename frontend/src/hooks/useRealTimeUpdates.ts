import { useEffect } from 'react';
import { useAppDispatch } from './redux';
import { socketService } from '../services/socket';
import { updateItemStatus } from '../store/slices/itemsSlice';
import { fetchAppointments } from '../store/slices/appointmentsSlice';
import { fetchNotifications } from '../store/slices/notificationsSlice';

interface UseRealTimeUpdatesProps {
  userId?: string;
  onItemStatusUpdate?: (data: { itemId: string; status: string }) => void;
  onNotification?: (data: any) => void;
}

export const useRealTimeUpdates = ({
  userId,
  onItemStatusUpdate,
  onNotification
}: UseRealTimeUpdatesProps = {}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Connect to socket if not already connected
    if (!socketService.getSocket()?.connected) {
      socketService.connect();
    }

    // Set up real-time listeners
    const handleItemStatusUpdate = (data: { itemId: string; status: string }) => {
      console.log('📊 Real-time item status update:', data);
      
      // Update the items store
      dispatch(updateItemStatus({ id: data.itemId, status: data.status as any }));
      
      // Call custom callback if provided
      if (onItemStatusUpdate) {
        onItemStatusUpdate(data);
      }
    };

    const handleItemUpdate = (item: any) => {
      console.log('📦 Real-time item update:', item);
      
      // Update the item status if it has changed
      dispatch(updateItemStatus({ id: item.id, status: item.status }));
    };

    const handleAppointmentUpdate = (appointment: any) => {
      console.log('📅 Real-time appointment update:', appointment);
      
      // Refresh appointments if user is involved
      if (userId && (appointment.sellerId === userId || appointment.buyerId === userId)) {
        dispatch(fetchAppointments());
      }
    };

    const handleAppointmentCreated = (appointment: any) => {
      console.log('📅 Real-time appointment created:', appointment);
      
      // Refresh appointments if user is involved
      if (userId && (appointment.sellerId === userId || appointment.buyerId === userId)) {
        dispatch(fetchAppointments());
      }
    };

    const handleNotification = (notification: any) => {
      console.log('🔔 Real-time notification:', notification);
      
      // Refresh notifications
      if (userId) {
        dispatch(fetchNotifications());
      }
      
      // Call custom callback if provided
      if (onNotification) {
        onNotification(notification);
      }
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png',
          tag: notification.id
        });
      }
    };

    // Set up listeners
    socketService.onRealtimeUpdates({
      onItemStatusUpdate: handleItemStatusUpdate,
      onItemUpdate: handleItemUpdate,
      onAppointmentUpdate: handleAppointmentUpdate,
      onAppointmentCreated: handleAppointmentCreated,
      onNotification: handleNotification
    });

    // Join user-specific room if userId is provided
    if (userId) {
      socketService.joinRoom(`user-${userId}`);
    }

    // Cleanup function
    return () => {
      socketService.offRealtimeUpdates();
      if (userId) {
        socketService.leaveRoom(`user-${userId}`);
      }
    };
  }, [dispatch, userId, onItemStatusUpdate, onNotification]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, []);

  return {
    socket: socketService.getSocket(),
    isConnected: socketService.getSocket()?.connected || false
  };
};

export default useRealTimeUpdates;