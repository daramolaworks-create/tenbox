
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Package, ChevronRight, MapPin, Receipt, HelpCircle, Box } from 'lucide-react-native';
import { useCartStore } from '../store';
import { Button } from './UI';

const formatPrice = (price: string | number) => {
    if (!price) return '$0';
    // Remove existing currency symbols to parse
    let numStr = price.toString().replace(/[^0-9.]/g, '');
    let num = parseFloat(numStr);

    if (isNaN(num)) return price.toString();

    // User requested "round up"
    return '$' + Math.ceil(num).toFixed(0);
};

const OrdersView = () => {
    const { orderHistory, fetchOrders, shipments, fetchShipments } = useCartStore();
    const [selectedOrder, setSelectedOrder] = React.useState<any>(null);

    React.useEffect(() => {
        fetchOrders();
        fetchShipments();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' };
            case 'processing': return { bg: '#FFF8E1', text: '#F57F17', border: '#FFECB3' };
            case 'cancelled': return { bg: '#FFEBEE', text: '#C62828', border: '#FFCDD2' };
            default: return { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' };
        }
    };

    if (selectedOrder) {
        const statusColors = getStatusColor(selectedOrder.status);

        return (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
                {/* Header Navigation */}
                <TouchableOpacity onPress={() => setSelectedOrder(null)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, alignSelf: 'flex-start' }}>
                    <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronRight size={20} color="#000" style={{ transform: [{ rotate: '180deg' }] }} />
                    </View>
                    <Text style={{ fontSize: 16, color: '#000', marginLeft: 12, fontWeight: '600' }}>Back</Text>
                </TouchableOpacity>

                {/* Main Receipt Card */}
                <View style={styles.card}>
                    {/* Status Banner */}
                    <View style={[styles.statusBanner, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColors.text }} />
                            <Text style={[styles.statusBannerText, { color: statusColors.text }]}>{selectedOrder.status}</Text>
                        </View>
                        <Text style={styles.orderDate}>{selectedOrder.date}</Text>
                    </View>

                    <View style={{ padding: 24 }}>
                        <Text style={styles.receiptLabel}>AMOUNT PAID</Text>
                        <Text style={styles.receiptTotal}>{formatPrice(selectedOrder.total)}</Text>
                        <Text style={styles.receiptId}>Order #{selectedOrder.id.split('-')[1]}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Line Items */}
                    <View style={styles.itemsSection}>
                        <Text style={styles.sectionTitle}>ITEMS</Text>
                        {selectedOrder.itemsList?.map((item: any, i: number) => (
                            <View key={i} style={styles.itemRow}>
                                <Image source={{ uri: item.image }} style={styles.itemThumb} resizeMode="cover" />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                                    <Text style={styles.itemVariant}>Qty: {item.qty}</Text>
                                </View>
                                <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.divider} />

                    {/* Financial Summary */}
                    <View style={styles.summarySection}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{formatPrice(selectedOrder.subtotal)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Shipping</Text>
                            <Text style={styles.summaryValue}>{formatPrice(selectedOrder.shipping)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tax</Text>
                            <Text style={styles.summaryValue}>{formatPrice(selectedOrder.tax)}</Text>
                        </View>
                        <View style={[styles.summaryRow, { marginTop: 12 }]}>
                            <Text style={[styles.summaryLabel, { fontWeight: '700', color: '#000' }]}>Total</Text>
                            <Text style={[styles.summaryValue, { fontWeight: '700', color: '#000' }]}>{formatPrice(selectedOrder.total)}</Text>
                        </View>
                    </View>
                </View>

                {/* Shipping Info Card */}
                <View style={[styles.card, { marginTop: 16, padding: 24 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' }}>
                            <MapPin size={18} color="#0069FF" />
                        </View>
                        <Text style={styles.cardHeaderTitle}>Shipping Address</Text>
                    </View>
                    <Text style={styles.addressText}>{selectedOrder.shippingAddress || 'No address provided'}</Text>
                </View>

                {/* Tracking Info (If available) */}
                {shipments.length > 0 && (
                    <View style={[styles.card, { marginTop: 16, padding: 24 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' }}>
                                <Box size={18} color="#0069FF" />
                            </View>
                            <Text style={styles.cardHeaderTitle}>Track Shipments</Text>
                        </View>
                        {shipments.map((ship: any) => (
                            <View key={ship.id} style={styles.trackRow}>
                                <View>
                                    <Text style={styles.trackCarrier}>{ship.carrier}</Text>
                                    <Text style={styles.trackNum}>{ship.tracking_number}</Text>
                                </View>
                                <View style={[styles.trackBadge, { backgroundColor: '#F2F2F7' }]}>
                                    <Text style={styles.trackStatus}>{ship.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Support Action */}
                <Button variant="secondary" style={{ marginTop: 24 }}>
                    <HelpCircle size={18} color="#000" style={{ marginRight: 8 }} />
                    Need Help?
                </Button>
            </ScrollView >
        );
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
            {/* Empty State - Only if BOTH are empty */}
            {shipments.length === 0 && orderHistory.length === 0 ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                    <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076432.png' }} style={{ width: 80, height: 80, opacity: 0.3, marginBottom: 16 }} />
                    <Text style={{ fontSize: 18, color: '#8E8E93', fontWeight: '500' }}>No orders yet</Text>
                    <Button variant="outline" style={{ marginTop: 24 }} onPress={() => { }}>Start Shopping</Button>
                </View>
            ) : (
                <View style={{ gap: 16 }}>
                    {/* Shipments Section */}
                    {shipments.map((shipment: any) => (
                        <View key={shipment.id} style={styles.orderCard}>
                            <View style={styles.cardTop}>
                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                    <View style={styles.listIconBox}>
                                        <Box size={24} color="#0069FF" />
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
            <View style={{ marginTop: 16, gap: 16 }}>
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
                                                <Package size={24} color="#0069FF" />
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
                                            <Text style={styles.listPrice}>{formatPrice(order.total)}</Text>
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
                                    <ChevronRight size={14} color="#0069FF" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    statusBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    statusBannerText: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    orderDate: {
        fontSize: 13,
        color: 'rgba(0,0,0,0.5)',
        fontWeight: '500',
    },
    receiptLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#8E8E93',
        marginBottom: 4,
        letterSpacing: 1,
    },
    receiptTotal: {
        fontSize: 34,
        fontWeight: '800',
        color: '#000',
        marginBottom: 4,
        letterSpacing: -1,
    },
    receiptId: {
        fontSize: 15,
        color: '#8E8E93',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F2F2F7',
        width: '100%',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
        marginBottom: 16,
        letterSpacing: 1,
    },
    itemsSection: {
        padding: 24,
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
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
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1C1C1E',
        fontWeight: '600',
    },
    cardHeaderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    addressText: {
        fontSize: 15,
        color: '#3A3A3C',
        lineHeight: 22,
        fontWeight: '500',
    },
    trackRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    trackCarrier: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    trackNum: {
        fontSize: 13,
        color: '#8E8E93',
    },
    trackBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    trackStatus: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        color: '#000',
    },

    // Legacy List Styles
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 0,
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
        color: '#0069FF',
        fontWeight: '600',
        marginRight: 2,
    },
});

export default OrdersView;
