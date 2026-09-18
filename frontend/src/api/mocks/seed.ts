// Données de demonstration partagees par tous les handlers MSW.

import type {
    CategoryRead,
    LocationRead,
    ProductRead,
    ReplenishmentSuggestion,
    StockMovementRead,
    StockRead,
    SupplierRead,
} from "../../types/api";

export const seedCategories: CategoryRead[] = [
    { id: 1, name: "Pains et viandes", description: "Pains à burger et steaks surgelés" },
    { id: 2, name: "Frites et accompagnements", description: "Frites, potatoes et nuggets surgelés" },
    { id: 3, name: "Boissons", description: "Sirops à fontaine, jus et boissons chaudes" },
    { id: 4, name: "Sauces et condiments", description: "Dosettes de sauce, cornichons et oignons" },
];

export const seedSuppliers: SupplierRead[] = [
    {
        id: 1,
        name: "Boulangerie de l'Est",
        email: "commandes@boulangerie-est.fr",
        phone: "0388112233",
        address: "14 rue des Fours, 67000 Strasbourg",
    },
    {
        id: 2,
        name: "Viandes du Charolais",
        email: "contact@viandes-charolais.fr",
        phone: "0385445566",
        address: "7 route de Beaune, 71120 Charolles",
    },
    {
        id: 3,
        name: "Pommes de Terre du Nord",
        email: "ventes@pdt-nord.fr",
        phone: "0321778899",
        address: "5 rue des Flandres, 62000 Arras",
    },
    {
        id: 4,
        name: "Distri Ouest",
        email: "service@distri-ouest.fr",
        phone: "0240660077",
        address: "3 quai de Loire, 44000 Nantes",
    },
];

export const seedLocations: LocationRead[] = [
    { id: 1, code: "CONG-01", name: "Congélateur", description: "Produits surgelés conservés à -18 °C" },
    { id: 2, code: "CUIS-01", name: "Cuisine", description: "Zone de préparation et de cuisson" },
    { id: 3, code: "RES-01", name: "Réserve sèche", description: "Stock ambiant à l'arrière du restaurant" },
];

export const seedProducts: ProductRead[] = [
    {
        id: 1,
        sku: "PAIN-BIGM-001",
        name: "Pain Big Mac",
        description: "Pain à trois étages pour burger double",
        barcode: "3270190115007",
        unit_price: "0.18",
        reorder_threshold: 200,
        total_quantity: 480,
        category_id: 1,
        supplier_id: 1,
    },
    {
        id: 2,
        sku: "STEA-HAC-045",
        name: "Steak haché 45g",
        description: "Steak de bœuf surgelé, carton de 100",
        barcode: "3270190115014",
        unit_price: "0.42",
        reorder_threshold: 300,
        total_quantity: 120,
        category_id: 1,
        supplier_id: 2,
    },
    {
        id: 3,
        sku: "FRIT-SUR-250",
        name: "Frites surgelées 2,5kg",
        description: "Frites précuites prêtes à plonger",
        barcode: "3168930009641",
        unit_price: "4.60",
        reorder_threshold: 40,
        total_quantity: 96,
        category_id: 2,
        supplier_id: 3,
    },
    {
        id: 4,
        sku: "NUGG-POU-060",
        name: "Nuggets de poulet x60",
        description: "Nuggets panés surgelés, sachet de 60",
        barcode: "3274080005003",
        unit_price: "9.80",
        reorder_threshold: 60,
        total_quantity: 150,
        category_id: 2,
        supplier_id: 2,
    },
    {
        id: 5,
        sku: "SIRO-COL-010",
        name: "Sirop cola 10L",
        description: "Poche de sirop pour la fontaine à boissons",
        barcode: "3123340008264",
        unit_price: "28.50",
        reorder_threshold: 12,
        total_quantity: 5,
        category_id: 3,
        supplier_id: 4,
    },
    {
        id: 6,
        sku: "SAUC-KET-DOS",
        name: "Dosette de ketchup",
        description: "Dosette individuelle de 10g",
        barcode: "3270190115021",
        unit_price: "0.05",
        reorder_threshold: 500,
        total_quantity: 1200,
        category_id: 4,
        supplier_id: 4,
    },
];

export const seedStocks: StockRead[] = [
    { id: 1, product_id: 1, location_id: 3, quantity: 360 },
    { id: 2, product_id: 1, location_id: 2, quantity: 120 },
    { id: 3, product_id: 2, location_id: 1, quantity: 90 },
    { id: 4, product_id: 2, location_id: 2, quantity: 30 },
    { id: 5, product_id: 3, location_id: 1, quantity: 72 },
    { id: 6, product_id: 3, location_id: 2, quantity: 24 },
    { id: 7, product_id: 4, location_id: 1, quantity: 150 },
    { id: 8, product_id: 5, location_id: 3, quantity: 5 },
    { id: 9, product_id: 6, location_id: 3, quantity: 900 },
    { id: 10, product_id: 6, location_id: 2, quantity: 300 },
];

export const seedMovements: StockMovementRead[] = [
    {
        id: 1,
        type: "in",
        product_id: 1,
        quantity: 480,
        source_location_id: null,
        target_location_id: 3,
        reason: "Livraison Boulangerie de l'Est",
        user_id: 1,
        created_at: "2026-09-15T05:30:00.000Z",
    },
    {
        id: 2,
        type: "transfer",
        product_id: 1,
        quantity: 120,
        source_location_id: 3,
        target_location_id: 2,
        reason: "Réassort avant le service du midi",
        user_id: 1,
        created_at: "2026-09-15T10:15:00.000Z",
    },
    {
        id: 3,
        type: "in",
        product_id: 2,
        quantity: 360,
        source_location_id: null,
        target_location_id: 1,
        reason: "Livraison Viandes du Charolais",
        user_id: 1,
        created_at: "2026-09-16T05:00:00.000Z",
    },
    {
        id: 4,
        type: "out",
        product_id: 2,
        quantity: 240,
        source_location_id: 1,
        target_location_id: null,
        reason: "Cuissons du service du midi",
        user_id: 1,
        created_at: "2026-09-16T13:40:00.000Z",
    },
    {
        id: 5,
        type: "transfer",
        product_id: 3,
        quantity: 24,
        source_location_id: 1,
        target_location_id: 2,
        reason: "Approvisionnement de la friteuse",
        user_id: 1,
        created_at: "2026-09-17T11:00:00.000Z",
    },
    {
        id: 6,
        type: "out",
        product_id: 5,
        quantity: 3,
        source_location_id: 3,
        target_location_id: null,
        reason: "Poches branchées sur la fontaine",
        user_id: 1,
        created_at: "2026-09-17T18:20:00.000Z",
    },
];

export function nextIdFrom(items: { id: number }[]): number {
    return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

export function lowStockProducts(products: ProductRead[]): ProductRead[] {
    return products.filter(product => product.total_quantity < product.reorder_threshold);
}

export function buildSuggestions(products: ProductRead[]): ReplenishmentSuggestion[] {
    return lowStockProducts(products).map(product => ({
        product_id: product.id,
        product_name: product.name,
        current_quantity: product.total_quantity,
        reorder_threshold: product.reorder_threshold,
        suggested_quantity: product.reorder_threshold * 2 - product.total_quantity,
        supplier_id: product.supplier_id ?? null,
    }));
}
