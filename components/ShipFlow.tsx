
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, LayoutAnimation, Platform, UIManager } from 'react-native';
import { X, MapPin, Package, CheckCircle, ArrowRight, Box, Scale, DollarSign } from 'lucide-react-native';
import { Button, Input, Card } from './UI';
import { useCartStore } from '../store';
import { Shipment } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ShipFlowProps {
    visible: boolean;
    onClose: () => void;
    onComplete: () => void;
}

const STEPS = ['Route', 'Details', 'Quotes', 'Confirm'];

const ShipFlow: React.FC<ShipFlowProps> = ({ visible, onClose, onComplete }) => {
    const { addShipment } = useCartStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Route Data
    const [fromCountry, setFromCountry] = useState('');
    const [fromCity, setFromCity] = useState('');
    const [toCountry, setToCountry] = useState('');
    const [toCity, setToCity] = useState('');

    // Package Data
    const [description, setDescription] = useState('');
    const [weight, setWeight] = useState('');
    const [value, setValue] = useState('');
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');

    const reset = () => {
        setStep(1);
        setFromCountry('');
        setFromCity('');
        setToCountry('');
        setToCity('');
        setDescription('');
        setWeight('');
        setValue('');
        setLength('');
        setWidth('');
        setHeight('');
        setLoading(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleNext = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (step < 3) setStep(step + 1);
    };

    const handleSelectRate = (rate: any) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const newShipment: Shipment = {
                id: `s-${Date.now()}`,
                trackingNumber: `TBX-${Math.floor(Math.random() * 100000000)}`,
                carrier: rate.carrier,
                status: 'pre_transit',
                origin: `${fromCity}, ${fromCountry}`,
                destination: `${toCity}, ${toCountry}`,
                estimatedDelivery: rate.est,
                itemsString: description || 'Packet',
                events: [
                    {
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }),
                        status: 'pre_transit',
                        description: `Shipment created with ${rate.carrier}`,
                        location: `${fromCity}, ${fromCountry}`
                    }
                ]
            };

            addShipment(newShipment);
            setLoading(false);
            setStep(4); // Success step
        }, 1500);
    };

    const renderStepIndicator = () => (
        <View style={styles.stepContainer}>
            {STEPS.map((s, i) => {
                const isActive = i + 1 === step;
                const isCompleted = i + 1 < step;
                return (
                    <View key={s} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={[styles.stepDot, (isActive || isCompleted) && styles.stepDotActive]}>
                            {isCompleted ? <CheckCircle size={12} color="#fff" /> : <Text style={[styles.stepNum, isActive && styles.stepNumActive]}>{i + 1}</Text>}
                        </View>
                        <View style={[styles.stepLine, (isCompleted || isActive) && styles.stepLineActive, i === STEPS.length - 1 && { display: 'none' }]} />
                    </View>
                );
            })}
        </View>
    );

    const renderStep1 = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <View style={styles.headerBlock}>
                <Text style={styles.stepTitle}>Global Route</Text>
                <Text style={styles.stepSub}>Where are we shipping today?</Text>
            </View>

            <View style={styles.routeCard}>
                <View style={styles.routeTimeline}>
                    <View style={[styles.timelineDot, { backgroundColor: '#0223E6' }]} />
                    <View style={styles.timelineLine} />
                    <View style={[styles.timelineDot, { backgroundColor: '#166534' }]} />
                </View>

                <View style={styles.routeInputs}>
                    <View style={styles.locationBlock}>
                        <Text style={styles.inputLabel}>PICKUP (ORIGIN)</Text>
                        <View style={styles.inputRow}>
                            <Input
                                style={{ flex: 1 }}
                                placeholder="City"
                                value={fromCity}
                                onChangeText={setFromCity}
                            />
                            <Input
                                style={{ width: 80 }}
                                placeholder="Code"
                                value={fromCountry}
                                onChangeText={setFromCountry}
                                maxLength={3}
                                autoCapitalize="characters"
                            />
                        </View>
                    </View>

                    <View style={styles.locationBlock}>
                        <Text style={styles.inputLabel}>DROP OFF (DESTINATION)</Text>
                        <View style={styles.inputRow}>
                            <Input
                                style={{ flex: 1 }}
                                placeholder="City"
                                value={toCity}
                                onChangeText={setToCity}
                            />
                            <Input
                                style={{ width: 80 }}
                                placeholder="Code"
                                value={toCountry}
                                onChangeText={setToCountry}
                                maxLength={3}
                                autoCapitalize="characters"
                            />
                        </View>
                    </View>
                </View>
            </View>

            <Button size="lg" onPress={handleNext} style={styles.mainBtn} disabled={!fromCity || !fromCountry || !toCity || !toCountry}>
                Next: Package Details
            </Button>
        </ScrollView>
    );

    const renderStep2 = () => (
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
            <View style={styles.headerBlock}>
                <Text style={styles.stepTitle}>Package Details</Text>
                <Text style={styles.stepSub}>Describe the item and its dimensions.</Text>
            </View>

            <View style={styles.formSection}>
                <Input
                    label="Item Description"
                    placeholder="e.g. Vintage Camera, Documents"
                    value={description}
                    onChangeText={setDescription}
                />

                <View style={styles.gridRow}>
                    <View style={{ flex: 1 }}>
                        <Input
                            label="Weight (kg)"
                            placeholder="0.0"
                            keyboardType="numeric"
                            value={weight}
                            onChangeText={setWeight}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Input
                            label="Value ($)"
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={value}
                            onChangeText={setValue}
                        />
                    </View>
                </View>

                <Text style={styles.sectionLabel}>DIMENSIONS (CM)</Text>
                <View style={styles.gridRow3}>
                    <Input placeholder="L" keyboardType="numeric" style={{ textAlign: 'center' }} value={length} onChangeText={setLength} />
                    <Input placeholder="W" keyboardType="numeric" style={{ textAlign: 'center' }} value={width} onChangeText={setWidth} />
                    <Input placeholder="H" keyboardType="numeric" style={{ textAlign: 'center' }} value={height} onChangeText={setHeight} />
                </View>
            </View>

            <Button size="lg" onPress={handleNext} style={styles.mainBtn} disabled={!description}>
                Find Best Rates
            </Button>
        </ScrollView>
    );

    const renderStep3 = () => (
        <View style={styles.stepContent}>
            <View style={styles.headerBlock}>
                <Text style={styles.stepTitle}>Compare Quotes</Text>
                <Text style={styles.stepSub}>Live rates for {fromCity} → {toCity}</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0223E6" />
                    <Text style={styles.loadingText}>Fetching best prices...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.rateList}>
                    {[
                        { id: 1, carrier: 'DHL', name: 'Express Worldwide', price: '$54.00', time: '1-2 Days', est: 'Jan 11', color: '#D40511', logo: require('../assets/dhl.png'), tag: 'FASTEST' },
                        { id: 2, carrier: 'FedEx', name: 'Intl Priority', price: '$48.50', time: '2-3 Days', est: 'Jan 12', color: '#4D148C', logo: require('../assets/fedex.png'), tag: '' },
                        { id: 3, carrier: 'UPS', name: 'Saver', price: '$42.00', time: '3-4 Days', est: 'Jan 13', color: '#FFB500', logo: require('../assets/ups.png'), tag: '' },
                        { id: 4, carrier: 'Evri', name: 'Global Economy', price: '$18.00', time: '5-8 Days', est: 'Jan 18', color: '#007AFF', logo: require('../assets/evri.png'), tag: 'CHEAPEST' },
                    ].map((rate) => (
                        <TouchableOpacity key={rate.id} activeOpacity={0.9} onPress={() => handleSelectRate(rate)}>
                            <View style={styles.ticketCard}>
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
                                    <Text style={styles.ticketPrice}>{rate.price}</Text>
                                    <Text style={styles.ticketTime}>{rate.time}</Text>
                                </View>
                                {rate.tag ? (
                                    <View style={[styles.ticketBadge, rate.tag === 'FASTEST' ? { backgroundColor: '#000' } : { backgroundColor: '#34C759' }]}>
                                        <Text style={styles.ticketBadgeText}>{rate.tag}</Text>
                                    </View>
                                ) : null}
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );

    const renderSuccess = () => (
        <View style={styles.successContainer}>
            <View style={styles.confettiBox}>
                <CheckCircle size={80} color="#0223E6" />
            </View>
            <Text style={styles.successTitle}>Shipment Confirmed!</Text>
            <Text style={styles.successSub}>Your label has been generated.</Text>

            <View style={styles.finalCard}>
                <View style={styles.finalRouteRow}>
                    <Text style={styles.finalCity}>{fromCity}</Text>
                    <ArrowRight size={20} color="#C7C7CC" />
                    <Text style={styles.finalCity}>{toCity}</Text>
                </View>
                <View style={styles.finalDivider} />
                <Text style={styles.finalLabel}>TRACKING NUMBER</Text>
                <Text style={styles.finalTrack}>TBX-8921-X99</Text>
            </View>

            <Button size="lg" onPress={() => { handleClose(); onComplete(); }} style={styles.mainBtn}>
                Track Shipment
            </Button>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                        <X size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.navTitle}>New Shipment</Text>
                    <View style={{ width: 24 }} />
                </View>

                {step < 4 && renderStepIndicator()}

                <View style={styles.contentArea}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderSuccess()}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    closeBtn: { padding: 4 },
    navTitle: { fontSize: 16, fontWeight: '600', fontFamily: 'ZalandoBold' },
    stepContainer: { flexDirection: 'row', paddingHorizontal: 40, marginBottom: 24 },
    stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center' },
    stepDotActive: { backgroundColor: '#0223E6' },
    stepNum: { fontSize: 12, fontWeight: '600', color: '#8E8E93', fontFamily: 'ZalandoMedium' },
    stepNumActive: { color: '#fff' },
    stepLine: { flex: 1, height: 2, backgroundColor: '#E5E5EA', marginHorizontal: 8 },
    stepLineActive: { backgroundColor: '#0223E6' },

    contentArea: { flex: 1 },
    stepContent: { flex: 1, paddingHorizontal: 24 },
    headerBlock: { marginBottom: 32 },
    stepTitle: { fontSize: 28, fontWeight: '700', color: '#000', marginBottom: 8, letterSpacing: -0.5, fontFamily: 'ZalandoBold' },
    stepSub: { fontSize: 16, color: '#8E8E93', fontFamily: 'ZalandoRegular' },

    // Route
    routeCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, flexDirection: 'row', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
    routeTimeline: { alignItems: 'center', paddingTop: 24, marginRight: 16 },
    timelineDot: { width: 12, height: 12, borderRadius: 6 },
    timelineLine: { width: 2, height: 80, backgroundColor: '#E5E5EA', marginVertical: 4 },
    routeInputs: { flex: 1, gap: 24 },
    locationBlock: {},
    inputLabel: { fontSize: 11, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.5, marginBottom: 8, fontFamily: 'ZalandoBold' },
    inputRow: { flexDirection: 'row', gap: 12 },

    // Details
    formSection: { gap: 20 },
    gridRow: { flexDirection: 'row', gap: 12 },
    gridRow3: { flexDirection: 'row', gap: 12 },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.5, marginTop: 8, fontFamily: 'ZalandoBold' },

    mainBtn: { marginTop: 40 },

    // Quotes
    loadingContainer: { alignItems: 'center', marginTop: 80 },
    loadingText: { marginTop: 16, color: '#8E8E93', fontSize: 16, fontFamily: 'ZalandoRegular' },
    rateList: { paddingBottom: 40 },
    ticketCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, overflow: 'hidden' },
    ticketLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    carrierLogo: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    ticketName: { fontSize: 16, fontWeight: '700', color: '#000', fontFamily: 'ZalandoBold' },
    ticketService: { fontSize: 13, color: '#8E8E93', marginTop: 2, fontFamily: 'ZalandoRegular' },
    ticketRight: { alignItems: 'flex-end' },
    ticketPrice: { fontSize: 18, fontWeight: '700', color: '#0223E6', fontFamily: 'ZalandoBold' },
    ticketTime: { fontSize: 13, color: '#8E8E93', marginTop: 2, fontFamily: 'ZalandoRegular' },
    ticketBadge: { position: 'absolute', top: 0, right: 0, paddingHorizontal: 8, paddingVertical: 4, borderBottomLeftRadius: 10 },
    ticketBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', fontFamily: 'ZalandoBold' },

    // Success
    successContainer: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
    confettiBox: { marginBottom: 24 },
    successTitle: { fontSize: 30, fontWeight: '800', textAlign: 'center', marginBottom: 8, fontFamily: 'ZalandoBold' },
    successSub: { fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 40, fontFamily: 'ZalandoRegular' },
    finalCard: { backgroundColor: '#fff', width: '100%', padding: 32, borderRadius: 24, alignItems: 'center', shadowOpacity: 0.08 },
    finalRouteRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    finalCity: { fontSize: 18, fontWeight: '600', fontFamily: 'ZalandoBold' },
    finalDivider: { width: '100%', height: 1, backgroundColor: '#E5E5EA', marginVertical: 24 },
    finalLabel: { fontSize: 11, fontWeight: '700', color: '#8E8E93', letterSpacing: 1, fontFamily: 'ZalandoBold' },
    finalTrack: { fontSize: 22, fontWeight: '700', color: '#000', marginTop: 8, letterSpacing: 0.5, fontFamily: 'ZalandoBold' }
});

export default ShipFlow;
