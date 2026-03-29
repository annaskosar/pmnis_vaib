import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ImageBackground,
    Image,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWardrobe, WardrobeCategory } from '../../context/wardrobe_context';
import { useFocusEffect } from '@react-navigation/native';

const CATEGORIES: { value: WardrobeCategory; label: string; icon: string }[] = [
    { value: 'shoes', label: 'Shoes', icon: '👟' },
    { value: 'pants', label: 'Pants / Skirt', icon: '👖' },
    { value: 'top', label: 'Top / T-shirt', icon: '👕' },
    { value: 'jacket', label: 'Jacket / Coat', icon: '🧥' },
    { value: 'dress', label: 'Dress', icon: '👗' },
    { value: 'other', label: 'Other', icon: '🛍️' },
];

export default function WardrobeAddScreen() {
    const router = useRouter();
    const { imageUri } = useLocalSearchParams();
    const { addWardrobeItem } = useWardrobe();

    const [itemName, setItemName] = React.useState('');
    const [additionalInfo, setAdditionalInfo] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState<WardrobeCategory | null>(null);
    const [selectedAction, setSelectedAction] = React.useState<'cancel' | 'save' | null>(null);

    const imageSource =
        typeof imageUri === 'string' ? { uri: imageUri } : undefined;

    const handleCancel = () => {
        router.replace('/(tabs)/wardrobe');
    };

    const handleSave = () => {
        if (!imageUri || typeof imageUri !== 'string') return;
        addWardrobeItem({
            image: imageUri,
            name: itemName.trim() || 'new item',
            category: selectedCategory ?? 'other',
            additionalInfo: additionalInfo.trim(),
            createdAt: Date.now(),
        });
        router.replace('/(tabs)/wardrobe');
    };

    useFocusEffect(
        React.useCallback(() => {
            setSelectedAction(null);
            setItemName('');
            setAdditionalInfo('');
            setSelectedCategory(null);
        }, [])
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={20}
            >
                <ImageBackground
                    source={require('../../assets/images_app/search.png')}
                    style={styles.headerWrapper}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.replace('/(tabs)/wardrobe')}
                    >
                        <Feather name="arrow-left" size={24} color="#111" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Add to wardrobe</Text>
                </ImageBackground>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={styles.scrollViewContent}
                >
                    <View style={styles.scrollContent}>
                        <View style={styles.previewCard}>
                            {imageSource ? (
                                <Image
                                    source={imageSource}
                                    style={styles.previewImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.emptyPreview}>
                                    <Text style={styles.emptyPreviewText}>No image</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    selectedAction === 'cancel' && styles.iconButtonActive,
                                ]}
                                onPress={() => {
                                    setSelectedAction('cancel');
                                    setTimeout(handleCancel, 150);
                                }}
                            >
                                <Feather
                                    name="x"
                                    size={22}
                                    color="#fff"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    selectedAction === 'save' && styles.iconButtonActive,
                                ]}
                                onPress={() => {
                                    setSelectedAction('save');
                                    setTimeout(handleSave, 150);
                                }}
                            >
                                <Feather
                                    name="check"
                                    size={22}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Category</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat.value}
                                        style={[
                                            styles.categoryChip,
                                            selectedCategory === cat.value && styles.categoryChipActive,
                                        ]}
                                        onPress={() => setSelectedCategory(
                                            selectedCategory === cat.value ? null : cat.value
                                        )}
                                    >
                                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                        <Text style={[
                                            styles.categoryLabel,
                                            selectedCategory === cat.value && styles.categoryLabelActive,
                                        ]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                value={itemName}
                                onChangeText={setItemName}
                                placeholder="e.g. Brown bag"
                                placeholderTextColor="#8a8a8a"
                                style={styles.input}
                            />

                            <Text style={styles.label}>Additional information</Text>
                            <TextInput
                                value={additionalInfo}
                                onChangeText={setAdditionalInfo}
                                placeholder="Size, brand, material, your notes..."
                                placeholderTextColor="#8a8a8a"
                                style={[styles.input, styles.textArea]}
                                multiline
                                textAlignVertical="top"
                                scrollEnabled={false}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
    flex: { flex: 1 },
    scrollViewContent: { paddingBottom: 40, flexGrow: 1 },
    scrollContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 30 },
    headerWrapper: {
        height: 64, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 22, overflow: 'hidden',
    },
    backButton: {
        width: 34, height: 40, justifyContent: 'center',
        alignItems: 'flex-start', marginRight: 18, marginLeft: 6,
    },
    headerText: { fontSize: 22, fontWeight: '700', color: '#111' },
    previewCard: {
        width: '100%', aspectRatio: 0.78, borderRadius: 28,
        overflow: 'hidden', backgroundColor: '#f3f3f3',
    },
    previewImage: { width: '100%', height: '100%' },
    emptyPreview: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyPreviewText: { color: '#888', fontSize: 16 },
    actionsRow: {
        flexDirection: 'row', justifyContent: 'center',
        gap: 26, marginTop: 18, marginBottom: 26,
    },
    iconButton: {
        width: 54, height: 54, borderRadius: 27, borderWidth: 1.4,
        borderColor: '#111', justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#111',
    },
    iconButtonActive: { backgroundColor: '#333' },
    form: { gap: 12 },
    label: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: -2 },
    categoryGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4,
    },
    categoryChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 20, backgroundColor: '#dedede',
        borderWidth: 1.5, borderColor: 'transparent',
    },
    categoryChipActive: { backgroundColor: '#fff', borderColor: '#111' },
    categoryIcon: { fontSize: 16 },
    categoryLabel: { fontSize: 13, fontWeight: '600', color: '#666' },
    categoryLabelActive: { color: '#111' },
    input: {
        minHeight: 48, borderRadius: 14, backgroundColor: '#dedede',
        paddingHorizontal: 14, fontSize: 15, color: '#111',
    },
    textArea: { minHeight: 110, paddingTop: 14 },
});