
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input } from './UI';

const SupportView = () => {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        Alert.alert('Message Sent', 'Our team will get back to you within 24 hours.');
        setMessage('');
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={{ padding: 20 }}>
                <Text style={styles.title}>How can we help?</Text>
                <Text style={styles.sub}>Send us a message and we'll reply to your email.</Text>

                <View style={styles.form}>
                    <View style={styles.textAreaContainer}>
                        <TextInput
                            style={styles.textArea}
                            multiline
                            placeholder="Describe your issue..."
                            placeholderTextColor="#8E8E93"
                            value={message}
                            onChangeText={setMessage}
                        />
                    </View>
                    <Button size="lg" onPress={handleSubmit} disabled={!message}>
                        Submit Ticket
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    sub: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 32,
    },
    form: {
        gap: 20,
    },
    textAreaContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        height: 200,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    textArea: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        textAlignVertical: 'top',
    }
});

export default SupportView;
