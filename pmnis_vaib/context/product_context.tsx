import React, { createContext, useContext, ReactNode } from 'react';

export type Gender = 'women' | 'men';
export type Brand =
    | 'Zara'
    | 'Mango'
    | 'Nike'
    | 'Adidas'
    | 'Gucci';

export type MainCategory =
    | 'SALE: HOT DEALS'
    | 'CLOTHING'
    | 'SHOES'
    | 'DRESSES'
    | 'DESIGN'
    | 'ACCESSORIES'
    | 'BRANDS'
    | 'ACTIVEWEAR'
    | 'PYJAMAS';

export type SubCategory =
    | 'All'
    | 'Last chance'
    | 'Up to 50% off'
    | 'Trending deals'
    | 'Best sellers'
    | 'New markdowns'
    | 'Shoes sale'
    | 'Accessories sale'
    | 'Tops'
    | 'Shirts'
    | 'Jeans'
    | 'Trousers'
    | 'Jackets'
    | 'Coats'
    | 'Hoodies'
    | 'Sneakers'
    | 'Boots'
    | 'Heels'
    | 'Sandals'
    | 'Flats'
    | 'Running shoes'
    | 'Mini dresses'
    | 'Maxi dresses'
    | 'Party dresses'
    | 'Casual dresses'
    | 'Evening dresses'
    | 'Floral dresses'
    | 'New designers'
    | 'Luxury picks'
    | 'Trend hits'
    | 'Runway mood'
    | 'Bags'
    | 'Jewellery'
    | 'Belts'
    | 'Sunglasses'
    | 'Scarves'
    | 'Hats'
    | 'Hair accessories'
    | 'Watches'
    | 'New brands'
    | 'Trending brands'
    | 'Designer brands'
    | 'Sports brands'
    | 'Sustainable brands'
    | 'Leggings'
    | 'Sports bras'
    | 'Workout tops'
    | 'Joggers'
    | 'Gym sets'
    | 'Yoga wear'
    | 'Pyjama sets'
    | 'Night dresses'
    | 'Sleep tops'
    | 'Sleep shorts'
    | 'Slippers';

export type BasicColor =
    | 'Black'
    | 'White'
    | 'Blue'
    | 'Grey'
    | 'Brown'
    | 'Beige'
    | 'Green'
    | 'Pink'
    | 'Red'
    | 'Orange'
    | 'Yellow'
    | 'Cream'
    | 'Camel'
    | 'Burgundy';

export type ProductColor = {
    name: BasicColor;
    code: string;
    imageKeys: string[];
};

export type PlaygroundStyleKey =
    | 'goth'
    | 'grunge_rebel'
    | 'y2k_glam'
    | 'street_cool'
    | 'clean_girl'
    | 'old_money'
    | 'dark_academia'
    | 'coquette_soft';

export type Product = {
    id: string;
    name: string;
    brand: Brand;
    gender: Gender;
    price: number;
    oldPrice?: number;
    isOnSale: boolean;
    discountPercent: number;
    availableSizes: ('EU 32' | 'EU 34' | 'EU 36' | 'EU 38' | 'EU 40' | 'EU 42' | 'EU 44')[];
    availableColors: ProductColor[];
    mainCategory: MainCategory;
    subCategory: SubCategory;
    tags: string[];
    isBestSeller?: boolean;
    isTrending?: boolean;
    isNewMarkdown?: boolean;
    isDesignerPick?: boolean;
    images: string[];

    description: string;
    fit: 'Slim' | 'Fitted' | 'Regular' | 'Oversized' | 'Baggy';

    rating: number;
    reviewCount: number;
    reviews: ProductReview[];

    awards: ProductAward[];

    eco: ProductEco;
    playgroundStyles?: PlaygroundStyleKey[];
};

export const categoryMap: Record<MainCategory, string[]> = {
    'SALE: HOT DEALS': [
        'Last chance',
        'Up to 50% off',
        'Trending deals',
        'Best sellers',
        'New markdowns',
        'Shoes sale',
        'Accessories sale',
    ],
    CLOTHING: [
        'All',
        'Tops',
        'Shirts',
        'Jeans',
        'Trousers',
        'Shirts',
        'Jackets',
        'Coats',
        'Hoodies',
    ],
    SHOES: [
        'Sneakers',
        'Boots',
        'Heels',
        'Sandals',
        'Flats',
        'Running shoes',
    ],
    DRESSES: [
        'Mini dresses',
        'Maxi dresses',
        'Party dresses',
        'Casual dresses',
        'Evening dresses',
        'Floral dresses',
    ],
    DESIGN: ['New designers', 'Luxury picks', 'Trend hits', 'Runway mood'],
    ACCESSORIES: [
        'Bags',
        'Jewellery',
        'Belts',
        'Sunglasses',
        'Scarves',
        'Hats',
        'Hair accessories',
        'Watches',
    ],
    BRANDS: [
        'New brands',
        'Trending brands',
        'Designer brands',
        'Sports brands',
        'Sustainable brands',
    ],
    ACTIVEWEAR: [
        'Leggings',
        'Sports bras',
        'Workout tops',
        'Joggers',
        'Gym sets',
        'Yoga wear',
    ],
    PYJAMAS: ['Pyjama sets', 'Night dresses', 'Sleep tops', 'Sleep shorts', 'Slippers'],
};

export type SizeOption = {
    label: string;
    disabled?: boolean;
};

export const sizeOptions: SizeOption[] = [
    { label: 'EU 32' },
    { label: 'EU 34' },
    { label: 'EU 36' },
    { label: 'EU 38' },
    { label: 'EU 40' },
    { label: 'EU 42' },
    { label: 'EU 44' },
];

export type ProductAward =
    | 'Best seller'
    | 'Trending'
    | 'New markdown'
    | 'Designer pick'
    | 'Eco choice'
    | 'Customer favorite'
    | 'Editor pick';

export type ProductReview = {
    id: string;
    name: string;
    rating: number;
    text: string;
    date: string;
};

export type EcoAlternative = {
    productId: string;
    ecoScore: number;
};

export type ProductEco = {
    ecoScore: number;
    ecoDescription: string;
    material: string;
    sustainability: string;
    ecoAlternativeIds: EcoAlternative[];
};

export type ProductMeta = {
    description: string;
    fit: 'Slim' | 'Fitted' | 'Regular' | 'Oversized' | 'Baggy';
    rating: number;
    reviewCount: number;
    reviews: ProductReview[];
    awards: ProductAward[];
    eco: ProductEco;
};

// IMPORTANT:
// images use string paths for now.
// Later you can map them to:
// require('../assets/products/clothing/coats/coat1_0.png')
// based on category folder names.

