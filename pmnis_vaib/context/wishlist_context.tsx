import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

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
    reloadWishlist: () => void;
};

const WishlistContext = React.createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistItems, setWishlistItems] = React.useState<WishlistItem[]>([]);
    const [userEmail, setUserEmail] = React.useState<string | null>(null);

    const loadWishlist = async () => {
        try {
            const userData = await AsyncStorage.getItem('currentUser');
            if (!userData) {
                setWishlistItems([]);
                setUserEmail(null);
                return;
            }
            const user = JSON.parse(userData);
            const email = user.email;

            // Ak sa zmenil user — vymaž starý wishlist
            setUserEmail(prev => {
                if (prev !== email) {
                    setWishlistItems([]);
                }
                return email;
            });

            const stored = await AsyncStorage.getItem(`wishlist_${email}`);
            setWishlistItems(stored ? JSON.parse(stored) : []);
        } catch (e) {
            console.log('Error loading wishlist:', e);
        }
    };

    React.useEffect(() => {
        loadWishlist();

        // Reload keď sa appka vráti do popredia
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') loadWishlist();
        });

        return () => subscription.remove();
    }, []);

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

    const isInWishlist = (id: string) => wishlistItems.some(i => i.id === id);

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
            reloadWishlist: loadWishlist,
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