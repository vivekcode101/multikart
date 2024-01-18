// Products
export interface Product {
    rating?: number;
    data?: any;
    selectedVariant?: any;
    product_id?: string;
    id?: number;
    title?: string;
    description?: string;
    type?: string;
    brand?: string;
    collection?: any[];
    category?: string;
    price?: number;
    sale?: boolean;
    discount?: number;
    stock?: number;
    new?: boolean;
    quantity?: number;
    tags?: any[];
    variants?: Variants[];
    images?: Images[];
    orderStatus?: string;
}

export interface Variants {
    variant_id?: number;
    id?: number;
    sku?: string;
    size?: string;
    color?: string;
    image_id?: number;
    variantid_qty?: number;
}

export interface Images {
    image_id?: number;
    id?: number;
    alt?: string;
    src?: string;
    variant_id?: any[];
}