import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    Modal,
    Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useWardrobe } from '../../context/wardrobe_context';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useProducts, Product } from '../../context/product_context';
import { productImages } from '../../context/product_images';


export default function WardrobeItemScreen() {
    const router = useRouter();
    const { itemId } = useLocalSearchParams();
    const { getWardrobeItemById, updateWardrobeItem, deleteWardrobeItem } = useWardrobe();

    const item = typeof itemId === 'string' ? getWardrobeItemById(itemId) : undefined;
    const [imageLoading, setImageLoading] = React.useState(true);
    const { products } = useProducts();
    const [showImagePreview, setShowImagePreview] = React.useState(false);

    const screenWidth = Dimensions.get('window').width;
    const suggestionCardWidth = screenWidth * 0.42;




    const [isEditing, setIsEditing] = React.useState(false);
    const [editedName, setEditedName] = React.useState(item?.name ?? '');
    const [editedInfo, setEditedInfo] = React.useState(item?.additionalInfo ?? '');
    const [editedImage, setEditedImage] = React.useState<any>(item?.image);

    const [showDeleteModal, setShowDeleteModal] = React.useState(false);

    React.useEffect(() => {
        if (item) {
            setEditedName(item.name);
            setEditedInfo(item.additionalInfo ?? '');
            setEditedImage(item.image);
            setIsEditing(false);
            setShowDeleteModal(false);
            setImageLoading(true);
        }
    }, [itemId, item]);

    const displayImage = isEditing ? editedImage : item?.image;

    const itemNameLower = item?.name?.toLowerCase() ?? '';
    const itemInfoLower = item?.additionalInfo?.toLowerCase() ?? '';
    const itemText = `${itemNameLower} ${itemInfoLower}`;

    const currentType =
        itemText.includes('coat') || itemText.includes('jacket')
            ? 'outerwear'
            : itemText.includes('dress')
                ? 'dress'
                : itemText.includes('jean') || itemText.includes('trouser') || itemText.includes('pants')
                    ? 'bottom'
                    : itemText.includes('bag') || itemText.includes('kabelka')
                        ? 'bag'
                        : itemText.includes('shoe') || itemText.includes('boot') || itemText.includes('heel') || itemText.includes('sneaker')
                            ? 'shoes'
                            : 'other';

    const usefulSuggestions = React.useMemo(() => {
        const womenProducts = products.filter((product) => product.gender === 'women');

        const normalize = (value?: string) => value?.toLowerCase().trim() ?? '';

        const itemSubcategory = (() => {
            if (
                itemText.includes('bag') ||
                itemText.includes('kabelka')
            ) return 'Bags';

            if (
                itemText.includes('coat')
            ) return 'Coats';

            if (
                itemText.includes('jacket')
            ) return 'Jackets';

            if (
                itemText.includes('jean')
            ) return 'Jeans';

            if (
                itemText.includes('trouser') ||
                itemText.includes('pants')
            ) return 'Trousers';

            if (
                itemText.includes('dress')
            ) return 'Dress';

            if (
                itemText.includes('shoe') ||
                itemText.includes('sneaker')
            ) return 'Sneakers';

            if (
                itemText.includes('boot')
            ) return 'Boots';

            if (
                itemText.includes('heel')
            ) return 'Heels';

            if (
                itemText.includes('shirt')
            ) return 'Shirts';

            if (
                itemText.includes('top')
            ) return 'Tops';

            return 'Other';
        })();

        const relatedSubcategoriesMap: Record<string, string[]> = {
            Bags: ['Heels', 'Boots', 'Sneakers', 'Jackets', 'Coats', 'Mini dresses', 'Casual dresses', 'Party dresses', 'Tops', 'Shirts'],
            Coats: ['Jeans', 'Trousers', 'Boots', 'Sneakers', 'Bags', 'Scarves', 'Shirts', 'Tops'],
            Jackets: ['Jeans', 'Trousers', 'Boots', 'Sneakers', 'Bags', 'Tops', 'Shirts'],
            Jeans: ['Tops', 'Shirts', 'Jackets', 'Coats', 'Sneakers', 'Boots', 'Heels', 'Bags'],
            Trousers: ['Tops', 'Shirts', 'Jackets', 'Coats', 'Heels', 'Sneakers', 'Bags'],
            Dress: ['Heels', 'Boots', 'Bags', 'Jewellery', 'Jackets', 'Coats'],
            Sneakers: ['Jeans', 'Trousers', 'Tops', 'Shirts', 'Jackets', 'Bags'],
            Boots: ['Coats', 'Jackets', 'Jeans', 'Dresses', 'Bags'],
            Heels: ['Dresses', 'Bags', 'Trousers', 'Shirts', 'Jackets'],
            Shirts: ['Jeans', 'Trousers', 'Jackets', 'Coats', 'Heels', 'Sneakers', 'Bags'],
            Tops: ['Jeans', 'Trousers', 'Jackets', 'Coats', 'Heels', 'Sneakers', 'Bags'],
            Other: ['Bags', 'Tops', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Coats', 'Sneakers', 'Boots', 'Heels'],
        };

        const relatedSubcategories = relatedSubcategoriesMap[itemSubcategory] ?? relatedSubcategoriesMap.Other;

        const matchedBySubcategory = womenProducts.filter((product) => {
            const sub = normalize(product.subCategory);
            const main = normalize(product.mainCategory);

            const matchesRelatedSub = relatedSubcategories.some((related) => normalize(related) === sub);

            const dressMainMatch =
                itemSubcategory === 'Dress' &&
                main === 'dresses';

            const shoeMainMatch =
                ['Sneakers', 'Boots', 'Heels'].includes(itemSubcategory) &&
                main === 'shoes';

            const accessoryMainMatch =
                itemSubcategory === 'Bags' &&
                main === 'accessories';

            return matchesRelatedSub || dressMainMatch || shoeMainMatch || accessoryMainMatch;
        });

        const withoutSameKind = matchedBySubcategory.filter((product) => {
            if (itemSubcategory === 'Bags' && product.subCategory === 'Bags') return false;
            if (itemSubcategory === 'Coats' && product.subCategory === 'Coats') return false;
            if (itemSubcategory === 'Jackets' && product.subCategory === 'Jackets') return false;
            if (itemSubcategory === 'Jeans' && product.subCategory === 'Jeans') return false;
            if (itemSubcategory === 'Trousers' && product.subCategory === 'Trousers') return false;
            if (itemSubcategory === 'Shirts' && product.subCategory === 'Shirts') return false;
            if (itemSubcategory === 'Tops' && product.subCategory === 'Tops') return false;
            if (itemSubcategory === 'Sneakers' && product.subCategory === 'Sneakers') return false;
            if (itemSubcategory === 'Boots' && product.subCategory === 'Boots') return false;
            if (itemSubcategory === 'Heels' && product.subCategory === 'Heels') return false;

            return true;
        });

        const uniqueById = withoutSameKind.filter(
            (product, index, array) => array.findIndex((p) => p.id === product.id) === index
        );

        if (uniqueById.length > 0) {
            return uniqueById.slice(0, 4);
        }

        return womenProducts
            .filter((product) => product.id !== item?.id)
            .slice(0, 6);
    }, [products, itemText, item?.id]);


    if (!item) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.missingWrapper}>
                    <Text style={styles.missingText}>Item not found</Text>
                </View>
            </SafeAreaView>
        );
    }


    const handleChangePhoto = async () => {
        Alert.alert(
            'Change photo',
            'Choose how you want to update the photo',
            [
                {
                    text: 'Take photo',
                    onPress: async () => {
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
                            setEditedImage(result.assets[0].uri);
                        }
                    },
                },
                {
                    text: 'Choose from gallery',
                    onPress: async () => {
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
                            setEditedImage(result.assets[0].uri);
                        }
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const handleSaveChanges = () => {
        if (!item) return;

        updateWardrobeItem(item.id, {
            image: editedImage,
            name: editedName.trim() || 'novy item',
            additionalInfo: editedInfo.trim(),
        });

        setIsEditing(false);
    };



    const resetEditState = () => {
        if (!item) return;

        setEditedName(item.name);
        setEditedInfo(item.additionalInfo ?? '');
        setEditedImage(item.image);
        setIsEditing(false);
        setShowDeleteModal(false);
    };

    const handleBackPress = () => {
        resetEditState();
        router.replace('/(tabs)/wardrobe');
    };

    const handleCancelEdit = () => {
        if (!item) return;

        setEditedName(item.name);
        setEditedInfo(item.additionalInfo ?? '');
        setEditedImage(item.image);
        setIsEditing(false);
    };

    const handleDeleteItem = () => {
        if (!item) return;

        deleteWardrobeItem(item.id);
        setShowDeleteModal(false);
        router.replace('/(tabs)/wardrobe');
    };

    const formatDateTime = (timestamp?: number | null) => {
        if (!timestamp) return null;

        return new Date(timestamp).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={20}
            >
                <ImageBackground
                    source={require('../../assets/images_app/search.jpg')}
                    style={styles.headerWrapper}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackPress}
                    >
                        <Feather name="arrow-left" size={24} color="#111" />
                    </TouchableOpacity>

                    <Text style={styles.headerText}> ★ Details</Text>
                </ImageBackground>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={styles.scrollViewContent}
                >

                    <View style={styles.content}>
                        <TouchableOpacity
                            activeOpacity={0.95}
                            style={styles.previewCard}
                            onPress={() => {
                                if (displayImage) {
                                    setShowImagePreview(true);
                                }
                            }}
                        >
                            {imageLoading && (
                                <View style={styles.loaderWrapper}>
                                    <ActivityIndicator size="large" color="#8a8a8a" />
                                </View>
                            )}

                            {displayImage && (
                                <Image
                                    source={displayImage}
                                    style={[
                                        styles.previewImage,
                                        { opacity: imageLoading ? 0 : 1 },
                                    ]}
                                    contentFit="cover"
                                    cachePolicy="memory-disk"
                                    transition={0}
                                    onLoadStart={() => setImageLoading(true)}
                                    onLoad={() => setImageLoading(false)}
                                    onError={() => setImageLoading(false)}
                                />
                            )}
                        </TouchableOpacity>
                        <View style={styles.metaContainer}>
                            <Text style={styles.metaText}>
                                {item.updatedAt
                                    ? `edited ${formatDateTime(item.updatedAt)}`
                                    : item.createdAt
                                        ? `added ${formatDateTime(item.createdAt)}`
                                        : ''
                                }
                            </Text>
                        </View>

                        {isEditing ? (
                            <>
                                <TouchableOpacity
                                    style={styles.changePhotoButton}
                                    onPress={handleChangePhoto}
                                >
                                    <Text style={styles.changePhotoText}>Change photo</Text>
                                </TouchableOpacity>

                                <View style={styles.form}>
                                    <Text style={styles.label}>Name</Text>
                                    <TextInput
                                        value={editedName}
                                        onChangeText={setEditedName}
                                        placeholder="Item name"
                                        placeholderTextColor="#8a8a8a"
                                        style={styles.input}
                                    />

                                    <Text style={styles.label}>Additional information</Text>
                                    <TextInput
                                        value={editedInfo}
                                        onChangeText={setEditedInfo}
                                        placeholder="Size, brand, material, your notes..."
                                        placeholderTextColor="#8a8a8a"
                                        style={[styles.input, styles.textArea]}
                                        multiline
                                        textAlignVertical="top"
                                        scrollEnabled={false}
                                    />

                                    <View style={styles.actionButtonsRow}>
                                        <TouchableOpacity
                                            style={styles.primaryButtonHalf}
                                            onPress={handleSaveChanges}
                                        >
                                            <Text style={styles.primaryButtonText}>Save</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.cancelEditButton}
                                            onPress={handleCancelEdit}
                                        >
                                            <Text style={styles.cancelEditButtonText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.itemName}>{item.name}</Text>

                                <Text style={styles.sectionTitle}>Color</Text>
                                <View style={styles.colorBadge}>
                                    <Text style={styles.colorBadgeText}>
                                        {item.color?.trim() ? item.color : 'No color selected'}
                                    </Text>
                                </View>

                                <Text style={styles.sectionTitle}>Additional information</Text>
                                <Text style={styles.itemInfo}>
                                    {item.additionalInfo?.trim()
                                        ? item.additionalInfo
                                        : 'No additional information yet.'}
                                </Text>

                                <Text style={styles.sectionTitle}>Additional information</Text>
                                <Text style={styles.itemInfo}>
                                    {item.additionalInfo?.trim()
                                        ? item.additionalInfo
                                        : 'No additional information yet.'}
                                </Text>

                                <View style={styles.actionButtonsRow}>
                                    <TouchableOpacity
                                        style={styles.primaryButtonHalf}
                                        onPress={() => setIsEditing(true)}
                                    >
                                        <Text style={styles.primaryButtonText}>Edit</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.secondaryButton}
                                        onPress={() => setShowDeleteModal(true)}
                                    >
                                        <Text style={styles.secondaryButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>

                                {usefulSuggestions.length > 0 && (
                                    <View style={styles.usefulSection}>
                                        <Text style={styles.usefulTitle}>
                                            Could be useful with this
                                        </Text>

                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.usefulScrollContent}
                                    >
                                        {usefulSuggestions.map((product) => {
                                            const imageKey = product.images?.[0];
                                            const imageSource = imageKey ? productImages[imageKey] : null;

                                            return (
                                                <TouchableOpacity
                                                    key={product.id}
                                                    activeOpacity={0.9}
                                                    style={[styles.usefulCard, { width: suggestionCardWidth }]}
                                                    onPress={() =>
                                                        router.push({
                                                            pathname: '/product_detail',
                                                            params: {
                                                                productId: product.id,
                                                                category: product.mainCategory,
                                                                subcategory: product.subCategory,
                                                                gender: product.gender === 'women' ? 'WOMAN' : 'MAN',
                                                            },
                                                        })
                                                    }
                                                >
                                                    <View style={styles.usefulImageWrap}>
                                                        {imageSource && (
                                                            <Image
                                                                source={imageSource}
                                                                style={styles.usefulImage}
                                                                contentFit="cover"
                                                                cachePolicy="memory-disk"
                                                                transition={150}
                                                            />
                                                        )}
                                                    </View>

                                                    <View style={styles.usefulInfo}>
                                                        <Text style={styles.usefulBrand} numberOfLines={1}>
                                                            {product.brand}
                                                        </Text>

                                                        <Text style={styles.usefulName} numberOfLines={2} ellipsizeMode="tail">
                                                            {product.name}
                                                        </Text>

                                                        <Text style={styles.usefulPrice}>
                                                            €{product.price.toFixed(2)}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                                )}
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            {showDeleteModal && (
                <View style={styles.modalOverlay}>
                    <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFill} />

                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Delete item</Text>

                        <Text style={styles.modalText}>
                            Do you really want to delete "{item.name}"?
                        </Text>

                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalDeleteButton}
                                onPress={handleDeleteItem}
                            >
                                <Text style={styles.modalDeleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            <Modal
                visible={showImagePreview}
                transparent
                animationType="fade"
                onRequestClose={() => setShowImagePreview(false)}
            >
                <View style={styles.imagePreviewOverlay}>
                    <TouchableOpacity
                        style={styles.imagePreviewClose}
                        onPress={() => setShowImagePreview(false)}
                    >
                        <Feather name="x" size={28} color="#111" />
                    </TouchableOpacity>

                    {displayImage && (
                        <Image
                            source={displayImage}
                            style={styles.imagePreviewFull}
                            contentFit="contain"
                            cachePolicy="memory-disk"
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f3f3f3',
    },

    flex: {
        flex: 1,
    },

    scrollViewContent: {
        paddingBottom: 40,
    },

    headerWrapper: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 22,
        marginLeft: -18,
        marginRight: -18,
        overflow: 'hidden',
    },

    backButton: {
        width: 34,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginRight: 18,
        marginLeft: 6,
    },

    headerText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111',
    },

    content: {
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 30,
    },

    previewCard: {
        width: '100%',
        aspectRatio: 0.78,
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: '#f3f3f3',
    },

    previewImage: {
        width: '100%',
        height: '100%',
    },

    itemName: {
        marginTop: 20,
        fontSize: 24,
        fontWeight: '700',
        color: '#111',
    },

    sectionTitle: {
        marginTop: 18,
        marginBottom: 8,
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },

    itemInfo: {
        fontSize: 15,
        color: '#5f5f5f',
        lineHeight: 22,
    },

    form: {
        marginTop: 18,
        gap: 12,
    },

    label: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
        marginBottom: -2,
    },

    input: {
        minHeight: 48,
        borderRadius: 14,
        backgroundColor: '#dedede',
        paddingHorizontal: 14,
        fontSize: 15,
        color: '#111',
    },

    textArea: {
        minHeight: 120,
        paddingTop: 14,
    },

    primaryButton: {
        marginTop: 12,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
    },

    primaryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },

    changePhotoButton: {
        marginTop: 18,
        alignSelf: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#dedede',

    },

    changePhotoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
    },

    missingWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    missingText: {
        fontSize: 16,
        color: '#666',
    },

    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 48,
    },

    primaryButtonHalf: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
    },

    secondaryButton: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#dedede',
        justifyContent: 'center',
        alignItems: 'center',
    },

    secondaryButtonText: {
        color: '#111',
        fontSize: 15,
        fontWeight: '700',
    },

    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },

    modalCard: {
        width: '82%',
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 18,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        marginBottom: 10,
        textAlign: 'center',
    },

    modalText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
        textAlign: 'center',
        marginBottom: 20,
    },

    modalButtonsRow: {
        flexDirection: 'row',
        gap: 10,
    },

    modalCancelButton: {
        flex: 1,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#dedede',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalCancelText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },

    modalDeleteButton: {
        flex: 1,
        height: 46,
        borderRadius: 14,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalDeleteText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },

    cancelEditButton: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#dedede',
        justifyContent: 'center',
        alignItems: 'center',
    },

    cancelEditButtonText: {
        color: '#111',
        fontSize: 15,
        fontWeight: '700',
    },

    loaderWrapper: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },

    metaContainer: {
        marginTop: 6,
        alignItems: 'flex-end',
    },

    metaText: {
        fontSize: 12,
        color: '#9a9a9a',
    },

    imagePreviewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.96)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    imagePreviewClose: {
        position: 'absolute',
        top: 60,
        right: 22,
        zIndex: 20,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },

    imagePreviewFull: {
        width: '92%',
        height: '82%',
    },

    usefulSection: {
        backgroundColor: '#dedede',
        paddingVertical: 16,
        paddingTop: 20,
        marginTop: 16,

    },

    usefulTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        marginBottom: 12,
        paddingLeft: 8,
    },

    usefulScrollContent: {
        paddingLeft: 8,
        paddingRight: 8,
    },

    usefulCard: {
        backgroundColor: '#f3f3f3',
        borderRadius: 18,
        overflow: 'hidden',
        marginRight: 12,
    },

    usefulImageWrap: {
        width: '100%',
        height: 190,
        backgroundColor: '#e7e7e7',
    },

    usefulImage: {
        width: '100%',
        height: '100%',
    },

    usefulInfo: {
        padding: 12,
    },

    usefulBrand: {
        fontSize: 11,
        color: '#7a7a7a',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 4,
    },

    usefulName: {
        fontSize: 14,
        color: '#111',
        fontWeight: '700',
        lineHeight: 18,
        marginBottom: 8,
    },

    usefulPrice: {
        fontSize: 14,
        color: '#111',
        fontWeight: '700',
    },

    colorBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#dedede',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },

    colorBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
    },
});