import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, LayoutAnimation, ActivityIndicator, Image, Platform } from 'react-native';
import { Button, Input, Card } from './UI';
import { useCartStore, STORE_ADDRESSES, getStoreRegion } from '../store';
import { supabase } from '../lib/supabase';
import { X, Check, MapPin, Truck, ChevronRight, CreditCard, Plus, ArrowLeft, RefreshCw, Landmark } from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';


const COUNTRIES = [
    { code: 'NG', name: 'Nigeria' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AE', name: 'United Arab Emirates' },
];


interface CheckoutFlowProps {
    visible: boolean;
    onClose: () => void;
    onComplete: () => void;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ visible, onClose, onComplete }) => {
    const [step, setStep] = useState<'address' | 'add-address' | 'delivery' | 'review'>('address');
    const { addresses, user, items, clearCart, createOrder, addAddress } = useCartStore();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    // New Address Form State
    const [newLabel, setNewLabel] = useState('');
    const [newStreet, setNewStreet] = useState('');
    const [newCity, setNewCity] = useState('');
    const [newZip, setNewZip] = useState('');
    const [newCountry, setNewCountry] = useState('');
    const [countryPickerVisible, setCountryPickerVisible] = useState(false);

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [rates, setRates] = useState<any[]>([]);
    const [loadingRates, setLoadingRates] = useState(false);
    const [selectedRate, setSelectedRate] = useState<any>(null); // Full rate object
    const [isProcessing, setIsProcessing] = useState(false);

    const [paymentCurrency, setPaymentCurrency] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');

    // Derived Financials (Moved to Top for Scope)
    const storeRegion = items[0]?.store ? getStoreRegion(items[0].store) : 'USA';
    const storeConfig = STORE_ADDRESSES[storeRegion] || STORE_ADDRESSES['USA'];
    const baseCurrencyCode = storeConfig.currency;

    useEffect(() => {
        if (!paymentCurrency) {
            setPaymentCurrency(baseCurrencyCode);
        }
    }, [baseCurrencyCode, paymentCurrency]);

    const CURRENCY_CODE = paymentCurrency || baseCurrencyCode;

    const CURRENCY_MAP: Record<string, { symbol: string, rate: number }> = {
        'USD': { symbol: '$', rate: 1 },
        'GBP': { symbol: '£', rate: 0.8 },
        'AED': { symbol: 'AED ', rate: 3.67 },
        'NGN': { symbol: '₦', rate: 1500 },
        'EUR': { symbol: '€', rate: 0.9 },
    };

    const currentCurrencyData = CURRENCY_MAP[CURRENCY_CODE] || CURRENCY_MAP['USD'];
    const CURRENCY_SYMBOL = currentCurrencyData.symbol;

    const baseRate = CURRENCY_MAP[baseCurrencyCode]?.rate || 1;
    const targetRate = currentCurrencyData.rate;
    const exchangeMultiplier = targetRate / baseRate;

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * exchangeMultiplier;
    const deliveryPrice = (selectedRate ? parseFloat(selectedRate.amount) : 0) * exchangeMultiplier;
    const tax = subtotal * 0.08; // 8% mock tax
    const total = subtotal + deliveryPrice + tax;

    const formatMoney = (amount: number) => {
        return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleCurrencyChange = (newCurrency: string) => {
        setPaymentCurrency(newCurrency);
        if (newCurrency !== 'NGN' && paymentMethod === 'transfer') {
            setPaymentMethod('card');
        }
    };

    useEffect(() => {
        if (addresses.some(a => a.default) && !selectedAddressId) {
            const defaultAddr = addresses.find(a => a.default);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
        } else if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        }
    }, [addresses, visible]);

    const fetchShopRates = async () => {
        if (!selectedAddressId || items.length === 0) return;

        setLoadingRates(true);
        setRates([]);
        setSelectedRate(null);

        const addr = addresses.find(a => a.id === selectedAddressId);
        const origin = STORE_ADDRESSES[getStoreRegion(items[0].store)] || STORE_ADDRESSES['USA'];

        try {
            const { data, error } = await supabase.functions.invoke('get-rates', {
                body: {
                    address_from: {
                        name: origin.name,
                        street1: origin.street,
                        city: origin.city,
                        zip: origin.zip,
                        country: origin.country
                    },
                    address_to: {
                        name: user?.name || 'Customer',
                        street1: addr?.street,
                        city: addr?.city,
                        zip: addr?.zip,
                        country: addr?.country
                    },
                    parcels: [{
                        length: "10", width: "10", height: "10",
                        distance_unit: "in",
                        weight: (items.length * 0.5).toString(), // Mock weight: 0.5kg per item
                        mass_unit: "kg"
                    }],
                    items: items.map(i => ({
                        description: i.title,
                        quantity: i.quantity,
                        value: i.price,
                        weight: "0.5"
                    }))
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            // Filter & Sort Rates
            const ratesList = (data.rates || []).sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount));
            setRates(ratesList);

        } catch (err: any) {
            console.error('Rate fetch error:', err);
            Alert.alert('Shipping Error', 'Could not fetch live rates. Please try again.');
        } finally {
            setLoadingRates(false);
        }
    };

    const handleNext = () => {
        if (step === 'address') {
            if (!selectedAddressId) {
                Alert.alert('Required', 'Please select a delivery address.');
                return;
            }
            setStep('delivery');
            fetchShopRates(); // Fetch when moving to delivery step
        } else if (step === 'add-address') {
            // Validate and save is handled by handleSaveAddress
        } else if (step === 'delivery') {
            if (!selectedRate) {
                Alert.alert('Required', 'Please select a delivery method.');
                return;
            }
            setStep('review');
        }
    };

    const handleBack = () => {
        if (step === 'review') setStep('delivery');
        else if (step === 'delivery') setStep('address');
        else if (step === 'add-address') setStep('address');
    };

    const fetchPaymentSheetParams = async () => {
        const payload = {
            amount: total,
            currency: CURRENCY_CODE.toLowerCase(),
            email: user?.email || 'user@example.com',
            name: user?.name || 'Tenbox User'
        };

        // Debug: Check if the key is loaded correctly
        const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
        console.log('DEBUG: Supabase Key starts with:', key.substring(0, 5) + '...' + key.substring(key.length - 5));
        console.log('DEBUG: Payload:', JSON.stringify(payload));





        try {
            const { data, error } = await supabase.functions.invoke('payment-sheet', {
                body: payload
            });

            if (error) {
                console.error('Payment Sheet Error Object:', JSON.stringify(error, null, 2));
                // Supabase Edge Functions often return the error message in error.context or error.message
                // We want to show the specific error from the backend if possible
                let backendError = error.message || JSON.stringify(error);
                
                // Try parsing the error context response if available
                if (error.context && typeof error.context.text === 'function') {
                    try {
                        const errorText = await error.context.text();
                        try {
                            const errorJson = JSON.parse(errorText);
                            backendError = errorJson.error || errorJson.message || errorText;
                        } catch (e) {
                            backendError = errorText;
                        }
                    } catch (e) {
                        // Ignore
                    }
                }
                
                Alert.alert('Payment Error', `Server: ${backendError}`);
                return null;
            }

            if (!data || !data.paymentIntent) {
                Alert.alert('Payment Error', 'Invalid response from server');
                return null;
            }

            return {
                paymentIntent: data.paymentIntent,
                ephemeralKey: data.ephemeralKey,
                customer: data.customer,
            };
        } catch (e: any) {
            Alert.alert('Network Error', e.message);
            return null;
        }
    };

    const handlePay = async () => {
        setIsProcessing(true);

        try {
            if (paymentMethod === 'transfer') {
                // Mock Paystack/Bank Transfer flow
                Alert.alert(
                    'Bank Transfer',
                    `Opening Paystack widget to complete transfer of ${CURRENCY_SYMBOL}${formatMoney(total)}`,
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => setIsProcessing(false) },
                        { text: 'Simulate Success', onPress: async () => {
                            const itemsSummary = items.length > 1
                                ? `${items[0].title} & ${items.length - 1} more`
                                : items[0]?.title || 'Order Items';

                            await createOrder(total, itemsSummary, subtotal);
                            clearCart();

                            Alert.alert('Success', 'Your order is confirmed!');
                            onComplete();
                            setIsProcessing(false);
                        }}
                    ]
                );
                return;
            }

            // 1. Fetch Params
            const params = await fetchPaymentSheetParams();
            if (!params) {
                setIsProcessing(false);
                return;
            }

            // 2. Initialize
            const { error } = await initPaymentSheet({
                merchantDisplayName: "Tenbox, Inc.",
                customerId: params.customer,
                customerEphemeralKeySecret: params.ephemeralKey,
                paymentIntentClientSecret: params.paymentIntent,
                allowsDelayedPaymentMethods: true,
                returnURL: 'tenbox://stripe-redirect',
                defaultBillingDetails: {
                    name: user?.name || 'Tenbox User',
                    email: user?.email || undefined,
                }
            });

            if (error) {
                Alert.alert('Error', error.message);
                setIsProcessing(false);
                return;
            }

            // 3. Present
            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
                if (paymentError.code !== 'Canceled') {
                    Alert.alert(`Error code: ${paymentError.code}`, paymentError.message);
                }
                setIsProcessing(false);
            } else {
                // Success!
                const itemsSummary = items.length > 1
                    ? `${items[0].title} & ${items.length - 1} more`
                    : items[0]?.title || 'Order Items';

                await createOrder(total, itemsSummary, subtotal);
                clearCart();

                Alert.alert('Success', 'Your order is confirmed!');
                onComplete();
                setIsProcessing(false);
            }
        } catch (e: any) {
            console.error(e);
            Alert.alert('Error', e.message);
            setIsProcessing(false);
        }
    };
    const handleSaveAddress = async () => {
        if (!newLabel || !newStreet || !newCity || !newZip || !newCountry) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const newAddr = {
            id: Math.random().toString(36).substr(2, 9),
            label: newLabel,
            street: newStreet,
            city: newCity,
            zip: newZip,
            country: newCountry, // Store code or name? stored as code in AddressesView usually, but explicit check needed.
            default: addresses.length === 0
        };

        const success = await addAddress(newAddr);
        if (success) {
            setSelectedAddressId(newAddr.id);
            setStep('address');
            // Reset form
            setNewLabel('');
            setNewStreet('');
            setNewCity('');
            setNewZip('');
            setNewCountry('');
        } else {
            Alert.alert('Error', 'Failed to save address');
        }
    };



    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
            transparent={Platform.OS !== 'ios'}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={step === 'address' ? onClose : handleBack} style={styles.headerBtn}>
                        {step === 'address' ? <X size={24} color="#000" /> : <ArrowLeft size={24} color="#000" />}
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {step === 'add-address' ? 'New Address' : `Checkout (${storeRegion})`}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressStep, step === 'address' || step === 'delivery' || step === 'review' ? styles.activeStep : {}]} />
                    <View style={[styles.progressStep, step === 'delivery' || step === 'review' ? styles.activeStep : {}]} />
                    <View style={[styles.progressStep, step === 'review' ? styles.activeStep : {}]} />
                </View>
                <Text style={styles.stepTitle}>
                    {step === 'address' && 'Select Address'}
                    {step === 'add-address' && 'Enter Details'}
                    {step === 'delivery' && 'Delivery Method'}
                    {step === 'review' && 'Review & Pay'}
                </Text>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>

                    {/* STEP 1: ADDRESS */}
                    {step === 'address' && (
                        <View style={{ gap: 16 }}>
                            {addresses.map(addr => (
                                <TouchableOpacity key={addr.id} activeOpacity={0.8} onPress={() => setSelectedAddressId(addr.id)}>
                                    <Card style={[styles.optionCard, selectedAddressId === addr.id && styles.selectedOption]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                            <View style={[styles.radioCircle, selectedAddressId === addr.id && styles.radioActive]}>
                                                {selectedAddressId === addr.id && <View style={styles.radioDot} />}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={styles.addrLabel}>{addr.label}</Text>
                                                    {addr.default && <Text style={styles.defaultTag}>Default</Text>}
                                                </View>
                                                <Text style={styles.addrText}>{addr.street}</Text>
                                                <Text style={styles.addrText}>{addr.city}, {addr.zip}</Text>
                                                <Text style={styles.addrText}>{addr.country}</Text>
                                            </View>
                                        </View>
                                    </Card>
                                </TouchableOpacity>
                            ))}

                            <Button variant="outline" style={{ marginTop: 8 }} onPress={() => setStep('add-address')}>
                                <Plus size={18} color="#000" style={{ marginRight: 8 }} />
                                Add New Address
                            </Button>
                        </View>
                    )}

                    {/* STEP 1.5: ADD ADDRESS */}
                    {step === 'add-address' && (
                        <View style={{ gap: 20 }}>
                            <Input label="Label (e.g. Home)" value={newLabel} onChangeText={setNewLabel} placeholder="Home, Work, etc." />
                            <Input label="Street Address" value={newStreet} onChangeText={setNewStreet} placeholder="123 Main St" />
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <Input label="City" style={{ flex: 1 }} value={newCity} onChangeText={setNewCity} placeholder="New York" />
                                <Input label="ZIP Code" style={{ flex: 1 }} value={newZip} onChangeText={setNewZip} keyboardType="numeric" placeholder="10001" />
                            </View>

                            <View>
                                <Text style={{ fontSize: 14, fontFamily: 'Satoshi-Bold', color: '#374151', marginBottom: 8, marginLeft: 4 }}>Country</Text>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 18, height: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                                    }}
                                    onPress={() => setCountryPickerVisible(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={{ fontSize: 16, fontFamily: 'Satoshi-Medium', color: newCountry ? '#111827' : '#9CA3AF' }}>
                                        {newCountry ? COUNTRIES.find(c => c.code === newCountry)?.name || newCountry : 'Select Country'}
                                    </Text>
                                    <ChevronRight size={20} color="#6B7280" rotation={90} />
                                </TouchableOpacity>
                            </View>

                            {countryPickerVisible && (
                                <Modal visible={countryPickerVisible} transparent animationType="fade" onRequestClose={() => setCountryPickerVisible(false)}>
                                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                                        <View style={{ backgroundColor: '#fff', width: '100%', borderRadius: 24, padding: 24 }}>
                                            <Text style={{ fontSize: 20, fontFamily: 'Satoshi-Bold', marginBottom: 16 }}>Select Country</Text>
                                            {COUNTRIES.map((c) => (
                                                <TouchableOpacity
                                                    key={c.code}
                                                    style={{ paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, backgroundColor: newCountry === c.code ? '#E0E7FF' : 'transparent' }}
                                                    onPress={() => {
                                                        setNewCountry(c.code);
                                                        setCountryPickerVisible(false);
                                                    }}
                                                >
                                                    <Text style={{ fontSize: 16, fontFamily: newCountry === c.code ? 'Satoshi-Bold' : 'Satoshi-Medium', color: newCountry === c.code ? '#1C39BB' : '#374151' }}>{c.name}</Text>
                                                    {newCountry === c.code && <Check size={18} color="#1C39BB" />}
                                                </TouchableOpacity>
                                            ))}
                                            <Button variant="secondary" onPress={() => setCountryPickerVisible(false)} style={{ marginTop: 16 }}>Cancel</Button>
                                        </View>
                                    </View>
                                </Modal>
                            )}

                            <Button size="lg" onPress={handleSaveAddress} style={{ marginTop: 24 }}>Save & Use Address</Button>
                        </View>
                    )}

                    {/* STEP 2: DELIVERY */}
                    {step === 'delivery' && (
                        <View style={{ gap: 16 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.sectionHeader}>
                                    SHIPPING FROM {storeRegion.toUpperCase()}
                                </Text>
                                {loadingRates && <ActivityIndicator size="small" color="#1C39BB" />}
                            </View>
                            {/* Rates Selection */}
                            <View style={{ gap: 12 }}>
                                {loadingRates ? (
                                    <View style={{ padding: 40, alignItems: 'center' }}>
                                        <ActivityIndicator size="large" color="#1C39BB" />
                                        <Text style={{ marginTop: 16, color: '#8E8E93' }}>Finding best rates...</Text>
                                    </View>
                                ) : (
                                    rates.map((rate: any) => {
                                        const isCheapest = rate.amount === Math.min(...rates.map((r: any) => parseFloat(r.amount)));
                                        const isFastest = rate.estimated_days === Math.min(...rates.map((r: any) => r.estimated_days));

                                        return (
                                            <TouchableOpacity
                                                key={rate.object_id}
                                                activeOpacity={0.7}
                                                style={[styles.ticketCard, selectedRate?.object_id === rate.object_id && styles.selectedTicket]}
                                                onPress={() => setSelectedRate(rate)}
                                            >
                                                <View style={styles.ticketLeft}>
                                                    <View style={styles.carrierLogo}>
                                                        <Image source={{ uri: rate.provider_image_75 }} style={{ width: 32, height: 32 }} resizeMode="contain" />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.ticketName}>{rate.provider}</Text>
                                                        <Text style={styles.ticketService} numberOfLines={1} ellipsizeMode="tail">{rate.servicelevel.name}</Text>
                                                    </View>
                                                </View>

                                                <View style={styles.ticketRight}>
                                                    <Text style={styles.ticketPrice}>{CURRENCY_SYMBOL}{rate.amount}</Text>
                                                    <Text style={styles.ticketTime}>{rate.estimated_days} Days</Text>
                                                </View>

                                                {/* Badges */}
                                                {(isCheapest || isFastest) && (
                                                    <View style={[styles.ticketBadge, { backgroundColor: isFastest ? '#34C759' : '#FF9500' }]}>
                                                        <Text style={styles.ticketBadgeText}>{isFastest ? 'FASTEST' : 'CHEAPEST'}</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </View>
                        </View>
                    )}

                    {/* STEP 3: REVIEW */}
                    {step === 'review' && (
                        <View style={{ gap: 24 }}>
                            <View style={styles.fancyCard}>
                                <Text style={styles.fancySectionTitle}>ORDER DETAILS</Text>
                                
                                {/* Items Preview */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        {items.map(item => (
                                            <Image key={item.id} source={{ uri: item.image }} style={styles.fancyThumb} />
                                        ))}
                                    </View>
                                </ScrollView>

                                <View style={styles.fancyDivider} />

                                {/* Shipping Details */}
                                <View style={styles.fancyRow}>
                                    <View style={styles.fancyIconWrap}>
                                        <MapPin size={20} color="#1C39BB" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.fancyMainText}>{selectedAddress?.street}, {selectedAddress?.city}</Text>
                                        <Text style={styles.fancySubText}>{selectedAddress?.zip}, {selectedAddress?.country}</Text>
                                    </View>
                                    <Button size="sm" variant="ghost" onPress={() => setStep('address')} style={{ minWidth: 60, paddingHorizontal: 0 }}>Edit</Button>
                                </View>

                                <View style={[styles.fancyRow, { marginTop: 20 }]}>
                                    <View style={styles.fancyIconWrap}>
                                        <Truck size={20} color="#1C39BB" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.fancyMainText}>{selectedRate?.provider} ({selectedRate?.servicelevel.name})</Text>
                                        <Text style={styles.fancySubText}>
                                            {selectedRate?.estimated_days || '2-5'} Days • {selectedRate?.currency} {selectedRate?.amount}
                                        </Text>
                                    </View>
                                    <Button size="sm" variant="ghost" onPress={() => setStep('delivery')} style={{ minWidth: 60, paddingHorizontal: 0 }}>Edit</Button>
                                </View>
                            </View>

                            {/* Currency & Payment Selection */}
                            <View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <Text style={[styles.fancySectionTitle, { marginBottom: 0, paddingLeft: 8 }]}>PAYMENT METHOD</Text>
                                    
                                    {/* Currency Picker */}
                                    <View style={styles.currencyToggle}>
                                        {['USD', 'GBP', 'EUR', 'NGN'].map(curr => (
                                            <TouchableOpacity 
                                                key={curr} 
                                                onPress={() => handleCurrencyChange(curr)}
                                                style={[styles.currencyBtn, CURRENCY_CODE === curr && styles.currencyBtnActive]}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={[styles.currencyText, CURRENCY_CODE === curr && styles.currencyTextActive]}>{curr}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* Payment Methods */}
                                <View style={{ gap: 12 }}>
                                    {/* Card Option */}
                                    <TouchableOpacity 
                                        activeOpacity={0.8} 
                                        style={[styles.payMethodCard, paymentMethod === 'card' && styles.payMethodActive]}
                                        onPress={() => setPaymentMethod('card')}
                                    >
                                        <View style={[styles.radioCircle, paymentMethod === 'card' && styles.radioActive]}>
                                            {paymentMethod === 'card' && <View style={styles.radioDot} />}
                                        </View>
                                        <View style={styles.payMethodIcon}>
                                            <CreditCard size={24} color={paymentMethod === 'card' ? '#1C39BB' : '#8E8E93'} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.payMethodTitle, paymentMethod === 'card' && { color: '#1C39BB' }]}>Debit / Credit Card</Text>
                                            <Text style={styles.payMethodSub}>Pay securely with Stripe</Text>
                                        </View>
                                    </TouchableOpacity>

                                    {/* Transfer Option (Only if NGN) */}
                                    {CURRENCY_CODE === 'NGN' && (
                                        <TouchableOpacity 
                                            activeOpacity={0.8} 
                                            style={[styles.payMethodCard, paymentMethod === 'transfer' && styles.payMethodActive]}
                                            onPress={() => setPaymentMethod('transfer')}
                                        >
                                            <View style={[styles.radioCircle, paymentMethod === 'transfer' && styles.radioActive]}>
                                                {paymentMethod === 'transfer' && <View style={styles.radioDot} />}
                                            </View>
                                            <View style={styles.payMethodIcon}>
                                                <Landmark size={24} color={paymentMethod === 'transfer' ? '#1C39BB' : '#8E8E93'} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.payMethodTitle, paymentMethod === 'transfer' && { color: '#1C39BB' }]}>Bank Transfer</Text>
                                                <Text style={styles.payMethodSub}>Pay via direct bank transfer</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Summary */}
                            <View style={[styles.fancyCard, { paddingVertical: 24 }]}>
                                <View style={styles.sumRow}><Text style={styles.sumLabel}>Subtotal</Text><Text style={styles.sumVal}>{CURRENCY_SYMBOL}{formatMoney(subtotal)}</Text></View>
                                <View style={styles.sumRow}><Text style={styles.sumLabel}>Delivery</Text><Text style={styles.sumVal}>{CURRENCY_SYMBOL}{formatMoney(deliveryPrice)}</Text></View>
                                <View style={[styles.sumRow, { marginBottom: 0 }]}><Text style={styles.sumLabel}>Tax (8%)</Text><Text style={styles.sumVal}>{CURRENCY_SYMBOL}{formatMoney(tax)}</Text></View>
                                
                                <View style={styles.fancyDivider} />
                                
                                <View style={[styles.sumRow, { marginBottom: 0, alignItems: 'center' }]}>
                                    <Text style={styles.sumTotalLabel}>Total</Text>
                                    <Text style={styles.sumTotalVal}>{CURRENCY_SYMBOL}{formatMoney(total)}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                </ScrollView>

                {/* Footer Actions */}
                {step !== 'add-address' && (
                    <View style={styles.footer}>
                        {step !== 'review' ? (
                            <Button size="lg" onPress={handleNext} style={{ width: '100%' }}>
                                Continue
                            </Button>
                        ) : (
                            <Button size="lg" onPress={handlePay} style={{ width: '100%' }} disabled={isProcessing}>
                                {isProcessing ? <ActivityIndicator color="#fff" /> : `Pay ${CURRENCY_SYMBOL}${formatMoney(total)}`}
                            </Button>
                        )}
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, backgroundColor: '#fff' },
    headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#F2F2F7' },
    headerTitle: { fontSize: 17, fontWeight: '700' },
    progressContainer: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, marginTop: 24 },
    progressStep: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E5EA' },
    activeStep: { backgroundColor: '#1C39BB' },
    stepTitle: { fontSize: 28, fontWeight: '800', marginHorizontal: 24, marginTop: 16, marginBottom: 8, letterSpacing: -0.5 },

    // Cards & Options
    optionCard: { padding: 20, borderWidth: 2, borderColor: 'transparent' },
    selectedOption: { borderColor: '#1C39BB', backgroundColor: '#F5F7FF' },
    radioCircle: { width: 22, height: 22, borderRadius: 12, borderWidth: 2, borderColor: '#C7C7CC', alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: '#1C39BB' },
    radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#1C39BB' },
    addrLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    addrText: { fontSize: 14, color: '#3A3A3C', lineHeight: 20 },
    defaultTag: { fontSize: 11, fontWeight: '700', color: '#1C39BB', backgroundColor: '#E0E7FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },

    // Carrier Tickets (New)
    ticketCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', minHeight: 80 },
    selectedTicket: { borderColor: '#1C39BB', backgroundColor: '#F5F7FF' },
    ticketLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 8 },
    carrierLogo: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    ticketName: { fontSize: 15, fontWeight: '700', color: '#000' },
    ticketService: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    ticketRight: { alignItems: 'flex-end', minWidth: 80 },
    ticketPrice: { fontSize: 16, fontWeight: '700', color: '#1C39BB' },
    ticketTime: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    ticketBadge: { position: 'absolute', top: 0, right: 0, paddingHorizontal: 8, paddingVertical: 4, borderBottomLeftRadius: 10 },
    ticketBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },


    // Review
    sectionHeader: { fontSize: 12, fontWeight: '700', color: '#8E8E93', letterSpacing: 1, marginBottom: 12 },
    reviewThumb: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E5EA' },
    divider: { height: 1, backgroundColor: '#E5E5EA' },
    reviewRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    reviewMainText: { fontSize: 15, fontWeight: '600', color: '#000' },
    reviewSubText: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
    
    // Payment Options UI
    payMethodCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    payMethodActive: { borderColor: '#1C39BB', backgroundColor: '#F5F7FF' },
    payMethodIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    payMethodTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 2 },
    payMethodSub: { fontSize: 13, color: '#8E8E93' },

    summaryCard: { padding: 20, backgroundColor: '#fff' },
    sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    sumLabel: { fontSize: 15, color: '#8E8E93' },
    sumVal: { fontSize: 16, fontFamily: 'Satoshi-Bold', color: '#111827' },
    sumTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
    sumTotalLabel: { fontSize: 18, fontFamily: 'Satoshi-Bold', color: '#111827' },
    sumTotalVal: { fontSize: 26, fontWeight: '900', color: '#1C39BB' },

    // Fancy Refinements
    fancyCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 2, marginBottom: 24 },
    fancySectionTitle: { fontSize: 12, fontFamily: 'Satoshi-Bold', color: '#9CA3AF', letterSpacing: 1.2, marginBottom: 16, textTransform: 'uppercase' },
    fancyThumb: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB' },
    fancyDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
    fancyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    fancyIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F5F7FF', alignItems: 'center', justifyContent: 'center' },
    fancyMainText: { fontSize: 16, fontFamily: 'Satoshi-Bold', color: '#111827' },
    fancySubText: { fontSize: 14, fontFamily: 'Satoshi-Medium', color: '#6B7280', marginTop: 4 },

    currencyToggle: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 10, padding: 4 },
    currencyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    currencyBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
    currencyText: { fontSize: 13, fontFamily: 'Satoshi-Medium', color: '#6B7280' },
    currencyTextActive: { fontFamily: 'Satoshi-Bold', color: '#111827' },

    footer: { padding: 24, paddingBottom: 40, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F2F2F7' }
});

export default CheckoutFlow;
