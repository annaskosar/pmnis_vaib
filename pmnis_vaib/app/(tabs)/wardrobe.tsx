import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    ImageBackground,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useWardrobe } from '../../context/wardrobe_context';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Dimensions } from 'react-native';

export default function WardrobeScreen() {
    const router = useRouter();
    const actionButtonSize = 58;
    const actionGap = 14;
    const actionsWidth = actionButtonSize;
    const actionsHeight = actionButtonSize * 2 + actionGap;

    const { wardrobeItems, deleteWardrobeItem, togglePinWardrobeItem } = useWardrobe();

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
    const screenWidth = Dimensions.get('window').width;

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
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;

            router.push({
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
            quality: 1,
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

    const sortedWardrobeItems = [...wardrobeItems].sort((a, b) => {
        if ((a.isPinned ? 1 : 0) !== (b.isPinned ? 1 : 0)) {
            return a.isPinned ? -1 : 1;
        }

        if (a.isPinned && b.isPinned) {
            return (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0);
        }

        return 0;
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <ImageBackground
                        source={require('../../assets/images_app/search.png')}
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
                        />
                    </ImageBackground>

                    <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={handleAddItem}
                    >
                        <Feather name="plus" size={15} color="#111" />
                        <Feather name="camera" size={18} color="#111" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.grid}>
                        {sortedWardrobeItems.map((item) => (
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
                                        <Image
                                            source={
                                                typeof item.image === 'string'
                                                    ? { uri: item.image }
                                                    : item.image
                                            }
                                            style={styles.image}
                                            resizeMode="cover"
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
                                        ? { uri: selectedItem.image }
                                        : selectedItem.image
                                }
                                style={styles.image}
                                resizeMode="cover"
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
        paddingRight: 14,
        fontSize: 15,
        color: '#111',
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
});