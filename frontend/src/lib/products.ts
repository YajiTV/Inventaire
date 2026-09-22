export interface ProductFilters {
    search: string;
    categoryId: string;
    supplierId: string;
    belowThreshold: boolean;
}

export const EMPTY_PRODUCT_FILTERS: ProductFilters = {
    search: '',
    categoryId: '',
    supplierId: '',
    belowThreshold: false,
};

export const PRODUCTS_PAGE_SIZE = 10;
