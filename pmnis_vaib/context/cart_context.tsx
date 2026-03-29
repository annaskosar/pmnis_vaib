import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartProduct = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: any;
    note: string;
};

export type BudgetCart = {
    id: string;
    name: string;
    budget: number;
    products: CartProduct[];
};

type CartContextType = {
    carts: BudgetCart[];
    builderFeedbackCount: number;
    isCartLoading: boolean;
    getCartById: (id: string) => BudgetCart | undefined;
    increaseProductQuantity: (cartId: string, productId: string) => void;
    decreaseProductQuantity: (cartId: string, productId: string) => void;
    removeProductFromCart: (cartId: string, productId: string) => void;
    deleteCart: (cartId: string) => void;
    createCart: (name: string, budget: number) => BudgetCart | null;
    updateCart: (cartId: string, name: string, budget: number) => void;
    addProductToCart: (cartId: string, product: CartProduct) => void;
    addBuilderFeedback: () => void;
    isUnlimitedUnlocked: boolean;
};

const CartContext = React.createContext<CartContextType | undefined>(undefined);

const TEST_EMAIL = 'test@test.com';

const DEFAULT_CARTS: BudgetCart[] = [
    {
        id: '1',
        name: 'Summer outfits',
        budget: 250,
        products: [
            {
                id: '1',
                name: 'Oversized denim jacket',
                price: 79.99,
                quantity: 1,
                image: require('../assets/images_app/model1.png'),
                note: 'Blue denim, relaxed fit',
            },
            {
                id: '2',
                name: 'Spring mini dress',
                price: 49.99,
                quantity: 2,
                image: require('../assets/images_app/model2.png'),
                note: 'Soft material, light beige',
            },
        ],
    },
    {
        id: '2',
        name: 'Christmas darceky',
        budget: 180,
        products: [
            {
                id: '3',
                name: 'Classic sneakers',
                price: 89.99,
                quantity: 1,
                image: require('../assets/images_app/model3.png'),
                note: 'Everyday wear, white',
            },
        ],
    },
    {
        id: '3',
        name: 'Capsule wardrobe',
        budget: 400,
        products: [
            {
                id: '4',
                name: 'Minimal coat',
                price: 120,
                quantity: 1,
                image: require('../assets/images_app/model1.png'),
                note: 'Cream beige, long fit',
            },
        ],
    },
];

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [carts, setCarts] = React.useState<BudgetCart[]>([]);
    const [userEmail, setUserEmail] = React.useState<string | null>(null);
    const [builderFeedbackCount, setBuilderFeedbackCount] = React.useState(0);

    const [isCartLoading, setIsCartLoading] = React.useState(true);

    React.useEffect(() => {
        const loadData = async () => {
            const userData = await AsyncStorage.getItem('currentUser');

            if (!userData) {
                setIsCartLoading(false);
                return;
            }

            const user = JSON.parse(userData);
            setUserEmail(user.email);

            const isTestAccount = user.email === TEST_EMAIL;

            const cartsKey = `carts_${user.email}`;
            const feedbackKey = `builderFeedback_${user.email}`;

            const savedCartsRaw = await AsyncStorage.getItem(cartsKey);
            const savedFeedbackRaw = await AsyncStorage.getItem(feedbackKey);

            setBuilderFeedbackCount(savedFeedbackRaw ? JSON.parse(savedFeedbackRaw) : 0);

            if (savedCartsRaw) {
                const savedCarts = JSON.parse(savedCartsRaw);

                if (isTestAccount) {
                    const defaultIds = ['1', '2', '3'];
                    const userCarts = savedCarts.filter((c: BudgetCart) => !defaultIds.includes(c.id));

                    const defaultCarts = DEFAULT_CARTS.map(def => {
                        const saved = savedCarts.find((s: BudgetCart) => s.id === def.id);
                        if (!saved) return def;

                        return {
                            ...saved,
                            products: saved.products.map((p: CartProduct, i: number) => ({
                                ...p,
                                image: def.products[i]?.image ?? p.image,
                            })),
                        };
                    });

                    setCarts([...userCarts, ...defaultCarts]);
                } else {
                    setCarts(savedCarts);
                }
            } else {
                setCarts(isTestAccount ? DEFAULT_CARTS : []);
            }

            setIsCartLoading(false);
        };

        loadData();
    }, []);

    const saveCarts = async (newCarts: BudgetCart[], email: string | null) => {
        if (!email) return;

        const key = `carts_${email}`;

        const toSave = newCarts.map(cart => ({
            ...cart,
            products: cart.products.map(p => ({
                ...p,
                image: typeof p.image === 'string' ? p.image : null,
            })),
        }));

        await AsyncStorage.setItem(key, JSON.stringify(toSave));
    };

    const saveBuilderFeedbackCount = async (count: number, email: string | null) => {
        if (!email) return;
        const key = `builderFeedback_${email}`;
        await AsyncStorage.setItem(key, JSON.stringify(count));
    };

    const updateCarts = (newCarts: BudgetCart[]) => {
        setCarts(newCarts);
        saveCarts(newCarts, userEmail);
    };

    const getCartById = (id: string) => {
        return carts.find((cart) => cart.id === id);
    };

    const increaseProductQuantity = (cartId: string, productId: string) => {
        const newCarts = carts.map((cart) =>
            cart.id === cartId
                ? {
                    ...cart,
                    products: cart.products.map((product) =>
                        product.id === productId
                            ? { ...product, quantity: product.quantity + 1 }
                            : product
                    ),
                }
                : cart
        );
        updateCarts(newCarts);
    };

    const decreaseProductQuantity = (cartId: string, productId: string) => {
        const newCarts = carts.map((cart) =>
            cart.id === cartId
                ? {
                    ...cart,
                    products: cart.products.map((product) =>
                        product.id === productId
                            ? { ...product, quantity: Math.max(1, product.quantity - 1) }
                            : product
                    ),
                }
                : cart
        );
        updateCarts(newCarts);
    };

    const removeProductFromCart = (cartId: string, productId: string) => {
        const newCarts = carts.map((cart) =>
            cart.id === cartId
                ? { ...cart, products: cart.products.filter((product) => product.id !== productId) }
                : cart
        );
        updateCarts(newCarts);
    };


    const deleteCart = (cartId: string) => {
        const newCarts = carts.filter((cart) => cart.id !== cartId);
        updateCarts(newCarts);
    };

    const createCart = (name: string, budget: number) => {
        if (!isUnlimitedUnlocked && carts.length >= 5) return null;

        const newCart: BudgetCart = {
            id: Date.now().toString(),
            name,
            budget,
            products: [],
        };

        updateCarts([...carts, newCart]);
        return newCart;
    };

    const updateCart = (cartId: string, name: string, budget: number) => {
        const newCarts = carts.map((cart) =>
            cart.id === cartId ? { ...cart, name, budget } : cart
        );
        updateCarts(newCarts);
    };

    const addProductToCart = (cartId: string, product: CartProduct) => {
        const newCarts = carts.map((cart) => {
            if (cart.id !== cartId) return cart;

            const existingProduct = cart.products.find((p) => p.id === product.id);

            if (existingProduct) {
                return {
                    ...cart,
                    products: cart.products.map((p) =>
                        p.id === product.id
                            ? { ...p, quantity: p.quantity + product.quantity }
                            : p
                    ),
                };
            }

            return { ...cart, products: [...cart.products, product] };
        });

        updateCarts(newCarts);
    };

    const isUnlimitedUnlocked = builderFeedbackCount >= 30;

    const addBuilderFeedback = () => {
        const newCount = Math.min(builderFeedbackCount + 1, 30);
        setBuilderFeedbackCount(newCount);
        saveBuilderFeedbackCount(newCount, userEmail);
    };



    return (
        <CartContext.Provider
            value={{
                carts,
                builderFeedbackCount,
                isCartLoading,
                getCartById,
                increaseProductQuantity,
                decreaseProductQuantity,
                removeProductFromCart,
                deleteCart,
                createCart,
                updateCart,
                addProductToCart,
                addBuilderFeedback,
                isUnlimitedUnlocked,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = React.useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used inside CartProvider');
    }

    return context;
}

