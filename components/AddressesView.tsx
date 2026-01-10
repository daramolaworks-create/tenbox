
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Plus, MapPin, Trash2, Edit2, Check } from 'lucide-react-native';
import { Input, Button } from './UI';
import { useCartStore, Address } from '../store';

const AddressesView = () => {
    const { addresses, addAddress, removeAddress, updateAddress } = useCartStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

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
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {addresses.map((addr) => (
                    <View key={addr.id} style={styles.addressCard}>
                        <View style={styles.cardHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <MapPin size={16} color="#0223E6" />
                                <Text style={styles.label}>{addr.label}</Text>
                                {addr.default && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
                            </View>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity onPress={() => openEditModal(addr)}>
                                    <Edit2 size={18} color="#8E8E93" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(addr.id)}>
                                    <Trash2 size={18} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.addressText}>{addr.street}</Text>
                        <Text style={styles.addressText}>{addr.city}, {addr.country} {addr.zip}</Text>

                        {!addr.default && (
                            <TouchableOpacity style={styles.setDefaultBtn} onPress={() => handleSetDefault(addr.id)}>
                                <Text style={styles.setDefaultText}>Set as Default</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                <Button onPress={openAddModal} variant="outline" style={{ marginTop: 12 }}>
                    <Plus size={20} color="#0223E6" style={{ marginRight: 8 }} />
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
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    defaultBadge: {
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    defaultText: {
        color: '#0223E6',
        fontSize: 10,
        fontWeight: '700',
    },
    addressText: {
        fontSize: 15,
        color: '#3A3A3C',
        lineHeight: 20,
    },
    setDefaultBtn: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    setDefaultText: {
        fontSize: 13,
        color: '#0223E6',
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 32,
        marginTop: 16,
    },
});

export default AddressesView;
