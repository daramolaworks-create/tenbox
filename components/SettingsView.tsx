import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MapPin, Clock, LogOut, ChevronRight, User, Shield, Lock, Trash2 } from 'lucide-react-native';
import { UserProfile, useCartStore } from '../store';
import AddressesView from './AddressesView';
import OrdersView from './OrdersView';
import EditProfileView from './EditProfileView';
import { Button, Input } from './UI';

export type SettingsSubView = 'list' | 'account' | 'addresses' | 'orders' | 'security';

interface SettingsViewProps {
    user: UserProfile | null;
    logout: () => void;
    currentView: SettingsSubView;
    onViewChange: (view: SettingsSubView) => void;
}

const SecurityView = () => {
    const { updatePassword, deleteAccount } = useCartStore();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword) {
            Alert.alert('Error', 'Please fill in both fields.');
            return;
        }
        setLoading(true);
        try {
            await updatePassword(newPassword, currentPassword);
            Alert.alert('Success', 'Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAccount();
                        } catch (e: any) {
                            Alert.alert('Error', e.message);
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Lock size={20} color="#000" />
                        <Text style={styles.cardTitle}>Change Password</Text>
                    </View>
                    <View style={{ gap: 16 }}>
                        <Input
                            placeholder="Current Password"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        <Input
                            placeholder="New Password"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <Button onPress={handleUpdatePassword} disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </View>
                </View>

                <View style={[styles.card, { borderColor: '#FF3B30', borderWidth: 1, backgroundColor: '#FFF5F5' }]}>
                    <View style={styles.cardHeader}>
                        <Trash2 size={20} color="#FF3B30" />
                        <Text style={[styles.cardTitle, { color: '#FF3B30' }]}>Danger Zone</Text>
                    </View>
                    <Text style={styles.cardDesc}>
                        Permanently delete your account and all of your content. This action cannot be undone.
                    </Text>
                    <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={handleDeleteAccount}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.deleteBtnText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const SettingsView: React.FC<SettingsViewProps> = ({
    user,
    logout,
    currentView,
    onViewChange
}) => {
    if (currentView !== 'list') {
        return (
            <View style={styles.screen}>
                <TouchableOpacity onPress={() => onViewChange('list')} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                    <ChevronRight size={24} color="#1C39BB" style={{ transform: [{ rotate: '180deg' }] }} />
                    <Text style={{ fontSize: 17, color: '#1C39BB', marginLeft: 4, fontWeight: '600' }}>Back to Settings</Text>
                </TouchableOpacity>

                {currentView === 'account' && (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.screenTitle}>Account Info</Text>
                        <EditProfileView />
                    </View>
                )}
                {currentView === 'addresses' && (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.screenTitle}>Saved Addresses</Text>
                        <AddressesView />
                    </View>
                )}
                {currentView === 'orders' && (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.screenTitle}>Order History</Text>
                        <OrdersView />
                    </View>
                )}
                {currentView === 'security' && (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.screenTitle}>Security</Text>
                        <SecurityView />
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <Text style={styles.screenTitle}>Settings</Text>

            <TouchableOpacity style={styles.profileHeader} activeOpacity={0.8} onPress={() => onViewChange('account')}>
                <View style={styles.profileAvatarLarge}>
                    {user?.avatar ? (
                        <Image source={{ uri: user.avatar }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                    ) : (
                        <User color="#fff" size={32} />
                    )}
                    <View style={styles.editBadge}>
                        <Text style={styles.editBadgeText}>EDIT</Text>
                    </View>
                </View>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
            </TouchableOpacity>

            <View style={styles.settingsList}>
                {[
                    { icon: MapPin, label: 'Saved Addresses', action: () => onViewChange('addresses') },
                    { icon: Clock, label: 'Order History', action: () => onViewChange('orders') },
                    { icon: Shield, label: 'Security', action: () => onViewChange('security') },
                    { icon: LogOut, label: 'Log Out', color: '#FF3B30', action: () => logout() }
                ].map((item, i) => (
                    <TouchableOpacity key={i} style={styles.settingItem} onPress={item.action}>
                        <View style={styles.settingLeft}>
                            {/* @ts-ignore */}
                            <item.icon size={20} color={item.color || '#000'} />
                            <Text style={[styles.settingLabel, item.color ? { color: item.color } : {}]}>{item.label}</Text>
                        </View>
                        <ChevronRight size={16} color="#C7C7CC" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, padding: 24 },
    screenTitle: { color: '#000', fontSize: 32, fontWeight: '700', letterSpacing: -0.4 },
    profileHeader: { alignItems: 'center', marginVertical: 32 },
    profileAvatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1C39BB', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#1C39BB', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    editBadge: { position: 'absolute', bottom: -6, backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    editBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
    profileName: { color: '#000', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
    profileEmail: { color: '#8E8E93', fontSize: 15, marginTop: 4 },
    settingsList: { gap: 12 },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderRadius: 20 },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingLabel: { color: '#000', fontSize: 15, fontWeight: '600' },

    // Security Styles
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
    cardDesc: { color: '#8E8E93', marginBottom: 16, lineHeight: 20 },
    deleteBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#FF3B30' },
    deleteBtnText: { color: '#FF3B30', fontWeight: '700', fontSize: 15 },
});

export default SettingsView;