export const rawProducts: Omit<Product, 'description' | 'fit' | 'rating' | 'reviewCount' | 'reviews' | 'awards' | 'eco'>[] = [
    {
        id: 'coat1',
        name: 'Soft Wrap Wool Coat',
        brand: 'Mango',
        gender: 'women',
        price: 129.99,
        oldPrice: 159.99,
        isOnSale: true,
        discountPercent: 19,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Brown', code: '#EEE7DE', imageKeys: ['coat1_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Coats',
        tags: ['Last chance', 'Best sellers', 'Luxury picks'],
        isBestSeller: true,
        isDesignerPick: true,
        images: ['coat1_0'],
        playgroundStyles: ['goth', 'grunge_rebel', 'dark_academia'],
    },
    {
        id: 'coat2',
        name: 'Double-Breasted Camel Coat',
        brand: 'Zara',
        gender: 'women',
        price: 119.99,
        oldPrice: 149.99,
        isOnSale: true,
        discountPercent: 20,
        availableSizes: ['EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Beige', code: '#B7885C', imageKeys: ['coat2_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Coats',
        tags: ['Trending deals', 'Trend hits'],
        isTrending: true,
        images: ['coat2_0'],
        playgroundStyles: ['goth', 'old_money', 'dark_academia'],
    },
    {
        id: 'coat3',
        name: 'Belted City Coat',
        brand: 'Zara',
        gender: 'women',
        price: 109.99,
        oldPrice: 139.99,
        isOnSale: true,
        discountPercent: 21,
        availableSizes: ['EU 34', 'EU 36', 'EU 38'],
        availableColors: [
            { name: 'Grey', code: '#7D8087', imageKeys: ['coat3_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Coats',
        tags: ['New markdowns', 'Runway mood'],
        isNewMarkdown: true,
        images: ['coat3_0'],
        playgroundStyles: ['goth', 'street_cool', 'grunge_rebel'],
    },
    {
        id: 'coat5',
        name: 'Oversized Denim Coat',
        brand: 'Adidas',
        gender: 'women',
        price: 99.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Blue', code: '#6F8396', imageKeys: ['coat5_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Coats',
        tags: ['Trend hits', 'New brands'],
        images: ['coat5_0'],
        playgroundStyles: ['goth', 'coquette_soft', 'dark_academia'],
    },
    {
        id: 'coat6',
        name: 'Cropped Teddy Jacket',
        brand: 'Nike',
        gender: 'women',
        price: 79.99,
        oldPrice: 99.99,
        isOnSale: true,
        discountPercent: 20,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Brown', code: '#8E6E60', imageKeys: ['coat6_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jackets',
        tags: ['Best sellers', 'Trending deals'],
        isBestSeller: true,
        images: ['coat6_0'],
        playgroundStyles: ['grunge_rebel', 'street_cool', 'y2k_glam'],
    },
    {
        id: 'coat7',
        name: 'Padded Hooded Puffer',
        brand: 'Mango',
        gender: 'women',
        price: 89.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 36', 'EU 38', 'EU 40', 'EU 42'],
        availableColors: [
            { name: 'White', code: '#F1ECE4', imageKeys: ['coat7_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jackets',
        tags: ['Best sellers', 'Casual'],
        isBestSeller: true,
        images: ['coat7_0'],
        playgroundStyles: ['clean_girl', 'old_money', 'coquette_soft'],
    },
    {
        id: 'coat8',
        name: 'Faux Leather Bomber Jacket',
        brand: 'Zara',
        gender: 'women',
        price: 95.99,
        oldPrice: 119.99,
        isOnSale: true,
        discountPercent: 20,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Green', code: '#59604B', imageKeys: ['coat8_0', 'coat8_1', 'coat8_2', 'coat8_3'] },
            { name: 'Black', code: '#1E1E1E', imageKeys: ['coat13b_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jackets',
        tags: ['Trending deals', 'Best sellers', 'New markdowns'],
        isTrending: true,
        isBestSeller: true,
        isNewMarkdown: true,
        images: ['coat8_0', 'coat8_1', 'coat8_2', 'coat8_3'],
        playgroundStyles: ['goth', 'grunge_rebel', 'street_cool'],
    },
    {
        id: 'coat9',
        name: 'Cape Detail Coat',
        brand: 'Mango',
        gender: 'women',
        price: 114.99,
        oldPrice: 144.99,
        isOnSale: true,
        discountPercent: 21,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Beige', code: '#C39A62', imageKeys: ['coat9_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Coats',
        tags: ['Runway mood', 'Luxury picks'],
        isDesignerPick: true,
        images: ['coat9_0'],
        playgroundStyles: ['old_money', 'dark_academia', 'clean_girl'],
    },
    {
        id: 'coat10',
        name: 'Relaxed Puffer Jacket',
        brand: 'Mango',
        gender: 'women',
        price: 74.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40', 'EU 42'],
        availableColors: [
            { name: 'Beige', code: '#C9AC81', imageKeys: ['coat10_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jackets',
        tags: ['Trending deals', 'Best sellers'],
        images: ['coat10_0'],
        playgroundStyles: ['clean_girl', 'street_cool', 'coquette_soft'],
    },
    {
        id: 'coat11',
        name: 'Textured Zip Fleece Jacket',
        brand: 'Zara',
        gender: 'women',
        price: 69.99,
        oldPrice: 84.99,
        isOnSale: true,
        discountPercent: 18,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Beige', code: '#D7C1A7', imageKeys: ['coat11_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jackets',
        tags: ['New markdowns', 'Trending deals'],
        isNewMarkdown: true,
        images: ['coat11_0'],
        playgroundStyles: ['clean_girl', 'street_cool', 'old_money'],
    },
    {
        id: 'coat12',
        name: 'Oversized Hoodie Jacket',
        brand: 'Nike',
        gender: 'women',
        price: 84.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Grey', code: '#CDBB9F', imageKeys: ['coat12_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Hoodies',
        tags: ['Sports brands', 'Trending brands'],
        images: ['coat12_0'],
        playgroundStyles: ['street_cool', 'grunge_rebel', 'y2k_glam'],
    },
    {
        id: 'coat13',
        name: 'Utility Belted Jacket',
        brand: 'Adidas',
        gender: 'women',
        price: 92.99,
        oldPrice: 115.99,
        isOnSale: true,
        discountPercent: 20,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Brown', code: '#8F7A56', imageKeys: ['coat13_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jackets',
        tags: ['Sports brands', 'Trending deals'],
        images: ['coat13_0'],
        playgroundStyles: ['street_cool', 'grunge_rebel', 'dark_academia'],
    },
    {
        id: 'coat13b',
        name: 'Oversized City Jacket',
        brand: 'Zara',
        gender: 'women',
        price: 97.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Black', code: '#1F1F1F', imageKeys: ['coat13b_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jackets',
        tags: ['Best sellers', 'Trend hits'],
        images: ['coat13b_0'],
        playgroundStyles: ['goth', 'street_cool', 'grunge_rebel'],
    },
    {
        id: 'coat14',
        name: 'Charcoal Wrap Coat',
        brand: 'Mango',
        gender: 'women',
        price: 134.99,
        oldPrice: 164.99,
        isOnSale: true,
        discountPercent: 18,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Black', code: '#4E4B4F', imageKeys: ['coat14_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Coats',
        tags: ['Luxury picks', 'Best sellers'],
        isDesignerPick: true,
        images: ['coat14_0'],
        playgroundStyles: ['goth', 'old_money', 'dark_academia'],
    },

    {
        id: 'jeans1',
        name: 'Relaxed Light Wash Jeans',
        brand: 'Adidas',
        gender: 'women',
        price: 59.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 32', 'EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Blue', code: '#B8D2E7', imageKeys: ['jeans1_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jeans',
        tags: ['Best sellers', 'Trending brands'],
        images: ['jeans1_0'],
        playgroundStyles: ['street_cool', 'clean_girl', 'y2k_glam'],
    },
    {
        id: 'jeans2',
        name: 'Baggy Blue Jeans',
        brand: 'Zara',
        gender: 'women',
        price: 54.99,
        oldPrice: 69.99,
        isOnSale: true,
        discountPercent: 21,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Blue', code: '#9FC2DF', imageKeys: ['jeans2_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jeans',
        tags: ['Up to 50% off', 'Trending deals'],
        images: ['jeans2_0'],
        playgroundStyles: ['street_cool', 'grunge_rebel', 'y2k_glam'],
    },
    {
        id: 'jeans3',
        name: 'Wide Leg Indigo Jeans',
        brand: 'Mango',
        gender: 'women',
        price: 64.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38'],
        availableColors: [
            { name: 'Blue', code: '#374057', imageKeys: ['jeans3_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jeans',
        tags: ['Trend hits'],
        images: ['jeans3_0'],
        playgroundStyles: ['old_money', 'clean_girl', 'street_cool'],
    },
    {
        id: 'jeans4',
        name: 'Straight Fit Dark Jeans',
        brand: 'Mango',
        gender: 'women',
        price: 49.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Blue', code: '#27304D', imageKeys: ['jeans4_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jeans',
        tags: ['Best sellers'],
        images: ['jeans4_0'],
        playgroundStyles: ['goth', 'dark_academia', 'old_money'],
    },
    {
        id: 'jeans5',
        name: 'Classic Black Wide Jeans',
        brand: 'Zara',
        gender: 'women',
        price: 57.99,
        oldPrice: 72.99,
        isOnSale: true,
        discountPercent: 21,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Black', code: '#222222', imageKeys: ['jeans5_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jeans',
        tags: ['New markdowns', 'Best sellers'],
        images: ['jeans5_0'],
        playgroundStyles: ['goth', 'grunge_rebel', 'street_cool'],
    },
    {
        id: 'jeans6',
        name: 'Slim Light Blue Jeans',
        brand: 'Nike',
        gender: 'women',
        price: 52.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Blue', code: '#9AB8D8', imageKeys: ['jeans6_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Jeans',
        tags: ['Trending brands'],
        images: ['jeans6_0'],
        playgroundStyles: ['clean_girl', 'street_cool', 'y2k_glam'],
    },

    {
        id: 'top1',
        name: 'Mesh Floral High Neck Top',
        brand: 'Zara',
        gender: 'women',
        price: 35.99,
        oldPrice: 44.99,
        isOnSale: true,
        discountPercent: 20,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Red', code: '#7A1F28', imageKeys: ['top1_0', 'top1_1', 'top1_2', 'top1_3', 'top1_4'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Tops',
        tags: ['Party dresses', 'Trend hits', 'Best sellers'],
        isBestSeller: true,
        images: ['top1_0', 'top1_1', 'top1_2', 'top1_3', 'top1_4'],
        playgroundStyles: ['goth', 'y2k_glam', 'grunge_rebel'],
    },
    {
        id: 'top2',
        name: 'Soft Long Sleeve Fitted Top',
        brand: 'Mango',
        gender: 'women',
        price: 27.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Pink', code: '#D8B0CC', imageKeys: ['top2_0', 'top2_1', 'top2_2', 'top2_3'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Tops',
        tags: ['Best sellers', 'Casual dresses'],
        images: ['top2_0', 'top2_1', 'top2_2', 'top2_3'],
        playgroundStyles: ['coquette_soft', 'clean_girl', 'y2k_glam'],
    },
    {
        id: 'top3',
        name: 'Ribbed Tank Top',
        brand: 'Mango',
        gender: 'women',
        price: 18.99,
        oldPrice: 24.99,
        isOnSale: true,
        discountPercent: 24,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Green', code: '#17664C', imageKeys: ['top3_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Tops',
        tags: ['Up to 50% off', 'Best sellers'],
        images: ['top3_0'],
        playgroundStyles: ['street_cool', 'clean_girl', 'y2k_glam'],
    },
    {
        id: 'top4',
        name: 'Striped Everyday Tee',
        brand: 'Zara',
        gender: 'women',
        price: 21.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Green', code: '#A7D7CD', imageKeys: ['top4_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Shirts',
        tags: ['Best sellers'],
        images: ['top4_0'],
        playgroundStyles: ['clean_girl', 'old_money', 'street_cool'],
    },
    {
        id: 'top5',
        name: 'Lace Trim Evening Top',
        brand: 'Nike',
        gender: 'women',
        price: 29.99,
        oldPrice: 39.99,
        isOnSale: true,
        discountPercent: 25,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Black', code: '#111111', imageKeys: ['top5_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Tops',
        tags: ['New markdowns', 'Evening dresses'],
        images: ['top5_0'],
        playgroundStyles: ['goth', 'coquette_soft', 'y2k_glam'],
    },
    {
        id: 'top6',
        name: 'Asymmetric Burgundy Top',
        brand: 'Zara',
        gender: 'women',
        price: 31.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Red', code: '#6F1E27', imageKeys: ['top6_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Tops',
        tags: ['Trend hits', 'Runway mood'],
        images: ['top6_0'],
        playgroundStyles: ['goth', 'grunge_rebel', 'y2k_glam'],
    },
    {
        id: 'top7',
        name: 'White Essential Tank',
        brand: 'Mango',
        gender: 'women',
        price: 15.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'White', code: '#F6F6F4', imageKeys: ['top7_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Tops',
        tags: ['Best sellers'],
        images: ['top7_0'],
        playgroundStyles: ['clean_girl', 'old_money', 'coquette_soft'],
    },
    {
        id: 'top8',
        name: 'Gradient Knit Top',
        brand: 'Mango',
        gender: 'women',
        price: 36.99,
        oldPrice: 45.99,
        isOnSale: true,
        discountPercent: 20,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Blue', code: '#9DC5E8', imageKeys: ['top8_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Tops',
        tags: ['Trend hits', 'New markdowns'],
        images: ['top8_0'],
        playgroundStyles: ['y2k_glam', 'street_cool', 'clean_girl'],
    },

    {
        id: 'trousers1',
        name: 'Polka Dot Wide Trousers',
        brand: 'Zara',
        gender: 'women',
        price: 49.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'White', code: '#F4F4F1', imageKeys: ['trousers1_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Trousers',
        tags: ['Trend hits', 'Runway mood'],
        images: ['trousers1_0'],
        playgroundStyles: ['coquette_soft', 'old_money', 'clean_girl'],
    },
    {
        id: 'trousers2',
        name: 'Tailored Brown Trousers',
        brand: 'Mango',
        gender: 'women',
        price: 54.99,
        oldPrice: 68.99,
        isOnSale: true,
        discountPercent: 20,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Beige', code: '#A58B73', imageKeys: ['trousers2_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Trousers',
        tags: ['Best sellers', 'New markdowns'],
        images: ['trousers2_0'],
        playgroundStyles: ['old_money', 'dark_academia', 'clean_girl'],
    },
    {
        id: 'trousers3',
        name: 'Relaxed Grey Trousers',
        brand: 'Zara',
        gender: 'women',
        price: 45.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Grey', code: '#C1C2C8', imageKeys: ['trousers3_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Trousers',
        tags: ['Best sellers'],
        images: ['trousers3_0'],
        playgroundStyles: ['clean_girl', 'old_money', 'street_cool'],
    },
    {
        id: 'trousers4',
        name: 'Structured Sleeveless Set Trousers',
        brand: 'Nike',
        gender: 'women',
        price: 59.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Grey', code: '#79797D', imageKeys: ['trousers4_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Trousers',
        tags: ['Runway mood', 'New brands'],
        images: ['trousers4_0'],
        playgroundStyles: ['street_cool', 'grunge_rebel', 'dark_academia'],
    },
    {
        id: 'trousers5',
        name: 'Flowy Red Palazzo Trousers',
        brand: 'Gucci',
        gender: 'women',
        price: 299.99,
        oldPrice: 349.99,
        isOnSale: true,
        discountPercent: 14,
        availableSizes: ['EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Red', code: '#D33A33', imageKeys: ['trousers5_0'] },
        ],
        mainCategory: 'DESIGN',
        subCategory: 'Luxury picks',
        tags: ['Luxury picks', 'Designer brands', 'Runway mood'],
        isDesignerPick: true,
        images: ['trousers5_0'],
        playgroundStyles: ['old_money', 'goth', 'dark_academia'],
    },

    {
        id: 'shirt1',
        name: 'Green Satin Stripe Shirt',
        brand: 'Zara',
        gender: 'women',
        price: 39.99,
        oldPrice: 49.99,
        isOnSale: true,
        discountPercent: 20,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Green', code: '#2F5A4C', imageKeys: ['shirt1_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Shirts',
        tags: ['Trending deals', 'Best sellers'],
        images: ['shirt1_0'],
        playgroundStyles: ['old_money', 'clean_girl', 'street_cool'],
    },
    {
        id: 'shirt2',
        name: 'Blue Oversized Stripe Shirt',
        brand: 'Mango',
        gender: 'women',
        price: 34.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Blue', code: '#6D86B4', imageKeys: ['shirt2_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Shirts',
        tags: ['Best sellers'],
        images: ['shirt2_0'],
        playgroundStyles: ['clean_girl', 'old_money', 'street_cool'],
    },
    {
        id: 'shirt3',
        name: 'Fitted Short Sleeve Shirt',
        brand: 'Zara',
        gender: 'women',
        price: 28.99,
        oldPrice: 35.99,
        isOnSale: true,
        discountPercent: 19,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Blue', code: '#5D6579', imageKeys: ['shirt3_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Shirts',
        tags: ['New markdowns'],
        images: ['shirt3_0'],
        playgroundStyles: ['dark_academia', 'old_money', 'clean_girl'],
    },
    {
        id: 'shirt4',
        name: 'Ruffle Sleeve Blouse',
        brand: 'Mango',
        gender: 'women',
        price: 31.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Yellow', code: '#EAD98D', imageKeys: ['shirt4_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Shirts',
        tags: ['Trend hits'],
        images: ['shirt4_0'],
        playgroundStyles: ['coquette_soft', 'clean_girl', 'old_money'],
    },
    {
        id: 'shirt5',
        name: 'Textured Pink Blouse',
        brand: 'Nike',
        gender: 'women',
        price: 37.99,
        oldPrice: 46.99,
        isOnSale: true,
        discountPercent: 19,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Pink', code: '#CE8C96', imageKeys: ['shirt5_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Shirts',
        tags: ['Trending deals', 'New markdowns'],
        images: ['shirt5_0'],
        playgroundStyles: ['coquette_soft', 'y2k_glam', 'clean_girl'],
    },
    {
        id: 'shirt6',
        name: 'Relaxed Brown Shirt',
        brand: 'Adidas',
        gender: 'women',
        price: 33.99,
        isOnSale: false,
        discountPercent: 0,
        availableSizes: ['EU 34', 'EU 36', 'EU 38', 'EU 40'],
        availableColors: [
            { name: 'Brown', code: '#5B3931', imageKeys: ['shirt6_0'] },
        ],
        mainCategory: 'CLOTHING',
        subCategory: 'Shirts',
        tags: ['New brands', 'Trending brands'],
        images: ['shirt6_0'],
        playgroundStyles: ['dark_academia', 'street_cool', 'old_money'],
    },
];

export const productMeta: Record<string, ProductMeta> = {
    coat1: {
        description: 'Soft wrap wool coat with a polished silhouette and timeless smart layering appeal.',
        fit: 'Regular',
        rating: 4.6,
        reviewCount: 128,
        reviews: [
            { id: 'coat1_r1', name: 'Emma', rating: 5, text: 'Elegant and warm. Looks much more expensive in real life.', date: '2 days ago' },
            { id: 'coat1_r2', name: 'Laura', rating: 4, text: 'Beautiful shape, only slightly roomy in the sleeves for me.', date: '1 week ago' },
            { id: 'coat1_r3', name: 'Mia', rating: 5, text: 'A true staple coat. I wear it almost every day.', date: '2 weeks ago' },
        ],
        awards: ['Best seller', 'Designer pick', 'Customer favorite'],
        eco: {
            ecoScore: 74,
            ecoDescription: 'A relatively strong score thanks to durable outerwear construction and high repeat-wear potential.',
            material: '58% polyester, 32% wool, 10% viscose',
            sustainability: 'Good longevity, medium-impact blend, suitable for multiple seasons',
            ecoAlternativeIds: [
                { productId: 'coat14', ecoScore: 81 },
                { productId: 'coat9', ecoScore: 79 },
                { productId: 'coat2', ecoScore: 72 },
            ],
        },
    },

    coat2: {
        description: 'Double-breasted camel coat with a structured shape and classic city styling.',
        fit: 'Regular',
        rating: 4.4,
        reviewCount: 96,
        reviews: [
            { id: 'coat2_r1', name: 'Nina', rating: 4, text: 'Classic and flattering. Great with boots.', date: '3 days ago' },
            { id: 'coat2_r2', name: 'Zoe', rating: 5, text: 'Love the camel tone and the tailored look.', date: '1 week ago' },
            { id: 'coat2_r3', name: 'Lena', rating: 4, text: 'Very wearable, slightly stiff at first but softens up.', date: '2 weeks ago' },
        ],
        awards: ['Trending', 'Editor pick'],
        eco: {
            ecoScore: 72,
            ecoDescription: 'A solid score for a dressier coat with longer-wear versatility and durable structure.',
            material: '60% polyester, 25% wool, 15% acrylic',
            sustainability: 'Long-season item, moderate blend impact, good wardrobe repeat use',
            ecoAlternativeIds: [
                { productId: 'coat14', ecoScore: 81 },
                { productId: 'coat1', ecoScore: 74 },
                { productId: 'coat9', ecoScore: 79 },
            ],
        },
    },

    coat3: {
        description: 'Belted city coat with a refined shape for office and everyday polished looks.',
        fit: 'Regular',
        rating: 4.2,
        reviewCount: 81,
        reviews: [
            { id: 'coat3_r1', name: 'Kika', rating: 4, text: 'Very chic and easy to style with trousers.', date: '4 days ago' },
            { id: 'coat3_r2', name: 'Sara', rating: 4, text: 'Nice fit, the belt gives it a very elegant look.', date: '9 days ago' },
        ],
        awards: ['New markdown'],
        eco: {
            ecoScore: 69,
            ecoDescription: 'Reasonable eco profile with versatile wearability, though still based on synthetic-heavy outerwear blend.',
            material: '64% polyester, 24% viscose, 12% elastane',
            sustainability: 'Medium-impact blend, strong rewear value, transitional-season piece',
            ecoAlternativeIds: [
                { productId: 'coat9', ecoScore: 79 },
                { productId: 'coat14', ecoScore: 81 },
                { productId: 'coat1', ecoScore: 74 },
            ],
        },
    },

    coat5: {
        description: 'Oversized denim-inspired coat with a casual statement shape and modern relaxed attitude.',
        fit: 'Oversized',
        rating: 4.1,
        reviewCount: 62,
        reviews: [
            { id: 'coat5_r1', name: 'Lea', rating: 4, text: 'Cool oversized vibe, especially with white sneakers.', date: '5 days ago' },
            { id: 'coat5_r2', name: 'Anna', rating: 4, text: 'Very trendy, though definitely oversized.', date: '2 weeks ago' },
        ],
        awards: ['Trending'],
        eco: {
            ecoScore: 66,
            ecoDescription: 'Decent score due to durability, though the heavier fabric and trend-led styling reduce the overall result.',
            material: '78% cotton, 20% polyester, 2% elastane',
            sustainability: 'Durable fabric, medium-impact production, good repeat wear',
            ecoAlternativeIds: [
                { productId: 'jeans1', ecoScore: 76 },
                { productId: 'coat10', ecoScore: 67 },
                { productId: 'shirt2', ecoScore: 73 },
            ],
        },
    },

    coat6: {
        description: 'Cropped teddy jacket with a cozy feel and easy everyday layering shape.',
        fit: 'Regular',
        rating: 4.5,
        reviewCount: 104,
        reviews: [
            { id: 'coat6_r1', name: 'Lili', rating: 5, text: 'Super soft and surprisingly warm for the cropped length.', date: '1 day ago' },
            { id: 'coat6_r2', name: 'Tina', rating: 4, text: 'Cute and cozy, just wish the sleeves were slightly longer.', date: '1 week ago' },
            { id: 'coat6_r3', name: 'Maja', rating: 5, text: 'Looks adorable with jeans and boots.', date: '2 weeks ago' },
        ],
        awards: ['Best seller'],
        eco: {
            ecoScore: 58,
            ecoDescription: 'Lower score because of synthetic plush fabric, though strong use frequency improves its overall profile.',
            material: '100% polyester',
            sustainability: 'Synthetic fabric, medium warmth efficiency, repeated seasonal wear',
            ecoAlternativeIds: [
                { productId: 'coat7', ecoScore: 65 },
                { productId: 'coat10', ecoScore: 67 },
                { productId: 'coat13', ecoScore: 70 },
            ],
        },
    },

    coat7: {
        description: 'Padded hooded puffer designed for comfort, warmth and casual winter outfits.',
        fit: 'Regular',
        rating: 4.7,
        reviewCount: 166,
        reviews: [
            { id: 'coat7_r1', name: 'Petra', rating: 5, text: 'Very warm and light. Great everyday winter jacket.', date: '2 days ago' },
            { id: 'coat7_r2', name: 'Nora', rating: 5, text: 'Love the oversized hood and the soft cream tone.', date: '1 week ago' },
            { id: 'coat7_r3', name: 'Sima', rating: 4, text: 'Really practical, just a little bulky if layered heavily.', date: '3 weeks ago' },
        ],
        awards: ['Best seller', 'Customer favorite'],
        eco: {
            ecoScore: 65,
            ecoDescription: 'Moderate eco performance with strong winter use value, though synthetic fill lowers the result.',
            material: 'Outer: 100% nylon, Fill: 100% polyester',
            sustainability: 'High-use cold-weather piece, synthetic fill, medium durability',
            ecoAlternativeIds: [
                { productId: 'coat10', ecoScore: 67 },
                { productId: 'coat13', ecoScore: 70 },
                { productId: 'coat14', ecoScore: 81 },
            ],
        },
    },

    coat8: {
        description: 'Faux leather bomber jacket with a bold oversized silhouette and statement zip detailing.',
        fit: 'Oversized',
        rating: 4.3,
        reviewCount: 94,
        reviews: [
            { id: 'coat8_r1', name: 'Nina', rating: 5, text: 'Such a cool jacket. Makes every outfit look better.', date: '3 days ago' },
            { id: 'coat8_r2', name: 'Mia', rating: 4, text: 'Love the shape, slightly heavier than expected.', date: '6 days ago' },
            { id: 'coat8_r3', name: 'Lea', rating: 4, text: 'The green version is amazing in person.', date: '2 weeks ago' },
            { id: 'coat8_r4', name: 'Sara', rating: 4, text: 'Great statement piece, not super breathable though.', date: '3 weeks ago' },
        ],
        awards: ['Best seller', 'Trending', 'New markdown'],
        eco: {
            ecoScore: 42,
            ecoDescription: 'This product has a lower eco score due to synthetic coated fabric and trend-driven material choice.',
            material: '72% polyurethane, 24% polyester, 4% elastane',
            sustainability: 'Synthetic coated fabric, medium longevity, trend-led purchase cycle',
            ecoAlternativeIds: [
                { productId: 'coat13', ecoScore: 70 },
                { productId: 'coat10', ecoScore: 67 },
                { productId: 'coat7', ecoScore: 65 },
            ],
        },
    },

    coat9: {
        description: 'Cape detail coat with elevated structure and elegant statement outerwear styling.',
        fit: 'Regular',
        rating: 4.5,
        reviewCount: 73,
        reviews: [
            { id: 'coat9_r1', name: 'Jana', rating: 5, text: 'So elegant and dramatic in the best way.', date: '4 days ago' },
            { id: 'coat9_r2', name: 'Lara', rating: 4, text: 'Beautiful design, works best with slim trousers.', date: '10 days ago' },
        ],
        awards: ['Designer pick', 'Editor pick'],
        eco: {
            ecoScore: 79,
            ecoDescription: 'Strong eco score driven by timeless styling, lower turnover potential and solid outerwear durability.',
            material: '52% wool, 33% polyester, 15% viscose',
            sustainability: 'Durable construction, elegant long-term style value, strong repeat wear',
            ecoAlternativeIds: [
                { productId: 'coat14', ecoScore: 81 },
                { productId: 'coat1', ecoScore: 74 },
                { productId: 'coat2', ecoScore: 72 },
            ],
        },
    },

    coat10: {
        description: 'Relaxed puffer jacket with a casual easy-to-style shape and everyday comfort.',
        fit: 'Oversized',
        rating: 4.4,
        reviewCount: 112,
        reviews: [
            { id: 'coat10_r1', name: 'Alica', rating: 4, text: 'Great everyday jacket, comfortable and practical.', date: '2 days ago' },
            { id: 'coat10_r2', name: 'Mina', rating: 5, text: 'Love the relaxed fit and soft neutral tone.', date: '8 days ago' },
        ],
        awards: ['Best seller'],
        eco: {
            ecoScore: 67,
            ecoDescription: 'Moderate eco score due to strong wear frequency, though synthetic fill keeps it from scoring higher.',
            material: 'Outer: 100% polyester, Fill: 100% recycled polyester',
            sustainability: 'Good use frequency, partially recycled fill, medium longevity',
            ecoAlternativeIds: [
                { productId: 'coat7', ecoScore: 65 },
                { productId: 'coat13', ecoScore: 70 },
                { productId: 'coat14', ecoScore: 81 },
            ],
        },
    },

    coat11: {
        description: 'Textured fleece jacket with a soft zip-up design for cozy off-duty outfits.',
        fit: 'Regular',
        rating: 4.1,
        reviewCount: 58,
        reviews: [
            { id: 'coat11_r1', name: 'Ema', rating: 4, text: 'Very cozy and soft, ideal for chilly mornings.', date: '5 days ago' },
            { id: 'coat11_r2', name: 'Klaudia', rating: 4, text: 'Cute jacket, just slightly boxier than expected.', date: '2 weeks ago' },
        ],
        awards: ['New markdown'],
        eco: {
            ecoScore: 55,
            ecoDescription: 'Synthetic fleece lowers the eco score, though the item has good practical wear value.',
            material: '100% polyester fleece',
            sustainability: 'Synthetic fabric, cozy utility, medium repeat-wear value',
            ecoAlternativeIds: [
                { productId: 'coat13', ecoScore: 70 },
                { productId: 'coat10', ecoScore: 67 },
                { productId: 'coat14', ecoScore: 81 },
            ],
        },
    },

    coat12: {
        description: 'Oversized hoodie jacket with laid-back sporty styling and relaxed comfort.',
        fit: 'Oversized',
        rating: 4.0,
        reviewCount: 49,
        reviews: [
            { id: 'coat12_r1', name: 'Viki', rating: 4, text: 'Really comfy and casual, great for travel days.', date: '6 days ago' },
            { id: 'coat12_r2', name: 'Moni', rating: 4, text: 'Nice oversized fit, works best with leggings or jeans.', date: '2 weeks ago' },
        ],
        awards: ['Trending'],
        eco: {
            ecoScore: 61,
            ecoDescription: 'Fair eco profile thanks to repeat casual use, though the fabric blend remains standard.',
            material: '68% cotton, 32% polyester',
            sustainability: 'Frequent casual wear, medium-impact blend, versatile styling',
            ecoAlternativeIds: [
                { productId: 'shirt2', ecoScore: 73 },
                { productId: 'top7', ecoScore: 83 },
                { productId: 'coat13', ecoScore: 70 },
            ],
        },
    },

    coat13: {
        description: 'Utility belted jacket with structured shape and practical sporty-inspired styling.',
        fit: 'Regular',
        rating: 4.2,
        reviewCount: 67,
        reviews: [
            { id: 'coat13_r1', name: 'Zuzka', rating: 4, text: 'Looks really flattering once cinched at the waist.', date: '4 days ago' },
            { id: 'coat13_r2', name: 'Mimi', rating: 4, text: 'Good transition jacket and the belt makes it more special.', date: '11 days ago' },
        ],
        awards: ['Trending'],
        eco: {
            ecoScore: 70,
            ecoDescription: 'Balanced score from decent durability, versatile styling and moderate-use materials.',
            material: '61% cotton, 39% polyester',
            sustainability: 'Versatile jacket, medium-impact fabric, good wardrobe repeat use',
            ecoAlternativeIds: [
                { productId: 'coat14', ecoScore: 81 },
                { productId: 'coat9', ecoScore: 79 },
                { productId: 'coat1', ecoScore: 74 },
            ],
        },
    },

    coat13b: {
        description: 'Oversized city jacket with a clean dark finish and easy everyday edge.',
        fit: 'Oversized',
        rating: 4.3,
        reviewCount: 71,
        reviews: [
            { id: 'coat13b_r1', name: 'Domi', rating: 4, text: 'Very cool oversized silhouette, especially in black.', date: '3 days ago' },
            { id: 'coat13b_r2', name: 'Ela', rating: 5, text: 'One of those jackets that instantly makes the outfit.', date: '1 week ago' },
        ],
        awards: ['Best seller', 'Trending'],
        eco: {
            ecoScore: 63,
            ecoDescription: 'Moderate eco profile thanks to repeat citywear use, though material composition is standard.',
            material: '54% polyester, 40% viscose, 6% elastane',
            sustainability: 'Medium-impact blend, strong style repeat potential, season-spanning wear',
            ecoAlternativeIds: [
                { productId: 'coat13', ecoScore: 70 },
                { productId: 'coat14', ecoScore: 81 },
                { productId: 'coat9', ecoScore: 79 },
            ],
        },
    },

    coat14: {
        description: 'Charcoal wrap coat with clean tailoring and elevated everyday sophistication.',
        fit: 'Regular',
        rating: 4.8,
        reviewCount: 154,
        reviews: [
            { id: 'coat14_r1', name: 'Sona', rating: 5, text: 'Absolutely gorgeous coat. Feels premium and very timeless.', date: '1 day ago' },
            { id: 'coat14_r2', name: 'Tereza', rating: 5, text: 'Love the drape and the dark charcoal shade.', date: '6 days ago' },
            { id: 'coat14_r3', name: 'Linda', rating: 4, text: 'A bit long on me but still stunning.', date: '2 weeks ago' },
        ],
        awards: ['Designer pick', 'Eco choice', 'Customer favorite'],
        eco: {
            ecoScore: 81,
            ecoDescription: 'A strong eco score driven by timeless design, high longevity and strong repeat wear potential.',
            material: '55% wool, 28% polyester, 17% viscose',
            sustainability: 'Long-life outerwear, timeless silhouette, strong cross-season use',
            ecoAlternativeIds: [
                { productId: 'coat9', ecoScore: 79 },
                { productId: 'coat1', ecoScore: 74 },
                { productId: 'coat2', ecoScore: 72 },
            ],
        },
    },

    jeans1: {
        description: 'Relaxed light wash jeans with an easy casual fit and soft denim feel.',
        fit: 'Baggy',
        rating: 4.5,
        reviewCount: 137,
        reviews: [
            { id: 'jeans1_r1', name: 'Nela', rating: 5, text: 'Super flattering relaxed fit and really easy to wear.', date: '2 days ago' },
            { id: 'jeans1_r2', name: 'Katy', rating: 4, text: 'Great jeans, just a little long on me.', date: '1 week ago' },
        ],
        awards: ['Best seller', 'Customer favorite'],
        eco: {
            ecoScore: 76,
            ecoDescription: 'A strong score for a durable basic with high repeat wear and a simpler denim construction.',
            material: '98% cotton, 2% elastane',
            sustainability: 'Durable denim, high-use staple, good longevity',
            ecoAlternativeIds: [
                { productId: 'jeans3', ecoScore: 74 },
                { productId: 'jeans4', ecoScore: 75 },
                { productId: 'trousers3', ecoScore: 71 },
            ],
        },
    },

    jeans2: {
        description: 'Baggy blue jeans with a roomy silhouette and laid-back everyday styling.',
        fit: 'Baggy',
        rating: 4.3,
        reviewCount: 92,
        reviews: [
            { id: 'jeans2_r1', name: 'Mara', rating: 4, text: 'Very nice baggy fit and the wash is pretty.', date: '3 days ago' },
            { id: 'jeans2_r2', name: 'Janka', rating: 4, text: 'Comfortable and trendy, great with fitted tops.', date: '2 weeks ago' },
        ],
        awards: ['Trending', 'New markdown'],
        eco: {
            ecoScore: 68,
            ecoDescription: 'Good durability but slightly lower score due to wash process and trend-oriented loose styling.',
            material: '99% cotton, 1% elastane',
            sustainability: 'Durable denim, medium wash impact, frequent casual wear',
            ecoAlternativeIds: [
                { productId: 'jeans1', ecoScore: 76 },
                { productId: 'jeans4', ecoScore: 75 },
                { productId: 'jeans3', ecoScore: 74 },
            ],
        },
    },

    jeans3: {
        description: 'Wide leg indigo jeans with a darker premium wash and long-leg silhouette.',
        fit: 'Baggy',
        rating: 4.4,
        reviewCount: 88,
        reviews: [
            { id: 'jeans3_r1', name: 'Ivka', rating: 5, text: 'The indigo shade looks so premium.', date: '4 days ago' },
            { id: 'jeans3_r2', name: 'Lenka', rating: 4, text: 'Great fit, slightly stiff before first wash.', date: '10 days ago' },
        ],
        awards: ['Editor pick'],
        eco: {
            ecoScore: 74,
            ecoDescription: 'Strong score due to durability and long-term wardrobe value.',
            material: '100% cotton',
            sustainability: 'Long-lasting denim, strong repeat wear, low trend turnover',
            ecoAlternativeIds: [
                { productId: 'jeans1', ecoScore: 76 },
                { productId: 'jeans4', ecoScore: 75 },
                { productId: 'trousers3', ecoScore: 71 },
            ],
        },
    },

    jeans4: {
        description: 'Straight fit dark jeans with classic lines and a clean everyday silhouette.',
        fit: 'Regular',
        rating: 4.6,
        reviewCount: 141,
        reviews: [
            { id: 'jeans4_r1', name: 'Dana', rating: 5, text: 'Perfect classic jeans. Very easy to dress up.', date: '1 day ago' },
            { id: 'jeans4_r2', name: 'Michaela', rating: 4, text: 'Great dark wash and flattering straight leg.', date: '8 days ago' },
        ],
        awards: ['Best seller', 'Eco choice'],
        eco: {
            ecoScore: 75,
            ecoDescription: 'Very good eco result for a timeless staple with long wear potential.',
            material: '99% cotton, 1% elastane',
            sustainability: 'Timeless design, durable denim, high repeat wear',
            ecoAlternativeIds: [
                { productId: 'jeans1', ecoScore: 76 },
                { productId: 'jeans3', ecoScore: 74 },
                { productId: 'trousers3', ecoScore: 71 },
            ],
        },
    },

    jeans5: {
        description: 'Classic black wide jeans with a structured drape and versatile styling.',
        fit: 'Baggy',
        rating: 4.5,
        reviewCount: 119,
        reviews: [
            { id: 'jeans5_r1', name: 'Barbora', rating: 5, text: 'The black is really rich and not washed out.', date: '2 days ago' },
            { id: 'jeans5_r2', name: 'Nika', rating: 4, text: 'Great jeans, very flattering with heels too.', date: '1 week ago' },
        ],
        awards: ['Best seller', 'New markdown'],
        eco: {
            ecoScore: 73,
            ecoDescription: 'Strong score thanks to wardrobe versatility and durable denim construction.',
            material: '98% cotton, 2% elastane',
            sustainability: 'Versatile black denim, durable structure, frequent rewear',
            ecoAlternativeIds: [
                { productId: 'jeans4', ecoScore: 75 },
                { productId: 'jeans1', ecoScore: 76 },
                { productId: 'trousers3', ecoScore: 71 },
            ],
        },
    },

    jeans6: {
        description: 'Slim light blue jeans with a cleaner close-to-body fit and casual wash.',
        fit: 'Slim',
        rating: 4.0,
        reviewCount: 64,
        reviews: [
            { id: 'jeans6_r1', name: 'Eli', rating: 4, text: 'Nice basic slim jeans, very wearable.', date: '5 days ago' },
            { id: 'jeans6_r2', name: 'Zina', rating: 4, text: 'Comfortable and soft, though I prefer a higher rise.', date: '2 weeks ago' },
        ],
        awards: ['Trending'],
        eco: {
            ecoScore: 67,
            ecoDescription: 'Moderate eco profile with decent repeat use and a standard stretch denim blend.',
            material: '92% cotton, 6% polyester, 2% elastane',
            sustainability: 'Moderate denim impact, everyday wear value, standard stretch blend',
            ecoAlternativeIds: [
                { productId: 'jeans4', ecoScore: 75 },
                { productId: 'jeans1', ecoScore: 76 },
                { productId: 'jeans3', ecoScore: 74 },
            ],
        },
    },

    top1: {
        description: 'Mesh high neck floral top with a fitted body shape and going-out mood.',
        fit: 'Fitted',
        rating: 3.3,
        reviewCount: 45,
        reviews: [
            { id: 'top1_r1', name: 'Emma', rating: 4, text: 'Really flattering fit and soft material. I would size up if you want a looser feel.', date: '2 days ago' },
            { id: 'top1_r2', name: 'Lara', rating: 3, text: 'Cute top, but the sleeves are slightly tighter than I expected. Still keeping it.', date: '1 week ago' },
            { id: 'top1_r3', name: 'Nina', rating: 3, text: 'Looks nice styled with wide jeans. Material is okay, not amazing, but good for the price.', date: '2 weeks ago' },
        ],
        awards: ['Best seller', 'Trending'],
        eco: {
            ecoScore: 42,
            ecoDescription: 'This piece has a moderate-to-lower eco impact due to its blended mesh fabric and standard production process.',
            material: '65% polyester, 30% cotton, 5% elastane',
            sustainability: 'Standard production, mixed fibers, medium durability',
            ecoAlternativeIds: [
                { productId: 'top7', ecoScore: 83 },
                { productId: 'top3', ecoScore: 78 },
                { productId: 'shirt2', ecoScore: 73 },
            ],
        },
    },

    top2: {
        description: 'Soft long sleeve fitted top with a clean minimal line and versatile everyday styling.',
        fit: 'Fitted',
        rating: 4.4,
        reviewCount: 86,
        reviews: [
            { id: 'top2_r1', name: 'Nela', rating: 4, text: 'Really comfortable and flattering under jackets.', date: '2 days ago' },
            { id: 'top2_r2', name: 'Katka', rating: 5, text: 'Beautiful soft pink and nice stretch.', date: '9 days ago' },
        ],
        awards: ['Best seller'],
        eco: {
            ecoScore: 68,
            ecoDescription: 'Good repeat-wear potential and simple construction help this top perform reasonably well.',
            material: '58% cotton, 36% polyester, 6% elastane',
            sustainability: 'Simple staple, medium-impact blend, good repeat use',
            ecoAlternativeIds: [
                { productId: 'top7', ecoScore: 83 },
                { productId: 'top3', ecoScore: 78 },
                { productId: 'shirt2', ecoScore: 73 },
            ],
        },
    },

    top3: {
        description: 'Ribbed tank top with a clean fitted shape for layering and warm-weather outfits.',
        fit: 'Fitted',
        rating: 4.7,
        reviewCount: 153,
        reviews: [
            { id: 'top3_r1', name: 'Aňa', rating: 5, text: 'Perfect basic tank. I wear it constantly.', date: '1 day ago' },
            { id: 'top3_r2', name: 'Maja', rating: 5, text: 'Lovely green color and great fit.', date: '1 week ago' },
            { id: 'top3_r3', name: 'Luci', rating: 4, text: 'A tiny bit snug but still really nice.', date: '2 weeks ago' },
        ],
        awards: ['Best seller', 'Eco choice', 'Customer favorite'],
        eco: {
            ecoScore: 78,
            ecoDescription: 'Strong eco result thanks to simple construction, lower material complexity and very high rewear value.',
            material: '92% cotton, 8% elastane',
            sustainability: 'Simple staple, low complexity, high repeat wear',
            ecoAlternativeIds: [
                { productId: 'top7', ecoScore: 83 },
                { productId: 'shirt2', ecoScore: 73 },
                { productId: 'top2', ecoScore: 68 },
            ],
        },
    },

    top4: {
        description: 'Striped everyday tee with a fresh casual look and easy relaxed styling.',
        fit: 'Regular',
        rating: 4.2,
        reviewCount: 73,
        reviews: [
            { id: 'top4_r1', name: 'Juli', rating: 4, text: 'Very cute casual tee and the stripes feel fresh.', date: '5 days ago' },
            { id: 'top4_r2', name: 'Lia', rating: 4, text: 'Easy top for everyday wear, slightly thin fabric.', date: '2 weeks ago' },
        ],
        awards: ['Best seller'],
        eco: {
            ecoScore: 71,
            ecoDescription: 'Good eco result for a straightforward basic with high wear frequency.',
            material: '95% cotton, 5% elastane',
            sustainability: 'Simple staple, strong repeat wear, moderate production impact',
            ecoAlternativeIds: [
                { productId: 'top7', ecoScore: 83 },
                { productId: 'top3', ecoScore: 78 },
                { productId: 'shirt2', ecoScore: 73 },
            ],
        },
    },

    top5: {
        description: 'Lace trim evening top designed for dressier looks and a sleek fitted silhouette.',
        fit: 'Fitted',
        rating: 4.1,
        reviewCount: 61,
        reviews: [
            { id: 'top5_r1', name: 'Lora', rating: 4, text: 'Very pretty lace detail and nice black color.', date: '4 days ago' },
            { id: 'top5_r2', name: 'Bibi', rating: 4, text: 'Looks expensive when styled well.', date: '2 weeks ago' },
        ],
        awards: ['New markdown'],
        eco: {
            ecoScore: 47,
            ecoDescription: 'Lower eco score due to decorative trim and synthetic-heavy eveningwear composition.',
            material: '64% polyester, 31% viscose, 5% elastane',
            sustainability: 'Mixed fibers, medium durability, more occasion-based usage',
            ecoAlternativeIds: [
                { productId: 'top7', ecoScore: 83 },
                { productId: 'top3', ecoScore: 78 },
                { productId: 'shirt2', ecoScore: 73 },
            ],
        },
    },

    top6: {
        description: 'Asymmetric burgundy top with a sharper fashion-forward shape and evening styling appeal.',
        fit: 'Slim',
        rating: 4.3,
        reviewCount: 58,
        reviews: [
            { id: 'top6_r1', name: 'Nori', rating: 4, text: 'Love the asymmetry and rich burgundy tone.', date: '6 days ago' },
            { id: 'top6_r2', name: 'Bianka', rating: 5, text: 'Looks so good with dark jeans or black trousers.', date: '2 weeks ago' },
        ],
        awards: ['Trending', 'Editor pick'],
        eco: {
            ecoScore: 52,
            ecoDescription: 'Moderate eco score with decent use potential, though the fashion-led cut lowers rewear utility.',
            material: '61% polyester, 33% viscose, 6% elastane',
            sustainability: 'Medium repeat wear, mixed fibers, trend-driven silhouette',
            ecoAlternativeIds: [
                { productId: 'top7', ecoScore: 83 },
                { productId: 'top3', ecoScore: 78 },
                { productId: 'shirt2', ecoScore: 73 },
            ],
        },
    },

    top7: {
        description: 'Clean white essential tank for layering, everyday wear and minimal wardrobe building.',
        fit: 'Fitted',
        rating: 4.7,
        reviewCount: 172,
        reviews: [
            { id: 'top7_r1', name: 'Anna', rating: 5, text: 'Perfect basic. Soft, simple and super easy to style.', date: '1 day ago' },
            { id: 'top7_r2', name: 'Kika', rating: 5, text: 'Great quality for the price. I bought two.', date: '5 days ago' },
            { id: 'top7_r3', name: 'Maja', rating: 4, text: 'Nice fitted cut, just slightly see-through in very bright light.', date: '2 weeks ago' },
            { id: 'top7_r4', name: 'Lili', rating: 5, text: 'This is one of those staples you end up wearing constantly.', date: '3 weeks ago' },
        ],
        awards: ['Best seller', 'Eco choice', 'Customer favorite'],
        eco: {
            ecoScore: 83,
            ecoDescription: 'A strong eco score thanks to simpler construction, lighter material use and strong repeat-wear potential.',
            material: '92% cotton, 8% elastane',
            sustainability: 'Lower production complexity, versatile staple, high repeat wear',
            ecoAlternativeIds: [
                { productId: 'top3', ecoScore: 78 },
                { productId: 'shirt2', ecoScore: 73 },
                { productId: 'top2', ecoScore: 68 },
            ],
        },
    },

    top8: {
        description: 'Gradient knit top with a soft standout finish and slightly elevated casual styling.',
        fit: 'Regular',
        rating: 4.2,
        reviewCount: 54,
        reviews: [
            { id: 'top8_r1', name: 'Tami', rating: 4, text: 'The color blend is even prettier in real life.', date: '4 days ago' },
            { id: 'top8_r2', name: 'Lena', rating: 4, text: 'Really nice knit top, though slightly warmer than expected.', date: '2 weeks ago' },
        ],
        awards: ['Trending', 'New markdown'],
        eco: {
            ecoScore: 57,
            ecoDescription: 'Knit blend and fashion-led finish lower the score somewhat, though rewear potential remains decent.',
            material: '54% acrylic, 30% cotton, 16% polyester',
            sustainability: 'Mixed knit blend, medium longevity, moderate repeat wear',
            ecoAlternativeIds: [
                { productId: 'top7', ecoScore: 83 },
                { productId: 'top3', ecoScore: 78 },
                { productId: 'shirt2', ecoScore: 73 },
            ],
        },
    },

    trousers1: {
        description: 'Polka dot wide trousers with statement movement and a bold modern silhouette.',
        fit: 'Baggy',
        rating: 4.2,
        reviewCount: 48,
        reviews: [
            { id: 'trousers1_r1', name: 'Nela', rating: 4, text: 'Such fun trousers and they move beautifully.', date: '6 days ago' },
            { id: 'trousers1_r2', name: 'Lina', rating: 4, text: 'Very stylish, just a little long for flats.', date: '2 weeks ago' },
        ],
        awards: ['Editor pick'],
        eco: {
            ecoScore: 60,
            ecoDescription: 'Moderate eco score with decent wardrobe value, though print-heavy synthetic blend reduces the result.',
            material: '56% viscose, 39% polyester, 5% elastane',
            sustainability: 'Medium-impact blend, statement styling, moderate repeat wear',
            ecoAlternativeIds: [
                { productId: 'trousers3', ecoScore: 71 },
                { productId: 'trousers2', ecoScore: 69 },
                { productId: 'trousers4', ecoScore: 66 },
            ],
        },
    },

    trousers2: {
        description: 'Tailored brown trousers with clean lines and polished everyday versatility.',
        fit: 'Regular',
        rating: 4.5,
        reviewCount: 103,
        reviews: [
            { id: 'trousers2_r1', name: 'Mia', rating: 5, text: 'Beautiful tailored fit and lovely warm brown tone.', date: '2 days ago' },
            { id: 'trousers2_r2', name: 'Lara', rating: 4, text: 'Very smart-looking trousers for work and dinner.', date: '1 week ago' },
        ],
        awards: ['Best seller', 'New markdown'],
        eco: {
            ecoScore: 69,
            ecoDescription: 'Good score for a highly wearable tailored piece with broad styling use.',
            material: '68% polyester, 28% viscose, 4% elastane',
            sustainability: 'Versatile smartwear piece, medium-impact blend, frequent rewear',
            ecoAlternativeIds: [
                { productId: 'trousers3', ecoScore: 71 },
                { productId: 'trousers4', ecoScore: 66 },
                { productId: 'jeans4', ecoScore: 75 },
            ],
        },
    },

    trousers3: {
        description: 'Relaxed grey trousers with a clean minimal shape and easy wardrobe versatility.',
        fit: 'Regular',
        rating: 4.6,
        reviewCount: 116,
        reviews: [
            { id: 'trousers3_r1', name: 'Nina', rating: 5, text: 'So versatile and comfortable, really polished too.', date: '3 days ago' },
            { id: 'trousers3_r2', name: 'Ivana', rating: 4, text: 'Great neutral pair for work or weekends.', date: '9 days ago' },
        ],
        awards: ['Best seller', 'Eco choice'],
        eco: {
            ecoScore: 71,
            ecoDescription: 'Strong eco profile for a multi-use wardrobe staple with timeless styling.',
            material: '64% polyester, 30% viscose, 6% elastane',
            sustainability: 'High repeat wear, versatile tailoring, medium-impact blend',
            ecoAlternativeIds: [
                { productId: 'trousers2', ecoScore: 69 },
                { productId: 'jeans4', ecoScore: 75 },
                { productId: 'shirt2', ecoScore: 73 },
            ],
        },
    },

    trousers4: {
        description: 'Structured sleeveless-set trousers with a modern fluid drape and sleek set styling.',
        fit: 'Regular',
        rating: 4.1,
        reviewCount: 42,
        reviews: [
            { id: 'trousers4_r1', name: 'Bianca', rating: 4, text: 'Very modern set trousers and nice fluid shape.', date: '5 days ago' },
            { id: 'trousers4_r2', name: 'Zina', rating: 4, text: 'Looks best styled with the matching top vibe.', date: '2 weeks ago' },
        ],
        awards: ['Trending'],
        eco: {
            ecoScore: 66,
            ecoDescription: 'Moderate eco score with decent use potential and streamlined styling value.',
            material: '62% polyester, 34% viscose, 4% elastane',
            sustainability: 'Medium-impact tailored blend, moderate repeat wear, modern wardrobe utility',
            ecoAlternativeIds: [
                { productId: 'trousers3', ecoScore: 71 },
                { productId: 'trousers2', ecoScore: 69 },
                { productId: 'jeans4', ecoScore: 75 },
            ],
        },
    },

    trousers5: {
        description: 'Flowy red palazzo trousers with statement designer movement and dramatic volume.',
        fit: 'Baggy',
        rating: 4.8,
        reviewCount: 39,
        reviews: [
            { id: 'trousers5_r1', name: 'Alex', rating: 5, text: 'Absolutely stunning and so dramatic in motion.', date: '4 days ago' },
            { id: 'trousers5_r2', name: 'Sia', rating: 5, text: 'Designer feel all the way. Gorgeous red.', date: '11 days ago' },
        ],
        awards: ['Designer pick', 'Editor pick'],
        eco: {
            ecoScore: 64,
            ecoDescription: 'Luxury positioning and statement use reduce frequency of wear, though quality and durability support its score.',
            material: '70% viscose, 25% silk, 5% elastane',
            sustainability: 'Premium construction, lower wear frequency, strong longevity',
            ecoAlternativeIds: [
                { productId: 'trousers3', ecoScore: 71 },
                { productId: 'trousers2', ecoScore: 69 },
                { productId: 'coat14', ecoScore: 81 },
            ],
        },
    },

    shirt1: {
        description: 'Green satin stripe shirt with a fluid finish and elevated polished feel.',
        fit: 'Regular',
        rating: 4.4,
        reviewCount: 92,
        reviews: [
            { id: 'shirt1_r1', name: 'Janka', rating: 4, text: 'Really pretty satin effect and nice green tone.', date: '2 days ago' },
            { id: 'shirt1_r2', name: 'Nela', rating: 5, text: 'Looks very chic tucked into trousers.', date: '1 week ago' },
        ],
        awards: ['Trending', 'Best seller'],
        eco: {
            ecoScore: 63,
            ecoDescription: 'Moderate eco profile with good rewear potential, though satin-treated fabric impacts the overall score.',
            material: '58% polyester, 42% viscose',
            sustainability: 'Medium-impact blend, elevated styling, decent repeat wear',
            ecoAlternativeIds: [
                { productId: 'shirt2', ecoScore: 73 },
                { productId: 'shirt6', ecoScore: 71 },
                { productId: 'top7', ecoScore: 83 },
            ],
        },
    },

    shirt2: {
        description: 'Blue oversized stripe shirt with timeless relaxed tailoring and strong layering value.',
        fit: 'Oversized',
        rating: 4.7,
        reviewCount: 148,
        reviews: [
            { id: 'shirt2_r1', name: 'Luci', rating: 5, text: 'Amazing oversized shirt. Looks effortless and expensive.', date: '1 day ago' },
            { id: 'shirt2_r2', name: 'Mina', rating: 5, text: 'One of my favorite purchases this season.', date: '6 days ago' },
            { id: 'shirt2_r3', name: 'Nina', rating: 4, text: 'Slightly oversized, but exactly what I wanted.', date: '2 weeks ago' },
        ],
        awards: ['Best seller', 'Eco choice', 'Customer favorite'],
        eco: {
            ecoScore: 73,
            ecoDescription: 'Very good eco result due to classic styling, repeat wear and low trend turnover.',
            material: '100% cotton',
            sustainability: 'Timeless staple, durable fabric, high repeat wear',
            ecoAlternativeIds: [
                { productId: 'shirt6', ecoScore: 71 },
                { productId: 'top7', ecoScore: 83 },
                { productId: 'top3', ecoScore: 78 },
            ],
        },
    },

    shirt3: {
        description: 'Fitted short sleeve shirt with a clean shape and versatile smart-casual styling.',
        fit: 'Slim',
        rating: 4.1,
        reviewCount: 57,
        reviews: [
            { id: 'shirt3_r1', name: 'Tea', rating: 4, text: 'Nice fitted shirt, looks neat and polished.', date: '4 days ago' },
            { id: 'shirt3_r2', name: 'Klaudia', rating: 4, text: 'Good simple piece, a bit close-fitting at the bust.', date: '2 weeks ago' },
        ],
        awards: ['New markdown'],
        eco: {
            ecoScore: 67,
            ecoDescription: 'Balanced score from frequent wear potential and relatively simple construction.',
            material: '72% cotton, 24% polyester, 4% elastane',
            sustainability: 'Moderate blend impact, practical repeat wear, versatile styling',
            ecoAlternativeIds: [
                { productId: 'shirt2', ecoScore: 73 },
                { productId: 'shirt6', ecoScore: 71 },
                { productId: 'top7', ecoScore: 83 },
            ],
        },
    },

    shirt4: {
        description: 'Ruffle sleeve blouse with a feminine soft shape and a light romantic finish.',
        fit: 'Regular',
        rating: 4.0,
        reviewCount: 46,
        reviews: [
            { id: 'shirt4_r1', name: 'Monika', rating: 4, text: 'Very pretty blouse and the yellow is soft and lovely.', date: '6 days ago' },
            { id: 'shirt4_r2', name: 'Lea', rating: 4, text: 'Cute detail on the sleeves, just a little delicate.', date: '2 weeks ago' },
        ],
        awards: ['Trending'],
        eco: {
            ecoScore: 62,
            ecoDescription: 'Moderate eco score with fair repeat wear, though decorative details slightly reduce versatility.',
            material: '65% cotton, 35% polyester',
            sustainability: 'Moderate-impact blend, feminine design, decent wear frequency',
            ecoAlternativeIds: [
                { productId: 'shirt2', ecoScore: 73 },
                { productId: 'shirt6', ecoScore: 71 },
                { productId: 'top7', ecoScore: 83 },
            ],
        },
    },

    shirt5: {
        description: 'Textured pink blouse with a soft fitted shape and a slightly dressed-up feel.',
        fit: 'Fitted',
        rating: 4.2,
        reviewCount: 53,
        reviews: [
            { id: 'shirt5_r1', name: 'Simi', rating: 4, text: 'Lovely textured fabric and flattering pink tone.', date: '5 days ago' },
            { id: 'shirt5_r2', name: 'Dora', rating: 4, text: 'Cute blouse, works really well with denim.', date: '2 weeks ago' },
        ],
        awards: ['Trending', 'New markdown'],
        eco: {
            ecoScore: 59,
            ecoDescription: 'Textured synthetic blend lowers the eco score, though styling versatility helps.',
            material: '60% polyester, 35% cotton, 5% elastane',
            sustainability: 'Mixed fibers, medium durability, moderate repeat use',
            ecoAlternativeIds: [
                { productId: 'shirt2', ecoScore: 73 },
                { productId: 'shirt6', ecoScore: 71 },
                { productId: 'top7', ecoScore: 83 },
            ],
        },
    },

    shirt6: {
        description: 'Relaxed brown shirt with easy drape and a soft everyday natural-toned feel.',
        fit: 'Oversized',
        rating: 4.5,
        reviewCount: 84,
        reviews: [
            { id: 'shirt6_r1', name: 'Mila', rating: 5, text: 'Very easy oversized shirt and such a nice brown tone.', date: '3 days ago' },
            { id: 'shirt6_r2', name: 'Alena', rating: 4, text: 'Comfortable and stylish, especially half tucked.', date: '9 days ago' },
        ],
        awards: ['Trending', 'Editor pick'],
        eco: {
            ecoScore: 71,
            ecoDescription: 'Strong eco result from repeat wear, timeless styling and simpler shirt construction.',
            material: '82% cotton, 18% polyester',
            sustainability: 'High repeat wear, versatile shirt staple, moderate blend impact',
            ecoAlternativeIds: [
                { productId: 'shirt2', ecoScore: 73 },
                { productId: 'top7', ecoScore: 83 },
                { productId: 'top3', ecoScore: 78 },
            ],
        },
    },


};

export const products: Product[] = rawProducts.map((product) => ({
    ...product,
    ...productMeta[product.id],
}));

type ProductContextType = {
    products: Product[];
    getProductById: (id: string) => Product | undefined;
    getProductsByMainCategory: (category: MainCategory) => Product[];
    getProductsBySubCategory: (subCategory: string) => Product[];
    getProductsByBrand: (brand: Brand) => Product[];
    getSaleProducts: () => Product[];
    getBestSellers: () => Product[];
    searchProducts: (query: string, gender?: 'WOMAN' | 'MAN') => Product[];
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const getProductById = (id: string) => products.find((product) => product.id === id);

    const getProductsByMainCategory = (category: MainCategory) =>
        products.filter((product) => product.mainCategory === category);

    const getProductsBySubCategory = (subCategory: string) =>
        products.filter(
            (product) =>
                product.subCategory === subCategory || product.tags.includes(subCategory)
        );

    const searchProducts = (query: string, gender?: 'WOMAN' | 'MAN') => {
        const trimmed = query.trim().toLowerCase();

        if (!trimmed) return [];

        return products.filter((product) => {
            const matchesGender =
                gender === 'WOMAN'
                    ? product.gender === 'women'
                    : gender === 'MAN'
                        ? product.gender === 'men'
                        : true;

            const searchableText = [
                product.name,
                product.brand,
                product.mainCategory,
                product.subCategory,
                ...product.tags,
                ...product.availableColors.map(color => color.name),
            ]
                .join(' ')
                .toLowerCase();

            return matchesGender && searchableText.includes(trimmed);
        });
    };

    const getProductsByBrand = (brand: Brand) =>
        products.filter((product) => product.brand === brand);

    const getSaleProducts = () => products.filter((product) => product.isOnSale);

    const getBestSellers = () => products.filter((product) => product.isBestSeller);

    return (
        <ProductContext.Provider
            value={{
                products,
                getProductById,
                getProductsByMainCategory,
                getProductsBySubCategory,
                getProductsByBrand,
                getSaleProducts,
                getBestSellers,
                searchProducts,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);

    if (!context) {
        throw new Error('useProducts must be used inside ProductProvider');
    }

    return context;
}
