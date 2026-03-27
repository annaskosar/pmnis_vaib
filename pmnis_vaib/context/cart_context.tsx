import React from 'react';

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
    getCartById: (id: string) => BudgetCart | undefined;
    increaseProductQuantity: (cartId: string, productId: string) => void;
    decreaseProductQuantity: (cartId: string, productId: string) => void;
    removeProductFromCart: (cartId: string, productId: string) => void;
    deleteCart: (cartId: string) => void;
    createCart: (name: string, budget: number) => boolean;
    updateCart: (cartId: string, name: string, budget: number) => void;
};

const CartContext = React.createContext<CartContextType | undefined>(undefined);



export function CartProvider({ children }: { children: React.ReactNode }) {
    const [carts, setCarts] = React.useState<BudgetCart[]>([
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
    ]);

    const getCartById = (id: string) => {
        return carts.find((cart) => cart.id === id);
    };

    const increaseProductQuantity = (cartId: string, productId: string) => {
        setCarts((prev) =>
            prev.map((cart) =>
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
            )
        );
    };

    const decreaseProductQuantity = (cartId: string, productId: string) => {
        setCarts((prev) =>
            prev.map((cart) =>
                cart.id === cartId
                    ? {
                        ...cart,
                        products: cart.products.map((product) =>
                            product.id === productId
                                ? {
                                    ...product,
                                    quantity: Math.max(1, product.quantity - 1),
                                }
                                : product
                        ),
                    }
                    : cart
            )
        );
    };

    const removeProductFromCart = (cartId: string, productId: string) => {
        setCarts((prev) =>
            prev.map((cart) =>
                cart.id === cartId
                    ? {
                        ...cart,
                        products: cart.products.filter(
                            (product) => product.id !== productId
                        ),
                    }
                    : cart
            )
        );
    };

    const deleteCart = (cartId: string) => {
        setCarts((prev) => prev.filter((cart) => cart.id !== cartId));
    };

    const createCart = (name: string, budget: number) => {
        const maxFreeCarts = 5;

        if (carts.length >= maxFreeCarts) {
            return false;
        }

        const newCart: BudgetCart = {
            id: Date.now().toString(),
            name,
            budget,
            products: [],
        };

        setCarts((prev) => [...prev, newCart]);
        return true;
    };

    const updateCart = (cartId: string, name: string, budget: number) => {
        setCarts((prev) =>
            prev.map((cart) =>
                cart.id === cartId
                    ? { ...cart, name, budget }
                    : cart
            )
        );
    };

    return (
        <CartContext.Provider
            value={{
                carts,
                getCartById,
                increaseProductQuantity,
                decreaseProductQuantity,
                removeProductFromCart,
                deleteCart,
                createCart,
                updateCart,
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