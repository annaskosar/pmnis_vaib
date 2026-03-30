import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    Modal,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useProducts } from '../../context/product_context';
import AsyncStorage from '@react-native-async-storage/async-storage';


const COLORS = {
    bg: '#f3f3f3',
    surface: '#e9e9e9',
    text: '#111',
    textSoft: '#666',
    textMuted: '#8a8a8a',
    black: '#111',
};

type LocalReview = {
    id: string;
    name: string;
    date: string;
    rating: number;
    text: string;
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

function formatTodayDate() {
    const today = new Date();
    return today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
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

    const [reviewName, setReviewName] = React.useState('');
    const [reviewTextInput, setReviewTextInput] = React.useState('');
    const [reviewRating, setReviewRating] = React.useState(0);
    const [savedReviews, setSavedReviews] = React.useState<LocalReview[]>([]);

    const storageKey =
        typeof productIdValue === 'string'
            ? `product_reviews_${productIdValue}`
            : '';

    React.useEffect(() => {
        const loadSavedReviews = async () => {
            if (!storageKey) return;

            try {
                const stored = await AsyncStorage.getItem(storageKey);
                if (stored) {
                    setSavedReviews(JSON.parse(stored));
                }
            } catch (error) {
                console.log('Failed to load reviews', error);
            }
        };

        loadSavedReviews();
    }, [storageKey]);

    if (!product) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 12 }}>
                        Reviews not found
                    </Text>

                    <TouchableOpacity onPress={() => router.back()}>
                        <Feather name="arrow-left" size={22} color="#111" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const allReviews = [...savedReviews, ...product.reviews];

    const averageRating =
        allReviews.length > 0
            ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
            : 0;

    const reviewCount = allReviews.length;
    const [thankYouVisible, setThankYouVisible] = React.useState(false);
    const [reviewSubmitted, setReviewSubmitted] = React.useState(false);

    const handleSubmitReview = async () => {
        if (reviewName.trim().length === 0) {
            Alert.alert('Missing name', 'Please enter your name.');
            return;
        }

        if (reviewRating === 0) {
            Alert.alert('Missing rating', 'Please choose a rating.');
            return;
        }

        if (reviewTextInput.trim().length === 0) {
            Alert.alert('Missing review', 'Please write your review.');
            return;
        }

        const newReview: LocalReview = {
            id: `local-${Date.now()}`,
            name: reviewName.trim(),
            date: formatTodayDate(),
            rating: reviewRating,
            text: reviewTextInput.trim(),
        };

        const updatedReviews = [newReview, ...savedReviews];

        try {
            await AsyncStorage.setItem(storageKey, JSON.stringify(updatedReviews));
            setSavedReviews(updatedReviews);
            setReviewName('');
            setReviewTextInput('');
            setReviewRating(0);
            setReviewSubmitted(true);
            setThankYouVisible(true);

            setTimeout(() => {
                setThankYouVisible(false);
                setReviewSubmitted(false);
            }, 2600);
        } catch (error) {
            console.log('Failed to save review', error);
            Alert.alert('Error', 'Review could not be saved.');
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
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
                            const updated = savedReviews.filter(r => r.id !== reviewId);
                            await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
                            setSavedReviews(updated);
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
                <View style={styles.topRow}>
                    <TouchableOpacity
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
                        <Feather name="arrow-left" size={24} color="#111" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>Reviews</Text>
                <Text style={styles.productName}>{product.name}</Text>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryTop}>
                        <Text style={styles.summaryValue}>{averageRating.toFixed(1)}</Text>

                        <View style={styles.summaryRight}>
                            {renderStars(averageRating, 20)}
                            <Text style={styles.summaryCount}>{reviewCount} ratings</Text>
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
                    <View style={styles.writeReviewCard}>
                        <Text style={styles.writeReviewTitle}>Add your review</Text>

                        <TextInput
                            style={styles.nameInput}
                            placeholder="Your name"
                            placeholderTextColor="#999"
                            value={reviewName}
                            onChangeText={setReviewName}
                        />

                        <Text style={styles.ratingPickerLabel}>Your rating</Text>

                        <View style={styles.ratingPickerRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => setReviewRating(star)}
                                >
                                    <MaterialIcons
                                        name="star"
                                        size={28}
                                        color={star <= reviewRating ? '#111' : '#cfcfcf'}
                                        style={{ marginRight: 6 }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={styles.reviewInput}
                            placeholder="Write your review here..."
                            placeholderTextColor="#999"
                            multiline
                            value={reviewTextInput}
                            onChangeText={setReviewTextInput}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={styles.submitReviewButton}
                            onPress={handleSubmitReview}
                        >
                            <Text style={styles.submitReviewButtonText}>SUBMIT REVIEW</Text>
                        </TouchableOpacity>
                    </View>

                    {allReviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewTopRow}>
                                <View>
                                    <Text style={styles.reviewName}>{review.name}</Text>
                                    <Text style={styles.reviewDate}>{review.date}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    {renderStars(review.rating, 15)}

                                    {savedReviews.some(r => r.id === review.id) && (
                                        <TouchableOpacity onPress={() => handleDeleteReview(review.id)}>
                                            <Feather name="trash-2" size={16} color="#c63d3d" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            <Text style={styles.reviewText}>{review.text}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <Modal
                visible={thankYouVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setThankYouVisible(false)}
            >
                <TouchableOpacity
                    style={styles.thankYouOverlay}
                    activeOpacity={1}
                    onPress={() => setThankYouVisible(false)}
                >
                    <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                        <View style={styles.thankYouCard}>
                            <Feather name="check-circle" size={42} color="#111" />
                            <Text style={styles.thankYouTitle}>Thanks for your review!</Text>
                            <Text style={styles.thankYouSubtitle}>
                                Your rating helps other people get a better idea before buying this product.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
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
        backgroundColor: '#dddddd',
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

    writeReviewCard: {
        backgroundColor: '#e2e2e2',
        borderRadius: 18,
        padding: 14,
        marginBottom: 14,
    },

    writeReviewTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#111',
        marginBottom: 12,
    },

    nameInput: {
        backgroundColor: '#f3f3f3',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#111',
        marginBottom: 12,
    },

    ratingPickerLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
        marginBottom: 8,
    },

    ratingPickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    reviewInput: {
        backgroundColor: '#f3f3f3',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#111',
        minHeight: 120,
        marginBottom: 12,
    },

    submitReviewButton: {
        backgroundColor: '#111',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },

    submitReviewButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
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

    thankYouOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    thankYouCard: {
        backgroundColor: '#f3f3f3',
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 24,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
    },

    thankYouTitle: {
        marginTop: 14,
        fontSize: 22,
        fontWeight: '800',
        color: '#111',
        textAlign: 'center',
    },

    thankYouSubtitle: {
        marginTop: 10,
        fontSize: 14,
        lineHeight: 20,
        color: '#6a6a6a',
        textAlign: 'center',
    },
});