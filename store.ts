import { create } from 'zustand';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { CartItem, Shipment } from './types';
import { createClient } from '@supabase/supabase-js';
import { supabase, getSessionReliably } from './lib/supabase';

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

export interface TrackingResult {
  tracking_number: string;
  carrier: string;
  status: string;
  status_details: string;
  status_date: string;
  location: string;
  estimated_delivery?: string;
  origin?: string;
  destination?: string;
  events: Array<{
    date: string;
    status: string;
    description: string;
    location: string;
  }>;
}

interface AppState {
  // Cart
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  syncCart: () => Promise<void>;

  // Shipments
  shipments: Shipment[];
  fetchShipments: () => Promise<void>;
  addShipment: (shipment: Shipment) => Promise<void>;
  trackShipment: (trackingNumber: string, carrier?: string) => Promise<TrackingResult | null>;

  // Products
  products: any[];
  fetchProducts: () => Promise<void>;

  // Orders
  orderHistory: any[];
  fetchOrders: () => Promise<void>;
  createOrder: (total: number, itemsSummary: string) => Promise<void>;
  initializeSubscription: () => void;

  // Auth
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string, currentPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;

  // Addresses
  addresses: Address[];
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Address) => Promise<boolean>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<boolean>;
  removeAddress: (id: string) => Promise<void>;

  // Notifications
  notifications: NotificationPrefs;
  toggleNotification: (key: keyof NotificationPrefs) => void;

}

// Helper to normalize store regions
export const getStoreRegion = (storeName: string): string => {
  if (!storeName) return 'USA';
  const name = storeName.toUpperCase();
  if (name.includes('UK') || name === 'ARGOS' || name === 'TESCO' || name === 'CURRYS') return 'UK';
  if (name.includes('UAE') || name.includes('DUBAI') || name === 'NOON' || name === 'NAMSHI') return 'UAE';
  return 'USA';
};

// Store Locations for Shipping Origin
export const STORE_ADDRESSES: Record<string, any> = {
  'USA': { name: 'Tenbox USA', street: '215 Clayton St', city: 'San Francisco', zip: '94117', country: 'US', currency: 'USD', symbol: '$' },
  'UK': { name: 'Tenbox UK', street: '71 Cherry Court', city: 'Southampton', zip: 'SO53 5PD', country: 'GB', currency: 'GBP', symbol: '£' },
  'UAE': { name: 'Tenbox DUBAI', street: 'Dubai Mall', city: 'Dubai', zip: '00000', country: 'AE', currency: 'AED', symbol: 'AED ' },
};

