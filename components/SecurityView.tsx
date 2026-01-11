
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Button, Input } from './UI';

const SecurityView = () => {
    return (
        <View style={{ padding: 20 }}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Change Password</Text>
                <View style={{ gap: 16 }}>
                    <Input placeholder="Current Password" secureTextEntry />
                    <Input placeholder="New Password" secureTextEntry />
                    <Input placeholder="Confirm New Password" secureTextEntry />
                    <Button onPress={() => Alert.alert('Success', 'Password updated successfully')}>
                        Update Password
                    </Button>
                </View>
            </View>

            <View style={[styles.card, { marginTop: 24 }]}>
                <Text style={styles.cardTitle}>Account Data</Text>
                <Text style={styles.subText}>Permanently delete your account and all associated data. This action cannot be undone.</Text>
                <Button variant="danger" onPress={() => Alert.alert('Delete Account', 'This is a mocked action.')}>
                    Delete Account
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#000',
        fontFamily: 'ZalandoBold',
    },
    subText: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
        fontFamily: 'ZalandoRegular',
    }
});

export default SecurityView;
