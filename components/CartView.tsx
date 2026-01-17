import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react-native';
import { CartItem } from '../types';
import { getStoreRegion, STORE_ADDRESSES } from '../store';
import { Button, Card } from './UI';

interface CartViewProps {
    items: CartItem[];
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    onCheckout: () => void;
    onStartShopping: () => void;
}

const CartView: React.FC<CartViewProps> = ({
    items,
    removeItem,
    updateQuantity,
    onCheckout,
    onStartShopping
}) => {
    const storeRegion = items[0]?.store ? getStoreRegion(items[0].store) : 'USA';
    const currencyConfig = STORE_ADDRESSES[storeRegion] || STORE_ADDRESSES['USA'];
    const currencySymbol = currencyConfig.symbol;

    return (
        <View style={styles.screen}>
            <Text style={styles.screenTitle}>Tenbox Cart</Text>
            <Text style={styles.subText}>{items.length} {items.length === 1 ? 'item' : 'items'} staging for import</Text>

            {items.length === 0 ? (
                <View style={styles.emptyCartContainer}>
                    <ShoppingCart size={64} color="#E5E5EA" />
                    <Text style={styles.emptyText}>Your cart is waiting for items.</Text>
                    <Button variant="outline" style={{ marginTop: 24 }} onPress={onStartShopping}>
                        Start Shopping
                    </Button>
                </View>
            ) : (
                <View style={styles.cartList}>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '65%' }}>
                        {items.map(item => (
                            <Card key={item.id} style={styles.cartItem}>
                                <Image source={{ uri: item.image }} style={styles.cartImg} />
                                <View style={styles.cartInfo}>
                                    <View style={styles.cartItemHeader}>
                                        <Text style={styles.cartStore}>{item.store}</Text>
                                        <TouchableOpacity onPress={() => removeItem(item.id)}>
                                            <Trash2 size={18} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.cartTitle} numberOfLines={1}>{item.title}</Text>
                                    <View style={styles.cartBottom}>
                                        <View style={styles.cartStepper}>
                                            <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: 4 }}>
                                                <Minus size={16} color="#000" />
                                            </TouchableOpacity>
                                            <Text style={styles.cartQty}>{item.quantity}</Text>
                                            <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                                                <Plus size={16} color="#000" />
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={styles.cartPrice}>{currencySymbol}{(item.price * item.quantity).toFixed(2)}</Text>
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </ScrollView>

                    <Card style={styles.checkoutSummary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{currencySymbol}{items.reduce((a, b) => a + (b.price * b.quantity), 0).toFixed(2)}</Text>
                        </View>
                        <Button style={styles.checkoutBtn} size="lg" onPress={onCheckout}>
                            Checkout Now
                        </Button>
                        <Text style={{ textAlign: 'center', fontSize: 11, color: '#8E8E93', marginTop: 12 }}>
                            Prices subject to verification during fulfillment
                        </Text>
                    </Card>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: { flex: 1, padding: 24 },
    screenTitle: { color: '#000', fontSize: 32, fontWeight: '700', letterSpacing: -0.4 },
    subText: { color: '#8E8E93', fontSize: 17, marginTop: 4, fontWeight: '500' },
    emptyCartContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyText: { color: '#8E8E93', textAlign: 'center', marginTop: 12, fontSize: 15 },
    cartList: { flex: 1, marginTop: 20 },
    cartItem: { flexDirection: 'row', padding: 16, gap: 16, marginBottom: 16, shadowOpacity: 0.08 },
    cartImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F2F2F7' },
    cartInfo: { flex: 1, justifyContent: 'space-between' },
    cartItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cartStore: { color: '#1C39BB', fontSize: 12, fontWeight: '600' },
    cartTitle: { color: '#000', fontSize: 16, fontWeight: '600' },
    cartBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cartStepper: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F2F2F7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    cartQty: { color: '#000', fontSize: 14, fontWeight: '700' },
    cartPrice: { color: '#000', fontSize: 16, fontWeight: '700' },
    checkoutSummary: { padding: 24, paddingBottom: 34, marginTop: 'auto', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F2F2F7' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    summaryLabel: { color: '#8E8E93', fontSize: 16, fontWeight: '500' },
    summaryValue: { color: '#000', fontSize: 24, fontWeight: '700' },
    checkoutBtn: { width: '100%', shadowColor: '#1C39BB', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
});

export default CartView;
