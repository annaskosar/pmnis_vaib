import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Animated, Easing } from 'react-native';
import { useCart, CartProduct } from '../../context/cart_context';
import { useWishlist } from '../../context/wishlist_context';
import { Swipeable } from 'react-native-gesture-handler';
import { Linking } from 'react-native';
import { useProducts, sizeOptions } from '../../context/product_context';
import { productImages } from '../../context/product_images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useWardrobe } from '../../context/wardrobe_context';


const { width } = Dimensions.get('window');

const IMAGE_HEIGHT = 420;
const RECOMMEND_CARD_WIDTH = 158;


const COLORS = {
    bg: '#f2f2f2',
    surface: '#dedede',
    surface2: '#e6e6e6',
    surface3: '#d4d4d4',
    border: '#c8c8c8',
    text: '#111',
    textSoft: '#666',
    textMuted: '#8a8a8a',
    black: '#111',
    white: '#fff',
    danger: '#c63d3d',
};

type MiniProduct = {
    id: string;
    image: any;
    name: string;
    price: string;
};

type ProductColorVariant = {
    id: string;
    name: string;
    swatch: string;
    images: any[];
    disabled?: boolean;
};

const mayRockItems: MiniProduct[] = [
    { id: '1', image: require('../../assets/images_app/model8.jpg'), name: 'Soft minimal top', price: '€24.99' },
    { id: '2', image: require('../../assets/images_app/model9.jpg'), name: 'Clean ribbed tee', price: '€31.99' },
    { id: '3', image: require('../../assets/images_app/model10.jpg'), name: 'Slim fitted long sleeve', price: '€28.99' },
    { id: '4', image: require('../../assets/images_app/model11.jpg'), name: 'Basic body fit top', price: '€22.99' },
    { id: '5', image: require('../../assets/images_app/model3.jpg'), name: 'Essential fitted piece', price: '€19.99' },
];


type BuilderLook = {
    id: string;
    image: any;
    title: string;
    itemIds: string[];
};

const builderLooks: BuilderLook[] = [
    {
        id: 'b1',
        image: require('../../assets/images_app/model4.jpg'),
        title: 'Casual',
        itemIds: ['jeans1', 'top7', 'shirt2', 'coat10'],
    },
    {
        id: 'b2',
        image: require('../../assets/images_app/model10.jpg'),
        title: 'Sporty',
        itemIds: ['jeans2', 'top3', 'coat12', 'shirt6'],
    },
];



const peopleDecisionItems: MiniProduct[] = [
    { id: 'p1', image: require('../../assets/images_app/model11.jpg'), name: 'Layering cotton top', price: '€27.99' },
    { id: 'p2', image: require('../../assets/images_app/model8.jpg'), name: 'Soft contour fit', price: '€20.99' },
    { id: 'p3', image: require('../../assets/images_app/model9.jpg'), name: 'Minimal daily essential', price: '€26.99' },
    { id: 'p4', image: require('../../assets/images_app/model10.jpg'), name: 'Modern rib top', price: '€23.99' },
];

function renderStars(value: number, size = 16) {
    const fullStars = Math.round(value);
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons key={star} name="star" size={size} color={star <= fullStars ? COLORS.black : '#cfcfcf'} style={{ marginRight: 1 }} />
            ))}
        </View>
    );
}

function FitMeter({ fit }: { fit: 'Slim' | 'Fitted' | 'Regular' | 'Oversized' | 'Baggy' }) {
    const getPosition = () => {
        switch (fit) {
            case 'Slim': return '8%';
            case 'Fitted': return '28%';
            case 'Regular': return '48%';
            case 'Oversized': return '68%';
            case 'Baggy': return '84%';
            default: return '48%';
        }
    };
    return (
        <View style={styles.fitMeterWrapper}>
            <View style={styles.fitMeterLabels}>
                <Text style={styles.fitMeterText}>Slim</Text>
                <Text style={styles.fitMeterText}>Regular</Text>
                <Text style={styles.fitMeterText}>Baggy</Text>
            </View>
            <View style={styles.fitMeterTrack}>
                <View style={[styles.fitMeterDot, { left: getPosition() }]} />
            </View>
            <Text style={{ marginTop: 8, fontSize: 13, color: COLORS.text, fontWeight: '700' }}>{fit}</Text>
        </View>
    );
}

function ReviewBar({ leftLabel, rightLabel, value }: { leftLabel: string; rightLabel: string; value: number }) {
    return (
        <View style={styles.reviewBarBlock}>
            <View style={styles.reviewBarLabels}>
                <Text style={styles.reviewBarLabel}>{leftLabel}</Text>
                <Text style={styles.reviewBarLabel}>{rightLabel}</Text>
            </View>
            <View style={styles.reviewTrack}>
                <View style={[styles.reviewTrackFill, { width: `${value}%` }]} />
            </View>
        </View>
    );
}

