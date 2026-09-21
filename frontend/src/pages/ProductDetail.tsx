import { Link, useParams } from "react-router-dom";
import { useProduit } from "../hooks/useProduct";
import { useCategories } from "../hooks/useCategories";
import { useFournisseurs } from "../hooks/useSuppliers";

// Page détail d'un produit : affiche toutes les informations du produit
// dont l'id est dans l'URL (/products/:id).
export default function ProductDetail() {
    // useParams lit le paramètre ":id" de la route. C'est toujours du texte
    // ("3"), donc on le convertit en nombre avant de le passer au hook.
    const { id } = useParams();
    const { produit, loading, error } = useProduit(Number(id));

    // Listes de catégories et de fournisseurs : l'API ne renvoie que leurs ids,
    // on retrouve les noms avec find().
    const { categories } = useCategories();
    const { fournisseurs } = useFournisseurs();

    // Nom de la catégorie du produit (undefined tant que pas chargée)
    const category = categories.find((c) => c.id === produit?.category_id);
    // Nom du fournisseur (le produit peut ne pas en avoir : supplier_id = null)
    const supplier = fournisseurs.find((f) => f.id === produit?.supplier_id);

    return (
        <section className="p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{produit !== null ? produit.name : "Produit"}</h1>
                <Link to="/products" className="underline">
                    Retour aux produits
                </Link>
            </div>

            {/* Les 3 états : chargement, erreur, succès */}
            {loading && <p>Chargement du produit...</p>}

            {!loading && error !== null && (
                <p role="alert" className="text-red-600">
                    {error}
                </p>
            )}

            {/* On teste produit !== null : avant la réponse du serveur il vaut null */}
            {!loading && error === null && produit !== null && (
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded border p-3">
                        <dt className="text-xs text-gray-500">SKU</dt>
                        <dd>{produit.sku}</dd>
                    </div>
                    <div className="rounded border p-3">
                        <dt className="text-xs text-gray-500">Code-barres</dt>
                        <dd>{produit.barcode ?? "Non renseigné"}</dd>
                    </div>
                    <div className="rounded border p-3">
                        <dt className="text-xs text-gray-500">Prix unitaire</dt>
                        <dd>{produit.unit_price} €</dd>
                    </div>
                    <div className="rounded border p-3">
                        <dt className="text-xs text-gray-500">Catégorie</dt>
                        <dd>{category?.name ?? produit.category_id}</dd>
                    </div>
                    <div className="rounded border p-3">
                        <dt className="text-xs text-gray-500">Fournisseur</dt>
                        <dd>{supplier?.name ?? "Aucun"}</dd>
                    </div>
                    <div className="rounded border p-3">
                        <dt className="text-xs text-gray-500">Stock total</dt>
                        <dd>
                            {produit.total_quantity}{" "}
                            {produit.total_quantity <= produit.reorder_threshold && (
                                <span className="text-red-600">(sous le seuil)</span>
                            )}
                        </dd>
                    </div>
                    <div className="rounded border p-3">
                        <dt className="text-xs text-gray-500">Seuil de réapprovisionnement</dt>
                        <dd>{produit.reorder_threshold}</dd>
                    </div>
                    <div className="rounded border p-3 sm:col-span-2">
                        <dt className="text-xs text-gray-500">Description</dt>
                        <dd>{produit.description ?? "Aucune description"}</dd>
                    </div>
                </dl>
            )}
        </section>
    );
}
