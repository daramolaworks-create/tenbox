
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react-native';
import { Button, Card } from './UI';
import { CartItem } from '../types';

interface ImportPreviewModalProps {
  url: string;
  initialTitle?: string;
  initialImage?: string;
  initialPrice?: string;
  initialCurrency?: string;
  onClose: () => void;
  onConfirm: (item: CartItem) => void;
}

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({ url, initialTitle, initialImage, initialPrice, initialCurrency, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Parse initial data once
  const parseInitialData = () => {
    const lowUrl = url.toLowerCase();

    // 1. Currency Logic
    let guessedCurrency = initialCurrency;
    if (!guessedCurrency) {
      if (lowUrl.includes('.co.uk') || lowUrl.includes('amazon.co.uk')) guessedCurrency = 'GBP';
      else if (lowUrl.includes('.ae') || lowUrl.includes('amazon.ae')) guessedCurrency = 'AED';
      else if (lowUrl.includes('.com') || lowUrl.includes('amazon.com')) guessedCurrency = 'USD';
      else guessedCurrency = 'USD'; // Default
    }

    // 2. Parsed Price Logic
    let priceNum = 0;
    if (initialPrice) {
      // Clean price string
      let clean = initialPrice.replace(/[^0-9.,]/g, '');
      clean = clean.replace(/,/g, '');
      const parsed = parseFloat(clean);
      if (!isNaN(parsed)) priceNum = parsed;
    }

    // 3. Store Name Logic
    let store = 'Global Store';
    if (lowUrl.includes('amazon')) {
      if (lowUrl.includes('.co.uk')) store = 'Amazon UK';
      else if (lowUrl.includes('.ae')) store = 'Amazon UAE';
      else store = 'Amazon US';
    } else if (lowUrl.includes('apple')) {
      store = 'Apple';
    } else if (lowUrl.includes('noon')) {
      store = 'Noon';
    } else if (lowUrl.includes('namshi')) {
      store = 'Namshi';
    } else if (lowUrl.includes('zara')) {
      store = 'Zara';
    }

    return {
      store,
      title: initialTitle || 'Imported Item',
      image: initialImage || 'https://via.placeholder.com/300',
      price: priceNum,
      currency: guessedCurrency
    };
  };

  const [productData] = useState(parseInitialData());
  const [priceInput, setPriceInput] = useState(productData.price > 0 ? productData.price.toString() : '');
  const [currency, setCurrency] = useState(productData.currency);

  const currencySymbol = currency === 'GBP' ? '£' : currency === 'AED' ? 'AED ' : '$';

  const handleAddToCart = () => {
    const finalPrice = parseFloat(priceInput);

    if (isNaN(finalPrice) || finalPrice <= 0) {
      alert("Please enter a valid price");
      return;
    }

    onConfirm({
      id: Math.random().toString(36).substring(2, 11),
      title: productData.title,
      image: productData.image,
      store: productData.store,
      price: finalPrice,
      quantity,
      notes,
      url,
      currency: productData.currency // Ensure currency is passed
    });
  };

  return (
    <Modal
      animationType="slide"
      visible={true}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
      transparent={Platform.OS !== 'ios'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          <SafeAreaView>
            <View style={styles.header}>
              <Text style={styles.title}>Review Item</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color="#71717a" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              <View style={styles.productRow}>
                <Image source={{ uri: productData.image }} style={styles.image} />
                <View style={styles.info}>
                  <View style={styles.badge}><Text style={styles.badgeText}>{productData.store}</Text></View>
                  <Text style={styles.productTitle}>{productData.title}</Text>

                  <View style={styles.priceContainer}>
                    <Text style={styles.currencyPrefix}>{currencySymbol}</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={priceInput}
                      onChangeText={setPriceInput}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor="#52525b"
                    />
                  </View>
                  <Text style={styles.verificationText}>* Final price verified at purchase</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>QUANTITY</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.stepBtn}>
                    <Minus size={18} color="#d4d4d8" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.stepBtn}>
                    <Plus size={18} color="#d4d4d8" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>ORDER NOTES</Text>
                <TextInput
                  multiline
                  style={styles.textArea}
                  placeholder="Size, color, or specific instructions..."
                  placeholderTextColor="#52525b"
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              <Button style={styles.submitBtn} size="lg" onPress={handleAddToCart}>
                Confirm & Add to Cart
              </Button>
            </ScrollView>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#09090b', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  closeBtn: { backgroundColor: '#18181b', padding: 10, borderRadius: 25 },
  scrollBody: { paddingBottom: 40 },
  productRow: { flexDirection: 'row', gap: 16, marginBottom: 28 },
  image: { width: 110, height: 110, borderRadius: 20, backgroundColor: '#18181b' },
  info: { flex: 1, justifyContent: 'center' },
  badge: { backgroundColor: 'rgba(37, 99, 235, 0.15)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  badgeText: { color: '#60a5fa', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  productTitle: { color: '#fff', fontSize: 20, fontWeight: '800', lineHeight: 24 },
  // New Styles
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  currencyPrefix: { color: '#60a5fa', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  priceInput: { color: '#60a5fa', fontSize: 24, fontWeight: '900', letterSpacing: -0.5, minWidth: 100, padding: 0 },
  verificationText: { color: '#71717a', fontSize: 10, fontWeight: '600', marginTop: 6, opacity: 0.8 },

  section: { marginBottom: 24 },
  label: { color: '#52525b', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#18181b', padding: 8, borderRadius: 18, width: 160 },
  stepBtn: { backgroundColor: '#27272a', padding: 12, borderRadius: 14 },
  qtyText: { color: '#fff', fontSize: 20, fontWeight: '900', width: 35, textAlign: 'center' },
  textArea: { backgroundColor: '#18181b', color: '#fff', padding: 18, borderRadius: 18, minHeight: 120, textAlignVertical: 'top', fontSize: 16 },
  submitBtn: { marginTop: 12 }
});

export default ImportPreviewModal;
