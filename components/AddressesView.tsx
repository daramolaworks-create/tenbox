
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Plus, MapPin, Trash2, Edit2, Check } from 'lucide-react-native';
import { Input, Button } from './UI';
import { useCartStore, Address } from '../store';

const AddressesView = () => {
    const { addresses, addAddress, removeAddress, updateAddress, fetchAddresses } = useCartStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    React.useEffect(() => {
        fetchAddresses();
    }, []);

    // Form State
    const [label, setLabel] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('');

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

    const handleSave = () => {
        if (!label || !street || !city) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        if (editingId) {
            updateAddress(editingId, { label, street, city, zip, country });
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
            addAddress(newAddr);
        }
        setModalVisible(false);
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
                                    <MapPin size={24} color={addr.default ? '#0223E6' : '#8E8E93'} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <Text style={[styles.label, addr.default && { color: '#0223E6' }]}>{addr.label}</Text>
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

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{editingId ? 'Edit Address' : 'New Address'}</Text>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 16 }}>
                        <Input label="Label (e.g. Home)" value={label} onChangeText={setLabel} />
                        <Input label="Street Address" value={street} onChangeText={setStreet} />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <Input label="City" style={{ flex: 1 }} value={city} onChangeText={setCity} />
                            <Input label="ZIP Code" style={{ flex: 1 }} value={zip} onChangeText={setZip} keyboardType="numeric" />
                        </View>
                        <Input label="Country" value={country} onChangeText={setCountry} />
                    </ScrollView>

                    <View style={{ gap: 12, marginTop: 20 }}>
                        <Button size="lg" onPress={handleSave}>Save Address</Button>
                        <Button variant="secondary" onPress={() => setModalVisible(false)}>Cancel</Button>
                    </View>
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
        borderColor: '#0223E6',
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
        backgroundColor: '#0223E6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtn: {
        marginTop: 24,
        shadowColor: '#0223E6',
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
});

export default AddressesView;
