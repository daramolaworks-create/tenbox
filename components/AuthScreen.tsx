
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input } from './UI';
import { CheckCircle } from 'lucide-react-native';

interface AuthScreenProps {
    onLogin: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = () => {
        // Mock validation
        if (email && password) {
            onLogin();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
                <View style={styles.content}>

                    <View style={styles.logoSection}>
                        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.subtitle}>Global logistics at your fingertips.</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.tabRow}>
                            <TouchableOpacity style={[styles.tab, isLogin && styles.activeTab]} onPress={() => setIsLogin(true)}>
                                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Log In</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.tab, !isLogin && styles.activeTab]} onPress={() => setIsLogin(false)}>
                                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            {!isLogin && (
                                <Input placeholder="Full Name" value={name} onChangeText={setName} />
                            )}
                            <Input placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                            <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

                            {isLogin && (
                                <TouchableOpacity style={styles.forgotBtn}>
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            )}

                            <Button size="lg" onPress={handleSubmit} style={styles.submitBtn}>
                                {isLogin ? 'Log In' : 'Create Account'}
                            </Button>
                        </View>

                        <View style={styles.divider}>
                            <View style={styles.line} />
                            <Text style={styles.orText}>Or continue with</Text>
                            <View style={styles.line} />
                        </View>

                        <View style={styles.socialCol}>
                            <TouchableOpacity style={styles.socialBtn} onPress={onLogin}>
                                <Image source={require('../assets/logos/google.png')} style={{ width: 24, height: 24 }} />
                                <Text style={styles.socialText}>Continue with Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#000' }]} onPress={onLogin}>
                                <Image source={require('../assets/logos/apple.png')} style={{ width: 20, height: 24, tintColor: '#fff' }} resizeMode="contain" />
                                <Text style={[styles.socialText, { color: '#fff' }]}>Continue with Apple</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.footerText}>
                        By continuing, you agree to Tenbox's <Text style={{ fontWeight: '700' }}>Terms</Text> and <Text style={{ fontWeight: '700' }}>Privacy Policy</Text>.
                    </Text>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    flex1: { flex: 1 },
    content: { flex: 1, padding: 24, justifyContent: 'center' },
    logoSection: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 160, height: 48 },
    subtitle: { color: '#8E8E93', fontSize: 16, marginTop: 12, fontFamily: 'ZalandoMedium' },

    card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },

    tabRow: { flexDirection: 'row', marginBottom: 24, backgroundColor: '#F2F2F7', padding: 4, borderRadius: 12 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
    tabText: { color: '#8E8E93', fontWeight: '600', fontSize: 14, fontFamily: 'ZalandoBold' },
    activeTabText: { color: '#000', fontWeight: '700', fontFamily: 'ZalandoBold' },

    form: { gap: 16 },
    forgotBtn: { alignSelf: 'flex-end' },
    forgotText: { color: '#0223E6', fontSize: 13, fontWeight: '600', fontFamily: 'ZalandoBold' },
    submitBtn: { marginTop: 8, shadowColor: '#0223E6', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },

    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    line: { flex: 1, height: 1, backgroundColor: '#E5E5EA' },
    orText: { marginHorizontal: 12, color: '#8E8E93', fontSize: 12, fontWeight: '600', fontFamily: 'ZalandoBold' },

    socialCol: { gap: 12 },
    socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E5EA', gap: 12 },
    socialText: { fontSize: 15, fontWeight: '600', color: '#000', fontFamily: 'ZalandoBold' },

    footerText: { textAlign: 'center', color: '#8E8E93', fontSize: 12, marginTop: 40, paddingHorizontal: 20, lineHeight: 18, fontFamily: 'ZalandoRegular' }
});

export default AuthScreen;
