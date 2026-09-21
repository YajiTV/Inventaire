// Formes des données produit telles que renvoyées/attendues par l'API
// (voir src/types/api.ts, généré depuis le schéma OpenAPI du backend).

// Un produit tel que renvoyé par GET /products
export interface Produit {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    unit_price: number | string;
    category_id: number;
    supplier_id: number | null;
    barcode: string | null;
    reorder_threshold: number;
    total_quantity: number;
}

// Champs à fournir pour créer un produit (POST /products)
export interface ProduitCreate {
    sku: string;
    name: string;
    description?: string | null;
    unit_price: number | string;
    category_id: number;
    supplier_id?: number | null;
    barcode?: string | null;
    reorder_threshold: number;
}

// Champs modifiables pour un produit existant (PATCH /products/:id) : tous optionnels
export interface ProduitUpdate {
    name?: string;
    description?: string | null;
    unit_price?: number | string;
    category_id?: number;
    supplier_id?: number | null;
    barcode?: string | null;
    reorder_threshold?: number;
}

export interface ProduitFilters{
    search: string;
    categoryId: string;
    supplierId: string;
    belowThreshold: boolean;
}

export const EMPTY_PRODUIT_FILTERS: ProduitFilters = {
    search: '',
    categoryId: '',
    supplierId: '',
    belowThreshold: false,
};

export const PRODUITS_PAGE_SIZE = 5;

export interface ProduitsPage {
    items: Produit[];
    total: number;
    limit: number;
    offset: number;
}

