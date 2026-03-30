import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    TextInput, TouchableOpacity, Image, Modal, FlatList, ImageBackground,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useWardrobe } from '../../context/wardrobe_context';
import { useCart } from '../../context/cart_context';
import { useWishlist } from '../../context/wishlist_context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SHOP_PRODUCTS = [
    { id: 's1', image: require('../../assets/images_app/model8.png'), name: 'Oversized denim jacket', category: 'jacket', tags: ['casual', 'denim', 'jacket', 'streetwear', 'blue'] },
    { id: 's2', image: require('../../assets/images_app/model9.png'), name: 'Summer dress', category: 'dress', tags: ['summer', 'dress', 'casual', 'boho'] },
    { id: 's3', image: require('../../assets/images_app/model10.png'), name: 'One shoulder top', category: 'top', tags: ['top', 'elegant', 'streetwear', 'black', 'minimalist'] },
    { id: 's4', image: require('../../assets/images_app/model11.png'), name: 'Adidas sport set', category: 'set', tags: ['sport', 'sporty', 'green', 'casual', 'adidas'] },
    { id: 's5', image: require('../../assets/images_app/model2.png'), name: 'Denim jeans', category: 'pants', tags: ['denim', 'casual', 'blue', 'jeans'] },
    { id: 's6', image: require('../../assets/images_app/model3.png'), name: 'Elegant dress', category: 'dress', tags: ['dress', 'elegant', 'formal'] },
    { id: 's7', image: require('../../assets/images_app/model4.png'), name: 'Spring blazer', category: 'jacket', tags: ['spring', 'casual', 'blazer', 'elegant'] },
    { id: 's8', image: require('../../assets/images_app/model5.png'), name: 'White sneakers', category: 'shoes', tags: ['shoes', 'casual', 'sport', 'white'] },
    { id: 's9', image: require('../../assets/images_app/model6.png'), name: 'Floral skirt', category: 'pants', tags: ['skirt', 'boho', 'summer', 'floral'] },
    { id: 's10', image: require('../../assets/images_app/model7.png'), name: 'Ankle boots', category: 'shoes', tags: ['boots', 'elegant', 'autumn', 'brown'] },
];

const PRESET_PROMPTS = [
    { label: '☀️ Casual summer', value: 'casual summer outfit' },
    { label: '🌙 Elegant evening', value: 'elegant formal dress evening' },
    { label: '🏃 Sport', value: 'sport sporty workout gym' },
    { label: '🍂 Autumn cozy', value: 'autumn cozy casual jacket' },
    { label: '💼 Office', value: 'office elegant blazer formal' },
    { label: '🎉 Party', value: 'party elegant dress night' },
];

const FEEDBACK_CHIPS = [
    'Wrong style', 'Not my size', 'Needs more color',
    'Too similar', 'Not my taste', 'Not seasonal',
];

const ONBOARDING_STEPS_BEFORE = [
    {
        title: 'Sources 👗',
        description: 'Choose where to get outfit items from — your Wardrobe, Wishlist, or the Shop.',
        phase: 'before' as const,
    },
    {
        title: 'Describe your style ✨',
        description: 'Pick a preset vibe or type your own — "casual summer", "office look", anything you like!',
        phase: 'before' as const,
    },
    {
        title: 'Generate your outfit 🎯',
        description: "Hit this button and we'll build a full outfit for you. You can regenerate as many times as you want!",
        phase: 'before' as const,
    },
];

const ONBOARDING_STEPS_AFTER = [
    {
        title: 'Your outfit results 👀',
        description: 'Tap this item to see its full details — either in the Shop or your Wardrobe.',
        phase: 'after' as const,
    },
    {
        title: 'Shop vs My item 🏷️',
        description: 'This badge shows where the item comes from. "Shop" means you can buy it, "My item" means it is already in your wardrobe.',
        phase: 'after' as const,
    },
    {
        title: 'Swap single items 🔄',
        description: 'Use this refresh button to swap only this one item while keeping the rest of the outfit.',
        phase: 'after' as const,
    },
];

type Source = 'wardrobe' | 'wishlist' | 'shop';
type OutfitItem = { id: string; image: any; name: string; category?: string; tags: string[]; fromWardrobe?: boolean };
type ScoredItem = OutfitItem & { score: number };
type OnboardingPhase = 'before' | 'after' | null;

