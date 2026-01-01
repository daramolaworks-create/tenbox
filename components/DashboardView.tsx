import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { HistoryView } from './HistoryView';
import {
  Search,
  ShoppingBag,
  CreditCard,
  Wallet,
  HeadphonesIcon,
  Truck,
  Plus,
  BarChart3,
  RotateCcw,
  Package,
  UserCircle,
  ArrowRight,
  Menu,
  X,
  Settings,
  Bell,
  Shield,
  Lock,
  LogOut
} from 'lucide-react';
import { StoreDirectory, Store } from './StoreDirectory';
import { GlobalFooter } from './GlobalFooter';
import { BrandDetailView } from './BrandDetailView';
import { CartView } from './CartView';
import { AccountSettings } from './settings/AccountSettings';
import { NotificationsSettings } from './settings/NotificationsSettings';
import { SecuritySettings } from './settings/SecuritySettings';
import { PrivacySettings } from './settings/PrivacySettings';
import { BookingView } from './BookingView';
import { TrackingView } from './TrackingView';
import { Quote } from '../types';

interface DashboardViewProps {
  onNewBooking: () => void;
  onLogout: () => void;
  onBook: (quote: Quote) => void;
}

type Tab = 'shop' | 'payments' | 'deliveries' | 'wallet' | 'service';
type SettingsView = 'account' | 'notifications' | 'security' | 'privacy' | null;

