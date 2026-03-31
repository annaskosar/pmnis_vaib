import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WardrobeCategory = 'shoes' | 'pants' | 'top' | 'jacket' | 'dress' | 'other';

export type WardrobeItem = {
    id: string;
    image: any;
    name: string;
    category?: WardrobeCategory;
    additionalInfo?: string;
    isPinned?: boolean;
    pinnedAt?: number | null;
    createdAt: number;
    updatedAt?: number | null;
    color?: string | null;
    shade?: 'Light' | 'Medium' | 'Dark' | null;
};

type WardrobeContextType = {
    wardrobeItems: WardrobeItem[];
    addWardrobeItem: (item: Omit<WardrobeItem, 'id'>) => void;
    getWardrobeItemById: (id: string) => WardrobeItem | undefined;
    updateWardrobeItem: (id: string, updates: Partial<Omit<WardrobeItem, 'id'>>) => void;
    deleteWardrobeItem: (id: string) => void;
    togglePinWardrobeItem: (id: string) => void;
};

const WardrobeContext = React.createContext<WardrobeContextType | undefined>(undefined);

const DEFAULT_ITEMS: WardrobeItem[] = [
    {
        id: '1',
        image: require('../assets/wardrobe_images/item1.png'),
        name: 'hneda kabelka',
        category: 'other',
        additionalInfo: '',
        isPinned: false,
        pinnedAt: null,
        createdAt: Date.now(),
        updatedAt: null,
        color: 'Brown',
        shade: "Dark",
    },
    {
        id: '2',
        image: require('../assets/wardrobe_images/item2.png'),
        name: 'modre topanky',
        category: 'shoes',
        additionalInfo: '',
        isPinned: false,
        pinnedAt: null,
        createdAt: Date.now(),
        updatedAt: null,
        color: 'Blue',
        shade: "Light",
    },
    {
        id: '3',
        image: require('../assets/wardrobe_images/item3.png'),
        name: 'rifle po sestre',
        category: 'pants',
        additionalInfo: '',
        isPinned: false,
        pinnedAt: null,
        createdAt: Date.now(),
        updatedAt: null,
        color: 'Blue',
        shade: "Dark",
    },
    {
        id: '4',
        image: require('../assets/wardrobe_images/item4.png'),
        name: 'letna sukna',
        category: 'pants',
        additionalInfo: '',
        isPinned: false,
        pinnedAt: null,
        createdAt: Date.now(),
        updatedAt: null,
        color: 'Pink',
        shade: "Light",
    },
    {
        id: '5',
        image: require('../assets/wardrobe_images/item5.png'),
        name: 'pruzkovane tricko',
        category: 'top',
        additionalInfo: '',
        isPinned: false,
        pinnedAt: null,
        createdAt: Date.now(),
        updatedAt: null,
        color: 'Grey',
        shade: "Medium",
    },
    {
        id: '6',
        image: require('../assets/wardrobe_images/item6.png'),
        name: 'bluzka ruzova',
        category: 'top',
        additionalInfo: '',
        isPinned: false,
        pinnedAt: null,
        createdAt: Date.now(),
        updatedAt: null,
        color: 'White',
        shade: "Light"
    },
    {
        id: '7',
        image: require('../assets/wardrobe_images/item7.png'),
        name: 'fialovy top',
        category: 'top',
        additionalInfo: '',
        isPinned: false,
        pinnedAt: null,
        createdAt: Date.now(),
        updatedAt: null,
        color: 'Purple',
        shade: "Dark",
    },
    {
        id: '8',
        image: require('../assets/wardrobe_images/item8.png'),
        name: 'retro tielko',
        category: 'top',
        additionalInfo: '',
        isPinned: false,
        pinnedAt: null,
        createdAt: Date.now(),
        updatedAt: null,
        color: 'Yellow',
        shade: "Light",
    },
];

