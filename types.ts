
export enum UserRole {
  COURIER = 'COURIER',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  WAITING = 'WAITING',
  ACCEPTED = 'ACCEPTED',
  PICKING_UP = 'PICKING_UP',
  COLLECTED = 'COLLECTED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

export interface Address {
  label: string;
  address: string;
  lat: number;
  lng: number;
}

export interface OrderDimensions {
  width: number;
  height: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatarUrl?: string;
  document: string;
  balance: number;
  rating: number;
  totalRatings: number;
  isVerified: boolean;
}

// Optional interface representing courier-specific fields stored in `couriers`
export interface Courier {
  id: string; // same as profiles.id
  vehiclePlate?: string;
  balance: number;
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  updatedAt?: string;
}

export interface Order {
  id: string;
  clientId: string;
  courierId?: string;
  packageCount: number;
  dimensions: OrderDimensions;
  pickupAddresses: Address[];
  deliveryAddresses: Address[];
  distanceKm: number;
  totalValue: number;
  courierEarnings: number;
  status: OrderStatus;
  createdAt: string;
  observations?: string;
  clientRated?: boolean;
  courierRated?: boolean;
}
