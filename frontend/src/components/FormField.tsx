import type { InputHTMLAttributes } from "react";

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
                className="border rounded px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
            />
            {error && (
                <p role="alert" className="text-red-600 text-sm dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}
