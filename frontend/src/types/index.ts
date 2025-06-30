export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  verified: boolean;
  avatar?: string;
  university?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export const ItemStatus = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
  PENDING_PICKUP: 'PENDING_PICKUP'
} as const;

export type ItemStatusType = typeof ItemStatus[keyof typeof ItemStatus];

export const ItemCategory = {
  ELECTRONICS: 'ELECTRONICS',
  FURNITURE: 'FURNITURE',
  BOOKS: 'BOOKS',
  CLOTHING: 'CLOTHING',
  SPORTS: 'SPORTS',
  APPLIANCES: 'APPLIANCES',
  DECORATIONS: 'DECORATIONS',
  OTHER: 'OTHER'
} as const;

export type ItemCategoryType = typeof ItemCategory[keyof typeof ItemCategory];

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ItemCategoryType;
  status: ItemStatusType;
  condition: string;
  images: string;
  location?: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  seller: User;
}

export const AppointmentStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export type AppointmentStatusType = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatusType;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  itemId: string;
  item: Item;
  sellerId: string;
  seller: User;
  buyerId: string;
  buyer: User;
}

export const NotificationType = {
  ITEM_STATUS_CHANGE: 'ITEM_STATUS_CHANGE',
  APPOINTMENT_BOOKED: 'APPOINTMENT_BOOKED',
  APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  NEW_MESSAGE: 'NEW_MESSAGE'
} as const;

export type NotificationTypeType = typeof NotificationType[keyof typeof NotificationType];

export interface Notification {
  id: string;
  type: NotificationTypeType;
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
  userId: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}