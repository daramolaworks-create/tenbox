export enum ShipmentStatus {
  DRAFT = 'DRAFT',
  QUOTING = 'QUOTING',
  BOOKED = 'BOOKED',
  PICKING_UP = 'PICKING_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  EXCEPTION = 'EXCEPTION'
}

export enum ServiceLevel {
  SAVER = 'SAVER', // Next day
  STANDARD = 'STANDARD', // Same day, flexible
  RUSH = 'RUSH' // Immediate
}

export interface Address {
  raw: string;
  formatted?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  notes?: string;
}

export interface ShipmentRequest {
  id: string;
  pickup: Address;
  dropoff: Address;
  itemDescription: string;
  createdAt: string;
  status: ShipmentStatus;
  selectedQuoteId?: string;
}

export interface Quote {
  id: string;
  serviceLevel: ServiceLevel;
  price: number;
  currency: string;
  eta: string; // "Today 2pm"
  courierName: string; // The underlying courier selected by Tenbox
  reliabilityScore: number; // 0-100
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  description: string;
  location?: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  pickup: string;
  dropoff: string;
  status: ShipmentStatus;
  price: number;
  item: string;
}