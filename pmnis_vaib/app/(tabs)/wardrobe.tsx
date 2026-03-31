import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useWardrobe } from '../../context/wardrobe_context';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useProducts, Product } from '../../context/product_context';
import { productImages } from '../../context/product_images';

export default function WardrobeScreen() {
    const router = useRouter();
    const actionButtonSize = 58;
    const actionGap = 14;
    const actionsWidth = actionButtonSize;
    const actionsHeight = actionButtonSize * 2 + actionGap;
    const [loadingImages, setLoadingImages] = React.useState<Record<string, boolean>>({});

    const { wardrobeItems, deleteWardrobeItem, togglePinWardrobeItem } = useWardrobe();
    const { products } = useProducts();
    const recommendationScrollRef = React.useRef<ScrollView>(null);
    const [activeRecommendationIndex, setActiveRecommendationIndex] = React.useState(0);
    const screenWidth = Dimensions.get('window').width;
    const horizontalPadding = 14 * 2; // container paddingHorizontal
    const insightCardPadding = 16 * 2; // insightCard padding
    const RECOMMENDATION_WIDTH = screenWidth - horizontalPadding - insightCardPadding;




    const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
    const [selectedLayout, setSelectedLayout] = React.useState<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);
    const [showItemActions, setShowItemActions] = React.useState(false);

    const selectedItem = wardrobeItems.find(item => item.id === selectedItemId);
    const itemRefs = React.useRef<Record<string, React.ElementRef<typeof View> | null>>({});

    const [searchText, setSearchText] = React.useState('');
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);


    const sideSpacing = 12;

    const actionsPosition = selectedLayout
        ? {
            top: selectedLayout.y + selectedLayout.height / 2 - actionsHeight / 2,
            left:
                selectedLayout.x + selectedLayout.width + sideSpacing + actionsWidth < screenWidth - sideSpacing
                    ? selectedLayout.x + selectedLayout.width + sideSpacing
                    : Math.max(sideSpacing, selectedLayout.x - actionsWidth - sideSpacing),
        }
        : null;

    const handleCloseItemActions = () => {
        setShowItemActions(false);
        setSelectedItemId(null);
        setSelectedLayout(null);
    };

    const handlePinItem = () => {
        if (selectedItemId) {
            togglePinWardrobeItem(selectedItemId);
        }
        handleCloseItemActions();
    };

    const handleDeleteItem = () => {
        if (selectedItemId) {
            deleteWardrobeItem(selectedItemId);
        }
        handleCloseItemActions();
    };

    const handleOpenCamera = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            alert('Camera permission is needed.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.3,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;

            router.replace({
                pathname: '/wardrobe_add',
                params: { imageUri },
            });
        }
    };

    const handleOpenGallery = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            alert('Gallery permission is needed.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.3,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;

            router.push({
                pathname: '/wardrobe_add',
                params: { imageUri },
            });
        }
    };

    const handleAddItem = () => {
        Alert.alert(
            'Add item',
            'Choose how you want to add your item',
            [
                {
                    text: 'Take photo',
                    onPress: handleOpenCamera,
                },
                {
                    text: 'Choose from gallery',
                    onPress: handleOpenGallery,
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleItemPress = (itemId: string) => {
        router.push({
            pathname: '/wardrobe_item',
            params: { itemId },
        });
    };

    const filteredWardrobeItems = React.useMemo(() => {
        const trimmed = searchText.trim().toLowerCase();

        let result = [...wardrobeItems];

        if (trimmed) {
            result = result.filter((item) =>
                item.name.toLowerCase().includes(trimmed)
            );
        }

        return result.sort((a, b) => {
            if ((a.isPinned ? 1 : 0) !== (b.isPinned ? 1 : 0)) {
                return a.isPinned ? -1 : 1;
            }

            if (a.isPinned && b.isPinned) {
                return (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0);
            }

            return 0;
        });
    }, [wardrobeItems, searchText]);

    const suggestionItems = React.useMemo(() => {
        const trimmed = searchText.trim().toLowerCase();

        if (!trimmed) return [];

        const uniqueNames = [...new Set(
            wardrobeItems.map((item) => item.name.trim())
        )];

        return uniqueNames.filter((name) =>
            name.toLowerCase().includes(trimmed)
        ).slice(0, 8);
    }, [searchText, wardrobeItems]);

    const handleImageLoadStart = (id: string) => {
        setLoadingImages((prev) => ({ ...prev, [id]: true }));
    };

    const handleImageLoadEnd = (id: string) => {
        setLoadingImages((prev) => ({ ...prev, [id]: false }));
    };

    const wardrobeNames = wardrobeItems.map((item) => item.name.toLowerCase());

    const hasDress = wardrobeNames.some((name) => name.includes('dress'));
    const hasCoat = wardrobeNames.some((name) => name.includes('coat') || name.includes('jacket'));
    const hasJeans = wardrobeNames.some((name) => name.includes('jean') || name.includes('trouser'));
    const hasBag = wardrobeNames.some((name) => name.includes('bag') || name.includes('kabelka'));
    const hasShoes = wardrobeNames.some((name) =>
        name.includes('shoe') ||
        name.includes('boot') ||
        name.includes('heel') ||
        name.includes('sneaker')
    );

    const wardrobeSuggestions = React.useMemo(() => {
        if (wardrobeItems.length === 0) return [];

        const suggestions: Product[] = [];

        if (!hasBag) {
            const bagProduct = products.find(
                (product) =>
                    product.gender === 'women' &&
                    (product.subCategory === 'Bags')
            );
            if (bagProduct) suggestions.push(bagProduct);
        }

        if (!hasShoes) {
            const shoesProduct = products.find(
                (product) =>
                    product.gender === 'women' &&
                    product.mainCategory === 'SHOES'
            );
            if (shoesProduct) suggestions.push(shoesProduct);
        }

        if (!hasCoat) {
            const coatProduct = products.find(
                (product) =>
                    product.gender === 'women' &&
                    (product.subCategory === 'Coats' || product.subCategory === 'Jackets')
            );
            if (coatProduct) suggestions.push(coatProduct);
        }

        if (!hasJeans) {
            const jeansProduct = products.find(
                (product) =>
                    product.gender === 'women' &&
                    product.subCategory === 'Jeans'
            );
            if (jeansProduct) suggestions.push(jeansProduct);
        }


        if (suggestions.length < 3) {
            const fallbackProducts = products.filter((product) => {
                if (product.gender !== 'women') return false;

                if (suggestions.some((item) => item.id === product.id)) return false;


                if (
                    (hasCoat && (product.subCategory === 'Coats' || product.subCategory === 'Jackets')) ||
                    (hasJeans && product.subCategory === 'Jeans') ||
                    (hasBag && (product.subCategory === 'Bags' ) ||
                    (hasShoes && product.mainCategory === 'SHOES')
                )) {
                    return false;
                }

                return true;
            });

            suggestions.push(...fallbackProducts.slice(0, 3 - suggestions.length));
        }

        return suggestions.slice(0, 3);
    }, [wardrobeItems, hasBag, hasShoes, hasCoat, hasJeans, hasDress, products]);

    const loopedSuggestions =
        wardrobeSuggestions.length > 0
            ? [...wardrobeSuggestions, wardrobeSuggestions[0]]
            : [];

    const handleRecommendationScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / RECOMMENDATION_WIDTH);

        if (newIndex === wardrobeSuggestions.length) {
            setTimeout(() => {
                recommendationScrollRef.current?.scrollTo({ x: 0, animated: false });
                setActiveRecommendationIndex(0);
            }, 50);
        } else {
            setActiveRecommendationIndex(newIndex);
        }
    };


    return (
        <TouchableWithoutFeedback
            onPress={() => {
                setIsSearchFocused(false);
                Keyboard.dismiss();
            }}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.topRow}>
                        <ImageBackground
                            source={require('../../assets/images_app/search.jpg')}
                            style={styles.searchWrapper}
                            imageStyle={{ borderRadius: 12 }}
                        >
                            <Feather
                                name="search"
                                size={18}
                                color="#393939"
                                style={styles.searchIcon}
                            />

                            <TextInput
                                placeholder="Search wardrobe"
                                placeholderTextColor="#393939"
                                style={styles.searchInput}
                                value={searchText}
                                onChangeText={setSearchText}
                                onFocus={() => setIsSearchFocused(true)}
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity
                                    style={styles.clearInputButton}
                                    onPress={() => setSearchText('')}
                                >
                                    <Feather name="x" size={16} color="#393939" />
                                </TouchableOpacity>
                            )}
                        </ImageBackground>

                        <TouchableOpacity
                            style={styles.cameraButton}
                            onPress={handleAddItem}
                        >
                            <Feather name="plus" size={15} color="#111" />
                            <Feather name="camera" size={18} color="#111" />
                        </TouchableOpacity>
                    </View>
                    {isSearchFocused && searchText.trim() !== '' && (
                        <View style={styles.suggestionsBox}>
                            {suggestionItems.length > 0 ? (
                                <ScrollView
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                                    {suggestionItems.map((name, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.suggestionItem}
                                            onPress={() => {
                                                setSearchText(name);
                                                setIsSearchFocused(false);
                                            }}
                                        >
                                            <Feather name="search" size={16} color="#6a6a6a" />
                                            <Text style={styles.suggestionText}>{name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            ) : (
                                <View style={styles.noSuggestionWrapper}>
                                    <Text style={styles.noSuggestionText}>No matching items</Text>
                                </View>
                            )}
                        </View>
                    )}


                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.insightCard}>
                            {wardrobeItems.length > 0 ? (
                                <>
                                    <Text style={styles.insightTitle}>This could be useful for you</Text>
                                    <Text style={styles.insightSubtitle}>
                                        Based on your wardrobe, we noticed a few pieces that could nicely complete your closet.
                                    </Text>

                                    <ScrollView
                                        ref={recommendationScrollRef}
                                        horizontal
                                        pagingEnabled
                                        showsHorizontalScrollIndicator={false}
                                        onMomentumScrollEnd={handleRecommendationScroll}
                                        scrollEventThrottle={16}
                                        contentContainerStyle={styles.recommendationScrollContent}
                                        decelerationRate="fast"
                                    >
                                        {loopedSuggestions.map((item, index) => {
                                            const imageKey = item.images?.[0];
                                            const imageSource = imageKey ? productImages[imageKey] : null;

                                            return (
                                                <View
                                                    key={`${item.id}-${index}`}
                                                    style={[
                                                        styles.recommendationSlide,
                                                        { width: RECOMMENDATION_WIDTH }
                                                    ]}
                                                >
                                                    <TouchableOpacity
                                                        activeOpacity={0.9}
                                                        style={styles.recommendationCard}
                                                        onPress={() =>
                                                            router.push({
                                                                pathname: '/product_detail',
                                                                params: {
                                                                    productId: item.id,
                                                                    category: item.mainCategory,
                                                                    subcategory: item.subCategory,
                                                                    gender: item.gender === 'women' ? 'WOMAN' : 'MAN',
                                                                    from: 'wardrobe',
                                                                },
                                                            })
                                                        }
                                                    >
                                                        <View style={styles.recommendationImageWrap}>
                                                            {imageSource && (
                                                                <Image
                                                                    source={imageSource}
                                                                    style={styles.recommendationImage}
                                                                    contentFit="cover"
                                                                    cachePolicy="memory-disk"
                                                                    transition={150}
                                                                />
                                                            )}
                                                        </View>

                                                        <View style={styles.recommendationInfo}>
                                                            <Text style={styles.recommendationBrand} numberOfLines={1}>
                                                                {item.brand}
                                                            </Text>

                                                            <Text style={styles.recommendationName} numberOfLines={2} ellipsizeMode="tail">
                                                                {item.name}
                                                            </Text>

                                                            <Text style={styles.recommendationDesc} numberOfLines={2} ellipsizeMode="tail">
                                                                {item.description}
                                                            </Text>

                                                            <Text style={styles.recommendationPrice} numberOfLines={1}>
                                                                €{item.price.toFixed(2)}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </ScrollView>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.insightTitle}>Your wardrobe is waiting</Text>
                                    <Text style={styles.insightSubtitle}>
                                        Add your first pieces and we will start spotting gaps, essentials, and smart recommendations for you.
                                    </Text>

                                    <TouchableOpacity style={styles.insightAddButton} onPress={handleAddItem}>
                                        <Text style={styles.insightAddButtonText}>ADD FIRST ITEMS</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        <View style={styles.grid}>
                            {filteredWardrobeItems.map((item) => (
                                <View
                                    key={item.id}
                                    ref={(ref) => {
                                        itemRefs.current[item.id] = ref;
                                    }}
                                    style={[
                                        styles.itemWrapper,
                                        showItemActions && selectedItemId === item.id ? { opacity: 0 } : null,
                                    ]}
                                    collapsable={false}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => handleItemPress(item.id)}
                                        onLongPress={() => {
                                            const ref = itemRefs.current[item.id];

                                            if (ref) {
                                                ref.measureInWindow((x, y, width, height) => {
                                                    setSelectedItemId(item.id);
                                                    setSelectedLayout({ x, y, width, height });
                                                    setShowItemActions(true);
                                                });
                                            }
                                        }}
                                        delayLongPress={250}
                                    >
                                        <View style={styles.card}>
                                            {item.isPinned && (
                                                <View style={styles.pinnedBadge}>
                                                    <Feather name="map-pin" size={12} color="#fff" />
                                                </View>
                                            )}

                                            {loadingImages[item.id] && (
                                                <View style={styles.loaderWrapper}>
                                                    <ActivityIndicator size="small" color="#999" />
                                                </View>
                                            )}

                                            <Image
                                                source={typeof item.image === 'string' ? item.image : item.image}
                                                style={[
                                                    styles.image,
                                                    { opacity: loadingImages[item.id] ? 0 : 1 },
                                                ]}
                                                contentFit="cover"
                                                cachePolicy="memory-disk"
                                                transition={150}
                                                onLoadStart={() => handleImageLoadStart(item.id)}
                                                onLoad={() => handleImageLoadEnd(item.id)}
                                                onError={() => handleImageLoadEnd(item.id)}
                                            />
                                        </View>

                                        <Text style={styles.itemName}>{item.name}</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {showItemActions && selectedItem && selectedLayout && (
                    <View style={styles.overlayWrapper}>
                        <TouchableOpacity
                            activeOpacity={1}
                            style={StyleSheet.absoluteFill}
                            onPress={handleCloseItemActions}
                        >
                            <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
                        </TouchableOpacity>

                        <View
                            style={[
                                styles.selectedItemOverlay,
                                {
                                    top: selectedLayout.y,
                                    left: selectedLayout.x,
                                    width: selectedLayout.width,
                                },
                            ]}
                            pointerEvents="box-none"
                        >
                            <View style={styles.selectedCard}>
                                <Image
                                    source={
                                        typeof selectedItem.image === 'string'
                                            ? selectedItem.image
                                            : selectedItem.image
                                    }
                                    style={styles.image}
                                    contentFit="cover"
                                    cachePolicy="memory-disk"
                                    transition={150}
                                />
                            </View>

                            <Text style={styles.selectedItemName}>{selectedItem.name}</Text>
                        </View>

                        {actionsPosition && (
                            <View
                                style={[
                                    styles.floatingActions,
                                    {
                                        top: actionsPosition.top,
                                        left: actionsPosition.left,
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.roundActionButtonDark}
                                    onPress={handlePinItem}
                                >
                                    <Feather name="map-pin" size={20} color="#fff" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.roundActionButtonDark}
                                    onPress={handleDeleteItem}
                                >
                                    <Feather name="trash-2" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f3f3f3',
    },

    container: {
        flex: 1,
        paddingHorizontal: 14,
        paddingTop: 10,
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },

    searchWrapper: {
        flex: 1,
        height: 42,
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },

    searchIcon: {
        position: 'absolute',
        left: 12,
        zIndex: 1,
    },

    searchInput: {
        width: '100%',
        height: '100%',
        paddingLeft: 38,
        paddingRight: 36,
        fontSize: 16,
        color: '#222',
    },

    cameraButton: {
        width: 56,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#dedede',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 20,
    },

    itemWrapper: {
        width: '48%',
        marginBottom: 18,
    },

    card: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f3f3f3',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    itemName: {
        marginTop: 8,
        fontSize: 14,
        color: '#111',
        lineHeight: 18,
    },

    overlayWrapper: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },



    selectedItemOverlay: {
        position: 'absolute',
        zIndex: 101,
    },

    selectedCard: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f3f3f3',
    },

    floatingActions: {
        position: 'absolute',
        zIndex: 102,
        gap: 14,
    },

    roundActionButtonDark: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#1f1f1f',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },

    selectedItemName: {
        marginTop: 8,
        fontSize: 14,
        color: '#fff',
        lineHeight: 18,
    },

    pinnedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 2,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
    },

    loaderWrapper: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },

    suggestionsBox: {
        backgroundColor: '#f3f3f3',
        borderRadius: 12,
        marginTop: -8,
        marginBottom: 14,
        paddingHorizontal: 6,
        paddingVertical: 6,
        maxHeight: 220,
    },

    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 8,
    },

    suggestionText: {
        fontSize: 15,
        color: '#111',
    },

    noSuggestionWrapper: {
        paddingVertical: 14,
        alignItems: 'center',
    },

    noSuggestionText: {
        fontSize: 14,
        color: '#8a8a8a',
    },

    clearInputButton: {
        position: 'absolute',
        right: 12,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },


    insightTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        marginBottom: 6,
    },

    insightSubtitle: {
        fontSize: 14,
        color: '#5f5f5f',
        lineHeight: 20,
        marginBottom: 14,
    },

    insightSuggestions: {
        gap: 10,
    },

    insightSuggestionCard: {
        backgroundColor: '#f3f3f3',
        borderRadius: 14,
        padding: 12,
    },

    insightSuggestionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },

    insightSuggestionText: {
        fontSize: 13,
        color: '#6a6a6a',
        lineHeight: 18,
    },

    insightAddButton: {
        alignSelf: 'flex-end',
        backgroundColor: '#111',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },

    insightAddButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },

    insightSuggestionsScroll: {
        paddingRight: 8,
    },

    insightProductCard: {
        width: 190,
        backgroundColor: '#f3f3f3',
        borderRadius: 14,
        overflow: 'hidden',
        marginRight: 12,
    },

    insightProductImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#e9e9e9',
    },

    insightProductInfo: {
        padding: 12,
    },

    recommendationScrollContent: {
        alignItems: 'center',
    },

    recommendationSlide: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    recommendationCard: {
        width: '100%',
        flexDirection: 'row',
        backgroundColor: '#f3f3f3',
        borderRadius: 16,
        overflow: 'hidden',
        height: 150,
    },

    insightCard: {
        backgroundColor: '#dedede',
        borderRadius: 18,
        padding: 16,
        marginBottom: 18,
    },

    recommendationImageWrap: {
        width: 118,
        height: 150,
        backgroundColor: '#e7e7e7',
    },

    recommendationInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
        minWidth: 0,
    },

    recommendationBrand: {
        fontSize: 12,
        color: '#8a8a8a',
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },

    recommendationName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
        marginBottom: 6,
        flexShrink: 1,
    },

    recommendationDesc: {
        fontSize: 13,
        color: '#6a6a6a',
        lineHeight: 18,
        marginBottom: 8,
        flexShrink: 1,
    },

    recommendationPrice: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },

    recommendationImage: {
        width: '100%',
        height: '100%',
    },

});