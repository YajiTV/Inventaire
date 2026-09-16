// Formes des données fournisseur telles que renvoyées/attendues par l'API
// (voir src/types/api.ts, généré depuis le schéma OpenAPI du backend).

// Un fournisseur tel que renvoyé par GET /suppliers
export interface Fournisseur {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
}

// Champs à fournir pour créer un fournisseur (POST /suppliers)
export interface FournisseurCreate {
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
}

// Champs modifiables pour un fournisseur existant (PATCH /suppliers/:id) : tous optionnels
export interface FournisseurUpdate {
    name?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
}
