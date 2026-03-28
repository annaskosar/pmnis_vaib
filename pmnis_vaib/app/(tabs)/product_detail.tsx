import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Modal,
    Pressable,
    Dimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Alert,
    TouchableWithoutFeedback,
} from 'react-native';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Animated } from 'react-native';
import { useCart, CartProduct } from '../../context/cart_context';
import { Swipeable } from 'react-native-gesture-handler';
import { Linking } from 'react-native';
import { useProducts, sizeOptions } from '../../context/product_context';
import { productImages } from '../../context/product_images';

const { width } = Dimensions.get('window');

const IMAGE_HEIGHT = 420;
const RECOMMEND_CARD_WIDTH = 158;
const DRAWER_WIDTH = 220;

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

type ReviewItem = {
    id: string;
    name: string;
    rating: number;
    text: string;
    date: string;
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
    {
        id: '1',
        image: require('../../assets/images_app/model8.png'),
        name: 'Soft minimal top',
        price: '€24.99',
    },
    {
        id: '2',
        image: require('../../assets/images_app/model9.png'),
        name: 'Clean ribbed tee',
        price: '€31.99',
    },
    {
        id: '3',
        image: require('../../assets/images_app/model10.png'),
        name: 'Slim fitted long sleeve',
        price: '€28.99',
    },
    {
        id: '4',
        image: require('../../assets/images_app/model11.png'),
        name: 'Basic body fit top',
        price: '€22.99',
    },
    {
        id: '5',
        image: require('../../assets/images_app/model3.png'),
        name: 'Essential fitted piece',
        price: '€19.99',
    },
];

const builderLooks = [
    {
        id: 'b1',
        image: require('../../assets/images_app/model4.png'),
        title: 'Casual',
        items: [
            require('../../assets/images_app/model5.png'),
            require('../../assets/images_app/model6.png'),
            require('../../assets/images_app/model7.png'),
            require('../../assets/images_app/model8.png'),
        ],
    },
    {
        id: 'b2',
        image: require('../../assets/images_app/model10.png'),
        title: 'Sporty',
        items: [
            require('../../assets/images_app/model5.png'),
            require('../../assets/images_app/model8.png'),
            require('../../assets/images_app/model11.png'),
            require('../../assets/images_app/model3.png'),
        ],
    },
];

const peopleDecisionItems: MiniProduct[] = [
    {
        id: 'p1',
        image: require('../../assets/images_app/model11.png'),
        name: 'Layering cotton top',
        price: '€27.99',
    },
    {
        id: 'p2',
        image: require('../../assets/images_app/model8.png'),
        name: 'Soft contour fit',
        price: '€20.99',
    },
    {
        id: 'p3',
        image: require('../../assets/images_app/model9.png'),
        name: 'Minimal daily essential',
        price: '€26.99',
    },
    {
        id: 'p4',
        image: require('../../assets/images_app/model10.png'),
        name: 'Modern rib top',
        price: '€23.99',
    },
];


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

function FitMeter({ fit }: { fit: 'Slim' | 'Fitted' | 'Regular' | 'Oversized' | 'Baggy' }) {
    const getPosition = () => {
        switch (fit) {
            case 'Slim':
                return '8%';
            case 'Fitted':
                return '28%';
            case 'Regular':
                return '48%';
            case 'Oversized':
                return '68%';
            case 'Baggy':
                return '84%';
            default:
                return '48%';
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

            <Text
                style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: COLORS.text,
                    fontWeight: '700',
                }}
            >
                {fit}
            </Text>
        </View>
    );
}

