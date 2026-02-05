
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
            case 'delivered': return { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' }; // Green
            case 'processing': return { bg: '#FFF8E1', text: '#FB8C00', border: '#FFECB3' }; // Orange
            case 'cancelled': return { bg: '#FFEBEE', text: '#D32F2F', border: '#FFCDD2' }; // Red
            case 'shipped': return { bg: '#E3F2FD', text: '#1976D2', border: '#BBDEFB' }; // Blue
            default: return { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' }; // Grey
        }
    };

    if (selectedOrder) {
        const statusColors = getStatusColor(selectedOrder.status);

        return (
            <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>

                    {/* Header Navigation */}
                    <TouchableOpacity
                        onPress={() => setSelectedOrder(null)}
                        style={styles.backButtonRow}
                        activeOpacity={0.7}
                    >
                        <View style={styles.backButton}>
                            <ChevronRight size={20} color="#111827" style={{ transform: [{ rotate: '180deg' }] }} />
                        </View>
                        <Text style={styles.backButtonText}>Back to Orders</Text>
                    </TouchableOpacity>

                    {/* Main Receipt Card */}
                    <View style={styles.receiptCard}>
                        {/* Status Banner */}
                        <View style={[styles.statusBanner, { backgroundColor: statusColors.bg }]}>
                            <View style={styles.statusIndicator}>
                                <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
                                <Text style={[styles.statusText, { color: statusColors.text }]}>{selectedOrder.status}</Text>
                            </View>
                            <Text style={styles.orderDate}>{selectedOrder.date}</Text>
                        </View>

                        <View style={styles.receiptBody}>
                            <View style={{ alignItems: 'center', marginBottom: 24 }}>
                                <Text style={styles.receiptLabel}>TOTAL PAID</Text>
                                <Text style={styles.receiptTotal}>{formatPrice(selectedOrder.total)}</Text>
                                <View style={styles.orderIdBadge}>
                                    <Text style={styles.orderIdText}>Order #{selectedOrder.id.split('-')[1]}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Line Items */}
                            <View style={styles.itemsSection}>
                                <Text style={styles.sectionTitle}>ITEMS PURCHASED</Text>
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
                                <View style={[styles.summaryRow, { marginTop: 16 }]}>
                                    <Text style={styles.totalLabel}>Total</Text>
                                    <Text style={styles.totalValue}>{formatPrice(selectedOrder.total)}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Cutout Effect at bottom of receipt */}
                        <View style={styles.receiptZigZag} />
                    </View>

                    {/* Shipping Info Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoCardHeader}>
                            <View style={styles.infoIconBox}>
                                <MapPin size={18} color="#1C39BB" />
                            </View>
                            <Text style={styles.infoCardTitle}>Shipping Address</Text>
                        </View>
                        <Text style={styles.addressText}>{selectedOrder.shippingAddress || 'No address provided'}</Text>
                    </View>

                    {/* Support Action */}
                    <Button variant="secondary" style={{ marginTop: 24, alignSelf: 'center', width: '100%' }}>
                        <HelpCircle size={18} color="#111827" style={{ marginRight: 8 }} />
                        Need Help with this Order?
                    </Button>
                </ScrollView >
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Empty State */}
                {shipments.length === 0 && orderHistory.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Package size={32} color="#1C39BB" />
                        </View>
                        <Text style={styles.emptyText}>No orders yet</Text>
                        <Button variant="outline" style={{ marginTop: 24 }} onPress={() => { }}>Start Shopping</Button>
                    </View>
                ) : (
                    <View style={{ gap: 20 }}>
                        {/* New Shipments Section */}
                        {shipments.length > 0 && (
                            <View>
                                <Text style={styles.listHeader}>Active Shipments</Text>
                                {shipments.map((shipment: any) => (
                                    <View key={shipment.id} style={styles.orderCard}>
                                        <View style={styles.cardMain}>
                                            <View style={styles.shipmentIconBox}>
                                                <Box size={24} color="#1C39BB" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.cardTitle}>{shipment.carrier} Label</Text>
                                                <Text style={styles.cardSubtitle}>{shipment.tracking_number}</Text>
                                            </View>
                                            <View style={[styles.statusBadge, { backgroundColor: '#E0E7FF' }]}>
                                                <Text style={[styles.statusBadgeText, { color: '#1C39BB' }]}>
                                                    {shipment.status?.toUpperCase() || 'CREATED'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Order History Section */}
                        <View>
                            {shipments.length > 0 && <Text style={styles.listHeader}>Past Orders</Text>}
                            {orderHistory.map((order) => {
                                const statusColors = getStatusColor(order.status);
                                const firstImage = order.itemsList?.[0]?.image;

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
                                        <View style={styles.cardMain}>
                                            <View style={styles.thumbContainer}>
                                                {firstImage ? (
                                                    <Image source={{ uri: firstImage }} style={styles.listThumb} />
                                                ) : (
                                                    <View style={styles.listIconBox}>
                                                        <Package size={24} color="#1C39BB" />
                                                    </View>
                                                )}
                                                {additionalItems > 0 && (
                                                    <View style={styles.countBadge}>
                                                        <Text style={styles.countBadgeText}>+{additionalItems}</Text>
                                                    </View>
                                                )}
                                            </View>

                                            <View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                    <Text style={styles.cardTitle} numberOfLines={1}>{displayTitle}</Text>
                                                    <Text style={styles.cardPrice}>{formatPrice(order.total)}</Text>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                                                        <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>{order.status}</Text>
                                                    </View>
                                                    <Text style={styles.cardDate}>{order.date}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.cardFooter}>
                                            <Text style={styles.orderIdFooter}>Order #{order.id.split('-')[1]}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Text style={styles.viewDetailsText}>View Details</Text>
                                                <ChevronRight size={14} color="#1C39BB" />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    // Common
    listHeader: {
        fontSize: 14,
        fontFamily: 'Satoshi-Bold',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 8
    },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyText: { fontSize: 16, fontFamily: 'Satoshi-Medium', color: '#6B7280' },

    // Order Card List Style
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
        overflow: 'hidden',
    },
    cardMain: {
        padding: 16,
        flexDirection: 'row',
        gap: 16,
    },
    thumbContainer: {
        position: 'relative',
    },
    listThumb: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
    },
    listIconBox: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shipmentIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#E0E7FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    countBadge: {
        position: 'absolute',
        bottom: -6,
        right: -6,
        backgroundColor: '#111827',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 2,
        borderColor: '#fff',
    },
    countBadgeText: {
        fontSize: 10,
        fontFamily: 'Satoshi-Bold',
        color: '#fff',
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        fontFamily: 'Satoshi-Medium',
        color: '#6B7280',
    },
    cardPrice: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: '#111827',
    },
    cardDate: {
        fontSize: 13,
        fontFamily: 'Satoshi-Medium',
        color: '#9CA3AF',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    statusBadgeText: {
        fontSize: 11,
        fontFamily: 'Satoshi-Bold',
        textTransform: 'uppercase',
    },
    cardFooter: {
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    orderIdFooter: {
        fontSize: 12,
        fontFamily: 'Satoshi-Bold',
        color: '#6B7280',
        letterSpacing: 0.5,
    },
    viewDetailsText: {
        fontSize: 13,
        fontFamily: 'Satoshi-Bold',
        color: '#1C39BB',
    },

    // Receipt View Styles
    backButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        alignSelf: 'flex-start',
        gap: 12
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        shadowOpacity: 1,
    },
    backButtonText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: '#111827',
    },

    receiptCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 24,
        shadowOpacity: 1,
    },
    statusBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontFamily: 'Satoshi-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    orderDate: {
        fontSize: 13,
        fontFamily: 'Satoshi-Medium',
        color: 'rgba(0,0,0,0.5)',
    },
    receiptBody: {
        padding: 24,
        paddingBottom: 40,
    },
    receiptLabel: {
        fontSize: 12,
        fontFamily: 'Satoshi-Bold',
        color: '#9CA3AF',
        marginBottom: 8,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    receiptTotal: {
        fontSize: 40,
        fontFamily: 'Satoshi-Black', // Assuming boldest weight
        color: '#111827',
        marginBottom: 8,
        letterSpacing: -1,
    },
    orderIdBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 100,
    },
    orderIdText: {
        fontSize: 13,
        color: '#4B5563',
        fontFamily: 'Satoshi-Bold',
        letterSpacing: 0.5
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        width: '100%',
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Satoshi-Bold',
        color: '#9CA3AF',
        marginBottom: 20,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    itemsSection: {
        // padding handled by receiptBody
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
    },
    itemThumb: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#F2F2F7',
        marginRight: 16,
    },
    itemName: {
        fontSize: 15,
        fontFamily: 'Satoshi-Bold',
        color: '#111827',
        marginBottom: 4,
    },
    itemVariant: {
        fontSize: 14,
        color: '#6B7280',
        fontFamily: 'Satoshi-Medium',
    },
    itemPrice: {
        fontSize: 15,
        fontFamily: 'Satoshi-Bold',
        color: '#111827',
    },
    summarySection: {
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 15,
        color: '#6B7280',
        fontFamily: 'Satoshi-Medium',
    },
    summaryValue: {
        fontSize: 15,
        color: '#111827',
        fontFamily: 'Satoshi-Bold',
    },
    totalLabel: {
        fontSize: 18,
        color: '#111827',
        fontFamily: 'Satoshi-Bold',
    },
    totalValue: {
        fontSize: 18,
        color: '#111827',
        fontFamily: 'Satoshi-Black',
    },
    receiptZigZag: {
        // CSS zig-zag is hard in RN without SVG, so we'll just do a clean cut or simulated effect
        // For now, simpler to just have a clean bottom or border style
    },

    // Info Card
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginTop: 20,
        padding: 24,
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 1,
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16
    },
    infoIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#E0E7FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoCardTitle: {
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
        color: '#111827',
    },
});


export default OrdersView;
