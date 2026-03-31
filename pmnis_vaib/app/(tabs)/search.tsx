import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categoryMap, useProducts } from '../../context/product_context';

export default function SearchScreen() {
    const router = useRouter();
    const { searchProducts } = useProducts();

    const categories = Object.keys(categoryMap);

    const [searchText, setSearchText] = React.useState('');
    const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);

    const handleSearchSubmit = async () => {
        const trimmed = searchText.trim();
        if (!trimmed) return;

        await saveSearch(trimmed);

        const results = searchProducts(trimmed);

        router.push({
            pathname: '/search_items',
            params: {
                query: trimmed,
                results: JSON.stringify(results),
                noResults: results.length === 0 ? 'true' : 'false',
            },
        });

        setIsSearchFocused(false);
    };

    const handleCameraPress = () => {
        Alert.alert(
            'Camera unavailable',
            'Camera search is not available right now. Please try again later.'
        );
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'SALE: HOT DEALS':
                return <Feather name="tag" size={20} color="#111" />;
            case 'CLOTHING':
                return <Feather name="shopping-bag" size={20} color="#111" />;
            case 'SHOES':
                return <MaterialCommunityIcons name="shoe-sneaker" size={20} color="#111" />;
            case 'DRESSES':
                return <MaterialCommunityIcons name="hanger" size={20} color="#111" />;
            case 'ACCESSORIES':
                return <Feather name="watch" size={20} color="#111" />;
            case 'ACTIVEWEAR':
                return <MaterialCommunityIcons name="run" size={20} color="#111" />;
            case 'PYJAMAS':
                return <MaterialCommunityIcons name="bed" size={20} color="#111" />;
            case 'BRANDS':
                return <Feather name="star" size={20} color="#111" />;
            case 'DESIGN':
                return <Feather name="award" size={20} color="#111" />;
            default:
                return <Feather name="circle" size={20} color="#111" />;
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            setSearchText('');
            setIsSearchFocused(false);
            loadRecentSearches();
        }, [])
    );

    const loadRecentSearches = async () => {
        const stored = await AsyncStorage.getItem('recentSearches');
        setRecentSearches(stored ? JSON.parse(stored) : []);
    };

    const saveSearch = async (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;

        const stored = await AsyncStorage.getItem('recentSearches');
        const existing: string[] = stored ? JSON.parse(stored) : [];

        const updated = [
            trimmed,
            ...existing.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
        ].slice(0, 10);

        setRecentSearches(updated);
        await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const clearRecentSearches = async () => {
        setRecentSearches([]);
        await AsyncStorage.removeItem('recentSearches');
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
                    <View style={styles.topBar}>
                        <View style={styles.searchWrapper}>
                            <Feather
                                name="search"
                                size={18}
                                color="#393939"
                                style={styles.searchIcon}
                            />
                            <TextInput
                                placeholder="Search"
                                placeholderTextColor="#393939"
                                style={styles.searchInput}
                                value={searchText}
                                onChangeText={setSearchText}
                                onSubmitEditing={handleSearchSubmit}
                                onFocus={() => setIsSearchFocused(true)}
                            />
                            <TouchableOpacity
                                style={styles.cameraButton}
                                onPress={handleCameraPress}
                            >
                                <Feather name="camera" size={18} color="#393939" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {isSearchFocused && (
                        <View style={styles.dropdown}>
                            <View style={styles.recentHeader}>
                                <Text style={styles.recentTitle}>Recent searches</Text>
                                {recentSearches.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={clearRecentSearches}
                                    >
                                        <Text style={styles.clearText}>Clear</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {recentSearches.length === 0 ? (
                                <View style={styles.emptyWrapper}>
                                    <Feather name="search" size={34} color="#8a8a8a" />
                                    <Text style={styles.emptyText}>
                                        You have no recent searches
                                    </Text>
                                </View>
                            ) : (
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    contentContainerStyle={styles.recentScrollContent}
                                >
                                    {recentSearches.map((item, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.recentItem}
                                            onPress={async () => {
                                                await saveSearch(item);
                                                setSearchText(item);

                                                const results = searchProducts(item);

                                                router.push({
                                                    pathname: '/search_items',
                                                    params: {
                                                        query: item,
                                                        results: JSON.stringify(results),
                                                        noResults: results.length === 0 ? 'true' : 'false',
                                                    },
                                                });

                                                setIsSearchFocused(false);
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

                    {!isSearchFocused && (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                        >
                            {categories.map((item, index) => {
                                const isSale = item === 'SALE: HOT DEALS';

                                const content = (
                                    <View style={styles.categoryRow}>
                                        {getIcon(item)}
                                        <Text style={[styles.categoryText, isSale && styles.saleText]}>
                                            {item}
                                        </Text>
                                    </View>
                                );

                                return isSale ? (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.saleWrapper}
                                        onPress={() =>
                                            router.push({
                                                pathname: '/search_category',
                                                params: { category: item },
                                            })
                                        }
                                    >
                                        <ImageBackground
                                            source={require('../../assets/images_app/search.jpg')}
                                            style={styles.saleCard}
                                            imageStyle={{ borderRadius: 14 }}
                                        >
                                            {content}
                                        </ImageBackground>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.categoryCard}
                                        onPress={() =>
                                            router.push({
                                                pathname: '/search_category',
                                                params: { category: item },
                                            })
                                        }
                                    >
                                        {content}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>
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
        backgroundColor: '#f3f3f3',
        paddingHorizontal: 14,
        paddingTop: 8,
    },

    topBar: {
        marginBottom: 18,
    },

    searchWrapper: {
        width: '100%',
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
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
        paddingRight: 42,
        fontSize: 16,
        color: '#222',
    },

    cameraButton: {
        position: 'absolute',
        right: 12,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollContent: {
        paddingBottom: 24,
    },

    categoryCard: {
        height: 100,
        paddingHorizontal: 4,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        position: 'relative',
    },

    categoryText: {
        fontSize: 20,
        fontWeight: '500',
        color: '#111',
    },

    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    saleWrapper: {
        marginBottom: 12,
    },

    saleCard: {
        height: 100,
        borderRadius: 14,
        paddingHorizontal: 14,
        justifyContent: 'center',
        overflow: 'hidden',
    },

    saleText: {
        color: '#111',
        fontWeight: '700',
    },

    salePlus: {
        color: '#111',
    },

    dropdown: {
        position: 'absolute',
        top: 62,
        left: 14,
        right: 14,
        maxHeight: 320,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 16,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 8,
        zIndex: 20,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },

    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    recentScrollContent: {
        paddingBottom: 8,
    },

    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
    },

    emptyWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 36,
    },

    clearButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        backgroundColor: '#dedede',
    },

    clearText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#393939',
    },

    recentTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111',
    },

    emptyText: {
        marginTop: 10,
        fontSize: 15,
        color: '#6a6a6a',
        textAlign: 'center',
    },

    recentList: {
        gap: 2,
    },

    recentItemText: {
        fontSize: 15,
        color: '#111',
    },
});