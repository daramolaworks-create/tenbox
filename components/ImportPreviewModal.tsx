
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
  onClose: () => void;
  onConfirm: (item: CartItem) => void;
}

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({ url, initialTitle, initialImage, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const parseUrl = (u: string) => {
    const lowUrl = u.toLowerCase();
    if (lowUrl.includes('amazon')) return { store: 'Amazon', title: initialTitle || 'Imported Amazon Item', image: initialImage || 'https://picsum.photos/seed/amazon/400/400' };
    if (lowUrl.includes('apple')) return { store: 'Apple', title: initialTitle || 'Imported Apple Item', image: initialImage || 'https://picsum.photos/seed/apple/400/400' };
    return { store: 'Global Store', title: initialTitle || 'Imported Item', image: initialImage || 'https://picsum.photos/seed/unknown/400/400' };
  };

  const product = parseUrl(url);

  const handleAddToCart = () => {
    onConfirm({
      id: Math.random().toString(36).substring(2, 11),
      ...product,
      quantity,
      notes,
      url,
      price: Math.floor(Math.random() * 200) + 15
    });
  };

  return (
    <Modal transparent animationType="slide" visible={true}>
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
                <Image source={{ uri: product.image }} style={styles.image} />
                <View style={styles.info}>
                  <View style={styles.badge}><Text style={styles.badgeText}>{product.store}</Text></View>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.price}>$??.??</Text>
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
  price: { color: '#60a5fa', fontSize: 22, fontWeight: '900', marginTop: 6, letterSpacing: -0.5 },
  section: { marginBottom: 24 },
  label: { color: '#52525b', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#18181b', padding: 8, borderRadius: 18, width: 160 },
  stepBtn: { backgroundColor: '#27272a', padding: 12, borderRadius: 14 },
  qtyText: { color: '#fff', fontSize: 20, fontWeight: '900', width: 35, textAlign: 'center' },
  textArea: { backgroundColor: '#18181b', color: '#fff', padding: 18, borderRadius: 18, minHeight: 120, textAlignVertical: 'top', fontSize: 16 },
  submitBtn: { marginTop: 12 }
});

export default ImportPreviewModal;
