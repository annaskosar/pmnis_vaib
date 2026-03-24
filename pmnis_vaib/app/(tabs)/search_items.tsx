import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    ImageBackground,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function SearchItemsScreen() {
    const router = useRouter();
    const { category, subcategory } = useLocalSearchParams();

    const [activeTab, setActiveTab] = React.useState('SORT');

    const categoryName = Array.isArray(category) ? category[0] : category;
    const subcategoryName = Array.isArray(subcategory) ? subcategory[0] : subcategory;

    const products = [
        {
            image: require('../../assets/images_app/model8.png'),
            name: 'Basic fitted top',
            price: '€24.99',
        },
        {
            image: require('../../assets/images_app/model9.png'),
            name: 'Ribbed long sleeve top',
            price: '€29.99',
        },
        {
            image: require('../../assets/images_app/model10.png'),
            name: 'Soft cropped top',
            price: '€21.99',
        },
        {
            image: require('../../assets/images_app/model11.png'),
            name: 'Minimal tank top',
            price: '€18.99',
        },
        {
            image: require('../../assets/images_app/model8.png'),
            name: 'Classic white top',
            price: '€26.99',
        },
        {
            image: require('../../assets/images_app/model9.png'),
            name: 'Oversized basic tee',
            price: '€27.99',
        },
    ];

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
                        />
                    </ImageBackground>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text style={styles.title}>
                        {categoryName}: {subcategoryName}
                    </Text>

                    <View style={styles.filterTabsWrapper}>
                        <TouchableOpacity
                            style={styles.filterTab}
                            onPress={() => setActiveTab('SORT')}
                        >
                            <Text
                                style={[
                                    styles.filterTabText,
                                    activeTab === 'SORT' && styles.activeFilterTabText,
                                ]}
                            >
                                SORT
                            </Text>
                            {activeTab === 'SORT' && <View style={styles.activeFilterLine} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.filterTab}
                            onPress={() => setActiveTab('FILTER')}
                        >
                            <Text
                                style={[
                                    styles.filterTabText,
                                    activeTab === 'FILTER' && styles.activeFilterTabText,
                                ]}
                            >
                                FILTER
                            </Text>
                            {activeTab === 'FILTER' && <View style={styles.activeFilterLine} />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.filterTab}
                            onPress={() => setActiveTab('SIZE')}
                        >
                            <Text
                                style={[
                                    styles.filterTabText,
                                    activeTab === 'SIZE' && styles.activeFilterTabText,
                                ]}
                            >
                                SIZE
                            </Text>
                            {activeTab === 'SIZE' && <View style={styles.activeFilterLine} />}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.foundText}>34 items found</Text>

                    <View style={styles.productsGrid}>
                        {products.map((item, index) => (
                            <View key={index} style={styles.productCard}>
                                <Image
                                    source={item.image}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />

                                <TouchableOpacity style={styles.cartButton}>
                                    <Feather name="shopping-cart" size={16} color="#111" />
                                </TouchableOpacity>

                                <Text style={styles.productPrice}>{item.price}</Text>
                                <Text style={styles.productName}>{item.name}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
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
        backgroundColor: '#f3f3f3',
        paddingHorizontal: 14,
        paddingTop: 8,
    },

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 30,
    },

    backButton: {
        width: 28,
        height: 42,
        justifyContent: 'center',
        alignItems: 'flex-start',
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

    scrollContent: {
        paddingBottom: 30,
    },

    title: {
        fontSize: 25,
        fontWeight: '700',
        color: '#111',
        marginBottom: 12,
    },

    filterTabsWrapper: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        marginBottom: 16,
    },

    filterTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },

    filterTabText: {
        fontSize: 15,
        color: '#888',
        fontWeight: '500',
    },

    activeFilterTabText: {
        color: '#111',
    },

    activeFilterLine: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 3,
        backgroundColor: '#df2518',
    },

    foundText: {
        fontSize: 14,
        color: '#7d7d7d',
        textAlign: 'center',
        marginBottom: 30,
    },

    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    productCard: {
        width: '48%',
        marginBottom: 22,
        position: 'relative',
    },

    productImage: {
        width: '100%',
        height: 245,
        borderRadius: 0,
        backgroundColor: '#d9d9d9',
    },

    cartButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 7,
    },

    productPrice: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },

    productName: {
        marginTop: 4,
        fontSize: 14,
        color: '#5f5f5f',
        lineHeight: 18,
        marginBottom: 10,
    },
});