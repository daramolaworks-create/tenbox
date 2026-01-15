import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronRight, Truck, CheckCircle, AlertCircle, Search, Package, MapPin, Clock } from 'lucide-react-native';
import { Shipment } from '../types';
import { Card, Input, Button } from './UI';
import { useCartStore, TrackingResult } from '../store';

interface TrackViewProps {
    shipments: Shipment[];
}

const TrackView: React.FC<TrackViewProps> = ({ shipments }) => {
    const { trackShipment } = useCartStore();
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [trackingInput, setTrackingInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return '#34C759';
            case 'out_for_delivery': return '#0223E6';
            case 'transit':
            case 'in_transit': return '#FF9500';
            case 'exception':
            case 'failure':
            case 'returned': return '#FF3B30';
            case 'pre_transit': return '#8E8E93';
            default: return '#FF9500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return CheckCircle;
            case 'exception':
            case 'failure': return AlertCircle;
            default: return Truck;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'Delivered';
            case 'transit':
            case 'in_transit': return 'In Transit';
            case 'out_for_delivery': return 'Out for Delivery';
            case 'pre_transit': return 'Label Created';
            case 'exception': return 'Exception';
            case 'failure': return 'Delivery Failed';
            case 'returned': return 'Returned';
            default: return status || 'Unknown';
        }
    };

    const handleTrack = async () => {
        if (!trackingInput.trim()) return;

        setLoading(true);
        setTrackingResult(null);

        const result = await trackShipment(trackingInput.trim());
        setTrackingResult(result);
        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Text style={styles.screenTitle}>Track Order</Text>
            <Text style={styles.subText}>Enter your tracking number to get real-time updates</Text>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Input
                    placeholder="Enter tracking number..."
                    value={trackingInput}
                    onChangeText={setTrackingInput}
                    style={styles.searchInput}
                    onSubmitEditing={handleTrack}
                    returnKeyType="search"
                />
                <Button
                    onPress={handleTrack}
                    style={styles.searchBtn}
                    disabled={loading || !trackingInput.trim()}
                    size="lg"
                >
                    {loading ? <ActivityIndicator color="#fff" size="small" /> : <Search size={20} color="#fff" />}
                </Button>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Tracking Result */}
                {trackingResult && (
                    <Card style={styles.resultCard}>
                        {/* Status Header */}
                        <View style={styles.statusHeader}>
                            <View style={[styles.statusIconBox, { backgroundColor: getStatusColor(trackingResult.status) + '20' }]}>
                                {React.createElement(getStatusIcon(trackingResult.status), {
                                    size: 28,
                                    color: getStatusColor(trackingResult.status)
                                })}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.statusText, { color: getStatusColor(trackingResult.status) }]}>
                                    {getStatusLabel(trackingResult.status)}
                                </Text>
                                <Text style={styles.statusDetails}>{trackingResult.status_details}</Text>
                            </View>
                        </View>

                        {/* Tracking Info */}
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Package size={16} color="#8E8E93" />
                                <Text style={styles.infoLabel}>Tracking #</Text>
                                <Text style={styles.infoValue}>{trackingResult.tracking_number}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Truck size={16} color="#8E8E93" />
                                <Text style={styles.infoLabel}>Carrier</Text>
                                <Text style={styles.infoValue}>{trackingResult.carrier?.toUpperCase()}</Text>
                            </View>
                        </View>

                        {trackingResult.location && (
                            <View style={styles.locationRow}>
                                <MapPin size={16} color="#0223E6" />
                                <Text style={styles.locationText}>{trackingResult.location}</Text>
                            </View>
                        )}

                        {trackingResult.estimated_delivery && (
                            <View style={styles.etaRow}>
                                <Clock size={16} color="#34C759" />
                                <Text style={styles.etaText}>
                                    Estimated: {formatDate(trackingResult.estimated_delivery)}
                                </Text>
                            </View>
                        )}

                        {/* Timeline */}
                        {trackingResult.events && trackingResult.events.length > 0 && (
                            <View style={styles.timeline}>
                                <Text style={styles.timelineTitle}>Tracking History</Text>
                                <View style={styles.timelineLine} />
                                {trackingResult.events.slice(0, 10).map((event, i) => (
                                    <View key={i} style={styles.timelineItem}>
                                        <View style={[styles.timelineDot, { borderColor: i === 0 ? getStatusColor(event.status) : '#E5E5EA' }]}>
                                            {i === 0 && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: getStatusColor(event.status) }} />}
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.eventStatus}>{event.description}</Text>
                                            <Text style={styles.eventLocation}>{event.location} • {formatDate(event.date)}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Card>
                )}

                {/* My Shipments Section */}
                {shipments.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>My Shipments</Text>
                        {shipments.map(s => (
                            <TouchableOpacity key={s.id} activeOpacity={0.8} onPress={() => {
                                setSelectedShipment(selectedShipment?.id === s.id ? null : s);
                                setTrackingInput(s.trackingNumber);
                            }}>
                                <Card style={styles.shipmentCard}>
                                    <View style={styles.shipmentHeader}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                            <View style={[styles.statusDot, { backgroundColor: getStatusColor(s.status) }]} />
                                            <Text style={styles.trackingNum}>{s.trackingNumber}</Text>
                                        </View>
                                        <Text style={styles.shipmentDate}>{s.estimatedDelivery}</Text>
                                    </View>

                                    <View style={styles.shipmentBody}>
                                        <Text style={styles.shipmentItems}>{s.itemsString}</Text>
                                        <Text style={styles.shipmentRoute}>{s.origin} <ChevronRight size={14} color="#8E8E93" /> {s.destination}</Text>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </>
                )}

                {/* Help Section - Always show when no tracking result */}
                {!trackingResult && !loading && (
                    <View style={styles.helpSection}>
                        {/* Quick Tips Banner */}
                        <View style={styles.tipsBanner}>
                            <View style={styles.tipsIcon}>
                                <Search size={20} color="#0223E6" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.tipsTitle}>Track Any Package</Text>
                                <Text style={styles.tipsText}>Enter your tracking number from any carrier to get real-time updates</Text>
                            </View>
                        </View>

                        {/* Supported Carriers */}
                        <Text style={styles.carriersTitle}>Supported Carriers</Text>
                        <View style={styles.carriersGrid}>
                            <View style={styles.carrierBadge}>
                                <Text style={styles.carrierText}>USPS</Text>
                            </View>
                            <View style={styles.carrierBadge}>
                                <Text style={styles.carrierText}>UPS</Text>
                            </View>
                            <View style={styles.carrierBadge}>
                                <Text style={styles.carrierText}>FedEx</Text>
                            </View>
                            <View style={styles.carrierBadge}>
                                <Text style={styles.carrierText}>DHL</Text>
                            </View>
                        </View>

                        {/* Example Format */}
                        <View style={styles.exampleBox}>
                            <Text style={styles.exampleLabel}>Example Tracking Numbers</Text>
                            <Text style={styles.exampleText}>USPS: 9400111899223033005717</Text>
                            <Text style={styles.exampleText}>UPS: 1Z999AA10123456784</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, padding: 24 },
    screenTitle: { color: '#000', fontSize: 32, fontWeight: '700', letterSpacing: -0.4 },
    subText: { color: '#8E8E93', fontSize: 15, marginTop: 4, fontWeight: '500' },

    searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
    searchInput: { flex: 1 },
    searchBtn: { width: 56, height: 56, paddingHorizontal: 0, justifyContent: 'center', alignItems: 'center' },

    resultCard: { padding: 20, marginBottom: 24 },
    statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
    statusIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    statusText: { fontSize: 20, fontWeight: '700' },
    statusDetails: { fontSize: 14, color: '#8E8E93', marginTop: 2 },

    infoRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
    infoItem: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 12, padding: 12 },
    infoLabel: { fontSize: 11, color: '#8E8E93', fontWeight: '600', marginTop: 8, marginBottom: 2 },
    infoValue: { fontSize: 14, color: '#000', fontWeight: '700' },

    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    locationText: { fontSize: 14, color: '#000', fontWeight: '500' },

    etaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    etaText: { fontSize: 14, color: '#34C759', fontWeight: '600' },

    timeline: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
    timelineTitle: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 16 },
    timelineLine: { position: 'absolute', top: 60, left: 7, bottom: 20, width: 2, backgroundColor: '#F2F2F7' },
    timelineItem: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    timelineDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', borderWidth: 2, zIndex: 1, alignItems: 'center', justifyContent: 'center' },
    eventStatus: { color: '#000', fontSize: 13, fontWeight: '600', marginBottom: 2 },
    eventLocation: { color: '#8E8E93', fontSize: 11 },

    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginTop: 8, marginBottom: 16 },

    shipmentCard: { padding: 20, marginBottom: 16 },
    shipmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    trackingNum: { color: '#000', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
    shipmentDate: { color: '#8E8E93', fontSize: 12, fontWeight: '600' },
    shipmentBody: { borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12 },
    shipmentItems: { color: '#000', fontSize: 15, fontWeight: '600', marginBottom: 4 },
    shipmentRoute: { color: '#8E8E93', fontSize: 12, fontWeight: '500' },

    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginTop: 16 },
    emptyText: { fontSize: 14, color: '#8E8E93', marginTop: 4, textAlign: 'center' },

    // Help Section Styles
    helpSection: { marginTop: 8 },
    tipsBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8ECFF',
        borderRadius: 16,
        padding: 16,
        gap: 14,
        marginBottom: 24
    },
    tipsIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    tipsTitle: { fontSize: 15, fontWeight: '700', color: '#0223E6', marginBottom: 2 },
    tipsText: { fontSize: 13, color: '#5C6BC0', lineHeight: 18 },

    carriersTitle: { fontSize: 14, fontWeight: '600', color: '#8E8E93', marginBottom: 12 },
    carriersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
    carrierBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8
    },
    carrierText: { fontSize: 13, fontWeight: '700', color: '#333' },

    exampleBox: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    exampleLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 8 },
    exampleText: { fontSize: 12, color: '#666', fontFamily: 'monospace', marginBottom: 4 },
});

export default TrackView;
