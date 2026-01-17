
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Plus } from 'lucide-react-native';

interface InAppBrowserProps {
    isVisible: boolean;
    url: string;
    storeName: string;
    onClose: () => void;
    onAddToCart: (data: { url: string; title?: string; image?: string; price?: string; currency?: string; debug?: string }) => void;
}
const INTEGRITY_TOKEN = 'tbe-v1-' + Math.random().toString(36).substring(7);

const ALLOWED_DOMAINS = [
    /amazon\./,
    /apple\.com/,
    /noon\.com/,
    /namshi\.com/,
    /argos\.co\.uk/,
    /tesco\.com/,
    /currys\.co\.uk/,
    /asos\.com/,
    /shein\.com/,
    /nike\.com/,
    /ebay\.com/,
    /walmart\.com/,
    /target\.com/,
    /bestbuy\.com/,
    /macys\.com/,
    /costco\.com/,
    /homedepot\.com/,
    /marksandspencer\.com/,
    /johnlewis\.com/,
    /carrefouruae\.com/,
    /sharafdg\.com/,
    /hm\.com/,
    /zara\.com/
];

const INJECTED_JAVASCRIPT = `
  (function() {
    const ALLOWED_DOMAINS = [
      /amazon\\./,
      /apple\\.com/,
      /noon\\.com/,
      /namshi\\.com/,
      /argos\\.co\\.uk/,
      /tesco\\.com/,
      /currys\\.co\\.uk/,
      /asos\\.com/,
      /shein\\.com/,
      /nike\\.com/,
      /ebay\\.com/,
      /walmart\\.com/,
      /target\\.com/,
      /bestbuy\\.com/,
      /macys\\.com/,
      /costco\\.com/,
      /homedepot\\.com/,
      /marksandspencer\\.com/,
      /johnlewis\\.com/,
      /carrefouruae\\.com/,
      /sharafdg\\.com/,
      /hm\\.com/,
      /zara\\.com/
    ];

    const isAllowed = ALLOWED_DOMAINS.some(regex => regex.test(window.location.hostname));
    if (!isAllowed) return;

    // Define immutable function
    Object.defineProperty(window, 'TENBOX_EXTRACT_v1', {
      value: function() {
        try {
          const getMeta = (prop) => document.querySelector('meta[property="' + prop + '"]')?.content || document.querySelector('meta[name="' + prop + '"]')?.content;
          const title = getMeta('og:title') || document.title;
          
          let image = getMeta('og:image');
          
          // Amazon Image Selectors
          if (!image) {
            const imgSelectors = [
                '#landingImage',
                '#imgBlkFront',
                '#ebooksImgBlkFront',
                '#main-image',
                '[data-a-image-name="landingImage"]'
            ];
            
            for (let sel of imgSelectors) {
                const el = document.querySelector(sel);
                if (el && el.src) {
                    image = el.src;
                    break;
                }
            }
          }

          // Fallback: Find largest image by area
          if (!image) {
              const imgs = Array.from(document.querySelectorAll('img'));
              let maxArea = 0;
              for (let img of imgs) {
                  const area = img.width * img.height;
                  // Filter out tracking pixels and small icons
                  if (area > maxArea && area > 10000 && img.src && !img.src.includes('sprite')) {
                      maxArea = area;
                      image = img.src;
                  }
              }
          }

          // Final fallback to first substantial image
          if (!image) image = document.querySelector('img')?.src;
          
          let debugLog = [];
          const log = (msg) => debugLog.push(msg);

          // 1. Meta Tags First
          let price = getMeta('og:price:amount') || getMeta('product:price:amount');
          let currency = getMeta('og:price:currency') || getMeta('product:price:currency');
          if (price) log('Found meta price');

          // 2. Amazon DOM Sraping (Aggressive)
          if (!price) {
              const selectors = [
                  '#corePrice_feature_div .a-price .a-offscreen',
                  '#corePriceDisplay_mobile_feature_div .a-price .a-offscreen',
                  '#corePriceDisplay_mobile_feature_div .a-offscreen',
                  '#ubp_price',
                  '#priceblock_ourprice',
                  '#priceblock_dealprice',
                  '.a-price .a-offscreen', // Fallback to any price tag
                  '.a-price' // Fallback to visible price container
              ];

              for (let sel of selectors) {
                  const els = document.querySelectorAll(sel);
                  for (let el of els) {
                      // Use textContent to get hidden text
                      let text = el.textContent ? el.textContent.trim() : '';
                      if (!text && el.innerText) text = el.innerText.trim();
                      
                      if (text && /\\d/.test(text)) {
                          log('Found dom price: ' + text + ' in ' + sel);
                          price = text;
                          // Try to detect currency from this specific text
                          if (text.includes('£')) currency = 'GBP';
                          else if (text.includes('AED')) currency = 'AED';
                          else if (text.includes('$')) currency = 'USD';
                          else if (text.includes('€')) currency = 'EUR';
                          break;
                      }
                  }
                  if (price) break;
              }
          }

          // 3. Schema.org JSON-LD
          if (!price) {
              const scripts = document.querySelectorAll('script[type="application/ld+json"]');
              for (let script of scripts) {
                  try {
                      const json = JSON.parse(script.innerText);
                      if (json['@type'] === 'Product' || json['@context']?.includes('schema.org')) {
                          const offer = Array.isArray(json.offers) ? json.offers[0] : json.offers;
                          if (offer && offer.price) {
                              price = offer.price;
                              if (offer.priceCurrency) currency = offer.priceCurrency;
                              log('Found schema price');
                              break;
                          }
                      }
                  } catch(e) {}
              }
          }

          const url = window.location.href;
          // Send debug log in the payload
          const payload = JSON.stringify({ 
              type: 'PRODUCT_EXTRACT', 
              payload: { 
                title, 
                image, 
                url, 
                price, 
                currency, 
                debug: debugLog.join(' | '),
                token: '${INTEGRITY_TOKEN}' 
              } 
          });
          
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(payload);
          }
        } catch(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', message: e.toString() }));
        }
      },
      writable: false,
      configurable: false
    });
    true;
  })();
`;

