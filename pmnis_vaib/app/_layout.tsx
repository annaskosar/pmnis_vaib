import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ProductProvider } from '../context/product_context';
import { WishlistProvider } from '../context/wishlist_context';
import { WardrobeProvider } from '../context/wardrobe_context';
import { CartProvider } from '../context/cart_context';

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ProductProvider>
                <WishlistProvider>
                    <WardrobeProvider>
                        <CartProvider>
                            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                                <Stack screenOptions={{ headerShown: false }}>
                                    <Stack.Screen name="index" />
                                    <Stack.Screen name="(tabs)" />
                                    <Stack.Screen name="cart_detail" />
                                    <Stack.Screen name="payment" />
                                    <Stack.Screen
                                        name="modal"
                                        options={{ presentation: 'modal', title: 'Modal', headerShown: true }}
                                    />
                                </Stack>
                                <StatusBar style="auto" />
                            </ThemeProvider>
                        </CartProvider>
                    </WardrobeProvider>
                </WishlistProvider>
            </ProductProvider>
        </GestureHandlerRootView>
    );
}