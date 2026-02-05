
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Button, Input } from './UI';
import { useCartStore } from '../store';
import * as ImagePicker from 'expo-image-picker';
import { User, Camera } from 'lucide-react-native';

const EditProfileView = () => {
    const { user, updateProfile } = useCartStore();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [isSaving, setIsSaving] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name || !email) {
            Alert.alert('Error', 'Name and Email are required.');
            return;
        }

        setIsSaving(true);
        try {
            await updateProfile({ name, email, avatar });
            Alert.alert('Success', 'Profile updated successfully.');
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarContainer} activeOpacity={0.8}>
                        {avatar ? (
                            <Image source={{ uri: avatar }} key={avatar} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <User size={48} color="#fff" />
                            </View>
                        )}
                        <View style={styles.cameraBtn}>
                            <Camera size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickImage}>
                        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formCard}>
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
                </View>

                <Button
                    size="lg"
                    onPress={handleSave}
                    disabled={isSaving}
                    style={{ marginTop: 24, shadowColor: '#1C39BB', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } }}
                >
                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                </Button>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    avatarContainer: {
        marginBottom: 16,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#1C39BB',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#fff',
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#000',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff'
    },
    changePhotoText: {
        fontSize: 15,
        color: '#1C39BB',
        fontFamily: 'Satoshi-Bold',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 1,
    },
    inputGroup: {
        marginBottom: 20,
    }
});


export default EditProfileView;
