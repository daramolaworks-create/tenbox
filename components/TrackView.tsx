import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronRight, Truck, CheckCircle, AlertCircle } from 'lucide-react-native';
import { Shipment } from '../types';
import { Card, Input } from './UI';

interface TrackViewProps {
    shipments: Shipment[];
}

const TrackView: React.FC<TrackViewProps> = ({ shipments }) => {
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return '#34C759';
            case 'out_for_delivery': return '#0223E6';
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

    return (
        <View style={styles.screen}>
            <Text style={styles.screenTitle}>My Shipments</Text>
            <Text style={styles.subText}>{shipments.length} active orders</Text>

            <Input placeholder="Enter tracking number..." style={{ marginTop: 24, marginBottom: 12 }} />

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ paddingBottom: 40 }}>
                {shipments.map(s => (
                    <TouchableOpacity key={s.id} activeOpacity={0.8} onPress={() => setSelectedShipment(selectedShipment?.id === s.id ? null : s)}>
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

                            {selectedShipment?.id === s.id && (
                                <View style={styles.timeline}>
                                    <View style={styles.timelineLine} />
                                    {s.events.map((e, i) => {
                                        const Icon = getStatusIcon(e.status);
                                        return (
                                            <View key={i} style={styles.timelineItem}>
                                                <View style={[styles.timelineDot, { borderColor: i === 0 ? getStatusColor(e.status) : '#E5E5EA' }]}>
                                                    {i === 0 && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: getStatusColor(e.status) }} />}
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.eventStatus}>{e.description}</Text>
                                                    <Text style={styles.eventLocation}>{e.location} • {e.date}</Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, padding: 24 },
    screenTitle: { color: '#000', fontSize: 32, fontWeight: '700', letterSpacing: -0.4 },
    subText: { color: '#8E8E93', fontSize: 17, marginTop: 4, fontWeight: '500' },
    shipmentCard: { padding: 20, marginBottom: 16 },
    shipmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    trackingNum: { color: '#000', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
    shipmentDate: { color: '#8E8E93', fontSize: 12, fontWeight: '600' },
    shipmentBody: { borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12 },
    shipmentItems: { color: '#000', fontSize: 15, fontWeight: '600', marginBottom: 4 },
    shipmentRoute: { color: '#8E8E93', fontSize: 12, fontWeight: '500' },
    timeline: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
    timelineLine: { position: 'absolute', top: 20, left: 7, bottom: 20, width: 2, backgroundColor: '#F2F2F7' },
    timelineItem: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    timelineDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', borderWidth: 2, zIndex: 1, alignItems: 'center', justifyContent: 'center' },
    eventStatus: { color: '#000', fontSize: 13, fontWeight: '600', marginBottom: 2 },
    eventLocation: { color: '#8E8E93', fontSize: 11 },
});

export default TrackView;
