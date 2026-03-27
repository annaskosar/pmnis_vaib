import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    ImageBackground,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const allProducts = [
    {
        image: require('../../assets/images_app/model8.png'),
        name: 'Oversized denim jacket',
        price: '€79.99',
        budget: 'mid',
        styles: ['Casual', 'Streetwear', 'Vintage'],
        colors: ['Modrá'],
        gender: ['Žena'],
    },
    {
        image: require('../../assets/images_app/model9.png'),
        name: 'Summer dress',
        price: '€49.99',
        budget: 'mid',
        styles: ['Casual', 'Boho'],
        colors: ['Modrá'],
        gender: ['Žena'],
    },
    {
        image: require('../../assets/images_app/model10.png'),
        name: 'One shoulder top',
        price: '€39.99',
        budget: 'low',
        styles: ['Streetwear', 'Minimalist', 'Elegantný'],
        colors: ['Čierna'],
        gender: ['Žena'],
    },
    {
        image: require('../../assets/images_app/model11.png'),
        name: 'Adidas sport set',
        price: '€89.99',
        budget: 'high',
        styles: ['Sporty', 'Casual', 'Streetwear'],
        colors: ['Zelená', 'Biela'],
        gender: ['Žena', 'Muž'],
    },
];

export default function HomeScreen() {
    const [userName, setUserName] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(allProducts);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            const userData = await AsyncStorage.getItem('currentUser');
            if (userData) {
                const user = JSON.parse(userData);
                setUserName(user.name);
            }

            const profileData = await AsyncStorage.getItem('userProfile');
            if (profileData) {
                const profile = JSON.parse(profileData);

                const filtered = allProducts.filter(product => {
                const genderMatch = profile.gender
                    ? product.gender.includes(profile.gender)
                    : true;

                const budgetMatch = profile.budget
                    ? product.budget === profile.budget
                    : true;
                const styleMatch = profile.styles?.length
                    ? product.styles.some((s: string) => profile.styles.includes(s))
                    : true;
                const colorMatch = profile.colors?.length
                    ? product.colors.some((c: string) => profile.colors.includes(c))
                    : true;

                return genderMatch && (budgetMatch || styleMatch || colorMatch);
            });

                setFilteredProducts(filtered.length > 0 ? filtered : allProducts);
            }
        };

        loadData();
    }, []);

    const cards = [
        { image: require('../../assets/images_app/model2.png'), label: 'denim' },
        { image: require('../../assets/images_app/model3.png'), label: 'dress' },
        { image: require('../../assets/images_app/model4.png'), label: 'spring' },
        { image: require('../../assets/images_app/model5.png'), label: 'shoes' },
        { image: require('../../assets/images_app/model6.png'), label: 'swim' },
        { image: require('../../assets/images_app/model7.png'), label: 'favorites' },
    ];

    const brands = [
        require('../../assets/images_app/brand1.png'),
        require('../../assets/images_app/brand2.png'),
        require('../../assets/images_app/brand3.png'),
        require('../../assets/images_app/brand4.png'),
        require('../../assets/images_app/brand5.png'),
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Top bar */}
                    <View style={styles.topBar}>
                        <ImageBackground
                            source={require('../../assets/images_app/search.png')}
                            style={styles.searchWrapper}
                            imageStyle={{ borderRadius: 12 }}
                        >
                            <Feather name="search" size={18} color="#393939" />
                            <TextInput
                                placeholder="Search"
                                placeholderTextColor="#393939"
                                style={styles.searchInput}
                            />
                        </ImageBackground>

                        <TouchableOpacity style={styles.iconButton}>
                            <Feather name="heart" size={20} color="#393939" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={() => router.push('/(tabs)/account')}
                        >
                            <Feather name="user" size={22} color="#393939" />
                        </TouchableOpacity>
                    </View>

                    {/* Main hero image */}
                    <Image
                        source={require('../../assets/images_app/model1.png')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />

                    <View style={styles.headingWrapper}>
                        <Text style={styles.headingLineBlack}>New</Text>
                        <View style={styles.collectionRow}>
                            <Text style={styles.headingLineBlack}>collecti</Text>
                            <Text style={styles.headingLineWhite}>on</Text>
                        </View>
                    </View>

                    {/* New for you section */}
                    <View style={styles.newSection}>
                        <Text style={styles.newTitle}>New for you</Text>
                        <Text style={styles.newSubtitle}>
                            News from the world of fashion designed for enthusiasts
                        </Text>
                    </View>

                    {/* Card pairs */}
                    {Array.from({ length: Math.ceil(cards.length / 2) }).map((_, rowIndex) => (
                        <View key={rowIndex} style={styles.cardsRow}>
                            {cards.slice(rowIndex * 2, rowIndex * 2 + 2).map((item, index) => (
                                <TouchableOpacity key={index} style={styles.card}>
                                    <ImageBackground
                                        source={item.image}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    >
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.75)']}
                                            style={styles.cardGradient}
                                        />
                                        <Text style={styles.cardLabel}>{item.label}</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}

                    {/* CTA box */}
                    <ImageBackground
                        source={require('../../assets/images_app/search.png')}
                        style={styles.ctaWrapper}
                        imageStyle={{ borderRadius: 16 }}
                    >
                        <Text style={styles.ctaText}>
                            Hey {userName}, try the new assistant for creating your dream outfits
                        </Text>
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={() => router.push('/(tabs)/builder')}>
                            <Text style={styles.ctaButtonText}>TRY NOW</Text>
                        </TouchableOpacity>
                    </ImageBackground>

                    {/* Favorite categories */}
                    <View style={styles.favoritesSection}>
                        <Text style={styles.favoritesTitle}>Your favorite categories</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.favoritesScroll}
                        >
                            {cards.map((item, index) => (
                                <TouchableOpacity key={index} style={styles.favoriteCard}>
                                    <ImageBackground
                                        source={item.image}
                                        style={styles.favoriteCardImage}
                                        imageStyle={{ borderRadius: 14 }}
                                        resizeMode="cover"
                                    >
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.65)']}
                                            style={styles.favoriteCardGradient}
                                        />
                                        <Text style={styles.favoriteCardLabel}>{item.label}</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Your taste — personalizované */}
                    <View style={styles.tasteSection}>
                        <Text style={styles.tasteTitle}>Your taste</Text>
                        <View style={styles.productsGrid}>
                            {filteredProducts.map((item, index) => (
                                <View key={index} style={styles.productCard}>
                                    <Image
                                        source={item.image}
                                        style={styles.productImage}
                                        resizeMode="cover"
                                    />
                                    <Text style={styles.productName}>{item.name}</Text>
                                    <Text style={styles.productPrice}>{item.price}</Text>
                                    <TouchableOpacity style={styles.cartButton}>
                                        <Feather name="shopping-cart" size={16} color="#111" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.showAllButton}
                            onPress={() => router.push('/(tabs)/search')}
                        >
                            <Text style={styles.showAllText}>SHOW ALL</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Duplicate checker */}
                    <View style={styles.duplicateWrapper}>
                        <View style={styles.duplicateImagesRow}>
                            <Image
                                source={require('../../assets/images_app/model2.png')}
                                style={styles.duplicateImage}
                            />
                            <Feather name="arrow-right" size={25} color="#393939" style={styles.middleArrow} />
                            <Image
                                source={require('../../assets/images_app/model2_pixel.png')}
                                style={styles.duplicateImage}
                            />
                        </View>
                        <View style={styles.duplicateBottomRow}>
                            <View style={styles.duplicateTextBlock}>
                                <Text style={styles.duplicateTitle}>Duplicate?</Text>
                                <Text style={styles.duplicateText}>
                                    Add your items in your wardrobe and check for duplicates.
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.duplicateButton}
                                onPress={() => router.push('/(tabs)/wardrobe')}>
                                <Text style={styles.duplicateButtonText}>TRY NOW</Text>
                                <Feather name="arrow-right" size={14} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Brand picks */}
                    <View style={styles.brandsSection}>
                        <Text style={styles.brandsTitle}>Brand picks</Text>
                        <Text style={styles.brandsSubtitle}>All your fave brands, one place</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.brandsScroll}
                        >
                            {brands.map((brand, index) => (
                                <TouchableOpacity key={index} style={styles.brandCard}>
                                    <Image
                                        source={brand}
                                        style={styles.brandImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
    container: { flex: 1, backgroundColor: '#f3f3f3', paddingHorizontal: 14, paddingTop: 8 },
    scrollContent: { paddingBottom: 20 },
    topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
    searchWrapper: {
        flex: 1, height: 44, borderRadius: 12, flexDirection: 'row',
        alignItems: 'center', paddingHorizontal: 12, overflow: 'hidden',
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#222' },
    profileButton: {
        width: 44, height: 44, borderRadius: 22, borderWidth: 1.5,
        borderColor: '#6a6a6a', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f3f3',
    },
    iconButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f3f3' },
    heroImage: { width: '100%', height: 500, borderRadius: 0, backgroundColor: '#e9e9e9' },
    headingWrapper: { marginTop: -120, marginBottom: 50, paddingLeft: 2 },
    collectionRow: { flexDirection: 'row', alignItems: 'baseline' },
    headingLineBlack: { fontSize: 39, lineHeight: 43, fontWeight: '500', color: '#111' },
    headingLineWhite: { fontSize: 39, lineHeight: 43, fontWeight: '500', color: '#fff' },
    cardsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    card: { flex: 1, backgroundColor: '#ededed', overflow: 'hidden' },
    cardImage: { width: '100%', height: 190, justifyContent: 'flex-end' },
    cardGradient: { ...StyleSheet.absoluteFillObject },
    cardLabel: { position: 'absolute', left: 10, bottom: 10, fontSize: 16, color: '#ffffff', fontWeight: '500' },
    newSection: { marginTop: 10, marginBottom: 6, paddingHorizontal: 2 },
    newTitle: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4, letterSpacing: -0.7 },
    newSubtitle: { fontSize: 13, color: '#393939', lineHeight: 18, letterSpacing: 0.2 },
    ctaWrapper: { marginTop: 20, borderRadius: 16, paddingVertical: 24, paddingHorizontal: 16, overflow: 'hidden' },
    ctaText: { color: '#111', fontSize: 18, fontWeight: '700', lineHeight: 23, marginBottom: 12 },
    ctaButton: { alignSelf: 'center', backgroundColor: '#111', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
    ctaButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    favoritesSection: { marginTop: 40 },
    favoritesTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 12 },
    favoritesScroll: { paddingRight: 14 },
    favoriteCard: { width: 108, height: 108, marginRight: 10 },
    favoriteCardImage: { width: '100%', height: '100%', justifyContent: 'flex-end', overflow: 'hidden' },
    favoriteCardGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 14 },
    favoriteCardLabel: { color: '#fff', fontSize: 14, fontWeight: '600', paddingLeft: 10, paddingBottom: 10 },
    tasteSection: { marginTop: 32 },
    tasteTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 14 },
    productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    productCard: { width: '48%', marginBottom: 18 },
    productImage: { width: '100%', height: 180, borderRadius: 10, backgroundColor: '#eee' },
    productName: { marginTop: 8, fontSize: 14, color: '#111' },
    productPrice: { fontSize: 13, color: '#6b6b6b', marginTop: 2 },
    cartButton: { position: 'absolute', top: 8, right: 8, backgroundColor: '#fff', borderRadius: 16, padding: 6 },
    showAllButton: { marginTop: 16, alignSelf: 'center', backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 50, borderRadius: 20 },
    showAllText: { fontSize: 14, fontWeight: '600', color: '#fff' },
    duplicateWrapper: { marginTop: 30, backgroundColor: '#d9d8d8', padding: 16, borderRadius: 16 },
    duplicateImagesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    duplicateImage: { width: 128, height: 150, borderRadius: 12, backgroundColor: '#ddd' },
    middleArrow: { marginHorizontal: 8 },
    duplicateBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 },
    duplicateTextBlock: { flex: 1 },
    duplicateTitle: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 6 },
    duplicateText: { fontSize: 14, color: '#393939', lineHeight: 19 },
    duplicateButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20 },
    duplicateButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    brandsSection: { marginTop: 32, marginBottom: 20 },
    brandsTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
    brandsSubtitle: { fontSize: 13, color: '#393939', marginBottom: 14 },
    brandsScroll: { paddingRight: 14 },
    brandCard: { width: 110, height: 70, marginRight: 10, borderRadius: 12, overflow: 'hidden', backgroundColor: '#eee' },
    brandImage: { width: '100%', height: '100%' },
});