
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, LayoutAnimation, Platform, UIManager, Alert, StatusBar } from 'react-native';
import { X, MapPin, Package, CheckCircle, ArrowRight, Box, Scale, DollarSign } from 'lucide-react-native';
import { Button, Input, Card } from './UI';
import { useCartStore, Address } from '../store';
import { Shipment } from '../types';
import { supabase } from '../lib/supabase';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ShipFlowProps {
    visible: boolean;
    onClose: () => void;
    onComplete: () => void;
}

interface Rate {
    object_id: string; // Rate ID from Shippo
    amount: string;
    currency: string;
    provider: string; // DHL, UPS, etc.
    servicelevel: {
        name: string; // "Express Worldwide"
    };
    estimated_days: number;
    duration_terms: string; // "1-2 Days"
    provider_image_75: string; // Logo
}

const STEPS = ['Route', 'Package', 'Address', 'Quotes', 'Success'];

const COUNTRIES = [
    { code: 'US', name: 'United States', zipLabel: 'Zip Code' },
    { code: 'GB', name: 'United Kingdom', zipLabel: 'Postcode' },
    { code: 'CA', name: 'Canada', zipLabel: 'Postal Code' },
    { code: 'NG', name: 'Nigeria', zipLabel: null }, // No Zip
    { code: 'CN', name: 'China', zipLabel: 'Postal Code' },
    { code: 'DE', name: 'Germany', zipLabel: 'Postal Code' },
    { code: 'FR', name: 'France', zipLabel: 'Postal Code' },
    { code: 'JP', name: 'Japan', zipLabel: 'Postal Code' },
    { code: 'AE', name: 'UAE', zipLabel: null },
];

