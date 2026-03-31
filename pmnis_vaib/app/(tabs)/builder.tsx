import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TextInput, TouchableOpacity, Image, Modal, FlatList, ImageBackground, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useWardrobe } from '../../context/wardrobe_context';
import { useCart } from '../../context/cart_context';
import { useWishlist } from '../../context/wishlist_context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productImages } from '../../context/product_images';
import { Swipeable } from 'react-native-gesture-handler';
import { useProducts } from '../../context/product_context';

const PRESET_PROMPTS = [
    { label: '🌙 Elegant evening', value: 'elegant evening formal night' },
    { label: '🌸 Spring casual', value: 'spring casual cozy jacket everyday' },
    { label: '💼 Office', value: 'office formal elegant smart work' },
    { label: '🎉 Party', value: 'party night dressy fun' },
];

const FEEDBACK_CHIPS = [
    'Wrong style', 'Not my size', 'Needs more color',
    'Too similar', 'Not my taste', 'Not seasonal',
];

const ONBOARDING_STEPS_BEFORE = [
    { title: 'Sources 👗', description: 'Choose where to get outfit items from — your Wardrobe, Wishlist, or the Shop.', phase: 'before' as const },
    { title: 'Describe your style ✨', description: 'Pick a preset vibe or type your own — "casual summer", "office look", anything you like!', phase: 'before' as const },
    { title: 'Generate your outfit 🎯', description: "Hit this button and we'll build a full outfit for you. You can regenerate as many times as you want!", phase: 'before' as const },
];

const ONBOARDING_STEPS_AFTER = [
    { title: 'Your outfit results 👀', description: 'Tap this item to see its full details — either in the Shop or your Wardrobe.', phase: 'after' as const },
    { title: 'Shop vs My item 🏷️', description: 'This badge shows where the item comes from. "Shop" means you can buy it, "My item" means it is already in your wardrobe.', phase: 'after' as const },
    { title: 'Swap single items 🔄', description: 'Use this refresh button to swap only this one item while keeping the rest of the outfit.', phase: 'after' as const },
];

const SUBCATEGORY_TO_BUILDER_CATEGORY: Record<string, string> = {
    'Tops': 'top', 'Shirts': 'top', 'Hoodies': 'top', 'Workout tops': 'top',
    'Jeans': 'pants', 'Trousers': 'pants', 'Leggings': 'pants', 'Joggers': 'pants',
    'Jackets': 'jacket', 'Coats': 'coat',
    'Mini dresses': 'dress', 'Maxi dresses': 'dress', 'Party dresses': 'dress',
    'Casual dresses': 'dress', 'Evening dresses': 'dress', 'Floral dresses': 'dress',
    'Sneakers': 'shoes', 'Boots': 'shoes', 'Heels': 'shoes',
    'Sandals': 'shoes', 'Flats': 'shoes', 'Running shoes': 'shoes',
    'Gym sets': 'set', 'Bags': 'bag',
};

const SUBCATEGORY_STYLE_TAGS: Record<string, string[]> = {
    'Tops': ['casual', 'everyday', 'basic', 'top', 'summer'],
    'Shirts': ['casual', 'elegant', 'office', 'formal', 'shirt', 'classic'],
    'Jeans': ['casual', 'denim', 'everyday', 'pants', 'relaxed', 'summer'],
    'Trousers': ['elegant', 'office', 'formal', 'pants', 'smart', 'classic'],
    'Jackets': ['casual', 'jacket', 'layering', 'spring', 'autumn', 'streetwear', 'elegant', 'formal'],
    'Coats': ['elegant', 'winter', 'coat', 'warm', 'classic', 'autumn', 'outerwear'],
    'Hoodies': ['casual', 'sport', 'cozy', 'streetwear', 'relaxed', 'everyday'],
    'Sneakers': ['casual', 'sport', 'shoes', 'everyday', 'relaxed', 'summer', 'spring'],
    'Boots': ['elegant', 'autumn', 'winter', 'shoes', 'boots', 'classic'],
    'Heels': ['elegant', 'formal', 'evening', 'party', 'shoes', 'dressy', 'night'],
    'Sandals': ['summer', 'casual', 'shoes', 'warm'],
    'Flats': ['casual', 'everyday', 'shoes', 'comfortable', 'spring'],
    'Running shoes': ['sport', 'sporty', 'gym', 'workout', 'shoes', 'active'],
    'Mini dresses': ['party', 'summer', 'casual', 'dress', 'fun', 'night', 'dressy'],
    'Maxi dresses': ['elegant', 'summer', 'boho', 'dress', 'flowy'],
    'Party dresses': ['party', 'elegant', 'evening', 'night', 'dress', 'dressy', 'fun'],
    'Casual dresses': ['casual', 'everyday', 'summer', 'dress', 'relaxed', 'spring'],
    'Evening dresses': ['elegant', 'formal', 'evening', 'gala', 'dress', 'dressy', 'night'],
    'Floral dresses': ['summer', 'boho', 'casual', 'dress', 'floral', 'feminine', 'spring'],
    'Leggings': ['sport', 'sporty', 'gym', 'workout', 'casual', 'active'],
    'Sports bras': ['sport', 'sporty', 'gym', 'workout', 'active'],
    'Workout tops': ['sport', 'sporty', 'gym', 'workout', 'top', 'active'],
    'Joggers': ['sport', 'casual', 'cozy', 'pants', 'relaxed', 'sporty'],
    'Gym sets': ['sport', 'sporty', 'gym', 'workout', 'set', 'active'],
    'Bags': ['bag', 'accessory', 'everyday'],
};

const PLAYGROUND_TO_STYLE_TAGS: Record<string, string[]> = {
    'goth': ['dark', 'elegant', 'black', 'evening', 'edgy'],
    'grunge_rebel': ['casual', 'streetwear', 'edgy', 'relaxed'],
    'y2k_glam': ['party', 'trendy', 'colorful', 'fun', 'dressy'],
    'street_cool': ['casual', 'streetwear', 'urban', 'everyday'],
    'clean_girl': ['minimal', 'casual', 'everyday', 'basic', 'classic', 'spring'],
    'old_money': ['elegant', 'formal', 'classic', 'office', 'smart'],
    'dark_academia': ['elegant', 'formal', 'autumn', 'classic', 'smart'],
    'coquette_soft': ['soft', 'feminine', 'casual', 'pink', 'romantic', 'spring'],
};

type Source = 'wardrobe' | 'wishlist' | 'shop';
type OutfitItem = {
    id: string; image: any; name: string; category?: string;
    tags: string[]; fromWardrobe?: boolean; imageKey?: string;
};
type ScoredItem = OutfitItem & { score: number };
type OnboardingPhase = 'before' | 'after' | null;
type SlotCategory = 'shoes' | 'pants' | 'top' | 'jacket';
const SLOT_CATEGORIES: SlotCategory[] = ['shoes', 'pants', 'top', 'jacket'];