export const DashboardView: React.FC<DashboardViewProps> = ({ onNewBooking, onLogout, onBook }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split('/')[1] as Tab || 'shop';

  // State mapping to URL
  const [showStoreDirectory, setShowStoreDirectory] = useState(false);
  const [activeSettingsView, setActiveSettingsView] = useState<SettingsView>(null);
  const [isBookingActive, setIsBookingActive] = useState(false);
  const [activeTrackingQuote, setActiveTrackingQuote] = useState<Quote | null>(null);
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [isCartActive, setIsCartActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Sync internal state with URL params if needed for deep linking sub-views
  useEffect(() => {
    if (location.pathname.includes('/directory')) setShowStoreDirectory(true);
    else setShowStoreDirectory(false);

    if (location.pathname.includes('/book')) setIsBookingActive(true);
    else setIsBookingActive(false);

    if (location.pathname.includes('/cart')) setIsCartActive(true);
    else setIsCartActive(false);

    // Settings routing
    if (location.pathname.includes('/settings')) {
      const setting = location.pathname.split('/')[2];
      if (setting) setActiveSettingsView(setting as SettingsView);
      else setActiveSettingsView(null);
    } else {
      setActiveSettingsView(null);
    }
  }, [location.pathname]);

  // Handler helpers
  const handleNav = (tab: string) => {
    navigate(`/${tab}`);
    setIsMobileMenuOpen(false);
  };

  // Shop Data
  const shopBrands = ['Asos', 'boohoo', 'JD Sports', 'H&M', 'PrettyLittleThing'];
  const shopCategories = ['Beauty', 'Conscious brands', 'Electronics', 'Fashion & apparel', 'Home', 'Sports & outdoor', 'Travel', 'Luxury'];
  const shopMarketplaces = ['Amazon', 'eBay', 'Tesco'];

  // Wallet Data
  const transactions = [
    { id: 1, type: 'refund', description: 'Refund from Asos', date: 'Oct 24', amount: '+ £45.00' },
    { id: 2, type: 'debit', description: 'H&M Purchase', date: 'Oct 22', amount: '- £12.50' },
    { id: 3, type: 'credit', description: 'Wallet Top-up', date: 'Oct 20', amount: '+ £100.00' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2 -ml-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo Section */}
          <div className="flex-shrink-0 w-32">
            <button
              onClick={() => {
                navigate('/shop');
                setActiveTrackingQuote(null);
                setActiveStore(null);
                setIsMobileMenuOpen(false);
              }}
              className="hover:opacity-80 transition-opacity"
            >
              <BrandLogo />
            </button>
          </div>

          {/* Centered Menu Links - Hidden on Mobile, Visible on Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavButton
              active={activeTab === 'shop'}
              onClick={() => handleNav('shop')}
              icon={<ShoppingBag className="w-5 h-5" />}
              label="Shop"
            />
            <NavButton
              active={activeTab === 'payments'}
              onClick={() => handleNav('payments')}
              icon={<CreditCard className="w-5 h-5" />}
              label="Payments"
            />
            <NavButton
              active={activeTab === 'deliveries'}
              onClick={() => handleNav('deliveries')}
              icon={<Truck className="w-5 h-5" />}
              label="Deliveries"
            />
            <NavButton
              active={activeTab === 'wallet'}
              onClick={() => handleNav('wallet')}
              icon={<Wallet className="w-5 h-5" />}
              label="Wallet"
            />
            <NavButton
              active={activeTab === 'service'}
              onClick={() => handleNav('service')}
              icon={<HeadphonesIcon className="w-5 h-5" />}
              label="Customer service"
            />
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Cart Button */}
            <button
              onClick={() => {
                setIsCartActive(true);
                setShowStoreDirectory(false);
                setIsBookingActive(false);
                setActiveTrackingQuote(null);
                setActiveStore(null);
                setActiveSettingsView(null);
              }}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors relative ${isCartActive ? 'bg-gray-100' : ''}`}
            >
              <ShoppingBag className="w-6 h-6 text-gray-700" />
              {/* Mock Badge */}
              <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">2</span>
              </div>
            </button>



            {/* Profile Dropdown */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  D
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />

                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-bold text-gray-900">Dan Wilson</p>
                      <p className="text-sm text-gray-500">dan@example.com</p>
                    </div>
                    <div className="py-2">
                      <button className="w-full" onClick={() => { setActiveSettingsView('account'); setIsProfileDropdownOpen(false); }}>
                        <DropdownItem icon={<Settings className="w-4 h-4" />} label="Account settings" />
                      </button>
                      <button className="w-full" onClick={() => { setActiveSettingsView('notifications'); setIsProfileDropdownOpen(false); }}>
                        <DropdownItem icon={<Bell className="w-4 h-4" />} label="Notifications" />
                      </button>
                      <button className="w-full" onClick={() => { setActiveSettingsView('security'); setIsProfileDropdownOpen(false); }}>
                        <DropdownItem icon={<Shield className="w-4 h-4" />} label="Security" />
                      </button>
                      <button className="w-full" onClick={() => { setActiveSettingsView('privacy'); setIsProfileDropdownOpen(false); }}>
                        <DropdownItem icon={<Lock className="w-4 h-4" />} label="Privacy" />
                      </button>
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button className="w-full" onClick={onLogout}>
                        <DropdownItem icon={<LogOut className="w-4 h-4" />} label="Sign out" isDestructive />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <BrandLogo />
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="p-4">
              <MobileNavItem
                label="Shop"
                isActive={activeTab === 'shop'}
                onClick={() => { setActiveTab('shop'); setShowStoreDirectory(false); setIsBookingActive(false); setActiveTrackingQuote(null); setActiveStore(null); setIsCartActive(false); setIsMobileMenuOpen(false); }}
              />
              <MobileNavItem
                label="Payments"
                isActive={activeTab === 'payments'}
                onClick={() => { setActiveTab('payments'); setShowStoreDirectory(false); setIsBookingActive(false); setActiveTrackingQuote(null); setActiveStore(null); setIsCartActive(false); setIsMobileMenuOpen(false); }}
              />
              <MobileNavItem
                label="Deliveries"
                isActive={activeTab === 'deliveries'}
                onClick={() => { setActiveTab('deliveries'); setShowStoreDirectory(false); setIsBookingActive(false); setActiveTrackingQuote(null); setActiveStore(null); setIsCartActive(false); setIsMobileMenuOpen(false); }}
              />
              <MobileNavItem
                label="Wallet"
                isActive={activeTab === 'wallet'}
                onClick={() => { setActiveTab('wallet'); setShowStoreDirectory(false); setIsBookingActive(false); setActiveTrackingQuote(null); setActiveStore(null); setIsCartActive(false); setIsMobileMenuOpen(false); }}
              />
              <MobileNavItem
                label="Customer service"
                isActive={activeTab === 'service'}
                onClick={() => { setActiveTab('service'); setShowStoreDirectory(false); setIsBookingActive(false); setActiveTrackingQuote(null); setActiveStore(null); setIsCartActive(false); setIsMobileMenuOpen(false); }}
              />
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-[1200px] mx-auto px-6 pt-12 pb-32 animate-in fade-in duration-500">

        {/* SETTINGS VIEWS */}
        {activeSettingsView === 'account' && <AccountSettings onBack={() => setActiveSettingsView(null)} />}
        {activeSettingsView === 'notifications' && <NotificationsSettings onBack={() => setActiveSettingsView(null)} />}
        {activeSettingsView === 'security' && <SecuritySettings onBack={() => setActiveSettingsView(null)} />}
        {activeSettingsView === 'privacy' && <PrivacySettings onBack={() => setActiveSettingsView(null)} />}

        {/* BOOKING VIEW */}
        {isBookingActive && (
          <BookingView
            onBook={(quote) => {
              setActiveTrackingQuote(quote);
              setIsBookingActive(false);
            }}
          />
        )}

        {/* TRACKING VIEW */}
        {activeTrackingQuote && (
          <div className="max-w-2xl mx-auto py-6">
            <TrackingView
              quote={activeTrackingQuote}
              onReset={() => {
                setActiveTrackingQuote(null);
                setActiveTab('deliveries');
              }}
            />
          </div>
        )}

        {/* CART VIEW */}
        {isCartActive && (
          <CartView
            onBack={() => setIsCartActive(false)}
            onCheckout={() => alert('Proceed to Checkout')}
          />
        )}

        {/* BRAND DETAIL VIEW */}
        {activeStore && !isCartActive && (
          <BrandDetailView
            brand={activeStore}
            onBack={() => setActiveStore(null)}
          />
        )}

        {/* TABS CONTENT (Hidden when settings, booking, tracking, cart or store detail are active) */}
        {!activeSettingsView && !isBookingActive && !activeTrackingQuote && !activeStore && !isCartActive && (
          <>
            {/* SHOP TAB */}
            {activeTab === 'shop' && (
              showStoreDirectory ? (
                <StoreDirectory
                  onBack={() => setShowStoreDirectory(false)}
                  onSelectStore={(store) => setActiveStore(store)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-500">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 font-display">Discovery</h1>
                  <p className="text-xl text-gray-500 max-w-2xl mb-12 text-center">
                    Explore thousands of brands and pay flexibly with Tenbox at checkout.
                  </p>

                  {/* NAVIGATION CHOICES */}
                  <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4">

                    {/* 1. Brands & Marketplaces -> DIRECT LINKS TO BRANDS */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Brands & Marketplaces</h2>
                      </div>
                      <div className="space-y-4">
                        {/* Manually creating a few featured links that simulate clicking a store */}
                        {[
                          {
                            id: '4',
                            name: 'Amazon',
                            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
                            color: 'bg-white border border-gray-200'
                          },
                          {
                            id: '3',
                            name: 'Nike',
                            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
                            color: 'bg-gray-100'
                          },
                          {
                            id: '11',
                            name: 'boohoo',
                            logoUrl: '/boohoo-logo.png',
                            color: 'bg-white'
                          },
                          {
                            id: '8',
                            name: 'eBay',
                            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
                            color: 'bg-white border border-gray-200'
                          },
                          {
                            id: '6',
                            name: 'JD Sports',
                            logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/JD_Sports_logo.svg/1200px-JD_Sports_logo.svg.png',
                            color: 'bg-white border border-gray-200'
                          },
                          {
                            id: '12',
                            name: 'Apple',
                            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
                            color: 'bg-gray-100'
                          }
                        ].map(brand => (
                          <button
                            key={brand.id}
                            onClick={() => {
                              // Manually finding the store from the directory data would be best, 
                              const mockStore = {
                                id: brand.id,
                                name: brand.name,
                                category: 'Featured',
                                color: 'bg-black',
                                heroColor: brand.name === 'Amazon' ? 'bg-[#232f3e]' : (brand.name === 'Nike' ? 'bg-[#111111]' : 'bg-[#090215]'),
                                textColor: 'text-white',
                                trustScore: 4.5,
                                reviewCount: '10k+',
                                description: `Shop at ${brand.name} with Tenbox.`
                              };
                              setActiveStore(mockStore as any);
                            }}
                            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${brand.name === 'boohoo' ? '' : 'p-2.5'} ${brand.color}`}>
                                <img
                                  src={brand.logoUrl}
                                  alt={brand.name}
                                  className={`w-full h-full object-contain ${brand.name === 'boohoo' ? '' : 'mix-blend-multiply'}`}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.innerText = brand.name[0];
                                  }}
                                />
                              </div>
                              <span className="font-bold text-lg">{brand.name}</span>
                            </div>
                            <div className="text-sm font-bold text-gray-400 group-hover:text-black">
                              Open
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. Categories -> GO TO STORES PAGE */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Categories</h2>
                        <p className="text-gray-500 mb-8">Browse our full directory of stores by category.</p>

                        <div className="flex flex-wrap gap-2 mb-8">
                          {['Electronics', 'Fashion', 'Sports', 'Home'].map(cat => (
                            <span key={cat} className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium text-gray-600">
                              {cat}
                            </span>
                          ))}
                          <span className="px-3 py-1 bg-gray-50 rounded-md text-sm font-medium text-gray-400">+12 more</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/shop/directory')}
                        className="w-full bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:grad hover:bg-gray-900 transition-all shadow-lg flex items-center justify-center group"
                      >
                        <span>Browse Stores</span>
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>

                  </div>
                </div>


              ))}

            {/* PAYMENTS TAB (Matches Reference Image) */}
            {
              activeTab === 'payments' && (
                <div className="flex flex-col items-center">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-16 text-center">Payments</h1>

                  <div className="text-center mb-20">
                    <p className="text-gray-500 font-medium mb-2">Total you owe</p>
                    <p className="text-5xl md:text-6xl font-bold tracking-tighter text-gray-900">£0.00</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <DashboardCard
                      icon={<ShoppingBag className="w-6 h-6" />}
                      title="All purchases"
                      subtitle="Good things are coming"
                      bgColor="bg-blue-50"
                      iconColor="text-blue-600"
                    />
                    <DashboardCard
                      icon={<RotateCcw className="w-6 h-6" />}
                      title="Refunds & returns"
                      subtitle="None in progress"
                      bgColor="bg-gray-50"
                      iconColor="text-gray-900"
                    />
                    <DashboardCard
                      icon={<BarChart3 className="w-6 h-6" />}
                      title="Insights"
                      subtitle="£0 spent this month"
                      bgColor="bg-gray-50"
                      iconColor="text-gray-900"
                    />
                    <DashboardCard
                      icon={<Truck className="w-6 h-6" />}
                      title="Deliveries"
                      subtitle="None in progress"
                      bgColor="bg-gray-50"
                      iconColor="text-gray-900"
                    />
                  </div>

                  <div className="mt-24 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-4 border-black flex items-center justify-center mb-6">
                      <div className="w-6 h-3 border-l-4 border-b-4 border-black -rotate-45 -mt-1"></div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Nothing to pay</h3>
                    <p className="text-gray-500 text-center max-w-md">
                      As soon as a new purchase is processed, you'll be able to manage your payments here
                    </p>
                  </div>
                </div>
              )
            }

            {/* DELIVERIES TAB */}
            {
              activeTab === 'deliveries' && (
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center justify-between mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Deliveries</h1>
                    <button
                      onClick={() => navigate('/deliveries/book')}
                      className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-all flex items-center shadow-lg hover:shadow-xl active:scale-95"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      New booking
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-3xl p-8 text-center mb-10 border border-gray-100">
                    <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Track a package</h3>
                    <p className="text-gray-500 text-sm mb-6">Enter a tracking number to see details</p>
                    <div className="max-w-md mx-auto relative">
                      <input
                        type="text"
                        placeholder="e.g. TNBX-88293"
                        className="w-full pl-5 pr-12 py-3 rounded-xl border-none shadow-sm text-gray-900 focus:ring-2 focus:ring-black"
                      />
                      <button className="absolute right-2 top-2 p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <Search className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">Recent Activity</h3>
                    <HistoryView />
                  </div>
                </div>
              )
            }



            {/* WALLET TAB */}
            {
              activeTab === 'wallet' && (
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-10">Wallet</h1>

                  {/* Cards Section */}
                  {/* Cards Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Barclays Card (Default) */}
                    <div className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-[#005c93] to-[#003d63] text-white p-6 flex flex-col justify-between shadow-lg group hover:scale-[1.02] transition-transform duration-300">
                      {/* "DEFAULT" Badge */}
                      <div className="absolute top-0 right-0 bg-[#00aeef] text-white text-xs font-bold px-8 py-1.5 rotate-45 translate-x-8 translate-y-4 shadow-sm z-10">
                        DEFAULT
                      </div>

                      <div>
                        <h3 className="font-bold text-2xl mb-1 tracking-tight">Barclays</h3>
                        <p className="text-white/70 font-medium text-sm">Debit Card</p>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <div className="flex space-x-2 text-xl tracking-widest font-mono mb-2 opacity-90">
                            <span>••••</span> <span>••••</span> <span>••••</span> <span>4829</span>
                          </div>
                          <div className="w-10 h-6 bg-white/20 rounded-md border border-white/20 backdrop-blur-sm"></div>
                        </div>
                        <span className="font-bold italic text-2xl tracking-tighter opacity-80">VISA</span>
                      </div>

                      {/* Button overlay at bottom */}
                      <div className="absolute bottom-5 right-5">
                        <button className="bg-white hover:bg-gray-50 text-red-600 font-bold text-xs py-2 px-5 rounded-full transition-colors shadow-lg active:scale-95">
                          Remove card
                        </button>
                      </div>
                    </div>

                    {/* Santander Card */}
                    <div className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-[#ec0000] to-[#800000] text-white p-6 flex flex-col justify-between shadow-lg hover:scale-[1.02] transition-transform duration-300">
                      <div>
                        <h3 className="font-bold text-2xl mb-1 tracking-tight">Santander</h3>
                        <p className="text-white/70 font-medium text-sm">Credit Card</p>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <div className="flex space-x-2 text-xl tracking-widest font-mono mb-2 opacity-90">
                            <span>••••</span> <span>••••</span> <span>••••</span> <span>1142</span>
                          </div>
                          <div className="w-10 h-6 bg-white/20 rounded-md border border-white/20 backdrop-blur-sm"></div>
                        </div>
                        <span className="font-bold italic text-2xl tracking-tighter opacity-80">Mastercard</span>
                      </div>

                      <div className="absolute bottom-5 right-5">
                        <button className="bg-white/90 hover:bg-white text-red-600 font-bold text-xs py-2 px-5 rounded-full transition-colors shadow-lg active:scale-95">
                          Remove card
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Accounts Section */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Accounts</h2>
                  <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mb-12">
                    <div className="p-8 pb-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-6 w-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold text-xs">T</div>
                        <span className="font-medium text-gray-900">Tenbox balance</span>
                      </div>
                      <div className="text-5xl font-bold tracking-tight text-gray-900">£0.00</div>
                    </div>
                    <div className="bg-gray-50 px-8 py-5 flex flex-wrap gap-4 items-center justify-between">
                      <span className="text-green-700 font-medium text-sm">Earn up to 14.00% cashback</span>
                      <button className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">Add funds</button>
                    </div>
                  </div>

                  {/* Transactions Section */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent activity</h2>
                  <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                    {transactions.map((t, i) => (
                      <div key={t.id} className={`flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer ${i !== transactions.length - 1 ? 'border-b border-gray-50' : ''}`}>
                        <div className="flex items-center space-x-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.type === 'credit' || t.type === 'refund' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-900'}`}>
                            {t.type === 'refund' && <RotateCcw className="w-5 h-5 stroke-[2.5px]" />}
                            {t.type === 'credit' && <Plus className="w-5 h-5 stroke-[2.5px]" />}
                            {t.type === 'debit' && <ShoppingBag className="w-5 h-5 stroke-[2.5px]" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{t.description}</p>
                            <p className="text-sm text-gray-500">{t.date}</p>
                          </div>
                        </div>
                        <span className={`font-bold ${t.type === 'debit' ? 'text-gray-900' : 'text-green-600'}`}>{t.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            {/* SERVICE TAB (Placeholder) */}
            {
              activeTab === 'service' && (
                <PlaceholderState
                  icon={<HeadphonesIcon className="w-12 h-12" />}
                  title="24/7 Support"
                  description="Need help with a shipment? Our team is available around the clock."
                />
              )
            }

          </>
        )}

      </main >
      <GlobalFooter />
    </div >
  );
};

// Sub-components

const NavButton = ({ label, isActive, onClick, mobile }: { label: string, isActive: boolean, onClick: () => void, mobile?: boolean }) => (
  <button
    onClick={onClick}
    className={`relative font-bold text-sm transition-colors ${isActive ? 'text-black' : 'text-gray-500 hover:text-black'
      } ${mobile ? 'whitespace-nowrap' : ''}`}
  >
    {label}
    {isActive && (
      <div className="absolute -bottom-8 left-0 right-0 h-0.5 bg-black md:block hidden"></div>
    )}
  </button>
);

const DashboardCard = ({ icon, title, subtitle, bgColor, iconColor }: any) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-48 justify-between group">
    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-lg text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 font-medium">{subtitle}</p>
    </div>
  </div>
);

const PlaceholderState = ({ icon, title, description }: any) => (
  <div className="flex flex-col items-center justify-center py-32 text-center">
    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-400">
      {icon}
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
    <p className="text-gray-500 max-w-md">{description}</p>
  </div>
);

const DropdownItem = ({ icon, label, isDestructive }: { icon: React.ReactNode; label: string; isDestructive?: boolean }) => (
  <button className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${isDestructive ? 'text-red-600' : 'text-gray-700'}`}>
    <span className={isDestructive ? 'text-red-500' : 'text-gray-400'}>{icon}</span>
    <span>{label}</span>
  </button>
);

const MobileNavItem = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-4 rounded-xl font-bold text-lg transition-all ${isActive
      ? 'bg-gray-100 text-black'
      : 'text-gray-500 hover:bg-gray-50 hover:text-black'
      }`}
  >
    {label}
  </button>
);