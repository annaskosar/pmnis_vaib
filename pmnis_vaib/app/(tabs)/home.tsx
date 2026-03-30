import React, { useState, useEffect, useRef } from 'react';
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
    Pressable,
    Keyboard,
    Modal,
    Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProducts } from '../../context/product_context';
import { productImages } from '../../context/product_images';
import { MaterialIcons } from '@expo/vector-icons';
import { useWishlist } from '../../context/wishlist_context';
import { Svg, Path, Text as SvgText } from 'react-native-svg';


type FavoriteCategoryCard = {
    label: string;
    category: string;
    subcategory: string;
    imageKey?: string;
};

export default function HomeScreen() {
    const [userName, setUserName] = useState('');
    const router = useRouter();
    const { products } = useProducts();
    const [filteredProducts, setFilteredProducts] = useState<typeof products>([]);
    const [homeSearchText, setHomeSearchText] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchInputRef = useRef<TextInput>(null);

    const [showTrackBanner, setShowTrackBanner] = useState(false);
    const [showTrackingReminder, setShowTrackingReminder] = useState(false);
    const [trackingEnabled, setTrackingEnabled] = useState(true);


    const styleToSubcategories: Record<string, string[]> = {
        Casual: ['Tops', 'Jeans', 'Coats'],
        Formal: ['Shirts', 'Trousers', 'Coats'],
        Streetwear: ['Hoodies', 'Jeans', 'Trousers'],
        Minimalist: ['Tops', 'Shirts', 'Trousers'],
        Boho: ['Tops', 'Jackets', 'Shirts'],
        Sporty: ['Trousers', 'Tops', 'Jeans'],
        Vintage: ['Jeans', 'Jackets', 'Shirts'],
        Elegant: ['Coats', 'Tops', 'Shirts'],
    };

    const subcategoryToCategoryMap: Record<string, string> = {
        Tops: 'CLOTHING',
        Jeans: 'CLOTHING',
        Hoodies: 'CLOTHING',
        Shirts: 'CLOTHING',
        Trousers: 'CLOTHING',
        Coats: 'CLOTHING',
        Jackets: 'CLOTHING',

        Sneakers: 'SHOES',
        Heels: 'SHOES',

        'Floral dresses': 'DRESSES',
        'Maxi dresses': 'DRESSES',
        'Evening dresses': 'DRESSES',

        Bags: 'ACCESSORIES',

        Joggers: 'ACTIVEWEAR',
        Leggings: 'ACTIVEWEAR',
        'Workout tops': 'ACTIVEWEAR',
    };

    const buildFavoriteCategories = (
        selectedStyles: string[] = [],
        gender: 'women' | 'men'
    ): FavoriteCategoryCard[] => {
        const collectedSubcategories: string[] = [];

        selectedStyles.forEach((style) => {
            const mappedSubcategories = styleToSubcategories[style] ?? [];

            mappedSubcategories.forEach((subcategory) => {
                if (!collectedSubcategories.includes(subcategory)) {
                    collectedSubcategories.push(subcategory);
                }
            });
        });

        return collectedSubcategories
            .map((subcategory) => {
                const matchedProduct = products.find(
                    (product) =>
                        product.gender === gender &&
                        product.subCategory === subcategory &&
                        product.images?.length > 0
                );

                return {
                    label: subcategory.toLowerCase(),
                    category: subcategoryToCategoryMap[subcategory],
                    subcategory,
                    imageKey: matchedProduct?.images?.[0],
                };
            })
            .filter((item) => item.category && item.imageKey)
            .slice(0, 6);
    };

    const [favoriteCategoryCards, setFavoriteCategoryCards] = useState<FavoriteCategoryCard[]>([]);



    const closeSearchPanel = () => {
        setIsFocused(false);
        searchInputRef.current?.blur();
        Keyboard.dismiss();
    };

    useEffect(() => {
        loadRecentSearches();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            loadRecentSearches();
            checkTrackBanner();
        }, [])
    );

    const checkTrackBanner = async () => {
        const userData = await AsyncStorage.getItem('currentUser');
        if (!userData) return;

        const email = JSON.parse(userData).email;

        const seen = await AsyncStorage.getItem(`track_banner_shown_${email}`);
        const savedPreferences = await AsyncStorage.getItem(`tracking_preferences_${email}`);

        if (savedPreferences) {
            try {
                const parsed = JSON.parse(savedPreferences);
                const enabled = !!parsed?.enabled;

                setTrackingEnabled(enabled);
                setShowTrackingReminder(!enabled);

                if (!seen) {
                    setTimeout(() => setShowTrackBanner(true), 800);
                }

                return;
            } catch {
                setTrackingEnabled(false);
                setShowTrackingReminder(true);
                return;
            }
        }

        setTrackingEnabled(false);

        if (!seen) {
            setTimeout(() => setShowTrackBanner(true), 800);
            setShowTrackingReminder(false);
        } else {
            setShowTrackingReminder(true);
        }
    };

    const dismissTrackBanner = async (save = false) => {
        const userData = await AsyncStorage.getItem('currentUser');
        if (!userData) return;

        const email = JSON.parse(userData).email;

        await AsyncStorage.setItem(`track_banner_shown_${email}`, 'true');

        if (save) {
            await AsyncStorage.setItem(
                `tracking_preferences_${email}`,
                JSON.stringify({ enabled: trackingEnabled })
            );

            setShowTrackingReminder(!trackingEnabled);
        } else {
            setShowTrackingReminder(true);
        }

        setShowTrackBanner(false);
    };

    const handleReminderSwitchChange = async (value: boolean) => {
        setTrackingEnabled(value);

        const userData = await AsyncStorage.getItem('currentUser');
        if (!userData) return;

        const email = JSON.parse(userData).email;

        await AsyncStorage.setItem(`track_banner_shown_${email}`, 'true');
        await AsyncStorage.setItem(
            `tracking_preferences_${email}`,
            JSON.stringify({ enabled: value })
        );

        setShowTrackingReminder(!value);
    };

    const openTrackingPopupAgain = () => {
        setShowTrackBanner(true);
    };

    const loadRecentSearches = async () => {
        const stored = await AsyncStorage.getItem('recentSearches');
        setRecentSearches(stored ? JSON.parse(stored) : []);
    };

    const clearRecentSearches = async () => {
        await AsyncStorage.removeItem('recentSearches');
        setRecentSearches([]);
    };

    const { toggleWishlist, isInWishlist } = useWishlist();

    const saveSearch = async (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        const stored = await AsyncStorage.getItem('recentSearches');
        const existing: string[] = stored ? JSON.parse(stored) : [];
        const updated = [
            trimmed,
            ...existing.filter(item => item.toLowerCase() !== trimmed.toLowerCase()),
        ].slice(0, 10);
        setRecentSearches(updated);
        await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const handleHomeSearch = async () => {
        const trimmed = homeSearchText.trim();
        if (!trimmed) return;
        await saveSearch(trimmed);
        router.push({ pathname: '/search_items', params: { query: trimmed, gender: 'WOMAN' } });
        setHomeSearchText('');
        closeSearchPanel();
    };

    const matchesBudget = (price: number, budget: string) => {
        switch (budget) {
            case 'low':
                return price <= 30;
            case 'mid':
                return price > 30 && price <= 80;
            case 'high':
                return price > 80 && price <= 150;
            case 'luxury':
                return price > 150;
            default:
                return true;
        }
    };

    const matchesStyles = (productTags: string[] = [], selectedStyles: string[] = []) => {
        if (!selectedStyles.length) return true;

        const normalizedProductTags = productTags.map(tag => tag.toLowerCase());
        const normalizedSelectedStyles = selectedStyles.map(style => style.toLowerCase());

        return normalizedSelectedStyles.some(style =>
            normalizedProductTags.includes(style)
        );
    };

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

                const selectedGender = profile.gender === 'Man' ? 'men' : 'women';
                const genderParam = profile.gender === 'Man' ? 'MAN' : 'WOMAN';

                const filtered = products.filter((product) => {
                    const genderMatch =
                        profile.gender === 'Man'
                            ? product.gender === 'men'
                            : product.gender === 'women';

                    const budgetMatch = profile.budget
                        ? matchesBudget(product.price, profile.budget)
                        : true;

                    const styleMatch = matchesStyles(product.tags ?? [], profile.styles ?? []);

                    return genderMatch && budgetMatch && styleMatch;
                });

                const fallback = products.filter((product) => {
                    const genderMatch =
                        profile.gender === 'Man'
                            ? product.gender === 'men'
                            : product.gender === 'women';

                    const budgetMatch = profile.budget
                        ? matchesBudget(product.price, profile.budget)
                        : true;

                    return genderMatch && budgetMatch;
                });

                setFilteredProducts(
                    filtered.length > 0 ? filtered.slice(0, 6) : fallback.slice(0, 6)
                );

                const dynamicFavoriteCategories = buildFavoriteCategories(
                    profile.styles ?? [],
                    selectedGender
                );

                if (dynamicFavoriteCategories.length > 0) {
                    setFavoriteCategoryCards(dynamicFavoriteCategories);
                } else {
                    const fallbackSubcategories = ['Jeans', 'Tops', 'Jackets'];

                    const fallbackCards = fallbackSubcategories
                        .map((subcategory) => {
                            const matchedProduct = products.find(
                                (product) =>
                                    product.gender === selectedGender &&
                                    product.subCategory === subcategory &&
                                    product.images?.length > 0
                            );

                            return {
                                label: subcategory.toLowerCase(),
                                category: subcategoryToCategoryMap[subcategory],
                                subcategory,
                                imageKey: matchedProduct?.images?.[0],
                            };
                        })
                        .filter((item) => item.category && item.imageKey);

                    setFavoriteCategoryCards(fallbackCards);
                }
            } else {
                setFilteredProducts(products.filter(p => p.gender === 'women').slice(0, 6));

                const fallbackSubcategories = ['Jeans', 'Tops', 'Jackets'];

                const fallbackCards = fallbackSubcategories
                    .map((subcategory) => {
                        const matchedProduct = products.find(
                            (product) =>
                                product.gender === 'women' &&
                                product.subCategory === subcategory &&
                                product.images?.length > 0
                        );

                        return {
                            label: subcategory.toLowerCase(),
                            category: subcategoryToCategoryMap[subcategory],
                            subcategory,
                            imageKey: matchedProduct?.images?.[0],
                        };
                    })
                    .filter((item) => item.category && item.imageKey);

                setFavoriteCategoryCards(fallbackCards);
            }
        };

        if (products.length > 0) loadData();
    }, [products]);

    const cards = [
        { image: require('../../assets/images_app/model2.png'), label: 'denim' },
        { image: require('../../assets/images_app/model3.png'), label: 'dress' },
        { image: require('../../assets/images_app/model4.png'), label: 'spring' },
        { image: require('../../assets/images_app/model5.png'), label: 'shoes' },
        { image: require('../../assets/images_app/model6.png'), label: 'swim' },
        { image: require('../../assets/images_app/model7.png'), label: 'favorites' },
    ];

    const brands = [
        { image: require('../../assets/images_app/brand1.png'), brand: 'Zara' },
        { image: require('../../assets/images_app/brand2.png'), brand: 'Mango' },
        { image: require('../../assets/images_app/brand3.png'), brand: 'Nike' },
        { image: require('../../assets/images_app/brand4.png'), brand: 'Adidas' },
        { image: require('../../assets/images_app/brand5.png'), brand: 'Gucci' },
    ];

    const handleBrandPress = (brand: string) => {
        router.push({ pathname: '/search_items', params: { query: brand, gender: 'WOMAN' } });
    };

    const handleHomeCategoryPress = (label: string) => {
        switch (label.toLowerCase()) {
            case 'denim':
                router.push({ pathname: '/search_items', params: { category: 'CLOTHING', subcategory: 'Jeans', gender: 'WOMAN' } });
                break;
            case 'dress':
                router.push({ pathname: '/search_items', params: { category: 'DRESSES', gender: 'WOMAN' } });
                break;
            case 'spring':
                router.push({ pathname: '/search_items', params: { category: 'CLOTHING', subcategory: 'Tops', gender: 'WOMAN' } });
                break;
            case 'shoes':
                router.push({ pathname: '/search_items', params: { category: 'SHOES', gender: 'WOMAN' } });
                break;
            case 'swim':
                router.push({ pathname: '/search_items', params: { category: 'ACTIVEWEAR', gender: 'WOMAN' } });
                break;
            case 'favorites':
                router.push({ pathname: '/search_items', params: { subcategory: 'Best sellers', gender: 'WOMAN' } });
                break;
            default:
                router.push('/(tabs)/search');
                break;
        }
    };



    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                {/* Implicit Feedback Modal */}
                <Modal
                    visible={showTrackBanner}
                    transparent
                    animationType="fade"
                    onRequestClose={() => dismissTrackBanner(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => dismissTrackBanner(false)}
                    >
                        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                            <View style={styles.modalCard}>
                                <Text style={styles.modalEmoji}>✨⭐️✨</Text>
                                <Text style={styles.modalTitle}>Level up your vibe</Text>
                                <Text style={styles.modalSubtitle}>
                                    Share your shopping activities so that it allows you to get the best clothes that suits your vibe ✨
                                </Text>

                                <View style={styles.toggleRow}>
                                    <View style={styles.toggleTextBlock}>
                                        <Text style={styles.toggleLabel}>Share shopping activity</Text>
                                        <Text style={styles.toggleDescription}>
                                            Browsing, wishlist, searches and purchases
                                        </Text>
                                    </View>
                                    <Switch
                                        value={trackingEnabled}
                                        onValueChange={setTrackingEnabled}
                                        trackColor={{ false: '#dedede', true: '#111' }}
                                        thumbColor="#fff"
                                        ios_backgroundColor="#b8b8b8"
                                    />
                                </View>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity onPress={() => dismissTrackBanner(false)}>
                                        <Text style={styles.modalNotNow}>Not now</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalButton}
                                        onPress={() => dismissTrackBanner(true)}
                                    >
                                        <Text style={styles.modalButtonText}>Let's go!</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>

                {/* FIXED TOP */}
                <View style={styles.topArea}>
                    <View style={styles.topBar}>
                        <ImageBackground
                            source={require('../../assets/images_app/search.jpg')}
                            style={styles.searchWrapper}
                            imageStyle={{ borderRadius: 12 }}
                        >
                            <TouchableOpacity onPress={handleHomeSearch}>
                                <Feather name="search" size={18} color="#393939" />
                            </TouchableOpacity>
                            <TextInput
                                ref={searchInputRef}
                                placeholder="Search"
                                placeholderTextColor="#393939"
                                style={styles.searchInput}
                                value={homeSearchText}
                                onChangeText={setHomeSearchText}
                                onSubmitEditing={handleHomeSearch}
                                onFocus={() => setIsFocused(true)}
                                returnKeyType="search"
                            />
                        </ImageBackground>

                        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/wishlist')}>
                            <Feather name="heart" size={20} color="#393939" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/account')}>
                            <Feather name="user" size={22} color="#393939" />
                        </TouchableOpacity>
                    </View>
                    {showTrackingReminder && !isFocused && (
                        <View style={styles.trackingReminderCard}>
                            <TouchableOpacity
                                style={styles.trackingReminderPressArea}
                                activeOpacity={0.9}
                                onPress={openTrackingPopupAgain}
                            >
                                <View style={styles.trackingReminderLeft}>
                                    <View style={styles.trackingReminderIconWrap}>
                                        <Feather name="star" size={15} color="#111" />
                                    </View>

                                    <View style={styles.trackingReminderTextWrap}>
                                        <Text style={styles.trackingReminderTitle}>Enable personalization</Text>
                                        <Text style={styles.trackingReminderSubtitle} numberOfLines={2}>
                                            Turn on shopping your activity.
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            <Switch
                                value={trackingEnabled}
                                onValueChange={handleReminderSwitchChange}
                                trackColor={{ false: '#c2c2c2', true: '#111' }}
                                thumbColor="#fff"
                                ios_backgroundColor="#b8b8b8"
                            />
                        </View>
                    )}

                    {isFocused && (
                        <View style={styles.recentContainer}>
                            <View style={styles.recentHeader}>
                                <Text style={styles.recentTitle}>Recent searches</Text>
                                {recentSearches.length > 0 && (
                                    <TouchableOpacity style={styles.clearButton} onPress={clearRecentSearches}>
                                        <Text style={styles.clearText}>Clear</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {recentSearches.length === 0 ? (
                                <View style={styles.emptyWrapper}>
                                    <Feather name="search" size={28} color="#8a8a8a" />
                                    <Text style={styles.emptyText}>You have no recent searches</Text>
                                </View>
                            ) : (
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.recentScrollContent} nestedScrollEnabled>
                                    {recentSearches.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.recentItem}
                                            onPress={async () => {
                                                await saveSearch(item);
                                                setHomeSearchText(item);
                                                closeSearchPanel();
                                                router.push({ pathname: '/search_items', params: { query: item, gender: 'WOMAN' } });
                                            }}
                                        >
                                            <Feather name="clock" size={16} color="#6a6a6a" />
                                            <Text style={styles.recentItemText}>{item}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    )}
                </View>

                {isFocused && <Pressable style={styles.searchOverlay} onPress={closeSearchPanel} />}

                {/* SCROLLING PAGE */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    onScrollBeginDrag={closeSearchPanel}
                >
                    <Image source={require('../../assets/images_app/model1.png')} style={styles.heroImage} resizeMode="cover" />

                    <View style={styles.headingWrapper}>
                        <Text style={styles.headingLineBlack}>New</Text>
                        <View style={styles.collectionRow}>
                            <Text style={styles.headingLineBlack}>collecti</Text>
                            <Text style={styles.headingLineWhite}>on</Text>
                        </View>
                    </View>

                    <View style={styles.newSection}>
                        <Text style={styles.newTitle}>New items</Text>
                        <Text style={styles.newSubtitle}>News from the world of fashion designed for enthusiasts</Text>
                    </View>

                    {Array.from({ length: Math.ceil(cards.length / 2) }).map((_, rowIndex) => (
                        <View key={rowIndex} style={styles.cardsRow}>
                            {cards.slice(rowIndex * 2, rowIndex * 2 + 2).map((item, index) => (
                                <TouchableOpacity key={index} style={styles.card} onPress={() => handleHomeCategoryPress(item.label)}>
                                    <ImageBackground source={item.image} style={styles.cardImage} resizeMode="cover">
                                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.cardGradient} />
                                        <Text style={styles.cardLabel}>{item.label}</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))}

                    <ImageBackground source={require('../../assets/images_app/search.jpg')} style={styles.ctaWrapper} imageStyle={{ borderRadius: 16 }}>
                        <Text style={styles.ctaText}>Hey {userName}, try the new assistant for creating your dream outfits</Text>
                        <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/(tabs)/builder')}>
                            <Text style={styles.ctaButtonText}>TRY NOW</Text>
                        </TouchableOpacity>
                    </ImageBackground>

                    <View style={styles.favoritesSection}>
                        <Text style={styles.favoritesTitle}>Your favorite categories</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.favoritesScroll}>
                            {favoriteCategoryCards.map((item, index) => {
                                const imageSource = item.imageKey ? productImages[item.imageKey] : null;

                                if (!imageSource) return null;

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.favoriteCard}
                                        onPress={() =>
                                            router.push({
                                                pathname: '/search_items',
                                                params: {
                                                    category: item.category,
                                                    subcategory: item.subcategory,
                                                    gender: 'WOMAN',
                                                },
                                            })
                                        }
                                    >
                                        <ImageBackground
                                            source={imageSource}
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
                                );
                            })}
                        </ScrollView>
                    </View>

                    <View style={styles.tasteSection}>
                        <Text style={styles.tasteTitle}>Your taste</Text>
                        <View style={styles.productsGrid}>
                            {filteredProducts.map((item) => {
                                const imageKey = item.images?.[0];
                                const imageSource = imageKey ? productImages[imageKey] : null;
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.productCard}
                                        activeOpacity={0.9}
                                        onPress={() => router.push({
                                            pathname: '/product_detail',
                                            params: {
                                                productId: item.id,
                                                category: item.mainCategory,
                                                subcategory: item.subCategory,
                                                gender: item.gender === 'women' ? 'WOMAN' : 'MAN',
                                            },
                                        })}
                                    >
                                        {imageSource && <Image source={imageSource} style={styles.productImage} resizeMode="cover" />}
                                        <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                                        <Text style={styles.productPrice}>€{item.price.toFixed(2)}</Text>
                                        <TouchableOpacity
                                            style={styles.cartButton}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                toggleWishlist({
                                                    id: item.id, name: item.name, price: item.price,
                                                    image: imageSource, category: item.mainCategory,
                                                    subcategory: item.subCategory,
                                                    gender: item.gender === 'women' ? 'WOMAN' : 'MAN',
                                                });
                                            }}
                                        >
                                            <MaterialIcons name="favorite-border" size={18} color={isInWishlist(item.id) ? '#df2518' : '#111'} />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <TouchableOpacity
                            style={styles.showAllButton}
                            onPress={() => router.push({ pathname: '/search_items', params: { category: 'CLOTHING', subcategory: 'All', gender: 'WOMAN' } })}
                        >
                            <Text style={styles.showAllText}>SHOW ALL</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.playgroundCard}>
                        <View style={styles.playgroundTextWrap}>
                            <Text style={styles.playgroundTitle}>Bored of your style?</Text>
                            <Text style={styles.playgroundSubtitle}>
                                Explore new outfit vibes and try fresh visual directions without affecting your personalization.
                            </Text>
                        </View>

                        <TouchableOpacity onPress={() => router.push('/playground')}>
                            <Svg width={100} height={100} viewBox="0 0 100 100">
                                <Path
                                    d="M50 5 L61 35 L95 35 L67 57 L78 90 L50 70 L22 90 L33 57 L5 35 L39 35 Z"
                                    fill="#111"
                                    stroke="#111"
                                    strokeWidth={4}
                                    strokeLinejoin="round"
                                />
                                <SvgText
                                    x="50"
                                    y="55"
                                    fontSize="14"
                                    fill="#fff"
                                    fontWeight="800"
                                    textAnchor="middle"
                                >
                                    PLAY
                                </SvgText>
                            </Svg>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.brandsSection}>
                        <Text style={styles.brandsTitle}>Brand picks</Text>
                        <Text style={styles.brandsSubtitle}>All your fave brands, one place</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsScroll}>
                            {brands.map((item, index) => (
                                <TouchableOpacity key={index} style={styles.brandCard} onPress={() => handleBrandPress(item.brand)}>
                                    <Image source={item.image} style={styles.brandImage} resizeMode="cover" />
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
    container: { flex: 1, backgroundColor: '#f3f3f3' },
    scrollContent: { paddingBottom: 20, paddingHorizontal: 14 },
    topArea: { paddingHorizontal: 14, paddingTop: 8, backgroundColor: '#f3f3f3', zIndex: 20 },
    topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 6 },
    searchWrapper: { flex: 1, height: 44, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, overflow: 'hidden' },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#222' },
    profileButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: '#6a6a6a', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f3f3' },
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
    brandsSection: { marginTop: 32, marginBottom: 20 },
    brandsTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
    brandsSubtitle: { fontSize: 13, color: '#393939', marginBottom: 14 },
    brandsScroll: { paddingRight: 14 },
    brandCard: { width: 110, height: 70, marginRight: 10, borderRadius: 12, overflow: 'hidden', backgroundColor: '#eee' },
    brandImage: { width: '100%', height: '100%' },
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
    recentContainer: { backgroundColor: '#f3f3f3', borderRadius: 12, padding: 12, marginBottom: 10, marginTop: -4, alignSelf: 'stretch' },
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, maxHeight: 240 },
    recentTitle: { fontSize: 17, fontWeight: '600', color: '#111' },
    clearButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: '#dedede' },
    clearText: { fontSize: 14, fontWeight: '600', color: '#393939' },
    recentScrollContent: { paddingBottom: 4 },
    recentItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
    recentItemText: { fontSize: 15, color: '#111' },
    emptyWrapper: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
    emptyText: { marginTop: 8, fontSize: 14, color: '#8a8a8a', textAlign: 'center' },
    searchOverlay: { ...StyleSheet.absoluteFillObject, top: 74, backgroundColor: 'transparent', zIndex: 10 },

    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
    },
    modalCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24,
        width: '100%', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    },
    modalEmoji: { fontSize: 28, textAlign: 'center', marginBottom: 12 },
    modalTitle: {
        fontSize: 22, fontWeight: '800', color: '#111',
        textAlign: 'center', marginBottom: 10, letterSpacing: -0.5,
    },
    modalSubtitle: {
        fontSize: 13, color: '#6a6a6a', textAlign: 'center',
        lineHeight: 20, marginBottom: 24,
    },
    toggleRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingVertical: 14,
        borderWidth: 1, borderColor: '#f0f0f0',
        borderRadius: 14, paddingHorizontal: 14,
        backgroundColor: '#f8f8f8', marginBottom: 24,
    },
    toggleTextBlock: { flex: 1, paddingRight: 12 },
    toggleLabel: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 2 },
    toggleDescription: { fontSize: 12, color: '#8a8a8a' },
    modalButtons: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    modalNotNow: { fontSize: 14, fontWeight: '600', color: '#8a8a8a' },
    modalButton: {
        backgroundColor: '#111', paddingVertical: 13,
        paddingHorizontal: 24, borderRadius: 16,
    },
    modalButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

    trackingReminderCard: {
        marginTop: -4,
        marginBottom: 12,
        borderRadius: 14,
        backgroundColor: '#e7e7e7',
        borderWidth: 1,
        borderColor: '#d8d8d8',
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },

    trackingReminderPressArea: {
        flex: 1,
    },

    trackingReminderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },

    trackingReminderIconWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f3f3f3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    trackingReminderTextWrap: {
        flex: 1,
        paddingRight: 8,
        marginTop: 2,
    },

    trackingReminderTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
        marginBottom: 2,
    },

    trackingReminderSubtitle: {
        fontSize: 12,
        lineHeight: 16,
        color: '#6a6a6a',
    },

    playgroundCard: {
        marginTop: 22,
        backgroundColor: '#dedede',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#d8d8d8',
        alignItems: 'center',
    },

    playgroundTextWrap: {
        marginBottom: 14,
    },

    playgroundTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
        marginBottom: 6,
    },

    playgroundSubtitle: {
        fontSize: 13,
        lineHeight: 18,
        color: '#111',
    },

    playgroundButton: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 18,
    },

    playgroundButtonText: {
        color: '#111',
        fontSize: 13,
        fontWeight: '700',
    },
});