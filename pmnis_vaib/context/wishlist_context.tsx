import React from 'react';

export type WishlistItem = {
    id: string;
    name: string;
    price: number;
    image: any;
};

type WishlistContextType = {
    wishlistItems: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
    isInWishlist: (id: string) => boolean;
    toggleWishlist: (item: WishlistItem) => void;
};

const WishlistContext = React.createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistItems, setWishlistItems] = React.useState<WishlistItem[]>([]);

    const addToWishlist = (item: WishlistItem) => {
        setWishlistItems(prev => {
            if (prev.find(i => i.id === item.id)) return prev;
            return [...prev, item];
        });
    };

    const removeFromWishlist = (id: string) => {
        setWishlistItems(prev => prev.filter(i => i.id !== id));
    };

    const isInWishlist = (id: string) => {
        return wishlistItems.some(i => i.id === id);
    };

    const toggleWishlist = (item: WishlistItem) => {
        if (isInWishlist(item.id)) {
            removeFromWishlist(item.id);
        } else {
            addToWishlist(item);
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = React.useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used inside WishlistProvider');
    return context;
}