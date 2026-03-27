import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/cart_context';


export default function CartScreen() {
    const router = useRouter();
    const { carts, deleteCart } = useCart();


    const feedbackCount = 0;
    const maxFeedback = 30;
    const progressPercent = Math.min((feedbackCount / maxFeedback) * 100, 100);

    const handleOpenCart = (cartId: string) => {
        router.push({
            pathname: '/cart_detail',
            params: { cartId },
        });
    };

    const handleCreateCart = () => {
        router.replace('/(tabs)/cart_create');
    };

    const handleEditCart = (cartId: string) => {
        router.push({
            pathname: '/(tabs)/cart_create',
            params: { cartId },
        });
    };
    const handleDeleteCart = (cartId: string) => {
        Alert.alert(
            'Delete cart',
            'Are you sure you want to delete this cart?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteCart(cartId),
                },
            ]
        );
    };


    const renderRightActions = (cartId: string) => {
        return (
            <View style={styles.swipeActions}>
                <TouchableOpacity
                    style={[styles.swipeButton, styles.editSwipeButton]}
                    onPress={() => handleEditCart(cartId)}
                >
                    <Feather name="edit-2" size={16} color="#111" />
                    <Text style={styles.swipeButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.swipeButton, styles.deleteSwipeButton]}
                    onPress={() => handleDeleteCart(cartId)}
                >
                    <Feather name="trash-2" size={16} color="#fff" />
                    <Text style={styles.deleteSwipeButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Carts</Text>

                    <TouchableOpacity
                        style={styles.accountButton}
                        onPress={() => router.push('/(tabs)/account')}
                    >
                        <Feather name="user" size={22} color="#393939" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.createCartButton}
                    onPress={handleCreateCart}
                >
                    <Feather name="plus" size={18} color="#fff" />
                    <Text style={styles.createCartButtonText}>Create new cart</Text>
                </TouchableOpacity>

                <Text style={styles.counterText}>
                    Created carts: {carts.length}/5
                </Text>

                <ImageBackground
                    source={require('../../assets/images_app/search.png')}
                    style={styles.upgradeBanner}
                    imageStyle={styles.upgradeBannerImage}
                >
                    <View style={styles.upgradeTopRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.upgradeTitle}>☆ UPGRADE ☆</Text>
                            <Text style={styles.upgradeText}>
                                Give 30 pieces of feedback in Builder and unlock unlimited carts!
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.upgradeButton}>
                            <Feather name="lock" size={14} color="#fff" />
                            <Text style={styles.upgradeButtonText}>Unlock</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.progressSection}>
                        <View style={styles.progressLabelsRow}>
                            <Text
                                style={[
                                    styles.progressLabel,
                                    styles.progressLabelStart,
                                    { fontWeight: '900' },
                                ]}
                            >
                                0
                            </Text>

                            <Text style={[styles.progressLabel, styles.progressLabel10]}>
                                10
                            </Text>

                            <Text style={[styles.progressLabel, styles.progressLabel20]}>
                                20
                            </Text>

                            <View style={[styles.unlockLabelWrapper, styles.progressLabelEnd]}>
                                <Text style={[styles.progressLabel, { fontWeight: '900' }]}>30</Text>
                                <Feather name="unlock" size={16} color="#111" />
                            </View>
                        </View>

                        <View style={styles.progressTrackWrapper}>
                            <View style={styles.progressTrack} />
                            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />

                            <View style={[styles.tickMark, styles.tick10]} />
                            <View style={[styles.tickMark, styles.tick20]} />
                            <View style={[styles.tickMark, styles.tick30]} />

                            <View
                                style={[
                                    styles.progressMarker,
                                    { left: `${progressPercent}%` },
                                ]}
                            >
                                <Feather name="arrow-up" size={26} color="#111" />
                            </View>
                        </View>
                    </View>

                </ImageBackground>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {carts.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No carts yet
                        </Text>
                    ) : (
                        carts.map((cart) => {
                            const itemsCount = cart.products.reduce(
                                (sum, product) => sum + product.quantity,
                                0
                            );

                            const currentTotal = cart.products.reduce(
                                (sum, product) => sum + product.price * product.quantity,
                                0
                            );

                            const remaining = Number((cart.budget - currentTotal).toFixed(2));
                            const isOverBudget = remaining < 0;

                            return (
                                <Swipeable
                                    key={cart.id}
                                    renderRightActions={() => renderRightActions(cart.id)}
                                    overshootRight={false}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        style={styles.cartCard}
                                        onPress={() => handleOpenCart(cart.id)}
                                    >
                                        <View style={styles.cartIconWrapper}>
                                            <MaterialCommunityIcons
                                                name="cart-outline"
                                                size={25}
                                                color="#111"
                                            />
                                        </View>

                                        <View style={styles.cartInfo}>
                                            <Text style={styles.cartName}>{cart.name}</Text>

                                            <Text style={styles.subText}>
                                                Budget: €{cart.budget}
                                            </Text>

                                            <Text style={styles.subText}>
                                                In cart: €{currentTotal.toFixed(2)}
                                            </Text>

                                            <Text style={styles.subText}>
                                                {itemsCount} items
                                            </Text>

                                            <Text
                                                style={[
                                                    styles.remainingText,
                                                    isOverBudget && styles.overBudgetText,
                                                ]}
                                            >
                                                {isOverBudget
                                                    ? `Over budget: €${Math.abs(remaining).toFixed(2)}`
                                                    : `Remaining: €${remaining.toFixed(2)}`}
                                            </Text>
                                        </View>

                                        <Feather name="chevron-right" size={18} color="#8a8a8a" />
                                    </TouchableOpacity>
                                </Swipeable>
                            );
                        })
                    )}
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
        paddingHorizontal: 16,
        paddingTop: 10,
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },

    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#111',
    },

    accountButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#6a6a6a',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f3f3',
    },

    createCartButton: {
        height: 54,
        borderRadius: 16,
        backgroundColor: '#111',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },

    createCartButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },

    counterText: {
        fontSize: 13,
        color: '#6d6d6d',
        marginBottom: 14,
    },

    upgradeBanner: {
        minHeight: 108,
        borderRadius: 18,
        overflow: 'hidden',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 18,
        justifyContent: 'space-between',
    },

    upgradeBannerImage: {
        borderRadius: 18,
    },

    upgradeTextWrapper: {
        paddingRight: 80,
    },

    upgradeTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111',
        marginBottom: 6,
    },

    upgradeText: {
        fontSize: 13,
        lineHeight: 18,
        color: '#111',
    },

    upgradeButton: {
        backgroundColor: '#111',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 9,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    upgradeButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },

    scrollContent: {
        paddingBottom: 24,
        gap: 12,
    },

    cartCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ededed',
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: '#d6d6d6',
        marginBottom: 12,
    },

    cartIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#e4e4e4',
        borderWidth: 1,
        borderColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },

    cartInfo: {
        flex: 1,
    },

    cartName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },

    subText: {
        fontSize: 13,
        color: '#6a6a6a',
        lineHeight: 18,
    },

    remainingText: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: '700',
        color: '#006958',
    },

    overBudgetText: {
        color: '#df2518',
    },

    swipeActions: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: 12,
    },

    swipeButton: {
        width: 86,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginLeft: 8,
    },

    editSwipeButton: {
        backgroundColor: '#dedede',
    },

    deleteSwipeButton: {
        backgroundColor: '#111',
    },

    swipeButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
    },

    deleteSwipeButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
    },

    progressSection: {
        marginTop: 20,
    },

    progressLabelsRow: {
        position: 'relative',
        height: 24,
        marginBottom: 3,
        marginHorizontal: 12,
    },

    progressLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },

    progressLabelStart: {
        position: 'absolute',
        left: 0,
    },

    progressLabel10: {
        position: 'absolute',
        left: '33.33%',
        marginLeft: -12,
    },

    progressLabel20: {
        position: 'absolute',
        left: '66.66%',
        marginLeft: -12,
    },

    progressLabelEnd: {
        position: 'absolute',
        left: '100%',
        marginLeft: -30,
    },

    unlockLabelWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    progressTrackWrapper: {
        position: 'relative',
        height: 34,
        justifyContent: 'center',
        marginHorizontal: 12,
    },

    progressTrack: {
        height: 8,
        borderRadius: 999,
        backgroundColor: '#c9c9c9',
    },

    progressFill: {
        position: 'absolute',
        left: 0,
        height: 8,
        borderRadius: 999,
        backgroundColor: '#111',
    },

    progressMarker: {
        position: 'absolute',
        marginLeft: -11,
        bottom: -8,
    },

    tickMark: {
        position: 'absolute',
        width: 3,
        height: 14,
        backgroundColor: '#111',
        top: 10,
        marginLeft: -1.5,
        borderRadius: 2,
    },

    tick10: {
        left: '33.33%',
    },

    tick20: {
        left: '66.66%',
    },

    tick30: {
        left: '100%',
    },

    upgradeTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 10,
    },

    emptyText: {
        textAlign: 'center',
        marginTop: 60,
        fontSize: 16,
        fontWeight: '600',
        color: '#6a6a6a',
    },

});