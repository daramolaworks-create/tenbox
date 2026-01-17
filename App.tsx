import React, { useState, useEffect } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
  UIManager,
  Linking
} from 'react-native';
import {
  Home as HomeIcon,
  ShoppingBag,
  ShoppingCart,
  Search,
  Settings,
  MapPin,
  ChevronRight,
  User
} from 'lucide-react-native';
import { TabType, Shipment } from './types';
import { useCartStore } from './store';
import { supabase } from './lib/supabase';
import ImportPreviewModal from './components/ImportPreviewModal';
import SettingsModal from './components/SettingsModal';
import ShipFlow from './components/ShipFlow';
import AuthScreen from './components/AuthScreen';
import LoaderScreen from './components/LoaderScreen';

import InAppBrowser from './components/InAppBrowser';
import CheckoutFlow from './components/CheckoutFlow';
import * as Clipboard from 'expo-clipboard';

// New Components
import HomeView from './components/HomeView';
import ShopView from './components/ShopView';
import CartView from './components/CartView';
import TrackView from './components/TrackView';
import SettingsView, { SettingsSubView } from './components/SettingsView';

import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_700Bold
} from '@expo-google-fonts/outfit';

const { width } = Dimensions.get('window');

const App: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold
  });

  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useCartStore();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [importUrl, setImportUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShipFlow, setShowShipFlow] = useState(false);
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  const [activeStoreName, setActiveStoreName] = useState('');
  const [activeStoreCurrency, setActiveStoreCurrency] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{ title?: string; image?: string; price?: string; currency?: string }>({});
  const { items, addItem, removeItem, updateQuantity, shipments, user, addresses, orderHistory, fetchOrders, checkSession, logout, products, fetchProducts, fetchAddresses, fetchShipments, initializeSubscription } = useCartStore();

  // Settings Logic
  const [settingsView, setSettingsView] = useState<SettingsSubView>('list');

  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    checkSession();
    fetchProducts();
    fetchAddresses();
    fetchShipments();
    fetchOrders();
    initializeSubscription();
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Handle Deep Linking (Password Reset)
  useEffect(() => {
    const handleUrl = async (url: string) => {
      try {
        if (!url) return;
        // Parse Hash parameters (access_token, refresh_token)
        // Format: tenbox://reset-password#access_token=...&refresh_token=...
        const fragment = url.split('#')[1] || url.split('?')[1];
        if (!fragment) return;

        const params: Record<string, string> = {};
        fragment.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) params[key] = decodeURIComponent(value);
        });

        if (params.access_token && params.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token
          });

          if (!error) {
            // Only trigger reset flow if the URL indicates a reset
            // Expo Linking path might differ based on environment (e.g. exp:// vs tenbox://)
            // We check if the original URL contained 'reset-password'
            if (url.includes('reset-password')) {
              Alert.alert('Reset Successful', 'Please set a new password now.');
              setShowSettings(true);
              // setSettingsView('password'); // Deprecated, handled by Modal if wired or manually navigated
            }
          }
        }
        // Check for Google Auth Callback (Fallback)
        // Usually WebBrowser handling in store.ts catches this, but for robustness:
        if (url.includes('google-auth')) {
          console.log('🔗 Global Listener caught Google Auth URL');
          const fragment = url.split('#')[1] || url.split('?')[1];
          if (fragment) {
            const authParams: Record<string, string> = {};
            fragment.split('&').forEach(pair => {
              const [key, value] = pair.split('=');
              if (key && value) authParams[key] = decodeURIComponent(value);
            });

            if (authParams.access_token && authParams.refresh_token) {
              await supabase.auth.setSession({
                access_token: authParams.access_token,
                refresh_token: authParams.refresh_token
              });
              // Refresh store
              await useCartStore.getState().checkSession();
              Alert.alert('Success', 'Google Sign In Successful!');
            }
          }
        }

      } catch (e) {
        console.error('Deep Link Error:', e);
      }
    };

    Linking.getInitialURL().then((url) => { if (url) handleUrl(url); });
    const sub = Linking.addEventListener('url', (e) => handleUrl(e.url));
    return () => sub.remove();
  }, []);

  const handleOpenBrowser = (url: string, storeName: string, currency?: string) => {
    setBrowserUrl(url);
    setActiveStoreName(storeName);
    setActiveStoreCurrency(currency || null);
  };

  const handleCloseBrowser = () => {
    // User requested to close the browser (e.g. clicked Done)
    // Simply reset state to return to the app immediately
    setBrowserUrl(null);
    setActiveStoreName('');
    setActiveStoreCurrency(null);
  };

  // Helper to determine currency from URL structure (strong signal)
  const detectCurrencyFromUrl = (url: string): string | null => {
    if (!url) return null;
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      const path = u.pathname.toLowerCase();

      // UK Signals
      if (host.endsWith('.co.uk') || host.endsWith('.uk')) return 'GBP';
      if (path.includes('/en_gb') || path.includes('/en-gb') || path.includes('/uk/')) return 'GBP';

      // UAE Signals
      if (host.endsWith('.ae')) return 'AED';
      if (path.includes('/ae/') || path.includes('/en-ae/') || path.includes('/en_ae/')) return 'AED';

      return null;
    } catch {
      return null;
    }
  };

  const handleBrowserAddToCart = (data: { url: string; title?: string; image?: string; price?: string; currency?: string; debug?: string }) => {
    // SECURITY: Do not log full payload to avoid PII/Token leaks
    // console.log('[App] Received Browser Data:', JSON.stringify(data, null, 2));

    // 1. Validate URL
    if (!data.url || !data.url.startsWith('https://')) {
      Alert.alert('Invalid Link', 'The product link must be a secure HTTPS URL.');
      return;
    }

    // Reuse whitelist check from InAppBrowser if possible, or duplicate for safety layer
    const ALLOWED_DOMAINS = [
      /amazon\./,
      /apple\.com/,
      /noon\.com/,
      /namshi\.com/,
      /argos\.co.uk/,
      /tesco\.com/,
      /currys\.co.uk/,
      /asos\.com/,
      /shein\.com/,
      /nike\.com/,
      /ebay\.com/,
      /walmart\.com/,
      /target\.com/,
      /bestbuy\.com/,
      /macys\.com/,
      /costco\.com/,
      /homedepot\.com/,
      /marksandspencer\.com/,
      /johnlewis\.com/,
      /carrefouruae\.com/,
      /sharafdg\.com/,
      /hm\.com/,
      /zara\.com/
    ];
    try {
      const hostname = new URL(data.url).hostname;
      if (!ALLOWED_DOMAINS.some(regex => regex.test(hostname))) {
        Alert.alert('Unsupported Store', 'We currently only support adding items from our approved partners.');
        return;
      }
    } catch (e) {
      return;
    }

    // 2. Sanitize Price
    let safePrice = data.price;
    if (safePrice) {
      // Remove non-numeric chars except dot and comma
      safePrice = safePrice.replace(/[^\d.,]/g, '');
    }

    // 3. Determine Currency
    // Priority: Extracted > URL Detection > Store Default > 'USD'
    let finalCurrency = data.currency;
    if (!finalCurrency || finalCurrency.length !== 3) {
      finalCurrency = detectCurrencyFromUrl(data.url) || activeStoreCurrency || 'USD';
    }

    setImportUrl(data.url);
    setExtractedData({
      title: data.title?.substring(0, 255), // Basic length limit
      image: data.image?.startsWith('http') ? data.image : undefined,
      price: safePrice,
      currency: finalCurrency?.substring(0, 3).toUpperCase()
    });
    setBrowserUrl(null); // Close browser
    setTimeout(() => setShowModal(true), 100); // Open modal with slight delay for smooth transition
  };

  if (isLoading || !fontsLoaded) {
    return <LoaderScreen />;
  }

  if (!isAuthenticated || !user) {
    return <AuthScreen onLogin={() => { }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_12345'}
        merchantIdentifier="merchant.com.tenbox.app" // Optional, for Apple Pay
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSettingsView('addresses');
                setActiveTab('settings');
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} color="#1C39BB" fill="#1C39BB" />
              </View>
              <View>
                <Text style={{ fontSize: 11, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Delivering to
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 15, color: '#000', fontWeight: '700' }}>
                    {addresses.find(a => a.default)?.label || addresses[0]?.label || 'Set Location'}
                  </Text>
                  <ChevronRight size={14} color="#1C39BB" style={{ transform: [{ rotate: '90deg' }] }} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileBtn} onPress={() => setShowSettings(true)}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} key={user.avatar} style={{ width: 40, height: 40, borderRadius: 20 }} />
              ) : (
                <User color="#1C39BB" size={20} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {activeTab === 'home' && (
              <HomeView
                user={user}
                shipments={shipments}
                orderHistory={orderHistory}
                onNavigate={setActiveTab}
                onViewSettings={setSettingsView}
                onShipParcel={() => setShowShipFlow(true)}
              />
            )}
            {activeTab === 'shop' && (
              <ShopView
                onOpenImporter={(url) => {
                  setImportUrl(url);
                  setExtractedData({});
                  setShowModal(true);
                }}
                onOpenBrowser={handleOpenBrowser}
              />
            )}
            {activeTab === 'cart' && (
              <CartView
                items={items}
                removeItem={removeItem}
                updateQuantity={updateQuantity}
                onCheckout={() => setShowCheckout(true)}
                onStartShopping={() => setActiveTab('shop')}
              />
            )}
            {activeTab === 'track' && <TrackView shipments={shipments} />}
            {activeTab === 'settings' && (
              <SettingsView
                user={user}
                logout={logout}
                currentView={settingsView}
                onViewChange={setSettingsView}
              />
            )}
          </View>

          <View style={styles.tabBar}>
            {[
              { id: 'home', icon: HomeIcon, label: 'Home' },
              { id: 'shop', icon: ShoppingBag, label: 'Shop' },
              { id: 'cart', icon: ShoppingCart, label: 'Cart', badge: items.length },
              { id: 'track', icon: Search, label: 'Track' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.id as TabType)}
                activeOpacity={0.6}
              >
                <View>
                  <tab.icon size={24} color={activeTab === tab.id ? '#1C39BB' : '#8E8E93'} />
                  {tab.badge ? (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.tabLabel, activeTab === tab.id && { color: '#1C39BB' }]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {showModal && (
            <ImportPreviewModal
              url={importUrl}
              initialTitle={extractedData.title}
              initialImage={extractedData.image}
              initialPrice={extractedData.price}
              initialCurrency={extractedData.currency}
              initialStoreName={activeStoreName} // PASS STORE NAME
              onClose={() => {
                setShowModal(false);
                setImportUrl('');
                setExtractedData({});
              }}
              onConfirm={(item) => {
                addItem(item);
                setShowModal(false);
                setImportUrl('');
                setActiveTab('cart');
              }}
            />
          )}
          <InAppBrowser
            isVisible={!!browserUrl}
            url={browserUrl || ''}
            storeName={activeStoreName}
            onClose={handleCloseBrowser}
            onAddToCart={handleBrowserAddToCart}
          />
          <SettingsModal
            visible={showSettings}
            onClose={() => setShowSettings(false)}
            onLogout={() => {
              setShowSettings(false);
              logout();
            }}
          />
          <ShipFlow
            visible={showShipFlow}
            onClose={() => setShowShipFlow(false)}
            onComplete={() => {
              setShowShipFlow(false);
              setActiveTab('track');
            }}
          />
          <CheckoutFlow
            visible={showCheckout}
            onClose={() => setShowCheckout(false)}
            onComplete={() => {
              setShowCheckout(false);
              setActiveTab('home'); // Go home after purchase
            }}
          />
        </SafeAreaView>
      </StripeProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 0, paddingBottom: 30, paddingTop: 12, paddingHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: -2 }, elevation: 5 },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabLabel: { color: '#8E8E93', fontSize: 10, fontWeight: '600' },
  tabBadge: { position: 'absolute', top: -4, right: -6, backgroundColor: '#FF3B30', minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

export default App;