const InAppBrowser: React.FC<InAppBrowserProps> = ({ isVisible, url, storeName, onClose, onAddToCart }) => {
    const webViewRef = useRef<WebView>(null);
    const [currentUrl, setCurrentUrl] = React.useState(url);

    // Initial sync
    React.useEffect(() => {
        setCurrentUrl(url);
    }, [url]);

    const isAllowedDomain = (targetUrl: string) => {
        try {
            const hostname = new URL(targetUrl).hostname;
            return ALLOWED_DOMAINS.some(regex => regex.test(hostname));
        } catch (e) {
            return false;
        }
    };

    const handleFabPress = () => {
        // Double check allowed domain on press
        if (!isAllowedDomain(currentUrl)) {
            Alert.alert('Not Available', 'You can only add items from supported stores.');
            return;
        }
        // Call the globally attached function
        webViewRef.current?.injectJavaScript('if (window.TENBOX_EXTRACT_v1) { window.TENBOX_EXTRACT_v1(); } else { alert("Not supported on this page"); } true;');
    };

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'PRODUCT_EXTRACT') {
                const payloadUrl = data.payload?.url;
                const token = data.payload?.token;

                // Security Check 1: Verify Integrity Token
                if (token !== INTEGRITY_TOKEN) {
                    console.error('❌ Integrity Token Mismatch. Ignoring message.');
                    return;
                }

                // Security Check 2: Verify the reported URL is allowed
                if (payloadUrl && isAllowedDomain(payloadUrl)) {
                    onAddToCart(data.payload);
                } else {
                    console.warn('⚠️ Blocked message from unauthorized or unknown domain:', payloadUrl);
                }
            }
        } catch (e) {
            console.log('Failed to parse webview message', e);
            // Fallback: use currentUrl which we know tracks navigation state
            if (isAllowedDomain(currentUrl)) {
                onAddToCart({ url: currentUrl });
            }
        }
    };

    const showFab = isAllowedDomain(currentUrl);

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
            transparent={Platform.OS !== 'ios'}
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? 24 : 0 }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Text style={styles.closeText}>Done</Text>
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <Text style={styles.storeTitle} numberOfLines={1}>{storeName}</Text>
                        <Text style={styles.urlText} numberOfLines={1}>{currentUrl}</Text>
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
                            <ActivityIndicator size="large" color="#1C39BB" />
                        </View>
                    )}
                    sharedCookiesEnabled={false}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                    mixedContentMode="compatibility"
                    allowsBackForwardNavigationGestures={true}
                    injectedJavaScript={INJECTED_JAVASCRIPT}
                    onMessage={handleMessage}
                    onNavigationStateChange={(navState) => {
                        setCurrentUrl(navState.url);
                    }}
                    userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
                />

                {showFab && (
                    <TouchableOpacity style={styles.fab} onPress={handleFabPress} activeOpacity={0.8}>
                        <Plus color="#fff" size={24} />
                        <Text style={styles.fabText}>Add to Tenbox Cart</Text>
                    </TouchableOpacity>
                )}
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
        color: '#1C39BB',
        fontSize: 17,
        fontWeight: '600',
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
    },
    urlText: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
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
        backgroundColor: '#1C39BB',
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
    }
});

export default InAppBrowser;
