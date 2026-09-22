interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
}

export function SelectField({ id, label, value, onChange, options, placeholder, error }: SelectFieldProps) {
    return (
        <div className="flex flex-col">
            {label && <label htmlFor={id}>{label}</label>}
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border rounded px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
            >
                {placeholder !== undefined && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p role="alert" className="text-red-600 text-sm dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}
