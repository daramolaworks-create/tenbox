
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input } from './UI';
import { CheckCircle } from 'lucide-react-native';
import { useCartStore } from '../store';

interface AuthScreenProps {
    onLogin: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgot, setIsForgot] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const { login, signup, resetPassword } = useCartStore();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            alert('Please enter your email.');
            return;
        }

        if (isForgot) {
            setLoading(true);
            try {
                await resetPassword(email);
                alert('Password reset link sent! Check your email.');
                setIsForgot(false);
                setIsLogin(true);
            } catch (error: any) {
                alert(error.message || 'Failed to send reset link.');
            } finally {
                setLoading(false);
            }
            return;
        }

        if (!password) {
            alert('Please enter your password.');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password, name);
                alert('Account created! You are now logged in.');
            }
            onLogin(); // Callback to notify App (optional if using reactive state)
        } catch (error: any) {
            console.log(error);
            alert(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
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
                        {!isForgot ? (
                            <View style={styles.tabRow}>
                                <TouchableOpacity style={[styles.tab, isLogin && styles.activeTab]} onPress={() => setIsLogin(true)}>
                                    <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Log In</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.tab, !isLogin && styles.activeTab]} onPress={() => setIsLogin(false)}>
                                    <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{ fontSize: 20, fontWeight: '700', textAlign: 'center' }}>Reset Password</Text>
                                <Text style={{ textAlign: 'center', color: '#8E8E93', marginTop: 8 }}>Enter your email to receive a reset link.</Text>
                            </View>
                        )}

                        <View style={styles.form}>
                            {!isLogin && !isForgot && (
                                <Input placeholder="Full Name" value={name} onChangeText={setName} />
                            )}
                            <Input placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

                            {!isForgot && (
                                <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
                            )}

                            {isLogin && !isForgot && (
                                <TouchableOpacity style={styles.forgotBtn} onPress={() => setIsForgot(true)}>
                                    <Text style={styles.forgotText}>Forgot Password?</Text>
                                </TouchableOpacity>
                            )}

                            <Button size="lg" onPress={handleSubmit} style={styles.submitBtn} disabled={loading}>
                                {loading ? 'Please wait...' : (isForgot ? 'Send Reset Link' : (isLogin ? 'Log In' : 'Create Account'))}
                            </Button>

                            {isForgot && (
                                <TouchableOpacity style={{ alignSelf: 'center', marginTop: 16 }} onPress={() => setIsForgot(false)}>
                                    <Text style={{ color: '#1C39BB', fontWeight: '600' }}>Back to Login</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {!isForgot && (
                            <>
                                <View style={styles.divider}>
                                    <View style={styles.line} />
                                    <Text style={styles.orText}>Or continue with</Text>
                                    <View style={styles.line} />
                                </View>

                                <View style={styles.socialCol}>
                                    <TouchableOpacity style={styles.socialBtn} onPress={async () => {
                                        setLoading(true);
                                        try {
                                            await useCartStore.getState().loginWithGoogle();
                                            onLogin();
                                        } catch (e) {
                                            console.log(e);
                                            // alert('Google Login cancelled or failed');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}>
                                        <Image source={require('../assets/logos/google.png')} style={{ width: 24, height: 24 }} />
                                        <Text style={styles.socialText}>Continue with Google</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#000' }]} onPress={async () => {
                                        setLoading(true);
                                        try {
                                            await useCartStore.getState().loginWithApple();
                                            onLogin();
                                        } catch (e) {
                                            console.log(e);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}>
                                        <Image source={require('../assets/logos/apple.png')} style={{ width: 20, height: 24, tintColor: '#fff' }} resizeMode="contain" />
                                        <Text style={[styles.socialText, { color: '#fff' }]}>Continue with Apple</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>

                    <Text style={styles.footerText}>
                        By continuing, you agree to Tenbox's <Text style={{ fontWeight: '700' }}>Terms</Text> and <Text style={{ fontWeight: '700' }}>Privacy Policy</Text>.
                    </Text>

                </View>
            </KeyboardAvoidingView >
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    flex1: { flex: 1 },
    content: { flex: 1, padding: 24, justifyContent: 'center' },
    logoSection: { alignItems: 'center', marginBottom: 40 },
    logo: { width: 160, height: 48 },
    subtitle: { color: '#8E8E93', fontSize: 16, marginTop: 12 },

    card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },

    tabRow: { flexDirection: 'row', marginBottom: 24, backgroundColor: '#F2F2F7', padding: 4, borderRadius: 12 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
    tabText: { color: '#8E8E93', fontWeight: '600', fontSize: 14 },
    activeTabText: { color: '#000', fontWeight: '700' },

    form: { gap: 16 },
    forgotBtn: { alignSelf: 'flex-end' },
    forgotText: { color: '#1C39BB', fontSize: 13, fontWeight: '600' },
    submitBtn: { marginTop: 8, shadowColor: '#1C39BB', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },

    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
    line: { flex: 1, height: 1, backgroundColor: '#E5E5EA' },
    orText: { marginHorizontal: 12, color: '#8E8E93', fontSize: 12, fontWeight: '600' },

    socialCol: { gap: 12 },
    socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E5EA', gap: 12 },
    socialText: { fontSize: 15, fontWeight: '600', color: '#000' },

    footerText: { textAlign: 'center', color: '#8E8E93', fontSize: 12, marginTop: 40, paddingHorizontal: 20, lineHeight: 18 }
});

export default AuthScreen;
