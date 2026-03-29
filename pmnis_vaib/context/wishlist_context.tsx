import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WishlistItem = {
    id: string;
    name: string;
    price: number;
    image: any;
    category?: string;
    subcategory?: string;
    gender?: string;
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
    const [userEmail, setUserEmail] = React.useState<string | null>(null);

    // Načítaj email a wishlist pri štarte
    React.useEffect(() => {
        const loadWishlist = async () => {
            try {
                const userData = await AsyncStorage.getItem('currentUser');
                if (!userData) return;
                const user = JSON.parse(userData);
                const email = user.email;
                setUserEmail(email);

                const stored = await AsyncStorage.getItem(`wishlist_${email}`);
                if (stored) {
                    setWishlistItems(JSON.parse(stored));
                }
            } catch (e) {
                console.log('Error loading wishlist:', e);
            }
        };
        loadWishlist();
    }, []);

    // Ulož wishlist pri každej zmene
    const saveWishlist = async (items: WishlistItem[], email: string | null) => {
        if (!email) return;
        try {
            await AsyncStorage.setItem(`wishlist_${email}`, JSON.stringify(items));
        } catch (e) {
            console.log('Error saving wishlist:', e);
        }
    };

    const addToWishlist = (item: WishlistItem) => {
        setWishlistItems(prev => {
            if (prev.find(i => i.id === item.id)) return prev;
            const updated = [...prev, item];
            saveWishlist(updated, userEmail);
            return updated;
        });
    };

    const removeFromWishlist = (id: string) => {
        setWishlistItems(prev => {
            const updated = prev.filter(i => i.id !== id);
            saveWishlist(updated, userEmail);
            return updated;
        });
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