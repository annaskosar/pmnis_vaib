import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ImageBackground,
    Animated,
    Dimensions,
    PanResponder,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Asset } from 'expo-asset';
import { useFocusEffect } from '@react-navigation/native';

type PlaygroundStyleKey =
    | 'goth'
    | 'grunge_rebel'
    | 'y2k_glam'
    | 'street_cool'
    | 'clean_girl'
    | 'old_money'
    | 'dark_academia'
    | 'coquette_soft';

type PlaygroundCard = {
    id: string;
    title: string;
    subtitle: string;
    styleKey: PlaygroundStyleKey;
    swipeImage: any;
    resultImage: any;
};

type PlaygroundStyleConfig = {
    id: string;
    title: string;
    subtitle: string;
    styleKey: PlaygroundStyleKey;
    imageA: any;
    imageB: any;
    resultSubtitle: string;
};

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.24;

const allStyleConfigs: PlaygroundStyleConfig[] = [
    {
        id: '1',
        title: 'Goth',
        subtitle: 'Dark layers, leather textures and bold, moody energy.',
        styleKey: 'goth',
        imageA: require('../../assets/playground/goth.jpg'),
        imageB: require('../../assets/playground/goth2.jpg'),
        resultSubtitle:
            'Dark, bold and a little mysterious — this energy just clicks with you right now.',
    },
    {
        id: '2',
        title: 'Grunge Rebel',
        subtitle: 'Ripped, messy and effortlessly anti-everything.',
        styleKey: 'grunge_rebel',
        imageA: require('../../assets/playground/rebel.jpg'),
        imageB: require('../../assets/playground/rebel2.jpg'),
        resultSubtitle:
            'Messy layers, raw attitude and not caring too much — exactly your vibe.',
    },
    {
        id: '3',
        title: 'Y2K Glam',
        subtitle: 'Shiny, playful and iconic 2000s main character energy.',
        styleKey: 'y2k_glam',
        imageA: require('../../assets/playground/y2k.jpg'),
        imageB: require('../../assets/playground/y2k2.jpg'),
        resultSubtitle:
            'Playful, confident and a little extra — you’re giving main character energy.',
    },
    {
        id: '4',
        title: 'Street Cool',
        subtitle: 'Oversized fits, layers and confident everyday drip.',
        styleKey: 'street_cool',
        imageA: require('../../assets/playground/street.jpg'),
        imageB: require('../../assets/playground/street2.jpg'),
        resultSubtitle:
            'Effortless layers, oversized fits and quiet confidence — you just get it.',
    },
    {
        id: '5',
        title: 'Clean Girl',
        subtitle: 'Slick, minimal and effortlessly put-together.',
        styleKey: 'clean_girl',
        imageA: require('../../assets/playground/clean.jpg'),
        imageB: require('../../assets/playground/clean2.jpg'),
        resultSubtitle:
            'Minimal, polished and put-together — your energy is calm but powerful.',
    },
    {
        id: '6',
        title: 'Old Money',
        subtitle: 'Timeless, elegant and quietly luxurious.',
        styleKey: 'old_money',
        imageA: require('../../assets/playground/old_money.jpg'),
        imageB: require('../../assets/playground/old_money2.jpg'),
        resultSubtitle:
            'Timeless, elegant and understated — luxury without trying too hard.',
    },
    {
        id: '7',
        title: 'Dark Academia',
        subtitle: 'Blazers, books and intellectual vintage mood.',
        styleKey: 'dark_academia',
        imageA: require('../../assets/playground/academia.jpg'),
        imageB: require('../../assets/playground/academia2.jpg'),
        resultSubtitle:
            'Intellectual, moody and aesthetic — like you belong in a classic novel.',
    },
    {
        id: '8',
        title: 'Coquette Soft',
        subtitle: 'Delicate, feminine and softly romantic aesthetic.',
        styleKey: 'coquette_soft',
        imageA: require('../../assets/playground/cot.jpg'),
        imageB: require('../../assets/playground/cot2.jpg'),
        resultSubtitle:
            'Soft, feminine and a little dreamy — delicate but still intentional.',
    },
];

