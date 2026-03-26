import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ImageBackground,
    Image,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useWardrobe } from '../../context/wardrobe_context';
import { BlurView } from 'expo-blur';


export default function WardrobeItemScreen() {
    const router = useRouter();
    const { itemId } = useLocalSearchParams();
    const { getWardrobeItemById, updateWardrobeItem, deleteWardrobeItem } = useWardrobe();

    const item = typeof itemId === 'string' ? getWardrobeItemById(itemId) : undefined;

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
        }
    }, [item]);

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
                            mediaTypes: ['images'],
                            allowsEditing: false,
                            quality: 1,
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
                            mediaTypes: ['images'],
                            allowsEditing: false,
                            quality: 1,
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

    if (!item) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.missingWrapper}>
                    <Text style={styles.missingText}>Item not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const imageSource =
        typeof editedImage === 'string' ? { uri: editedImage } : editedImage;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={20}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={styles.scrollViewContent}
                >
                    <ImageBackground
                        source={require('../../assets/images_app/search.png')}
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

                    <View style={styles.content}>
                        <View style={styles.previewCard}>
                            <Image
                                source={imageSource}
                                style={styles.previewImage}
                                resizeMode="contain"
                            />
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
        aspectRatio: 0.95,
        borderRadius: 28,
        overflow: 'hidden',
        backgroundColor: '#f3f3f3',
        justifyContent: 'center',
        alignItems: 'center',
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
        marginTop: 18,
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
        borderWidth: 1,
        borderColor: '#111',
    },

    secondaryButtonText: {
        color: '#d11a2a',
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
        borderWidth: 1,
        borderColor: '#111',
    },

    cancelEditButtonText: {
        color: '#111',
        fontSize: 15,
        fontWeight: '700',
    },
});