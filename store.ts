import { create } from 'zustand';
import { CartItem, Shipment } from './types';

export interface Address {
  id: string;
  label: string; // e.g. "Home", "Office"
  street: string;
  city: string;
  zip: string;
  country: string;
  default?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface NotificationPrefs {
  orderUpdates: boolean;
  promotions: boolean;
  newFeatures: boolean;
}

interface AppState {
  // Cart
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  // Shipments
  shipments: Shipment[];
  addShipment: (shipment: Shipment) => void;

  // User Profile
  user: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Addresses
  addresses: Address[];
  addAddress: (address: Address) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  removeAddress: (id: string) => void;

  // Notifications
  notifications: NotificationPrefs;
  toggleNotification: (key: keyof NotificationPrefs) => void;

  // Orders (History)
  orderHistory: any[]; // Using simplified structure for now
}

export const useCartStore = create<AppState>((set) => ({
  // Cart Logic
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find((i) => i.id === item.id);
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      };
    }
    return { items: [...state.items, item] };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id)
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map((i) =>
      i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
    )
  })),
  clearCart: () => set({ items: [] }),

  // Shipments
  shipments: [
    {
      id: 's1',
      trackingNumber: 'TBX-84920156',
      carrier: 'Tenbox Express',
      status: 'in_transit',
      origin: 'Tokyo, JP',
      destination: 'San Francisco, US',
      estimatedDelivery: 'Jan 14',
      itemsString: 'Sony WH-1000XM5',
      events: [
        { date: 'Jan 09, 10:00 AM', status: 'in_transit', description: 'Arrived at sorting facility', location: 'Los Angeles Gateway' },
        { date: 'Jan 08, 04:30 PM', status: 'in_transit', description: 'Departed origin country', location: 'Narita Intl Airport' },
        { date: 'Jan 08, 09:15 AM', status: 'pre_transit', description: 'Package received by carrier', location: 'Tokyo Logistics Center' },
      ]
    },
    {
      id: 's2',
      trackingNumber: 'TBX-11029384',
      carrier: 'DHL',
      status: 'delivered',
      origin: 'London, UK',
      destination: 'New York, US',
      estimatedDelivery: 'Jan 05',
      itemsString: 'ASOS Summer Collection',
      events: [
        { date: 'Jan 05, 02:45 PM', status: 'delivered', description: 'Delivered to front porch', location: 'New York, NY' },
        { date: 'Jan 05, 08:30 AM', status: 'out_for_delivery', description: 'Out for delivery', location: 'Brooklyn Facility' },
      ]
    }
  ],
  addShipment: (shipment) => set((state) => ({ shipments: [shipment, ...state.shipments] })),

  // User Profile
  user: {
    name: 'Wudan',
    email: 'wudan@tenbox.com',
  },
  updateProfile: (profile) => set((state) => ({ user: { ...state.user, ...profile } })),

  // Addresses
  addresses: [
    { id: 'a1', label: 'Home', street: '123 Market St', city: 'San Francisco', zip: '94103', country: 'US', default: true },
    { id: 'a2', label: 'Office', street: '500 Terry Francois St', city: 'San Francisco', zip: '94158', country: 'US' }
  ],
  addAddress: (address) => set((state) => ({ addresses: [...state.addresses, address] })),
  updateAddress: (id, address) => set((state) => ({
    addresses: state.addresses.map(a => a.id === id ? { ...a, ...address } : a)
  })),
  removeAddress: (id) => set((state) => ({
    addresses: state.addresses.filter(a => a.id !== id)
  })),

  // Notifications
  notifications: {
    orderUpdates: true,
    promotions: false,
    newFeatures: true
  },
  toggleNotification: (key) => set((state) => ({
    notifications: { ...state.notifications, [key]: !state.notifications[key] }
  })),

  // Order History (Mock)
  orderHistory: [
    {
      id: 'ord-123',
      date: 'Jan 10, 2025',
      items: 'Nike Air Force 1 & 1 more',
      total: '$155.00',
      status: 'Processing',
      itemsList: [
        { name: 'Nike Air Force 1', price: '$110.00', qty: 1, image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-mens-shoes-jBrhbr.png' },
        { name: 'Nike Crew Socks', price: '$35.00', qty: 3, image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/a147dfc2-0ba9-4bc7-932f-04983df49c6c/everyday-plus-cushioned-training-crew-socks-6-pairs-vlRw51.png' }
      ],
      subtotal: '$145.00',
      shipping: '$10.00',
      tax: '$0.00',
      shippingAddress: '123 Market St, San Francisco, CA 94103'
    },
    {
      id: 'ord-122',
      date: 'Dec 24, 2024',
      items: 'MacBook Pro M4',
      total: '$1,299.00',
      status: 'Delivered',
      itemsList: [
        { name: 'MacBook Pro M4', price: '$1,199.00', qty: 1, image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290 ' }
      ],
      subtotal: '$1,199.00',
      shipping: '$0.00',
      tax: '$100.00',
      shippingAddress: '123 Market St, San Francisco, CA 94103'
    },
    {
      id: 'ord-121',
      date: 'Nov 15, 2024',
      items: 'Sony WH-1000XM5',
      total: '$348.00',
      status: 'Delivered',
      itemsList: [
        { name: 'Sony WH-1000XM5', price: '$348.00', qty: 1, image: 'https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_UF1000,1000_QL80_.jpg' }
      ],
      subtotal: '$348.00',
      shipping: '$0.00',
      tax: '$0.00',
      shippingAddress: '500 Terry Francois St, San Francisco, CA 94158'
    },
  ]
}));
