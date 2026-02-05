import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MapPin, Clock, LogOut, ChevronRight, User, Shield, Lock, Trash2, ArrowLeft } from 'lucide-react-native';
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
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 24, padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' }}>
                            <Lock size={18} color="#111827" />
                        </View>
                        <Text style={styles.cardTitle}>Change Password</Text>
                    </View>
                    <View style={{ gap: 20 }}>
                        <Input
                            label="Current Password"
                            placeholder="Enter current password"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        <Input
                            label="New Password"
                            placeholder="Enter new password"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <Button onPress={handleUpdatePassword} disabled={loading} style={{ marginTop: 8 }}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={18} color="#EF4444" />
                        </View>
                        <Text style={[styles.cardTitle, { color: '#EF4444' }]}>Delete Account</Text>
                    </View>
                    <Text style={styles.cardDesc}>
                        Permanently delete your account and all of your content. This action cannot be undone.
                    </Text>
                    <TouchableOpacity
                        style={[styles.deleteBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}
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
        const getTitle = () => {
            switch (currentView) {
                case 'account': return 'Account Information';
                case 'addresses': return 'Saved Addresses';
                case 'orders': return 'Order History';
                case 'security': return 'Security & Privacy';
                default: return '';
            }
        };

        return (
            <View style={styles.screen}>
                <View style={styles.subPageHeader}>
                    <TouchableOpacity
                        onPress={() => onViewChange('list')}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.subPageTitle}>{getTitle()}</Text>
                </View>

                <View style={{ flex: 1 }}>
                    {currentView === 'account' && <EditProfileView />}
                    {currentView === 'addresses' && <AddressesView />}
                    {currentView === 'orders' && <OrdersView />}
                    {currentView === 'security' && <SecurityView />}
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.screenTitle}>Settings</Text>

            {/* Profile Section */}
            <TouchableOpacity
                style={styles.profileCard}
                activeOpacity={0.8}
                onPress={() => onViewChange('account')}
            >
                <View style={styles.profileInner}>
                    <View style={styles.profileAvatarLarge}>
                        {user?.avatar ? (
                            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                        ) : (
                            <User color="#fff" size={32} />
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                        <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
                    </View>
                    <View style={styles.editBadge}>
                        <Text style={styles.editBadgeText}>EDIT</Text>
                    </View>
                </View>
            </TouchableOpacity>

            <Text style={styles.sectionHeader}>Preferences</Text>

            <View style={styles.settingsGroup}>
                {[
                    { icon: MapPin, label: 'Saved Addresses', action: () => onViewChange('addresses'), color: '#fff', bg: '#007AFF' },
                    { icon: Clock, label: 'Order History', action: () => onViewChange('orders'), color: '#fff', bg: '#FF9500' },
                    { icon: Shield, label: 'Security & Privacy', action: () => onViewChange('security'), color: '#fff', bg: '#34C759' },
                ].map((item, i, arr) => (
                    <React.Fragment key={i}>
                        <TouchableOpacity style={styles.settingItem} onPress={item.action}>
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                                    {/* @ts-ignore */}
                                    <item.icon size={18} color={item.color} />
                                </View>
                                <Text style={styles.settingLabel}>{item.label}</Text>
                            </View>
                            <ChevronRight size={18} color="#C7C7CC" />
                        </TouchableOpacity>
                        {i < arr.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                ))}
            </View>

            <Text style={styles.sectionHeader}>Account</Text>

            <View style={styles.settingsGroup}>
                <TouchableOpacity style={styles.settingItem} onPress={logout}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#FF3B30' }]}>
                            <LogOut size={18} color="#fff" />
                        </View>
                        <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>Log Out</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <Text style={styles.versionText}>Version 1.0.2 (Build 204)</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F2F2F7' },
    screenTitle: {
        color: '#111827',
        fontSize: 34,
        fontFamily: 'Satoshi-Bold',
        letterSpacing: -0.5,
        marginHorizontal: 20,
        marginTop: 60,
        marginBottom: 20
    },
    subPageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: '#F2F2F7',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        gap: 12
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    subPageTitle: {
        fontSize: 20,
        fontFamily: 'Satoshi-Bold',
        color: '#111827'
    },

    // Profile Card
    profileCard: {
        marginHorizontal: 20,
        marginBottom: 32,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
    },
    profileInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileAvatarLarge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#1C39BB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 }
    },
    avatarImage: { width: 72, height: 72, borderRadius: 36 },
    profileInfo: { flex: 1 },
    profileName: {
        color: '#111827',
        fontSize: 20,
        fontFamily: 'Satoshi-Bold',
        letterSpacing: -0.5,
        marginBottom: 4
    },
    profileEmail: {
        color: '#6B7280',
        fontSize: 15,
        fontFamily: 'Satoshi-Medium'
    },
    editBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        marginLeft: 8
    },
    editBadgeText: {
        color: '#111827',
        fontSize: 12,
        fontFamily: 'Satoshi-Bold',
        letterSpacing: 0.5
    },

    // Settings Groups
    sectionHeader: {
        fontSize: 14,
        fontFamily: 'Satoshi-Bold',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginHorizontal: 32,
        marginBottom: 10
    },
    settingsGroup: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 32,
        overflow: 'hidden'
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        backgroundColor: '#fff'
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 10, // Squircle
        alignItems: 'center',
        justifyContent: 'center'
    },
    settingLabel: {
        color: '#111827',
        fontSize: 16,
        fontFamily: 'Satoshi-Medium',
        letterSpacing: -0.2
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginLeft: 64
    },
    versionText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 13,
        fontFamily: 'Satoshi-Medium',
        marginTop: -16,
        marginBottom: 40
    },

    // Security Styles
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
    cardDesc: { color: '#8E8E93', marginBottom: 16, lineHeight: 20 },
    deleteBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#FF3B30' },
    deleteBtnText: { color: '#FF3B30', fontWeight: '700', fontSize: 15 },
});

export default SettingsView;
