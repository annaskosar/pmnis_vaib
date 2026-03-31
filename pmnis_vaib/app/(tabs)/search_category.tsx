import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { categoryMap, useProducts } from '../../context/product_context';
import { productImages } from '../../context/product_images';
import { Image } from 'react-native';

export default function SearchCategoryScreen() {
    const router = useRouter();
    const { category, gender } = useLocalSearchParams();
    const { products } = useProducts();

    const categoryName = Array.isArray(category) ? category[0] : category;
    const selectedGender = Array.isArray(gender) ? gender[0] : gender;

    const isSale = categoryName === 'SALE: HOT DEALS';

    const saleProducts = isSale
        ? products.filter(p =>
            p.isOnSale &&
            (selectedGender === 'WOMAN' ? p.gender === 'women' : p.gender === 'men')
          )
        : [];

    const items =
        !isSale && typeof categoryName === 'string'
            ? categoryMap[categoryName as keyof typeof categoryMap] || []
            : [];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <ImageBackground
                    source={require('../../assets/images_app/search.jpg')}
                    style={styles.headerBackground}
                    imageStyle={styles.headerBackgroundImage}
                >
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity
                            onPress={() => router.replace('/search')}
                            style={styles.backButton}
                        >
                            <Feather name="arrow-left" size={22} color="#111" />
                        </TouchableOpacity>

                        <Text style={styles.title}>
                            {typeof categoryName === 'string' ? categoryName : ''}
                        </Text>

                        <View style={styles.rightPlaceholder} />
                    </View>
                </ImageBackground>

                <View style={styles.contentWrapper}>
                    {isSale ? (
                        <>
                            <Text style={styles.subtitle}>
                                {saleProducts.length} items on sale
                            </Text>

                            {saleProducts.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Feather name="tag" size={40} color="#ccc" />
                                    <Text style={styles.emptyText}>No sale items available</Text>
                                </View>
                            ) : (
                                <View style={styles.productsGrid}>
                                    {saleProducts.map((product) => {
                                        const imageKey = product.availableColors?.[0]?.imageKeys?.[0] ?? product.images?.[0];
                                        const imageSource = imageKey ? productImages[imageKey] : null;

                                        return (
                                            <TouchableOpacity
                                                key={product.id}
                                                style={styles.productCard}
                                                onPress={() =>
                                                    router.push({
                                                        pathname: '/(tabs)/product_detail',
                                                        params: {
                                                            productId: product.id,
                                                            category: product.mainCategory,
                                                            subcategory: product.subCategory,
                                                            gender: selectedGender,
                                                        },
                                                    })
                                                }
                                            >
                                                {imageSource ? (
                                                    <Image
                                                        source={imageSource}
                                                        style={styles.productImage}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View style={[styles.productImage, styles.productImagePlaceholder]}>
                                                        <Feather name="image" size={24} color="#ccc" />
                                                    </View>
                                                )}

                                                <View style={styles.discountBadge}>
                                                    <Text style={styles.discountText}>-{product.discountPercent}%</Text>
                                                </View>

                                                <Text style={styles.productName} numberOfLines={2}>
                                                    {product.name}
                                                </Text>
                                                <View style={styles.priceRow}>
                                                    <Text style={styles.salePrice}>€{product.price.toFixed(2)}</Text>
                                                    {product.oldPrice && (
                                                        <Text style={styles.oldPrice}>€{product.oldPrice.toFixed(2)}</Text>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </>
                    ) : (
                        <>
                            <Text style={styles.subtitle}>Browse products</Text>

                            {items.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.itemRow}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/search_items',
                                            params: {
                                                category: categoryName,
                                                subcategory: item,
                                                gender: selectedGender,
                                            },
                                        })
                                    }
                                >
                                    <Text style={styles.itemText}>{item}</Text>
                                    <Feather name="chevron-right" size={20} color="#111" />
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f3f3f3',
    },
    scrollContent: {
        paddingBottom: 30,
        backgroundColor: '#f3f3f3',
    },
    headerBackground: {
        minHeight: 70,
        paddingTop: 8,
        paddingHorizontal: 14,
        justifyContent: 'flex-start',
    },
    headerBackgroundImage: {
        resizeMode: 'cover',
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 44,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    rightPlaceholder: {
        width: 44,
        height: 44,
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 26,
        fontWeight: '700',
        color: '#111',
    },
    contentWrapper: {
        paddingHorizontal: 14,
        paddingTop: 20,
    },
    subtitle: {
        fontSize: 14,
        color: '#6a6a6a',
        marginBottom: 8,
    },
    itemRow: {
        minHeight: 82,
        borderBottomWidth: 1,
        borderBottomColor: '#d0d0d0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemText: {
        fontSize: 20,
        fontWeight: '500',
        color: '#111',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
    },
    productCard: {
        width: '48%',
        marginBottom: 4,
    },
    productImage: {
        width: '100%',
        height: 200,
        borderRadius: 14,
        backgroundColor: '#e9e9e9',
        marginBottom: 8,
    },
    productImagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    discountBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#df2518',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    discountText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    productName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#111',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    salePrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#df2518',
    },
    oldPrice: {
        fontSize: 12,
        color: '#aaa',
        textDecorationLine: 'line-through',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#aaa',
    },
});