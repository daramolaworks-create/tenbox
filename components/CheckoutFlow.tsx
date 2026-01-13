import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, LayoutAnimation, ActivityIndicator, Image, Platform } from 'react-native';
import { Button, Input, Card } from './UI';
import { useCartStore, STORE_ADDRESSES, getStoreRegion } from '../store';
import { supabase } from '../lib/supabase';
import { X, Check, MapPin, Truck, ChevronRight, CreditCard, Plus, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useStripe } from '@stripe/stripe-react-native';

interface CheckoutFlowProps {
    visible: boolean;
    onClose: () => void;
    onComplete: () => void;
}

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ visible, onClose, onComplete }) => {
    const [step, setStep] = useState<'address' | 'delivery' | 'review'>('address');
    const { addresses, user, items, clearCart, createOrder } = useCartStore();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [rates, setRates] = useState<any[]>([]);
    const [loadingRates, setLoadingRates] = useState(false);
    const [selectedRate, setSelectedRate] = useState<any>(null); // Full rate object
    const [isProcessing, setIsProcessing] = useState(false);

    // Derived Financials (Moved to Top for Scope)
    const storeRegion = items[0]?.store ? getStoreRegion(items[0].store) : 'USA';
    const storeConfig = STORE_ADDRESSES[storeRegion] || STORE_ADDRESSES['USA'];
    const CURRENCY_SYMBOL = storeConfig.symbol;
    const CURRENCY_CODE = storeConfig.currency;

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryPrice = selectedRate ? parseFloat(selectedRate.amount) : 0;
    const tax = subtotal * 0.08; // 8% mock tax
    const total = subtotal + deliveryPrice + tax;

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
        const storeRegion = items[0].store; // e.g., 'USA', 'UK'
        const origin = STORE_ADDRESSES[storeRegion] || STORE_ADDRESSES['USA'];

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
    };

    const fetchPaymentSheetParams = async () => {
        const payload = {
            amount: total,
            currency: CURRENCY_CODE.toLowerCase(),
            email: 'user@example.com',
            name: 'Tenbox User'
        };

        // Using direct fetch for React Native compatibility
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

        try {
            const response = await fetch(`${supabaseUrl}/functions/v1/payment-sheet`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${anonKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                Alert.alert('Payment Error', `Status: ${response.status}\n${errorText}`);
                return null;
            }

            const data = await response.json();
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
                defaultBillingDetails: {
                    name: 'Tenbox User',
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

                await createOrder(total, itemsSummary);
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
                    <Text style={styles.headerTitle}>Checkout ({storeRegion})</Text>
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

                            <Button variant="outline" style={{ marginTop: 8 }}>
                                <Plus size={18} color="#000" style={{ marginRight: 8 }} />
                                Add New Address
                            </Button>
                        </View>
                    )}

                    {/* STEP 2: DELIVERY */}
                    {step === 'delivery' && (
                        <View style={{ gap: 16 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.sectionHeader}>
                                    SHIPPING FROM {storeRegion.toUpperCase()}
                                </Text>
                                {loadingRates && <ActivityIndicator size="small" color="#0223E6" />}
                            </View>
                            {/* Rates Selection */}
                            <View style={{ gap: 12 }}>
                                {loadingRates ? (
                                    <View style={{ padding: 40, alignItems: 'center' }}>
                                        <ActivityIndicator size="large" color="#0223E6" />
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
                            {/* Items Preview */}
                            <View>
                                <Text style={styles.sectionHeader}>ITEMS ({items.length})</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24 }}>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        {items.map(item => (
                                            <Image key={item.id} source={{ uri: item.image }} style={styles.reviewThumb} />
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={styles.divider} />

                            {/* Shipping Details */}
                            <View>
                                <Text style={styles.sectionHeader}>SHIPPING DETAILS</Text>
                                <View style={styles.reviewRow}>
                                    <MapPin size={20} color="#8E8E93" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.reviewMainText}>{selectedAddress?.street}, {selectedAddress?.city}</Text>
                                        <Text style={styles.reviewSubText}>{selectedAddress?.zip}, {selectedAddress?.country}</Text>
                                    </View>
                                    <Button size="sm" variant="ghost" onPress={() => setStep('address')}>Change</Button>
                                </View>
                                <View style={[styles.reviewRow, { marginTop: 12 }]}>
                                    <Truck size={20} color="#8E8E93" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.reviewMainText}>{selectedRate?.provider} ({selectedRate?.servicelevel.name})</Text>
                                        <Text style={styles.reviewSubText}>
                                            {selectedRate?.estimated_days || '2-5'} Days • {selectedRate?.currency} {selectedRate?.amount}
                                        </Text>
                                    </View>
                                    <Button size="sm" variant="ghost" onPress={() => setStep('delivery')}>Change</Button>
                                </View>
                            </View>



                            {/* Summary */}
                            <Card style={styles.summaryCard}>
                                <View style={styles.sumRow}><Text style={styles.sumLabel}>Subtotal</Text><Text style={styles.sumVal}>{CURRENCY_SYMBOL}{subtotal.toFixed(2)}</Text></View>
                                <View style={styles.sumRow}><Text style={styles.sumLabel}>Delivery</Text><Text style={styles.sumVal}>{CURRENCY_SYMBOL}{deliveryPrice.toFixed(2)}</Text></View>
                                <View style={styles.sumRow}><Text style={styles.sumLabel}>Tax (8%)</Text><Text style={styles.sumVal}>{CURRENCY_SYMBOL}{tax.toFixed(2)}</Text></View>
                                <View style={styles.sumTotalRow}><Text style={styles.sumTotalLabel}>Total</Text><Text style={styles.sumTotalVal}>{CURRENCY_SYMBOL}{total.toFixed(2)}</Text></View>
                            </Card>
                        </View>
                    )}

                </ScrollView>

                {/* Footer Actions */}
                <View style={styles.footer}>
                    {step !== 'review' ? (
                        <Button size="lg" onPress={handleNext} style={{ width: '100%' }}>
                            Continue
                        </Button>
                    ) : (
                        <Button size="lg" onPress={handlePay} style={{ width: '100%' }} disabled={isProcessing}>
                            {isProcessing ? <ActivityIndicator color="#fff" /> : `Pay ${CURRENCY_SYMBOL}${total.toFixed(2)}`}
                        </Button>
                    )}
                </View>
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
    activeStep: { backgroundColor: '#0223E6' },
    stepTitle: { fontSize: 28, fontWeight: '800', marginHorizontal: 24, marginTop: 16, marginBottom: 8, letterSpacing: -0.5 },

    // Cards & Options
    optionCard: { padding: 20, borderWidth: 2, borderColor: 'transparent' },
    selectedOption: { borderColor: '#0223E6', backgroundColor: '#F5F7FF' },
    radioCircle: { width: 22, height: 22, borderRadius: 12, borderWidth: 2, borderColor: '#C7C7CC', alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: '#0223E6' },
    radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#0223E6' },
    addrLabel: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    addrText: { fontSize: 14, color: '#3A3A3C', lineHeight: 20 },
    defaultTag: { fontSize: 11, fontWeight: '700', color: '#0223E6', backgroundColor: '#E0E7FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },

    // Carrier Tickets (New)
    ticketCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', minHeight: 80 },
    selectedTicket: { borderColor: '#0223E6', backgroundColor: '#F5F7FF' },
    ticketLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 8 },
    carrierLogo: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    ticketName: { fontSize: 15, fontWeight: '700', color: '#000' },
    ticketService: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    ticketRight: { alignItems: 'flex-end', minWidth: 80 },
    ticketPrice: { fontSize: 16, fontWeight: '700', color: '#0223E6' },
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
    paymentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E5EA' },
    paymentText: { fontSize: 15, fontWeight: '600', color: '#000' },

    summaryCard: { padding: 20, backgroundColor: '#fff' },
    sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    sumLabel: { fontSize: 15, color: '#8E8E93' },
    sumVal: { fontSize: 15, fontWeight: '500', color: '#000' },
    sumTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
    sumTotalLabel: { fontSize: 17, fontWeight: '700', color: '#000' },
    sumTotalVal: { fontSize: 24, fontWeight: '800', color: '#0223E6' },

    footer: { padding: 24, paddingBottom: 40, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F2F2F7' }
});

export default CheckoutFlow;
