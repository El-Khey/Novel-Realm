type InputProps = {
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
};

export default function Input({ type = "text", placeholder, value, onChange }: InputProps) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}