function ReviewBar({
                       leftLabel,
                       rightLabel,
                       value,
                   }: {
    leftLabel: string;
    rightLabel: string;
    value: number;
}) {
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
                         }: {
    item: MiniProduct;
    onOpenCartPicker: () => void;
}) {
    return (
        <View style={styles.miniProductCard}>
            <View>
                <Image source={item.image} style={styles.miniProductImage} resizeMode="cover" />

                <TouchableOpacity
                    style={styles.miniCartButton}
                    onPress={onOpenCartPicker}
                    activeOpacity={0.7}
                >
                    <Feather name="shopping-cart" size={14} color={COLORS.black} />
                </TouchableOpacity>
            </View>

            <View style={styles.miniInfoRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.miniPrice}>{item.price}</Text>
                    <Text style={styles.miniName} numberOfLines={2} ellipsizeMode="tail">
                        {item.name}
                    </Text>
                </View>

                <TouchableOpacity style={styles.miniHeartButton}>
                    <Feather name="heart" size={18} color={COLORS.black} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function ProductDetailScreen() {
    const router = useRouter();
    const { productId, category, subcategory, gender } = useLocalSearchParams();
    const genderValue = Array.isArray(gender) ? gender[0] : gender;
    const { carts, addProductToCart, deleteCart } = useCart();
    const { getProductById } = useProducts();

    const productIdValue = Array.isArray(productId) ? productId[0] : productId;
    const categoryName = Array.isArray(category) ? category[0] : category;
    const subcategoryName = Array.isArray(subcategory) ? subcategory[0] : subcategory;

    const product =
        typeof productIdValue === 'string'
            ? getProductById(productIdValue)
            : undefined;

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

    const fullscreenScrollRef = React.useRef<ScrollView>(null);
    const scrollX = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(0)).current;

    const [openPanels, setOpenPanels] = React.useState({
        delivery: true,
        sizeFit: false,
        productDetails: false,
    });

    const hasSimilarWardrobeItem = true;

    if (!product) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 24,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 20,
                            fontWeight: '700',
                            color: '#111',
                            marginBottom: 16,
                        }}
                    >
                        Product not found
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{
                            backgroundColor: '#111',
                            paddingHorizontal: 18,
                            paddingVertical: 12,
                            borderRadius: 12,
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const productReviews = product.reviews;
    const ecoData = {
        name: product.name,
        ...product.eco,
    };

    const ecoAlternatives = product.eco.ecoAlternativeIds
        .map((alt) => {
            const altProduct = getProductById(alt.productId);

            if (!altProduct) return null;

            const firstImageKey =
                altProduct.availableColors[0]?.imageKeys[0] ?? altProduct.images[0];

            const imageSource = firstImageKey ? productImages[firstImageKey] : null;

            if (!imageSource) return null;

            return {
                id: altProduct.id,
                name: altProduct.name,
                image: imageSource,
                ecoScore: alt.ecoScore,
            };
        })
        .filter(Boolean) as {
        id: string;
        name: string;
        image: any;
        ecoScore: number;
    }[];

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

    const selectedColor =
        colorVariants.find((variant) => variant.id === selectedColorId) ?? colorVariants[0];

    const productGallery =
        selectedColor?.images?.length
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



    const duplicateWardrobeItem = {
        id: 'w1',
        name: 'Similar wardrobe item',
        image: require('../../assets/wardrobe_images/item1.png'),
    };

    const duplicateAlternatives = [
        {
            id: 'a1',
            name: 'Organic cotton top',
            image: require('../../assets/images_app/model8.png'),
            ecoScore: 82,
        },
        {
            id: 'a2',
            name: 'Recycled soft tee',
            image: require('../../assets/images_app/model9.png'),
            ecoScore: 78,
        },
        {
            id: 'a3',
            name: 'Better basic long sleeve',
            image: require('../../assets/images_app/model10.png'),
            ecoScore: 85,
        },
    ];

    const goToPrevEcoAlternative = () => {
        setEcoAlternativeIndex((prev) =>
            prev === 0 ? ecoAlternatives.length - 1 : prev - 1
        );
    };

    const goToNextEcoAlternative = () => {
        setEcoAlternativeIndex((prev) =>
            prev === ecoAlternatives.length - 1 ? 0 : prev + 1
        );
    };

    const currentEcoAlternative = ecoAlternatives[ecoAlternativeIndex];
    const showEcoAlternatives = ecoData.ecoScore < 60;

    const overlayOpacity = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.34],
    });

    const drawerTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [DRAWER_WIDTH + 30, 0],
    });

    const openImageViewer = (index: number) => {
        setImageIndex(index);
        setShowImageViewer(true);

        setTimeout(() => {
            fullscreenScrollRef.current?.scrollTo({
                x: index * width,
                animated: false,
            });
        }, 50);
    };

    const togglePanel = (key: 'delivery' | 'sizeFit' | 'productDetails') => {
        setOpenPanels((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const onImageScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / width);
        setImageIndex(index);
    };

    const openCartPicker = () => {
        setShowCartPicker(true);

        Animated.timing(slideAnim, {
            toValue: 1,
            duration: 260,
            useNativeDriver: true,
        }).start();
    };

    const closeCartPicker = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
        }).start(() => {
            setShowCartPicker(false);
        });
    };

    const getCartTotal = (cart: { products: CartProduct[] }) => {
        return cart.products.reduce(
            (sum, cartProduct) => sum + cartProduct.price * cartProduct.quantity,
            0
        );
    };

    const handleAddToSpecificCart = (cartId: string) => {
        addProductToCart(cartId, productToAdd);
        closeCartPicker();
        Alert.alert('Added to cart', 'Item was added to your selected cart.');
    };

    const handleEditCart = (cartId: string) => {
        closeCartPicker();
        router.push({
            pathname: '/cart_create',
            params: { cartId },
        });
    };

    const handleDeleteCart = (cartId: string) => {
        Alert.alert(
            'Delete cart',
            'Are you sure you want to delete this cart?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteCart(cartId),
                },
            ]
        );
    };

    const renderDrawerRightActions = (cartId: string) => {
        return (
            <View style={styles.drawerSwipeActions}>
                <TouchableOpacity
                    style={[styles.drawerSwipeButton, styles.drawerEditSwipeButton]}
                    onPress={() => handleEditCart(cartId)}
                >
                    <Feather name="edit-2" size={15} color="#111" />
                    <Text style={styles.drawerSwipeButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.drawerSwipeButton, styles.drawerDeleteSwipeButton]}
                    onPress={() => handleDeleteCart(cartId)}
                >
                    <Feather name="trash-2" size={15} color="#fff" />
                    <Text style={styles.drawerDeleteSwipeButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.imageSection}>
                    <Animated.ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        onMomentumScrollEnd={onImageScrollEnd}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false }
                        )}
                    >
                        {productGallery.map((image, index) => (
                            <TouchableOpacity
                                key={`${selectedColor?.id ?? 'default'}-${index}`}
                                activeOpacity={1}
                                onPress={() => openImageViewer(index)}
                            >
                                <Image
                                    source={image}
                                    style={styles.mainImage}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                        ))}
                    </Animated.ScrollView>

                    <View style={styles.topIconsRow}>
                        <TouchableOpacity
                            onPress={() => {
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
                            }}
                        >
                            <Feather name="arrow-left" size={24} color={COLORS.black} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowSaveSheet(true)}>
                            <Feather name="download" size={22} color={COLORS.black} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.imageIndicatorRow}>
                        {productGallery.map((_, index) => {
                            const inputRange = [
                                (index - 2) * width,
                                (index - 1) * width,
                                index * width,
                                (index + 1) * width,
                                (index + 2) * width,
                            ];

                            const animatedWidth = scrollX.interpolate({
                                inputRange,
                                outputRange: [14, 20, 34, 20, 14],
                                extrapolate: 'clamp',
                            });

                            const animatedOpacity = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.18, 0.4, 1, 0.4, 0.18],
                                extrapolate: 'clamp',
                            });

                            const animatedScaleY = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.8, 0.95, 1.2, 0.95, 0.8],
                                extrapolate: 'clamp',
                            });

                            return (
                                <Animated.View
                                    key={index}
                                    style={[
                                        styles.imageIndicatorLine,
                                        {
                                            width: animatedWidth,
                                            opacity: animatedOpacity,
                                            transform: [{ scaleY: animatedScaleY }],
                                        },
                                    ]}
                                />
                            );
                        })}
                    </View>
                </View>

                <View style={styles.quickActionRow}>
                    <TouchableOpacity style={styles.quickActionButton}>
                        <Feather name="heart" size={20} color={COLORS.black} />
                        <Text style={styles.quickActionText}>Wish</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => router.push('/builder')}
                    >
                        <MaterialIcons name="auto-awesome" size={20} color={COLORS.black} />
                        <Text style={styles.quickActionText}>Builder</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={openCartPicker}
                    >
                        <Feather name="shopping-cart" size={20} color={COLORS.black} />
                        <Text style={styles.quickActionText}>Cart</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionSpacing}>
                    <Text style={styles.colorLabel}>
                        Color: {selectedColor?.name ?? 'Default'}
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {colorVariants.map((variant) => {
                            const active = variant.id === selectedColorId;
                            const disabled = variant.disabled;

                            return (
                                <TouchableOpacity
                                    key={variant.id}
                                    style={[
                                        styles.colorCard,
                                        active && styles.colorCardActive,
                                        disabled && styles.colorCardDisabled,
                                    ]}
                                    disabled={disabled}
                                    onPress={() => {
                                        if (!disabled) {
                                            setSelectedColorId(variant.id);
                                            setImageIndex(0);
                                        }
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.colorSwatchLarge,
                                            { backgroundColor: variant.swatch },
                                            variant.name === 'White' && styles.whiteSwatchBorder,
                                        ]}
                                    />

                                    {disabled && <View style={styles.colorCross} />}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <Text style={styles.price}>€{product.price.toFixed(2)}</Text>

                {product.oldPrice && (
                    <Text
                        style={{
                            paddingHorizontal: 16,
                            marginTop: 6,
                            color: '#777',
                            textDecorationLine: 'line-through',
                            fontSize: 14,
                            fontWeight: '600',
                        }}
                    >
                        €{product.oldPrice.toFixed(2)}
                    </Text>
                )}

                <Text style={styles.productTitle}>{product.name}</Text>
                {product.awards.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, marginTop: 10, gap: 8 }}
                    >
                        {product.awards.map((award) => (
                            <View
                                key={award}
                                style={{
                                    backgroundColor: '#e7e7e7',
                                    paddingHorizontal: 12,
                                    paddingVertical: 7,
                                    borderRadius: 999,
                                    marginRight: 8,
                                }}
                            >
                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#111' }}>
                                    {award}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.ratingRow}>
                    {renderStars(product.rating, 18)}
                    <Text style={styles.ratingValue}>{product.rating.toFixed(1)}</Text>
                    <Text style={styles.ratingCount}>({product.reviewCount})</Text>
                </View>

                <FitMeter fit={product.fit} />

                <View style={styles.sizeHeaderRow}>
                    <View style={styles.sizeEcoRow}>
                        <TouchableOpacity
                            style={styles.sizeEcoItem}
                            onPress={() => setShowSizeModal(true)}
                        >
                            <Text style={styles.sizeEcoText}>{selectedSize ?? 'SIZE'}</Text>
                            <Feather name="chevron-down" size={16} color="#111" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.sizeEcoItem, styles.sizeEcoDivider]}
                            onPress={() => setShowEcoModal(true)}
                        >
                            <MaterialCommunityIcons name="leaf" size={16} color="#111" />
                            <Text style={styles.sizeEcoText}>ECO</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.sizeGuideRow}
                    onPress={() => setShowSizeGuide(true)}
                >
                    <Feather name="maximize-2" size={16} color={COLORS.black} />
                    <Text style={styles.sizeGuideText}>Size guide</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.addToCartButton}
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
                    <Text style={styles.addToCartButtonText}>ADD TO CART</Text>
                </TouchableOpacity>

                <View style={styles.deliveryCard}>
                    <View style={styles.deliveryRow}>
                        <Feather name="package" size={18} color={COLORS.black} />
                        <View style={styles.deliveryTextWrap}>
                            <Text style={styles.deliveryTitle}>Delivery & orders</Text>
                            <Text style={styles.deliverySubtitle}>
                                Fast shipping and order updates for your item.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.deliveryDivider} />

                    <View style={styles.deliveryRow}>
                        <Feather name="refresh-cw" size={18} color={COLORS.black} />
                        <View style={styles.deliveryTextWrap}>
                            <Text style={styles.deliveryTitle}>Returns & mistakes</Text>
                            <Text style={styles.deliverySubtitle}>
                                Wrong size, damaged item or issue with your order? We will help.
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.policyLinkButton}
                        onPress={() => Linking.openURL('https://github.com/annaskosar/pmnis_vaib')}
                    >
                        <Text style={styles.policyLinkText}>
                            View our delivery and return policy
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.accordionGroup}>
                    <TouchableOpacity
                        style={styles.accordionHeader}
                        onPress={() => togglePanel('delivery')}
                    >
                        <Text style={styles.accordionTitle}>Delivery information</Text>
                        <Feather
                            name={openPanels.delivery ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={COLORS.black}
                        />
                    </TouchableOpacity>

                    {openPanels.delivery && (
                        <Text style={styles.accordionBody}>
                            {product.description}
                        </Text>
                    )}
                </View>

                <View style={styles.accordionGroup}>
                    <TouchableOpacity
                        style={styles.accordionHeader}
                        onPress={() => togglePanel('sizeFit')}
                    >
                        <Text style={styles.accordionTitle}>Size & fit</Text>
                        <Feather
                            name={openPanels.sizeFit ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={COLORS.black}
                        />
                    </TouchableOpacity>

                    {openPanels.sizeFit && (
                        <View>
                            <Text style={styles.accordionBody}>
                                This item has a fitted silhouette. Consider sizing up for a more relaxed
                                feel. The fabric has light stretch and sits close to the body.
                            </Text>

                            <TouchableOpacity
                                style={styles.viewGuideButton}
                                onPress={() => setShowSizeGuide(true)}
                            >
                                <Text style={styles.viewGuideButtonText}>VIEW SIZE GUIDE</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.accordionGroup}>
                    <TouchableOpacity
                        style={styles.accordionHeader}
                        onPress={() => togglePanel('productDetails')}
                    >
                        <Text style={styles.accordionTitle}>Product details</Text>
                        <Feather
                            name={openPanels.productDetails ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={COLORS.black}
                        />
                    </TouchableOpacity>

                    {openPanels.productDetails && (
                        <Text style={styles.accordionBody}>
                            Soft texture, wearable silhouette and everyday styling potential.
                            Designed for layering or wearing as a standalone piece.
                        </Text>
                    )}
                </View>

                <View style={styles.recommendSectionCard}>
                    <View style={styles.sectionTitleRow}>
                        <Text style={styles.sectionTitleLarge}>You may rock this</Text>
                        <Text style={styles.sectionTitleCount}>5 items</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {mayRockItems.map((item) => (
                            <MiniProductCard
                                key={item.id}
                                item={item}
                                onOpenCartPicker={openCartPicker}
                            />
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.builderSectionCard}>
                    <Text style={styles.sectionTitleLarge}>Builder style for you</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {builderLooks.map((look) => (
                            <View key={look.id} style={styles.builderOutfitCard}>
                                <View style={styles.lookCard}>
                                    <Image source={look.image} style={styles.lookImage} resizeMode="cover" />
                                    <View style={styles.lookLabel}>
                                        <Text style={styles.lookLabelText}>{look.title}</Text>
                                    </View>
                                </View>

                                <View style={styles.builderMiniGrid}>
                                    {look.items.map((itemImage, index) => (
                                        <TouchableOpacity
                                            key={`${look.id}-${index}`}
                                            style={styles.builderMiniItem}
                                        >
                                            <Image
                                                source={itemImage}
                                                style={styles.builderMiniImage}
                                                resizeMode="cover"
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.sectionBlock}>
                    <Text style={styles.sectionTitleLarge}>People decision</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {peopleDecisionItems.map((item) => (
                            <MiniProductCard
                                key={item.id}
                                item={item}
                                onOpenCartPicker={openCartPicker}
                            />
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.reviewHeaderBlock}>
                    <Text style={styles.sectionTitleLarge}>Reviews</Text>

                    <View style={styles.reviewSummaryRow}>
                        {renderStars(product.rating, 18)}
                        <Text style={styles.reviewSummaryValue}>{product.rating.toFixed(1)}</Text>
                        <Text style={styles.reviewSummaryCount}>({product.reviewCount} ratings)</Text>
                    </View>
                </View>

                {productReviews.map((review) => (
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
                    onPress={() =>
                        router.push({
                            pathname: '/reviews',
                            params: {
                                productId: product.id,
                                category: categoryName ?? '',
                                subcategory: subcategoryName ?? '',
                                gender: genderValue ?? 'WOMAN',
                            },
                        })
                    }
                >
                    <Text style={styles.seeAllReviewsText}>SEE ALL REVIEWS</Text>
                </TouchableOpacity>

                <View style={styles.sectionBlock}>
                    <Text style={styles.sectionTitleLarge}>Customer rating</Text>

                    <ReviewBar leftLabel="Too small" rightLabel="Too large" value={56} />
                    <ReviewBar leftLabel="Poor quality" rightLabel="Great quality" value={68} />
                    <ReviewBar leftLabel="Bad material" rightLabel="Great material" value={61} />

                    <Text style={styles.reviewNote}>
                        All reviews are verified by VAIB unless otherwise indicated.
                    </Text>
                </View>
            </ScrollView>

            <Modal
                visible={showSizeModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSizeModal(false)}
            >
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
                                    <TouchableOpacity
                                        key={size.label}
                                        style={styles.sizeRow}
                                        disabled={size.disabled}
                                        onPress={() => {
                                            if (!size.disabled) {
                                                setSelectedSize(size.label);
                                            }
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.sizeRowText,
                                                active && styles.sizeRowTextActive,
                                                size.disabled && styles.sizeRowTextDisabled,
                                            ]}
                                        >
                                            {size.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                visible={showSaveSheet}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSaveSheet(false)}
            >
                <Pressable
                    style={styles.sheetOverlay}
                    onPress={() => setShowSaveSheet(false)}
                >
                    <Pressable style={styles.saveSheetCard} onPress={() => {}}>
                        <View style={styles.saveSheetHandle} />

                        <View style={styles.saveSheetPreviewRow}>
                            <Image
                                source={productGallery[imageIndex] ?? productGallery[0]}
                                style={styles.saveSheetPreviewImage}
                                resizeMode="cover"
                            />

                            <View style={styles.saveSheetPreviewText}>
                                <Text style={styles.saveSheetBrand}>{product.brand}</Text>
                                <Text
                                    style={styles.saveSheetName}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {product.name}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.saveSheetAction}
                            onPress={() => {
                                setShowSaveSheet(false);
                                Alert.alert('Copy link', 'Link copied.');
                            }}
                        >
                            <Feather name="link" size={18} color={COLORS.black} />
                            <Text style={styles.saveSheetActionText}>Copy link</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveSheetAction}
                            onPress={() => {
                                setShowSaveSheet(false);
                                Alert.alert('Save image', 'Image saved.');
                            }}
                        >
                            <Feather name="download" size={18} color={COLORS.black} />
                            <Text style={styles.saveSheetActionText}>Save image</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.saveSheetAction}
                            onPress={() => {
                                setShowSaveSheet(false);
                                Alert.alert('More options', 'Open more options here.');
                            }}
                        >
                            <Feather name="more-horizontal" size={18} color={COLORS.black} />
                            <Text style={styles.saveSheetActionText}>More options</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            {showCartPicker && (
                <View style={styles.drawerRoot} pointerEvents="box-none">
                    <TouchableWithoutFeedback onPress={closeCartPicker}>
                        <Animated.View
                            style={[
                                styles.drawerBackdrop,
                                {
                                    opacity: overlayOpacity,
                                },
                            ]}
                        />
                    </TouchableWithoutFeedback>

                    <Animated.View
                        style={[
                            styles.cartDrawer,
                            {
                                transform: [{ translateX: drawerTranslateX }],
                            },
                        ]}
                    >
                        <View style={styles.cartDrawerTopSpacer} />
                        <Text style={styles.cartDrawerTitle}>Carts</Text>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.cartDrawerList}
                        >
                            {carts.map((cart) => {
                                const currentTotal = getCartTotal(cart);
                                const afterAddTotal = currentTotal + product.price;
                                const difference = cart.budget - afterAddTotal;
                                const isOver = difference < 0;

                                return (
                                    <Swipeable
                                        key={cart.id}
                                        renderRightActions={() => renderDrawerRightActions(cart.id)}
                                        overshootRight={false}
                                    >
                                        <TouchableOpacity
                                            style={styles.cartDrawerItem}
                                            activeOpacity={0.86}
                                            onPress={() => handleAddToSpecificCart(cart.id)}
                                        >
                                            <View style={styles.cartDrawerRowTop}>
                                                <TouchableOpacity
                                                    style={styles.cartDrawerMiniIcon}
                                                    onPress={openCartPicker}
                                                    activeOpacity={0.7}
                                                >
                                                    <Feather name="shopping-cart" size={18} color={COLORS.black} />
                                                </TouchableOpacity>

                                                <Text
                                                    style={styles.cartDrawerName}
                                                    numberOfLines={2}
                                                    ellipsizeMode="tail"
                                                >
                                                    {cart.name}
                                                </Text>
                                            </View>

                                            <Text
                                                style={[
                                                    styles.cartDrawerMeta,
                                                    isOver ? styles.cartDrawerMetaOver : styles.cartDrawerMetaRemaining,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {isOver
                                                    ? `Over budget: €${Math.abs(difference).toFixed(2)}`
                                                    : `Remaining: €${difference.toFixed(2)}`}
                                            </Text>
                                        </TouchableOpacity>
                                    </Swipeable>
                                );
                            })}

                            <TouchableOpacity
                                style={styles.cartDrawerAddButton}
                                onPress={() => {
                                    closeCartPicker();
                                    router.push('/cart_create');
                                }}
                            >
                                <Feather name="plus" size={18} color="#fff" />
                                <Text style={styles.cartDrawerAddButtonText}>Add</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </View>
            )}

            <Modal
                visible={showImageViewer}
                transparent
                animationType="fade"
                onRequestClose={() => setShowImageViewer(false)}
            >
                <SafeAreaView style={styles.imageViewerOverlay}>
                    <View style={styles.imageViewerTopRow}>
                        <TouchableOpacity onPress={() => setShowImageViewer(false)}>
                            <Feather name="x" size={28} color="#fff" />
                        </TouchableOpacity>

                        <Text style={styles.imageViewerCounter}>
                            {imageIndex + 1} / {productGallery.length}
                        </Text>
                    </View>

                    <ScrollView
                        ref={fullscreenScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(event) => {
                            const offsetX = event.nativeEvent.contentOffset.x;
                            const index = Math.round(offsetX / width);
                            setImageIndex(index);
                        }}
                    >
                        {productGallery.map((image, index) => (
                            <View key={`fullscreen-${selectedColor?.id ?? 'default'}-${index}`} style={styles.imageViewerSlide}>
                                <Image
                                    source={image}
                                    style={styles.fullscreenImage}
                                    resizeMode="contain"
                                />
                            </View>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            <Modal
                visible={showSizeGuide}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSizeGuide(false)}
            >
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

            <Modal
                visible={showEcoModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEcoModal(false)}
            >
                <View style={styles.ecoOverlay}>
                    <View style={styles.ecoCard}>
                        <View style={styles.ecoHandle} />

                        <View style={styles.ecoHeaderRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.ecoTitle}>Eco details</Text>
                                <Text style={styles.ecoProductName}>{ecoData.name}</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.ecoCloseButton}
                                onPress={() => setShowEcoModal(false)}
                            >
                                <Feather name="x" size={20} color="#111" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.ecoScrollContent}
                        >
                            <View style={styles.ecoInfoBlock}>
                                <Text style={styles.ecoLabel}>Description</Text>
                                <Text style={styles.ecoText}>{ecoData.ecoDescription}</Text>
                            </View>

                            <View style={styles.ecoInfoBlock}>
                                <Text style={styles.ecoLabel}>Eco score</Text>
                                <Text
                                    style={[
                                        styles.ecoScoreValue,
                                        ecoData.ecoScore < 60
                                            ? styles.ecoScoreLow
                                            : styles.ecoScoreGood,
                                    ]}
                                >
                                    {ecoData.ecoScore}/100
                                </Text>
                            </View>

                            <View style={styles.ecoInfoBlock}>
                                <Text style={styles.ecoLabel}>Material</Text>
                                <Text style={styles.ecoText}>{ecoData.material}</Text>
                            </View>

                            <View style={styles.ecoInfoBlock}>
                                <Text style={styles.ecoLabel}>Sustainability</Text>
                                <Text style={styles.ecoText}>{ecoData.sustainability}</Text>
                            </View>

                            {showEcoAlternatives && (
                                <View style={styles.ecoAlternativesSection}>
                                    <Text style={styles.ecoAlternativesTitle}>
                                        Better alternatives
                                    </Text>

                                    <Text style={styles.ecoAlternativesHint}>
                                        This product has a lower eco score. Here are similar pieces with better sustainability performance.
                                    </Text>

                                    <View style={styles.ecoAlternativeCard}>
                                        <TouchableOpacity
                                            style={styles.ecoArrowButton}
                                            onPress={goToPrevEcoAlternative}
                                        >
                                            <Feather name="arrow-left" size={20} color="#fff" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.ecoAlternativeCenter}
                                            activeOpacity={0.85}
                                            onPress={() => {
                                                setShowEcoModal(false);

                                                router.push({
                                                    pathname: '/product_detail',
                                                    params: {
                                                        productId: currentEcoAlternative.id,
                                                    },
                                                });
                                            }}
                                        >
                                            <Image
                                                source={currentEcoAlternative.image}
                                                style={styles.ecoAlternativeImage}
                                                resizeMode="cover"
                                            />
                                            <Text
                                                style={styles.ecoAlternativeName}
                                                numberOfLines={2}
                                            >
                                                {currentEcoAlternative.name}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.ecoArrowButton}
                                            onPress={goToNextEcoAlternative}
                                        >
                                            <Feather name="arrow-right" size={20} color="#fff" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.ecoAlternativeScore}>
                                        Eco score: {currentEcoAlternative.ecoScore}/100
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={showDuplicateModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDuplicateModal(false)}
            >
                <View style={styles.duplicateOverlay}>
                    <View style={styles.duplicateCard}>
                        <View style={styles.duplicateHandle} />

                        <View style={styles.duplicateTopIcon}>
                            <Feather name="alert-circle" size={24} color="#111" />
                        </View>

                        <Text style={styles.duplicateMainText}>
                            You already have a very similar piece in your wardrobe.
                        </Text>

                        <View style={styles.duplicateCompareBox}>
                            <View style={styles.duplicateCompareItem}>
                                <Image
                                    source={productGallery[imageIndex] ?? productGallery[0]}
                                    style={styles.duplicateCompareImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.duplicateCompareLabel} numberOfLines={1}>
                                    New item
                                </Text>
                            </View>

                            <View style={styles.duplicateEqualsWrap}>
                                <Text style={styles.duplicateEqualsText}>=</Text>
                            </View>

                            <View style={styles.duplicateCompareItem}>
                                <Image
                                    source={duplicateWardrobeItem.image}
                                    style={styles.duplicateCompareImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.duplicateCompareLabel} numberOfLines={1}>
                                    In wardrobe
                                </Text>
                            </View>
                        </View>

                        <View style={styles.duplicateAlternativesRow}>
                            {duplicateAlternatives.map((alt) => (
                                <TouchableOpacity
                                    key={alt.id}
                                    style={styles.duplicateAlternativeCard}
                                    activeOpacity={0.85}
                                >
                                    <Image
                                        source={alt.image}
                                        style={styles.duplicateAlternativeImage}
                                        resizeMode="cover"
                                    />
                                    <Text style={styles.duplicateAlternativeScore}>
                                        {alt.ecoScore}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.duplicateCloseCenterButton}
                            onPress={() => setShowDuplicateModal(false)}
                        >
                            <Feather name="x" size={20} color="#111" />
                        </TouchableOpacity>
                    </View>
                </View>
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
        backgroundColor: COLORS.bg,
    },

    scrollContent: {
        paddingBottom: 40,
    },

    imageSection: {
        position: 'relative',
        backgroundColor: COLORS.surface,
    },

    mainImage: {
        width,
        height: IMAGE_HEIGHT,
        backgroundColor: COLORS.surface,
    },

    topIconsRow: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    quickActionRow: {
        flexDirection: 'row',
        backgroundColor: '#f3f3f3',
        borderTopWidth: 1,
        borderColor: COLORS.border,
        borderBottomWidth: 1,
    },

    quickActionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        backgroundColor: '#f3f3f3',
    },

    quickActionText: {
        marginTop: 5,
        fontSize: 12,
        color: COLORS.text,
        fontWeight: '600',
    },

    sectionSpacing: {
        paddingHorizontal: 16,
        paddingTop: 18,
    },

    colorLabel: {
        fontSize: 14,
        color: COLORS.textSoft,
        marginBottom: 10,
        fontWeight: '500',
    },

    colorCard: {
        width: 54,
        height: 54,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'transparent',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
    },

    colorCardActive: {
        borderColor: COLORS.black,
    },

    colorSwatchLarge: {
        width: 34,
        height: 34,
        borderRadius: 17,
    },

    whiteSwatchBorder: {
        borderWidth: 1,
        borderColor: '#d0d0d0',
    },

    price: {
        fontSize: 30,
        fontWeight: '800',
        color: COLORS.text,
        marginTop: 40,
        paddingHorizontal: 16,
    },

    productTitle: {
        fontSize: 18,
        color: COLORS.textSoft,
        marginTop: 4,
        paddingHorizontal: 16,
        fontWeight: '500',
    },

    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 20,
    },

    ratingValue: {
        marginLeft: 8,
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '700',
    },

    ratingCount: {
        marginLeft: 6,
        fontSize: 14,
        color: '#6d6d6d',
    },

    fitMeterWrapper: {
        paddingHorizontal: 16,
        marginTop: 18,
    },

    fitMeterLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    fitMeterText: {
        fontSize: 13,
        color: COLORS.textMuted,
    },

    fitMeterTextActive: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '700',
    },

    fitMeterTrack: {
        height: 6,
        borderRadius: 4,
        backgroundColor: '#d0d0d0',
        justifyContent: 'center',
    },

    fitMeterDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.black,
        position: 'absolute',
        left: '46%',
    },

    sizeHeaderRow: {
        paddingHorizontal: 16,
        marginTop: 30,
    },

    sizeGuideRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 14,
    },

    sizeGuideText: {
        marginLeft: 8,
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },

    addToCartButton: {
        marginHorizontal: 16,
        marginTop: 30,
        backgroundColor: COLORS.black,
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },

    addToCartButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.4,
    },

    deliveryCard: {
        marginHorizontal: 16,
        marginTop: 20,
        backgroundColor: COLORS.surface2,
        borderRadius: 16,
        padding: 16,
    },

    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    deliveryTextWrap: {
        flex: 1,
        marginLeft: 12,
    },

    deliveryDivider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: 14,
    },

    deliveryTitle: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '700',
        marginBottom: 4,
    },

    deliverySubtitle: {
        fontSize: 13,
        color: COLORS.textSoft,
        lineHeight: 18,
    },

    policyLinkButton: {
        marginTop: 14,
        alignItems: 'center',
    },

    policyLinkText: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '700',
        textDecorationLine: 'underline',
        textAlign: 'center',
    },

    accordionGroup: {
        marginHorizontal: 16,
        marginTop: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#d7d7d7',
        paddingBottom: 12,
    },

    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },

    accordionTitle: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '700',
    },

    accordionBody: {
        marginTop: 10,
        fontSize: 14,
        color: COLORS.textSoft,
        lineHeight: 21,
    },

    viewGuideButton: {
        marginTop: 12,
        width: '100%',
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: COLORS.black,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },

    viewGuideButtonText: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '700',
        textAlign: 'center',
    },

    recommendSectionCard: {
        marginHorizontal: 16,
        marginTop: 22,
        padding: 14,
        backgroundColor: COLORS.surface2,
        borderRadius: 18,
    },

    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },

    sectionTitleLarge: {
        fontSize: 20,
        color: COLORS.text,
        fontWeight: '800',
        marginBottom: 12,
    },

    sectionTitleCount: {
        fontSize: 13,
        color: COLORS.textSoft,
        fontWeight: '600',
    },

    sectionBlock: {
        paddingHorizontal: 16,
        marginTop: 22,
    },

    miniProductCard: {
        width: RECOMMEND_CARD_WIDTH,
        marginRight: 12,
    },

    miniProductImage: {
        width: RECOMMEND_CARD_WIDTH,
        height: 210,
        borderRadius: 14,
        backgroundColor: COLORS.surface,
    },

    miniCartButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
    },

    miniInfoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    miniPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
    },

    miniName: {
        marginTop: 4,
        fontSize: 13,
        lineHeight: 17,
        color: COLORS.textSoft,
        height: 34,
    },

    miniHeartButton: {
        marginLeft: 8,
        marginTop: 2,
        marginRight: 6,
    },

    lookCard: {
        width: width * 0.58,
        height: 290,
        borderRadius: 18,
        overflow: 'hidden',
        marginRight: 12,
        backgroundColor: COLORS.surface,
        marginBottom: 16,
    },

    lookImage: {
        width: '100%',
        height: '100%',
    },

    lookLabel: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },

    lookLabelText: {
        fontSize: 13,
        color: COLORS.text,
        fontWeight: '700',
    },

    builderMiniImage: {
        width: '100%',
        height: '100%',
    },

    reviewHeaderBlock: {
        paddingHorizontal: 16,
        marginTop: 26,
    },

    reviewSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -2,
    },

    reviewSummaryValue: {
        marginLeft: 8,
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '700',
    },

    reviewSummaryCount: {
        marginLeft: 6,
        fontSize: 14,
        color: COLORS.textSoft,
    },

    reviewCard: {
        marginHorizontal: 16,
        marginTop: 14,
        backgroundColor: COLORS.surface2,
        borderRadius: 16,
        padding: 14,
    },

    reviewTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },

    reviewName: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '700',
    },

    reviewDate: {
        marginTop: 2,
        fontSize: 12,
        color: COLORS.textMuted,
    },

    reviewText: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },

    seeAllReviewsButton: {
        marginHorizontal: 16,
        marginTop: 16,
        borderWidth: 1,
        borderColor: COLORS.black,
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },

    seeAllReviewsText: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    reviewBarBlock: {
        marginBottom: 16,
    },

    reviewBarLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    reviewBarLabel: {
        fontSize: 13,
        color: COLORS.textSoft,
        fontWeight: '500',
    },

    reviewTrack: {
        height: 8,
        backgroundColor: '#d1d1d1',
        borderRadius: 5,
        overflow: 'hidden',
    },

    reviewTrackFill: {
        height: '100%',
        backgroundColor: COLORS.black,
        borderRadius: 5,
    },

    reviewNote: {
        marginTop: 10,
        fontSize: 12,
        color: COLORS.textMuted,
        lineHeight: 18,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.28)',
        justifyContent: 'flex-end',
    },

    sizeModalCard: {
        backgroundColor: '#f3f3f3',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 26,
        minHeight: 380,
    },

    sizeModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    sizeModalTitle: {
        fontSize: 18,
        color: COLORS.text,
        fontWeight: '800',
    },

    doneText: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '700',
    },

    sizeList: {
        maxHeight: 300,
    },

    sizeRow: {
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e2e2',
    },

    sizeRowText: {
        fontSize: 24,
        color: COLORS.text,
        fontWeight: '600',
    },

    sizeRowTextActive: {
        color: COLORS.text,
        fontWeight: '800',
    },

    sizeRowTextDisabled: {
        color: COLORS.danger,
        textDecorationLine: 'line-through',
    },

    sizeEcoRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#d6d6d6',
        backgroundColor: '#f3f3f3',
    },

    sizeEcoItem: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 6,
    },

    sizeEcoDivider: {
        borderLeftWidth: 1,
        borderColor: '#d6d6d6',
    },

    sizeEcoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
    },

    builderSectionCard: {
        marginHorizontal: 16,
        marginTop: 22,
        padding: 14,
        backgroundColor: COLORS.surface2,
        borderRadius: 18,
    },

    builderOutfitCard: {
        width: width * 0.58,
        marginRight: 14,
    },

    builderMiniGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    builderMiniItem: {
        width: '23.5%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: COLORS.surface3,
        marginBottom: 8,
    },

    colorCardDisabled: {
        opacity: 0.5,
    },

    colorCross: {
        position: 'absolute',
        width: '80%',
        height: 2,
        backgroundColor: '#111',
        transform: [{ rotate: '45deg' }],
    },

    sheetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },

    saveSheetCard: {
        backgroundColor: '#f3f3f3',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        paddingBottom: 28,
        paddingHorizontal: 18,
    },

    saveSheetHandle: {
        width: 42,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#bdbdbd',
        alignSelf: 'center',
        marginBottom: 16,
    },

    saveSheetPreviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },

    saveSheetPreviewImage: {
        width: 62,
        height: 62,
        borderRadius: 12,
        backgroundColor: COLORS.surface,
    },

    saveSheetPreviewText: {
        flex: 1,
        marginLeft: 12,
    },

    saveSheetBrand: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginBottom: 4,
        textTransform: 'uppercase',
    },

    saveSheetName: {
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '700',
        lineHeight: 20,
    },

    saveSheetAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#dddddd',
    },

    saveSheetActionText: {
        marginLeft: 12,
        fontSize: 15,
        color: COLORS.text,
        fontWeight: '500',
    },

    imageIndicatorRow: {
        position: 'absolute',
        bottom: 14,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },

    imageIndicatorLine: {
        height: 4,
        borderRadius: 999,
        backgroundColor: COLORS.black,
        marginHorizontal: 4,
    },

    drawerRoot: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
        elevation: 999,
    },

    drawerBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },

    cartDrawer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        backgroundColor: 'rgba(243, 243, 243, 0.45)',
        borderTopLeftRadius: 28,
        borderBottomLeftRadius: 28,
        borderLeftWidth: 1,
        borderColor: '#d8d8d8',
        paddingHorizontal: 6,
        paddingTop: 12,
        paddingBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: -4, height: 0 },
        elevation: 12,
    },

    cartDrawerTopSpacer: {
        width: 44,
        height: 4,
        borderRadius: 999,
        backgroundColor: '#c8c8c8',
        alignSelf: 'center',
        marginBottom: 26,
        marginTop: 4,
    },

    cartDrawerList: {
        paddingTop: 8,
        paddingBottom: 6,
        alignItems: 'stretch',
        flexGrow: 1,
    },

    cartDrawerItem: {
        width: '100%',
        minHeight: 94,
        borderRadius: 16,
        borderWidth: 0,
        borderColor: '#474d54',
        backgroundColor: '#e7e7e7',
        marginBottom: 14,
        paddingHorizontal: 10,
        paddingVertical: 10,
        justifyContent: 'space-between',
    },

    cartDrawerRowTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    cartDrawerMiniIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#474d54',
        backgroundColor: '#f3f3f3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    cartDrawerName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        lineHeight: 19,
    },

    cartDrawerMeta: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '700',
    },

    cartDrawerMetaRemaining: {
        color: '#006958',
    },

    cartDrawerMetaOver: {
        color: '#df2518',
    },

    cartDrawerAddButton: {
        width: '100%',
        minHeight: 54,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#111',
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        marginTop: 'auto',
        marginBottom: 2,
    },

    cartDrawerAddButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },

    cartDrawerTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 1,
        paddingHorizontal: 4,
    },

    drawerSwipeActions: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: 14,
    },

    drawerSwipeButton: {
        width: 72,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginLeft: 8,
    },

    drawerEditSwipeButton: {
        backgroundColor: '#e4e4e4',
    },

    drawerDeleteSwipeButton: {
        backgroundColor: '#111',
    },

    drawerSwipeButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111',
    },

    drawerDeleteSwipeButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },

    imageViewerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.96)',
    },

    imageViewerTopRow: {
        position: 'absolute',
        top: 14,
        left: 16,
        right: 16,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },

    imageViewerCounter: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },

    imageViewerSlide: {
        width,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    fullscreenImage: {
        width: width,
        height: '82%',
    },

    sizeGuideOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    sizeGuideCard: {
        width: '88%',
        maxHeight: '70%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
    },

    sizeGuideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },

    sizeGuideTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },

    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },

    tableHeader: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
    },

    tableCell: {
        flex: 1,
        fontSize: 13,
        color: '#444',
    },

    ecoOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.28)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },

    ecoCard: {
        width: '100%',
        maxWidth: 360,
        maxHeight: '82%',
        backgroundColor: 'rgba(245, 245, 245, 0.96)',
        borderRadius: 28,
        paddingTop: 10,
        paddingHorizontal: 16,
        paddingBottom: 18,
        borderWidth: 1,
        borderColor: '#d6d6d6',
    },

    ecoHandle: {
        width: 44,
        height: 4,
        borderRadius: 999,
        backgroundColor: '#c8c8c8',
        alignSelf: 'center',
        marginBottom: 14,
    },

    ecoHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 14,
    },

    ecoTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111',
        marginBottom: 2,
    },

    ecoProductName: {
        fontSize: 14,
        color: '#6a6a6a',
        fontWeight: '500',
    },

    ecoCloseButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
    },

    ecoScrollContent: {
        paddingBottom: 6,
    },

    ecoInfoBlock: {
        marginBottom: 16,
    },

    ecoLabel: {
        fontSize: 13,
        fontWeight: '800',
        color: '#111',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    ecoText: {
        fontSize: 14,
        lineHeight: 21,
        color: '#5f6770',
    },

    ecoScoreValue: {
        fontSize: 22,
        fontWeight: '800',
    },

    ecoScoreGood: {
        color: '#006958',
    },

    ecoScoreLow: {
        color: '#df2518',
    },

    ecoAlternativesSection: {
        marginTop: 6,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#cad1da',
    },

    ecoAlternativesTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
        marginBottom: 6,
    },

    ecoAlternativesHint: {
        fontSize: 13,
        lineHeight: 19,
        color: '#6a6a6a',
        marginBottom: 16,
    },

    ecoAlternativeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    ecoArrowButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111',
    },

    ecoAlternativeCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
    },

    ecoAlternativeImage: {
        width: 100,
        height: 100,
        borderRadius: 20,
        marginBottom: 10,
        backgroundColor: '#d6d6d6',
    },

    ecoAlternativeName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
        textAlign: 'center',
        lineHeight: 18,
    },

    ecoAlternativeScore: {
        marginTop: 14,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '800',
        color: '#006958',
    },

    duplicateOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.20)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },

    duplicateCard: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: 'rgba(243, 243, 243, 0.96)',
        borderRadius: 30,
        paddingTop: 10,
        paddingHorizontal: 14,
        paddingBottom: 20,
        borderWidth: 1,
        borderColor: '#d7d7d7',
    },

    duplicateHandle: {
        width: 42,
        height: 4,
        borderRadius: 999,
        backgroundColor: '#c8c8c8',
        alignSelf: 'center',
        marginBottom: 14,
    },

    duplicateTopIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1,
        borderColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#efefef',
        marginBottom: 14,
    },

    duplicateMainText: {
        fontSize: 15,
        lineHeight: 21,
        fontWeight: '700',
        color: '#111',
        marginBottom: 14,
    },

    duplicateCompareBox: {
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 18,
        backgroundColor: '#ededed',
        minHeight: 138,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    duplicateCompareItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    duplicateCompareImage: {
        width: 78,
        height: 78,
        borderRadius: 14,
        backgroundColor: '#ddd',
        marginBottom: 8,
    },

    duplicateCompareLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111',
        textAlign: 'center',
    },

    duplicateEqualsWrap: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },

    duplicateEqualsText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111',
    },

    duplicateAlternativesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    duplicateAlternativeCard: {
        width: '30.5%',
        height: 104,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#444',
        backgroundColor: '#ededed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    duplicateAlternativeImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },

    duplicateAlternativeScore: {
        position: 'absolute',
        bottom: 8,
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
    },

    duplicateCloseCenterButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: '#444',
        backgroundColor: '#efefef',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
});