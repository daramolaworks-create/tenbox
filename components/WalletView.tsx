import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '../store';
import { Input } from './UI';
import { Wallet, ArrowRight, Building, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const WalletView = () => {
    const { user, requestWithdrawal } = useCartStore();
    const [amount, setAmount] = useState('');
    const [bankDetails, setBankDetails] = useState('');
    const [loading, setLoading] = useState(false);

    const balance = user?.walletBalance || 0;

    const handleWithdraw = async () => {
        const withdrawAmount = parseFloat(amount);

        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
            return;
        }
        if (withdrawAmount > balance) {
            Alert.alert('Insufficient Funds', 'You cannot withdraw more than your current balance.');
            return;
        }
        if (!bankDetails.trim()) {
            Alert.alert('Required', 'Please enter your bank account details.');
            return;
        }

        setLoading(true);
        try {
            const success = await requestWithdrawal(withdrawAmount, bankDetails);
            if (success) {
                Alert.alert('Success', 'Withdrawal requested. We will credit it to your bank account within 24 hours.');
                setAmount('');
                setBankDetails('');
            } else {
                Alert.alert('Error', 'Failed to process withdrawal request.');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Next-Gen Blue Card */}
            <View style={styles.cardContainer}>
                <LinearGradient
                    colors={['#1C39BB', '#4361EE', '#3A0CA3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.premiumCard}
                >
                    {/* Decorative abstract shapes */}
                    <View style={styles.shapeOne} />
                    <View style={styles.shapeTwo} />
                    <View style={styles.shapeThree} />

                    <View style={styles.balanceHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Wallet size={16} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.balanceLabel}>Shopper Balance</Text>
                        </View>
                        <View style={styles.earnBadge}>
                            <Zap size={12} color="#FBBF24" />
                            <Text style={styles.earnText}>1% Cashback</Text>
                        </View>
                    </View>

                    <View style={styles.balanceBody}>
                        <Text style={styles.currencySymbol}>$</Text>
                        <Text style={styles.balanceAmount}>
                            {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                    </View>

                    <View style={styles.cardFooter}>
                        <Text style={styles.balanceHelp}>Earn everyday by shopping for others.</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Withdrawal Section */}
            <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Withdraw Funds</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Amount to Withdraw</Text>
                    <View style={styles.iconInput}>
                        <Text style={styles.amountPrefix}>$</Text>
                        <Input
                            placeholder="0.00"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            style={styles.inputWithIcon}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Bank Account Details</Text>
                    <View style={styles.iconInput}>
                        <Building size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <Input
                            placeholder="Acct No. & Routing"
                            value={bankDetails}
                            onChangeText={setBankDetails}
                            style={styles.inputWithIcon}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.pillButton, loading && styles.pillButtonDisabled]}
                    onPress={handleWithdraw}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={styles.pillButtonContent}>
                            <Text style={styles.buttonText}>Transfer to Bank</Text>
                            <ArrowRight size={18} color="#FFF" />
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6'
    },
    scrollContent: {
        paddingVertical: 24,
        paddingBottom: 80
    },

    // Next-Gen Blue Card
    cardContainer: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    premiumCard: {
        borderRadius: 24,
        padding: 24,
        paddingTop: 28,
        shadowColor: '#1C39BB',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 200,
        justifyContent: 'space-between',
    },
    // Decorative Abstract Shapes
    shapeOne: {
        position: 'absolute',
        top: -60,
        right: -40,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    shapeTwo: {
        position: 'absolute',
        bottom: -40,
        left: -40,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    shapeThree: {
        position: 'absolute',
        bottom: 20,
        right: 40,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },

    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    earnBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    earnText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    balanceLabel: {
        fontSize: 14,
        fontFamily: 'Satoshi-Medium',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 0.5,
    },
    balanceBody: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    currencySymbol: {
        fontSize: 24,
        fontFamily: 'Satoshi-Bold',
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 6,
        marginRight: 2,
    },
    balanceAmount: {
        fontSize: 48,
        fontFamily: 'Satoshi-Bold',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    cardFooter: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.15)',
    },
    balanceHelp: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        fontFamily: 'Satoshi-Medium',
    },

    // Form Styles
    formSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 24,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 16,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'Satoshi-Bold',
        color: '#111827',
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: 'Satoshi-Bold',
        color: '#4B5563',
        marginBottom: 8,
    },
    iconInput: {
        position: 'relative',
        justifyContent: 'center',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
    },
    amountPrefix: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
        fontSize: 20,
        fontFamily: 'Satoshi-Bold',
        color: '#111827',
    },
    inputWithIcon: {
        paddingLeft: 44,
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        height: 56,
        fontSize: 16,
        color: '#111827',
        fontFamily: 'Satoshi-Medium',
    },

    // Button Styles
    pillButton: {
        marginTop: 12,
        borderRadius: 100,
        backgroundColor: '#1C39BB', // Our main blue
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1C39BB',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 4,
    },
    pillButtonDisabled: {
        opacity: 0.7,
        shadowOpacity: 0,
    },
    pillButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Satoshi-Bold',
    }
});

export default WalletView;
