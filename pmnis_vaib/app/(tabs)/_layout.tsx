import { Tabs } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { WardrobeProvider } from '../../context/wardrobe_context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CartProvider } from '../../context/cart_context';

function CustomTabBar({ state, navigation }: any) {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();

    const isSearchActive = pathname.startsWith('/search');


    return (
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 14) }]}>

            <TouchableOpacity
                style={[styles.navItem, state.index === 0 && styles.activeNavItem]}
                onPress={() => navigation.navigate('home')}
            >
                <Ionicons name="home-outline" size={26} color="#5f5f5f" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navItem, isSearchActive && styles.activeNavItem]}
                onPress={() => navigation.navigate('search')}
            >
                <Feather name="search" size={25} color="#5f5f5f" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navItem, state.index === 2 && styles.activeNavItem]}
                onPress={() => navigation.navigate('builder')}
            >
                <Feather name="star" size={24} color="#5f5f5f" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navItem, state.index === 3 && styles.activeNavItem]}
                onPress={() => navigation.navigate('cart')}
            >
                <Feather name="shopping-cart" size={25} color="#5f5f5f" />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navItem, state.index === 4 && styles.activeNavItem]}
                onPress={() => navigation.navigate('wardrobe')}
            >
                <MaterialCommunityIcons name="hanger" size={26} color="#5f5f5f" />
            </TouchableOpacity>

        </View>
    );
}

export default function TabLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <WardrobeProvider>
                <CartProvider>
                    <Tabs
                        tabBar={(props) => <CustomTabBar {...props} />}
                        screenOptions={{
                            headerShown: false,
                        }}
                    >
                        <Tabs.Screen name="home" />
                        <Tabs.Screen name="search" />
                        <Tabs.Screen name="builder" />
                        <Tabs.Screen name="cart" />
                        <Tabs.Screen name="wardrobe" />
                        <Tabs.Screen name="account" options={{ href: null }} />
                        <Tabs.Screen name="search_items" options={{ href: null }} />
                        <Tabs.Screen name="wardrobe_add" options={{ href: null }} />
                        <Tabs.Screen name="wardrobe_item" options={{ href: null }} />
                        <Tabs.Screen name="create_cart" options={{ href: null }} />
                    </Tabs>
                </CartProvider>
            </WardrobeProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#f3f3f3',
        borderTopWidth: 1,
        borderTopColor: '#d8d8d8',
        paddingTop: 12,
        paddingHorizontal: 14,
    },

    navItem: {
        width: 42,
        height: 42,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 21,
    },

    activeNavItem: {
        backgroundColor: '#f2b55d',
    },
});