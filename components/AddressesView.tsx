
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
        addresses.forEach(a => {
            if (a.id === id) updateAddress(a.id, { default: true });
            else if (a.default) updateAddress(a.id, { default: false });
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {addresses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <MapPin size={32} color="#1C39BB" />
                        </View>
                        <Text style={styles.emptyText}>No addresses saved yet</Text>
                    </View>
                ) : (
                    addresses.map((addr) => (
                        <TouchableOpacity
                            key={addr.id}
                            style={[styles.addressCard, addr.default && styles.activeCard]}
                            activeOpacity={0.9}
                            onPress={() => handleSetDefault(addr.id)}
                        >
                            <View style={styles.cardHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                    <View style={[styles.iconBox, addr.default ? { backgroundColor: '#1C39BB' } : { backgroundColor: '#F2F2F7' }]}>
                                        <MapPin size={18} color={addr.default ? '#fff' : '#8E8E93'} />
                                    </View>
                                    <View>
                                        <Text style={styles.label}>{addr.label}</Text>
                                        {addr.default && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 4 }}>
                                    <TouchableOpacity onPress={() => openEditModal(addr)} hitSlop={10} style={styles.actionBtn}>
                                        <Edit2 size={16} color="#6B7280" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(addr.id)} hitSlop={10} style={styles.actionBtn}>
                                        <Trash2 size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.addressText}>{addr.street}</Text>
                                <Text style={styles.addressText}>{addr.city}, {addr.country} {addr.zip}</Text>
                            </View>

                            {addr.default && (
                                <View style={styles.checkIcon}>
                                    <Check size={14} color="#fff" strokeWidth={3} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                )}

                <Button
                    onPress={openAddModal}
                    style={styles.addBtn}
                    size="lg"
                    icon={<Plus size={20} color="#fff" />}
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

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 20 }}>
                        <Input label="Label (e.g. Home)" value={label} onChangeText={setLabel} placeholder="Home, Work, etc." />
                        <Input label="Street Address" value={street} onChangeText={setStreet} placeholder="123 Main St" />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <Input label="City" style={{ flex: 1 }} value={city} onChangeText={setCity} placeholder="New York" />
                            <Input label="ZIP Code" style={{ flex: 1 }} value={zip} onChangeText={setZip} keyboardType="numeric" placeholder="10001" />
                        </View>

                        <View>
                            <Text style={styles.inputLabel}>Country</Text>
                            <TouchableOpacity
                                style={styles.countryPicker}
                                onPress={() => setCountryPickerVisible(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.countryPickerText, !country && { color: '#9CA3AF' }]}>
                                    {country ? COUNTRIES.find(c => c.code === country)?.name || country : 'Select Country'}
                                </Text>
                                <ChevronDown size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <View style={{ gap: 12, marginTop: 20 }}>
                        <Button size="lg" onPress={handleSave} isLoading={loading}>Save Address</Button>
                        <Button variant="ghost" onPress={() => setModalVisible(false)} disabled={loading}>Cancel</Button>
                    </View>

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
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyText: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#6B7280' },

    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 16,
        padding: 20,
        borderWidth: 1.5,
        borderColor: 'transparent',
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 1,
    },
    activeCard: {
        borderColor: '#1C39BB',
        backgroundColor: '#F5F7FF',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: '#111827',
    },
    defaultBadge: {
        backgroundColor: '#1C39BB',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 4
    },
    defaultBadgeText: {
        fontSize: 9,
        fontFamily: 'Satoshi-Bold',
        color: '#fff'
    },
    actionBtn: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    cardBody: {
        paddingLeft: 50,
    },
    addressText: {
        fontSize: 15,
        color: '#4B5563',
        fontFamily: 'Satoshi-Medium',
        lineHeight: 22,
    },
    checkIcon: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#1C39BB',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff'
    },
    addBtn: {
        marginTop: 12,
        shadowColor: '#1C39BB',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
    },
    modalContainer: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: 'Satoshi-Bold',
        marginBottom: 32,
        marginTop: 16,
        letterSpacing: -0.5,
        color: '#111827'
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'Satoshi-Bold',
        color: '#374151',
        marginBottom: 8,
        marginLeft: 4,
    },
    countryPicker: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 18,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    countryPickerText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Medium',
        color: '#111827',
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
        borderRadius: 24,
        padding: 24,
    },
    countryModalHeader: {
        fontSize: 20,
        fontFamily: 'Satoshi-Bold',
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
        fontFamily: 'Satoshi-Medium',
        color: '#374151',
    },
    countryItemTextSelected: {
        color: '#1C39BB',
        fontFamily: 'Satoshi-Bold',
    },
});


export default AddressesView;
