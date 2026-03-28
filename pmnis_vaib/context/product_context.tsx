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