function MiniProductCard({
                             item,
                             onOpenCartPicker,
                             onToggleWishlist,
                             wished,
                         }: {
    item: MiniProduct;
    onOpenCartPicker: () => void;
    onToggleWishlist: () => void;
    wished: boolean;
}) {
    return (
        <View style={styles.miniProductCard}>
            <View>
                <Image source={item.image} style={styles.miniProductImage} contentFit="cover" cachePolicy="memory-disk" transition={150} />
                <TouchableOpacity style={styles.miniCartButton} onPress={onOpenCartPicker} activeOpacity={0.7}>
                    <Feather name="shopping-cart" size={14} color={COLORS.black} />
                </TouchableOpacity>
            </View>
            <View style={styles.miniInfoRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.miniPrice}>{item.price}</Text>
                    <Text style={styles.miniName} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
                </View>
                <TouchableOpacity style={styles.miniHeartButton} onPress={onToggleWishlist}>
                    <Feather
                        name="heart"
                        size={18}
                        color={wished ? '#e74c3c' : COLORS.black}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function hexToRgb(hex: string) {
    const cleaned = hex.replace('#', '');

    if (cleaned.length !== 6) return null;

    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);

    return { r, g, b };
}

function getBrightness(hex: string) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 128;

    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

function isDarkHex(hex: string) {
    return getBrightness(hex) < 128;
}

function isLightHex(hex: string) {
    return getBrightness(hex) >= 128;
}

function getProductTypeKey(product: any) {
    const sub = product?.subCategory ?? '';

    if (sub === 'Jeans') return 'jeans';
    if (sub === 'Trousers') return 'trousers';
    if (sub === 'Tops') return 'tops';
    if (sub === 'Shirts') return 'shirts';
    if (sub === 'Jackets') return 'jackets';
    if (sub === 'Coats') return 'coats';
    if (sub === 'Hoodies') return 'hoodies';
    if (sub === 'Sneakers') return 'sneakers';
    if (sub === 'Boots') return 'boots';
    if (sub === 'Heels') return 'heels';
    if (sub === 'Bags') return 'bags';

    return sub.toLowerCase();
}


function normalizeColor(color?: string | null) {
    if (!color) return '';

    const value = color.toLowerCase().trim();

    if (value === 'grey') return 'gray';
    if (value === 'burgundy') return 'red';
    if (value === 'cream') return 'white';
    if (value === 'camel') return 'beige';
    if (value === 'purple') return 'pink';

    return value;
}

function areSimilarColors(productColor?: string | null, wardrobeColor?: string | null) {
    const p = normalizeColor(productColor);
    const w = normalizeColor(wardrobeColor);

    if (!p || !w) return true;
    if (p === w) return true;

    const darkGroup = ['black', 'gray', 'brown'];
    const lightGroup = ['white', 'cream', 'beige', 'camel'];
    const blueGroup = ['blue'];
    const redGroup = ['red', 'burgundy'];
    const pinkGroup = ['pink', 'purple'];
    const greenGroup = ['green'];
    const yellowGroup = ['yellow', 'orange'];

    const groups = [
        darkGroup,
        lightGroup,
        blueGroup,
        redGroup,
        pinkGroup,
        greenGroup,
        yellowGroup,
    ];

    return groups.some((group) => group.includes(p) && group.includes(w));
}



export default function ProductDetailScreen() {
    const router = useRouter();
    const { productId, category, subcategory, gender, from } = useLocalSearchParams();
    const genderValue = Array.isArray(gender) ? gender[0] : gender;
    const { carts, addProductToCart, deleteCart } = useCart();
    const { getProductById, products } = useProducts();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { wardrobeItems } = useWardrobe();

    const pulse1 = React.useRef(new Animated.Value(1)).current;
    const pulse2 = React.useRef(new Animated.Value(1)).current;
    const pulse3 = React.useRef(new Animated.Value(1)).current;

    const [showDuplicateFeedbackModal, setShowDuplicateFeedbackModal] = React.useState(false);
    const [duplicateFeedbackSubmitted, setDuplicateFeedbackSubmitted] = React.useState(false);
    const [duplicateFeedbackChoice, setDuplicateFeedbackChoice] = React.useState<'yes' | 'no' | null>(null);
    const [pendingDuplicateAction, setPendingDuplicateAction] = React.useState<'close' | 'add' | null>(null);

    const productIdValue = Array.isArray(productId) ? productId[0] : productId;
    const categoryName = Array.isArray(category) ? category[0] : category;
    const subcategoryName = Array.isArray(subcategory) ? subcategory[0] : subcategory;

    const product = typeof productIdValue === 'string' ? getProductById(productIdValue) : undefined;

    const [selectedColorId, setSelectedColorId] = React.useState<string | null>(null);
    const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
    const [imageIndex, setImageIndex] = React.useState(0);
    const [showSizeModal, setShowSizeModal] = React.useState(false);
    const [showSaveSheet, setShowSaveSheet] = React.useState(false);
    const [showCartPicker, setShowCartPicker] = React.useState(false);
    const [showImageViewer, setShowImageViewer] = React.useState(false);
    const [showSizeGuide, setShowSizeGuide] = React.useState(false);
    const [showEcoModal, setShowEcoModal] = React.useState(false);
    const [ecoAlternativeIndex, setEcoAlternativeIndex] = React.useState(0);
    const [showDuplicateModal, setShowDuplicateModal] = React.useState(false);
    const openCartPicker = () => setShowCartPicker(true);
    const closeCartPicker = () => setShowCartPicker(false);

    const fullscreenScrollRef = React.useRef<ScrollView>(null);
    const scrollX = React.useRef(new Animated.Value(0)).current;

    const getCartItemsCount = (cart: { products: CartProduct[] }) =>
        cart.products.reduce((sum, product) => sum + product.quantity, 0);


    const [openPanels, setOpenPanels] = React.useState({ delivery: true, sizeFit: false, productDetails: false });

    function normalizeText(text: string) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    function getDuplicateKeywords(product: any, subcategoryName?: string, categoryName?: string) {
        const rawText = [
            product?.name ?? '',
            subcategoryName ?? '',
            categoryName ?? '',
            ...(product?.tags ?? []),
        ].join(' ');

        const text = normalizeText(rawText);

        if (
            text.includes('jeans') ||
            text.includes('jean') ||
            text.includes('rifle') ||
            text.includes('denim') ||
            text.includes('pants') ||
            text.includes('trousers')
        ) {
            return ['jeans', 'jean', 'rifle', 'denim', 'pants', 'trousers'];
        }

        if (
            text.includes('bag') ||
            text.includes('bags') ||
            text.includes('handbag') ||
            text.includes('kabelka')
        ) {
            return ['bag', 'bags', 'handbag', 'kabelka'];
        }

        if (
            text.includes('shoe') ||
            text.includes('shoes') ||
            text.includes('topanky') ||
            text.includes('boots') ||
            text.includes('boot') ||
            text.includes('heels') ||
            text.includes('heel') ||
            text.includes('sneakers') ||
            text.includes('sneaker')
        ) {
            return ['shoe', 'shoes', 'topanky', 'boots', 'boot', 'heels', 'heel', 'sneakers', 'sneaker'];
        }

        if (
            text.includes('top') ||
            text.includes('tricko') ||
            text.includes('bluzka') ||
            text.includes('blouse') ||
            text.includes('tielko') ||
            text.includes('shirt') ||
            text.includes('tee') ||
            text.includes('t-shirt')
        ) {
            return ['top', 'tricko', 'bluzka', 'blouse', 'tielko', 'shirt', 'tee', 't-shirt'];
        }

        if (
            text.includes('jacket') ||
            text.includes('coat') ||
            text.includes('bunda') ||
            text.includes('kabat')
        ) {
            return ['jacket', 'coat', 'bunda', 'kabat'];
        }

        if (
            text.includes('dress') ||
            text.includes('saty')
        ) {
            return ['dress', 'saty'];
        }

        if (
            text.includes('skirt') ||
            text.includes('sukna')
        ) {
            return ['skirt', 'sukna'];
        }

        return [];
    }

    React.useEffect(() => {
        if (!showDuplicateModal) {
            pulse1.stopAnimation();
            pulse2.stopAnimation();
            pulse3.stopAnimation();

            pulse1.setValue(1);
            pulse2.setValue(1);
            pulse3.setValue(1);
            return;
        }

        const createPulse = (anim: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, {
                        toValue: 1.08,
                        duration: 700,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 700,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.delay(250),
                ])
            );

        pulse1.setValue(1);
        pulse2.setValue(1);
        pulse3.setValue(1);

        const animation1 = createPulse(pulse1, 0);
        const animation2 = createPulse(pulse2, 300);
        const animation3 = createPulse(pulse3, 600);

        animation1.start();
        animation2.start();
        animation3.start();

        return () => {
            animation1.stop();
            animation2.stop();
            animation3.stop();

            pulse1.setValue(1);
            pulse2.setValue(1);
            pulse3.setValue(1);
        };
    }, [showDuplicateModal]);

    const handleToggleMiniWishlist = (item: MiniProduct) => {
        toggleWishlist({
            id: item.id,
            name: item.name,
            price: Number(item.price.replace('€', '')),
            image: item.image,
            category: 'CLOTHING',
            subcategory: 'People decision',
            gender: genderValue ?? 'WOMAN',
        });
    };

    if (!product) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 16 }}>Product not found</Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: '#111', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const colorVariants: ProductColorVariant[] = product.availableColors.map((color, index) => ({
        id: `${product.id}-${index}`,
        name: color.name,
        swatch: color.code,
        images: color.imageKeys.map((key) => productImages[key]).filter(Boolean),
        disabled: false,
    }));

    React.useEffect(() => {
        if (colorVariants.length > 0 && !selectedColorId) {
            setSelectedColorId(colorVariants[0].id);
        }
    }, [colorVariants, selectedColorId]);

    const selectedColor = colorVariants.find((variant) => variant.id === selectedColorId) ?? colorVariants[0];

    const selectedProductColorName =
        selectedColor?.name ??
        product.availableColors?.[0]?.name ??
        null;

    const duplicateKeywords = getDuplicateKeywords(product, subcategoryName, categoryName);

    const duplicateWardrobeItem = wardrobeItems.find((item) => {
        const itemName = normalizeText(item.name ?? '');
        const itemCategory = normalizeText(item.category ?? '');

        const typeMatch = duplicateKeywords.some(
            (keyword) =>
                itemName.includes(keyword) || itemCategory.includes(keyword)
        );

        if (!typeMatch) return false;

        return areSimilarColors(selectedProductColorName, item.color);
    });


    const hasSimilarWardrobeItem = !!duplicateWardrobeItem;


    const ecoData = { name: product.name, ...product.eco };

    const ecoAlternatives = product.eco.ecoAlternativeIds
        .map((alt) => {
            const altProduct = getProductById(alt.productId);
            if (!altProduct) return null;
            const firstImageKey = altProduct.availableColors[0]?.imageKeys[0] ?? altProduct.images[0];
            const imageSource = firstImageKey ? productImages[firstImageKey] : null;
            if (!imageSource) return null;
            return { id: altProduct.id, name: altProduct.name, image: imageSource, ecoScore: alt.ecoScore };
        })
        .filter(Boolean) as { id: string; name: string; image: any; ecoScore: number }[];


    const productGallery = selectedColor?.images?.length
        ? selectedColor.images
        : product.images.map((key) => productImages[key]).filter(Boolean);

    const productToAdd: CartProduct = {
        id: `${product.id}-${selectedColor?.name ?? 'default'}-${selectedSize ?? 'nosize'}`,
        name: `${product.name}${selectedColor ? ` - ${selectedColor.name}` : ''}`,
        price: product.price,
        quantity: 1,
        image: productGallery[imageIndex] ?? productGallery[0],
        note: `${selectedColor?.name ?? ''}${selectedSize ? `, ${selectedSize}` : ''}`,
    };

    const currentColorCode =
        selectedColor?.swatch ??
        product.availableColors?.[0]?.code ??
        '#808080';

    const currentIsDark = isDarkHex(currentColorCode);
    const productTypeKey = getProductTypeKey(product);

    const sameTypeProducts = products.filter((item) => {
        if (item.id === product.id) return false;
        if (item.gender !== product.gender) return false;

        return getProductTypeKey(item) === productTypeKey;
    });

    const contrastProducts = sameTypeProducts.filter((item) => {
        const itemColorCodes = (item.availableColors ?? []).map((color) => color.code);

        if (currentIsDark) {
            return itemColorCodes.some((code) => isLightHex(code));
        }

        return itemColorCodes.some((code) => isDarkHex(code));
    });

    const fallbackProducts = sameTypeProducts.filter(
        (item) => !contrastProducts.some((picked) => picked.id === item.id)
    );

    const duplicateAlternatives = [...contrastProducts, ...fallbackProducts]
        .slice(0, 3)
        .map((item) => {
            const firstImageKey =
                item.availableColors?.[0]?.imageKeys?.[0] ??
                item.images?.[0];

            return {
                id: item.id,
                name: item.name,
                image: firstImageKey ? productImages[firstImageKey] : null,
            };
        })
        .filter((item) => item.image);

    const goToPrevEcoAlternative = () => setEcoAlternativeIndex((prev) => prev === 0 ? ecoAlternatives.length - 1 : prev - 1);
    const goToNextEcoAlternative = () => setEcoAlternativeIndex((prev) => prev === ecoAlternatives.length - 1 ? 0 : prev + 1);

    const currentEcoAlternative = ecoAlternatives[ecoAlternativeIndex];
    const showEcoAlternatives = ecoData.ecoScore < 60;

    const openImageViewer = (index: number) => {
        setImageIndex(index);
        setShowImageViewer(true);
        setTimeout(() => { fullscreenScrollRef.current?.scrollTo({ x: index * width, animated: false }); }, 50);
    };

    const togglePanel = (key: 'delivery' | 'sizeFit' | 'productDetails') => {
        setOpenPanels((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const onImageScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        setImageIndex(Math.round(offsetX / width));
    };



    const getCartTotal = (cart: { products: CartProduct[] }) => {
        return cart.products.reduce((sum, cartProduct) => sum + cartProduct.price * cartProduct.quantity, 0);
    };

    const handleAddToSpecificCart = (cartId: string) => {
        if (!selectedSize) {
            Alert.alert('Select size', 'Please choose a size first.');
            return;
        }

        addProductToCart(cartId, productToAdd);
        closeCartPicker();
        Alert.alert('Added to cart', 'Item was added to your selected cart.');
    };

    const handleEditCart = (cartId: string) => {
        closeCartPicker();
        router.push({ pathname: '/(tabs)/cart_detail', params: { cartId } });
    };

    const handleDeleteCart = (cartId: string) => {
        Alert.alert('Delete cart', 'Are you sure you want to delete this cart?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteCart(cartId) },
        ]);
    };

    const renderCartRightActions = (cartId: string) => (
        <View style={styles.cartSwipeActions}>
            <TouchableOpacity
                style={[styles.cartSwipeButton, styles.cartEditSwipeButton]}
                onPress={() => handleEditCart(cartId)}
            >
                <Feather name="edit-2" size={16} color="#111" />
                <Text style={styles.cartSwipeButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.cartSwipeButton, styles.cartDeleteSwipeButton]}
                onPress={() => handleDeleteCart(cartId)}
            >
                <Feather name="trash-2" size={16} color="#fff" />
                <Text style={styles.cartDeleteSwipeButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    const [savedReviews, setSavedReviews] = React.useState<any[]>([]);

    const storageKey =
        typeof productIdValue === 'string'
            ? `product_reviews_${productIdValue}`
            : '';

    const loadSavedReviews = React.useCallback(async () => {
        if (!storageKey) return;

        try {
            const stored = await AsyncStorage.getItem(storageKey);
            if (stored) {
                setSavedReviews(JSON.parse(stored));
            } else {
                setSavedReviews([]);
            }
        } catch (error) {
            console.log('Failed to load saved reviews', error);
        }
    }, [storageKey]);

    useFocusEffect(
        React.useCallback(() => {
            loadSavedReviews();
        }, [loadSavedReviews])
    );


    const allReviews = [...savedReviews, ...product.reviews];

    const averageRating =
        allReviews.length > 0
            ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
            : 0;

    const reviewCount = allReviews.length;

    const productReviews = allReviews;

    const handleDuplicateFeedback = (choice: 'yes' | 'no') => {
        setDuplicateFeedbackChoice(choice);
        setDuplicateFeedbackSubmitted(true);

        setTimeout(() => {
            setShowDuplicateFeedbackModal(false);
            setDuplicateFeedbackSubmitted(false);
            setDuplicateFeedbackChoice(null);

            if (pendingDuplicateAction === 'add') {
                openCartPicker();
            }

            setPendingDuplicateAction(null);
        }, 1200);
    };



    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.imageSection}>
                    <Animated.ScrollView
                        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16} onMomentumScrollEnd={onImageScrollEnd}
                        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                    >
                        {productGallery.map((image, index) => (
                            <TouchableOpacity key={`${selectedColor?.id ?? 'default'}-${index}`} activeOpacity={1} onPress={() => openImageViewer(index)}>
                                <Image source={image} style={styles.mainImage} contentFit="cover" cachePolicy="memory-disk" transition={150} />
                            </TouchableOpacity>
                        ))}
                    </Animated.ScrollView>

                    <View style={styles.topIconsRow}>
                        <TouchableOpacity onPress={() => {
                            if (from === 'wishlist') {
                                router.replace('/(tabs)/wishlist');
                                return;
                            }
                            if (categoryName && subcategoryName) {
                                router.replace({
                                    pathname: '/search_items',
                                    params: {
                                        category: categoryName,
                                        subcategory: subcategoryName,
                                        gender: genderValue ?? 'WOMAN',
                                    },
                                });
                                return;
                            }
                            router.replace('/search');
                        }}>
                            <Feather name="arrow-left" size={24} color={COLORS.black} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowSaveSheet(true)}>
                            <Feather name="download" size={22} color={COLORS.black} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.imageIndicatorRow}>
                        {productGallery.map((_, index) => {
                            const inputRange = [(index - 2) * width, (index - 1) * width, index * width, (index + 1) * width, (index + 2) * width];
                            const animatedWidth = scrollX.interpolate({ inputRange, outputRange: [14, 20, 34, 20, 14], extrapolate: 'clamp' });
                            const animatedOpacity = scrollX.interpolate({ inputRange, outputRange: [0.18, 0.4, 1, 0.4, 0.18], extrapolate: 'clamp' });
                            const animatedScaleY = scrollX.interpolate({ inputRange, outputRange: [0.8, 0.95, 1.2, 0.95, 0.8], extrapolate: 'clamp' });
                            return (
                                <Animated.View key={index} style={[styles.imageIndicatorLine, { width: animatedWidth, opacity: animatedOpacity, transform: [{ scaleY: animatedScaleY }] }]} />
                            );
                        })}
                    </View>
                </View>

                <View style={styles.quickActionRow}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => toggleWishlist({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: productGallery[0],
                            category: categoryName ?? '',
                            subcategory: subcategoryName ?? '',
                            gender: genderValue ?? 'WOMAN',
                        })}
                    >
                        <Feather
                            name="heart"
                            size={20}
                            color={isInWishlist(product.id) ? '#e74c3c' : COLORS.black}
                        />
                        <Text style={styles.quickActionText}>Wish</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() =>
                            router.push({
                                pathname: '/(tabs)/builder',
                                params: {
                                    preselectedProductId: product.id,
                                    preselectedProductName: product.name,
                                    preselectedProductImageKey: selectedColor?.images?.[0]
                                        ? product.availableColors.find(c => c.name === selectedColor?.name)?.imageKeys?.[0] ?? product.images[0]
                                        : product.images[0],
                                    preselectedProductCategory: subcategoryName ?? '',
                                },
                            })
                        }
                    >
                        <MaterialIcons name="auto-awesome" size={20} color={COLORS.black} />
                        <Text style={styles.quickActionText}>Builder</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => {
                            if (!selectedSize) {
                                Alert.alert('Select size', 'Please choose a size first.');
                                return;
                            }

                            if (hasSimilarWardrobeItem) {
                                setShowDuplicateModal(true);
                                return;
                            }

                            openCartPicker();
                        }}
                    >
                        <Feather name="shopping-cart" size={20} color={COLORS.black} />
                        <Text style={styles.quickActionText}>Cart</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionSpacing}>
                    <Text style={styles.colorLabel}>Color: {selectedColor?.name ?? 'Default'}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {colorVariants.map((variant) => {
                            const active = variant.id === selectedColorId;
                            const disabled = variant.disabled;
                            return (
                                <TouchableOpacity
                                    key={variant.id}
                                    style={[styles.colorCard, active && styles.colorCardActive, disabled && styles.colorCardDisabled]}
                                    disabled={disabled}
                                    onPress={() => { if (!disabled) { setSelectedColorId(variant.id); setImageIndex(0); } }}
                                >
                                    <View style={[styles.colorSwatchLarge, { backgroundColor: variant.swatch }, variant.name === 'White' && styles.whiteSwatchBorder]} />
                                    {disabled && <View style={styles.colorCross} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <Text style={styles.price}>€{product.price.toFixed(2)}</Text>

                {product.oldPrice && (
                    <Text style={{ paddingHorizontal: 16, marginTop: 6, color: '#777', textDecorationLine: 'line-through', fontSize: 14, fontWeight: '600' }}>
                        €{product.oldPrice.toFixed(2)}
                    </Text>
                )}

                <Text style={styles.productTitle}>{product.name}</Text>

                {product.awards.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginTop: 10, gap: 8 }}>
                        {product.awards.map((award) => (
                            <View key={award} style={{ backgroundColor: '#e7e7e7', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, marginRight: 8 }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#111' }}>{award}</Text>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.ratingRow}>
                    {renderStars(averageRating, 18)}
                    <Text style={styles.ratingValue}>{averageRating.toFixed(1)}</Text>
                    <Text style={styles.ratingCount}>({reviewCount})</Text>
                </View>

                <FitMeter fit={product.fit} />

                <View style={styles.sizeHeaderRow}>
                    <View style={styles.sizeEcoRow}>
                        <TouchableOpacity style={styles.sizeEcoItem} onPress={() => setShowSizeModal(true)}>
                            <Text style={styles.sizeEcoText}>{selectedSize ?? 'SIZE'}</Text>
                            <Feather name="chevron-down" size={16} color="#111" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.sizeEcoItem, styles.sizeEcoDivider]} onPress={() => setShowEcoModal(true)}>
                            <MaterialCommunityIcons name="leaf" size={16} color="#111" />
                            <Text style={styles.sizeEcoText}>ECO</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.sizeGuideRow} onPress={() => setShowSizeGuide(true)}>
                    <Feather name="maximize-2" size={16} color={COLORS.black} />
                    <Text style={styles.sizeGuideText}>Size guide</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.addToCartButton}
                    onPress={() => {
                        if (!selectedSize) { Alert.alert('Select size', 'Please choose a size first.'); return; }
                        if (hasSimilarWardrobeItem) { setShowDuplicateModal(true); return; }
                        openCartPicker();
                    }}
                >
                    <Text style={styles.addToCartButtonText}>ADD TO CART</Text>
                </TouchableOpacity>

                <View style={styles.deliveryCard}>
                    <View style={styles.deliveryRow}>
                        <Feather name="package" size={18} color={COLORS.black} />
                        <View style={styles.deliveryTextWrap}>
                            <Text style={styles.deliveryTitle}>Delivery & orders</Text>
                            <Text style={styles.deliverySubtitle}>Fast shipping and order updates for your item.</Text>
                        </View>
                    </View>
                    <View style={styles.deliveryDivider} />
                    <View style={styles.deliveryRow}>
                        <Feather name="refresh-cw" size={18} color={COLORS.black} />
                        <View style={styles.deliveryTextWrap}>
                            <Text style={styles.deliveryTitle}>Returns & mistakes</Text>
                            <Text style={styles.deliverySubtitle}>Wrong size, damaged item or issue with your order? We will help.</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.policyLinkButton} onPress={() => Linking.openURL('https://github.com/annaskosar/pmnis_vaib')}>
                        <Text style={styles.policyLinkText}>View our delivery and return policy</Text>
                    </TouchableOpacity>
                </View>

                {(['delivery', 'sizeFit', 'productDetails'] as const).map((key) => (
                    <View key={key} style={styles.accordionGroup}>
                        <TouchableOpacity style={styles.accordionHeader} onPress={() => togglePanel(key)}>
                            <Text style={styles.accordionTitle}>
                                {key === 'delivery' ? 'Delivery information' : key === 'sizeFit' ? 'Size & fit' : 'Product details'}
                            </Text>
                            <Feather name={openPanels[key] ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.black} />
                        </TouchableOpacity>
                        {openPanels[key] && (
                            key === 'sizeFit' ? (
                                <View>
                                    <Text style={styles.accordionBody}>This item has a fitted silhouette. Consider sizing up for a more relaxed feel.</Text>
                                    <TouchableOpacity style={styles.viewGuideButton} onPress={() => setShowSizeGuide(true)}>
                                        <Text style={styles.viewGuideButtonText}>VIEW SIZE GUIDE</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <Text style={styles.accordionBody}>
                                    {key === 'delivery' ? product.description : 'Soft texture, wearable silhouette and everyday styling potential.'}
                                </Text>
                            )
                        )}
                    </View>
                ))}

                

                <View style={styles.reviewHeaderBlock}>
                    <Text style={styles.sectionTitleLarge}>Reviews</Text>
                    <View style={styles.reviewSummaryRow}>
                        {renderStars(averageRating, 18)}
                        <Text style={styles.reviewSummaryValue}>{averageRating.toFixed(1)}</Text>
                        <Text style={styles.reviewSummaryCount}>({reviewCount} ratings)</Text>
                    </View>
                </View>

                {productReviews.slice(0, 4).map((review) => (
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

                <TouchableOpacity
                    style={styles.seeAllReviewsButton}
                    onPress={() => router.push({ pathname: '/reviews', params: { productId: product.id, category: categoryName ?? '', subcategory: subcategoryName ?? '', gender: genderValue ?? 'WOMAN' } })}
                >
                    <Text style={styles.seeAllReviewsText}>SEE ALL REVIEWS</Text>
                </TouchableOpacity>

                <View style={styles.sectionBlock}>
                    <Text style={styles.sectionTitleLarge}>Customer rating</Text>
                    <ReviewBar leftLabel="Too small" rightLabel="Too large" value={56} />
                    <ReviewBar leftLabel="Poor quality" rightLabel="Great quality" value={68} />
                    <ReviewBar leftLabel="Bad material" rightLabel="Great material" value={61} />
                    <Text style={styles.reviewNote}>All reviews are verified by VAIB unless otherwise indicated.</Text>
                </View>
            </ScrollView>

            <Modal visible={showSizeModal} transparent animationType="slide" onRequestClose={() => setShowSizeModal(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowSizeModal(false)}>
                    <Pressable style={styles.sizeModalCard} onPress={() => {}}>
                        <View style={styles.sizeModalHeader}>
                            <Text style={styles.sizeModalTitle}>Select size</Text>
                            <TouchableOpacity onPress={() => setShowSizeModal(false)}>
                                <Text style={styles.doneText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} style={styles.sizeList}>
                            {sizeOptions.map((size) => {
                                const active = size.label === selectedSize;
                                return (
                                    <TouchableOpacity key={size.label} style={styles.sizeRow} disabled={size.disabled} onPress={() => { if (!size.disabled) setSelectedSize(size.label); }}>
                                        <Text style={[styles.sizeRowText, active && styles.sizeRowTextActive, size.disabled && styles.sizeRowTextDisabled]}>{size.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal visible={showSaveSheet} transparent animationType="fade" onRequestClose={() => setShowSaveSheet(false)}>
                <Pressable style={styles.sheetOverlay} onPress={() => setShowSaveSheet(false)}>
                    <Pressable style={styles.saveSheetCard} onPress={() => {}}>
                        <View style={styles.saveSheetHandle} />
                        <View style={styles.saveSheetPreviewRow}>
                            <Image source={productGallery[imageIndex] ?? productGallery[0]} style={styles.saveSheetPreviewImage} contentFit="cover" cachePolicy="memory-disk" transition={150} />
                            <View style={styles.saveSheetPreviewText}>
                                <Text style={styles.saveSheetBrand}>{product.brand}</Text>
                                <Text style={styles.saveSheetName} numberOfLines={2} ellipsizeMode="tail">{product.name}</Text>
                            </View>
                        </View>
                        {[{ icon: 'link', label: 'Copy link' }, { icon: 'download', label: 'Save image' }, { icon: 'more-horizontal', label: 'More options' }].map(({ icon, label }) => (
                            <TouchableOpacity key={label} style={styles.saveSheetAction} onPress={() => { setShowSaveSheet(false); Alert.alert(label, `${label}.`); }}>
                                <Feather name={icon as any} size={18} color={COLORS.black} />
                                <Text style={styles.saveSheetActionText}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>


            <Modal visible={showImageViewer} transparent animationType="fade" onRequestClose={() => setShowImageViewer(false)}>
                <SafeAreaView style={styles.imageViewerOverlay}>
                    <View style={styles.imageViewerTopRow}>
                        <TouchableOpacity onPress={() => setShowImageViewer(false)}>
                            <Feather name="x" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.imageViewerCounter}>{imageIndex + 1} / {productGallery.length}</Text>
                    </View>
                    <ScrollView ref={fullscreenScrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(event) => { setImageIndex(Math.round(event.nativeEvent.contentOffset.x / width)); }}>
                        {productGallery.map((image, index) => (
                            <View key={`fullscreen-${selectedColor?.id ?? 'default'}-${index}`} style={styles.imageViewerSlide}>
                                <Image source={image} style={styles.fullscreenImage} contentFit="contain" cachePolicy="memory-disk" transition={150} />
                            </View>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            <Modal visible={showSizeGuide} transparent animationType="fade" onRequestClose={() => setShowSizeGuide(false)}>
                <View style={styles.sizeGuideOverlay}>
                    <View style={styles.sizeGuideCard}>
                        <View style={styles.sizeGuideHeader}>
                            <Text style={styles.sizeGuideTitle}>Size Guide</Text>
                            <TouchableOpacity onPress={() => setShowSizeGuide(false)}>
                                <Feather name="x" size={22} color="#111" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableHeader}>Size</Text>
                                <Text style={styles.tableHeader}>Bust</Text>
                                <Text style={styles.tableHeader}>Waist</Text>
                                <Text style={styles.tableHeader}>Hips</Text>
                            </View>
                            {[
                                { size: 'XS', bust: '80-84', waist: '60-64', hips: '86-90' },
                                { size: 'S', bust: '84-88', waist: '64-68', hips: '90-94' },
                                { size: 'M', bust: '88-92', waist: '68-72', hips: '94-98' },
                                { size: 'L', bust: '92-98', waist: '72-78', hips: '98-104' },
                                { size: 'XL', bust: '98-104', waist: '78-84', hips: '104-110' },
                            ].map((row) => (
                                <View key={row.size} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{row.size}</Text>
                                    <Text style={styles.tableCell}>{row.bust}</Text>
                                    <Text style={styles.tableCell}>{row.waist}</Text>
                                    <Text style={styles.tableCell}>{row.hips}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={showEcoModal} transparent animationType="fade" onRequestClose={() => setShowEcoModal(false)}>
                <View style={styles.ecoOverlay}>
                    <View style={styles.ecoCard}>
                        <View style={styles.ecoHandle} />
                        <View style={styles.ecoHeaderRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.ecoTitle}>Eco details</Text>
                                <Text style={styles.ecoProductName}>{ecoData.name}</Text>
                            </View>
                            <TouchableOpacity style={styles.ecoCloseButton} onPress={() => setShowEcoModal(false)}>
                                <Feather name="x" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.ecoScrollContent}>
                            {[
                                { label: 'Description', value: ecoData.ecoDescription, isText: true },
                                { label: 'Material', value: ecoData.material, isText: true },
                                { label: 'Sustainability', value: ecoData.sustainability, isText: true },
                            ].map(({ label, value }) => (
                                <View key={label} style={styles.ecoInfoBlock}>
                                    <Text style={styles.ecoLabel}>{label}</Text>
                                    <Text style={styles.ecoText}>{value}</Text>
                                </View>
                            ))}
                            <View style={styles.ecoInfoBlock}>
                                <Text style={styles.ecoLabel}>Eco score</Text>
                                <Text style={[styles.ecoScoreValue, ecoData.ecoScore < 60 ? styles.ecoScoreLow : styles.ecoScoreGood]}>{ecoData.ecoScore}/100</Text>
                            </View>
                            {showEcoAlternatives && currentEcoAlternative && (
                                <View style={styles.ecoAlternativesSection}>
                                    <Text style={styles.ecoAlternativesTitle}>Better alternatives</Text>
                                    <Text style={styles.ecoAlternativesHint}>This product has a lower eco score. Here are similar pieces with better sustainability performance.</Text>
                                    <View style={styles.ecoAlternativeCard}>
                                        <TouchableOpacity style={styles.ecoArrowButton} onPress={goToPrevEcoAlternative}>
                                            <Feather name="arrow-left" size={20} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.ecoAlternativeCenter} activeOpacity={0.85} onPress={() => { setShowEcoModal(false); router.push({ pathname: '/product_detail', params: { productId: currentEcoAlternative.id } }); }}>
                                            <Image source={currentEcoAlternative.image} style={styles.ecoAlternativeImage} contentFit="cover" cachePolicy="memory-disk" transition={150} />
                                            <Text style={styles.ecoAlternativeName} numberOfLines={2}>{currentEcoAlternative.name}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.ecoArrowButton} onPress={goToNextEcoAlternative}>
                                            <Feather name="arrow-right" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.ecoAlternativeScore}>Eco score: {currentEcoAlternative.ecoScore}/100</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={showDuplicateModal} transparent animationType="fade" onRequestClose={() => setShowDuplicateModal(false)}>
                <View style={styles.duplicateOverlay}>
                    <View style={styles.duplicateCard}>
                        <View style={styles.duplicateHandle} />
                        <View style={styles.duplicateTitleRow}>
                            <Feather name="alert-circle" size={22} color="#111" />
                            <Text style={styles.duplicateTitleText}>Duplicate!</Text>
                        </View>

                        <Text style={styles.duplicateMainText}>
                            You already have a very similar piece in your wardrobe.
                        </Text>
                        <View style={styles.duplicateCompareBox}>
                            <View style={styles.duplicateCompareItem}>
                                <Image source={productGallery[imageIndex] ?? productGallery[0]} style={styles.duplicateCompareImage} contentFit="cover" cachePolicy="memory-disk" transition={150} />
                                <Text style={styles.duplicateCompareLabel} numberOfLines={1}>New item</Text>
                            </View>
                            <View style={styles.duplicateEqualsWrap}>
                                <Text style={styles.duplicateEqualsText}>=</Text>
                            </View>
                            <View style={styles.duplicateCompareItem}>
                                {duplicateWardrobeItem && (
                                    <Image
                                        source={duplicateWardrobeItem.image}
                                        style={styles.duplicateCompareImage}
                                        contentFit="cover"
                                    />
                                )}
                                <Text style={styles.duplicateCompareLabel} numberOfLines={1}>In wardrobe</Text>
                            </View>
                        </View>
                        <Text style={styles.duplicateSuggestionsText}>
                            We recommend these pieces more{"\n"}
                            <Text style={{ fontWeight: '800', color: '#111' }}>
                                similar vibe, but more unique
                            </Text>
                        </Text>
                        <View style={styles.duplicateAlternativesRow}>
                            {duplicateAlternatives.map((alt, index) => {
                                const scaleAnim =
                                    index === 0 ? pulse1 :
                                        index === 1 ? pulse2 :
                                            pulse3;

                                return (
                                    <Animated.View
                                        key={alt.id}
                                        style={[
                                            styles.duplicateAlternativeCard,
                                            { transform: [{ scale: scaleAnim }] },
                                        ]}
                                    >
                                        <TouchableOpacity
                                            activeOpacity={0.85}
                                            style={{ flex: 1 }}
                                            onPress={() => {
                                                setShowDuplicateModal(false);
                                                router.push({
                                                    pathname: '/product_detail',
                                                    params: {
                                                        productId: alt.id,
                                                    },
                                                });
                                            }}
                                        >
                                            <Image
                                                source={alt.image}
                                                style={styles.duplicateAlternativeImage}
                                                contentFit="cover"
                                            />
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })}
                        </View>
                        <View style={styles.duplicateActionsRow}>
                            <TouchableOpacity
                                style={styles.duplicateCancelButton}
                                onPress={() => {
                                    setShowDuplicateModal(false);
                                    setPendingDuplicateAction('close');
                                    setShowDuplicateFeedbackModal(true);
                                }}
                            >
                                <Text style={styles.duplicateCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.duplicateConfirmButton}
                                onPress={() => {
                                    setShowDuplicateModal(false);
                                    setPendingDuplicateAction('add');
                                    setShowDuplicateFeedbackModal(true);
                                }}
                            >
                                <Text style={styles.duplicateConfirmText}>+ Add anyway</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showCartPicker} animationType="slide" transparent onRequestClose={closeCartPicker}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={closeCartPicker} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Add to which cart?</Text>
                            <TouchableOpacity onPress={closeCartPicker}>
                                <Feather name="x" size={22} color="#111" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            <TouchableOpacity
                                style={styles.createNewCartButton}
                                onPress={() => {
                                    closeCartPicker();
                                    router.push('/cart_create');
                                }}
                            >
                                <Feather name="plus" size={16} color="#fff" />
                                <Text style={styles.createNewCartButtonText}>Create new cart</Text>
                            </TouchableOpacity>

                            {carts.length === 0 ? (
                                <Text style={styles.noCartsText}>No carts yet. Create one first!</Text>
                            ) : (
                                carts.map((cart) => (
                                    <Swipeable
                                        key={cart.id}
                                        renderRightActions={() => renderCartRightActions(cart.id)}
                                        overshootRight={false}
                                    >
                                        <TouchableOpacity
                                            style={styles.cartSelectItem}
                                            activeOpacity={0.86}
                                            onPress={() => handleAddToSpecificCart(cart.id)}
                                        >
                                            <View style={styles.cartIconWrap}>
                                                <Feather name="shopping-cart" size={25} color="#111" />
                                            </View>

                                            <View style={styles.cartSelectInfo}>
                                                <Text style={styles.cartSelectName}>{cart.name}</Text>
                                                <Text style={styles.cartSelectSub}>
                                                    Budget: €{cart.budget} · {cart.products.length} items
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.cartRemainingText,
                                                        cart.budget - cart.products.reduce((sum, product) => sum + product.price * product.quantity, 0) < 0
                                                            ? styles.cartRemainingNegative
                                                            : styles.cartRemainingPositive,
                                                    ]}
                                                >
                                                    {cart.budget - cart.products.reduce((sum, product) => sum + product.price * product.quantity, 0) < 0
                                                        ? `Over budget: €${Math.abs(
                                                            cart.budget - cart.products.reduce((sum, product) => sum + product.price * product.quantity, 0)
                                                        ).toFixed(2)}`
                                                        : `Remaining: €${(
                                                            cart.budget - cart.products.reduce((sum, product) => sum + product.price * product.quantity, 0)
                                                        ).toFixed(2)}`}
                                                </Text>
                                            </View>

                                            <Feather name="chevron-right" size={18} color="#8a8a8a" />
                                        </TouchableOpacity>
                                    </Swipeable>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showDuplicateFeedbackModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDuplicateFeedbackModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        onPress={() => setShowDuplicateFeedbackModal(false)}
                    />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />

                        {duplicateFeedbackSubmitted ? (
                            <View style={styles.feedbackThanks}>
                                <Feather name="check-circle" size={40} color="#111" />
                                <Text style={styles.feedbackThanksTitle}>Thanks!</Text>
                                <Text style={styles.feedbackThanksSubtitle}>
                                    Your feedback helps us improve duplicate detection.
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.sheetTitle}>Was this helpful?</Text>
                                <Text style={styles.sheetSubtitle}>
                                    Your opinion helps us improve these recommendations.
                                </Text>

                                <View style={styles.duplicateFeedbackRow}>
                                    <TouchableOpacity
                                        style={styles.duplicateFeedbackButton}
                                        onPress={() => handleDuplicateFeedback('yes')}
                                    >
                                        <Feather name="thumbs-up" size={16} color="#111" />
                                        <Text style={styles.duplicateFeedbackButtonText}>Yes</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.duplicateFeedbackButton}
                                        onPress={() => handleDuplicateFeedback('no')}
                                    >
                                        <Feather name="thumbs-down" size={16} color="#111" />
                                        <Text style={styles.duplicateFeedbackButtonText}>Not really</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.bg },
    container: { flex: 1, backgroundColor: COLORS.bg },
    scrollContent: { paddingBottom: 40 },
    imageSection: { position: 'relative', backgroundColor: COLORS.surface },
    mainImage: { width, height: IMAGE_HEIGHT, backgroundColor: COLORS.surface },
    topIconsRow: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    quickActionRow: { flexDirection: 'row', backgroundColor: '#f3f3f3', borderTopWidth: 1, borderColor: COLORS.border, borderBottomWidth: 1 },
    quickActionButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: '#f3f3f3' },
    quickActionText: { marginTop: 5, fontSize: 12, color: COLORS.text, fontWeight: '600' },
    sectionSpacing: { paddingHorizontal: 16, paddingTop: 18 },
    colorLabel: { fontSize: 14, color: COLORS.textSoft, marginBottom: 10, fontWeight: '500' },
    colorCard: { width: 54, height: 54, borderRadius: 14, borderWidth: 1, borderColor: 'transparent', marginRight: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface },
    colorCardActive: { borderColor: COLORS.black },
    colorSwatchLarge: { width: 34, height: 34, borderRadius: 17 },
    whiteSwatchBorder: { borderWidth: 1, borderColor: '#d0d0d0' },
    price: { fontSize: 30, fontWeight: '800', color: COLORS.text, marginTop: 40, paddingHorizontal: 16 },
    productTitle: { fontSize: 18, color: COLORS.textSoft, marginTop: 4, paddingHorizontal: 16, fontWeight: '500' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 20 },
    ratingValue: { marginLeft: 8, fontSize: 15, color: COLORS.text, fontWeight: '700' },
    ratingCount: { marginLeft: 6, fontSize: 14, color: '#6d6d6d' },
    fitMeterWrapper: { paddingHorizontal: 16, marginTop: 18 },
    fitMeterLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    fitMeterText: { fontSize: 13, color: COLORS.textMuted },
    fitMeterTrack: { height: 6, borderRadius: 4, backgroundColor: '#d0d0d0', justifyContent: 'center' },
    fitMeterDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.black, position: 'absolute', left: '46%' },
    sizeHeaderRow: { paddingHorizontal: 16, marginTop: 30 },
    sizeGuideRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 14 },
    sizeGuideText: { marginLeft: 8, fontSize: 14, color: COLORS.text, fontWeight: '500' },
    addToCartButton: { marginHorizontal: 16, marginTop: 30, backgroundColor: COLORS.black, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    addToCartButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },
    deliveryCard: { marginHorizontal: 16, marginTop: 20, backgroundColor: COLORS.surface2, borderRadius: 16, padding: 16 },
    deliveryRow: { flexDirection: 'row', alignItems: 'flex-start' },
    deliveryTextWrap: { flex: 1, marginLeft: 12 },
    deliveryDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
    deliveryTitle: { fontSize: 15, color: COLORS.text, fontWeight: '700', marginBottom: 4 },
    deliverySubtitle: { fontSize: 13, color: COLORS.textSoft, lineHeight: 18 },
    policyLinkButton: { marginTop: 14, alignItems: 'center' },
    policyLinkText: { fontSize: 13, color: COLORS.text, fontWeight: '700', textDecorationLine: 'underline', textAlign: 'center' },
    accordionGroup: { marginHorizontal: 16, marginTop: 14, borderBottomWidth: 1, borderBottomColor: '#d7d7d7', paddingBottom: 12 },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    accordionTitle: { fontSize: 16, color: COLORS.text, fontWeight: '700' },
    accordionBody: { marginTop: 10, fontSize: 14, color: COLORS.textSoft, lineHeight: 21 },
    viewGuideButton: { marginTop: 12, borderWidth: 1, borderColor: COLORS.black, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
    viewGuideButtonText: { fontSize: 13, color: COLORS.text, fontWeight: '700', textAlign: 'center' },
    recommendSectionCard: { marginHorizontal: 16, marginTop: 22, padding: 14, backgroundColor: COLORS.surface2, borderRadius: 18 },
    sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitleLarge: { fontSize: 20, color: COLORS.text, fontWeight: '800', marginBottom: 12 },
    sectionTitleCount: { fontSize: 13, color: COLORS.textSoft, fontWeight: '600' },
    sectionBlock: { paddingHorizontal: 16, marginTop: 22 },
    miniProductCard: { width: RECOMMEND_CARD_WIDTH, marginRight: 12 },
    miniProductImage: { width: RECOMMEND_CARD_WIDTH, height: 210, borderRadius: 14, backgroundColor: COLORS.surface },
    miniCartButton: { position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
    miniInfoRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 10 },
    miniPrice: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    miniName: { marginTop: 4, fontSize: 13, lineHeight: 17, color: COLORS.textSoft, height: 34 },
    miniHeartButton: { marginLeft: 8, marginTop: 2, marginRight: 6 },
    lookCard: { width: width * 0.58, height: 290, borderRadius: 18, overflow: 'hidden', marginRight: 12, backgroundColor: COLORS.surface, marginBottom: 16 },
    lookImage: { width: '100%', height: '100%' },
    lookLabel: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
    lookLabelText: { fontSize: 13, color: COLORS.text, fontWeight: '700' },
    builderMiniImage: { width: '100%', height: '100%' },
    reviewHeaderBlock: { paddingHorizontal: 16, marginTop: 26 },
    reviewSummaryRow: { flexDirection: 'row', alignItems: 'center', marginTop: -2 },
    reviewSummaryValue: { marginLeft: 8, fontSize: 15, color: COLORS.text, fontWeight: '700' },
    reviewSummaryCount: { marginLeft: 6, fontSize: 14, color: COLORS.textSoft },
    reviewCard: { marginHorizontal: 16, marginTop: 14, backgroundColor: COLORS.surface2, borderRadius: 16, padding: 14 },
    reviewTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    reviewName: { fontSize: 15, color: COLORS.text, fontWeight: '700' },
    reviewDate: { marginTop: 2, fontSize: 12, color: COLORS.textMuted },
    reviewText: { fontSize: 14, color: '#555', lineHeight: 20 },
    seeAllReviewsButton: { marginHorizontal: 16, marginTop: 16, borderWidth: 1, borderColor: COLORS.black, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    seeAllReviewsText: { fontSize: 14, color: COLORS.text, fontWeight: '800', letterSpacing: 0.3 },
    reviewBarBlock: { marginBottom: 16 },
    reviewBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    reviewBarLabel: { fontSize: 13, color: COLORS.textSoft, fontWeight: '500' },
    reviewTrack: { height: 8, backgroundColor: '#d1d1d1', borderRadius: 5, overflow: 'hidden' },
    reviewTrackFill: { height: '100%', backgroundColor: COLORS.black, borderRadius: 5 },
    reviewNote: { marginTop: 10, fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    sizeModalCard: { backgroundColor: '#f3f3f3', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 26, minHeight: 380 },
    sizeModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sizeModalTitle: { fontSize: 18, color: COLORS.text, fontWeight: '800' },
    doneText: { fontSize: 16, color: COLORS.text, fontWeight: '700' },
    sizeList: { maxHeight: 300 },
    sizeRow: { alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e2e2e2' },
    sizeRowText: { fontSize: 24, color: COLORS.text, fontWeight: '600' },
    sizeRowTextActive: { fontWeight: '800' },
    sizeRowTextDisabled: { color: COLORS.danger, textDecorationLine: 'line-through' },
    sizeEcoRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#d6d6d6', backgroundColor: '#f3f3f3' },
    sizeEcoItem: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 6 },
    sizeEcoDivider: { borderLeftWidth: 1, borderColor: '#d6d6d6' },
    sizeEcoText: { fontSize: 14, fontWeight: '600', color: '#111' },
    builderSectionCard: { marginHorizontal: 16, marginTop: 22, padding: 14, backgroundColor: COLORS.surface2, borderRadius: 18 },
    builderOutfitCard: { width: width * 0.58, marginRight: 14 },
    builderMiniGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
    builderMiniItem: { width: '23.5%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: COLORS.surface3, marginBottom: 8 },
    colorCardDisabled: { opacity: 0.5 },
    colorCross: { position: 'absolute', width: '80%', height: 2, backgroundColor: '#111', transform: [{ rotate: '45deg' }] },
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    saveSheetCard: { backgroundColor: '#f3f3f3', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: 28, paddingHorizontal: 18 },
    saveSheetHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: '#bdbdbd', alignSelf: 'center', marginBottom: 16 },
    saveSheetPreviewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    saveSheetPreviewImage: { width: 62, height: 62, borderRadius: 12, backgroundColor: COLORS.surface },
    saveSheetPreviewText: { flex: 1, marginLeft: 12 },
    saveSheetBrand: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4, textTransform: 'uppercase' },
    saveSheetName: { fontSize: 15, color: COLORS.text, fontWeight: '700', lineHeight: 20 },
    saveSheetAction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#dddddd' },
    saveSheetActionText: { marginLeft: 12, fontSize: 15, color: COLORS.text, fontWeight: '500' },
    imageIndicatorRow: { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
    imageIndicatorLine: { height: 4, borderRadius: 999, backgroundColor: COLORS.black, marginHorizontal: 4 },
    imageViewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.96)' },
    imageViewerTopRow: {
        position: 'absolute',
        top: 30,
        left: 4,
        right: 4,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 10,
    },
    imageViewerCounter: { color: '#fff', fontSize: 15, fontWeight: '700' },
    imageViewerSlide: { width, height: '100%', justifyContent: 'center', alignItems: 'center' },
    fullscreenImage: { width, height: '82%' },
    sizeGuideOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    sizeGuideCard: { width: '88%', maxHeight: '70%', backgroundColor: '#fff', borderRadius: 20, padding: 16 },
    sizeGuideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sizeGuideTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
    tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
    tableHeader: { flex: 1, fontSize: 13, fontWeight: '700', color: '#111' },
    tableCell: { flex: 1, fontSize: 13, color: '#444' },
    ecoOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
    ecoCard: { width: '100%', maxWidth: 360, maxHeight: '82%', backgroundColor: 'rgba(245, 245, 245, 0.96)', borderRadius: 28, paddingTop: 10, paddingHorizontal: 16, paddingBottom: 18, borderWidth: 1, borderColor: '#d6d6d6' },
    ecoHandle: { width: 44, height: 4, borderRadius: 999, backgroundColor: '#c8c8c8', alignSelf: 'center', marginBottom: 14 },
    ecoHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
    ecoTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 2 },
    ecoProductName: { fontSize: 14, color: '#6a6a6a', fontWeight: '500' },
    ecoCloseButton: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#444', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)' },
    ecoScrollContent: { paddingBottom: 6 },
    ecoInfoBlock: { marginBottom: 16 },
    ecoLabel: { fontSize: 13, fontWeight: '800', color: '#111', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    ecoText: { fontSize: 14, lineHeight: 21, color: '#5f6770' },
    ecoScoreValue: { fontSize: 22, fontWeight: '800' },
    ecoScoreGood: { color: '#006958' },
    ecoScoreLow: { color: '#df2518' },
    ecoAlternativesSection: { marginTop: 6, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#cad1da' },
    ecoAlternativesTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 6 },
    ecoAlternativesHint: { fontSize: 13, lineHeight: 19, color: '#6a6a6a', marginBottom: 16 },
    ecoAlternativeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    ecoArrowButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
    ecoAlternativeCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 16 },
    ecoAlternativeImage: { width: 100, height: 100, borderRadius: 20, marginBottom: 10, backgroundColor: '#d6d6d6' },
    ecoAlternativeName: { fontSize: 14, fontWeight: '700', color: '#111', textAlign: 'center', lineHeight: 18 },
    ecoAlternativeScore: { marginTop: 14, textAlign: 'center', fontSize: 15, fontWeight: '800', color: '#006958' },
    duplicateOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.20)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
    duplicateCard: { width: '100%', maxWidth: 360, backgroundColor: 'rgba(243, 243, 243, 0.96)', borderRadius: 30, paddingTop: 10, paddingHorizontal: 14, paddingBottom: 20, borderWidth: 1, borderColor: '#d7d7d7' },
    duplicateHandle: { width: 42, height: 4, borderRadius: 999, backgroundColor: '#c8c8c8', alignSelf: 'center', marginBottom: 14 },

    duplicateMainText: {
        fontSize: 15,
        lineHeight: 21,
        fontWeight: '700',
        color: '#111',
        marginBottom: 18,
        textAlign: 'center',
    },
    duplicateCompareBox: {
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 22,
        backgroundColor: '#ededed',
        minHeight: 190,
        paddingHorizontal: 14,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    duplicateCompareItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    duplicateCompareImage: {
        width: 110,
        height: 110,
        borderRadius: 18,
        backgroundColor: '#ddd',
        marginBottom: 10,
    },
    duplicateCompareLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
        textAlign: 'center',
    },
    duplicateEqualsWrap: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    duplicateEqualsText: {
        fontSize: 42,
        fontWeight: '900',
        color: '#111',
    },
    duplicateAlternativesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 22,
        paddingHorizontal: 4,
    },
    duplicateAlternativeCard: {
        width: '30.5%',
        height: 104,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#444',
        backgroundColor: '#ededed',
        overflow: 'hidden',
    },
    duplicateAlternativeImage: {
        width: '100%',
        height: '100%',
    },

    duplicateCloseCenterButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#444', backgroundColor: '#efefef', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },



    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },

    bottomSheet: {
        backgroundColor: '#f3f3f3',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingBottom: 34,
        maxHeight: '85%',
    },

    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#ccc',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 16,
    },

    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    sheetTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },

    createNewCartButton: {
        backgroundColor: '#111',
        paddingVertical: 14,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },

    createNewCartButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    cartSelectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e9e9e9',
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
    },

    cartSelectInfo: {
        flex: 1,
    },

    cartSelectName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },

    cartSelectSub: {
        fontSize: 12,
        color: '#6a6a6a',
        marginTop: 2,
    },

    noCartsText: {
        textAlign: 'center',
        color: '#999',
        fontSize: 14,
        marginTop: 20,
    },


    cartSwipeActions: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: 10,
    },

    cartSwipeButton: {
        width: 86,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginLeft: 8,
    },

    cartEditSwipeButton: {
        backgroundColor: '#dedede',
    },

    cartDeleteSwipeButton: {
        backgroundColor: '#111',
    },

    cartSwipeButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
    },

    cartDeleteSwipeButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
    },

    cartRemainingText: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 4,
    },

    cartRemainingPositive: {
        color: '#14805e',
    },

    cartRemainingNegative: {
        color: '#df2518',
    },

    cartIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 19,
        backgroundColor: '#dedede',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    duplicateTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 14,
    },

    duplicateTitleText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111',
    },

    duplicateSuggestionsText: {
        fontSize: 13,
        lineHeight: 18,
        color: '#5f5f5f',
        textAlign: 'center',
        marginBottom: 14,
        paddingHorizontal: 10,
        fontWeight: '600',
    },

    duplicateActionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 6,
    },

    duplicateCancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#111',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#f3f3f3',
    },

    duplicateCancelText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
    },

    duplicateConfirmButton: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#111',
    },

    duplicateConfirmText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
    },

    duplicateAddAnywayButton: {
        marginTop: 10,
        backgroundColor: '#111',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },

    duplicateAddAnywayText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    duplicateFeedbackRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
    },

    duplicateFeedbackButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#e9e9e9',
        borderRadius: 14,
        paddingVertical: 14,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },

    duplicateFeedbackButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
    },

    sheetSubtitle: {
        fontSize: 13,
        color: '#8a8a8a',
        marginTop: 4,
        marginBottom: 20,
        textAlign: 'center',
    },

    feedbackThanks: {
        alignItems: 'center',
        paddingVertical: 30,
        gap: 12,
    },

    feedbackThanksTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },

    feedbackThanksSubtitle: {
        fontSize: 14,
        color: '#6a6a6a',
        textAlign: 'center',
        lineHeight: 20,
    },



});