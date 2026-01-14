import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { Plus } from 'lucide-react-native';
import { STORES } from '../data/stores';
import { Button, Input, Card } from './UI';
import { CartItem } from '../types';

const { width } = Dimensions.get('window');

interface ShopViewProps {
    products: any[];
    addItem: (item: CartItem) => void;
    onOpenImporter: (url: string) => void;
    onOpenBrowser: (url: string, name: string) => void;
}

const ShopView: React.FC<ShopViewProps> = ({
    products,
    addItem,
    onOpenImporter,
    onOpenBrowser
}) => {
    const [importUrl, setImportUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.screenTitle}>Universal Importer</Text>
            <Text style={styles.subText}>Paste any global product link below.</Text>

            <View style={styles.importRow}>
                <Input
                    style={styles.flex1}
                    placeholder="https://amazon.com/product..."
                    value={importUrl}
                    onChangeText={setImportUrl}
                />
                <Button size="icon" onPress={() => {
                    if (importUrl) {
                        onOpenImporter(importUrl);
                        setImportUrl(''); // Clear after opening? Optional.
                    } else {
                        Alert.alert("Input Needed", "Please paste a URL first.");
                    }
                }}>
                    <Plus color="#fff" size={28} />
                </Button>
            </View>

            {/* Featured Products from Supabase */}
            {
                products.length > 0 && (
                    <View style={{ marginBottom: 32 }}>
                        <Text style={styles.sectionLabel}>FEATURED FINDINGS</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24 }}>
                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                {products.map((product) => (
                                    <View
                                        key={product.id}
                                        style={{ width: 140 }}
                                    >
                                        <View style={{ position: 'relative' }}>
                                            <Image
                                                source={{ uri: product.image || 'https://via.placeholder.com/150' }}
                                                style={{ width: 140, height: 140, borderRadius: 16, backgroundColor: '#fff' }}
                                            />
                                            <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={() => {
                                                    addItem({
                                                        id: String(product.id),
                                                        title: product.title,
                                                        price: product.price,
                                                        image: product.image || 'https://via.placeholder.com/150',
                                                        quantity: 1,
                                                        store: product.store || 'Tenbox Find',
                                                        notes: '',
                                                        url: product.url || ''
                                                    });
                                                    Alert.alert('Added to Cart', `${product.title} has been added to your cart.`);
                                                }}
                                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 8,
                                                    right: 8,
                                                    zIndex: 99,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 16,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    shadowColor: '#000',
                                                    shadowOpacity: 0.15,
                                                    shadowRadius: 4,
                                                    shadowOffset: { width: 0, height: 2 },
                                                    elevation: 5
                                                }}
                                            >
                                                <Plus size={20} color="#0223E6" strokeWidth={2.5} />
                                            </TouchableOpacity>
                                        </View>
                                        <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '600', marginTop: 8, color: '#000' }}>{product.title}</Text>
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#0223E6', marginTop: 4 }}>${product.price}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )
            }

            <Text style={styles.sectionLabel}>PARTNER STORES</Text>

            <View style={styles.searchContainer}>
                <Input
                    placeholder="Search stores (e.g. Amazon, ASOS)..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{ marginBottom: 16 }}
                />
            </View>

            <View style={styles.storeGrid}>
                {STORES.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                    <TouchableOpacity key={s.name} activeOpacity={0.7} onPress={() => onOpenBrowser(s.url, s.name)}>
                        <Card style={styles.storeCard}>
                            <View style={styles.storeIconPlaceholder}>
                                <Image source={typeof s.logo === 'string' ? { uri: s.logo } : s.logo} style={{ width: 40, height: 40 }} resizeMode="contain" />
                            </View>
                            <Text style={styles.storeName} numberOfLines={1}>{s.name}</Text>
                        </Card>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screenTitle: { color: '#000', fontSize: 32, fontWeight: '700', letterSpacing: -0.4 },
    subText: { color: '#8E8E93', fontSize: 17, marginTop: 4, fontWeight: '500' },
    importRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
    flex1: { flex: 1 },
    sectionLabel: { color: '#8E8E93', fontSize: 13, fontWeight: '500', letterSpacing: 0.4, marginTop: 32, marginBottom: 16 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    storeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    storeCard: { width: (width - 60) / 2, padding: 20, alignItems: 'center', shadowOpacity: 0.03 },
    storeIconPlaceholder: { width: 50, height: 50, backgroundColor: '#F2F2F7', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    storeName: { color: '#000', fontSize: 15, fontWeight: '600' },
});

export default ShopView;
