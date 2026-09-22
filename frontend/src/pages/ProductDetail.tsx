import { Link, useParams } from "react-router-dom";
import { useProduct } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useSuppliers } from "../hooks/useSuppliers";

// Page détail d'un produit : affiche toutes les informations du produit
// dont l'id est dans l'URL (/products/:id).
export default function ProductDetail() {
    // useParams lit le paramètre ":id" de la route. C'est toujours du texte
    // ("3"), donc on le convertit en nombre avant de le passer au hook.
    const { id } = useParams();
    const { product, loading, error } = useProduct(Number(id));

    // Listes de catégories et de fournisseurs : l'API ne renvoie que leurs ids,
    // on retrouve les noms avec find().
    const { categories } = useCategories();
    const { suppliers } = useSuppliers();

    // Nom de la catégorie du produit (undefined tant que pas chargée)
    const category = categories.find((c) => c.id === product?.category_id);
    // Nom du fournisseur (le produit peut ne pas en avoir : supplier_id = null)
    const supplier = suppliers.find((f) => f.id === product?.supplier_id);

    return (
        <section className="p-4 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">{product !== null ? product.name : "Produit"}</h1>
                <Link to="/products" className="underline">
                    Retour aux produits
                </Link>
            </div>

            {/* Les 3 états : chargement, erreur, succès */}
            {loading && <p>Chargement du produit...</p>}

            {!loading && error !== null && (
                <p role="alert" className="text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}

            {/* On teste product !== null : avant la réponse du serveur il vaut null */}
            {!loading && error === null && product !== null && (
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded border p-3 dark:border-gray-700">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">SKU</dt>
                        <dd>{product.sku}</dd>
                    </div>
                    <div className="rounded border p-3 dark:border-gray-700">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">Code-barres</dt>
                        <dd>{product.barcode ?? "Non renseigné"}</dd>
                    </div>
                    <div className="rounded border p-3 dark:border-gray-700">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">Prix unitaire</dt>
                        <dd>{product.unit_price} €</dd>
                    </div>
                    <div className="rounded border p-3 dark:border-gray-700">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">Catégorie</dt>
                        <dd>{category?.name ?? product.category_id}</dd>
                    </div>
                    <div className="rounded border p-3 dark:border-gray-700">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">Fournisseur</dt>
                        <dd>{supplier?.name ?? "Aucun"}</dd>
                    </div>
                    <div className="rounded border p-3 dark:border-gray-700">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">Stock total</dt>
                        <dd>
                            {product.total_quantity}{" "}
                            {product.total_quantity <= product.reorder_threshold && (
                                <span className="text-red-600 dark:text-red-400">(sous le seuil)</span>
                            )}
                        </dd>
                    </div>
                    <div className="rounded border p-3 dark:border-gray-700">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">Seuil de réapprovisionnement</dt>
                        <dd>{product.reorder_threshold}</dd>
                    </div>
                    <div className="rounded border p-3 sm:col-span-2 dark:border-gray-700">
                        <dt className="text-xs text-gray-500 dark:text-gray-400">Description</dt>
                        <dd>{product.description ?? "Aucune description"}</dd>
                    </div>
                </dl>
            )}
        </section>
    );
}
