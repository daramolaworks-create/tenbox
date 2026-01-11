
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useCartStore } from '../store';

const NotificationsView = () => {
    const { notifications, toggleNotification } = useCartStore();

    const renderToggle = (label: string, sub: string, value: boolean, key: any) => (
        <View style={styles.row}>
            <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.sub}>{sub}</Text>
            </View>
            <Switch
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor={'#fff'}
                ios_backgroundColor="#E5E5EA"
                onValueChange={() => toggleNotification(key)}
                value={value}
            />
        </View>
    );

    return (
        <View style={{ padding: 20 }}>
            <View style={styles.card}>
                {renderToggle('Order Updates', 'Get notified about shipping status.', notifications.orderUpdates, 'orderUpdates')}
                <View style={styles.divider} />
                {renderToggle('Promotions', 'Receive offers and discounts.', notifications.promotions, 'promotions')}
                <View style={styles.divider} />
                {renderToggle('New Features', 'Be the first to know about app updates.', notifications.newFeatures, 'newFeatures')}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 6
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
        fontFamily: 'ZalandoBold',
    },
    sub: {
        fontSize: 13,
        color: '#8E8E93',
        lineHeight: 18,
        fontFamily: 'ZalandoRegular',
    },
    divider: {
        height: 1,
        backgroundColor: '#F2F2F7',
        marginLeft: 16,
    }
});

export default NotificationsView;