export const useCartStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Cart Logic
      items: [] as CartItem[],
      addItem: (item) => {
        const currentItems = get().items;

        // Check for Currency Mismatch
        // We strictly enforce one currency per cart to handle checkout correctly.
        const currentCurrency = currentItems.length > 0 ? currentItems[0].currency : null;
        const newCurrency = item.currency;

        if (currentCurrency && newCurrency && currentCurrency !== newCurrency) {
          Alert.alert(
            'Currency Mismatch',
            `Your cart contains items in ${currentCurrency}. You can only order items with the same currency at a time.\n\nClear cart to add this item in ${newCurrency}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear & Add',
                style: 'destructive',
                onPress: () => {
                  // Clear first, then set the new item
                  set({ items: [item] }); // This effectively replaces the cart
                  // We should also clear the DB if authenticated, but set({items: [item]}) 
                  // might need to trigger a full sync or clear call. 
                  // The existing clearCart logic deletes from DB. 
                  // Let's rely on the user manually syncing or just replace local state 
                  // and let the next syncCart handle it? 
                  // Actually, strictly speaking, we should probably clear DB too.
                  const state = get();
                  if (state.isAuthenticated) {
                    // Delete all existing and then upsert this one? 
                    // Or just rely on syncCart logic? 
                    // Valid simple approach:
                    state.clearCart(); // Clears DB and local
                    // But clearCart sets items to [], so we must wait or just set it after.
                    // Since clearCart is synchronous in local state update:
                    set({ items: [item] });
                    // And trigger a sync
                    state.syncCart();
                  } else {
                    set({ items: [item] });
                  }
                }
              }
            ]
          );
          return;
        }

        // Optimistic Update
        let newItems: CartItem[] = [];
        set((state) => {
          const existing = state.items.find((i) => String(i.id) === String(item.id));
          if (existing) {
            newItems = state.items.map((i) =>
              String(i.id) === String(item.id) ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          } else {
            newItems = [...state.items, item];
          }
          return { items: newItems };
        });

        // Sync with Supabase if logged in
        const state = get();
        if (state.isAuthenticated && state.user) {
          const updatedItem = newItems.find((i) => String(i.id) === String(item.id));
          if (updatedItem) {
            // We can't use await here because addItem is synchronous.
            // We'll use .then() chain.
            getSessionReliably().then((session) => {
              const userId = (supabase.auth.getSession() as any)?.session?.user?.id || session?.user?.id;
              if (userId) {
                supabase.from('cart_items').upsert({
                  user_id: userId,
                  product_id: updatedItem.id,
                  title: updatedItem.title,
                  store: updatedItem.store,
                  quantity: updatedItem.quantity,
                  notes: updatedItem.notes,
                  image: updatedItem.image,
                  price: updatedItem.price,
                  url: updatedItem.url,
                  currency: updatedItem.currency
                }, { onConflict: 'user_id, product_id' }).then(({ error }) => {
                  if (error) console.error('Error syncing cart item:', error);
                });
              }
            });
          }
        }
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id)
        }));

        // Sync Delete
        const state = get();
        if (state.isAuthenticated) {
          // We assume 'id' here maps to 'product_id' in DB
          supabase.from('cart_items').delete().eq('product_id', id).then(({ error }) => {
            if (error) console.error('Error deleting cart item:', error);
          });
        }
      },
      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => String(i.id) !== String(id)) };
          }
          const updatedItems = state.items.map((i) =>
            String(i.id) === String(id) ? { ...i, quantity } : i
          );
          return {
            items: updatedItems
          };
        });

        // Sync Update
        const state = get();
        if (state.isAuthenticated) {
          if (quantity <= 0) {
            supabase.from('cart_items').delete().eq('product_id', id);
          } else {
            // We need to fetch the item details to upsert or just update quantity? 
            // Upsert requires all non-null fields if row doesn't exist? 
            // Actually, if we are updating, the row SHOULD exist.
            // But safest is to use the item from state.
            const item = state.items.find(i => String(i.id) === String(id));
            if (item) {
              // Just update quantity to be efficient, but upsert ensures we don't break
              supabase.from('cart_items').update({ quantity }).eq('product_id', id).then(({ error }) => {
                if (error) console.error('Error updating cart quantity:', error);
              });
            }
          }
        }
      },
      clearCart: () => {
        set({ items: [] });
        const state = get();
        if (state.isAuthenticated) {
          supabase.from('cart_items').delete().neq('id', '00000000-0000-0000-0000-000000000000').then(); // Delete all
        }
      },

      fetchCart: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase.from('cart_items').select('*');
        if (error) {
          console.error('Error fetching cart:', error);
          return;
        }

        if (data) {
          const mappedItems: CartItem[] = data.map((d: any) => ({
            id: d.product_id || d.id, // Prefer product_id logic
            title: d.title,
            store: d.store || 'Unknown',
            quantity: d.quantity,
            notes: d.notes || '',
            image: d.image || '',
            price: Number(d.price) || 0,
            url: d.url || '',
            currency: d.currency || 'USD'
          }));
          set({ items: mappedItems });
        }
      },

      syncCart: async () => {
        // Push local items to server then fetch
        const localItems = get().items;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        if (localItems.length > 0) {
          // Upsert all
          const payload = localItems.map(item => ({
            user_id: session.user.id,
            product_id: item.id,
            title: item.title,
            store: item.store,
            quantity: item.quantity,
            notes: item.notes,
            image: item.image,
            price: item.price,
            url: item.url,
            currency: item.currency
          }));

          const { error } = await supabase.from('cart_items').upsert(payload, { onConflict: 'user_id, product_id' });
          if (error) console.error('Error merging cart:', error);
        }

        // Now fetch authoritative state
        await get().fetchCart();
      },

      shipments: [] as Shipment[],
      fetchShipments: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching shipments:', error);
          return;
        }

        if (data) {
          set({
            shipments: data.map((s: any) => ({
              id: s.id,
              trackingNumber: s.tracking_number,
              carrier: s.carrier,
              status: s.status as any, // Cast to any or ShipmentStatus if imported
              origin: s.origin,
              destination: s.destination,
              estimatedDelivery: s.estimated_delivery,
              itemsString: s.items_summary,
              image: s.label_url || 'https://via.placeholder.com/150',
              events: []
            }))
          });
        }
      },
      addShipment: async (shipment) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { error } = await supabase
          .from('shipments')
          .insert({
            user_id: session.user.id,
            tracking_number: shipment.trackingNumber,
            carrier: shipment.carrier,
            status: shipment.status,
            origin: shipment.origin,
            destination: shipment.destination,
            estimated_delivery: shipment.estimatedDelivery,
            items_summary: shipment.itemsString,
            label_url: shipment.image
          });

        if (error) {
          Alert.alert('Error', 'Failed to create shipment');
          console.error(error);
          return;
        }

        await useCartStore.getState().fetchShipments();
      },

      trackShipment: async (trackingNumber, carrier) => {
        console.log('🔍 Tracking shipment:', trackingNumber, carrier);
        try {
          const { data, error } = await supabase.functions.invoke('get-tracking', {
            body: {
              tracking_number: trackingNumber,
              carrier: carrier
            }
          });

          if (error) {
            console.error('❌ Tracking error:', error);
            Alert.alert('Tracking Error', error.message || 'Failed to get tracking info');
            return null;
          }

          if (data.error) {
            console.error('❌ Tracking API error:', data.error);
            Alert.alert('Not Found', data.error);
            return null;
          }

          console.log('✅ Tracking result:', data);
          return data as TrackingResult;
        } catch (error: any) {
          console.error('❌ Tracking exception:', error);
          Alert.alert('Error', error.message || 'Failed to track shipment');
          return null;
        }
      },

      // User Profile & Auth
      user: null as UserProfile | null,
      isAuthenticated: false,

      checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          set({
            user: {
              name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              avatar: session.user.user_metadata.avatar_url,
            },
            isAuthenticated: true
          });
          // Fetch cart on session check
          get().fetchCart();
        }
      },

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          set({
            user: {
              name: data.user.user_metadata.full_name || data.user.email?.split('@')[0] || 'User',
              email: data.user.email || '',
              avatar: data.user.user_metadata.avatar_url,
            },
            isAuthenticated: true
          });
          // Sync Cart
          await get().syncCart();
        }
      },

      signup: async (email, password, name) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;
        if (data.user) {
          set({
            user: {
              name: name,
              email: email,
            },
            isAuthenticated: true
          });
          // Sync Cart
          await get().syncCart();
        }
      },

      loginWithGoogle: async () => {
        try {
          const redirectUrl = Linking.createURL('google-auth');
          console.log('🔵 Initiating Google Login...');
          console.log('🔗 Redirect URL:', redirectUrl);

          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              skipBrowserRedirect: true,
            },
          });

          if (error) throw error;
          if (!data?.url) throw new Error('No OAuth URL returned');

          console.log('🌍 Opening Auth Session:', data.url);
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

          console.log('🔄 Browser Result:', result.type);

          if (result.type === 'success' && result.url) {
            console.log('✅ Auth success, URL:', result.url);

            // Extract tokens from the URL
            const urlObj = new URL(result.url);
            // OAuth tokens usually come in the hash fragment for implicit flow
            // But sometimes might be in query depending on config, checking both.
            const fragment = urlObj.hash ? urlObj.hash.substring(1) : urlObj.search ? urlObj.search.substring(1) : '';

            const params = new URLSearchParams(fragment);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const errorDesc = params.get('error_description');

            if (errorDesc) {
              throw new Error(errorDesc);
            }

            if (!accessToken || !refreshToken) {
              console.warn('⚠️ No tokens found in URL');
              return;
            }

            console.log('🔑 Tokens found, setting session...');
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) throw sessionError;

            console.log('🎉 Session set successfully!');
            // Refresh store state
            await useCartStore.getState().checkSession();
            await useCartStore.getState().syncCart();
          } else {
            console.log('🚫 Browser closed or failed:', result.type);
          }
        } catch (error: any) {
          console.error("❌ Google Login Error:", error);
          Alert.alert('Login Error', error.message);
          throw error;
        }
      },

      loginWithApple: async () => {
        try {
          // Native iOS Sign In
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });

          if (credential.identityToken) {
            const { error, data } = await supabase.auth.signInWithIdToken({
              provider: 'apple',
              token: credential.identityToken,
            });

            if (error) throw error;

            // Note: Apple only returns name on first sign in. We should update profile if we have it.
            if (data.user && credential.fullName) {
              const name = [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ');
              if (name) {
                await useCartStore.getState().updateProfile({ name });
              }
            }

            await useCartStore.getState().checkSession();
            await useCartStore.getState().syncCart();
          }
        } catch (e: any) {
          if (e.code === 'ERR_REQUEST_CANCELED') {
            // User canceled, do nothing
            return;
          }
          console.error('Apple Login Error:', e);
          throw e;
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: async (profile) => {
        const updates: any = {};
        if (profile.name) updates.data = { full_name: profile.name };

        // Handle Avatar Upload
        if (profile.avatar && profile.avatar.startsWith('file://')) {
          try {
            const response = await fetch(profile.avatar);
            const arrayBuffer = await response.arrayBuffer();
            const fileExt = profile.avatar.split('.').pop() || 'jpg';
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = fileName;

            // Use ArrayBuffer for React Native compatibility
            const { error: uploadError } = await supabase.storage
              .from('avatars')
              .upload(filePath, arrayBuffer, {
                contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                upsert: true,
              });

            if (uploadError) {
              console.error('Upload error:', uploadError);
              throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            updates.data = { ...updates.data, avatar_url: data.publicUrl };

            // Update local object to use the public URL
            profile.avatar = data.publicUrl;

          } catch (error) {
            console.error('Error uploading avatar:', error);
            Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
            return;
          }
        } else if (profile.avatar) {
          // If it's already a remote URL (or empty/cleared), just save it
          updates.data = { ...updates.data, avatar_url: profile.avatar };
        }

        const { error } = await supabase.auth.updateUser(updates);

        if (error) {
          console.error('Error updating profile:', error);
          Alert.alert('Error', 'Failed to update profile');
          return;
        }

        set((state) => ({ user: state.user ? { ...state.user, ...profile } : null }));
      },

      resetPassword: async (email) => {
        const redirectUrl = Linking.createURL('reset-password');
        console.log('🔗 Generated Redirect URL:', redirectUrl);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl
        });
        if (error) {
          console.error('Error resetting password:', error);
          throw error;
        }
      },


      updatePassword: async (password, currentPassword) => {
        const email = get().user?.email;
        console.log('🔒 Update Password called');

        if (!email) throw new Error('User email not found');

        // 1. Verify current password using an ISOLATED client
        // This prevents the current session from interfering with the check
        const tempSupabase = createClient(
          process.env.EXPO_PUBLIC_SUPABASE_URL!,
          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: signInData, error: signInError } = await tempSupabase.auth.signInWithPassword({
          email,
          password: currentPassword
        });

        if (signInError || !signInData.user) {
          console.error('❌ Re-auth failed:', signInError);
          throw new Error('Incorrect current password.');
        }

        console.log('✅ Re-auth successful, updating password on main client...');

        // 2. Update to new password using the MAIN client (which is authenticated)
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          console.error('❌ Update failed:', error);
          throw error;
        }
        console.log('🎉 Password updated successfully');
      },

      deleteAccount: async () => {
        // In a real app, this would call a Supabase Edge Function to delete the user from Auth and DB.
        // For this MVP, we will sign the user out and clear local state, simulating deletion.
        console.log('⚠️ Deleting account (Mock Implementation)');

        // try calling an edge function if it existed:
        // await supabase.functions.invoke('delete-account');

        await get().logout();
        Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
      },

      // Addresses
      addresses: [] as Address[],
      fetchAddresses: async () => {
        const session = await getSessionReliably();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', session.user.id)
          .order('is_default', { ascending: false }); // Defaults first

        if (error) {
          console.error('Error fetching addresses:', error);
          return;
        }

        console.log('📍 Fetched addresses:', data?.length);

        if (data) {
          set({
            addresses: data.map((a: any) => ({
              id: a.id,
              label: a.label,
              street: a.street,
              city: a.city,
              zip: a.zip,
              country: a.country,
              default: a.is_default
            }))
          });
        }
      },

      addAddress: async (address) => {
        console.log('➕ Adding address:', address);
        const session = await getSessionReliably();
        if (!session?.user) {
          console.error('❌ No user session found during addAddress');
          Alert.alert('Error', 'You must be logged in to add an address');
          return false;
        }

        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: session.user.id,
            label: address.label,
            street: address.street,
            city: address.city,
            zip: address.zip,
            country: address.country,
            is_default: address.default || false
          });

        if (error) {
          console.error('❌ Error adding address:', error);
          Alert.alert('Error', 'Failed to add address: ' + error.message);
          return false;
        }
        console.log('✅ Address added successfully');
        await useCartStore.getState().fetchAddresses();
        return true;
      },

      updateAddress: async (id, address) => {
        console.log('✏️ Updating address:', id, address);
        const updates: any = {};
        if (address.label) updates.label = address.label;
        if (address.street) updates.street = address.street;
        if (address.city) updates.city = address.city;
        if (address.zip) updates.zip = address.zip;
        if (address.country) updates.country = address.country;
        if (address.default !== undefined) {
          updates.is_default = address.default;
        }

        const { error } = await supabase
          .from('addresses')
          .update(updates)
          .eq('id', id);

        if (error) {
          console.error('❌ Error updating address:', error);
          Alert.alert('Error', 'Failed to update address: ' + error.message);
          return false;
        }
        console.log('✅ Address updated successfully');
        await useCartStore.getState().fetchAddresses();
        return true;
      },

      removeAddress: async (id) => {
        const { error } = await supabase
          .from('addresses')
          .delete()
          .eq('id', id);

        if (error) {
          Alert.alert('Error', 'Failed to delete address');
          return;
        }
        await useCartStore.getState().fetchAddresses();
      },

      // Notifications
      notifications: {
        orderUpdates: true,
        promotions: false,
        newFeatures: true
      },
      toggleNotification: (key) => set((state) => ({
        notifications: { ...state.notifications, [key]: !state.notifications[key] }
      })),

      // Orders (Supabase)
      orderHistory: [] as any[],

      fetchOrders: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          return;
        }


        if (data) {
          // Get address snapshot strategy (Use current default as fallback for MVP)
          const currentAddresses = get().addresses;
          let addressStr = '';

          if (currentAddresses.length > 0) {
            const defaultAddr = currentAddresses.find(a => a.default) || currentAddresses[0];
            addressStr = `${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.zip}`;
          }

          set({
            orderHistory: data.map((order: any) => ({
              id: order.id,
              date: new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              items: order.items_summary || 'Order Items',
              total: `$${order.total}`,
              status: order.status,
              itemsList: [], // Detail view would need a separate table join or JSON column
              shippingAddress: addressStr || 'No address found'
            }))
          });
        }
      },

      createOrder: async (total: number, itemsSummary: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { error } = await supabase
          .from('orders')
          .insert({
            user_id: session.user.id,
            total: total,
            status: 'Processing',
            items_summary: itemsSummary
          });

        if (error) throw error;

        // Refresh history
        const state = useCartStore.getState();
        await state.fetchOrders();
      },

      // Real-time Subscription
      initializeSubscription: () => {
        supabase
          .channel('public:orders')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
            // Simple refresh strategy
            useCartStore.getState().fetchOrders();
          })
          .subscribe();
      },

      // Products (Supabase)
      products: [] as any[],
      fetchProducts: async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        if (data) {
          set({ products: data });
        }
      }
    }),
    {
      name: 'tenbox-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items
        // We do strictly persist items. We can verify if other things need persisting (like 'user' for offline?)
        // But usually session is handled by Supabase Auth which has its own persistence.
      }),
    }
  )
);
