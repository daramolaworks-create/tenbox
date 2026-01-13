
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Package, ChevronRight, MapPin, Receipt, HelpCircle, Box } from 'lucide-react-native';
import { useCartStore } from '../store';
import { Button } from './UI';

const OrdersView = () => {
    const { orderHistory, fetchOrders, shipments, fetchShipments } = useCartStore();
    const [selectedOrder, setSelectedOrder] = React.useState<any>(null);

    React.useEffect(() => {
        fetchOrders();
        fetchShipments();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return { bg: '#34C75915', text: '#34C759' };
            case 'processing': return { bg: '#FFD60A15', text: '#FFD60A' };
            case 'cancelled': return { bg: '#FF3B3015', text: '#FF3B30' };
            default: return { bg: '#F2F2F7', text: '#8E8E93' };
        }
    };

    if (selectedOrder) {
        const statusColors = getStatusColor(selectedOrder.status);

        return (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Header Navigation */}
                <TouchableOpacity onPress={() => setSelectedOrder(null)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, alignSelf: 'flex-start' }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 }}>
                        <ChevronRight size={20} color="#000" style={{ transform: [{ rotate: '180deg' }] }} />
                    </View>
                    <Text style={{ fontSize: 15, color: '#000', marginLeft: 12, fontWeight: '600' }}>Back to History</Text>
                </TouchableOpacity>

                {/* Main Receipt Card */}
                <View style={styles.receiptCard}>
                    {/* Receipt Header */}
                    <View style={styles.receiptHeader}>
                        <View style={styles.receiptIcon}>
                            <Receipt size={24} color="#fff" />
                        </View>
                        <Text style={styles.receiptTitle}>Order Details</Text>
                        <Text style={styles.receiptId}>#{selectedOrder.id.split('-')[1]}</Text>
                    </View>

                    {/* Status & Date */}
                    <View style={styles.metaRow}>
                        <View>
                            <Text style={styles.metaLabel}>Placed On</Text>
                            <Text style={styles.metaValue}>{selectedOrder.date}</Text>
                        </View>
                        <View style={[styles.statusPill, { backgroundColor: statusColors.bg }]}>
                            <Text style={[styles.statusPillText, { color: statusColors.text }]}>{selectedOrder.status}</Text>
                        </View>
                    </View>

                    <View style={styles.dashedLine} />

                    {/* Line Items */}
                    <View style={styles.itemsSection}>
                        {selectedOrder.itemsList?.map((item: any, i: number) => (
                            <View key={i} style={styles.itemRow}>
                                <Image source={{ uri: item.image }} style={styles.itemThumb} resizeMode="cover" />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemVariant}>Qty: {item.qty}</Text>
                                </View>
                                <Text style={styles.itemPrice}>{item.price}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.dashedLine} />

                    {/* Financial Summary */}
                    <View style={styles.summarySection}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{selectedOrder.subtotal || '$0.00'}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={styles.summaryValue}>{selectedOrder.shipping || '$0.00'}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax</Text>
                            <Text style={styles.summaryValue}>{selectedOrder.tax || '$0.00'}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Paid</Text>
                            <Text style={styles.totalValue}>{selectedOrder.total}</Text>
                        </View>
                    </View>
                </View>

                {/* Shipment History Card */}
                <View style={[styles.card, { marginTop: 16, padding: 20 }]}>
                    <Text style={styles.historyTitle}>Shipment History</Text>
                    {shipments.length === 0 ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
                            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076432.png' }} style={{ width: 80, height: 80, opacity: 0.3, marginBottom: 16 }} />
                            <Text style={{ fontSize: 18, color: '#8E8E93', fontWeight: '500' }}>No orders yet</Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyList}>
                            {shipments.map((shipment: any) => (
                                <View key={shipment.id} style={styles.historyCard}>
                                    <View style={styles.historyLeft}>
                                        <View style={[styles.carrierIcon, { backgroundColor: '#F2F2F7' }]}>
                                            <Box size={20} color="#000" />
                                        </View>
                                        <View>
                                            <Text style={styles.historyCarrier}>{shipment.carrier}</Text>
                                            <Text style={styles.historyTrack}>{shipment.tracking_number}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.historyRight}>
                                        <View style={[styles.statusBadge, { backgroundColor: '#E5E5EA' }]}>
                                            <Text style={styles.statusText}>{shipment.status.toUpperCase()}</Text>
                                        </View>
                                        <Text style={styles.historyDate}>{new Date(shipment.created_at).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Shipping Info Card */}
                <View style={[styles.card, { marginTop: 16, padding: 20 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <MapPin size={20} color="#0223E6" />
                        <Text style={styles.sectionHeader}>SHIPPING TO</Text>
                    </View>
                    <Text style={styles.addressText}>{selectedOrder.shippingAddress || 'No address provided'}</Text>
                </View>

                {/* Shipment History (Contextual) */}
                {
                    shipments.length > 0 && (
                        <View style={[styles.card, { marginTop: 16, padding: 20 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <Box size={20} color="#0223E6" />
                                <Text style={styles.sectionHeader}>RELATIONSHIP HISTORY</Text>
                            </View>
                            {shipments.slice(0, 3).map((ship: any) => (
                                <View key={ship.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Text style={{ color: '#8E8E93' }}>{new Date(ship.created_at).toLocaleDateString()}</Text>
                                    <Text style={{ fontWeight: '600' }}>{ship.tracking_number}</Text>
                                </View>
                            ))}
                        </View>
                    )
                }

                {/* Support Action */}
                <Button variant="outline" style={{ marginTop: 24 }}>
                    <HelpCircle size={18} color="#000" style={{ marginRight: 8 }} />
                    Need Help with this Order?
                </Button>
            </ScrollView >
        );
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 24 }}>Your Orders</Text>

            {/* Shipments List */}
            {shipments.length === 0 ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                    <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076432.png' }} style={{ width: 80, height: 80, opacity: 0.3, marginBottom: 16 }} />
                    <Text style={{ fontSize: 18, color: '#8E8E93', fontWeight: '500' }}>No orders yet</Text>
                    <Button variant="outline" style={{ marginTop: 24 }} onPress={() => { }}>Start Shipping</Button>
                </View>
            ) : (
                <View style={{ gap: 16 }}>
                    {shipments.map((shipment: any) => (
                        <View key={shipment.id} style={styles.orderCard}>
                            <View style={styles.cardTop}>
                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                    <View style={styles.listIconBox}>
                                        <Box size={24} color="#0223E6" />
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Text style={styles.listTitle}>{shipment.carrier} Label</Text>
                                            <Text style={styles.listPrice}>{shipment.tracking_number}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                                            <Text style={styles.listDate}>{new Date(shipment.created_at).toLocaleDateString()}</Text>
                                            <View style={[styles.miniStatus, { backgroundColor: '#E5E5EA' }]}>
                                                <Text style={[styles.miniStatusText, { color: '#000' }]}>{shipment.status?.toUpperCase() || 'CREATED'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Legacy Store Orders (Hidden if empty) */}
            {orderHistory.length > 0 && orderHistory.map((order) => {
                const statusColors = getStatusColor(order.status);
                const firstImage = order.itemsList?.[0]?.image;

                // Smart Title Logic
                let displayTitle = order.items;
                let additionalItems = 0;

                if (order.itemsList && order.itemsList.length > 0) {
                    const count = order.itemsList.length;
                    additionalItems = count - 1;
                    displayTitle = count > 1
                        ? `${order.itemsList[0].name} & ${additionalItems} more`
                        : order.itemsList[0].name;
                }

                return (
                    <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.9} onPress={() => setSelectedOrder(order)}>
                        <View style={styles.cardTop}>
                            <View style={{ flexDirection: 'row', gap: 16 }}>
                                <View>
                                    {firstImage ? (
                                        <Image source={{ uri: firstImage }} style={styles.listThumb} />
                                    ) : (
                                        <View style={styles.listIconBox}>
                                            <Package size={24} color="#0223E6" />
                                        </View>
                                    )}
                                    {additionalItems > 0 && (
                                        <View style={styles.moreItemsBadge}>
                                            <Text style={styles.moreItemsText}>+{additionalItems}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Text style={styles.listTitle} numberOfLines={1}>{displayTitle}</Text>
                                        <Text style={styles.listPrice}>{order.total}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                                        <Text style={styles.listDate}>{order.date}</Text>
                                        <View style={[styles.miniStatus, { backgroundColor: statusColors.bg }]}>
                                            <Text style={[styles.miniStatusText, { color: statusColors.text }]}>{order.status}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.cardBottom}>
                            <Text style={styles.orderIdSm}>Order #{order.id.split('-')[1]}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.viewDetails}>View Details</Text>
                                <ChevronRight size={14} color="#0223E6" />
                            </View>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
    cardTop: {
        padding: 16,
    },
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
    listThumb: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
    },
    listIconBox: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        flex: 1,
        marginRight: 8,
    },
    listPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    moreItemsBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#000',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 2,
        borderColor: '#fff',
    },
    moreItemsText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    listDate: {
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
        color: '#0223E6',
        fontWeight: '600',
        marginRight: 2,
    },

    // DETAIL VIEW
    receiptCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 0,
        overflow: 'hidden',
        shadowColor: 'rgba(0,0,0,0.08)',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        shadowOpacity: 1,
    },
    receiptHeader: {
        backgroundColor: '#1C1C1E',
        padding: 24,
        alignItems: 'center',
    },
    receiptIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    receiptTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    receiptId: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
    },
    metaLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    metaValue: {
        fontSize: 16,
        color: '#1C1C1E',
        fontWeight: '600',
    },
    statusPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusPillText: {
        fontSize: 14,
        fontWeight: '700',
    },
    dashedLine: {
        height: 1,
        width: '100%',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderStyle: 'dashed', // Note: React Native dashed borders require borderRadius usually, or a view trick. Simple generic view line for now.
        opacity: 0.5,
    },
    itemsSection: {
        padding: 24,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    itemThumb: {
        width: 48,
        height: 48,
        borderRadius: 10,
        backgroundColor: '#F2F2F7',
        marginRight: 16,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    itemVariant: {
        fontSize: 13,
        color: '#8E8E93',
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    summarySection: {
        padding: 24,
        backgroundColor: '#FAFAFC',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 15,
        color: '#8E8E93',
    },
    summaryValue: {
        fontSize: 15,
        color: '#1C1C1E',
        fontWeight: '500',
    },
    totalRow: {
        marginTop: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0223E6',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 1,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1C1C1E',
        letterSpacing: 0.5,
    },
    addressText: {
        fontSize: 16,
        color: '#3A3A3C',
        lineHeight: 24,
        fontWeight: '500',
    },
    // HISTORY STYLES
    historyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    historyList: { gap: 12 },
    historyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    carrierIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    historyCarrier: { fontSize: 15, fontWeight: '600', color: '#000' },
    historyTrack: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    historyRight: { alignItems: 'flex-end', gap: 4 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '700' },
    historyDate: { fontSize: 12, color: '#8E8E93' },
});

export default OrdersView;
