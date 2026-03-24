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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
    const categories = [
        'SALE: HOT DEALS',
        'CLOTHING',
        'SHOES',
        'DRESSES',
        'DESIGN',
        'FACE N BODY',
        'ACCESSORIES',
        'BRANDS',
        'ACTIVEWEAR',
        'PYJAMAS',
    ];

    const [selected, setSelected] = React.useState('WOMAN');

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
            case 'FACE N BODY':
                return <MaterialCommunityIcons name="face-woman" size={20} color="#111" />;
            case 'ACTIVEWEAR':
                return <MaterialCommunityIcons name="run" size={20} color="#111" />;
            case 'PYJAMAS':
                return <MaterialCommunityIcons name="bed" size={20} color="#111" />;
            case 'BRANDS':
                return <Feather name="star" size={20} color="#111" />;
            default:
                return <Feather name="circle" size={20} color="#111" />;
        }
    };

    const router = useRouter();


    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>

                <View style={styles.topBar}>
                    <View style={styles.searchWrapper}>
                        <Feather name="search" size={18} color="#393939" style={styles.searchIcon} />

                        <TextInput
                            placeholder="Search"
                            placeholderTextColor="#393939"
                            style={styles.searchInput}
                        />

                        <TouchableOpacity style={styles.cameraButton}>
                            <Feather name="camera" size={18} color="#393939" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.genderWrapper}>
                    <TouchableOpacity
                        style={styles.genderButton}
                        onPress={() => setSelected('WOMAN')}
                    >
                        <Text style={[
                            styles.genderText,
                            selected === 'WOMAN' && styles.activeText
                        ]}>
                            WOMAN
                        </Text>

                        {selected === 'WOMAN' && <View style={styles.activeLine} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.genderButton}
                        onPress={() => setSelected('MAN')}
                    >
                        <Text style={[
                            styles.genderText,
                            selected === 'MAN' && styles.activeText
                        ]}>
                            MAN
                        </Text>

                        {selected === 'MAN' && <View style={styles.activeLine} />}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {categories.map((item, index) => {
                        const isSale = item === 'SALE: HOT DEALS';

                        const content = (
                            <View style={styles.categoryRow}>
                                {getIcon(item)}

                                <Text style={[
                                    styles.categoryText,
                                    isSale && styles.saleText
                                ]}>
                                    {item}
                                </Text>
                            </View>
                        );

                        if (isSale) {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.saleWrapper}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/(tabs)/search_category',
                                            params: { category: item },
                                        })
                                    }
                                >
                                    <ImageBackground
                                        source={require('../../assets/images_app/search.png')}
                                        style={styles.saleCard}
                                        imageStyle={{ borderRadius: 14 }}
                                    >
                                        {content}
                                    </ImageBackground>
                                </TouchableOpacity>
                            );
                        }

                        return (
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

    genderWrapper: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        marginBottom: 20,
    },

    genderButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },

    genderText: {
        fontSize: 16,
        color: '#888',
        fontWeight: '500',
    },

    activeText: {
        color: '#111',
    },

    activeLine: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 3,
        backgroundColor: '#df2518',
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
});