
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

    if (window.TENBOX_EXTRACT_v1) return; // Prevent re-definition

    Object.defineProperty(window, 'TENBOX_EXTRACT_v1', {
      value: function() {
        try {
          const startTime = Date.now();
          const candidates = [];
          const log = (msg) => console.log('[TB_EXTRACT] ' + msg);

          // --- Helper: Clean Price ---
          const cleanPrice = (str) => {
             if (!str) return null;
             // Remove commas if they are thousands separators (simple heuristic)
             // But keep dots/decimals. 
             // Regex: matches currency symbol or not, then digits/dots/commas.
             const match = str.match(/([\\d\\.,]+)/);
             if (!match) return null;
             let val = match[1];
             // Standardize: remove non-numeric except dot
             // NOTE: This basic cleaning handles $1,234.50 -> 1234.50
             val = val.replace(/[^0-9\\.]/g, ''); 
             return val;
          };

          const addCandidate = (source, price, currency, confidence = 0.5) => {
             if (!price) return;
             const normalized = cleanPrice(price);
             if (!normalized) return;
             
             candidates.push({
               source,
               rawPrice: price,
               price: normalized,
               currency: currency || null, // REMOVED DEFAULT 'USD'
               confidence
             });
          };

          // --- Strategy 1: JSON-LD (Highest Confidence) ---
          const scripts = document.querySelectorAll('script[type="application/ld+json"]');
          for (let script of scripts) {
             try {
               const json = JSON.parse(script.innerText);
               const entities = Array.isArray(json) ? json : [json];
               for (let entity of entities) {
                  if (entity['@type'] === 'Product') {
                      const offers = Array.isArray(entity.offers) ? entity.offers : [entity.offers];
                      for (let offer of offers) {
                          if (offer && offer.price) {
                              addCandidate('JSON-LD', offer.price, offer.priceCurrency, 0.95);
                          }
                      }
                  }
               }
             } catch(e) {}
          }

          // --- Strategy 2: Meta Tags (High Confidence) ---
          const getMeta = (prop) => document.querySelector('meta[property="' + prop + '"]')?.content || document.querySelector('meta[name="' + prop + '"]')?.content;
          
          let metaPrice = getMeta('og:price:amount') || getMeta('product:price:amount');
          let metaCurrency = getMeta('og:price:currency') || getMeta('product:price:currency');
          if (metaPrice) addCandidate('MetaTags', metaPrice, metaCurrency, 0.85);

          // --- Strategy 3: Site-Specific Selectors (Medium-High Confidence) ---
          const selectors = [
              // Amazon
              { sel: '#corePrice_feature_div .a-price .a-offscreen', conf: 0.8 },
              { sel: '#corePriceDisplay_mobile_feature_div .a-price .a-offscreen', conf: 0.8 },
              { sel: '#ubp_price', conf: 0.8 },
              // Generic E-commerce
              { sel: '[itemprop="price"]', conf: 0.7 },
              { sel: '.price', conf: 0.5 },
              { sel: '.product-price', conf: 0.6 },
              { sel: '.offer-price', conf: 0.6 }
          ];

          for (let s of selectors) {
              const els = document.querySelectorAll(s.sel);
              for (let el of els) {
                  // Prioritize visible elements
                  if (el.offsetParent !== null || s.sel.includes('offscreen')) { 
                      addCandidate('Selector: ' + s.sel, el.textContent, null, s.conf);
                  }
              }
          }

          // --- Strategy 4: Heuristics (Largest Price Text) ---
          if (candidates.length === 0) {
             const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
             let node;
             // Regex captures symbol (Group 1) and value
             const priceRegex = /([$€£¥AED]+)\s*(\d+(?:[.,]\d{2})?)/;
             
             while(node = walker.nextNode()) {
                 const text = node.textContent.trim();
                 if (text.length < 20) {
                     const match = text.match(priceRegex);
                     if (match) {
                         // Check visibility
                         const parent = node.parentElement;
                         if (parent) {
                             const style = window.getComputedStyle(parent);
                             if (style.display !== 'none' && style.visibility !== 'hidden' && parseInt(style.fontSize) > 14) {
                                 let textCurrency = null;
                                 const symbol = match[1];
                                 if (symbol.includes('£')) textCurrency = 'GBP';
                                 else if (symbol.includes('AED')) textCurrency = 'AED';
                                 else if (symbol.includes('€')) textCurrency = 'EUR';
                                 else if (symbol.includes('$')) textCurrency = 'USD'; // Only explicitly set USD if symbol is $
                                 
                                 addCandidate('HeuristicText', match[0], textCurrency, 0.3);
                             }
                         }
                     }
                 }
             }
          }

          // --- Extract Metadata (Title/Image) ---
          const title = getMeta('og:title') || document.title;
          let image = getMeta('og:image');
          if (!image) {
              // Simple image fallback
              const img = document.querySelector('#landingImage') || document.querySelector('img');
              if (img) image = img.src;
          }

          // --- Selection Logic ---
          // Sort by confidence DESC, then by price presence
          candidates.sort((a,b) => b.confidence - a.confidence);
          
          const topChoice = candidates.length > 0 ? candidates[0] : null;

          const payload = JSON.stringify({ 
              type: 'PRODUCT_EXTRACT', 
              payload: { 
                title, 
                image, 
                url: window.location.href, 
                topChoice,
                candidates,
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

    // --- Auto-Run & Mutator ---
    // REMOVED: Do not auto-run. Wait for user FAB press.
    
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
                    // Extract robust data
                    const topChoice = data.payload?.topChoice;
                    const finalPayload = {
                        url: payloadUrl,
                        title: data.payload?.title,
                        image: data.payload?.image,
                        price: topChoice ? topChoice.price : data.payload?.price,
                        currency: topChoice ? topChoice.currency : data.payload?.currency,
                        // Pass along full extraction data for debugging/advanced usage
                        candidates: data.payload?.candidates,
                        debug: data.payload?.debug
                    };

                    onAddToCart(finalPayload);
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
            <SafeAreaView style={styles.container}>
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