const CountrySelector = ({ value, onSelect }: { value: string, onSelect: (c: typeof COUNTRIES[0]) => void }) => {
    const [visible, setVisible] = useState(false);

    // Find selected country object
    const selected = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

    return (
        <>
            <TouchableOpacity onPress={() => setVisible(true)} style={styles.countryBtn}>
                <Text style={styles.countryBtnText}>{selected ? selected.code : 'Select'}</Text>
            </TouchableOpacity>

            <Modal visible={visible} animationType="fade" transparent onRequestClose={() => setVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalHeader}>Select Country</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {COUNTRIES.map((c) => (
                                <TouchableOpacity
                                    key={c.code}
                                    style={styles.countryItem}
                                    onPress={() => {
                                        onSelect(c);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={styles.countryCode}>{c.code}</Text>
                                    <Text style={styles.countryName}>{c.name}</Text>
                                    {value === c.code && <CheckCircle size={16} color="#0069FF" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <Button onPress={() => setVisible(false)} variant="secondary" style={{ marginTop: 16 }}>Cancel</Button>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const AddressSelector = ({ onSelect, onClose }: { onSelect: (addr: Address) => void, onClose: () => void }) => {
    const { addresses, fetchAddresses } = useCartStore();

    React.useEffect(() => {
        fetchAddresses();
    }, []);

    return (
        <Modal
            visible
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
            transparent={Platform.OS !== 'ios'}
            onRequestClose={onClose}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={{ flex: 1, padding: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Text style={styles.modalHeader}>Saved Addresses</Text>
                        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                            <Button variant="ghost" size="sm" onPress={onClose}><Text style={{ color: '#0069FF', fontSize: 17, fontWeight: '600' }}>Cancel</Text></Button>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ maxHeight: 400 }}>
                        {addresses.length === 0 ? (
                            <Text style={{ color: '#8E8E93', textAlign: 'center', marginVertical: 20 }}>No saved addresses found.</Text>
                        ) : (
                            addresses.map((addr) => (
                                <TouchableOpacity
                                    key={addr.id}
                                    style={styles.addressItem}
                                    onPress={() => {
                                        onSelect(addr);
                                        onClose();
                                    }}
                                >
                                    <View>
                                        <Text style={styles.addressLabel}>{addr.label}</Text>
                                        <Text style={styles.addressText}>{addr.street}, {addr.city}</Text>
                                    </View>
                                    <ArrowRight size={16} color="#C7C7CC" />
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                    <View style={{ marginTop: 'auto' }}>
                        <Button onPress={onClose} variant="secondary">Cancel Selection</Button>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const ShipFlow: React.FC<ShipFlowProps> = ({ visible, onClose, onComplete }) => {
    const { addShipment, addAddress } = useCartStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [rates, setRates] = useState<Rate[]>([]);
    const [selectedRate, setSelectedRate] = useState<Rate | null>(null);

    // Address Book State
    const [showAddressModal, setShowAddressModal] = useState<'sender' | 'recipient' | null>(null);
    const [saveSender, setSaveSender] = useState(false);
    const [saveRecipient, setSaveRecipient] = useState(false);

    // Sender Data
    const [fromName, setFromName] = useState('');
    const [fromStreet, setFromStreet] = useState('');
    const [fromCity, setFromCity] = useState('');
    const [fromZip, setFromZip] = useState('');
    const [fromCountry, setFromCountry] = useState('US');
    const [fromPhone, setFromPhone] = useState('');
    const [fromZipLabel, setFromZipLabel] = useState<string | null>('Zip Code');

    // Recipient Data
    const [toName, setToName] = useState('');
    const [toStreet, setToStreet] = useState('');
    const [toCity, setToCity] = useState('');
    const [toZip, setToZip] = useState('');
    const [toCountry, setToCountry] = useState('US');
    const [toPhone, setToPhone] = useState('');
    const [toZipLabel, setToZipLabel] = useState<string | null>('Zip Code');

    // Package Data
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [weight, setWeight] = useState('');
    const [value, setValue] = useState('');
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');

    const reset = () => {
        setStep(1);
        setFromName('');
        setFromStreet('');
        setFromCity('');
        setFromZip('');
        setFromCountry('US');
        setFromZipLabel('Zip Code');
        setFromPhone('');
        setSaveSender(false);

        setToName('');
        setToStreet('');
        setToCity('');
        setToZip('');
        setToCountry('US');
        setToZipLabel('Zip Code');
        setToPhone('');
        setSaveRecipient(false);

        setDescription('');
        setQuantity('1');
        setWeight('');
        setValue('');
        setLength('');
        setWidth('');
        setHeight('');
        setHeight('');
        setRates([]);
        setSelectedRate(null);
        setLoading(false);
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleNext = async () => {
        // LayoutAnimation removed to prevent crashes on transition


        if (step === 3) {
            // Check Auto-Save
            if (saveSender) {
                await addAddress({
                    id: Math.random().toString(36).substr(2, 9),
                    label: fromName || 'Sender',
                    street: fromStreet,
                    city: fromCity,
                    zip: fromZip,
                    country: fromCountry,
                    default: false
                });
            }
            if (saveRecipient) {
                await addAddress({
                    id: Math.random().toString(36).substr(2, 9),
                    label: toName || 'Recipient',
                    street: toStreet,
                    city: toCity,
                    zip: toZip,
                    country: toCountry,
                    default: false
                });
            }

            // Step 3 (Address) -> Fetch Rates
            await fetchRates();
        } else if (step === 4) {
            // Step 4 (Quotes) -> Purchase
            if (selectedRate) {
                await handlePurchaseLabel(selectedRate);
            }
        } else {
            // Step 1 -> 2, Step 2 -> 3
            if (step < 5) setStep(step + 1);
        }
    };

    const fetchRates = async () => {
        setLoading(true);
        // Move to Step 4 (Quotes) and show loading
        setStep(4);

        try {
            const { data, error } = await supabase.functions.invoke('get-rates', {
                body: {
                    address_from: {
                        name: fromName || 'Sender', // Placeholder for quote
                        street1: fromStreet, // Placeholder
                        city: fromCity,
                        zip: fromZip,
                        country: fromCountry,
                        phone: fromPhone || '5555555555',
                        email: 'sender@example.com'
                    },
                    address_to: {
                        name: toName || 'Recipient', // Placeholder
                        street1: toStreet, // Placeholder
                        city: toCity,
                        zip: toZip,
                        country: toCountry,
                        phone: toPhone || '5555555555',
                        email: 'recipient@example.com'
                    },
                    parcels: [{
                        length: parseFloat(length) || 10,
                        width: parseFloat(width) || 10,
                        height: parseFloat(height) || 10,
                        distance_unit: 'cm',
                        weight: (parseFloat(weight) || 0.5) * (parseInt(quantity) || 1), // Total weight
                        mass_unit: 'kg'
                    }],
                    items: [{
                        description: description || 'Merchandise',
                        quantity: quantity,
                        weight: weight,
                        value: value
                    }]
                }
            });

            if (error) throw error;

            // Filter and map rates (Shippo structure)
            if (data && data.rates && data.rates.length > 0) {
                setRates(data.rates.sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount)));
            } else {
                console.log('Shippo Response:', data);

                let errorMsg = 'No rates found for this configuration.';

                if (data && data.messages) {
                    // Shippo returns an array of messages if no rates are found
                    // Example: [{ "text": "Carrier account ... doesn't support ...", ... }]
                    const messages = Array.isArray(data.messages) ? data.messages : [data.messages];

                    // Filter out generic "carrier doesn't support" noise to find real errors (like "Invalid Zip")
                    const criticalErrors = messages.filter((m: any) =>
                        m.text &&
                        !m.text.includes('support one or more shipment options') &&
                        !m.text.includes('out of service area') &&
                        !m.text.includes('doesn\'t support shipments from')
                    );

                    if (criticalErrors.length > 0) {
                        errorMsg = criticalErrors[0].text; // Show specific error
                    } else {
                        // If all errors were just "carrier doesn't support", give a helpful hint
                        errorMsg = "No carriers are enabled for this route in Sandbox mode. Try a US-to-US route to test.";
                    }
                }

                setRates([]);
                Alert.alert('No Quotes Available', errorMsg);
                setStep(3); // Go back to fix inputs (Step 3: Address)
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error Fetching Rates', error.message || 'Please check your address and try again.');
            setStep(3); // Go back to Address step on error
        } finally {
            setLoading(false);
        }
    };

    const handlePurchaseLabel = async (rate: Rate) => {
        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data, error } = await supabase.functions.invoke('create-label', {
                body: {
                    rate_id: rate.object_id,
                    user_id: session.user.id,
                    shipment_details: {
                        items: description,
                        origin: `${fromStreet}, ${fromCity}, ${fromCountry}`, // Actual street
                        destination: `${toStreet}, ${toCity}, ${toCountry}` // Actual street
                    }
                }
            });

            if (error) throw error;
            if (data && data.error) throw new Error(data.error);

            // Sync Frontend Store (Optional, since we fetch on mount)
            // addShipment(...) could still be used if we want immediate UI update without refetch
            // But since store fetches from DB, we might just trigger a refetch
            await useCartStore.getState().fetchShipments();

            setStep(5); // Success

        } catch (error: any) {
            console.error('Purchase Error:', error);
            // Try to extract the actual error message from the Supabase function response if possible
            const message = error.context?.json?.error || error.message || 'Could not buy label. Please try again.';
            Alert.alert('Purchase Failed', message);
        } finally {
            setLoading(false);
        }
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
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.headerBlock}>
                <Text style={styles.stepTitle}>Global Shipping</Text>
                <Text style={styles.stepSub}>Where are we shipping today?</Text>
            </View>

            {/* FROM */}
            <View style={styles.inputCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[styles.sectionTitle, { color: '#000' }]}>FROM</Text>
                    <CountrySelector value={fromCountry} onSelect={(c) => { setFromCountry(c.code); setFromZipLabel(c.zipLabel); }} />
                </View>

                <View style={styles.inputRow}>
                    <Input style={{ flex: 1 }} placeholder="City" value={fromCity} onChangeText={setFromCity} />
                    {fromZipLabel && (
                        <Input style={{ flex: 0.8 }} placeholder={fromZipLabel} value={fromZip} onChangeText={setFromZip} keyboardType="numeric" />
                    )}
                </View>
            </View>

            {/* TO */}
            <View style={[styles.inputCard, { marginTop: 16 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[styles.sectionTitle, { color: '#000' }]}>TO</Text>
                    <CountrySelector value={toCountry} onSelect={(c) => { setToCountry(c.code); setToZipLabel(c.zipLabel); }} />
                </View>

                <View style={styles.inputRow}>
                    <Input style={{ flex: 1 }} placeholder="City" value={toCity} onChangeText={setToCity} />
                    {toZipLabel && (
                        <Input style={{ flex: 0.8 }} placeholder={toZipLabel} value={toZip} onChangeText={setToZip} keyboardType="numeric" />
                    )}
                </View>
            </View>

            <Button size="lg" onPress={handleNext} style={styles.mainBtn} disabled={!fromCity || !toCity}>
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

                <Input
                    label="Quantity"
                    placeholder="1"
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
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
                <View style={[styles.gridRow3, { marginTop: 4 }]}>
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
        <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.headerBlock}>
                <Text style={styles.stepTitle}>Final Details</Text>
                <Text style={styles.stepSub}>Complete address for your label.</Text>
            </View>

            {/* SENDER */}
            <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.sectionDot, { backgroundColor: '#0069FF' }]} />
                    <Text style={styles.sectionTitle}>SENDER ADDRESS</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAddressModal('sender')}>
                    <Text style={styles.actionLink}>Load Saved</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.inputCard}>
                <Input placeholder="Full Name" value={fromName} onChangeText={setFromName} />
                <Input placeholder="Phone Number" value={fromPhone} onChangeText={setFromPhone} keyboardType="phone-pad" />
                <Input placeholder="Street Address (e.g. 123 Main St)" value={fromStreet} onChangeText={setFromStreet} />
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setSaveSender(!saveSender)} activeOpacity={0.8}>
                    <View style={[styles.checkbox, saveSender && styles.checkboxActive]}>
                        {saveSender && <CheckCircle size={14} color="#fff" />}
                    </View>
                    <Text style={styles.checkboxLabel}>Save to Address Book</Text>
                </TouchableOpacity>
            </View>

            {/* RECIPIENT */}
            <View style={[styles.sectionHeader, { marginTop: 24, justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.sectionDot, { backgroundColor: '#34C759' }]} />
                    <Text style={styles.sectionTitle}>RECIPIENT ADDRESS</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAddressModal('recipient')}>
                    <Text style={styles.actionLink}>Load Saved</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.inputCard}>
                <Input placeholder="Full Name" value={toName} onChangeText={setToName} />
                <Input placeholder="Phone Number" value={toPhone} onChangeText={setToPhone} keyboardType="phone-pad" />
                <Input placeholder="Street Address" value={toStreet} onChangeText={setToStreet} />
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setSaveRecipient(!saveRecipient)} activeOpacity={0.8}>
                    <View style={[styles.checkbox, saveRecipient && styles.checkboxActive]}>
                        {saveRecipient && <CheckCircle size={14} color="#fff" />}
                    </View>
                    <Text style={styles.checkboxLabel}>Save to Address Book</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.inputCard, { marginTop: 24 }]}>
                <Text style={[styles.sectionTitle, { color: '#000', marginBottom: 12 }]}>CONTENT</Text>
                <Input
                    label="Description"
                    placeholder="e.g. Red Shoes"
                    value={description}
                    onChangeText={setDescription}
                />
            </View>

            <Button size="lg" onPress={handleNext} style={styles.mainBtn} disabled={!fromName || !fromStreet || !toName || !toStreet || !description}>
                Get Accurate Quotes
            </Button>

            {/* Address Modal */}
            {showAddressModal && (
                <AddressSelector
                    onClose={() => setShowAddressModal(null)}
                    onSelect={(addr) => {
                        if (showAddressModal === 'sender') {
                            setFromName(addr.label);
                            setFromStreet(addr.street);
                            setFromCity(addr.city);
                            setFromZip(addr.zip);
                            setFromCountry(addr.country);
                        } else {
                            setToName(addr.label);
                            setToStreet(addr.street);
                            setToCity(addr.city);
                            setToZip(addr.zip);
                            setToCountry(addr.country);
                        }
                    }}
                />
            )}
        </ScrollView>
    );

    const renderStep4 = () => (
        <View style={styles.stepContent}>
            <View style={styles.headerBlock}>
                <Text style={styles.stepTitle}>Select Rate</Text>
                <Text style={styles.stepSub}>Best prices for your shipment</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0069FF" />
                    <Text style={styles.loadingText}>Validating address & fetching rates...</Text>
                </View>
            ) : rates.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.rateList}>
                    {rates.map((rate, i) => (
                        <TouchableOpacity key={rate.object_id} activeOpacity={0.9} onPress={() => { setSelectedRate(rate); handlePurchaseLabel(rate); }}>
                            <View style={styles.ticketCard}>
                                <View style={styles.ticketLeft}>
                                    <View style={[styles.carrierLogo, { borderColor: '#F2F2F7', borderWidth: 1 }]}>
                                        <Image source={{ uri: rate.provider_image_75 }} style={{ width: 40, height: 40 }} resizeMode="contain" />
                                    </View>
                                    <View>
                                        <Text style={styles.ticketName}>{rate.provider}</Text>
                                        <Text style={styles.ticketService}>{rate.servicelevel.name}</Text>
                                    </View>
                                </View>
                                <View style={styles.ticketRight}>
                                    <Text style={styles.ticketPrice}>{rate.currency} {rate.amount}</Text>
                                    <Text style={styles.ticketTime}>{rate.duration_terms || '3-5 Days'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <Button onPress={() => setStep(3)} variant="secondary">Go Back</Button>
                </View>
            )}
        </View>
    );

    const renderSuccess = () => (
        <View style={styles.successContainer}>
            <View style={styles.confettiBox}>
                <CheckCircle size={80} color="#0069FF" />
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
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
            transparent={Platform.OS !== 'ios'}
            onRequestClose={handleClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                        <X size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.navTitle}>New Shipment</Text>
                    <View style={{ width: 24 }} />
                </View>

                {step < 5 && renderStepIndicator()}

                <View style={styles.contentArea}>
                    <View style={{ display: step === 1 ? 'flex' : 'none', flex: 1 }}>{renderStep1()}</View>
                    <View style={{ display: step === 2 ? 'flex' : 'none', flex: 1 }}>{renderStep2()}</View>
                    <View style={{ display: step === 3 ? 'flex' : 'none', flex: 1 }}>{renderStep3()}</View>
                    <View style={{ display: step === 4 ? 'flex' : 'none', flex: 1 }}>{renderStep4()}</View>
                    <View style={{ display: step === 5 ? 'flex' : 'none', flex: 1 }}>{renderSuccess()}</View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0
    },
    navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    closeBtn: { padding: 4 },
    navTitle: { fontSize: 16, fontWeight: '600' },
    stepContainer: { flexDirection: 'row', paddingHorizontal: 40, marginBottom: 24 },
    stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center' },
    stepDotActive: { backgroundColor: '#0069FF' },
    stepNum: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
    stepNumActive: { color: '#fff' },
    stepLine: { flex: 1, height: 2, backgroundColor: '#E5E5EA', marginHorizontal: 8 },
    stepLineActive: { backgroundColor: '#0069FF' },

    contentArea: { flex: 1 },
    stepContent: { flex: 1, paddingHorizontal: 24 },
    headerBlock: { marginBottom: 32 },
    stepTitle: { fontSize: 28, fontWeight: '700', color: '#000', marginBottom: 8, letterSpacing: -0.5 },
    stepSub: { fontSize: 16, color: '#8E8E93' },

    // Route
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 0 },
    sectionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    sectionTitle: { fontSize: 11, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.5 },
    inputCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
    connectorContainer: { alignItems: 'center', marginVertical: 4, height: 20, justifyContent: 'center' },
    connectorLine: { width: 2, height: '100%', backgroundColor: '#E5E5EA', position: 'absolute' },
    connectorIcon: { backgroundColor: '#F2F2F7', padding: 4, zIndex: 1 },

    inputRow: { flexDirection: 'row', gap: 10 },

    // Details
    formSection: { gap: 20 },
    gridRow: { flexDirection: 'row', gap: 12 },
    gridRow3: { flexDirection: 'row', gap: 12 },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.5, marginTop: 8 },

    mainBtn: { marginTop: 40 },

    // Quotes
    loadingContainer: { alignItems: 'center', marginTop: 80 },
    loadingText: { marginTop: 16, color: '#8E8E93', fontSize: 16 },
    rateList: { paddingBottom: 40 },
    ticketCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, overflow: 'hidden' },
    ticketLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    carrierLogo: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    ticketName: { fontSize: 16, fontWeight: '700', color: '#000' },
    ticketService: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
    ticketRight: { alignItems: 'flex-end' },
    ticketPrice: { fontSize: 18, fontWeight: '700', color: '#0069FF' },
    ticketTime: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
    ticketBadge: { position: 'absolute', top: 0, right: 0, paddingHorizontal: 8, paddingVertical: 4, borderBottomLeftRadius: 10 },
    ticketBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

    // Success
    successContainer: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
    confettiBox: { marginBottom: 24 },
    successTitle: { fontSize: 30, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
    successSub: { fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 40 },
    finalCard: { backgroundColor: '#fff', width: '100%', padding: 32, borderRadius: 24, alignItems: 'center', shadowOpacity: 0.08 },
    finalRouteRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    finalCity: { fontSize: 18, fontWeight: '600' },
    finalDivider: { width: '100%', height: 1, backgroundColor: '#E5E5EA', marginVertical: 24 },
    finalLabel: { fontSize: 11, fontWeight: '700', color: '#8E8E93', letterSpacing: 1 },
    finalTrack: { fontSize: 22, fontWeight: '700', color: '#000', marginTop: 8, letterSpacing: 0.5 },

    // Country Selector
    countryBtn: { backgroundColor: '#E0E7FF', borderRadius: 12, paddingHorizontal: 12, height: 44, justifyContent: 'center', minWidth: 68, alignItems: 'center' },
    countryBtnText: { fontWeight: '700', fontSize: 15, color: '#0069FF' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', width: '80%', borderRadius: 20, padding: 24, maxHeight: '60%' },
    modalHeader: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
    countryItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    countryCode: { fontSize: 16, fontWeight: '700', width: 40 },
    countryName: { fontSize: 16, color: '#333', flex: 1 },

    // Address Modal
    addressItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    addressLabel: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 2 },
    addressText: { fontSize: 14, color: '#8E8E93' },
    actionLink: { fontSize: 13, fontWeight: '600', color: '#0069FF' },

    // Checkbox
    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, opacity: 0.8 },
    checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#C7C7CC', alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: '#fff' },
    checkboxActive: { backgroundColor: '#0069FF', borderColor: '#0069FF' },
    checkboxLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
});

export default ShipFlow;
