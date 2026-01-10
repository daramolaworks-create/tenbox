import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, LayoutAnimation, ActivityIndicator, Image, Platform } from 'react-native';
import { Button, Input, Card } from './UI';
import { useCartStore } from '../store';
import { X, Check, MapPin, Truck, ChevronRight, CreditCard, Plus, ArrowLeft } from 'lucide-react-native';

interface CheckoutFlowProps {
    visible: boolean;
    onClose: () => void;
    onComplete: () => void;
}

const DELIVERY_OPTIONS = [
    { id: '1', carrier: 'DHL', name: 'Express Worldwide', price: 54.00, eta: '1-2 Days', logo: require('../assets/dhl.png'), tag: 'FASTEST' },
    { id: '2', carrier: 'FedEx', name: 'Intl Priority', price: 48.50, eta: '2-3 Days', logo: require('../assets/fedex.png'), tag: '' },
    { id: '3', carrier: 'UPS', name: 'Saver', price: 42.00, eta: '3-4 Days', logo: require('../assets/ups.png'), tag: '' },
    { id: '4', carrier: 'Evri', name: 'Global Economy', price: 18.00, eta: '5-8 Days', logo: require('../assets/evri.png'), tag: 'CHEAPEST' },
];

const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ visible, onClose, onComplete }) => {
    const [step, setStep] = useState<'address' | 'delivery' | 'review'>('address');
    const { addresses, user, items, clearCart } = useCartStore();

    // Selection State
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('3'); // Default to UPS
    const [isProcessing, setIsProcessing] = useState(false);

    // Initial load: select default address
    useEffect(() => {
        if (visible) {
            const defaultAddr = addresses.find(a => a.default);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else if (addresses.length > 0) setSelectedAddressId(addresses[0].id);
            setStep('address');
        }
    }, [visible, addresses]);

    const handleNext = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (step === 'address') {
            if (!selectedAddressId) {
                Alert.alert("Address Required", "Please select a shipping address.");
                return;
            }
            setStep('delivery');
        } else if (step === 'delivery') {
            setStep('review');
        }
    };

    const handleBack = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (step === 'delivery') setStep('address');
        if (step === 'review') setStep('delivery');
    };

    const handlePay = () => {
        setIsProcessing(true);
        // Mock API call
        setTimeout(() => {
            setIsProcessing(false);
            Alert.alert(
                "Order Placed!",
                "Your order has been successfully processed.",
                [{
                    text: "OK", onPress: () => {
                        clearCart();
                        onComplete();
                    }
                }]
            );
        }, 2000);
    };

    // Derived Financials
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const selectedDelivery = DELIVERY_OPTIONS.find(d => d.id === selectedDeliveryId);
    const deliveryPrice = selectedDelivery?.price || 0;
    const tax = subtotal * 0.08; // 8% mock tax
    const total = subtotal + deliveryPrice + tax;

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
            transparent={Platform.OS !== 'ios'}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={step === 'address' ? onClose : handleBack} style={styles.headerBtn}>
                        {step === 'address' ? <X size={24} color="#000" /> : <ArrowLeft size={24} color="#000" />}
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkout</Text>
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
                            {DELIVERY_OPTIONS.map((rate) => (
                                <TouchableOpacity key={rate.id} activeOpacity={0.9} onPress={() => setSelectedDeliveryId(rate.id)}>
                                    <View style={[styles.ticketCard, selectedDeliveryId === rate.id && styles.selectedTicket]}>
                                        <View style={styles.ticketLeft}>
                                            <View style={[styles.carrierLogo, { borderColor: '#F2F2F7', borderWidth: 1 }]}>
                                                <Image source={typeof rate.logo === 'string' ? { uri: rate.logo } : rate.logo} style={{ width: 40, height: 40 }} resizeMode="contain" />
                                            </View>
                                            <View>
                                                <Text style={styles.ticketName}>{rate.carrier}</Text>
                                                <Text style={styles.ticketService}>{rate.name}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.ticketRight}>
                                            <Text style={styles.ticketPrice}>${rate.price.toFixed(2)}</Text>
                                            <Text style={styles.ticketTime}>{rate.eta}</Text>
                                        </View>
                                        {rate.tag ? (
                                            <View style={[styles.ticketBadge, rate.tag === 'FASTEST' ? { backgroundColor: '#000' } : { backgroundColor: '#34C759' }]}>
                                                <Text style={styles.ticketBadgeText}>{rate.tag}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </TouchableOpacity>
                            ))}
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
                                        <Text style={styles.reviewMainText}>{selectedDelivery?.carrier}</Text>
                                        <Text style={styles.reviewSubText}>{selectedDelivery?.name} • {selectedDelivery?.eta}</Text>
                                    </View>
                                    <Button size="sm" variant="ghost" onPress={() => setStep('delivery')}>Change</Button>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Payment */}
                            <View>
                                <Text style={styles.sectionHeader}>PAYMENT METHOD</Text>
                                <View style={styles.paymentCard}>
                                    <CreditCard size={24} color="#000" />
                                    <Text style={styles.paymentText}>•••• 4242</Text>
                                    <Check size={20} color="#34C759" style={{ marginLeft: 'auto' }} />
                                </View>
                            </View>

                            {/* Summary */}
                            <Card style={styles.summaryCard}>
                                <View style={styles.sumRow}><Text style={styles.sumLabel}>Subtotal</Text><Text style={styles.sumVal}>${subtotal.toFixed(2)}</Text></View>
                                <View style={styles.sumRow}><Text style={styles.sumLabel}>Delivery</Text><Text style={styles.sumVal}>${deliveryPrice.toFixed(2)}</Text></View>
                                <View style={styles.sumRow}><Text style={styles.sumLabel}>Tax (8%)</Text><Text style={styles.sumVal}>${tax.toFixed(2)}</Text></View>
                                <View style={styles.sumTotalRow}><Text style={styles.sumTotalLabel}>Total</Text><Text style={styles.sumTotalVal}>${total.toFixed(2)}</Text></View>
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
                            {isProcessing ? <ActivityIndicator color="#fff" /> : `Pay $${total.toFixed(2)}`}
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
    ticketCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
    selectedTicket: { borderColor: '#0223E6', backgroundColor: '#F5F7FF' },
    ticketLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    carrierLogo: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    ticketName: { fontSize: 16, fontWeight: '700', color: '#000' },
    ticketService: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
    ticketRight: { alignItems: 'flex-end' },
    ticketPrice: { fontSize: 18, fontWeight: '700', color: '#0223E6' },
    ticketTime: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
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
