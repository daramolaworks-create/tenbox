import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input, Card } from './UI';
import { useCartStore } from '../store';

const ChangePasswordView: React.FC = () => {
    const { updatePassword } = useCartStore();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please enter a new password.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(password);
            Alert.alert('Success', 'Password updated successfully.');
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>
                <Card>
                    <View style={{ gap: 16 }}>
                        <Input
                            label="New Password"
                            placeholder="Enter new password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <Input
                            label="Confirm Password"
                            placeholder="Confirm new password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />

                        <Button size="lg" onPress={handleUpdate} disabled={loading} style={{ marginTop: 8 }}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </View>
                </Card>
                <Text style={{ textAlign: 'center', color: '#8E8E93', fontSize: 13, marginTop: 24 }}>
                    Your password must be at least 6 characters long.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChangePasswordView;
