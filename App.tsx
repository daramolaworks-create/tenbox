
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  Platform,
  UIManager,
  ActivityIndicator
} from 'react-native';
import {
  Home as HomeIcon,
  ShoppingBag,
  ShoppingCart,
  Search,
  User,
  Package,
  Box,
  Trash2,
  Plus,
  ChevronRight,
  LogOut,
  Clock,
  Settings,
  Truck,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';
import { TabType, CartItem, Shipment } from './types';
import { useCartStore } from './store';
import { Button, Input, Card } from './components/UI';
import ImportPreviewModal from './components/ImportPreviewModal';
import SettingsModal from './components/SettingsModal';
import ShipFlow from './components/ShipFlow';
import AuthScreen from './components/AuthScreen';
import LoaderScreen from './components/LoaderScreen';

import InAppBrowser from './components/InAppBrowser';
import AddressesView from './components/AddressesView';
import OrdersView from './components/OrdersView';
import EditProfileView from './components/EditProfileView';
import CheckoutFlow from './components/CheckoutFlow';
import OfferSlider from './components/OfferSlider';
import * as Clipboard from 'expo-clipboard';

import { STORES } from './data/stores';

const { width } = Dimensions.get('window');

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [importUrl, setImportUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShipFlow, setShowShipFlow] = useState(false);
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);
  const [activeStoreName, setActiveStoreName] = useState('');
  const [extractedData, setExtractedData] = useState<{ title?: string; image?: string }>({});
  const { items, addItem, removeItem, updateQuantity, shipments, user } = useCartStore();
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [settingsView, setSettingsView] = useState<'list' | 'account' | 'addresses' | 'orders'>('list');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
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

  const handleOpenBrowser = (url: string, name: string) => {
    setActiveStoreName(name);
    setBrowserUrl(url);
    setExtractedData({}); // Reset extracted data
  };

  const handleCloseBrowser = async () => {
    // Only check clipboard if we didn't just extract data (modal not showing)
    if (!showModal) {
      setBrowserUrl(null);
      setActiveStoreName('');

      // Check clipboard logic...
      setTimeout(async () => {
        Alert.alert(
          "Finished Browsing?",
          "Would you like to import the link currently in your clipboard?",
          [
            { text: "No", style: "cancel" },
            {
              text: "Import Link",
              onPress: async () => {
                const content = await Clipboard.getStringAsync();
                if (content && (content.startsWith('http') || content.startsWith('www'))) {
                  setImportUrl(content);
                  setExtractedData({});
                  setShowModal(true);
                } else {
                  Alert.alert("No Link Found", "Your clipboard doesn't contain a valid link.");
                }
              }
            }
          ]
        );
      }, 500);
    } else {
      // Just close browser if modal is taking over
      setBrowserUrl(null);
      setActiveStoreName('');
    }
  };

  const handleBrowserAddToCart = (data: { url: string; title?: string; image?: string }) => {
    setImportUrl(data.url);
    setExtractedData({ title: data.title, image: data.image });
    setBrowserUrl(null); // Close browser
    setTimeout(() => setShowModal(true), 100); // Open modal with slight delay for smooth transition
  };

  const renderHome = () => (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ marginTop: 10, marginBottom: 24 }}>
        <Text style={styles.heroText}>Good Morning,</Text>
        <Text style={[styles.heroText, { color: '#0223E6' }]}>{user.name}.</Text>
      </View>

      <OfferSlider />

      <TouchableOpacity activeOpacity={0.9} onPress={() => setActiveTab('shop')}>
        <View style={styles.featuredCard}>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredLabel}>GLOBAL SHOPPING</Text>
            <Text style={styles.featuredTitle}>Shop the World</Text>
            <Text style={styles.featuredDesc}>Import from Amazon, Apple, and more.</Text>
            <View style={styles.featuredLogos}>
              <Image source={require('./assets/logos/amazon.png')} style={{ width: 50, height: 20 }} resizeMode="contain" />
              <Image source={require('./assets/logos/apple.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
            </View>
          </View>
          <View style={styles.featuredIcon}>
            <ShoppingBag color="#fff" size={32} />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCard} activeOpacity={0.8} onPress={() => setShowShipFlow(true)}>
          <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
            <Package color="#0223E6" size={24} />
          </View>
          <Text style={styles.quickTitle}>Ship Parcel</Text>
          <Text style={styles.quickDesc}>Send anywhere</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} activeOpacity={0.8} onPress={() => setActiveTab('track')}>
          <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
            <Search color="#166534" size={24} />
          </View>
          <Text style={styles.quickTitle}>Track Order</Text>
          <Text style={styles.quickDesc}>{shipments.length} active</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        <TouchableOpacity onPress={() => { setSettingsView('orders'); setActiveTab('settings'); }}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {shipments.slice(0, 3).map(s => {
        const Icon = s.status === 'delivered' ? CheckCircle : Truck;
        const color = getStatusColor(s.status);

        return (
          <TouchableOpacity key={s.id} style={styles.orderCard} activeOpacity={0.9} onPress={() => setActiveTab('track')}>
            <View style={styles.cardTop}>
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                <View style={[styles.statusIconBox, { backgroundColor: color + '15' }]}>
                  <Icon size={24} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle} numberOfLines={1}>{s.itemsString}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                    <Text style={styles.activityMeta}>
                      {s.status === 'delivered' ? 'Delivered' : 'Arriving'} • {s.estimatedDelivery}
                    </Text>
                  </View>
                </View>
                <View style={[styles.miniStatus, { backgroundColor: color + '15' }]}>
                  <Text style={[styles.miniStatusText, { color: color }]}>{s.status.replace('_', ' ')}</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardBottom}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Image source={require('./assets/logo.png')} style={{ width: 16, height: 16, tintColor: '#8E8E93' }} resizeMode="contain" />
                <Text style={styles.orderIdSm}>{s.carrier} • #{s.trackingNumber.split('-')[1]}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.viewDetails}>Track</Text>
                <ChevronRight size={14} color="#0223E6" />
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {shipments.length === 0 && (
        <View style={styles.emptyActivity}>
          <Clock size={24} color="#C7C7CC" />
          <Text style={styles.emptyText}>No recent activity.</Text>
        </View>
      )}

      {/* Banner Ad */}
      <TouchableOpacity activeOpacity={0.9} style={{ marginTop: 20 }}>
        <Image
          source={require('./assets/offers/banner_ad.png')}
          style={{ width: '100%', height: 100, borderRadius: 12 }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </ScrollView>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#34C759';
      case 'out_for_delivery': return '#0223E6';
      case 'exception': return '#FF3B30';
      default: return '#FF9500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle;
      case 'exception': return AlertCircle;
      default: return Truck;
    }
  };

  const renderTrack = () => (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>My Shipments</Text>
      <Text style={styles.subText}>{shipments.length} active orders</Text>

      <Input placeholder="Enter tracking number..." style={{ marginTop: 24, marginBottom: 12 }} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
        {shipments.map(s => (
          <TouchableOpacity key={s.id} activeOpacity={0.8} onPress={() => setSelectedShipment(selectedShipment?.id === s.id ? null : s)}>
            <Card style={styles.shipmentCard}>
              <View style={styles.shipmentHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(s.status) }]} />
                  <Text style={styles.trackingNum}>{s.trackingNumber}</Text>
                </View>
                <Text style={styles.shipmentDate}>{s.estimatedDelivery}</Text>
              </View>

              <View style={styles.shipmentBody}>
                <Text style={styles.shipmentItems}>{s.itemsString}</Text>
                <Text style={styles.shipmentRoute}>{s.origin} <ChevronRight size={14} color="#8E8E93" /> {s.destination}</Text>
              </View>

              {selectedShipment?.id === s.id && (
                <View style={styles.timeline}>
                  <View style={styles.timelineLine} />
                  {s.events.map((e, i) => {
                    const Icon = getStatusIcon(e.status);
                    return (
                      <View key={i} style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { borderColor: i === 0 ? getStatusColor(e.status) : '#E5E5EA' }]}>
                          {i === 0 && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: getStatusColor(e.status) }} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.eventStatus}>{e.description}</Text>
                          <Text style={styles.eventLocation}>{e.location} • {e.date}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );



  const renderSettings = () => {
    if (settingsView !== 'list') {
      return (
        <View style={styles.screen}>
          <TouchableOpacity onPress={() => setSettingsView('list')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <ChevronRight size={24} color="#0223E6" style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={{ fontSize: 17, color: '#0223E6', marginLeft: 4, fontWeight: '600' }}>Back to Settings</Text>
          </TouchableOpacity>

          {settingsView === 'account' && (
            <View style={{ flex: 1 }}>
              <Text style={styles.screenTitle}>Account Info</Text>
              <EditProfileView />
            </View>
          )}
          {settingsView === 'addresses' && (
            <View style={{ flex: 1 }}>
              <Text style={styles.screenTitle}>Saved Addresses</Text>
              <AddressesView />
            </View>
          )}
          {settingsView === 'orders' && (
            <View style={{ flex: 1 }}>
              <Text style={styles.screenTitle}>Order History</Text>
              <OrdersView />
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.screen}>
        <Text style={styles.screenTitle}>Settings</Text>

        <TouchableOpacity style={styles.profileHeader} activeOpacity={0.8} onPress={() => setSettingsView('account')}>
          <View style={styles.profileAvatarLarge}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={{ width: 80, height: 80, borderRadius: 40 }} />
            ) : (
              <User color="#fff" size={32} />
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>EDIT</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </TouchableOpacity>

        <View style={styles.settingsList}>
          {[
            { icon: MapPin, label: 'Saved Addresses', action: () => setSettingsView('addresses') },
            { icon: Clock, label: 'Order History', action: () => setSettingsView('orders') },
            { icon: LogOut, label: 'Log Out', color: '#FF3B30', action: () => setIsAuthenticated(false) }
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.settingItem} onPress={item.action}>
              <View style={styles.settingLeft}>
                <item.icon size={20} color={item.color || '#000'} />
                <Text style={[styles.settingLabel, item.color && { color: item.color }]}>{item.label}</Text>
              </View>
              <ChevronRight size={16} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };


  const renderShop = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Universal Importer</Text>
      <Text style={styles.subText}>Paste any global product link below.</Text>

      <View style={styles.importRow}>
        <Input
          style={styles.flex1}
          placeholder="https://amazon.com/product..."
          value={importUrl}
          onChangeText={setImportUrl}
        />
        <Button size="icon" onPress={() => importUrl ? setShowModal(true) : Alert.alert("Input Needed", "Please paste a URL first.")}>
          <Plus color="#fff" size={28} />
        </Button>
      </View>

      <Text style={styles.sectionLabel}>PARTNER STORES</Text>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search stores (e.g. Amazon, ASOS)..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ marginBottom: 16 }}
        />
      </View>

      <View style={styles.storeGrid}>
        {STORES.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
          <TouchableOpacity key={s.name} activeOpacity={0.7} onPress={() => handleOpenBrowser(s.url, s.name)}>
            <Card style={styles.storeCard}>
              <View style={styles.storeIconPlaceholder}>
                <Image source={typeof s.logo === 'string' ? { uri: s.logo } : s.logo} style={{ width: 40, height: 40 }} resizeMode="contain" />
              </View>
              <Text style={styles.storeName} numberOfLines={1}>{s.name}</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderCart = () => (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Tenbox Cart</Text>
      <Text style={styles.subText}>{items.length} {items.length === 1 ? 'item' : 'items'} staging for import</Text>

      {items.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <ShoppingCart size={64} color="#E5E5EA" />
          <Text style={styles.emptyText}>Your cart is waiting for items.</Text>
          <Button variant="outline" style={{ marginTop: 24 }} onPress={() => setActiveTab('shop')}>
            Start Shopping
          </Button>
        </View>
      ) : (
        <View style={styles.cartList}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '65%' }}>
            {items.map(item => (
              <Card key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.cartImg} />
                <View style={styles.cartInfo}>
                  <View style={styles.cartItemHeader}>
                    <Text style={styles.cartStore}>{item.store}</Text>
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Trash2 size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cartTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.cartBottom}>
                    <View style={styles.cartStepper}>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}><Plus size={14} color="#000" style={{ transform: [{ rotate: '45deg' }] }} /></TouchableOpacity>
                      <Text style={styles.cartQty}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} color="#000" /></TouchableOpacity>
                    </View>
                    <Text style={styles.cartPrice}>${item.price * item.quantity}.00</Text>
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>

          <Card style={styles.checkoutSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${items.reduce((a, b) => a + (b.price * b.quantity), 0)}.00</Text>
            </View>
            <Button style={styles.checkoutBtn} size="lg" onPress={() => setShowCheckout(true)}>
              Checkout Now
            </Button>
          </Card>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return <LoaderScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image source={require('./assets/logo.png')} style={{ width: 120, height: 40 }} resizeMode="contain" />
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => setShowSettings(true)}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
          ) : (
            <User color="#0223E6" size={20} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'shop' && renderShop()}
        {activeTab === 'cart' && renderCart()}
        {activeTab === 'track' && renderTrack()}
        {activeTab === 'settings' && renderSettings()}
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
              <tab.icon size={24} color={activeTab === tab.id ? '#0223E6' : '#8E8E93'} />
              {tab.badge ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.tabLabel, activeTab === tab.id && { color: '#0223E6' }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showModal && (
        <ImportPreviewModal
          url={importUrl}
          initialTitle={extractedData.title}
          initialImage={extractedData.image}
          onClose={() => setShowModal(false)}
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
          setIsAuthenticated(false);
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: { backgroundColor: '#0223E6', padding: 8, borderRadius: 10, display: 'none' }, // hidden
  logoText: { color: '#000', fontSize: 22, fontWeight: '700', letterSpacing: -0.5, display: 'none' }, // hidden
  profileBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  screen: { flex: 1, padding: 24 },
  heroText: { color: '#000', fontSize: 34, fontWeight: '700', letterSpacing: -0.4 },
  subText: { color: '#8E8E93', fontSize: 17, marginTop: 4, fontWeight: '500' },
  actionGrid: { gap: 14, marginTop: 32 },
  shipBtn: { backgroundColor: '#0223E6', padding: 24, borderRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#0223E6', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  shopBtn: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
  iconCircleWhite: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  iconCircleDark: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  catLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  catTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  catLabelDark: { color: '#8E8E93', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  catTitleDark: { color: '#000', fontSize: 20, fontWeight: '700' },
  activeShipCard: { marginTop: 24, padding: 24, minHeight: 160 },
  shipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' },
  shipHeaderText: { color: '#8E8E93', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#8E8E93', textAlign: 'center', marginTop: 12, fontSize: 15 },
  screenTitle: { color: '#000', fontSize: 32, fontWeight: '700', letterSpacing: -0.4 },
  importRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  flex1: { flex: 1 },
  sectionLabel: { color: '#8E8E93', fontSize: 13, fontWeight: '500', letterSpacing: 0.4, marginTop: 32, marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  storeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  storeCard: { width: (width - 60) / 2, padding: 20, alignItems: 'center', shadowOpacity: 0.03 },
  storeIconPlaceholder: { width: 50, height: 50, backgroundColor: '#F2F2F7', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  storeName: { color: '#000', fontSize: 15, fontWeight: '600' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 0, paddingBottom: 30, paddingTop: 12, paddingHorizontal: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: -2 }, elevation: 5 },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabLabel: { color: '#8E8E93', fontSize: 10, fontWeight: '600' },
  tabBadge: { position: 'absolute', top: -4, right: -6, backgroundColor: '#FF3B30', minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cartList: { flex: 1, marginTop: 20 },
  cartItem: { flexDirection: 'row', padding: 16, gap: 16, marginBottom: 16, shadowOpacity: 0.08 },
  cartImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F2F2F7' },
  cartInfo: { flex: 1, justifyContent: 'space-between' },
  cartItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartStore: { color: '#0223E6', fontSize: 12, fontWeight: '600' },
  cartTitle: { color: '#000', fontSize: 16, fontWeight: '600' },
  cartBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartStepper: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F2F2F7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  cartQty: { color: '#000', fontSize: 14, fontWeight: '700' },
  cartPrice: { color: '#000', fontSize: 16, fontWeight: '700' },
  checkoutSummary: { padding: 24, paddingBottom: 34, marginTop: 'auto', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F2F2F7' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryLabel: { color: '#8E8E93', fontSize: 16, fontWeight: '500' },
  summaryValue: { color: '#000', fontSize: 24, fontWeight: '700' },
  checkoutBtn: { width: '100%', shadowColor: '#0223E6', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  emptyCartContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  tagline: { color: '#C7C7CC', textAlign: 'center', fontSize: 11, fontWeight: '600', letterSpacing: 2, marginTop: 'auto', textTransform: 'uppercase' },
  shipmentCard: { padding: 20, marginBottom: 16 },
  shipmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  trackingNum: { color: '#000', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  shipmentDate: { color: '#8E8E93', fontSize: 12, fontWeight: '600' },
  shipmentBody: { borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12 },
  shipmentItems: { color: '#000', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  shipmentRoute: { color: '#8E8E93', fontSize: 12, fontWeight: '500' },
  timeline: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
  timelineLine: { position: 'absolute', top: 20, left: 7, bottom: 20, width: 2, backgroundColor: '#F2F2F7' },
  timelineItem: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  timelineDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', borderWidth: 2, zIndex: 1, alignItems: 'center', justifyContent: 'center' },
  eventStatus: { color: '#000', fontSize: 13, fontWeight: '600', marginBottom: 2 },
  eventLocation: { color: '#8E8E93', fontSize: 11 },
  profileHeader: { alignItems: 'center', marginVertical: 32 },
  profileAvatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0223E6', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#0223E6', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  editBadge: { position: 'absolute', bottom: -6, backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  editBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  profileName: { color: '#000', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  profileEmail: { color: '#8E8E93', fontSize: 15, marginTop: 4 },
  settingsList: { gap: 12 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderRadius: 20 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { color: '#000', fontSize: 15, fontWeight: '600' },
  featuredCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, marginBottom: 20 },
  featuredContent: { flex: 1 },
  featuredLabel: { color: '#0223E6', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  featuredTitle: { color: '#000', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  featuredDesc: { color: '#8E8E93', fontSize: 14, fontWeight: '500', marginBottom: 16 },
  featuredLogos: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  featuredIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0223E6', alignItems: 'center', justifyContent: 'center' },
  quickGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  quickCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.03 },
  iconBox: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  quickTitle: { color: '#000', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  quickDesc: { color: '#8E8E93', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#8E8E93', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  seeAll: { color: '#0223E6', fontSize: 13, fontWeight: '600' },
  activityCard: { padding: 20, marginBottom: 10 },
  activityStatus: { color: '#000', fontSize: 15, fontWeight: '600', textTransform: 'capitalize' },
  activityDesc: { color: '#8E8E93', fontSize: 13, marginTop: 2 },
  activityTime: { color: '#C7C7CC', fontSize: 11, marginTop: 6 },
  emptyActivity: { padding: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 20 },

  // Ported Order Card Styles
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    overflow: 'hidden',
  },
  cardTop: { padding: 16 },
  cardBottom: {
    backgroundColor: '#FAFAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  listIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  listPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8E8E93',
  },
  listDate: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  miniStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniStatusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  orderIdSm: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  viewDetails: {
    fontSize: 13,
    color: '#0223E6',
    fontWeight: '600',
    marginRight: 2,
  },
  statusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  }
});

export default App;
