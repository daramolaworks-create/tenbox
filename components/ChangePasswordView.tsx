import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Button, Input, Card } from './UI';
import { useCartStore } from '../store';
import { Check, X, ShieldCheck } from 'lucide-react-native';

const ChangePasswordView: React.FC = () => {
    const { updatePassword } = useCartStore();
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation States
    const hasMinLength = password.length >= 6;
    const isDifferent = password !== currentPassword && currentPassword.length > 0;
    const isMatching = password === confirmPassword && password.length > 0;

    // Allow update if all conditions met (ignoring isDifferent check if current is empty locally, but logic requires logic)
    // Actually, we can't check 'isDifferent' reliably if we don't know the REAL current password, 
    // but we can check against the input field.
    const canSubmit = hasMinLength && isMatching && currentPassword.length > 0 && password.length > 0;

    const handleUpdate = async () => {
        if (!canSubmit) return;

        setLoading(true);
        try {
            await updatePassword(password, currentPassword);
            Alert.alert('Success', 'Password updated successfully.');
            // Reset fields
            setCurrentPassword('');
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    const RequirementItem = ({ label, met }: { label: string; met: boolean }) => (
        <View style={styles.reqItem}>
            <View style={[styles.reqIcon, { backgroundColor: met ? '#34C759' : '#E5E5EA' }]}>
                {met ? <Check size={12} color="#fff" strokeWidth={3} /> : <X size={12} color="#8E8E93" strokeWidth={3} />}
            </View>
            <Text style={[styles.reqText, met && { color: '#000', fontWeight: '500' }]}>{label}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>

                <Card style={styles.formCard}>
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <ShieldCheck size={24} color="#1C39BB" />
                        </View>
                        <View>
                            <Text style={styles.title}>Secure Your Account</Text>
                            <Text style={styles.subtitle}>Create a strong, unique password.</Text>
                        </View>
                    </View>

                    <View style={{ gap: 16 }}>
                        <Input
                            label="Current Password"
                            placeholder="Enter current password"
                            secureTextEntry
                            secureTextToggle
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        <Input
                            label="New Password"
                            placeholder="Enter new password"
                            secureTextEntry
                            secureTextToggle
                            value={password}
                            onChangeText={setPassword}
                        />
                        <Input
                            label="Confirm New Password"
                            placeholder="Confirm new password"
                            secureTextEntry
                            secureTextToggle
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    <View style={styles.requirements}>
                        <Text style={styles.reqTitle}>PASSWORD REQUIREMENTS</Text>
                        <RequirementItem label="At least 6 characters" met={hasMinLength} />
                        <RequirementItem label="Matches confirmation" met={isMatching} />
                        {currentPassword.length > 0 && (
                            <RequirementItem label="Different from current" met={password !== currentPassword} />
                        )}
                    </View>

                    <Button
                        size="lg"
                        onPress={handleUpdate}
                        disabled={loading || !canSubmit}
                        style={{ marginTop: 24, opacity: canSubmit ? 1 : 0.6 }}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </Card>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    formCard: {
        padding: 24,
        margin: 20, // Add margin to float it slightly
        borderRadius: 24
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 16
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F2F4FF',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000'
    },
    subtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2
    },
    requirements: {
        marginTop: 24,
        backgroundColor: '#F9F9F9',
        padding: 16,
        borderRadius: 16,
        gap: 8
    },
    reqTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#8E8E93',
        marginBottom: 4,
        letterSpacing: 0.5
    },
    reqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    reqIcon: {
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center'
    },
    reqText: {
        fontSize: 13,
        color: '#8E8E93'
    }
});

export default ChangePasswordView;
