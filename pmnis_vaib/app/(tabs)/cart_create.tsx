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
    ScrollView,
    TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCart } from '../../context/cart_context';

export default function CreateCartScreen() {
    const router = useRouter();
    const { carts, createCart, getCartById, updateCart, isUnlimitedUnlocked } = useCart();
    const { cartId, returnToBuilder, returnToCartDetail } = useLocalSearchParams();
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

            if (returnToCartDetail === 'true') {
                router.replace({
                    pathname: '/cart_detail',
                    params: { cartId: cart.id },
                });
            } else {
                router.replace('/(tabs)/cart');
            }

            return;
        }else {
            const created = createCart(trimmedName, parsedBudget);

            if (!created) {
                Alert.alert(
                    'Cart limit reached',
                    'You can create up to 5 carts before unlocking unlimited carts through Builder feedback.'
                );
                return;
            }

            if (returnToBuilder === 'true') {
                router.replace({
                    pathname: '/(tabs)/builder',
                    params: { returnToBuilder: 'true' },
                });
            } else {
                router.replace({
                    pathname: '/cart_detail',
                    params: {cartId: created.id},

                });
            }
        }
    };



    const handleCancel = () => {
        if (returnToCartDetail === 'true' && typeof cartId === 'string') {
            router.replace({
                pathname: '/cart_detail',
                params: { cartId },
            });
        } else if (returnToBuilder === 'true') {
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
                    <ScrollView
                        style={styles.flex}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        bounces
                        alwaysBounceVertical
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                    >
                    <View style={styles.container}>
                        <View style={styles.topRow}>
                            <TouchableOpacity style={styles.backButtonPlain} onPress={handleCancel}>
                                <Feather name="arrow-left" size={24} color="#111" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => router.push('/(tabs)/account')}
                            >
                                <Feather name="user" size={22} color="#111" />
                            </TouchableOpacity>
                        </View>

                        <ImageBackground
                            source={require('../../assets/images_app/search.jpg')}
                            style={styles.heroCard}
                            imageStyle={styles.heroCardImage}
                        >
                            <View style={styles.heroContent}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.title}>
                                        {isEditMode ? 'Edit cart' : 'Create new cart'}
                                    </Text>

                                    <Text style={styles.subTitle}>
                                        {isUnlimitedUnlocked ? (
                                            <>
                                                <Text style={styles.highlightText}>{carts.length}/∞</Text> cart slots used
                                            </>
                                        ) : remainingSlots > 0 ? (
                                            <>
                                                <Text style={styles.highlightText}>
                                                    {carts.length}/{maxFreeCarts}
                                                </Text>{' '}
                                                cart slots used
                                            </>
                                        ) : (
                                            <>
                                                You reached the{' '}
                                                <Text style={styles.highlightText}>
                                                    {maxFreeCarts}/{maxFreeCarts}
                                                </Text>{' '}
                                                cart limit
                                            </>
                                        )}
                                    </Text>
                                </View>

                                <Feather name="shopping-cart" size={46} color="#111" />
                            </View>
                        </ImageBackground>

                        <View style={styles.formSection}>
                            <Text style={styles.label}>Cart name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter cart name"
                                placeholderTextColor="#8a8a8a"
                                value={cartName}
                                onChangeText={setCartName}
                            />


                            <Text style={styles.label}>Budget</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter budget (€)"
                                placeholderTextColor="#8a8a8a"
                                keyboardType="numeric"
                                value={budget}
                                onChangeText={setBudget}
                            />

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.createButtonSmall,
                                        !isEditMode && !isUnlimitedUnlocked && carts.length >= maxFreeCarts && styles.disabledButton,
                                    ]}
                                    onPress={handleSubmit}
                                >
                                    <Text style={styles.createButtonText}>
                                        {isEditMode ? 'Save changes' : 'Create cart'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.helperCard}>
                                <View style={styles.helperIconWrap}>
                                    <Feather name="info" size={16} color="#111" />
                                </View>

                                <View style={styles.helperTextWrap}>
                                    <Text style={styles.helperTitle}>Quick tip</Text>
                                    <Text style={styles.helperText}>
                                        Instead of mixing everything, create multiple carts: one for what you need now and one for what you just love.
                                        {'\n\n'}
                                        Set a realistic budget so your cart stays easier to manage and compare. You can always edit the name and budget later.

                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    </ScrollView>
            </SafeAreaView>

        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
    },
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
    subTitle: { fontSize: 14,  color: '#111', marginBottom: 18 },

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
        backgroundColor: '#dedede', justifyContent: 'center', alignItems: 'center',
    },
    cancelButtonText: { fontSize: 14, fontWeight: '700', color: '#111' },
    createButtonSmall: {
        flex: 1, height: 52, borderRadius: 18,
        backgroundColor: '#111', justifyContent: 'center', alignItems: 'center',
    },
    createButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    disabledButton: { opacity: 0.6 },

    backButtonPlain: {
        width: 34,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },

    heroCard: {
        borderRadius: 20,
        overflow: 'hidden',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 20,
    },

    heroCardImage: {
        borderRadius: 20,
    },

    formSection: {
        flex: 1,
    },

    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 6,
    },

    highlightText: {
        color: '#111',
        fontWeight: '800',
    },

    helperCard: {
        marginTop: 18,
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#dedede',
        borderRadius: 16,
        padding: 14,
    },

    helperIconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f3f3f3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    helperTextWrap: {
        flex: 1,
    },

    helperTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },

    helperText: {
        fontSize: 13,
        lineHeight: 18,
        color: '#5f5f5f',
    },
});