import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { categoryMap } from '../../context/product_context';

export default function SearchCategoryScreen() {
    const router = useRouter();
    const { category, gender } = useLocalSearchParams();

    const categoryName = Array.isArray(category) ? category[0] : category;
    const selectedGender = Array.isArray(gender) ? gender[0] : gender;

    const items =
        typeof categoryName === 'string'
            ? categoryMap[categoryName as keyof typeof categoryMap] || []
            : [];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <ImageBackground
                    source={require('../../assets/images_app/search.jpg')}
                    style={styles.headerBackground}
                    imageStyle={styles.headerBackgroundImage}
                >
                    <View style={styles.headerTopRow}>
                        <TouchableOpacity
                            onPress={() => router.replace('/search')}
                            style={styles.backButton}
                        >
                            <Feather name="arrow-left" size={22} color="#111" />
                        </TouchableOpacity>

                        <Text style={styles.title}>
                            {typeof categoryName === 'string' ? categoryName : ''}
                        </Text>

                        <View style={styles.rightPlaceholder} />
                    </View>
                </ImageBackground>

                <View style={styles.contentWrapper}>
                    <Text style={styles.subtitle}>Browse products</Text>

                    {items.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.itemRow}
                            onPress={() =>
                                router.push({
                                    pathname: '/search_items',
                                    params: {
                                        category: categoryName,
                                        subcategory: item,
                                        gender: selectedGender,
                                    },
                                })
                            }
                        >
                            <Text style={styles.itemText}>{item}</Text>
                            <Feather name="chevron-right" size={20} color="#111" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f3f3f3',
    },

    scrollContent: {
        paddingBottom: 30,
        backgroundColor: '#f3f3f3',
    },

    headerBackground: {
        minHeight: 70,
        paddingTop: 8,
        paddingHorizontal: 14,
        justifyContent: 'flex-start',
    },

    headerBackgroundImage: {
        resizeMode: 'cover',
    },

    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 44,
    },

    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },

    rightPlaceholder: {
        width: 44,
        height: 44,
    },

    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 26,
        fontWeight: '700',
        color: '#111',
    },

    contentWrapper: {
        paddingHorizontal: 14,
        paddingTop: 20,
    },

    subtitle: {
        fontSize: 14,
        color: '#6a6a6a',
        marginBottom: 8,
    },

    itemRow: {
        minHeight: 82,
        borderBottomWidth: 1,
        borderBottomColor: '#d0d0d0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    itemText: {
        fontSize: 20,
        fontWeight: '500',
        color: '#111',
    },
});