const TEST_EMAIL = 'test@test.com';

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
    const [wardrobeItems, setWardrobeItems] = React.useState<WardrobeItem[]>([]);
    const [userEmail, setUserEmail] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadWardrobe = async () => {
            const userData = await AsyncStorage.getItem('currentUser');
            if (!userData) return;

            const user = JSON.parse(userData);
            setUserEmail(user.email);

            const isTestAccount = user.email === TEST_EMAIL;
            const key = `wardrobe_${user.email}`;
            const saved = await AsyncStorage.getItem(key);

            if (saved) {
                const savedItems = JSON.parse(saved);
                const defaultIds = ['1', '2', '3', '4', '5', '6', '7', '8'];
                const userAddedItems = savedItems.filter(
                    (i: WardrobeItem) => !defaultIds.includes(i.id)
                );

                if (isTestAccount) {
                    const savedDefaultItems = DEFAULT_ITEMS.map(def => {
                        const s = savedItems.find((si: WardrobeItem) => si.id === def.id);
                        return s ? { ...def, ...s, image: def.image } : def;
                    });
                    setWardrobeItems([...userAddedItems, ...savedDefaultItems]);
                } else {
                    setWardrobeItems(userAddedItems);
                }
            } else {
                setWardrobeItems(isTestAccount ? DEFAULT_ITEMS : []);
            }
        };

        loadWardrobe();
    }, []);

    const saveWardrobe = async (items: WardrobeItem[], email: string | null) => {
        if (!email) return;
        const key = `wardrobe_${email}`;
        const toSave = items.map(item => ({
            ...item,
            image: typeof item.image === 'string' ? item.image : null,
        }));
        await AsyncStorage.setItem(key, JSON.stringify(toSave));
    };

    const updateItems = (newItems: WardrobeItem[]) => {
        setWardrobeItems(newItems);
        saveWardrobe(newItems, userEmail);
    };

    const addWardrobeItem = (item: Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newItems = [
            {
                id: Date.now().toString(),
                createdAt: Date.now(),
                updatedAt: null,
                isPinned: false,
                pinnedAt: null,
                ...item,
            },
            ...wardrobeItems,
        ];
        updateItems(newItems);
    };

    const getWardrobeItemById = (id: string) => {
        return wardrobeItems.find(item => item.id === id);
    };

    const updateWardrobeItem = (
        id: string,
        updates: Partial<Omit<WardrobeItem, 'id' | 'createdAt'>>
    ) => {
        const newItems = wardrobeItems.map(item =>
            item.id === id
                ? { ...item, ...updates, updatedAt: Date.now() }
                : item
        );
        updateItems(newItems);
    };

    const deleteWardrobeItem = (id: string) => {
        const newItems = wardrobeItems.filter(item => item.id !== id);
        updateItems(newItems);
    };

    const togglePinWardrobeItem = (id: string) => {
        const targetItem = wardrobeItems.find(item => item.id === id);
        if (!targetItem) return;

        let newItems: WardrobeItem[];

        if (targetItem.isPinned) {
            newItems = wardrobeItems.map(item =>
                item.id === id ? { ...item, isPinned: false, pinnedAt: null } : item
            );
        } else {
            const pinnedItems = wardrobeItems.filter(item => item.isPinned);

            if (pinnedItems.length < 2) {
                newItems = wardrobeItems.map(item =>
                    item.id === id
                        ? { ...item, isPinned: true, pinnedAt: Date.now() }
                        : item
                );
            } else {
                const oldestPinned = [...pinnedItems].sort(
                    (a, b) => (a.pinnedAt ?? 0) - (b.pinnedAt ?? 0)
                )[0];

                newItems = wardrobeItems.map(item => {
                    if (item.id === oldestPinned.id) return { ...item, isPinned: false, pinnedAt: null };
                    if (item.id === id) return { ...item, isPinned: true, pinnedAt: Date.now() };
                    return item;
                });
            }
        }

        updateItems(newItems);
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