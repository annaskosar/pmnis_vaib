import React from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWishlist } from '../../context/wishlist_context';

export default function WishlistScreen() {
    const router = useRouter();
    const { wishlistItems, removeFromWishlist } = useWishlist();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
                        <Feather name="arrow-left" size={24} color="#111" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Wishlist</Text>
                    <Text style={styles.count}>{wishlistItems.length} items</Text>
                </View>

                {wishlistItems.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Feather name="heart" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>Your wishlist is empty</Text>
                        <TouchableOpacity
                            style={styles.shopButton}
                            onPress={() => router.replace('/(tabs)/search')}
                        >
                            <Text style={styles.shopButtonText}>START SHOPPING</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.grid}>
                            {wishlistItems.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.card}
                                    activeOpacity={0.85}
                                    onPress={() => router.push({
                                        pathname: '/product_detail',
                                        params: {
                                            productId: item.id,
                                            category: item.category ?? '',
                                            subcategory: item.subcategory ?? '',
                                            gender: item.gender ?? 'WOMAN',
                                        },
                                    })}
                                >
                                    <Image
                                        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        style={styles.heartButton}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            removeFromWishlist(item.id);
                                        }}
                                    >
                                        <Feather name="heart" size={16} color="#e74c3c" />
                                    </TouchableOpacity>
                                    <Text style={styles.cardPrice}>€{item.price.toFixed(2)}</Text>
                                    <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
    headerRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 20,
    },
    title: { fontSize: 22, fontWeight: '700', color: '#111' },
    count: { fontSize: 14, color: '#6a6a6a' },
    scrollContent: { paddingBottom: 30 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { width: '48%', marginBottom: 18, position: 'relative' },
    cardImage: {
        width: '100%', height: 200, borderRadius: 14, backgroundColor: '#e9e9e9',
    },
    heartButton: {
        position: 'absolute', top: 8, right: 8,
        backgroundColor: '#fff', borderRadius: 16,
        width: 30, height: 30, justifyContent: 'center', alignItems: 'center',
    },
    cardPrice: { marginTop: 8, fontSize: 16, fontWeight: '700', color: '#111' },
    cardName: { marginTop: 4, fontSize: 13, color: '#6a6a6a', lineHeight: 18 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    emptyText: { fontSize: 16, color: '#aaa', fontWeight: '500' },
    shopButton: {
        backgroundColor: '#111', paddingVertical: 14,
        paddingHorizontal: 32, borderRadius: 20,
    },
    shopButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});