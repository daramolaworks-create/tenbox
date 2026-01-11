
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { Button, Input } from './UI';
import { useCartStore } from '../store';
import * as ImagePicker from 'expo-image-picker';
import { User, Camera } from 'lucide-react-native';

const EditProfileView = () => {
    const { user, updateProfile } = useCartStore();
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [avatar, setAvatar] = useState(user.avatar || '');

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

    const handleSave = () => {
        if (!name || !email) {
            Alert.alert('Error', 'Name and Email are required.');
            return;
        }
        updateProfile({ name, email, avatar });
        Alert.alert('Success', 'Profile updated successfully.');
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={{ padding: 20, alignItems: 'center' }}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <User size={40} color="#fff" />
                        </View>
                    )}
                    <View style={styles.cameraIcon}>
                        <Camera size={16} color="#fff" />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={pickImage}>
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
            </View>

            <View style={{ padding: 20, paddingTop: 0 }}>
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
    avatarContainer: {
        marginBottom: 12,
        position: 'relative'
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#0223E6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#000',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff'
    },
    changePhotoText: {
        fontSize: 15,
        color: '#0223E6',
        fontWeight: '600',
        marginBottom: 20,
        fontFamily: 'ZalandoBold'
    },
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
