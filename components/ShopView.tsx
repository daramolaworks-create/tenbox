import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { STORES } from '../data/stores';
import { Button, Input, Card } from './UI';

const { width } = Dimensions.get('window');

interface ShopViewProps {
    onOpenImporter: (url: string) => void;
    onOpenBrowser: (url: string, name: string, currency?: string) => void;
}

const DEALS = [
    { store: 'Amazon', title: 'Daily Deals', subtitle: 'Up to 70% off', url: 'https://www.amazon.com/deals', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', currency: 'USD' },
    { store: 'ASOS', title: 'Sale Season', subtitle: '20% off everything', url: 'https://www.asos.com/us/sale/', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400', currency: 'USD' },
    { store: 'Shein', title: 'Flash Sale', subtitle: 'From $2.99', url: 'https://www.shein.com/flash-sale.html', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400', currency: 'USD' },
    { store: 'Nike', title: 'End of Season', subtitle: '50% off footwear', url: 'https://www.nike.com/w/sale-3yaep', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', currency: 'USD' },
    { store: 'Apple', title: 'Refurbished', subtitle: 'Save up to 15%', url: 'https://www.apple.com/shop/refurbished', image: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400', currency: 'USD' },
];

const REGIONS = ['All', 'USA', 'UK', 'UAE'] as const;

const ShopView: React.FC<ShopViewProps> = ({ onOpenImporter, onOpenBrowser }) => {
    const [importUrl, setImportUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState<'All' | 'USA' | 'UK' | 'UAE'>('All');

    const filteredStores = STORES
        .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(s => regionFilter === 'All' || s.region === regionFilter || s.region === 'Global');

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Text style={styles.title}>Shop</Text>
            <Text style={styles.subtitle}>Import products from anywhere in the world</Text>

            {/* Import Section */}
            <View style={styles.importCard}>
                <Text style={styles.importLabel}>Paste product link</Text>
                <View style={styles.importRow}>
                    <Input
                        style={styles.importInput}
                        placeholder="https://amazon.com/product..."
                        value={importUrl}
                        onChangeText={setImportUrl}
                    />
                    <Button
                        size="icon"
                        onPress={() => {
                            if (importUrl) {
                                onOpenImporter(importUrl);
                                setImportUrl('');
                            } else {
                                Alert.alert("Input Needed", "Please paste a URL first.");
                            }
                        }}
                    >
                        <Plus color="#fff" size={24} />
                    </Button>
                </View>
            </View>

            {/* Hot Deals */}
            <Text style={styles.sectionTitle}>🔥 Hot Deals</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dealsContainer}
            >
                {DEALS.map((deal, i) => (
                    <TouchableOpacity
                        key={i}
                        activeOpacity={0.9}
                        onPress={() => onOpenBrowser(deal.url, deal.store, deal.currency)}
                    >
                        <ImageBackground
                            source={{ uri: deal.image }}
                            style={styles.dealCard}
                            imageStyle={styles.dealImage}
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.8)']}
                                style={styles.dealGradient}
                            >
                                <Text style={styles.dealStore}>{deal.store}</Text>
                                <Text style={styles.dealTitle}>{deal.title}</Text>
                                <Text style={styles.dealSubtitle}>{deal.subtitle}</Text>
                            </LinearGradient>
                        </ImageBackground>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Browse Stores */}
            <Text style={styles.sectionTitle}>Partner Stores</Text>

            {/* Search */}
            <View style={styles.searchRow}>
                <Input
                    placeholder="Search stores..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                />
            </View>

            {/* Region Filter */}
            <View style={styles.filterRow}>
                {REGIONS.map(region => (
                    <TouchableOpacity
                        key={region}
                        activeOpacity={0.7}
                        onPress={() => setRegionFilter(region)}
                        style={[
                            styles.filterChip,
                            regionFilter === region && styles.filterChipActive
                        ]}
                    >
                        <Text style={[
                            styles.filterText,
                            regionFilter === region && styles.filterTextActive
                        ]}>
                            {region === 'All' ? '🌍 All' : region === 'USA' ? '🇺🇸 USA' : region === 'UK' ? '🇬🇧 UK' : '🇦🇪 UAE'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Store Grid */}
            <View style={styles.storeGrid}>
                {filteredStores.map(s => (
                    <TouchableOpacity
                        key={s.name}
                        activeOpacity={0.7}
                        onPress={() => onOpenBrowser(s.url, s.name, s.currency)}
                        style={styles.storeCardWrapper}
                    >
                        <Card style={styles.storeCard}>
                            <View style={styles.storeLogoWrap}>
                                <Image
                                    source={typeof s.logo === 'string' ? { uri: s.logo } : s.logo}
                                    style={styles.storeLogo}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.storeName} numberOfLines={1}>{s.name}</Text>
                        </Card>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontFamily: 'Satoshi-Bold',
        color: '#000',
        marginTop: 8,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Satoshi-Regular',
        color: '#8E8E93',
        marginTop: 4,
        marginBottom: 20,
    },

    // Import Card
    importCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    importLabel: {
        fontSize: 13,
        fontFamily: 'Satoshi-Medium',
        color: '#8E8E93',
        marginBottom: 10,
    },
    importRow: {
        flexDirection: 'row',
        gap: 10,
    },
    importInput: {
        flex: 1,
    },

    // Section
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Satoshi-Medium',
        color: '#000',
        marginBottom: 14,
    },

    // Deals
    dealsContainer: {
        paddingBottom: 24,
        gap: 12,
    },
    dealCard: {
        width: 160,
        height: 130,
        borderRadius: 14,
        overflow: 'hidden',
    },
    dealImage: {
        borderRadius: 14,
    },
    dealGradient: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 12,
    },
    dealStore: {
        fontSize: 10,
        fontFamily: 'Satoshi-Medium',
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    dealTitle: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: '#fff',
        marginTop: 2,
    },
    dealSubtitle: {
        fontSize: 11,
        fontFamily: 'Satoshi-Regular',
        color: 'rgba(255,255,255,0.9)',
        marginTop: 1,
    },

    // Search
    searchRow: {
        marginBottom: 12,
    },
    searchInput: {
        backgroundColor: '#fff',
    },

    // Filter
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
    },
    filterChipActive: {
        backgroundColor: '#1C39BB',
    },
    filterText: {
        fontSize: 13,
        fontFamily: 'Satoshi-Medium',
        color: '#666',
    },
    filterTextActive: {
        color: '#fff',
        fontFamily: 'Satoshi-Medium',
    },

    // Store Grid
    storeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    storeCardWrapper: {
        width: (width - 50) / 2,
    },
    storeCard: {
        padding: 16,
        alignItems: 'center',
        borderRadius: 14,
    },
    storeLogoWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F5F5F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    storeLogo: {
        width: 30,
        height: 30,
    },
    storeName: {
        fontSize: 13,
        fontFamily: 'Satoshi-Medium',
        color: '#000',
        textAlign: 'center',
    },
});

export default ShopView;
