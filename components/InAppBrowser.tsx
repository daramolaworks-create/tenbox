
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Plus } from 'lucide-react-native';

interface InAppBrowserProps {
    isVisible: boolean;
    url: string;
    storeName: string;
    onClose: () => void;
    onAddToCart: (data: { url: string; title?: string; image?: string }) => void;
}

const INJECTED_JAVASCRIPT = `
  window.extractProduct = function() {
    try {
      const getMeta = (prop) => document.querySelector('meta[property="' + prop + '"]')?.content || document.querySelector('meta[name="' + prop + '"]')?.content;
      const title = getMeta('og:title') || document.title;
      const image = getMeta('og:image') || document.querySelector('img')?.src;
      const url = window.location.href;
      
      const payload = JSON.stringify({ type: 'PRODUCT_EXTRACT', payload: { title, image, url } });
      
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(payload);
      } else {
        // Fallback for some Android versions or if injection delayed
        console.log('ReactNativeWebView not ready');
      }
    } catch(e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: e.toString() }));
    }
  }
  true;
`;

const InAppBrowser: React.FC<InAppBrowserProps> = ({ isVisible, url, storeName, onClose, onAddToCart }) => {
    const webViewRef = useRef<WebView>(null);

    const handleFabPress = () => {
        // Call the globally attached function
        webViewRef.current?.injectJavaScript('window.extractProduct(); true;');
    };

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'PRODUCT_EXTRACT') {
                onAddToCart(data.payload);
            }
        } catch (e) {
            console.log('Failed to parse webview message', e);
            onAddToCart({ url });
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
            transparent={Platform.OS !== 'ios'}
        >
            <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? 24 : 0 }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Text style={styles.closeText}>Done</Text>
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <Text style={styles.storeTitle} numberOfLines={1}>{storeName}</Text>
                        <Text style={styles.urlText} numberOfLines={1}>{url}</Text>
                    </View>

                    <View style={styles.loadingPlaceholder} />
                </View>

                <WebView
                    ref={webViewRef}
                    source={{ uri: url }}
                    style={styles.webview}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#0223E6" />
                        </View>
                    )}
                    sharedCookiesEnabled={true}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                    mixedContentMode="always"
                    allowsBackForwardNavigationGestures={true}
                    injectedJavaScript={INJECTED_JAVASCRIPT}
                    onMessage={handleMessage}
                    userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
                />

                <TouchableOpacity style={styles.fab} onPress={handleFabPress} activeOpacity={0.8}>
                    <Plus color="#fff" size={24} />
                    <Text style={styles.fabText}>Add to Tenbox Cart</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
        backgroundColor: '#F2F2F7',
    },
    closeBtn: {
        padding: 8,
    },
    closeText: {
        color: '#0223E6',
        fontSize: 17,
        fontWeight: '600',
        fontFamily: 'ZalandoBold',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    storeTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
        fontFamily: 'ZalandoBold',
    },
    urlText: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
        fontFamily: 'ZalandoRegular',
    },
    loadingPlaceholder: {
        width: 50, // To balance the layout since close button is on left
    },
    webview: {
        flex: 1,
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    fab: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        backgroundColor: '#0223E6',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        gap: 8,
    },
    fabText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'ZalandoBold',
    }
});

export default InAppBrowser;
