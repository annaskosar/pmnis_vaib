import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCart } from '../context/cart_context';

export default function PaymentScreen() {
    const router = useRouter();
    const { cartId } = useLocalSearchParams();
    const { carts, getCartById, deleteCart, isCartLoading } = useCart();


    const parsedCartId =
        typeof cartId === 'string'
            ? cartId
            : Array.isArray(cartId)
                ? cartId[0]
                : '';
    const isEditMode = !!parsedCartId;
    const cart = isEditMode ? getCartById(parsedCartId) : undefined;

    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [showCvv, setShowCvv] = useState(false);

    const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express' | 'pickup'>('standard');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('');


    console.log('PAYMENT cartId raw:', cartId);
    console.log('PAYMENT parsedCartId:', parsedCartId);
    console.log('PAYMENT carts ids:', carts.map(c => c.id));
    console.log('PAYMENT found cart:', cart);

    const deliveryOptions = [
        { id: 'standard', label: 'Standard delivery', subtitle: '3–5 business days', price: 3.99 },
        { id: 'express', label: 'Express delivery', subtitle: '1–2 business days', price: 9.99 },
        { id: 'pickup', label: 'Pick up in store', subtitle: 'Free', price: 0 },
    ];

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '').slice(0, 16);
        return cleaned.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (text: string) => {
        const cleaned = text.replace(/\D/g, '').slice(0, 4);
        if (cleaned.length >= 3) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        return cleaned;
    };

    const selectedDelivery = deliveryOptions.find(d => d.id === deliveryMethod)!;
    const itemsTotal = cart?.products.reduce((sum, p) => sum + p.price * p.quantity, 0) ?? 0;
    const deliveryPrice = selectedDelivery.price;
    const total = itemsTotal + deliveryPrice;
    const vat = total * (20 / 120);

    const handlePay = () => {
        if (!cardNumber || !cardName || !expiry || !cvv) {
            Alert.alert('Error', 'Please fill in all card details.');
            return;
        }
        if (deliveryMethod !== 'pickup' && (!street || !city || !zip || !country)) {
            Alert.alert('Error', 'Please fill in your delivery address.');
            return;
        }

        Alert.alert(
            'Order confirmed! 🎉',
            `Your order has been placed successfully.\nTotal: €${total.toFixed(2)}`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        deleteCart(parsedCartId);
                        router.replace('/(tabs)/home');
                    },
                },
            ]
        );
    };



    if (isCartLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111' }}>
                        Loading cart...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!cart) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#111' }}>Cart not found</Text>
                    <TouchableOpacity style={styles.payButton} onPress={() => router.back()}>
                        <Text style={styles.payButtonText}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Feather name="arrow-left" size={24} color="#111" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Payment</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Order summary */}
                        <Text style={styles.sectionTitle}>Order summary</Text>
                        <View style={styles.card}>
                            {cart.products.map(product => (
                                <View key={product.id} style={styles.summaryRow}>
                                    <Text style={styles.summaryName} numberOfLines={1}>
                                        {product.name}
                                    </Text>
                                    <Text style={styles.summaryQty}>x{product.quantity}</Text>
                                    <Text style={styles.summaryPrice}>
                                        €{(product.price * product.quantity).toFixed(2)}
                                    </Text>
                                </View>
                            ))}
                            <View style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery</Text>
                                <Text style={styles.summaryPrice}>
                                    {deliveryPrice === 0 ? 'Free' : `€${deliveryPrice.toFixed(2)}`}
                                </Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>VAT (included)</Text>
                                <Text style={styles.summaryPrice}>€{vat.toFixed(2)}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalValue}>€{total.toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Delivery method */}
                        <Text style={styles.sectionTitle}>Delivery method</Text>
                        <View style={styles.card}>
                            {deliveryOptions.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={styles.deliveryOption}
                                    onPress={() => setDeliveryMethod(option.id as any)}
                                >
                                    <View style={styles.deliveryLeft}>
                                        <View style={[
                                            styles.radioOuter,
                                            deliveryMethod === option.id && styles.radioOuterActive,
                                        ]}>
                                            {deliveryMethod === option.id && (
                                                <View style={styles.radioInner} />
                                            )}
                                        </View>
                                        <View>
                                            <Text style={styles.deliveryLabel}>{option.label}</Text>
                                            <Text style={styles.deliverySubtitle}>{option.subtitle}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.deliveryPrice}>
                                        {option.price === 0 ? 'Free' : `€${option.price.toFixed(2)}`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Delivery address */}
                        {deliveryMethod !== 'pickup' && (
                            <>
                                <Text style={styles.sectionTitle}>Delivery address</Text>
                                <View style={styles.card}>
                                    <View style={styles.inputWrapper}>
                                        <Feather name="map-pin" size={16} color="#999" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Street and number"
                                            placeholderTextColor="#999"
                                            value={street}
                                            onChangeText={setStreet}
                                        />
                                    </View>
                                    <View style={styles.inputRow}>
                                        <View style={[styles.inputWrapper, { flex: 1 }]}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="City"
                                                placeholderTextColor="#999"
                                                value={city}
                                                onChangeText={setCity}
                                            />
                                        </View>
                                        <View style={[styles.inputWrapper, { width: 100 }]}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="ZIP"
                                                placeholderTextColor="#999"
                                                value={zip}
                                                onChangeText={setZip}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <Feather name="globe" size={16} color="#999" />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Country"
                                            placeholderTextColor="#999"
                                            value={country}
                                            onChangeText={setCountry}
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        {/* Card details */}
                        <Text style={styles.sectionTitle}>Card details</Text>
                        <View style={styles.card}>
                            <View style={styles.inputWrapper}>
                                <Feather name="credit-card" size={16} color="#999" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Card number"
                                    placeholderTextColor="#999"
                                    value={cardNumber}
                                    onChangeText={text => setCardNumber(formatCardNumber(text))}
                                    keyboardType="numeric"
                                    maxLength={19}
                                />
                            </View>
                            <View style={styles.inputWrapper}>
                                <Feather name="user" size={16} color="#999" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Cardholder name"
                                    placeholderTextColor="#999"
                                    value={cardName}
                                    onChangeText={setCardName}
                                    autoCapitalize="words"
                                />
                            </View>
                            <View style={styles.inputRow}>
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <Feather name="calendar" size={16} color="#999" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="MM/YY"
                                        placeholderTextColor="#999"
                                        value={expiry}
                                        onChangeText={text => setExpiry(formatExpiry(text))}
                                        keyboardType="numeric"
                                        maxLength={5}
                                    />
                                </View>
                                <View style={[styles.inputWrapper, { width: 120 }]}>
                                    <Feather name="lock" size={16} color="#999" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="CVV"
                                        placeholderTextColor="#999"
                                        value={cvv}
                                        onChangeText={text => setCvv(text.replace(/\D/g, '').slice(0, 4))}
                                        keyboardType="numeric"
                                        secureTextEntry={!showCvv}
                                        maxLength={4}
                                    />
                                    <TouchableOpacity onPress={() => setShowCvv(p => !p)}>
                                        <Feather name={showCvv ? 'eye-off' : 'eye'} size={16} color="#999" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
                            <Feather name="lock" size={16} color="#fff" />
                            <Text style={styles.payButtonText}>PAY €{total.toFixed(2)}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
    headerRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 16,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#f3f3f3',
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
    scrollContent: { paddingBottom: 40 },
    sectionTitle: {
        fontSize: 16, fontWeight: '700', color: '#111',
        marginBottom: 10, marginTop: 16,
    },
    card: {
        backgroundColor: '#ededed', borderRadius: 18,
        padding: 14, borderWidth: 1, borderColor: '#d6d6d6', gap: 10,
    },
    summaryRow: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryName: { flex: 1, fontSize: 14, color: '#111', fontWeight: '500' },
    summaryQty: { fontSize: 13, color: '#8a8a8a', marginHorizontal: 8 },
    summaryPrice: { fontSize: 14, color: '#111', fontWeight: '600' },
    summaryLabel: { flex: 1, fontSize: 14, color: '#5f5f5f' },
    totalLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111' },
    totalValue: { fontSize: 16, fontWeight: '700', color: '#111' },
    divider: { height: 1, backgroundColor: '#d0d0d0' },
    deliveryOption: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', paddingVertical: 4,
    },
    deliveryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    radioOuter: {
        width: 20, height: 20, borderRadius: 10,
        borderWidth: 2, borderColor: '#aaa',
        justifyContent: 'center', alignItems: 'center',
    },
    radioOuterActive: { borderColor: '#111' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#111' },
    deliveryLabel: { fontSize: 14, fontWeight: '600', color: '#111' },
    deliverySubtitle: { fontSize: 12, color: '#8a8a8a', marginTop: 2 },
    deliveryPrice: { fontSize: 14, fontWeight: '600', color: '#111' },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f3f3f3', borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 13, gap: 10,
    },
    input: { flex: 1, fontSize: 15, color: '#111' },
    inputRow: { flexDirection: 'row', gap: 10 },
    payButton: {
        backgroundColor: '#111', borderRadius: 20,
        paddingVertical: 16, marginTop: 24,
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8,
    },
    payButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});