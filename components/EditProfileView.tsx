
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input } from './UI';
import { useCartStore } from '../store';

const EditProfileView = () => {
    const { user, updateProfile } = useCartStore();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    const handleSave = () => {
        if (!name || !email) {
            Alert.alert('Error', 'Name and Email are required.');
            return;
        }
        updateProfile({ name, email });
        Alert.alert('Success', 'Profile updated successfully.');
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Input
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Input
                            label="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <Button size="lg" onPress={handleSave} style={{ marginTop: 24 }}>
                        Save Changes
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
    },
    inputGroup: {
        marginBottom: 16,
    }
});

export default EditProfileView;
