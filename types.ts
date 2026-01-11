
export interface CartItem {
  id: string;
  title: string;
  store: string;
  quantity: number;
  notes: string;
  image: string;
  price: number;
  url: string;
}

export type TabType = 'home' | 'shop' | 'cart' | 'track' | 'settings';

export type ShipmentStatus = 'pre_transit' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';

export interface ShipmentEvent {
  date: string;
  status: ShipmentStatus;
  description: string;
  location: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  carrier: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  events: ShipmentEvent[];
  itemsString: string; // e.g., "Nike Shoes + 2 others"
  image?: string;
}