const shuffleArray = <T,>(array: T[]) => {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
};

const buildRandomPlaygroundCards = (): PlaygroundCard[] => {
    const shuffled = shuffleArray(allStyleConfigs).slice(0, 4);

    return shuffled.map((style) => {
        const useAForSwipe = Math.random() > 0.5;

        return {
            id: style.id,
            title: style.title,
            subtitle: style.subtitle,
            styleKey: style.styleKey,
            swipeImage: useAForSwipe ? style.imageA : style.imageB,
            resultImage: useAForSwipe ? style.imageB : style.imageA,
        };
    });
};

export default function PlaygroundSwipeScreen() {
    const router = useRouter();

    const position = React.useRef(new Animated.ValueXY()).current;

    const [activeCards, setActiveCards] = React.useState<PlaygroundCard[]>(() =>
        buildRandomPlaygroundCards()
    );
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [finished, setFinished] = React.useState(false);
    const [burstType, setBurstType] = React.useState<'like' | 'skip' | null>(null);
    const [imagesReady, setImagesReady] = React.useState(false);
    const [showResultCard, setShowResultCard] = React.useState(false);
    const [showResultConfetti, setShowResultConfetti] = React.useState(false);

    const [scores, setScores] = React.useState<Record<PlaygroundStyleKey, number>>({
        goth: 0,
        grunge_rebel: 0,
        y2k_glam: 0,
        street_cool: 0,
        clean_girl: 0,
        old_money: 0,
        dark_academia: 0,
        coquette_soft: 0,
    });

    useFocusEffect(
        React.useCallback(() => {
            const newCards = buildRandomPlaygroundCards();

            setActiveCards(newCards);
            setCurrentIndex(0);
            setFinished(false);
            setShowResultCard(false);
            setShowResultConfetti(false);

            setScores({
                goth: 0,
                grunge_rebel: 0,
                y2k_glam: 0,
                street_cool: 0,
                clean_girl: 0,
                old_money: 0,
                dark_academia: 0,
                coquette_soft: 0,
            });

            position.setValue({ x: 0, y: 0 });

            return () => {};
        }, [position])
    );

    const burst1 = React.useRef(new Animated.Value(0)).current;
    const burst2 = React.useRef(new Animated.Value(0)).current;
    const burst3 = React.useRef(new Animated.Value(0)).current;
    const burst4 = React.useRef(new Animated.Value(0)).current;
    const burst5 = React.useRef(new Animated.Value(0)).current;
    const burst6 = React.useRef(new Animated.Value(0)).current;

    const pulse = React.useRef(new Animated.Value(1)).current;

    const currentCard = activeCards[currentIndex];

    React.useEffect(() => {
        if (!finished || showResultCard) return;

        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1.22,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ])
        );

        pulseLoop.start();

        return () => {
            pulseLoop.stop();
            pulse.setValue(1);
        };
    }, [finished, showResultCard, pulse]);

    const CONFETTI_COUNT = 28;

    const CONFETTI_COLORS = [
        '#111111',
        '#ff4d6d',
        '#ffb703',
        '#8338ec',
        '#3a86ff',
        '#06d6a0',
        '#fb5607',
        '#ff006e',
    ];

    const confettiPieces = React.useMemo(
        () =>
            Array.from({ length: CONFETTI_COUNT }, (_, index) => {
                const spreadX = (Math.random() - 0.5) * width * 1.4;
                const spreadY = -(120 + Math.random() * 260);
                const rotateEnd = `${Math.random() * 520 - 260}deg`;
                const scale = 0.7 + Math.random() * 0.9;
                const size = 10 + Math.random() * 10;
                const color =
                    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
                const shape = Math.random() > 0.5 ? '•' : '✦';

                return {
                    id: `confetti-${index}`,
                    spreadX,
                    spreadY,
                    rotateEnd,
                    scale,
                    size,
                    color,
                    shape,
                };
            }),
        []
    );

    const confettiAnims = React.useRef(
        Array.from({ length: CONFETTI_COUNT }, () => new Animated.Value(0))
    ).current;

    const rotate = position.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: ['-10deg', '0deg', '10deg'],
        extrapolate: 'clamp',
    });

    const likeOpacity = position.x.interpolate({
        inputRange: [0, SWIPE_THRESHOLD],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const skipOpacity = position.x.interpolate({
        inputRange: [-SWIPE_THRESHOLD, 0],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const likeButtonScale = position.x.interpolate({
        inputRange: [0, SWIPE_THRESHOLD],
        outputRange: [1, 1.12],
        extrapolate: 'clamp',
    });

    const skipButtonScale = position.x.interpolate({
        inputRange: [-SWIPE_THRESHOLD, 0],
        outputRange: [1.12, 1],
        extrapolate: 'clamp',
    });

    const likeButtonOpacity = position.x.interpolate({
        inputRange: [0, SWIPE_THRESHOLD],
        outputRange: [1, 0.92],
        extrapolate: 'clamp',
    });

    const skipButtonOpacity = position.x.interpolate({
        inputRange: [-SWIPE_THRESHOLD, 0],
        outputRange: [0.92, 1],
        extrapolate: 'clamp',
    });

    const cardAnimatedStyle = {
        transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
        ],
    };

    React.useEffect(() => {
        let isMounted = true;

        const preloadImages = async () => {
            try {
                await Promise.all(
                    allStyleConfigs.flatMap((style) => [
                        Asset.fromModule(style.imageA).downloadAsync(),
                        Asset.fromModule(style.imageB).downloadAsync(),
                    ])
                );

                await Asset.fromModule(
                    require('../../assets/images_app/search.png')
                ).downloadAsync();

                if (isMounted) {
                    setImagesReady(true);
                }
            } catch (error) {
                if (isMounted) {
                    setImagesReady(true);
                }
            }
        };

        preloadImages();

        return () => {
            isMounted = false;
        };
    }, []);

    const goToNextCard = (updatedScores: Record<PlaygroundStyleKey, number>) => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= activeCards.length) {
            setScores(updatedScores);
            setFinished(true);
        } else {
            setScores(updatedScores);
            setCurrentIndex(nextIndex);

            setTimeout(() => {
                position.setValue({ x: 0, y: 0 });
            }, 2);
        }
    };

    const runBurst = (type: 'like' | 'skip') => {
        setBurstType(type);

        burst1.setValue(0);
        burst2.setValue(0);
        burst3.setValue(0);
        burst4.setValue(0);
        burst5.setValue(0);
        burst6.setValue(0);

        Animated.parallel([
            Animated.timing(burst1, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(burst2, { toValue: 1, duration: 560, useNativeDriver: true }),
            Animated.timing(burst3, { toValue: 1, duration: 620, useNativeDriver: true }),
            Animated.timing(burst4, { toValue: 1, duration: 520, useNativeDriver: true }),
            Animated.timing(burst5, { toValue: 1, duration: 580, useNativeDriver: true }),
            Animated.timing(burst6, { toValue: 1, duration: 640, useNativeDriver: true }),
        ]).start(() => {
            setBurstType(null);
        });
    };

    const runResultConfetti = () => {
        setShowResultConfetti(true);

        confettiAnims.forEach((anim) => anim.setValue(0));

        Animated.parallel(
            confettiAnims.map((anim, index) =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 900 + (index % 6) * 70,
                    useNativeDriver: true,
                })
            )
        ).start(() => {
            setShowResultConfetti(false);
        });
    };

    const openResultCard = () => {
        runResultConfetti();

        setTimeout(() => {
            setShowResultCard(true);
        }, 180);
    };

    const animateOut = (direction: 'left' | 'right', choice: 'skip' | 'like') => {
        if (!currentCard) return;

        let points = 0;
        if (choice === 'like') points = 2;

        const updatedScores = {
            ...scores,
            [currentCard.styleKey]: scores[currentCard.styleKey] + points,
        };

        runBurst(choice);

        Animated.timing(position, {
            toValue: {
                x: direction === 'right' ? width * 1.4 : -width * 1.4,
                y: direction === 'right' ? 40 : 20,
            },
            duration: 220,
            useNativeDriver: false,
        }).start(() => {
            goToNextCard(updatedScores);
        });
    };

    const handleChoice = (choice: 'skip' | 'maybe' | 'like') => {
        if (!currentCard) return;

        let points = 0;
        if (choice === 'maybe') points = 1;
        if (choice === 'like') points = 2;

        const updatedScores = {
            ...scores,
            [currentCard.styleKey]: scores[currentCard.styleKey] + points,
        };

        if (choice === 'skip') {
            runBurst('skip');
            Animated.timing(position, {
                toValue: { x: -width * 1.2, y: 10 },
                duration: 220,
                useNativeDriver: false,
            }).start(() => goToNextCard(updatedScores));
            return;
        }

        if (choice === 'like') {
            runBurst('like');
            Animated.timing(position, {
                toValue: { x: width * 1.2, y: 10 },
                duration: 220,
                useNativeDriver: false,
            }).start(() => goToNextCard(updatedScores));
            return;
        }

        Animated.sequence([
            Animated.spring(position, {
                toValue: { x: 0, y: -10 },
                useNativeDriver: false,
                bounciness: 10,
            }),
            Animated.spring(position, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
            }),
        ]).start(() => {
            goToNextCard(updatedScores);
        });
    };

    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_, gesture) =>
                    Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8,

                onPanResponderMove: (_, gesture) => {
                    position.setValue({ x: gesture.dx, y: gesture.dy });
                },

                onPanResponderRelease: (_, gesture) => {
                    if (gesture.dx > SWIPE_THRESHOLD) {
                        animateOut('right', 'like');
                    } else if (gesture.dx < -SWIPE_THRESHOLD) {
                        animateOut('left', 'skip');
                    } else {
                        Animated.spring(position, {
                            toValue: { x: 0, y: 0 },
                            friction: 5,
                            useNativeDriver: false,
                        }).start();
                    }
                },
            }),
        [position, currentCard, currentIndex, scores]
    );

    const matchedStyle = (
        Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'goth'
    ) as PlaygroundStyleKey;

    const matchedStyleConfig = allStyleConfigs.find(
        (item) => item.styleKey === matchedStyle
    );

    const matchedActiveCard = activeCards.find(
        (item) => item.styleKey === matchedStyle
    );

    const result = {
        matchLabel: 'You matched with',
        styleName: matchedStyleConfig?.title ?? 'Goth',
        subtitle:
            matchedStyleConfig?.resultSubtitle ??
            'Dark, bold and a little mysterious — this energy just clicks with you right now.',
        image:
            matchedActiveCard?.resultImage ??
            require('../../assets/playground/goth2.jpg'),
    };

    const handleRestart = () => {
        setActiveCards(buildRandomPlaygroundCards());
        setCurrentIndex(0);
        setShowResultCard(false);
        setShowResultConfetti(false);
        setFinished(false);
        setScores({
            goth: 0,
            grunge_rebel: 0,
            y2k_glam: 0,
            street_cool: 0,
            clean_girl: 0,
            old_money: 0,
            dark_academia: 0,
            coquette_soft: 0,
        });
        position.setValue({ x: 0, y: 0 });
    };

    if (!imagesReady) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loaderWrap}>
                    <Text style={styles.loaderText}>Loading playground...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!currentCard && !finished) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loaderWrap}>
                    <Text style={styles.loaderText}>Loading playground...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (finished) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={styles.backButtonDark}
                            onPress={() => router.back()}
                        >
                            <Feather name="arrow-left" size={22} color="#111" />
                        </TouchableOpacity>

                        <Text style={styles.headerTitleLight}>Playground</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <>
                        {!showResultCard ? (
                            <View style={styles.resultRevealWrap}>
                                <Animated.View style={{ transform: [{ scale: pulse }] }}>
                                    <TouchableOpacity
                                        style={styles.resultGiftButton}
                                        onPress={openResultCard}
                                        activeOpacity={0.9}
                                    >
                                        <Feather name="gift" size={55} color="#fff" />
                                    </TouchableOpacity>
                                </Animated.View>

                                <Text style={styles.resultRevealTitle}>Your result is ready</Text>
                                <Text style={styles.resultRevealSubtitle}>
                                    Tap to unwrap your style match
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.resultCard}>
                                <Text style={styles.resultMatchLabel}>{result.matchLabel}</Text>

                                <View style={styles.resultStyleRow}>
                                    <Text style={styles.resultStar}>✦</Text>
                                    <Text style={styles.resultStyleName}>{result.styleName}</Text>
                                    <Text style={styles.resultStar}>✦</Text>
                                </View>

                                <ImageBackground
                                    source={result.image}
                                    style={styles.resultImage}
                                    imageStyle={styles.resultImageStyle}
                                    resizeMode="cover"
                                />

                                <Text style={styles.resultSubtitle}>{result.subtitle}</Text>

                                <TouchableOpacity
                                    style={styles.primaryButton}
                                    onPress={() =>
                                        router.push({
                                            pathname: '/search_items',
                                            params: {
                                                style: matchedStyle,
                                                fromPlayground: '1',
                                                gender: 'WOMAN',
                                            },
                                        })
                                    }
                                >
                                    <Text style={styles.primaryButtonText}>
                                        SEE SELECTED PIECES
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.secondaryButton}
                                    onPress={handleRestart}
                                >
                                    <Text style={styles.secondaryButtonText}>
                                        TRY ANOTHER VIBE
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {showResultConfetti && (
                            <View style={styles.resultConfettiLayer} pointerEvents="none">
                                {confettiPieces.map((piece, index) => {
                                    const anim = confettiAnims[index];

                                    return (
                                        <Animated.Text
                                            key={piece.id}
                                            style={[
                                                styles.resultConfetti,
                                                {
                                                    color: piece.color,
                                                    fontSize: piece.size,
                                                    transform: [
                                                        {
                                                            translateX: anim.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: [0, piece.spreadX],
                                                            }),
                                                        },
                                                        {
                                                            translateY: anim.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: [0, piece.spreadY],
                                                            }),
                                                        },
                                                        {
                                                            rotate: anim.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: ['0deg', piece.rotateEnd],
                                                            }),
                                                        },
                                                        {
                                                            scale: anim.interpolate({
                                                                inputRange: [0, 0.2, 1],
                                                                outputRange: [0.2, piece.scale, piece.scale * 0.9],
                                                            }),
                                                        },
                                                    ],
                                                    opacity: anim.interpolate({
                                                        inputRange: [0, 0.08, 0.85, 1],
                                                        outputRange: [0, 1, 1, 0],
                                                    }),
                                                },
                                            ]}
                                        >
                                            {piece.shape}
                                        </Animated.Text>
                                    );
                                })}
                            </View>
                        )}
                    </>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButtonDark}
                        onPress={() => router.back()}
                    >
                        <Feather name="arrow-left" size={22} color="#111" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitleLight}>Playground</Text>
                    <Text style={styles.counterTextLight}>
                        {currentIndex + 1}/{activeCards.length}
                    </Text>
                </View>

                <View style={styles.progressTrackDark}>
                    <View
                        style={[
                            styles.progressFillLight,
                            {
                                width: `${((currentIndex + 1) / activeCards.length) * 100}%`,
                            },
                        ]}
                    />
                </View>

                <View style={styles.contentArea}>
                    <View style={styles.cardStage}>
                        <Animated.View
                            style={[styles.cardWrap, cardAnimatedStyle]}
                            {...panResponder.panHandlers}
                        >
                            <ImageBackground
                                source={currentCard.swipeImage}
                                style={styles.card}
                                imageStyle={styles.cardImage}
                                resizeMode="cover"
                            >
                                <LinearGradient
                                    colors={[
                                        'rgba(0,0,0,0.05)',
                                        'rgba(0,0,0,0.18)',
                                        'rgba(0,0,0,0.35)',
                                        'rgba(0,0,0,0.70)',
                                    ]}
                                    locations={[0, 0.35, 0.68, 1]}
                                    style={StyleSheet.absoluteFillObject}
                                />

                                <Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}>
                                    <Text style={styles.likeBadgeText}>LIKE</Text>
                                </Animated.View>

                                <Animated.View style={[styles.skipBadge, { opacity: skipOpacity }]}>
                                    <Text style={styles.skipBadgeText}>SKIP</Text>
                                </Animated.View>

                                <View style={styles.cardTopBadge}>
                                    <Text style={styles.cardTopBadgeText}>Style exploration mode</Text>
                                </View>

                                <View style={styles.cardBottomContent}>
                                    <Text style={styles.cardTitle}>{currentCard.title}</Text>
                                    <Text style={styles.cardSubtitle}>{currentCard.subtitle}</Text>
                                    <Text style={styles.cardQuestion}>
                                        Does this vibe match you today?
                                    </Text>
                                </View>
                            </ImageBackground>
                        </Animated.View>
                    </View>

                    <View style={styles.bottomPanel}>
                        <View style={styles.actionsRow}>
                            <Animated.View
                                style={[
                                    styles.actionSlot,
                                    {
                                        transform: [{ scale: skipButtonScale }],
                                        opacity: skipButtonOpacity,
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.skipButton]}
                                    onPress={() => handleChoice('skip')}
                                >
                                    <Feather name="x" size={18} color="#fff" />
                                    <Text style={styles.skipButtonText}>SKIP</Text>
                                </TouchableOpacity>
                            </Animated.View>

                            <View style={styles.actionSlot}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.maybeButton]}
                                    onPress={() => handleChoice('maybe')}
                                >
                                    <Feather name="help-circle" size={18} color="#111" />
                                    <Text style={styles.maybeButtonText}>MAYBE</Text>
                                </TouchableOpacity>
                            </View>

                            <Animated.View
                                style={[
                                    styles.actionSlot,
                                    {
                                        transform: [{ scale: likeButtonScale }],
                                        opacity: likeButtonOpacity,
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleChoice('like')}
                                >
                                    <ImageBackground
                                        source={require('../../assets/images_app/search.png')}
                                        style={styles.likeBg}
                                        imageStyle={{ borderRadius: 18 }}
                                    >
                                        <Feather name="heart" size={18} color="#fff" />
                                        <Text style={styles.likeButtonText}>LIKE</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>

                        <Text style={styles.helperText}>
                            Swipe left to skip, right to like.
                        </Text>
                    </View>
                </View>

                <View style={styles.burstLayer} pointerEvents="none">
                    {burstType && (
                        <>
                            <Animated.Text
                                style={[
                                    styles.burstIcon,
                                    burstType === 'like' ? styles.burstLike : styles.burstSkip,
                                    {
                                        transform: [
                                            {
                                                translateY: burst1.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -70],
                                                }),
                                            },
                                            {
                                                translateX: burst1.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -24],
                                                }),
                                            },
                                            {
                                                scale: burst1.interpolate({
                                                    inputRange: [0, 0.3, 1],
                                                    outputRange: [0.6, 1.1, 0.9],
                                                }),
                                            },
                                        ],
                                        opacity: burst1.interpolate({
                                            inputRange: [0, 0.15, 1],
                                            outputRange: [0, 1, 0],
                                        }),
                                    },
                                ]}
                            >
                                {burstType === 'like' ? '♥' : '✕'}
                            </Animated.Text>

                            <Animated.Text
                                style={[
                                    styles.burstIcon,
                                    burstType === 'like' ? styles.burstLike : styles.burstSkip,
                                    {
                                        transform: [
                                            {
                                                translateY: burst2.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -88],
                                                }),
                                            },
                                            {
                                                translateX: burst2.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 0],
                                                }),
                                            },
                                            {
                                                scale: burst2.interpolate({
                                                    inputRange: [0, 0.3, 1],
                                                    outputRange: [0.6, 1.15, 0.95],
                                                }),
                                            },
                                        ],
                                        opacity: burst2.interpolate({
                                            inputRange: [0, 0.15, 1],
                                            outputRange: [0, 1, 0],
                                        }),
                                    },
                                ]}
                            >
                                {burstType === 'like' ? '♥' : '✕'}
                            </Animated.Text>

                            <Animated.Text
                                style={[
                                    styles.burstIcon,
                                    burstType === 'like' ? styles.burstLike : styles.burstSkip,
                                    {
                                        transform: [
                                            {
                                                translateY: burst3.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -72],
                                                }),
                                            },
                                            {
                                                translateX: burst3.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 24],
                                                }),
                                            },
                                            {
                                                scale: burst3.interpolate({
                                                    inputRange: [0, 0.3, 1],
                                                    outputRange: [0.6, 1.05, 0.85],
                                                }),
                                            },
                                        ],
                                        opacity: burst3.interpolate({
                                            inputRange: [0, 0.15, 1],
                                            outputRange: [0, 1, 0],
                                        }),
                                    },
                                ]}
                            >
                                {burstType === 'like' ? '♥' : '✕'}
                            </Animated.Text>

                            <Animated.Text
                                style={[
                                    styles.burstIcon,
                                    burstType === 'like' ? styles.burstLike : styles.burstSkip,
                                    {
                                        transform: [
                                            {
                                                translateY: burst4.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -100],
                                                }),
                                            },
                                            {
                                                translateX: burst4.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -40],
                                                }),
                                            },
                                        ],
                                        opacity: burst4.interpolate({
                                            inputRange: [0, 0.2, 1],
                                            outputRange: [0, 1, 0],
                                        }),
                                    },
                                ]}
                            >
                                {burstType === 'like' ? '♥' : '✕'}
                            </Animated.Text>

                            <Animated.Text
                                style={[
                                    styles.burstIcon,
                                    burstType === 'like' ? styles.burstLike : styles.burstSkip,
                                    {
                                        transform: [
                                            {
                                                translateY: burst5.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -110],
                                                }),
                                            },
                                            {
                                                translateX: burst5.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 40],
                                                }),
                                            },
                                            {
                                                scale: burst5.interpolate({
                                                    inputRange: [0, 0.3, 1],
                                                    outputRange: [0.5, 1.3, 0.9],
                                                }),
                                            },
                                        ],
                                        opacity: burst5.interpolate({
                                            inputRange: [0, 0.2, 1],
                                            outputRange: [0, 1, 0],
                                        }),
                                    },
                                ]}
                            >
                                {burstType === 'like' ? '♥' : '✕'}
                            </Animated.Text>

                            <Animated.Text
                                style={[
                                    styles.burstIcon,
                                    burstType === 'like' ? styles.burstLike : styles.burstSkip,
                                    {
                                        transform: [
                                            {
                                                translateY: burst6.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, -80],
                                                }),
                                            },
                                            {
                                                translateX: burst6.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0, 70],
                                                }),
                                            },
                                            {
                                                scale: burst6.interpolate({
                                                    inputRange: [0, 0.3, 1],
                                                    outputRange: [0.5, 1.2, 0.8],
                                                }),
                                            },
                                        ],
                                        opacity: burst6.interpolate({
                                            inputRange: [0, 0.2, 1],
                                            outputRange: [0, 1, 0],
                                        }),
                                    },
                                ]}
                            >
                                {burstType === 'like' ? '♥' : '✕'}
                            </Animated.Text>
                        </>
                    )}
                </View>
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
        backgroundColor: '#f3f3f3',
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },

    backButtonDark: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerTitleLight: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },

    counterTextLight: {
        width: 44,
        textAlign: 'right',
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
    },

    progressTrackDark: {
        height: 8,
        borderRadius: 999,
        backgroundColor: '#d6d6d6',
        overflow: 'hidden',
        marginBottom: 16,
    },

    progressFillLight: {
        height: '100%',
        borderRadius: 999,
        backgroundColor: '#111',
    },

    contentArea: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: 18,
    },

    cardStage: {
        flex: 1,
        justifyContent: 'center',
        overflow: 'visible',
        marginBottom: 16,
    },

    cardWrap: {
        height: height * 0.56,
        maxHeight: 620,
        minHeight: 460,
    },

    card: {
        flex: 1,
        borderRadius: 28,
        overflow: 'hidden',
        justifyContent: 'space-between',
        padding: 18,
        backgroundColor: '#d9d9d9',
    },

    cardImage: {
        borderRadius: 28,
    },

    likeBadge: {
        position: 'absolute',
        top: 24,
        right: 20,
        borderWidth: 2,
        borderColor: '#ffffff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.12)',
        transform: [{ rotate: '9deg' }],
    },

    likeBadgeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },

    skipBadge: {
        position: 'absolute',
        top: 24,
        left: 20,
        borderWidth: 2,
        borderColor: '#ffffff',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.12)',
        transform: [{ rotate: '-9deg' }],
    },

    skipBadgeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },

    cardTopBadge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.88)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 18,
    },

    cardTopBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111',
    },

    cardBottomContent: {
        marginTop: 'auto',
    },

    cardTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
        letterSpacing: -0.7,
    },

    cardSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: '#f2f2f2',
        marginBottom: 14,
        maxWidth: '92%',
    },

    cardQuestion: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },

    bottomPanel: {
        paddingTop: 4,
        paddingBottom: 6,
        backgroundColor: '#f3f3f3',
    },

    actionsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
    },

    actionSlot: {
        flex: 1,
    },

    actionButton: {
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
    },

    skipButton: {
        backgroundColor: '#111',
    },

    maybeButton: {
        backgroundColor: '#d8d8d8',
    },

    likeButton: {
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
    },

    skipButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },

    maybeButtonText: {
        color: '#111',
        fontSize: 13,
        fontWeight: '700',
    },

    likeButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },

    helperText: {
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 17,
        color: '#111',
        marginTop: 2,
    },

    resultCard: {
        marginTop: 5,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: 24,
        padding: 22,
    },

    resultEmoji: {
        fontSize: 28,
        textAlign: 'center',
        marginBottom: 10,
    },

    resultSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: '#5f5f5f',
        textAlign: 'center',
        marginBottom: 18,
    },

    resultPill: {
        alignSelf: 'center',
        backgroundColor: '#f3f3f3',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 20,
    },

    resultPillText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6a6a6a',
        textAlign: 'center',
    },

    primaryButton: {
        backgroundColor: '#111',
        borderRadius: 18,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 10,
    },

    primaryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },

    secondaryButton: {
        backgroundColor: '#dedede',
        borderRadius: 18,
        paddingVertical: 15,
        alignItems: 'center',
    },

    secondaryButtonText: {
        color: '#111',
        fontSize: 14,
        fontWeight: '700',
    },

    burstLayer: {
        position: 'absolute',
        bottom: 150,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },

    burstIcon: {
        position: 'absolute',
        fontSize: 26,
        fontWeight: '800',
    },

    burstLike: {
        color: '#111',
    },

    burstSkip: {
        color: '#111',
    },

    likeBg: {
        flex: 1,
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        overflow: 'hidden',
    },

    loaderWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f3f3',
    },

    loaderText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111',
    },

    resultMatchLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6a6a6a',
        textAlign: 'center',
        marginBottom: 12,
    },

    resultStyleName: {
        fontSize: 30,
        fontWeight: '800',
        color: '#111',
        textAlign: 'center',
        letterSpacing: -0.8,
        lineHeight: 34,
    },

    resultImage: {
        width: '100%',
        height: 260,
        borderRadius: 22,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: '#ddd',
    },

    resultImageStyle: {
        borderRadius: 22,
    },

    resultStyleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 16,
    },

    resultStar: {
        fontSize: 16,
        color: '#111',
        opacity: 0.7,
        lineHeight: 34,
    },

    resultRevealWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    resultGiftButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },

    resultRevealTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111',
        textAlign: 'center',
        marginBottom: 8,
    },

    resultRevealSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: '#6a6a6a',
        textAlign: 'center',
    },

    resultConfettiLayer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: 30,
    },

    resultConfetti: {
        position: 'absolute',
        fontWeight: '900',
    },
});