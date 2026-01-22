
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Plus, MapPin, Trash2, Edit2, Check, ChevronDown } from 'lucide-react-native';
import { Input, Button } from './UI';
import { useCartStore, Address } from '../store';

// Supported countries for delivery
const COUNTRIES = [
    { code: 'NG', name: 'Nigeria' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AE', name: 'United Arab Emirates' },
];

const AddressesView = () => {
    const { addresses, addAddress, removeAddress, updateAddress, fetchAddresses } = useCartStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [countryPickerVisible, setCountryPickerVisible] = useState(false);

    React.useEffect(() => {
        fetchAddresses();
    }, []);

    // Form State
    const [label, setLabel] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('');

    const [loading, setLoading] = useState(false);

    const openAddModal = () => {
        setEditingId(null);
        setLabel('');
        setStreet('');
        setCity('');
        setZip('');
        setCountry('');
        setModalVisible(true);
    };

    const openEditModal = (addr: Address) => {
        setEditingId(addr.id);
        setLabel(addr.label);
        setStreet(addr.street);
        setCity(addr.city);
        setZip(addr.zip);
        setCountry(addr.country);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!label || !street || !city) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        setLoading(true);
        let success = false;

        if (editingId) {
            success = await updateAddress(editingId, { label, street, city, zip, country });
        } else {
            const newAddr: Address = {
                id: Math.random().toString(36).substr(2, 9),
                label,
                street,
                city,
                zip,
                country,
                default: addresses.length === 0 // Make default if it's the first one
            };
            success = await addAddress(newAddr);
        }

        setLoading(false);
        if (success) {
            setModalVisible(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Address', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => removeAddress(id) }
        ]);
    };

    const handleSetDefault = (id: string) => {
        // Logic to ensure only one default could be implemented here or in store
        // For now, simpler: we just flag it
        addresses.forEach(a => {
            if (a.id === id) updateAddress(a.id, { default: true });
            else if (a.default) updateAddress(a.id, { default: false });
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>

                {addresses.map((addr) => (
                    <TouchableOpacity
                        key={addr.id}
                        style={[styles.addressCard, addr.default && styles.activeCard]}
                        activeOpacity={0.9}
                        onPress={() => handleSetDefault(addr.id)}
                    >
                        <View style={styles.cardContent}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                                <View style={[styles.iconBox, addr.default ? styles.activeIconBox : null]}>
                                    <MapPin size={24} color={addr.default ? '#1C39BB' : '#8E8E93'} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <Text style={[styles.label, addr.default && { color: '#1C39BB' }]}>{addr.label}</Text>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <TouchableOpacity onPress={() => openEditModal(addr)} hitSlop={10}>
                                                <Edit2 size={16} color="#C7C7CC" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDelete(addr.id)} hitSlop={10}>
                                                <Trash2 size={16} color="#FF3B30" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <Text style={styles.addressText}>{addr.street}</Text>
                                    <Text style={styles.addressText}>{addr.city}, {addr.country} {addr.zip}</Text>
                                </View>
                            </View>

                            <View style={styles.selectionIndicator}>
                                {addr.default ? (
                                    <View style={styles.radioSelected}>
                                        <Check size={12} color="#fff" strokeWidth={4} />
                                    </View>
                                ) : (
                                    <View style={styles.radioUnselected} />
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                <Button
                    onPress={openAddModal}
                    style={styles.addBtn}
                    size="lg"
                    icon={<Plus size={24} color="#fff" />}
                >
                    Add New Address
                </Button>
            </ScrollView>

            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{editingId ? 'Edit Address' : 'New Address'}</Text>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16 }}>
                        <Input label="Label (e.g. Home)" value={label} onChangeText={setLabel} />
                        <Input label="Street Address" value={street} onChangeText={setStreet} />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <Input label="City" style={{ flex: 1 }} value={city} onChangeText={setCity} />
                            <Input label="ZIP Code" style={{ flex: 1 }} value={zip} onChangeText={setZip} keyboardType="numeric" />
                        </View>

                        {/* Country Picker */}
                        <View>
                            <Text style={styles.inputLabel}>Country</Text>
                            <TouchableOpacity
                                style={styles.countryPicker}
                                onPress={() => setCountryPickerVisible(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.countryPickerText, !country && { color: '#C7C7CC' }]}>
                                    {country ? COUNTRIES.find(c => c.code === country)?.name || country : 'Select Country'}
                                </Text>
                                <ChevronDown size={20} color="#8E8E93" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <View style={{ gap: 12, marginTop: 20 }}>
                        <Button size="lg" onPress={handleSave} isLoading={loading}>Save Address</Button>
                        <Button variant="secondary" onPress={() => setModalVisible(false)} disabled={loading}>Cancel</Button>
                    </View>
                    {/* Inline Country Picker Overlay to avoid Modal stacking issues */}
                    {countryPickerVisible && (
                        <View style={[styles.countryModalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, margin: -24 }]}>
                            <View style={styles.countryModalContent}>
                                <Text style={styles.countryModalHeader}>Select Country</Text>
                                {COUNTRIES.map((c) => (
                                    <TouchableOpacity
                                        key={c.code}
                                        style={[
                                            styles.countryItem,
                                            country === c.code && styles.countryItemSelected
                                        ]}
                                        onPress={() => {
                                            setCountry(c.code);
                                            setCountryPickerVisible(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.countryItemText,
                                            country === c.code && styles.countryItemTextSelected
                                        ]}>{c.name}</Text>
                                        {country === c.code && <Check size={18} color="#1C39BB" />}
                                    </TouchableOpacity>
                                ))}
                                <Button
                                    variant="secondary"
                                    onPress={() => setCountryPickerVisible(false)}
                                    style={{ marginTop: 16 }}
                                >
                                    Cancel
                                </Button>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 0.04,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeCard: {
        borderColor: '#1C39BB',
        backgroundColor: '#F5F7FF',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIconBox: {
        backgroundColor: '#E0E7FF',
    },
    label: {
        fontSize: 17,
        fontWeight: '700',
        color: '#000',
    },
    addressText: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
        lineHeight: 20,
    },
    selectionIndicator: {
        marginLeft: 12,
    },
    radioUnselected: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#C7C7CC',
    },
    radioSelected: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#1C39BB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtn: {
        marginTop: 24,
        shadowColor: '#1C39BB',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    modalContainer: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 32,
        marginTop: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 8,
    },
    countryPicker: {
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    countryPickerText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    countryModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    countryModalContent: {
        backgroundColor: '#fff',
        width: '85%',
        borderRadius: 20,
        padding: 24,
    },
    countryModalHeader: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    countryItem: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    countryItemSelected: {
        backgroundColor: '#E0E7FF',
    },
    countryItemText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    countryItemTextSelected: {
        color: '#1C39BB',
        fontWeight: '600',
    },
});

export default AddressesView;
