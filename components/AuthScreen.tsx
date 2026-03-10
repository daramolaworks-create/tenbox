import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    const [accountType, setAccountType] = useState<'personal' | 'shopper'>('personal');

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
                await signup(email, password, name, accountType);
                alert('Account created! You are now logged in.');
            }
            onLogin();
        } catch (error: any) {
            console.log(error);
            if (error.message === 'CONFIRMATION_REQUIRED') {
                alert('Account created! Please check your email and click the confirmation link to activate your account.');
                setIsLogin(true);
                return;
            }
            alert(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {isForgot ? 'Reset Password' : (isLogin ? 'Welcome back' : 'Create an account')}
                        </Text>
                        <Text style={styles.subtitle}>
                            {isForgot
                                ? 'Enter your email to receive a reset link.'
                                : (isLogin ? 'Log in to manage your global shipments.' : 'Join Tenbox to shop globally with ease.')}
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        {!isLogin && !isForgot && (
                            <View style={styles.inputGroup}>
                                <Input placeholder="Full Name" value={name} onChangeText={setName} />

                                <View style={styles.spacer} />

                                <Text style={styles.accountTypeLabel}>Account Type</Text>
                                <View style={styles.accountTypeRow}>
                                    <TouchableOpacity
                                        style={[styles.accountTypeBtn, accountType === 'personal' && styles.accountTypeBtnActive]}
                                        onPress={() => setAccountType('personal')}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.accountTypeText, accountType === 'personal' && styles.accountTypeTextActive]}>Personal Use</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.accountTypeBtn, accountType === 'shopper' && styles.accountTypeBtnActive]}
                                        onPress={() => setAccountType('shopper')}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.accountTypeText, accountType === 'shopper' && styles.accountTypeTextActive]}>Personal Shopper</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Input placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                        </View>

                        {!isForgot && (
                            <View style={styles.inputGroup}>
                                <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} secureTextToggle={true} />
                            </View>
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
                            <TouchableOpacity style={styles.backToLoginBtn} onPress={() => setIsForgot(false)}>
                                <Text style={styles.backToLoginText}>Back to Login</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {!isForgot && (
                        <View style={styles.bottomSection}>
                            <View style={styles.divider}>
                                <View style={styles.line} />
                                <Text style={styles.orText}>Or continue with</Text>
                                <View style={styles.line} />
                            </View>

                            <TouchableOpacity
                                style={styles.socialBtn}
                                activeOpacity={0.7}
                                onPress={async () => {
                                    setLoading(true);
                                    try {
                                        await useCartStore.getState().loginWithGoogle();
                                        onLogin();
                                    } catch (e: any) {
                                        console.log(e);
                                        Alert.alert('Login Failed', e?.message || 'Could not sign in with Google. Please try again.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}>
                                <Image source={require('../assets/logos/google.png')} style={{ width: 22, height: 22 }} />
                                <Text style={styles.socialText}>Continue with Google</Text>
                            </TouchableOpacity>

                            <View style={styles.switchModeContainer}>
                                <Text style={styles.switchModeText}>
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                </Text>
                                <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setIsForgot(false); }}>
                                    <Text style={styles.switchModeLink}>
                                        {isLogin ? 'Sign Up' : 'Log In'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    flex1: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32, justifyContent: 'center' },

    header: { marginBottom: 40, alignItems: 'flex-start' },
    logo: { width: 140, height: 42, marginBottom: 32, marginLeft: -4 },
    title: { fontFamily: 'Satoshi-Bold', fontSize: 32, color: '#111827', letterSpacing: -0.5, marginBottom: 12 },
    subtitle: { fontFamily: 'Satoshi-Medium', fontSize: 16, color: '#6B7280', lineHeight: 24 },

    formContainer: { gap: 16 },
    inputGroup: { width: '100%' },
    spacer: { height: 20 },

    accountTypeLabel: { fontFamily: 'Satoshi-Bold', fontSize: 13, color: '#374151', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    accountTypeRow: { flexDirection: 'row', gap: 10, backgroundColor: '#F9FAFB', padding: 6, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6' },
    accountTypeBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 16 },
    accountTypeBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    accountTypeText: { fontFamily: 'Satoshi-Medium', fontSize: 14, color: '#9CA3AF' },
    accountTypeTextActive: { color: '#111827', fontFamily: 'Satoshi-Bold' },

    forgotBtn: { alignSelf: 'flex-end', marginTop: -6, paddingVertical: 4 },
    forgotText: { fontFamily: 'Satoshi-Bold', color: '#1C39BB', fontSize: 14 },

    submitBtn: { shadowColor: '#1C39BB', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, marginTop: 16 },

    backToLoginBtn: { alignSelf: 'center', marginTop: 24, padding: 8 },
    backToLoginText: { fontFamily: 'Satoshi-Bold', color: '#1C39BB', fontSize: 15 },

    bottomSection: { marginTop: 40 },
    divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
    line: { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
    orText: { marginHorizontal: 16, color: '#9CA3AF', fontSize: 13, fontFamily: 'Satoshi-Medium' },

    socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1.5, borderColor: '#F3F4F6', gap: 12 },
    socialText: { fontSize: 16, fontFamily: 'Satoshi-Bold', color: '#111827' },

    switchModeContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
    switchModeText: { fontFamily: 'Satoshi-Medium', fontSize: 15, color: '#6B7280' },
    switchModeLink: { fontFamily: 'Satoshi-Bold', fontSize: 15, color: '#1C39BB' }
});

export default AuthScreen;
