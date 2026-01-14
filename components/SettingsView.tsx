import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Clock, LogOut, ChevronRight, User } from 'lucide-react-native';
import { UserProfile } from '../store';
import AddressesView from './AddressesView';
import OrdersView from './OrdersView';
import EditProfileView from './EditProfileView';

export type SettingsSubView = 'list' | 'account' | 'addresses' | 'orders';

interface SettingsViewProps {
    user: UserProfile | null;
    logout: () => void;
    currentView: SettingsSubView;
    onViewChange: (view: SettingsSubView) => void;
}

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
                    <ChevronRight size={24} color="#0223E6" style={{ transform: [{ rotate: '180deg' }] }} />
                    <Text style={{ fontSize: 17, color: '#0223E6', marginLeft: 4, fontWeight: '600' }}>Back to Settings</Text>
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
    profileAvatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0223E6', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#0223E6', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
    editBadge: { position: 'absolute', bottom: -6, backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    editBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
    profileName: { color: '#000', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
    profileEmail: { color: '#8E8E93', fontSize: 15, marginTop: 4 },
    settingsList: { gap: 12 },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderRadius: 20 },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingLabel: { color: '#000', fontSize: 15, fontWeight: '600' },
});

export default SettingsView;
