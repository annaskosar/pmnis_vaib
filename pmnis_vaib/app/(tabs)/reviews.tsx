import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProducts } from '../../context/product_context';

const COLORS = {
    bg: '#f3f3f3',
    surface: '#e9e9e9',
    text: '#111',
    textSoft: '#666',
    textMuted: '#8a8a8a',
    black: '#111',
};

function renderStars(value: number, size = 16) {
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

export default function ReviewsScreen() {
    const router = useRouter();
    const { getProductById } = useProducts();

    const { productId, category, subcategory, gender } = useLocalSearchParams();

    const productIdValue = Array.isArray(productId) ? productId[0] : productId;
    const categoryValue = Array.isArray(category) ? category[0] : category;
    const subcategoryValue = Array.isArray(subcategory) ? subcategory[0] : subcategory;
    const genderValue = Array.isArray(gender) ? gender[0] : gender;

    const product =
        typeof productIdValue === 'string'
            ? getProductById(productIdValue)
            : undefined;

    if (!product) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 12 }}>
                        Reviews not found
                    </Text>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.back()}
                    >
                        <Feather name="arrow-left" size={22} color="#111" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() =>
                            router.replace({
                                pathname: '/product_detail',
                                params: {
                                    productId: product.id,
                                    category: categoryValue ?? '',
                                    subcategory: subcategoryValue ?? '',
                                    gender: genderValue ?? 'WOMAN',
                                },
                            })
                        }
                    >
                        <Feather name="arrow-left" size={22} color="#111" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>Reviews</Text>
                <Text style={styles.productName}>{product.name}</Text>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryTop}>
                        <Text style={styles.summaryValue}>{product.rating.toFixed(1)}</Text>

                        <View style={styles.summaryRight}>
                            {renderStars(product.rating, 20)}
                            <Text style={styles.summaryCount}>{product.reviewCount} ratings</Text>
                        </View>
                    </View>

                    <Text style={styles.summaryNote}>
                        Verified buyers share their fit, quality and styling experience here.
                    </Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {product.reviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewTopRow}>
                                <View>
                                    <Text style={styles.reviewName}>{review.name}</Text>
                                    <Text style={styles.reviewDate}>{review.date}</Text>
                                </View>

                                {renderStars(review.rating, 15)}
                            </View>

                            <Text style={styles.reviewText}>{review.text}</Text>
                        </View>
                    ))}
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
        paddingHorizontal: 16,
        paddingTop: 10,
    },

    topRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 18,
    },

    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#6a6a6a',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f3f3',
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111',
    },

    productName: {
        fontSize: 15,
        color: '#666',
        marginTop: 4,
        marginBottom: 18,
        fontWeight: '500',
    },

    summaryCard: {
        backgroundColor: '#e9e9e9',
        borderRadius: 20,
        padding: 16,
        marginBottom: 18,
    },

    summaryTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    summaryValue: {
        fontSize: 38,
        fontWeight: '800',
        color: '#111',
        marginRight: 16,
    },

    summaryRight: {
        flex: 1,
    },

    summaryCount: {
        marginTop: 6,
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },

    summaryNote: {
        marginTop: 12,
        fontSize: 13,
        lineHeight: 19,
        color: '#777',
    },

    scrollContent: {
        paddingBottom: 28,
    },

    reviewCard: {
        backgroundColor: '#e9e9e9',
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
    },

    reviewTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },

    reviewName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },

    reviewDate: {
        marginTop: 2,
        fontSize: 12,
        color: '#8a8a8a',
    },

    reviewText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
});