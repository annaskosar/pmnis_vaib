import React from 'react';

export type WardrobeItem = {
    id: string;
    image: any;
    name: string;
    additionalInfo?: string;
    isPinned?: boolean;
    pinnedAt?: number | null;
    createdAt: number;
    updatedAt?: number | null;
};

type WardrobeContextType = {
    wardrobeItems: WardrobeItem[];
    addWardrobeItem: (item: Omit<WardrobeItem, 'id'>) => void;
    getWardrobeItemById: (id: string) => WardrobeItem | undefined;
    updateWardrobeItem: (
        id: string,
        updates: Partial<Omit<WardrobeItem, 'id'>>
    ) => void;
    deleteWardrobeItem: (id: string) => void;
    togglePinWardrobeItem: (id: string) => void;
};

const WardrobeContext = React.createContext<WardrobeContextType | undefined>(undefined);



export function WardrobeProvider({ children }: { children: React.ReactNode }) {
    const [wardrobeItems, setWardrobeItems] = React.useState<WardrobeItem[]>([
        {
            id: '1',
            image: require('../assets/wardrobe_images/item1.png'),
            name: 'hneda kabelka',
            additionalInfo: '',
            isPinned: false,
            pinnedAt: null,
            createdAt: Date.now(),
            updatedAt: null,
        },
        {
            id: '2',
            image: require('../assets/wardrobe_images/item2.png'),
            name: 'modre topanky',
            additionalInfo: '',
            isPinned: false,
            pinnedAt: null,
            createdAt: Date.now(),
            updatedAt: null,
        },
        {
            id: '3',
            image: require('../assets/wardrobe_images/item3.png'),
            name: 'rifle po sestre',
            additionalInfo: '',
            isPinned: false,
            pinnedAt: null,
            createdAt: Date.now(),
            updatedAt: null,
        },
        {
            id: '4',
            image: require('../assets/wardrobe_images/item4.png'),
            name: 'letna sukna',
            additionalInfo: '',
            isPinned: false,
            pinnedAt: null,
            createdAt: Date.now(),
            updatedAt: null,
        },
        {
            id: '5',
            image: require('../assets/wardrobe_images/item5.png'),
            name: 'pruzkovane tricko',
            additionalInfo: '',
            isPinned: false,
            pinnedAt: null,
            createdAt: Date.now(),
            updatedAt: null,
        },
        {
            id: '6',
            image: require('../assets/wardrobe_images/item6.png'),
            name: 'bluzka ruzova',
            additionalInfo: '',
            isPinned: false,
            pinnedAt: null,
            createdAt: Date.now(),
            updatedAt: null,
        },
        {
            id: '7',
            image: require('../assets/wardrobe_images/item7.png'),
            name: 'fialovy top',
            additionalInfo: '',
            isPinned: false,
            pinnedAt: null,
            createdAt: Date.now(),
            updatedAt: null,
        },
        {
            id: '8',
            image: require('../assets/wardrobe_images/item8.png'),
            name: 'retro tielko',
            additionalInfo: '',
            isPinned: false,
            pinnedAt: null,
            createdAt: Date.now(),
            updatedAt: null,
        },
    ]);

    const addWardrobeItem = (item: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        setWardrobeItems(prev => [
            {
                id: Date.now().toString(),
                createdAt: Date.now(),
                updatedAt: null,
                isPinned: false,
                pinnedAt: null,
                ...item,
            },
            ...prev,
        ]);
    };

    const getWardrobeItemById = (id: string) => {
        return wardrobeItems.find(item => item.id === id);
    };

    const updateWardrobeItem = (
        id: string,
        updates: Partial<Omit<WardrobeItem, 'id' | 'createdAt'>>
    ) => {
        setWardrobeItems(prev =>
            prev.map(item =>
                item.id === id
                    ? {
                        ...item,
                        ...updates,
                        updatedAt: Date.now(),
                    }
                    : item
            )
        );
    };

    const deleteWardrobeItem = (id: string) => {
        setWardrobeItems(prev => prev.filter(item => item.id !== id));
    };

    const togglePinWardrobeItem = (id: string) => {
        setWardrobeItems(prev => {
            const targetItem = prev.find(item => item.id === id);
            if (!targetItem) return prev;

            // ak je už pinnutý -> odpin
            if (targetItem.isPinned) {
                return prev.map(item =>
                    item.id === id
                        ? { ...item, isPinned: false, pinnedAt: null }
                        : item
                );
            }

            const pinnedItems = prev.filter(item => item.isPinned);

            // ak sú menej ako 2 pinned, len pripni
            if (pinnedItems.length < 2) {
                return prev.map(item =>
                    item.id === id
                        ? { ...item, isPinned: true, pinnedAt: Date.now() }
                        : item
                );
            }

            // ak už sú 2 pinned, nájdi najstarší a nahraď ho
            const oldestPinned = [...pinnedItems].sort(
                (a, b) => (a.pinnedAt ?? 0) - (b.pinnedAt ?? 0)
            )[0];

            return prev.map(item => {
                if (item.id === oldestPinned.id) {
                    return { ...item, isPinned: false, pinnedAt: null };
                }

                if (item.id === id) {
                    return { ...item, isPinned: true, pinnedAt: Date.now() };
                }

                return item;
            });
        });
    };

    return (
        <WardrobeContext.Provider
            value={{
                wardrobeItems,
                addWardrobeItem,
                getWardrobeItemById,
                updateWardrobeItem,
                deleteWardrobeItem,
                togglePinWardrobeItem,
            }}
        >
            {children}
        </WardrobeContext.Provider>
    );
}

export function useWardrobe() {
    const context = React.useContext(WardrobeContext);

    if (!context) {
        throw new Error('useWardrobe must be used inside WardrobeProvider');
    }

    return context;
}