import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import {
    ShoppingBag,
    Search,
    Package,
    ChevronRight,
    Clock,
    Truck,
    CheckCircle,
    AlertCircle
} from 'lucide-react-native';
import { TabType, Shipment } from '../types';
import { UserProfile } from '../store';
import OfferSlider from './OfferSlider';

interface HomeViewProps {
    user: UserProfile | null;
    shipments: Shipment[];
    orderHistory: any[];
    onNavigate: (tab: TabType) => void;
    onViewSettings: (view: 'list' | 'account' | 'addresses' | 'orders') => void;
    onShipParcel: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({
    user,
    shipments,
    orderHistory,
    onNavigate,
    onViewSettings,
    onShipParcel
}) => {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return '#34C759';
            case 'out_for_delivery': return '#0069FF';
            case 'exception': return '#FF3B30';
            default: return '#FF9500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered': return CheckCircle;
            case 'exception': return AlertCircle;
            default: return Truck;
        }
    };

    const allActivity = useMemo(() => {
        return [
            ...shipments.map(s => ({ type: 'shipment', data: s, date: new Date() })), // Shipments don't have created_at in interface yet, assuming recent
            ...orderHistory.map(o => ({ type: 'order', data: o, date: new Date(o.date) }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [shipments, orderHistory]);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <View style={{ marginTop: 10, marginBottom: 24 }}>
                <Text style={styles.heroText}>Good Morning,</Text>
                <Text style={[styles.heroText, { color: '#0069FF' }]}>{user?.name}.</Text>
            </View>

            <OfferSlider />

            <TouchableOpacity activeOpacity={0.9} onPress={() => onNavigate('shop')}>
                <View style={styles.featuredCard}>
                    <View style={styles.featuredContent}>
                        <Text style={styles.featuredLabel}>GLOBAL SHOPPING</Text>
                        <Text style={styles.featuredTitle}>Shop the World</Text>
                        <Text style={styles.featuredDesc}>Import from Amazon, Apple, and more.</Text>
                        <View style={styles.featuredLogos}>
                            <Image source={require('../assets/logos/amazon.png')} style={{ width: 50, height: 20 }} resizeMode="contain" />
                            <Image source={require('../assets/logos/apple.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                        </View>
                    </View>
                    <View style={styles.featuredIcon}>
                        <ShoppingBag color="#fff" size={32} />
                    </View>
                </View>
            </TouchableOpacity>

            <View style={styles.quickGrid}>
                <TouchableOpacity style={styles.quickCard} activeOpacity={0.8} onPress={onShipParcel}>
                    <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                        <Package color="#0069FF" size={24} />
                    </View>
                    <Text style={styles.quickTitle}>Ship Parcel</Text>
                    <Text style={styles.quickDesc}>Send anywhere</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.quickCard} activeOpacity={0.8} onPress={() => onNavigate('track')}>
                    <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                        <Search color="#166534" size={24} />
                    </View>
                    <Text style={styles.quickTitle}>Track Order</Text>
                    <Text style={styles.quickDesc}>{shipments.length} active</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
                <TouchableOpacity onPress={() => { onViewSettings('orders'); onNavigate('settings'); }}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>


            {/* Combined Activity Feed */}
            {allActivity.length === 0 ? (
                <View style={styles.emptyActivity}>
                    <Clock size={24} color="#C7C7CC" />
                    <Text style={styles.emptyText}>No recent activity.</Text>
                </View>
            ) : (
                allActivity.slice(0, 3).map((item: any, i) => {
                    const isShipment = item.type === 'shipment';
                    const data = item.data;

                    let icon, color, title, statusText, subText, idText, DetailsAction;

                    if (isShipment) {
                        icon = data.status === 'delivered' ? CheckCircle : Truck;
                        color = getStatusColor(data.status);
                        title = data.itemsString;
                        statusText = data.status.replace('_', ' ');
                        subText = data.status === 'delivered' ? 'Delivered' : `Arriving • ${data.estimatedDelivery}`;
                        idText = `${data.carrier} • #${data.trackingNumber.split('-')[1]}`;
                        DetailsAction = () => onNavigate('track');
                    } else {
                        // Order Logic
                        icon = Package;
                        // Map Order Status to Color
                        switch (data.status.toLowerCase()) {
                            case 'processing': color = '#FF9500'; break;
                            case 'delivered': color = '#34C759'; break;
                            case 'cancelled': color = '#FF3B30'; break;
                            default: color = '#8E8E93';
                        }

                        title = data.items;
                        // Shorten items string if needed
                        if (title.length > 30) title = title.substring(0, 28) + '...';

                        statusText = data.status;
                        subText = `Placed on ${data.date}`;
                        idText = `Order #${data.id.split('-')[1]}`;
                        DetailsAction = () => { onViewSettings('orders'); onNavigate('settings'); };
                    }

                    const IconComponent = icon;

                    return (
                        <TouchableOpacity key={`${item.type}-${i}`} style={styles.orderCard} activeOpacity={0.9} onPress={DetailsAction}>
                            <View style={styles.cardTop}>
                                <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                                    <View style={[styles.statusIconBox, { backgroundColor: color + '15' }]}>
                                        <IconComponent size={24} color={color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.activityTitle} numberOfLines={1}>{title}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
                                            <Text style={styles.activityMeta}>{subText}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.miniStatus, { backgroundColor: color + '15' }]}>
                                        <Text style={[styles.miniStatusText, { color: color }]}>{statusText.toUpperCase()}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.cardBottom}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                    <Image source={require('../assets/logo.png')} style={{ width: 16, height: 16, tintColor: '#8E8E93' }} resizeMode="contain" />
                                    <Text style={styles.orderIdSm}>{idText}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.viewDetails}>View</Text>
                                    <ChevronRight size={14} color="#0069FF" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })
            )}

            {/* Banner Ad */}
            <TouchableOpacity activeOpacity={0.9} style={{ marginTop: 20 }}>
                <Image
                    source={require('../assets/offers/banner_ad.png')}
                    style={{ width: '100%', height: 100, borderRadius: 12 }}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, padding: 24 },
    heroText: { color: '#000', fontSize: 34, fontWeight: '700', letterSpacing: -0.4 },
    featuredCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, marginBottom: 20 },
    featuredContent: { flex: 1 },
    featuredLabel: { color: '#0069FF', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
    featuredTitle: { color: '#000', fontSize: 22, fontWeight: '800', marginBottom: 6 },
    featuredDesc: { color: '#8E8E93', fontSize: 14, fontWeight: '500', marginBottom: 16 },
    featuredLogos: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    featuredIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0069FF', alignItems: 'center', justifyContent: 'center' },
    quickGrid: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    quickCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.03 },
    iconBox: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    quickTitle: { color: '#000', fontSize: 16, fontWeight: '700', marginBottom: 4 },
    quickDesc: { color: '#8E8E93', fontSize: 13 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { color: '#8E8E93', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
    seeAll: { color: '#0069FF', fontSize: 13, fontWeight: '600' },
    emptyActivity: { padding: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 20 },
    emptyText: { color: '#8E8E93', textAlign: 'center', marginTop: 12, fontSize: 15 },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
        overflow: 'hidden',
    },
    cardTop: { padding: 16 },
    cardBottom: {
        backgroundColor: '#FAFAFC',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    statusIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    activityMeta: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500',
    },
    miniStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    miniStatusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    orderIdSm: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    viewDetails: {
        fontSize: 13,
        color: '#0069FF',
        fontWeight: '600',
        marginRight: 2,
    },
});

export default HomeView;
