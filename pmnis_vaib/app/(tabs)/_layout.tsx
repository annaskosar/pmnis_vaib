import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ProductProvider } from '../../context/product_context';
import { WardrobeProvider } from '../../context/wardrobe_context';
import { CartProvider } from '../../context/cart_context';
import AsyncStorage from '@react-native-async-storage/async-storage';

function CustomTabBar({ state, navigation }: any) {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();

    const clearPlaygroundSearches = async () => {
        try {
            await AsyncStorage.removeItem('recentSearchesPlayground');
        } catch (error) {
            console.log('Failed to clear playground searches', error);
        }
    };

    const handleTabPress = async (routeName: string) => {
        if (routeName !== 'search') {
            await clearPlaygroundSearches();
        }
        navigation.navigate(routeName);
    };
    const isSearchActive = pathname.startsWith('/search');
    const isCartActive = pathname.startsWith('/cart');
    const isWardrobeActive = pathname.startsWith('/wardrobe');

    return (
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <TouchableOpacity
                style={[styles.navItem, state.index === 0 && styles.activeNavItem]}
                onPress={() => handleTabPress('home')}
            >
                <Ionicons name="home-outline" size={26} color="#5f5f5f" />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.navItem, isSearchActive && styles.activeNavItem]}
                onPress={() => handleTabPress('search')}
            >
                <Feather name="search" size={25} color="#5f5f5f" />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.navItem, state.index === 2 && styles.activeNavItem]}
                onPress={() => handleTabPress('builder')}
            >
                <Feather name="star" size={24} color="#5f5f5f" />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.navItem, isCartActive && styles.activeNavItem]}
                onPress={() => handleTabPress('cart')}
            >
                <Feather name="shopping-cart" size={25} color="#5f5f5f" />
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.navItem, isWardrobeActive && styles.activeNavItem]}
                onPress={() => handleTabPress('wardrobe')}
            >
                <MaterialCommunityIcons name="hanger" size={26} color="#5f5f5f" />
            </TouchableOpacity>
        </View>
    );
}

export default function TabLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ProductProvider>
                <WardrobeProvider>
                    <CartProvider>
                        <Tabs
                            tabBar={(props) => <CustomTabBar {...props} />}
                            screenOptions={{ headerShown: false }}
                        >
                            <Tabs.Screen name="home" />
                            <Tabs.Screen name="search" />
                            <Tabs.Screen name="builder" />
                            <Tabs.Screen name="cart" />
                            <Tabs.Screen name="wardrobe" />
                            <Tabs.Screen name="account" options={{ href: null }} />
                            <Tabs.Screen name="search_items" options={{ href: null }} />
                            <Tabs.Screen name="search_category" options={{ href: null }} />
                            <Tabs.Screen name="wardrobe_add" options={{ href: null }} />
                            <Tabs.Screen name="wardrobe_item" options={{ href: null }} />
                            <Tabs.Screen name="cart_create" options={{ href: null }} />
                            <Tabs.Screen name="product_detail" options={{ href: null }} />
                            <Tabs.Screen name="reviews" options={{ href: null }} />
                            <Tabs.Screen name="explore" options={{ href: null }} />
                            <Tabs.Screen name="wishlist" options={{ href: null }} />
                            <Tabs.Screen name="playground" options={{ href: null }} />
                        </Tabs>
                    </CartProvider>
                </WardrobeProvider>
            </ProductProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-around', backgroundColor: '#f3f3f3',
        borderTopWidth: 1, borderTopColor: '#d8d8d8',
        paddingTop: 12, paddingHorizontal: 14,
    },
    navItem: {
        width: 42, height: 42, justifyContent: 'center',
        alignItems: 'center', borderRadius: 21,
    },
    activeNavItem: { backgroundColor: '#f2b55d' },
});