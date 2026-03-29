import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
    Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCart } from '../../context/cart_context';
import { usePathname } from 'expo-router';

export default function CartDetailScreen() {
    const router = useRouter();
    const [voucherCode, setVoucherCode] = React.useState('');
    const [voucherMessage, setVoucherMessage] = React.useState('');
    const { cartId } = useLocalSearchParams();
    const {
        getCartById,
        increaseProductQuantity,
        decreaseProductQuantity,
        removeProductFromCart,
        deleteCart,
    } = useCart();

    const parsedCartId = typeof cartId === 'string' ? cartId : '';
    const cart = getCartById(parsedCartId);

    // ← HOOKS musia byť PRED if (!cart) return
    useFocusEffect(
        React.useCallback(() => {
            setVoucherCode('');
            setVoucherMessage('');
            return () => {};
        }, [])
    );

    if (!cart) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111' }}>
                        Cart not found
                    </Text>
                    <TouchableOpacity
                        style={[styles.checkoutButton, { marginTop: 20, flex: 0, maxWidth: 180 }]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.checkoutButtonText}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const handleApplyVoucher = () => {
        if (voucherCode.trim().length === 0) {
            setVoucherMessage('Please enter a code');
            return;
        }
        setVoucherMessage('Invalid code');
    };

    const handleDeleteCart = () => {
        Alert.alert(
            'Delete cart',
            'Are you sure you want to delete this cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteCart(cart.id);
                        router.replace('/(tabs)/cart');
                    },
                },
            ]
        );
    };

    const handleEditCart = () => {
        router.push({
            pathname: '/(tabs)/cart_create',
            params: {
                cartId: cart.id,
                returnToCartDetail: 'true',
            },
        });
    };

    const products = cart.products;
    const itemsCount = products.reduce((sum, product) => sum + product.quantity, 0);
    const total = products.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const vat = total * (20 / 120);
    const subtotal = total - vat;
    const remaining = cart.budget - total;
    const isOverBudget = remaining < 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.topRow}>
                    <TouchableOpacity
                        style={styles.backButtonPlain}
                        onPress={() => router.replace('/(tabs)/cart')}
                    >
                        <Feather name="arrow-left" size={24} color="#111" />
                    </TouchableOpacity>

                    <View style={styles.rightActions}>
                        <TouchableOpacity onPress={handleEditCart}>
                            <Feather name="edit-2" size={22} color="#111" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteCart}>
                            <Feather name="trash-2" size={22} color="#df2518" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.accountButton}
                            onPress={() => router.replace('/(tabs)/account')}
                        >
                            <Feather name="user" size={22} color="#393939" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.headerCard}>
                    <View style={styles.headerLeft}>
                        <View style={styles.cartIconWrapper}>
                            <Feather name="shopping-cart" size={30} color="#111" />
                        </View>

                        <View style={styles.headerTextBlock}>
                            <Text style={styles.cartTitle}>{cart.name}</Text>
                            <Text style={styles.headerSubText}>Budget: €{cart.budget.toFixed(2)}</Text>
                            <Text style={styles.headerSubText}>In cart: €{total.toFixed(2)}</Text>
                            <Text style={styles.headerSubText}>{itemsCount} items</Text>
                        </View>
                    </View>

                    <View style={styles.remainingBlock}>
                        <Text style={[styles.remainingText, isOverBudget && styles.overBudgetText]}>
                            {isOverBudget ? 'Over budget:' : 'Remaining:'}
                        </Text>

                        <Text style={[styles.remainingAmount, isOverBudget && styles.overBudgetText]}>
                            €{Math.abs(remaining).toFixed(2)}
                        </Text>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {products.map((product) => (
                        <View key={product.id} style={styles.productCard}>
                            <Image
                                source={typeof product.image === 'string' ? { uri: product.image } : product.image}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                            <View style={styles.productInfo}>
                                <View style={styles.productTopRow}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removeProductFromCart(cart.id, product.id)}
                                    >
                                        <Feather name="x" size={18} color="#111" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.productNote}>{product.note}</Text>
                                <Text style={styles.productPrice}>€{product.price.toFixed(2)}</Text>
                                <View style={styles.quantityRow}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => decreaseProductQuantity(cart.id, product.id)}
                                    >
                                        <Feather name="minus" size={16} color="#111" />
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{product.quantity}</Text>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => increaseProductQuantity(cart.id, product.id)}
                                    >
                                        <Feather name="plus" size={16} color="#111" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}

                    <View style={styles.voucherCard}>
                        <Text style={styles.voucherTitle}>Voucher code</Text>
                        <View style={styles.voucherRow}>
                            <TextInput
                                style={styles.voucherInput}
                                placeholder="Enter promo code"
                                placeholderTextColor="#8a8a8a"
                                value={voucherCode}
                                onChangeText={(text) => {
                                    setVoucherCode(text);
                                    if (voucherMessage) setVoucherMessage('');
                                }}
                            />
                            <TouchableOpacity style={styles.applyButton} onPress={handleApplyVoucher}>
                                <Text style={styles.applyButtonText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                        {voucherMessage ? (
                            <Text style={styles.voucherErrorText}>{voucherMessage}</Text>
                        ) : null}
                    </View>

                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>€{subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>VAT (included)</Text>
                            <Text style={styles.summaryValue}>€{vat.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>€{total.toFixed(2)}</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.bottomBar}>
                    <View>
                        <Text style={styles.bottomTotalLabel}>Total</Text>
                        <Text style={styles.bottomTotalValue}>€{total.toFixed(2)}</Text>
                    </View>
                    <TouchableOpacity style={styles.checkoutButton}>
                        <Text style={styles.checkoutButtonText}>Proceed to payment</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
    topRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 14,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 22, borderWidth: 1.5,
        borderColor: '#6a6a6a', justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#f3f3f3',
    },
    accountButton: {
        width: 44, height: 44, borderRadius: 22, borderWidth: 1.5,
        borderColor: '#6a6a6a', justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#f3f3f3',
    },
    rightActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    headerCard: {
        borderRadius: 18,
        paddingVertical: 8,
        paddingLeft: 4,
        paddingRight: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
        marginTop: -4,

        backgroundColor: '#f3f3f3',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },

    cartIconWrapper: {
        width: 44,
        height: 44,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginRight: 6,
    },
    headerTextBlock: {
        flexShrink: 1,
        minWidth: 0,
    },

    cartTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111',
        marginBottom: 6,
    },
    headerSubText: {
        fontSize: 15,
        color: '#5f5f5f',
        lineHeight: 21,
    },

    remainingText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#006958',
        marginBottom: 2,
        textAlign: 'center',
    },

    remainingBlock: {
        width: 120,
        marginLeft: 'auto',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 2,
    },

    remainingAmount: {
        fontSize: 25,
        fontWeight: '900',
        color: '#006958',
        lineHeight: 34,
        marginTop: 20,
    },

    overBudgetText: { color: '#df2518' },
    scrollContent: { paddingBottom: 120 },
    productCard: {
        flexDirection: 'row', backgroundColor: '#ededed', borderRadius: 18,
        padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#d6d6d6',
    },
    productImage: {
        width: 92, height: 116, borderRadius: 16,
        backgroundColor: '#ddd', marginRight: 12,
    },
    productInfo: { flex: 1, justifyContent: 'space-between' },
    productTopRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 10,
    },
    productName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111' },
    removeButton: {
        width: 28, height: 28, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e2e2',
    },
    productNote: { marginTop: 4, fontSize: 13, color: '#6a6a6a', lineHeight: 18 },
    productPrice: { marginTop: 6, fontSize: 14, fontWeight: '700', color: '#111' },
    quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    quantityButton: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: '#dedede', justifyContent: 'center', alignItems: 'center',
    },
    quantityText: {
        marginHorizontal: 14, fontSize: 15, fontWeight: '700',
        color: '#111', minWidth: 18, textAlign: 'center',
    },
    voucherCard: {
        backgroundColor: '#ededed', borderRadius: 18, padding: 16,
        marginTop: 4, marginBottom: 12, borderWidth: 1, borderColor: '#d6d6d6',
    },
    voucherTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
    voucherRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    voucherInput: {
        flex: 1, height: 48, borderRadius: 14, backgroundColor: '#f7f7f7',
        borderWidth: 1, borderColor: '#d2d2d2', paddingHorizontal: 14,
        fontSize: 14, color: '#111',
    },
    applyButton: {
        height: 48, paddingHorizontal: 18, borderRadius: 14,
        backgroundColor: '#111', justifyContent: 'center', alignItems: 'center',
    },
    applyButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    voucherErrorText: { marginTop: 10, fontSize: 13, fontWeight: '600', color: '#df2518' },
    summaryCard: {
        backgroundColor: '#ededed', borderRadius: 18, padding: 16,
        marginTop: 8, marginBottom: 20, borderWidth: 1, borderColor: '#d6d6d6',
    },
    summaryTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#5f5f5f' },
    summaryValue: { fontSize: 14, color: '#111', fontWeight: '600' },
    summaryDivider: { height: 1, backgroundColor: '#d0d0d0', marginVertical: 10 },
    totalLabel: { fontSize: 16, fontWeight: '700', color: '#111' },
    totalValue: { fontSize: 16, fontWeight: '700', color: '#111' },
    bottomBar: {
        position: 'absolute', left: 16, right: 16, bottom: 14,
        backgroundColor: '#f3f3f3', borderTopWidth: 1, borderTopColor: '#d8d8d8',
        paddingTop: 12, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', gap: 12,
    },
    bottomTotalLabel: { fontSize: 12, color: '#6a6a6a' },
    bottomTotalValue: { fontSize: 20, fontWeight: '700', color: '#111' },
    checkoutButton: {
        flex: 1, maxWidth: 210, height: 50, borderRadius: 25,
        backgroundColor: '#111', justifyContent: 'center',
        alignItems: 'center', paddingHorizontal: 18,
    },
    checkoutButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },

    backButtonPlain: {
        width: 34,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
});