export default function BuilderScreen() {
    const router = useRouter();
    const { returnToBuilder } = useLocalSearchParams();
    const { wardrobeItems } = useWardrobe();
    const { carts, addProductToCart, addBuilderFeedback, isUnlimitedUnlocked } = useCart();
    const { wishlistItems } = useWishlist();

    const [prompt, setPrompt] = useState('');
    const [sources, setSources] = useState<Source[]>(['shop']);
    const [outfits, setOutfits] = useState<OutfitItem[]>([]);
    const [generated, setGenerated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    const [sheetVisible, setSheetVisible] = useState(false);
    const [sheetSource, setSheetSource] = useState<Source | null>(null);
    const [selectedItems, setSelectedItems] = useState<OutfitItem[]>([]);
    const [cartModalVisible, setCartModalVisible] = useState(false);

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

    // FIX 1: isMounted guard — zabraňuje setState po odmontovaní komponentu
    const isMounted = React.useRef(true);
    React.useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

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

    useFocusEffect(
        React.useCallback(() => {
            if (returnToBuilder === 'true') {
                setCartModalVisible(true);
            }
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
        if (!seen) {
            setTimeout(() => {
                if (isMounted.current) startBeforeOnboarding();
            }, 600);
        }
    };

    const startBeforeOnboarding = () => {
        setOnboardingPhase('before');
        showOnboardingStep(0, 'before');
    };

    const startAfterOnboarding = async () => {
        const userData = await AsyncStorage.getItem('currentUser');
        if (!userData) return;
        const email = JSON.parse(userData).email;

        const justRegistered = await AsyncStorage.getItem('just_registered');
        if (!justRegistered) return;

        const seen = await AsyncStorage.getItem(`builder_onboarding_after_shown_${email}`);
        if (!seen) {
            // FIX 2: isMounted guard v setTimeout — nekontaktuj setState ak komponent nie je aktívny
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

        if (step >= steps.length) {
            finishOnboarding(phase);
            return;
        }

        const ref = refs[step];

        // FIX 3: null-check ref pred measureInWindow — ak ref nie je ready, nastav krok bez pozície
        // aby onboarding nezmrazil obrazovku keď callback nikdy nepríde
        if (!ref?.current) {
            if (isMounted.current) {
                setOnboardingStep(step);
            }
            return;
        }

        ref.current.measureInWindow((x, y, width, height) => {
            // FIX 4: isMounted check aj v measureInWindow callback (asynchrónny)
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

        // FIX 5: Atomicky resetuj všetky onboarding stavy naraz — Modal sa hneď zatvorí
        // bez tohto sa mohol objaviť race condition kde Modal zostal viditeľný o jeden render dlhšie
        if (isMounted.current) {
            setOnboardingStep(-1);
            setOnboardingPhase(null);
            setTooltipPos({ x: 0, y: 0, width: 0, height: 0 });
        }
    };

    const currentSteps = onboardingPhase === 'before' ? ONBOARDING_STEPS_BEFORE : ONBOARDING_STEPS_AFTER;
    const tooltipBottom = tooltipPos.y > 400;

    const wardrobeAsOutfits: OutfitItem[] = wardrobeItems.map(item => ({
        id: item.id,
        image: item.image,
        name: item.name,
        category: (item as any).category ?? 'other',
        tags: item.name.toLowerCase().split(' '),
        fromWardrobe: true,
    }));

    const wishlistAsOutfits: OutfitItem[] = wishlistItems.map(item => ({
        id: item.id,
        image: item.image,
        name: item.name,
        tags: item.name.toLowerCase().split(' '),
    }));

    const getSheetItems = (): OutfitItem[] => {
        if (sheetSource === 'wardrobe') return wardrobeAsOutfits;
        if (sheetSource === 'wishlist') return wishlistAsOutfits;
        return SHOP_PRODUCTS;
    };

    const toggleSource = (s: Source) => {
        if (s === 'wardrobe' || s === 'wishlist') {
            const isFromThisSource = s === 'wardrobe'
                ? selectedItems.some(i => wardrobeAsOutfits.find(w => w.id === i.id))
                : selectedItems.some(i => wishlistAsOutfits.find(w => w.id === i.id));

            if (isFromThisSource) {
                setSelectedItems(prev =>
                    prev.filter(i =>
                        s === 'wardrobe'
                            ? !wardrobeAsOutfits.find(w => w.id === i.id)
                            : !wishlistAsOutfits.find(w => w.id === i.id)
                    )
                );
            } else {
                setSheetSource(s);
                setSheetVisible(true);
            }
            return;
        }

        if (s === 'shop') {
            const hasOtherSources = selectedItems.length > 0;
            if (sources.includes('shop') && hasOtherSources) {
                setSources(prev => prev.filter(x => x !== 'shop'));
            } else if (!sources.includes('shop')) {
                setSources(prev => [...prev, 'shop']);
            }
            setGenerated(false);
            setOutfits([]);
        }
    };

    const toggleItemSelection = (item: OutfitItem) => {
        setSelectedItems(prev =>
            prev.find(i => i.id === item.id)
                ? prev.filter(i => i.id !== item.id)
                : [...prev, item]
        );
    };

    const confirmSheetSelection = () => setSheetVisible(false);

    const getSourceItems = (): OutfitItem[] => {
        let items: OutfitItem[] = [];
        if (selectedItems.length > 0) items = [...items, ...selectedItems];
        if (sources.includes('shop')) items = [...items, ...SHOP_PRODUCTS];
        return items.filter((item, index, self) =>
            self.findIndex(i => i.id === item.id) === index
        );
    };

    const handleGenerate = () => {
        if (isPromptEmpty) return;

        setLoading(true);
        setGenerated(false);
        setAddedToCart(false);
        setInlineFeedbackRating(0);
        setInlineFeedbackSubmitted(false);

        setTimeout(async () => {
            // FIX 6: guard aj na začiatku async setTimeout callbacku
            if (!isMounted.current) return;

            const keywords = prompt.toLowerCase().split(' ').filter(k => k.length > 1);

            const scoreItem = (item: OutfitItem): number => {
                let score = 0;
                keywords.forEach(keyword => {
                    if (item.name.toLowerCase() === keyword) score += 5;
                    else if (item.name.toLowerCase().includes(keyword)) score += 3;
                    if (item.tags.includes(keyword)) score += 4;
                    else if (item.tags.some(tag => tag.includes(keyword) || keyword.includes(tag))) score += 2;
                });
                return score;
            };

            const sourceItems = getSourceItems();

            const scoredItems: ScoredItem[] = sourceItems
                .map(item => ({ ...item, score: scoreItem(item) }))
                .sort((a, b) => b.score - a.score);

            const wantsDress = keywords.some(k =>
                ['dress', 'elegant', 'formal', 'party', 'evening', 'night', 'gala'].includes(k)
            );
            const wantsSport = keywords.some(k =>
                ['sport', 'sporty', 'gym', 'workout', 'running', 'athletic', 'active'].includes(k)
            );
            const wantsCasual = keywords.some(k =>
                ['casual', 'everyday', 'relaxed', 'chill', 'basic', 'summer'].includes(k)
            );
            const wantsOffice = keywords.some(k =>
                ['office', 'work', 'business', 'professional', 'blazer'].includes(k)
            );
            const wantsParty = keywords.some(k =>
                ['party', 'club', 'going'].includes(k)
            );

            const byCategory = (cat: string): ScoredItem[] =>
                scoredItems.filter(i => i.category === cat);

            const shoes = byCategory('shoes');
            const pants = byCategory('pants');
            const tops = byCategory('top');
            const jackets = byCategory('jacket');
            const dresses = byCategory('dress');
            const sets = byCategory('set');

            let result: (OutfitItem | undefined)[] = [];

            if (wantsSport) {
                if (sets.length > 0) {
                    result = [
                        sets[0],
                        shoes.find(i => i.tags.includes('sport') || i.tags.includes('casual')) ?? shoes[0],
                        tops[0],
                        pants[0],
                    ];
                } else {
                    result = [
                        tops.find(i => i.tags.includes('sport') || i.tags.includes('casual')) ?? tops[0],
                        pants.find(i => i.tags.includes('sport') || i.tags.includes('casual')) ?? pants[0],
                        shoes.find(i => i.tags.includes('sport') || i.tags.includes('casual')) ?? shoes[0],
                        jackets.find(i => i.tags.includes('casual')) ?? jackets[0],
                    ];
                }
            } else if (wantsDress || wantsParty) {
                result = [
                    dresses.find(i => i.tags.includes('elegant') || i.tags.includes('formal')) ?? dresses[0] ?? tops.find(i => i.tags.includes('elegant')),
                    shoes.find(i => i.tags.includes('elegant') || i.tags.includes('boots')) ?? shoes[0],
                    jackets.find(i => i.tags.includes('elegant') || i.tags.includes('blazer')) ?? jackets[0],
                    tops.find(i => i.tags.includes('elegant') || i.tags.includes('minimalist')) ?? tops[0],
                ];
            } else if (wantsOffice) {
                result = [
                    jackets.find(i => i.tags.includes('blazer') || i.tags.includes('elegant')) ?? jackets[0],
                    pants.find(i => !i.tags.includes('skirt') && !i.tags.includes('floral')) ?? pants[0],
                    tops.find(i => i.tags.includes('elegant') || i.tags.includes('minimalist')) ?? tops[0],
                    shoes.find(i => i.tags.includes('elegant') || i.tags.includes('boots')) ?? shoes[0],
                ];
            } else if (wantsCasual) {
                result = [
                    pants.find(i => i.tags.includes('jeans') || i.tags.includes('casual')) ?? pants[0],
                    tops.find(i => i.tags.includes('casual') || i.tags.includes('streetwear')) ?? tops[0],
                    shoes.find(i => i.tags.includes('casual') || i.tags.includes('sport')) ?? shoes[0],
                    jackets.find(i => i.tags.includes('casual') || i.tags.includes('denim')) ?? jackets[0],
                ];
            } else {
                const usedCategories = new Set<string>();
                const defaultResult: OutfitItem[] = [];
                for (const item of scoredItems) {
                    if (defaultResult.length >= 4) break;
                    const cat = item.category ?? 'other';
                    if (!usedCategories.has(cat)) {
                        defaultResult.push(item);
                        usedCategories.add(cat);
                    }
                }
                result = defaultResult;
            }

            const seen = new Set<string>();
            const filtered: OutfitItem[] = result
                .filter((item): item is OutfitItem => !!item)
                .filter(item => {
                    if (seen.has(item.id)) return false;
                    seen.add(item.id);
                    return true;
                });

            const fallback = scoredItems.filter(i => !seen.has(i.id));
            while (filtered.length < 4 && fallback.length > 0) {
                filtered.push(fallback.shift()!);
            }

            if (!isMounted.current) return;
            setOutfits(filtered.slice(0, 4));
            setGenerated(true);
            setLoading(false);

            startAfterOnboarding();

            const userData = await AsyncStorage.getItem('currentUser');
            const email = userData ? JSON.parse(userData).email : 'unknown';

            if (email === 'test@test.com') {
                setTimeout(() => {
                    if (isMounted.current) setFeedbackVisible(true);
                }, 3000);
            } else {
                const countStr = await AsyncStorage.getItem(`builder_generate_count_${email}`);
                let count = parseInt(countStr ?? '0', 10);

                count += 1;
                await AsyncStorage.setItem(`builder_generate_count_${email}`, String(count));

                if (count % 2 === 0) {
                    setTimeout(() => {
                        if (isMounted.current) setFeedbackVisible(true);
                    }, 3000);
                }
            }
        }, 1800);
    };

    const saveFeedbackToStorage = async () => {
        const userData = await AsyncStorage.getItem('currentUser');
        const email = userData ? JSON.parse(userData).email : 'unknown';

        if (email !== 'test@test.com') {
            await AsyncStorage.setItem(`builder_feedback_shown_${email}`, 'true');
        }

        addBuilderFeedback();
    };

    const handleSubmitFeedback = async () => {
        await saveFeedbackToStorage();
        setHasShownFeedback(true);
        setFeedbackSubmitted(true);
        setTimeout(() => {
            if (!isMounted.current) return;
            setFeedbackVisible(false);
            setFeedbackSubmitted(false);
            setFeedbackRating(0);
            setSelectedChips([]);
            setRewardModalVisible(true);
        }, 2800);
    };

    const handleInlineFeedbackSubmit = async () => {
        if (inlineFeedbackRating === 0 || inlineFeedbackSubmitted) return;
        await saveFeedbackToStorage();
        setInlineFeedbackSubmitted(true);
        setRewardModalVisible(true);
    };

    const toggleChip = (chip: string) => {
        setSelectedChips(prev =>
            prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
        );
    };

    const regenerateItem = (index: number) => {
        const sourceItems = getSourceItems();
        const currentIds = outfits.map(o => o.id);
        const available = sourceItems.filter(i => !currentIds.includes(i.id));
        if (available.length === 0) return;
        const newItem = available[Math.floor(Math.random() * available.length)];
        setOutfits(prev => {
            const updated = [...prev];
            updated[index] = newItem;
            return updated;
        });
    };

    const handleClear = () => {
        setPrompt('');
        setOutfits([]);
        setGenerated(false);
        setAddedToCart(false);
        setInlineFeedbackRating(0);
        setInlineFeedbackSubmitted(false);
    };

    const handleAddToCart = () => {
        const shopItems = outfits.filter(i => !i.fromWardrobe);
        if (shopItems.length === 0) return;
        setCartModalVisible(true);
    };

    const handleConfirmAddToCart = (cartId: string) => {
        const shopItems = outfits.filter(i => !i.fromWardrobe);
        shopItems.forEach(item => {
            addProductToCart(cartId, {
                id: item.id + Date.now().toString(),
                name: item.name,
                price: 49.99,
                quantity: 1,
                image: item.image,
                note: 'Added from Outfit Builder',
            });
        });
        setCartModalVisible(false);
        setAddedToCart(true);
        setTimeout(() => {
            if (!isMounted.current) return;
            handleClear();
            router.replace({ pathname: '/cart_detail', params: { cartId } });
        }, 1500);
    };

    const handleItemPress = (item: OutfitItem) => {
        if (item.fromWardrobe) {
            router.push({ pathname: '/(tabs)/wardrobe_item', params: { itemId: item.id } });
        } else {
            router.push({
                pathname: '/(tabs)/product_detail',
                params: { productId: item.id, category: 'CLOTHING', subcategory: item.category ?? '', gender: 'WOMAN', from: 'builder' },
            });
        }
    };

    const shopItemsCount = outfits.filter(i => !i.fromWardrobe).length;
    const isShopActive = sources.includes('shop');
    const isWardrobeActive = selectedItems.some(i => wardrobeAsOutfits.find(w => w.id === i.id));
    const isWishlistActive = selectedItems.some(i => wishlistAsOutfits.find(w => w.id === i.id));

    const getButtonLabel = () => {
        if (loading) return 'Generating things for you...';
        if (generated) return 'REGENERATE';
        return 'GENERATE OUTFIT';
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Outfit Builder</Text>
                    <Text style={styles.headerSubtitle}>Pick a vibe and we'll build the perfect outfit for you ✨</Text>
                </View>

                <Text style={styles.sectionLabel}>Sources</Text>
                <View ref={sourcesRef} style={styles.sourceRow}>
                    {(['wardrobe', 'wishlist', 'shop'] as Source[]).map((s) => {
                        const isActive =
                            (s === 'shop' && isShopActive) ||
                            (s === 'wardrobe' && isWardrobeActive) ||
                            (s === 'wishlist' && isWishlistActive);
                        return (
                            <TouchableOpacity
                                key={s}
                                style={[styles.sourceButton, isActive && styles.sourceButtonActive]}
                                onPress={() => toggleSource(s)}
                            >
                                <Feather
                                    name={s === 'wardrobe' ? 'grid' : s === 'wishlist' ? 'heart' : 'shopping-bag'}
                                    size={14}
                                    color={isActive ? '#111' : '#999'}
                                />
                                <Text style={[styles.sourceButtonText, isActive && styles.sourceButtonTextActive]}>
                                    {s === 'wardrobe' ? 'Wardrobe' : s === 'wishlist' ? 'Wishlist' : 'Shop'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {selectedItems.length > 0 && (
                    <View style={styles.selectedPreview}>
                        <Text style={styles.selectedLabel}>Selected items ({selectedItems.length})</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {selectedItems.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={styles.selectedChip}
                                    onPress={() => toggleItemSelection(item)}
                                >
                                    <Image
                                        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                                        style={styles.selectedChipImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.selectedChipRemove}>
                                        <Feather name="x" size={10} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <Text style={styles.sectionLabel}>Describe your outfit</Text>

                <View ref={promptRef}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 12 }}
                        contentContainerStyle={{ gap: 8, paddingRight: 4 }}
                    >
                        {PRESET_PROMPTS.map(preset => (
                            <TouchableOpacity
                                key={preset.value}
                                style={[styles.presetChip, prompt === preset.value && styles.presetChipActive]}
                                onPress={() => setPrompt(prompt === preset.value ? '' : preset.value)}
                            >
                                <Text style={[styles.presetChipText, prompt === preset.value && styles.presetChipTextActive]}>
                                    {preset.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.inputWrapper}>
                        <Feather name="edit-2" size={16} color="#999" />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. casual summer outfit, elegant evening..."
                            placeholderTextColor="#999"
                            value={prompt}
                            onChangeText={setPrompt}
                            multiline
                        />
                        {prompt.length > 0 && (
                            <TouchableOpacity onPress={() => setPrompt('')}>
                                <Feather name="x" size={16} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View ref={generateRef}>
                    <TouchableOpacity
                        style={[
                            styles.generateButton,
                            loading && styles.generateButtonLoading,
                            isPromptEmpty && styles.generateButtonDisabled,
                            generated && !loading && styles.generateButtonRegenerate,
                        ]}
                        onPress={handleGenerate}
                        disabled={loading || isPromptEmpty}
                    >
                        <Feather name={generated && !loading ? 'refresh-cw' : 'zap'} size={16} color="#fff" />
                        <Text style={styles.generateButtonText}>{getButtonLabel()}</Text>
                    </TouchableOpacity>
                </View>

                {generated && outfits.length > 0 && (
                    <View style={styles.resultsSection}>
                        <Text style={styles.resultsTitle}>
                            {prompt.trim() ? `Results for "${prompt}"` : 'Suggested outfits'}
                        </Text>

                        <View style={styles.outfitsGrid}>
                            {outfits.map((item, index) => (
                                <View
                                    key={item.id}
                                    ref={index === 0 ? firstOutfitCardRef : null}
                                    style={styles.outfitCard}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => handleItemPress(item)}
                                        style={{ flex: 1 }}
                                    >
                                        <Image
                                            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                                            style={styles.outfitImage}
                                            resizeMode="cover"
                                        />

                                        <View
                                            ref={index === 0 ? firstOutfitRefreshRef : null}
                                            collapsable={false}
                                            style={styles.refreshAnchor}
                                        >
                                            <TouchableOpacity
                                                style={styles.regenerateItemButton}
                                                onPress={(e) => { e.stopPropagation(); regenerateItem(index); }}
                                            >
                                                <Feather name="refresh-cw" size={13} color="#111" />
                                            </TouchableOpacity>
                                        </View>

                                        {item.fromWardrobe ? (
                                            <View
                                                ref={index === 0 ? firstOutfitBadgeRef : null}
                                                collapsable={false}
                                                style={styles.wardrobeBadge}
                                            >
                                                <Text style={styles.wardrobeBadgeText}>My item</Text>
                                            </View>
                                        ) : (
                                            <View
                                                ref={index === 0 ? firstOutfitBadgeRef : null}
                                                collapsable={false}
                                                style={styles.shopBadge}
                                            >
                                                <Text style={styles.shopBadgeText}>Shop</Text>
                                            </View>
                                        )}

                                        <Text style={styles.outfitName} numberOfLines={2}>{item.name}</Text>
                                        <Text style={styles.outfitTapHint}>Tap to view details</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        <View ref={actionRowRef} style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionButtonOutline} onPress={handleClear}>
                                <Feather name="x" size={16} color="#111" />
                                <Text style={styles.actionButtonOutlineText}>Dismiss</Text>
                            </TouchableOpacity>

                            {addedToCart ? (
                                <ImageBackground
                                    source={require('../../assets/images_app/search.png')}
                                    style={styles.addedBackground}
                                    imageStyle={{ borderRadius: 20 }}
                                >
                                    <Feather name="check" size={14} color="#111" />
                                    <Text style={styles.addedButtonText}>ADDED!</Text>
                                </ImageBackground>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.actionButtonFill, shopItemsCount === 0 && styles.actionButtonDisabled]}
                                    onPress={handleAddToCart}
                                    disabled={shopItemsCount === 0}
                                >
                                    <Feather name="shopping-cart" size={16} color="#fff" />
                                    <Text style={styles.actionButtonFillText}>
                                        {shopItemsCount > 0 ? `Add to cart (${shopItemsCount})` : 'All from wardrobe'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {!generated && !loading && (
                    <View style={styles.emptyState}>
                        <Feather name="zap" size={40} color="#ccc" />
                        <Text style={styles.emptyStateText}>Select sources, describe your outfit and generate</Text>
                    </View>
                )}
            </ScrollView>

            {/* Onboarding Tooltip Modal */}
            {onboardingStep >= 0 && onboardingPhase !== null && (
                <Modal visible transparent animationType="fade">
                    <View style={styles.onboardingOverlay}>
                        <View
                            style={[
                                styles.onboardingHighlight,
                                {
                                    left: tooltipPos.x - 6,
                                    top: tooltipPos.y - 6,
                                    width: tooltipPos.width + 12,
                                    height: tooltipPos.height + 12,
                                },
                            ]}
                        />

                        <View
                            style={[
                                styles.onboardingCard,
                                tooltipBottom
                                    ? { bottom: 100 }
                                    : { top: tooltipPos.y + tooltipPos.height + 16 },
                            ]}
                        >
                            <View style={styles.onboardingHeader}>
                                <Text style={styles.onboardingStepLabel}>
                                    {onboardingStep + 1} / {currentSteps.length}
                                    {onboardingPhase === 'after' ? '  (results)' : ''}
                                </Text>
                                <TouchableOpacity onPress={() => finishOnboarding(onboardingPhase)}>
                                    <Text style={styles.onboardingSkip}>Skip</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.onboardingTitle}>
                                {currentSteps[onboardingStep].title}
                            </Text>
                            <Text style={styles.onboardingDescription}>
                                {currentSteps[onboardingStep].description}
                            </Text>

                            <View style={styles.onboardingDots}>
                                {currentSteps.map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.onboardingDot,
                                            i === onboardingStep && styles.onboardingDotActive,
                                        ]}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.onboardingButton}
                                onPress={() => showOnboardingStep(onboardingStep + 1, onboardingPhase)}
                            >
                                <Text style={styles.onboardingButtonText}>
                                    {onboardingStep === currentSteps.length - 1 ? 'Got it! 🎉' : 'Next →'}
                                </Text>
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
                                <Text style={styles.feedbackThanksSubtitle}>
                                    Your feedback helps us improve future outfit recommendations!
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.sheetTitle}>How was your outfit?</Text>
                                <Text style={styles.sheetSubtitle}>Rate the suggestions to help us improve</Text>
                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() => setFeedbackRating(star)}
                                            onPressIn={() => setFeedbackHoverRating(star)}
                                            onPressOut={() => setFeedbackHoverRating(0)}
                                        >
                                            <Feather
                                                name="star"
                                                size={36}
                                                color={star <= (feedbackHoverRating || feedbackRating) ? '#f2b55d' : '#d0d0d0'}
                                                style={{ marginHorizontal: 6 }}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {feedbackRating > 0 && (
                                    <>
                                        <Text style={styles.chipsLabel}>What can we improve?</Text>
                                        <View style={styles.chipsGrid}>
                                            {FEEDBACK_CHIPS.map(chip => (
                                                <TouchableOpacity
                                                    key={chip}
                                                    style={[styles.feedbackChip, selectedChips.includes(chip) && styles.feedbackChipActive]}
                                                    onPress={() => toggleChip(chip)}
                                                >
                                                    <Text style={[styles.feedbackChipText, selectedChips.includes(chip) && styles.feedbackChipTextActive]}>
                                                        {chip}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </>
                                )}
                                <TouchableOpacity
                                    style={[styles.submitButton, feedbackRating === 0 && styles.submitButtonDisabled]}
                                    onPress={handleSubmitFeedback}
                                    disabled={feedbackRating === 0}
                                >
                                    <Text style={styles.submitButtonText}>SEND FEEDBACK</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.skipButton}
                                    onPress={async () => {
                                        const userData = await AsyncStorage.getItem('currentUser');
                                        const email = userData ? JSON.parse(userData).email : 'unknown';
                                        await AsyncStorage.setItem(`builder_feedback_shown_${email}`, 'true');
                                        setFeedbackVisible(false);
                                    }}
                                >
                                    <Text style={styles.skipButtonText}>Skip</Text>
                                </TouchableOpacity>
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
                                <Text style={styles.rewardBadgePoints}>+5</Text>
                                <Text style={styles.rewardBadgeLabel}> points</Text>
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
                            <Text style={styles.sheetTitle}>
                                Select from {sheetSource === 'wardrobe' ? 'Wardrobe' : 'Wishlist'}
                            </Text>
                            <TouchableOpacity onPress={() => setSheetVisible(false)}>
                                <Feather name="x" size={22} color="#111" />
                            </TouchableOpacity>
                        </View>
                        {getSheetItems().length === 0 ? (
                            <View style={styles.emptySheet}>
                                <Feather name={sheetSource === 'wishlist' ? 'heart' : 'grid'} size={36} color="#ccc" />
                                <Text style={styles.emptySheetText}>
                                    {sheetSource === 'wishlist'
                                        ? 'Your wishlist is empty. Add items from the shop first.'
                                        : 'Your wardrobe is empty. Add items first.'}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={getSheetItems()}
                                keyExtractor={item => item.id}
                                numColumns={3}
                                contentContainerStyle={styles.sheetGrid}
                                renderItem={({ item }) => {
                                    const isSelected = !!selectedItems.find(i => i.id === item.id);
                                    return (
                                        <TouchableOpacity
                                            style={[styles.sheetItem, isSelected && styles.sheetItemSelected]}
                                            onPress={() => toggleItemSelection(item)}
                                        >
                                            <Image
                                                source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                                                style={styles.sheetItemImage}
                                                resizeMode="cover"
                                            />
                                            {isSelected && (
                                                <View style={styles.sheetItemCheck}>
                                                    <Feather name="check" size={14} color="#fff" />
                                                </View>
                                            )}
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

            {/* Cart Modal */}
            <Modal visible={cartModalVisible} animationType="slide" transparent onRequestClose={() => setCartModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setCartModalVisible(false)} />
                    <View style={styles.bottomSheet}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Add to which cart?</Text>
                            <TouchableOpacity onPress={() => setCartModalVisible(false)}>
                                <Feather name="x" size={22} color="#111" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            <TouchableOpacity
                                style={styles.createNewCartButton}
                                onPress={() => {
                                    setCartModalVisible(false);
                                    router.push({ pathname: '/(tabs)/cart_create', params: { returnToBuilder: 'true' } });
                                }}
                            >
                                <Feather name="plus" size={16} color="#fff" />
                                <Text style={styles.createNewCartButtonText}>Create new cart</Text>
                            </TouchableOpacity>
                            {carts.length === 0 ? (
                                <Text style={styles.noCartsText}>No carts yet. Create one first!</Text>
                            ) : (
                                carts.map(cart => (
                                    <TouchableOpacity
                                        key={cart.id}
                                        style={styles.cartSelectItem}
                                        onPress={() => handleConfirmAddToCart(cart.id)}
                                    >
                                        <View style={styles.cartSelectInfo}>
                                            <Text style={styles.cartSelectName}>{cart.name}</Text>
                                            <Text style={styles.cartSelectSub}>Budget: €{cart.budget} · {cart.products.length} items</Text>
                                        </View>
                                        <Feather name="chevron-right" size={18} color="#8a8a8a" />
                                    </TouchableOpacity>
                                ))
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
    sourceButton: {
        flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#e9e9e9',
        alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
        flexDirection: 'row', justifyContent: 'center', gap: 6,
    },
    sourceButtonActive: { backgroundColor: '#fff', borderColor: '#111' },
    sourceButtonText: { fontSize: 13, fontWeight: '600', color: '#999' },
    sourceButtonTextActive: { color: '#111' },
    selectedPreview: { marginBottom: 16 },
    selectedLabel: { fontSize: 13, color: '#393939', marginBottom: 8, fontWeight: '600' },
    selectedChip: { marginRight: 8, position: 'relative' },
    selectedChipImage: { width: 56, height: 56, borderRadius: 10 },
    selectedChipRemove: {
        position: 'absolute', top: -4, right: -4, backgroundColor: '#111',
        borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center',
    },
    presetChip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#e9e9e9', borderWidth: 1.5, borderColor: 'transparent',
    },
    presetChipActive: { backgroundColor: '#fff', borderColor: '#111' },
    presetChipText: { fontSize: 13, color: '#666', fontWeight: '500' },
    presetChipTextActive: { color: '#111', fontWeight: '700' },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#e9e9e9',
        borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, gap: 10,
    },
    input: { flex: 1, fontSize: 15, color: '#111', maxHeight: 80 },
    promptHint: { fontSize: 12, color: '#8a8a8a', textAlign: 'center', marginBottom: 12, marginTop: 2 },
    generateButton: {
        backgroundColor: '#111', paddingVertical: 16, borderRadius: 20,
        alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24,
    },
    generateButtonLoading: { backgroundColor: '#555' },
    generateButtonDisabled: { backgroundColor: '#bdbdbd' },
    generateButtonRegenerate: { backgroundColor: '#333' },
    generateButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    resultsSection: { marginTop: 8 },
    resultsTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 16 },
    outfitsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    outfitCard: { width: '48%', marginBottom: 16, position: 'relative' },
    outfitImage: { width: '100%', height: 180, borderRadius: 14, backgroundColor: '#e9e9e9' },
    refreshAnchor: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 30,
        height: 30,
        zIndex: 3,
    },
    regenerateItemButton: {
        width: 30,
        height: 30,
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    wardrobeBadge: {
        position: 'absolute', top: 8, left: 8, backgroundColor: '#111',
        borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
    },
    wardrobeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
    shopBadge: {
        position: 'absolute', top: 8, left: 8, backgroundColor: '#f2b55d',
        borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
    },
    shopBadgeText: { color: '#111', fontSize: 10, fontWeight: '700' },
    outfitName: { marginTop: 8, fontSize: 13, color: '#111', fontWeight: '500' },
    outfitTapHint: { fontSize: 11, color: '#aaa', marginTop: 2 },
    actionRow: { flexDirection: 'row', gap: 12, marginTop: 24, alignItems: 'center' },
    actionButtonOutline: {
        flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#111',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    actionButtonOutlineText: { color: '#111', fontWeight: '600', fontSize: 14 },
    actionButtonFill: {
        flex: 1, height: 52, borderRadius: 14, backgroundColor: '#111',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    actionButtonDisabled: { backgroundColor: '#ccc' },
    actionButtonFillText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    addedBackground: {
        flex: 1, height: 52, borderRadius: 20, overflow: 'hidden',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    },
    addedButtonText: { color: '#111', fontSize: 14, fontWeight: '700' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 14 },
    emptyStateText: { fontSize: 14, color: '#aaa', textAlign: 'center' },
    feedbackCard: {
        marginTop: 18, backgroundColor: '#e9e9e9',
        borderRadius: 18, paddingVertical: 16, paddingHorizontal: 14, alignItems: 'center',
    },
    feedbackTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 12, textAlign: 'center' },
    inlineStarsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    starIcon: { marginHorizontal: 6 },
    feedbackButton: {
        minWidth: 120, height: 44, borderRadius: 14, backgroundColor: '#111',
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20,
    },
    feedbackButtonDisabled: { backgroundColor: '#bdbdbd' },
    feedbackButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    onboardingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    onboardingHighlight: {
        position: 'absolute',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#f2b55d',
        backgroundColor: 'rgba(242,181,93,0.1)',
    },
    onboardingCard: {
        position: 'absolute', left: 16, right: 16,
        backgroundColor: '#fff', borderRadius: 20, padding: 20,
    },
    onboardingHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 10,
    },
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
    bottomSheet: {
        backgroundColor: '#f3f3f3', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingHorizontal: 18, paddingBottom: 34, maxHeight: '85%',
    },
    sheetHandle: {
        width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc',
        alignSelf: 'center', marginTop: 12, marginBottom: 16,
    },
    sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
    sheetSubtitle: { fontSize: 13, color: '#8a8a8a', marginTop: 4, marginBottom: 20 },
    starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
    chipsLabel: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 12 },
    chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    feedbackChip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#e9e9e9', borderWidth: 1.5, borderColor: 'transparent',
    },
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
    rewardOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
    },
    rewardCard: {
        backgroundColor: '#f3f3f3', borderRadius: 24, padding: 24, alignItems: 'center', width: '100%',
    },
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
    sheetItemCheck: {
        position: 'absolute', top: 6, right: 6, backgroundColor: '#111',
        borderRadius: 10, width: 22, height: 22, justifyContent: 'center', alignItems: 'center',
    },
    sheetItemName: { fontSize: 11, color: '#111', padding: 4, fontWeight: '500' },
    confirmButton: { backgroundColor: '#111', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 8 },
    confirmButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    createNewCartButton: {
        backgroundColor: '#111', paddingVertical: 14, borderRadius: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12,
    },
    createNewCartButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    cartSelectItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#e9e9e9',
        borderRadius: 14, padding: 14, marginBottom: 10,
    },
    cartSelectInfo: { flex: 1 },
    cartSelectName: { fontSize: 15, fontWeight: '700', color: '#111' },
    cartSelectSub: { fontSize: 12, color: '#6a6a6a', marginTop: 2 },
    noCartsText: { textAlign: 'center', color: '#999', fontSize: 14, marginTop: 20 },
});
