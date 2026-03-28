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
    | 'T-Shirts'
    | 'Jeans'
    | 'Trousers'
    | 'Shirts'
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
        'T-Shirts',
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