// Gender-aware shop products hook
function useShopProducts(userGender: 'women' | 'men'): OutfitItem[] {
    const { products } = useProducts();
    return React.useMemo(() => {
        return products
            .filter(p => p.gender === userGender && (p.images?.length > 0 || p.availableColors?.[0]?.imageKeys?.length > 0))
            .map(p => {
                const imageKey = p.availableColors?.[0]?.imageKeys?.[0] ?? p.images?.[0];
                if (!imageKey || !productImages[imageKey]) return null;
                const builderCategory = SUBCATEGORY_TO_BUILDER_CATEGORY[p.subCategory] ?? p.subCategory.toLowerCase();
                const colorTags = p.availableColors.map(c => c.name.toLowerCase());
                const subCategoryTags = SUBCATEGORY_STYLE_TAGS[p.subCategory] ?? [];
                const playgroundTags = (p.playgroundStyles ?? []).flatMap(s => PLAYGROUND_TO_STYLE_TAGS[s] ?? []);
                return {
                    id: p.id, name: p.name, image: productImages[imageKey], imageKey,
                    category: builderCategory,
                    tags: [p.name.toLowerCase(), p.brand?.toLowerCase() ?? '', p.subCategory.toLowerCase(), builderCategory, ...colorTags, ...subCategoryTags, ...playgroundTags],
                    fromWardrobe: false,
                } as OutfitItem;
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }, [products, userGender]);
}

export default function BuilderScreen() {
    const router = useRouter();
    const { returnToBuilder, preselectedProductId, preselectedProductName, preselectedProductImageKey, preselectedProductCategory, builderPresetIds, builderPresetTitle } = useLocalSearchParams();

    const { wardrobeItems } = useWardrobe();
    const { getProductById } = useProducts();
    const { carts, addProductToCart, addBuilderFeedback, isUnlimitedUnlocked, deleteCart } = useCart();
    const { wishlistItems } = useWishlist();

    // Gender state — načíta sa z userProfile
    const [userGender, setUserGender] = useState<'women' | 'men'>('women');

    const shopProducts = useShopProducts(userGender);

    const [prompt, setPrompt] = useState('');
    const [sources, setSources] = useState<Source[]>(['shop']);
    const [outfits, setOutfits] = useState<OutfitItem[]>([]);
    const [generated, setGenerated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [generateError, setGenerateError] = useState(false);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [sheetSource, setSheetSource] = useState<Source | null>(null);
    const [selectedItems, setSelectedItems] = useState<OutfitItem[]>([]);
    const [cartModalVisible, setCartModalVisible] = useState(false);
    const [manualPickerVisible, setManualPickerVisible] = useState(false);
    const [manualPickerItems, setManualPickerItems] = useState<OutfitItem[]>([]);
    const [manualPickerTab, setManualPickerTab] = useState<'shop' | 'wardrobe'>('shop');
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackHoverRating, setFeedbackHoverRating] = useState(0);
    const [selectedChips, setSelectedChips] = useState<string[]>([]);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [hasShownFeedback, setHasShownFeedback] = useState(false);
    const [rewardModalVisible, setRewardModalVisible] = useState(false);
    const [inlineFeedbackRating, setInlineFeedbackRating] = useState(0);
    const [inlineFeedbackSubmitted, setInlineFeedbackSubmitted] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState(-1);
    const [onboardingPhase, setOnboardingPhase] = useState<OnboardingPhase>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const isMounted = React.useRef(true);
    React.useEffect(() => { return () => { isMounted.current = false; }; }, []);

    const sourcesRef = React.useRef<View>(null);
    const promptRef = React.useRef<View>(null);
    const generateRef = React.useRef<View>(null);
    const firstOutfitCardRef = React.useRef<View>(null);
    const firstOutfitBadgeRef = React.useRef<View>(null);
    const firstOutfitRefreshRef = React.useRef<View>(null);
    const actionRowRef = React.useRef<View>(null);
    const scrollViewRef = React.useRef<ScrollView>(null);

    const beforeRefs = [sourcesRef, promptRef, generateRef];
    const afterRefs = [firstOutfitCardRef, firstOutfitBadgeRef, firstOutfitRefreshRef];
    const isPromptEmpty = prompt.trim().length === 0;

    // Načítaj gender z userProfile pri mountnutí
    React.useEffect(() => {
        const loadGender = async () => {
            try {
                const profileStr = await AsyncStorage.getItem('userProfile');
                if (!profileStr) return;
                const profile = JSON.parse(profileStr);
                // userProfile.gender je 'WOMAN' alebo 'MAN' z dotazníka
                if (profile?.gender === 'MAN') {
                    setUserGender('men');
                } else {
                    setUserGender('women');
                }
            } catch (e) {
                console.log('Failed to load gender', e);
            }
        };
        loadGender();
    }, []);

    React.useEffect(() => {
        const checkFeedback = async () => {
            const userData = await AsyncStorage.getItem('currentUser');
            if (!userData) return;
            const user = JSON.parse(userData);
            const shown = await AsyncStorage.getItem(`builder_feedback_shown_${user.email}`);
            if (shown === 'true') setHasShownFeedback(true);
        };
        checkFeedback();
    }, []);

    React.useEffect(() => {
        if (typeof builderPresetIds !== 'string') return;
        try {
            const parsedIds: string[] = JSON.parse(builderPresetIds);
            const presetItems: OutfitItem[] = parsedIds
                .map((id) => getProductById(id))
                .filter(Boolean)
                .map((product) => {
                    const firstImageKey = product?.availableColors?.[0]?.imageKeys?.[0] ?? product?.images?.[0];
                    const builderCategory = SUBCATEGORY_TO_BUILDER_CATEGORY[product!.subCategory] ?? product!.subCategory.toLowerCase();
                    const colorTags = product!.availableColors.map(c => c.name.toLowerCase());
                    const subCategoryTags = SUBCATEGORY_STYLE_TAGS[product!.subCategory] ?? [];
                    const playgroundTags = (product!.playgroundStyles ?? []).flatMap(s => PLAYGROUND_TO_STYLE_TAGS[s] ?? []);
                    return {
                        id: product!.id, name: product!.name,
                        image: firstImageKey ? productImages[firstImageKey] : null,
                        imageKey: firstImageKey, category: builderCategory,
                        tags: [product!.name.toLowerCase(), product!.brand.toLowerCase(), product!.subCategory.toLowerCase(), builderCategory, ...colorTags, ...subCategoryTags, ...playgroundTags],
                        fromWardrobe: false,
                    };
                })
                .filter((item) => item.image);
            if (presetItems.length === 0) return;
            setSelectedItems((prev) => {
                const filteredPrev = prev.filter((item) => !parsedIds.includes(item.id));
                const merged = [...filteredPrev, ...presetItems];
                return merged.filter((item, index, self) => self.findIndex((x) => x.id === item.id) === index);
            });
            setSources((prev) => (prev.includes('shop') ? prev : [...prev, 'shop']));
            if (typeof builderPresetTitle === 'string' && builderPresetTitle.trim().length > 0) {
                setPrompt(builderPresetTitle.toLowerCase());
            }
        } catch (error) { console.log('Failed to load builder preset', error); }
    }, [builderPresetIds, builderPresetTitle, getProductById]);

    useFocusEffect(
        React.useCallback(() => {
            if (returnToBuilder === 'true') setCartModalVisible(true);
            checkOnboarding();
        }, [returnToBuilder])
    );

    const checkOnboarding = async () => {
        const userData = await AsyncStorage.getItem('currentUser');
        if (!userData) return;
        const email = JSON.parse(userData).email;
        const justRegistered = await AsyncStorage.getItem('just_registered');
        if (!justRegistered) return;
        const seen = await AsyncStorage.getItem(`builder_onboarding_shown_${email}`);
        if (!seen) setTimeout(() => { if (isMounted.current) startBeforeOnboarding(); }, 600);
    };

    const startBeforeOnboarding = () => { setOnboardingPhase('before'); showOnboardingStep(0, 'before'); };

    const startAfterOnboarding = async () => {
        const userData = await AsyncStorage.getItem('currentUser');
        if (!userData) return;
        const email = JSON.parse(userData).email;
        const justRegistered = await AsyncStorage.getItem('just_registered');
        if (!justRegistered) return;
        const seen = await AsyncStorage.getItem(`builder_onboarding_after_shown_${email}`);
        if (!seen) {
            setTimeout(() => {
                if (!isMounted.current) return;
                setOnboardingPhase('after');
                showOnboardingStep(0, 'after');
            }, 600);
        }
    };

    const showOnboardingStep = (step: number, phase: OnboardingPhase) => {
        const steps = phase === 'before' ? ONBOARDING_STEPS_BEFORE : ONBOARDING_STEPS_AFTER;
        const refs = phase === 'before' ? beforeRefs : afterRefs;
        if (step >= steps.length) { finishOnboarding(phase); return; }
        const ref = refs[step];
        if (!ref?.current) { if (isMounted.current) setOnboardingStep(step); return; }
        ref.current.measureInWindow((x, y, width, height) => {
            if (!isMounted.current) return;
            setTooltipPos({ x, y, width, height });
            setOnboardingStep(step);
        });
    };

    const finishOnboarding = async (phase: OnboardingPhase) => {
        const userData = await AsyncStorage.getItem('currentUser');
        if (!userData) return;
        const email = JSON.parse(userData).email;
        if (phase === 'before') {
            await AsyncStorage.setItem(`builder_onboarding_shown_${email}`, 'true');
        } else {
            await AsyncStorage.setItem(`builder_onboarding_after_shown_${email}`, 'true');
            await AsyncStorage.removeItem('just_registered');
        }
        if (isMounted.current) { setOnboardingStep(-1); setOnboardingPhase(null); setTooltipPos({ x: 0, y: 0, width: 0, height: 0 }); }
    };

    const currentSteps = onboardingPhase === 'before' ? ONBOARDING_STEPS_BEFORE : ONBOARDING_STEPS_AFTER;
    const tooltipBottom = tooltipPos.y > 400;

    const wardrobeAsOutfits: OutfitItem[] = wardrobeItems.map(item => {
        const cat = (item as any).category ?? 'other';
        return { id: item.id, image: item.image, name: item.name, category: cat, tags: [item.name.toLowerCase(), ...item.name.toLowerCase().split(' '), cat, 'casual', 'everyday'], fromWardrobe: true };
    });

    const wishlistAsOutfits: OutfitItem[] = wishlistItems.map(item => {
        const product = getProductById(item.id);
        const builderCategory = product ? (SUBCATEGORY_TO_BUILDER_CATEGORY[product.subCategory] ?? product.subCategory.toLowerCase()) : 'other';
        const subCategoryTags = product ? (SUBCATEGORY_STYLE_TAGS[product.subCategory] ?? []) : [];
        const colorTags = product ? product.availableColors.map(c => c.name.toLowerCase()) : [];
        const playgroundTags = product ? (product.playgroundStyles ?? []).flatMap(s => PLAYGROUND_TO_STYLE_TAGS[s] ?? []) : [];
        return { id: item.id, image: item.image, name: item.name, category: builderCategory, tags: [item.name.toLowerCase(), ...item.name.toLowerCase().split(' '), ...colorTags, ...subCategoryTags, ...playgroundTags], fromWardrobe: false };
    });

    const preselectedBuilderItem: OutfitItem | null =
        typeof preselectedProductId === 'string' && typeof preselectedProductName === 'string' && typeof preselectedProductImageKey === 'string'
            ? { id: preselectedProductId, name: preselectedProductName, image: productImages[preselectedProductImageKey], imageKey: preselectedProductImageKey, category: typeof preselectedProductCategory === 'string' && preselectedProductCategory ? SUBCATEGORY_TO_BUILDER_CATEGORY[preselectedProductCategory] ?? preselectedProductCategory.toLowerCase() : 'other', tags: preselectedProductName.toLowerCase().split(' '), fromWardrobe: false }
            : null;

    React.useEffect(() => {
        if (!preselectedBuilderItem || !preselectedBuilderItem.image) return;
        setSelectedItems((prev) => { const alreadyThere = prev.some((item) => item.id === preselectedBuilderItem.id); if (alreadyThere) return prev; return [...prev, preselectedBuilderItem]; });
    }, [preselectedBuilderItem]);

    React.useEffect(() => {
        if (!preselectedBuilderItem) return;
        setSources((prev) => (prev.includes('shop') ? prev : [...prev, 'shop']));
    }, [preselectedBuilderItem]);

    const getSheetItems = (): OutfitItem[] => {
        if (sheetSource === 'wardrobe') return wardrobeAsOutfits;
        if (sheetSource === 'wishlist') return wishlistAsOutfits;
        return shopProducts;
    };

    const toggleSource = (s: Source) => {
        if (s === 'wardrobe' || s === 'wishlist') {
            const sourceItems = s === 'wardrobe' ? wardrobeAsOutfits : wishlistAsOutfits;
            const isFromThisSource = selectedItems.some(i => sourceItems.find(w => w.id === i.id));
            if (isFromThisSource) { setSelectedItems(prev => prev.filter(i => !sourceItems.find(w => w.id === i.id))); }
            else { setSheetSource(s); setSheetVisible(true); }
            return;
        }
        if (s === 'shop') {
            const hasOtherSources = selectedItems.length > 0;
            if (sources.includes('shop') && hasOtherSources) { setSources(prev => prev.filter(x => x !== 'shop')); }
            else if (!sources.includes('shop')) { setSources(prev => [...prev, 'shop']); }
            setGenerated(false); setOutfits([]);
        }
    };

    const toggleItemSelection = (item: OutfitItem) => { setSelectedItems(prev => prev.find(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]); };
    const confirmSheetSelection = () => setSheetVisible(false);

    const getSourceItems = (): OutfitItem[] => {
        let items: OutfitItem[] = [];
        if (selectedItems.length > 0) items = [...items, ...selectedItems];
        if (sources.includes('shop')) items = [...items, ...shopProducts];
        return items.filter((item, index, self) => self.findIndex(i => i.id === item.id) === index);
    };

    const scoreItem = (item: OutfitItem, keywords: string[]): number => {
        let score = 0;
        keywords.forEach(keyword => {
            if (item.name.toLowerCase() === keyword) score += 5;
            else if (item.name.toLowerCase().includes(keyword)) score += 3;
            if (item.tags.includes(keyword)) score += 4;
            else if (item.tags.some(tag => tag.includes(keyword) || keyword.includes(tag))) score += 2;
        });
        return score;
    };

    const regenerateItem = (index: number) => {
        const slotCategory = SLOT_CATEGORIES[index];
        const sourceItems = getSourceItems();
        const currentIds = outfits.map(o => o.id);
        const sameCategory = sourceItems.filter(i => !currentIds.includes(i.id) && i.category === slotCategory);
        const fallbackItems = sameCategory.length > 0 ? sameCategory : sourceItems.filter(i => !currentIds.includes(i.id));
        if (fallbackItems.length === 0) return;
        const newItem = fallbackItems[Math.floor(Math.random() * fallbackItems.length)];
        setOutfits(prev => { const updated = [...prev]; updated[index] = newItem; return updated; });
    };

    const handleGenerate = () => {
        if (isPromptEmpty) return;
        setGenerateError(false); setLoading(true); setGenerated(false); setAddedToCart(false); setInlineFeedbackRating(0); setInlineFeedbackSubmitted(false);

        setTimeout(async () => {
            if (!isMounted.current) return;

            const userData = await AsyncStorage.getItem('currentUser');
            const email = userData ? JSON.parse(userData).email : 'unknown';
            const countStr = await AsyncStorage.getItem(`builder_generate_count_${email}`);
            const count = parseInt(countStr ?? '0', 10);
            await AsyncStorage.setItem(`builder_generate_count_${email}`, String(count + 1));

            if (count + 1 === 4) {
                if (isMounted.current) { setLoading(false); setGenerateError(true); await AsyncStorage.setItem(`builder_generate_count_${email}`, '0'); }
                return;
            }

            const keywords = prompt.toLowerCase().split(' ').filter(k => k.length > 1);
            const sourceItems = getSourceItems();
            const pinnedItems = selectedItems.filter(i => sourceItems.find(s => s.id === i.id));
            const shopOnlyItems = sourceItems.filter(i => !selectedItems.find(s => s.id === i.id));

            const scoredPinned: ScoredItem[] = pinnedItems.map(item => ({ ...item, score: scoreItem(item, keywords) })).sort((a, b) => b.score - a.score);
            const scoredShop: ScoredItem[] = shopOnlyItems.map(item => ({ ...item, score: scoreItem(item, keywords) })).sort((a, b) => b.score - a.score);
            const allScored = [...scoredPinned, ...scoredShop];

            const wantsSport = keywords.some(k => ['sport', 'sporty', 'gym', 'workout', 'running', 'athletic', 'active'].includes(k));
            const wantsOffice = keywords.some(k => ['office', 'work', 'business', 'professional', 'blazer', 'smart'].includes(k));
            const wantsEvening = keywords.some(k => ['elegant', 'evening', 'formal', 'gala', 'dressy'].includes(k));
            const wantsParty = keywords.some(k => ['party', 'fun', 'night', 'club'].includes(k));
            const wantsSpring = keywords.some(k => ['spring', 'cozy', 'casual', 'everyday'].includes(k));
            const wantsAutumn = keywords.some(k => ['autumn', 'fall', 'warm', 'winter'].includes(k));
            const wantsCasual = keywords.some(k => ['casual', 'everyday', 'relaxed', 'chill', 'basic', 'summer'].includes(k));

            const pinnedByCategory = (cat: string): ScoredItem | undefined => scoredPinned.find(i => i.category === cat);
            const shopByCategory = (cat: string): ScoredItem | undefined => scoredShop.find(i => i.category === cat);
            const bestForCategory = (cat: string): ScoredItem | undefined => pinnedByCategory(cat) ?? shopByCategory(cat);

            const bestShoes = (style: 'elegant' | 'casual' | 'sport' | 'boots'): ScoredItem | undefined => {
                const pinned = pinnedByCategory('shoes');
                if (pinned) return pinned;
                if (style === 'elegant') return scoredShop.find(i => i.category === 'shoes' && (i.tags.includes('heels') || i.tags.includes('elegant') || i.tags.includes('dressy') || i.tags.includes('evening') || i.tags.includes('night')));
                if (style === 'casual') return scoredShop.find(i => i.category === 'shoes' && (i.tags.includes('sneakers') || i.tags.includes('casual') || i.tags.includes('everyday') || i.tags.includes('spring')));
                if (style === 'sport') return scoredShop.find(i => i.category === 'shoes' && (i.tags.includes('sport') || i.tags.includes('active') || i.tags.includes('running')));
                if (style === 'boots') return scoredShop.find(i => i.category === 'shoes' && i.tags.includes('boots')) ?? scoredShop.find(i => i.category === 'shoes' && (i.tags.includes('elegant') || i.tags.includes('heels'))) ?? shopByCategory('shoes');
                return shopByCategory('shoes');
            };

            const bestElegantTop = (): ScoredItem | undefined =>
                scoredPinned.find(i => i.category === 'top' && (i.tags.includes('elegant') || i.tags.includes('evening') || i.tags.includes('dressy') || i.tags.includes('lace') || i.tags.includes('night')))
                ?? scoredShop.find(i => i.category === 'top' && (i.tags.includes('lace') || i.tags.includes('evening') || i.tags.includes('elegant') || i.tags.includes('dressy') || i.tags.includes('night')))
                ?? bestForCategory('top');

            const bestElegantPants = (): ScoredItem | undefined =>
                scoredPinned.find(i => i.category === 'pants' && (i.tags.includes('elegant') || i.tags.includes('formal') || i.tags.includes('smart') || i.tags.includes('trousers')))
                ?? scoredShop.find(i => i.category === 'pants' && (i.tags.includes('elegant') || i.tags.includes('formal') || i.tags.includes('smart')))
                ?? scoredShop.find(i => i.category === 'pants' && (i.tags.includes('black') || i.tags.includes('dark')))
                ?? bestForCategory('pants');

            const bestCasualTop = (): ScoredItem | undefined =>
                scoredPinned.find(i => i.category === 'top' && (i.tags.includes('casual') || i.tags.includes('everyday') || i.tags.includes('basic')))
                ?? scoredShop.find(i => i.category === 'top' && (i.tags.includes('casual') || i.tags.includes('everyday') || i.tags.includes('basic') || i.tags.includes('stripe')))
                ?? bestForCategory('top');

            const bestCasualPants = (): ScoredItem | undefined =>
                scoredPinned.find(i => i.category === 'pants' && (i.tags.includes('jeans') || i.tags.includes('casual') || i.tags.includes('denim')))
                ?? scoredShop.find(i => i.category === 'pants' && (i.tags.includes('jeans') || i.tags.includes('denim') || i.tags.includes('casual') || i.tags.includes('relaxed')))
                ?? bestForCategory('pants');

            const bestJacket = (style: 'elegant' | 'casual'): ScoredItem | undefined => {
                if (style === 'elegant') return pinnedByCategory('jacket') ?? scoredShop.find(i => i.category === 'jacket' && (i.tags.includes('elegant') || i.tags.includes('formal') || i.tags.includes('classic')));
                return pinnedByCategory('jacket') ?? scoredShop.find(i => i.category === 'jacket' && (i.tags.includes('casual') || i.tags.includes('spring') || i.tags.includes('layering') || i.tags.includes('cropped')));
            };

            let shoes: OutfitItem | undefined;
            let pants: OutfitItem | undefined;
            let top: OutfitItem | undefined;
            let jacket: OutfitItem | undefined;

            if (wantsSport) {
                const sets = allScored.filter(i => i.category === 'set');
                shoes = bestShoes('sport') ?? bestShoes('casual');
                pants = scoredShop.find(i => i.category === 'pants' && (i.tags.includes('sport') || i.tags.includes('active') || i.tags.includes('joggers'))) ?? bestForCategory('pants');
                top = scoredShop.find(i => i.category === 'top' && (i.tags.includes('sport') || i.tags.includes('active'))) ?? bestForCategory('top');
                jacket = scoredShop.find(i => i.category === 'jacket' && i.tags.includes('casual')) ?? bestForCategory('jacket');
                if (sets.length > 0) { const set = pinnedByCategory('set') ?? sets[0]; shoes = bestShoes('sport') ?? bestShoes('casual'); pants = set; top = set; jacket = undefined; }
            } else if (wantsOffice) {
                shoes = bestShoes('elegant');
                pants = bestElegantPants();
                top = scoredShop.find(i => i.category === 'top' && (i.tags.includes('shirt') || i.tags.includes('elegant') || i.tags.includes('formal') || i.tags.includes('classic'))) ?? bestElegantTop();
                jacket = pinnedByCategory('jacket') ?? pinnedByCategory('coat') ?? scoredShop.find(i => (i.category === 'jacket' || i.category === 'coat') && (i.tags.includes('elegant') || i.tags.includes('formal') || i.tags.includes('classic')));
            } else if (wantsEvening && !wantsParty) {
                shoes = bestShoes('elegant');
                pants = bestElegantPants();
                top = bestElegantTop();
                jacket = bestJacket('elegant') ?? scoredShop.find(i => i.category === 'coat' && (i.tags.includes('elegant') || i.tags.includes('classic')));
            } else if (wantsParty) {
                shoes = bestShoes('elegant');
                pants = scoredShop.find(i => i.category === 'pants' && (i.tags.includes('black') || i.tags.includes('dark') || i.tags.includes('elegant'))) ?? bestElegantPants();
                top = scoredShop.find(i => i.category === 'top' && (i.tags.includes('party') || i.tags.includes('dressy') || i.tags.includes('night') || i.tags.includes('lace'))) ?? bestElegantTop();
                jacket = bestJacket('elegant');
            } else if (wantsSpring) {
                shoes = bestShoes('casual');
                pants = scoredShop.find(i => i.category === 'pants' && (i.tags.includes('light') || i.tags.includes('relaxed') || i.tags.includes('denim') || i.tags.includes('jeans'))) ?? bestCasualPants();
                top = scoredShop.find(i => i.category === 'top' && (i.tags.includes('spring') || i.tags.includes('casual') || i.tags.includes('stripe') || i.tags.includes('basic'))) ?? bestCasualTop();
                jacket = scoredShop.find(i => i.category === 'jacket' && (i.tags.includes('casual') || i.tags.includes('spring') || i.tags.includes('layering') || i.tags.includes('cropped'))) ?? scoredShop.find(i => i.category === 'jacket');
            } else if (wantsAutumn) {
                shoes = bestShoes('boots');
                pants = scoredShop.find(i => i.category === 'pants' && (i.tags.includes('jeans') || i.tags.includes('denim') || i.tags.includes('dark'))) ?? bestForCategory('pants');
                top = bestForCategory('top') ?? scoredShop.find(i => i.category === 'top');
                jacket = pinnedByCategory('coat') ?? pinnedByCategory('jacket') ?? scoredShop.find(i => i.category === 'coat' && (i.tags.includes('autumn') || i.tags.includes('warm') || i.tags.includes('classic'))) ?? scoredShop.find(i => i.category === 'jacket' && (i.tags.includes('autumn') || i.tags.includes('warm')));
            } else if (wantsCasual) {
                shoes = bestShoes('casual');
                pants = bestCasualPants();
                top = bestCasualTop();
                jacket = bestJacket('casual');
            } else {
                shoes = bestShoes('casual');
                pants = bestForCategory('pants');
                top = bestForCategory('top');
                jacket = bestForCategory('jacket') ?? bestForCategory('coat');
            }

            // Pevné poradie slotov: shoes, pants, top, jacket
            const result: (OutfitItem | undefined)[] = [shoes, pants, top, jacket];

            const seen = new Set<string>();
            const filtered: OutfitItem[] = result
                .map((item, index) => {
                    if (!item) return undefined;
                    if (seen.has(item.id)) {
                        const cat = SLOT_CATEGORIES[index];
                        const replacement = allScored.find(i => !seen.has(i.id) && i.category === cat);
                        if (replacement) { seen.add(replacement.id); return replacement; }
                        return undefined;
                    }
                    seen.add(item.id);
                    return item;
                })
                .filter((item): item is OutfitItem => !!item);

            // Fallback pre prázdne sloty
            for (let i = filtered.length; i < 4; i++) {
                const cat = SLOT_CATEGORIES[i] ?? 'top';
                const replacement = allScored.find(item => !seen.has(item.id) && item.category === cat);
                if (replacement) { filtered.push(replacement); seen.add(replacement.id); }
                else { const any = allScored.find(item => !seen.has(item.id)); if (any) { filtered.push(any); seen.add(any.id); } }
            }

            if (!isMounted.current) return;
            setOutfits(filtered.slice(0, 4));
            setGenerated(true); setLoading(false);
            startAfterOnboarding();

            if (email === 'test@test.com') {
                setTimeout(() => { if (isMounted.current) setFeedbackVisible(true); }, 3000);
            } else {
                const newCountStr = await AsyncStorage.getItem(`builder_generate_count_${email}`);
                const newCount = parseInt(newCountStr ?? '0', 10);
                if (newCount % 2 === 0) { setTimeout(() => { if (isMounted.current) setFeedbackVisible(true); }, 3000); }
            }
        }, 1800);
    };

    const saveFeedbackToStorage = async () => {
        const userData = await AsyncStorage.getItem('currentUser');
        const email = userData ? JSON.parse(userData).email : 'unknown';
        if (email !== 'test@test.com') await AsyncStorage.setItem(`builder_feedback_shown_${email}`, 'true');
        addBuilderFeedback();
    };

    const handleSubmitFeedback = async () => {
        await saveFeedbackToStorage();
        setHasShownFeedback(true); setFeedbackSubmitted(true);
        setTimeout(() => {
            if (!isMounted.current) return;
            setFeedbackVisible(false); setFeedbackSubmitted(false); setFeedbackRating(0); setSelectedChips([]); setRewardModalVisible(true);
        }, 2800);
    };

    const handleInlineFeedbackSubmit = async () => {
        if (inlineFeedbackRating === 0 || inlineFeedbackSubmitted) return;
        await saveFeedbackToStorage(); setInlineFeedbackSubmitted(true); setRewardModalVisible(true);
    };

    const toggleChip = (chip: string) => { setSelectedChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]); };

    const handleClear = () => { setPrompt(''); setOutfits([]); setGenerated(false); setAddedToCart(false); setInlineFeedbackRating(0); setInlineFeedbackSubmitted(false); setGenerateError(false); };

    const handleAddToCart = () => { const shopItems = outfits.filter(i => !i.fromWardrobe); if (shopItems.length === 0) return; setCartModalVisible(true); };

    const handleConfirmAddToCart = (cartId: string) => {
        const shopItems = outfits.filter(i => !i.fromWardrobe);
        shopItems.forEach(item => { addProductToCart(cartId, { id: item.id + Date.now().toString(), name: item.name, price: 49.99, quantity: 1, image: item.image, note: 'Added from Outfit Builder' }); });
        setCartModalVisible(false); setAddedToCart(true);
        setTimeout(() => { if (!isMounted.current) return; handleClear(); router.replace({ pathname: '/cart_detail', params: { cartId } }); }, 1500);
    };

    const handleItemPress = (item: OutfitItem) => {
        if (item.fromWardrobe) {
            router.push({
                pathname: '/(tabs)/wardrobe_item',
                params: {
                    itemId: item.id,
                    from: 'builder',
                },
            });
            return;
        }

        const product = getProductById(item.id);

        router.push({
            pathname: '/(tabs)/product_detail',
            params: {
                productId: item.id,
                category: product?.mainCategory ?? 'CLOTHING',
                subcategory: product?.subCategory ?? '',
                gender: product?.gender === 'men' ? 'MAN' : 'WOMAN',
                from: 'builder',
            },
        });
    };

    const handleManualPickerToggle = (item: OutfitItem) => {
        setManualPickerItems(prev => { const exists = prev.find(i => i.id === item.id); if (exists) return prev.filter(i => i.id !== item.id); if (prev.length >= 4) return prev; return [...prev, item]; });
    };

    const handleConfirmManualPicker = () => { if (manualPickerItems.length === 0) return; setOutfits(manualPickerItems); setGenerated(true); setManualPickerVisible(false); setManualPickerItems([]); setGenerateError(false); };

    const shopItemsCount = outfits.filter(i => !i.fromWardrobe).length;
    const isShopActive = sources.includes('shop');
    const isWardrobeActive = selectedItems.some(i => wardrobeAsOutfits.find(w => w.id === i.id));
    const isWishlistActive = selectedItems.some(i => wishlistAsOutfits.find(w => w.id === i.id));
    const getButtonLabel = () => { if (loading) return 'Generating things for you...'; if (generated) return 'REGENERATE'; return 'GENERATE OUTFIT'; };

    const handleEditCart = (cartId: string) => { setCartModalVisible(false); router.push({ pathname: '/(tabs)/cart_detail', params: { cartId, returnToBuilder: 'true' } }); };
    const getCartTotal = (cart: { products: any[] }) => cart.products.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const handleDeleteCart = (cartId: string) => { Alert.alert('Delete cart', 'Are you sure you want to delete this cart?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteCart(cartId) }]); };

    const renderCartRightActions = (cartId: string) => (
        <View style={styles.cartSwipeActions}>
            <TouchableOpacity style={[styles.cartSwipeButton, styles.cartEditSwipeButton]} onPress={() => handleEditCart(cartId)}>
                <Feather name="edit-2" size={16} color="#111" /><Text style={styles.cartSwipeButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cartSwipeButton, styles.cartDeleteSwipeButton]} onPress={() => handleDeleteCart(cartId)}>
                <Feather name="trash-2" size={16} color="#fff" /><Text style={styles.cartDeleteSwipeButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Outfit Builder</Text>
                    <Text style={styles.headerSubtitle}>Pick a vibe and we'll build the perfect outfit for you ✨</Text>
                </View>

                <Text style={styles.sectionLabel}>Sources</Text>
                <View ref={sourcesRef} style={styles.sourceRow}>
                    {(['wardrobe', 'wishlist', 'shop'] as Source[]).map((s) => {
                        const isActive = (s === 'shop' && isShopActive) || (s === 'wardrobe' && isWardrobeActive) || (s === 'wishlist' && isWishlistActive);
                        return (
                            <TouchableOpacity key={s} style={[styles.sourceButton, isActive && styles.sourceButtonActive]} onPress={() => toggleSource(s)}>
                                <Feather name={s === 'wardrobe' ? 'grid' : s === 'wishlist' ? 'heart' : 'shopping-bag'} size={14} color={isActive ? '#111' : '#999'} />
                                <Text style={[styles.sourceButtonText, isActive && styles.sourceButtonTextActive]}>{s === 'wardrobe' ? 'Wardrobe' : s === 'wishlist' ? 'Wishlist' : 'Shop'}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {selectedItems.length > 0 && (
                    <View style={styles.selectedPreview}>
                        <Text style={styles.selectedLabel}>Selected items ({selectedItems.length}) — will be prioritized ✨</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {selectedItems.map(item => (
                                <TouchableOpacity key={item.id} style={styles.selectedChip} onPress={() => toggleItemSelection(item)}>
                                    <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.selectedChipImage} resizeMode="cover" />
                                    <View style={styles.selectedChipRemove}><Feather name="x" size={10} color="#fff" /></View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <Text style={styles.sectionLabel}>Describe your outfit</Text>
                <View ref={promptRef}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
                        {PRESET_PROMPTS.map(preset => (
                            <TouchableOpacity key={preset.value} style={[styles.presetChip, prompt === preset.value && styles.presetChipActive]} onPress={() => setPrompt(prompt === preset.value ? '' : preset.value)}>
                                <Text style={[styles.presetChipText, prompt === preset.value && styles.presetChipTextActive]}>{preset.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={styles.inputWrapper}>
                        <Feather name="edit-2" size={16} color="#999" />
                        <TextInput style={styles.input} placeholder="e.g. casual summer outfit, elegant evening..." placeholderTextColor="#999" value={prompt} onChangeText={setPrompt} multiline />
                        {prompt.length > 0 && (<TouchableOpacity onPress={() => setPrompt('')}><Feather name="x" size={16} color="#999" /></TouchableOpacity>)}
                    </View>
                </View>

                <View ref={generateRef}>
                    <TouchableOpacity style={[styles.generateButton, loading && styles.generateButtonLoading, isPromptEmpty && styles.generateButtonDisabled, generated && !loading && styles.generateButtonRegenerate]} onPress={handleGenerate} disabled={loading || isPromptEmpty}>
                        <Feather name={generated && !loading ? 'refresh-cw' : 'zap'} size={16} color="#fff" />
                        <Text style={styles.generateButtonText}>{getButtonLabel()}</Text>
                    </TouchableOpacity>
                </View>

                {generateError && !generated && (
                    <View style={styles.errorState}>
                        <Feather name="alert-circle" size={44} color="#e74c3c" />
                        <Text style={styles.errorTitle}>Something went wrong</Text>
                        <Text style={styles.errorSubtitle}>We couldn't generate your outfit this time. Pick items manually or try again.</Text>
                        <View style={styles.errorButtons}>
                            <TouchableOpacity style={styles.retryButton} onPress={() => { setGenerateError(false); handleGenerate(); }}>
                                <Feather name="refresh-cw" size={14} color="#fff" /><Text style={styles.retryButtonText}>Try again</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.manualButton} onPress={() => { setManualPickerItems([]); setManualPickerTab('shop'); setManualPickerVisible(true); }}>
                                <Feather name="sliders" size={14} color="#111" /><Text style={styles.manualButtonText}>Pick manually</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {generated && outfits.length > 0 && (
                    <View style={styles.resultsSection}>
                        <Text style={styles.resultsTitle}>{prompt.trim() ? `Results for "${prompt}"` : 'Suggested outfits'}</Text>
                        <View style={styles.outfitsGrid}>
                            {outfits.map((item, index) => (
                                <View key={item.id} ref={index === 0 ? firstOutfitCardRef : null} style={styles.outfitCard}>
                                    <TouchableOpacity activeOpacity={0.85} onPress={() => handleItemPress(item)} style={{ flex: 1 }}>
                                        <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.outfitImage} resizeMode="cover" />
                                        <View ref={index === 0 ? firstOutfitRefreshRef : null} collapsable={false} style={styles.refreshAnchor}>
                                            <TouchableOpacity style={styles.regenerateItemButton} onPress={(e) => { e.stopPropagation(); regenerateItem(index); }}>
                                                <Feather name="refresh-cw" size={13} color="#111" />
                                            </TouchableOpacity>
                                        </View>
                                        {/* Slot label */}
                                        <View style={styles.slotLabelBadge}>
                                            <Text style={styles.slotLabelText}>
                                                {index === 0 ? '👟' : index === 1 ? '👖' : index === 2 ? '👕' : '🧥'}
                                            </Text>
                                        </View>
                                        {item.fromWardrobe ? (
                                            <View ref={index === 0 ? firstOutfitBadgeRef : null} collapsable={false} style={styles.wardrobeBadge}><Text style={styles.wardrobeBadgeText}>My item</Text></View>
                                        ) : selectedItems.find(s => s.id === item.id) ? (
                                            <View ref={index === 0 ? firstOutfitBadgeRef : null} collapsable={false} style={styles.wishlistBadge}><Text style={styles.wishlistBadgeText}>Wishlist</Text></View>
                                        ) : (
                                            <View ref={index === 0 ? firstOutfitBadgeRef : null} collapsable={false} style={styles.shopBadge}><Text style={styles.shopBadgeText}>Shop</Text></View>
                                        )}
                                        <Text style={styles.outfitName} numberOfLines={2}>{item.name}</Text>
                                        <Text style={styles.outfitTapHint}>Tap to view details</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        <View ref={actionRowRef} style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionButtonOutline} onPress={handleClear}>
                                <Feather name="x" size={16} color="#111" /><Text style={styles.actionButtonOutlineText}>Dismiss</Text>
                            </TouchableOpacity>
                            {addedToCart ? (
                                <ImageBackground source={require('../../assets/images_app/search.png')} style={styles.addedBackground} imageStyle={{ borderRadius: 20 }}>
                                    <Feather name="check" size={14} color="#111" /><Text style={styles.addedButtonText}>ADDED!</Text>
                                </ImageBackground>
                            ) : (
                                <TouchableOpacity style={[styles.actionButtonFill, shopItemsCount === 0 && styles.actionButtonDisabled]} onPress={handleAddToCart} disabled={shopItemsCount === 0}>
                                    <Feather name="shopping-cart" size={16} color="#fff" />
                                    <Text style={styles.actionButtonFillText}>{shopItemsCount > 0 ? `Add to cart (${shopItemsCount})` : 'All from wardrobe'}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {!generated && !loading && !generateError && (
                    <View style={styles.emptyState}>
                        <Feather name="zap" size={40} color="#ccc" />
                        <Text style={styles.emptyStateText}>Select sources, describe your outfit and generate</Text>
                    </View>
                )}
            </ScrollView>

            {/* Onboarding */}
            {onboardingStep >= 0 && onboardingPhase !== null && (
                <Modal visible transparent animationType="fade">
                    <View style={styles.onboardingOverlay}>
                        <View style={[styles.onboardingHighlight, { left: tooltipPos.x - 6, top: tooltipPos.y - 6, width: tooltipPos.width + 12, height: tooltipPos.height + 12 }]} />
                        <View style={[styles.onboardingCard, tooltipBottom ? { bottom: 100 } : { top: tooltipPos.y + tooltipPos.height + 16 }]}>
                            <View style={styles.onboardingHeader}>
                                <Text style={styles.onboardingStepLabel}>{onboardingStep + 1} / {currentSteps.length}{onboardingPhase === 'after' ? '  (results)' : ''}</Text>
                                <TouchableOpacity onPress={() => finishOnboarding(onboardingPhase)}><Text style={styles.onboardingSkip}>Skip</Text></TouchableOpacity>
                            </View>
                            <Text style={styles.onboardingTitle}>{currentSteps[onboardingStep].title}</Text>
                            <Text style={styles.onboardingDescription}>{currentSteps[onboardingStep].description}</Text>
                            <View style={styles.onboardingDots}>
                                {currentSteps.map((_, i) => (<View key={i} style={[styles.onboardingDot, i === onboardingStep && styles.onboardingDotActive]} />))}
                            </View>
                            <TouchableOpacity style={styles.onboardingButton} onPress={() => showOnboardingStep(onboardingStep + 1, onboardingPhase)}>
                                <Text style={styles.onboardingButtonText}>{onboardingStep === currentSteps.length - 1 ? 'Got it! 🎉' : 'Next →'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Feedback Modal */}
            <Modal visible={feedbackVisible} transparent animationType="slide" onRequestClose={() => setFeedbackVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setFeedbackVisible(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        {feedbackSubmitted ? (
                            <View style={styles.feedbackThanks}>
                                <Feather name="check-circle" size={40} color="#111" />
                                <Text style={styles.feedbackThanksTitle}>Thanks for your feedback!</Text>
                                <Text style={styles.feedbackThanksSubtitle}>Your feedback helps us improve future outfit recommendations!</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.sheetTitle}>How was your outfit?</Text>
                                <Text style={styles.sheetSubtitle}>Rate the suggestions to help us improve</Text>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <TouchableOpacity key={star} onPress={() => setFeedbackRating(star)} onPressIn={() => setFeedbackHoverRating(star)} onPressOut={() => setFeedbackHoverRating(0)}>
                                            <Feather name="star" size={36} color={star <= (feedbackHoverRating || feedbackRating) ? '#f2b55d' : '#d0d0d0'} style={{ marginHorizontal: 6 }} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {feedbackRating > 0 && (
                                    <>
                                        <Text style={styles.chipsLabel}>What can we improve?</Text>
                                        <View style={styles.chipsGrid}>
                                            {FEEDBACK_CHIPS.map(chip => (
                                                <TouchableOpacity key={chip} style={[styles.feedbackChip, selectedChips.includes(chip) && styles.feedbackChipActive]} onPress={() => toggleChip(chip)}>
                                                    <Text style={[styles.feedbackChipText, selectedChips.includes(chip) && styles.feedbackChipTextActive]}>{chip}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </>
                                )}
                                <TouchableOpacity style={[styles.submitButton, feedbackRating === 0 && styles.submitButtonDisabled]} onPress={handleSubmitFeedback} disabled={feedbackRating === 0}>
                                    <Text style={styles.submitButtonText}>SEND FEEDBACK</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.skipButton} onPress={async () => {
                                    const userData = await AsyncStorage.getItem('currentUser');
                                    const email = userData ? JSON.parse(userData).email : 'unknown';
                                    await AsyncStorage.setItem(`builder_feedback_shown_${email}`, 'true');
                                    setFeedbackVisible(false);
                                }}><Text style={styles.skipButtonText}>Skip</Text></TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Reward Modal */}
            <Modal visible={rewardModalVisible} transparent animationType="fade" onRequestClose={() => setRewardModalVisible(false)}>
                <TouchableOpacity style={styles.rewardOverlay} activeOpacity={1} onPress={() => setRewardModalVisible(false)}>
                    <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                        <View style={styles.rewardCard}>
                            <Text style={styles.rewardEmoji}>🎉</Text>
                            <Text style={styles.rewardTitle}>You earned points!</Text>
                            <Text style={styles.rewardSubtitle}>Thanks to your feedback you earned</Text>
                            <View style={styles.rewardBadge}>
                                <Text style={styles.rewardBadgePoints}>+5</Text><Text style={styles.rewardBadgeLabel}> points</Text>
                            </View>
                            <Text style={styles.rewardNote}>Reach 30 points to unlock unlimited carts!</Text>
                            <TouchableOpacity style={styles.rewardButton} onPress={() => setRewardModalVisible(false)}>
                                <Text style={styles.rewardButtonText}>AWESOME!</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Wardrobe / Wishlist Sheet */}
            <Modal visible={sheetVisible} animationType="slide" transparent onRequestClose={() => setSheetVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setSheetVisible(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Select from {sheetSource === 'wardrobe' ? 'Wardrobe' : 'Wishlist'}</Text>
                            <TouchableOpacity onPress={() => setSheetVisible(false)}><Feather name="x" size={22} color="#111" /></TouchableOpacity>
                        </View>
                        {getSheetItems().length === 0 ? (
                            <View style={styles.emptySheet}>
                                <Feather name={sheetSource === 'wishlist' ? 'heart' : 'grid'} size={36} color="#ccc" />
                                <Text style={styles.emptySheetText}>{sheetSource === 'wishlist' ? 'Your wishlist is empty.' : 'Your wardrobe is empty.'}</Text>
                            </View>
                        ) : (
                            <FlatList data={getSheetItems()} keyExtractor={item => item.id} numColumns={3} contentContainerStyle={styles.sheetGrid}
                                renderItem={({ item }) => {
                                    const isSelected = !!selectedItems.find(i => i.id === item.id);
                                    return (
                                        <TouchableOpacity style={[styles.sheetItem, isSelected && styles.sheetItemSelected]} onPress={() => toggleItemSelection(item)}>
                                            <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.sheetItemImage} resizeMode="cover" />
                                            {isSelected && <View style={styles.sheetItemCheck}><Feather name="check" size={14} color="#fff" /></View>}
                                            <Text style={styles.sheetItemName} numberOfLines={1}>{item.name}</Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}
                        <TouchableOpacity style={styles.confirmButton} onPress={confirmSheetSelection}>
                            <Text style={styles.confirmButtonText}>Confirm ({selectedItems.length} selected)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Manual Picker */}
            <Modal visible={manualPickerVisible} animationType="slide" transparent onRequestClose={() => setManualPickerVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setManualPickerVisible(false)} />
                    <View style={[styles.bottomSheet, { maxHeight: '90%' }]}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Pick your outfit</Text>
                            <TouchableOpacity onPress={() => setManualPickerVisible(false)}><Feather name="x" size={22} color="#111" /></TouchableOpacity>
                        </View>
                        <Text style={styles.manualPickerHint}>{manualPickerItems.length}/4 items selected</Text>
                        <View style={styles.manualTabRow}>
                            <TouchableOpacity style={[styles.manualTab, manualPickerTab === 'shop' && styles.manualTabActive]} onPress={() => setManualPickerTab('shop')}>
                                <Feather name="shopping-bag" size={13} color={manualPickerTab === 'shop' ? '#111' : '#999'} />
                                <Text style={[styles.manualTabText, manualPickerTab === 'shop' && styles.manualTabTextActive]}>Shop</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.manualTab, manualPickerTab === 'wardrobe' && styles.manualTabActive]} onPress={() => setManualPickerTab('wardrobe')}>
                                <Feather name="grid" size={13} color={manualPickerTab === 'wardrobe' ? '#111' : '#999'} />
                                <Text style={[styles.manualTabText, manualPickerTab === 'wardrobe' && styles.manualTabTextActive]}>Wardrobe</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList data={(manualPickerTab === 'shop' ? shopProducts : wardrobeAsOutfits) as OutfitItem[]} keyExtractor={item => item.id} numColumns={3} contentContainerStyle={styles.sheetGrid}
                            renderItem={({ item }) => {
                                const isSelected = !!manualPickerItems.find(i => i.id === item.id);
                                const isDisabled = !isSelected && manualPickerItems.length >= 4;
                                return (
                                    <TouchableOpacity style={[styles.sheetItem, isSelected && styles.sheetItemSelected, isDisabled && styles.sheetItemDisabled]} onPress={() => handleManualPickerToggle(item)} disabled={isDisabled}>
                                        <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.sheetItemImage} resizeMode="cover" />
                                        {isSelected && <View style={styles.sheetItemCheck}><Feather name="check" size={14} color="#fff" /></View>}
                                        <Text style={styles.sheetItemName} numberOfLines={1}>{item.name}</Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                        <TouchableOpacity style={[styles.confirmButton, manualPickerItems.length === 0 && styles.confirmButtonDisabled]} onPress={handleConfirmManualPicker} disabled={manualPickerItems.length === 0}>
                            <Text style={styles.confirmButtonText}>{manualPickerItems.length > 0 ? `Build outfit (${manualPickerItems.length} selected)` : 'Select at least 1 item'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Cart Modal */}
            <Modal visible={cartModalVisible} animationType="slide" transparent onRequestClose={() => setCartModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setCartModalVisible(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Add to which cart?</Text>
                            <TouchableOpacity onPress={() => setCartModalVisible(false)}><Feather name="x" size={22} color="#111" /></TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            <TouchableOpacity style={styles.createNewCartButton} onPress={() => { setCartModalVisible(false); router.push({ pathname: '/(tabs)/cart_create', params: { returnToBuilder: 'true' } }); }}>
                                <Feather name="plus" size={16} color="#fff" /><Text style={styles.createNewCartButtonText}>Create new cart</Text>
                            </TouchableOpacity>
                            {carts.length === 0 ? (
                                <Text style={styles.noCartsText}>No carts yet. Create one first!</Text>
                            ) : (
                                carts.map((cart) => {
                                    const currentTotal = getCartTotal(cart);
                                    const difference = cart.budget - currentTotal;
                                    const isOver = difference < 0;
                                    return (
                                        <Swipeable key={cart.id} renderRightActions={() => renderCartRightActions(cart.id)} overshootRight={false}>
                                            <TouchableOpacity style={styles.cartSelectItem} activeOpacity={0.86} onPress={() => handleConfirmAddToCart(cart.id)}>
                                                <View style={styles.cartIconWrap}><Feather name="shopping-cart" size={20} color="#111" /></View>
                                                <View style={styles.cartSelectInfo}>
                                                    <Text style={styles.cartSelectName}>{cart.name}</Text>
                                                    <Text style={styles.cartSelectSub}>Budget: €{cart.budget} · {cart.products.length} items</Text>
                                                    <Text style={[styles.cartRemainingText, isOver ? styles.cartRemainingOver : styles.cartRemainingOk]}>
                                                        {isOver ? `Over budget: €${Math.abs(difference).toFixed(2)}` : `Remaining: €${difference.toFixed(2)}`}
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
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f3f3f3' },
    scrollContent: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 40 },
    header: { marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: '700', color: '#111', letterSpacing: -0.7 },
    headerSubtitle: { fontSize: 13, color: '#393939', marginTop: 4 },
    sectionLabel: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 10 },
    sourceRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    sourceButton: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#e9e9e9', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', flexDirection: 'row', justifyContent: 'center', gap: 6 },
    sourceButtonActive: { backgroundColor: '#fff', borderColor: '#111' },
    sourceButtonText: { fontSize: 13, fontWeight: '600', color: '#999' },
    sourceButtonTextActive: { color: '#111' },
    selectedPreview: { marginBottom: 16 },
    selectedLabel: { fontSize: 13, color: '#393939', marginBottom: 8, fontWeight: '600' },
    selectedChip: { marginRight: 8, position: 'relative' },
    selectedChipImage: { width: 56, height: 56, borderRadius: 10 },
    selectedChipRemove: { position: 'absolute', top: -4, right: -4, backgroundColor: '#111', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
    presetChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e9e9e9', borderWidth: 1.5, borderColor: 'transparent' },
    presetChipActive: { backgroundColor: '#fff', borderColor: '#111' },
    presetChipText: { fontSize: 13, color: '#666', fontWeight: '500' },
    presetChipTextActive: { color: '#111', fontWeight: '700' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e9e9e9', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, gap: 10 },
    input: { flex: 1, fontSize: 15, color: '#111', maxHeight: 80 },
    generateButton: { backgroundColor: '#111', paddingVertical: 16, borderRadius: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
    generateButtonLoading: { backgroundColor: '#555' },
    generateButtonDisabled: { backgroundColor: '#bdbdbd' },
    generateButtonRegenerate: { backgroundColor: '#333' },
    generateButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    resultsSection: { marginTop: 8 },
    resultsTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 16 },
    outfitsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    outfitCard: { width: '48%', marginBottom: 16, position: 'relative' },
    outfitImage: { width: '100%', height: 180, borderRadius: 14, backgroundColor: '#e9e9e9' },
    refreshAnchor: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, zIndex: 3 },
    regenerateItemButton: { width: 30, height: 30, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    slotLabelBadge: { position: 'absolute', bottom: 46, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
    slotLabelText: { fontSize: 12 },
    wardrobeBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#111', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
    wardrobeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    wishlistBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#e74c3c', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
    wishlistBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    shopBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#f2b55d', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
    shopBadgeText: { color: '#111', fontSize: 10, fontWeight: '700' },
    outfitName: { marginTop: 8, fontSize: 13, color: '#111', fontWeight: '500' },
    outfitTapHint: { fontSize: 11, color: '#aaa', marginTop: 2 },
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 24, alignItems: 'center' },
    actionButtonOutline: { flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#111', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    actionButtonOutlineText: { color: '#111', fontWeight: '600', fontSize: 14 },
    actionButtonFill: { flex: 1, height: 52, borderRadius: 14, backgroundColor: '#111', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    actionButtonDisabled: { backgroundColor: '#ccc' },
    actionButtonFillText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    addedBackground: { flex: 1, height: 52, borderRadius: 20, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    addedButtonText: { color: '#111', fontSize: 14, fontWeight: '700' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 14 },
    emptyStateText: { fontSize: 14, color: '#aaa', textAlign: 'center' },
    errorState: { alignItems: 'center', justifyContent: 'center', paddingTop: 40, gap: 12, paddingHorizontal: 8 },
    errorTitle: { fontSize: 18, fontWeight: '700', color: '#111', textAlign: 'center' },
    errorSubtitle: { fontSize: 14, color: '#8a8a8a', textAlign: 'center', lineHeight: 20 },
    errorButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
    retryButton: { flex: 1, backgroundColor: '#111', paddingVertical: 14, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    retryButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    manualButton: { flex: 1, backgroundColor: '#e9e9e9', paddingVertical: 14, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#111' },
    manualButtonText: { color: '#111', fontWeight: '700', fontSize: 14 },
    manualPickerHint: { fontSize: 13, color: '#8a8a8a', fontWeight: '600', marginBottom: 12, textAlign: 'center' },
    manualTabRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    manualTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 20, backgroundColor: '#e9e9e9', borderWidth: 2, borderColor: 'transparent' },
    manualTabActive: { backgroundColor: '#fff', borderColor: '#111' },
    manualTabText: { fontSize: 13, fontWeight: '600', color: '#999' },
    manualTabTextActive: { color: '#111' },
    sheetItemDisabled: { opacity: 0.35 },
    confirmButtonDisabled: { backgroundColor: '#bdbdbd' },
    onboardingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    onboardingHighlight: { position: 'absolute', borderRadius: 16, borderWidth: 2, borderColor: '#f2b55d', backgroundColor: 'rgba(242,181,93,0.1)' },
    onboardingCard: { position: 'absolute', left: 16, right: 16, backgroundColor: '#fff', borderRadius: 20, padding: 20 },
    onboardingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    onboardingStepLabel: { fontSize: 12, color: '#8a8a8a', fontWeight: '600' },
    onboardingSkip: { fontSize: 13, color: '#8a8a8a', fontWeight: '600' },
    onboardingTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 },
    onboardingDescription: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 16 },
    onboardingDots: { flexDirection: 'row', gap: 6, marginBottom: 16 },
    onboardingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#dedede' },
    onboardingDotActive: { backgroundColor: '#111', width: 20, borderRadius: 4 },
    onboardingButton: { backgroundColor: '#111', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    onboardingButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    bottomSheet: { backgroundColor: '#f3f3f3', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingBottom: 34, maxHeight: '85%' },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc', alignSelf: 'center', marginTop: 12, marginBottom: 16 },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
    sheetSubtitle: { fontSize: 13, color: '#8a8a8a', marginTop: 4, marginBottom: 20 },
    starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
    chipsLabel: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 12 },
    chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    feedbackChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e9e9e9', borderWidth: 1.5, borderColor: 'transparent' },
    feedbackChipActive: { backgroundColor: '#fff', borderColor: '#111' },
    feedbackChipText: { fontSize: 13, color: '#666', fontWeight: '500' },
    feedbackChipTextActive: { color: '#111', fontWeight: '700' },
    submitButton: { backgroundColor: '#111', paddingVertical: 16, borderRadius: 20, alignItems: 'center' },
    submitButtonDisabled: { backgroundColor: '#ccc' },
    submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    skipButton: { alignItems: 'center', paddingVertical: 14 },
    skipButtonText: { fontSize: 14, color: '#8a8a8a', fontWeight: '500' },
    feedbackThanks: { alignItems: 'center', paddingVertical: 30, gap: 12 },
    feedbackThanksTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
    feedbackThanksSubtitle: { fontSize: 14, color: '#6a6a6a', textAlign: 'center', lineHeight: 20 },
    rewardOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    rewardCard: { backgroundColor: '#f3f3f3', borderRadius: 24, padding: 24, alignItems: 'center', width: '100%' },
    rewardEmoji: { fontSize: 48, marginBottom: 12 },
    rewardTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 8, textAlign: 'center' },
    rewardSubtitle: { fontSize: 14, color: '#6a6a6a', textAlign: 'center', marginBottom: 16 },
    rewardBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    rewardBadgePoints: { fontSize: 28, fontWeight: '900', color: '#f2b55d' },
    rewardBadgeLabel: { fontSize: 28, fontWeight: '700', color: '#111' },
    rewardNote: { fontSize: 13, color: '#8a8a8a', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
    rewardButton: { backgroundColor: '#111', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 20 },
    rewardButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    emptySheet: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
    emptySheetText: { fontSize: 14, color: '#aaa', textAlign: 'center', paddingHorizontal: 20 },
    sheetGrid: { paddingBottom: 16 },
    sheetItem: { flex: 1, margin: 4, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
    sheetItemSelected: { borderColor: '#111' },
    sheetItemImage: { width: '100%', height: 100, backgroundColor: '#e9e9e9' },
    sheetItemCheck: { position: 'absolute', top: 6, right: 6, backgroundColor: '#111', borderRadius: 10, width: 22, height: 22, justifyContent: 'center', alignItems: 'center' },
    sheetItemName: { fontSize: 11, color: '#111', padding: 4, fontWeight: '500' },
    confirmButton: { backgroundColor: '#111', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 8 },
    confirmButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    createNewCartButton: { backgroundColor: '#111', paddingVertical: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
    createNewCartButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    cartSelectItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e9e9e9', borderRadius: 14, padding: 14, marginBottom: 10 },
    cartSelectInfo: { flex: 1 },
    cartSelectName: { fontSize: 15, fontWeight: '700', color: '#111' },
    cartSelectSub: { fontSize: 12, color: '#6a6a6a', marginTop: 2 },
    noCartsText: { textAlign: 'center', color: '#999', fontSize: 14, marginTop: 20 },
    cartSwipeActions: { flexDirection: 'row', alignItems: 'stretch', marginBottom: 10 },
    cartSwipeButton: { width: 86, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 6, marginLeft: 8 },
    cartEditSwipeButton: { backgroundColor: '#dedede' },
    cartDeleteSwipeButton: { backgroundColor: '#111' },
    cartSwipeButtonText: { fontSize: 13, fontWeight: '700', color: '#111' },
    cartDeleteSwipeButtonText: { fontSize: 13, fontWeight: '700', color: '#fff' },
    cartRemainingText: { marginTop: 6, fontSize: 13, fontWeight: '700' },
    cartRemainingOk: { color: '#006958' },
    cartRemainingOver: { color: '#df2518' },
    cartIconWrap: { width: 40, height: 40, borderRadius: 19, backgroundColor: '#dedede', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
});