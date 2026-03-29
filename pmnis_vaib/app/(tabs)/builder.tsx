import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TextInput, TouchableOpacity, Image, Modal, FlatList, ImageBackground,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useWardrobe } from '../../context/wardrobe_context';
import { useCart } from '../../context/cart_context';
import { useWishlist } from '../../context/wishlist_context';
import { useProducts } from '../../context/product_context';
import { productImages } from '../../context/product_images';


type Source = 'wardrobe' | 'wishlist' | 'shop';
type OutfitItem = {
    id: string;
    image: any;
    name: string;
    tags: string[];
    fromWardrobe?: boolean;
    fromShop?: boolean;
};

export default function BuilderScreen() {
    const router = useRouter();
    const { returnToBuilder } = useLocalSearchParams();
    const { wardrobeItems } = useWardrobe();
    const { carts, addProductToCart, addBuilderFeedback } = useCart();
    const { wishlistItems } = useWishlist();
    const { products } = useProducts();

    const [prompt, setPrompt] = useState('');
    const [sources, setSources] = useState<Source[]>(['shop']);
    const [outfits, setOutfits] = useState<OutfitItem[]>([]);
    const [generated, setGenerated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    const [sheetVisible, setSheetVisible] = useState(false);
    const [sheetSource, setSheetSource] = useState<Source | null>(null);
    const [selectedItems, setSelectedItems] = useState<OutfitItem[]>([]);
    const [cartModalVisible, setCartModalVisible] = useState(false);

    const shopProducts: OutfitItem[] = products
        .map(product => {
            const firstImageKey =
                product.availableColors?.[0]?.imageKeys?.[0] || product.images?.[0];

            const imageSource = firstImageKey ? productImages[firstImageKey] : null;

            if (!imageSource) return null;

            return {
                id: product.id,
                image: imageSource,
                name: product.name,
                tags: [
                    product.brand.toLowerCase(),
                    product.mainCategory.toLowerCase(),
                    product.subCategory.toLowerCase(),
                    ...product.tags.map(tag => tag.toLowerCase()),
                    ...product.availableColors.map(color => color.name.toLowerCase()),
                ],
            };
        })
        .filter(Boolean) as OutfitItem[];

    useFocusEffect(
        React.useCallback(() => {
            if (returnToBuilder === 'true') {
                setCartModalVisible(true);
            }
        }, [returnToBuilder])
    );

    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);




    const wardrobeAsOutfits: OutfitItem[] = wardrobeItems.map(item => ({
        id: item.id,
        image: item.image,
        name: item.name,
        tags: item.name.toLowerCase().split(' '),
        fromWardrobe: true,
    }));

    const wishlistAsOutfits: OutfitItem[] = wishlistItems.map(item => ({
        id: item.id,
        image: item.image,
        name: item.name,
        tags: item.name.toLowerCase().split(' '),
    }));

    const getSheetItems = (): OutfitItem[] => {
        if (sheetSource === 'wardrobe') return wardrobeAsOutfits;
        if (sheetSource === 'wishlist') return wishlistAsOutfits;
        return shopProducts;
    };

    const toggleSource = (s: Source) => {
        if (s === 'wardrobe' || s === 'wishlist') {
            const isFromThisSource = s === 'wardrobe'
                ? selectedItems.some(i => wardrobeAsOutfits.find(w => w.id === i.id))
                : selectedItems.some(i => wishlistAsOutfits.find(w => w.id === i.id));

            if (isFromThisSource) {
                setSelectedItems(prev =>
                    prev.filter(i =>
                        s === 'wardrobe'
                            ? !wardrobeAsOutfits.find(w => w.id === i.id)
                            : !wishlistAsOutfits.find(w => w.id === i.id)
                    )
                );
            } else {
                setSheetSource(s);
                setSheetVisible(true);
            }
            return;
        }

        if (s === 'shop') {
            const hasOtherSources = selectedItems.length > 0;
            if (sources.includes('shop') && hasOtherSources) {
                setSources(prev => prev.filter(x => x !== 'shop'));
            } else if (!sources.includes('shop')) {
                setSources(prev => [...prev, 'shop']);
            }
            setGenerated(false);
            setOutfits([]);
        }
    };

    const toggleItemSelection = (item: OutfitItem) => {
        setSelectedItems(prev =>
            prev.find(i => i.id === item.id)
                ? prev.filter(i => i.id !== item.id)
                : [...prev, item]
        );
    };

    const confirmSheetSelection = () => {
        setSheetVisible(false);
    };

    const getSourceItems = (): OutfitItem[] => {
        let items: OutfitItem[] = [];
        if (selectedItems.length > 0) items = [...items, ...selectedItems];
        if (sources.includes('shop')) items = [...items, ...shopProducts];
        return items.filter((item, index, self) =>
            self.findIndex(i => i.id === item.id) === index
        );
    };

    const handleGenerate = () => {
        setLoading(true);
        setGenerated(false);
        setAddedToCart(false);
        setSelectedRating(0);
        setFeedbackSubmitted(false);

        setTimeout(() => {
            const sourceItems = getSourceItems();
            const keywords = prompt.toLowerCase().split(' ').filter(k => k.length > 2);
            const scored = sourceItems.map(item => {
                const score = keywords.reduce((acc, keyword) => {
                    const nameMatch = item.name.toLowerCase().includes(keyword) ? 2 : 0;
                    const tagMatch = item.tags.some(tag => tag.includes(keyword) || keyword.includes(tag)) ? 1 : 0;
                    return acc + nameMatch + tagMatch;
                }, 0);
                return { ...item, score };
            });
            const sorted = prompt.trim()
                ? scored.filter(i => i.score > 0).sort((a, b) => b.score - a.score)
                : sourceItems;
            const result = (sorted.length >= 4 ? sorted : sourceItems).slice(0, 4);
            setOutfits(result);
            setGenerated(true);
            setLoading(false);
        }, 1500);
    };


    const handleSubmitFeedback = () => {
        if (selectedRating === 0 || feedbackSubmitted) return;

        addBuilderFeedback();
        setFeedbackSubmitted(true);
    };

    const regenerateItem = (index: number) => {
        const sourceItems = getSourceItems();
        const currentIds = outfits.map(o => o.id);
        const available = sourceItems.filter(i => !currentIds.includes(i.id));
        if (available.length === 0) return;
        const newItem = available[Math.floor(Math.random() * available.length)];
        setOutfits(prev => {
            const updated = [...prev];
            updated[index] = newItem;
            return updated;
        });
    };

    const handleClear = () => {
        setPrompt('');
        setOutfits([]);
        setGenerated(false);
        setAddedToCart(false);
    };

    const handleAddToCart = () => {
        const shopItems = outfits.filter(i => !i.fromWardrobe);
        if (shopItems.length === 0) return;
        setCartModalVisible(true);
    };

    const handleConfirmAddToCart = (cartId: string) => {
        const shopItems = outfits.filter(i => !i.fromWardrobe);
        shopItems.forEach(item => {
            addProductToCart(cartId, {
                id: item.id + Date.now().toString(),
                name: item.name,
                price: 49.99,
                quantity: 1,
                image: item.image,
                note: 'Added from Outfit Builder',
            });
        });
        setCartModalVisible(false);
        setAddedToCart(true);

        setTimeout(() => {
            handleClear();
            router.replace({
                pathname: '/cart_detail',
                params: { cartId },
            });
        }, 1500);
    };

    const shopItemsCount = outfits.filter(i => !i.fromWardrobe).length;

    const isShopActive = sources.includes('shop');
    const isWardrobeActive = selectedItems.some(i => wardrobeAsOutfits.find(w => w.id === i.id));
    const isWishlistActive = selectedItems.some(i => wishlistAsOutfits.find(w => w.id === i.id));

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Outfit Builder</Text>
                    <Text style={styles.headerSubtitle}>Describe your dream outfit and let AI do the rest</Text>
                </View>

                <Text style={styles.sectionLabel}>Sources</Text>
                <View style={styles.sourceRow}>
                    {(['wardrobe', 'wishlist', 'shop'] as Source[]).map((s) => {
                        const isActive =
                            (s === 'shop' && isShopActive) ||
                            (s === 'wardrobe' && isWardrobeActive) ||
                            (s === 'wishlist' && isWishlistActive);

                        return (
                            <TouchableOpacity
                                key={s}
                                style={[styles.sourceButton, isActive && styles.sourceButtonActive]}
                                onPress={() => toggleSource(s)}
                            >
                                <Feather
                                    name={s === 'wardrobe' ? 'grid' : s === 'wishlist' ? 'heart' : 'shopping-bag'}
                                    size={14}
                                    color={isActive ? '#111' : '#999'}
                                />
                                <Text style={[styles.sourceButtonText, isActive && styles.sourceButtonTextActive]}>
                                    {s === 'wardrobe' ? 'Wardrobe' : s === 'wishlist' ? 'Wishlist' : 'Shop'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {selectedItems.length > 0 && (
                    <View style={styles.selectedPreview}>
                        <Text style={styles.selectedLabel}>Selected items ({selectedItems.length})</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {selectedItems.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.selectedChip}
                                    onPress={() => toggleItemSelection(item)}
                                >
                                    <Image
                                        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                                        style={styles.selectedChipImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.selectedChipRemove}>
                                        <Feather name="x" size={10} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <Text style={styles.sectionLabel}>Describe your outfit</Text>
                <View style={styles.inputWrapper}>
                    <Feather name="edit-2" size={16} color="#999" />
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. casual summer outfit, elegant evening..."
                        placeholderTextColor="#999"
                        value={prompt}
                        onChangeText={setPrompt}
                        multiline
                    />
                    {prompt.length > 0 && (
                        <TouchableOpacity onPress={() => setPrompt('')}>
                            <Feather name="x" size={16} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.generateButton, loading && styles.generateButtonLoading]}
                    onPress={handleGenerate}
                    disabled={loading}
                >
                    <Feather name="zap" size={16} color="#fff" />
                    <Text style={styles.generateButtonText}>
                        {loading ? 'AI is thinking...' : 'GENERATE OUTFIT'}
                    </Text>
                </TouchableOpacity>

                {generated && outfits.length > 0 && (
                    <View style={styles.resultsSection}>
                        <Text style={styles.resultsTitle}>
                            {prompt.trim() ? `Results for "${prompt}"` : 'Suggested outfits'}
                        </Text>

                        <View style={styles.outfitsGrid}>
                            {outfits.map((item, index) => (
                                <View key={item.id} style={styles.outfitCard}>
                                    <Image
                                        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                                        style={styles.outfitImage}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        style={styles.regenerateItemButton}
                                        onPress={() => regenerateItem(index)}
                                    >
                                        <Feather name="refresh-cw" size={13} color="#111" />
                                    </TouchableOpacity>
                                    {item.fromWardrobe && (
                                        <View style={styles.wardrobeBadge}>
                                            <Text style={styles.wardrobeBadgeText}>My item</Text>
                                        </View>
                                    )}
                                    <Text style={styles.outfitName} numberOfLines={2}>{item.name}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionButtonOutline} onPress={handleClear}>
                                <Feather name="x" size={16} color="#111" />
                                <Text style={styles.actionButtonOutlineText}>Dismiss</Text>
                            </TouchableOpacity>

                            {addedToCart ? (
                                <ImageBackground
                                    source={require('../../assets/images_app/search.png')}
                                    style={styles.addedBackground}
                                    imageStyle={{ borderRadius: 20 }}
                                >
                                    <Feather name="check" size={14} color="#111" />
                                    <Text style={styles.addedButtonText}>ADDED!</Text>
                                </ImageBackground>
                            ) : (
                                <TouchableOpacity
                                    style={[
                                        styles.actionButtonFill,
                                        shopItemsCount === 0 && styles.actionButtonDisabled,
                                    ]}
                                    onPress={handleAddToCart}
                                    disabled={shopItemsCount === 0}
                                >
                                    <Feather name="shopping-cart" size={16} color="#fff" />
                                    <Text style={styles.actionButtonFillText}>
                                        {shopItemsCount > 0
                                            ? `Add to cart (${shopItemsCount})`
                                            : 'All from wardrobe'
                                        }
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.feedbackCard}>
                            <Text style={styles.feedbackTitle}>How do you rate this outfit suggestion?</Text>

                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity
                                        key={star}
                                        onPress={() => {
                                            if (!feedbackSubmitted) setSelectedRating(star);
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <Feather
                                            name="star"
                                            size={24}
                                            color={star <= selectedRating ? '#111' : '#bcbcbc'}
                                            style={styles.starIcon}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.feedbackButton,
                                    (selectedRating === 0 || feedbackSubmitted) && styles.feedbackButtonDisabled,
                                ]}
                                onPress={handleSubmitFeedback}
                                disabled={selectedRating === 0 || feedbackSubmitted}
                            >
                                <Text style={styles.feedbackButtonText}>
                                    {feedbackSubmitted ? 'Submitted' : 'Submit'}
                                </Text>
                            </TouchableOpacity>

                            {feedbackSubmitted && (
                                <Text style={styles.feedbackThanksText}>Thanks for your feedback!</Text>
                            )}
                        </View>
                    </View>
                )}

                {!generated && !loading && (
                    <View style={styles.emptyState}>
                        <Feather name="zap" size={40} color="#ccc" />
                        <Text style={styles.emptyStateText}>Select sources, describe your outfit and generate</Text>
                    </View>
                )}
            </ScrollView>

            {/* Wardrobe / Wishlist Bottom Sheet */}
            <Modal
                visible={sheetVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setSheetVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setSheetVisible(false)} />
                    <View
                        style={[
                            styles.bottomSheet,
                            sheetSource === 'wishlist' && styles.wishlistBottomSheet,
                        ]}
                    >
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>
                                Select from {sheetSource === 'wardrobe' ? 'Wardrobe' : 'Wishlist'}
                            </Text>
                            <TouchableOpacity onPress={() => setSheetVisible(false)}>
                                <Feather name="x" size={22} color="#111" />
                            </TouchableOpacity>
                        </View>

                        {getSheetItems().length === 0 ? (
                            <View style={styles.emptySheet}>
                                <Feather name={sheetSource === 'wishlist' ? 'heart' : 'grid'} size={36} color="#ccc" />
                                <Text style={styles.emptySheetText}>
                                    {sheetSource === 'wishlist'
                                        ? 'Your wishlist is empty. Add items from the shop first.'
                                        : 'Your wardrobe is empty. Add items first.'
                                    }
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={getSheetItems()}
                                keyExtractor={item => item.id}
                                numColumns={3}
                                contentContainerStyle={styles.sheetGrid}
                                renderItem={({ item }) => {
                                    const isSelected = !!selectedItems.find(i => i.id === item.id);
                                    return (
                                        <TouchableOpacity
                                            style={[styles.sheetItem, isSelected && styles.sheetItemSelected]}
                                            onPress={() => toggleItemSelection(item)}
                                        >
                                            <Image
                                                source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                                                style={styles.sheetItemImage}
                                                resizeMode="cover"
                                            />
                                            {isSelected && (
                                                <View style={styles.sheetItemCheck}>
                                                    <Feather name="check" size={14} color="#fff" />
                                                </View>
                                            )}
                                            <Text style={styles.sheetItemName} numberOfLines={1}>{item.name}</Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}

                        <TouchableOpacity style={styles.confirmButton} onPress={confirmSheetSelection}>
                            <Text style={styles.confirmButtonText}>
                                Confirm ({selectedItems.length} selected)
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Cart selection Modal */}
            <Modal
                visible={cartModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setCartModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setCartModalVisible(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Add to which cart?</Text>
                            <TouchableOpacity onPress={() => setCartModalVisible(false)}>
                                <Feather name="x" size={22} color="#111" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            <TouchableOpacity
                                style={styles.createNewCartButton}
                                onPress={() => {
                                    setCartModalVisible(false);
                                    router.push({
                                        pathname: '/(tabs)/cart_create',
                                        params: { returnToBuilder: 'true' },
                                    });
                                }}
                            >
                                <Feather name="plus" size={16} color="#fff" />
                                <Text style={styles.createNewCartButtonText}>Create new cart</Text>
                            </TouchableOpacity>

                            {carts.length === 0 ? (
                                <Text style={styles.noCartsText}>No carts yet. Create one first!</Text>
                            ) : (
                                carts.map(cart => (
                                    <TouchableOpacity
                                        key={cart.id}
                                        style={styles.cartSelectItem}
                                        onPress={() => handleConfirmAddToCart(cart.id)}
                                    >
                                        <View style={styles.cartSelectInfo}>
                                            <Text style={styles.cartSelectName}>{cart.name}</Text>
                                            <Text style={styles.cartSelectSub}>
                                                Budget: €{cart.budget} · {cart.products.length} items
                                            </Text>
                                        </View>
                                        <Feather name="chevron-right" size={18} color="#8a8a8a" />
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
    scrollContent: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 40 },
    header: { marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#111', letterSpacing: -0.7 },
    headerSubtitle: { fontSize: 13, color: '#393939', marginTop: 4 },
    sectionLabel: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 10 },
    sourceRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    sourceButton: {
        flex: 1, paddingVertical: 10, borderRadius: 20,
        backgroundColor: '#e9e9e9', alignItems: 'center',
        borderWidth: 2, borderColor: 'transparent',
        flexDirection: 'row', justifyContent: 'center', gap: 6,
    },
    sourceButtonActive: { backgroundColor: '#fff', borderColor: '#111' },
    sourceButtonText: { fontSize: 13, fontWeight: '600', color: '#999' },
    sourceButtonTextActive: { color: '#111' },
    selectedPreview: { marginBottom: 16, paddingTop: 6 },
    selectedLabel: { fontSize: 13, color: '#393939', marginBottom: 8, fontWeight: '600' },
    selectedChip: { marginTop: 10, marginRight: 8, position: 'relative' },
    selectedChipImage: { width: 56, height: 56, borderRadius: 10 },
    selectedChipRemove: {
        position: 'absolute', top: -4, right: -4,
        backgroundColor: '#111', borderRadius: 10,
        width: 18, height: 18, justifyContent: 'center', alignItems: 'center'
    },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#e9e9e9', borderRadius: 14,
        paddingHorizontal: 14, paddingVertical: 12,
        marginBottom: 14, gap: 10,
    },
    input: { flex: 1, fontSize: 15, color: '#111', maxHeight: 80 },
    generateButton: {
        backgroundColor: '#111', paddingVertical: 16, borderRadius: 20,
        alignItems: 'center', flexDirection: 'row',
        justifyContent: 'center', gap: 8, marginBottom: 24,
    },
    generateButtonLoading: { backgroundColor: '#555' },
    generateButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    resultsSection: { marginTop: 8 },
    resultsTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 16 },
    outfitsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    outfitCard: { width: '48%', marginBottom: 16, position: 'relative' },
    outfitImage: { width: '100%', height: 180, borderRadius: 14, backgroundColor: '#e9e9e9' },
    regenerateItemButton: {
        position: 'absolute', top: 8, right: 8,
        backgroundColor: '#fff', borderRadius: 20,
        width: 30, height: 30, justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    wardrobeBadge: {
        position: 'absolute', top: 8, left: 8,
        backgroundColor: '#111', borderRadius: 10,
        paddingHorizontal: 8, paddingVertical: 3,
    },
    wardrobeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    outfitName: { marginTop: 8, fontSize: 13, color: '#111', fontWeight: '500' },
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 24, alignItems: 'center' },
    actionButtonOutline: {
        flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#111',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    actionButtonOutlineText: { color: '#111', fontWeight: '600', fontSize: 14 },
    actionButtonFill: {
        flex: 1, height: 52, borderRadius: 14, backgroundColor: '#111',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    actionButtonDisabled: { backgroundColor: '#ccc' },
    actionButtonFillText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    addedBackground: {
        flex: 1, height: 52, borderRadius: 20, overflow: 'hidden',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    },
    addedButtonText: { color: '#111', fontSize: 14, fontWeight: '700' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 14 },
    emptyStateText: { fontSize: 14, color: '#aaa', textAlign: 'center' },
    emptySheet: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
    emptySheetText: { fontSize: 14, color: '#aaa', textAlign: 'center', paddingHorizontal: 20 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    bottomSheet: {
        backgroundColor: '#f3f3f3', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingHorizontal: 18, paddingBottom: 34, maxHeight: '80%',
    },
    wishlistBottomSheet: {
        height: '50%',
    },

    sheetHandle: {
        width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc',
        alignSelf: 'center', marginTop: 12, marginBottom: 16,
    },
    sheetHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 16,
    },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
    sheetGrid: { paddingBottom: 16 },
    sheetItem: {
        flex: 1, margin: 4, borderRadius: 12, overflow: 'hidden',
        borderWidth: 2, borderColor: 'transparent',
    },
    sheetItemSelected: { borderColor: '#111' },
    sheetItemImage: { width: '100%', height: 100, backgroundColor: '#e9e9e9' },
    sheetItemCheck: {
        position: 'absolute', top: 6, right: 6,
        backgroundColor: '#111', borderRadius: 10,
        width: 22, height: 22, justifyContent: 'center', alignItems: 'center',
    },
    sheetItemName: { fontSize: 11, color: '#111', padding: 4, fontWeight: '500' },
    confirmButton: {
        backgroundColor: '#111', paddingVertical: 16, borderRadius: 20,
        alignItems: 'center', marginTop: 8,
    },
    confirmButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    createNewCartButton: {
        backgroundColor: '#111', paddingVertical: 14, borderRadius: 14,
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, marginBottom: 12,
    },
    createNewCartButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    cartSelectItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#e9e9e9', borderRadius: 14,
        padding: 14, marginBottom: 10,
    },
    cartSelectInfo: { flex: 1 },
    cartSelectName: { fontSize: 15, fontWeight: '700', color: '#111' },
    cartSelectSub: { fontSize: 12, color: '#6a6a6a', marginTop: 2 },
    noCartsText: { textAlign: 'center', color: '#999', fontSize: 14, marginTop: 20 },

    feedbackCard: {
        marginTop: 18,
        backgroundColor: '#e9e9e9',
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 14,
        alignItems: 'center',
    },

    feedbackTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
        marginBottom: 12,
        textAlign: 'center',
    },

    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },

    starIcon: {
        marginHorizontal: 6,
    },

    feedbackButton: {
        minWidth: 120,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },

    feedbackButtonDisabled: {
        backgroundColor: '#bdbdbd',
    },

    feedbackButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },

    feedbackThanksText: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: '600',
        color: '#5f5f5f',
    },
});