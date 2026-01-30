import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width - 48; // padding 24 * 2

const OFFERS = [
    { id: '1', image: require('../assets/offers/offer1.png') },
    { id: '2', image: require('../assets/offers/offer2.jpg') },
    { id: '3', image: require('../assets/offers/offer3.jpg') },
];

const OfferSlider: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            let nextIndex = activeIndex + 1;
            if (nextIndex >= OFFERS.length) {
                nextIndex = 0;
            }
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
            setActiveIndex(nextIndex);
        }, 4000); // Rotate every 4 seconds

        return () => clearInterval(interval);
    }, [activeIndex]);

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Optional: Update active index on manual scroll
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        // We only update if it's different to avoid conflict with auto-scroll state
        if (roundIndex !== activeIndex) {
            setActiveIndex(roundIndex);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={OFFERS}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                // onMomentumScrollEnd={onScroll} // Can conflict with auto-scroll logic, simple version for now
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <Image source={item.image} style={styles.image} resizeMode="cover" />
                    </View>
                )}
            />
            <View style={styles.pagination}>
                {OFFERS.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i === activeIndex && styles.activeDot
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    slide: {
        width: SLIDE_WIDTH,
        height: 160,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#E5E5EA',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E5EA',
    },
    activeDot: {
        backgroundColor: '#1C39BB',
        width: 24, // Elongated active dot
    }
});

export default OfferSlider;
