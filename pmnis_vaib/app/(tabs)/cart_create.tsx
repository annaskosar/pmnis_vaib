import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Alert,
    ImageBackground,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCart } from '../../context/cart_context';

export default function CreateCartScreen() {
    const router = useRouter();
    const { carts, createCart, getCartById, updateCart } = useCart();
    const { cartId, returnToBuilder } = useLocalSearchParams();
    const isEditMode = typeof cartId === 'string';

    const [cartName, setCartName] = React.useState('');
    const [budget, setBudget] = React.useState('');
    const [currency, setCurrency] = React.useState<'€' | '$' | '£'>('€');

    const maxFreeCarts = 5;
    const remainingSlots = Math.max(0, maxFreeCarts - carts.length);
    const cart = isEditMode ? getCartById(cartId) : undefined;

    useFocusEffect(
        React.useCallback(() => {
            if (!isEditMode) {
                setCartName('');
                setBudget('');
                setCurrency('€');
            }
        }, [isEditMode])
    );

    React.useEffect(() => {
        if (cart && isEditMode) {
            setCartName(cart.name);
            setBudget(cart.budget.toString());
        }
    }, [cart]);

    const handleSubmit = () => {
        const trimmedName = cartName.trim();
        const parsedBudget = Number(budget.replace(',', '.'));

        if (!trimmedName) {
            Alert.alert('Missing name', 'Please enter a cart name.');
            return;
        }

        if (!budget.trim()) {
            Alert.alert('Missing budget', 'Please enter a budget.');
            return;
        }

        if (Number.isNaN(parsedBudget) || parsedBudget <= 0) {
            Alert.alert('Invalid budget', 'Please enter a valid budget amount.');
            return;
        }

        if (isEditMode && cart) {
            updateCart(cart.id, trimmedName, parsedBudget);
            router.replace('/(tabs)/cart');
        } else {
            const created = createCart(trimmedName, parsedBudget);

            if (!created) {
                Alert.alert('Cart limit reached', 'You can create up to 5 carts before unlocking more.');
                return;
            }

            if (returnToBuilder === 'true') {
                router.replace({
                    pathname: '/(tabs)/builder',
                    params: { returnToBuilder: 'true' },
                });
            } else {
                router.replace('/(tabs)/cart');
            }
        }
    };

    const handleCancel = () => {
        if (returnToBuilder === 'true') {
            router.replace({
                pathname: '/(tabs)/builder',
                params: { returnToBuilder: 'true' },
            });
        } else {
            router.replace('/(tabs)/cart');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.topRow}>
                        <TouchableOpacity style={styles.iconButton} onPress={handleCancel}>
                            <Feather name="arrow-left" size={22} color="#111" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => router.push('/(tabs)/account')}
                        >
                            <Feather name="user" size={22} color="#111" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.title}>
                        {isEditMode ? 'Edit cart' : 'Create new cart'}
                    </Text>
                    <Text style={styles.subTitle}>
                        {remainingSlots > 0
                            ? `${remainingSlots} of ${maxFreeCarts} unlock cart slots left`
                            : `You reached the ${maxFreeCarts}-cart limit`}
                    </Text>

                    <ImageBackground
                        source={require('../../assets/images_app/search.png')}
                        style={styles.formCard}
                        imageStyle={styles.formCardImage}
                    >
                        <View style={styles.formOverlay}>
                            <Text style={styles.label}>Cart name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter cart name"
                                placeholderTextColor="#8a8a8a"
                                value={cartName}
                                onChangeText={setCartName}
                            />

                            <View style={styles.currencyRow}>
                                {['€', '$', '£'].map((curr) => (
                                    <TouchableOpacity
                                        key={curr}
                                        style={[styles.currencyButton, currency === curr && styles.activeCurrencyButton]}
                                        onPress={() => setCurrency(curr as any)}
                                    >
                                        <Text style={[styles.currencyText, currency === curr && styles.activeCurrencyText]}>
                                            {curr}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Budget</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter budget"
                                placeholderTextColor="#8a8a8a"
                                keyboardType="numeric"
                                value={budget}
                                onChangeText={setBudget}
                            />

                            <View style={{ marginTop: 'auto', marginBottom: 10 }}>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.createButtonSmall,
                                            !isEditMode && carts.length >= maxFreeCarts && styles.disabledButton,
                                        ]}
                                        onPress={handleSubmit}
                                    >
                                        <Text style={styles.createButtonText}>
                                            {isEditMode ? 'Save changes' : 'Create cart'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
    topRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 18,
    },
    iconButton: {
        width: 44, height: 44, borderRadius: 22, borderWidth: 1.5,
        borderColor: '#6a6a6a', justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#f3f3f3',
    },
    title: { fontSize: 26, fontWeight: '700', color: '#111', marginBottom: 6 },
    subTitle: { fontSize: 14, color: '#6a6a6a', marginBottom: 18 },
    formCard: {
        flex: 1, borderRadius: 18, padding: 16,
        borderWidth: 1, borderColor: '#d6d6d6', overflow: 'hidden',
    },
    formCardImage: { borderRadius: 18 },
    formOverlay: {
        flex: 1, padding: 16,
        backgroundColor: 'rgba(237, 237, 237, 0.8)',
    },
    label: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 8, marginTop: 10 },
    input: {
        height: 52, borderRadius: 14, backgroundColor: '#f7f7f7',
        borderWidth: 1, borderColor: '#d2d2d2', paddingHorizontal: 14,
        fontSize: 14, color: '#111', marginBottom: 18,
    },
    currencyRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    currencyButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#e5e5e5' },
    activeCurrencyButton: { backgroundColor: '#111' },
    currencyText: { fontSize: 14, fontWeight: '700', color: '#111' },
    activeCurrencyText: { color: '#fff' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 10 },
    cancelButton: {
        flex: 1, height: 52, borderRadius: 18,
        backgroundColor: '#e5e5e5', justifyContent: 'center', alignItems: 'center',
    },
    cancelButtonText: { fontSize: 14, fontWeight: '700', color: '#111' },
    createButtonSmall: {
        flex: 1, height: 52, borderRadius: 18,
        backgroundColor: '#111', justifyContent: 'center', alignItems: 'center',
    },
    createButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    disabledButton: { opacity: 0.6 },
});