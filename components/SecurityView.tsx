import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Button } from './UI';
import { useCartStore } from '../store';
import { ChevronRight, Lock, KeyRound } from 'lucide-react-native';

interface SecurityViewProps {
    onNavigate?: (view: any) => void;
}

const SecurityView: React.FC<SecurityViewProps> = ({ onNavigate }) => {
    const { deleteAccount } = useCartStore();

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAccount();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete account.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={{ padding: 20 }}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Login & Security</Text>

                <TouchableOpacity
                    style={styles.actionRow}
                    onPress={() => onNavigate && onNavigate('password')}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={[styles.iconBox, { backgroundColor: '#007AFF' }]}>
                            <KeyRound size={18} color="#fff" />
                        </View>
                        <Text style={styles.actionLabel}>Change Password</Text>
                    </View>
                    <ChevronRight size={20} color="#C7C7CC" />
                </TouchableOpacity>
            </View>

            <View style={[styles.card, { marginTop: 24 }]}>
                <Text style={styles.cardTitle}>Account Data</Text>
                <Text style={styles.subText}>Permanently delete your account and all associated data. This action cannot be undone.</Text>
                <Button variant="danger" onPress={handleDeleteAccount} style={{ marginTop: 16 }}>
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
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    subText: {
        fontSize: 14,
        color: '#000',
        lineHeight: 20,
        marginBottom: 4,
        opacity: 0.7
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 17,
        fontWeight: '400',
        color: '#000'
    }
});

export default SecurityView;
