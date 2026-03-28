import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ImageBackground,
    Modal,
    Pressable,
    Alert,
    Dimensions,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { useProducts, sizeOptions } from '../../context/product_context';
import { productImages } from '../../context/product_images';
import { useFocusEffect } from 'expo-router';
import { Animated, TouchableWithoutFeedback } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useCart, CartProduct } from '../../context/cart_context';
import { useWishlist } from '../../context/wishlist_context';
import { Image } from 'expo-image';
import { ActivityIndicator } from 'react-native';

const CARD_WIDTH = Dimensions.get('window').width * 0.48 - 8;
const IMAGE_HEIGHT = 245;

export default function SearchItemsScreen() {
    const router = useRouter();
    const { products } = useProducts();
    const { category, subcategory, gender } = useLocalSearchParams();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [loadingImages, setLoadingImages] = React.useState<Record<string, boolean>>({});

    const handleImageLoadStart = (key: string) => {
        setLoadingImages((prev) => ({ ...prev, [key]: true }));
    };

    const handleImageLoadEnd = (key: string) => {
        setLoadingImages((prev) => ({ ...prev, [key]: false }));
    };

    const categoryName = Array.isArray(category) ? category[0] : category;
    const subcategoryName = Array.isArray(subcategory) ? subcategory[0] : subcategory;
    const selectedGenderParam = Array.isArray(gender) ? gender[0] : gender;

    const genderValue = selectedGenderParam === 'MAN' ? 'men' : 'women';
    const { carts, addProductToCart, deleteCart } = useCart();

    const [openMenu, setOpenMenu] = React.useState<'SORT' | 'FILTER' | 'SIZE' | null>(null);
    const [showColours, setShowColours] = React.useState(false);
    const [activePriceThumb, setActivePriceThumb] = React.useState<0 | 1 | null>(null);
    const [isSliding, setIsSliding] = React.useState(false);

    const DRAWER_WIDTH = 220;

    const [showCartPicker, setShowCartPicker] = React.useState(false);
    const [selectedCartProduct, setSelectedCartProduct] = React.useState<CartProduct | null>(null);
    const slideAnim = React.useRef(new Animated.Value(0)).current;

    const openCartPicker = (item: typeof filteredProducts[number]) => {
        const imageSource = productImages[item.images[0]];
        const cartProduct: CartProduct = {
            id: `${item.id}-default`,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: imageSource,
            note: '',
        };
        setSelectedCartProduct(cartProduct);
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

    const overlayOpacity = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.34],
    });

    const drawerTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [DRAWER_WIDTH + 30, 0],
    });

    const getCartTotal = (cart: { products: CartProduct[] }) => {
        return cart.products.reduce(
            (sum, product) => sum + product.price * product.quantity,
            0
        );
    };

    const handleAddToSpecificCart = (cartId: string) => {
        if (!selectedCartProduct) return;
        addProductToCart(cartId, selectedCartProduct);
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
                { text: 'Cancel', style: 'cancel' },
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

    useFocusEffect(
        React.useCallback(() => {
            setOpenMenu(null);
            setShowColours(false);
            setActivePriceThumb(null);
            setIsSliding(false);
            setSelectedSort('Recommended');
            setSelectedSizes([]);
            setPriceRange([5, 500]);
            setSelectedFilters({ brand: 'All', colour: 'All' });
            setPreviewVisible(false);
            setSelectedPreview(null);
        }, [])
    );

    const [selectedSort, setSelectedSort] = React.useState('Recommended');
    const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
    const [priceRange, setPriceRange] = React.useState<[number, number]>([5, 500]);
    const [selectedFilters, setSelectedFilters] = React.useState({ brand: 'All', colour: 'All' });
    const [previewVisible, setPreviewVisible] = React.useState(false);
    const [selectedPreview, setSelectedPreview] = React.useState<{ image: any; name: string } | null>(null);

    const openPreview = (image: any, name: string) => {
        setSelectedPreview({ image, name });
        setPreviewVisible(true);
    };

    const saveImageToPhone = async () => {
        try {
            if (!selectedPreview) return;
            const permission = await MediaLibrary.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission needed', 'Please allow access to your photos to save the image.');
                return;
            }
            const asset = Asset.fromModule(selectedPreview.image);
            await asset.downloadAsync();
            if (!asset.localUri) {
                Alert.alert('Error', 'Image could not be prepared for saving.');
                return;
            }
            const fileName = asset.localUri.split('/').pop() || `vaib-image-${Date.now()}.png`;
            const newPath = FileSystem.documentDirectory + fileName;
            await FileSystem.copyAsync({ from: asset.localUri, to: newPath });
            await MediaLibrary.createAssetAsync(newPath);
            Alert.alert('Saved', 'Image was saved to your phone.');
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while saving the image.');
            console.log(error);
        }
    };

    const sortOptions = ['Recommended', "What's New", 'Price: High to Low', 'Price: Low to High'];
    const brandOptions = ['All', 'Adidas', 'Zara', 'Mango', 'Gucci', 'Nike'];
    const colourOptions = [
        { name: 'All', color: '#d9d9d9' },
        { name: 'Black', color: '#111111' },
        { name: 'White', color: '#ffffff' },
        { name: 'Beige', color: '#d8c3a5' },
        { name: 'Red', color: '#d92d20' },
        { name: 'Blue', color: '#2e6cff' },
        { name: 'Green', color: '#2f9e44' },
        { name: 'Pink', color: '#ff8fab' },
        { name: 'Grey', color: '#9e9e9e' },
        { name: 'Brown', color: '#7a5543' },
        { name: 'Cream', color: '#f0e6d8' },
        { name: 'Camel', color: '#b98a55' },
        { name: 'Yellow', color: '#e8c547' },
        { name: 'Burgundy', color: '#6d1f2f' },
    ];

    const filteredProducts = React.useMemo(() => {
        let result = [...products];
        result = result.filter((item) => item.gender === genderValue);
        if (categoryName) {
            result = result.filter((item) => {
                if (item.mainCategory === categoryName) return true;
                return item.tags.includes(categoryName as string);
            });
        }
        if (subcategoryName && subcategoryName !== 'All') {
            result = result.filter((item) => {
                if (item.subCategory === subcategoryName) return true;
                return item.tags.includes(subcategoryName as string);
            });
        }
        if (selectedFilters.brand !== 'All') {
            result = result.filter((item) => item.brand === selectedFilters.brand);
        }
        if (selectedFilters.colour !== 'All') {
            result = result.filter((item) =>
                item.availableColors.some((color) => color.name === selectedFilters.colour)
            );
        }
        result = result.filter(
            (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
        );
        if (selectedSizes.length > 0) {
            result = result.filter((item) =>
                item.availableSizes.some((size) => selectedSizes.includes(size))
            );
        }
        if (selectedSort === 'Price: Low to High') {
            result.sort((a, b) => a.price - b.price);
        } else if (selectedSort === 'Price: High to Low') {
            result.sort((a, b) => b.price - a.price);
        } else if (selectedSort === "What's New") {
            result.sort((a, b) => Number(!!b.isNewMarkdown) - Number(!!a.isNewMarkdown));
        } else {
            result.sort((a, b) => Number(!!b.isBestSeller) - Number(!!a.isBestSeller));
        }
        return result;
    }, [products, categoryName, subcategoryName, genderValue, selectedFilters.brand, selectedFilters.colour, selectedSizes, priceRange, selectedSort]);

    const toggleMenu = (menu: 'SORT' | 'FILTER' | 'SIZE') => {
        setOpenMenu((prev) => (prev === menu ? null : menu));
    };

    const toggleSize = (size: string) => {
        setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((item) => item !== size) : [...prev, size]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <TouchableOpacity
                        onPress={() => router.replace('/search')}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-left" size={24} color="#111" />
                    </TouchableOpacity>

                    <ImageBackground
                        source={require('../../assets/images_app/search.png')}
                        style={styles.searchWrapper}
                        imageStyle={{ borderRadius: 12 }}
                    >
                        <Feather name="search" size={18} color="#393939" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search"
                            placeholderTextColor="#393939"
                            style={styles.searchInput}
                        />
                    </ImageBackground>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text style={styles.title}>{categoryName}: {subcategoryName}</Text>

                    <View style={styles.filterTabsWrapper}>
                        <TouchableOpacity style={styles.filterTab} onPress={() => toggleMenu('SORT')}>
                            <View style={styles.tabInner}>
                                <Text style={[styles.filterTabText, openMenu === 'SORT' && styles.activeFilterTabText, openMenu === 'SORT' && styles.activeTabBold]}>SORT</Text>
                                <Feather name={openMenu === 'SORT' ? 'chevron-up' : 'chevron-down'} size={14} color={openMenu === 'SORT' ? '#111' : '#888'} />
                            </View>
                            {openMenu === 'SORT' && <View style={styles.activeFilterLine} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.filterTab} onPress={() => toggleMenu('FILTER')}>
                            <View style={styles.tabInner}>
                                <Text style={[styles.filterTabText, openMenu === 'FILTER' && styles.activeFilterTabText, openMenu === 'FILTER' && styles.activeTabBold]}>FILTER</Text>
                                <Feather name={openMenu === 'FILTER' ? 'chevron-up' : 'chevron-down'} size={14} color={openMenu === 'FILTER' ? '#111' : '#888'} />
                            </View>
                            {openMenu === 'FILTER' && <View style={styles.activeFilterLine} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.filterTab} onPress={() => toggleMenu('SIZE')}>
                            <View style={styles.tabInner}>
                                <Text style={[styles.filterTabText, openMenu === 'SIZE' && styles.activeFilterTabText, openMenu === 'SIZE' && styles.activeTabBold]}>SIZE</Text>
                                <Feather name={openMenu === 'SIZE' ? 'chevron-up' : 'chevron-down'} size={14} color={openMenu === 'SIZE' ? '#111' : '#888'} />
                            </View>
                            {openMenu === 'SIZE' && <View style={styles.activeFilterLine} />}
                        </TouchableOpacity>
                    </View>

                    {openMenu === 'SORT' && (
                        <View style={styles.dropdownBox}>
                            {sortOptions.map((option) => (
                                <TouchableOpacity key={option} style={styles.dropdownRow} onPress={() => { setSelectedSort(option); setOpenMenu(null); }}>
                                    <View style={styles.sortLeft}>
                                        {selectedSort === option ? <MaterialIcons name="star" size={12} color="#111" /> : <View style={styles.starPlaceholder} />}
                                        <Text style={[styles.dropdownText, selectedSort === option && styles.activeSortText]}>{option}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {openMenu === 'FILTER' && (
                        <View style={styles.dropdownBox}>
                            <TouchableOpacity style={styles.colourHeader} onPress={() => setShowColours((prev) => !prev)}>
                                <View style={styles.colourHeaderLeft}>
                                    <Text style={styles.sectionTitleNoMargin}>Colour</Text>
                                </View>
                                <View style={styles.colourHeaderRight}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                    <Feather name={showColours ? 'chevron-up' : 'chevron-down'} size={16} color="#111" />
                                </View>
                            </TouchableOpacity>

                            {showColours && (
                                <View style={styles.colourList}>
                                    {colourOptions.map((option) => (
                                        <TouchableOpacity key={option.name} style={styles.colourRow} onPress={() => setSelectedFilters((prev) => ({ ...prev, colour: option.name }))}>
                                            <View style={styles.colourLeft}>
                                                <View style={[styles.colourDot, { backgroundColor: option.color }, option.name === 'White' && styles.whiteColourDot]} />
                                                <Text style={[styles.colourText, selectedFilters.colour === option.name && styles.activeColourText]}>{option.name}</Text>
                                            </View>
                                            {selectedFilters.colour === option.name && <MaterialIcons name="radio-button-checked" size={16} color="#111" />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <Text style={styles.sectionTitle}>Brand</Text>
                            <View style={styles.optionWrap}>
                                {brandOptions.map((option) => (
                                    <TouchableOpacity key={option} style={[styles.optionPill, selectedFilters.brand === option && styles.activePill]} onPress={() => setSelectedFilters((prev) => ({ ...prev, brand: option }))}>
                                        <Text style={[styles.optionPillText, selectedFilters.brand === option && styles.activePillText]}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.sectionTitle}>Price</Text>
                            <View style={styles.priceTopRow}>
                                <Text style={[styles.priceValue, isSliding && activePriceThumb === 0 && styles.priceValueActive]}>€{priceRange[0]}</Text>
                                <Text style={[styles.priceValue, isSliding && activePriceThumb === 1 && styles.priceValueActive]}>€{priceRange[1]}</Text>
                            </View>

                            <View style={styles.sliderWrapper}>
                                <MultiSlider
                                    values={priceRange}
                                    min={5} max={500} step={1} sliderLength={280}
                                    onValuesChange={(values: number[]) => {
                                        setIsSliding(true);
                                        if (values[0] !== priceRange[0]) setActivePriceThumb(0);
                                        else if (values[1] !== priceRange[1]) setActivePriceThumb(1);
                                        setPriceRange([values[0], values[1]] as [number, number]);
                                    }}
                                    onValuesChangeFinish={(values: number[]) => {
                                        setPriceRange([values[0], values[1]] as [number, number]);
                                        setActivePriceThumb(null);
                                        setIsSliding(false);
                                    }}
                                    selectedStyle={{ backgroundColor: isSliding ? '#df6a2e' : '#111', height: 4 }}
                                    unselectedStyle={{ backgroundColor: '#d7d7d7', height: 4 }}
                                    markerStyle={{ backgroundColor: '#111', height: 18, width: 18, borderRadius: 9 }}
                                    pressedMarkerStyle={{ backgroundColor: '#df6a2e', height: 22, width: 22, borderRadius: 11 }}
                                    containerStyle={{ alignSelf: 'center', height: 40 }}
                                    trackStyle={{ height: 4, borderRadius: 2 }}
                                />
                            </View>

                            <View style={styles.priceLabelsRow}>
                                <Text style={styles.priceRangeLabel}>Min €5</Text>
                                <Text style={styles.priceRangeLabel}>Max €500</Text>
                            </View>

                            <TouchableOpacity style={styles.applyButton} onPress={() => setOpenMenu(null)}>
                                <Text style={styles.applyButtonText}>APPLY FILTERS</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {openMenu === 'SIZE' && (
                        <View style={styles.dropdownBox}>
                            <Text style={styles.sectionTitle}>Select Size</Text>
                            <View style={styles.optionWrap}>
                                {sizeOptions.map((size) => (
                                    <TouchableOpacity
                                        key={size.label}
                                        style={[styles.sizePill, selectedSizes.includes(size.label) && styles.activeSizePill, size.disabled && { opacity: 0.45 }]}
                                        onPress={() => { if (!size.disabled) toggleSize(size.label); }}
                                        disabled={size.disabled}
                                    >
                                        <Text style={[styles.sizePillText, selectedSizes.includes(size.label) && styles.activeSizePillText]}>{size.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity style={styles.applyButton} onPress={() => setOpenMenu(null)}>
                                <Text style={styles.applyButtonText}>APPLY SIZE</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <Text style={styles.foundText}>{filteredProducts.length} items found • {selectedSort}</Text>

                    <View style={styles.productsGrid}>
                        {filteredProducts.map((item) => (
                            <View key={item.id} style={styles.productCard}>
                                <View style={styles.imageSliderWrapper}>
                                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} bounces={false}>
                                        {item.images.map((imageKey, imgIndex) => {
                                            const imageSource = productImages[imageKey];
                                            if (!imageSource) return null;
                                            return (
                                                <View key={imgIndex} style={{ width: CARD_WIDTH, height: IMAGE_HEIGHT }}>
                                                    <TouchableOpacity
                                                        activeOpacity={1}
                                                        onPress={() => router.push({ pathname: '/product_detail', params: { productId: item.id, category: categoryName ?? '', subcategory: subcategoryName ?? '', gender: selectedGenderParam ?? 'WOMAN' } })}
                                                        onLongPress={() => openPreview(imageSource, item.name)}
                                                        delayLongPress={250}
                                                    >
                                                        <View style={styles.productImageWrapper}>
                                                            {loadingImages[`${item.id}-${imgIndex}`] && (
                                                                <View style={styles.loaderWrapper}>
                                                                    <ActivityIndicator size="small" color="#999" />
                                                                </View>
                                                            )}
                                                            <Image
                                                                source={imageSource}
                                                                style={[styles.productImage, { opacity: loadingImages[`${item.id}-${imgIndex}`] ? 0 : 1 }]}
                                                                contentFit="cover"
                                                                cachePolicy="memory-disk"
                                                                transition={150}
                                                                onLoadStart={() => handleImageLoadStart(`${item.id}-${imgIndex}`)}
                                                                onLoad={() => handleImageLoadEnd(`${item.id}-${imgIndex}`)}
                                                                onError={() => handleImageLoadEnd(`${item.id}-${imgIndex}`)}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </ScrollView>
                                </View>

                                <TouchableOpacity style={styles.cartButton} onPress={() => openCartPicker(item)}>
                                    <Feather name="shopping-cart" size={16} color="#111" />
                                </TouchableOpacity>

                                <View style={styles.productInfoRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.productPrice}>€{item.price.toFixed(2)}</Text>
                                        <Text style={styles.productName} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
                                    </View>

                                    {/* ← ZMENENÉ: funkčné srdiecko */}
                                    <TouchableOpacity
                                        style={styles.heartButton}
                                        onPress={() => toggleWishlist({
                                            id: item.id,
                                            name: item.name,
                                            price: item.price,
                                            image: productImages[item.images[0]],
                                        })}
                                    >
                                        <Feather
                                            name="heart"
                                            size={22}
                                            color={isInWishlist(item.id) ? '#e74c3c' : '#111'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            <Modal visible={previewVisible} transparent animationType="fade" onRequestClose={() => setPreviewVisible(false)}>
                <View style={styles.previewOverlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setPreviewVisible(false)} />
                    {selectedPreview && (
                        <View style={styles.previewContent}>
                            <Image source={selectedPreview.image} style={styles.previewImage} contentFit="cover" cachePolicy="memory-disk" transition={150} />
                            <View style={styles.previewBottomSheet}>
                                <View>
                                    <Text style={styles.previewBrand}>VAIB</Text>
                                    <Text style={styles.previewName} numberOfLines={2} ellipsizeMode="tail">{selectedPreview.name}</Text>
                                </View>
                                <TouchableOpacity style={styles.saveButton} onPress={saveImageToPhone}>
                                    <Feather name="download" size={16} color="#fff" />
                                    <Text style={styles.saveButtonText}>SAVE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>

            {showCartPicker && (
                <View style={styles.drawerRoot} pointerEvents="box-none">
                    <TouchableWithoutFeedback onPress={closeCartPicker}>
                        <Animated.View style={[styles.drawerBackdrop, { opacity: overlayOpacity }]} />
                    </TouchableWithoutFeedback>

                    <Animated.View style={[styles.cartDrawer, { transform: [{ translateX: drawerTranslateX }] }]}>
                        <View style={styles.cartDrawerTopSpacer} />
                        <Text style={styles.cartDrawerTitle}>Carts</Text>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cartDrawerList}>
                            {carts.map((cart) => {
                                const currentTotal = getCartTotal(cart);
                                const afterAddTotal = currentTotal + (selectedCartProduct?.price ?? 0);
                                const difference = cart.budget - afterAddTotal;
                                const isOver = difference < 0;

                                return (
                                    <Swipeable key={cart.id} renderRightActions={() => renderDrawerRightActions(cart.id)} overshootRight={false}>
                                        <TouchableOpacity style={styles.cartDrawerItem} activeOpacity={0.86} onPress={() => handleAddToSpecificCart(cart.id)}>
                                            <View style={styles.cartDrawerRowTop}>
                                                <TouchableOpacity style={styles.cartDrawerMiniIcon} onPress={closeCartPicker} activeOpacity={0.7}>
                                                    <Feather name="shopping-cart" size={18} color="#111" />
                                                </TouchableOpacity>
                                                <Text style={styles.cartDrawerName} numberOfLines={2} ellipsizeMode="tail">{cart.name}</Text>
                                            </View>
                                            <Text style={[styles.cartDrawerMeta, isOver ? styles.cartDrawerMetaOver : styles.cartDrawerMetaRemaining]} numberOfLines={1}>
                                                {isOver ? `Over budget: €${Math.abs(difference).toFixed(2)}` : `Remaining: €${difference.toFixed(2)}`}
                                            </Text>
                                        </TouchableOpacity>
                                    </Swipeable>
                                );
                            })}

                            <TouchableOpacity style={styles.cartDrawerAddButton} onPress={() => { closeCartPicker(); router.push('/cart_create'); }}>
                                <Feather name="plus" size={18} color="#fff" />
                                <Text style={styles.cartDrawerAddButtonText}>Add</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
    container: { flex: 1, backgroundColor: '#f3f3f3', paddingHorizontal: 14, paddingTop: 8 },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 },
    backButton: { width: 28, height: 42, justifyContent: 'center', alignItems: 'flex-start' },
    searchWrapper: { flex: 1, height: 42, justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    searchIcon: { position: 'absolute', left: 12, zIndex: 1 },
    searchInput: { width: '100%', height: '100%', paddingLeft: 38, paddingRight: 14, fontSize: 15, color: '#111' },
    scrollContent: { paddingBottom: 30 },
    title: { fontSize: 25, fontWeight: '700', color: '#111', marginBottom: 12, textTransform: 'uppercase' },
    filterTabsWrapper: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e5e5', marginBottom: 14, backgroundColor: '#f3f3f3' },
    filterTab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, position: 'relative' },
    tabInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    filterTabText: { fontSize: 15, color: '#888', fontWeight: '600' },
    activeFilterTabText: { color: '#111' },
    activeTabBold: { fontWeight: '700' },
    activeFilterLine: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: 3, backgroundColor: '#df2518' },
    dropdownBox: { backgroundColor: '#f3f3f3', borderRadius: 14, padding: 4, marginBottom: 18 },
    dropdownRow: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e7e7e7' },
    sortLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    starPlaceholder: { width: 12 },
    dropdownText: { fontSize: 16, color: '#111' },
    activeSortText: { fontWeight: '700' },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 12, marginTop: 10 },
    sectionTitleNoMargin: { fontSize: 15, fontWeight: '700', color: '#111' },
    optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    optionPill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, backgroundColor: '#e9e9e9' },
    activePill: { backgroundColor: '#111' },
    optionPillText: { fontSize: 14, color: '#111', fontWeight: '500' },
    activePillText: { color: '#fff' },
    colourHeader: { marginTop: 6, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    colourList: { marginBottom: 10 },
    colourRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ebebeb' },
    colourLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    colourDot: { width: 16, height: 16, borderRadius: 8 },
    whiteColourDot: { borderWidth: 1, borderColor: '#d0d0d0' },
    colourText: { fontSize: 15, color: '#111' },
    activeColourText: { fontWeight: '700' },
    priceTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginTop: 4 },
    priceValue: { fontSize: 15, fontWeight: '700', color: '#111' },
    priceValueActive: { color: '#df6a2e' },
    sliderWrapper: { alignItems: 'center', marginBottom: 8 },
    priceLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
    priceRangeLabel: { fontSize: 13, color: '#9a9a9a' },
    sizePill: { width: 54, height: 44, borderRadius: 22, backgroundColor: '#e9e9e9', justifyContent: 'center', alignItems: 'center' },
    activeSizePill: { backgroundColor: '#111' },
    sizePillText: { fontSize: 14, color: '#111', fontWeight: '600' },
    activeSizePillText: { color: '#fff' },
    applyButton: { marginTop: 8, backgroundColor: '#111', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    applyButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
    foundText: { fontSize: 14, color: '#7d7d7d', textAlign: 'center', marginBottom: 30 },
    productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    productCard: { width: CARD_WIDTH, marginBottom: 22, position: 'relative' },
    productImage: { width: CARD_WIDTH, height: IMAGE_HEIGHT, backgroundColor: '#d9d9d9' },
    cartButton: { position: 'absolute', top: 10, right: 10, backgroundColor: '#fff', borderRadius: 16, padding: 7 },
    productPrice: { fontSize: 18, fontWeight: '700', color: '#111' },
    productName: { marginTop: 4, fontSize: 14, color: '#5f5f5f', lineHeight: 18, height: 36, marginBottom: 10 },
    colourHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    colourHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    seeAllText: { fontSize: 14, color: '#6f6f6f', fontWeight: '500' },
    imageSliderWrapper: { width: CARD_WIDTH, height: IMAGE_HEIGHT, overflow: 'hidden', backgroundColor: '#d9d9d9' },
    heartButton: { marginRight: 10, marginTop: 2 },
    productInfoRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 12 },
    previewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center' },
    previewContent: { width: '92%', alignItems: 'center' },
    previewImage: { width: '100%', height: '72%', maxHeight: 650, borderRadius: 18, backgroundColor: '#e9e9e9' },
    previewBottomSheet: { marginTop: 14, width: '100%', backgroundColor: '#ffffff', borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    previewBrand: { fontSize: 13, color: '#8a8a8a', fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
    previewName: { fontSize: 16, color: '#111', fontWeight: '700', maxWidth: 220 },
    saveButton: { backgroundColor: '#111', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
    saveButtonText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.6 },
    drawerRoot: { ...StyleSheet.absoluteFillObject, zIndex: 999, elevation: 999 },
    drawerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
    cartDrawer: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 220, backgroundColor: 'rgba(243, 243, 243, 0.45)', borderTopLeftRadius: 28, borderBottomLeftRadius: 28, borderLeftWidth: 1, borderColor: '#d8d8d8', paddingHorizontal: 6, paddingTop: 12, paddingBottom: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: -4, height: 0 }, elevation: 12 },
    cartDrawerTopSpacer: { width: 44, height: 4, borderRadius: 999, backgroundColor: '#c8c8c8', alignSelf: 'center', marginBottom: 26, marginTop: 4 },
    cartDrawerTitle: { fontSize: 30, fontWeight: '800', color: '#111', marginBottom: 1, paddingHorizontal: 4 },
    cartDrawerList: { paddingTop: 8, paddingBottom: 6, alignItems: 'stretch', flexGrow: 1 },
    cartDrawerItem: { width: '100%', minHeight: 94, borderRadius: 16, backgroundColor: '#e7e7e7', marginBottom: 14, paddingHorizontal: 10, paddingVertical: 10, justifyContent: 'space-between' },
    cartDrawerRowTop: { flexDirection: 'row', alignItems: 'center' },
    cartDrawerMiniIcon: { width: 52, height: 52, borderRadius: 16, borderWidth: 1, borderColor: '#474d54', backgroundColor: '#f3f3f3', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    cartDrawerName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111', lineHeight: 19 },
    cartDrawerMeta: { marginTop: 8, fontSize: 14, fontWeight: '700' },
    cartDrawerMetaRemaining: { color: '#006958' },
    cartDrawerMetaOver: { color: '#df2518' },
    cartDrawerAddButton: { width: '100%', minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: '#111', backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 'auto', marginBottom: 2 },
    cartDrawerAddButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    drawerSwipeActions: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 14 },
    drawerSwipeButton: { width: 72, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 6, marginLeft: 8 },
    drawerEditSwipeButton: { backgroundColor: '#e4e4e4' },
    drawerDeleteSwipeButton: { backgroundColor: '#111' },
    drawerSwipeButtonText: { fontSize: 12, fontWeight: '700', color: '#111' },
    drawerDeleteSwipeButtonText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    productImageWrapper: { width: CARD_WIDTH, height: IMAGE_HEIGHT, backgroundColor: '#d9d9d9', position: 'relative' },
    loaderWrapper: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
});