import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, SafeAreaView, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { X, User, MapPin, Clock, LogOut, ChevronRight, Bell, Shield, HelpCircle, ChevronLeft } from 'lucide-react-native';
import { useCartStore } from '../store';
import AddressesView from './AddressesView';
import OrdersView from './OrdersView';
import NotificationsView from './NotificationsView';
import SecurityView from './SecurityView';
import SupportView from './SupportView';

import EditProfileView from './EditProfileView';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    onLogout?: () => void;
}

type SettingsView = 'main' | 'addresses' | 'orders' | 'notifications' | 'security' | 'support' | 'editProfile';

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose, onLogout }) => {
    const { user } = useCartStore();
    const [view, setView] = useState<SettingsView>('main');

    const handleNavigate = (newView: SettingsView) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setView(newView);
    };

    const handleBack = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setView('main');
    };

    // --- RENDERERS ---

    const renderHeader = () => {
        const titles: Record<string, string> = {
            main: 'Settings',
            addresses: 'Saved Addresses',
            orders: 'Order History',
            notifications: 'Notifications',
            security: 'Privacy & Security',
            support: 'Help & Support',
            editProfile: 'Edit Profile'
        };

        return (
            <View style={styles.header}>
                {view !== 'main' ? (
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <ChevronLeft size={24} color="#0223E6" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 60 }} />
                )}

                <Text style={styles.headerTitle}>{titles[view] || 'Settings'}</Text>

                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Text style={styles.closeText}>Done</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderMainContent = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.profileSection}>
                <View style={styles.avatar}>
                    {user?.avatar ? (
                        <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                    ) : (
                        <User color="#fff" size={40} />
                    )}
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <TouchableOpacity style={styles.editProfileBtn} onPress={() => handleNavigate('editProfile')}>
                    <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ACCOUNT</Text>
                <TouchableOpacity style={styles.row} onPress={() => handleNavigate('addresses')}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#E5E5EA' }]}>
                            <MapPin size={20} color="#000" />
                        </View>
                        <Text style={styles.rowLabel}>Saved Addresses</Text>
                    </View>
                    <ChevronRight size={20} color="#C7C7CC" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.row} onPress={() => handleNavigate('orders')}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#E5E5EA' }]}>
                            <Clock size={20} color="#000" />
                        </View>
                        <Text style={styles.rowLabel}>Order History</Text>
                    </View>
                    <ChevronRight size={20} color="#C7C7CC" />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>PREFERENCES</Text>
                <TouchableOpacity style={styles.row} onPress={() => handleNavigate('notifications')}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#FF9500' }]}>
                            <Bell size={20} color="#fff" />
                        </View>
                        <Text style={styles.rowLabel}>Notifications</Text>
                    </View>
                    <ChevronRight size={20} color="#C7C7CC" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.row} onPress={() => handleNavigate('security')}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#34C759' }]}>
                            <Shield size={20} color="#fff" />
                        </View>
                        <Text style={styles.rowLabel}>Privacy & Security</Text>
                    </View>
                    <ChevronRight size={20} color="#C7C7CC" />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={styles.row} onPress={() => handleNavigate('support')}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#007AFF' }]}>
                            <HelpCircle size={20} color="#fff" />
                        </View>
                        <Text style={styles.rowLabel}>Support</Text>
                    </View>
                    <ChevronRight size={20} color="#C7C7CC" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Version 1.0.0 (Build 124)</Text>
        </ScrollView>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
            transparent={Platform.OS !== 'ios'}
        >
            <SafeAreaView style={styles.container}>
                {renderHeader()}
                <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
                    {view === 'main' && renderMainContent()}
                    {view === 'addresses' && <AddressesView />}
                    {view === 'orders' && <OrdersView />}
                    {view === 'notifications' && <NotificationsView />}
                    {view === 'security' && <SecurityView />}
                    {view === 'support' && <SupportView />}
                    {view === 'editProfile' && <EditProfileView />}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 60,
    },
    backText: {
        fontSize: 17,
        color: '#0223E6',
        marginLeft: -4,
    },
    closeBtn: {
        width: 60,
        alignItems: 'flex-end',
    },
    closeText: {
        color: '#0223E6',
        fontSize: 17,
        fontWeight: '600',
    },
    content: {
        paddingBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#fff',
        marginBottom: 24,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#0223E6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden'
    },
    avatarImg: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    email: {
        fontSize: 15,
        color: '#8E8E93',
        marginBottom: 16,
    },
    editProfileBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#F2F2F7',
        borderRadius: 16,
    },
    editProfileText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 24,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5EA',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        marginLeft: 20,
        marginTop: 16,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E5EA',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    logoutBtn: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        alignItems: 'center',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5EA',
        marginTop: 12,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
    },
    version: {
        textAlign: 'center',
        color: '#C7C7CC',
        fontSize: 12,
        marginTop: 24,
    }
});

export default SettingsModal;
