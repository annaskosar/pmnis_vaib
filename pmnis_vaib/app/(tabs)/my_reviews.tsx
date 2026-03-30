import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProducts } from '../../context/product_context';
import { productImages } from '../../context/product_images';
import { Image } from 'expo-image';

const COLORS = {
    bg: '#f3f3f3',
    surface: '#e9e9e9',
    surface2: '#dcdcdc',
    text: '#111',
    textSoft: '#666',
    textMuted: '#8a8a8a',
    black: '#111',
    danger: '#c63d3d',
};

type LocalReview = {
    id: string;
    name: string;
    date: string;
    rating: number;
    text: string;
};

type MyReviewItem = {
    productId: string;
    productName: string;
    productImage: any;
    review: LocalReview;
};

function renderStars(value: number, size = 14) {
    const fullStars = Math.round(value);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons
                    key={star}
                    name="star"
                    size={size}
                    color={star <= fullStars ? COLORS.black : '#cfcfcf'}
                    style={{ marginRight: 1 }}
                />
            ))}
        </View>
    );
}

export default function MyReviewsScreen() {
    const router = useRouter();
    const { getProductById } = useProducts();
    const [myReviews, setMyReviews] = React.useState<MyReviewItem[]>([]);

    const loadMyReviews = async () => {
        try {
            const allKeys = await AsyncStorage.getAllKeys();
            const reviewKeys = allKeys.filter((key) => key.startsWith('product_reviews_'));

            if (reviewKeys.length === 0) {
                setMyReviews([]);
                return;
            }

            const keyValuePairs = await AsyncStorage.multiGet(reviewKeys);
            const collected: MyReviewItem[] = [];

            keyValuePairs.forEach(([key, value]) => {
                if (!value) return;

                const productId = key.replace('product_reviews_', '');
                const product = getProductById(productId);

                if (!product) return;

                const parsedReviews: LocalReview[] = JSON.parse(value);

                const firstImageKey =
                    product.availableColors?.[0]?.imageKeys?.[0] ?? product.images?.[0];

                const imageSource = firstImageKey ? productImages[firstImageKey] : null;

                parsedReviews.forEach((review) => {
                    collected.push({
                        productId,
                        productName: product.name,
                        productImage: imageSource,
                        review,
                    });
                });
            });

            collected.sort((a, b) => {
                const aTime = Number(a.review.id.split('-')[1] ?? 0);
                const bTime = Number(b.review.id.split('-')[1] ?? 0);
                return bTime - aTime;
            });

            setMyReviews(collected);
        } catch (error) {
            console.log('Failed to load my reviews', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadMyReviews();
        }, [])
    );

    const handleDeleteReview = async (productId: string, reviewId: string) => {
        Alert.alert(
            'Delete review',
            'Are you sure you want to delete this review?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const storageKey = `product_reviews_${productId}`;
                            const stored = await AsyncStorage.getItem(storageKey);

                            if (!stored) return;

                            const parsed: LocalReview[] = JSON.parse(stored);
                            const updated = parsed.filter((r) => r.id !== reviewId);

                            await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
                            loadMyReviews();
                        } catch (error) {
                            console.log('Failed to delete review', error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Feather name="arrow-left" size={24} color="#111" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>My reviews</Text>

                    <View style={{ width: 24 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {myReviews.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Feather name="message-square" size={28} color="#999" />
                            <Text style={styles.emptyTitle}>No reviews yet</Text>
                            <Text style={styles.emptyText}>
                                Once you add product reviews, they will appear here.
                            </Text>
                        </View>
                    ) : (
                        myReviews.map((item) => (
                            <View key={item.review.id} style={styles.reviewCard}>
                                <View style={styles.productRow}>
                                    {item.productImage && (
                                        <Image
                                            source={item.productImage}
                                            style={styles.productImage}
                                            contentFit="cover"
                                        />
                                    )}

                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.productName}>{item.productName}</Text>
                                        <Text style={styles.reviewDate}>{item.review.date}</Text>
                                    </View>
                                </View>

                                <View style={{ marginTop: 12 }}>
                                    {renderStars(item.review.rating, 15)}
                                </View>

                                <Text style={styles.reviewText}>{item.review.text}</Text>

                                <View style={styles.actionsRow}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() =>
                                            router.push({
                                                pathname: '/(tabs)/product_detail',
                                                params: {
                                                    productId: item.productId,
                                                },
                                            })
                                        }
                                    >
                                        <Feather name="external-link" size={15} color="#111" />
                                        <Text style={styles.actionButtonText}>Open product</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() =>
                                            handleDeleteReview(item.productId, item.review.id)
                                        }
                                    >
                                        <Feather name="trash-2" size={15} color="#c63d3d" />
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },

    container: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 10,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },

    scrollContent: {
        paddingBottom: 30,
    },

    emptyCard: {
        backgroundColor: '#e9e9e9',
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
    },

    emptyTitle: {
        marginTop: 12,
        fontSize: 17,
        fontWeight: '700',
        color: '#111',
    },

    emptyText: {
        marginTop: 6,
        fontSize: 13,
        color: '#777',
        textAlign: 'center',
        lineHeight: 18,
    },

    reviewCard: {
        backgroundColor: '#e9e9e9',
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
    },

    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    productImage: {
        width: 58,
        height: 58,
        borderRadius: 12,
        backgroundColor: '#d8d8d8',
        marginRight: 12,
    },

    productName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },

    reviewDate: {
        marginTop: 4,
        fontSize: 12,
        color: '#8a8a8a',
    },

    reviewText: {
        marginTop: 10,
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },

    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14,
    },

    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#dddddd',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    actionButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
    },

    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#f1dede',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    deleteButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#c63d3d',
    },
});