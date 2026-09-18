import type { InputHTMLAttributes } from "react";

// Champ de formulaire réutilisable : label + input contrôlé + message
// d'erreur optionnel. Le composant ne connaît rien du domaine (produit,
// fournisseur, catégorie...) : il reçoit sa valeur et un callback de
// changement, toute la logique (validation, soumission) reste dans le
// composant parent. Si "label" est vide, aucun <label> n'est affiché : utile
// pour les inputs d'édition inline dans un tableau, où le label serait
// redondant avec l'en-tête de colonne.
interface FormFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: InputHTMLAttributes<HTMLInputElement>["type"];
    placeholder?: string;
    required?: boolean;
}

export function FormField({
    id,
    label,
    value,
    onChange,
    error,
    type = "text",
    placeholder,
    required = false,
}: FormFieldProps) {
    return (
        <div className="flex flex-col">
            {label && <label htmlFor={id}>{label}</label>}
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="border rounded px-2 py-1"
            />
            {error && (
                <p role="alert" className="text-red-600 text-sm">
                    {error}
                </p>
            )}
        </div>
    );
}
